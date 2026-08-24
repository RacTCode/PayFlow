# PayFlow — Merchant Payment Dashboard

A production-minded merchant dashboard built for the Full Stack Developer technical assignment. PayFlow lets a merchant authenticate, monitor payment activity, create simulated QR payment requests, and track transactions from creation through completion.

> This is an evaluation/demo project. No real payment provider is integrated — all QR payments are simulated end-to-end, as specified in the assignment.

**Live demo:** `[To be added]`
**Demo video / screenshots (Google Drive):** `[To be added]`

---

## Table of Contents

- [Project Overview](#project-overview)
- [Assignment Requirements vs. Implementation](#assignment-requirements-vs-implementation)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database & Schema Design](#database--schema-design)
- [Authentication & Authorization](#authentication--authorization)
- [API Documentation](#api-documentation)
- [Transaction Management](#transaction-management)
- [QR Payment Simulation](#qr-payment-simulation)
- [Search, Filtering & Pagination](#search-filtering--pagination)
- [Validation & Error Handling](#validation--error-handling)
- [Security Considerations](#security-considerations)
- [Rate Limiting](#rate-limiting)
- [Environment Variables](#environment-variables)
- [Local Setup & Installation](#local-setup--installation)
- [Prisma & Database Setup](#prisma--database-setup)
- [Development & Production Commands](#development--production-commands)
- [Deployment](#deployment)
- [Screenshots / Demo](#screenshots--demo)
- [Key Technical Decisions](#key-technical-decisions)
- [Known Limitations](#known-limitations)
- [What I'd Improve With More Time](#what-id-improve-with-more-time)

---

## Project Overview

PayFlow is a two-app monorepo:

- **`server/`** — a Node.js/Express + TypeScript REST API backed by MySQL (via Prisma ORM), handling authentication, merchant/user data, transactions, and dashboard aggregates.
- **`client/`** — a Next.js (App Router) + TypeScript frontend providing login/registration, a merchant dashboard, a searchable/filterable transaction list, a transaction detail view with a live QR code, and a simulated payment-status flow.

A merchant can register, log in, create a QR payment request for a given amount, view the generated QR code and unique transaction ID, and then simulate the outcome of that payment (mark it **Successful** or **Failed**), with the dashboard and transaction list reflecting the change immediately.

---

## Assignment Requirements vs. Implementation

| Area | Requirement | Status | Notes |
|---|---|---|---|
| **Frontend** | Responsive login page | ✅ Implemented | `client/src/app/(auth)/login` |
| | Merchant dashboard | ✅ Implemented | Stat cards, recent transactions |
| | Transaction list, search + status/date filter | ✅ Implemented | `client/src/app/dashboard/transactions` |
| | Transaction details view | ✅ Implemented | Includes live QR render |
| | Loading / empty / error states | ✅ Implemented | Present across dashboard, list, detail views |
| | Clean, professional fintech UI | ✅ Implemented | Tailwind CSS design system |
| **Backend & API** | REST API for auth, merchants, transactions | ✅ Implemented | `/api/auth`, `/api/users`, `/api/transactions`, `/api/dashboard` |
| | Server-side validation, consistent error responses | ✅ Implemented | Zod schemas + centralized error middleware |
| | Authentication, protected routes | ✅ Implemented | JWT in httpOnly cookie |
| | Transaction creation endpoint | ✅ Implemented | `POST /api/transactions` |
| **Database** | Merchant/User + Transaction models | ✅ Implemented | Prisma schema, MySQL |
| | Relationships, indexes, constraints | ✅ Implemented | See [Database & Schema Design](#database--schema-design) |
| **QR Payment Simulation** | Unique transaction ID | ✅ Implemented | `TXN-<timestamp>-<random>` |
| | QR payload generation/display | ✅ Implemented | Rendered client-side via `qrcode.react` |
| | Initial status `Pending` | ✅ Implemented | Schema default |
| | Simulate Successful/Failed | ✅ Implemented | Restricted to pending → terminal transition |
| | Reflected in dashboard | ✅ Implemented | React Query cache invalidation |
| **Security** | No hardcoded secrets | ✅ Implemented | `.env`-driven, validated at boot |
| | Secure password handling | ✅ Implemented | bcrypt, cost factor 12 |
| | Protected API routes | ✅ Implemented | `requireAuth` middleware |
| | Server-side input validation | ✅ Implemented | Zod on every mutating route |
| | No sensitive data in responses | ✅ Implemented | `passwordHash` never selected/returned |

Everything required by the assignment brief is implemented. A small number of things are scaffolded but not fully wired up, or intentionally out of scope for a focused submission — these are called out explicitly in [Known Limitations](#known-limitations) rather than glossed over.

---

## Technology Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | **Next.js 16 (App Router) + React 19** | File-based routing, route groups (`(auth)`), and layouts made it straightforward to separate public, auth, and protected dashboard areas. Also the framework I'm most productive in for a UI-heavy assignment like this. |
| Styling | **Tailwind CSS v4** | Fast to build a consistent, professional fintech-style UI without maintaining a separate CSS architecture; utility classes keep components self-contained. |
| Data fetching | **TanStack Query (React Query)** | Handles caching, background refetching, loading/error states, and cache invalidation (e.g. refresh the dashboard immediately after a transaction is created or its status changes) with far less boilerplate than manual `useEffect` fetching. |
| HTTP client | **Axios** | Simple interceptor-friendly client with `withCredentials` for cookie-based auth. |
| QR rendering | **qrcode.react** | Renders the QR payload as an actual scannable-looking QR code client-side, no external QR service/API call needed. |
| Forms/validation (client) | **react-hook-form + zod** | Lightweight controlled forms with schema validation mirroring the backend. |
| Backend framework | **Express 5 + TypeScript** | Minimal, well-understood, easy to structure into clear modules (routes/controllers/services/schemas) for a reviewer to follow quickly. |
| ORM | **Prisma** | Type-safe queries, migration history as SQL, and a schema file that doubles as living documentation of the data model. |
| Database | **MySQL (MariaDB-compatible), via `@prisma/adapter-mariadb`** | Relational integrity (foreign key, unique constraints) fits a transactional payments domain better than a schemaless store; MySQL/MariaDB is widely available and easy to provision. |
| Validation (server) | **Zod** | Single source of truth for input shape + human-readable error messages, shared "shape" of validation logic with the client. |
| Auth | **JWT (jsonwebtoken) in an httpOnly cookie + bcryptjs** | Stateless auth appropriate for a small service; httpOnly cookie avoids exposing the token to client-side JS (mitigates XSS token theft) more than `localStorage` would. |
| Rate limiting | **express-rate-limit** | Cheap, in-process protection against brute-force login/registration attempts and general API abuse. |
| Toasts / feedback | **sonner** | Lightweight toast notifications for success/error feedback on mutations (create payment, update status). |

---

## Architecture

```mermaid
flowchart LR
    subgraph Client["Client — Next.js (React 19)"]
        UI["Pages & Components"]
        RQ["TanStack Query cache"]
        AX["Axios client (withCredentials)"]
    end

    subgraph Server["Server — Express + TypeScript"]
        MW["Middleware<br/>(rate limit → auth → validate)"]
        RT["Routes"]
        CT["Controllers"]
        SV["Services"]
    end

    subgraph Data["Data Layer"]
        PR["Prisma Client"]
        DB[("MySQL / MariaDB")]
    end

    UI --> RQ --> AX
    AX <-- "HTTP + httpOnly JWT cookie" --> MW
    MW --> RT --> CT --> SV --> PR --> DB
```

The API is organized by **module** (`auth`, `users`, `transactions`, `dashboard`), each following the same route → controller → service → schema pattern, so the request lifecycle is consistent and easy to trace end to end.

---

## Frontend Architecture

```
client/src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx                 # wraps children in AuthGuard + DashboardShell
│   │   ├── page.tsx                   # overview / stats
│   │   ├── payments/create/page.tsx   # create QR payment request
│   │   └── transactions/
│   │       ├── page.tsx               # list, search, filters, pagination
│   │       └── [transactionId]/page.tsx  # detail view + QR + simulate status
│   ├── layout.tsx                     # root layout, QueryProvider, Toaster
│   └── page.tsx                       # marketing/landing page
├── components/
│   ├── auth/          # AuthGuard (redirects unauthenticated users), AuthLayout
│   ├── layout/         # Sidebar, DashboardHeader, DashboardShell
│   ├── dashboard/       # RecentTransactions
│   ├── payments/        # CreatePaymentForm
│   └── providers/        # QueryProvider (TanStack Query client)
├── features/
│   ├── auth/            # auth.api.ts, auth.hooks.ts, auth.types.ts
│   ├── transactions/     # transactions.api.ts, transactions.hooks.ts
│   └── dashboard/         # dashboard.api.ts, dashboard.hooks.ts
├── lib/
│   ├── api.ts             # Axios instance (baseURL, withCredentials)
│   └── api-error.ts        # normalizes API error responses for the UI
└── types/api.ts             # shared API response / entity types
```

**Key patterns:**

- **Feature-based data layer** (`features/*`) — each domain (auth, transactions, dashboard) has its own `*.api.ts` (raw HTTP calls) and `*.hooks.ts` (React Query hooks). Components never call Axios directly.
- **Route protection** — `AuthGuard` wraps the entire `/dashboard` route group in `dashboard/layout.tsx`. It calls `/api/users/me`; on failure it redirects to `/login`, so no dashboard page needs to duplicate auth-check logic.
- **Optimistic-feeling updates via cache invalidation** — creating a transaction or updating its status invalidates the `transactions` and `dashboard-stats` query keys, so the dashboard and list reflect changes without a full page reload.
- **Consistent UI states** — every data-driven view (`dashboard/page.tsx`, `transactions/page.tsx`, `RecentTransactions`, transaction detail) explicitly renders skeleton/loading, error-with-retry, and empty states rather than relying on a blank screen.

---

## Backend Architecture

```
server/src/
├── app.ts                     # Express app: CORS, cookies, rate limiter, route mounting, error handler
├── server.ts                  # boots Prisma connection + HTTP server
├── config/
│   ├── env.ts                  # Zod-validated environment variables
│   └── database.ts              # Prisma client (MariaDB adapter)
├── middleware/
│   ├── auth.middleware.ts        # requireAuth, requireRole
│   ├── validate.middleware.ts     # validateBody / validateQuery (Zod)
│   ├── rate-limit.middleware.ts    # globalRateLimiter, authRateLimiter
│   └── error.middleware.ts          # centralized error → JSON response mapping
├── modules/
│   ├── auth/          # register, login, logout
│   ├── users/          # get/update current user
│   ├── transactions/    # create, list, get, update status
│   └── dashboard/         # aggregate stats
├── utils/
│   ├── app-error.ts          # typed AppError(message, statusCode, code)
│   ├── async-handler.ts       # wraps async route handlers → forwards to error middleware
│   ├── jwt.ts                  # sign/verify access tokens
│   └── transaction-id.ts        # unique transaction ID generator
└── types/express.d.ts            # augments Express Request with `user`
```

**Request lifecycle for a protected, validated route** (e.g. `POST /api/transactions`):

```mermaid
sequenceDiagram
    participant C as Client
    participant RL as Rate Limiter
    participant A as requireAuth
    participant V as validateBody (Zod)
    participant Ctrl as Controller
    participant Svc as Service
    participant DB as Prisma / MySQL

    C->>RL: POST /api/transactions
    RL-->>C: 429 if over limit
    RL->>A: pass through
    A->>A: verify JWT from httpOnly cookie
    A-->>C: 401 if missing/invalid
    A->>V: attach req.user
    V->>V: parse & validate req.body
    V-->>C: 400 VALIDATION_ERROR if invalid
    V->>Ctrl: validated body
    Ctrl->>Svc: createTransaction(merchantId, body)
    Svc->>DB: INSERT transaction (status = PENDING)
    DB-->>Svc: created row
    Svc-->>Ctrl: transaction
    Ctrl-->>C: 201 { success, data: { transaction } }
```

Every module follows: **routes** (wiring + middleware order) → **controller** (HTTP-shape only, no business logic) → **service** (business logic, Prisma calls) → **schema** (Zod validation + inferred TS types). This keeps each file small and single-purpose, which makes the codebase easy to navigate for a reviewer.

---

## Database & Schema Design

```mermaid
erDiagram
    USERS ||--o{ TRANSACTION : "creates"
    USERS {
        string id PK
        string name
        string email UK
        string passwordHash
        enum role "ADMIN | MERCHANT"
        datetime createdAt
        datetime updatedAt
    }
    TRANSACTION {
        string id PK
        string transactionId UK
        string merchantId FK
        decimal amount
        string currency
        enum status "PENDING | SUCCESSFUL | FAILED"
        enum paymentMethod "QR"
        string customerReference
        string qrPayload
        datetime createdAt
        datetime updatedAt
    }
```

**Design notes:**

- **`users`** — stores merchant (and optionally admin) accounts. `email` is unique. `role` defaults to `MERCHANT`; registration always creates a `MERCHANT`. `passwordHash` is never returned in any API response.
- **`transaction`** — `id` is the internal primary key (CUID); `transactionId` is the **public, human-facing unique identifier** (e.g. `TXN-M8F2K1-A9C3D4E1`) used in URLs and the QR payload, kept deliberately separate from the internal PK.
- **Relationship** — a `transaction` belongs to one `user` (merchant) via `merchantId`. The foreign key with `ON DELETE CASCADE` is enforced at the database level (see the migration SQL).
- **Indexes**: `merchantId` (fast per-merchant lookups), `merchantId + createdAt` (fast recent/paginated listing), `merchantId + status` (fast dashboard aggregate counts). `transactionId` and `email` both have unique indexes.
- **Money handling**: `amount` is `Decimal(12,2)` — not a float — to avoid floating-point rounding issues in a payments context.
- **Status as enum**: `PENDING | SUCCESSFUL | FAILED` is enforced at the database level via a MySQL `ENUM`, not just application logic.

---

## Authentication & Authorization

- **Registration** (`POST /api/auth/register`) — validates input, checks email uniqueness, hashes the password with `bcrypt` (cost factor **12**), creates a `MERCHANT` user, signs a JWT, and sets it as an **httpOnly** cookie.
- **Login** (`POST /api/auth/login`) — verifies credentials with `bcrypt.compare`, returns a generic `"Invalid email or password"` error on either a missing user or a wrong password (avoids leaking which one was wrong), and sets the same cookie.
- **Session cookie**: `access_token`, `httpOnly: true`, `sameSite: "lax"`, `secure: true` in production, 24h `maxAge` on the cookie (the JWT itself is valid for `JWT_EXPIRES_IN`, default 3 days — see [Known Limitations](#known-limitations) on why these aren't currently aligned).
- **`requireAuth` middleware** — reads the cookie, verifies the JWT, and attaches `{ id, role }` to `req.user`. Missing/invalid/expired tokens return `401 UNAUTHORIZED`. All transaction, dashboard, and user routes are mounted behind this middleware.
- **`requireRole` middleware** — exists and supports role-gating (`ADMIN` vs `MERCHANT`), but **no route currently uses it** — every authenticated user today has identical access to their own data. See [Known Limitations](#known-limitations).
- **Logout** — clears the cookie server-side. The underlying JWT is not blacklisted (stateless JWTs can't be revoked without an extra store — see limitations).
- **Data isolation** — every transaction query is scoped by `merchantId = req.user.id`, so one merchant can never read or modify another merchant's transactions, even if they guess a transaction ID.

---

## API Documentation

All responses share a consistent envelope:

```json
// success
{ "success": true, "data": { ... } }

// error
{ "success": false, "error": { "code": "SOME_CODE", "message": "Human readable message" } }
```

Base URL: `http://localhost:5000/api` (configurable via `PORT`).

### Auth — `/api/auth`

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/auth/register` | ❌ | `{ name, email, password }` | Creates a merchant account, sets session cookie |
| POST | `/auth/login` | ❌ | `{ email, password }` | Authenticates, sets session cookie |
| POST | `/auth/logout` | ✅ | — | Clears session cookie |

### Users — `/api/users`

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| GET | `/users/me` | ✅ | — | Returns the current authenticated user |
| PATCH | `/users/me` | ✅ | `{ name?, email? }` | Updates the current user's profile |

### Transactions — `/api/transactions`

| Method | Endpoint | Auth | Query / Body | Description |
|---|---|---|---|---|
| GET | `/transactions` | ✅ | `?search=&status=&from=&to=&page=&limit=` | Paginated, filtered list scoped to the current merchant |
| POST | `/transactions` | ✅ | `{ amount, currency?, paymentMethod?, customerReference? }` | Creates a `PENDING` QR payment request |
| GET | `/transactions/:transactionId` | ✅ | — | Fetch a single transaction (must belong to the current merchant) |
| PATCH | `/transactions/:transactionId/status` | ✅ | `{ status: "SUCCESSFUL" \| "FAILED" }` | Simulates a payment outcome; only allowed while `PENDING` |

### Dashboard — `/api/dashboard`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | ✅ | Returns `{ totalTransactions, successfulTransactions, pendingTransactions, failedTransactions, totalVolume }` for the current merchant |

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | ❌ | Basic liveness check |

**Example — create a transaction:**

```http
POST /api/transactions
Cookie: access_token=<jwt>
Content-Type: application/json

{
  "amount": 500,
  "customerReference": "ORD-1009"
}
```

```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "clx...",
      "transactionId": "TXN-M8F2K1-A9C3D4E1",
      "merchantId": "clx...",
      "amount": "500.00",
      "currency": "INR",
      "status": "PENDING",
      "paymentMethod": "QR",
      "customerReference": "ORD-1009",
      "qrPayload": "payflow://payment?transactionId=TXN-M8F2K1-A9C3D4E1",
      "createdAt": "2026-08-24T10:00:00.000Z",
      "updatedAt": "2026-08-24T10:00:00.000Z"
    }
  }
}
```

---

## Transaction Management

- Every transaction is created against the authenticated merchant (`merchantId` is taken from the JWT, never from the client-supplied body).
- Listing supports free-text search (matches `transactionId` or `customerReference`), status filtering, a date range (`from`/`to`, inclusive, normalized to start/end of day), and pagination (`page`, `limit`, capped at 100 per page).
- A status transition is only allowed **from `PENDING`** — attempting to update an already-`SUCCESSFUL` or `FAILED` transaction returns `409 TRANSACTION_ALREADY_COMPLETED`, preventing accidental double-updates.
- Currency defaults to `INR` and is validated server-side as a 3-letter code, though the UI currently only exposes INR when creating a payment (see [Known Limitations](#known-limitations)).

---

## QR Payment Simulation

```mermaid
sequenceDiagram
    participant M as Merchant (Client)
    participant API as PayFlow API
    participant DB as Database

    M->>API: POST /transactions { amount, customerReference }
    API->>API: generate unique transactionId
    API->>API: build qrPayload = payflow://payment?transactionId=...
    API->>DB: insert transaction (status = PENDING)
    DB-->>API: transaction row
    API-->>M: 201 { transaction }
    M->>M: render QR code from qrPayload (qrcode.react)

    Note over M: Merchant clicks "Mark successful" or "Mark failed"

    M->>API: PATCH /transactions/:id/status { status }
    API->>DB: verify status is PENDING
    API->>DB: update status = SUCCESSFUL | FAILED
    DB-->>API: updated row
    API-->>M: 200 { transaction }
    M->>M: invalidate transactions + dashboard-stats cache
```

- The QR payload is a simple custom URI scheme (`payflow://payment?transactionId=...`) — enough to demonstrate a scannable QR representing a payment request, without pretending to integrate a real payment network.
- No real bank, card network, or payment provider is contacted at any point — the "simulation" buttons on the transaction detail page directly set the final status via the API, standing in for what would otherwise be a webhook from a payment processor.

---

## Search, Filtering & Pagination

- **Search** — `search` query param matches against `transactionId` and `customerReference` (case-sensitive `contains`, MySQL collation-dependent).
- **Status filter** — `status` restricts to one of `PENDING | SUCCESSFUL | FAILED`.
- **Date range filter** — `from` / `to` (ISO date strings), normalized server-side to the start and end of the respective day so a single-day range behaves intuitively.
- **Pagination** — `page` (default 1) and `limit` (default 20, max 100), returned alongside `total` and `totalPages` so the client can render page controls without a second request.
- All filtering happens in a single Prisma `where` clause combined with `prisma.$transaction([findMany, count])` so the page of results and the total count are computed consistently in one round trip.

---

## Validation & Error Handling

- **Every** mutating endpoint (register, login, update user, create transaction, update transaction status) validates its input with a **Zod** schema before any business logic runs.
- Query parameters for listing transactions are validated and coerced (`page`/`limit` to numbers, `from`/`to` to dates) via the same `validateQuery` middleware pattern.
- A single **centralized error middleware** maps three cases to consistent JSON:
  - `ZodError` → `400` with a `VALIDATION_ERROR` code and a `details` array of `{ field, message }`.
  - `AppError` (thrown deliberately, e.g. "email already exists", "transaction not found") → its own `statusCode` and `code`.
  - Anything else (unexpected/programmer errors) → `500 INTERNAL_SERVER_ERROR`, logged server-side but **not** leaked to the client in detail.
- Route handlers are wrapped in `asyncHandler`, so any thrown/rejected error inside an `async` controller is automatically forwarded to the error middleware instead of crashing the process or hanging the request.

---

## Security Considerations

**Implemented:**
- Passwords hashed with `bcrypt` (cost factor 12), never stored or returned in plaintext.
- JWT stored in an **httpOnly** cookie (not accessible to client-side JavaScript, reducing XSS-based token theft) with `sameSite: "lax"` and `secure` in production.
- All environment-derived secrets/config validated at process startup via a Zod schema (`env.ts`) — the app refuses to boot with a missing/malformed `DATABASE_URL` or a `JWT_SECRET` under 32 characters, rather than silently running insecurely.
- No secrets committed to source control — `.env` is gitignored; `.env.example` only contains placeholders.
- `passwordHash` is explicitly excluded via Prisma `select` in every user-facing response.
- Every transaction/user query is scoped to the authenticated user's own `id`/`merchantId` — no cross-merchant data leakage.
- CORS is restricted to a single configured `CLIENT_URL` with `credentials: true`, rather than a wildcard origin.
- Rate limiting on all routes, with a stricter limit specifically on auth endpoints (see below).

**Not implemented (see [Known Limitations](#known-limitations) for the full reasoning):**
- No explicit CSRF token — relies on `SameSite=Lax` cookies as the primary mitigation.
- No JWT revocation/blacklist — a stolen token remains valid until it naturally expires, even after "logout."
- No RBAC enforcement — the `requireRole` middleware exists but isn't attached to any route yet.

---

## Rate Limiting

Implemented with `express-rate-limit`, applied globally in `app.ts` before routes are mounted:

| Limiter | Scope | Limit | Window |
|---|---|---|---|
| `globalRateLimiter` | All `/api/*` routes | 300 requests | per 1 minute (per IP) |
| `authRateLimiter` | `/api/auth/register`, `/api/auth/login` | 30 requests | per 1 minute (per IP) |

Both return a consistent `{ success: false, error: { code, message } }` body on `429`, matching the rest of the API's error shape.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Example | Description |
|---|---|---|---|
| `PORT` | No (default `5000`) | `5000` | Port the API listens on |
| `CLIENT_URL` | No (default `http://localhost:3000`) | `http://localhost:3000` | Allowed CORS origin |
| `DATABASE_URL` | **Yes** | `mysql://user:pass@localhost:3306/PayFlow` | MySQL/MariaDB connection string |
| `JWT_SECRET` | **Yes** (min 32 chars) | a long random string | Secret used to sign/verify JWTs |
| `JWT_EXPIRES_IN` | No (default `3d`) | `3d` | JWT expiry (jsonwebtoken format) |

Copy the provided example and fill in real values:

```bash
cp server/.env.example server/.env
```

### Client (`client/.env.local`)

| Variable | Required | Example | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | `http://localhost:5000/api` | Base URL the frontend calls |

> Note: the repository does not currently include a `client/.env.example` file — create `client/.env.local` manually using the variable above before running the frontend.

---

## Local Setup & Installation

**Prerequisites:** Node.js 20+, npm, and a running MySQL/MariaDB instance.

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd PayFlow

# 2. Install server dependencies
cd server
npm install
cp .env.example .env
# → edit .env with your DATABASE_URL and a strong JWT_SECRET

# 3. Set up the database (see next section for details)
npx prisma migrate deploy
npx prisma generate
npm run db:seed   # optional: creates a demo merchant + sample transactions

# 4. Start the API
npm run dev
# API running at http://localhost:5000

# 5. In a new terminal, install client dependencies
cd ../client
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# 6. Start the frontend
npm run dev
# App running at http://localhost:3000
```

If you ran the seed script, you can log in with:

```
Email:    merchant@example.com
Password: Password123!
```

---

## Prisma & Database Setup

- Schema lives at `server/prisma/schema.prisma`, using the `mysql` provider through `@prisma/adapter-mariadb`.
- Migration history lives at `server/prisma/migrations/` — the initial migration creates the `users` and `Transaction` tables, all indexes, and the foreign key constraint.
- The generated Prisma client outputs to `server/src/generated/prisma` (gitignored — regenerate it locally rather than committing it).

```bash
cd server

# apply existing migrations to your database (use this for a fresh checkout)
npx prisma migrate deploy

# regenerate the Prisma client after cloning or after any schema change
npx prisma generate

# create a new migration after editing schema.prisma (development only)
npx prisma migrate dev --name <description>

# inspect data visually
npx prisma studio

# seed demo data (1 merchant, 1 admin, 8 sample transactions)
npm run db:seed
```

> `prisma.config.ts` wires the seed command (`tsx prisma/seed.ts`) into `prisma migrate dev`, so seeding also runs automatically the first time you run a dev migration on a fresh database.

---

## Development & Production Commands

### Server

| Command | Description |
|---|---|
| `npm run dev` | Runs the API with `tsx watch` (hot reload) |
| `npm run build` | Compiles TypeScript to `dist/` |
| `npm start` | Runs the compiled `dist/server.js` (production) |

### Client

| Command | Description |
|---|---|
| `npm run dev` | Runs Next.js in development mode |
| `npm run build` | Production build |
| `npm start` | Serves the production build |
| `npm run lint` | Runs ESLint |

---

## Deployment

No deployment configuration (Dockerfile, `vercel.json`, CI/CD pipeline, etc.) is currently included in the repository. To deploy:

- **Client** — deploys cleanly to Vercel (it's a standard Next.js App Router project); set `NEXT_PUBLIC_API_URL` to the deployed API's URL as an environment variable.
- **Server** — deploys to any Node-hosting platform (Railway, Render, Fly.io, a VPS, etc.); set `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, and `JWT_EXPIRES_IN` as environment variables, and provision a MySQL/MariaDB instance (e.g. PlanetScale, Railway MySQL, or a managed RDS instance).
- Remember to set `CLIENT_URL` on the server to the deployed frontend's origin (for CORS) and `NEXT_PUBLIC_API_URL` on the client to the deployed API's origin.

`[Add your deployed live demo link here once available]`

---

## Screenshots / Demo

`[Add screenshots of: landing page, login/register, dashboard overview, transaction list with filters applied, transaction detail with QR code, and the "mark successful/failed" simulation in action]`

`[Add your demo video Google Drive link here]`

---

## Key Technical Decisions

- **httpOnly cookie over `localStorage` for the JWT** — trades a small amount of client-side flexibility (no reading the token in JS) for meaningfully better protection against XSS-based token theft, which felt like the right default for anything payments-adjacent.
- **Separate `id` (internal CUID) vs. `transactionId` (public identifier)** — keeps the primary key opaque and internal while giving the product a clean, shareable, human-readable reference (`TXN-...`) for URLs and the QR payload, similar to how real payment processors separate internal and public identifiers.
- **Restricting status transitions to `PENDING → SUCCESSFUL/FAILED` only** — models the real-world constraint that a completed payment shouldn't be silently flipped, and surfaces a clear `409` rather than allowing accidental overwrites.
- **Module-per-resource backend structure** (routes/controller/service/schema) — chosen over a single "everything in one file" approach or a heavier framework (e.g. NestJS) to keep the codebase easy to scan for a reviewer while still demonstrating separation of concerns.
- **Decimal type for money** — avoids the classic floating-point rounding trap; `amount` is stored and computed as `Decimal(12,2)`, not `Float`/`Number`, at the database layer.
- **Feature-based frontend data layer** (`features/*`) — keeps API calls, React Query hooks, and types colocated per domain rather than scattered across components, so the data-fetching logic is reusable and easy to find.

---

## Known Limitations

Being upfront about what isn't done, rather than implying more than what's implemented:

1. **The `Transaction.merchantId → users.id` relationship is not declared as a Prisma `@relation`** — it's enforced at the database level via the raw migration SQL (with `ON DELETE CASCADE`), but `schema.prisma` doesn't model it as a relation field. This means Prisma's relational helpers (e.g. `include`) aren't available for this relationship; all merchant-scoping is done via explicit `where: { merchantId }` filters, which works correctly but isn't as ergonomic as a fully modeled relation.
2. **No CSRF protection beyond `SameSite=Lax`** — there's no explicit CSRF token mechanism. `SameSite=Lax` mitigates the most common cross-site request forgery vectors for this app's request patterns, but it isn't a complete substitute for a dedicated CSRF defense.
3. **No JWT revocation** — "logout" only clears the cookie client/server-side; if a token were somehow exfiltrated, it stays valid until its natural expiry (`JWT_EXPIRES_IN`, default 3 days). There's no server-side session store or token blacklist.
4. **`requireRole` (RBAC) is scaffolded but unused** — the `ADMIN`/`MERCHANT` role exists on the `User` model and the middleware to enforce it exists, but no route currently differentiates behavior by role.
5. **No automated tests** — no unit or integration tests are included for either the API or the frontend.
6. **No deployment/CI configuration** — no Dockerfile, IaC, or CI/CD pipeline is included; deployment is manual (see [Deployment](#deployment)).
7. **Currency is effectively INR-only in the UI** — the backend validates any 3-letter currency code, but the "create payment" form and all currency formatting in the client are hardcoded to `INR`.
8. **No `client/.env.example`** — the required `NEXT_PUBLIC_API_URL` variable is documented here in the README, but there's no example file in the client directory itself.
9. **Search is a simple `contains` match** — there's no full-text search, fuzzy matching, or search relevance ranking; it's a straightforward substring match against `transactionId` and `customerReference`.

---

## What I'd Improve With More Time

- Model the merchant–transaction relationship as a proper Prisma `@relation` and take advantage of relational includes/queries.
- Add a real CSRF token flow (double-submit cookie or synchronizer token) on top of the existing `SameSite` protection.
- Introduce refresh tokens with a short-lived access token and a revocable server-side session/refresh record, so logout actually invalidates the session rather than just clearing a cookie.
- Wire up `requireRole` so an `ADMIN` account can view aggregate data across merchants, while `MERCHANT` accounts remain scoped to their own data.
- Add unit tests for the service layer (auth, transaction status transitions) and integration tests for the API routes, plus component/e2e tests for the critical create-payment → simulate-status flow.
- Add a Dockerfile + `docker-compose.yml` (API + MySQL) for one-command local setup, and a basic CI pipeline (lint, type-check, test) on pull requests.
- Support multi-currency properly in the UI (currency selector on the create-payment form, locale-aware formatting per transaction's actual currency rather than assuming INR).
- Add webhook-style "async" simulation — e.g. auto-resolve a pending transaction to Successful/Failed after a randomized delay, to more closely mimic how a real payment provider callback would behave, in addition to the current manual simulate buttons.
- Expand transaction search with proper indexed full-text search if the transaction volume were to grow significantly.