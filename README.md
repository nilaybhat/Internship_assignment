# User Management & Task Tracker

Full-stack hiring assignment: a secure task tracker with JWT auth, role-based access
(admin / user), and per-user task management.

```
┌─────────────────────┐      HTTP/REST       ┌──────────────────────┐      Prisma       ┌──────────────┐
│  React Frontend     │ ───────────────────▶ │  Express Backend     │ ────────────────▶ │  PostgreSQL  │
│  Login / Register   │ ◀───────────────────  │  Auth + Role Guard   │ ◀────────────────  │  Users/Tasks │
│  Dashboard / Admin  │      JWT / JSON      │  Validation + Errors │                   └──────────────┘
└─────────────────────┘                      └──────────────────────┘
```

## Repositories

| Folder      | Stack                          | Docs                                   |
| ----------- | ------------------------------ | -------------------------------------- |
| `backend/`  | Node.js  Express  Prisma  PostgreSQL  JWT  Jest | [backend/README.md](backend/README.md) |
| `frontend/` | React  Vite  Tailwind  Axios  Vitest/RTL    | [frontend/README.md](frontend/README.md) |

## Approach

- **Two independent apps in one repo.** `backend/` is a REST API, `frontend/` is a
  single page app. They respond over HTTP/JSON with JWT; each has its own
  dependencies, tests, and README.
- **Backend — modular Express monolith.** Controllers, routes, services, validators,
  and middleware are split by concern so every component or route stays testable. All input is
  validated with Zod at the boundary; errors return one consistent JSON envelope
  with the right status code.
- **Security-first.** Passwords hashed with bcrypt, JWTs signed with an env secret,
  role guard + object-level ownership checks, generic login errors (no account
  enumeration), secrets only in environment variables — never in the repo.
- **Data — PostgreSQL via Prisma.** The model is migration-managed (`prisma`),
  hosted on Supabase so there's no local database. For production/serverless the
  app connects through Supabase's transaction pooler, while migrations use a direct
  connection.
- **Frontend — React + Vite + React Router.** Public and protected routes separate
  user/admin areas; Axios attaches the stored JWT and centralises error handling.
  `VITE_API_URL` is the only config the app needs.
- **Testing.** Backend: Jest + Supertest (unit + API tests that run against a
  dedicated `test` schema, never real data). Frontend: Vitest + React Testing
  Library for pages and API utilities.
- **Deployment.** One Vercel project using **Vercel Services** — the SPA and the
  API deploy together on a single domain (`/api*` → backend, everything else →
  frontend), defined in `vercel.json`.

## Quick start

**1. Create a Supabase database**

Create a free project at [supabase.com](https://supabase.com) and grab its
**direct** connection string from *Project Settings → Database → Connection string*.
No local database or Docker is needed — Supabase hosts the managed PostgreSQL.

**2. Backend**

```bash
cd backend
cp .env.example .env     # paste your Supabase DATABASE_URL
npm install
npx prisma migrate dev
npm run prisma:seed     # optional demo accounts
npm run dev             # http://localhost:5000
```

**3. Frontend**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```

## Running tests

```bash
cd backend && npm test      # Jest + Supertest (unit + API)
cd frontend && npm test     # Vitest + React Testing Library
```

See each sub-README for full setup, configuration, API documentation, and sample requests.