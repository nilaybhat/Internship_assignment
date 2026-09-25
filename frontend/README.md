# TaskTracker — Frontend

A clean, responsive React frontend for the User Management & Task Tracker API.

Built with **React + Vite + Tailwind CSS**, integrated with the Express backend over REST.

---

## Features

- **Authentication screens** — register + login with client-side validation, error banners, JWT storage and smart redirect
- **Protected routes** — `/dashboard` (any authenticated user), `/admin` (admins only)
- **Dashboard** — welcome header, live task counter, create/edit/delete tasks
- **Admin dashboard** — stats, all users (with delete), all tasks
- **Task UI** — title, description, status (pending/completed), empty states, loading spinners
- **Session handling** — JWT in `localStorage`, axios interceptor attaches the Bearer token, 401 auto-logs-out
- **Responsive** — mobile-friendly layout with proper spacing and consistent indigo theme

---

## Tech Stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Framework  | React 19 (Vite 8)                            |
| Styling    | Tailwind CSS 4                               |
| Routing    | React Router                                 |
| HTTP       | Axios (interceptors, centralized API layer)  |
| Testing    | Vitest + React Testing Library               |

---

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/            # Button, Input, Modal, Alert, Spinner, EmptyState, ...
│   │   └── features/      # Navbar, ProtectedRoute, AdminRoute, TaskForm, TaskList, TaskCard
│   ├── config/            # env-based configuration
│   ├── context/           # AuthContext (user, token, login, register, logout)
│   ├── hooks/             # useAuth, useTasks
│   ├── layouts/           # AppLayout (navbar + outlet)
│   ├── pages/             # Login, Register, Dashboard, AdminDashboard, NotFound
│   ├── services/          # axios instance + authApi / taskApi / userApi
│   ├── utils/             # validators, error extraction, token helpers
│   ├── tests/             # setup + component + integration tests
│   ├── App.jsx            # routes
│   ├── main.jsx
│   └── index.css          # Tailwind entry
├── .env.example
├── index.html
├── vite.config.js
└── package.json
```

---

## Environment Variables

Create a `.env` file by copying `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

> The API URL is always read from an environment variable — **no hardcoded URLs** in the source.

---

## Set up

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

---

## Run the app

```bash
npm run dev
```

Open http://localhost:5173. The backend must be running at the URL in `VITE_API_URL`
(see the [backend README](../backend/README.md)).

Demo accounts (after running the backend seed):

| Role  | Email            | Password     |
| ----- | ---------------- | ------------ |
| Admin | `admin@demo.com` | `Admin@1234` |
| User  | `user@demo.com`  | `Demo@1234`  |

Production build:

```bash
npm run build && npm run preview
```

---

## Run the tests

```bash
npm test            # run once
npm run test:watch  # watch mode
```

Includes 2+ component tests (login form, task form) and an API integration test
(axios interceptors attach the JWT; endpoint paths/params match the API contract).

---

## UI/UX

- Clean, simple, professional — light gray background, white cards with subtle shadows
- Consistent indigo primary color; green (completed) and amber (pending) status badges
- Proper spacing, rounded corners, focus rings for keyboard accessibility
- Mobile friendly: stacks on small screens, horizontal-scroll tables on admin views
- Loading states (spinners), error alerts, and empty states on every data view

## Screenshots

_(Add screenshots of the login, dashboard, and admin dashboard here before submitting.)_