import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  User as UserIcon,
  CalendarCheck,
  CalendarClock,
  Wallet,
  Users,
  ClipboardCheck,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useCurrentUser, useHR } from "@/lib/hr-store";
import { cn } from "@/lib/utils";

type Item = { to: string; label: string; icon: typeof UserIcon; admin?: boolean; employee?: boolean };

const items: Item[] = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, admin: true, employee: true },
  { to: "/app/profile", label: "My Profile", icon: UserIcon, employee: true },
  { to: "/app/attendance", label: "Attendance", icon: CalendarCheck, employee: true },
  { to: "/app/leave", label: "Leave & Time-Off", icon: CalendarClock, employee: true },
  { to: "/app/payroll", label: "My Payroll", icon: Wallet, employee: true },
  { to: "/app/admin/employees", label: "Employees", icon: Users, admin: true },
  { to: "/app/admin/leave", label: "Leave Approvals", icon: ClipboardCheck, admin: true },
  { to: "/app/admin/payroll", label: "Payroll Control", icon: Wallet, admin: true },
  { to: "/app/admin/audit", label: "Payroll Accuracy", icon: ShieldCheck, admin: true },
];

export function AppShell({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  const signOut = useHR((s) => s.signOut);
  const nav = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  const visible = items.filter((i) =>
    user.role === "admin" ? i.admin : i.employee,
  );

  const initials = user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const Sidebar = (
    <div className="w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col h-full">
      <div className="hidden lg:flex items-center gap-3 px-6 h-16 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-primary grid place-items-center text-primary-foreground shadow-glow">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="font-display font-bold text-lg">HR Management System</div>
      </div>

      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center font-semibold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{user.name}</div>
            <div className="text-xs text-sidebar-foreground/60 truncate">
              {user.role === "admin" ? "HR / Admin" : user.position ?? "Employee"}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {visible.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => {
            signOut();
            nav({ to: "/login" });
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent transition"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 glass border-b flex items-center justify-between px-4 h-14">
        <Link to="/app/dashboard" className="flex items-center gap-2 font-display font-bold">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary grid place-items-center text-primary-foreground">
            <Sparkles className="w-4 h-4" />
          </div>
          <span>HR Management System</span>
        </Link>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-md hover:bg-muted transition"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
        {Sidebar}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 h-full lg:hidden"
            >
              <div className="relative h-full">
                {Sidebar}
                <button
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="absolute top-3 right-3 p-2 rounded-md text-sidebar-foreground/80 hover:bg-sidebar-accent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 min-w-0">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}