import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useCurrentUser, useHR, type LeaveType } from "@/lib/hr-store";
import { PageHeader, StatusBadge } from "@/components/ui-bits";

export const Route = createFileRoute("/app/leave")({
  component: LeavePage,
  head: () => ({ meta: [{ title: "Leave — HR Management System" }] }),
});

function LeavePage() {
  const user = useCurrentUser()!;
  const allLeaves = useHR((s) => s.leaves);
  const leaves = useMemo(() => allLeaves.filter((l) => l.userId === user.id), [allLeaves, user.id]);
  const applyLeave = useHR((s) => s.applyLeave);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "paid" as LeaveType,
    from: new Date().toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
    remarks: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(form.to) < new Date(form.from)) {
      toast.error("End date must be after start date.");
      return;
    }
    applyLeave({ userId: user.id, ...form });
    toast.success("Leave request submitted");
    setOpen(false);
    setForm({ ...form, remarks: "" });
  };

  return (
    <>
      <PageHeader title="Leave & Time-Off" subtitle="Apply for leave and track approvals."
        action={
          <button onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-soft hover:shadow-glow transition">
            <Plus className="w-4 h-4" /> New request
          </button>
        }
      />

      <div className="rounded-2xl border bg-gradient-card p-4 sm:p-6 shadow-soft">
        <h3 className="font-display font-semibold text-lg">Your requests</h3>
        <div className="mt-4 space-y-3">
          {leaves.length === 0 && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No leave requests yet.
            </div>
          )}
          {leaves.map((l) => (
            <div key={l.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold capitalize">{l.type} leave</span>
                    <StatusBadge status={l.status} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {l.from} → {l.to}
                  </div>
                  {l.remarks && <div className="text-sm mt-2">{l.remarks}</div>}
                  {l.adminComment && (
                    <div className="text-xs mt-2 p-2 rounded-lg bg-muted">
                      <span className="font-medium">HR note:</span> {l.adminComment}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-card border p-6 shadow-elegant space-y-4">
            <h3 className="text-xl font-display font-bold">New leave request</h3>
            <label className="block">
              <span className="text-sm font-medium mb-1.5 block">Type</span>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as LeaveType })}
                className="w-full px-4 py-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-ring outline-none">
                <option value="paid">Paid</option>
                <option value="sick">Sick</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">From</span>
                <input type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-ring" />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">To</span>
                <input type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-ring" />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium mb-1.5 block">Remarks</span>
              <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                rows={3} placeholder="Reason for leave..."
                className="w-full px-4 py-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-ring outline-none resize-none" />
            </label>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border hover:bg-muted transition">Cancel</button>
              <button type="submit"
                className="px-4 py-2 rounded-lg bg-gradient-primary text-primary-foreground font-semibold shadow-soft hover:shadow-glow transition">
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
