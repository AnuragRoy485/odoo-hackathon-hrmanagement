# HR Management System — Express + SQLite Backend

A standalone Django-alternative REST API for the HR Management System frontend. Since this
Lovable project deploys to Cloudflare Workers (which doesn't run Node servers
like Django or Express), the API lives here as a separate service you can host
on Render, Railway, Fly.io, a VPS, etc.

## Endpoints

| Method | Path                          | Auth       | Description                    |
| ------ | ----------------------------- | ---------- | ------------------------------ |
| POST   | /api/auth/signup              | —          | Create account                 |
| POST   | /api/auth/signin              | —          | Log in, returns JWT            |
| GET    | /api/me                       | Bearer     | Current user                   |
| GET    | /api/users                    | admin      | List all employees             |
| PATCH  | /api/users/:id                | self/admin | Update profile                 |
| GET    | /api/attendance?userId=       | Bearer     | Attendance records             |
| POST   | /api/attendance/check-in      | Bearer     | Check in                       |
| POST   | /api/attendance/check-out     | Bearer     | Check out                      |
| GET    | /api/leaves                   | Bearer     | List leave (own or all if admin) |
| POST   | /api/leaves                   | employee   | Apply for leave                |
| PATCH  | /api/leaves/:id               | admin      | Approve / reject               |
| PATCH  | /api/users/:id/salary         | admin      | Update salary                  |

## Run

```bash
cd backend
npm install
npm run dev
# API on http://localhost:4000
```

## Wire to the frontend

Set `VITE_API_URL=http://localhost:4000` in your project's env, and
swap the store's local persistence for `fetch(VITE_API_URL + ...)` calls.
