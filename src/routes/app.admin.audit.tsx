import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { useHR } from "@/lib/hr-store";
import { PageHeader, StatCard } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/admin/audit")({
  component: PayrollAudit,
  head: () => ({ meta: [{ title: "Payroll Accuracy — HR Management System" }] }),
});

type Severity = "critical" | "warning" | "info";
type Issue = { userId: string; employee: string; severity: Severity; message: string; suggested?: string };

// Salary band per common position; anything outside triggers a warning.
const BANDS: Record<string, [number, number]> = {
  "Senior Product Designer": [6500, 12000],
  "Backend Engineer": [7000, 13000],
  "Data Analyst": [5500, 10000],
  "HR Director": [10000, 20000],
};
const GLOBAL_MIN = 3000;

function PayrollAudit() {
  const users = useHR((s) => s.users);
  const attendance = useHR((s) => s.attendance);
  const leaves = useHR((s) => s.leaves);

  const employees = useMemo(() => users.filter((u) => u.role === "employee"), [users]);

  const issues = useMemo<Issue[]>(() => {
    const out: Issue[] = [];
    for (const u of employees) {
      if (!u.salary || u.salary <= 0) {
        out.push({ userId: u.id, employee: u.name, severity: "critical", message: "Base salary is missing or zero." });
      } else if (u.salary < GLOBAL_MIN) {
        out.push({
          userId: u.id, employee: u.name, severity: "critical",
          message: `Salary ₹${u.salary.toLocaleString()} is below the global minimum ₹${GLOBAL_MIN.toLocaleString()}.`,
          suggested: `Raise to ₹${GLOBAL_MIN.toLocaleString()}`,
        });
      }
      const band = u.position ? BANDS[u.position] : undefined;
      if (band && u.salary) {
        const [lo, hi] = band;
        if (u.salary < lo)
          out.push({ userId: u.id, employee: u.name, severity: "warning", message: `Below band for ${u.position} (₹${lo.toLocaleString()}–₹${hi.toLocaleString()}).`, suggested: `Raise to ₹${lo.toLocaleString()}` });
        else if (u.salary > hi)
          out.push({ userId: u.id, employee: u.name, severity: "warning", message: `Above band for ${u.position} (₹${lo.toLocaleString()}–₹${hi.toLocaleString()}).` });
      }
      if (!u.position) out.push({ userId: u.id, employee: u.name, severity: "info", message: "Position not set — cannot verify salary band." });
      if (!u.department) out.push({ userId: u.id, employee: u.name, severity: "info", message: "Department not set — payroll cost centre unassigned." });

      // Unpaid-leave adjustment awareness
      const unpaidDays = leaves
        .filter((l) => l.userId === u.id && l.status === "approved" && l.type === "unpaid")
        .reduce((s, l) => {
          const from = new Date(l.from); const to = new Date(l.to);
          return s + Math.max(1, Math.round((+to - +from) / 86400000) + 1);
        }, 0);
      if (unpaidDays > 0) {
        const deduction = Math.round((u.salary / 30) * unpaidDays);
        out.push({
          userId: u.id, employee: u.name, severity: "info",
          message: `${unpaidDays} unpaid-leave day(s) not yet reflected in payroll.`,
          suggested: `Deduct ~₹${deduction.toLocaleString()}`,
        });
      }

      // Attendance vs payroll: absences > 4 flag review
      const monthPrefix = new Date().toISOString().slice(0, 7);
      const absences = attendance.filter((a) => a.userId === u.id && a.status === "absent" && a.date.startsWith(monthPrefix)).length;
      if (absences >= 4) {
        out.push({
          userId: u.id, employee: u.name, severity: "warning",
          message: `${absences} absent days this month — verify pay adjustment.`,
        });
      }
    }
    return out;
  }, [employees, leaves, attendance]);

  const bySeverity = {
    critical: issues.filter((i) => i.severity === "critical").length,
    warning: issues.filter((i) => i.severity === "warning").length,
    info: issues.filter((i) => i.severity === "info").length,
  };

  const totalPayroll = employees.reduce((s, u) => s + u.salary, 0);
  const flagged = new Set(issues.map((i) => i.userId));
  const cleanCount = employees.length - flagged.size;
  const accuracy = employees.length ? Math.round((cleanCount / employees.length) * 100) : 100;

  return (
    <>
      <PageHeader
        title="Payroll Accuracy"
        subtitle="Automated checks that surface payroll issues before pay day."
        action={
          <Link
            to="/app/admin/payroll"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-semibold shadow-soft hover:shadow-glow transition"
          >
            <Wallet className="w-4 h-4" /> Open Payroll Control
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Accuracy score"
          value={`${accuracy}%`}
          tone={accuracy >= 90 ? "success" : "warning"}
          icon={<ShieldCheck className="w-5 h-5" />}
          hint={`${cleanCount} of ${employees.length} clean`}
        />
        <StatCard label="Monthly payroll" value={`₹${totalPayroll.toLocaleString()}`} tone="primary" icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard label="Critical" value={bySeverity.critical} tone="warning" />
        <StatCard label="Warnings" value={bySeverity.warning} tone="warning" />
      </div>

      {/* Accuracy bar */}
      <div className="rounded-2xl border bg-gradient-card p-5 shadow-soft mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">Payroll health</div>
          <div className="text-xs text-muted-foreground">{cleanCount} clean · {flagged.size} needing review</div>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden flex">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${accuracy}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={cn(
              "h-full",
              accuracy >= 90 ? "bg-success" : accuracy >= 70 ? "bg-warning" : "bg-destructive",
            )}
          />
        </div>
      </div>

      {/* Issues */}
      <div className="rounded-2xl border bg-card shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-display font-semibold">Findings</h3>
          <span className="ml-auto text-xs text-muted-foreground">{issues.length} total</span>
        </div>
        {issues.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto text-success mb-3" />
            <div className="font-display font-semibold">All clear.</div>
            <p className="text-sm text-muted-foreground mt-1">Every employee's payroll passes the audit rules.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {issues.map((i, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="px-5 py-4 flex flex-wrap items-start gap-4"
              >
                <SeverityDot severity={i.severity} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{i.employee}</div>
                  <div className="text-sm text-muted-foreground">{i.message}</div>
                  {i.suggested && (
                    <div className="mt-1 text-xs font-medium text-primary">→ {i.suggested}</div>
                  )}
                </div>
                <Link
                  to="/app/admin/payroll"
                  className="text-xs font-semibold text-primary hover:underline shrink-0"
                >
                  Review →
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {/* Rule list */}
      <div className="mt-6 rounded-2xl border bg-muted/30 p-5 text-sm text-muted-foreground">
        <div className="font-semibold text-foreground mb-2">Rules applied</div>
        <ul className="list-disc pl-5 space-y-1">
          <li>Base salary must be present and above ₹{GLOBAL_MIN.toLocaleString()}.</li>
          <li>Salary must fall within the band for the employee's position.</li>
          <li>Position &amp; department must be assigned for cost-centre reporting.</li>
          <li>Approved unpaid leave must be reflected as a deduction.</li>
          <li>4+ absences this month flag payroll for manual review.</li>
        </ul>
      </div>
    </>
  );
}

function SeverityDot({ severity }: { severity: Severity }) {
  const map = {
    critical: "bg-destructive/15 text-destructive ring-destructive/30",
    warning: "bg-warning/25 text-warning-foreground ring-warning/40",
    info: "bg-primary/10 text-primary ring-primary/25",
  } as const;
  const label = { critical: "Critical", warning: "Warning", info: "Info" }[severity];
  return (
    <span className={cn("shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ring-1", map[severity])}>
      <AlertTriangle className="w-3 h-3" /> {label}
    </span>
  );
}
