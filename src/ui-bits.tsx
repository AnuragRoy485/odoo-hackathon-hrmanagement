import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start sm:items-center gap-4 mb-8">
      <div className="min-w-0">
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-display font-bold tracking-tight"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "primary";
}) {
  const toneClass = {
    default: "from-card to-card",
    success: "from-success/10 to-transparent",
    warning: "from-warning/15 to-transparent",
    primary: "from-primary/10 to-transparent",
  }[tone];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-5 shadow-soft",
        "bg-gradient-to-br",
        toneClass,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-3xl font-display font-bold mt-1">{value}</div>
          {hint && <div className="text-xs text-muted-foreground mt-2">{hint}</div>}
        </div>
        {icon && (
          <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    present: "bg-success/15 text-success",
    absent: "bg-destructive/15 text-destructive",
    "half-day": "bg-warning/20 text-warning-foreground",
    leave: "bg-primary/15 text-primary",
    approved: "bg-success/15 text-success",
    pending: "bg-warning/20 text-warning-foreground",
    rejected: "bg-destructive/15 text-destructive",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize",
        map[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}