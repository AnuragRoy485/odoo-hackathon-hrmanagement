import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Briefcase, KeyRound, Mail, MapPin, Phone, Save, Wallet } from "lucide-react";
import { useCurrentUser, useHR } from "@/lib/hr-store";
import { PageHeader } from "@/components/ui-bits";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile — HR Management System" }] }),
});

function ProfilePage() {
  const user = useCurrentUser()!;
  const updateProfile = useHR((s) => s.updateProfile);
  const changePassword = useHR((s) => s.changePassword);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [address, setAddress] = useState(user.address ?? "");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const initials = user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const save = () => {
    updateProfile(user.id, { phone, address });
    toast.success("Profile updated");
  };

  const updatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      toast.error("New passwords do not match");
      return;
    }
    const res = changePassword(user.id, current, next);
    if (!res.ok) {
      toast.error(res.error ?? "Could not update password");
      return;
    }
    setCurrent(""); setNext(""); setConfirm("");
    toast.success("Password updated");
  };

  return (
    <>
      <PageHeader title="My Profile" subtitle="Personal, job, and salary details." />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border bg-gradient-card p-6 shadow-soft">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-3xl font-display font-bold shadow-glow">
              {initials}
            </div>
            <h2 className="mt-4 text-xl font-display font-bold">{user.name}</h2>
            <div className="text-sm text-muted-foreground">{user.position ?? "Team member"}</div>
            <div className="mt-3 px-3 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium capitalize">
              {user.role}
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <Row icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
            <Row icon={<Briefcase className="w-4 h-4" />} label="Employee ID" value={user.employeeId} />
            <Row icon={<Phone className="w-4 h-4" />} label="Phone" value={user.phone ?? "—"} />
            <Row icon={<MapPin className="w-4 h-4" />} label="Address" value={user.address ?? "—"} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="font-display font-semibold text-lg">Job details</h3>
            <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
              <Info label="Position" value={user.position ?? "—"} />
              <Info label="Department" value={user.department ?? "—"} />
              <Info label="Joined" value={user.joinedAt} />
              <Info label="Role" value={user.role} />
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" /> Salary structure
            </h3>
            <div className="mt-4 grid sm:grid-cols-3 gap-4">
              <Info label="Base" value={`₹${user.salary.toLocaleString()}`} />
              <Info label="Allowances" value={`₹${Math.round(user.salary * 0.15).toLocaleString()}`} />
              <Info label="Deductions" value={`₹${Math.round(user.salary * 0.08).toLocaleString()}`} />
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Net monthly</div>
              <div className="text-xl font-display font-bold text-gradient">
                ₹{Math.round(user.salary * 1.07).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="font-display font-semibold text-lg">Edit contact info</h3>
            <p className="text-sm text-muted-foreground mt-1">You can update your phone and address.</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">Phone</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-ring outline-none" />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">Address</span>
                <input value={address} onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-ring outline-none" />
              </label>
            </div>
            <div className="mt-5">
              <button onClick={save}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-soft hover:shadow-glow transition">
                <Save className="w-4 h-4" /> Save changes
              </button>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" /> Change password
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              You signed in with a system-generated password. Set a new one you'll remember.
            </p>
            <form onSubmit={updatePassword} className="mt-4 grid sm:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">Current password</span>
                <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-ring outline-none" />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">New password</span>
                <input type="password" value={next} onChange={(e) => setNext(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-ring outline-none" />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">Confirm new password</span>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-ring outline-none" />
              </label>
              <div className="sm:col-span-3">
                <button type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-soft hover:shadow-glow transition">
                  <KeyRound className="w-4 h-4" /> Update password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-8 h-8 rounded-lg bg-muted grid place-items-center text-muted-foreground shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background/50 p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold capitalize">{value}</div>
    </div>
  );
}
