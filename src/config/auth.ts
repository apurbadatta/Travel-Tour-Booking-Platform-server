import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { env } from './env';
import { getMongoDb } from './db';

// Create better-auth instance with MongoDB adapter
export const auth = betterAuth({
  // MongoDB adapter using native MongoDB driver
  database: mongodbAdapter(getMongoDb(), {
    // better-auth will create these collections:
    // user, session, account, verification
  }),

  // Base URL for better-auth
  baseURL: env.BETTER_AUTH_URL,

  // Secret for session signing
  secret: env.BETTER_AUTH_SECRET,

  // Email and Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },

  // Social providers
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  // User schema configuration - add custom fields
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        // Store role in better-auth's user collection
        // Values: 'user' or 'admin'
      },
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // 1 day in seconds
  },

  // Trusted origins for CORS
  trustedOrigins: [env.CLIENT_URL],
});

// Helper function to get session from request headers
export const getSession = async (headers: Headers) => {
  return auth.api.getSession({
    headers,
  });
};