# PayFlow — Merchant Payment Dashboard

A production-minded merchant dashboard with authentication, transaction management, and a simulated QR payment flow — built as a Full Stack Developer technical assignment.

**Live demo:** [pay-flow-c65bxeyee-ractcodes-projects.vercel.app](https://pay-flow-c65bxeyee-ractcodes-projects.vercel.app/)  
**API:** [payflow-server-ekec.onrender.com](https://payflow-server-ekec.onrender.com/)  
**Demo Video/ Screenshots:** [Google Drive](https://drive.google.com/drive/folders/1oy0nEAxcJNtZkMMk0W8S5gN7KfRx2-lI)  
**Database:** Aiven MySQL

> ⚠️ The API is hosted on Render's free tier, which spins down after inactivity. The first request after a period of idleness can take 30–60 seconds to wake the server back up.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Assignment Requirements & Implementation Status](#assignment-requirements--implementation-status)
- [Technology Stack & Reasoning](#technology-stack--reasoning)
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
- [Prisma / Database Setup & Migrations](#prisma--database-setup--migrations)
- [Development & Production Commands](#development--production-commands)
- [Deployment](#deployment)
- [Screenshots / Demo](#screenshots--demo)
- [Key Technical Decisions](#key-technical-decisions)
- [Known Limitations](#known-limitations)
- [What I'd Improve With More Time](#what-id-improve-with-more-time)

---

## Project Overview

PayFlow is a small fintech-style dashboard that lets a merchant sign up, log in, create simulated QR payment requests, and track their status from **Pending** through to **Successful** or **Failed**. It's built as two independent applications — a Next.js frontend and an Express/TypeScript API — talking over a REST interface, backed by a relational (MySQL) database via Prisma.

No real payment provider is involved anywhere in the flow; every payment outcome is a manual simulation, as specified in the assignment brief.

---

## Assignment Requirements & Implementation Status

The table below maps every requirement in the assignment PDF to what's actually in this repository. Nothing here is aspirational — if something isn't implemented, it's marked as such rather than glossed over.

| Requirement (from PDF) | Status | Notes |
|---|---|---|
| Responsive login page & merchant dashboard | ✅ Done | Tailwind-based responsive layouts across all pages |
| Transaction list with search + status/date filtering | ✅ Done | Search by transaction ID / customer reference, status dropdown, from/to date range |
| Transaction details view | ✅ Done | Full payment detail page with QR code |
| Loading, empty, and error states | ✅ Done | Skeleton loaders, "no transactions found" empty state, retryable error states |
| Clean, professional fintech UI | ✅ Done | Consistent design system, desktop tables + mobile card views |
| REST API for auth, merchants, transactions | ✅ Done | `/api/auth`, `/api/users`, `/api/transactions`, `/api/dashboard` |
| Server-side input validation + consistent error responses | ✅ Done | Zod schemas on every mutating/query endpoint, uniform error envelope |
| Authentication with protected API routes | ✅ Done | JWT in an httpOnly cookie, `requireAuth` middleware |
| Transaction creation endpoint | ✅ Done | `POST /api/transactions` |
| Models/tables for Merchant/User and Transaction | ✅ Done | Prisma models, see [Database & Schema Design](#database--schema-design) |
| Relationships, indexes, constraints | ✅ Done | `Transaction.merchantId` has a database-level foreign key relationship with `User.id`; indexes and unique constraints are also defined |
| Create payment request with unique transaction ID | ✅ Done | `TXN-<timestamp>-<random>` format |
| Generate/display QR payload | ✅ Done | Real scannable QR rendered client-side from a `payflow://payment?...` payload |
| Initial status = Pending | ✅ Done | |
| Simulate Successful / Failed | ✅ Done | One-way transition, only available while `PENDING` |
| Reflect updated status in dashboard | ✅ Done | React Query cache invalidation refreshes both the list and dashboard stats |
| No hardcoded secrets | ✅ Done | `.env.example` provided; the only inline secret is a clearly-labeled dev-only value in `docker-compose.yml` |
| Secure password handling | ✅ Done | bcrypt, cost factor 12 |
| Protected API routes | ✅ Done | |
| Server-side validation | ✅ Done | |
| No sensitive data in responses | ✅ Done | `passwordHash` is never selected into any API response |
| Modular, maintainable code | ✅ Done | Feature-module structure on both frontend and backend |

**Role-based authorization:** the backend includes a `requireRole()` middleware capable of restricting routes to `ADMIN` or `MERCHANT`, and the `User` model has a `role` field — but no route in the current API actually uses `requireRole()`. Every authenticated user is treated as a merchant scoped to their own data. The scaffolding for role-based access control exists; it isn't wired up anywhere yet.

---

## Technology Stack & Reasoning

### Frontend
| Choice | Why |
|---|---|
| **Next.js (App Router) + React 19** | File-based routing made it fast to structure `/login`, `/dashboard`, `/dashboard/transactions/[id]`, etc. without hand-rolling a router. |
| **TypeScript** | End-to-end type safety, especially valuable when the frontend and backend are separate codebases with no shared package. |
| **TanStack Query (React Query)** | Handles server-state caching, refetching, and cache invalidation (e.g. refresh the dashboard the moment a transaction is created or its status changes) without hand-written loading/error boilerplate. |
| **Axios** | Simple `withCredentials` cookie handling for the httpOnly JWT cookie, plus a central place to normalize API error shapes. |
| **Tailwind CSS v4** | Fast, consistent utility-first styling well suited to a small, focused UI. |
| **qrcode.react** | Renders a real, scannable QR code client-side from the payment payload — no external QR-generation API/dependency needed. |
| **react-hook-form + zod resolvers** | Lightweight form state and validation on the auth forms. |
| **sonner** | Toast notifications for payment creation/status simulation feedback. |

### Backend
| Choice | Why |
|---|---|
| **Node.js + Express 5** | Minimal, well-understood framework; enough structure for a clean modular REST API without the overhead of a full framework like NestJS for a project this size. |
| **TypeScript** | Shared type discipline with the frontend's data contracts (even without a shared package, keeping the shapes intentional). |
| **Zod** | Single source of truth for both runtime validation and static types (`z.infer<...>`) on every request body/query. |
| **Prisma ORM (+ MariaDB driver adapter)** | Type-safe queries, migration history, and a schema that documents the data model in one file. |
| **MySQL** | A relational database fits the assignment's structured, relationship-driven data (users owning transactions, status/date filtering, aggregation for the dashboard) better than a document store would. |
| **JWT in an httpOnly cookie** | Avoids exposing the token to client-side JavaScript (mitigates XSS token theft) while still being simple to implement without a session store. |
| **bcryptjs** | Industry-standard adaptive password hashing; cost factor 12 balances security and login latency. |
| **helmet** | Sensible default security headers with minimal configuration. |
| **express-rate-limit** | Protects both the API in general and the auth endpoints specifically from brute-force/abuse. |

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
        DB[("MySQL")]
    end

    UI --> RQ --> AX
    AX <-- "HTTP + httpOnly JWT cookie" --> MW
    MW --> RT --> CT --> SV --> PR --> DB
```

Each backend module (`auth`, `users`, `transactions`, `dashboard`) follows the same **route → controller → service** flow shown above, so the request lifecycle is consistent and easy to trace end to end regardless of which endpoint you're looking at.

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

---

## Frontend Architecture

```
client/src/
├── app/                                # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx                  # Wraps all dashboard routes in AuthGuard + shell
│   │   ├── page.tsx                    # Dashboard stats + recent transactions
│   │   ├── payments/create/page.tsx    # QR payment creation form
│   │   └── transactions/
│   │       ├── page.tsx                # List with search/filter/pagination
│   │       └── [transactionId]/page.tsx
│   ├── layout.tsx                      # Root layout (QueryProvider, Toaster)
│   └── page.tsx                        # Public marketing/landing page
├── components/
│   ├── auth/                           # AuthGuard, AuthLayout
│   ├── dashboard/                      # RecentTransactions
│   ├── layout/                         # Sidebar, DashboardHeader, DashboardShell
│   ├── payments/                       # CreatePaymentForm
│   └── providers/                      # QueryProvider (React Query client)
├── features/                           # Domain-organized API + hooks
│   ├── auth/          (auth.api.ts, auth.hooks.ts, auth.types.ts)
│   ├── dashboard/      (dashboard.api.ts, dashboard.hooks.ts)
│   └── transactions/   (transactions.api.ts, transactions.hooks.ts)
├── lib/
│   ├── api.ts                          # Axios instance (withCredentials, baseURL)
│   └── api-error.ts                    # Normalizes API error messages
└── types/api.ts                        # Shared response/entity types
```

**Pattern:** each domain (`auth`, `transactions`, `dashboard`) has its own `*.api.ts` (raw HTTP calls) and `*.hooks.ts` (React Query wrappers), kept separate from the page/component that consumes them. Pages stay declarative — they read `isPending` / `isError` / `data` off a hook and render accordingly, with skeleton loaders, retryable error panels, and empty states handled consistently across the transaction list and detail pages.

Route protection is handled by `AuthGuard`, which wraps `/dashboard/*` layouts: it fires `GET /api/users/me` and redirects to `/login` on a 401.

---

## Backend Architecture

```
server/src/
├── app.ts                    # Express app: helmet, cors, cookie-parser, rate limiting, routes
├── server.ts                 # Prisma connect + app.listen
├── config/
│   ├── env.ts                 # Zod-validated environment variables
│   └── database.ts            # Prisma client (MariaDB driver adapter)
├── middleware/
│   ├── auth.middleware.ts     # requireAuth, requireRole
│   ├── validate.middleware.ts # validateBody / validateQuery (Zod)
│   ├── rate-limit.middleware.ts
│   └── error.middleware.ts    # Centralized error → JSON response mapping
├── modules/
│   ├── auth/          (controller, routes, schema, service)
│   ├── users/          "
│   ├── transactions/   "
│   └── dashboard/      "
├── utils/
│   ├── app-error.ts           # Typed operational error class
│   ├── async-handler.ts       # Wraps async route handlers for error propagation
│   ├── jwt.ts                 # sign/verify access token
│   └── transaction-id.ts      # TXN-<timestamp>-<random> generator
└── types/express.d.ts         # Extends Express.Request with `user`
```

**Pattern:** a **route → controller → service** split per module. Routes wire up middleware (auth, validation, rate limiting) and map HTTP verbs to controller functions. Controllers extract request data and shape the HTTP response. Services own all business logic and Prisma queries. Errors are thrown as `AppError` instances with a status code and machine-readable `code`, and are caught centrally by `errorHandler` — no module needs its own try/catch/response-formatting logic.

---

## Database & Schema Design

**Database:** MySQL (via Prisma + `@prisma/adapter-mariadb`)

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
        string merchantId
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

> The `||--o{` relationship above reflects how the data is actually *used* (every transaction belongs to exactly one merchant, filtered by `merchantId` in every query) — not a constraint enforced by the database schema itself. See the note directly below.

### `User`
| Field | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `name` | `String` | |
| `email` | `String` | Unique |
| `passwordHash` | `String` | bcrypt hash, never returned in API responses |
| `role` | `UserRole` (`ADMIN` \| `MERCHANT`) | Defaults to `MERCHANT`; not currently used to gate any route (see [Known Limitations](#known-limitations)) |
| `createdAt` / `updatedAt` | `DateTime` | |

### `transaction`
| Field | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `transactionId` | `String` | Unique, human-readable ID (`TXN-...`), used in URLs and lookups |
| `merchantId` | `String` | Foreign key referencing `User.id` |
| `amount` | `Decimal(12,2)` | |
| `currency` | `String` (3 chars) | e.g. `INR` |
| `status` | `transaction_status` (`PENDING` \| `SUCCESSFUL` \| `FAILED`) | Defaults to `PENDING` |
| `paymentMethod` | `transaction_paymentMethod` (`QR`) | Enum, currently QR-only |
| `customerReference` | `String?` | Optional merchant-supplied reference |
| `qrPayload` | `String?` | The payload encoded into the QR code |
| `createdAt` / `updatedAt` | `DateTime` | |

**Indexes:** `merchantId`, `(merchantId, status)`, and `(merchantId, createdAt)` — chosen to match the actual access patterns (list-by-merchant, filter-by-status, sort-by-date).

---

## Authentication & Authorization

- **Registration** (`POST /api/auth/register`) hashes the password with bcrypt (cost 12) and creates a `MERCHANT` user.
- **Login** (`POST /api/auth/login`) verifies the password with `bcrypt.compare` and issues a signed JWT.
- The JWT (`{ sub: userId, role }`) is set as an **httpOnly, `sameSite: none` cookie** (`secure` in production), so it's never exposed to client-side JavaScript and can't be read or exfiltrated via XSS. `sameSite: none` is required because the frontend (Vercel) and API (Render) are on different origins; it depends on `secure: true` in production to stay safe.
- **`requireAuth`** middleware reads the cookie, verifies the token, and attaches `{ id, role }` to `req.user`. It protects every route under `/api/transactions`, `/api/dashboard`, and `/api/users`.
- **`requireRole(...)`** exists as a middleware factory for role-gated routes, but is not currently applied anywhere — all authenticated users are treated identically as merchants scoped to their own data.
- **Logout** (`POST /api/auth/logout`) clears the cookie.

---

## API Documentation

Base URL (local): `http://localhost:5000/api`
Base URL (production): `https://payflow-server-ekec.onrender.com/api`

A ready-to-import Postman collection is included at `PayFlow.postman_collection.json`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check |
| `POST` | `/auth/register` | No | Create a merchant account |
| `POST` | `/auth/login` | No | Log in, sets the auth cookie |
| `POST` | `/auth/logout` | Yes | Clears the auth cookie |
| `GET` | `/users/me` | Yes | Get the current user |
| `PATCH` | `/users/me` | Yes | Update name/email |
| `POST` | `/transactions` | Yes | Create a QR payment request |
| `GET` | `/transactions` | Yes | List transactions (`search`, `status`, `from`, `to`, `page`, `limit`) |
| `GET` | `/transactions/:transactionId` | Yes | Get a single transaction |
| `PATCH` | `/transactions/:transactionId/status` | Yes | Simulate `SUCCESSFUL` / `FAILED` (only while `PENDING`) |
| `GET` | `/dashboard` | Yes | Aggregate stats: totals, per-status counts, total successful volume |

**Response envelope:**
```json
// Success
{ "success": true, "data": { ... } }

// Error
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "Invalid request data", "details": [...] }
}
```

---

## Transaction Management

- Transactions are always created against the authenticated merchant (`merchantId` taken from the JWT, never from the request body).
- Every read/update operation for a transaction is scoped with `WHERE transactionId = ? AND merchantId = ?`, so one merchant can never view or modify another merchant's transaction, even by guessing an ID.
- Status transitions are one-directional and guarded: `PATCH /transactions/:id/status` throws `409 TRANSACTION_ALREADY_COMPLETED` if the transaction isn't currently `PENDING`.

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

1. **Create** — the merchant submits an amount (+ optional customer reference) on `/dashboard/payments/create`.
2. **Generate** — the backend creates a unique `transactionId` (`TXN-<base36 timestamp>-<8 hex chars>`) and a `qrPayload` (`payflow://payment?transactionId=...`), and inserts the transaction with `status: PENDING`.
3. **Display** — the transaction detail page renders the payload as a real, scannable QR code via `qrcode.react`.
4. **Simulate** — while `status === PENDING`, the merchant can click "Mark successful" or "Mark failed," which calls `PATCH /transactions/:id/status`.
5. **Reflect** — on success, React Query invalidates the transaction, transaction list, and dashboard stats queries, so the updated status is visible everywhere immediately without a manual refresh.

No real payment gateway, bank, or card network is contacted at any point — this is explicitly a simulation, per the assignment brief.

---

## Search, Filtering & Pagination

`GET /api/transactions` accepts:
- `search` — matches against `transactionId` or `customerReference` (`contains`)
- `status` — `PENDING` \| `SUCCESSFUL` \| `FAILED`
- `from` / `to` — inclusive date range on `createdAt` (normalized to start-of-day / end-of-day)
- `page` / `limit` — `limit` capped at 100, default 20

The response includes a `pagination` object (`page`, `limit`, `total`, `totalPages`). All filter state lives in the frontend's local component state and is passed as query params; React Query's `keepPreviousData` avoids a loading flash when paging or filtering.

---

## Validation & Error Handling

- Every request body and query string is validated with a Zod schema before it reaches a controller (`validateBody` / `validateQuery` middleware).
- Validation failures return `400 VALIDATION_ERROR` with a `details` array of `{ field, message }`.
- Domain errors (not found, already exists, forbidden, etc.) are thrown as `AppError(message, statusCode, code)` and mapped to a consistent JSON shape by a single centralized `errorHandler`.
- Unexpected errors are logged server-side and returned to the client as a generic `500 INTERNAL_SERVER_ERROR` — internals are never leaked in the response body.
- The frontend never renders raw error objects; `getApiErrorMessage()` extracts a safe, user-facing message from any Axios error, with a sensible fallback.

---

## Security Considerations

- Passwords hashed with bcrypt (cost factor 12); plaintext passwords are never stored or logged.
- JWT delivered via an **httpOnly** cookie — inaccessible to client-side JavaScript, mitigating token theft via XSS.
- `secure: true` and `sameSite: "none"` in production, since frontend and backend are on different origins (Vercel ↔ Render); `sameSite: "none"` widens CSRF surface slightly compared to `lax`, which is a deliberate trade-off for the cross-origin deployment (see [Known Limitations](#known-limitations)).
- `helmet` applied globally for standard security headers.
- CORS restricted to a single configured `CLIENT_URL` origin, with `credentials: true`.
- All Prisma queries are parameterized by the ORM — no raw SQL string concatenation anywhere.
- `passwordHash` is excluded via explicit Prisma `select` on every user-returning endpoint.
- No secrets are committed to the repository; `.env.example` documents required variables without values.

---

## Rate Limiting

Implemented with `express-rate-limit`, applied globally and to auth endpoints specifically:

| Limiter | Scope | Limit |
|---|---|---|
| `globalRateLimiter` | All routes | 300 requests / 60s per IP |
| `authRateLimiter` | `/auth/register`, `/auth/login` | 30 requests / 60s per IP |

Both return a consistent `{ success: false, error: { code, message } }` body on `429`.

---

## Environment Variables

### `server/.env`
| Variable | Required | Example | Notes |
|---|---|---|---|
| `PORT` | No | `5000` | Defaults to `5000` |
| `NODE_ENV` | No | `development` | `development` \| `test` \| `production` |
| `CLIENT_URL` | No | `http://localhost:3000` | Used for CORS origin |
| `DATABASE_URL` | **Yes** | `mysql://user:pass@localhost:3306/PayFlow` | MySQL connection string |
| `JWT_SECRET` | **Yes** | (32+ char random string) | Used to sign/verify auth tokens |
| `JWT_EXPIRES_IN` | No | `3d` | Any valid `jsonwebtoken` expiry string |

A committed `server/.env.example` documents these without real values.

### `client`
| Variable | Required | Example | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | `http://localhost:5000/api` | Base URL the frontend calls; must be set at **build time** for Next.js, and passed as a Docker build arg in `docker-compose.yml` |

> The client doesn't currently have a committed `.env.example` — set `NEXT_PUBLIC_API_URL` in a `client/.env.local` for local development.

---

## Local Setup & Installation

### Prerequisites
- Node.js 20+
- A running MySQL instance (local, Docker, or hosted)

### 1. Clone & install
```bash
git clone <repo-url>
cd PayFlow

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables
```bash
cd server
cp .env.example .env
# edit .env: set DATABASE_URL and a JWT_SECRET (32+ characters)
```
```bash
cd ../client
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

### 3. Run database migrations & (optionally) seed data
```bash
cd server
npx prisma migrate deploy
npx prisma db seed   # optional — creates demo merchant/admin users and sample transactions
```

### 4. Start both apps
```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

Frontend: `http://localhost:3000`
API: `http://localhost:5000/api`

### Or: run everything with Docker Compose
```bash
docker compose up --build
```
This spins up MySQL, the API, and the Next.js client together, wired via the environment variables already defined in `docker-compose.yml`.

---

## Prisma / Database Setup & Migrations

- Schema lives at `server/prisma/schema.prisma`.
- Client is generated into `server/src/generated/prisma` (via `prisma generate`, run automatically as part of `npm install`/Docker build in this setup).
- Migration history lives in `server/prisma/migrations/`.

Common commands (run from `server/`):
```bash
npx prisma generate        # regenerate the Prisma client after a schema change
npx prisma migrate dev     # create + apply a new migration in development
npx prisma migrate deploy  # apply existing migrations (used in production/CI)
npx prisma studio          # browse the database visually
npx prisma db seed         # run server/prisma/seed.ts — demo merchant, admin, and 8 sample transactions
```

Demo seed credentials (for local testing only — **not** valid on the deployed instance unless you've run the seed against it):
- `merchant@example.com` / `Password123!`
- `admin@example.com` / `Password123!` (note: the `ADMIN` role is stored but not used to unlock any additional UI or routes today)

---

## Development & Production Commands

### Server
```bash
npm run dev     # tsx watch — hot-reloading dev server
npm run build   # tsc — compiles to dist/
npm start       # node dist/server.js — run the compiled build
```

### Client
```bash
npm run dev     # next dev
npm run build   # next build
npm start        # next start — serve the production build
npm run lint     # eslint
```

---

## Deployment

- **Frontend** is deployed on **Vercel**: [pay-flow-c65bxeyee-ractcodes-projects.vercel.app](https://pay-flow-c65bxeyee-ractcodes-projects.vercel.app/)
- **Backend** is deployed on **Render**: [payflow-server-ekec.onrender.com](https://payflow-server-ekec.onrender.com/)
- A `docker-compose.yml` at the repo root containerizes the full stack (MySQL + API + client) for local or self-hosted use, with dedicated `Dockerfile`s for both `client/` and `server/`.
- A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push/PR to `main`/`master`: installs dependencies, generates the Prisma client, builds both the server and client, and builds the Docker images. **It does not run automated tests** (there are none in the repo yet) and does not deploy — deployment to Vercel/Render is currently manual/platform-triggered.

---

## Screenshots / Demo

**Demo Video/ Screenshots:** [Google Drive](https://drive.google.com/drive/folders/1oy0nEAxcJNtZkMMk0W8S5gN7KfRx2-lI)

---

## Key Technical Decisions

- **Cookie-based JWT over localStorage:** chosen specifically to keep the token out of reach of client-side JS, trading a small amount of CORS/cookie configuration complexity (`sameSite: none`, cross-origin credentials) for meaningfully better XSS resistance.
- **Feature-module structure on both ends:** grouping by domain (`auth`, `transactions`, `dashboard`) rather than by technical layer keeps related code (schema, service, routes / api calls, hooks) next to each other, which made the codebase easier to navigate while building this solo, and should make it easier to extend.
- **Centralized error handling:** a single `AppError` type + one `errorHandler` middleware means every module gets consistent error responses for free, instead of each route re-implementing try/catch and response shaping.
- **Human-readable transaction IDs (`TXN-...`) instead of raw UUIDs/cuids in URLs:** makes the QR payload and transaction detail URLs more legible and copy-paste friendly, while the internal `id` (cuid) remains the actual primary key.
- **Status transitions guarded server-side, not just in the UI:** the "only pending transactions can be updated" rule lives in the service layer (`409 TRANSACTION_ALREADY_COMPLETED`), so it can't be bypassed by calling the API directly, even though the UI also hides the simulate buttons once a transaction is resolved.

---

## Known Limitations

- **`requireRole` / `ADMIN` role is scaffolded but unused** — there's no admin-only view or route in the current app; every authenticated user is treated as a merchant scoped to their own transactions.
- **No automated tests** — no unit, integration, or e2e tests exist in either `client/` or `server/`. CI currently only builds the project.
- **Single QR payment method** — `paymentMethod` is an enum with only `QR` as a value; the schema is deliberately narrow rather than pretending to support methods that aren't implemented.
- **No refresh-token flow** — a single JWT is issued at login/register with a fixed expiry; there's no silent renewal, so a session simply expires and requires re-login.
- **`sameSite: "none"` cookie** is required for the current cross-origin (Vercel ↔ Render) deployment, which is a slightly larger CSRF surface than a same-site `lax` cookie would be — mitigated by the API being JSON-only (not form-submittable) but not eliminated.
- **Render free-tier cold starts** — the deployed API sleeps after inactivity; the first request can take up to a minute.
- **No password reset / email verification flow** — out of scope for the assignment, but worth flagging as absent rather than assumed.

---

## What I'd Improve With More Time

- Write integration tests for the auth and transaction flows (at minimum: register/login, transaction creation, status-transition guard, and merchant data isolation) and wire them into the existing CI workflow.
- Actually enforce `requireRole` somewhere meaningful — e.g. an admin view across all merchants' transactions — or remove the unused scaffolding to keep the codebase honest about what it does.
- Add a refresh-token / short-lived-access-token pair for better session hygiene than a single long-lived JWT.
- Add basic CSV export for the transaction list, since merchants reconciling payments typically want that.
- Add optimistic UI updates for the "simulate payment" action instead of waiting on the full round trip before showing the new status.
- Set up a persistent (non-cold-starting) hosting tier for the API for a smoother demo experience.
