import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import ApiResponse from '../utils/ApiResponse.js';

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Check if user exists (should be set by protect middleware)
  if (!req.user) {
    const response = new ApiResponse(401, 'Not authenticated.', null);
    res.status(401).json(response);
    return;
  }

  // Check if user has admin role
  // better-auth stores additional fields in the user object
  const userRole = (req.user as any).role;

  if (userRole !== 'admin') {
    const response = new ApiResponse(
      403,
      'Access denied. Admin privileges required.',
      null
    );
    res.status(403).json(response);
    return;
  }

  next();
};