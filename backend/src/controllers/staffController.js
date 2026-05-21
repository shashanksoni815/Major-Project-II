import fs from 'fs'
import path from 'path'
import Staff from '../models/Staff.js'

const AVATAR_DIR = path.join(process.cwd(), 'public', 'uploads', 'avatars')
fs.mkdirSync(AVATAR_DIR, { recursive: true })

export const listStaff = async (req, res) => {
  const staff = await Staff.find().sort({ createdAt: -1 })
  res.json(staff)
}

export const getStaff = async (req, res) => {
  const s = await Staff.findById(req.params.id)
  if (!s) return res.status(404).json({ error: 'Not found' })
  res.json(s)
}

export const createStaff = async (req, res) => {
  try {
    const body = { ...req.body }
    if (req.file) body.avatar = `/uploads/avatars/${req.file.filename}`
    const staff = await Staff.create(body)
    res.status(201).json(staff)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const updateStaff = async (req, res) => {
  try {
    const body = { ...req.body }
    const staff = await Staff.findById(req.params.id)
    if (!staff) return res.status(404).json({ error: 'Not found' })
    if (req.file) {
      // delete old avatar file
      if (staff.avatar) {
        try {
          const p = path.join(process.cwd(), 'public', staff.avatar.replace(/^\//, ''))
          if (fs.existsSync(p)) fs.unlinkSync(p)
        } catch (e) {}
      }
      staff.avatar = `/uploads/avatars/${req.file.filename}`
    }
    Object.keys(body).forEach((k) => {
      if (k === 'avatar') return
      staff[k] = body[k]
    })
    await staff.save()
    res.json(staff)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const deleteStaff = async (req, res) => {
  const staff = await Staff.findById(req.params.id)
  if (!staff) return res.status(404).json({ error: 'Not found' })
  if (staff.avatar) {
    try {
      const p = path.join(process.cwd(), 'public', staff.avatar.replace(/^\//, ''))
      if (fs.existsSync(p)) fs.unlinkSync(p)
    } catch (e) {}
  }
  await Staff.findByIdAndDelete(req.params.id)
  res.status(204).end()
}
