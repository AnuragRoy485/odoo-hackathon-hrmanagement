import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  User as UserIcon,
  Users,
  Wallet,
  LogIn,
  LogOut,
} from "lucide-react";
import { useCurrentUser, useHR } from "@/lib/hr-store";
import { PageHeader, StatCard, StatusBadge } from "@/components/ui-bits";
import { toast } from "sonner";

export const Route = createFileRoute("/app/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — HR Management System" }] }),
});

function Dashboard() {
  const user = useCurrentUser()!;
  return user.role === "admin" ? <AdminDash /> : <EmployeeDash />;
}

function EmployeeDash() {
  const user = useCurrentUser()!;
  const allAttendance = useHR((s) => s.attendance);
  const allLeaves = useHR((s) => s.leaves);
  const attendance = useMemo(() => allAttendance.filter((a) => a.userId === user.id), [allAttendance, user.id]);
  const leaves = useMemo(() => allLeaves.filter((l) => l.userId === user.id), [allLeaves, user.id]);
  const checkIn = useHR((s) => s.checkIn);
  const checkOut = useHR((s) => s.checkOut);
  const today = new Date().toISOString().slice(0, 10);
  const todayRec = attendance.find((a) => a.date === today);

  const presentDays = attendance.filter((a) => a.status === "present").length;
  const pending = leaves.filter((l) => l.status === "pending").length;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle="Here's your workspace at a glance."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Days present" value={presentDays} tone="success" icon={<CalendarCheck className="w-5 h-5" />} />
        <StatCard label="Pending leave" value={pending} tone="warning" icon={<CalendarClock className="w-5 h-5" />} />
        <StatCard label="Base salary" value={`₹${user.salary.toLocaleString()}`} tone="primary" icon={<Wallet className="w-5 h-5" />} />
        <StatCard label="Today" value={todayRec?.status ?? "not marked"} hint={todayRec?.checkIn ? `In at ${todayRec.checkIn}` : "Check in to start"} icon={<CalendarCheck className="w-5 h-5" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-2xl border bg-gradient-card p-6 shadow-soft">
          <h2 className="font-display font-semibold text-lg">Attendance today</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {todayRec?.checkIn
              ? `Checked in at ${todayRec.checkIn}${todayRec.checkOut ? `, out at ${todayRec.checkOut}` : ""}.`
              : "You haven't checked in yet today."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => { checkIn(user.id); toast.success("Checked in!"); }}
              disabled={!!todayRec?.checkIn}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-soft disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow transition">
              <LogIn className="w-4 h-4" /> Check in
            </button>
            <button
              onClick={() => { checkOut(user.id); toast.success("Checked out!"); }}
              disabled={!todayRec?.checkIn || !!todayRec?.checkOut}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border font-semibold hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition">
              <LogOut className="w-4 h-4" /> Check out
            </button>
          </div>

          <div className="mt-8">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Recent days</div>
            <div className="space-y-2">
              {attendance.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between px-4 py-3 rounded-xl border bg-card">
                  <div>
                    <div className="text-sm font-medium">{a.date}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.checkIn ? `In ${a.checkIn}` : "—"}{a.checkOut ? ` · Out ${a.checkOut}` : ""}
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="font-display font-semibold text-lg">Quick actions</h2>
          <div className="mt-4 grid gap-2">
            <QuickLink to="/app/profile" icon={<UserIcon className="w-4 h-4" />} label="My profile" />
            <QuickLink to="/app/attendance" icon={<CalendarCheck className="w-4 h-4" />} label="Attendance" />
            <QuickLink to="/app/leave" icon={<CalendarClock className="w-4 h-4" />} label="Apply for leave" />
            <QuickLink to="/app/payroll" icon={<Wallet className="w-4 h-4" />} label="My payroll" />
          </div>
        </motion.div>
      </div>
    </>
  );
}

function QuickLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-background hover:bg-muted transition group">
      <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary grid place-items-center">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      <span className="ml-auto text-muted-foreground group-hover:translate-x-0.5 transition">→</span>
    </Link>
  );
}

function AdminDash() {
  const users = useHR((s) => s.users);
  const leaves = useHR((s) => s.leaves);
  const attendance = useHR((s) => s.attendance);
  const today = new Date().toISOString().slice(0, 10);
  const pending = leaves.filter((l) => l.status === "pending");
  const presentToday = attendance.filter((a) => a.date === today && a.status === "present").length;
  const totalPayroll = users.filter((u) => u.role === "employee").reduce((s, u) => s + u.salary, 0);

  return (
    <>
      <PageHeader title="HR Command Center" subtitle="Approvals, attendance and payroll — all in one view." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total employees" value={users.filter((u) => u.role === "employee").length} tone="primary" icon={<Users className="w-5 h-5" />} />
        <StatCard label="Present today" value={presentToday} tone="success" icon={<CalendarCheck className="w-5 h-5" />} />
        <StatCard label="Leave pending" value={pending.length} tone="warning" icon={<ClipboardCheck className="w-5 h-5" />} />
        <StatCard label="Monthly payroll" value={`₹${totalPayroll.toLocaleString()}`} icon={<Wallet className="w-5 h-5" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-gradient-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Pending approvals</h2>
            <Link to="/app/admin/leave" className="text-sm text-primary hover:underline">View all →</Link>
          </div>
          <div className="mt-4 space-y-3">
            {pending.length === 0 && <div className="text-sm text-muted-foreground">Nothing waiting on you. Nice.</div>}
            {pending.slice(0, 4).map((l) => {
              const u = users.find((x) => x.id === l.userId);
              return (
                <div key={l.id} className="flex items-center justify-between p-3 rounded-xl border bg-card">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{u?.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {l.type} · {l.from} → {l.to}
                    </div>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Team roster</h2>
            <Link to="/app/admin/employees" className="text-sm text-primary hover:underline">Manage →</Link>
          </div>
          <div className="mt-4 space-y-2">
            {users.filter((u) => u.role === "employee").slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition">
                <div className="w-9 h-9 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-sm font-semibold shrink-0">
                  {u.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{u.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.position} · {u.department}</div>
                </div>
                <div className="text-sm font-mono text-muted-foreground shrink-0">{u.employeeId}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
