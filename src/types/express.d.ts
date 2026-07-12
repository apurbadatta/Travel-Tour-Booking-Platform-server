// Express type extensions for better-auth user

export {};

declare global {
  namespace Express {
    interface User {
      id: string;
      name: string;
      email: string;
      emailVerified: boolean;
      image: string | null;
      createdAt: Date;
      updatedAt: Date;
      role?: string; // Additional field from better-auth config
    }

    interface Request {
      user?: User;
    }
  }
}