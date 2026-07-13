import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Tour from '../models/Tour.model';
import Category from '../models/Category.model';
import Destination from '../models/Destination.model';
import User from '../models/User.model';
import Booking from '../models/Booking.model';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { AuthRequest } from '../types';

// GET /api/admin/tours — all tours, status filter, pagination
export const getAllTours = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '20',
    status,
    sortBy = '-createdAt',
    search,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, any> = {};

  if (status && status !== 'all' && ['pending', 'approved', 'rejected'].includes(status as string)) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { shortDescription: { $regex: search, $options: 'i' } },
    ];
  }

  const sortStr = sortBy as string;
  const sort: Record<string, 1 | -1> = {};
  if (sortStr.startsWith('-')) {
    sort[sortStr.substring(1)] = -1;
  } else {
    sort[sortStr] = 1;
  }

  const [tours, total, statusCounts] = await Promise.all([
    Tour.find(filter)
      .populate('destination', 'name slug image region')
      .populate('category', 'name slug icon')
      .populate('createdBy', 'name email image')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Tour.countDocuments(filter),
    Tour.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const counts = { pending: 0, approved: 0, rejected: 0, all: 0 };
  statusCounts.forEach((item: any) => {
    if (item._id in counts) {
      counts[item._id as keyof typeof counts] = item.count;
      counts.all += item.count;
    }
  });

  const totalPages = Math.ceil(total / limitNum);

  const response = {
    tours,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
    statusCounts: counts,
  };

  res.status(200).json(new ApiResponse(200, 'Tours fetched successfully', response));
});

// PATCH /api/admin/tours/:id/approve
export const approveTour = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
  }

  const { id } = req.params;

  const tour = await Tour.findById(id);
  if (!tour) {
    throw new ApiError(404, 'Tour not found');
  }

  if (tour.status === 'approved') {
    throw new ApiError(400, 'Tour is already approved');
  }

  tour.status = 'approved';
  tour.reviewedBy = userId as any;
  tour.reviewedAt = new Date();
  tour.rejectionReason = undefined;

  await tour.save();

  const populatedTour = await Tour.findById(tour._id)
    .populate('destination', 'name slug image region')
    .populate('category', 'name slug icon')
    .populate('createdBy', 'name email image')
    .lean();

  res.status(200).json(new ApiResponse(200, 'Tour approved successfully', populatedTour));
});

// PATCH /api/admin/tours/:id/reject
export const rejectTour = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
  }

  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    throw new ApiError(400, 'Rejection reason is required');
  }

  const tour = await Tour.findById(id);
  if (!tour) {
    throw new ApiError(404, 'Tour not found');
  }

  if (tour.status === 'rejected') {
    throw new ApiError(400, 'Tour is already rejected');
  }

  tour.status = 'rejected';
  tour.rejectionReason = reason.trim();
  tour.reviewedBy = userId as any;
  tour.reviewedAt = new Date();

  await tour.save();

  const populatedTour = await Tour.findById(tour._id)
    .populate('destination', 'name slug image region')
    .populate('category', 'name slug icon')
    .populate('createdBy', 'name email image')
    .lean();

  res.status(200).json(new ApiResponse(200, 'Tour rejected successfully', populatedTour));
});

// PUT /api/admin/tours/:id — admin can edit any tour
export const adminUpdateTour = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
  }

  const { id } = req.params;

  const tour = await Tour.findById(id);
  if (!tour) {
    throw new ApiError(404, 'Tour not found');
  }

  const {
    title,
    shortDescription,
    description,
    price,
    discountPrice,
    duration,
    category,
    destination,
    thumbnail,
    images,
    maxGroupSize,
    difficulty,
    highlights,
    included,
    excluded,
    departureLocation,
    startPoint,
    endPoint,
    startDates,
    isFeatured,
    isActive,
  } = req.body;

  // Validate required fields
  if (!title || !shortDescription || !description || !price || !duration || !category || !destination || !thumbnail || !maxGroupSize || !departureLocation || !startPoint || !endPoint) {
    throw new ApiError(400, 'Missing required fields: title, shortDescription, description, price, duration, category, destination, thumbnail, maxGroupSize, departureLocation, startPoint, endPoint');
  }

  // Validate category exists
  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) {
    throw new ApiError(400, 'Invalid category');
  }

  // Validate destination exists
  const destinationDoc = await Destination.findById(destination);
  if (!destinationDoc) {
    throw new ApiError(400, 'Invalid destination');
  }

  // Validate duration
  if (!duration.days || duration.days < 1) {
    throw new ApiError(400, 'Duration days must be at least 1');
  }

  tour.title = title;
  tour.shortDescription = shortDescription;
  tour.description = description;
  tour.price = parseFloat(price);
  tour.discountPrice = discountPrice ? parseFloat(discountPrice) : undefined;
  tour.duration = {
    days: parseInt(duration.days),
    nights: parseInt(duration.nights) || 0,
  };
  tour.category = category;
  tour.destination = destination;
  tour.thumbnail = thumbnail;
  tour.images = images || [];
  tour.maxGroupSize = parseInt(maxGroupSize);
  tour.difficulty = difficulty || 'moderate';
  tour.highlights = highlights || [];
  tour.included = included || [];
  tour.excluded = excluded || [];
  tour.departureLocation = departureLocation;
  tour.startPoint = startPoint;
  tour.endPoint = endPoint;
  tour.startDates = startDates || [];
  if (typeof isFeatured === 'boolean') tour.isFeatured = isFeatured;
  if (typeof isActive === 'boolean') tour.isActive = isActive;

  await tour.save();

  const populatedTour = await Tour.findById(tour._id)
    .populate('destination', 'name slug image region')
    .populate('category', 'name slug icon')
    .populate('createdBy', 'name email image')
    .lean();

  res.status(200).json(new ApiResponse(200, 'Tour updated successfully', populatedTour));
});

// GET /api/admin/stats
export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
  const [totalUsers, totalTours, paidBookings, tourCounts] = await Promise.all([
    User.countDocuments(),
    Tour.countDocuments(),
    Booking.find({ paymentStatus: 'paid' }).select('totalPrice').lean(),
    Tour.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  const statusCounts = { pending: 0, approved: 0, rejected: 0 };
  tourCounts.forEach((item: any) => {
    if (item._id in statusCounts) {
      statusCounts[item._id as keyof typeof statusCounts] = item.count;
    }
  });

  res.status(200).json(
    new ApiResponse(200, 'Admin statistics fetched successfully', {
      totalUsers,
      totalTours,
      totalRevenue,
      tourStatusCounts: statusCounts,
    })
  );
});

// GET /api/admin/users
export const getAdminUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  res.status(200).json(new ApiResponse(200, 'Users fetched successfully', users));
});

// PUT /api/admin/users/:id/role
export const updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    throw new ApiError(400, 'Invalid role. Role must be either "user" or "admin".');
  }

  if (req.user?.id === id) {
    throw new ApiError(400, 'You cannot change your own role.');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.role = role;
  await user.save();

  // Also update UserProfile if it exists
  const UserProfile = mongoose.models.UserProfile;
  if (UserProfile) {
    await UserProfile.findOneAndUpdate({ userId: id }, { role });
  }

  res.status(200).json(new ApiResponse(200, `User role updated to ${role} successfully`, user));
});

// GET /api/admin/bookings
export const getAdminBookings = asyncHandler(async (req: Request, res: Response) => {
  const bookings = await Booking.find()
    .populate('tour', 'title thumbnail price discountPrice duration')
    .populate({
      path: 'user',
      select: 'name email image role',
      model: User
    })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(new ApiResponse(200, 'Bookings fetched successfully', bookings));
});

