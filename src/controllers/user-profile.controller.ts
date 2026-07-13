import { Response } from 'express';
import { getMongoDb } from '../config/db';
import UserProfile from '../models/UserProfile.model';
import Booking from '../models/Booking.model';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { AuthRequest } from '../types';

// GET /api/profile
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Not authenticated');

  let profile = await UserProfile.findOne({ userId }).lean();
  if (!profile) {
    profile = await UserProfile.create({ userId, role: (req.user as any)?.role || 'user' });
  }

  const bookingCount = await Booking.countDocuments({ user: userId });
  const completedCount = await Booking.countDocuments({ user: userId, status: 'completed' });
  const totalSpent = await Booking.aggregate([
    { $match: { user: userId, paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Profile fetched successfully', {
      user: {
        id: req.user?.id,
        name: req.user?.name,
        email: req.user?.email,
        image: req.user?.image || null,
        role: (req.user as any)?.role || 'user',
        createdAt: req.user?.createdAt,
      },
      profile: {
        phone: (profile as any).phone || '',
      },
      stats: {
        totalBookings: bookingCount,
        completedTrips: completedCount,
        totalSpent: totalSpent[0]?.total || 0,
      },
    })
  );
});

// PUT /api/profile
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, 'Not authenticated');

  const { name, phone, image } = req.body;

  // Update better-auth user collection (try _id first, then id)
  const db = getMongoDb();
  const userUpdate: Record<string, any> = { updatedAt: new Date() };
  if (name !== undefined) userUpdate.name = name;
  if (image !== undefined) userUpdate.image = image;

  if (Object.keys(userUpdate).length > 1) {
    const result = await db.collection('user').updateOne({ _id: userId }, { $set: userUpdate });
    if (result.matchedCount === 0) {
      await db.collection('user').updateOne({ id: userId }, { $set: userUpdate });
    }
  }

  // Update UserProfile
  let profile = await UserProfile.findOne({ userId });
  if (!profile) {
    profile = await UserProfile.create({ userId, phone, role: (req.user as any)?.role || 'user' });
  } else {
    if (phone !== undefined) (profile as any).phone = phone;
    await profile.save();
  }

  res.status(200).json(
    new ApiResponse(200, 'Profile updated successfully', {
      user: {
        id: req.user?.id,
        name: name || req.user?.name,
        email: req.user?.email,
        image: image || req.user?.image || null,
        role: (req.user as any)?.role || 'user',
      },
      profile: {
        phone: (profile as any).phone || '',
      },
    })
  );
});
