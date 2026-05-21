import mongoose from 'mongoose'

const DeviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Machine', 'Instrument', 'Tool'], default: 'Instrument' },
  labId: { type: String },
  quantity: { type: Number, default: 0 },
  workingQty: { type: Number, default: 0 },
  nonWorkingQty: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Maintenance', 'Retired'], default: 'Active' },
  purchaseDate: { type: Date },
  images: { type: [String], default: [] },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Device', DeviceSchema)
