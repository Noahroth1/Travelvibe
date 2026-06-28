import { useState, useEffect, useRef } from 'react'
import './App.css'

const apiBase = import.meta.env.VITE_API_URL ?? ''

type Region = 'All' | 'Europe' | 'Asia' | 'Americas' | 'Middle East' | 'Oceania' | 'Africa'
type Trip = { id: string; name: string; destinations: string[]; createdAt: number; travelDate?: string }

type City = { name: string; country: string }

type Neighbourhood = { name: string; vibe: string }

type Destination = {
  name: string
  country: string
  region: Region
  description: string
  image: string
  detail: string
  neighbourhoods: Neighbourhood[]
  gallery?: string[]
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

const featuredDestinations: Destination[] = [
  {
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    description: "Everyone ends up here. The question is which part you actually want to be in.",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=200&fit=crop",
    detail: "Ubud, Seminyak, Canggu — same island, totally different trips. Most people pick wrong the first time.",
    gallery: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1573790387438-4da905039392?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Ubud", vibe: "Rice field treks, spiritual temples & jungle retreats" },
      { name: "Seminyak", vibe: "Boutique hotels, sunset beach bars & rooftop dining" },
      { name: "Canggu", vibe: "Surf breaks, co-working cafés & the creative scene" },
    ],
  },
  {
    name: "Paris",
    country: "France",
    region: "Europe",
    description: "Lived in or visited — Paris feels completely different depending on where you stay.",
    image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&h=200&fit=crop",
    detail: "Le Marais has a completely different energy from Montmartre. Same city, two different trips.",
    gallery: [
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Le Marais", vibe: "Art galleries, Jewish quarter, vibrant nightlife & the best falafel" },
      { name: "Saint-Germain", vibe: "Classic cafés, independent boutiques & literary history" },
      { name: "Montmartre", vibe: "Cobblestones, Sacré-Cœur & sweeping city panoramas" },
    ],
  },
  {
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    description: "Overwhelming at first. Then you find your neighbourhood and the whole city clicks.",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=200&fit=crop",
    detail: "No two districts feel alike. Shinjuku and Yanaka could be different cities entirely.",
    gallery: [
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Shinjuku", vibe: "City pulse, neon-lit alleys, izakayas & the main transit hub" },
      { name: "Shibuya", vibe: "Iconic crossing, youth fashion, department stores & live music" },
      { name: "Yanaka", vibe: "Old Tokyo charm, temple streets & handmade artisan shops" },
    ],
  },
  {
    name: "New York",
    country: "USA",
    region: "Americas",
    description: "Picking the wrong neighbourhood here costs you an hour each way, every day.",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=200&fit=crop",
    detail: "Midtown is convenient and soulless. Brooklyn is worth the subway. You need to pick before you book.",
    gallery: [
      "https://images.unsplash.com/photo-1541336032412-2048a678540d?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Midtown", vibe: "Central Park, Times Square, skyscraper views & everything in reach" },
      { name: "Williamsburg", vibe: "Brooklyn creative hub, rooftop bars, record stores & great food" },
      { name: "Lower East Side", vibe: "Downtown edge, vintage clothing, late-night venues & culture" },
    ],
  },
  {
    name: "Santorini",
    country: "Greece",
    region: "Europe",
    description: "Tiny island. Huge price range. Where you stay changes everything about the experience.",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=200&fit=crop",
    detail: "Oia gets the photos. Fira has the restaurants. Imerovigli has the quiet. You can't have all three.",
    gallery: [
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1504512485720-7d83a16ee930?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Oia", vibe: "Blue-domed churches, cliffside walks & the best sunsets on Earth" },
      { name: "Fira", vibe: "The main town — restaurants, nightlife & unbroken caldera views" },
      { name: "Imerovigli", vibe: "Quietest spot, highest ridge & the most dramatic scenery" },
    ],
  },
  {
    name: "Dubai",
    country: "UAE",
    region: "Middle East",
    description: "Sky-high ambition and ancient souks in the same taxi ride. Stranger than it sounds.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=200&fit=crop",
    detail: "Downtown Dubai and Al Fahidi feel like different centuries. Both are worth your time — but not from the same hotel.",
    gallery: [
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Downtown", vibe: "Burj Khalifa, Dubai Mall, fountain shows & luxury hotels" },
      { name: "Jumeirah Beach", vibe: "Beachfront resorts, watersports, open sea & white sand" },
      { name: "Al Fahidi", vibe: "Historic wind towers, traditional souks & authentic old Dubai" },
    ],
  },
  {
    name: "Machu Picchu",
    country: "Peru",
    region: "Americas",
    description: "Getting there is half the trip. Most people don't plan that part properly.",
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=200&fit=crop",
    detail: "You need to acclimatise before you ascend. Cusco is non-negotiable. The trek or the train — that's your real first choice.",
    gallery: [
      "https://images.unsplash.com/photo-1575936123452-b67c3203c357?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Aguas Calientes", vibe: "Gateway base town, hot springs, jungle market & easy citadel access" },
      { name: "Inca Trail", vibe: "4-day classic trek through mountain cloud forest & ancient ruins" },
      { name: "Cusco", vibe: "Inca stonework, colonial plazas, altitude acclimatisation & great dining" },
    ],
  },
  {
    name: "Sydney",
    country: "Australia",
    region: "Oceania",
    description: "Bondi is just the postcard. There's a whole other city behind it worth exploring.",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&h=200&fit=crop",
    detail: "Circular Quay has the views. Bondi has the beach. Surry Hills has the restaurants worth lining up for.",
    gallery: [
      "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1546268060-2592ff93ee24?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Circular Quay", vibe: "Opera House steps, Harbour Bridge views & ferry connections everywhere" },
      { name: "Bondi Beach", vibe: "Surf culture, the coastal walk, weekend markets & all-day café life" },
      { name: "Surry Hills", vibe: "Indie restaurants, craft bars, gallery spaces & the local scene" },
    ],
  },
  {
    name: "Rome",
    country: "Italy",
    region: "Europe",
    description: "Overrun, overpriced in parts, and still one of the best cities on earth.",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&h=200&fit=crop",
    detail: "Two thousand years of history on a street you walked to get coffee. Pick the wrong neighbourhood and you're paying tourist prices for everything.",
    gallery: [
      "https://images.unsplash.com/photo-1529154036614-a60975f5c760?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Trastevere", vibe: "Evening restaurants, ivy-covered walls, local market & no chain stores" },
      { name: "Prati", vibe: "Quiet residential blocks near the Vatican, good food, few tourists" },
      { name: "Testaccio", vibe: "The original Rome — the market, meat-heavy food culture & proper locals" },
    ],
  },
  {
    name: "Barcelona",
    country: "Spain",
    region: "Europe",
    description: "Beach city with a food scene serious enough that the beach almost becomes secondary.",
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=200&fit=crop",
    detail: "Don't stay in the Gothic Quarter for a week. It's for day trips. The rest of the city is where the actual Barcelona is.",
    gallery: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1464790719320-516ecd75af6c?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Eixample", vibe: "Gaudí buildings, wide avenues, the main restaurant scene & good transport" },
      { name: "Gràcia", vibe: "Bohemian, local, summer fiestas & completely away from the tourist track" },
      { name: "Barceloneta", vibe: "Beach neighbourhood, seafood, crowded in summer but still worth it" },
    ],
  },
  {
    name: "Amsterdam",
    country: "Netherlands",
    region: "Europe",
    description: "Smaller than people expect. More interesting than the reputation suggests.",
    image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=200&fit=crop",
    detail: "The canal ring is beautiful. The Jordaan has the best independent shops in the city. The museums are world-class. Most people spend the whole trip in a three-block radius.",
    gallery: [
      "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1576924542622-772281b13aa8?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Jordaan", vibe: "Narrow canals, independent galleries, the best cafés & weekly markets" },
      { name: "De Pijp", vibe: "The local choice — Albert Cuyp market, Indonesian food & good bars" },
      { name: "Oud-West", vibe: "Residential, creative, and the version of Amsterdam that locals actually live in" },
    ],
  },
  {
    name: "Singapore",
    country: "Singapore",
    region: "Asia",
    description: "The city that proves efficiency and character aren't mutually exclusive.",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=200&fit=crop",
    detail: "Expensive by Southeast Asia standards but also completely different from the rest of it. The hawker centres alone are worth the flight.",
    gallery: [
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1555217851-6141535bd771?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Marina Bay", vibe: "Skyline views, the spectacle and luxury that genuinely delivers" },
      { name: "Tiong Bahru", vibe: "Singapore's oldest estate — independent bookshops, excellent coffee" },
      { name: "Little India", vibe: "The most sensory neighbourhood, cheap hawker food & completely different energy" },
    ],
  },
  {
    name: "Bangkok",
    country: "Thailand",
    region: "Asia",
    description: "Chaotic, loud, brilliant. The food will ruin every Thai restaurant back home.",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&h=200&fit=crop",
    detail: "Sukhumvit for convenience, Rattanakosin for the temples, Ari for the locals. The traffic is bad but the BTS skytrain means you rarely need a taxi.",
    gallery: [
      "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1513568720563-6a5b8c6caab3?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Sukhumvit", vibe: "Expat hub, BTS access, international restaurants & busy nightlife" },
      { name: "Rattanakosin", vibe: "Historic island, temples, the river & the old backpacker scene" },
      { name: "Ari", vibe: "Residential, the Bangkok that locals actually use — good for a slower week" },
    ],
  },
  {
    name: "Kyoto",
    country: "Japan",
    region: "Asia",
    description: "Tokyo has momentum. Kyoto makes you actually stop and look.",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=200&fit=crop",
    detail: "Visit in spring for cherry blossoms or autumn for the maples. Avoid Golden Week. The city rewards slow walking — rent a bicycle and get into the backstreets.",
    gallery: [
      "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1578469645742-46cae010e5d4?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Higashiyama", vibe: "Temple district, preserved machiya townhouses & scenic evening walks" },
      { name: "Gion", vibe: "Geisha district, traditional teahouses — best on weekday evenings" },
      { name: "Arashiyama", vibe: "Bamboo grove, riverside temples & worth the 25-minute train from center" },
    ],
  },
  {
    name: "Reykjavik",
    country: "Iceland",
    region: "Europe",
    description: "The whole country is the attraction. The city is just where you start.",
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=400&h=200&fit=crop",
    detail: "Northern lights from October to March. Midnight sun in summer. Waterfalls and geysers within two hours of the city. Book the car, not just the hotel.",
    gallery: [
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1606130503037-6a8ef67c9d2d?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "101 Reykjavik", vibe: "The center — everything walkable, the bar scene & Hallgrímskirkja church" },
      { name: "Grandi", vibe: "Harbor district, fish and chips, whale watching & the Viking World museum" },
      { name: "Laugardalur", vibe: "East of center, the geothermal pool complex & quieter residential streets" },
    ],
  },
  {
    name: "Buenos Aires",
    country: "Argentina",
    region: "Americas",
    description: "Steak, tango, and a European city accidentally in South America.",
    image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=400&h=200&fit=crop",
    detail: "Flights are expensive but once you land everything else isn't. Dinner starts at 10pm. The wine is better and cheaper than anywhere. Stay at least ten days.",
    gallery: [
      "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1679417302656-9b5170584526?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Palermo", vibe: "Parks, brunch culture, design boutiques and the main nightlife zone" },
      { name: "San Telmo", vibe: "Antiques market, tango shows, colonial buildings and Sunday feria" },
      { name: "Recoleta", vibe: "Elegant boulevards, French architecture, the cemetery and old money energy" },
    ],
  },
]

const affordableDestinations: Destination[] = [
  {
    name: "Tbilisi",
    country: "Georgia",
    region: "Europe",
    description: "A city that rewards the people who bother to show up. Most don't.",
    image: "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=400&h=200&fit=crop",
    detail: "Wine, sulphur baths, Soviet brutalism next to medieval churches. The old town feels like it hasn't been renovated for tourism yet — and that's exactly the point.",
    gallery: [
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Old Town (Abanot-ubani)", vibe: "Sulphur baths, balconied houses & the authentic Tbilisi atmosphere" },
      { name: "Fabrika", vibe: "Repurposed Soviet factory, boutiques, craft bars & creative coworking" },
      { name: "Vera", vibe: "Tree-lined streets, local cafés, less tourist-facing and genuinely residential" },
    ],
  },
  {
    name: "Medellín",
    country: "Colombia",
    region: "Americas",
    description: "The transformation story is real. More importantly, the city is just good now.",
    image: "https://images.unsplash.com/photo-1558008258-3256797b43f3?w=400&h=200&fit=crop",
    detail: "Cable cars to hilltop neighbourhoods. A metro that actually works. Street food that costs less than your morning coffee back home. Come for a week, stay considerably longer.",
    gallery: [
      "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1512250431446-d0b4b57b27ec?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "El Poblado", vibe: "Expat hub, restaurants and nightlife — comfortable but not cheap for Colombia" },
      { name: "Laureles", vibe: "Local neighbourhood feel, better value, great cycling infrastructure" },
      { name: "La Candelaria", vibe: "Historic centre, street art, slightly rough around the edges, properly local" },
    ],
  },
  {
    name: "Porto",
    country: "Portugal",
    region: "Europe",
    description: "Better than Lisbon for most trips and half the price. Don't tell everyone.",
    image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=200&fit=crop",
    detail: "Azulejo tiles, river views, port wine cellars, and steep streets that make you work for the view. Smaller than Lisbon, easier to get around, and still genuinely affordable.",
    gallery: [
      "https://images.unsplash.com/photo-1513735492246-483525079686?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Ribeira", vibe: "UNESCO waterfront, wine bars and the classic postcard view from Dom Luís Bridge" },
      { name: "Bonfim", vibe: "The real Porto — locals, indie shops, not a tourist trap" },
      { name: "Foz do Douro", vibe: "Where the river meets the sea, residential and calm" },
    ],
  },
  {
    name: "Chiang Mai",
    country: "Thailand",
    region: "Asia",
    description: "Bangkok gets the bookings. Chiang Mai gets the return visits.",
    image: "https://images.unsplash.com/photo-1512553353614-82a7370096dc?w=400&h=200&fit=crop",
    detail: "300 temples, night markets, mountains within an hour, and a cost of living that makes it the de facto base for Southeast Asia slow travel. Cooler and calmer than the south.",
    gallery: [
      "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1599576838688-8a6c11263108?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Old City", vibe: "Moat-surrounded historic core, temples at every corner, guesthouses and cafés" },
      { name: "Nimman", vibe: "The creative quarter — coffee culture, boutique shops, co-working" },
      { name: "Riverside", vibe: "Laid back, good food, less touristy and cooler in the evenings" },
    ],
  },
  {
    name: "Sarajevo",
    country: "Bosnia & Herzegovina",
    region: "Europe",
    description: "The most underestimated city in Europe. Not for long.",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=200&fit=crop",
    detail: "East meets West in the most literal sense — Ottoman bazaars give way to Austro-Hungarian architecture on the same street. Excellent food, almost no queues, and hotels that would cost four times as much in Prague.",
    gallery: [
      "https://images.unsplash.com/photo-1570831709673-03320e9d734f?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Baščaršija", vibe: "Ottoman old bazaar, coppersmith streets and the beating cultural heart of the city" },
      { name: "Grbavica", vibe: "Post-war residential quarter, lived-in feel and away from tourist circuits" },
      { name: "Ilidža", vibe: "Green spa suburb, hot springs, tram ride from centre" },
    ],
  },
  {
    name: "Oaxaca",
    country: "Mexico",
    region: "Americas",
    description: "Every food person you know has been here. They're not wrong.",
    image: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=400&h=200&fit=crop",
    detail: "Mezcal, mole negro, tlayudas, and some of the most distinct regional craft in Mexico. The historic centre is genuinely walkable and the surrounding valley has enough to fill two weeks without repeating yourself.",
    gallery: [
      "https://images.unsplash.com/photo-1569880153113-76e33fc52d5f?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1660670173026-ec491dd3dd1a?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Centro Histórico", vibe: "Colonial zócalo, colourful facades, markets and the main cultural strip" },
      { name: "Jalatlaco", vibe: "Quiet cobblestoned barrio, boutique stays and excellent breakfast spots" },
      { name: "Xochimilco", vibe: "Local barrio, few tourists, traditional food and authentic neighbourhood life" },
    ],
  },
  {
    name: "Plovdiv",
    country: "Bulgaria",
    region: "Europe",
    description: "Older than Athens, quieter than anywhere, and €10 dinners with wine.",
    image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=400&h=200&fit=crop",
    detail: "Seven hills, a Roman amphitheatre still used for concerts, and an old town that looks like it was painted by someone with too much talent. The rest of Europe hasn't caught up yet.",
    gallery: [
      "https://images.unsplash.com/photo-1593246049226-ded77bf90326?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Old Town (Staría Grad)", vibe: "National Revival architecture, galleries, art studios and the hilltop panorama" },
      { name: "Kapana", vibe: "The Trap — creative district, street art, independent bars and restaurants" },
      { name: "Kършияка", vibe: "Residential northern bank, local market, none of the tourist surcharge" },
    ],
  },
  {
    name: "Kotor",
    country: "Montenegro",
    region: "Europe",
    description: "A walled medieval city that costs a third of Dubrovnik and is half as crowded.",
    image: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=400&h=200&fit=crop",
    detail: "Bay of Kotor, stone streets, cats everywhere by local tradition, and fortress walls you can walk. Base here and day-trip the rest of the Adriatic coast without the cruise ship crowds.",
    gallery: [
      "https://images.unsplash.com/photo-1533669955142-6a73332af4db?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Stari Grad (Old Town)", vibe: "Walled city, medieval churches, narrow alleys and the main social scene" },
      { name: "Dobrota", vibe: "Bayside village just north of the walls, calm, local and half the price" },
      { name: "Prčanj", vibe: "Quietest stretch of the bay, baroque mansions and very few other travellers" },
    ],
  },
  {
    name: "Budapest",
    country: "Hungary",
    region: "Europe",
    description: "The ruin bars alone are worth the flight. Everything else is a bonus.",
    image: "https://images.unsplash.com/photo-1541343672885-9be56236302a?w=400&h=200&fit=crop",
    detail: "Two cities separated by the Danube. Buda is quiet and hilly. Pest is where everything happens. The thermal baths work out to about the price of a coffee back home.",
    gallery: [
      "https://images.unsplash.com/photo-1616432902940-b7a1acbc60b3?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1551867633-194f125bddfa?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "District VII (Jewish Quarter)", vibe: "Ruin bars, the old ghetto, best nightlife in Central Europe" },
      { name: "Buda Castle District", vibe: "History on a hill, panoramic views over the Danube and zero nightlife" },
      { name: "District IX (Ferencváros)", vibe: "Emerging neighbourhood, cheaper accommodation and a young creative scene" },
    ],
  },
  {
    name: "Hoi An",
    country: "Vietnam",
    region: "Asia",
    description: "The lanterns are real. The tailors are real. The crowds are real too — go early.",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=200&fit=crop",
    detail: "Get a suit or dress made in 24 hours for less than you'd spend on a takeaway at home. The ancient town is genuinely beautiful at night. The beach is 4km away.",
    gallery: [
      "https://images.unsplash.com/photo-1526139334526-f591a54b477c?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1547919307-1ecb10702e6f?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Ancient Town", vibe: "UNESCO lantern-lit streets, tailors and the main scene — worth the crowds" },
      { name: "An Bang Beach", vibe: "4km from town, good seafood, expat-friendly and quieter than Da Nang" },
      { name: "Cam Nam Island", vibe: "Local island across the footbridge, almost no tourists and good food stalls" },
    ],
  },
  {
    name: "Mexico City",
    country: "Mexico",
    region: "Americas",
    description: "One of the greatest food cities in the world. It took a while for people to notice.",
    image: "https://images.unsplash.com/photo-1682916114863-ba2f7b7d39c9?w=400&h=200&fit=crop",
    detail: "Roma Norte has the restaurant scene. The historic centre has Aztec ruins under colonial buildings. The altitude hits harder than expected. Everything costs less than you think.",
    gallery: [
      "https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1547686669-9a8cb1a22d91?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Roma Norte", vibe: "Tree-lined streets, design hotels, the best restaurant scene in the country" },
      { name: "Condesa", vibe: "Art deco apartments, parks, dog walkers and a more residential feel" },
      { name: "Centro Histórico", vibe: "Aztec ruins beneath colonial buildings — overwhelming, essential and cheap" },
    ],
  },
  {
    name: "Cartagena",
    country: "Colombia",
    region: "Americas",
    description: "The walled city is as good as the photos. The neighbourhood next to it is better.",
    image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400&h=200&fit=crop",
    detail: "Walk the wall at sunset. Eat in Getsemaní. Take a boat to the Rosario Islands. Don't stay in Bocagrande unless you want a beach holiday with none of the character.",
    gallery: [
      "https://images.unsplash.com/photo-1534126511673-b6899657816a?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1583531352515-8884af319dc1?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Ciudad Amurallada", vibe: "The walled colonial centre, the postcard — and the heat" },
      { name: "Getsemaní", vibe: "Murals everywhere, the better bars, cheaper food and a neighbourhood with actual life" },
      { name: "Bocagrande", vibe: "Beach suburb, mostly for families and Colombian tourists — skip unless that's you" },
    ],
  },
  {
    name: "Split",
    country: "Croatia",
    region: "Europe",
    description: "People actually live inside a Roman palace. That's not a metaphor.",
    image: "https://images.unsplash.com/photo-1575540291670-8d3b26f7d327?w=400&h=200&fit=crop",
    detail: "Diocletian's Palace is a UNESCO site where people have apartments and hang their laundry. Base here and island-hop without Dubrovnik's prices and cruise ship crowds.",
    gallery: [
      "https://images.unsplash.com/photo-1587330979470-3595ac045ab0?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1564679937942-90c22d5a0e6e?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Diocletian's Palace", vibe: "Living inside Roman walls — apartments, restaurants and centuries of overlap" },
      { name: "Bačvice", vibe: "Beach bar district, the local sport of picigin and the summer social scene" },
      { name: "Varoš", vibe: "Old stone quarter behind the palace, quiet, local and the best hidden dining" },
    ],
  },
  {
    name: "Valletta",
    country: "Malta",
    region: "Europe",
    description: "The entire capital is a UNESCO World Heritage Site. It's also the smallest in the EU.",
    image: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&h=200&fit=crop",
    detail: "Cross it end to end in 20 minutes. Every building has a story going back 500 years. Flights are cheap from most of Europe and the food has improved dramatically in the last decade.",
    gallery: [
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Valletta Proper", vibe: "The whole city is walkable — grand baroque buildings at every corner" },
      { name: "Sliema", vibe: "Modern waterfront, shopping, sea swimming and the practical base for day trips" },
      { name: "Marsaxlokk", vibe: "Southern fishing village, Sunday market and the freshest seafood on the island" },
    ],
  },
  {
    name: "Yogyakarta",
    country: "Indonesia",
    region: "Asia",
    description: "Borobudur is 45 minutes away. That's already a reason to come.",
    image: "https://images.unsplash.com/photo-1585468274952-66591eb14165?w=400&h=200&fit=crop",
    detail: "Bali gets all the tourists. Yogyakarta gets the travellers. The sultan's palace, the silver workshops, the shadow puppet performances, and the volcano you can climb — all for a fraction of Bali's prices.",
    gallery: [
      "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1610010850404-c892d328cf86?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Kraton (Palace Quarter)", vibe: "The sultan's palace complex, batik workshops and traditional shadow puppets" },
      { name: "Prawirotaman", vibe: "Art district, boutique guesthouses, good food and a slower pace" },
      { name: "Kota Gede", vibe: "Old silver town, Mataram ruins and traditional craft workshops" },
    ],
  },
  {
    name: "Riga",
    country: "Latvia",
    region: "Europe",
    description: "The world's largest collection of Art Nouveau buildings. Almost nobody knows this.",
    image: "https://images.unsplash.com/photo-1560177112-fbfd5fde9566?w=400&h=200&fit=crop",
    detail: "Medieval old town, Soviet-era market halls, Art Nouveau streets, and a food scene that's been quietly excellent for years. Cheaper than Tallinn, more interesting than Vilnius. The locals will debate this.",
    gallery: [
      "https://images.unsplash.com/photo-1567669721460-221b82865ee0?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1683730796330-06e60e3438d8?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Old Town (Vecrīga)", vibe: "Medieval streets, the best-preserved old city in the Baltics" },
      { name: "Art Nouveau District", vibe: "Alberta iela and the surrounding streets — architecture unlike anywhere else in Europe" },
      { name: "Ķīpsala", vibe: "Island suburb across the Daugava river, quiet, local and great river views" },
    ],
  },
  {
    name: "Lisbon",
    country: "Portugal",
    region: "Europe",
    description: "Everyone arrives expecting a city. They find a series of villages that happen to be next to each other.",
    image: "https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?w=400&h=200&fit=crop",
    detail: "Seven hills, tram 28, half the price of Barcelona. Alfama for fado and history, Bairro Alto for nights that start at midnight, Belém for the things you have to see once. The food is better than people expect and the coffee is among the best in Europe.",
    gallery: [
      "https://images.unsplash.com/photo-1513735492246-483525079686?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Alfama", vibe: "The old Moorish quarter — steep, labyrinthine, fado coming through restaurant doors after dark" },
      { name: "Bairro Alto", vibe: "Students, bars, restaurants packed on narrow streets — the city's nightlife centre since the 1980s" },
      { name: "Belém", vibe: "Pastéis de Belém, Jerónimos Monastery, the Monument to the Discoveries — all within a 10-minute walk" },
    ],
  },
  {
    name: "Hanoi",
    country: "Vietnam",
    region: "Asia",
    description: "Louder, faster, and more interesting than people expect. The old town is still actually old.",
    image: "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=400&h=200&fit=crop",
    detail: "The French Quarter, the Old Quarter, and West Lake are three completely different cities side by side. Street food here is better than anywhere in Vietnam. The chaos makes sense after two days — cross the road slowly and confidently, the scooters will flow around you.",
    gallery: [
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Old Quarter", vibe: "36 traditional guild streets, each originally selling one thing — still mostly true today" },
      { name: "French Quarter", vibe: "Wide boulevards, colonial architecture, better restaurants and Hoan Kiem Lake at the centre" },
      { name: "Tay Ho (West Lake)", vibe: "Quieter residential neighbourhood around the lake — best coffee in the city, expat community" },
    ],
  },
  {
    name: "Cape Town",
    country: "South Africa",
    region: "Africa",
    description: "The most dramatically beautiful city most people underestimate until they arrive.",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&h=200&fit=crop",
    detail: "The mountain, the ocean, the winelands 45 minutes away, and a food scene that has quietly become one of the best on the continent. The neighbourhoods are as different as cities. Stay in the City Bowl if you want everything walkable; Sea Point if you want the Atlantic on your doorstep.",
    gallery: [
      "https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1504497163765-fef5f0acca14?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "City Bowl", vibe: "The centre below Table Mountain — cafés, galleries, the Company's Garden, base for everything" },
      { name: "De Waterkant", vibe: "Cobblestone streets, boutique hotels, Cape Quarter market — the best-kept neighbourhood secret" },
      { name: "Sea Point", vibe: "Atlantic seaboard promenade — free tidal pools, local restaurants, better value than the Waterfront" },
    ],
  },
  {
    name: "Lima",
    country: "Peru",
    region: "Americas",
    description: "The best food city in South America. It's not close.",
    image: "https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=400&h=200&fit=crop",
    detail: "Ceviche, tiradito, causa, anticuchos — the street food alone justifies the flight. Barranco has the best nightlife and the most interesting streets. Most people stay in Miraflores because it's convenient and miss what makes Lima worth going to. At least eat in Barranco.",
    gallery: [
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&h=380&fit=crop",
      "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=600&h=380&fit=crop",
    ],
    neighbourhoods: [
      { name: "Barranco", vibe: "Artist's neighbourhood on the Pacific cliffs — bohemian bars, murals, the Bridge of Sighs" },
      { name: "Miraflores", vibe: "Safe, convenient, pleasant and slightly soulless — good base, not the real Lima" },
      { name: "Surquillo", vibe: "The local market district — where Lima's chefs actually shop, no tourist markup" },
    ],
  },
]

const regionCounts = regions.reduce((acc, r) => {
  acc[r] = r === 'All'
    ? featuredDestinations.length
    : featuredDestinations.filter(d => d.region === r).length
  return acc
}, {} as Record<Region, number>)

const bestTimeMap: Record<string, string> = {
  "Bali":         "Apr – Oct",
  "Paris":        "Apr – Jun, Sep – Nov",
  "Tokyo":        "Mar – May, Oct – Nov",
  "New York":     "Sep – Nov, Mar – May",
  "Santorini":    "May – Oct",
  "Dubai":        "Nov – Mar",
  "Machu Picchu": "May – Sep",
  "Sydney":       "Sep – Nov, Mar – May",
  "Tbilisi":      "Apr – Jun, Sep – Oct",
  "Medellín":     "Dec – Mar, Jul – Aug",
  "Porto":        "Apr – Jun, Sep – Oct",
  "Chiang Mai":   "Nov – Feb",
  "Sarajevo":     "May – Sep",
  "Oaxaca":       "Oct – Apr",
  "Plovdiv":      "Apr – Jun, Sep – Oct",
  "Kotor":        "May – Sep",
  "Rome":         "Apr – Jun, Sep – Oct",
  "Barcelona":    "May – Jun, Sep – Oct",
  "Amsterdam":    "Apr – May, Sep – Oct",
  "Singapore":    "Feb – Apr",
  "Bangkok":      "Nov – Feb",
  "Kyoto":        "Mar – May, Oct – Nov",
  "Reykjavik":    "Jun – Aug, Oct – Mar",
  "Buenos Aires": "Mar – May, Sep – Nov",
  "Budapest":     "Apr – Jun, Sep – Oct",
  "Hoi An":       "Feb – Apr, Aug – Sep",
  "Mexico City":  "Mar – May, Oct – Dec",
  "Cartagena":    "Dec – Apr",
  "Split":        "May – Jun, Sep",
  "Valletta":     "Mar – May, Oct – Nov",
  "Yogyakarta":   "May – Sep",
  "Riga":         "May – Sep",
  "Lisbon":       "Mar – May, Sep – Nov",
  "Hanoi":        "Oct – Apr",
  "Cape Town":    "Nov – Mar",
  "Lima":         "Dec – Apr",
}

const visitDurationMap: Record<string, string> = {
  "Bali":         "7–14 days",
  "Paris":        "3–5 days",
  "Tokyo":        "5–7 days",
  "New York":     "3–5 days",
  "Santorini":    "3–5 days",
  "Dubai":        "4–6 days",
  "Machu Picchu": "3–5 days",
  "Sydney":       "4–7 days",
  "Tbilisi":      "4–7 days",
  "Medellín":     "5–10 days",
  "Porto":        "3–5 days",
  "Chiang Mai":   "5–14 days",
  "Sarajevo":     "3–4 days",
  "Oaxaca":       "5–8 days",
  "Plovdiv":      "2–3 days",
  "Kotor":        "3–5 days",
  "Rome":         "3–5 days",
  "Barcelona":    "4–6 days",
  "Amsterdam":    "3–4 days",
  "Singapore":    "4–6 days",
  "Bangkok":      "4–7 days",
  "Kyoto":        "3–5 days",
  "Reykjavik":    "5–7 days",
  "Buenos Aires": "7–14 days",
  "Budapest":     "3–5 days",
  "Hoi An":       "3–5 days",
  "Mexico City":  "5–8 days",
  "Cartagena":    "3–5 days",
  "Split":        "3–5 days",
  "Valletta":     "2–3 days",
  "Yogyakarta":   "4–6 days",
  "Riga":         "2–3 days",
  "Lisbon":       "4–6 days",
  "Hanoi":        "3–5 days",
  "Cape Town":    "5–8 days",
  "Lima":         "3–5 days",
}

type Vibe = 'Beach' | 'City Break' | 'Culture' | 'Adventure' | 'Food'
const allVibes: Vibe[] = ['Beach', 'City Break', 'Culture', 'Adventure', 'Food']

const vibeMap: Record<string, Vibe[]> = {
  'Bali':         ['Beach', 'Culture', 'Adventure'],
  'Paris':        ['City Break', 'Culture', 'Food'],
  'Tokyo':        ['City Break', 'Culture', 'Food'],
  'New York':     ['City Break', 'Food', 'Culture'],
  'Santorini':    ['Beach', 'City Break'],
  'Dubai':        ['Beach', 'City Break', 'Adventure'],
  'Machu Picchu': ['Adventure', 'Culture'],
  'Sydney':       ['Beach', 'City Break', 'Adventure'],
  'Rome':         ['Culture', 'Food', 'City Break'],
  'Barcelona':    ['Beach', 'City Break', 'Food', 'Culture'],
  'Amsterdam':    ['City Break', 'Culture'],
  'Singapore':    ['City Break', 'Food', 'Culture'],
  'Bangkok':      ['City Break', 'Food', 'Culture'],
  'Kyoto':        ['Culture', 'City Break'],
  'Reykjavik':    ['Adventure', 'City Break'],
  'Buenos Aires': ['City Break', 'Food', 'Culture'],
  'Tbilisi':      ['Culture', 'Food', 'City Break'],
  'Medellín':     ['City Break', 'Culture', 'Adventure'],
  'Porto':        ['City Break', 'Food', 'Culture'],
  'Chiang Mai':   ['Culture', 'Adventure', 'Food'],
  'Sarajevo':     ['Culture', 'City Break', 'Food'],
  'Oaxaca':       ['Food', 'Culture', 'Adventure'],
  'Plovdiv':      ['Culture', 'City Break'],
  'Kotor':        ['Adventure', 'Beach', 'Culture'],
  'Budapest':     ['City Break', 'Culture', 'Food'],
  'Hoi An':       ['Beach', 'Culture', 'Food'],
  'Mexico City':  ['City Break', 'Food', 'Culture'],
  'Cartagena':    ['Beach', 'Culture', 'City Break'],
  'Split':        ['Beach', 'Adventure', 'Culture'],
  'Valletta':     ['Culture', 'City Break'],
  'Yogyakarta':   ['Culture', 'Adventure'],
  'Riga':         ['City Break', 'Culture'],
  'Lisbon':       ['City Break', 'Culture', 'Food'],
  'Hanoi':        ['City Break', 'Culture', 'Food', 'Adventure'],
  'Cape Town':    ['Adventure', 'Beach', 'Culture'],
  'Lima':         ['City Break', 'Culture', 'Food'],
}

const budgetMap: Record<string, '$' | '$$' | '$$$'> = {
  'Bali': '$$', 'Paris': '$$$', 'Tokyo': '$$', 'New York': '$$$',
  'Santorini': '$$$', 'Dubai': '$$$', 'Machu Picchu': '$$', 'Sydney': '$$$',
  'Rome': '$$', 'Barcelona': '$$', 'Amsterdam': '$$$', 'Singapore': '$$$',
  'Bangkok': '$', 'Kyoto': '$$', 'Reykjavik': '$$$', 'Buenos Aires': '$$',
  'Tbilisi': '$', 'Medellín': '$', 'Porto': '$$', 'Chiang Mai': '$',
  'Sarajevo': '$', 'Oaxaca': '$', 'Plovdiv': '$', 'Kotor': '$',
  'Budapest': '$', 'Hoi An': '$', 'Mexico City': '$', 'Cartagena': '$',
  'Split': '$$', 'Valletta': '$$', 'Yogyakarta': '$', 'Riga': '$',
  'Lisbon': '$$', 'Hanoi': '$', 'Cape Town': '$$', 'Lima': '$',
}

const neighbourhoodTipsMap: Record<string, string[]> = {
  'Bali:Ubud': ["Walk Tegallalang rice terraces before 8am — after that it's tour groups", "Avoid staying on Monkey Forest Road itself — too loud at night"],
  'Bali:Seminyak': ["Merah Putih restaurant for a proper Balinese meal in a beautiful space", "The beach faces west — sunset here is worth doing once"],
  'Bali:Canggu': ["Old Man's beach bar is the social hub, good for meeting people", "Rent a motorbike rather than taxis — it's how everyone gets around"],
  'Paris:Le Marais': ["L'As du Fallafel on Rue des Rosiers is the real thing — eat it standing on the street", "Visit weekdays; weekend crowds in the Marais are brutal"],
  'Paris:Saint-Germain': ["Café de Flore is for tourists; Café Procope on Rue de l'Ancienne Comédie is the real one", "Luxembourg Gardens are quieter than Tuileries and nicer to sit in"],
  'Paris:Montmartre': ["Avoid restaurants immediately around Sacré-Cœur — walk two blocks south for actual Parisian prices", "Best view of Paris is from Square Louise Michel, not the basilica steps"],
  'Tokyo:Shinjuku': ["Golden Gai has ~200 tiny bars — just pick one that looks interesting and walk in", "East side (Golden Gai) and west side (Omoide Yokocho) feel completely different — both worth a night"],
  'Tokyo:Shibuya': ["The famous crossing is best from the Starbucks window above — less chaotic, better photos", "Yoyogi Park is 10 minutes from Harajuku station; go Sunday afternoon"],
  'Tokyo:Yanaka': ["Yanaka Ginza shopping street is one of the few places in Tokyo that feels pre-war", "The cemetery here is surprisingly beautiful and worth walking through"],
  'New York:Midtown': ["Stay here if you need to — but eat elsewhere. Walk to Hell's Kitchen for real food", "The High Line is most enjoyable 7–9am before it fills up"],
  'New York:Williamsburg': ["Take the L train from Manhattan — 15 minutes and a completely different city", "Walk north toward Greenpoint from Bedford Ave for fewer tourists"],
  'New York:Lower East Side': ["Russ & Daughters on Houston St for bagels — the original, not the cafe version", "Most bars don't get going until midnight. Plan accordingly."],
  'Santorini:Oia': ["Book sunset restaurants at least a week ahead — everyone is trying to eat at the same time", "Walk the path from Fira to Oia (10km) — the best views are along the way, not just at the end"],
  'Santorini:Fira': ["Better for nightlife and eating than Oia — far fewer tourists staying here", "The cable car down to the old port is fine; the donkeys are faster but be prepared"],
  'Santorini:Imerovigli': ["Skaros Rock walk starts here — 45 minutes return, no crowds, best caldera view on the island", "Quietest of the three main towns; restaurants are mostly hotel-only which is a disadvantage"],
  'Dubai:Downtown': ["Book Burj Khalifa observation deck online in advance — the in-person queue is hours long", "Dubai Fountain show is free and runs every 30 minutes after 6pm"],
  'Dubai:Jumeirah Beach': ["Public beach at JBR Walk is free — no need to pay for a hotel beach", "Walk The Walk outdoor mall for evening dining — cooler than going inside"],
  'Dubai:Al Fahidi': ["The Dubai Museum is one of the cheapest and best in the city", "Take an Abra (wooden boat) across the Creek for 1 AED — one of the best things in Dubai"],
  'Machu Picchu:Aguas Calientes': ["Book the bus to the ruins in advance — the 4am queue is long enough without waiting for tickets", "Train from Cusco to here is the experience; don't take the bus option"],
  'Machu Picchu:Inca Trail': ["Permits sell out months in advance — book before you book your flights", "Day 2 is the hardest. Day 3 through the Sun Gate is the payoff."],
  'Machu Picchu:Cusco': ["Spend at least 2 nights acclimatising before attempting altitude hikes", "San Pedro Market is for locals; Mercado Central is for tourists — both worth visiting"],
  'Sydney:Circular Quay': ["The Manly ferry is the best $5 you'll spend — 30 minutes of harbour views", "Opera House tours are worth it; the building is better inside than outside"],
  'Sydney:Bondi': ["Walk the coastal path to Bronte and Coogee — far less crowded than Bondi Beach", "Icebergs pool is a Sydney institution; swim early morning for the full experience"],
  'Sydney:Surry Hills': ["Crown Street has the best independent coffee and food in Sydney", "Bills on Crown Street for breakfast — the ricotta pancakes are exactly what people say they are"],
  'Rome:Trastevere': ["Eat before 7:30pm or after 9pm to avoid the tourist dinner rush completely", "Da Enzo al 29 — cash only, no reservations, queue outside. Worth it."],
  'Rome:Prati': ["Best gelato in Rome: Fatamorgana on Via Laurina — unusual flavours done properly", "Walk to Castel Sant'Angelo along the river at sunset — almost nobody does this"],
  'Rome:Testaccio': ["Flavio al Velavevodetto for cacio e pepe — not tourist-facing, proper Roman trattoria", "The non-Catholic cemetery here has Keats and Shelley's graves and is unexpectedly beautiful"],
  'Barcelona:Eixample': ["Cervecería Catalana on Mallorca Street for the best pintxos in the city", "Book Sagrada Família weeks ahead — the ticket queue is not something you want to experience"],
  'Barcelona:Gràcia': ["Plaça del Sol for evening aperitivo — sit on the steps with locals", "The Gràcia Festival in August turns the entire neighbourhood into a street party"],
  'Barcelona:Barceloneta': ["El Vaso de Oro — tiny standing bar on Carrer de Balboa. Order the beer and anything fried.", "Get there by 10am in summer. By 11am the beach is a wall-to-wall crowd."],
  'Amsterdam:Jordaan': ["Winkel 43 for the apple pie — eat it warm with cream outside on the canal", "Anne Frank House tickets sell out 2+ months ahead; book the moment you know your dates"],
  'Amsterdam:De Pijp': ["Saturday Albert Cuyp Market for street food — best in the city", "Brouwerij 't IJ craft brewery is in an actual working windmill"],
  'Amsterdam:Centrum': ["Walk through the Red Light District once — don't photograph the workers", "De Drie Fleschjes brown café on Gravenstraat for Dutch jenever — over 300 years old"],
  'Singapore:Orchard Road': ["ION Orchard basement food court is the best value eating in the city", "Avoid Orchard Road on weekends if you're shopping — go on a weekday"],
  'Singapore:Chinatown': ["Maxwell Food Centre for chicken rice — Tian Tian stall has the queue and deserves it", "Sri Mariamman Temple is the oldest in Singapore and free to enter"],
  'Singapore:East Coast': ["Jumbo Seafood for chilli crab — order the mantou buns to soak up the sauce", "East Coast Park is where Singaporeans actually go on weekends; rent a bike"],
  'Bangkok:Sukhumvit': ["Terminal 21 mall food court for cheap, actually good food — ignore the shopping", "Thonglor and Ekkamai (BTS stops past Asok) are where the real Bangkok nightlife is"],
  'Bangkok:Riverside': ["Take the Chao Phraya Express boat everywhere — faster than a taxi and a quarter of the price", "Wat Pho is better than the Grand Palace — fewer crowds, more interesting, real monks"],
  'Bangkok:Chatuchak': ["Go Saturday or Sunday morning — by midday it's too hot to function", "Section 2–3 for vintage clothing, section 8–9 for antiques"],
  'Kyoto:Higashiyama': ["Most temples charge ¥500–700 entry — budget that into the day", "Walk the Philosopher's Path north to south in cherry blossom season — first week of April"],
  'Kyoto:Gion': ["Hanamikoji Street on a Tuesday or Wednesday evening — geisha visible around 6pm", "Don't photograph geisha without permission or try to stop them for photos"],
  'Kyoto:Arashiyama': ["Bamboo Grove is best at 7am before tour groups arrive. After 9am it's crowded regardless.", "Tenryu-ji garden is worth the extra ¥500 for the sub-garden — one of the best in Japan"],
  'Reykjavik:101 Reykjavik': ["The hot dog stand by the harbour (Bæjarins Beztu) — cash only, been there since 1937", "Laugavegur Street for everything in the evening — eat at Snaps bistro for local fish"],
  'Reykjavik:Grandi': ["Sægreifinn (Sea Baron) for the best lobster soup in Iceland for about $10", "Whale watching from the Old Harbour — book Elding tours, most reliable operators"],
  'Reykjavik:Laugardalur': ["Laugardalslaug public pool — huge thermal complex for about $9, where Icelanders actually swim", "Árbær Open Air Museum gives real context for how Icelanders lived 100 years ago"],
  'Buenos Aires:Palermo': ["Don Julio parrilla for steak — arrive when it opens at noon to avoid the 2-hour queue", "Rent a bike from the Palermo Chico cycle stations for the parks"],
  'Buenos Aires:San Telmo': ["Sunday Feria de San Telmo market — go early before 11am", "Bar Sur on Estados Unidos for tango — small, authentic, not a show for tourists"],
  'Buenos Aires:Recoleta': ["The cemetery is free and takes 2 hours to walk properly — Evita's tomb is well-signposted", "La Biela café across from the cemetery has been serving coffee for 70+ years"],
  'Tbilisi:Old Town': ["Sulphur baths in Abanotubani — Chreli Abano is the best value public bath at about $5", "Walk up to Narikala Fortress in the evening for the best view over the city"],
  'Tbilisi:Fabrika': ["Good for coffee in the morning, cocktails in the evening — the courtyard fills after 8pm", "The hostel inside is one of the best in the city even if you're not staying there"],
  'Tbilisi:Vera': ["Entree restaurant on Tsereteli Ave — Georgian food done properly without tourist markup", "The Botanical Garden is a 20-minute walk from Fabrika through the old town"],
  'Medellín:El Poblado': ["Pergamino for the best coffee in the city — Colombian beans done properly", "Parque Lleras fills after 10pm — the surrounding streets have better bars with fewer tourists"],
  'Medellín:Laureles': ["Better local food and about 30% cheaper than El Poblado for accommodation", "Ruta N area for coworking and speciality coffee if you're working remotely"],
  'Medellín:La Candelaria': ["Take the Metrocable to Comunas 13 for street art — go with a guide, not solo", "Plaza Botero has the famous Botero sculptures and is completely free"],
  'Porto:Ribeira': ["Tasca do Chico for fado — tiny, book in advance, one of the last authentic fado restaurants in Portugal", "Walk across Dom Luís Bridge to Vila Nova de Gaia for port wine tasting — the cellars are free to tour"],
  'Porto:Bonfim': ["Mercado do Bolhão for produce and local life — better than any tourist market", "Cantina 32 for creative Portuguese food at reasonable prices"],
  'Porto:Foz do Douro': ["Matosinhos is a 30-minute walk along the coast — best grilled fish restaurants in the region", "Sunset at the Atlantic from Praia de Matosinhos is one of the best in Portugal"],
  'Chiang Mai:Old City': ["Warorot Market (Kad Luang) for local produce and cheap textiles — better value than the Night Bazaar", "A cooking class here is worth half a day — pick one that visits the market first"],
  'Chiang Mai:Nimman': ["Ristr8to espresso bar for the coffee — obsessive about quality, small menu", "Maya Mall rooftop at sunset before hitting the bars on the lower floors"],
  'Chiang Mai:Riverside': ["Long boat tours along the Ping River run until dark and cost about $3", "The Good View restaurant — order the sai ua (northern sausage)"],
  'Sarajevo:Baščaršija': ["Ćevapi at Petica — the original spot, one of the oldest restaurants in the city", "Walk across the Latin Bridge — this is where Franz Ferdinand was assassinated in 1914"],
  'Sarajevo:Grbavica': ["Klub Kulture Kriterion is the best bar in the city — in a renovated cinema", "Kibe Mahala neighbourhood market on Saturday mornings — all local, no tourists"],
  'Sarajevo:Ilidža': ["Vrelo Bosne park — the spring source of the Bosna river, rent a horse-drawn carriage", "Terme Federal Hotel spa is open to non-guests for day use — thermal pools at low prices"],
  'Oaxaca:Centro Histórico': ["Mercado 20 de Noviembre for tlayudas and memelas — eat at the market, not the surrounding restaurants", "Museo de las Culturas de Oaxaca inside the Santo Domingo complex is free and genuinely excellent"],
  'Oaxaca:Jalatlaco': ["Casa Oaxaca restaurant — book ahead and eat on the terrace", "Best visited at 7am before tour groups arrive from the hotels"],
  'Oaxaca:Xochimilco': ["El Pochote organic market on Fridays for the best produce in the city", "Local mezcal bars here charge local prices — half what you'd pay in Centro"],
  'Plovdiv:Old Town': ["Visit during the Lampartite light festival in December — the whole old town becomes a gallery", "The Kapana (the Trap) creative quarter is separate from the Old Town but a 5-minute walk"],
  'Plovdiv:Kapana': ["Bar 4 on Bratya Pulevi for natural wine — small bar, excellent selection, no tourist pricing", "Friday and Saturday evenings the whole district comes alive — skip it during the day, go at night"],
  'Plovdiv:Kširšiyaka': ["Trud Market on Saturday mornings for produce and secondhand finds", "Café One for breakfast — run by locals, prices haven't changed in years"],
  'Kotor:Stari Grad': ["Walk the fortress walls in the early morning — 1,300 steps but the views are worth every one", "Konoba Cattaro on Trg od Salate for grilled fish — inside the walls, no tourist markup"],
  'Kotor:Dobrota': ["Stari Mlini restaurant right on the water — one of the best meals in Montenegro for reasonable money", "Rent a car or scooter — the bay road north toward Perast is one of the most beautiful drives in the Adriatic"],
  'Kotor:Prčanj': ["Gospa od Anđela church dates to 1420 — almost never has visitors despite being remarkable", "Swim from the rocks below the main road — clear water and usually empty in early morning"],
  'Budapest:District VII': ["Szimpla Kert is the original ruin bar and still the best — go on Sunday for the farmers market inside", "Kadár étkezde on Klauzál Square for authentic Jewish-Hungarian lunch — no dinner service, cash only"],
  'Budapest:Buda Castle': ["Visit the castle on a Monday when most museums in Pest are closed", "The funicular up from Clark Ádám Square costs about $5 — not necessary but a nice way up"],
  'Budapest:District IX': ["Bálna Budapest cultural centre for views over the Danube — go for the terrace, skip the restaurant", "Hold Utca Market Hall for the freshest produce with far fewer tourists than the Great Market Hall"],
  'Hoi An:Ancient Town': ["Go at dawn — by 9am it's shoulder-to-shoulder. The lanterns are lit regardless of the hour.", "Get measured for custom clothing on Day 1 — 24-hour turnaround but you'll want fitting time"],
  'Hoi An:An Bang Beach': ["Soul Kitchen beach club for sunset — better food and more relaxed than the Ancient Town restaurants", "Bike from the Ancient Town in 20 minutes along the river road"],
  'Hoi An:Cam Nam Island': ["Cross the footbridge at the south end of the Ancient Town — 5-minute walk to a completely different world", "Morning market on the island runs until 8am — some of the cheapest local food in the area"],
  'Mexico City:Roma Norte': ["Contramar for fish — queue or book, do not skip it", "Walk Álvaro Obregón avenue in the evening for the best people watching and street food"],
  'Mexico City:Condesa': ["Parque México is the social hub — sit, eat, watch people walk their dogs", "El Parnita for weekend brunch — local crowd, no tourists, excellent mezcal selection"],
  'Mexico City:Centro Histórico': ["Palacio de Bellas Artes free entry Sunday mornings — Diego Rivera murals inside worth seeing alone", "Café de Tacuba on Tacuba Street — founded 1912, still using the original recipes"],
  'Cartagena:Ciudad Amurallada': ["La Cevichería for ceviche — small, book ahead, the best in the city by some distance", "Walk the walls at sunset: start from Baluarte de San Francisco Javier and walk the full circuit"],
  'Cartagena:Getsemaní': ["El Santísimo for cocktails — the neighbourhood's best bar, always full after 9pm", "La Movida street food from vendors in Parque Getsemaní after 7pm — cheaper and better than most restaurants"],
  'Cartagena:Bocagrande': ["Skip it unless you specifically want a beach resort vibe far from the city's character", "If you do go, the beach at Laguito is better than the main Bocagrande strip"],
  'Split:Diocletian\'s Palace': ["The basement halls (entrance from Peristyle) are free and mostly ignored by tourists", "Eat at Fife on Trogirska Street — cash only, standing room only at lunch, genuinely local"],
  'Split:Bačvice': ["Picigin — the local beach ball game is played here every morning. Join in if you want.", "The bars close around 1am and the beach stays busy until then in summer"],
  'Split:Varoš': ["Stari Grad restaurant on Aljinovića for Dalmatian food without the palace premium", "The highest point gives views over the palace rooftops — unmarked path, worth finding"],
  'Valletta:Valletta Proper': ["Upper Barrakka Gardens for the 12 noon cannon firing — free, spectacular, takes 2 minutes", "Trabuxu Bistro in Strait Street for the best wine list in Malta"],
  'Valletta:Sliema': ["Exiles Beach for swimming — concrete lido, free to use, far better than any paid beach", "Walk one block inland from The Strand restaurants for local prices"],
  'Valletta:Marsaxlokk': ["Sunday market starts at 7am and winds down by 10am — don't arrive after that", "Ir-Rizzu restaurant right on the harbour for the freshest fish on the island"],
  'Yogyakarta:Kraton': ["The palace interior has restricted access — the outer grounds are free and worth an hour", "Batik workshops on Jalan Tirtodipuran: watch the process and buy direct from the maker"],
  'Yogyakarta:Prawirotaman': ["ViaVia café is the neighbourhood hub — good food, notice board for local events and tours", "Most guesthouses here will organise a driver to Borobudur for sunrise — book the night before"],
  'Yogyakarta:Kota Gede': ["Silver workshops still do everything by hand — you can watch the process for free and buy at source", "The old royal cemetery at Imogiri is 20 minutes south and rarely visited"],
  'Riga:Old Town (Vecrīga)': ["Ēdnīca Lāčplēsis on Lāčplēša iela for Latvian home-style food at Soviet cafeteria prices — it's excellent", "St. Peter's Church tower for the best views over the old town — lift costs €9"],
  'Riga:Art Nouveau District': ["The Art Nouveau Museum at Alberta 12 shows the interiors — mandatory if you're walking the street", "Most buildings are still residential — ring the bell on any unlocked door to look at the entrance halls"],
  'Riga:Ķīpsala': ["Walk across the Vanšu Bridge and follow the river embankment — quiet, local, tourist-free", "Lido at Ķīpsala is the largest Latvian food hall in the country — cheap, excellent, open all day"],
  'Lisbon:Alfama': ["Take tram 28 through — the whole route costs €3 and is the best tour of the city", "Fado at Tasca do Chico: small, authentic, book weeks ahead"],
  'Lisbon:Bairro Alto': ["Cervejaria da Trindade for craft beer in a 13th-century convent — one of the strangest and best bars in Portugal", "Eat before 10pm if you want a seat without queuing"],
  'Lisbon:Belém': ["Pastéis de Belém: the original, the recipe is secret, the queue moves fast — order six", "Jerónimos Monastery is free on Sunday mornings before 2pm"],
  'Hanoi:Old Quarter': ["Bún chả at Bún Chả Hương Liên — the place Obama ate. It's genuinely worth it.", "Street addresses in the Old Quarter are often wrong — navigate by landmark and phone"],
  'Hanoi:French Quarter': ["Long Train Street — coffee bars appeared for the spectacle of trains passing 30cm from tables", "KOTO restaurant for Vietnamese food with a social enterprise element — good cause, better food"],
  'Hanoi:Tay Ho (West Lake)': ["Cafe Giang on Nguyen Huu Huan for egg coffee — invented here in the 1940s", "Cycle around the lake in early morning before the city wakes up"],
  'Cape Town:City Bowl': ["Truth Coffee Brewing on Buitenkant St — extreme coffee obsessives, excellent", "Walk up Lion's Head at sunrise — 2 hours, no guide needed, views that rival Table Mountain"],
  'Cape Town:De Waterkant': ["Biscuit Mill in Woodstock (10 mins away) for the Saturday market — the city's best food market", "The Waterfront is the tourist thing; De Waterkant is where Cape Town actually eats and drinks"],
  'Cape Town:Sea Point': ["Olympic Pool at Sea Point Pavilion — 50m outdoor pool on the Atlantic for about $3", "La Perla on Beach Road for calamari and wine on the terrace — been there since 1952"],
  'Lima:Barranco': ["Central restaurant (usually on the world's best restaurant lists) — book months ahead", "La Noche bar on Bolognesi Street for live music after 10pm — the neighbourhood's institution"],
  'Lima:Miraflores': ["Huaca Pucllana — a real Inca pyramid in the middle of a suburb, lit up at night", "Larcomar mall is worth visiting for the Pacific cliff views — the mall itself is irrelevant"],
  'Lima:Surquillo': ["Mercado N°1 de Surquillo: buy ceviche ingredients from the same stalls the chefs use", "Isolina on Av. San Martín for criollo cooking — less glamorous than Central, just as good"],
}

// Neighbourhood recommendation map.
// Array of 4 neighbourhood indices for each answer combo: [lively+central, lively+local, relaxed+central, relaxed+local]
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

function getQuizResults(answers: number[], featured: Destination[], affordable: Destination[]): Destination[] {
  const all = [...featured, ...affordable]
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
  const budgetBracket = budgetMap[dest.name]
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
            {dest.neighbourhoods.map(n => n.name).join(' · ')}
          </p>
        </div>
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span className="card-region-tag" style={regionColors[dest.region] ?? {}}>{dest.region}</span>
          {budgetMap[dest.name] && (
            <span className={`card-budget-tag budget-${budgetMap[dest.name].length}`}>{budgetMap[dest.name]}</span>
          )}
        </div>
        <h3 className="card-city">{dest.name}</h3>
        <p className="card-country">{dest.country}</p>
        <p
          className={`card-description${descExpanded ? ' expanded' : ''}`}
          onClick={(e) => { e.stopPropagation(); setDescExpanded(v => !v) }}
        >{dest.description}</p>
        {bestTimeMap[dest.name] && (
          <span className="card-season-tag">◐ {bestTimeMap[dest.name]}</span>
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
  const [search, setSearch] = useState("")
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
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
    try { return JSON.parse(localStorage.getItem('tv-trips') ?? '[]') } catch { return [] }
  })
  const [newTripName, setNewTripName] = useState('')
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
  }, [activeFilter, saved, results, noResults])

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

  // Open destination or restore shared shortlist from URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const slug = params.get('dest')
    const savedParam = params.get('saved')
    const allDests = [...featuredDestinations, ...affordableDestinations]
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      setQuizResults(getQuizResults(newAnswers, featuredDestinations, affordableDestinations))
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
    const allDests = [...featuredDestinations, ...affordableDestinations]
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

  useEffect(() => {
    localStorage.setItem('tv-trips', JSON.stringify(trips))
    if (newTripIdRef.current) {
      const el = document.getElementById(`trip-${newTripIdRef.current}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        newTripIdRef.current = null
      }
    }
  }, [trips])

  function createTrip() {
    const name = newTripName.trim()
    if (!name) return
    const id = Date.now().toString()
    newTripIdRef.current = id
    setTrips(prev => [...prev, { id, name, destinations: [], createdAt: Date.now() }])
    setNewTripName('')
  }

  function deleteTrip(id: string) {
    setTrips(prev => prev.filter(t => t.id !== id))
  }

  function addDestToTrip(tripId: string, destName: string) {
    const trip = trips.find(t => t.id === tripId)
    if (trip?.destinations.includes(destName)) { setAddToTripOpen(null); return }
    setTrips(prev => prev.map(t =>
      t.id === tripId ? { ...t, destinations: [...t.destinations, destName] } : t
    ))
    setAddToTripOpen(null)
    setToast({ message: `Added to trip ✓`, id: Date.now() })
  }

  function removeDestFromTrip(tripId: string, destName: string) {
    setTrips(prev => prev.map(t =>
      t.id === tripId ? { ...t, destinations: t.destinations.filter(n => n !== destName) } : t
    ))
  }

  function tripTotalDays(destNames: string[]): number {
    return destNames.reduce((sum, name) => {
      const range = visitDurationMap[name] ?? ''
      const match = range.match(/(\d+)[–\-](\d+)/)
      if (match) return sum + Math.round((parseInt(match[1]) + parseInt(match[2])) / 2)
      const single = range.match(/(\d+)/)
      return sum + (single ? parseInt(single[1]) : 0)
    }, 0)
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
      next.has(name) ? next.delete(name) : next.add(name)
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
      adding ? next.add(name) : next.delete(name)
      return next
    })
    setSavedOrder(o => adding ? (o.includes(name) ? o : [...o, name]) : o.filter(n => n !== name))
    setToast({ message: adding ? `${name} saved ♥` : `${name} removed`, id: Date.now() })
  }

  const filteredDestinations = featuredDestinations
    .filter(d => activeFilter === 'All' || d.region === activeFilter)
    .filter(d => activeVibe === 'All' || (vibeMap[d.name] ?? []).includes(activeVibe))
    .filter(d => !exploreSearch.trim() || d.name.toLowerCase().includes(exploreSearch.toLowerCase()) || d.country.toLowerCase().includes(exploreSearch.toLowerCase()))

  const allDestinations = [...featuredDestinations, ...affordableDestinations]
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
                                  {t.destinations.includes(dest.name) ? '✓ ' : ''}{t.name}
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
        const allDests = [...featuredDestinations, ...affordableDestinations]
        const [a, b] = compareItems.map(name => allDests.find(d => d.name === name)).filter((d): d is Destination => !!d)
        if (!a || !b) return null
        const rows: { label: string; a: string; b: string }[] = [
          { label: 'Region', a: a.region, b: b.region },
          { label: 'Budget', a: budgetMap[a.name] ?? '—', b: budgetMap[b.name] ?? '—' },
          { label: 'Best time', a: bestTimeMap[a.name] ?? '—', b: bestTimeMap[b.name] ?? '—' },
          { label: 'Visit length', a: visitDurationMap[a.name] ?? '—', b: visitDurationMap[b.name] ?? '—' },
          { label: 'Vibes', a: (vibeMap[a.name] ?? []).join(', ') || '—', b: (vibeMap[b.name] ?? []).join(', ') || '—' },
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
                {visitDurationMap[selected.name] && (
                  <span className="modal-duration-chip">{visitDurationMap[selected.name]}</span>
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
                      const tips = neighbourhoodTipsMap[`${selected.name}:${n.name}`] ?? []
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
                const known = [...featuredDestinations, ...affordableDestinations].find(d => d.name.toLowerCase() === city.name.toLowerCase())
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
                {region === 'All' ? featuredDestinations.length : regionCounts[region]}
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

        {filteredDestinations.length === 0 ? (
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
                <span className="filter-count">{count}</span>
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
        <div className="trips-create section-fade">
          <input
            className="trips-name-input"
            type="text"
            placeholder="Name your trip — e.g. Summer Europe 2025"
            value={newTripName}
            onChange={e => setNewTripName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createTrip()}
            maxLength={50}
          />
          <button className="trips-create-btn" onClick={createTrip}>Create Trip</button>
        </div>
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
              const tripDests = trip.destinations.map(n => allDestinations.find(d => d.name === n)).filter((d): d is Destination => !!d)
              const totalDays = tripTotalDays(trip.destinations)
              const searchResults = tripSearchOpen === trip.id && tripSearchQuery.trim()
                ? allDestinations.filter(d =>
                    !trip.destinations.includes(d.name) &&
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
                      />
                    </div>
                    <button className="trip-delete-btn" onClick={() => deleteTrip(trip.id)} aria-label="Delete trip">✕</button>
                  </div>

                  {tripDests.length === 0 ? (
                    <p className="trip-empty-hint">Search below to add your first destination</p>
                  ) : (
                    <div className="trip-dest-list">
                      {tripDests.map(d => (
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
                            {visitDurationMap[d.name] && (
                              <span className="trip-dest-duration">{visitDurationMap[d.name]}</span>
                            )}
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
