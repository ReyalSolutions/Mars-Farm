🚀 BUILD PROMPT — MARS FARM
You are an expert full-stack engineer, UI/UX designer, data visualization engineer, simulation/game developer, and NASA Space Apps hackathon product designer.
Build a complete, polished, responsive web application called:
🌱 MARS FARM
Growing Humanity's Future on Mars
The project is designed for the 2026 NASA Space Apps Challenge — “The Next Frontier.”
The core question of the application is:
“If humans live on Mars, how will we feed themselves?”
MARS FARM is an interactive, NASA-data-inspired Mars agriculture planning and survival simulation. Users should be able to select a Mars location, evaluate environmental conditions, choose crops, construct/manage a greenhouse, allocate resources, simulate a mission, respond to environmental events, and determine whether their farm can sustain a crew.
The application must feel like a combination of:
•	NASA Mission Control
•	futuristic Mars colony interface
•	scientific visualization platform
•	strategy/simulation game
•	modern SaaS dashboard
Do NOT make it look like a generic admin dashboard.
________________________________________
1. CORE PRODUCT EXPERIENCE
The primary user journey must be:
LANDING PAGE
      ↓
START MISSION
      ↓
SELECT MARS LOCATION
      ↓
ANALYZE ENVIRONMENT
      ↓
SELECT CREW + MISSION DURATION
      ↓
SELECT CROPS
      ↓
BUILD MARS FARM
      ↓
ALLOCATE WATER + ENERGY + SPACE
      ↓
RUN SIMULATION
      ↓
HANDLE RANDOM EVENTS
      ↓
CALCULATE FOOD PRODUCTION
      ↓
CALCULATE CREW SURVIVAL
      ↓
MISSION RESULTS
The experience should be interactive rather than simply displaying static information.
________________________________________
2. RECOMMENDED TECHNOLOGY STACK
Use the following stack unless there is a strong technical reason to substitute something equivalent:
Frontend
•	React
•	Vite
•	TypeScript
•	Tailwind CSS
•	React Router
Visualization
•	Three.js
•	React Three Fiber if appropriate
•	Drei
•	Recharts
Animation
•	Framer Motion
Backend
•	Python
•	FastAPI
Database
•	Supabase
•	PostgreSQL
External Data
Integrate appropriate publicly available NASA APIs/datasets.
Do NOT invent NASA data or claim fabricated information is directly from NASA.
If a NASA API requires a key, implement an environment-variable configuration such as:
NASA_API_KEY=
Use a clearly documented fallback/demo dataset when an API is unavailable.
Deployment-ready
The application should be structured so that:
•	Frontend can deploy to Vercel
•	Backend can deploy to Render/Railway
•	Database can use Supabase
________________________________________
3. IMPORTANT HACKATHON REQUIREMENT
The project must remain functional even if external NASA APIs or AI APIs are unavailable.
Therefore implement:
NASA DATA SERVICE
with:
Live NASA Data
      ↓
Data normalization
      ↓
Validation
      ↓
Local fallback dataset
      ↓
Mars Farm simulation
If the API fails:
•	do not crash
•	show a small “Demo Dataset” indicator
•	continue using realistic sample data
•	clearly distinguish demo/simulated values from live NASA data
The core simulation must work without AI.
AI should be optional and used primarily for explanations and recommendations.
________________________________________
4. LANDING PAGE
Create a cinematic landing page.
Hero section:
MARS FARM
Growing Humanity's Future on Mars
Supporting text:
Earth gave us life. Mars will challenge us to sustain it.
CTA:
🚀 START MISSION
Secondary CTA:
🌎 EXPLORE THE SCIENCE
Hero visual:
A beautiful interactive 3D Mars scene.
Include:
•	rotating Mars
•	stars
•	subtle atmospheric glow
•	orbiting particles
•	futuristic HUD elements
•	floating mission statistics
•	subtle animations
Do not overload the screen.
The design must feel premium and scientific.
________________________________________
5. LANDING PAGE SECTIONS
Create:
Section 1 — Hero
MARS FARM
Section 2 — The Challenge
Explain:
Humans cannot depend entirely on Earth for food during long-duration Mars missions.
Show:
•	distance
•	mission duration
•	limited resources
•	environmental challenges
Section 3 — How It Works
Show:
1.	Select a location
2.	Analyze Mars
3.	Build your farm
4.	Grow crops
5.	Survive the mission
Section 4 — Mars Conditions
Interactive cards:
•	Temperature
•	Radiation
•	Solar Energy
•	Water Availability
•	Terrain
•	Dust Storm Risk
Section 5 — Crop Science
Show supported crops.
Section 6 — Mission Simulation
Show an animated sample simulation.
Section 7 — Final CTA
Could your farm keep humanity alive?
Button:
START YOUR MISSION
________________________________________
6. MARS LOCATION SELECTION
Create a dedicated mission setup screen.
Title:
SELECT YOUR MARS FARM LOCATION
Display an interactive Mars globe/map.
Users can select different locations.
Create several initial demo locations based on real Mars geographic regions, while clearly labeling any calculated suitability values as model/simulation outputs.
Example:
LOCATION A
Temperature:
-52°C
Solar Potential:
82%
Water Potential:
74%
Terrain:
91%
Dust Risk:
32%
Farm Suitability:
86 / 100
________________________________________
7. LOCATION ANALYSIS
After selecting a location, show:
MARS ENVIRONMENT ANALYSIS
Create animated metric cards:
🌡 TEMPERATURE
-52°C
☢ RADIATION
HIGH
☀ SOLAR ENERGY
82%
💧 WATER POTENTIAL
74%
🌪 DUST STORM RISK
32%
🪨 TERRAIN
91%
Then calculate:
🌱 FARM SUITABILITY
86 / 100
Use a transparent scoring model.
Do NOT pretend this is an official NASA score.
Label it:
MARS FARM SIMULATION SCORE
Include a “How is this calculated?” expandable panel.
________________________________________
8. MISSION SETUP
Allow the user to configure:
CREW SIZE
Slider:
1 — 12 astronauts
Default:
6
MISSION DURATION
Options:
•	30 days
•	90 days
•	180 days
•	365 days
•	500 days
Default:
365 days
FARM AREA
Slider:
25m² — 500m²
AVAILABLE WATER
Example:
5,000 L
DAILY ENERGY
Example:
50 kWh/day
CTA:
CONTINUE TO FARM DESIGN
________________________________________
9. CROP SELECTION
Create beautiful crop cards.
Initial crops:
🥔 Potato
•	Growth cycle
•	Water requirement
•	Energy requirement
•	Expected yield
•	Nutritional value
•	Space requirement
🥬 Lettuce
🍅 Tomato
🌾 Wheat
🫘 Soybean
🥕 Carrot
Each crop should have:
•	image/illustration
•	scientific information
•	simulation parameters
•	suitability score
•	resource requirements
Allow users to choose how much farm space each crop receives.
Example:
POTATO       40m²
LETTUCE      20m²
TOMATO       20m²
WHEAT        20m²
The total cannot exceed the available farm area.
________________________________________
10. FARM BUILDER
Create an interactive farm management interface.
Show a Mars greenhouse.
Users can add:
•	🌱 Crop beds
•	☀ Solar panels
•	💧 Water storage
•	🔋 Battery
•	💡 LED lighting
•	🌡 Climate control
•	🧪 Hydroponics
•	🏠 Greenhouse modules
The user should be able to allocate limited resources.
Example:
FARM AREA
100 / 100 m²

WATER
3,820 / 5,000 L

ENERGY
42 / 50 kWh/day

FOOD PRODUCTION
78%
________________________________________
11. RESOURCE MANAGEMENT
Create real-time resource calculations.
Track:
💧 WATER
Consumption per day.
⚡ ENERGY
Consumption per day.
🌱 FARM SPACE
Used vs available.
🍽 FOOD
Daily production.
👨‍🚀 CREW
Daily food requirements.
📦 RESERVE
Stored food.
Use animated progress bars and charts.
________________________________________
12. SIMULATION ENGINE
This is the heart of the application.
Implement a deterministic simulation engine.
Example:
Input:

Crew = 6
Mission = 365 days
Farm = 100m²
Water = 5000L
Energy = 50kWh/day
Crop allocation = user-defined
Mars environment = selected location
Calculate:
•	daily food production
•	total food production
•	water consumption
•	energy consumption
•	crop growth
•	resource depletion
•	food reserve
•	crop failure probability
•	environmental impacts
•	crew food coverage
•	final survival percentage
The system should produce:
MISSION SURVIVAL SCORE
Example:
87 / 100
Break it down:
Food Supply        92%
Water Efficiency   78%
Energy Efficiency  71%
Farm Stability     89%
Environmental Risk 82%
________________________________________
13. TIME SIMULATION
Create a timeline:
DAY 1
 ↓
DAY 30
 ↓
DAY 90
 ↓
DAY 180
 ↓
DAY 365
Allow:
▶ RUN SIMULATION
and optionally:
⏩ FAST FORWARD
Animate the farm progressing through the mission.
Display:
•	crops growing
•	resource levels changing
•	food production
•	mission status
________________________________________
14. RANDOM MARS EVENTS
Implement simulation events.
Examples:
🌪 DUST STORM
Solar energy decreases.
Potential effect:
Energy production -60%
User must choose:
•	reduce LED lighting
•	use batteries
•	reduce farm production
________________________________________
☀ SOLAR STORM
Radiation increases.
Effect:
•	astronaut risk increases
•	greenhouse shielding required
________________________________________
💧 WATER SYSTEM FAILURE
Water availability decreases.
User chooses:
•	repair system
•	ration water
•	sacrifice crops
________________________________________
🌡 TEMPERATURE DROP
Heating demand increases.
________________________________________
🦠 CROP DISEASE
One crop's productivity decreases.
________________________________________
🔋 POWER FAILURE
Energy availability decreases.
________________________________________
Each event should require a user decision.
Example:
⚠️ DUST STORM APPROACHING
Solar energy production expected to decrease by 58%.
Buttons:
USE BATTERY
REDUCE FARM LIGHTING
ACCEPT CROP LOSS
The decision affects the simulation.
________________________________________
15. AI FARM ADVISOR
Create an optional AI assistant called:
🌱 FARMER AI
It should answer questions such as:
What should I plant?
Can I survive with 50m²?
Which crop uses the least water?
Why is my farm failing?
How can I increase my survival score?
The AI must receive the actual structured simulation data.
Do NOT allow AI to independently invent numerical scientific results.
The simulation engine remains the source of truth.
AI explains and recommends.
Example:
Based on your current resources, potatoes provide the best balance between food production and water consumption. Consider reducing tomatoes by 10m² and reallocating that area to potatoes.
________________________________________
16. MISSION CONTROL DASHBOARD
Create the main dashboard.
Layout:
┌──────────────────────────────────────────────┐
│ 🚀 MARS FARM                    DAY 127/365  │
├──────────────────────────────────────────────┤
│                                              │
│              3D MARS FARM                    │
│                                              │
├──────────────┬──────────────┬────────────────┤
│ 💧 WATER     │ ⚡ ENERGY    │ 🍽 FOOD        │
│ 82%          │ 61%          │ 91%            │
├──────────────┴──────────────┴────────────────┤
│                                              │
│        👨‍🚀 CREW SURVIVAL                    │
│              87%                             │
│                                              │
├──────────────────────────────────────────────┤
│ Crop Production Chart                        │
│ Resource Consumption Chart                   │
│ Mission Timeline                             │
└──────────────────────────────────────────────┘
Include a persistent mission status indicator:
🟢 STABLE
🟡 WARNING
🔴 CRITICAL
________________________________________
17. MISSION RESULTS
At the end of the simulation show a cinematic results page.
Example:
🌱 MISSION COMPLETE
YOUR FARM SURVIVED 365 DAYS
87 / 100
CREW SURVIVAL SCORE
Show:
FOOD PRODUCTION       92%
WATER EFFICIENCY      78%
ENERGY EFFICIENCY     71%
CROP STABILITY        89%
ENVIRONMENTAL RISK    82%
Then:
YOUR FARM'S LEGACY
Your farm produced enough food to cover 87% of crew requirements over the mission.
Show:
•	total food produced
•	water consumed
•	energy consumed
•	crops harvested
•	critical events
•	decisions made
Buttons:
🔄 TRY AGAIN
📊 VIEW ANALYSIS
📤 SHARE MISSION
________________________________________
18. LEADERBOARD
Create an optional local leaderboard.
Players can submit:
•	name
•	farm score
•	crew size
•	mission duration
•	location
•	crop strategy
Example:
🏆 MARS FARM LEADERBOARD

1. ApolloFarm       96
2. RedHarvest       92
3. MarsGrow         89
4. Terra2Mars       87
5. SpaceRoots       83
Use Supabase if configured.
Otherwise use local storage.
________________________________________
19. NASA DATA / SCIENCE TRANSPARENCY
Create a dedicated:
NASA DATA & SCIENCE
page.
Explain:
•	what data is used
•	which NASA datasets/APIs are used
•	which values are simulated
•	how the farm score is calculated
•	assumptions made by the simulation
Each data source should have a clear attribution.
Never fabricate NASA attribution.
Include:
“NASA data informs the environmental context. MARS FARM's agricultural suitability and survival scores are simulation outputs developed for this project.”
This distinction is very important.
________________________________________
20. DESIGN SYSTEM
Use a premium futuristic visual system.
Primary visual direction:
Space + Agriculture
Use:
•	deep navy/near-black backgrounds
•	white typography
•	blue/cyan accents
•	green agriculture accents
•	warm orange for warnings
•	red for critical states
Avoid excessive neon.
Do not make every component glow.
Use subtle:
•	glassmorphism
•	gradients
•	borders
•	shadows
•	HUD lines
•	grid patterns
Typography should be clean and highly readable.
Use a modern font such as:
•	Inter
•	Space Grotesk
•	IBM Plex Sans
Use Font Awesome or Lucide icons if needed.
________________________________________
21. RESPONSIVE DESIGN
The application must work beautifully on:
•	desktop
•	laptop
•	tablet
•	mobile
Do not simply shrink the desktop layout.
Create appropriate mobile layouts.
On mobile:
•	stack cards
•	make charts scrollable
•	simplify the 3D viewport
•	use bottom navigation where appropriate
•	maintain touch-friendly buttons
________________________________________
22. ANIMATION REQUIREMENTS
Use animations purposefully.
Include:
•	smooth page transitions
•	card entrance animations
•	animated progress bars
•	number counters
•	Mars rotation
•	crop growth animation
•	simulation timeline animation
•	event notifications
•	mission completion animation
Avoid excessive animation that hurts usability.
Respect:
prefers-reduced-motion
________________________________________
23. ACCESSIBILITY
Follow modern accessibility principles.
Implement:
•	semantic HTML
•	keyboard navigation
•	visible focus states
•	sufficient contrast
•	aria labels
•	accessible forms
•	readable text
•	reduced-motion support
________________________________________
24. PROJECT ARCHITECTURE
Use a clean structure.
Example:
mars-farm/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── features/
│   │   │   ├── mars/
│   │   │   ├── crops/
│   │   │   ├── farm/
│   │   │   ├── simulation/
│   │   │   └── mission/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── data/
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── models/
│   │   ├── simulation/
│   │   ├── nasa/
│   │   └── ai/
│   └── ...
│
├── README.md
└── .env.example
Keep business logic separate from UI.
________________________________________
25. ENVIRONMENT VARIABLES
Create:
.env.example
with placeholders such as:
NASA_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
AI_API_KEY=
Never hardcode secrets.
Never commit real API keys.
________________________________________
26. DEMO MODE
Because this is a hackathon project, create:
🚀 DEMO MODE
The judges should be able to click:
“START DEMO MISSION”
and immediately see a prepared mission.
Use:
Location: Demo Mars Region
Crew: 6
Duration: 365 days
Farm: 100m²
Water: 5,000L
Energy: 50kWh/day
Preconfigure a balanced crop strategy.
The entire demo should be playable in approximately 3–5 minutes.
________________________________________
27. DEMO STORYLINE
Optimize the application for a live hackathon presentation.
The ideal demonstration:
Step 1
Landing page:
“Can you feed humanity on Mars?”
Step 2
Choose Mars location.
Step 3
Show environmental analysis.
Step 4
Choose six astronauts.
Step 5
Choose 365-day mission.
Step 6
Build 100m² farm.
Step 7
Choose crops.
Step 8
Start simulation.
Step 9
Trigger a dust storm.
Step 10
Make an emergency decision.
Step 11
Complete mission.
Step 12
Show:
87/100
“Your farm supplied 87% of the crew's food requirements.”
Then show:
Could you do better?
CTA:
TRY AGAIN
________________________________________
28. PERFORMANCE
Optimize for a hackathon laptop.
Do not load unnecessary huge assets.
Lazy-load:
•	3D components
•	charts
•	large images
Keep the initial landing page fast.
Use compressed assets.
Do not make the 3D visualization so complex that it causes low FPS.
Provide a fallback 2D visualization if WebGL is unavailable.
________________________________________
29. ERROR HANDLING
The app must never show a blank screen.
If NASA API fails:
NASA DATA TEMPORARILY UNAVAILABLE

Using verified demo dataset for simulation.
If Supabase isn't configured:
LOCAL MODE
If AI isn't configured:
AI ADVISOR OFFLINE

Simulation engine remains fully operational.
________________________________________
30. README
Create a professional README explaining:
MARS FARM
Problem
How can humans sustainably produce food on Mars?
Solution
A NASA-data-informed agriculture simulation.
Features
•	Mars location analysis
•	crop suitability
•	greenhouse management
•	resource management
•	mission simulation
•	environmental events
•	AI farm advisor
•	NASA data integration
•	mission scoring
Tech Stack
List all technologies used.
Installation
Provide exact commands.
Environment Variables
Explain configuration.
NASA Data Sources
Document actual sources used.
Scientific Assumptions
Clearly explain what is simulated.
Deployment
Explain Vercel + Render/Supabase deployment.
________________________________________
31. IMPORTANT DEVELOPMENT RULES
Do NOT:
•	create a fake static dashboard
•	hardcode every UI result
•	claim simulated values are official NASA measurements
•	make AI responsible for scientific calculations
•	require paid services to run the core application
•	leave buttons non-functional
•	create placeholder pages without functionality
•	overcomplicate the backend
DO:
•	build functional interactions
•	use realistic simulation logic
•	make the experience visually impressive
•	provide fallback data
•	document assumptions
•	make the core mission playable without external AI
•	prioritize the 3–5 minute judge demo
•	make the project feel like a real NASA mission planning tool
________________________________________
32. FINAL QUALITY BAR
The final application should feel like a real product, not a student CRUD project.
The judge should immediately understand:
PROBLEM
Humans need sustainable food production for long-duration Mars missions.
DATA
NASA data helps us understand Mars' environment.
TECHNOLOGY
Our simulation converts environmental conditions and resource constraints into agricultural decisions.
EXPERIENCE
Users build and operate their own Mars farm.
OUTCOME
The system determines whether their farm can sustain a crew.
________________________________________
33. BUILD PRIORITY
If development time becomes limited, prioritize in this exact order:
P0 — MUST HAVE
1.	Landing page
2.	Mars location selection
3.	Environmental metrics
4.	Crop selection
5.	Resource allocation
6.	Simulation engine
7.	Survival score
8.	Mission results
P1 — HIGH VALUE
9.	3D Mars
10.	Farm builder
11.	Random events
12.	Simulation timeline
13.	NASA API integration
14.	Responsive design
P2 — NICE TO HAVE
15.	AI Farm Advisor
16.	Leaderboard
17.	Mission sharing
18.	Advanced 3D greenhouse
19.	Advanced analytics
The P0 features must work even if all P2 features are removed.
________________________________________
34. START IMPLEMENTATION
First inspect the development environment and determine the best project structure.
Then:
1.	Initialize the project.
2.	Create the frontend.
3.	Create the backend.
4.	Build the design system.
5.	Implement the landing page.
6.	Implement Mars location selection.
7.	Implement the crop system.
8.	Implement resource calculations.
9.	Implement the simulation engine.
10.	Implement mission scoring.
11.	Connect NASA data.
12.	Add fallback demo data.
13.	Add animations.
14.	Add responsive layouts.
15.	Add optional AI.
16.	Test all major user flows.
17.	Fix errors and console warnings.
18.	Create the README.
19.	Ensure the project can run locally with clear commands.
20.	Ensure the final application is polished and demo-ready.
Do not stop after generating the UI.
Build the actual working application.
The final result should be a compelling, interactive, scientifically transparent, NASA Space Apps hackathon-ready project called:
🌱 MARS FARM
Growing Humanity's Future on Mars

