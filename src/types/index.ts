import { Request } from 'express';

// Re-export Express User type for convenience
export type User = Express.User;

// AuthRequest extends Request with user property
export interface AuthRequest extends Request {
  user?: Express.User;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface TourQuery extends PaginationQuery {
  search?: string;
  destination?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  difficulty?: string;
  duration?: number;
  featured?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}