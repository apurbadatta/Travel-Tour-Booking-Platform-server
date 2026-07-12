import { Request, Response } from 'express';
import Tour from '../models/Tour.model';
import Booking from '../models/Booking.model';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { AuthRequest } from '../types';

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

  const populatedBooking = await Booking.findById(booking._id)
    .populate('tour', 'title thumbnail price discountPrice duration')
    .lean();

  res.status(201).json(new ApiResponse(201, 'Booking created successfully', populatedBooking));
});
