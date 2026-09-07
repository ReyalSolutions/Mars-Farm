import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setLocation } = useMission();

  const isDescending = searchParams.get('descent') === '1';

  // Active location selection (default to jezero-crater if not specified)
  const activeId = locationId && MARS_SURFACE_DATA[locationId] ? locationId : 'jezero-crater';
  const surfaceData: MarsSurfaceDetail = MARS_SURFACE_DATA[activeId] || MARS_SURFACE_DATA['jezero-crater'];

  // Modal state for inspecting high-res NASA surface images
  const [inspectingImage, setInspectingImage] = useState<NasaSurfaceImage | null>(null);

  // Active view tab in lower panel
  const [activeTab, setActiveTab] = useState<'imagery' | 'satellite' | 'telemetry' | 'geology'>('imagery');

  // View mode inside satellite tab (Satellite Ortho Imagery vs Cartographic Map)
  const [mapViewMode, setMapViewMode] = useState<'satellite-ortho' | 'interactive-map'>('satellite-ortho');

  // Direct ref to the 3D surface simulation container
  const simulationContainerRef = useRef<HTMLDivElement>(null);

  // Ensure scroll is immediately positioned at the 3D simulation display, never stuck at the footer
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Focus viewport right on the simulation container on mobile
    const timer = setTimeout(() => {
      simulationContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);

    return () => clearTimeout(timer);
  }, [activeId, isDescending]);

  // Keep screen focused on the simulation canvas when the descent sequence completes
  const handleDescentComplete = () => {
    simulationContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => navigate('/solar-system')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-space-900 border border-slate-700 hover:border-cyan-400 text-xs font-mono text-slate-300 hover:text-white transition-all shadow-sm shrink-0"
              title="Return to Solar System Orbit"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Solar Orbit</span>
              <span className="sm:hidden">Orbit</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-cyan-400 uppercase tracking-wider truncate">
                <MapPin className="w-3 h-3 text-mars-400 shrink-0" />
                <span className="hidden sm:inline">
                  {surfaceData.bodyType === 'earth'
                    ? 'Planet Earth Terrestrial Station · 1.0g Biosphere & NASA Facilities'
                    : surfaceData.bodyType === 'moon'
                      ? 'Lunar Surface Reconnaissance · 0.166g Vacuum Regolith & Apollo/Artemis Sites'
                      : surfaceData.terrain3DConfig.isMoon
                        ? 'Martian Moon Reconnaissance · 3D Vacuum Surface & NASA/ESA Imagery'
                        : 'Planetary Surface Reconnaissance · 3D Terrain & NASA Imagery'}
                </span>
                <span className="sm:hidden">
                  {surfaceData.bodyType === 'earth'
                    ? 'Earth Station · 1.0g'
                    : surfaceData.bodyType === 'moon'
                      ? 'Moon Base · 0.166g'
                      : surfaceData.terrain3DConfig.isMoon
                        ? 'Moon Recon · Vacuum'
                        : 'Surface Recon · 3D Terrain'}
                </span>
              </div>
              <h1 className="text-sm sm:text-lg font-bold font-display text-white tracking-tight leading-none mt-0.5 truncate">
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
              className="py-1.5 px-2.5 sm:px-4 text-xs shadow-lg shadow-mars-500/20 shrink-0"
            >
              <span className="hidden sm:inline">Establish Outpost Here</span>
              <span className="sm:hidden">Outpost</span>
            </Button>
          </div>
        </div>

        {/* ── 2. Landing Site Switcher Bar (Mars, Earth, The Moon, Martian Moons) ── */}
        <div
          className="border-t border-slate-800/80 bg-space-900/60 overflow-x-auto no-scrollbar py-1.5 px-3 sm:px-6 lg:px-8 touch-pan-x"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
            {/* 1. Mars Surface */}
            <span className="text-[10px] font-mono text-mars-400 uppercase tracking-wider mr-1 shrink-0 font-bold">
              Mars:
            </span>
            {MARS_LOCATIONS.filter((l) => (l.celestialBody === 'mars' || !l.celestialBody) && l.type !== 'Martian Moon').map((loc) => {
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
                  <span>{loc.name.replace(' (Mt. Sharp Foothills)', '').replace(' (Candor Chasma)', '')}</span>
                </button>
              );
            })}

            {/* 2. Earth Stations */}
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mx-1 shrink-0 flex items-center gap-1 font-bold">
              <span className="text-slate-600">|</span> Earth:
            </span>
            {MARS_LOCATIONS.filter((l) => l.celestialBody === 'earth').map((loc) => {
              const isSelected = loc.id === activeId;
              return (
                <button
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-emerald-950 text-white border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] font-bold'
                      : 'bg-space-950/70 border border-slate-800 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                  <span>{loc.name.replace(' (NASA / SpaceX)', '').replace(' (HI-SEAS)', '').replace(' (Arctic Norway)', '')}</span>
                </button>
              );
            })}

            {/* 3. The Moon (Luna) */}
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider mx-1 shrink-0 flex items-center gap-1 font-bold">
              <span className="text-slate-600">|</span> Moon:
            </span>
            {MARS_LOCATIONS.filter((l) => l.celestialBody === 'moon').map((loc) => {
              const isSelected = loc.id === activeId;
              return (
                <button
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-indigo-950 text-white border border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)] font-bold'
                      : 'bg-space-950/70 border border-slate-800 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-indigo-400 animate-ping' : 'bg-slate-600'}`} />
                  <span>{loc.name.replace(' (Lunar South Pole)', '').replace(' (Apollo 11)', '')}</span>
                </button>
              );
            })}

            {/* 4. Martian Moons */}
            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider mx-1 shrink-0 flex items-center gap-1 font-bold">
              <span className="text-slate-600">|</span> Moons:
            </span>
            {MARS_LOCATIONS.filter((l) => l.type === 'Martian Moon').map((loc) => {
              const isSelected = loc.id === activeId;
              return (
                <button
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-purple-950 text-white border border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] font-bold'
                      : 'bg-space-950/70 border border-slate-800 text-slate-400 hover:text-purple-300 hover:border-purple-500/50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-purple-400 animate-ping' : 'bg-slate-600'}`} />
                  <span>{loc.name.replace(' Outpost', '').replace(' Vantage', '')}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── 3. Main Split View: 3D Surface Simulation + NASA Surface Dossier ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6">
        {/* 3D Surface Viewport Canvas Container (Enlarged for mobile exploration) */}
        <div
          ref={simulationContainerRef}
          className="w-full h-[65vh] min-h-[460px] sm:h-[500px] lg:h-[580px] rounded-2xl sm:rounded-3xl hud-panel border-cyan-500/30 relative overflow-hidden shadow-2xl"
        >
          <MarsSurfaceScene
            surfaceData={surfaceData}
            isDescending={isDescending}
            onDescentComplete={handleDescentComplete}
            onInspectNasaImage={setInspectingImage}
          />
        </div>

        {/* ── 4. Surface Dossier Tabs & Intel Panel ──────────────────────────── */}
        <div className="hud-panel rounded-2xl p-3.5 sm:p-6 border-slate-800 space-y-4 sm:space-y-6">
          {/* Tab Navigation & PDS Verified Badge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800/80 pb-3 gap-3">
            {/* Scrollable / Flexible Tabs on Mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 -mb-1 w-full md:w-auto scroll-smooth touch-pan-x">
              <button
                onClick={() => setActiveTab('imagery')}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0 cursor-pointer ${
                  activeTab === 'imagery'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="hidden sm:inline">NASA High-Res Surface Imagery</span>
                <span className="sm:hidden">Surface Imagery</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-900/60 border border-cyan-500/30 font-bold">
                  {surfaceData.images.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('satellite')}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0 cursor-pointer ${
                  activeTab === 'satellite'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="hidden sm:inline">
                  {surfaceData.bodyType === 'earth'
                    ? 'Google Earth & Satellite Map (3D)'
                    : surfaceData.bodyType === 'moon'
                      ? 'Lunar QuickMap & Satellite (3D)'
                      : 'NASA Trek & Satellite Map (3D)'}
                </span>
                <span className="sm:hidden">
                  {surfaceData.bodyType === 'earth' ? 'Google Earth' : 'Satellite 3D'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-500/30 font-bold text-emerald-300">
                  3D
                </span>
              </button>

              <button
                onClick={() => setActiveTab('telemetry')}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0 cursor-pointer ${
                  activeTab === 'telemetry'
                    ? 'bg-mars-950 text-mars-300 border border-mars-500/50 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-mars-400 flex-shrink-0" />
                <span className="hidden sm:inline">Sensor Telemetry & ECLSS Physics</span>
                <span className="sm:hidden">Telemetry & Physics</span>
              </button>

              <button
                onClick={() => setActiveTab('geology')}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 sm:gap-2 flex-shrink-0 cursor-pointer ${
                  activeTab === 'geology'
                    ? 'bg-bio-950 text-bio-300 border border-bio-500/50 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mountain className="w-3.5 h-3.5 text-bio-400 flex-shrink-0" />
                <span className="hidden sm:inline">Geological & Agricultural Intel</span>
                <span className="sm:hidden">Geology & Intel</span>
              </button>
            </div>

            {/* NASA PDS Verified Status Pill */}
            <div className="flex items-center justify-between sm:justify-start gap-2 text-[10px] sm:text-[11px] font-mono text-slate-400 bg-slate-900/50 md:bg-transparent px-2.5 py-1.5 sm:p-0 rounded-lg md:rounded-none border border-slate-800/60 md:border-0 w-full md:w-auto flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 animate-pulse" />
                <span className="truncate">NASA Planetary Data System (PDS) Verified</span>
              </div>
              <span className="text-[9px] text-green-400/80 font-bold uppercase md:hidden flex-shrink-0">PDS v4</span>
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
                          const target = e.target as HTMLImageElement;
                          if (img.fallbackUrl && target.src !== img.fallbackUrl) {
                            target.src = img.fallbackUrl;
                          } else {
                            target.src = '/textures/mars_realistic.jpg';
                          }
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

          {/* TAB 2: GOOGLE EARTH & SATELLITE 3D ORTHO-MAP */}
          {activeTab === 'satellite' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Satellite & Photogrammetry Action Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-space-900/70 border border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <h3 className="text-sm sm:text-base font-bold font-display text-white">
                      {surfaceData.bodyType === 'earth'
                        ? 'Google Earth 3D Photogrammetry & NASA Satellite Ortho-Mosaic'
                        : surfaceData.bodyType === 'moon'
                          ? 'NASA Lunar Reconnaissance Orbiter (LRO) QuickMap 3D'
                          : 'NASA Mars Trek 3D Topographic & Satellite Map'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    {surfaceData.bodyType === 'earth'
                      ? 'Direct satellite telemetry from NASA Landsat 9 (OLI-2), Terra ASTER, and Google Maps / Maxar high-resolution photogrammetry.'
                      : surfaceData.bodyType === 'moon'
                        ? 'Sub-meter orbital imagery from LRO Narrow Angle Camera (NAC) and LOLA laser altimeter digital elevation models.'
                        : 'MRO HiRISE 25cm/pixel stereo terrain models calibrated with Mars Global Surveyor MOLA laser topography.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {/* Mode switcher */}
                  <div className="flex items-center bg-space-900 border border-slate-700 rounded-xl p-0.5">
                    <button
                      onClick={() => setMapViewMode('satellite-ortho')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                        mapViewMode === 'satellite-ortho'
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>NASA Satellite Ortho</span>
                    </button>
                    <button
                      onClick={() => setMapViewMode('interactive-map')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                        mapViewMode === 'interactive-map'
                          ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 font-bold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Layers className="w-3 h-3 text-cyan-400" />
                      <span>Interactive Map</span>
                    </button>
                  </div>

                  {surfaceData.googleEarthUrl && (
                    <a
                      href={surfaceData.googleEarthUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 hover:border-emerald-400 text-xs font-mono text-emerald-300 transition-all shadow-md shadow-emerald-950/40"
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {surfaceData.bodyType === 'earth' ? 'Google Earth 3D' : '3D Explorer'}
                      </span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                    </a>
                  )}

                  {surfaceData.bodyType === 'earth' && (
                    <a
                      href={`https://worldview.earthdata.nasa.gov/?v=${encodeURIComponent(surfaceData.coordinates)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/40 text-xs font-mono text-cyan-300 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>NASA Worldview</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                    </a>
                  )}

                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(surfaceData.coordinates)}&t=k`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-space-950/80 hover:bg-space-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all"
                  >
                    <span>Google Maps (Sat)</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                  </a>
                </div>
              </div>

              {/* Interactive Satellite / 3D Ortho Map Viewport */}
              <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[560px] rounded-2xl overflow-hidden border border-slate-700 bg-space-950 shadow-2xl">
                {mapViewMode === 'satellite-ortho' ? (
                  /* High-Resolution NASA Satellite Ortho-Mosaic View */
                  <div className="relative w-full h-full group bg-space-950 flex items-center justify-center overflow-hidden">
                    <img
                      src={surfaceData.satelliteTextureUrl || surfaceData.images[0]?.imageUrl || '/textures/ksc_satellite.jpg'}
                      alt={`${surfaceData.name} NASA Satellite Imagery`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-zoom-in"
                      onClick={() => {
                        window.open(surfaceData.satelliteTextureUrl || surfaceData.images[0]?.imageUrl, '_blank');
                      }}
                    />

                    {/* Subtle grid and target crosshairs */}
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="relative w-24 h-24 sm:w-36 sm:h-36 border border-emerald-400/40 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                        <div className="absolute -top-3 text-[9px] font-mono text-emerald-400/80 font-bold">TARGET PAD</div>
                        <div className="w-full h-[1px] bg-emerald-400/20 absolute" />
                        <div className="h-full w-[1px] bg-emerald-400/20 absolute" />
                      </div>
                    </div>

                    {/* Satellite Telemetry HUD Overlay */}
                    <div className="absolute top-3 left-3 px-3 py-2 rounded-xl bg-space-950/90 backdrop-blur-md border border-slate-700/80 text-[10px] sm:text-xs font-mono text-emerald-300 flex flex-col gap-1 pointer-events-none shadow-xl">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="font-bold">
                          {surfaceData.bodyType === 'earth' ? 'NASA / USGS HIGH-RES SATELLITE ORTHO' : 'NASA ORBITAL RECONNAISSANCE SATELLITE'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                        <span>COORDINATES: <strong className="text-white">{surfaceData.coordinates}</strong></span>
                        <span>·</span>
                        <span>ELEV: <strong className="text-cyan-300">{surfaceData.elevation}</strong></span>
                      </div>
                    </div>

                    {/* Sensor Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-space-950/90 backdrop-blur-md border border-slate-700/80 text-[10px] font-mono text-cyan-300 pointer-events-none shadow-xl flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span className="hidden sm:inline">AUTHENTIC NASA TELEMETRY</span>
                      <span className="sm:hidden">NASA REAL DATA</span>
                    </div>

                    {/* Bottom Prompt */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <div className="px-3 py-1.5 rounded-xl bg-space-950/90 backdrop-blur-md border border-slate-700/80 text-[10px] font-mono text-slate-400 shadow-xl flex items-center gap-2">
                        <Maximize2 className="w-3 h-3 text-emerald-400" />
                        <span>Click image to inspect full-resolution NASA tile</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-space-950/90 backdrop-blur-md border border-slate-700/80 text-[10px] font-mono text-emerald-400 shadow-xl hidden sm:flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-emerald-400" />
                        <span>1:1 Scaled Satellite Projection</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Interactive Cartographic Map View */
                  <div className="relative w-full h-full">
                    <iframe
                      title={`${surfaceData.name} Cartographic Map`}
                      src={
                        surfaceData.googleMapsEmbedUrl ||
                        `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
                          surfaceData.coordinates
                        )}&layer=mapnik&marker=${encodeURIComponent(surfaceData.coordinates)}`
                      }
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-space-950/90 backdrop-blur-md border border-slate-700/80 text-[10px] sm:text-xs font-mono text-cyan-300 flex items-center gap-2 pointer-events-none shadow-xl">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="font-bold">INTERACTIVE CARTOGRAPHIC TILES</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3D Photogrammetry & Satellite Remote Sensing Intel Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="p-4 rounded-xl bg-space-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Sensors & Resolution</span>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {surfaceData.bodyType === 'earth'
                      ? 'Landsat 9 OLI-2 + WorldView-3'
                      : surfaceData.bodyType === 'moon'
                        ? 'LRO Narrow Angle Camera'
                        : 'MRO HiRISE + CTX Stereo'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {surfaceData.bodyType === 'earth'
                      ? '0.3m aerial to 15m multispectral pansharpened ground resolution with VNIR / SWIR bands.'
                      : surfaceData.bodyType === 'moon'
                        ? '0.5m / pixel sub-meter stereographic lunar terrain mapping with low-angle shadow detection.'
                        : '25cm / pixel high-resolution imaging science experiment with color infrared rock discrimination.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-space-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-bold">
                    <Mountain className="w-3.5 h-3.5" />
                    <span>3D Topographic Elevation</span>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {surfaceData.bodyType === 'earth'
                      ? 'USGS 3DEP / ASTER GDEM 3D'
                      : surfaceData.bodyType === 'moon'
                        ? 'LOLA Laser Altimetry DEM'
                        : 'MGS MOLA Megadunetop DEM'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Surface Datum: <strong className="text-slate-200">{surfaceData.elevation}</strong>. True 3D vertical relief mapped to Three.js simulation mesh.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-space-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold">
                    <Sprout className="w-3.5 h-3.5" />
                    <span>Agricultural Ground Truth</span>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {surfaceData.bodyType === 'earth'
                      ? 'NASA APH Terrestrial Control'
                      : 'Bio-Regenerative Outpost'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Hydrosphere: <strong className="text-slate-200">{surfaceData.waterIceDepthMeters}</strong>. Optical Depth: <strong className="text-slate-200">{surfaceData.dustOpticalDepthTau}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IN-SITU SENSOR TELEMETRY */}
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

              <div className="p-3.5 sm:p-5 rounded-xl bg-space-950 border border-slate-800 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
                  <span className="text-slate-300 font-bold uppercase">Closed-Loop Farm Harvest Multiplier</span>
                  <span className="text-bio-400 font-bold">+{Math.round((surfaceData.agriculturalAssessment.caloricHarvestMultiplier - 1) * 100)}% Environmental Bonus</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 font-light leading-relaxed">
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
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-6 md:p-8 animate-in fade-in overflow-y-auto overscroll-contain select-none"
          onClick={() => setInspectingImage(null)}
        >
          {/* Modal Sticky Header */}
          <div
            className="sticky top-0 z-20 flex items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-white/10 bg-black/85 backdrop-blur-md -mx-3 px-3 sm:mx-0 sm:px-0 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0 pr-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-mono text-cyan-300 font-bold uppercase truncate max-w-[120px] sm:max-w-none">
                {inspectingImage.mission}
              </span>
              <span className="text-slate-600 hidden xs:inline">·</span>
              <span className="text-[10px] sm:text-xs font-mono text-slate-300 truncate max-w-[140px] sm:max-w-none">
                {inspectingImage.instrument}
              </span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="text-[10px] sm:text-xs font-mono text-slate-400 hidden sm:inline">
                {inspectingImage.solOrDate}
              </span>
            </div>

            <button
              onClick={() => setInspectingImage(null)}
              className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all cursor-pointer flex-shrink-0 shadow-sm"
              title="Close NASA Image Inspector"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Modal Central Image Display */}
          <div
            className="flex-1 flex items-center justify-center p-1 sm:p-4 md:p-6 my-auto min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-w-full max-h-full flex items-center justify-center">
              <img
                src={inspectingImage.imageUrl}
                alt={inspectingImage.title}
                className="max-h-[50vh] sm:max-h-[64vh] md:max-h-[72vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/15"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (inspectingImage.fallbackUrl && target.src !== inspectingImage.fallbackUrl) {
                    target.src = inspectingImage.fallbackUrl;
                  } else {
                    target.src = '/textures/mars_realistic.jpg';
                  }
                }}
              />
              {inspectingImage.isPanorama && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/20 text-[9px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                  360° Panorama
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Dossier */}
          <div
            className="max-w-4xl mx-auto w-full text-center space-y-1 sm:space-y-1.5 pt-2.5 sm:pt-3 border-t border-white/10 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xs sm:text-base md:text-lg font-bold font-display text-white px-2">
              {inspectingImage.title}
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-300 max-w-2xl mx-auto font-light leading-relaxed px-2 line-clamp-3 sm:line-clamp-none">
              {inspectingImage.description}
            </p>
            <div className="flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-mono text-slate-400 pt-0.5 flex-wrap">
              <span>Credit: {inspectingImage.credit}</span>
              <span className="text-slate-600">·</span>
              <span className="text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                NASA Planetary Data System (PDS)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
