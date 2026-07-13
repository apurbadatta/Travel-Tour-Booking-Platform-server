import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';

interface ContactBody {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body as ContactBody;

  // Validate required fields
  if (!name || !name.trim()) {
    throw new ApiError(400, 'Name is required');
  }

  if (!email || !email.trim()) {
    throw new ApiError(400, 'Email is required');
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Please provide a valid email address');
  }

  if (!message || !message.trim()) {
    throw new ApiError(400, 'Message is required');
  }

  if (message.length > 2000) {
    throw new ApiError(400, 'Message cannot exceed 2000 characters');
  }

  // In a real app, save to database and/or send email notification
  // For now, we just log and return success
  console.log('Contact form submission:', {
    name: name.trim(),
    email: email.trim(),
    subject: subject?.trim() || 'No subject',
    message: message.trim(),
    timestamp: new Date().toISOString(),
  });

  res.status(200).json(
    new ApiResponse(200, 'Thank you for your message. We will get back to you within 24 hours.', null)
  );
});
