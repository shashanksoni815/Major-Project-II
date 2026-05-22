import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lab, Device, Staff, Transfer, Activity } from "./types";

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

interface AMSState {
  labs: Lab[];
  devices: Device[];
  staff: Staff[];
  transfers: Transfer[];
  activities: Activity[];

  addLab: (l: Omit<Lab, "id" | "createdAt">) => Promise<Lab>;
  updateLab: (id: string, patch: Partial<Lab>) => void;
  deleteLab: (id: string) => void;

  addDevice: (d: Omit<Device, "id"> | FormData) => Device | void;
  updateDevice: (id: string, patch: Partial<Device> | FormData) => void;
  deleteDevice: (id: string) => void;

  addStaff: (s: Omit<Staff, "id"> | FormData) => Promise<Staff | void>;
  updateStaff: (id: string, patch: Partial<Staff> | FormData) => void;
  deleteStaff: (id: string) => void;

  transferDevice: (deviceId: string, fromLabId: string, toLabId: string, qty: number, note?: string) => void;
  syncData: () => Promise<void>;

  resetData: () => void;
}

const initial = {
  labs: [] as Lab[],
  devices: [] as Device[],
  staff: [] as Staff[],
  transfers: [] as Transfer[],
  activities: [] as Activity[],
};

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000'

function isFormData(value: unknown): value is FormData {
  return typeof value === 'object' && value !== null && typeof (value as FormData).get === 'function'
}

function normalizeRecord<T extends { id?: string; _id?: string; labId?: string; labIds?: string[] }>(item: any): T {
  if (!item || typeof item !== 'object') return item
  const normalized = { ...item } as any
  if (normalized._id && !normalized.id) {
    normalized.id = normalized._id
    delete normalized._id
  }
  if (normalized.labIds == null && normalized.labId != null) {
    normalized.labIds = Array.isArray(normalized.labId) ? normalized.labId : [normalized.labId]
    delete normalized.labId
  }
  return normalized
}

function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value)
}

async function apiFetch(path: string, opts: RequestInit = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, opts)
    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText)
      throw new Error(`API ${path} failed: ${res.status} ${errorText}`)
    }
    return await res.json()
  } catch (e) {
    console.warn('API fetch failed', path, e)
    throw e
  }
}

export const useAMS = create<AMSState>()(
  persist(
    (set, get) => ({
      ...initial,

      addLab: async (l) => {
        const tempLab: Lab = { ...l, id: uid('lab'), createdAt: new Date().toISOString() };
        set((s) => ({
          labs: [...s.labs, tempLab],
          activities: [{ id: uid('ac'), type: 'create', entity: 'lab', message: `Created lab “${tempLab.name}”`, date: new Date().toISOString() }, ...s.activities],
        }));

        try {
          const raw = await apiFetch('/api/labs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(l) })
          const lab = normalizeRecord<Lab>(raw)
          set((s) => ({
            labs: s.labs.map((item) => item.id === tempLab.id ? lab : item),
          }))
          return lab
        } catch (error) {
          console.warn('Lab save failed', error)
          return tempLab
        }
      },
      updateLab: (id, patch) => {
        set((s) => ({
          labs: s.labs.map((l) => (l.id === id ? { ...l, ...patch } : l)),
          activities: [{ id: uid('ac'), type: 'update', entity: 'lab', message: `Updated lab “${patch.name ?? s.labs.find((l) => l.id === id)?.name}”`, date: new Date().toISOString() }, ...s.activities],
        }))
        if (!isObjectId(id)) return
        apiFetch(`/api/labs/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
          .then((raw) => {
            const lab = normalizeRecord<Lab>(raw)
            set((s) => ({ labs: s.labs.map((item) => (item.id === id ? lab : item)) }))
          })
          .catch((error) => { console.warn('Lab update failed', error) })
      },
      deleteLab: (id) => {
        const lab = get().labs.find((l) => l.id === id);
        set((s) => ({
          labs: s.labs.filter((l) => l.id !== id),
          devices: s.devices.filter((d) => d.labId !== id),
          activities: [{ id: uid('ac'), type: 'delete', entity: 'lab', message: `Deleted lab “${lab?.name ?? id}”`, date: new Date().toISOString() }, ...s.activities],
        }))
        if (!isObjectId(id)) return
        apiFetch(`/api/labs/${id}`, { method: 'DELETE' }).catch(() => { /* noop */ })
      },

      addDevice: (d) => {
        if (isFormData(d)) {
          apiFetch('/api/devices', { method: 'POST', body: d })
            .then((raw) => {
              const dev = { ...(raw as any), id: (raw as any).id ?? (raw as any)._id }
              set((s) => ({ devices: [...s.devices, dev], activities: [{ id: uid('ac'), type: 'create', entity: 'device', message: `Added device “${dev.name}”`, date: new Date().toISOString() }, ...s.activities] }))
            })
            .catch((error) => {
              console.warn('Device upload failed', error)
            })
          return
        }
        const device: Device = { ...d, id: uid('dev') };
        set((s) => ({ devices: [...s.devices, device], activities: [{ id: uid('ac'), type: 'create', entity: 'device', message: `Added device “${device.name}”`, date: new Date().toISOString() }, ...s.activities] }));
        // Try to persist to backend
        apiFetch('/api/devices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) }).catch(() => { /* noop */ })
        return device;
      },
      updateDevice: (id, patch) => {
        if (isFormData(patch)) {
          apiFetch(`/api/devices/${id}`, { method: 'PUT', body: patch })
            .then((raw) => {
              const dev = { ...(raw as any), id: (raw as any).id ?? (raw as any)._id }
              set((s) => ({ devices: s.devices.map((d) => (d.id === id ? dev : d)), activities: [{ id: uid('ac'), type: 'update', entity: 'device', message: `Updated device “${dev.name}”`, date: new Date().toISOString() }, ...s.activities] }))
            })
            .catch((error) => {
              console.warn('Device update failed', error)
            })
          return
        }
        set((s) => ({ devices: s.devices.map((d) => (d.id === id ? { ...d, ...patch } : d)), activities: [{ id: uid('ac'), type: 'update', entity: 'device', message: `Updated device “${patch.name ?? s.devices.find((d) => d.id === id)?.name}”`, date: new Date().toISOString() }, ...s.activities] }));
        apiFetch(`/api/devices/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) }).catch(() => { /* noop */ })
      },
      deleteDevice: (id) => {
        const dev = get().devices.find((d) => d.id === id)
        set((s) => ({ devices: s.devices.filter((d) => d.id !== id), activities: [{ id: uid('ac'), type: 'delete', entity: 'device', message: `Deleted device “${dev?.name ?? id}”`, date: new Date().toISOString() }, ...s.activities] }))
        apiFetch(`/api/devices/${id}`, { method: 'DELETE' }).catch(() => { /* noop */ })
      },

      addStaff: async (s) => {
        if (isFormData(s)) {
          try {
            const raw = await apiFetch('/api/staff', { method: 'POST', body: s })
            const staff = normalizeRecord<Staff>(raw)
            set((st) => ({ staff: [...st.staff, staff], activities: [{ id: uid('ac'), type: 'create', entity: 'staff', message: `Added staff ${staff.name}`, date: new Date().toISOString() }, ...st.activities] }))
            return staff
          } catch (error) {
            console.warn('Staff upload failed', error)
            return
          }
        }

        const tempStaff: Staff = { ...s, id: uid('st') };
        set((st) => ({ staff: [...st.staff, tempStaff], activities: [{ id: uid('ac'), type: 'create', entity: 'staff', message: `Added staff ${tempStaff.name}`, date: new Date().toISOString() }, ...st.activities] }));
        try {
          const raw = await apiFetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
          const staff = normalizeRecord<Staff>(raw)
          set((st) => ({ staff: st.staff.map((item) => (item.id === tempStaff.id ? staff : item)) }))
          return staff
        } catch (error) {
          console.warn('Staff save failed', error)
          return tempStaff
        }
      },
      updateStaff: (id, patch) => {
        if (isFormData(patch)) {
          if (!isObjectId(id)) return
          apiFetch(`/api/staff/${id}`, { method: 'PUT', body: patch })
            .then((raw) => {
              const staff = normalizeRecord<Staff>(raw)
              set((st) => ({ staff: st.staff.map((item) => (item.id === id ? staff : item)), activities: [{ id: uid('ac'), type: 'update', entity: 'staff', message: `Updated staff ${staff.name}`, date: new Date().toISOString() }, ...st.activities] }))
            })
            .catch((error) => { console.warn('Staff update failed', error) })
          return
        }

        set((st) => ({ staff: st.staff.map((s) => (s.id === id ? { ...s, ...patch } : s)), activities: [{ id: uid('ac'), type: 'update', entity: 'staff', message: `Updated staff ${patch.name ?? st.staff.find((s) => s.id === id)?.name}`, date: new Date().toISOString() }, ...st.activities] }))
        if (!isObjectId(id)) return
        apiFetch(`/api/staff/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
          .then((raw) => {
            const staff = normalizeRecord<Staff>(raw)
            set((st) => ({ staff: st.staff.map((item) => (item.id === id ? staff : item)) }))
          })
          .catch((error) => { console.warn('Staff update failed', error) })
      },
      deleteStaff: (id) => {
        const s = get().staff.find((s) => s.id === id)
        set((st) => ({ staff: st.staff.filter((s) => s.id !== id), activities: [{ id: uid('ac'), type: 'delete', entity: 'staff', message: `Removed staff ${s?.name ?? id}`, date: new Date().toISOString() }, ...st.activities] }))
        if (!isObjectId(id)) return
        apiFetch(`/api/staff/${id}`, { method: 'DELETE' }).catch(() => {})
      },

      transferDevice: (deviceId, fromLabId, toLabId, qty, note) => {
        const state = get();
        const src = state.devices.find((d) => d.id === deviceId);
        if (!src || src.labId !== fromLabId || qty <= 0 || qty > src.quantity) return;

        // Reduce source
        const updatedSrc: Device = {
          ...src,
          quantity: src.quantity - qty,
          workingQty: Math.max(0, src.workingQty - qty),
        };

        // Find or create matching device in destination lab (by name)
        const existingDest = state.devices.find((d) => d.labId === toLabId && d.name === src.name);
        let updatedDevices: Device[];
        if (existingDest) {
          updatedDevices = state.devices.map((d) => {
            if (d.id === src.id) return updatedSrc;
            if (d.id === existingDest.id) {
              return { ...d, quantity: d.quantity + qty, workingQty: d.workingQty + qty };
            }
            return d;
          });
        } else {
          const newDest: Device = {
            ...src,
            id: uid("dev"),
            labId: toLabId,
            quantity: qty,
            workingQty: qty,
            nonWorkingQty: 0,
          };
          updatedDevices = state.devices.map((d) => (d.id === src.id ? updatedSrc : d)).concat(newDest);
        }

        const transfer: Transfer = {
          id: uid("tr"), deviceId, fromLabId, toLabId, quantity: qty,
          date: new Date().toISOString(), note,
        };
        const fromLab = state.labs.find((l) => l.id === fromLabId)?.name;
        const toLab = state.labs.find((l) => l.id === toLabId)?.name;

        set({
          devices: updatedDevices.filter((d) => d.quantity > 0),
          transfers: [transfer, ...state.transfers],
          activities: [{
            id: uid("ac"), type: "transfer", entity: "transfer",
            message: `Transferred ${qty}× ${src.name} from ${fromLab} → ${toLab}`,
            date: new Date().toISOString(),
          }, ...state.activities],
        });

        // Only send to backend if the IDs are valid MongoDB ObjectIds.
        // Temporary local entities are not yet persisted, so they cannot be transferred to the DB.
        if (isObjectId(deviceId) && isObjectId(fromLabId) && isObjectId(toLabId)) {
          apiFetch('/api/transfers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId, fromLabId, toLabId, quantity: qty, note }),
          }).catch((error) => {
            console.warn('Transfer sync to backend failed', error)
          })
        } else {
          console.warn('Transfer not sent to backend because device or lab IDs are not persisted yet')
        }
      },

      syncData: async () => {
        try {
          const [rawLabs, rawDevices, rawStaff, rawTransfers] = await Promise.all([
            apiFetch('/api/labs'),
            apiFetch('/api/devices'),
            apiFetch('/api/staff'),
            apiFetch('/api/transfers'),
          ])

          set({
            labs: (rawLabs as any[]).map((item) => normalizeRecord<Lab>(item)),
            devices: (rawDevices as any[]).map((item) => normalizeRecord<Device>(item)),
            staff: (rawStaff as any[]).map((item) => normalizeRecord<Staff>(item)),
            transfers: (rawTransfers as any[]).map((item) => normalizeRecord<Transfer>(item)),
          })
        } catch (error) {
          console.warn('Failed to sync backend data', error)
        }
      },

      resetData: () => {
        set({ ...initial });
        get().syncData().catch(() => {
          console.warn('Failed to refresh backend data on reset')
        })
      },
    }),
    { name: "ams-store-v1" },
  ),
);
