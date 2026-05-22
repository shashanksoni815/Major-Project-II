import mongoose from 'mongoose'

const StaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['Lab Assistant', 'Faculty', 'HOD', 'Technician'], default: 'Faculty' },
  labIds: { type: [{ type: String, ref: 'Lab' }], default: [] },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  passwordHash: { type: String },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Staff', StaffSchema)
