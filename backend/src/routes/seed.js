import express from 'express'
import Lab from '../models/Lab.js'
import Device from '../models/Device.js'
import Staff from '../models/Staff.js'
import Transfer from '../models/Transfer.js'
import bcrypt from 'bcryptjs'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    // Clear
    await Promise.all([Lab.deleteMany({}), Device.deleteMany({}), Staff.deleteMany({}), Transfer.deleteMany({})])

    const lab1 = await Lab.create({ name: 'Electronics Lab', semester: 4, subject: 'Analog Circuits', description: 'ECE lab' })
    const lab2 = await Lab.create({ name: 'Digital Lab', semester: 6, subject: 'Digital Systems', description: 'Digital lab' })

    const staff1 = await Staff.create({ name: 'Alice', role: 'Lab Assistant', email: 'alice@example.com', phone: '1234567890', passwordHash: await bcrypt.hash('password', 8), labId: lab1._id })
    const staff2 = await Staff.create({ name: 'Bob', role: 'Faculty', email: 'bob@example.com', phone: '0987654321', passwordHash: await bcrypt.hash('password', 8), labId: lab2._id })

    await Device.create({ name: 'Oscilloscope', category: 'Instrument', labId: lab1._id, quantity: 5, workingQty: 5, status: 'Active' })
    await Device.create({ name: 'Logic Analyzer', category: 'Instrument', labId: lab2._id, quantity: 3, workingQty: 2, status: 'Active' })

    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
