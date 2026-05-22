export type DeviceCategory = "Machine" | "Instrument" | "Tool";
export type DeviceStatus = "Active" | "Maintenance" | "Retired";

export interface Lab {
  id: string;
  name: string;
  semester: number;
  subject: string;
  inchargeId?: string;
  description: string;
  createdAt: string;
}

export interface Device {
  id: string;
  name: string;
  category: DeviceCategory;
  labId: string;
  quantity: number;
  workingQty: number;
  nonWorkingQty: number;
  status: DeviceStatus;
  purchaseDate: string;
  images: string[]; // data URLs
  notes?: string;
}

export type StaffRole = "Lab Assistant" | "Faculty" | "HOD" | "Technician";

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  labId?: string;
  labIds?: string[];
  email: string;
  phone: string;
  avatar?: string;
}

export interface Transfer {
  id: string;
  deviceId: string;
  fromLabId: string;
  toLabId: string;
  quantity: number;
  date: string;
  note?: string;
}

export interface Activity {
  id: string;
  type: "create" | "update" | "delete" | "transfer";
  entity: "lab" | "device" | "staff" | "transfer";
  message: string;
  date: string;
}
