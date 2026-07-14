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

let dbConnected = false;

async function ensureDB() {
  if (!dbConnected) {
    await connectDB();
    await autoSeed();
    dbConnected = true;
  }
}

const app = express();

// Security middleware
app.use(helmet());

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
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// better-auth handler - MUST be BEFORE express.json() body parsing
app.use('/api/auth', async (req, res) => {
  await ensureDB();
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
app.get('/api/health', async (_req, res) => {
  await ensureDB();
  const response = new ApiResponse(200, 'Server is running', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    authEnabled: true,
  });
  res.status(response.statusCode).json(response);
});

// Tour routes
app.use('/api/tours', async (req, res, next) => {
  await ensureDB();
  tourRoutes(req, res, next);
});

// Booking routes
app.use('/api/bookings', async (req, res, next) => {
  await ensureDB();
  bookingRoutes(req, res, next);
});

// Admin routes
app.use('/api/admin', async (req, res, next) => {
  await ensureDB();
  adminRoutes(req, res, next);
});

// Contact routes
app.use('/api/contact', async (req, res, next) => {
  await ensureDB();
  contactRoutes(req, res, next);
});

// Profile routes
app.use('/api/profile', async (req, res, next) => {
  await ensureDB();
  userProfileRoutes(req, res, next);
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  const response = new ApiResponse(404, `Route ${req.originalUrl} not found`, null);
  res.status(response.statusCode).json(response);
});

// Error handling middleware
app.use(errorHandler);

// For local development
if (env.NODE_ENV !== 'production') {
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
}

// Vercel serverless function export
export default app;
