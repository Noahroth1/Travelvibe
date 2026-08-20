import { useState, useEffect, useRef } from 'react'
import { Show, SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/react'
import './App.css'

const apiBase = import.meta.env.VITE_API_URL ?? ''

type Region = 'All' | 'Europe' | 'Asia' | 'Americas' | 'Middle East' | 'Oceania' | 'Africa'
type TripStop = { destination: string; days: number; neighbourhood?: string }
type Trip = { id: string; name: string; destinations: TripStop[]; createdAt: number; travelDate?: string; remote?: boolean }
type ApiTrip = { id: number; name: string; destinations: (TripStop | string)[]; created_at: string; travel_date: string | null }
type AccountState = {
  saved_order: string[]
  notes: Record<string, string>
  been_there: string[]
  recently_viewed: string[]
  dark_mode: boolean
  layout_mode: 'grid' | 'list'
  initialized: boolean
}

function normalizeTripStops(stops: (TripStop | string)[] | undefined): TripStop[] {
  return (stops ?? []).map(stop => typeof stop === 'string'
    ? { destination: stop, days: 1 }
    : { destination: stop.destination, days: Math.max(1, stop.days || 1), neighbourhood: stop.neighbourhood || undefined })
}

function normalizeStoredTrips(trips: Trip[]): Trip[] {
  return trips.map(trip => ({ ...trip, destinations: normalizeTripStops(trip.destinations) }))
}

type City = { name: string; country: string }

type Neighbourhood = { name: string; vibe: string; tips: string[] }

type Destination = {
  name: string
  country: string
  region: Region
  description: string
  image: string
  detail: string
  best_time: string | null
  visit_duration: string | null
  budget_level: '$' | '$$' | '$$$' | null
  vibes: Vibe[]
  neighbourhoods: Neighbourhood[]
  gallery: string[]
}

const heroSlides = [
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1920&h=1080&fit=crop",
]

const searchPlaceholders = [
  "Search a city...",
  "Try Tokyo...",
  "Search Bali...",
  "Explore Paris...",
  "Find Santorini...",
  "Discover New York...",
]

const heroSubtitles = [
  "Most people book the wrong part of the city.",
]

const regionColors: Record<string, { bg: string; color: string }> = {
  'Europe':      { bg: 'rgba(60, 90, 160, 0.1)',  color: '#2c5282' },
  'Asia':        { bg: 'rgba(180, 115, 35, 0.1)', color: '#8a5a10' },
  'Americas':    { bg: 'rgba(184, 92, 56, 0.1)',  color: '#9c3d18' },
  'Middle East': { bg: 'rgba(150, 120, 25, 0.1)', color: '#7a5e0a' },
  'Oceania':     { bg: 'rgba(28, 115, 100, 0.1)', color: '#155c50' },
  'Africa':      { bg: 'rgba(100, 140, 60, 0.1)',  color: '#4a6e20' },
}

const regions: Region[] = ['All', 'Europe', 'Asia', 'Americas', 'Middle East', 'Oceania', 'Africa']

type Vibe = 'Beach' | 'City Break' | 'Culture' | 'Adventure' | 'Food'
const allVibes: Vibe[] = ['Beach', 'City Break', 'Culture', 'Adventure', 'Food']

const neighRecoMap: Record<string, [number, number, number, number]> = {
  'Bali':         [1, 2, 0, 0],
  'Paris':        [0, 2, 1, 2],
  'Tokyo':        [0, 1, 1, 2],
  'New York':     [2, 1, 0, 1],
  'Santorini':    [1, 1, 0, 2],
  'Dubai':        [0, 1, 2, 2],
  'Machu Picchu': [0, 1, 2, 2],
  'Sydney':       [1, 2, 0, 2],
  'Rome':         [0, 2, 1, 2],
  'Barcelona':    [2, 1, 0, 1],
  'Amsterdam':    [2, 1, 0, 0],
  'Singapore':    [0, 1, 1, 2],
  'Bangkok':      [0, 2, 1, 1],
  'Kyoto':        [1, 0, 0, 2],
  'Reykjavik':    [0, 1, 0, 2],
  'Buenos Aires': [0, 1, 2, 1],
  'Tbilisi':      [1, 1, 0, 2],
  'Medellín':     [0, 1, 2, 1],
  'Porto':        [0, 1, 0, 2],
  'Chiang Mai':   [1, 2, 0, 0],
  'Sarajevo':     [0, 1, 0, 2],
  'Oaxaca':       [0, 2, 0, 1],
  'Plovdiv':      [1, 1, 0, 2],
  'Kotor':        [0, 1, 0, 2],
  'Budapest':     [0, 2, 1, 2],
  'Hoi An':       [0, 1, 0, 2],
  'Mexico City':  [0, 0, 2, 1],
  'Cartagena':    [0, 1, 0, 2],
  'Split':        [0, 1, 0, 2],
  'Valletta':     [0, 1, 1, 2],
  'Yogyakarta':   [1, 0, 0, 2],
  'Riga':         [0, 1, 1, 2],
  'Lisbon':       [1, 0, 0, 2],
  'Hanoi':        [0, 0, 1, 2],
  'Cape Town':    [0, 1, 0, 2],
  'Lima':         [1, 0, 1, 2],
}

const destFitMap: Record<string, { perfectIf: string; notForYou: string }> = {
  'Bali':         { perfectIf: 'You want culture, beach and good food on a mid-range budget — and you\'re happy to figure things out as you go', notForYou: 'You need reliable infrastructure or want to avoid heavily touristed areas' },
  'Paris':        { perfectIf: 'You love food and architecture and are willing to plan ahead — this city rewards effort', notForYou: 'You\'re expecting warmth from strangers or want to avoid crowds year-round' },
  'Tokyo':        { perfectIf: 'You\'re comfortable navigating solo and want a city that rewards curiosity at every turn', notForYou: 'You need English everywhere or want a slow, relaxed pace' },
  'New York':     { perfectIf: 'You thrive on energy and want world-class food, culture and nightlife in one place', notForYou: 'Budget is tight or you want somewhere that feels manageable and not overwhelming' },
  'Santorini':    { perfectIf: 'You want dramatic scenery and a slow few days — and don\'t mind paying for both', notForYou: 'You\'re travelling solo, on a budget, or looking for authentic local culture' },
  'Dubai':        { perfectIf: 'You want luxury, heat and big experiences without watching every dirham', notForYou: 'You\'re looking for history, cultural depth or a city with a relaxed atmosphere' },
  'Machu Picchu': { perfectIf: 'You want one of the world\'s great sights and are prepared to earn the journey to get there', notForYou: 'Altitude, long travel days or physical hiking are dealbreakers for you' },
  'Sydney':       { perfectIf: 'You want beach, city and nature in one place with no language barrier and good weather', notForYou: 'Budget is a concern — Australia is expensive across the board' },
  'Rome':         { perfectIf: 'You eat well, walk a lot and can live with crowds at the main sites', notForYou: 'You want efficiency or a city that moves at a fast pace' },
  'Barcelona':    { perfectIf: 'You want beach, food, nightlife and architecture without having to choose between them', notForYou: 'You\'re a light sleeper or want to avoid pickpockets — both are genuine issues here' },
  'Amsterdam':    { perfectIf: 'You like cycling, world-class museums and canal-side cafés at a relaxed pace', notForYou: 'You\'re visiting in summer on a budget — it\'s crowded and more expensive than people expect' },
  'Singapore':    { perfectIf: 'You want Asia made easy — safe, clean, incredible food, minimal culture shock', notForYou: 'You want grit, authenticity or a destination that won\'t cost a fortune' },
  'Bangkok':      { perfectIf: 'You want world-class street food and temples at a price that almost doesn\'t make sense', notForYou: 'Heat, traffic and sensory overload are dealbreakers rather than features' },
  'Kyoto':        { perfectIf: 'You want the Japan of bamboo groves and temple gardens, away from neon and noise', notForYou: 'You need a city that stays open late or moves at a fast pace' },
  'Reykjavik':    { perfectIf: 'You want dramatic natural landscapes — glaciers, geysers, northern lights — unlike anywhere else', notForYou: 'Budget travel — Iceland is relentlessly expensive and there\'s no way around it' },
  'Buenos Aires': { perfectIf: 'You love steak, wine, tango and late nights in a city with a genuine European soul', notForYou: 'You need economic and political stability as a baseline comfort' },
  'Tbilisi':      { perfectIf: 'You want ancient culture, incredible food and natural wine at almost no cost', notForYou: 'You need Western comforts or reliable public transport throughout' },
  'Medellín':     { perfectIf: 'You want a transformed city with great weather, coffee culture and a growing creative scene', notForYou: 'Safety concerns in Latin America are a non-starter — research your specific areas before going' },
  'Porto':        { perfectIf: 'You want beauty, seafood, port wine and old-city charm without the Paris price tag', notForYou: 'You want a city that moves quickly or stays lively past midnight' },
  'Chiang Mai':   { perfectIf: 'You want to base yourself somewhere cheap, calm and culturally rich for weeks at a time', notForYou: 'Beach is non-negotiable — you\'re two hours from the coast here' },
  'Sarajevo':     { perfectIf: 'You want real, layered history that hits differently and food that costs almost nothing', notForYou: 'You need polished tourist infrastructure or a wide range of nightlife options' },
  'Oaxaca':       { perfectIf: 'You\'re serious about food, craft mezcal and indigenous culture in a stunning colonial city', notForYou: 'Altitude is an issue — Oaxaca sits at 1,500m and you\'ll feel it on day one' },
  'Plovdiv':      { perfectIf: 'You want an Old Town that still has actual residents in it, not just tourists and souvenir shops', notForYou: 'You need more than 2–3 days of things to do or an easy international connection' },
  'Kotor':        { perfectIf: 'You want Dubrovnik\'s scenery and medieval walls without Dubrovnik\'s cruise ship crowds', notForYou: 'You\'re visiting in July or August — the heat and crowds arrive at the same time' },
  'Budapest':     { perfectIf: 'You want a Central European capital with ruin bars, thermal baths and great food at still-reasonable prices', notForYou: 'You want to avoid stag and hen party crowds — Budapest attracts them in serious volume' },
  'Hoi An':       { perfectIf: 'You want a beautifully preserved old town, a beach 20 minutes away and genuinely good tailoring', notForYou: 'You don\'t handle heat and humidity well — it\'s both, most of the year' },
  'Mexico City':  { perfectIf: 'You\'re a food person who wants one of the world\'s best dining cities at a fraction of European prices', notForYou: 'Air quality is a genuine concern — it\'s one of the most polluted capitals in the Americas' },
  'Cartagena':    { perfectIf: 'You want a picture-perfect walled colonial city with Caribbean heat, colour and good seafood', notForYou: 'You\'re visiting in July or August — the heat and humidity are genuinely brutal' },
  'Split':        { perfectIf: 'You want a real city to base from while island-hopping the Dalmatian coast', notForYou: 'You\'re arriving in peak summer without having booked accommodation months ahead' },
  'Valletta':     { perfectIf: 'You want a UNESCO World Heritage city so compact you can walk the entire thing in a morning', notForYou: 'You need more than 2–3 days of things to do' },
  'Yogyakarta':   { perfectIf: 'You want to see Borobudur and Prambanan temples without the crowds that hit Bali', notForYou: 'Comfort and reliable infrastructure are important parts of your travel experience' },
  'Riga':         { perfectIf: 'You love Art Nouveau architecture and want a Baltic city that is genuinely, quietly underrated', notForYou: 'You\'re visiting in winter — it\'s cold, dark and much of the city quiets down significantly' },
  'Lisbon':       { perfectIf: 'You want a European capital with hills, trams, great wine and half the price of Paris or Amsterdam', notForYou: 'You\'re visiting in peak summer — it\'s been overwhelmed by tourism and the prices show it' },
  'Hanoi':        { perfectIf: 'You want the most intense food city in Vietnam and an old town that is still genuinely, chaotically old', notForYou: 'Noise, motorbikes and street chaos are things you need to tune out, not lean into' },
  'Cape Town':    { perfectIf: 'You want dramatic scenery, world-class food and wine, and a city unlike anywhere else on the continent', notForYou: 'Safety concerns are a dealbreaker — some areas require awareness and you need to stay informed' },
  'Lima':         { perfectIf: 'You\'re a food person — Lima has one of the best restaurant scenes in the world at every price point', notForYou: 'You\'re expecting beaches or sunshine — Lima is grey and overcast for most of the year' },
}

const quizQuestions = [
  {
    q: "How do you want to feel on this trip?",
    sub: "Pick the vibe that feels right.",
    options: ["Energised & social", "Relaxed & slow", "Inspired & curious", "Adventurous & active"],
  },
  {
    q: "What's the main priority?",
    sub: "One thing above everything else.",
    options: ["Food & drink", "History & culture", "Beaches & sunshine", "Mountains & nature"],
  },
  {
    q: "What's the budget situation?",
    sub: "Be honest — it changes everything.",
    options: ["Making it work on less", "Comfortable mid-range", "Ready to spend properly"],
  },
  {
    q: "How long is the trip?",
    sub: "Including travel days.",
    options: ["2–3 days", "4–7 days", "Over a week"],
  },
  {
    q: "Who's coming?",
    sub: "It changes the right answer every time.",
    options: ["Just me", "Me and a partner", "Group of friends", "Family"],
  },
]

const quizScoring: Record<string, number>[][] = [
  // Q1 Vibe: Energised / Relaxed / Inspired / Adventurous
  [
    { "New York": 3, "Tokyo": 2, "Bangkok": 3, "Medellín": 3, "Barcelona": 2, "Chiang Mai": 2, "Budapest": 2, "Tbilisi": 1, "Sydney": 1, "Singapore": 2, "Mexico City": 2 },
    { "Bali": 3, "Santorini": 3, "Kotor": 2, "Sydney": 2, "Hoi An": 2, "Split": 2, "Porto": 1, "Plovdiv": 1, "Cartagena": 2 },
    { "Paris": 3, "Kyoto": 3, "Rome": 2, "Tbilisi": 2, "Sarajevo": 2, "Porto": 2, "Plovdiv": 2, "Oaxaca": 2, "Valletta": 2, "Riga": 2, "Amsterdam": 2, "Tokyo": 1 },
    { "Machu Picchu": 3, "Reykjavik": 3, "Tbilisi": 2, "Chiang Mai": 2, "Yogyakarta": 2, "Medellín": 1, "Bali": 1 },
  ],
  // Q2 Priority: Food / History / Beaches / Mountains & nature
  [
    { "Paris": 3, "Oaxaca": 3, "Bangkok": 3, "Tokyo": 2, "Singapore": 2, "Medellín": 2, "Porto": 2, "Mexico City": 3, "Barcelona": 2, "New York": 1, "Budapest": 2, "Hoi An": 2 },
    { "Sarajevo": 3, "Plovdiv": 3, "Rome": 3, "Kyoto": 3, "Valletta": 3, "Riga": 3, "Tbilisi": 2, "Paris": 2, "Yogyakarta": 2, "Amsterdam": 2, "Tokyo": 1, "Dubai": 1, "Machu Picchu": 1, "Barcelona": 1 },
    { "Bali": 3, "Santorini": 3, "Kotor": 2, "Sydney": 2, "Split": 3, "Cartagena": 2, "Barcelona": 2, "Hoi An": 2, "Dubai": 1 },
    { "Machu Picchu": 3, "Reykjavik": 3, "Chiang Mai": 3, "Bali": 2, "Tbilisi": 2, "Yogyakarta": 2, "Sydney": 1 },
  ],
  // Q3 Budget: Making it work / Mid-range / Ready to spend
  [
    { "Porto": 3, "Tbilisi": 3, "Sarajevo": 3, "Plovdiv": 3, "Chiang Mai": 3, "Budapest": 3, "Hoi An": 3, "Riga": 3, "Valletta": 2, "Yogyakarta": 3, "Medellín": 2, "Oaxaca": 2, "Kotor": 2, "Mexico City": 2, "Cartagena": 2, "Split": 2 },
    { "Tokyo": 2, "Bali": 2, "New York": 2, "Sydney": 2, "Bangkok": 2, "Rome": 2, "Barcelona": 2, "Amsterdam": 2, "Budapest": 1, "Medellín": 2, "Chiang Mai": 1, "Porto": 1, "Oaxaca": 1 },
    { "Paris": 3, "Santorini": 3, "Dubai": 3, "Singapore": 3, "Reykjavik": 2, "New York": 2, "Sydney": 1, "Tokyo": 1, "Kyoto": 1 },
  ],
  // Q4 Duration: 2–3 days / 4–7 days / Over a week
  [
    { "Plovdiv": 3, "Sarajevo": 2, "Paris": 2, "Valletta": 3, "Riga": 3, "Amsterdam": 2, "Santorini": 1, "Kotor": 1, "Porto": 1 },
    { "Tokyo": 2, "New York": 2, "Sydney": 2, "Tbilisi": 2, "Porto": 2, "Oaxaca": 2, "Kotor": 2, "Dubai": 2, "Bangkok": 2, "Barcelona": 2, "Rome": 2, "Singapore": 2, "Kyoto": 2, "Budapest": 2, "Hoi An": 2, "Cartagena": 2, "Split": 2, "Yogyakarta": 2, "Reykjavik": 2, "Bali": 1, "Mexico City": 2 },
    { "Bali": 3, "Chiang Mai": 3, "Buenos Aires": 3, "Medellín": 2, "Machu Picchu": 2, "Tokyo": 1, "Tbilisi": 1, "Mexico City": 1 },
  ],
  // Q5 Who: Solo / Partner / Friends / Family
  [
    { "Tbilisi": 2, "Chiang Mai": 2, "Sarajevo": 2, "Riga": 2, "Plovdiv": 2, "Medellín": 1, "Tokyo": 1, "Porto": 1, "Bangkok": 2, "Hoi An": 2, "Yogyakarta": 2, "Mexico City": 2 },
    { "Santorini": 3, "Paris": 3, "Kotor": 2, "Bali": 2, "Kyoto": 2, "Rome": 2, "Porto": 1, "Dubai": 1, "Barcelona": 2, "Cartagena": 2, "Split": 2, "Hoi An": 1 },
    { "New York": 3, "Budapest": 3, "Medellín": 2, "Chiang Mai": 2, "Oaxaca": 2, "Barcelona": 2, "Amsterdam": 2, "Buenos Aires": 2, "Tokyo": 1, "Bali": 1, "Sydney": 1, "Bangkok": 2, "Mexico City": 2 },
    { "Sydney": 2, "Dubai": 2, "Singapore": 2, "Bali": 1, "New York": 1, "Tokyo": 1, "Paris": 1, "Barcelona": 1 },
  ],
]

function getQuizResults(answers: number[], destinations: Destination[]): Destination[] {
  const all = destinations
  const scores: Record<string, number> = {}
  all.forEach(d => { scores[d.name] = 0 })
  answers.forEach((ansIdx, qIdx) => {
    Object.entries(quizScoring[qIdx]?.[ansIdx] ?? {}).forEach(([name, pts]) => {
      if (scores[name] !== undefined) scores[name] += pts
    })
  })
  return [...all].sort((a, b) => (scores[b.name] ?? 0) - (scores[a.name] ?? 0)).slice(0, 3)
}

function getQuizExplanation(dest: Destination, answers: number[]): string {
  const vibes = ['its buzzing social scene', 'its slower pace', 'its depth of culture and history', 'its adventure opportunities']
  const priorities = ['food scene', 'history and culture', 'beaches and sunshine', 'natural landscapes']
  const budgetLabels = ['budget-friendly prices', 'mid-range value', 'flexible spending options', 'luxury experiences']
  const vibe = vibes[answers[0]] ?? 'overall feel'
  const priority = priorities[answers[1]] ?? 'what it offers'
  const budget = budgetLabels[answers[2]]
  const budgetBracket = dest.budget_level
  const budgetMatch = (answers[2] === 0 && budgetBracket === '$') || (answers[2] === 2 && budgetBracket === '$$$') || (answers[2] === 1 && budgetBracket === '$$')
  return budgetMatch
    ? `Matched for ${vibe}, ${priority}, and ${budget}.`
    : `Matched for ${vibe} and ${priority}.`
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function getTimeGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return "Good morning. Where are you headed?"
  if (h >= 12 && h < 17) return "Afternoon — what's next on the list?"
  if (h >= 17 && h < 21) return "Evening. Planning something?"
  return "Up late planning a trip?"
}

function AnimatedHeading({ children, className = '' }: { children: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.4, rootMargin: '-20px 0px 0px 0px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <h2 ref={ref} className={`section-title${className ? ' ' + className : ''}`}>
      {children.split(' ').map((word, i) => (
        <span
          key={i}
          className={`heading-word${visible ? ' heading-word--in' : ''}`}
          style={{ transitionDelay: `${i * 58}ms` }}
        >
          {word}{' '}
        </span>
      ))}
    </h2>
  )
}

function SkeletonCard() {
  return (
    <div className="destination-card">
      <div className="skeleton skeleton-image" />
      <div className="card-body">
        <div className="skeleton skeleton-region" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-country" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text skeleton-text--short" />
        <div className="card-actions">
          <div className="skeleton skeleton-btn" />
        </div>
      </div>
    </div>
  )
}

function DestinationCard({
  dest,
  isSaved,
  onView,
  onSave,
  index,
  isBeenThere = false,
  onBeenThere,
}: {
  dest: Destination
  isSaved: boolean
  onView: () => void
  onSave: () => void
  index: number
  isBeenThere?: boolean
  onBeenThere?: () => void
}) {
  const [popped, setPopped] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [pendingRemove, setPendingRemove] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  function handleMouseEnter() {
    if (cardRef.current) cardRef.current.style.transition = 'box-shadow 0.2s ease'
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (pendingRemove || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    cardRef.current.style.transform = `perspective(700px) rotateY(${x * 7}deg) rotateX(${-y * 4.5}deg) translateY(-7px) scale(1.015)`
  }

  function handleMouseLeave() {
    if (!cardRef.current) return
    cardRef.current.style.transition = 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease'
    cardRef.current.style.transform = ''
    setTimeout(() => { if (cardRef.current) cardRef.current.style.transition = '' }, 560)
  }

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation()
    if (isSaved) {
      setPendingRemove(true)
      setTimeout(() => { setPendingRemove(false); onSave() }, 380)
    } else {
      setPopped(true)
      setTimeout(() => setPopped(false), 500)
      onSave()
    }
  }

  return (
    <div
      ref={cardRef}
      className={`destination-card card-enter${pendingRemove ? ' shaking' : ''}`}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onView()}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card-image-container">
        <img
          className={`card-image${imgLoaded ? ' loaded' : ''}`}
          src={dest.image}
          alt={dest.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => { (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=200&fit=crop`; setImgLoaded(true) }}
        />
        {isBeenThere && <span className="card-been-badge">✓ Been here</span>}
        <div className="card-image-hover">
          <p className="card-image-hover-text">
            {(dest.neighbourhoods ?? []).map(n => n.name).join(' · ')}
          </p>
        </div>
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span className="card-region-tag" style={regionColors[dest.region] ?? {}}>{dest.region}</span>
          {dest.budget_level && (
            <span className={`card-budget-tag budget-${dest.budget_level.length}`}>{dest.budget_level}</span>
          )}
        </div>
        <h3 className="card-city">{dest.name}</h3>
        <p className="card-country">{dest.country}</p>
        <p
          className={`card-description${descExpanded ? ' expanded' : ''}`}
          onClick={(e) => { e.stopPropagation(); setDescExpanded(v => !v) }}
        >{dest.description}</p>
        {dest.best_time && (
          <span className="card-season-tag">◐ {dest.best_time}</span>
        )}
        <div className="card-actions">
          <button className="card-btn" onClick={(e) => { e.stopPropagation(); onView() }}>View →</button>
          <button
            className={`save-btn${isSaved ? ' saved' : ''}${popped ? ' popping' : ''}`}
            onClick={handleSave}
            aria-label={isSaved ? 'Remove from saved' : 'Save destination'}
          >
            {isSaved ? '♥' : '♡'}
          </button>
          {onBeenThere && (
            <button
              className={`been-btn${isBeenThere ? ' been' : ''}`}
              onClick={(e) => { e.stopPropagation(); onBeenThere() }}
              aria-label={isBeenThere ? 'Mark as not visited' : 'Mark as visited'}
              title={isBeenThere ? 'You\'ve been here' : 'Mark as visited'}
            >
              {isBeenThere ? '✓' : '○'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  const { isLoaded: authLoaded, isSignedIn, userId, getToken } = useAuth()
  const [search, setSearch] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [destinationsLoading, setDestinationsLoading] = useState(true)
  const [destinationsError, setDestinationsError] = useState(false)
  const [destinationsRetry, setDestinationsRetry] = useState(0)
  const [saved, setSaved] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('tv-saved-order') ?? '[]') as string[]) } catch { return new Set() }
  })
  const [selected, setSelected] = useState<Destination | null>(null)
  const [noResults, setNoResults] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)
  const [activeFilter, setActiveFilter] = useState<Region>('All')
  const [results, setResults] = useState<City[]>([])
  const [activeSection, setActiveSection] = useState('home')
  const [toast, setToast] = useState<{ message: string; id: number } | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('tv-searches') ?? '[]') } catch { return [] }
  })
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [savedOrder, setSavedOrder] = useState<string[]>(() => {
    try { return [...new Set(JSON.parse(localStorage.getItem('tv-saved-order') ?? '[]') as string[])] } catch { return [] }
  })
  const [typedText, setTypedText] = useState('')
  const [typingPhase, setTypingPhase] = useState<'typing' | 'erasing'>('typing')
  const [subtitleIdx, setSubtitleIdx] = useState(0)
  const [dragOverIdx, setDragOverIdx] = useState(-1)
  const dragSrcRef = useRef<number>(-1)
  const [savedOpen, setSavedOpen] = useState(false)
  const [activeModalImg, setActiveModalImg] = useState<string | null>(null)
  const [modalScrollProgress, setModalScrollProgress] = useState(0)
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [quizResults, setQuizResults] = useState<Destination[] | null>(null)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterDone, setNewsletterDone] = useState(() => !!localStorage.getItem('tv-newsletter'))
  const [trips, setTrips] = useState<Trip[]>(() => {
    try { return normalizeStoredTrips(JSON.parse(localStorage.getItem('tv-trips') ?? '[]')) } catch { return [] }
  })
  const [newTripName, setNewTripName] = useState('')
  const [tripSaving, setTripSaving] = useState(false)
  const [accountStateReady, setAccountStateReady] = useState(false)
  const [addToTripOpen, setAddToTripOpen] = useState<string | null>(null)
  const [affordableFilter, setAffordableFilter] = useState<Region>('All')
  const [exploreSearch, setExploreSearch] = useState('')
  const [neighQuiz, setNeighQuiz] = useState<[number | null, number | null]>([null, null])
  const [compareMode, setCompareMode] = useState(false)
  const [compareItems, setCompareItems] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)
  const [tripSearchOpen, setTripSearchOpen] = useState<string | null>(null)
  const [tripSearchQuery, setTripSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('tv-dark') === '1')
  const [activeVibe, setActiveVibe] = useState<Vibe | 'All'>('All')
  const [beenThere, setBeenThere] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('tv-been') ?? '[]') as string[]) } catch { return new Set() }
  })
  const [destNotes, setDestNotes] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('tv-notes') ?? '{}') } catch { return {} }
  })
  const [noteOpen, setNoteOpen] = useState<string | null>(null)
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('tv-recent') ?? '[]') } catch { return [] }
  })

  const navRef = useRef<HTMLElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const newTripIdRef = useRef<string | null>(null)
  const sharedUrlLoadedRef = useRef(false)
  const tripsLoadedForUserRef = useRef<string | null>(null)
  const legacyTripsRef = useRef<Trip[]>(trips)
  const accountStateLoadedForUserRef = useRef<string | null>(null)
  // Connection to backend destinations
  const [featuredDestinations, setFeaturedDestinations] = useState<Destination[]>([])
  const [affordableDestinations, setAffordableDestinations] = useState<Destination[]>([])

  useEffect(() => {
    setDestinationsLoading(true)
    setDestinationsError(false)
    fetch(`${apiBase}/api/destinations`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load destinations: ${res.status}`)
        }

        return res.json()
      })
      .then((data: Destination[]) => {
        const normalizedData = data.map((destination) => ({
          ...destination,
          best_time: destination.best_time ?? null,
          visit_duration: destination.visit_duration ?? null,
          budget_level: destination.budget_level ?? null,
          vibes: destination.vibes ?? [],
          neighbourhoods: (destination.neighbourhoods ?? []).map(neighbourhood => ({
            ...neighbourhood,
            tips: neighbourhood.tips ?? [],
          })),
          gallery: destination.gallery ?? [],
        }))

        setFeaturedDestinations(normalizedData)

        setAffordableDestinations(
          normalizedData.filter(
            destination => destination.budget_level === '$'
          )
        )
        setDestinationsLoading(false)
      })
      .catch((error) => {
        console.error('Destination error:', error)
        setDestinationsLoading(false)
        setDestinationsError(true)
      })
  }, [destinationsRetry])

    const regionCounts = regions.reduce((acc, region) => {
      acc[region] =
        region === 'All'
          ? featuredDestinations.length
          : featuredDestinations.filter(
              destination => destination.region === region
            ).length

      return acc
    }, {} as Record<Region, number>)


  // Scroll detection + progress bar
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 60)
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(max > 0 ? (y / max) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Hero slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex(i => (i + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Scroll animations — re-runs whenever page content changes
  useEffect(() => {
    const elements = document.querySelectorAll('.section-fade')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.08 }
    )
    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [activeFilter, authLoaded, isSignedIn, noResults, results, saved, trips.length])

  // Stagger-reveal containers
  useEffect(() => {
    const containers = document.querySelectorAll('.stagger-children')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('stagger-visible'); obs.unobserve(e.target) }
      }),
      { threshold: 0.12, rootMargin: '-40px 0px 0px 0px' }
    )
    containers.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // Active section tracking
  useEffect(() => {
    const ids = ['home', 'explore', 'locations', 'trips', 'about']
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) })
      },
      { threshold: 0.25, rootMargin: '-80px 0px -30% 0px' }
    )
    ids.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

  // Lock body scroll + reset scroll position + Escape to close
  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : ''
    if (selected) { setActiveModalImg(null); setModalScrollProgress(0); if (modalRef.current) modalRef.current.scrollTop = 0 }
    if (!selected) return () => { document.body.style.overflow = '' }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }



    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [selected])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  // Parallax hero
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, window.innerHeight)
        document.querySelectorAll<HTMLElement>('.hero-slide').forEach(el => {
          el.style.transform = `translateY(${y * 0.38}px)`
        })
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Open a destination or restore a shared shortlist after API data arrives.
  useEffect(() => {
    if (featuredDestinations.length === 0 || sharedUrlLoadedRef.current) return
    sharedUrlLoadedRef.current = true
    const params = new URLSearchParams(window.location.search)
    const slug = params.get('dest')
    const savedParam = params.get('saved')
    const allDests = featuredDestinations
    if (slug) {
      const dest = allDests.find(d => toSlug(d.name) === slug)
      if (dest) viewDest(dest)
    }
    if (savedParam) {
      const names = savedParam.split(',').map(s => s.trim()).filter(s => allDests.some(d => d.name === s))
      if (names.length > 0) {
        setSaved(new Set(names))
        setSavedOrder(names)
        setToast({ message: `Shortlist loaded — ${names.length} destination${names.length > 1 ? 's' : ''}`, id: Date.now() })
      }
    }
  }, [featuredDestinations])

  // Auto-focus search on desktop
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return
    const t = setTimeout(() => searchInputRef.current?.focus(), 900)
    return () => clearTimeout(t)
  }, [])

  // Cycle search placeholder
  useEffect(() => {
    if (search) return
    const id = setInterval(() => setPlaceholderIndex(i => (i + 1) % searchPlaceholders.length), 3000)
    return () => clearInterval(id)
  }, [search])

  // Typed hero subtitle
  useEffect(() => {
    const target = heroSubtitles[subtitleIdx]
    let t: ReturnType<typeof setTimeout>
    if (typingPhase === 'typing') {
      if (typedText.length < target.length) {
        t = setTimeout(() => setTypedText(target.slice(0, typedText.length + 1)), 46)
      } else {
        t = setTimeout(() => setTypingPhase('erasing'), 2600)
      }
    } else {
      if (typedText.length > 0) {
        t = setTimeout(() => setTypedText(prev => prev.slice(0, -1)), 26)
      } else {
        setSubtitleIdx(i => (i + 1) % heroSubtitles.length)
        setTypingPhase('typing')
      }
    }
    return () => clearTimeout(t)
  }, [typedText, typingPhase, subtitleIdx])

  // Persist saved order
  useEffect(() => {
    localStorage.setItem('tv-saved-order', JSON.stringify(savedOrder))
  }, [savedOrder])

  // Dark mode
  useEffect(() => {
    localStorage.setItem('tv-dark', darkMode ? '1' : '0')
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Persist been-there, notes, recently viewed
  useEffect(() => { localStorage.setItem('tv-been', JSON.stringify([...beenThere])) }, [beenThere])
  useEffect(() => { localStorage.setItem('tv-notes', JSON.stringify(destNotes)) }, [destNotes])
  useEffect(() => { localStorage.setItem('tv-recent', JSON.stringify(recentlyViewed)) }, [recentlyViewed])

  function saveSearch(term: string) {
    const next = [term, ...recentSearches.filter(s => s !== term)].slice(0, 3)
    setRecentSearches(next)
    localStorage.setItem('tv-searches', JSON.stringify(next))
  }

  function openQuiz() { setQuizStep(0); setQuizAnswers([]); setQuizResults(null); setQuizOpen(true) }

  function handleQuizAnswer(answerIdx: number) {
    const newAnswers = [...quizAnswers, answerIdx]
    if (quizStep < quizQuestions.length - 1) {
      setQuizAnswers(newAnswers)
      setQuizStep(s => s + 1)
    } else {
      setQuizAnswers(newAnswers)
      setQuizResults(getQuizResults(newAnswers, featuredDestinations))
    }
  }

  function retakeQuiz() { setQuizStep(0); setQuizAnswers([]); setQuizResults(null) }

  async function handleSearch(overrideTerm?: string) {
    const query = (overrideTerm ?? search).trim()
    if (!query) return
    if (overrideTerm) setSearch(overrideTerm)
    saveSearch(query)
    setLoading(true)
    setNoResults(false)
    setResults([])
    setTimeout(() => {
      document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)

    // Search all local destinations first (name, country, or region match)
    const q = query.toLowerCase()
    const allDests = featuredDestinations
    const localMatches = allDests.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q) ||
      d.region.toLowerCase().includes(q)
    )

    if (localMatches.length > 0) {
      setResults(localMatches.map(d => ({ name: d.name, country: d.country })))
      setLoading(false)
      return
    }

    // Fall back to backend for cities not in local data
    try {
      const res = await fetch(`${apiBase}/api/cities?search=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
      if (data.length === 0) setNoResults(true)
    } catch {
      setNoResults(true)
    } finally {
      setLoading(false)
    }
  }

  function fromApiTrip(trip: ApiTrip): Trip {
    return {
      id: String(trip.id),
      name: trip.name,
      destinations: normalizeTripStops(trip.destinations),
      createdAt: new Date(trip.created_at).getTime(),
      travelDate: trip.travel_date ?? undefined,
      remote: true,
    }
  }

  async function authenticatedFetch(path: string, init?: RequestInit) {
    const token = await getToken()
    if (!token) throw new Error('Not authenticated')
    return fetch(`${apiBase}${path}`, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${token}`,
      },
    })
  }

  useEffect(() => {
    if (!authLoaded) return
    if (!isSignedIn || !userId) {
      accountStateLoadedForUserRef.current = null
      setAccountStateReady(false)
      if (localStorage.getItem('tv-account-migrated') === '1') {
        setSavedOrder([])
        setSaved(new Set())
        setDestNotes({})
        setBeenThere(new Set())
        setRecentlyViewed([])
      }
      return
    }
    if (accountStateLoadedForUserRef.current === userId) return
    accountStateLoadedForUserRef.current = userId
    setAccountStateReady(false)

    const shouldMigrateLegacyState = localStorage.getItem('tv-account-migrated') !== '1'
    const localState = {
      saved_order: shouldMigrateLegacyState ? savedOrder : [],
      notes: shouldMigrateLegacyState ? destNotes : {},
      been_there: shouldMigrateLegacyState ? [...beenThere] : [],
      recently_viewed: shouldMigrateLegacyState ? recentlyViewed : [],
      dark_mode: darkMode,
      layout_mode: layoutMode,
    }

    getToken()
      .then(token => {
        if (!token) throw new Error('Not authenticated')
        return fetch(`${apiBase}/api/me/state`, { headers: { Authorization: `Bearer ${token}` } })
      })
      .then(async response => {
        if (!response.ok) throw new Error(`Failed to load account state: ${response.status}`)
        const remote = await response.json() as AccountState
        if (!remote.initialized) {
          const token = await getToken()
          if (!token) throw new Error('Not authenticated')
          const migrated = await fetch(`${apiBase}/api/me/state`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(localState),
          })
          if (!migrated.ok) throw new Error(`Failed to migrate account state: ${migrated.status}`)
          localStorage.setItem('tv-account-migrated', '1')
          setToast({ message: 'Your saved travel data is now synced', id: Date.now() })
          return
        }

        localStorage.setItem('tv-account-migrated', '1')
        setSavedOrder(remote.saved_order)
        setSaved(new Set(remote.saved_order))
        setDestNotes(remote.notes)
        setBeenThere(new Set(remote.been_there))
        setRecentlyViewed(remote.recently_viewed)
        setDarkMode(remote.dark_mode)
        setLayoutMode(remote.layout_mode)
      })
      .catch(error => console.warn('Using local account state:', error))
      .finally(() => setAccountStateReady(true))
  // Capture browser state once when each user signs in, before server hydration.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded, getToken, isSignedIn, userId])

  useEffect(() => {
    if (!accountStateReady || !isSignedIn || !userId) return
    const timer = setTimeout(() => {
      void authenticatedFetch('/api/me/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saved_order: savedOrder,
          notes: destNotes,
          been_there: [...beenThere],
          recently_viewed: recentlyViewed,
          dark_mode: darkMode,
          layout_mode: layoutMode,
        }),
      }).then(response => {
        if (!response.ok) throw new Error(`Failed to sync account state: ${response.status}`)
      }).catch(error => console.warn('Account state sync deferred:', error))
    }, 500)
    return () => clearTimeout(timer)
  // authenticatedFetch is component-local; listed state fields intentionally drive syncing.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountStateReady, beenThere, darkMode, destNotes, isSignedIn, layoutMode, recentlyViewed, savedOrder, userId])

  useEffect(() => {
    if (!authLoaded) return
    if (!isSignedIn || !userId) {
      tripsLoadedForUserRef.current = null
      setTrips([])
      return
    }
    if (tripsLoadedForUserRef.current === userId) return
    tripsLoadedForUserRef.current = userId

    const cachedTrips = (() => {
      try { return normalizeStoredTrips(JSON.parse(localStorage.getItem(`tv-trips:${userId}`) ?? '[]') as Trip[]) }
      catch { return [] }
    })()
    const localTrips = cachedTrips.length > 0 ? cachedTrips : legacyTripsRef.current

    getToken().then(token => {
      if (!token) throw new Error('Not authenticated')
      return fetch(`${apiBase}/api/trips`, { headers: { Authorization: `Bearer ${token}` } })
    })
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load trips: ${res.status}`)
        return res.json() as Promise<ApiTrip[]>
      })
      .then(async remoteTrips => {
        if (remoteTrips.length > 0 || localTrips.length === 0) {
          setTrips(remoteTrips.map(fromApiTrip))
          return
        }

        // One-time migration for trips created before backend syncing existed.
        const token = await getToken()
        if (!token) throw new Error('Not authenticated')
        const migrated = await Promise.all(localTrips.map(async trip => {
          const res = await fetch(`${apiBase}/api/trips`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              name: trip.name,
              travel_date: trip.travelDate ?? null,
              destinations: trip.destinations,
            }),
          })
          if (!res.ok) throw new Error(`Failed to migrate trip: ${res.status}`)
          return fromApiTrip(await res.json() as ApiTrip)
        }))
        setTrips(migrated)
        setToast({ message: `${migrated.length} local trip${migrated.length === 1 ? '' : 's'} synced`, id: Date.now() })
      })
      .catch(error => {
        console.warn('Using locally stored trips:', error)
        setTrips(localTrips)
      })
  }, [authLoaded, getToken, isSignedIn, userId])

  useEffect(() => {
    if (isSignedIn && userId) localStorage.setItem(`tv-trips:${userId}`, JSON.stringify(trips))
    if (newTripIdRef.current) {
      const el = document.getElementById(`trip-${newTripIdRef.current}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        newTripIdRef.current = null
      }
    }
  }, [isSignedIn, trips, userId])

  async function createTrip() {
    const name = newTripName.trim()
    if (!name) {
      setToast({ message: 'Give your trip a name first', id: Date.now() })
      return
    }
    if (!isSignedIn) {
      setToast({ message: 'Sign in to create a trip', id: Date.now() })
      return
    }
    if (tripSaving) return
    setTripSaving(true)
    let nextTrip: Trip = { id: Date.now().toString(), name, destinations: [], createdAt: Date.now() }
    try {
      const res = await authenticatedFetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, destinations: [] }),
      })
      if (!res.ok) throw new Error(`Failed to create trip: ${res.status}`)
      nextTrip = fromApiTrip(await res.json() as ApiTrip)
    } catch (error) {
      console.warn('Trip saved locally:', error)
      setToast({ message: 'Backend unavailable — trip saved on this device', id: Date.now() })
    } finally {
      setTripSaving(false)
    }
    const id = nextTrip.id
    newTripIdRef.current = id
    setTrips(prev => [...prev, nextTrip])
    setNewTripName('')
  }

  async function deleteTrip(id: string) {
    const trip = trips.find(item => item.id === id)
    setTrips(prev => prev.filter(t => t.id !== id))
    if (trip?.remote) {
      try {
        const res = await authenticatedFetch(`/api/trips/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error(`Failed to delete trip: ${res.status}`)
      } catch (error) {
        setTrips(prev => [...prev, trip])
        setToast({ message: 'Could not delete trip — please try again', id: Date.now() })
        console.error(error)
      }
    }
  }

  async function updateRemoteTrip(trip: Trip, changes: Partial<Pick<Trip, 'travelDate' | 'destinations'>>) {
    if (!trip.remote) return
    try {
      const res = await authenticatedFetch(`/api/trips/${trip.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(changes.travelDate !== undefined ? { travel_date: changes.travelDate || null } : {}),
          ...(changes.destinations !== undefined ? { destinations: changes.destinations } : {}),
        }),
      })
      if (!res.ok) throw new Error(`Failed to update trip: ${res.status}`)
    } catch (error) {
      console.error(error)
      setToast({ message: 'Trip changed locally; server sync failed', id: Date.now() })
    }
  }

  function addDestToTrip(tripId: string, destName: string) {
    const trip = trips.find(t => t.id === tripId)
    if (trip?.destinations.some(stop => stop.destination === destName)) { setAddToTripOpen(null); return }
    const destinations = [...(trip?.destinations ?? []), { destination: destName, days: 1 }]
    setTrips(prev => prev.map(t =>
      t.id === tripId ? { ...t, destinations } : t
    ))
    if (trip) void updateRemoteTrip(trip, { destinations })
    setAddToTripOpen(null)
    setToast({ message: `Added to trip ✓`, id: Date.now() })
  }

  function removeDestFromTrip(tripId: string, destName: string) {
    const trip = trips.find(t => t.id === tripId)
    const destinations = (trip?.destinations ?? []).filter(stop => stop.destination !== destName)
    setTrips(prev => prev.map(t =>
      t.id === tripId ? { ...t, destinations } : t
    ))
    if (trip) void updateRemoteTrip(trip, { destinations })
  }

  function updateTripStop(tripId: string, destinationName: string, changes: Partial<TripStop>) {
    const trip = trips.find(item => item.id === tripId)
    if (!trip) return
    const destinations = trip.destinations.map(stop =>
      stop.destination === destinationName ? { ...stop, ...changes } : stop
    )
    setTrips(prev => prev.map(item => item.id === tripId ? { ...item, destinations } : item))
    void updateRemoteTrip(trip, { destinations })
  }

  function tripTotalDays(stops: TripStop[]): number {
    return stops.reduce((sum, stop) => sum + stop.days, 0)
  }

  function clearSearch() {
    setSearch('')
    setResults([])
    setNoResults(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSearch()
    if (e.key === 'Escape') clearSearch()
  }

  function viewDest(dest: Destination) {
    setSelected(dest)
    setNeighQuiz([null, null])
    window.history.replaceState({}, '', `?dest=${toSlug(dest.name)}`)
    setRecentlyViewed(prev => [dest.name, ...prev.filter(n => n !== dest.name)].slice(0, 8))
  }

  function closeModal() {
    setSelected(null)
    window.history.replaceState({}, '', window.location.pathname)
  }

  function toggleBeenThere(name: string) {
    setBeenThere(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function shareShortlist() {
    if (savedOrder.length === 0) return
    const params = new URLSearchParams({ saved: savedOrder.join(',') })
    const url = `${window.location.origin}${window.location.pathname}?${params}`
    navigator.clipboard.writeText(url).then(() => {
      setToast({ message: 'Link copied to clipboard ✓', id: Date.now() })
    })
  }

  function updateNote(name: string, note: string) {
    setDestNotes(prev => ({ ...prev, [name]: note }))
  }

  function handleNewsletterSubmit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) return
    localStorage.setItem('tv-newsletter', newsletterEmail)
    setNewsletterDone(true)
  }

  function toggleSave(name: string) {
    const adding = !saved.has(name)
    setSaved(prev => {
      const next = new Set(prev)
      if (adding) next.add(name)
      else next.delete(name)
      return next
    })
    setSavedOrder(o => adding ? (o.includes(name) ? o : [...o, name]) : o.filter(n => n !== name))
    setToast({ message: adding ? `${name} saved ♥` : `${name} removed`, id: Date.now() })
  }

  const filteredDestinations = featuredDestinations
    .filter(d => activeFilter === 'All' || d.region === activeFilter)
    .filter(d => activeVibe === 'All' || d.vibes.includes(activeVibe))
    .filter(d => !exploreSearch.trim() || d.name.toLowerCase().includes(exploreSearch.toLowerCase()) || d.country.toLowerCase().includes(exploreSearch.toLowerCase()))

  const allDestinations = featuredDestinations
  const savedDestinations = savedOrder
    .filter(name => saved.has(name))
    .map(name => allDestinations.find(d => d.name === name))
    .filter((d): d is Destination => d !== undefined)

  return (
    <div className={`app-container${darkMode ? ' dark-mode' : ''}`}>

      {/* ── Scroll progress ── */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* ── Toast ── */}
      {toast && (
        <div className="toast-container" key={toast.id}>
          <div className="toast">{toast.message}</div>
        </div>
      )}

      {/* ── Scroll to top ── */}
      {scrollProgress > 15 && (
        <button
          className="scroll-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >↑</button>
      )}

      {/* ── Saved drawer ── */}
      {savedOpen && (
        <div className="saved-backdrop" onClick={() => { setSavedOpen(false); setCompareMode(false); setCompareItems([]); setCompareOpen(false) }}>
          <div className="saved-drawer" onClick={e => e.stopPropagation()}>
            <div className="saved-drawer-header">
              <div>
                <h2 className="saved-drawer-title">Your Shortlist</h2>
                <p className="saved-drawer-subtitle">{savedDestinations.length} {savedDestinations.length === 1 ? 'destination' : 'destinations'} saved</p>
              </div>
              <div className="saved-drawer-header-actions">
                {compareMode ? (
                  <>
                    {compareItems.length === 2 && (
                      <button className="compare-go-btn" onClick={() => setCompareOpen(true)}>Compare →</button>
                    )}
                    <button className="compare-cancel-btn" onClick={() => { setCompareMode(false); setCompareItems([]) }}>Cancel</button>
                  </>
                ) : (
                  <>
                    {savedDestinations.length >= 2 && (
                      <button className="compare-toggle-btn" onClick={() => setCompareMode(true)}>⇄ Compare</button>
                    )}
                    {savedDestinations.length > 0 && (
                      <button className="share-shortlist-btn" onClick={shareShortlist} title="Copy shareable link">⤴ Share</button>
                    )}
                  </>
                )}
                <button className="saved-drawer-close" onClick={() => { setSavedOpen(false); setCompareMode(false); setCompareItems([]); setCompareOpen(false) }}>✕</button>
              </div>
            </div>
            {savedDestinations.length === 0 ? (
              <div className="saved-drawer-empty">
                <p>All your saved locations will appear here.</p>
                <p>Hit ♡ on any card to save it.</p>
              </div>
            ) : (
              <div className="saved-drawer-list">
                {savedDestinations.map((dest, i) => (
                  <div
                    key={dest.name}
                    draggable={!compareMode}
                    className={`saved-drawer-item${dragOverIdx === i ? ' drag-over' : ''}${compareMode ? ' compare-mode-item' : ''}${compareItems.includes(dest.name) ? ' compare-selected' : ''}`}
                    onClick={compareMode ? () => {
                      setCompareItems(prev =>
                        prev.includes(dest.name)
                          ? prev.filter(n => n !== dest.name)
                          : prev.length < 2 ? [...prev, dest.name] : prev
                      )
                    } : undefined}
                    onDragStart={() => { dragSrcRef.current = i }}
                    onDragOver={(e) => { e.preventDefault(); if (dragOverIdx !== i) setDragOverIdx(i) }}
                    onDrop={() => {
                      const from = dragSrcRef.current
                      if (from !== -1 && from !== i) {
                        setSavedOrder(prev => {
                          const next = [...prev]
                          const [moved] = next.splice(from, 1)
                          next.splice(i, 0, moved)
                          return next
                        })
                      }
                      setDragOverIdx(-1)
                    }}
                    onDragEnd={() => setDragOverIdx(-1)}
                  >
                    {compareMode && (
                      <div className={`compare-checkbox${compareItems.includes(dest.name) ? ' checked' : ''}`}>
                        {compareItems.includes(dest.name) && '✓'}
                      </div>
                    )}
                    <img
                      src={`${dest.image.split('?')[0]}?w=120&h=80&fit=crop`}
                      alt={dest.name}
                      className="saved-drawer-img"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=120&h=80&fit=crop' }}
                    />
                    <div className="saved-drawer-info">
                      <div className="saved-drawer-name">{dest.name}</div>
                      <div className="saved-drawer-country">{dest.country}</div>
                      {noteOpen === dest.name ? (
                        <textarea
                          className="saved-drawer-note-input"
                          placeholder="Add a note..."
                          value={destNotes[dest.name] ?? ''}
                          onChange={e => updateNote(dest.name, e.target.value)}
                          onBlur={() => setNoteOpen(null)}
                          autoFocus
                          rows={2}
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <button className="saved-drawer-note-btn" onClick={e => { e.stopPropagation(); setNoteOpen(dest.name) }}>
                          {destNotes[dest.name] ? `📝 ${destNotes[dest.name]}` : '+ note'}
                        </button>
                      )}
                    </div>
                    <div className="saved-drawer-actions">
                      {trips.length > 0 && (
                        <div className="add-to-trip-wrap">
                          <button className="saved-drawer-trip" onClick={() => setAddToTripOpen(addToTripOpen === dest.name ? null : dest.name)}>+ Trip</button>
                          {addToTripOpen === dest.name && (
                            <div className="add-to-trip-menu">
                              {trips.map(t => (
                                <button key={t.id} className="add-to-trip-option" onClick={() => addDestToTrip(t.id, dest.name)}>
                                  {t.destinations.some(stop => stop.destination === dest.name) ? '✓ ' : ''}{t.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <button className="saved-drawer-view" onClick={() => { viewDest(dest); setSavedOpen(false) }}>View →</button>
                      <button className="saved-drawer-remove" onClick={() => toggleSave(dest.name)} aria-label="Remove">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Compare modal ── */}
      {compareOpen && compareItems.length === 2 && (() => {
        const allDests = featuredDestinations
        const [a, b] = compareItems.map(name => allDests.find(d => d.name === name)).filter((d): d is Destination => !!d)
        if (!a || !b) return null
        const rows: { label: string; a: string; b: string }[] = [
          { label: 'Region', a: a.region, b: b.region },
          { label: 'Budget', a: a.budget_level ?? '—', b: b.budget_level ?? '—' },
          { label: 'Best time', a: a.best_time ?? '—', b: b.best_time ?? '—' },
          { label: 'Visit length', a: a.visit_duration ?? '—', b: b.visit_duration ?? '—' },
          { label: 'Vibes', a: a.vibes.join(', ') || '—', b: b.vibes.join(', ') || '—' },
          { label: 'Stay in', a: a.neighbourhoods.map(n => n.name).join(', '), b: b.neighbourhoods.map(n => n.name).join(', ') },
        ]
        return (
          <div className="compare-backdrop" onClick={() => setCompareOpen(false)}>
            <div className="compare-modal" onClick={e => e.stopPropagation()}>
              <div className="compare-modal-header">
                <h2 className="compare-modal-title">Comparing destinations</h2>
                <button className="compare-modal-close" onClick={() => setCompareOpen(false)}>✕</button>
              </div>
              <div className="compare-cols">
                {[a, b].map(dest => (
                  <div key={dest.name} className="compare-col">
                    <img src={`${dest.image.split('?')[0]}?w=600&h=220&fit=crop`} alt={dest.name} className="compare-col-img" />
                    <div className="compare-col-name">{dest.name}</div>
                    <div className="compare-col-country">{dest.country}</div>
                  </div>
                ))}
              </div>
              <div className="compare-rows">
                {rows.map(row => (
                  <div key={row.label} className="compare-row">
                    <div className="compare-row-label">{row.label}</div>
                    <div className="compare-row-val">{row.a}</div>
                    <div className="compare-row-val">{row.b}</div>
                  </div>
                ))}
              </div>
              <div className="compare-modal-footer">
                <button className="compare-view-btn" onClick={() => { const dest = allDests.find(d => d.name === a.name); if (dest) { viewDest(dest); setCompareOpen(false); setSavedOpen(false) } }}>Open {a.name} →</button>
                <button className="compare-view-btn" onClick={() => { const dest = allDests.find(d => d.name === b.name); if (dest) { viewDest(dest); setCompareOpen(false); setSavedOpen(false) } }}>Open {b.name} →</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Quiz modal ── */}
      {quizOpen && (
        <div className="quiz-backdrop" onClick={() => setQuizOpen(false)}>
          <div className="quiz-modal" onClick={e => e.stopPropagation()}>
            <button className="quiz-close" onClick={() => setQuizOpen(false)}>✕</button>

            {quizResults ? (
              <div className="quiz-results-wrap">
                <p className="quiz-eyebrow">Based on your answers</p>
                <h2 className="quiz-results-title">Here's where you should go</h2>
                <div className="quiz-result-cards">
                  {quizResults.map((dest, i) => (
                    <button
                      key={dest.name}
                      className="quiz-result-card"
                      onClick={() => { viewDest(dest); setQuizOpen(false) }}
                    >
                      <img src={dest.image} alt={dest.name} className="quiz-result-img" />
                      <div className="quiz-result-info">
                        {i === 0 && <span className="quiz-top-badge">Top pick</span>}
                        <div className="quiz-result-name">{dest.name}</div>
                        <div className="quiz-result-country">{dest.country}</div>
                        <div className="quiz-result-reason">{getQuizExplanation(dest, quizAnswers)}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <button className="quiz-retry" onClick={retakeQuiz}>← Start over</button>
              </div>
            ) : (
              <div className="quiz-question-wrap">
                <div className="quiz-progress-track">
                  <div className="quiz-progress-fill" style={{ width: `${(quizStep / quizQuestions.length) * 100}%` }} />
                </div>
                <p className="quiz-step-label">{quizStep + 1} of {quizQuestions.length}</p>
                <h2 className="quiz-question">{quizQuestions[quizStep].q}</h2>
                <p className="quiz-sub">{quizQuestions[quizStep].sub}</p>
                <div className="quiz-options">
                  {quizQuestions[quizStep].options.map((opt, i) => (
                    <button key={i} className="quiz-option" onClick={() => handleQuizAnswer(i)}>
                      {opt}
                    </button>
                  ))}
                </div>
                {quizStep > 0 && (
                  <button className="quiz-back" onClick={() => {
                    setQuizStep(s => s - 1)
                    setQuizAnswers(a => a.slice(0, -1))
                  }}>← Back</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal ── */}
      {selected && (
        <div className="modal-backdrop" onClick={() => closeModal()}>
          <div
            className="modal"
            ref={modalRef}
            onClick={e => e.stopPropagation()}
            onScroll={(e) => {
              const el = e.currentTarget
              const pct = el.scrollTop / (el.scrollHeight - el.clientHeight)
              setModalScrollProgress(isNaN(pct) ? 0 : Math.min(100, Math.round(pct * 100)))
            }}
          >
            <div className="modal-progress" style={{ width: `${modalScrollProgress}%` }} />
            <button className="modal-close" onClick={() => closeModal()}>✕</button>
            <img
              className="modal-image"
              src={(activeModalImg ?? selected.image).replace('w=400&h=200', 'w=800&h=400')}
              alt={selected.name}
            />
            {selected.gallery && selected.gallery.length > 0 && (
              <div className="modal-gallery">
                {[selected.image, ...selected.gallery].map((url, i) => (
                  <img
                    key={i}
                    className={`modal-gallery-img${(activeModalImg ?? selected.image) === url ? ' active' : ''}`}
                    src={url}
                    alt={`${selected.name} ${i + 1}`}
                    loading="lazy"
                    onClick={() => setActiveModalImg(url)}
                  />
                ))}
              </div>
            )}
            <div className="modal-body">
              <p className="modal-country">{selected.country}</p>
              <h2 className="modal-title">{selected.name}</h2>
              <div className="modal-chips">
                <span className="modal-region-chip">{selected.region}</span>
                {selected.visit_duration && (
                  <span className="modal-duration-chip">{selected.visit_duration}</span>
                )}
              </div>
              {destFitMap[selected.name] && (
                <div className="dest-fit">
                  <div className="dest-fit-row dest-fit-yes">
                    <span className="dest-fit-label">Perfect if</span>
                    <span className="dest-fit-text">{destFitMap[selected.name].perfectIf}</span>
                  </div>
                  <div className="dest-fit-row dest-fit-no">
                    <span className="dest-fit-label">Not for you if</span>
                    <span className="dest-fit-text">{destFitMap[selected.name].notForYou}</span>
                  </div>
                </div>
              )}
              <p className="modal-description">{selected.description}</p>
              <p className="modal-detail">{selected.detail}</p>
              <hr className="modal-divider" />
              <h3 className="modal-section-heading">Where to Stay</h3>
              <div className="neigh-quiz">
                <p className="neigh-quiz-label">Not sure which area? Answer two questions.</p>
                <div className="neigh-quiz-row">
                  <span className="neigh-quiz-q">What's your vibe?</span>
                  <div className="neigh-quiz-btns">
                    <button className={`neigh-quiz-btn${neighQuiz[0] === 0 ? ' active' : ''}`} onClick={() => setNeighQuiz([0, neighQuiz[1]])}>Lively</button>
                    <button className={`neigh-quiz-btn${neighQuiz[0] === 1 ? ' active' : ''}`} onClick={() => setNeighQuiz([1, neighQuiz[1]])}>Relaxed</button>
                  </div>
                </div>
                <div className="neigh-quiz-row">
                  <span className="neigh-quiz-q">What matters more?</span>
                  <div className="neigh-quiz-btns">
                    <button className={`neigh-quiz-btn${neighQuiz[1] === 0 ? ' active' : ''}`} onClick={() => setNeighQuiz([neighQuiz[0], 0])}>Central</button>
                    <button className={`neigh-quiz-btn${neighQuiz[1] === 1 ? ' active' : ''}`} onClick={() => setNeighQuiz([neighQuiz[0], 1])}>Local feel</button>
                  </div>
                </div>
                {neighQuiz[0] !== null && neighQuiz[1] !== null && (
                  <button className="neigh-quiz-reset" onClick={() => setNeighQuiz([null, null])}>Clear</button>
                )}
              </div>
              {(() => {
                const neighReco = neighQuiz[0] !== null && neighQuiz[1] !== null
                  ? (neighRecoMap[selected.name]?.[neighQuiz[0] * 2 + neighQuiz[1]] ?? null)
                  : null
                return (
                  <div className="modal-neighbourhoods">
                    {selected.neighbourhoods.map((n, i) => {
                      const tips = n.tips
                      const isRec = neighReco === i
                      return (
                        <div className={`modal-neighbourhood${isRec ? ' neigh-recommended' : ''}`} key={n.name} style={{ animationDelay: `${i * 90}ms` }}>
                          <span className="modal-neighbourhood-idx">0{i + 1}</span>
                          {isRec && <span className="neigh-rec-badge">Best for you</span>}
                          <div className="modal-neighbourhood-name">{n.name}</div>
                          <div className="modal-neighbourhood-vibe">{n.vibe}</div>
                          {tips.length > 0 && (
                            <ul className="modal-neighbourhood-tips">
                              {tips.map((tip, ti) => <li key={ti}>{tip}</li>)}
                            </ul>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
              {(() => {
                const similar = allDestinations.filter(d => d.region === selected.region && d.name !== selected.name).slice(0, 2)
                return similar.length > 0 ? (
                  <div className="modal-similar">
                    <p className="modal-similar-heading">Also in {selected.region}</p>
                    <div className="modal-similar-row">
                      {similar.map(dest => (
                        <button key={dest.name} className="modal-similar-card" onClick={() => viewDest(dest)}>
                          <img src={dest.image.replace('w=400&h=200', 'w=300&h=160')} alt={dest.name} className="modal-similar-img" />
                          <div className="modal-similar-info">
                            <div className="modal-similar-name">{dest.name}</div>
                            <div className="modal-similar-country">{dest.country}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null
              })()}
              <div className="modal-actions">
                <button
                  className={`modal-save-btn${saved.has(selected.name) ? ' saved' : ''}`}
                  onClick={() => toggleSave(selected.name)}
                >
                  {saved.has(selected.name) ? '♥ Saved' : '♡ Save Destination'}
                </button>
                <a
                  className="modal-flights-btn"
                  href={`https://www.google.com/travel/flights?q=Flights+to+${encodeURIComponent(selected.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Find flights ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Navbar ── */}
      <nav ref={navRef} className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="navbar-brand">
          <svg className="navbar-logo-mark" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="10" r="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 2C7.03 2 3 6.03 3 10c0 5.25 9 14 9 14s9-8.75 9-14c0-3.97-3.03-8-9-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
          Travel Vibe
        </div>

        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <ul className={`navbar-menu${menuOpen ? ' open' : ''}`}>
          {([
            { id: 'home', label: 'Home' },
            { id: 'explore', label: 'Explore' },
            { id: 'locations', label: 'Locations' },
            { id: 'trips', label: 'My Trips' },
            { id: 'about', label: 'About' },
          ] as { id: string; label: string; count?: number }[]).map(({ id, label, count }) => (
            <li key={id}>
              <a href={`#${id}`} className={activeSection === id ? 'nav-active' : ''} onClick={() => setMenuOpen(false)}>
                {label}
                {count !== undefined && <span className="nav-dest-count">{count}</span>}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar-auth">
          <button className="nav-saved-btn" onClick={() => { setSavedOpen(true); setMenuOpen(false) }}>
            ♡ Saved {saved.size > 0 && <span className="nav-badge">{saved.size}</span>}
          </button>
          <button className="nav-saved-btn" onClick={() => { document.getElementById('trips')?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }}>
            ✈ Trips {trips.length > 0 && <span className="nav-badge">{trips.length}</span>}
          </button>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="auth-btn auth-btn--ghost">Sign in</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="auth-btn auth-btn--solid">Join</button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <div className="nav-user-button">
              <UserButton />
            </div>
          </Show>
          <button className="dark-toggle" onClick={() => setDarkMode(d => !d)} aria-label="Toggle dark mode">
            {darkMode ? '☀' : '☽'}
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div id="home" className="hero-section">
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className={`hero-slide${i === slideIndex ? ' active' : ''}`}
            style={{ backgroundImage: `url(${slide})` }}
          />
        ))}
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-greeting">{getTimeGreeting()}</p>
          <h1>Travel Vibe</h1>
          <p className="lede">
            {typedText}<span className="typing-cursor">|</span>
          </p>
          <div className="search-box">
            <div className="search-input-wrap">
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholders[placeholderIndex]}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {search && (
                <button className="search-clear" onClick={clearSearch} aria-label="Clear search">✕</button>
              )}
            </div>
            <button onClick={() => handleSearch()} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Search'}
            </button>
          </div>
          <a href="#explore" className="hero-cta">Find your neighbourhood →</a>
          <button className="quiz-trigger" onClick={openQuiz}>
            Need help choosing a destination?
          </button>
          <div className="slideshow-dots">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                className={`slideshow-dot${i === slideIndex ? ' active' : ''}`}
                onClick={() => setSlideIndex(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Search results ── */}
      {(loading || results.length > 0 || noResults) && (
        <div id="search-results" className="results-section">
          <AnimatedHeading>Search Results</AnimatedHeading>
          {loading ? (
            <div className="cards-grid">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : noResults ? (
            <div className="region-empty">
              <p className="region-empty-label">No results</p>
              <h3>Nothing matched "{search}"</h3>
              <p>Double-check the spelling or try a broader search — city names work best.</p>
              <button className="region-empty-reset" onClick={clearSearch}>Clear search</button>
            </div>
          ) : (
            <div className="cards-grid">
              {results.map((city, i) => {
                const known = featuredDestinations.find(d => d.name.toLowerCase() === city.name.toLowerCase())
                if (known) {
                  return (
                    <DestinationCard
                      key={`${city.name}-${city.country}`}
                      dest={known}
                      isSaved={saved.has(known.name)}
                      onView={() => viewDest(known)}
                      onSave={() => toggleSave(known.name)}
                      index={i}
                      isBeenThere={beenThere.has(known.name)}
                      onBeenThere={() => toggleBeenThere(known.name)}
                    />
                  )
                }
                return (
                  <div className="destination-card card-enter" key={`${city.name}-${city.country}`}>
                    <div className="card-image-placeholder" />
                    <div className="card-body">
                      <h3 className="card-city">{city.name}</h3>
                      <p className="card-country">{city.country}</p>
                      <div className="card-actions">
                        <button className="card-btn">View Destination</button>
                        <button
                          className={`save-btn${saved.has(city.name) ? ' saved' : ''}`}
                          onClick={() => toggleSave(city.name)}
                        >{saved.has(city.name) ? '♥' : '♡'}</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Recently viewed ── */}
      {recentlyViewed.length > 0 && (
        <div className="recently-viewed">
          <div className="recently-viewed-inner">
            <span className="recently-viewed-label">Recently viewed</span>
            <div className="recently-viewed-list">
              {recentlyViewed.map(name => {
                const dest = allDestinations.find(d => d.name === name)
                if (!dest) return null
                return (
                  <button key={name} className="recently-viewed-chip" onClick={() => viewDest(dest)}>
                    <img src={`${dest.image.split('?')[0]}?w=40&h=40&fit=crop`} alt={name} />
                    <span>{name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Explore ── */}
      <section id="explore" className="explore-section">
        <div className="explore-header section-fade">
          <div>
            <AnimatedHeading>Popular Destinations</AnimatedHeading>
            <p className="section-subtitle">Start anywhere — filter by region or just scroll</p>
          </div>
          <div className="explore-controls">
            <div className="section-search">
              <input
                type="text"
                placeholder="Search destinations..."
                value={exploreSearch}
                onChange={(e) => setExploreSearch(e.target.value)}
              />
              {exploreSearch && (
                <button onClick={() => setExploreSearch('')} style={{ fontSize: '1rem' }}>✕</button>
              )}
            </div>
            <div className="layout-toggle">
              <button
                className={`layout-btn${layoutMode === 'grid' ? ' active' : ''}`}
                onClick={() => setLayoutMode('grid')}
                title="Grid view" aria-label="Grid view"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="1" y="1" width="6" height="6" rx="1"/>
                  <rect x="9" y="1" width="6" height="6" rx="1"/>
                  <rect x="1" y="9" width="6" height="6" rx="1"/>
                  <rect x="9" y="9" width="6" height="6" rx="1"/>
                </svg>
              </button>
              <button
                className={`layout-btn${layoutMode === 'list' ? ' active' : ''}`}
                onClick={() => setLayoutMode('list')}
                title="List view" aria-label="List view"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="1" y="2" width="14" height="2.5" rx="1"/>
                  <rect x="1" y="6.75" width="14" height="2.5" rx="1"/>
                  <rect x="1" y="11.5" width="14" height="2.5" rx="1"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="filter-bar">
          {regions.map(region => (
            <button
              key={region}
              className={`filter-btn${activeFilter === region ? ' active' : ''}`}
              onClick={() => setActiveFilter(region)}
            >
              {region}
              <span className="filter-count" key={`${region}-${activeFilter}`}>
                {destinationsLoading
                  ? 'Loading…'
                  : region === 'All'
                    ? featuredDestinations.length
                    : regionCounts[region]}
              </span>
            </button>
          ))}
        </div>

        <div className="filter-bar vibe-filter-bar">
          {(['All', ...allVibes] as (Vibe | 'All')[]).map(v => (
            <button
              key={v}
              className={`filter-btn vibe-btn${activeVibe === v ? ' active' : ''}`}
              onClick={() => setActiveVibe(v)}
            >
              {v === 'All' ? 'All vibes' : v === 'Beach' ? '🏖 Beach' : v === 'City Break' ? '🏙 City Break' : v === 'Culture' ? '🏛 Culture' : v === 'Adventure' ? '⛰ Adventure' : '🍜 Food'}
            </button>
          ))}
        </div>

        {destinationsLoading ? (
          <div className="cards-grid" aria-label="Loading destinations">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : destinationsError ? (
          <div className="region-empty destination-error" role="alert">
            <p className="region-empty-label">Connection problem</p>
            <h3>We couldn't load the destination guides</h3>
            <p>Make sure the API and database are running, then try again.</p>
            <button className="region-empty-reset" onClick={() => setDestinationsRetry(value => value + 1)}>
              Try again
            </button>
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="region-empty section-fade">
            <p className="region-empty-label">{activeFilter}</p>
            <h3>No destinations here yet</h3>
            <p>We're adding more spots to this region soon. Browse everything in the meantime.</p>
            <button className="region-empty-reset" onClick={() => { setActiveFilter('All'); setActiveVibe('All'); setExploreSearch('') }}>
              View all destinations →
            </button>
          </div>
        ) : (
          <div className={`cards-grid explore-cards${layoutMode === 'list' ? ' list-view' : ''}`}>
            {filteredDestinations.map((dest, i) => (
              <div id={`dest-${dest.name[0]}`} className="dest-anchor" key={`${activeFilter}-${dest.name}`}>
                <DestinationCard
                  dest={dest}
                  isSaved={saved.has(dest.name)}
                  onView={() => viewDest(dest)}
                  onSave={() => toggleSave(dest.name)}
                  index={i}
                  isBeenThere={beenThere.has(dest.name)}
                  onBeenThere={() => toggleBeenThere(dest.name)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Affordable Destinations ── */}
      <section id="locations" className="affordable-section">
        <div className="affordable-header section-fade">
          <div>
            <AnimatedHeading>More Locations</AnimatedHeading>
            <p className="section-subtitle">Places worth going that most people haven't heard of yet.</p>
          </div>
        </div>
        <div className="filter-bar affordable-filter-bar">
          {regions.map(region => {
            const count = region === 'All' ? affordableDestinations.length : affordableDestinations.filter(d => d.region === region).length
            if (count === 0 && region !== 'All') return null
            return (
              <button
                key={region}
                className={`filter-btn${affordableFilter === region ? ' active' : ''}`}
                onClick={() => setAffordableFilter(region)}
              >
                {region}
                <span className="filter-count">{destinationsLoading ? 'Loading…' : count}</span>
              </button>
            )
          })}
        </div>
        <div className="cards-grid stagger-children">
          {(affordableFilter === 'All' ? affordableDestinations : affordableDestinations.filter(d => d.region === affordableFilter)).map((dest, i) => (
            <DestinationCard
              key={dest.name}
              dest={dest}
              isSaved={saved.has(dest.name)}
              onView={() => viewDest(dest)}
              onSave={() => toggleSave(dest.name)}
              index={i}
              isBeenThere={beenThere.has(dest.name)}
              onBeenThere={() => toggleBeenThere(dest.name)}
            />
          ))}
        </div>
      </section>

      {/* ── My Trips ── */}
      <section id="trips" className="trips-section">
        <AnimatedHeading>My Trips</AnimatedHeading>
        <p className="section-subtitle section-fade">Plan your itinerary — add any destination, set your dates, see your total trip length</p>
        {!authLoaded ? (
          <div className="trips-empty section-fade">
            <div className="trips-empty-inner"><p>Checking your account…</p></div>
          </div>
        ) : !isSignedIn ? (
          <div className="trips-empty section-fade">
            <div className="trips-empty-inner">
              <h3>Sign in to plan your trips</h3>
              <p>Your trips will be private and available on every device.</p>
              <SignInButton mode="modal">
                <button className="trips-create-btn">Sign in to continue</button>
              </SignInButton>
            </div>
          </div>
        ) : (
          <>
        <form className="trips-create section-fade" onSubmit={e => { e.preventDefault(); void createTrip() }}>
          <input
            className="trips-name-input"
            type="text"
            placeholder="Name your trip — e.g. Summer Europe 2025"
            value={newTripName}
            onChange={e => setNewTripName(e.target.value)}
            maxLength={50}
            disabled={tripSaving}
          />
          <button className="trips-create-btn" type="submit" disabled={tripSaving}>
            {tripSaving ? 'Creating…' : 'Create Trip'}
          </button>
        </form>
        {trips.length === 0 ? (
          <div className="trips-empty section-fade">
            <div className="trips-empty-inner">
              <h3>No trips yet</h3>
              <p>Name a trip above, then search any destination to add it. No need to save first.</p>
              <a href="#explore" className="trips-cta">Browse destinations →</a>
            </div>
          </div>
        ) : (
          <div className="trips-grid section-fade">
            {trips.map(trip => {
              const tripDests = trip.destinations.map(stop => ({
                stop,
                destination: allDestinations.find(d => d.name === stop.destination),
              })).filter((item): item is { stop: TripStop; destination: Destination } => !!item.destination)
              const totalDays = tripTotalDays(trip.destinations)
              const searchResults = tripSearchOpen === trip.id && tripSearchQuery.trim()
                ? allDestinations.filter(d =>
                    !trip.destinations.some(stop => stop.destination === d.name) &&
                    (d.name.toLowerCase().includes(tripSearchQuery.toLowerCase()) || d.country.toLowerCase().includes(tripSearchQuery.toLowerCase()))
                  ).slice(0, 6)
                : []
              return (
                <div id={`trip-${trip.id}`} key={trip.id} className="trip-card">
                  <div className="trip-card-header">
                    <div className="trip-card-header-left">
                      <h3 className="trip-card-name">{trip.name}</h3>
                      <input
                        className="trip-date-input"
                        type="text"
                        placeholder="When? e.g. August 2025"
                        value={trip.travelDate ?? ''}
                        onChange={(e) => setTrips(prev => prev.map(t => t.id === trip.id ? { ...t, travelDate: e.target.value } : t))}
                        onBlur={(e) => void updateRemoteTrip(trip, { travelDate: e.target.value })}
                      />
                    </div>
                    <button className="trip-delete-btn" onClick={() => deleteTrip(trip.id)} aria-label="Delete trip">✕</button>
                  </div>

                  {tripDests.length === 0 ? (
                    <p className="trip-empty-hint">Search below to add your first destination</p>
                  ) : (
                    <div className="trip-dest-list">
                      {tripDests.map(({ destination: d, stop }) => (
                        <div key={d.name} className="trip-dest-row">
                          <img
                            src={`${d.image.split('?')[0]}?w=60&h=40&fit=crop`}
                            alt={d.name}
                            className="trip-dest-img"
                            onClick={() => viewDest(d)}
                            style={{ cursor: 'pointer' }}
                          />
                          <div className="trip-dest-info" onClick={() => viewDest(d)} style={{ cursor: 'pointer' }}>
                            <span className="trip-dest-name">{d.name}</span>
                            <span className="trip-dest-country">{d.country}</span>
                          </div>
                          <div className="trip-stop-fields">
                            <label className="trip-stop-field">
                              <span>Days</span>
                              <input
                                type="number"
                                min="1"
                                max="60"
                                value={stop.days}
                                onChange={event => updateTripStop(trip.id, d.name, {
                                  days: Math.min(60, Math.max(1, Number(event.target.value) || 1)),
                                })}
                              />
                            </label>
                            <label className="trip-stop-field trip-stop-area-field">
                              <span>Area</span>
                              <select
                                value={stop.neighbourhood ?? ''}
                                onChange={event => updateTripStop(trip.id, d.name, {
                                  neighbourhood: event.target.value || undefined,
                                })}
                              >
                                <option value="">Choose an area</option>
                                {d.neighbourhoods.map(neighbourhood => (
                                  <option key={neighbourhood.name} value={neighbourhood.name}>
                                    {neighbourhood.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                          <button className="trip-dest-remove" onClick={() => removeDestFromTrip(trip.id, d.name)} aria-label="Remove">✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="trip-search-wrap">
                    <div className="trip-search-row">
                      <input
                        className="trip-search-input"
                        type="text"
                        placeholder="+ Add a destination..."
                        value={tripSearchOpen === trip.id ? tripSearchQuery : ''}
                        onFocus={() => { setTripSearchOpen(trip.id); setTripSearchQuery('') }}
                        onChange={e => setTripSearchQuery(e.target.value)}
                        onBlur={() => { const id = trip.id; setTimeout(() => setTripSearchOpen(prev => prev === id ? null : prev), 150) }}
                      />
                    </div>
                    {searchResults.length > 0 && (
                      <div className="trip-search-results">
                        {searchResults.map(d => (
                          <button
                            key={d.name}
                            className="trip-search-result"
                            onMouseDown={() => { addDestToTrip(trip.id, d.name); setTripSearchOpen(null); setTripSearchQuery('') }}
                          >
                            <img src={`${d.image.split('?')[0]}?w=36&h=36&fit=crop`} alt={d.name} className="trip-search-result-img" />
                            <span className="trip-search-result-name">{d.name}</span>
                            <span className="trip-search-result-country">{d.country}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="trip-card-footer">
                    <span className="trip-dest-count">{tripDests.length} {tripDests.length === 1 ? 'destination' : 'destinations'}</span>
                    {totalDays > 0 && (
                      <span className="trip-total-days">~{totalDays} days total</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
          </>
        )}
      </section>

      {/* ── About ── */}
      <section id="about" className="about-section">
        <div className="about-inner">
          <AnimatedHeading>Why this exists</AnimatedHeading>
          <p className="about-text section-fade">
            Every trip I've taken, the question that actually mattered wasn't <em>which city</em> — it was <em>which part</em>.
            Stay in the wrong neighbourhood and you'll spend half your trip commuting, eating at tourist traps, and wondering why everyone else seems to be having more fun.
          </p>
          <p className="about-text section-fade">
            I built this because I couldn't find anything that answered that question honestly.
            Not sponsored. Not SEO-optimised hotel listings. Just a real breakdown of what each area is actually like,
            who it's right for, and what you'll be walking out the door into every morning.
          </p>
          <blockquote className="about-quote section-fade">
            "The neighbourhood matters more than the hotel."
          </blockquote>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-col footer-brand-col">
            <div className="footer-brand">Travel Vibe</div>
            <p className="footer-tagline">The neighbourhood matters more than the hotel.</p>
          </div>
          <div className="footer-col">
            <div className="footer-col-label">Navigate</div>
            <a href="#home">Home</a>
            <a href="#explore">Destinations</a>
            <a href="#trips">My Trips</a>
            <a href="#about">About</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-label">Coming Soon</div>
            <span>User accounts</span>
            <span>Trip itineraries</span>
            <span>Local guides</span>
            <span>Community reviews</span>
          </div>
        </div>
        <div className="footer-newsletter">
          <div className="footer-newsletter-inner">
            <div>
              <p className="footer-newsletter-heading">Stay inspired</p>
              <p className="footer-newsletter-sub">Weekly destination picks, no spam.</p>
            </div>
            <div className="footer-newsletter-form">
              {newsletterDone ? (
                <div className="newsletter-success">You're in ✓</div>
              ) : (
                <>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNewsletterSubmit()}
                  />
                  <button type="button" onClick={handleNewsletterSubmit}>Subscribe →</button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Travel Vibe</p>
          <p>Built for curious travellers</p>
        </div>
      </footer>
    </div>
  )
}

export default App
