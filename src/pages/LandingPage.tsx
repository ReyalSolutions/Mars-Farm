import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Rocket, Sprout, ShieldAlert, Cpu, Globe, ArrowRight, Play, Database,
  Flame, Droplets, Sun, Sparkles, Activity, CheckCircle2, AlertTriangle,
  Layers, Zap, Thermometer, Wind, Radiation, Sliders, Leaf, Compass, ChevronRight, Maximize2
} from 'lucide-react';
import { MarsGlobe } from '../components/visualization/MarsGlobe';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useMission } from '../context/MissionContext';
import { CROPS_DATA } from '../data/cropsData';

interface EnvConditionDetail {
  id: string;
  name: string;
  metric: string;
  icon: React.ReactNode;
  nasaSource: string;
  hazard: string;
  mitigation: string;
  severity: 'High' | 'Extreme' | 'Moderate';
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadDemoMission, updateConfig } = useMission();

  // Interactive environmental conditions state
  const [selectedConditionId, setSelectedConditionId] = useState<string>('temperature');

  // Interactive mini-simulation sandbox state
  const [sandboxCrew, setSandboxCrew] = useState<number>(6);
  const [sandboxFarmArea, setSandboxFarmArea] = useState<number>(120);

  // Selected crop for interactive detail preview
  const [activeCropId, setActiveCropId] = useState<string>('potato');

  const handleStartDemo = () => {
    loadDemoMission();
    navigate('/mission/simulation');
  };

  const handleLaunchWithSandbox = () => {
    updateConfig({
      crewSize: sandboxCrew,
      farmAreaM2: sandboxFarmArea,
      missionDays: 365,
      waterReserveLiters: sandboxFarmArea * 40,
      dailyEnergyBudgetKwh: 55,
    });
    navigate('/mission/location');
  };

  // Calculations for interactive sandbox preview
  const dailyCalorieDemand = sandboxCrew * 2500;
  // Average caloric output across a balanced Martian crop mix ~ 135 kcal per m² per day
  const dailyCalorieProduced = Math.round(sandboxFarmArea * 135);
  const coveragePercent = Math.min(150, Math.round((dailyCalorieProduced / dailyCalorieDemand) * 100));
  const dailyWaterLoopL = Math.round(sandboxFarmArea * 8.5);
  const dailyOxygenProducedKg = (sandboxFarmArea * 0.12).toFixed(1);

  const envConditions: EnvConditionDetail[] = [
    {
      id: 'temperature',
      name: 'Subzero Surface Temperatures',
      metric: '-63°C Mean (-125°C to +20°C)',
      icon: <Thermometer className="w-5 h-5 text-cyan-400" />,
      nasaSource: 'NASA Curiosity REMS & InSight TWINS Weather Stations',
      hazard: 'Rapid intracellular freezing, structural thermal contraction, and catastrophic metabolic shutdown of vegetative tissue.',
      mitigation: 'Double-walled aerogel vacuum insulation, geothermal heat exchangers, and regulated thermal fluid loops.',
      severity: 'Extreme'
    },
    {
      id: 'radiation',
      name: 'Cosmic & Solar Particle Events',
      metric: '240 – 300 mSv / year',
      icon: <Radiation className="w-5 h-5 text-amber-400" />,
      nasaSource: 'NASA Mars Odyssey MARIE & Curiosity RAD Detectors',
      hazard: 'DNA double-strand breaks, severe crop phenotypic mutations, sterility, and chronic astronaut cellular damage.',
      mitigation: '2-meter Martian regolith overburden shielding, hydrogenated polymer water-wall buffers, and subterranean vaults.',
      severity: 'High'
    },
    {
      id: 'solar',
      name: 'Attenuated Solar Irradiance',
      metric: '590 W/m² (43% of Earth Sunlight)',
      icon: <Sun className="w-5 h-5 text-yellow-400" />,
      nasaSource: 'NASA Viking & Mars Global Surveyor Solar Sensors',
      hazard: 'Sub-optimal Photosynthetically Active Radiation (PAR), stunting C3/C4 crop biomass accumulation.',
      mitigation: 'High-flux dual-spectrum LED lighting arrays (660nm deep red + 450nm royal blue) with solar collector mirrors.',
      severity: 'Moderate'
    },
    {
      id: 'water',
      name: 'Subsurface Glacial Cryo-Ice',
      metric: '90%+ Purity in Arcadia & Utopia',
      icon: <Droplets className="w-5 h-5 text-blue-400" />,
      nasaSource: 'NASA Mars Reconnaissance Orbiter (MRO) SHARAD Radar',
      hazard: 'Surface liquid water is unstable due to the triple point of water at 610 Pa; ice sublimates directly to vapor.',
      mitigation: 'Sub-surface Rodriguez thermal melting wells, closed-loop condensation recovery, and automated perchlorate filtration.',
      severity: 'High'
    },
    {
      id: 'atmosphere',
      name: 'Ultra-Thin Dry CO₂ Atmosphere',
      metric: '0.636 kPa (< 1% Earth Pressure)',
      icon: <Wind className="w-5 h-5 text-slate-300" />,
      nasaSource: 'NASA MAVEN Atmospheric & Volatile Evolution Orbiter',
      hazard: 'Instant leaf desiccation and zero boundary layer gas exchange under ambient vacuum-like conditions.',
      mitigation: 'Pressurized CEA biospheres (50–70 kPa), enriched CO₂ scrubbers (1,200 ppm), and automated nitrogen buffer tanks.',
      severity: 'Extreme'
    },
    {
      id: 'dust',
      name: 'Global Atmospheric Dust Storms',
      metric: 'Optical Depth Tau > 3.0',
      icon: <ShieldAlert className="w-5 h-5 text-mars-400" />,
      nasaSource: 'NASA Opportunity & InSight Long-Term Solar Array Logs',
      hazard: 'Prolonged obscuration cuts solar power by up to 99%, triggering cold blackouts and life-support failure.',
      mitigation: 'Electrostatic dust-repulsion coatings, automated mechanical wipers, and auxiliary micro-nuclear Stirling generators.',
      severity: 'Extreme'
    }
  ];

  const currentCondition = envConditions.find(c => c.id === selectedConditionId) || envConditions[0];
  const activeCrop = CROPS_DATA.find(c => c.id === activeCropId) || CROPS_DATA[0];

  const workflowSteps = [
    {
      num: '01',
      title: 'Scout Landing Zone',
      desc: 'Evaluate 5 authentic NASA-mapped Martian regions for glacial water ice, elevation, and solar flux.',
      icon: <Globe className="w-5 h-5 text-cyan-400" />
    },
    {
      num: '02',
      title: 'Configure Colony Demands',
      desc: 'Set astronaut crew size (1-12) and mission duration (30-500 sols) to calculate caloric and metabolic baselines.',
      icon: <Rocket className="w-5 h-5 text-mars-400" />
    },
    {
      num: '03',
      title: 'Bio-Dome Farm Builder',
      desc: 'Allocate greenhouse beds to high-yield crops and install solar, LED, water recycling, and hydroponics modules.',
      icon: <Sprout className="w-5 h-5 text-bio-400" />
    },
    {
      num: '04',
      title: 'Survive the Simulation',
      desc: 'Manage multi-sol harvest cycles, resolve dust storms, power failures, and life-support anomalies in real time.',
      icon: <Cpu className="w-5 h-5 text-yellow-400" />
    }
  ];

  return (
    <div className="pb-20 selection:bg-mars-500 selection:text-white">
      {/* 1. TOP TELEMETRY STATUS BAR (MOBILE HORIZONTAL SCROLL TICKER) */}
      <div className="border-b border-slate-800/80 bg-space-950/90 backdrop-blur-md sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-x-3 text-[10px] sm:text-[11px] font-mono text-slate-400 min-w-max sm:min-w-0 sm:justify-between">
            <div className="flex items-center gap-1.5 text-mars-400 font-bold shrink-0 bg-mars-950/60 px-2 py-0.5 rounded border border-mars-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-mars-500 animate-ping" />
              <span className="tracking-wider text-[9px] sm:text-[10px]">LIVE TELEMETRY</span>
            </div>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1 shrink-0">
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>ORBITAL SOL <strong className="text-slate-200">784</strong></span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="shrink-0">EARTH DIST: <strong className="text-slate-200">225.3M km (12.5m)</strong></span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1 shrink-0">
              <Sun className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span>SOLAR: <strong className="text-slate-200">590 W/m²</strong></span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="shrink-0">PRESSURE: <strong className="text-slate-200">0.636 kPa (CO₂)</strong></span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1 shrink-0">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>EQUATORIAL: <strong className="text-slate-200">-63°C</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Page Content Sections with balanced spacing */}
      <div className="space-y-12 sm:space-y-16 lg:space-y-24">
        {/* 2. HERO SECTION */}
        <section className="relative pt-2 sm:pt-5 lg:pt-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-mars-950/80 border border-mars-500/40 text-mars-300 text-[10px] sm:text-xs font-mono shadow-[0_0_15px_rgba(255,77,46,0.2)] max-w-full">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-mars-400 shrink-0" />
              <span className="truncate">NASA SPACE APPS CHALLENGE 2026 · THE NEXT FRONTIER</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white leading-[1.15] sm:leading-tight">
              GROWING HUMANITY'S <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-mars-400 via-orange-400 to-bio-400">
                FUTURE ON MARS
              </span>
            </h1>

            <p className="text-xs sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              Earth gave us life. Mars will challenge us to sustain it. <br className="hidden sm:inline" />
              Design, optimize, and simulate an autonomous bio-regenerative Martian farm powered by authentic NASA planetary exploration datasets.
            </p>

            {/* CTAs - Optimized for mobile tap targets */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-4 pt-1 sm:pt-2">
              <Link to="/mission/location" className="w-full sm:w-auto">
                <Button variant="mars" size="lg" icon={<Rocket className="w-5 h-5" />} className="w-full sm:w-auto justify-center shadow-lg shadow-mars-500/20">
                  Start Mission
                </Button>
              </Link>
              <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleStartDemo}
                  icon={<Play className="w-4 h-4 text-cyan-400" />}
                  className="w-full sm:w-auto justify-center text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-3"
                >
                  Judge Demo
                </Button>
                <Link to="/science" className="w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    size="lg"
                    icon={<Database className="w-4 h-4" />}
                    className="w-full sm:w-auto justify-center text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-800 sm:border-transparent"
                  >
                    NASA Science
                  </Button>
                </Link>
              </div>
            </div>

            {/* Grounding Badges - Mobile responsive flow */}
            <div className="pt-3 sm:pt-4 grid grid-cols-1 sm:flex sm:flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-[11px] sm:text-xs font-mono text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 rounded bg-space-900/80 border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-bio-400 shrink-0" />
                <span>Deterministic Thermodynamics</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 rounded bg-space-900/80 border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                <span>NASA MOLA / REMS / SHARAD</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 rounded bg-space-900/80 border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                <span>Closed-Loop ECLSS</span>
              </div>
            </div>
          </div>

          {/* Right Interactive 3D Mars Scene - Proportioned on mobile */}
          <div className="lg:col-span-5 relative flex justify-center w-full">
            <div className="w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[440px] flex flex-col items-center gap-2.5 sm:gap-3">
              <div className="w-full aspect-square rounded-2xl hud-panel p-2 relative shadow-[0_0_60px_rgba(255,77,46,0.18)] touch-pan-y">
                <MarsGlobe interactive={true} className="h-full" showFullscreenButton={true} />
                <div className="absolute bottom-3 left-3 right-3 bg-space-950/85 backdrop-blur-sm border border-slate-800/80 rounded-lg py-1.5 px-2 text-center text-[10px] font-mono text-slate-400 pointer-events-none">
                  <span>🖱 Drag or swipe to rotate · Tap sites to scout</span>
                </div>
              </div>
              <Link
                to="/solar-system"
                className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-space-900 via-mars-950/50 to-space-900 border border-mars-500/40 hover:border-mars-400 text-[11px] sm:text-xs font-mono font-bold text-mars-300 hover:text-white flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-[0_0_20px_rgba(255,77,46,0.3)] group"
              >
                <Maximize2 className="w-3.5 h-3.5 text-mars-400 group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">VIEW FULL SCREEN // EXPLORE SOLAR SYSTEM</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE PLANETARY FOOD BOTTLENECK: EARTH SHIPPED VS IN-SITU MARS */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="hud-panel rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-10 border-cyan-500/20 relative overflow-hidden space-y-6 sm:space-y-8">
          <div className="max-w-3xl space-y-2 sm:space-y-3">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-mars-400 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>The Planetary Food Bottleneck</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-white">
              Why Closed-Loop Agriculture is Non-Negotiable
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Shipping freeze-dried rations across interplanetary space costs over $100,000 per kilogram in rocket propellant. A crew of 6 astronauts requires 5.4 tons of food annually. Without self-sustaining in-situ agriculture, permanent human presence on Mars is physically and economically impossible.
            </p>
          </div>

          {/* Comparison Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Earth Supply Chain */}
            <div className="p-4 sm:p-6 rounded-xl bg-red-950/20 border border-red-500/30 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] sm:text-xs font-mono text-red-400 uppercase font-bold tracking-wider">Option A · Earth Resupply Lifeline</span>
                <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono bg-red-950 text-red-300 border border-red-500/40 shrink-0">Critical Risk</span>
              </div>
              <ul className="space-y-2 sm:space-y-2.5 text-[11px] sm:text-xs text-slate-300 font-mono">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>$100k+ / kg:</strong> Astronomical rocket launch payload penalty</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>26-Month Windows:</strong> Planetary orbital alignment latency</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Nutrient Degradation:</strong> Radiation decays vitamins A, C, B1 in storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 shrink-0 mt-0.5" />
                  <span><strong>Single Point of Failure:</strong> One missed rocket launch causes starvation</span>
                </li>
              </ul>
            </div>

            {/* Martian Bio-Regenerative Agriculture */}
            <div className="p-4 sm:p-6 rounded-xl bg-bio-950/20 border border-bio-500/30 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] sm:text-xs font-mono text-bio-400 uppercase font-bold tracking-wider">Option B · In-Situ Martian Bio-Dome</span>
                <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono bg-bio-950 text-bio-300 border border-bio-500/40 shrink-0">Humanity's Future</span>
              </div>
              <ul className="space-y-2 sm:space-y-2.5 text-[11px] sm:text-xs text-slate-300 font-mono">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-bio-400 shrink-0 mt-0.5" />
                  <span><strong>98% Closed-Loop:</strong> Transpired moisture condensed back into crop roots</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-bio-400 shrink-0 mt-0.5" />
                  <span><strong>Oxygen Coproduction:</strong> Crops scrub ambient CO₂ and exhale breathable O₂</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-bio-400 shrink-0 mt-0.5" />
                  <span><strong>Fresh Bioactive Diet:</strong> Crisp produce preserves psychological & gut health</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-bio-400 shrink-0 mt-0.5" />
                  <span><strong>Permanent Autonomy:</strong> Settlement can expand indefinitely without Earth reliance</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 pt-2 sm:pt-4 border-t border-slate-800">
            <div className="bg-space-950/80 border border-slate-800/80 rounded-xl p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs font-mono text-slate-400">Interplanetary Distance</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-cyan-300 mt-0.5 sm:mt-1">225M km</p>
              <p className="text-[9px] sm:text-[11px] font-mono text-slate-400 mt-0.5 sm:mt-1">9 months transit time</p>
            </div>
            <div className="bg-space-950/80 border border-slate-800/80 rounded-xl p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs font-mono text-slate-400">Surface Temperature</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-cyan-300 mt-0.5 sm:mt-1">-63°C</p>
              <p className="text-[9px] sm:text-[11px] font-mono text-slate-400 mt-0.5 sm:mt-1">Extreme diurnal swings</p>
            </div>
            <div className="bg-space-950/80 border border-slate-800/80 rounded-xl p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs font-mono text-slate-400">Atmospheric Density</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-cyan-300 mt-0.5 sm:mt-1">&lt; 1%</p>
              <p className="text-[9px] sm:text-[11px] font-mono text-slate-400 mt-0.5 sm:mt-1">0.636 kPa dry CO₂</p>
            </div>
            <div className="bg-space-950/80 border border-slate-800/80 rounded-xl p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs font-mono text-slate-400">Solar Irradiance</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-cyan-300 mt-0.5 sm:mt-1">43%</p>
              <p className="text-[9px] sm:text-[11px] font-mono text-slate-400 mt-0.5 sm:mt-1">Relative to Earth sun</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE MARS ENVIRONMENTAL CONDITIONS MATRIX */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-[11px] sm:text-xs font-mono text-cyan-400 uppercase tracking-widest">Martian Planetary Hazards & NASA Data</p>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">Interactive Environmental Conditions Matrix</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Select an extreme planetary environmental factor below to inspect real NASA sensor observations, agricultural hazards, and engineering mitigations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Buttons - Single column on mobile for clean readable chips */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
            {envConditions.map((condition) => {
              const isActive = condition.id === selectedConditionId;
              return (
                <button
                  key={condition.id}
                  onClick={() => setSelectedConditionId(condition.id)}
                  className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-space-900 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-space-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-space-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-cyan-950/80 border border-cyan-500/40' : 'bg-space-900'}`}>
                      {condition.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold font-display leading-tight truncate">{condition.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">{condition.metric}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-cyan-400 translate-x-1' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Selected Condition Detail Card */}
          <div className="lg:col-span-7">
            <div className="hud-panel rounded-2xl p-4 sm:p-6 md:p-8 border-cyan-500/30 h-full flex flex-col justify-between space-y-5 sm:space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 sm:pb-4">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 shrink-0">
                      {currentCondition.icon}
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold font-display text-white">{currentCondition.name}</h3>
                      <p className="text-[11px] sm:text-xs font-mono text-cyan-300">{currentCondition.metric}</p>
                    </div>
                  </div>
                  <span className={`self-start sm:self-center px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border shrink-0 ${
                    currentCondition.severity === 'Extreme'
                      ? 'bg-red-950/80 text-red-400 border-red-500/40'
                      : currentCondition.severity === 'High'
                      ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                      : 'bg-bio-950/80 text-bio-400 border-bio-500/40'
                  }`}>
                    {currentCondition.severity} Hazard
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">NASA Sensor Grounding</span>
                    <p className="text-[11px] sm:text-xs font-mono text-slate-200 bg-space-950 p-2.5 rounded-lg border border-slate-800/80">
                      🛰️ {currentCondition.nasaSource}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-red-400 block mb-1">Agricultural & Crop Hazard</span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-red-950/20 p-2.5 sm:p-3 rounded-lg border border-red-500/20">
                      {currentCondition.hazard}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-bio-400 block mb-1">MARS FARM Engineering Mitigation</span>
                    <p className="text-xs text-slate-300 leading-relaxed bg-bio-950/20 p-2.5 sm:p-3 rounded-lg border border-bio-500/20">
                      {currentCondition.mitigation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 sm:pt-4 border-t border-slate-800 flex justify-between items-center text-[11px] sm:text-xs font-mono">
                <span className="text-slate-400">Integrated into Simulation Engine</span>
                <Link to="/science" className="text-cyan-400 hover:underline flex items-center gap-1">
                  <span>View All Sources</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VIRTUAL MARS GREENHOUSE ARCHITECTURE */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="text-center space-y-1.5 sm:space-y-2 max-w-2xl mx-auto">
          <p className="text-[11px] sm:text-xs font-mono text-bio-400 uppercase tracking-widest">Closed-Loop Life Support Engineering</p>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">The Martian Bio-Dome Architecture</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Four interconnected engineering systems work continuously to shield crops from lethal ambient Martian conditions and sustain closed-loop cycles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Subsystem 1 */}
          <div className="hud-panel rounded-xl sm:rounded-2xl p-4 sm:p-6 border-cyan-500/20 space-y-2.5 sm:space-y-3 hover:border-cyan-400/50 transition-all">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-yellow-950/80 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold font-display text-slate-100">Photovoltaic & Storage Grid</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Triple-junction GaAs solar arrays paired with regenerative hydrogen fuel cells to buffer the 24.6-hour Martian sol day-night thermal swing.
            </p>
            <div className="text-[10px] font-mono text-yellow-300 pt-2 border-t border-slate-800">
              ⚡ 50+ kWh/day continuous output
            </div>
          </div>

          {/* Subsystem 2 */}
          <div className="hud-panel rounded-xl sm:rounded-2xl p-4 sm:p-6 border-cyan-500/20 space-y-2.5 sm:space-y-3 hover:border-cyan-400/50 transition-all">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Droplets className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold font-display text-slate-100">Closed-Loop ECLSS Water Loop</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Condensation coils capture 98% of plant transpiration and greywater, filtering through multi-barrier RO membranes for perpetual re-injection.
            </p>
            <div className="text-[10px] font-mono text-cyan-300 pt-2 border-t border-slate-800">
              💧 98% closed recovery efficiency
            </div>
          </div>

          {/* Subsystem 3 */}
          <div className="hud-panel rounded-xl sm:rounded-2xl p-4 sm:p-6 border-cyan-500/20 space-y-2.5 sm:space-y-3 hover:border-cyan-400/50 transition-all">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-bio-950/80 border border-bio-500/40 flex items-center justify-center text-bio-400">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold font-display text-slate-100">LED Aeroponics & Hydroponics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Soilless automated root atomization bypasses toxic regolith perchlorates and accelerates potato, lettuce, and grain vegetative growth by 300%.
            </p>
            <div className="text-[10px] font-mono text-bio-300 pt-2 border-t border-slate-800">
              🌱 Zero toxic perchlorate uptake
            </div>
          </div>

          {/* Subsystem 4 */}
          <div className="hud-panel rounded-xl sm:rounded-2xl p-4 sm:p-6 border-cyan-500/20 space-y-2.5 sm:space-y-3 hover:border-cyan-400/50 transition-all">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-mars-950/80 border border-mars-500/40 flex items-center justify-center text-mars-400">
              <Wind className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold font-display text-slate-100">Biosphere Climate Regulation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maintains 60 kPa internal pressure with 1,200 ppm atmospheric CO₂ injection from Martian air capture, hyper-charging plant photosynthesis.
            </p>
            <div className="text-[10px] font-mono text-mars-300 pt-2 border-t border-slate-800">
              🌡 21°C constant / 1,200 ppm CO₂
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE SIMULATION SANDBOX / CALORIC PREVIEW */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="hud-panel-mars rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-10 border-orange-500/30 space-y-6 sm:space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 sm:gap-4 border-b border-slate-800 pb-4 sm:pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-mars-950 border border-mars-500/40 text-mars-400 text-[10px] sm:text-xs font-mono mb-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>INTERACTIVE MISSION CALCULATOR</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-white">
                Live Caloric Self-Sufficiency Sandbox
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Adjust crew size and greenhouse area to inspect calculated survival metrics in real time before launching your mission.
              </p>
            </div>

            <Button
              variant="mars"
              size="md"
              onClick={handleLaunchWithSandbox}
              icon={<Rocket className="w-4 h-4" />}
              className="w-full md:w-auto justify-center"
            >
              Launch with these Settings
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Sliders Control */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              {/* Crew Slider */}
              <div className="space-y-2 bg-space-950/70 p-3.5 sm:p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-bold">ASTRONAUT CREW SIZE</span>
                  <span className="text-cyan-400 font-bold text-xs sm:text-sm">{sandboxCrew} Crew Members</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={sandboxCrew}
                  onChange={(e) => setSandboxCrew(parseInt(e.target.value))}
                  className="w-full h-2 bg-space-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[9px] sm:text-[10px] font-mono text-slate-500">
                  <span>1 Solo Scout</span>
                  <span>6 NASA Standard</span>
                  <span>12 Outpost</span>
                </div>
              </div>

              {/* Farm Area Slider */}
              <div className="space-y-2 bg-space-950/70 p-3.5 sm:p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-300 font-bold">GREENHOUSE FARM AREA</span>
                  <span className="text-bio-400 font-bold text-xs sm:text-sm">{sandboxFarmArea} m²</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={300}
                  step={5}
                  value={sandboxFarmArea}
                  onChange={(e) => setSandboxFarmArea(parseInt(e.target.value))}
                  className="w-full h-2 bg-space-900 rounded-lg appearance-none cursor-pointer accent-bio-400"
                />
                <div className="flex justify-between text-[9px] sm:text-[10px] font-mono text-slate-500">
                  <span>25 m² (Expedition)</span>
                  <span>120 m² (Optimal)</span>
                  <span>300 m² (Colony)</span>
                </div>
              </div>
            </div>

            {/* Live Sandbox Telemetry Card */}
            <div className="lg:col-span-6 bg-space-950/90 border border-cyan-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase">Calculated Sustainability</span>
                <span className={`self-start sm:self-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase border ${
                  coveragePercent >= 100
                    ? 'bg-bio-950 text-bio-300 border-bio-500/50'
                    : coveragePercent >= 70
                    ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                    : 'bg-red-950 text-red-300 border-red-500/50'
                }`}>
                  {coveragePercent >= 100 ? '🟢 100% Autonomy' : coveragePercent >= 70 ? '🟡 Partial Deficit' : '🔴 Severe Risk'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 text-xs font-mono">
                <div className="p-2.5 sm:p-3 rounded-lg bg-space-900/90 border border-slate-800">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 block truncate">Daily Caloric Demand</span>
                  <span className="text-base sm:text-lg font-bold text-slate-200">{dailyCalorieDemand.toLocaleString()} kcal</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 block mt-0.5 truncate">2,500 kcal / crew</span>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg bg-space-900/90 border border-slate-800">
                  <span className="text-[9px] sm:text-[10px] text-bio-400 block truncate">Est. Harvest Output</span>
                  <span className="text-base sm:text-lg font-bold text-bio-300">+{dailyCalorieProduced.toLocaleString()} kcal</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 block mt-0.5 truncate">~135 kcal / m²</span>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg bg-space-900/90 border border-slate-800">
                  <span className="text-[9px] sm:text-[10px] text-cyan-400 block truncate">Water Recirculation</span>
                  <span className="text-base sm:text-lg font-bold text-cyan-300">{dailyWaterLoopL.toLocaleString()} L</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 block mt-0.5 truncate">98% recycled loop</span>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg bg-space-900/90 border border-slate-800">
                  <span className="text-[9px] sm:text-[10px] text-amber-400 block truncate">O₂ Coproduction</span>
                  <span className="text-base sm:text-lg font-bold text-amber-300">+{dailyOxygenProducedKg} kg</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 block mt-0.5 truncate">Photosynthesis</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-[11px] sm:text-xs font-mono mb-1.5">
                  <span className="text-slate-400">Total Food Coverage Ratio</span>
                  <span className="font-bold text-slate-200">{coveragePercent}%</span>
                </div>
                <div className="w-full h-2.5 sm:h-3 bg-space-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      coveragePercent >= 100 ? 'bg-bio-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : coveragePercent >= 70 ? 'bg-amber-400' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, coveragePercent)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. NASA BIO-REGENERATIVE CROP SELECTION LABORATORY */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-4">
          <div>
            <p className="text-[11px] sm:text-xs font-mono text-cyan-400 uppercase tracking-widest">Bio-Regenerative Life Support</p>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">Martian Crop Cultivars</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Engineered crop varieties selected by NASA astrobotanists for high harvest index, radiation resilience, and complete nutritional profiles.
            </p>
          </div>
          <Link to="/mission/crops" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right" className="w-full sm:w-auto justify-center">
              Configure Crop Beds
            </Button>
          </Link>
        </div>

        {/* 3 columns on small mobile, 6 on desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
          {CROPS_DATA.map((crop) => {
            const isSelected = crop.id === activeCropId;
            return (
              <div
                key={crop.id}
                onClick={() => setActiveCropId(crop.id)}
                className={`hud-panel rounded-xl p-2.5 sm:p-4 text-center space-y-1 sm:space-y-2 cursor-pointer transition-all group ${
                  isSelected
                    ? 'border-bio-400 bg-space-900 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                    : 'hover:border-bio-400/50 hover:bg-space-900/50'
                }`}
              >
                <span className="text-3xl sm:text-4xl inline-block group-hover:scale-110 transition-transform">{crop.emoji}</span>
                <p className="font-display font-bold text-xs sm:text-sm text-slate-200 truncate">{crop.name}</p>
                <p className="text-[10px] sm:text-[11px] font-mono text-bio-400 font-bold">{crop.caloriesPerKg} kcal</p>
                <div className="text-[9px] sm:text-[10px] font-mono text-slate-400 pt-1.5 sm:pt-2 border-t border-slate-800">
                  <span>{crop.growthDays}d cycle</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Crop Interactive Detail Box */}
        <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-space-900/60 border border-bio-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-4xl sm:text-5xl p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-space-950 border border-slate-800 shrink-0">{activeCrop.emoji}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold font-display text-white">{activeCrop.name}</h3>
                <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono bg-bio-950 text-bio-300 border border-bio-500/40">
                  NASA Cultivar
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                {activeCrop.nutritionalHighlights.join(' · ') || activeCrop.scientificName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center font-mono text-xs w-full md:w-auto shrink-0">
            <div className="bg-space-950 p-2 sm:p-2.5 rounded-lg border border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-slate-400 block">Water</span>
              <span className="font-bold text-cyan-300 text-xs sm:text-sm">{activeCrop.waterPerKgLiters} L/kg</span>
            </div>
            <div className="bg-space-950 p-2 sm:p-2.5 rounded-lg border border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-slate-400 block">Energy</span>
              <span className="font-bold text-amber-300 text-xs sm:text-sm">{activeCrop.energyPerKgKwh} kWh</span>
            </div>
            <div className="bg-space-950 p-2 sm:p-2.5 rounded-lg border border-slate-800">
              <span className="text-[9px] sm:text-[10px] text-slate-400 block">Protein</span>
              <span className="font-bold text-bio-300 text-xs sm:text-sm">{activeCrop.proteinGramsPerKg} g/kg</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. HOW IT WORKS WORKFLOW */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        <div className="text-center space-y-1.5 sm:space-y-2">
          <p className="text-[11px] sm:text-xs font-mono text-bio-400 uppercase tracking-widest">End-to-End Mission Lifecycle</p>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">How the MARS FARM Simulation Operates</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {workflowSteps.map((step) => (
            <Card key={step.num} variant="default" className="relative group hover:border-cyan-400/50 p-4 sm:p-6">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl font-bold font-mono text-slate-500 group-hover:text-cyan-400 transition-colors">
                  {step.num}
                </span>
                <div className="p-2 rounded-md bg-space-950 border border-slate-800">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-sm sm:text-base font-bold font-display text-slate-100 mb-1.5 sm:mb-2">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="hud-panel-mars rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-14 text-center space-y-4 sm:space-y-6 relative overflow-hidden shadow-2xl">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-mars-950 border border-mars-500/40 text-mars-400 text-[10px] sm:text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CAN YOUR BIO-DOME KEEP HUMANITY ALIVE?</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold font-display text-white leading-tight">
            Take Command of the Martian Frontier
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Step into the boots of Mission Commander and Chief Astrobotanist. Calculate closed-loop thermodynamics, balance water recycling, and navigate global dust squalls to ensure colony survival.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 w-full sm:w-auto">
            <Link to="/mission/location" className="w-full sm:w-auto">
              <Button variant="mars" size="lg" icon={<Rocket className="w-5 h-5" />} className="w-full sm:w-auto justify-center">
                Launch Mission Planner
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleStartDemo}
              icon={<Play className="w-4 h-4 text-cyan-400" />}
              className="w-full sm:w-auto justify-center"
            >
              Run 3-Minute Demo
            </Button>
            <Link to="/leaderboard" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                icon={<Activity className="w-4 h-4 text-bio-400" />}
                className="w-full sm:w-auto justify-center"
              >
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

