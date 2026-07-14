import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError.js';
import { env } from '../config/env.js';

const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;

  // Check if error is an instance of ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = 500;
    const message = 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  // Log error in development
  if (env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      statusCode: (error as ApiError).statusCode,
    });
  }

  // Send error response
  const response = {
    success: false,
    message: error.message,
    data: null,
  };

  res.status((error as ApiError).statusCode).json(response);
};

export default errorHandler;