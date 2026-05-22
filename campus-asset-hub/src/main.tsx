import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import './styles.css'

async function bootstrap() {
  const router = await getRouter()
  const rootEl = document.getElementById('root')
  if (!rootEl) {
    throw new Error('No root element found')
  }

  const root = createRoot(rootEl)
  root.render(<RouterProvider router={router} />)
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to bootstrap app', err)
})
