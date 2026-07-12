# Authentication API Documentation

This project uses **better-auth** for authentication. better-auth automatically generates all authentication endpoints. No custom JWT/bcrypt logic is needed.

## Base URL

```
http://localhost:5000/api/auth
```

## Configuration

- **Email/Password Auth**: Enabled
- **Google OAuth**: Configured (requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)
- **Session Type**: Cookie-based (HTTP-only)
- **Session Duration**: 7 days

---

## Available Endpoints

### 1. Sign Up (Email/Password)

**POST** `/api/auth/sign-up/email`

Create a new user account with email and password.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false,
    "image": null,
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "session": {
    "id": "session_xyz789",
    "userId": "user_abc123",
    "expiresAt": "2024-01-22T10:30:00.000Z",
    "token": "session_token_here"
  }
}
```

**Notes:**
- Session cookie is automatically set in the response
- User role defaults to "user"

---

### 2. Sign In (Email/Password)

**POST** `/api/auth/sign-in/email`

Authenticate with email and password.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false,
    "image": null,
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "session": {
    "id": "session_xyz789",
    "userId": "user_abc123",
    "expiresAt": "2024-01-22T10:30:00.000Z",
    "token": "session_token_here"
  }
}
```

**Notes:**
- Session cookie is automatically set in the response
- Returns 401 if credentials are invalid

---

### 3. Sign In with Google

**GET** `/api/auth/sign-in/social?provider=google`

Initiate Google OAuth sign-in flow.

**Flow:**
1. Redirect user to: `http://localhost:5000/api/auth/sign-in/social?provider=google`
2. User authenticates with Google
3. Google redirects back to your app with session cookie

**For frontend (React/Next.js), use better-auth client:**
```typescript
import { createAuthClient } from "@better-auth/client";

const authClient = createAuthClient({
  baseURL: "http://localhost:5000",
});

// Sign in with Google
const { data, error } = await authClient.signIn.social({
  provider: "google",
});
```

---

### 4. Get Current Session

**GET** `/api/auth/get-session`

Get the current authenticated user session.

**Request Headers:**
```
Cookie: better-auth.session_token=session_token_here
```

**Response (200):**
```json
{
  "session": {
    "id": "session_xyz789",
    "userId": "user_abc123",
    "expiresAt": "2024-01-22T10:30:00.000Z",
    "token": "session_token_here"
  },
  "user": {
    "id": "user_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": false,
    "image": null,
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Notes:**
- Returns 401 if not authenticated

---

### 5. Sign Out

**POST** `/api/auth/sign-out`

Sign out the current user and invalidate the session.

**Request:**
```json
// No body required
```

**Response (200):**
```json
{
  "success": true
}
```

**Notes:**
- Clears the session cookie

---

### 6. Change Password

**POST** `/api/auth/change-password`

Change the password for the authenticated user.

**Request Headers:**
```
Cookie: better-auth.session_token=session_token_here
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Notes:**
- User must be authenticated
- Returns 400 if current password is incorrect

---

### 7. Forgot Password

**POST** `/api/auth/forgot-password`

Request a password reset email.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Notes:**
- Always returns success (prevents email enumeration)
- Requires email provider configuration (not set up yet)

---

### 8. Reset Password

**POST** `/api/auth/reset-password`

Reset password using the token from email.

**Request:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newPassword456"
}
```

**Response (200):**
```json
{
  "success": true
}
```

---

### 9. Verify Email

**GET** `/api/auth/verify-email?token=verification_token`

Verify email address using the token from verification email.

**Notes:**
- Email verification is disabled in current configuration
- Enable `requireEmailVerification: true` in auth config for production

---

### 10. Delete User

**DELETE** `/api/auth/delete-user`

Delete the authenticated user account.

**Request Headers:**
```
Cookie: better-auth.session_token=session_token_here
```

**Response (200):**
```json
{
  "success": true
}
```

**Notes:**
- User must be authenticated
- This action is irreversible

---

## Using with Express Protect Middleware

For protecting custom API routes, use the `protect` middleware:

```typescript
import { protect } from './middlewares/protect';
import { requireAdmin } from './middlewares/requireAdmin';

// Protected route - requires authentication
app.get('/api/my-profile', protect, (req, res) => {
  // req.user contains the authenticated user
  res.json({ user: req.user });
});

// Admin-only route
app.get('/api/admin/users', protect, requireAdmin, (req, res) => {
  // Only admin users can access this
  res.json({ users: [] });
});
```

**User Object in req.user:**
```typescript
{
  id: "user_abc123",
  name: "John Doe",
  email: "john@example.com",
  emailVerified: false,
  image: null,
  role: "user",  // or "admin"
  createdAt: Date,
  updatedAt: Date
}
```

---

## Frontend Integration

### Install better-auth client

```bash
npm install @better-auth/client
```

### Initialize Auth Client

```typescript
// lib/auth-client.ts
import { createAuthClient } from "@better-auth/client";

export const authClient = createAuthClient({
  baseURL: "http://localhost:5000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

### Example Usage (React)

```tsx
import { authClient } from "@/lib/auth-client";

function LoginPage() {
  const handleLogin = async () => {
    const { data, error } = await authClient.signIn.email({
      email: "john@example.com",
      password: "password123",
    });

    if (data) {
      // Login successful
      console.log("User:", data.user);
    }
  };

  const handleGoogleLogin = async () => {
    const { data, error } = await authClient.signIn.social({
      provider: "google",
    });
  };

  return (
    <div>
      <button onClick={handleLogin}>Login with Email</button>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );
}
```

---

## Session Cookie

better-auth automatically manages session cookies:

- **Cookie Name**: `better-auth.session_token`
- **HttpOnly**: Yes (not accessible via JavaScript)
- **Secure**: Yes in production
- **SameSite**: Lax
- **Path**: /

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

Common error codes:
- `INVALID_CREDENTIALS` - Wrong email/password
- `USER_NOT_FOUND` - No user with that email
- `EMAIL_TAKEN` - Email already registered
- `SESSION_EXPIRED` - Session has expired
- `UNAUTHORIZED` - Not authenticated

---

## Environment Variables

```env
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## MongoDB Collections

better-auth automatically creates these collections:

| Collection | Purpose |
|------------|---------|
| `user` | User accounts (with custom `role` field) |
| `session` | Active sessions |
| `account` | OAuth provider accounts |
| `verification` | Email verification tokens |

---

## Testing with cURL

### Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Sign In
```bash
curl -X POST http://localhost:5000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

### Get Session
```bash
curl http://localhost:5000/api/auth/get-session \
  -b cookies.txt
```

### Sign Out
```bash
curl -X POST http://localhost:5000/api/auth/sign-out \
  -b cookies.txt
```
