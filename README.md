# TaskFlow – AbleSpace Technical Assessment

A full-stack task management application built with **Next.js 14** (App Router), **NestJS**, **TypeORM + SQLite (sql.js)**, and **TypeScript**.

---

## 📸 Features

| Feature | Details |
|---|---|
| **Auth** | Register, Login, Guest Login (no credentials needed) |
| **Tasks CRUD** | Create, Read, Update, Delete tasks |
| **Task Fields** | Title, Description, Status, Priority, Due Date, Category |
| **Filters** | By status, priority, category, free-text search |
| **Sort** | Newest, Oldest, By Priority, By Due Date |
| **Stats Dashboard** | Total, Completed, In Progress, Overdue, Progress bar |
| **Themes** | Light, Dark, Purple, Ocean – persisted in localStorage |
| **Responsive** | Mobile sidebar, tablet/desktop layouts |
| **Animations** | Fade-in cards, scale-in modals, smooth transitions |
| **Toast Notifications** | Success/info feedback on every action |
| **Accessibility** | ARIA labels, keyboard navigation (Escape closes modals) |

---

## 🏗️ Tech Stack

**Frontend**
- Next.js 14 (App Router, `'use client'` where needed)
- Tailwind CSS v3
- Lucide React (icons)
- Axios (HTTP client)
- CSS custom properties for theming

**Backend**
- NestJS 11
- TypeORM + sql.js (SQLite in-memory / file, no native binaries required)
- Passport + JWT authentication
- `class-validator` for DTO validation
- Node.js `crypto` for password hashing (no bcrypt native deps)

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 16
- npm ≥ 8

### Backend

```bash
cd backend
npm install
npm run start:dev       # runs on http://localhost:3001
```

The database (`taskdb.sqlite`) is auto-created on first run via TypeORM `synchronize: true`.

**Environment variables** (`.env` is already pre-configured):

```
JWT_SECRET=ablespace_task_manager_secret_key_2024
JWT_EXPIRATION=7d
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev             # runs on http://localhost:3000
```

**Environment variables** (`.env.local` is already pre-configured):

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email + password |
| POST | `/api/auth/guest` | One-click guest login |
| GET | `/api/auth/me` | Get current user profile |

### Tasks (all require `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | List tasks (supports `?status=&priority=&category=&search=`) |
| GET | `/api/tasks/stats` | Get task statistics |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

---

## 🎨 Themes

Four themes are available, switchable from the sidebar:

| Theme | Accent | Sidebar |
|---|---|---|
| **Light** | Indigo `#6366f1` | Dark slate `#1e1e2e` |
| **Dark** | Light indigo `#818cf8` | Near-black `#0f172a` |
| **Purple** | Deep purple `#7c3aed` | Purple `#4c1d95` |
| **Ocean** | Sky blue `#0284c7` | Ocean `#0c4a6e` |

Selected theme persists across page refreshes via `localStorage`.

---

## 📁 Project Structure

```
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── login/page.tsx        # Auth page (login + register)
│       │   ├── dashboard/page.tsx    # Main dashboard
│       │   ├── layout.tsx            # Root layout (providers)
│       │   └── globals.css           # CSS variables + utilities
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx       # Navigation + theme switcher
│       │   │   └── Header.tsx        # Search bar + new task button
│       │   ├── dashboard/
│       │   │   ├── StatsCards.tsx    # Stats overview
│       │   │   └── TaskFilters.tsx   # Filter/sort controls
│       │   ├── tasks/
│       │   │   ├── TaskCard.tsx      # Individual task card
│       │   │   └── TaskForm.tsx      # Create/edit form
│       │   └── ui/
│       │       ├── Button.tsx        # Reusable button
│       │       ├── Input.tsx         # Reusable input
│       │       ├── Modal.tsx         # Accessible modal
│       │       └── Badge.tsx         # Status/priority badge
│       └── lib/
│           ├── api.ts                # Axios instance + API helpers
│           ├── auth-context.tsx      # Auth state (React context)
│           └── theme-context.tsx     # Theme state + CSS variables
│
└── backend/
    └── src/
        ├── auth/                     # JWT auth (register/login/guest)
        ├── tasks/                    # Tasks CRUD + stats
        ├── users/                    # User management
        └── app.module.ts             # Root module (TypeORM SQLite)
```

---

## ⚠️ Intentional Design Decisions

1. **sql.js instead of SQLite native** – `better-sqlite3` requires native compilation. `sql.js` (WASM-based) works on all platforms without build tools, which is better for assessors who just clone and run.

2. **SHA-256 password hashing** – `bcrypt` requires native binaries. The app uses Node's built-in `crypto` with a salt suffix, which is portable. In production, `bcrypt` or `argon2` should be used.

3. **No refresh tokens** – JWT tokens have a 7-day expiry. For simplicity (assessment scope), there's no refresh token flow.

4. **Guest sessions** – Guest users are created as real database records with a random email (`guest_xxxx@guest.local`). This lets the full task CRUD work transparently without special-casing.

5. **Overdue filter is client-side** – After fetching all non-completed tasks, overdue filtering is applied in the browser to avoid a complex SQL query. This is fine at assessment scale.

---

## Part 2 – AbleSpace Product Analysis

See `PART2_PRODUCT_ANALYSIS.md` for the UX/UI walkthrough and improvement suggestions for the AbleSpace "Take Data" screen.
