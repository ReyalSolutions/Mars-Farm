import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MARS_SURFACE_DATA, MarsSurfaceDetail, NasaSurfaceImage } from '../data/marsSurfaceData';
import { MARS_LOCATIONS } from '../data/marsLocations';
import { MarsSurfaceScene } from '../components/visualization/MarsSurfaceScene';
import { useMission } from '../context/MissionContext';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft, Globe, MapPin, Rocket, Thermometer, Sun, Droplets,
  Shield, Wind, ExternalLink, Maximize2, X, Compass, Sprout,
  CheckCircle2, Sparkles, Layers, Radio, Mountain, Info, AlertTriangle
} from 'lucide-react';

export const MarsSurfaceView: React.FC = () => {
  const { locationId } = useParams<{ locationId?: string }>();
  const navigate = useNavigate();
  const { setLocation } = useMission();

  // Active location selection (default to jezero-crater if not specified)
  const activeId = locationId && MARS_SURFACE_DATA[locationId] ? locationId : 'jezero-crater';
  const surfaceData: MarsSurfaceDetail = MARS_SURFACE_DATA[activeId] || MARS_SURFACE_DATA['jezero-crater'];

  // Modal state for inspecting high-res NASA surface images
  const [inspectingImage, setInspectingImage] = useState<NasaSurfaceImage | null>(null);

  // Active view tab in lower panel
  const [activeTab, setActiveTab] = useState<'imagery' | 'telemetry' | 'geology'>('imagery');

  const handleSelectLocation = (id: string) => {
    navigate(`/surface/${id}`);
  };

  const handleLaunchAtSite = () => {
    setLocation(surfaceData.locationId);
    navigate('/mission/setup');
  };

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col selection:bg-mars-500 selection:text-white">
      {/* ── 1. Top Mission Reconnaissance Header ─────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-space-950/90 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/solar-system')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-space-900 border border-slate-700 hover:border-cyan-400 text-xs font-mono text-slate-300 hover:text-white transition-all shadow-sm"
              title="Return to Solar System Orbit"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Solar Orbit</span>
              <span className="sm:hidden">Orbit</span>
            </button>

            <div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                <MapPin className="w-3 h-3 text-mars-400" />
                <span>Planetary Surface Reconnaissance · 3D Terrain & NASA Imagery</span>
              </div>
              <h1 className="text-sm sm:text-lg font-bold font-display text-white tracking-tight leading-none mt-0.5">
                {surfaceData.name} <span className="text-xs font-mono text-slate-400 font-normal hidden md:inline">({surfaceData.ancientName})</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="mars"
              size="sm"
              onClick={handleLaunchAtSite}
              icon={<Rocket className="w-3.5 h-3.5" />}
              className="py-1.5 px-3 sm:px-4 text-xs shadow-lg shadow-mars-500/20"
            >
              <span className="hidden sm:inline">Establish Colony at this Site</span>
              <span className="sm:hidden">Launch Mission</span>
            </Button>
          </div>
        </div>

        {/* ── 2. Landing Site Switcher Bar ───────────────────────────────────── */}
        <div className="border-t border-slate-800/80 bg-space-900/60 overflow-x-auto no-scrollbar py-1.5 px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Scouted Landing Sites:
            </span>
            {MARS_LOCATIONS.map((loc) => {
              const isSelected = loc.id === activeId;
              return (
                <button
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-mars-950 text-white border border-mars-500/80 shadow-[0_0_12px_rgba(255,77,46,0.3)] font-bold'
                      : 'bg-space-950/70 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-mars-400 animate-ping' : 'bg-slate-600'}`} />
                  <span>{loc.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── 3. Main Split View: 3D Surface Simulation + NASA Surface Dossier ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        {/* 3D Surface Viewport Canvas Container */}
        <div className="w-full h-[380px] sm:h-[480px] lg:h-[540px] rounded-2xl sm:rounded-3xl hud-panel border-cyan-500/30 relative overflow-hidden shadow-2xl">
          <MarsSurfaceScene surfaceData={surfaceData} />
        </div>

        {/* ── 4. Surface Dossier Tabs & Intel Panel ──────────────────────────── */}
        <div className="hud-panel rounded-2xl p-4 sm:p-6 border-slate-800 space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('imagery')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  activeTab === 'imagery'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>NASA High-Res Surface Imagery ({surfaceData.images.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('telemetry')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  activeTab === 'telemetry'
                    ? 'bg-mars-950 text-mars-300 border border-mars-500/50 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-mars-400" />
                <span>Sensor Telemetry & ECLSS Physics</span>
              </button>

              <button
                onClick={() => setActiveTab('geology')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  activeTab === 'geology'
                    ? 'bg-bio-950 text-bio-300 border border-bio-500/50 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mountain className="w-3.5 h-3.5 text-bio-400" />
                <span>Geological & Agricultural Intel</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span>NASA Planetary Data System (PDS) Verified</span>
            </div>
          </div>

          {/* TAB 1: NASA HIGH-RESOLUTION SURFACE IMAGERY */}
          {activeTab === 'imagery' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {surfaceData.images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setInspectingImage(img)}
                    className="group rounded-xl border border-slate-800 hover:border-cyan-400/60 bg-space-900/60 overflow-hidden cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-space-950">
                      <img
                        src={img.imageUrl}
                        alt={img.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback in case of external NASA asset block
                          (e.target as HTMLImageElement).src = '/textures/mars_realistic.jpg';
                        }}
                      />
                      {img.isPanorama && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/20 text-[9px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                          360° Panorama
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-transparent opacity-60" />
                      <div className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 backdrop-blur-sm text-slate-300 group-hover:text-cyan-300 transition-colors">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
                        <span>{img.mission}</span>
                        <span>{img.solOrDate}</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold font-display text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {img.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-light">
                        {img.description}
                      </p>
                      <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-[9px] font-mono text-slate-500">
                        <span>{img.instrument}</span>
                        <span>{img.credit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: IN-SITU SENSOR TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-xl bg-space-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
                    <Thermometer className="w-4 h-4" />
                    <span>Diurnal Temperature</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                    {surfaceData.temperatureRangeC.mean}°C
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    Range: {surfaceData.temperatureRangeC.min}°C to {surfaceData.temperatureRangeC.max}°C
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-space-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-yellow-400">
                    <Sun className="w-4 h-4" />
                    <span>Solar Flux</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                    {surfaceData.solarFluxWm2} W/m²
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    Mean incident PAR at local sol
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-space-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-blue-400">
                    <Droplets className="w-4 h-4" />
                    <span>Subsurface Ice Table</span>
                  </div>
                  <p className="text-base sm:text-lg font-bold font-display text-blue-300 mt-1 truncate">
                    {surfaceData.waterIceDepthMeters.split(' ')[0]} {surfaceData.waterIceDepthMeters.split(' ')[1]}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 truncate">
                    {surfaceData.agriculturalAssessment.waterAccessRating}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-space-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-purple-400">
                    <Shield className="w-4 h-4" />
                    <span>Cosmic Radiation</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                    {surfaceData.radiationDoseMsvYear} mSv/yr
                  </p>
                  <p className="text-[10px] font-mono text-slate-400">
                    Surface unshielded GCR + SPE
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-space-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-bold uppercase">Closed-Loop Farm Harvest Multiplier</span>
                  <span className="text-bio-400 font-bold">+{Math.round((surfaceData.agriculturalAssessment.caloricHarvestMultiplier - 1) * 100)}% Environmental Bonus</span>
                </div>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  Based on local barometric pressure ({surfaceData.atmosphericPressureKpa} kPa) and natural thermal inertia, greenhouse heating penalties and hull stress are calculated deterministically by the MarsFarm simulation engine.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: GEOLOGICAL & AGRICULTURAL INTEL */}
          {activeTab === 'geology' && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in">
              <div className="p-4 sm:p-5 rounded-xl bg-space-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-mars-400 uppercase font-bold">
                  <Mountain className="w-4 h-4" />
                  <span>Geological Formations & Regolith Mineralogy</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  {surfaceData.geologicalContext}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-bio-950/20 border border-bio-500/30 space-y-2">
                  <span className="text-xs font-mono text-bio-400 font-bold uppercase block">Recommended High-Yield Cultivars</span>
                  <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                    {surfaceData.agriculturalAssessment.recommendedCrops.map((crop, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Sprout className="w-3.5 h-3.5 text-bio-400" />
                        <span>{crop}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase block">Engineering Shielding Strategy</span>
                  <p className="text-xs text-slate-300 font-mono">
                    {surfaceData.agriculturalAssessment.thermalShieldingNeed}
                  </p>
                  <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                    Water Recovery Loop: Multi-barrier RO condenser arrays with sub-regolith Rodriguez thermal melting wells.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── 5. High-Resolution NASA Image Lightbox Modal ────────────────────── */}
      {inspectingImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in"
          onClick={() => setInspectingImage(null)}
        >
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 pb-3 border-b border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-300 font-bold uppercase">{inspectingImage.mission}</span>
              <span className="text-slate-600">|</span>
              <span>{inspectingImage.instrument}</span>
              <span className="text-slate-600">|</span>
              <span>{inspectingImage.solOrDate}</span>
            </div>

            <button
              onClick={() => setInspectingImage(null)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img
              src={inspectingImage.imageUrl}
              alt={inspectingImage.title}
              className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/15"
            />
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-1 pt-3 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base sm:text-lg font-bold font-display text-white">
              {inspectingImage.title}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
              {inspectingImage.description}
            </p>
            <p className="text-[10px] font-mono text-slate-500 pt-1">
              Credit: {inspectingImage.credit} · NASA Planetary Data System
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
