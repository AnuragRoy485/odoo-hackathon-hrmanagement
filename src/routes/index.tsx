import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  CalendarCheck,
  ClipboardCheck,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
  Wallet,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero />
      <LogoStrip />
      <Features />
      <Workflow />
      <Preview />
      <CTA />
      <Footer />
    </div>
  );
}

function Brand({ size = "md" }: { size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const icon = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <Link to="/" className="flex items-center gap-2.5 font-display font-bold">
      <div className={`${dim} rounded-xl bg-gradient-primary grid place-items-center text-primary-foreground shadow-glow`}>
        <Sparkles className={icon} />
      </div>
      <span className={size === "sm" ? "text-sm" : "text-base sm:text-lg"}>
        HR Management System
      </span>
    </Link>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
        <Brand />
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#workflow" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#preview" className="hover:text-foreground transition-colors">Preview</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden sm:inline-flex px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted transition"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-glow transition-all"
          >
            Get started
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, reduce ? 0 : -80]);
  const y2 = useTransform(scrollY, [0, 600], [0, reduce ? 0 : 120]);
  const y3 = useTransform(scrollY, [0, 600], [0, reduce ? 0 : -160]);
  const heroY = useTransform(scrollY, [0, 600], [0, reduce ? 0 : 60]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, reduce ? 1 : 0.4]);

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <motion.div
          style={{ y: y1 }}
          className="absolute -top-32 -left-40 w-[520px] h-[520px] rounded-full bg-gradient-mesh opacity-40 blur-3xl animate-blob"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute top-40 -right-40 w-[560px] h-[560px] rounded-full bg-gradient-primary opacity-25 blur-3xl animate-blob"
        />
        <motion.div
          style={{ y: y3 }}
          className="absolute top-[440px] left-1/3 w-[400px] h-[400px] rounded-full bg-primary/20 blur-3xl animate-blob"
        />
      </div>

      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-24 sm:pb-36 text-center relative"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary mb-7 backdrop-blur"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Human Resource Management System
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-7xl lg:text-[5.5rem] font-display font-bold tracking-tight leading-[1.02]"
        >
          Every workday,
          <br />
          <span className="text-gradient inline-block">perfectly aligned.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-7 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Onboard employees, track attendance, approve leave, and manage payroll — all
          from one calm, modern workspace built for growing teams.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/signup"
            className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-primary text-primary-foreground font-semibold shadow-elegant hover:shadow-glow transition-all hover:-translate-y-0.5"
          >
            <span>Create your workspace</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-border bg-card/70 backdrop-blur font-semibold hover:bg-muted transition"
          >
            Sign in
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"
        >
          {["Role-based access", "Email verification", "Live payroll", "Calendar leaves"].map((t) => (
            <div key={t} className="inline-flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-primary" />
              {t}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

function LogoStrip() {
  const items = ["Northwind", "Acme Co.", "Lumen Labs", "Vertex", "Sable & Co.", "Meridian"];
  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm">
        <span className="text-xs uppercase tracking-widest font-semibold text-primary/70">Trusted by teams at</span>
        {items.map((n) => (
          <span key={n} className="font-display font-semibold text-foreground/60 hover:text-foreground transition">
            {n}
          </span>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const feats = [
    { icon: ShieldCheck, title: "Secure authentication", body: "Sign up with role-based access for Admins & Employees. Password rules, email verification, and session control built in." },
    { icon: Users, title: "Employee profiles", body: "Personal, job, salary, and document details in one place. Employees edit what they own; admins manage everything." },
    { icon: CalendarCheck, title: "Attendance tracking", body: "One-tap check-in/out with daily and weekly views. Present, absent, half-day, and leave — all clearly marked." },
    { icon: ClipboardCheck, title: "Leave workflows", body: "Employees apply via calendar; admins approve, reject, or comment. Changes reflect in records instantly." },
    { icon: Wallet, title: "Payroll visibility", body: "Employees see their salary structure read-only. Admins update structures and keep payroll perfectly accurate." },
    { icon: UserCog, title: "Admin & HR controls", body: "Approve leave, edit records, and switch between employees — everything HR needs, nothing in the way." },
  ];
  return (
    <section id="features" className="py-24 sm:py-32 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-2xl"
        >
          <div className="text-sm font-semibold text-primary uppercase tracking-widest">
            Everything HR needs
          </div>
          <h2 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight">
            Built for the <span className="text-gradient">whole team.</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
            From the new hire's first day to their next promotion, HR Management System keeps every
            record, request, and paycheck moving.
          </p>
        </motion.div>
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {feats.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl border border-border/70 bg-gradient-card p-7 shadow-soft hover:shadow-elegant transition-all overflow-hidden"
              >
                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-soft">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-display font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Workflow() {
  const steps = [
    { n: "01", t: "Sign up & set roles", d: "Register with an Employee ID, email, and password. Admins get full control; employees get personal dashboards." },
    { n: "02", t: "Onboard & manage profiles", d: "Fill in job, salary, and documents. Employees update what's theirs; admins manage the rest." },
    { n: "03", t: "Track attendance daily", d: "Check-in and check-out with one tap. See the whole week at a glance." },
    { n: "04", t: "Approve leave in seconds", d: "Employees apply on a calendar; admins approve, reject, or comment. Records update instantly." },
  ];
  return (
    <section id="workflow" className="relative py-24 sm:py-32 overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-mesh opacity-[0.06] blur-2xl" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold text-primary uppercase tracking-widest">
            How it works
          </div>
          <h2 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight">
            Four steps from chaos to <span className="text-gradient">calm.</span>
          </h2>
        </div>
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="relative rounded-2xl border border-border/70 bg-card p-7 shadow-soft hover:shadow-elegant transition"
            >
              <div className="text-5xl font-display font-bold text-gradient leading-none">{s.n}</div>
              <h3 className="mt-5 font-display font-semibold text-lg">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Preview() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 60, reduce ? 0 : -60]);
  const rotate = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 2, reduce ? 0 : -2]);

  return (
    <section id="preview" ref={ref} className="py-24 sm:py-32 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <div className="text-sm font-semibold text-primary uppercase tracking-widest">A workspace you'll enjoy</div>
        <h2 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight">
          A single pane of <span className="text-gradient">glass.</span>
        </h2>
        <p className="mt-5 text-muted-foreground text-lg max-w-2xl mx-auto">
          Everything HR — from attendance to payroll — presented with clarity and pace.
        </p>

        <motion.div style={{ y, rotate }} className="mt-14 mx-auto max-w-5xl">
          <div className="relative rounded-3xl border border-border/70 shadow-elegant overflow-hidden bg-gradient-card">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="p-3 bg-muted/60 border-b border-border/70 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-warning/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-success/70" />
              <div className="text-xs text-muted-foreground ml-3 font-mono">app.hrms.io/dashboard</div>
            </div>
            <div className="p-6 sm:p-10 grid sm:grid-cols-3 gap-4">
              {[
                { label: "Active employees", value: "142" },
                { label: "Pending approvals", value: "8" },
                { label: "Payroll this month", value: "₹284L" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="rounded-2xl border border-border/70 bg-card p-5 text-left shadow-soft"
                >
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                    {s.label}
                  </div>
                  <div className="text-3xl font-display font-bold mt-2">{s.value}</div>
                  <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${60 + i * 12}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                      className="h-full bg-gradient-primary"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-primary p-12 sm:p-20 text-primary-foreground shadow-elegant text-center"
        >
          <div className="absolute inset-0 bg-gradient-mesh opacity-30 mix-blend-overlay" />
          <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_80%,white,transparent_40%)]" />
          <div className="relative">
            <h2 className="text-4xl sm:text-6xl font-display font-bold tracking-tight">
              Ready to align your workday?
            </h2>
            <p className="mt-5 text-primary-foreground/85 text-lg max-w-lg mx-auto">
              Get started with the demo workspace in seconds — no credit card required.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                to="/signup"
                className="px-7 py-3.5 rounded-xl bg-white text-primary font-semibold shadow-soft hover:shadow-glow hover:-translate-y-0.5 transition-all"
              >
                Create workspace
              </Link>
              <Link
                to="/login"
                className="px-7 py-3.5 rounded-xl border border-white/40 backdrop-blur font-semibold hover:bg-white/10 transition"
              >
                Try demo login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/70 py-10 text-sm text-muted-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
        <Brand size="sm" />
        <div>© {new Date().getFullYear()} · Every workday, perfectly aligned.</div>
      </div>
    </footer>
  );
}
