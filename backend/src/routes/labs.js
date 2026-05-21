import express from 'express'
import Lab from '../models/Lab.js'

const router = express.Router()

// Create lab
router.post('/', async (req, res) => {
  try {
    const lab = await Lab.create(req.body)
    res.status(201).json(lab)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// List labs
router.get('/', async (req, res) => {
  const labs = await Lab.find().sort({ createdAt: -1 })
  res.json(labs)
})

// Get one
router.get('/:id', async (req, res) => {
  const lab = await Lab.findById(req.params.id)
  if (!lab) return res.status(404).json({ error: 'Not found' })
  res.json(lab)
})

// Update
router.put('/:id', async (req, res) => {
  try {
    const lab = await Lab.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(lab)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Delete
router.delete('/:id', async (req, res) => {
  await Lab.findByIdAndDelete(req.params.id)
  res.status(204).end()
})

export default router
