import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { useHR, useCurrentUser } from "@/lib/hr-store";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — HR Management System" }] }),
});

function LoginPage() {
  const nav = useNavigate();
  const user = useCurrentUser();
  const signIn = useHR((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) nav({ to: "/app/dashboard" });
  }, [user, nav]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const res = signIn(email, password);
      setLoading(false);
      if (!res.ok) {
        toast.error(res.error ?? "Sign in failed");
      } else {
        toast.success("Welcome back!");
        nav({ to: "/app/dashboard" });
      }
    }, 300);
  };

  const demo = (which: "admin" | "employee") => {
    setEmail(which === "admin" ? "admin@hrms.app" : "marcus@hrms.app");
    setPassword(which === "admin" ? "admin123" : "employee123");
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your HR workspace.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Login ID or email">
          <input
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-ring outline-none transition"
            placeholder="OIJODO20220001 or you@company.com"
          />
        </Field>
        <Field label="Password">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-11 rounded-xl border bg-background focus:ring-2 focus:ring-ring outline-none transition"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Toggle password"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant hover:shadow-glow disabled:opacity-60 transition-all flex items-center justify-center gap-2"
        >
          {loading ? "Signing in..." : (<>Sign in <ArrowRight className="w-4 h-4" /></>)}
        </button>

        <div className="pt-2 space-y-2">
          <div className="text-xs text-center text-muted-foreground">Try a demo account</div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => demo("admin")} className="px-3 py-2 rounded-lg border text-sm hover:bg-muted transition">
              HR Admin
            </button>
            <button type="button" onClick={() => demo("employee")} className="px-3 py-2 rounded-lg border text-sm hover:bg-muted transition">
              Employee
            </button>
          </div>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have a Login ID? Ask your HR admin — self sign-up is disabled.
      </p>
    </AuthLayout>
  );
}

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-hero flex flex-col">
      <div className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 font-display font-bold">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary grid place-items-center text-primary-foreground shadow-glow">
            <Sparkles className="w-4 h-4" />
          </div>
          HR Management System
        </Link>
      </div>
      <div className="flex-1 grid place-items-center px-4 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border bg-card p-8 shadow-elegant">
            <h1 className="text-2xl sm:text-3xl font-display font-bold">{title}</h1>
            <p className="text-muted-foreground mt-2">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
