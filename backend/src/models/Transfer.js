import mongoose from 'mongoose'

const TransferSchema = new mongoose.Schema({
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  fromLabId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  toLabId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String, default: '' },
})

export default mongoose.model('Transfer', TransferSchema)
