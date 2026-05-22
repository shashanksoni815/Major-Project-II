import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Mail, Phone, Edit2, Trash2, UserPlus, Save } from "lucide-react";
import { useAMS } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { StatusPill } from "@/components/StatusPill";
import { toast } from "sonner";
import type { Staff, StaffRole } from "@/lib/types";

export const Route = createFileRoute("/_app/staff")({
  head: () => ({ meta: [{ title: "Staff · AMS · CDGI ECE" }] }),
  component: StaffPage,
});

const roles: StaffRole[] = ["Faculty", "Lab Assistant", "HOD", "Technician"];

function StaffPage() {
  const staff = useAMS((s) => s.staff);
  const labs = useAMS((s) => s.labs);
  const deleteStaff = useAMS((s) => s.deleteStaff);

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modal, setModal] = useState<{ open: boolean; staff?: Staff }>({ open: false });
  const [toDelete, setToDelete] = useState<Staff | null>(null);

  const filtered = useMemo(() => staff.filter((s) => {
    if (q && !(s.name + s.email).toLowerCase().includes(q.toLowerCase())) return false;
    if (roleFilter && s.role !== roleFilter) return false;
    return true;
  }), [staff, q, roleFilter]);

  const labNames = (ids?: string[]) => {
    if (!ids || ids.length === 0) return "Unassigned";
    const names = ids.map((id) => labs.find((l) => l.id === id)?.name ?? "Unknown");
    return names.join(", ");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Staff Management"
        description="Faculty, lab assistants and technicians responsible for ECE labs."
        actions={
          <button onClick={() => setModal({ open: true })} className="inline-flex items-center gap-2 rounded-lg gold-gradient px-4 py-2 text-sm font-semibold text-charcoal shadow shadow-gold/30">
            <UserPlus className="h-4 w-4" /> Add Staff
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search staff…" className="w-full bg-transparent outline-none" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">All roles</option>
          {roles.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<UserPlus className="h-6 w-6" />} title="No staff match" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              whileHover={{ y: -3 }}
              className="group rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gold-gradient text-charcoal font-semibold">
                  {s.name.split(" ").map((n) => n.charAt(0)).slice(-2).join("").toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.name}</p>
                  <StatusPill tone={s.role === "HOD" ? "gold" : s.role === "Faculty" ? "success" : "muted"} className="mt-1">{s.role}</StatusPill>
                </div>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button onClick={() => setModal({ open: true, staff: s })} className="rounded-md p-1.5 hover:bg-muted"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => setToDelete(s)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center gap-2 truncate"><Mail className="h-3.5 w-3.5" />{s.email}</p>
                <p className="flex items-center gap-2 truncate"><Phone className="h-3.5 w-3.5" />{s.phone}</p>
                <p className="truncate pt-1.5"><span className="font-medium text-foreground">Labs:</span> {labNames(s.labIds ?? (s.labId ? [s.labId] : []))}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.staff ? "Edit Staff" : "Add Staff"} size="md">
        <StaffForm staff={modal.staff} onClose={() => setModal({ open: false })} />
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => { if (toDelete) { deleteStaff(toDelete.id); toast.success("Staff removed"); } }}
        title={`Remove ${toDelete?.name}?`}
        destructive
      />
    </div>
  );
}

function StaffForm({ staff, onClose }: { staff?: Staff; onClose: () => void }) {
  const addStaff = useAMS((s) => s.addStaff);
  const updateStaff = useAMS((s) => s.updateStaff);
  const labs = useAMS((s) => s.labs);

  const [name, setName] = useState(staff?.name ?? "");
  const [role, setRole] = useState<StaffRole>(staff?.role ?? "Lab Assistant");
  const [email, setEmail] = useState(staff?.email ?? "");
  const [phone, setPhone] = useState(staff?.phone ?? "");
  const [labIds, setLabIds] = useState<string[]>(staff?.labIds ?? (staff?.labId ? [staff.labId] : []));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { toast.error("Name and email are required"); return; }
    if (avatarFile) {
      const form = new FormData();
      form.append('name', name.trim());
      form.append('role', role);
      labIds.forEach((id) => form.append('labIds', id));
      form.append('email', email.trim());
      form.append('phone', phone.trim());
      form.append('avatar', avatarFile);
      if (staff) { updateStaff(staff.id, form); toast.success('Staff updated'); }
      else { addStaff(form); toast.success('Staff added'); }
    } else {
      const payload = { name: name.trim(), role, email: email.trim(), phone: phone.trim(), labIds: labIds.length ? labIds : undefined };
      if (staff) { updateStaff(staff.id, payload); toast.success("Staff updated"); }
      else { addStaff(payload); toast.success("Staff added"); }
    }
    onClose();
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <F label="Name *" className="md:col-span-2">
        <input value={name} onChange={(e) => setName(e.target.value)} className="inp" />
      </F>
      <F label="Role">
        <select value={role} onChange={(e) => setRole(e.target.value as StaffRole)} className="inp">
          {roles.map((r) => <option key={r}>{r}</option>)}
        </select>
      </F>
      <F label="Assigned Labs">
        <select multiple value={labIds} onChange={(e) => setLabIds(Array.from(e.target.selectedOptions, (o) => o.value))} className="inp min-h-32">
          {labs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </F>
      <F label="Email *">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="inp" />
      </F>
      <F label="Phone">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="inp" />
      </F>
      <F label="Avatar">
        <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} />
      </F>
      <div className="md:col-span-2 flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="rounded-lg border border-border bg-card px-4 py-2 text-sm hover:border-gold">Cancel</button>
        <button type="submit" className="inline-flex items-center gap-2 rounded-lg gold-gradient px-4 py-2 text-sm font-semibold text-charcoal">
          <Save className="h-4 w-4" /> Save
        </button>
      </div>
      <style>{`.inp { width: 100%; border-radius: 0.5rem; border: 1px solid var(--border); background: var(--background); padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; } .inp:focus { border-color: var(--gold); box-shadow: 0 0 0 3px color-mix(in oklab, var(--gold) 20%, transparent); }`}</style>
    </form>
  );
}

function F({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
