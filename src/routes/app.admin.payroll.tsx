import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Save, Wallet } from "lucide-react";
import { useHR } from "@/lib/hr-store";
import { PageHeader, StatCard } from "@/components/ui-bits";

export const Route = createFileRoute("/app/admin/payroll")({
  component: AdminPayroll,
  head: () => ({ meta: [{ title: "Payroll — HR Management System" }] }),
});

function AdminPayroll() {
  const allUsers = useHR((s) => s.users);
  const users = useMemo(() => allUsers.filter((u) => u.role === "employee"), [allUsers]);
  const updateSalary = useHR((s) => s.updateSalary);
  const [drafts, setDrafts] = useState<Record<string, number>>({});

  const total = users.reduce((s, u) => s + (drafts[u.id] ?? u.salary), 0);
  const avg = users.length ? Math.round(total / users.length) : 0;

  const save = (id: string) => {
    const val = drafts[id];
    if (val === undefined) return;
    updateSalary(id, val);
    setDrafts({ ...drafts, [id]: undefined as any });
    toast.success("Salary updated");
  };

  return (
    <>
      <PageHeader title="Payroll Control" subtitle="Update salary structures across the team." />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Employees" value={users.length} tone="primary" icon={<Wallet className="w-5 h-5" />} />
        <StatCard label="Monthly total" value={`₹${total.toLocaleString()}`} tone="success" />
        <StatCard label="Average salary" value={`₹${avg.toLocaleString()}`} />
      </div>

      <div className="rounded-2xl border bg-card shadow-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b bg-muted/30">
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3 hidden md:table-cell">Position</th>
              <th className="px-4 py-3">Salary (INR)</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const draft = drafts[u.id];
              const dirty = draft !== undefined && draft !== u.salary;
              return (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-xs font-semibold shrink-0">
                        {u.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{u.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">{u.position ?? "—"}</td>
                  <td className="px-4 py-3">
                    <input type="number"
                      value={draft ?? u.salary}
                      onChange={(e) => setDrafts({ ...drafts, [u.id]: Number(e.target.value) })}
                      className="w-32 px-3 py-1.5 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-ring outline-none" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => save(u.id)} disabled={!dirty}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition">
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
