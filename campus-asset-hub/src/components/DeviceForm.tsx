import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Save, X, ImagePlus, Trash2 } from "lucide-react";
import { useAMS } from "@/lib/store";
import type { Device, DeviceCategory, DeviceStatus } from "@/lib/types";
import { resolveImageUrl } from "@/lib/utils";
import { toast } from "sonner";

interface DeviceFormProps {
  device?: Device;
  defaultLabId?: string;
  onClose: () => void;
}

const categories: DeviceCategory[] = ["Machine", "Instrument", "Tool"];
const statuses: DeviceStatus[] = ["Active", "Maintenance", "Retired"];

export function DeviceForm({ device, defaultLabId, onClose }: DeviceFormProps) {
  const labs = useAMS((s) => s.labs);
  const addDevice = useAMS((s) => s.addDevice);
  const updateDevice = useAMS((s) => s.updateDevice);

  const [name, setName] = useState(device?.name ?? "");
  const [category, setCategory] = useState<DeviceCategory>(device?.category ?? "Instrument");
  const [labId, setLabId] = useState(device?.labId ?? defaultLabId ?? labs[0]?.id ?? "");
  const [quantity, setQuantity] = useState(device?.quantity ?? 1);
  const [workingQty, setWorkingQty] = useState(device?.workingQty ?? 1);
  const [nonWorkingQty, setNonWorkingQty] = useState(device?.nonWorkingQty ?? 0);
  const [status, setStatus] = useState<DeviceStatus>(device?.status ?? "Active");
  const [purchaseDate, setPurchaseDate] = useState(device?.purchaseDate ?? new Date().toISOString().slice(0, 10));
  const initialExisting = Array.isArray(device?.images)
    ? device!.images
    : device?.images
      ? [String(device.images)]
      : []
  const [existingImages, setExistingImages] = useState<string[]>(initialExisting);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const images = [...existingImages, ...newImagePreviews];

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (!picked.length) return;
    const urls = picked.map((f) => URL.createObjectURL(f));
    setNewImagePreviews((prev) => [...prev, ...urls]);
    setFiles((prev) => [...prev, ...picked]);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !labId) { toast.error("Name and lab are required"); return; }
    if (workingQty + nonWorkingQty > quantity) { toast.error("Working + non-working can't exceed total quantity"); return; }
    const form = new FormData();
    form.append('name', name.trim());
    form.append('category', category);
    form.append('labId', labId);
    form.append('quantity', String(quantity));
    form.append('workingQty', String(workingQty));
    form.append('nonWorkingQty', String(nonWorkingQty));
    form.append('status', status);
    form.append('purchaseDate', purchaseDate);
    if (existingImages.length) {
      form.append('existingImages', JSON.stringify(existingImages));
    }
    files.forEach((f) => form.append('images', f));

    if (device) { updateDevice(device.id, form); toast.success("Device updated"); }
    else { addDevice(form); toast.success("Device added"); }
    onClose();
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field label="Device Name *" className="md:col-span-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Digital Storage Oscilloscope"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20" />
      </Field>
      <Field label="Category">
        <select value={category} onChange={(e) => setCategory(e.target.value as DeviceCategory)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold">
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Lab Assigned">
        <select value={labId} onChange={(e) => setLabId(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold">
          {labs.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </Field>
      <Field label="Total Quantity">
        <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold" />
      </Field>
      <Field label="Working Quantity">
        <input type="number" min={0} value={workingQty} onChange={(e) => setWorkingQty(Number(e.target.value))}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold" />
      </Field>
      <Field label="Non-working Quantity">
        <input type="number" min={0} value={nonWorkingQty} onChange={(e) => setNonWorkingQty(Number(e.target.value))}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold" />
      </Field>
      <Field label="Status">
        <select value={status} onChange={(e) => setStatus(e.target.value as DeviceStatus)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold">
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Purchase Date" className="md:col-span-2">
        <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold" />
      </Field>

      {/* Images */}
      <div className="md:col-span-2">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Images</span>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {images.map((src, i) => (
            <motion.div key={i} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              <img src={resolveImageUrl(src)} alt="" className="h-full w-full object-cover" />
              <button type="button" onClick={() => {
                if (i < existingImages.length) {
                  setExistingImages((prev) => prev.filter((_, idx) => idx !== i))
                } else {
                  const removeIdx = i - existingImages.length
                  setNewImagePreviews((prev) => prev.filter((_, idx) => idx !== removeIdx))
                  setFiles((prev) => prev.filter((_, idx) => idx !== removeIdx))
                }
              }}
                className="absolute right-1 top-1 hidden rounded-md bg-destructive p-1 text-destructive-foreground group-hover:block">
                <Trash2 className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-card text-xs text-muted-foreground hover:border-gold hover:text-gold">
            <ImagePlus className="h-5 w-5" />
            Add
            <input type="file" accept="image/*" multiple className="hidden" onChange={onPickFiles} />
          </label>
        </div>
      </div>

      <div className="md:col-span-2 flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:border-gold">
          <X className="h-4 w-4" /> Cancel
        </button>
        <button type="submit" className="inline-flex items-center gap-2 rounded-lg gold-gradient px-4 py-2 text-sm font-semibold text-charcoal shadow shadow-gold/30">
          <Save className="h-4 w-4" /> {device ? "Save Changes" : "Add Device"}
        </button>
      </div>
    </form>
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
