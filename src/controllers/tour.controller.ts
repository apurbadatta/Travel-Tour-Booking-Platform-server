import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Tour from '../models/Tour.model';
import Category from '../models/Category.model';
import Destination from '../models/Destination.model';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';

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

  const filter: Record<string, any> = { isActive: true };

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

  const tour = await Tour.findById(id)
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
