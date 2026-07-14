import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { env } from './env.js';
import { getMongoDb } from './db.js';

// Use any type to avoid complex generic type issues
let authInstance: any = null;

const isProduction = env.NODE_ENV === 'production';

export const getAuth = (): any => {
  if (!authInstance) {
    authInstance = betterAuth({
      // MongoDB adapter using native MongoDB driver
      database: mongodbAdapter(getMongoDb(), {
        // better-auth will create these collections:
        // user, session, account, verification
      }),

      // Base URL for better-auth (must be the server URL)
      baseURL: env.BETTER_AUTH_URL,

      // Secret for session signing
      secret: env.BETTER_AUTH_SECRET,

      // Email and Password authentication
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
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
        cookieCache: {
          enabled: true,
          maxAge: 60 * 5, // 5 minutes cache
        },
      },

      // Trusted origins for CORS - must include the client URL
      trustedOrigins: [
        env.CLIENT_URL,
        'https://travel-tour-booking-platform-client.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
      ],

      // Advanced cookie settings for cross-domain (Vercel client ↔ Render server)
      advanced: {
        useSecureCookies: isProduction,
        crossSubdomainCookies: {
          enabled: false, // Different domains, not subdomains
        },
        defaultCookieAttributes: isProduction
          ? {
              sameSite: 'none' as const,
              secure: true,
              httpOnly: true,
              partitioned: true, // Chrome's CHIPS for cross-site cookies
            }
          : {
              sameSite: 'lax' as const,
              secure: false,
              httpOnly: true,
            },
      },
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