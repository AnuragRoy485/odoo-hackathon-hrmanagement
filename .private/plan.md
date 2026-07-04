# Build Your Own HRMS — Phased Guide

A step-by-step roadmap to recreate this HR Management System from scratch on your local machine. Each phase is self-contained so you can stop, test, and continue.

---

## Phase 0 — Prerequisites (Install Tools)

Install these once on your machine:

1. **Node.js 20+** — https://nodejs.org (LTS installer). Verify: `node -v`
2. **Bun** (fast package manager & runtime) — `curl -fsSL https://bun.sh/install | bash` (macOS/Linux) or `powershell -c "irm bun.sh/install.ps1 | iex"` (Windows). Verify: `bun -v`
3. **Git** — https://git-scm.com. Verify: `git -v`
4. **VS Code** (recommended editor) + extensions: ESLint, Prettier, Tailwind CSS IntelliSense.

---

## Phase 1 — Scaffold the Frontend

1. Create a TanStack Start app:
   ```bash
   bunx create-tsrouter-app@latest hrms --template file-router --tailwind
   cd hrms
   bun install
   bun dev
   ```
2. Open `http://localhost:3000` and confirm the starter renders.
3. Initialize git: `git init && git add . && git commit -m "init"`.

---

## Phase 2 — UI Foundation (Tailwind + shadcn/ui)

1. Add shadcn/ui: `bunx shadcn@latest init` (choose defaults, CSS variables: yes).
2. Install the components you'll need:
   ```bash
   bunx shadcn@latest add button input label card dialog drawer table tabs badge avatar dropdown-menu sonner select textarea calendar popover
   ```
3. In `src/styles.css`, define your **white + purple** theme tokens (`--primary`, `--background`, `--accent`, gradients). Keep all colors as semantic tokens — never hardcode hex in components.
4. Add fonts via `<link>` in `src/routes/__root.tsx` head (e.g., Inter + a display font).

---

## Phase 3 — Routing & Layout

1. Create route files under `src/routes/`:
   - `index.tsx` — public landing page
   - `login.tsx`, `signup.tsx` — auth pages
   - `app.tsx` — protected layout with `<Outlet />`
   - `app.dashboard.tsx`, `app.attendance.tsx`, `app.leave.tsx`, `app.payroll.tsx`, `app.profile.tsx`
   - `app.admin.employees.tsx`, `app.admin.leave.tsx`, `app.admin.payroll.tsx`
2. Build `AppShell` component (sidebar + topbar) and a `RequireAuth` wrapper that redirects unauthenticated users to `/login`.

---

## Phase 4 — State & Auth (Client-Side Store)

1. Install Zustand: `bun add zustand`.
2. Create `src/lib/hr-store.ts` with:
   - Types: `User`, `AttendanceRecord`, `LeaveRequest`
   - Actions: `signIn`, `signOut`, `addEmployee`, `updateProfile`, `changePassword`, `checkIn`, `checkOut`, `applyLeave`, `reviewLeave`, `updateSalary`
   - Use `persist` middleware to store in `localStorage`
3. Implement `buildEmployeeId(name, year, serial)` → format `OIJODO20220001`.
4. Implement `generatePassword()` for auto-generated first-time passwords.
5. Seed one admin user so you can log in immediately.

---

## Phase 5 — Core HR Features

Build one feature per session:

1. **Landing page** (`/`) — hero, features, CTA with motion/parallax.
2. **Login** — accepts email OR employee ID.
3. **Dashboard** — KPI cards (present today, pending leaves, headcount).
4. **Attendance** — check-in/out buttons, monthly calendar with Present/Absent/Leave color coding.
5. **Leave** — apply form (type, dates, remarks) + list with status badges.
6. **Payroll** — read-only salary breakdown for employees.
7. **Profile** — edit personal info + change password.
8. **Admin: Employees** — add employee drawer (auto-generates ID + password, shows copyable credentials).
9. **Admin: Leave** — approve/reject with comment.
10. **Admin: Payroll** — edit salary per employee.

---

## Phase 6 — Polish & UX

- Add framer-motion for page transitions and hover effects.
- Toasts via `sonner` for every action (success/error).
- Responsive check at 375px, 768px, 1440px.
- Empty states, loading skeletons, keyboard focus rings.

---

## Phase 7 — Optional: Real Backend

If you want persistence beyond one browser:

1. Create `backend/` folder, run `npm init -y`.
2. Install: `npm i express cors bcryptjs jsonwebtoken better-sqlite3 zod`.
3. Build REST endpoints (`/api/auth/signin`, `/api/users`, `/api/attendance`, `/api/leaves`).
4. Replace Zustand store internals with `fetch` calls to `http://localhost:4000`.
5. Store JWT in localStorage; send `Authorization: Bearer <token>` on each request.

Or skip Express and use **Lovable Cloud / Supabase** for auth + Postgres + RLS.

---

## Phase 8 — Deploy

- **Frontend:** Cloudflare Pages, Vercel, or Netlify (`bun run build`).
- **Backend (if built):** Render, Railway, or Fly.io.
- Configure `VITE_API_URL` env var to point at the deployed API.

---

## Suggested Learning Order

If new to React: do Phases 0–3 first, then read the TanStack Router and shadcn/ui docs before Phase 4. Ship each phase to git before moving on.

---

## Technical Stack Reference

| Layer | Choice |
| --- | --- |
| Framework | TanStack Start v1 (React 19 + Vite 7) |
| Styling | Tailwind v4 + shadcn/ui |
| State | Zustand + persist |
| Forms | Native + Zod validation |
| Icons | lucide-react |
| Animation | framer-motion |
| Backend (optional) | Express + SQLite + JWT |
