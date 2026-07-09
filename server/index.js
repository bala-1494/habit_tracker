// Tiny REST backend that gives the habit tracker cross-device storage.
//
// Run:  npm run server         (defaults to http://localhost:3001)
// In dev the Vite server proxies /api to this port (see vite.config.ts); in
// production this server also serves the built frontend from ../dist.

import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync } from 'node:fs'
import { getState, replaceState } from './db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001

// Note: the server intentionally does NOT seed default habits. A fresh database
// starts empty; the first client to connect uploads its own state (either the
// user's existing localStorage data or the app's built-in defaults). This makes
// the first sync a clean migration rather than an overwrite.

const app = express()
app.use(cors())
app.use(express.json({ limit: '5mb' }))

// Read the full state (habits + logs + tasks) for any device.
app.get('/api/state', (_req, res) => {
  try {
    res.json(getState())
  } catch (err) {
    console.error('GET /api/state failed:', err)
    res.status(500).json({ error: 'failed to read state' })
  }
})

// Persist the full state. The client sends the whole AppState on every change;
// we replace the tables atomically so every device sees the same data.
app.put('/api/state', (req, res) => {
  const body = req.body
  if (!body || !Array.isArray(body.habits) || typeof body.logs !== 'object') {
    return res.status(400).json({ error: 'invalid state payload' })
  }
  try {
    replaceState(body)
    res.json(getState())
  } catch (err) {
    console.error('PUT /api/state failed:', err)
    res.status(500).json({ error: 'failed to save state' })
  }
})

// In production, serve the built SPA so one origin hosts both API and app.
const distDir = join(__dirname, '..', 'dist')
if (existsSync(distDir)) {
  app.use(express.static(distDir))
  // SPA fallback: any non-API GET that didn't match a static file returns the
  // app shell. (Express 5 dropped '*' string routes, so use middleware.)
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next()
    res.sendFile(join(distDir, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Habit tracker API listening on http://localhost:${PORT}`)
})
