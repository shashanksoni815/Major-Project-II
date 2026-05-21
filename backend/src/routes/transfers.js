import express from 'express'
import Transfer from '../models/Transfer.js'
import Device from '../models/Device.js'

const router = express.Router()

// Create transfer and update device quantities
router.post('/', async (req, res) => {
  try {
    const { deviceId, fromLabId, toLabId, quantity, note } = req.body
    if (!deviceId || !fromLabId || !toLabId || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    let device
    try {
      device = await Device.findById(deviceId)
    } catch (e) {
      return res.status(400).json({ error: 'Invalid device ID format' })
    }

    if (!device) return res.status(404).json({ error: 'Device not found' })

    // Validate source device is in source lab and has enough quantity
    if (String(device.labId) !== String(fromLabId)) {
      return res.status(400).json({ error: 'Device not in source lab' })
    }
    if (device.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient quantity' })
    }

    // Calculate working/non-working split for transfer
    const transferWorkingQty = device.quantity > 0 
      ? Math.round(quantity * (device.workingQty / device.quantity))
      : 0
    const transferNonWorkingQty = quantity - transferWorkingQty

    // Update source device
    device.quantity = Math.max(0, device.quantity - quantity)
    device.workingQty = Math.max(0, device.workingQty - transferWorkingQty)
    device.nonWorkingQty = Math.max(0, device.nonWorkingQty - transferNonWorkingQty)

    // Update or create destination device
    let toDevice = await Device.findOne({ name: device.name, labId: toLabId })
    if (!toDevice) {
      toDevice = await Device.create({
        name: device.name,
        category: device.category,
        labId: toLabId,
        quantity: quantity,
        workingQty: transferWorkingQty,
        nonWorkingQty: transferNonWorkingQty,
        status: device.status,
        purchaseDate: device.purchaseDate,
        images: device.images,
        notes: device.notes,
      })
    } else {
      toDevice.quantity = (toDevice.quantity || 0) + quantity
      toDevice.workingQty = (toDevice.workingQty || 0) + transferWorkingQty
      toDevice.nonWorkingQty = (toDevice.nonWorkingQty || 0) + transferNonWorkingQty
      await toDevice.save()
    }

    await device.save()

    const transfer = await Transfer.create({ deviceId, fromLabId, toLabId, quantity, note })
    res.status(201).json(transfer)
  } catch (err) {
    console.error('Transfer error:', err)
    res.status(400).json({ error: err.message })
  }
})

// List transfers
router.get('/', async (req, res) => {
  const transfers = await Transfer.find().sort({ date: -1 })
  res.json(transfers)
})

export default router
