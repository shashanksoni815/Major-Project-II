import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Moon, Sun, RotateCcw, Database, Palette } from "lucide-react";
import { useAMS } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · AMS" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const resetData = useAMS((s) => s.resetData);
  const labs = useAMS((s) => s.labs);
  const devices = useAMS((s) => s.devices);
  const staff = useAMS((s) => s.staff);
  const user = useAuth((s) => s.user);
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Preferences" title="Settings" description="Theme, data and account preferences." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Section icon={<Palette className="h-5 w-5" />} title="Appearance" description="Choose your preferred theme.">
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "dark", label: "Dark", icon: Moon },
              { id: "light", label: "Light", icon: Sun },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id as "dark" | "light")}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${theme === opt.id ? "border-gold bg-gold/10" : "border-border bg-background hover:border-gold/40"}`}
              >
                <opt.icon className={`h-5 w-5 ${theme === opt.id ? "text-gold" : "text-muted-foreground"}`} />
                <span className="font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section icon={<Database className="h-5 w-5" />} title="Data" description="Refresh your workspace from the backend API.">
          <div className="mb-4 grid grid-cols-3 gap-3 text-center">
            <Stat label="Labs" value={labs.length} />
            <Stat label="Devices" value={devices.length} />
            <Stat label="Staff" value={staff.length} />
          </div>
          <button onClick={() => setResetOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:border-gold/40">
            <RotateCcw className="h-4 w-4" /> Refresh backend data
          </button>
        </Section>

        <Section title="Account" description="Signed in admin profile.">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gold-gradient text-charcoal font-semibold">
              {(user?.name ?? "A").charAt(0)}
            </div>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </Section>

        <Section title="About" description="Asset Management System for CDGI ECE Department.">
          <p className="text-sm text-muted-foreground">
            Built on the RGPV ECE curriculum. Track labs, devices, staff and transfers with a modern, animated dashboard.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">Version 1.0 · Backend-connected inventory management</p>
        </Section>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => { resetData(); toast.success("Backend data refreshed"); }}
        title="Refresh backend data?"
        description="This will reload the latest labs, devices, staff and transfers from the backend API."
        confirmText="Refresh"
      />
    </div>
  );
}

function Section({ title, description, children, icon }: { title: string; description?: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-3">
        {icon && <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/15 text-gold">{icon}</div>}
        <div>
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-3">
      <p className="font-display text-2xl font-semibold">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
