import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCurrentUser, useHR } from "@/lib/hr-store";

export function RequireAuth({
  children,
  role,
}: {
  children: ReactNode;
  role?: "admin" | "employee";
}) {
  const user = useCurrentUser();
  const hydrated = useHR((s) => s.hydrated);
  const nav = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) nav({ to: "/login" });
    else if (role && user.role !== role) nav({ to: "/app/dashboard" });
  }, [user, hydrated, role, nav]);

  if (!hydrated || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return <>{children}</>;
}
