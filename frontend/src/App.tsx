import { useEffect, useState } from 'react'
import './App.css'
import jungleHome from "./assets/jungleHome.jpg";

const apiBase = import.meta.env.VITE_API_URL ?? ''

function App() {
  const [apiOk, setApiOk] = useState<boolean | null>(null)

  const [search, setSearch] = useState("")

  type City = {
    name: string
    country: string
  }
  const [results, setResults] = useState<City[]>([])



async function handleSearch() {
  const res = await fetch(`${apiBase}/api/cities?search=${search}`)
  const data = await res.json()
  setResults(data)
}




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
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">Travel Vibe</div>
        <ul className="navbar-menu">
          <li><a href="#home">Home</a></li>
          <li><a href="#explore">Explore</a></li>
          <li><a href="#trips">My Trips</a></li>
          <li><a href="#profile">Profile</a></li>
        </ul>
      </nav>

      <main className="app">
        <div className='hero-section'>
          <div className='hero-text'>
            <h1>Travel Vibe</h1>

            <p className="lede">
              Discover your perfect stay
            </p>
          </div>

          <div className='front-image'>
            <img src={jungleHome} alt="Tropical destination" />
          </div>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search a city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button onClick={handleSearch}>
            Search
          </button>
        </div>
        <div className="results">
          {results.map((city) => (
            <p key={`${city.name}-${city.country}`}>
              {city.name}, {city.country}
            </p>
          ))}
        </div>
      </main>

      <section className="status">
        <span className="status-label">API:</span>
        {apiOk === null && <span className="status-pending"> checking...</span>}
        {apiOk === true && <span className="status-ok"> connected</span>}
        {apiOk === false && <span className="status-fail"> backend offline</span>}
      </section>
    </div>
  )
}

export default App
