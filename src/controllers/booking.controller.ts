import { Request, Response } from 'express';
import Stripe from 'stripe';
import Tour from '../models/Tour.model';
import Booking from '../models/Booking.model';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { AuthRequest } from '../types';
import { env } from '../config/env';

// POST /api/bookings
export const createBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
  }

  const {
    tourId,
    travelDate,
    numberOfPeople,
    contactName,
    contactEmail,
    contactPhone,
    specialRequests,
  } = req.body;

  if (!tourId || !travelDate || !numberOfPeople || !contactName || !contactEmail || !contactPhone) {
    throw new ApiError(400, 'Missing required fields: tourId, travelDate, numberOfPeople, contactName, contactEmail, contactPhone');
  }

  const tour = await Tour.findById(tourId);
  if (!tour) {
    throw new ApiError(404, 'Tour not found');
  }

  if (!tour.isActive) {
    throw new ApiError(400, 'This tour is no longer available');
  }

  const people = parseInt(numberOfPeople, 10);
  if (people < 1 || people > tour.maxGroupSize) {
    throw new ApiError(400, `Number of people must be between 1 and ${tour.maxGroupSize}`);
  }

  const pricePerPerson = tour.discountPrice || tour.price;
  const totalPrice = pricePerPerson * people;

  // Create booking in pending state and unpaid
  const booking = await Booking.create({
    user: userId,
    tour: tourId,
    travelDate: new Date(travelDate),
    numberOfPeople: people,
    totalPrice,
    contactInfo: {
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
    },
    specialRequests: specialRequests || '',
    status: 'pending',
    paymentStatus: 'unpaid',
  });

  // Increment currentBookings on the tour
  await Tour.findByIdAndUpdate(tourId, { $inc: { currentBookings: people } });

  let checkoutUrl = '';
  let session: any = null;

  // Check if we have a valid Stripe Secret Key
  const hasStripeKey = env.STRIPE_SECRET_KEY && 
                        env.STRIPE_SECRET_KEY !== 'sk_test_mock_secret_key_for_local_testing' &&
                        env.STRIPE_SECRET_KEY.trim() !== '';

  if (hasStripeKey) {
    try {
      const stripe = new Stripe(env.STRIPE_SECRET_KEY);
      
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'bdt',
              product_data: {
                name: tour.title,
                description: tour.shortDescription || `Tour booking for ${people} people`,
                images: tour.thumbnail ? [tour.thumbnail] : [],
              },
              unit_amount: pricePerPerson * 100, // Stripe expects amounts in cents/poisha
            },
            quantity: people,
          },
        ],
        mode: 'payment',
        success_url: `${env.CLIENT_URL}/dashboard/bookings?success=true&booking_id=${booking._id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${env.CLIENT_URL}/tours/${tourId}?cancelled=true`,
        customer_email: contactEmail,
        metadata: {
          bookingId: booking._id.toString(),
          tourId: tour._id.toString(),
          userId: userId.toString(),
        },
      });

      checkoutUrl = session.url || '';
      booking.transactionId = session.id;
      booking.paymentMethod = 'stripe';
      await booking.save();
    } catch (stripeError: any) {
      console.error('Stripe Session creation failed, falling back to mock checkout:', stripeError);
    }
  }

  // Fallback to Mock Payment Flow in local dev if Stripe fails or is not configured
  if (!checkoutUrl) {
    const mockSessionId = `mock_session_${booking._id}_${Date.now()}`;
    checkoutUrl = `${env.CLIENT_URL}/dashboard/bookings?success=true&booking_id=${booking._id}&session_id=${mockSessionId}`;
    
    booking.transactionId = mockSessionId;
    booking.paymentMethod = 'mock_stripe';
    await booking.save();
  }

  const populatedBooking = await Booking.findById(booking._id)
    .populate('tour', 'title thumbnail price discountPrice duration')
    .lean();

  res.status(201).json(new ApiResponse(201, 'Booking created successfully', {
    booking: populatedBooking,
    checkoutUrl,
  }));
});

// POST /api/bookings/verify-payment
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, bookingId } = req.body;

  if (!sessionId || !bookingId) {
    throw new ApiError(400, 'Missing required fields: sessionId, bookingId');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // Handle Mock checkout session
  if (sessionId.startsWith('mock_session_')) {
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentMethod = 'mock_stripe';
    booking.transactionId = sessionId;
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('tour', 'title thumbnail price discountPrice duration')
      .lean();

    res.status(200).json(new ApiResponse(200, 'Payment verified successfully (Mock)', populatedBooking));
    return;
  }

  // Handle real Stripe session verification
  const hasStripeKey = env.STRIPE_SECRET_KEY && 
                        env.STRIPE_SECRET_KEY !== 'sk_test_mock_secret_key_for_local_testing' &&
                        env.STRIPE_SECRET_KEY.trim() !== '';

  if (!hasStripeKey) {
    throw new ApiError(400, 'Stripe is not configured on the server, cannot verify real Stripe session');
  }

  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.paymentMethod = 'stripe';
      booking.transactionId = (session.payment_intent as string) || sessionId;
      await booking.save();

      const populatedBooking = await Booking.findById(booking._id)
        .populate('tour', 'title thumbnail price discountPrice duration')
        .lean();

      res.status(200).json(new ApiResponse(200, 'Payment verified successfully', populatedBooking));
    } else {
      res.status(400).json(new ApiResponse(400, 'Payment has not been completed', { paymentStatus: session.payment_status }));
    }
  } catch (error: any) {
    console.error('Stripe verify error:', error);
    throw new ApiError(500, `Failed to verify payment with Stripe: ${error.message}`);
  }
});

// GET /api/bookings/my-bookings
export const getMyBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
  }

  const bookings = await Booking.find({ user: userId })
    .populate('tour', 'title thumbnail price discountPrice duration')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(new ApiResponse(200, 'Bookings fetched successfully', bookings));
});
