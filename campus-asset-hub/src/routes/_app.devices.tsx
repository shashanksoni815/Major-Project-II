import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus, Search, LayoutGrid, Rows3, Edit2, Trash2, HardDrive, Filter, Eye,
} from "lucide-react";
import { useAMS } from "@/lib/store";
import { resolveImageUrl } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";
import { StatusPill } from "@/components/StatusPill";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DeviceForm } from "@/components/DeviceForm";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import type { Device } from "@/lib/types";

export const Route = createFileRoute("/_app/devices")({
  head: () => ({ meta: [{ title: "Devices · AMS · CDGI ECE" }] }),
  component: DevicesPage,
});

function DevicesPage() {
  const devices = useAMS((s) => s.devices);
  const labs = useAMS((s) => s.labs);
  const deleteDevice = useAMS((s) => s.deleteDevice);

  const [view, setView] = useState<"grid" | "table">("grid");
  const [q, setQ] = useState("");
  const [labFilter, setLabFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState<{ open: boolean; device?: Device }>({ open: false });
  const [viewDevice, setViewDevice] = useState<Device | null>(null);
  const [toDelete, setToDelete] = useState<Device | null>(null);

  const filtered = useMemo(() => {
    return devices.filter((d) => {
      if (q && !d.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (labFilter && d.labId !== labFilter) return false;
      if (statusFilter && d.status !== statusFilter) return false;
      return true;
    });
  }, [devices, q, labFilter, statusFilter]);

  const labName = (id: string) => labs.find((l) => l.id === id)?.name ?? "—";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Assets & Devices"
        description="Every instrument, machine and tool across the department."
        actions={
          <button onClick={() => setModal({ open: true })} className="inline-flex items-center gap-2 rounded-lg gold-gradient px-4 py-2 text-sm font-semibold text-charcoal shadow shadow-gold/30">
            <Plus className="h-4 w-4" /> Add Device
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search devices…" className="w-full bg-transparent outline-none placeholder:text-muted-foreground" />
        </div>
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select value={labFilter} onChange={(e) => setLabFilter(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">All labs</option>
          {labs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option>Active</option>
          <option>Maintenance</option>
          <option>Retired</option>
        </select>
        <div className="flex overflow-hidden rounded-lg border border-border">
          <button onClick={() => setView("grid")} className={`px-3 py-2 text-sm ${view === "grid" ? "bg-gold/20 text-gold" : "hover:bg-muted"}`} aria-label="Grid view"><LayoutGrid className="h-4 w-4" /></button>
          <button onClick={() => setView("table")} className={`px-3 py-2 text-sm ${view === "table" ? "bg-gold/20 text-gold" : "hover:bg-muted"}`} aria-label="Table view"><Rows3 className="h-4 w-4" /></button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<HardDrive className="h-6 w-6" />} title="No devices match" description="Adjust filters or add a new device." />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              whileHover={{ y: -4 }}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-xl"
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                {d.images[0] ? (
                  <img src={resolveImageUrl(d.images[0])} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground"><HardDrive className="h-10 w-10 opacity-40" /></div>
                )}
                <div className="absolute left-3 top-3">
                  <StatusPill tone={d.status === "Active" ? "success" : d.status === "Maintenance" ? "warning" : "muted"}>{d.status}</StatusPill>
                </div>
              </div>
              <div className="p-4">
                <p className="truncate font-medium">{d.name}</p>
                <p className="truncate text-xs text-muted-foreground">{labName(d.labId)}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <Stat label="Total" value={d.quantity} />
                  <Stat label="Working" value={d.workingQty} tone="success" />
                  <Stat label="Issue" value={d.nonWorkingQty} tone="destructive" />
                </div>
                <div className="mt-3 flex gap-1">
                  <button onClick={() => setViewDevice(d)} className="flex-1 rounded-lg border border-border px-2 py-1.5 text-xs hover:border-gold"><Eye className="mr-1 inline h-3 w-3" />View</button>
                  <button onClick={() => setModal({ open: true, device: d })} className="rounded-lg border border-border px-2 py-1.5 text-xs hover:border-gold" aria-label="Edit"><Edit2 className="h-3 w-3" /></button>
                  <button onClick={() => setToDelete(d)} className="rounded-lg border border-destructive/30 px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10" aria-label="Delete"><Trash2 className="h-3 w-3" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Device</th>
                  <th className="px-3 py-3 text-left font-medium">Lab</th>
                  <th className="px-3 py-3 text-left font-medium">Category</th>
                  <th className="px-3 py-3 text-right font-medium">Qty</th>
                  <th className="px-3 py-3 text-right font-medium">Working</th>
                  <th className="px-3 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-muted">
                          {d.images[0] ? <img src={resolveImageUrl(d.images[0])} alt="" className="h-full w-full object-cover" /> : <HardDrive className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <span className="font-medium">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{labName(d.labId)}</td>
                    <td className="px-3 py-3"><StatusPill tone="muted">{d.category}</StatusPill></td>
                    <td className="px-3 py-3 text-right">{d.quantity}</td>
                    <td className="px-3 py-3 text-right text-success">{d.workingQty}</td>
                    <td className="px-3 py-3"><StatusPill tone={d.status === "Active" ? "success" : d.status === "Maintenance" ? "warning" : "muted"}>{d.status}</StatusPill></td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => setViewDevice(d)} className="rounded-md p-1.5 hover:bg-muted"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => setModal({ open: true, device: d })} className="rounded-md p-1.5 hover:bg-muted"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => setToDelete(d)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title={modal.device ? "Edit Device" : "Add Device"} size="lg">
        <DeviceForm device={modal.device} onClose={() => setModal({ open: false })} />
      </Modal>

      <Modal open={!!viewDevice} onClose={() => setViewDevice(null)} title={viewDevice?.name} size="xl">
        {viewDevice && <DeviceDetails device={viewDevice} labName={labName(viewDevice.labId)} />}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => { if (toDelete) { deleteDevice(toDelete.id); toast.success("Device deleted"); } }}
        title={`Delete “${toDelete?.name}”?`}
        destructive
      />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "success" | "destructive" }) {
  return (
    <div className="rounded-lg bg-muted/50 px-2 py-1.5 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`font-display text-lg font-semibold ${tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : ""}`}>{value}</p>
    </div>
  );
}

function DeviceDetails({ device, labName }: { device: Device; labName: string }) {
  const [active, setActive] = useState(0);
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <div className="aspect-video overflow-hidden rounded-xl border border-border bg-muted">
          {device.images[active] ? (
            <img src={resolveImageUrl(device.images[active])} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground"><HardDrive className="h-12 w-12 opacity-40" /></div>
          )}
        </div>
        {device.images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {device.images.map((src, i) => (
              <button key={i} onClick={() => setActive(i)} className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border transition ${i === active ? "border-gold ring-2 ring-gold/30" : "border-border"}`}>
                <img src={resolveImageUrl(src)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-3 text-sm">
        <Row k="Category" v={<StatusPill tone="muted">{device.category}</StatusPill>} />
        <Row k="Status" v={<StatusPill tone={device.status === "Active" ? "success" : device.status === "Maintenance" ? "warning" : "muted"}>{device.status}</StatusPill>} />
        <Row k="Lab" v={labName} />
        <Row k="Total Quantity" v={device.quantity} />
        <Row k="Working" v={<span className="text-success">{device.workingQty}</span>} />
        <Row k="Non-working" v={<span className="text-destructive">{device.nonWorkingQty}</span>} />
        <Row k="Purchase Date" v={device.purchaseDate} />
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 pb-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
