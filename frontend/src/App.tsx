import { useEffect, useState } from 'react'
import './App.css'

const apiBase = import.meta.env.VITE_API_URL ?? ''

function App() {
  const [apiOk, setApiOk] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`${apiBase}/api/health`)
      .then((res) => {
        if (!res.ok) throw new Error('bad status')
        return res.json()
      })
      .then((data: { status?: string }) => {
        if (!cancelled) setApiOk(data.status === 'ok')
      })
      .catch(() => {
        if (!cancelled) setApiOk(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="app">
      <h1>Travel Vibe</h1>
      <p className="lede">React + Vite frontend. FastAPI and PostgreSQL are ready to wire up.</p>
      <section className="status" aria-live="polite">
        <span className="status-label">API</span>
        {apiOk === null && <span className="status-pending">checking…</span>}
        {apiOk === true && <span className="status-ok">connected</span>}
        {apiOk === false && (
          <span className="status-fail">
            not reachable — run the backend on port 8000 (see README)
          </span>
        )}
      </section>
    </main>
  )
}

export default App
