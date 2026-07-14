import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const isProduction = (process.env.NODE_ENV || 'development') === 'production';

// Warn about missing critical env vars in production
if (isProduction) {
  const required = ['MONGO_URI', 'BETTER_AUTH_SECRET', 'CLIENT_URL', 'BETTER_AUTH_URL'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`[WARNING] Missing production env vars: ${missing.join(', ')}`);
  }
}

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/tourify',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  
  // better-auth configuration
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || (isProduction ? '' : 'dev-secret-do-not-use-in-production'),
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'http://localhost:5000',
  
  // Google OAuth (for better-auth)
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

  // Stripe Configuration
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
};