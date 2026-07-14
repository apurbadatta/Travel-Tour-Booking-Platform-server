import { Response, NextFunction } from 'express';
import { getAuth } from '../config/auth.js';
import { AuthRequest } from '../types/index.js';
import ApiResponse from '../utils/ApiResponse.js';

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Create a Headers object from Express request headers
    const headers = new Headers();
    
    // Copy relevant headers
    if (req.headers.cookie) {
      headers.set('cookie', req.headers.cookie);
    }
    if (req.headers.authorization) {
      headers.set('authorization', req.headers.authorization);
    }

    // Get session from better-auth using the constructed Headers
    const session = await getAuth().api.getSession({
      headers,
    });

    if (!session || !session.user) {
      const response = new ApiResponse(401, 'Not authenticated. Please log in.', null);
      res.status(401).json(response);
      return;
    }

    // Attach user to request object with proper typing
    req.user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      emailVerified: session.user.emailVerified,
      image: session.user.image ?? null,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
      role: (session.user as any).role ?? 'user',
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    const response = new ApiResponse(401, 'Invalid or expired session.', null);
    res.status(401).json(response);
  }
};