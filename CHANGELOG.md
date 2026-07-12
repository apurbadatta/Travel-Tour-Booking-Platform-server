# Changelog

## [0.2.0] - 2024-XX-XX - better-auth Integration Preparation

### Changes

#### Removed
- **`src/models/User.model.ts`** - Deleted entirely
  - Reason: better-auth manages its own `user`, `session`, `account`, and `verification` collections through its MongoDB adapter. No need for a custom Mongoose User model.

#### Added
- **`src/models/UserProfile.model.ts`** - New model for app-specific user data
  - Fields: `userId` (string, references better-auth user ID), `phone`, `role`, `wishlist`
  - Reason: Separates app-specific data (phone, admin role, wishlist) from auth data managed by better-auth

- **`src/config/db.ts` exports** - Added `getMongoClient()` and `getMongoDb()` functions
  - Reason: better-auth's mongodbAdapter needs access to the native MongoDB client, not just Mongoose. These functions expose the raw client from the existing Mongoose connection.

#### Modified
- **`src/config/env.ts`** - Added better-auth environment variables
  - Added: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - Removed: `JWT_SECRET`, `JWT_EXPIRE` (better-auth handles session management)

- **`.env` & `.env.example`** - Updated with better-auth configuration variables

- **`src/types/index.ts`** - Updated AuthRequest interface
  - Changed: Now uses `BetterAuthUser` type instead of `IUser` from deleted User.model.ts
  - Added: `BetterAuthUser` interface definition

#### Preserved (No Changes)
- **`src/models/Tour.model.ts`** - No changes
  - `createdBy` field still references `User` (will reference better-auth's user collection)
  
- **`src/models/Booking.model.ts`** - No changes
  - `user` field still references `User` (will reference better-auth's user collection)
  
- **`src/models/Review.model.ts`** - No changes
  - `user` field still references `User` (will reference better-auth's user collection)

### Technical Notes

1. **User Collection Reference**: The `ref: 'User'` in Tour, Booking, and Review models will now reference better-auth's `user` collection (which better-auth creates automatically via mongodbAdapter).

2. **User ID Type**: better-auth uses string IDs by default. The `UserProfile.userId` field is typed as `String` to match this. The `ref: 'User'` references in other models will work with better-auth's user collection.

3. **MongoDB Connection Sharing**: The existing Mongoose connection is reused. better-auth's mongodbAdapter will receive the native `MongoClient` instance from `getMongoClient()`.

4. **No Mongoose User Model**: better-auth does not use Mongoose. It uses the native MongoDB driver directly. The `UserProfile` model is a separate Mongoose model for app-specific data only.

### Next Steps
- Set up better-auth configuration in a new file (e.g., `src/config/auth.ts`)
- Configure mongodbAdapter to use the shared MongoDB client
- Set up better-auth routes and middleware
- Create UserProfile records when users sign up through better-auth
