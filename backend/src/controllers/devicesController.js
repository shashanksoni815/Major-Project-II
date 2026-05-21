import fs from 'fs'
import path from 'path'
import Device from '../models/Device.js'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'devices')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

export const listDevices = async (req, res) => {
  const { labId } = req.query
  const filter = labId ? { labId } : {}
  const devices = await Device.find(filter).sort({ createdAt: -1 })
  res.json(devices)
}

export const getDevice = async (req, res) => {
  const device = await Device.findById(req.params.id)
  if (!device) return res.status(404).json({ error: 'Not found' })
  res.json(device)
}

export const createDevice = async (req, res) => {
  try {
    const body = { ...req.body }
    const files = req.files || []
    const existingImages = body.existingImages
      ? Array.isArray(body.existingImages)
        ? body.existingImages
        : JSON.parse(body.existingImages)
      : []

    body.images = Array.isArray(existingImages) ? existingImages : []
    for (const f of files) {
      const urlPath = `/uploads/devices/${f.filename}`
      body.images.push(urlPath)
    }

    body.quantity = Number(body.quantity)
    body.workingQty = Number(body.workingQty)
    body.nonWorkingQty = Number(body.nonWorkingQty)

    const device = await Device.create(body)
    res.status(201).json(device)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const updateDevice = async (req, res) => {
  try {
    const body = { ...req.body }
    const files = req.files || []
    const device = await Device.findById(req.params.id)
    if (!device) return res.status(404).json({ error: 'Not found' })

    const existingImages = body.existingImages
      ? Array.isArray(body.existingImages)
        ? body.existingImages
        : JSON.parse(body.existingImages)
      : device.images || []

    const newImages = files.map((f) => `/uploads/devices/${f.filename}`)
    device.images = Array.isArray(existingImages) ? existingImages.concat(newImages) : ([]).concat(newImages)

    Object.keys(body).forEach((k) => {
      if (k === 'existingImages') return
      if (k === 'images') return
      if (k === 'quantity' || k === 'workingQty' || k === 'nonWorkingQty') {
        device[k] = Number(body[k])
      } else {
        device[k] = body[k]
      }
    })

    await device.save()
    res.json(device)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const deleteDevice = async (req, res) => {
  const device = await Device.findById(req.params.id)
  if (!device) return res.status(404).json({ error: 'Not found' })
  // optionally delete files
  for (const img of device.images || []) {
    try {
      const p = path.join(process.cwd(), 'public', img.replace(/^\//, ''))
      if (fs.existsSync(p)) fs.unlinkSync(p)
    } catch (e) {
      // ignore
    }
  }
  await Device.findByIdAndDelete(req.params.id)
  res.status(204).end()
}
