import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Save, ArrowLeft } from "lucide-react";
import { useAMS } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/labs/new")({
  head: () => ({ meta: [{ title: "Add Lab · AMS" }] }),
  component: AddLab,
});

function AddLab() {
  const addLab = useAMS((s) => s.addLab);
  const staff = useAMS((s) => s.staff);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [semester, setSemester] = useState(1);
  const [subject, setSubject] = useState("");
  const [inchargeId, setInchargeId] = useState<string>("");
  const [description, setDescription] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) { toast.error("Name and subject are required"); return; }
    const lab = await addLab({ name: name.trim(), semester, subject: subject.trim(), inchargeId: inchargeId || undefined, description: description.trim() });
    toast.success("Lab created");
    navigate({ to: "/labs/$labId", params: { labId: lab.id } });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="New Lab"
        title="Add a new lab"
        description="Create a new laboratory under the ECE department."
        actions={
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-gold">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        }
      />

      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-5 rounded-2xl border border-border bg-card p-6 md:grid-cols-2"
      >
        <Field label="Lab Name *" className="md:col-span-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., VLSI Design Lab"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
        </Field>
        <Field label="Semester *">
          <select value={semester} onChange={(e) => setSemester(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20">
            {Array.from({ length: 8 }).map((_, i) => <option key={i + 1} value={i + 1}>Semester {i + 1}</option>)}
          </select>
        </Field>
        <Field label="Subject Name *">
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Digital Circuits & Systems (EC-303)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
        </Field>
        <Field label="Lab Incharge" className="md:col-span-2">
          <select value={inchargeId} onChange={(e) => setInchargeId(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20">
            <option value="">— Unassigned —</option>
            {staff.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.role}</option>)}
          </select>
        </Field>
        <Field label="Description" className="md:col-span-2">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What is this lab used for?"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
        </Field>
        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => navigate({ to: "/dashboard" })} className="rounded-lg border border-border bg-card px-4 py-2 text-sm hover:border-gold">Cancel</button>
          <button type="submit" className="inline-flex items-center gap-2 rounded-lg gold-gradient px-4 py-2 text-sm font-semibold text-charcoal shadow shadow-gold/30 hover:shadow-gold/50">
            <Save className="h-4 w-4" /> Create Lab
          </button>
        </div>
      </motion.form>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
