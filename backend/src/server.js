import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const PORT = process.env.PORT || 4000;

const db = new Database("hrms.db");
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','employee')),
  phone TEXT, address TEXT, position TEXT, department TEXT,
  joined_at TEXT NOT NULL,
  salary INTEGER NOT NULL DEFAULT 5000
);
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  check_in TEXT, check_out TEXT,
  status TEXT NOT NULL CHECK (status IN ('present','absent','half-day','leave')),
  UNIQUE(user_id, date)
);
CREATE TABLE IF NOT EXISTS leaves (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('paid','sick','unpaid')),
  from_date TEXT NOT NULL, to_date TEXT NOT NULL,
  remarks TEXT, status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  admin_comment TEXT,
  created_at TEXT NOT NULL
);
`);

const uid = () => Math.random().toString(36).slice(2, 12);
const today = () => new Date().toISOString().slice(0, 10);

// seed one admin if empty
if (db.prepare("SELECT COUNT(*) as c FROM users").get().c === 0) {
  db.prepare(`INSERT INTO users (id,employee_id,name,email,password_hash,role,joined_at,salary,position,department)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    uid(), "HR-001", "Amelia Chen", "admin@hrms.app",
    bcrypt.hashSync("admin123", 10), "admin", today(), 12500, "HR Director", "People Operations"
  );
}

const app = express();
app.use(cors());
app.use(express.json());

const auth = (req, res, next) => {
  const h = req.headers.authorization?.split(" ")[1];
  if (!h) return res.status(401).json({ error: "No token" });
  try { req.user = jwt.verify(h, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Invalid token" }); }
};
const adminOnly = (req, res, next) =>
  req.user?.role === "admin" ? next() : res.status(403).json({ error: "Forbidden" });

const toUserDTO = (u) => ({
  id: u.id, employeeId: u.employee_id, name: u.name, email: u.email, role: u.role,
  phone: u.phone, address: u.address, position: u.position, department: u.department,
  joinedAt: u.joined_at, salary: u.salary,
});

// AUTH
app.post("/api/auth/signup", (req, res) => {
  const schema = z.object({
    name: z.string().min(2), employeeId: z.string().min(2),
    email: z.string().email(), password: z.string().min(8),
    role: z.enum(["admin","employee"]),
  });
  const p = schema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.issues[0].message });
  try {
    const id = uid();
    db.prepare(`INSERT INTO users (id,employee_id,name,email,password_hash,role,joined_at,salary)
      VALUES (?,?,?,?,?,?,?,5000)`).run(
      id, p.data.employeeId, p.data.name, p.data.email,
      bcrypt.hashSync(p.data.password, 10), p.data.role, today()
    );
    const u = db.prepare("SELECT * FROM users WHERE id=?").get(id);
    const token = jwt.sign({ id: u.id, role: u.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: toUserDTO(u) });
  } catch (e) {
    res.status(409).json({ error: "Email or Employee ID already exists" });
  }
});

app.post("/api/auth/signin", (req, res) => {
  const { email, password } = req.body || {};
  const u = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!u || !bcrypt.compareSync(password || "", u.password_hash))
    return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: u.id, role: u.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: toUserDTO(u) });
});

app.get("/api/me", auth, (req, res) => {
  const u = db.prepare("SELECT * FROM users WHERE id=?").get(req.user.id);
  res.json(toUserDTO(u));
});

// USERS
app.get("/api/users", auth, adminOnly, (_req, res) => {
  const list = db.prepare("SELECT * FROM users").all().map(toUserDTO);
  res.json(list);
});
app.patch("/api/users/:id", auth, (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  const allowed = ["name","phone","address","position","department"];
  const isAdmin = req.user.role === "admin";
  const cols = []; const vals = [];
  for (const [k, v] of Object.entries(req.body || {})) {
    if (allowed.includes(k) || (isAdmin && ["salary","email"].includes(k))) {
      cols.push(`${k==="employeeId"?"employee_id":k}=?`); vals.push(v);
    }
  }
  if (!cols.length) return res.status(400).json({ error: "No fields" });
  vals.push(req.params.id);
  db.prepare(`UPDATE users SET ${cols.join(",")} WHERE id=?`).run(...vals);
  const u = db.prepare("SELECT * FROM users WHERE id=?").get(req.params.id);
  res.json(toUserDTO(u));
});

app.patch("/api/users/:id/salary", auth, adminOnly, (req, res) => {
  const salary = Number(req.body?.salary);
  if (!salary || salary < 0) return res.status(400).json({ error: "Invalid salary" });
  db.prepare("UPDATE users SET salary=? WHERE id=?").run(salary, req.params.id);
  res.json({ ok: true });
});

// ATTENDANCE
app.get("/api/attendance", auth, (req, res) => {
  const userId = req.query.userId || req.user.id;
  if (userId !== req.user.id && req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });
  const rows = db.prepare("SELECT * FROM attendance WHERE user_id=? ORDER BY date DESC").all(userId);
  res.json(rows.map(r => ({
    id: r.id, userId: r.user_id, date: r.date,
    checkIn: r.check_in, checkOut: r.check_out, status: r.status,
  })));
});
app.post("/api/attendance/check-in", auth, (req, res) => {
  const now = new Date().toTimeString().slice(0, 5);
  const d = today();
  const existing = db.prepare("SELECT * FROM attendance WHERE user_id=? AND date=?").get(req.user.id, d);
  if (existing) {
    db.prepare("UPDATE attendance SET check_in=COALESCE(check_in,?), status='present' WHERE id=?").run(now, existing.id);
  } else {
    db.prepare("INSERT INTO attendance (id,user_id,date,check_in,status) VALUES (?,?,?,?,'present')")
      .run(uid(), req.user.id, d, now);
  }
  res.json({ ok: true, checkIn: now });
});
app.post("/api/attendance/check-out", auth, (req, res) => {
  const now = new Date().toTimeString().slice(0, 5);
  db.prepare("UPDATE attendance SET check_out=? WHERE user_id=? AND date=?").run(now, req.user.id, today());
  res.json({ ok: true, checkOut: now });
});

// LEAVES
app.get("/api/leaves", auth, (req, res) => {
  const rows = req.user.role === "admin"
    ? db.prepare("SELECT * FROM leaves ORDER BY created_at DESC").all()
    : db.prepare("SELECT * FROM leaves WHERE user_id=? ORDER BY created_at DESC").all(req.user.id);
  res.json(rows.map(r => ({
    id: r.id, userId: r.user_id, type: r.type, from: r.from_date, to: r.to_date,
    remarks: r.remarks, status: r.status, adminComment: r.admin_comment, createdAt: r.created_at,
  })));
});
app.post("/api/leaves", auth, (req, res) => {
  const schema = z.object({
    type: z.enum(["paid","sick","unpaid"]),
    from: z.string(), to: z.string(), remarks: z.string().optional().default(""),
  });
  const p = schema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.issues[0].message });
  const id = uid();
  db.prepare(`INSERT INTO leaves (id,user_id,type,from_date,to_date,remarks,created_at)
    VALUES (?,?,?,?,?,?,?)`).run(
    id, req.user.id, p.data.type, p.data.from, p.data.to, p.data.remarks, new Date().toISOString()
  );
  res.json({ id, ok: true });
});
app.patch("/api/leaves/:id", auth, adminOnly, (req, res) => {
  const schema = z.object({ status: z.enum(["approved","rejected"]), adminComment: z.string().optional() });
  const p = schema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.issues[0].message });
  db.prepare("UPDATE leaves SET status=?, admin_comment=? WHERE id=?")
    .run(p.data.status, p.data.adminComment || null, req.params.id);
  res.json({ ok: true });
});

app.get("/", (_req, res) => res.json({ ok: true, name: "HR Management System API" }));

app.listen(PORT, () => console.log(`HR Management System API running on http://localhost:${PORT}`));