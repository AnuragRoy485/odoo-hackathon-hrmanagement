import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, LogIn, LogOut, Timer } from "lucide-react";
import { useCurrentUser, useHR, type AttendanceStatus, type LeaveStatus, type LeaveType } from "@/lib/hr-store";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/attendance")({
  component: AttendancePage,
  head: () => ({ meta: [{ title: "Attendance — HR Management System" }] }),
});

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseIso = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

function AttendancePage() {
  const user = useCurrentUser()!;
  const allRecords = useHR((s) => s.attendance);
  const allLeaves = useHR((s) => s.leaves);
  const records = useMemo(() => allRecords.filter((a) => a.userId === user.id), [allRecords, user.id]);
  const leaves = useMemo(() => allLeaves.filter((l) => l.userId === user.id), [allLeaves, user.id]);
  const checkIn = useHR((s) => s.checkIn);
  const checkOut = useHR((s) => s.checkOut);
  const [view, setView] = useState<"month" | "week">("month");

  // Cursor month (navigable)
  const now = new Date();
  const [cursor, setCursor] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));

  // Live clock
  const [tick, setTick] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const today = iso(new Date());
  const todayRec = records.find((r) => r.date === today);
  const map = useMemo(() => new Map(records.map((r) => [r.date, r])), [records]);

  // Build map of leave-ranges → { type, status } per date
  const leaveByDate = useMemo(() => {
    const m = new Map<string, { type: LeaveType; status: LeaveStatus }>();
    for (const l of leaves) {
      const start = parseIso(l.from);
      const end = parseIso(l.to);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        // Approved wins over pending; existing approved not overwritten
        const key = iso(d);
        const prev = m.get(key);
        if (!prev || (prev.status !== "approved" && l.status === "approved")) {
          m.set(key, { type: l.type, status: l.status });
        }
      }
    }
    return m;
  }, [leaves]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthCells: (string | null)[] = [];
  for (let i = 0; i < startDow; i++) monthCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) monthCells.push(`${year}-${pad(month + 1)}-${pad(d)}`);

  const weekCells: string[] = [];
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekCells.push(iso(d));
  }

  const cellClass = (status?: AttendanceStatus, leaveStatus?: LeaveStatus) => {
    if (!status && leaveStatus === "approved") return "bg-primary/15 text-primary ring-1 ring-primary/25";
    if (!status && leaveStatus === "pending") return "bg-warning/15 text-warning-foreground ring-1 ring-warning/30";
    if (!status) return "bg-muted/40 text-muted-foreground";
    return {
      present: "bg-success/20 text-success ring-1 ring-success/30",
      absent: "bg-destructive/15 text-destructive ring-1 ring-destructive/30",
      "half-day": "bg-warning/25 text-warning-foreground ring-1 ring-warning/40",
      leave: "bg-primary/15 text-primary ring-1 ring-primary/25",
    }[status];
  };

  // Restrict counts to visible month for clarity
  const monthPrefix = `${year}-${pad(month + 1)}`;
  const monthRecords = records.filter((r) => r.date.startsWith(monthPrefix));
  const counts = monthRecords.reduce(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
    {} as Record<string, number>,
  );

  // Worked hours today
  const workedMs = (() => {
    if (!todayRec?.checkIn) return 0;
    const [ih, im] = todayRec.checkIn.split(":").map(Number);
    const start = new Date(); start.setHours(ih, im, 0, 0);
    let end = tick;
    if (todayRec.checkOut) {
      const [oh, om] = todayRec.checkOut.split(":").map(Number);
      end = new Date(); end.setHours(oh, om, 0, 0);
    }
    return Math.max(0, end.getTime() - start.getTime());
  })();
  const workedH = Math.floor(workedMs / 3_600_000);
  const workedM = Math.floor((workedMs % 3_600_000) / 60_000);
  const workedS = Math.floor((workedMs % 60_000) / 1000);

  const shiftMonth = (delta: number) => setCursor(new Date(year, month + delta, 1));

  return (
    <>
      <PageHeader
        title="Attendance"
        subtitle="Check in daily and see your history at a glance."
      />

      {/* Check-in hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-primary text-primary-foreground p-6 sm:p-8 shadow-elegant mb-6"
      >
        <div className="absolute inset-0 bg-gradient-mesh opacity-25 mix-blend-overlay" />
        <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] items-center">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-widest font-semibold opacity-80">
              {tick.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div className="mt-1 font-display font-bold text-4xl sm:text-5xl tabular-nums flex items-baseline gap-3">
              {pad(tick.getHours())}:{pad(tick.getMinutes())}
              <span className="text-lg opacity-70">:{pad(tick.getSeconds())}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Meta icon={<LogIn className="w-3.5 h-3.5" />} label="Checked in" value={todayRec?.checkIn ?? "—"} />
              <Meta icon={<LogOut className="w-3.5 h-3.5" />} label="Checked out" value={todayRec?.checkOut ?? "—"} />
              <Meta
                icon={<Timer className="w-3.5 h-3.5" />}
                label="Worked"
                value={todayRec?.checkIn ? `${pad(workedH)}:${pad(workedM)}:${pad(workedS)}` : "00:00:00"}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              onClick={() => { checkIn(user.id); toast.success("Checked in!"); }}
              disabled={!!todayRec?.checkIn}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-primary font-semibold shadow-soft hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <LogIn className="w-4 h-4" /> Check in
            </button>
            <button
              onClick={() => { checkOut(user.id); toast.success("Checked out!"); }}
              disabled={!todayRec?.checkIn || !!todayRec?.checkOut}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/40 backdrop-blur font-semibold hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <LogOut className="w-4 h-4" /> Check out
            </button>
          </div>
        </div>
      </motion.div>

      {/* Monthly stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(["present", "absent", "half-day", "leave"] as const).map((s) => (
          <div key={s} className="rounded-xl border bg-card p-4">
            <StatusBadge status={s} />
            <div className="mt-2 text-2xl font-display font-bold">{counts[s] ?? 0}</div>
            <div className="text-xs text-muted-foreground">days this month</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="rounded-2xl border bg-gradient-card p-4 sm:p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="p-2 rounded-lg hover:bg-muted transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-display font-semibold text-lg min-w-[10rem] text-center">
              {view === "month"
                ? cursor.toLocaleString(undefined, { month: "long", year: "numeric" })
                : "This week"}
            </h3>
            <button
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="p-2 rounded-lg hover:bg-muted transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCursor(new Date(now.getFullYear(), now.getMonth(), 1))}
              className="ml-2 px-3 py-1.5 rounded-lg text-xs font-medium border hover:bg-muted transition"
            >
              Today
            </button>
          </div>
          <div className="inline-flex rounded-lg border p-1 bg-background">
            {(["week", "month"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={cn("px-3 py-1.5 text-sm rounded-md capitalize transition",
                  view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-xs text-muted-foreground mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center py-1 font-medium">{d}</div>
          ))}
        </div>

        {view === "month" ? (
          <div className="grid grid-cols-7 gap-1.5">
            {monthCells.map((c, i) => {
              if (!c) return <div key={i} />;
              const rec = map.get(c);
              const lv = leaveByDate.get(c);
              const dNum = parseInt(c.slice(-2));
              const dow = new Date(year, month, dNum).getDay();
              const isWeekend = dow === 0 || dow === 6;
              const isToday = c === today;
              const label = rec?.status ?? (lv?.status === "approved" ? "leave" : lv?.status === "pending" ? "leave (p)" : "");
              return (
                <div key={c}
                  className={cn(
                    "aspect-square rounded-lg p-1.5 flex flex-col items-start justify-between text-xs transition relative overflow-hidden",
                    cellClass(rec?.status, lv?.status),
                    isWeekend && !rec && !lv && "bg-muted/20",
                    isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  )}>
                  <span className="font-semibold">{dNum}</span>
                  {label && (
                    <span className="text-[10px] font-medium capitalize hidden sm:block truncate w-full">{label}</span>
                  )}
                  {lv && (
                    <span
                      className={cn(
                        "absolute top-1 right-1 w-1.5 h-1.5 rounded-full",
                        lv.status === "approved" ? "bg-primary" : lv.status === "pending" ? "bg-warning" : "bg-destructive",
                      )}
                      title={`${lv.type} leave · ${lv.status}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            {weekCells.map((c) => {
              const rec = map.get(c);
              const lv = leaveByDate.get(c);
              const d = parseIso(c);
              return (
                <div key={c} className={cn("min-h-24 rounded-lg p-2 flex flex-col justify-between", cellClass(rec?.status, lv?.status))}>
                  <div className="text-sm font-semibold">{d.getDate()}</div>
                  <div className="text-xs">
                    {rec ? (
                      <>
                        <div className="capitalize font-medium">{rec.status}</div>
                        {rec.checkIn && <div className="text-[10px] opacity-70">In {rec.checkIn}</div>}
                      </>
                    ) : lv ? (
                      <div className="capitalize font-medium">{lv.type} · {lv.status}</div>
                    ) : (
                      <div className="opacity-50">—</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <LegendDot className="bg-success/60" label="Present" />
          <LegendDot className="bg-warning/70" label="Half-day / Pending leave" />
          <LegendDot className="bg-destructive/60" label="Absent" />
          <LegendDot className="bg-primary/70" label="Approved leave" />
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded ring-2 ring-primary ring-offset-2 ring-offset-background" /> Today
          </span>
        </div>
      </div>

      {/* Leave requests in-range */}
      {leaves.length > 0 && (
        <div className="mt-6 rounded-2xl border bg-card p-4 sm:p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-display font-semibold">Your leave requests</h3>
          </div>
          <div className="space-y-2">
            {leaves
              .slice()
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((l) => (
                <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background/50 px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium capitalize truncate">{l.type} leave · {l.from} → {l.to}</div>
                    {l.remarks && <div className="text-xs text-muted-foreground truncate">{l.remarks}</div>}
                  </div>
                  <StatusBadge status={l.status} />
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="opacity-70">{icon}</span>
      <span className="opacity-70">{label}:</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("w-3 h-3 rounded-full", className)} />
      {label}
    </span>
  );
}
