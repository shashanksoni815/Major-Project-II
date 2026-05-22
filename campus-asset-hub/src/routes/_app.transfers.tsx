import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight, Check, ChevronRight, ChevronLeft, Package, Warehouse, Hash, History,
} from "lucide-react";
import { useAMS } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { StatusPill } from "@/components/StatusPill";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/transfers")({
  head: () => ({ meta: [{ title: "Transfers · AMS" }] }),
  component: TransfersPage,
});

function TransfersPage() {
  const labs = useAMS((s) => s.labs);
  const devices = useAMS((s) => s.devices);
  const transfers = useAMS((s) => s.transfers);
  const transferDevice = useAMS((s) => s.transferDevice);

  const [step, setStep] = useState(0);
  const [fromLab, setFromLab] = useState("");
  const [toLab, setToLab] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const sourceDevices = useMemo(() => devices.filter((d) => d.labId === fromLab), [devices, fromLab]);
  const selectedDevice = devices.find((d) => d.id === deviceId);
  const maxQty = selectedDevice?.quantity ?? 0;

  const steps = [
    { label: "Source Lab", icon: Warehouse },
    { label: "Destination", icon: ArrowLeftRight },
    { label: "Device & Quantity", icon: Package },
    { label: "Review", icon: Check },
  ];

  const canNext = () => {
    if (step === 0) return !!fromLab;
    if (step === 1) return !!toLab && toLab !== fromLab;
    if (step === 2) return !!deviceId && qty > 0 && qty <= maxQty;
    return true;
  };

  const reset = () => {
    setStep(0); setFromLab(""); setToLab(""); setDeviceId(""); setQty(1); setNote("");
  };

  const confirmTransfer = () => {
    transferDevice(deviceId, fromLab, toLab, qty, note || undefined);
    toast.success("Transfer completed");
    reset();
  };

  const labName = (id: string) => labs.find((l) => l.id === id)?.name ?? "—";
  const deviceName = (id: string) => devices.find((d) => d.id === id)?.name ?? "Device";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Movement"
        title="Transfer Assets Between Labs"
        description="Move devices between labs while keeping quantities and history in sync."
      />

      {/* Stepper */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-8 flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-1 items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${i <= step ? "border-gold bg-gold/15 text-gold" : "border-border text-muted-foreground"}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-xs font-medium ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>Step {i + 1}</p>
                <p className={`text-sm ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
              </div>
              {i < steps.length - 1 && <div className={`mx-4 h-px flex-1 ${i < step ? "bg-gold" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <LabPicker title="Select source lab" value={fromLab} onChange={setFromLab} labs={labs} />
            )}
            {step === 1 && (
              <LabPicker title="Select destination lab" value={toLab} onChange={setToLab} labs={labs.filter((l) => l.id !== fromLab)} />
            )}
            {step === 2 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Device</span>
                  <select value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <option value="">— Select device —</option>
                    {sourceDevices.map((d) => <option key={d.id} value={d.id}>{d.name} (qty {d.quantity})</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Quantity to transfer</span>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <input type="number" min={1} max={maxQty} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-full bg-transparent outline-none" />
                  </div>
                  {selectedDevice && <p className="mt-1 text-xs text-muted-foreground">Max available: {maxQty}</p>}
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Note (optional)</span>
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for transfer" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                </label>
              </div>
            )}
            {step === 3 && (
              <div className="rounded-xl border border-gold/30 bg-gold/5 p-5">
                <p className="mb-4 font-display text-lg">Review transfer</p>
                <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                  <Detail k="From" v={labName(fromLab)} />
                  <Detail k="To" v={labName(toLab)} />
                  <Detail k="Device" v={deviceName(deviceId)} />
                  <Detail k="Quantity" v={qty} />
                  {note && <Detail k="Note" v={note} />}
                </dl>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:border-gold disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          {step < steps.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}
              className="inline-flex items-center gap-2 rounded-lg gold-gradient px-4 py-2 text-sm font-semibold text-charcoal shadow shadow-gold/30 disabled:opacity-50">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg gold-gradient px-4 py-2 text-sm font-semibold text-charcoal shadow shadow-gold/30">
              <Check className="h-4 w-4" /> Confirm Transfer
            </button>
          )}
        </div>
      </div>

      {/* History */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <History className="h-4 w-4 text-gold" />
          <h3 className="font-display text-lg font-semibold">Transfer History</h3>
        </div>
        {transfers.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={<History className="h-6 w-6" />} title="No transfers yet" description="Your first transfer will appear here." />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {transfers.map((t, i) => (
              <motion.li key={t.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                <StatusPill tone="gold">×{t.quantity}</StatusPill>
                <span className="font-medium">{deviceName(t.deviceId)}</span>
                <span className="text-muted-foreground">{labName(t.fromLabId)}</span>
                <ArrowLeftRight className="h-3.5 w-3.5 text-gold" />
                <span className="text-muted-foreground">{labName(t.toLabId)}</span>
                {t.note && <span className="italic text-muted-foreground">· "{t.note}"</span>}
                <span className="ml-auto text-xs text-muted-foreground">{formatDistanceToNow(new Date(t.date), { addSuffix: true })}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmTransfer}
        title="Confirm transfer?"
        description={`Transfer ${qty}× ${deviceName(deviceId)} from ${labName(fromLab)} to ${labName(toLab)}.`}
        confirmText="Confirm"
      />
    </div>
  );
}

function LabPicker({ title, value, onChange, labs }: { title: string; value: string; onChange: (v: string) => void; labs: ReturnType<typeof useAMS.getState>["labs"] }) {
  return (
    <div>
      <p className="mb-4 font-display text-lg">{title}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {labs.map((l) => (
          <motion.button
            key={l.id} type="button" whileHover={{ y: -2 }}
            onClick={() => onChange(l.id)}
            className={`relative rounded-xl border p-4 text-left transition ${value === l.id ? "border-gold bg-gold/10 ring-2 ring-gold/30" : "border-border bg-card hover:border-gold/50"}`}
          >
            <p className="font-medium">{l.name}</p>
            <p className="text-xs text-muted-foreground">Semester {l.semester}</p>
            {value === l.id && <Check className="absolute right-3 top-3 h-4 w-4 text-gold" />}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function Detail({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 rounded-lg bg-background/60 px-3 py-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
