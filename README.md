# Tourify — Server

> A full-stack travel booking platform where users can explore, create, and book tours. Admins can manage listings, approve tours, and oversee bookings. This is the **Express.js REST API** backend.

**Live API:** https://travel-tour-booking-platform-server.onrender.com  
**Health Check:** https://travel-tour-booking-platform-server.onrender.com/api/health  
**Frontend:** https://travel-tour-booking-platform-client.vercel.app

---

## Tech Stack

| Tech | Version | Purpose |
|------|---------|---------|
| Express.js | 4.21 | HTTP framework |
| TypeScript | 5.5 | Type safety |
| MongoDB + Mongoose | 8.6 | Database + ODM |
| better-auth | 1.6.23 | Authentication (session cookies) |
| Stripe | 22.3 | Payment processing |
| Helmet | 7.1 | Security headers |
| Morgan | 1.10 | HTTP logging |
| CORS | 2.8.5 | Cross-origin requests |

---

## API Endpoints

### Auth (`/api/auth/*`) — better-auth built-in

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sign-up/email` | POST | Register |
| `/sign-in/email` | POST | Login |
| `/sign-out` | POST | Logout |
| `/get-session` | GET | Current session |

### Tours (`/api/tours`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | List tours (paginated, filterable) |
| GET | `/:id` | Public | Single tour |
| GET | `/:id/reviews` | Public | Tour reviews |
| GET | `/:id/related` | Public | Related tours |
| GET | `/categories` | Public | All categories |
| GET | `/destinations` | Public | All destinations |
| GET | `/my-tours` | Protected | Your tours |
| POST | `/` | Protected | Create tour |
| PUT | `/:id` | Protected | Update tour |
| DELETE | `/:id` | Protected | Delete tour |

**Query params:** `page`, `limit`, `category`, `destination`, `difficulty`, `minPrice`, `maxPrice`, `minRating`, `search`, `sortBy`, `featured`

### Bookings (`/api/bookings`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Protected | Create booking |
| POST | `/verify-payment` | Protected | Verify Stripe payment |
| GET | `/my-bookings` | Protected | Your bookings |

### Admin (`/api/admin`) — Admin only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Dashboard statistics |
| GET | `/users` | All users |
| PUT | `/users/:id/role` | Update user role |
| GET | `/bookings` | All bookings |
| GET | `/tours` | All tours (any status) |
| PATCH | `/tours/:id/approve` | Approve tour |
| PATCH | `/tours/:id/reject` | Reject tour |
| PUT | `/tours/:id` | Edit any tour |

### Profile & Contact

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/profile` | Protected | Get profile |
| PUT | `/api/profile` | Protected | Update profile |
| POST | `/api/contact` | Public | Contact form |
| GET | `/api/health` | Public | Health check |

---

## Database Models (7)

| Model | Key Fields |
|-------|-----------|
| **User** | name, email, role (user/admin), image |
| **UserProfile** | userId, phone, wishlist |
| **Tour** | title, price, duration, ratings, status (pending/approved/rejected), destination, category, itinerary |
| **Booking** | user, tour, travelDate, totalPrice, status, paymentStatus |
| **Review** | user, tour, rating (1-5), comment, isApproved |
| **Category** | name, slug, icon |
| **Destination** | name, region, image |

---

## Tour Approval Workflow

```
Create tour → pending → Admin reviews → approved (public) / rejected (with reason)
```

---

## Project Structure

```
server/src/
├── index.ts                 # Express app, CORS, routes, startup
├── config/                  # auth.ts, db.ts, env.ts
├── controllers/             # tour, booking, admin, contact, profile
├── middlewares/             # protect.ts, requireAdmin.ts, errorHandler.ts
├── models/                  # 7 Mongoose models
├── routes/                  # 5 route files
├── types/                   # Express augmentation, shared types
└── utils/                   # ApiError, ApiResponse, asyncHandler
```

---

## Middlewares

| Middleware | Purpose |
|-----------|---------|
| `protect` | Verifies session via better-auth, attaches `req.user` |
| `requireAdmin` | Checks `req.user.role === 'admin'` |
| `errorHandler` | Catches errors, returns standardized JSON |

---

## Setup

```bash
cd server
npm install
cp .env.example .env
npm run dev          # → http://localhost:5000
npm run seed         # optional: sample data
```

## Env Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | `development` / `production` | Yes |
| `MONGO_URI` | MongoDB connection string | Yes |
| `CLIENT_URL` | Frontend URL for CORS | Yes |
| `BETTER_AUTH_SECRET` | Random secret for sessions | Yes |
| `BETTER_AUTH_URL` | Server URL | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | No |
| `STRIPE_SECRET_KEY` | Stripe payments | No |

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot-reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run seed` | Seed sample data |
| `npm run lint` | ESLint |

---

## Deploy on Render

1. Create **Web Service** on [render.com](https://render.com) (NOT Static Site)
2. Root Directory → `server`
3. Build Command → `npm install && npm run build`
4. Start Command → `node dist/index.js`
5. Add env vars from `.env.production.example`
6. Deploy

**Note:** `NODE_ENV=production` and `BETTER_AUTH_URL` must be set for cross-domain cookies to work.
