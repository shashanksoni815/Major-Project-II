import express from 'express'
import path from 'path'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { connectDB } from './lib/db.js'

import authRoutes from './routes/auth.js'
import labsRoutes from './routes/labs.js'
import devicesRoutes from './routes/devices.js'
import staffRoutes from './routes/staff.js'
import transfersRoutes from './routes/transfers.js'
import seedRoutes from './routes/seed.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))

// Serve uploaded files
const uploadsPath = path.join(process.cwd(), 'public', 'uploads')
app.use('/uploads', express.static(uploadsPath))

// Connect DB
await connectDB(process.env.MONGODB_URI)

app.get('/', (req, res) => res.json({ ok: true, message: 'Campus Asset Hub API' }))

app.use('/api/auth', authRoutes)
app.use('/api/labs', labsRoutes)
app.use('/api/devices', devicesRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/transfers', transfersRoutes)
app.use('/api/seed', seedRoutes)

const BASE_PORT = Number(process.env.PORT) || 4000
const MAX_FALLBACK_ATTEMPTS = 5

function startServer(port, attempt = 0) {
  const server = app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`))

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      if (attempt < MAX_FALLBACK_ATTEMPTS) {
        const nextPort = port + 1
        if (process.env.PORT) {
          console.warn(`Configured PORT=${process.env.PORT} is busy. Trying http://localhost:${nextPort} instead...`)
        } else {
          console.warn(`Port ${port} is in use. Trying http://localhost:${nextPort} instead...`)
        }
        startServer(nextPort, attempt + 1)
        return
      }

      console.error(`Unable to bind to a port after ${MAX_FALLBACK_ATTEMPTS + 1} attempts.`)
      process.exit(1)
    }

    console.error(error)
    process.exit(1)
  })
}

startServer(BASE_PORT)
