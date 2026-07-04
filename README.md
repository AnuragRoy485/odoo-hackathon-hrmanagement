# HR Management System Backend

A secure and lightweight REST API for the **HR Management System**, built with **Express.js**, **SQLite**, and **JWT Authentication**.

This backend serves as a standalone API for the HR Management System frontend. Since the frontend is deployed on **Cloudflare Workers/Vercel**, where traditional Node.js servers (such as Express or Django) cannot run directly, this backend is designed to be deployed separately on platforms like **Render**, **Railway**, **Fly.io**, or any VPS.

---

## 🌐 Live Demo

**Frontend:** https://odoohrmanagement.vercel.app/

---

## ✨ Features

* 🔐 JWT Authentication
* 👤 Employee Registration & Login
* 🛡️ Role-based Access Control (Admin & Employee)
* 📋 Employee Profile Management
* 🕒 Attendance Check-In / Check-Out
* 🗓️ Leave Application Management
* ✅ Leave Approval & Rejection
* 💰 Salary Management
* 📦 SQLite Database
* ⚡ Fast REST API using Express.js

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* SQLite
* JWT (JSON Web Tokens)
* bcrypt
* dotenv

---

## 📂 API Endpoints

### Authentication

| Method | Endpoint           | Description                 |
| ------ | ------------------ | --------------------------- |
| POST   | `/api/auth/signup` | Register a new employee     |
| POST   | `/api/auth/signin` | Login and receive JWT token |

---

### User Management

| Method | Endpoint                | Access             |
| ------ | ----------------------- | ------------------ |
| GET    | `/api/me`               | Authenticated User |
| GET    | `/api/users`            | Admin              |
| PATCH  | `/api/users/:id`        | Self / Admin       |
| PATCH  | `/api/users/:id/salary` | Admin              |

---

### Attendance

| Method | Endpoint                    | Description     |
| ------ | --------------------------- | --------------- |
| GET    | `/api/attendance?userId=`   | View attendance |
| POST   | `/api/attendance/check-in`  | Check In        |
| POST   | `/api/attendance/check-out` | Check Out       |

---

### Leave Management

| Method | Endpoint          | Access           |
| ------ | ----------------- | ---------------- |
| GET    | `/api/leaves`     | Employee / Admin |
| POST   | `/api/leaves`     | Employee         |
| PATCH  | `/api/leaves/:id` | Admin            |

---

## 📁 Project Structure

```
backend/
│
├── routes/
├── middleware/
├── controllers/
├── models/
├── database/
├── utils/
├── app.js
├── server.js
├── package.json
└── README.md
```

---

## 🚀 Installation

Clone the repository:

```bash
git clone <repository-url>
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=4000
JWT_SECRET=your_secret_key
DATABASE=database.sqlite
```

Start the development server:

```bash
npm run dev
```

The API will be available at:

```
http://localhost:4000
```

---

## 🔗 Connecting with the Frontend

Create a `.env` file in your frontend project:

```env
VITE_API_URL=http://localhost:4000
```

Replace any local storage persistence with API requests:

```javascript
fetch(`${import.meta.env.VITE_API_URL}/api/...`)
```

---

## 🔒 Authentication

Protected routes require a Bearer Token.

Example:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 👥 Roles

### Employee

* Register & Login
* View/Edit Profile
* Check In
* Check Out
* Apply for Leave
* View Attendance
* View Leave Status

### Admin

* Manage Employees
* Update Employee Salary
* View All Attendance
* Approve/Reject Leave Requests
* Manage Employee Profiles

---

## 📦 Deployment

This backend can be deployed on:

* Render
* Railway
* Fly.io
* DigitalOcean
* AWS EC2
* Any VPS with Node.js support

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Developed By

**Anurag Roy & Soumik Seal**

If you found this project helpful, consider giving it a ⭐ on GitHub.
