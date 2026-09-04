# 🌱 MARS FARM — Growing Humanity's Future on Mars
### NASA Space Apps Challenge 2026 · "The Next Frontier"

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-Unit_Tested-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![NASA Open Data](https://img.shields.io/badge/NASA-Planetary_Data_System-0B3D91?style=flat-square&logo=nasa&logoColor=white)](https://api.nasa.gov/)

---

## 🚀 The Problem

Shipping food from Earth to Mars costs over **$100,000 per kilogram** in rocket propellant.

A crew of 6 astronauts on a 365-sol mission requires over **5.4 tons of food**. Without self-sustaining, closed-loop bio-regenerative agriculture, permanent human settlement on Mars is physically impossible.

**MARS FARM** asks a fundamental question:

> **"If humans live on Mars, how will we feed ourselves?"**

---

## 🌍 What It Does

MARS FARM is an interactive **NASA-data-grounded Mars agricultural planning and survival simulation** that lets mission commanders:

1. **Scout Landing Sites** — Evaluate 6 real Martian regions using NASA MOLA altimetry, REMS meteorology, and SHARAD radar ice data
2. **Configure Life Support** — Set crew size (1–12), mission duration (30–500 sols), greenhouse footprint (25–500 m²), water reserves, and energy budgets
3. **Bio-Engineer Crops** — Allocate greenhouse beds across 6 specialized Martian cultivars (Potato, Lettuce, Tomato, Wheat, Soybean, Carrot)
4. **Simulate Day-by-Day** — Run a deterministic thermodynamics simulation tracking daily calorie generation, closed-loop water recovery, and energy loads
5. **Survive Real Mars Events** — Navigate global dust storms, coronal mass ejections, and life-support failures with branching tactical decisions
6. **Receive Survival Scores** — Multi-factor evaluations (0–100) broken down into Food Supply (30%), Water Efficiency (25%), Energy Grid (20%), Crop Stability (15%), Environmental Mitigation (10%)

---

## 🏆 Judge Demo — 3 Minute Path

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open `http://localhost:5173` | Landing page with animated Mars globe |
| 2 | Click **"Start Mission"** | Location selection map loads |
| 3 | Click **"Jezero Crater"** | Suitability score 78/100 calculated live |
| 4 | Click **Continue** → fill mission name | Mission Setup page |
| 5 | Set Crew: 6, Duration: 365 sols, Farm: 100m² | Click "Design Farm" |
| 6 | Select Potato + Lettuce + Wheat + Tomato | Click Continue |
| 7 | Allocate: Potato 45m², Lettuce 15m², Wheat 20m², Tomato 20m² | Caloric coverage ≥95% |
| 8 | Click **"Launch Live Simulation"** | Simulation starts with real-time charts |
| 9 | Click **Fast Forward (20x)** | Simulation runs through sol 80 → Dust Storm alert fires |
| 10 | Choose **"Use Battery Reserve"** | Battery decreases, simulation continues |
| 11 | Simulation completes at sol 365 | Click "View Mission Results" |
| 12 | View **87/100** survival score + breakdown | 🎉 Confetti fires on success |
| 13 | Ask **Farmer AI**: "How can I improve?" | Context-aware AI analysis |
| 14 | Click **"View Leaderboard"** | Rankings saved locally |

> 💡 Click **"Judge Demo (3-Min)"** on the landing page for a pre-configured auto-run

---

## 🛰️ NASA Data Sources

All environmental parameters are grounded in verified NASA planetary datasets:

| Dataset | Instrument | Used For |
|---------|-----------|----------|
| **MOLA** | Mars Orbiter Laser Altimeter (MGS) | Elevation, terrain morphology, atmospheric pressure estimation |
| **REMS** | Remote Environment Monitoring Station (Curiosity) | Ground temperature, UV flux, atmospheric pressure, humidity |
| **SHARAD** | SHAllow RADar sounder (MRO) | Subsurface water ice mapping, polar ice thickness |
| **CRISM** | Compact Reconnaissance Imaging Spectrometer (MRO) | Clay mineral detection, perchlorate mapping at Jezero |
| **InSight RAD** | Radiation Assessment Detector (MSL) | Daily average surface radiation dose (µSv/day) |
| **Mars 2020** | Perseverance MOXIE, RIMFAX, SHERLOC | Jezero regolith composition, in-situ resource validation |

> All derived simulation values are clearly labeled as **"Simulation / Model Output"** and not presented as official NASA measurements.

---

## 🌱 Scientific Methodology

### Suitability Engine (`src/engine/suitability.ts`)
```
farmSuitability =
  waterPotential    × 0.25  (Critical bottleneck for hydroponic crop growth)
  temperatureScore  × 0.20  (Heating energy load scales with subzero extremes)
  solarPotential    × 0.15  (Photovoltaic + photosynthetic PAR lighting)
  terrainScore      × 0.15  (Atmospheric pressure retention + construction ease)
  radiationScore    × 0.15  (DNA damage + crop cell necrosis shielding)
  dustScore         × 0.10  (Photovoltaic panel degradation + dust intrusion)
```

### Resource Engine (`src/engine/resourceEngine.ts`)
- **Food**: Daily calorie production = Σ (cropArea × baseYield / growthDays × caloriesPerKg × solarFactor)
- **Water**: Closed-loop hydroponics recycling: 92–97% efficiency (NASA Advanced Life Support baseline)
- **Energy**: Solar array output × location solar flux × LED optimization factor

### Simulation Engine (`src/engine/simulationEngine.ts`)
- Day-by-day deterministic time-step simulation (fully reproducible)
- Crew caloric demand: 2,500 kcal/astronaut/sol (NASA Nutritional Requirements)
- Crop growth modeled as cumulative percentage over growth cycle
- 6 Martian event types with branching consequences affecting resource state

### Scoring Engine (`src/engine/scoringEngine.ts`)
```
overallScore =
  foodSupplyScore        × 0.30
  waterEfficiencyScore   × 0.25
  energyEfficiencyScore  × 0.20
  farmStabilityScore     × 0.15
  environmentalRiskScore × 0.10
```

Score Tiers: `Critical (0–39)` · `Poor (40–59)` · `Moderate (60–74)` · `Strong (75–89)` · `Exceptional (90–100)`

---

## 🏗️ Architecture

```
src/
├── engine/                   # Pure deterministic functions (no side effects)
│   ├── suitability.ts        # Farm suitability formula
│   ├── resourceEngine.ts     # Resource balance projections
│   ├── simulationEngine.ts   # Day-by-day mission simulation
│   ├── scoringEngine.ts      # Multi-factor survival scoring
│   └── __tests__/            # Vitest unit tests (5 scenarios each)
├── services/                 # Side-effectful operations
│   ├── nasaService.ts        # NASA API client with fallback
│   ├── aiAdvisorService.ts   # Deterministic AI farm advisor
│   └── storageService.ts     # Local leaderboard persistence
├── context/
│   ├── MissionContext.tsx    # Global mission state (React Context)
│   └── AudioContext.tsx      # Web Audio API sound effects
├── data/                     # Curated NASA-grounded datasets
│   ├── marsLocations.ts      # 6 real Mars landing sites
│   ├── cropsData.ts          # 6 Martian crop cultivars
│   ├── eventsData.ts         # 6 mission event types
│   └── nasaDataFallback.ts   # Dataset documentation
├── pages/                    # 8-step mission wizard + public pages
│   ├── LandingPage.tsx
│   ├── LocationSelect.tsx
│   ├── MissionSetup.tsx
│   ├── CropSelection.tsx
│   ├── FarmBuilder.tsx
│   ├── SimulationView.tsx
│   ├── ResultsPage.tsx
│   ├── SciencePage.tsx
│   └── LeaderboardPage.tsx
└── components/
    ├── ui/                   # Reusable design system components
    │   ├── Button, Card, MetricCard, Modal, ProgressBar, Slider
    │   ├── Toast.tsx          # Toast notification system
    │   └── AiFarmAdvisor.tsx  # Interactive AI chat widget
    └── visualization/
        ├── MarsGlobe.tsx     # Three.js interactive Mars globe
        └── GreenhouseView.tsx # Animated crop growth visualization
```

---

## 💻 Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 18 + TypeScript 5.6 |
| Build | Vite 6 + ESBuild |
| Styling | Tailwind CSS 3 + Custom HUD design system |
| 3D | Three.js + React Three Fiber |
| Charts | Recharts (animated area/line charts) |
| Routing | React Router 6 |
| Testing | Vitest (unit tests for all 4 engine modules) |
| Audio | Web Audio API (custom sound context) |
| State | React Context API + localStorage persistence |
| Deployment | Static SPA (no backend required) |

---

## 🚀 Installation & Running

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-team/mars-farm.git
cd mars-farm

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build      # TypeScript compile + Vite bundle
npm run preview    # Preview production build locally
```

### Run Tests

```bash
npm run test       # Run all Vitest unit tests once
npm run test:watch # Watch mode for TDD
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Optional: NASA Open APIs (application falls back to verified archive if omitted)
VITE_NASA_API_KEY=your_nasa_api_key_here

# Optional: Gemini AI for enhanced farm advisor responses
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Supabase for persistent leaderboard
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **All credentials are optional.** The application runs fully in demo mode with verified NASA archive data if no keys are provided.

Get a free NASA API key at: https://api.nasa.gov/

---

## 🔒 Security

- No API keys committed to source code
- All sensitive values in `.env` (excluded from `.gitignore`)
- `.env.example` documents all variables without values
- Client-side only — no server secrets exposed to browser bundle
- AI prompt sanitization prevents injection

---

## 🌱 Crop Simulation Parameters

| Crop | Growth Cycle | Water (L/kg) | Calories (kcal/kg) | Space (m²/kg) |
|------|-------------|-------------|-------------------|--------------|
| Mars Russet Potato | 70 days | 180 | 770 | 0.3 |
| Apollo Crisp Lettuce | 28 days | 110 | 150 | 0.15 |
| Red Planet Tomato | 70 days | 195 | 185 | 0.35 |
| Dwarf Pioneer Wheat | 120 days | 250 | 3,400 | 0.4 |
| Bio-Shield Soybean | 100 days | 260 | 4,460 | 0.5 |
| Deep-Reach Carrot | 75 days | 140 | 410 | 0.2 |

> All values are simulation parameters grounded in Earth hydroponic research extrapolated for Martian conditions. Not official NASA crop data.

---

## 🎯 Mars Landing Sites

| Location | Suitability | Water Ice | Radiation | Notable Feature |
|----------|------------|----------|-----------|----------------|
| Jezero Crater | 78/100 | Moderate | Moderate | Perseverance rover site, ancient river delta |
| Gale Crater | 74/100 | Moderate | Low | Curiosity rover site, Mt. Sharp layering |
| Arcadia Planitia | 82/100 | Very High | Moderate | Shallow water ice at 30cm depth |
| Hellas Basin | 71/100 | Low | High | Highest atmospheric pressure on Mars |
| Elysium Planitia | 69/100 | Low | High | InSight lander site |
| Utopia Planitia | 76/100 | High | Moderate | Viking 2 site, large water ice deposits |

---

## 🧪 Test Coverage

```
Engine Tests (Vitest):
✓ suitability.ts       — 6 tests (score range, determinism, tier assignment)
✓ resourceEngine.ts    — 6 tests (scenarios A, B, D, E, determinism, area sum)
✓ simulationEngine.ts  — 6 tests (scenarios A-E, determinism, step fields)
✓ scoringEngine.ts     — 7 tests (range, breakdown, tier, strategy differentiation)
```

---

## 🚨 Known Scientific Assumptions

1. **Caloric demand**: 2,500 kcal/astronaut/sol (NASA Advanced Life Support baseline for moderate activity)
2. **Water recycling**: 92–97% efficiency (based on ISS ECLSS performance, extrapolated for Mars)
3. **Solar flux reduction**: Martian solar irradiance ~43% of Earth's (mean 589 W/m² at 1 AU, 215 W/m² at Mars)
4. **Crop yields**: Based on Earth hydroponic studies, adjusted downward ~15% for Mars gravity (0.38g) effects on transpiration
5. **Radiation dose**: ~230 µSv/day surface (InSight RAD instrument data from Gale Crater)
6. **Dust storm frequency**: 1 regional storm per year (~22% probability during southern summer) based on MCS/TES climatology

---

## 👥 Team

**Team: [Your Team Name]**
- [Member 1] — Lead Developer
- [Member 2] — Science & Data
- [Member 3] — UI/UX Design

---

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

---

## 🙏 NASA Data Attribution

> This project uses publicly available data from NASA's Planetary Data System (PDS), Mars Reconnaissance Orbiter (MRO), Mars Science Laboratory (Curiosity), InSight, and Mars 2020 (Perseverance) missions. All derived simulation values are clearly marked as model outputs. Raw NASA data is credited to the respective mission teams and accessed via NASA's Open Data Portal (data.nasa.gov) and the Planetary Data System (pds.nasa.gov).

*Built for NASA Space Apps Challenge 2026 — "The Next Frontier"*
