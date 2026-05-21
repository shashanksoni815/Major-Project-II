import express from 'express'
import Staff from '../models/Staff.js'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Simple login endpoint (email + password)
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })

  const user = await Staff.findOne({ email })
  if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

  // Very simple session token (not JWT) — return user object and a token
  const token = uuidv4()
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, labId: user.labId } })
})

export default router
