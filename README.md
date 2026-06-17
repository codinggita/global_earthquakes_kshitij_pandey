# 🌍 Global Earthquake Analytics API

A production-grade REST API for querying, analyzing, and managing global earthquake data.  
Built with **Node.js · Express · MongoDB · Mongoose** following a strict MVC architecture.

---

## 📑 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Security](#security)
- [Postman Collection](#postman-collection)
- [Deployment](#deployment)

---

## ✨ Features

| Category | Details |
|---|---|
| **CRUD** | Create · Read · Update · Delete · Bulk ops on earthquake records |
| **Filtering** | Country · Place · Status · Network · Mag · Depth · Gap · RMS |
| **Pagination** | Page · Limit · Metadata |
| **Sorting** | Magnitude · Depth · Time · Gap · RMS |
| **Search** | Regex / keyword search across place names |
| **Analytics** | Aggregation stats, magnitude distribution, depth analysis |
| **Auth** | Register · Login · Logout · JWT Access + Refresh Token rotation |
| **RBAC** | Admin-only write routes · user-level read routes |
| **Rate Limiting** | Global 100/15min · Auth 20/15min · Analytics 30/10min |
| **Security** | Helmet · CORS · Secure cookies · bcrypt password hashing |
| **Caching** | In-memory GET cache (30–60s TTL per route) |
| **Logging** | Structured JSON file logger + colourised stdout |
| **HEAD/OPTIONS** | Full HTTP method support on all major routes |

---

## 🛠 Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js v4
- **Database**: MongoDB via Mongoose
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: express-validator
- **Rate Limiting**: express-rate-limit
- **Security**: Helmet, CORS
- **Logging**: Morgan + custom structured logger
- **Compression**: compression

---

## 📁 Project Structure

```
src/
├── analytics/          # Aggregation query builders
├── config/             # Centralised environment config
├── constants/          # Shared constants
├── controllers/        # Request handlers (MVC Controllers)
│   ├── auth.controller.js
│   ├── earthquake.controller.js
│   ├── health.controller.js
│   ├── jwt.controller.js
│   └── user.controller.js
├── database/           # MongoDB connection setup
├── docs/               # API documentation assets
├── helpers/            # Shared helper utilities
├── logs/               # access.log (auto-created)
├── middleware/
│   ├── auth.middleware.js    # protect + restrictTo
│   ├── cache.js              # In-memory GET cache
│   ├── errorHandler.js       # Global error handler
│   ├── logger.js             # Structured JSON logger
│   ├── rateLimiter.js        # Route-specific limiters
│   ├── requestTimer.js       # X-Response-Time header
│   └── validate.js           # express-validator runner
├── models/
│   ├── earthquake.model.js
│   └── user.model.js
├── routes/
│   ├── auth.routes.js
│   ├── earthquake.routes.js
│   ├── health.routes.js
│   ├── index.js
│   ├── jwt.routes.js
│   └── user.routes.js
├── scripts/            # Seed & utility scripts
├── services/           # Business logic services
├── utils/
│   ├── AppError.js
│   ├── asyncHandler.js
│   └── responseFormatter.js
├── validators/
│   ├── auth.validator.js
│   └── earthquake.validator.js
└── app.js              # Express app entry point
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Kshitij-Pandey2605/global_earthquakes_kshitij_pandey.git
cd global_earthquakes_kshitij_pandey

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets

# 4. Seed dataset (optional)
npm run seed

# 5. Start development server
npm run dev
```

The API will be available at: `http://localhost:5000/api/v1`

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# Server
PORT=5000
NODE_ENV=development
API_VERSION=v1

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/global_earthquakes

# JWT
JWT_SECRET=your_strong_secret_here
JWT_EXPIRES_IN=15m
JWT_COOKIE_EXPIRES_IN=7
JWT_REFRESH_SECRET=your_strong_refresh_secret_here
JWT_REFRESH_EXPIRE=7d

# Security
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api/v1
```

### Health

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/health` | — | API status & uptime |

### Authentication — `/auth`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| OPTIONS | `/auth/login` | — | Preflight |
| POST | `/auth/register` | — | Register new user |
| POST | `/auth/login` | — | Login, returns access + refresh tokens |
| POST | `/auth/refresh` | — | Rotate refresh token |
| POST | `/auth/logout` | — | Invalidate refresh token |
| POST | `/auth/forgot-password` | — | Request password reset token |
| POST | `/auth/reset-password/:token` | — | Reset password with token |
| GET | `/auth/profile` | 🔐 User | Get own profile |
| PATCH | `/auth/profile` | 🔐 User | Update name/email |
| POST | `/auth/change-password` | 🔐 User | Change password |

### JWT Protected — `/jwt`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| OPTIONS | `/jwt/profile` | 🔐 User | Preflight |
| GET | `/jwt/profile` | 🔐 User | Profile via JWT namespace |
| GET | `/jwt/dashboard` | 🔐 User | Session dashboard |
| GET | `/jwt/private-earthquakes` | 🔐 User | Private data access demo |
| GET | `/jwt/private-analytics` | 🔐 User | Private analytics demo |

### Earthquakes — `/earthquakes`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| HEAD | `/earthquakes` | — | Metadata check |
| OPTIONS | `/earthquakes` | — | Allowed methods |
| GET | `/earthquakes` | — | List with filter/sort/paginate |
| POST | `/earthquakes` | 🔐 Admin | Create record |
| HEAD | `/earthquakes/stats` | 🔐 User | Stats metadata |
| GET | `/earthquakes/stats` | 🔐 User | Aggregated statistics |
| HEAD | `/earthquakes/:id` | — | Existence check |
| OPTIONS | `/earthquakes/:id` | — | Allowed methods |
| GET | `/earthquakes/:id` | — | Single record |
| PATCH | `/earthquakes/:id` | 🔐 Admin | Update record |
| DELETE | `/earthquakes/:id` | 🔐 Admin | Delete record |

#### Query Parameters for GET /earthquakes

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `page` | int | `1` | Page number |
| `limit` | int | `20` | Results per page (max 100) |
| `sort` | string | `mag` | Sort field |
| `order` | string | `desc` | Sort direction |
| `search` | string | `japan` | Keyword search on place |
| `minMag` | float | `5.0` | Minimum magnitude |
| `maxMag` | float | `9.0` | Maximum magnitude |
| `minDepth` | float | `0` | Minimum depth (km) |
| `maxDepth` | float | `700` | Maximum depth (km) |
| `status` | string | `reviewed` | Earthquake status |
| `country` | string | `Japan` | Filter by country |

### Users — `/users`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/users/me` | 🔐 User | Own profile |
| DELETE | `/users/me` | 🔐 User | Deactivate own account |
| GET | `/users` | 🔐 Admin | All users |
| GET | `/users/:id` | 🔐 Admin | Single user |
| PATCH | `/users/:id` | 🔐 Admin | Update user (incl. role) |
| DELETE | `/users/:id` | 🔐 Admin | Soft-delete user |

---

## 🔐 Authentication

This API uses a **dual-token JWT strategy**:

1. **Access Token** (short-lived, 15m) — sent in JSON response body and as `jwt` cookie
2. **Refresh Token** (long-lived, 7d) — stored in MongoDB and sent as `refreshToken` cookie

### Flow

```
POST /auth/login
  → { token: "<access_token>", refreshToken: "<refresh_token>" }

# Use access token on protected routes:
Authorization: Bearer <access_token>

# When access token expires:
POST /auth/refresh  { "refreshToken": "<refresh_token>" }
  → { token: "<new_access_token>", refreshToken: "<new_refresh_token>" }

# Reuse detection: using an old refresh token → 403 + all sessions cleared
```

### Roles

| Role | Permissions |
|------|-------------|
| `user` | Read earthquakes, stats, own profile |
| `admin` | All user permissions + write earthquakes, manage users |

To promote a user to admin, use `PATCH /users/:id { "role": "admin" }` with an existing admin account.

---

## 🛡️ Rate Limiting

| Limiter | Routes | Window | Max Requests |
|---------|--------|--------|--------------|
| Global | All `/api/*` | 15 min | 100 |
| Auth | `/auth/login`, `/auth/register`, `/auth/forgot-password` | 15 min | 20 |
| Analytics | `/earthquakes/stats`, `/jwt/private-*` | 10 min | 30 |
| Search | `GET /earthquakes` | 10 min | 60 |
| Admin | `POST/PATCH/DELETE /earthquakes`, `PATCH/DELETE /users/:id` | 10 min | 50 |

---

## 🔒 Security

- **Helmet** — Sets 11 secure HTTP headers (XSS protection, HSTS, CSP, etc.)
- **CORS** — Configured origin allowlist with explicit method and header allowances
- **bcrypt** — Passwords hashed with cost factor 12
- **Password change invalidation** — `passwordChangedAt` timestamp checked on every protected request
- **Refresh token rotation** — Old tokens replaced on each refresh; reuse triggers full session purge
- **Soft deletes** — Users are deactivated (not deleted) to preserve audit trail
- **JSON body limit** — 10kb cap prevents large-payload DoS
- **`select: false`** — Password and active fields excluded from default queries

---

## 📬 Postman Collection

Import `postman_collection.json` from the project root into Postman.

**Quick start:**
1. Import the collection
2. Run **POST /auth/register** — access + refresh tokens auto-saved to collection variables
3. All subsequent requests use `{{access_token}}` automatically
4. Run **POST /auth/refresh** to rotate tokens when needed

**To test admin routes:**
1. Register a user
2. Use a MongoDB client or the admin PATCH route to set `role: "admin"`
3. Re-login and use the new token on admin-only endpoints

---

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong, random `JWT_SECRET` (min 32 chars)
- [ ] Use a separate strong `JWT_REFRESH_SECRET`
- [ ] Set `CORS_ORIGIN` to your actual frontend domain
- [ ] Use MongoDB Atlas or a managed database with SSL
- [ ] Place API behind a reverse proxy (nginx/Caddy) for TLS termination
- [ ] Enable `HTTPS` — secure cookies require it in production
- [ ] Pipe `src/logs/access.log` to a log aggregator (Datadog, Loki, CloudWatch)
- [ ] Consider Redis for distributed rate limiting at scale

### Environment

```bash
NODE_ENV=production node src/app.js
# or via PM2:
pm2 start src/app.js --name earthquake-api
```

---

## 📄 License

MIT © Kshitij Pandey
