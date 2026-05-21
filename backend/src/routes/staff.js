import express from 'express'
import multer from 'multer'
import path from 'path'
import bcrypt from 'bcryptjs'
import {
  listStaff,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from '../controllers/staffController.js'

const router = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'public', 'uploads', 'avatars'))
  },
  filename: function (req, file, cb) {
    const name = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`
    cb(null, name)
  },
})

const upload = multer({ storage })

// create staff with optional avatar upload and password hashing
router.post('/', upload.single('avatar'), async (req, res, next) => {
  try {
    const { password, ...rest } = req.body
    const data = { ...rest }
    if (password) data.passwordHash = await bcrypt.hash(password, 8)
    // pass through to controller which will pick up req.file
    req.body = data
    return createStaff(req, res)
  } catch (err) {
    next(err)
  }
})

router.get('/', listStaff)
router.get('/:id', getStaff)
router.put('/:id', upload.single('avatar'), async (req, res, next) => {
  // password updates not handled here
  try {
    return updateStaff(req, res)
  } catch (err) {
    next(err)
  }
})
router.delete('/:id', deleteStaff)

export default router
