import express from 'express'
import multer from 'multer'
import path from 'path'
import {
  listDevices,
  getDevice,
  createDevice,
  updateDevice,
  deleteDevice,
} from '../controllers/devicesController.js'

const router = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'public', 'uploads', 'devices'))
  },
  filename: function (req, file, cb) {
    const name = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`
    cb(null, name)
  },
})

const upload = multer({ storage })

router.get('/', listDevices)
router.get('/:id', getDevice)
router.post('/', upload.array('images', 6), createDevice)
router.put('/:id', upload.array('images', 6), updateDevice)
router.delete('/:id', deleteDevice)

export default router
