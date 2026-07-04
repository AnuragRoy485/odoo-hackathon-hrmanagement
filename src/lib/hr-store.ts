import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "admin" | "employee";

export type User = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  address?: string;
  position?: string;
  department?: string;
  joinedAt: string;
  salary: number;
  avatar?: string;
};

export type AttendanceStatus = "present" | "absent" | "half-day" | "leave";
export type AttendanceRecord = {
  id: string;
  userId: string;
  date: string; // yyyy-mm-dd
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
};

export type LeaveType = "paid" | "sick" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type LeaveRequest = {
  id: string;
  userId: string;
  type: LeaveType;
  from: string;
  to: string;
  remarks: string;
  status: LeaveStatus;
  adminComment?: string;
  createdAt: string;
};

type State = {
  users: User[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  currentUserId: string | null;
  hydrated: boolean;

  signUp: (data: Omit<User, "id" | "joinedAt" | "salary"> & { salary?: number }) => { ok: boolean; error?: string };
  addEmployee: (
    data: Omit<User, "id" | "joinedAt" | "role" | "employeeId" | "password"> & { joinedAt?: string },
  ) => { ok: boolean; error?: string; employeeId?: string; password?: string };
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signOut: () => void;
  updateProfile: (id: string, data: Partial<User>) => void;
  changePassword: (id: string, current: string, next: string) => { ok: boolean; error?: string };
  checkIn: (userId: string) => void;
  checkOut: (userId: string) => void;
  applyLeave: (data: Omit<LeaveRequest, "id" | "status" | "createdAt">) => void;
  reviewLeave: (id: string, status: LeaveStatus, adminComment?: string) => void;
  updateSalary: (userId: string, salary: number) => void;
};

const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10);

const twoLetters = (part: string) => {
  const clean = (part || "").replace(/[^a-zA-Z]/g, "").toUpperCase();
  if (clean.length >= 2) return clean.slice(0, 2);
  if (clean.length === 1) return (clean + "X");
  return "XX";
};

export const buildEmployeeId = (name: string, year: number, serial: number) => {
  const parts = name.trim().split(/\s+/);
  const first = twoLetters(parts[0] ?? "");
  const last = twoLetters(parts.length > 1 ? parts[parts.length - 1] : parts[0] ?? "");
  return `OI${first}${last}${year}${String(serial).padStart(4, "0")}`;
};

export const generatePassword = (len = 10) => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};


const seedUsers: User[] = [
  {
    id: "u-admin",
    employeeId: "HR-001",
    name: "Amelia Chen",
    email: "admin@hrms.app",
    password: "admin123",
    role: "admin",
    phone: "+1 555 010 2000",
    address: "144 Market St, San Francisco",
    position: "HR Director",
    department: "People Operations",
    joinedAt: "2022-03-14",
    salary: 12500,
  },
  {
    id: "u-emp-1",
    employeeId: "EMP-1042",
    name: "Marcus Reyes",
    email: "marcus@hrms.app",
    password: "employee123",
    role: "employee",
    phone: "+1 555 083 1122",
    address: "88 Ridge Ave, Brooklyn",
    position: "Senior Product Designer",
    department: "Design",
    joinedAt: "2023-07-01",
    salary: 7800,
  },
  {
    id: "u-emp-2",
    employeeId: "EMP-1051",
    name: "Priya Natarajan",
    email: "priya@hrms.app",
    password: "employee123",
    role: "employee",
    phone: "+1 555 442 7788",
    address: "22 Elm Rd, Austin",
    position: "Backend Engineer",
    department: "Engineering",
    joinedAt: "2024-01-16",
    salary: 8600,
  },
  {
    id: "u-emp-3",
    employeeId: "EMP-1063",
    name: "Kenji Watanabe",
    email: "kenji@hrms.app",
    password: "employee123",
    role: "employee",
    phone: "+1 555 221 3390",
    address: "410 Oak Blvd, Seattle",
    position: "Data Analyst",
    department: "Analytics",
    joinedAt: "2024-05-02",
    salary: 6900,
  },
];

const seedAttendance = (): AttendanceRecord[] => {
  const out: AttendanceRecord[] = [];
  const users = seedUsers.filter((u) => u.role === "employee");
  const now = new Date();
  for (const u of users) {
    for (let i = 0; i < 20; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dow = d.getDay();
      if (dow === 0 || dow === 6) continue;
      const roll = Math.random();
      let status: AttendanceStatus = "present";
      if (roll > 0.92) status = "absent";
      else if (roll > 0.85) status = "leave";
      else if (roll > 0.78) status = "half-day";
      out.push({
        id: uid(),
        userId: u.id,
        date: d.toISOString().slice(0, 10),
        status,
        checkIn: status === "present" || status === "half-day" ? "09:0" + Math.floor(Math.random() * 9) : undefined,
        checkOut: status === "present" ? "18:0" + Math.floor(Math.random() * 9) : status === "half-day" ? "13:30" : undefined,
      });
    }
  }
  return out;
};

const seedLeaves: LeaveRequest[] = [
  {
    id: uid(),
    userId: "u-emp-1",
    type: "paid",
    from: today(),
    to: today(),
    remarks: "Family event out of town.",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: uid(),
    userId: "u-emp-2",
    type: "sick",
    from: today(),
    to: today(),
    remarks: "Flu, doctor recommended rest.",
    status: "approved",
    adminComment: "Get well soon.",
    createdAt: new Date().toISOString(),
  },
];

export const useHR = create<State>()(
  persist(
    (set, get) => ({
      users: seedUsers,
      attendance: seedAttendance(),
      leaves: seedLeaves,
      currentUserId: null,
      hydrated: false,

      signUp: (data) => {
        const users = get().users;
        if (users.find((u) => u.email.toLowerCase() === data.email.toLowerCase()))
          return { ok: false, error: "Email already registered." };
        if (users.find((u) => u.employeeId === data.employeeId))
          return { ok: false, error: "Employee ID already in use." };
        const user: User = {
          ...data,
          salary: data.salary ?? 5000,
          id: uid(),
          joinedAt: today(),
        };
        set({ users: [...users, user], currentUserId: user.id });
        return { ok: true };
      },
      addEmployee: (data) => {
        const users = get().users;
        if (users.find((u) => u.email.toLowerCase() === data.email.toLowerCase()))
          return { ok: false, error: "Email already registered." };
        const joinedAt = data.joinedAt || today();
        const year = Number(joinedAt.slice(0, 4));
        const usedThisYear = users.filter((u) => (u.joinedAt || "").slice(0, 4) === String(year));
        let serial = usedThisYear.length + 1;
        let employeeId = buildEmployeeId(data.name, year, serial);
        while (users.find((u) => u.employeeId === employeeId)) {
          serial += 1;
          employeeId = buildEmployeeId(data.name, year, serial);
        }
        const password = generatePassword();
        const user: User = {
          ...data,
          employeeId,
          password,
          role: "employee",
          id: uid(),
          joinedAt,
        };
        set({ users: [...users, user] });
        return { ok: true, employeeId, password };
      },
      signIn: (email, password) => {
        const u = get().users.find(
          (x) =>
            (x.email.toLowerCase() === email.toLowerCase() ||
              x.employeeId.toLowerCase() === email.toLowerCase()) &&
            x.password === password,
        );
        if (!u) return { ok: false, error: "Invalid credentials." };
        set({ currentUserId: u.id });
        return { ok: true };
      },
      signOut: () => set({ currentUserId: null }),
      updateProfile: (id, data) =>
        set({ users: get().users.map((u) => (u.id === id ? { ...u, ...data } : u)) }),
      changePassword: (id, current, next) => {
        const u = get().users.find((x) => x.id === id);
        if (!u) return { ok: false, error: "User not found." };
        if (u.password !== current) return { ok: false, error: "Current password is incorrect." };
        if (next.length < 8) return { ok: false, error: "New password must be at least 8 characters." };
        set({ users: get().users.map((x) => (x.id === id ? { ...x, password: next } : x)) });
        return { ok: true };
      },
      checkIn: (userId) => {
        const t = today();
        const existing = get().attendance.find((a) => a.userId === userId && a.date === t);
        const now = new Date().toTimeString().slice(0, 5);
        if (existing) {
          set({
            attendance: get().attendance.map((a) =>
              a.id === existing.id ? { ...a, checkIn: a.checkIn ?? now, status: "present" } : a,
            ),
          });
        } else {
          set({
            attendance: [
              ...get().attendance,
              { id: uid(), userId, date: t, checkIn: now, status: "present" },
            ],
          });
        }
      },
      checkOut: (userId) => {
        const t = today();
        const now = new Date().toTimeString().slice(0, 5);
        set({
          attendance: get().attendance.map((a) =>
            a.userId === userId && a.date === t ? { ...a, checkOut: now } : a,
          ),
        });
      },
      applyLeave: (data) =>
        set({
          leaves: [
            {
              ...data,
              id: uid(),
              status: "pending",
              createdAt: new Date().toISOString(),
            },
            ...get().leaves,
          ],
        }),
      reviewLeave: (id, status, adminComment) =>
        set({
          leaves: get().leaves.map((l) =>
            l.id === id ? { ...l, status, adminComment: adminComment ?? l.adminComment } : l,
          ),
        }),
      updateSalary: (userId, salary) =>
        set({ users: get().users.map((u) => (u.id === userId ? { ...u, salary } : u)) }),
    }),
    {
      name: "hrms-store",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

export const useCurrentUser = () => {
  const id = useHR((s) => s.currentUserId);
  const users = useHR((s) => s.users);
  return users.find((u) => u.id === id) ?? null;
};