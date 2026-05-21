import mongoose from 'mongoose'

const LabSchema = new mongoose.Schema({
  name: { type: String, required: true },
  semester: { type: Number, default: 0 },
  subject: { type: String, default: '' },
  inchargeId: { type: String, ref: 'Staff' },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Lab', LabSchema)
