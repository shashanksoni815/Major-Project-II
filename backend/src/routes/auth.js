import express from 'express'
import Staff from '../models/Staff.js'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Register a new staff account
router.post('/register', async (req, res) => {
  const { name, email, password, phone, role, labId, labIds } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' })

  const existing = await Staff.findOne({ email })
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' })

  const passwordHash = await bcrypt.hash(password, 8)
  const resolvedLabIds = labIds ?? (labId ? (Array.isArray(labId) ? labId : [labId]) : [])
  const user = await Staff.create({ name, email, passwordHash, phone: phone || '', role: role || 'Faculty', labIds: resolvedLabIds })

  const token = uuidv4()
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, labIds: user.labIds || [] } })
})

// Simple login endpoint (email + password)
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })

  const user = await Staff.findOne({ email })
  if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  const token = uuidv4()
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, labIds: user.labIds || [] } })
})

export default router
