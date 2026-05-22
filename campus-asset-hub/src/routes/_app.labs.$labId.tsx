import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Plus, Edit2, Trash2, ArrowLeftRight, HardDrive,
  CheckCircle2, AlertTriangle, Wrench, User as UserIcon, Save,
} from "lucide-react";
import { useAMS } from "@/lib/store";
import { resolveImageUrl } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusPill } from "@/components/StatusPill";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { DeviceForm } from "@/components/DeviceForm";
import { toast } from "sonner";
import type { Device } from "@/lib/types";

export const Route = createFileRoute("/_app/labs/$labId")({
  head: ({ params }) => ({ meta: [{ title: `Lab · ${params.labId} · AMS` }] }),
  component: LabPage,
  notFoundComponent: () => <NotFound />,
});

function NotFound() {
  return (
    <EmptyState
      icon={<AlertTriangle className="h-6 w-6" />}
      title="Lab not found"
      description="This lab may have been deleted."
      action={<Link to="/dashboard" className="rounded-lg gold-gradient px-4 py-2 text-sm font-semibold text-charcoal">Go to dashboard</Link>}
    />
  );
}

function LabPage() {
  const { labId } = Route.useParams();
  const labs = useAMS((s) => s.labs);
  const devices = useAMS((s) => s.devices);
  const staff = useAMS((s) => s.staff);
  const updateLab = useAMS((s) => s.updateLab);
  const deleteLab = useAMS((s) => s.deleteLab);
  const deleteDevice = useAMS((s) => s.deleteDevice);
  const navigate = useNavigate();

  const lab = labs.find((l) => l.id === labId);
  const labDevices = useMemo(() => devices.filter((d) => d.labId === labId), [devices, labId]);
  const incharge = staff.find((s) => s.id === lab?.inchargeId);

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deviceModal, setDeviceModal] = useState<{ open: boolean; device?: Device }>({ open: false });
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);

  if (!lab) return <NotFound />;

  const totals = {
    quantity: labDevices.reduce((a, d) => a + d.quantity, 0),
    working: labDevices.reduce((a, d) => a + d.workingQty, 0),
    nonWorking: labDevices.reduce((a, d) => a + d.nonWorkingQty, 0),
    maintenance: labDevices.filter((d) => d.status === "Maintenance").length,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={<>Semester {lab.semester} · {lab.subject}</>}
        title={lab.name}
        description={lab.description}
        actions={
          <>
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-gold">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-gold">
              <Edit2 className="h-4 w-4" /> Edit Lab
            </button>
            <Link to="/transfers" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-gold">
              <ArrowLeftRight className="h-4 w-4" /> Transfer
            </Link>
            <button onClick={() => setDeviceModal({ open: true })} className="inline-flex items-center gap-2 rounded-lg gold-gradient px-4 py-2 text-sm font-semibold text-charcoal shadow shadow-gold/30">
              <Plus className="h-4 w-4" /> Add Device
            </button>
          </>
        }
      />

      {/* Lab meta */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold"><UserIcon className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Lab Incharge</p>
              <p className="font-medium">{incharge?.name ?? "Unassigned"}</p>
            </div>
          </div>
          <div className="h-10 w-px bg-border hidden sm:block" />
          <div>
            <p className="text-xs text-muted-foreground">Subject Code</p>
            <p className="font-medium">{lab.subject}</p>
          </div>
          <div className="ml-auto">
            <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/20">
              <Trash2 className="h-3.5 w-3.5" /> Delete Lab
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Devices" value={totals.quantity} icon={<HardDrive className="h-5 w-5" />} accent="gold" />
        <StatCard label="Working" value={totals.working} icon={<CheckCircle2 className="h-5 w-5" />} accent="success" delay={0.05} />
        <StatCard label="Non-working" value={totals.nonWorking} icon={<AlertTriangle className="h-5 w-5" />} accent="destructive" delay={0.1} />
        <StatCard label="Under Maintenance" value={totals.maintenance} icon={<Wrench className="h-5 w-5" />} accent="warning" delay={0.15} />
      </div>

      {/* Devices */}
      {labDevices.length === 0 ? (
        <EmptyState
          icon={<HardDrive className="h-6 w-6" />}
          title="No devices yet"
          description="Add the first instrument, machine or tool to this lab."
          action={
            <button onClick={() => setDeviceModal({ open: true })} className="inline-flex items-center gap-2 rounded-lg gold-gradient px-4 py-2 text-sm font-semibold text-charcoal">
              <Plus className="h-4 w-4" /> Add Device
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-display text-lg font-semibold">Devices ({labDevices.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Device</th>
                  <th className="px-3 py-3 text-left font-medium">Category</th>
                  <th className="px-3 py-3 text-right font-medium">Total</th>
                  <th className="px-3 py-3 text-right font-medium">Working</th>
                  <th className="px-3 py-3 text-right font-medium">Non-working</th>
                  <th className="px-3 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {labDevices.map((d, i) => (
                  <motion.tr
                    key={d.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-t border-border hover:bg-muted/30"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-muted">
                          {d.images[0] ? <img src={resolveImageUrl(d.images[0])} alt="" className="h-full w-full object-cover" /> : <HardDrive className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div>
                          <p className="font-medium">{d.name}</p>
                          <p className="text-xs text-muted-foreground">Purchased {d.purchaseDate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3"><StatusPill tone="muted">{d.category}</StatusPill></td>
                    <td className="px-3 py-3 text-right font-medium">{d.quantity}</td>
                    <td className="px-3 py-3 text-right text-success">{d.workingQty}</td>
                    <td className="px-3 py-3 text-right text-destructive">{d.nonWorkingQty}</td>
                    <td className="px-3 py-3">
                      <StatusPill tone={d.status === "Active" ? "success" : d.status === "Maintenance" ? "warning" : "muted"}>{d.status}</StatusPill>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => setDeviceModal({ open: true, device: d })} className="rounded-md p-1.5 hover:bg-muted" aria-label="Edit"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => setDeviceToDelete(d)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit lab modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Lab" size="md">
        <EditLabForm
          lab={lab}
          onSave={(patch) => { updateLab(lab.id, patch); toast.success("Lab updated"); setEditOpen(false); }}
        />
      </Modal>

      {/* Device modal */}
      <Modal open={deviceModal.open} onClose={() => setDeviceModal({ open: false })} title={deviceModal.device ? "Edit Device" : "Add Device"} size="lg">
        <DeviceForm
          device={deviceModal.device}
          defaultLabId={lab.id}
          onClose={() => setDeviceModal({ open: false })}
        />
      </Modal>

      {/* Confirm delete lab */}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => { deleteLab(lab.id); toast.success("Lab deleted"); navigate({ to: "/dashboard" }); }}
        title={`Delete “${lab.name}”?`}
        description="This will also remove all devices assigned to this lab. This action cannot be undone."
        destructive
        confirmText="Delete Lab"
      />

      {/* Confirm delete device */}
      <ConfirmDialog
        open={!!deviceToDelete}
        onClose={() => setDeviceToDelete(null)}
        onConfirm={() => { if (deviceToDelete) { deleteDevice(deviceToDelete.id); toast.success("Device deleted"); } }}
        title={`Delete “${deviceToDelete?.name}”?`}
        destructive
      />
    </div>
  );
}

function EditLabForm({ lab, onSave }: { lab: ReturnType<typeof useAMS.getState>["labs"][number]; onSave: (p: Partial<typeof lab>) => void }) {
  const staff = useAMS((s) => s.staff);
  const [name, setName] = useState(lab.name);
  const [semester, setSemester] = useState(lab.semester);
  const [subject, setSubject] = useState(lab.subject);
  const [inchargeId, setInchargeId] = useState(lab.inchargeId ?? "");
  const [description, setDescription] = useState(lab.description);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave({ name, semester, subject, inchargeId: inchargeId || undefined, description }); }}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <label className="md:col-span-2 block">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Lab Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Semester</span>
        <select value={semester} onChange={(e) => setSemester(Number(e.target.value))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold">
          {Array.from({ length: 8 }).map((_, i) => <option key={i + 1} value={i + 1}>Semester {i + 1}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Subject</span>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold" />
      </label>
      <label className="md:col-span-2 block">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Lab Incharge</span>
        <select value={inchargeId} onChange={(e) => setInchargeId(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold">
          <option value="">— Unassigned —</option>
          {staff.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.role}</option>)}
        </select>
      </label>
      <label className="md:col-span-2 block">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold" />
      </label>
      <div className="md:col-span-2 flex justify-end gap-2 pt-2">
        <button type="submit" className="inline-flex items-center gap-2 rounded-lg gold-gradient px-4 py-2 text-sm font-semibold text-charcoal">
          <Save className="h-4 w-4" /> Save
        </button>
      </div>
    </form>
  );
}
