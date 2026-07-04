import { createFileRoute } from "@tanstack/react-router";
import { Download, Wallet } from "lucide-react";
import { useCurrentUser } from "@/lib/hr-store";
import { PageHeader } from "@/components/ui-bits";

export const Route = createFileRoute("/app/payroll")({
  component: PayrollPage,
  head: () => ({ meta: [{ title: "Payroll — HR Management System" }] }),
});

function PayrollPage() {
  const user = useCurrentUser()!;
  const base = user.salary;
  const allowances = Math.round(base * 0.15);
  const deductions = Math.round(base * 0.08);
  const net = base + allowances - deductions;

  const months = ["Jul", "Jun", "May", "Apr", "Mar", "Feb"].map((m, i) => ({
    m, year: 2026 - (i > 3 ? 1 : 0), amount: net - Math.round(Math.random() * 200),
  }));

  return (
    <>
      <PageHeader title="My Payroll" subtitle="Read-only view of your salary structure and history." />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border bg-gradient-primary text-primary-foreground p-6 sm:p-8 shadow-elegant relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_top_right,white,transparent_50%)]" />
          <div className="relative">
            <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
              <Wallet className="w-4 h-4" /> Current net salary
            </div>
            <div className="mt-2 text-5xl sm:text-6xl font-display font-bold">
              ₹{net.toLocaleString()}
              <span className="text-base font-normal text-primary-foreground/70"> /month</span>
            </div>

            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              <Metric label="Base" value={`₹${base.toLocaleString()}`} />
              <Metric label="Allowances" value={`+ ₹${allowances.toLocaleString()}`} />
              <Metric label="Deductions" value={`- ₹${deductions.toLocaleString()}`} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <h3 className="font-display font-semibold text-lg">Structure</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Base" value={`₹${base.toLocaleString()}`} />
            <Row label="Housing" value={`₹${Math.round(base * 0.08).toLocaleString()}`} />
            <Row label="Transport" value={`₹${Math.round(base * 0.05).toLocaleString()}`} />
            <Row label="Meal" value={`₹${Math.round(base * 0.02).toLocaleString()}`} />
            <Row label="Tax" value={`- ₹${Math.round(base * 0.06).toLocaleString()}`} />
            <Row label="Insurance" value={`- ₹${Math.round(base * 0.02).toLocaleString()}`} />
          </dl>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-6 shadow-soft">
        <h3 className="font-display font-semibold text-lg">Payslip history</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                <th className="py-3">Month</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m) => (
                <tr key={`${m.m}-${m.year}`} className="border-b last:border-0 hover:bg-muted/50 transition">
                  <td className="py-4 font-medium">{m.m} {m.year}</td>
                  <td className="py-4">₹{m.amount.toLocaleString()}</td>
                  <td className="py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success/15 text-success">
                      Paid
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur p-4">
      <div className="text-xs text-primary-foreground/70 uppercase tracking-wider">{label}</div>
      <div className="text-xl font-display font-bold mt-1">{value}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
