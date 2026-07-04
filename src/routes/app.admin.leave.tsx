import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { useHR } from "@/lib/hr-store";
import { PageHeader, StatusBadge } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/admin/leave")({
  component: LeaveApprovalsAdmin,
  head: () => ({ meta: [{ title: "Leave approvals — HR Management System" }] }),
});

function LeaveApprovalsAdmin() {
  const leaves = useHR((s) => s.leaves);
  const users = useHR((s) => s.users);
  const review = useHR((s) => s.reviewLeave);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [comments, setComments] = useState<Record<string, string>>({});

  const shown = leaves.filter((l) => (tab === "all" ? true : l.status === tab));

  return (
    <>
      <PageHeader title="Leave Approvals" subtitle="Review, approve, or reject leave requests." />

      <div className="inline-flex rounded-xl border p-1 bg-card mb-6">
        {(["pending", "approved", "rejected", "all"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-2 text-sm font-medium rounded-lg capitalize transition",
              tab === t ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground")}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {shown.length === 0 && (
          <div className="text-center text-muted-foreground py-16 rounded-2xl border bg-card">
            No {tab === "all" ? "" : tab} requests.
          </div>
        )}
        {shown.map((l) => {
          const u = users.find((x) => x.id === l.userId);
          return (
            <div key={l.id} className="rounded-2xl border bg-gradient-card p-5 shadow-soft">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-sm font-semibold shrink-0">
                    {u?.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold truncate">{u?.name}</span>
                      <StatusBadge status={l.status} />
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      <span className="capitalize font-medium">{l.type}</span> · {l.from} → {l.to}
                    </div>
                    {l.remarks && <div className="text-sm mt-2">{l.remarks}</div>}
                    {l.adminComment && (
                      <div className="text-xs mt-2 p-2 rounded-lg bg-muted">
                        <span className="font-medium">Note:</span> {l.adminComment}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {l.status === "pending" && (
                <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-2">
                  <input placeholder="Optional comment..."
                    value={comments[l.id] ?? ""}
                    onChange={(e) => setComments({ ...comments, [l.id]: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-ring outline-none" />
                  <div className="flex gap-2">
                    <button onClick={() => { review(l.id, "approved", comments[l.id]); toast.success("Approved"); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-success text-success-foreground font-medium hover:opacity-90 transition">
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => { review(l.id, "rejected", comments[l.id]); toast("Rejected"); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium hover:opacity-90 transition">
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
