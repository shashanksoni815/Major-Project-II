import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme, useApplyTheme } from "@/lib/theme";
import { toast } from "sonner";
import Logo from "@/assets/logo.jpg";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up · AMS · CDGI ECE" },
      { name: "description", content: "Register a new account for the Asset Management System." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  useApplyTheme();
  const { theme, toggle } = useTheme();
  const signup = useAuth((s) => s.signup);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password, phone);
      toast.success("Account created successfully.");
      navigate({ to: "/" });
    } catch (error) {
      toast.error((error as Error).message || "Could not create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative grid min-h-screen w-full grid-cols-1 overflow-hidden bg-background lg:grid-cols-2">
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
            Register your account and start managing your lab inventory securely.
          </h1>
          <p className="mt-4 text-sm text-sidebar-foreground/70">
            Create a staff account with email and password. Once registered, you can sign in and manage devices, labs, and transfers.
          </p>
        </motion.div>

        <p className="relative text-xs text-sidebar-foreground/50">© {new Date().getFullYear()} CDGI · Indore</p>
      </div>

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

          <h2 className="font-display text-3xl font-semibold">Create account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign up with your email and password to join the Asset Management System.
          </p>

          <div className="mt-8 space-y-4">
            <Field icon={<User className="h-4 w-4" />} label="Full name">
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Your full name"
                autoComplete="name"
              />
            </Field>
            <Field icon={<Mail className="h-4 w-4" />} label="Email">
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="you@cdgi.edu.in"
                autoComplete="email"
              />
            </Field>
            <Field icon={<Phone className="h-4 w-4" />} label="Phone (optional)">
              <input
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="1234567890"
                autoComplete="tel"
              />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />} label="Password">
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />} label="Confirm password">
              <input
                type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </Field>
          </div>

          <button
            type="submit" disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl gold-gradient px-4 py-3 text-sm font-semibold text-charcoal shadow-lg shadow-gold/20 transition hover:shadow-gold/40 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign up <ArrowRight className="h-4 w-4" /></>}
          </button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already registered? <Link to="/login" className="font-medium text-gold hover:underline">Sign in instead</Link>
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
