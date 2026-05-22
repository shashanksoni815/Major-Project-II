import type { Lab, Device, Staff, Transfer, Activity } from "./types";

export const seedLabs: Lab[] = [
  { id: "lab-1", name: "Basic Electronics Lab", semester: 1, subject: "Basic Electronics Engineering (BT-205)", description: "Fundamentals of electronic components, RLC circuits, diodes, BJTs.", createdAt: "2023-07-01" },
  { id: "lab-2", name: "Electronic Devices Lab", semester: 3, subject: "Electronic Devices & Circuits (EC-301)", description: "Diode rectifiers, BJT/FET biasing and amplifiers.", createdAt: "2023-07-02" },
  { id: "lab-3", name: "Network Analysis Lab", semester: 3, subject: "Network Analysis (EC-302)", description: "Two-port networks, Thevenin/Norton, transient analysis.", createdAt: "2023-07-03" },
  { id: "lab-4", name: "Digital Electronics Lab", semester: 3, subject: "Digital Circuits & Systems (EC-303)", description: "Logic gates, flip-flops, counters, multiplexers, PLDs.", createdAt: "2023-07-04" },
  { id: "lab-5", name: "Signals & Systems Lab", semester: 4, subject: "Signals & Systems (EC-401)", description: "Convolution, Fourier and Laplace transforms using MATLAB.", createdAt: "2023-07-05" },
  { id: "lab-6", name: "Analog Communication Lab", semester: 4, subject: "Analog Communication (EC-402)", description: "AM, FM, PM modulation/demodulation experiments.", createdAt: "2023-07-06" },
  { id: "lab-7", name: "EMFT Lab", semester: 4, subject: "Electromagnetic Field Theory (EC-403)", description: "Field plotting, transmission line characteristics.", createdAt: "2023-07-07" },
  { id: "lab-8", name: "Linear Integrated Circuits Lab", semester: 4, subject: "LIC (EC-404)", description: "Op-amp applications: integrator, differentiator, filters, oscillators.", createdAt: "2023-07-08" },
  { id: "lab-9", name: "Microprocessor Lab", semester: 5, subject: "Microprocessors (EC-501)", description: "8085/8086 assembly programming and interfacing.", createdAt: "2023-07-09" },
  { id: "lab-10", name: "Digital Signal Processing Lab", semester: 5, subject: "DSP (EC-502)", description: "DFT, FFT, FIR/IIR filter design with MATLAB & DSP kits.", createdAt: "2023-07-10" },
  { id: "lab-11", name: "Digital Communication Lab", semester: 5, subject: "Digital Communication (EC-503)", description: "PCM, DM, ASK, FSK, PSK, QPSK experiments.", createdAt: "2023-07-11" },
  { id: "lab-12", name: "Control Systems Lab", semester: 5, subject: "Control Systems (EC-504)", description: "Time/frequency response, PID control, root locus.", createdAt: "2023-07-12" },
  { id: "lab-13", name: "Microcontroller & Embedded Lab", semester: 6, subject: "Microcontrollers (EC-601)", description: "8051, ARM Cortex, Arduino, embedded C interfacing.", createdAt: "2023-07-13" },
  { id: "lab-14", name: "VLSI Design Lab", semester: 6, subject: "VLSI Design (EC-602)", description: "CMOS layout, Verilog, Cadence/Xilinx based design.", createdAt: "2023-07-14" },
  { id: "lab-15", name: "Antenna & Wave Propagation Lab", semester: 6, subject: "Antenna & Propagation (EC-603)", description: "Dipole, Yagi, horn antennas; radiation patterns.", createdAt: "2023-07-15" },
  { id: "lab-16", name: "Microwave Engineering Lab", semester: 7, subject: "Microwave Engineering (EC-701)", description: "Klystron, Gunn diode, waveguide measurements.", createdAt: "2023-07-16" },
  { id: "lab-17", name: "Optical Fiber Communication Lab", semester: 7, subject: "OFC (EC-702)", description: "Fiber loss, NA, bending loss, analog/digital link.", createdAt: "2023-07-17" },
  { id: "lab-18", name: "Wireless & Mobile Communication Lab", semester: 7, subject: "Wireless Communication (EC-703)", description: "GSM, CDMA, OFDM simulation & RF kits.", createdAt: "2023-07-18" },
  { id: "lab-19", name: "Satellite Communication Lab", semester: 8, subject: "Satellite Communication (EC-801)", description: "Satellite link budget, uplink/downlink simulation.", createdAt: "2023-07-19" },
  { id: "lab-20", name: "IoT & Embedded Systems Lab", semester: 8, subject: "IoT (EC-802)", description: "ESP32, Raspberry Pi, sensor networks, MQTT.", createdAt: "2023-07-20" },
];

const deviceTemplates: Array<Omit<Device, "id" | "labId">> = [
  { name: "Digital Storage Oscilloscope", category: "Instrument", quantity: 8, workingQty: 7, nonWorkingQty: 1, status: "Active", purchaseDate: "2022-03-12", images: [] },
  { name: "Function Generator", category: "Instrument", quantity: 10, workingQty: 9, nonWorkingQty: 1, status: "Active", purchaseDate: "2022-04-22", images: [] },
  { name: "Digital Multimeter", category: "Instrument", quantity: 25, workingQty: 23, nonWorkingQty: 2, status: "Active", purchaseDate: "2021-08-05", images: [] },
  { name: "DC Regulated Power Supply", category: "Instrument", quantity: 12, workingQty: 10, nonWorkingQty: 2, status: "Active", purchaseDate: "2022-01-19", images: [] },
  { name: "Soldering Station", category: "Tool", quantity: 15, workingQty: 14, nonWorkingQty: 1, status: "Active", purchaseDate: "2023-02-14", images: [] },
  { name: "Breadboard Trainer Kit", category: "Tool", quantity: 30, workingQty: 28, nonWorkingQty: 2, status: "Active", purchaseDate: "2021-11-03", images: [] },
  { name: "Logic Analyzer", category: "Instrument", quantity: 4, workingQty: 3, nonWorkingQty: 1, status: "Maintenance", purchaseDate: "2020-06-30", images: [] },
  { name: "Spectrum Analyzer", category: "Instrument", quantity: 2, workingQty: 2, nonWorkingQty: 0, status: "Active", purchaseDate: "2019-12-10", images: [] },
];

export const seedDevices: Device[] = seedLabs.flatMap((lab, i) =>
  deviceTemplates.slice(0, 3 + (i % 4)).map((d, j) => ({
    ...d,
    id: `dev-${lab.id}-${j}`,
    labId: lab.id,
  })),
);

export const seedStaff: Staff[] = [
  { id: "st-1", name: "Dr. Anjali Sharma", role: "HOD", labId: "lab-14", email: "anjali.sharma@cdgi.edu.in", phone: "+91 98260 11111" },
  { id: "st-2", name: "Prof. Rajeev Kulkarni", role: "Faculty", labId: "lab-9", email: "rajeev.k@cdgi.edu.in", phone: "+91 98260 22222" },
  { id: "st-3", name: "Prof. Meera Iyer", role: "Faculty", labId: "lab-10", email: "meera.iyer@cdgi.edu.in", phone: "+91 98260 33333" },
  { id: "st-4", name: "Mr. Suresh Patel", role: "Lab Assistant", labId: "lab-4", email: "suresh.p@cdgi.edu.in", phone: "+91 98260 44444" },
  { id: "st-5", name: "Mrs. Kavita Joshi", role: "Lab Assistant", labId: "lab-1", email: "kavita.j@cdgi.edu.in", phone: "+91 98260 55555" },
  { id: "st-6", name: "Mr. Amit Verma", role: "Technician", labId: "lab-16", email: "amit.v@cdgi.edu.in", phone: "+91 98260 66666" },
  { id: "st-7", name: "Prof. Neha Gupta", role: "Faculty", labId: "lab-6", email: "neha.g@cdgi.edu.in", phone: "+91 98260 77777" },
  { id: "st-8", name: "Prof. Vikram Singh", role: "Faculty", labId: "lab-11", email: "vikram.s@cdgi.edu.in", phone: "+91 98260 88888" },
  { id: "st-9", name: "Mr. Deepak Mishra", role: "Lab Assistant", labId: "lab-13", email: "deepak.m@cdgi.edu.in", phone: "+91 98260 99999" },
  { id: "st-10", name: "Prof. Sunita Rao", role: "Faculty", labId: "lab-20", email: "sunita.r@cdgi.edu.in", phone: "+91 98261 00000" },
  { id: "st-11", name: "Mr. Harshit Jain", role: "Technician", labId: "lab-2", email: "harshit.j@cdgi.edu.in", phone: "+91 98261 11111" },
  { id: "st-12", name: "Prof. Pooja Saxena", role: "Faculty", labId: "lab-15", email: "pooja.s@cdgi.edu.in", phone: "+91 98261 22222" },
  { id: "st-13", name: "Mr. Ritesh Yadav", role: "Lab Assistant", labId: "lab-17", email: "ritesh.y@cdgi.edu.in", phone: "+91 98261 33333" },
  { id: "st-14", name: "Prof. Kunal Bhatia", role: "Faculty", labId: "lab-18", email: "kunal.b@cdgi.edu.in", phone: "+91 98261 44444" },
  { id: "st-15", name: "Mrs. Smita Pandey", role: "Lab Assistant", labId: "lab-8", email: "smita.p@cdgi.edu.in", phone: "+91 98261 55555" },
];

// Wire incharge ids back into labs
const labInchargeMap: Record<string, string> = {
  "lab-1": "st-5", "lab-2": "st-11", "lab-4": "st-4", "lab-6": "st-7",
  "lab-8": "st-15", "lab-9": "st-2", "lab-10": "st-3", "lab-11": "st-8",
  "lab-13": "st-9", "lab-14": "st-1", "lab-15": "st-12", "lab-16": "st-6",
  "lab-17": "st-13", "lab-18": "st-14", "lab-20": "st-10",
};
seedLabs.forEach((l) => { l.inchargeId = labInchargeMap[l.id]; });

export const seedTransfers: Transfer[] = [
  { id: "tr-1", deviceId: "dev-lab-4-0", fromLabId: "lab-4", toLabId: "lab-9", quantity: 1, date: "2024-09-12", note: "Required for embedded experiments" },
  { id: "tr-2", deviceId: "dev-lab-1-2", fromLabId: "lab-1", toLabId: "lab-2", quantity: 3, date: "2024-10-01", note: "Lab balancing" },
  { id: "tr-3", deviceId: "dev-lab-10-1", fromLabId: "lab-10", toLabId: "lab-11", quantity: 2, date: "2024-11-22" },
];

export const seedActivities: Activity[] = [
  { id: "ac-1", type: "create", entity: "lab", message: "Created lab “IoT & Embedded Systems Lab”", date: "2024-12-02T10:14:00Z" },
  { id: "ac-2", type: "transfer", entity: "transfer", message: "Transferred 2× DSO from DSP Lab to Digital Comm. Lab", date: "2024-12-04T09:01:00Z" },
  { id: "ac-3", type: "update", entity: "device", message: "Updated quantity for Soldering Station in Basic Electronics Lab", date: "2024-12-05T15:23:00Z" },
  { id: "ac-4", type: "create", entity: "staff", message: "Added staff Prof. Sunita Rao to IoT Lab", date: "2024-12-06T08:42:00Z" },
];
