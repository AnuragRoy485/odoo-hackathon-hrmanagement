import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, X, UserPlus, Copy, CheckCircle2 } from "lucide-react";
import { useHR, buildEmployeeId, type User } from "@/lib/hr-store";
import { PageHeader } from "@/components/ui-bits";

export const Route = createFileRoute("/app/admin/employees")({
  component: EmployeesAdmin,
  head: () => ({ meta: [{ title: "Employees — HR Management System" }] }),
});

function EmployeesAdmin() {
  const allUsers = useHR((s) => s.users);
  const users = useMemo(() => allUsers.filter((u) => u.role === "employee"), [allUsers]);
  const updateProfile = useHR((s) => s.updateProfile);
  const addEmployee = useHR((s) => s.addEmployee);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [adding, setAdding] = useState(false);
  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.employeeId.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Employees"
        subtitle="Manage the team and their details."
        action={
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant hover:shadow-glow transition"
          >
            <UserPlus className="w-4 h-4" /> Add employee
          </button>
        }
      />

      <div className="rounded-2xl border bg-card shadow-soft overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-ring outline-none" />
          </div>
          <div className="text-sm text-muted-foreground">{filtered.length} employees</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b bg-muted/30">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3 hidden sm:table-cell">Role</th>
                <th className="px-4 py-3 hidden md:table-cell">Department</th>
                <th className="px-4 py-3 hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3">Salary</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} onClick={() => setSelected(u)}
                  className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-xs font-semibold shrink-0">
                        {u.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{u.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.email} · {u.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">{u.position ?? "—"}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{u.department ?? "—"}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">{u.joinedAt}</td>
                  <td className="px-4 py-3 font-mono">₹{u.salary.toLocaleString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <EditDrawer
          user={selected}
          onClose={() => setSelected(null)}
          onSave={(data) => {
            updateProfile(selected.id, data);
            toast.success("Employee updated");
            setSelected(null);
          }}
        />
      )}

      {adding && (
        <AddDrawer
          existingUsers={allUsers}
          onClose={() => setAdding(false)}
          onCreated={(data) => {
            const res = addEmployee(data);
            if (!res.ok || !res.employeeId || !res.password) {
              toast.error(res.error ?? "Could not add employee");
              return null;
            }
            toast.success(`${data.name} added to the team`);
            return { employeeId: res.employeeId, password: res.password };
          }}
        />
      )}
    </>
  );
}

function DrawerShell({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div className="w-full max-w-md bg-card h-full overflow-y-auto shadow-elegant animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-xl">{title}</h3>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-ring outline-none";

function EditDrawer({ user, onClose, onSave }: { user: User; onClose: () => void; onSave: (data: Partial<User>) => void }) {
  const [form, setForm] = useState({
    name: user.name, position: user.position ?? "", department: user.department ?? "",
    phone: user.phone ?? "", address: user.address ?? "", salary: user.salary,
  });
  return (
    <DrawerShell title="Edit employee" subtitle={user.employeeId} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="p-6 space-y-4">
        {([
          ["name", "Full name"], ["position", "Position"], ["department", "Department"],
          ["phone", "Phone"], ["address", "Address"],
        ] as const).map(([k, label]) => (
          <Field key={k} label={label}>
            <input value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={inputCls} />
          </Field>
        ))}
        <Field label="Salary (monthly, INR)">
          <input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} className={inputCls} />
        </Field>
        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant hover:shadow-glow transition">
          Save changes
        </button>
      </form>
    </DrawerShell>
  );
}

type NewEmployee = Omit<User, "id" | "joinedAt" | "role" | "employeeId" | "password"> & { joinedAt?: string };

function AddDrawer({
  existingUsers,
  onClose,
  onCreated,
}: {
  existingUsers: User[];
  onClose: () => void;
  onCreated: (data: NewEmployee) => { employeeId: string; password: string } | null;
}) {
  const [form, setForm] = useState<NewEmployee>({
    name: "",
    email: "",
    phone: "",
    address: "",
    position: "",
    department: "",
    salary: 5000,
    joinedAt: new Date().toISOString().slice(0, 10),
  });
  const [created, setCreated] = useState<{ employeeId: string; password: string } | null>(null);

  const set = <K extends keyof NewEmployee>(k: K, v: NewEmployee[K]) => setForm((f) => ({ ...f, [k]: v }));

  const year = Number((form.joinedAt || "").slice(0, 4)) || new Date().getFullYear();
  const usedThisYear = existingUsers.filter((u) => (u.joinedAt || "").slice(0, 4) === String(year)).length;
  const previewId = form.name.trim()
    ? buildEmployeeId(form.name, year, usedThisYear + 1)
    : `OI__${year}${String(usedThisYear + 1).padStart(4, "0")}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    const res = onCreated(form);
    if (res) setCreated(res);
  };

  const copy = (v: string, label: string) => {
    navigator.clipboard?.writeText(v);
    toast.success(`${label} copied`);
  };

  if (created) {
    return (
      <DrawerShell title="Employee created" subtitle="Share these credentials securely" onClose={onClose}>
        <div className="p-6 space-y-5">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold">{form.name} is now part of the team.</div>
              <div className="text-muted-foreground mt-1">
                They can sign in with the Login ID and password below and change their password from the profile page.
              </div>
            </div>
          </div>

          <CredentialRow label="Login ID" value={created.employeeId} onCopy={() => copy(created.employeeId, "Login ID")} />
          <CredentialRow label="Temporary password" value={created.password} onCopy={() => copy(created.password, "Password")} />

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant hover:shadow-glow transition"
          >
            Done
          </button>
        </div>
      </DrawerShell>
    );
  }

  return (
    <DrawerShell title="Add employee" subtitle="Login ID and password are generated automatically" onClose={onClose}>
      <form onSubmit={submit} className="p-6 space-y-4">
        <Field label="Full name">
          <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="e.g. John Doe" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email">
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Joined on">
            <input type="date" value={form.joinedAt} onChange={(e) => set("joinedAt", e.target.value)} className={inputCls} />
          </Field>
        </div>

        <div className="rounded-xl border bg-muted/40 p-3 text-xs">
          <div className="text-muted-foreground">Generated Login ID preview</div>
          <div className="font-mono text-sm mt-1 font-semibold text-primary">{previewId}</div>
          <div className="text-muted-foreground mt-1">
            Format: OI + first two letters of first & last name + joining year + serial number.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Position">
            <input value={form.position ?? ""} onChange={(e) => set("position", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Department">
            <input value={form.department ?? ""} onChange={(e) => set("department", e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label="Phone">
          <input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Address">
          <input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Salary (monthly, INR)">
          <input type="number" value={form.salary} onChange={(e) => set("salary", Number(e.target.value))} className={inputCls} />
        </Field>
        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant hover:shadow-glow transition">
          Create employee
        </button>
      </form>
    </DrawerShell>
  );
}

function CredentialRow({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="font-mono text-base font-semibold break-all">{value}</div>
        <button onClick={onCopy} className="p-2 rounded-lg border hover:bg-muted transition shrink-0" aria-label={`Copy ${label}`}>
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


