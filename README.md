# Campus Asset Hub

A full-stack Campus Asset Management System for managing labs, devices, staff, and transfers across a college or department.

This repository contains two main applications:

- `backend/` – Express + MongoDB API server for labs, devices, staff, transfers, uploads, and seeding data
- `campus-asset-hub/` – React + Vite frontend with animated dashboards, forms, tables, uploads, and device transfer workflows

---

## ✨ Project Overview

Campus Asset Hub provides a modern interface for:

- tracking labs and equipment inventories
- uploading device images and staff avatars
- transferring devices between labs
- viewing transfer history and activity logs
- managing device availability, working counts, and statuses

The frontend is built with React and Tailwind CSS, and the backend uses Express with MongoDB.

---

## 🚀 Features

- Animated dashboard and page transitions with `framer-motion`
- Device photo upload and storage handling through the backend
- Lab, device, staff CRUD operations
- Transfer workflow with history tracking
- Local state management with `zustand`
- API-based persistence using `Express` and `Mongoose`
- File uploads with `multer`
- PDF/table export support via `jspdf` and `jspdf-autotable`
- Responsive UI built with Tailwind CSS and Radix primitives

---

## 🧩 Technology Stack

### Backend

- Node.js + Express
- MongoDB with Mongoose
- Environment variables via `dotenv`
- HTTP request logging with `morgan`
- CORS support via `cors`
- File upload using `multer`
- Password hashing via `bcryptjs`
- Development reload with `nodemon`

### Frontend

- React 19
- Vite
- TypeScript
- Tailwind CSS + `@tailwindcss/vite`
- Zustand for state management
- TanStack Router for routing
- Framer Motion for animation
- Sonner for toast notifications
- Radix UI components
- Recharts for charts
- jsPDF + jsPDF-AutoTable for PDF export
- XLSX for spreadsheet support
- Zod for validation support

---

## 📁 Repository Structure

```text
backend/
  package.json
  src/
    index.js
    controllers/
    models/
    routes/
    lib/
campus-asset-hub/
  package.json
  vite.config.ts
  tsconfig.json
  src/
    components/
    hooks/
    lib/
    routes/
    styles.css
```

---

## ⚙️ Setup Instructions

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file based on backend requirements and add at least:

```env
MONGODB_URI=mongodb://localhost:27017/campus-asset-hub
PORT=4000
```

Then run:

```bash
npm run dev
```

This starts the backend server on `http://localhost:4000`.

### 2. Frontend

```bash
cd campus-asset-hub
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

---

## 🧪 Development Workflow

- `npm run dev` – start the frontend dev server
- `npm run build` – build the frontend for production
- `npm run preview` – preview the production build
- `npm run lint` – run ESLint
- `npm run format` – format code with Prettier

### Backend scripts

- `npm start` – run the backend server
- `npm run dev` – run backend with `nodemon`
- `npm run seed` – seed the database with initial data

---

## 🔌 API Endpoints

### Backend

- `GET /api/labs` – list all labs
- `POST /api/labs` – create a new lab
- `PUT /api/labs/:id` – update a lab
- `DELETE /api/labs/:id` – delete a lab

- `GET /api/devices` – list devices
- `GET /api/devices/:id` – get a device
- `POST /api/devices` – create a device with image upload
- `PUT /api/devices/:id` – update a device with image upload
- `DELETE /api/devices/:id` – delete a device

- `GET /api/staff` – list staff
- `POST /api/staff` – create staff with optional avatar upload
- `PUT /api/staff/:id` – update staff
- `DELETE /api/staff/:id` – remove staff

- `GET /api/transfers` – list transfer history
- `POST /api/transfers` – create a device transfer between labs

- `GET /uploads/...` – access uploaded images

---

## 🧠 Notes

- The frontend expects `VITE_API_BASE` to point to the backend, and defaults to `http://localhost:4000`.
- Uploaded device images are stored under `backend/public/uploads/devices`
- Uploaded staff avatars are stored under `backend/public/uploads/avatars`
- The transfer system tracks inventory changes and saves transfer history to MongoDB

---

## 💡 Recommended Environment

- Node.js 20+
- MongoDB 6+
- npm 10+

---

## 🏁 Quick Start

1. Start MongoDB
2. Run backend: `cd backend && npm run dev`
3. Run frontend: `cd campus-asset-hub && npm run dev`
4. Open the app in your browser

---

## 📬 Contact

Project created by **Shashank Soni**.

If you want to extend the app, focus on:

- adding authentication
- improving transfer validation
- supporting user permissions
- adding export/import features for inventory data
