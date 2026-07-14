import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Tour from '../models/Tour.model';
import Review from '../models/Review.model';
import Category from '../models/Category.model';
import Destination from '../models/Destination.model';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { AuthRequest } from '../types';

export const getTours = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '12',
    category,
    minPrice,
    maxPrice,
    rating,
    search,
    sortBy = '-createdAt',
    featured,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, any> = { isActive: true, status: 'approved' };

  if (category) {
    // Support both ObjectId and slug
    if (mongoose.Types.ObjectId.isValid(category as string)) {
      filter.category = category;
    } else {
      const cat = await Category.findOne({ slug: category }).select('_id').lean();
      if (cat) {
        filter.category = cat._id;
      } else {
        // No matching category found, return empty results
        const response = {
          tours: [],
          pagination: { page: pageNum, limit: limitNum, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
        };
        res.status(200).json(new ApiResponse(200, 'Tours fetched successfully', response));
        return;
      }
    }
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice as string);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice as string);
  }

  if (rating) {
    filter['ratings.average'] = { $gte: parseFloat(rating as string) };
  }

  if (featured === 'true') {
    filter.isFeatured = true;
  }

  if (search) {
    filter.$text = { $search: search as string };
  }

  // Build sort object
  const sortStr = sortBy as string;
  const sort: Record<string, 1 | -1> = {};
  if (sortStr.startsWith('-')) {
    sort[sortStr.substring(1)] = -1;
  } else {
    sort[sortStr] = 1;
  }

  const [tours, total] = await Promise.all([
    Tour.find(filter)
      .populate('destination', 'name slug image region')
      .populate('category', 'name slug icon')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Tour.countDocuments(filter),
  ]);

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
  };

  res.status(200).json(new ApiResponse(200, 'Tours fetched successfully', response));
});

export const getTourById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const tour = await Tour.findOne({ _id: id, status: 'approved' })
    .populate('destination', 'name slug description image region')
    .populate('category', 'name slug description icon')
    .lean();

  if (!tour) {
    throw new ApiError(404, 'Tour not found');
  }

  res.status(200).json(new ApiResponse(200, 'Tour fetched successfully', tour));
});

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find({ isActive: true })
    .select('name slug icon')
    .sort({ name: 1 })
    .lean();

  res.status(200).json(new ApiResponse(200, 'Categories fetched successfully', categories));
});

export const getDestinations = asyncHandler(async (_req: Request, res: Response) => {
  const destinations = await Destination.find({ isActive: true })
    .select('name slug image region')
    .sort({ name: 1 })
    .lean();

  res.status(200).json(new ApiResponse(200, 'Destinations fetched successfully', destinations));
});

export const getTourReviews = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { page = '1', limit = '10' } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total, ratingBreakdown] = await Promise.all([
    Review.find({ tour: id, isApproved: true })
      .populate('user', 'name image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Review.countDocuments({ tour: id, isApproved: true }),
    Review.aggregate([
      { $match: { tour: new mongoose.Types.ObjectId(id), isApproved: true } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]),
  ]);

  // Build breakdown object (5 stars to 1 star)
  const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingBreakdown.forEach((item: any) => {
    breakdown[item._id] = item.count;
  });

  const totalPages = Math.ceil(total / limitNum);

  const response = {
    reviews,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
    ratingBreakdown: breakdown,
  };

  res.status(200).json(new ApiResponse(200, 'Reviews fetched successfully', response));
});

export const getRelatedTours = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const tour = await Tour.findById(id).select('category').lean();
  if (!tour) {
    throw new ApiError(404, 'Tour not found');
  }

  const relatedTours = await Tour.find({
    _id: { $ne: id },
    category: tour.category,
    isActive: true,
    status: 'approved',
  })
    .populate('destination', 'name slug image region')
    .populate('category', 'name slug icon')
    .sort({ 'ratings.average': -1 })
    .limit(4)
    .lean();

  res.status(200).json(new ApiResponse(200, 'Related tours fetched successfully', relatedTours));
});

export const createTour = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
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

  const userRole = (req.user as any).role;
  const isAdmin = userRole === 'admin';

  const tour = await Tour.create({
    title,
    shortDescription,
    description,
    price: parseFloat(price),
    discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
    duration: {
      days: parseInt(duration.days),
      nights: parseInt(duration.nights) || 0,
    },
    category,
    destination,
    thumbnail,
    images: images || [],
    maxGroupSize: parseInt(maxGroupSize),
    difficulty: difficulty || 'moderate',
    highlights: highlights || [],
    included: included || [],
    excluded: excluded || [],
    departureLocation,
    startPoint,
    endPoint,
    startDates: startDates || [],
    isFeatured: isFeatured || false,
    status: isAdmin ? 'approved' : 'pending',
    createdBy: userId,
  });

  const populatedTour = await Tour.findById(tour._id)
    .populate('destination', 'name slug image region')
    .populate('category', 'name slug icon')
    .lean();

  const message = isAdmin
    ? 'Tour created successfully and published live.'
    : 'Tour submitted successfully. Pending admin approval.';

  res.status(201).json(new ApiResponse(201, message, populatedTour));
});

export const getMyTours = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
  }

  const { page = '1', limit = '12', sortBy = '-createdAt', status } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, any> = { createdBy: userId };

  if (status && ['pending', 'approved', 'rejected'].includes(status as string)) {
    filter.status = status;
  }

  const sortStr = sortBy as string;
  const sort: Record<string, 1 | -1> = {};
  if (sortStr.startsWith('-')) {
    sort[sortStr.substring(1)] = -1;
  } else {
    sort[sortStr] = 1;
  }

  const [tours, total] = await Promise.all([
    Tour.find(filter)
      .populate('destination', 'name slug image region')
      .populate('category', 'name slug icon')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Tour.countDocuments(filter),
  ]);

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
  };

  res.status(200).json(new ApiResponse(200, 'My tours fetched successfully', response));
});

export const updateTour = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
  }

  const { id } = req.params;

  const tour = await Tour.findById(id);
  if (!tour) {
    throw new ApiError(404, 'Tour not found');
  }

  // Ownership check: user must own the tour OR be admin
  const userRole = (req.user as any).role;
  if (tour.createdBy.toString() !== userId && userRole !== 'admin') {
    throw new ApiError(403, 'You can only edit your own tours');
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

  // Update fields and force status back to pending for re-approval (unless admin)
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

  // Admin edits go live immediately; regular user edits need re-approval
  if (userRole === 'admin') {
    tour.status = 'approved';
  } else {
    tour.status = 'pending';
  }
  tour.rejectionReason = undefined;

  await tour.save();

  const populatedTour = await Tour.findById(tour._id)
    .populate('destination', 'name slug image region')
    .populate('category', 'name slug icon')
    .lean();

  const message = userRole === 'admin'
    ? 'Tour updated successfully and changes are now live.'
    : 'Tour updated successfully. Pending admin re-approval.';

  res.status(200).json(new ApiResponse(200, message, populatedTour));
});

export const deleteTour = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Not authenticated');
  }

  const { id } = req.params;

  const tour = await Tour.findById(id);
  if (!tour) {
    throw new ApiError(404, 'Tour not found');
  }

  // Ownership check: user must own the tour OR be admin
  const userRole = (req.user as any).role;
  if (tour.createdBy.toString() !== userId && userRole !== 'admin') {
    throw new ApiError(403, 'You can only delete your own tours');
  }

  await Tour.findByIdAndDelete(id);

  res.status(200).json(new ApiResponse(200, 'Tour deleted successfully', null));
});
