# Online Exam & Quiz Platform

A secure, real-time online exam platform built with **NestJS** (backend) and **Next.js 16** (frontend).

## Architecture

```
┌─────────────────┐     httpOnly cookies      ┌─────────────────┐
│                 │◄─────────────────────────►│                 │
│  Next.js 16     │   (BFF route handlers)    │  Browser        │
│  App Router     │                           │  React Client   │
│  (port 3001)    │◄── socket.io-client ─────►│                 │
└────────┬────────┘                           └─────────────────┘
         │  server-side fetch
         ▼
┌─────────────────┐        ┌─────────────┐
│  NestJS API     │◄──────►│  PostgreSQL  │
│  (port 3000)    │        │  (port 5433) │
│                 │◄──────►│  Redis       │
│  Socket.IO GW   │        │  (port 6379) │
└─────────────────┘        └─────────────┘
```

### Auth / Session Flow

1. **Login**: Browser sends credentials to `POST /api/auth/login` (Next.js route handler).
2. **BFF Proxy**: The route handler forwards to the NestJS backend `POST /auth/login`.
3. **Cookie Set**: On success, the route handler stores `access_token` and `refresh_token` in **httpOnly** secure cookies — never exposed to JavaScript.
4. **Session Check**: On page load, `AuthProvider` calls `GET /api/auth/session` which reads cookies server-side and calls `GET /auth/me` on the backend.
5. **Token Rotation**: If the access token is expired but the refresh token is valid, the BFF automatically rotates tokens via `POST /auth/refresh`.
6. **Socket.IO Auth**: The client requests a short-lived token via `GET /api/auth/socket-token`. The BFF reads the httpOnly cookie, validates it, and returns the raw JWT for the socket handshake only.

### Real-Time Flow

- **Socket.IO** connects with the JWT obtained from the BFF.
- **Heartbeat** events are emitted every 10s and on `visibilitychange` to detect tab-switching (anti-cheat).
- **Answer auto-save** uses debounced WebSocket emissions with retry/backoff logic and visual save status indicators.
- **Server-synced timer** — the server sends `remainingSeconds` on `join_exam` ack and periodic `timer_sync` events; the client counts down locally between syncs.

## Prerequisites

- **Node.js** ≥ 18
- **Docker** & **Docker Compose** (for PostgreSQL and Redis)

## Quick Start

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env      # edit with your secrets
npm install
npx prisma migrate dev
npm run start:dev          # runs on port 3000

# 3. Frontend
cd ../frontend
cp .env.local.example .env.local
npm install
npm run dev                # runs on port 3000 (auto-increments to 3001)
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://exam_user:exam_password@localhost:5433/online_exam_db?schema=public` |
| `JWT_SECRET` | Access token signing secret | — |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | — |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `SENDGRID_API_KEY` | SendGrid API key (optional) | — |
| `SENDGRID_FROM_EMAIL` | Sender email (optional) | — |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `BACKEND_API_URL` | NestJS URL (server-side only) | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Fallback API URL | `http://localhost:3000` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO URL | `http://localhost:3000` |

## User Roles

| Role | Capabilities |
|---|---|
| **ADMIN** | Full system management, create exams, monitor students |
| **LECTURER** | Create/manage exams, add questions, bulk upload students, live invigilation |
| **STUDENT** | View assigned exams, take exams with real-time answer saving |

## Tech Stack

- **Backend**: NestJS, Prisma 7, PostgreSQL, Redis, BullMQ, Socket.IO, SendGrid
- **Frontend**: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, socket.io-client
- **Infrastructure**: Docker Compose

## Git Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable release |
| `feature/auth` | Authentication module |
| `feature/bulk-upload` | Excel upload + BullMQ processing |
| `feature/exams-and-questions` | Exam CRUD + polymorphic questions |
| `feature/realtime-tracking` | Socket.IO + Redis timers |
| `feature/phase5-frontend` | Initial frontend scaffold |
| `feature/phase5-frontend-hardening` | Auth hardening, error boundaries, validation |
