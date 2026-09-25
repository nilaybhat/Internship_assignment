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