import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme, useApplyTheme } from "@/lib/theme";
import { toast } from "sonner";
// import Logo from "./logo.jpg";
import Logo from "@/assets/logo.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · AMS · CDGI ECE" },
      { name: "description", content: "Sign in to the Asset Management System for CDGI ECE Department." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  useApplyTheme();
  const { theme, toggle } = useTheme();
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) { toast.error("Enter email and password"); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate({ to: "/" });
    } catch {
      toast.error("Could not sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative grid min-h-screen w-full grid-cols-1 overflow-hidden bg-background lg:grid-cols-2">
      {/* Left: visual */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-charcoal p-10 text-sidebar-foreground lg:flex">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-gold/30 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-gold/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white p-1">
            <img
              src={Logo}
              alt="CDGI Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <p className="font-display text-base font-semibold">Chameli Devi Group of Institutions</p>
            <p className="text-xs text-sidebar-foreground/60">Department of Electronics & Communication Engineering</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-md"
        >
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-gold">
            Asset Management System · v1.0
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight">
            Operate every <span className="gold-text">lab, device & transfer</span> from one elegant cockpit.
          </h1>
          <p className="mt-4 text-sm text-sidebar-foreground/70">
            Built for the RGPV ECE curriculum — track 20+ labs, instruments, machines and tools with an interface designed to feel calm at scale.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-sidebar-foreground/80">
            {["Realtime lab analytics", "Inter-lab asset transfers", "Working / non-working tracking", "PDF & Excel reporting"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />{f}
              </li>
            ))}
          </ul>
        </motion.div>

        <p className="relative text-xs text-sidebar-foreground/50">© {new Date().getFullYear()} CDGI · Indore</p>
      </div>

      {/* Right: form */}
      <div className="relative flex items-center justify-center p-6 sm:p-10">
        <button
          onClick={toggle}
          className="absolute right-6 top-6 rounded-lg border border-border bg-card px-3 py-1.5 text-xs"
        >
          {theme === "dark" ? "Light" : "Dark"} mode
        </button>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
             <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white p-1">
              <img
                src={Logo}
                alt="CDGI Logo"
                className="h-full w-full object-contain"
              />
</div>
              <p className="font-display font-semibold">CDGI · ECE · AMS</p>
            </div>
          </div>

          <h2 className="font-display text-3xl font-semibold">Sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with your registered account to continue managing labs, devices, and transfers.
          </p>

          <div className="mt-8 space-y-4">
            <Field icon={<Mail className="h-4 w-4" />} label="Email">
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="you@cdgi.edu.in"
                autoComplete="email"
              />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />} label="Password">
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </Field>
          </div>

          <button
            type="submit" disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl gold-gradient px-4 py-3 text-sm font-semibold text-charcoal shadow-lg shadow-gold/20 transition hover:shadow-gold/40 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
          </button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            New here? <Link to="/signup" className="font-medium text-gold hover:underline">Create an account</Link>
          </p>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Need help? Contact <Link to="/" className="text-gold hover:underline">ECE Admin Office</Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 transition focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/20">
        <span className="text-muted-foreground">{icon}</span>
        {children}
      </span>
    </label>
  );
}
