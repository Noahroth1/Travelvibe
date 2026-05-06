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

      <p className="lede">
        Discover your perfect stay
      </p>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search a city..."
        />

        <button>
          Search
        </button>
      </div>

      <section className="status">
        <span className="status-label">API:</span>

        {apiOk === null && <span> checking...</span>}
        {apiOk === true && <span> connected</span>}
        {apiOk === false && <span> backend offline</span>}
      </section>
    </main>
  )
}

export default App
