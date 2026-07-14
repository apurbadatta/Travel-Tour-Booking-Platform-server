import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { env } from './env.js';
import { getMongoDb } from './db.js';

// Use any type to avoid complex generic type issues
let authInstance: any = null;

export const getAuth = (): any => {
  if (!authInstance) {
    authInstance = betterAuth({
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
          callbackURL: `${env.CLIENT_URL}/`,
        },
      },

      // User schema configuration - add custom fields
      user: {
        additionalFields: {
          role: {
            type: 'string',
            required: false,
            defaultValue: 'user',
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
  }
  return authInstance;
};

// Helper function to get session from request headers
export const getSession = async (headers: Headers) => {
  return getAuth().api.getSession({
    headers,
  });
};