const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { toNodeHandler } from 'better-auth/node';
import { getAuth } from './config/auth';
import { env } from './config/env';
import connectDB from './config/db';
import { autoSeed } from './autoSeed';
import errorHandler from './middlewares/errorHandler';
import tourRoutes from './routes/tour.routes';
import bookingRoutes from './routes/booking.routes';
import adminRoutes from './routes/admin.routes';
import contactRoutes from './routes/contact.routes';
import userProfileRoutes from './routes/user-profile.routes';
import ApiResponse from './utils/ApiResponse';

// Connect to MongoDB and auto-seed
connectDB().then(() => autoSeed());

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - MUST be before better-auth handler
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true, // Required for cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// better-auth handler - MUST be BEFORE express.json() body parsing
// This handles all /api/auth/* routes automatically
// Lazy handler: getAuth() is called per-request, after DB is connected
app.use('/api/auth', (req, res) => {
  toNodeHandler(getAuth())(req, res);
});

// Body parsing middleware - AFTER better-auth handler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(morgan('dev'));

// Health check route
app.get('/api/health', (req, res) => {
  const response = new ApiResponse(200, 'Server is running', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    authEnabled: true,
  });
  res.status(response.statusCode).json(response);
});

// Tour routes
app.use('/api/tours', tourRoutes);

// Booking routes
app.use('/api/bookings', bookingRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Contact routes
app.use('/api/contact', contactRoutes);

// Profile routes
app.use('/api/profile', userProfileRoutes);

// Protected route example (for testing)
app.get('/api/auth/me', (req, res) => {
  // This is a simple example - in practice, use the protect middleware
  // better-auth handles /api/auth/me automatically via its handler
  const response = new ApiResponse(200, 'Auth endpoint', {
    message: 'Use better-auth client to access this endpoint',
  });
  res.status(response.statusCode).json(response);
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  const response = new ApiResponse(404, `Route ${req.originalUrl} not found`, null);
  res.status(response.statusCode).json(response);
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  console.log(`Auth endpoints available at: ${env.BETTER_AUTH_URL}/api/auth/*`);
});

export default app;