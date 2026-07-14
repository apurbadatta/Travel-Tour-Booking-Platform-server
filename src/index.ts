import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { toNodeHandler } from 'better-auth/node';
import { getAuth } from './config/auth.js';
import { env } from './config/env.js';
import connectDB from './config/db.js';
import { autoSeed } from './autoSeed.js';
import errorHandler from './middlewares/errorHandler.js';
import tourRoutes from './routes/tour.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import adminRoutes from './routes/admin.routes.js';
import contactRoutes from './routes/contact.routes.js';
import userProfileRoutes from './routes/user-profile.routes.js';
import ApiResponse from './utils/ApiResponse.js';

const app = express();

// Security middleware - configure helmet to allow cross-origin cookies
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  env.CLIENT_URL,
  'https://travel-tour-booking-platform-client.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie'],
    exposedHeaders: ['Set-Cookie'],
  })
);

// better-auth handler - MUST be BEFORE express.json() body parsing
app.use('/api/auth', (req, res) => {
  toNodeHandler(getAuth())(req, res);
});

// Body parsing middleware - AFTER better-auth handler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/api/health', (_req, res) => {
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

// 404 handler for undefined routes
app.use('*', (req, res) => {
  const response = new ApiResponse(404, `Route ${req.originalUrl} not found`, null);
  res.status(response.statusCode).json(response);
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB and auto-seed, then start server
connectDB().then(() => {
  autoSeed();

  const startServer = (port: number) => {
    app.listen(port)
      .on('listening', () => {
        console.log(`Server running in ${env.NODE_ENV} mode on port ${port}`);
        console.log(`Auth endpoints available at: ${env.BETTER_AUTH_URL}/api/auth/*`);
      })
      .on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`Port ${port} is busy, trying port ${port + 1}...`);
          startServer(port + 1);
        } else {
          console.error('Server error:', err);
          process.exit(1);
        }
      });
  };

  startServer(env.PORT);
});

export default app;
