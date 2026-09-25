# User Management & Task Tracker API

A secure REST API for user registration, JWT authentication, role-based access control (admin / user), and per-user task management.

Built with **Node.js + Express + PostgreSQL + Prisma ORM**.

---

## Features

- **Authentication** — register, login, hashed passwords (bcrypt), JWT issuance
- **Authorization** — role-based (admin / user) + object-level ownership checks
- **Task Management** — create, list, update, delete tasks
- **Admin** — view all users, delete users, see all tasks
- **Validation** — Zod schemas on every input boundary
- **Errors** — consistent JSON error responses with proper HTTP status codes
- **Testing** — Jest + Supertest (unit + API tests)
- **Security** — env vars for secrets, token validation, graceful shutdown, CORS

---

## Tech Stack

| Layer     | Technology                                    |
| --------- | --------------------------------------------- |
| Runtime   | Node.js (>= 18)                               |
| Framework | Express 4                                     |
| Database  | PostgreSQL 16                                 |
| ORM       | Prisma 5                                      |
| Auth      | JSON Web Token (JWT), bcrypt                  |
| Validation| Zod                                           |
| Testing   | Jest + Supertest                              |

---

## Project Structure

```
backend/
├── src/
│   ├── config/          # env config + logger
│   ├── controllers/     # request/response handling
│   ├── database/        # shared Prisma client
│   ├── middleware/      # auth, role, error handling
│   ├── routes/          # API route definitions
│   ├── services/        # business logic
│   ├── utils/           # jwt, password, async handler, ApiError
│   ├── validators/      # Zod schemas + validate middleware
│   ├── app.js           # Express app
│   └── server.js        # HTTP server + graceful shutdown
├── prisma/
│   ├── schema.prisma    # data model
│   ├── seed.js          # demo admin + user
│   └── migrations/      # SQL migrations
├── tests/
│   ├── unit/            # unit tests
│   ├── api/             # API tests (Supertest)
│   └── helpers/         # DB reset + test data utilities
├── .env.example
├── jest.config.js
└── package.json
```

---

## Database Schema

```
User
----
id          Int      @id @default(autoincrement())
name        String
email       String   @unique
password    String   (bcrypt hash - never plain text)
role        Role     @default(USER)     # USER | ADMIN
tasks       Task[]
createdAt   DateTime @default(now())
updatedAt   DateTime @updatedAt

Task
----
id          Int      @id @default(autoincrement())
title       String
description String?
status       TaskStatus @default(PENDING)   # PENDING | COMPLETED
user        User     @relation(...)
userId      Int      (FK -> User.id, onDelete: Cascade)
createdAt   DateTime @default(now())
updatedAt   DateTime @updatedAt
```

Indexes are defined on `User.role`, `Task.userId`, and `Task.status` to support the common
admin lookups and per-user queries.

---

## Environment Variables

Create a `.env` file by copying `.env.example`:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:<DATABASE_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres"
JWT_SECRET=generate_a_long_random_secret
JWT_EXPIRES_IN=1d
BCRYPT_ROUNDS=10
CORS_ORIGIN=*
```

> `JWT_SECRET` must be at least 16 characters. Generate one with:
> `openssl rand -hex 32`
>
> **Never commit `.env`** — the `.gitignore` already excludes it, and a live
> Supabase connection string is a real credential.

---

## Setup

### 1. Create a Supabase database

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → Database → Connection string**.
3. Copy the **direct** connection string (`postgresql://postgres.<password>@db.<ref>.supabase.co:5432/postgres`).
4. Paste it as `DATABASE_URL` in `backend/.env` (replace the placeholder).

No local database or Docker is required — Supabase hosts the managed PostgreSQL.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env       # then set your DATABASE_URL and JWT_SECRET
cp .env.test.example .env.test
```

### 4. Migrate + generate client

```bash
npx prisma migrate dev     # applies migrations to the dev database
npx prisma generate        # generates the Prisma Client
```

### 5. Seed demo data (optional)

Creates two accounts:

| Role  | Email           | Password    |
| ----- | --------------- | ----------- |
| Admin | `admin@demo.com`| `Admin@1234`|
| User  | `user@demo.com` | `Demo@1234` |

```bash
npm run prisma:seed
```

> These are throwaway demo credentials. Change them (and use your real email)
> before pushing to a public repository.

---

## Running the server

```bash
npm run dev      # development (nodemon, auto-restarts)
npm start        # production
```

The API is served at `http://localhost:5000/api`. Health check:

```
GET /api/health
```

---

## Running the tests

```bash
npm test
```

Runs all unit + API tests against a dedicated **`test` schema** on the same Supabase
project, so tests never touch your real (`public`) data. Point `backend/.env.test`
at your Supabase connection string with `?schema=test` appended; the Jest
`globalSetup` creates the schema and applies migrations automatically. Tests run
serially and reset the schema between cases.

---

## API Reference

All protected routes require an `Authorization: Bearer <token>` header.

### Authentication

**`POST /api/auth/register`** — create an account

```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }
```

```json
// 201
{
  "success": true,
  "message": "Registration successful. You can now log in.",
  "data": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "USER", "createdAt": "..." }
}
```

**`POST /api/auth/login`** — obtain a JWT

```json
{ "email": "jane@example.com", "password": "secret123" }
```

```json
// 200
{
  "success": true,
  "message": "Login successful",
  "token": "<JWT>",
  "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "USER" }
}
```

### Tasks (protected)

| Method | Endpoint        | Description                                        |
| ------ | --------------- | -------------------------------------------------- |
| POST   | `/api/tasks`    | Create a task (`title` required, `description`, `status`) |
| GET    | `/api/tasks`    | List tasks (`?status=pending|completed` to filter). Users see only their own; admins see all. |
| PUT    | `/api/tasks/:id`| Update title/description/status (owner or admin)   |
| DELETE | `/api/tasks/:id`| Delete a task (owner or admin)                     |

**`POST /api/tasks`**

```json
{ "title": "Complete assignment", "description": "Finish backend", "status": "pending" }
```

**`GET /api/tasks`** — normal user

```json
// 200
{ "success": true, "data": [
  {
    "id": 1, "title": "Complete assignment", "description": "Finish backend",
    "status": "pending", "userId": 1, "createdAt": "2026-09-23T08:00:00.000Z",
    "updatedAt": "2026-09-23T08:00:00.000Z"
  }
] }
```

**`PUT /api/tasks/1`**

```json
{ "title": "Updated", "status": "completed" }
```

**`DELETE /api/tasks/1`**

```json
// 200
{ "success": true, "message": "Task deleted", "data": { "id": 1, "deleted": true } }
```

### Users

| Method | Endpoint          | Role  | Description                    |
| ------ | ----------------- | ----- | ------------------------------ |
| GET    | `/api/users/me`   | Any   | Current user's profile         |
| GET    | `/api/users`      | Admin | List all users (+ task counts) |
| DELETE | `/api/users/:id`  | Admin | Delete a user (cascades tasks) |

### Sample requests (cURL)

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secret123"}'

# Create a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Complete assignment","status":"pending"}'

# List tasks
curl http://localhost:5000/api/tasks -H "Authorization: Bearer <token>"

# Update
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Delete
curl -X DELETE http://localhost:5000/api/tasks/1 -H "Authorization: Bearer <token>"

# Admin: list all users
curl http://localhost:5000/api/users -H "Authorization: Bearer <admin-token>"
```

---

## Error format

Errors always follow this shape:

```json
{
  "success": false,
  "message": "Validation failed",
  "details": [{ "field": "title", "message": "Title is required" }]
}
```

| Status | Meaning                                             |
| ------ | --------------------------------------------------- |
| 400    | Validation failed / bad input                       |
| 401    | Missing, invalid or expired token / bad credentials |
| 403    | Authenticated but not permitted                    |
| 404    | Resource not found                                 |
| 409    | Conflict (e.g. duplicate email)                    |
| 500    | Internal server error (logged server-side)         |

---

## Security

- Passwords hashed with **bcrypt** (10 rounds, configurable); never stored or returned in plain text
- **JWT** signed with a secret from the environment; verified on every protected route
- Role middleware (`requireAdmin`) + object-level ownership checks (`getOwnedTaskOrThrow`)
- Generic login error to avoid user enumeration
- Input validated with Zod at every boundary (body + route params)
- Responses never leak stack traces or database internals
- CORS restricted via `CORS_ORIGIN`; `x-powered-by` disabled; JSON body size limited
- Graceful shutdown on SIGINT/SIGTERM; env config validated and fails fast

---

## Decisions & trade-offs

- **SQL (PostgreSQL)** over NoSQL for relational data (users ↔ tasks) with referential integrity and cascade delete.
- **Prisma** for type-safe, migration-managed access; index on `userId`, `role`, and `status`.
- **Modular monolith** — services/controllers/middleware separation keeps it testable and easy to grow without premature microservices.
- **Generic login errors** trade UX detail for security (no account enumeration).
- **`maxWorkers: 1`** in Jest because tests share one database to keep the suite simple and deterministic.