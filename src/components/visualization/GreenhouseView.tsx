import React, { useState } from 'react';
import { CropAllocation } from '../../types';
import { CROPS_DATA } from '../../data/cropsData';
import {
  Sun, Droplets, Zap, ShieldCheck, Sparkles, Wind, Gauge, Layers, Eye,
  Sliders, Flame, Activity, X, ChevronRight, CheckCircle2, AlertCircle, RefreshCw, AlertTriangle
} from 'lucide-react';
import { Greenhouse3DScene } from './Greenhouse3DScene';
import { useAudio } from '../../context/AudioContext';

interface GreenhouseViewProps {
  allocations: CropAllocation[];
  totalFarmAreaM2: number;
  cropGrowthProgress?: Record<string, number>;
  cropHealthStatus?: Record<string, number>;
  activeEventTitle?: string;
  solDay?: number;
  onEmergencyHarvest?: (cropId: string) => void;
  onOpenHazardDirectives?: () => void;
  className?: string;
}

export type LedSpectrumMode = 'VEGGIE_MAGENTA' | 'INSPECTION_WHITE' | 'LOW_POWER_AMBER';
export type ViewportMode = '3D_CHAMBER' | 'TRAY_GRID';

export const GreenhouseView: React.FC<GreenhouseViewProps> = ({
  allocations,
  totalFarmAreaM2,
  cropGrowthProgress = {},
  cropHealthStatus = {},
  activeEventTitle,
  solDay = 1,
  onEmergencyHarvest,
  onOpenHazardDirectives,
  className = ''
}) => {
  const { playClick, playHarvestChime, playDayTick } = useAudio();

  const [viewMode, setViewMode] = useState<ViewportMode>('3D_CHAMBER');
  const [ledMode, setLedMode] = useState<LedSpectrumMode>('VEGGIE_MAGENTA');
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);

  // Live Interactive Overrides
  const [mistActive, setMistActive] = useState<boolean>(false);
  const [co2Boosted, setCo2Boosted] = useState<boolean>(false);
  const [heaterOverdrive, setHeaterOverdrive] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Atmospheric simulation derived from REMS Curiosity diurnal metrics
  const isMartianDay = (solDay % 2 === 0);
  const ambientTempC = heaterOverdrive ? 23 : isMartianDay ? 20 : 16;
  const solarFluxWm2 = isMartianDay ? 585 : 0;
  const opticalDepthTau = activeEventTitle?.toLowerCase().includes('dust') ? 3.4 : 0.45;

  // Trigger manual aeroponic mist burst
  const handleTriggerMist = () => {
    playClick();
    setMistActive(true);
    setActionFeedback('💨 Ultrasonic Aeroponic Mist Injected · Root hydration +15%');
    setTimeout(() => {
      setMistActive(false);
      setActionFeedback(null);
    }, 4000);
  };

  // Trigger CO2 enrichment pulse
  const handleToggleCo2 = () => {
    playClick();
    setCo2Boosted(prev => !prev);
    setActionFeedback(!co2Boosted ? '🌬 CO₂ Enriched to 1,200 ppm · Photosynthesis accelerated +8%' : 'CO₂ purged to nominal 800 ppm');
    setTimeout(() => setActionFeedback(null), 3500);
  };

  // Trigger Thermal Heater Overdrive
  const handleToggleHeater = () => {
    playClick();
    setHeaterOverdrive(prev => !prev);
    setActionFeedback(!heaterOverdrive ? '🌡 Thermal Radiator Overdrive ON · Habitat stabilized at 23°C' : 'Thermal loop returned to auto mode');
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleHarvestClick = (cropId: string) => {
    playHarvestChime();
    if (onEmergencyHarvest) {
      onEmergencyHarvest(cropId);
    }
    const cropName = CROPS_DATA.find(c => c.id === cropId)?.name || cropId;
    setActionFeedback(`🌾 Fresh ${cropName} harvested into colony food reserves!`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const selectedCrop = CROPS_DATA.find(c => c.id === selectedCropId);
  const selectedGrowth = selectedCropId ? (cropGrowthProgress[selectedCropId] || 0) : 0;
  const selectedHealth = selectedCropId ? (cropHealthStatus[selectedCropId] !== undefined ? cropHealthStatus[selectedCropId] : 100) : 100;
  const selectedAlloc = selectedCropId ? allocations.find(a => a.cropId === selectedCropId) : null;

  // Spectrum lighting styling
  const spectrumGlowClass = {
    VEGGIE_MAGENTA: 'from-fuchsia-950/40 via-purple-950/20 to-space-950 border-purple-500/30 text-purple-300',
    INSPECTION_WHITE: 'from-slate-800/40 via-cyan-950/20 to-space-950 border-cyan-500/30 text-cyan-300',
    LOW_POWER_AMBER: 'from-amber-950/40 via-orange-950/20 to-space-950 border-amber-500/30 text-amber-300'
  }[ledMode];

  return (
    <div className={`hud-panel-bio rounded-2xl border p-4 sm:p-5 relative overflow-hidden bg-gradient-to-b ${spectrumGlowClass} ${className}`}>
      {/* Background Aeroponic Mist Ambient Vapor Animation */}
      {mistActive && (
        <div className="absolute inset-0 pointer-events-none z-20 bg-cyan-400/10 backdrop-blur-[1px] animate-pulse transition-opacity duration-700" />
      )}

      {/* Action Feedback Notification Banner */}
      {actionFeedback && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-space-950 border border-bio-400 text-bio-300 text-xs font-mono font-bold shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Top Greenhouse HUD header & Environmental Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-bio-500/20 mb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-bio-950/80 border border-bio-500/50 text-bio-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <span className="text-xl">🌱</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100 flex items-center gap-2">
                BIO-REGENERATIVE GREENHOUSE CHAMBER 01
              </h4>
              <span className="w-2 h-2 rounded-full bg-bio-400 animate-ping" />
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-bio-950/80 border border-bio-500/40 text-bio-300">
                ECLSS Closed-Loop
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>ATM: {co2Boosted ? '1,200 ppm CO₂ (Enriched)' : '800 ppm CO₂'}</span>
              <span>·</span>
              <span className="text-cyan-300">{ambientTempC}°C Habitat</span>
              <span>·</span>
              <span>Pressure: 60.5 kPa</span>
            </p>
          </div>
        </div>

        {/* View Mode & LED Spectrum Controls */}
        <div className="flex items-center gap-2.5 flex-wrap text-xs font-mono">
          {/* Viewport Mode Switcher */}
          <div className="flex items-center bg-space-950 border border-cyan-500/40 rounded-lg p-0.5 text-[11px]">
            <button
              onClick={() => { playClick(); setViewMode('3D_CHAMBER'); }}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === '3D_CHAMBER'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🌐 3D Biosphere</span>
            </button>
            <button
              onClick={() => { playClick(); setViewMode('TRAY_GRID'); }}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'TRAY_GRID'
                  ? 'bg-bio-500/20 text-bio-300 font-bold border border-bio-400/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>📊 Grow Beds</span>
            </button>
          </div>

          {/* LED Spectrum Mode Switcher */}
          <div className="flex items-center bg-space-950/90 border border-slate-800 rounded-lg p-0.5 text-[10px]">
            <button
              onClick={() => { playClick(); setLedMode('VEGGIE_MAGENTA'); }}
              className={`px-2 py-1 rounded transition-all ${ledMode === 'VEGGIE_MAGENTA' ? 'bg-purple-900/60 text-purple-300 font-bold border border-purple-500/50 shadow-[0_0_8px_rgba(217,70,239,0.4)]' : 'text-slate-400 hover:text-slate-200'}`}
              title="NASA Veggie 660nm Deep Red + 450nm Royal Blue Spectrum"
            >
              🟣 NASA Veggie
            </button>
            <button
              onClick={() => { playClick(); setLedMode('INSPECTION_WHITE'); }}
              className={`px-2 py-1 rounded transition-all ${ledMode === 'INSPECTION_WHITE' ? 'bg-cyan-900/60 text-cyan-300 font-bold border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-slate-200'}`}
              title="5000K Full Spectrum Crew Inspection Light"
            >
              ⚪ White
            </button>
            <button
              onClick={() => { playClick(); setLedMode('LOW_POWER_AMBER'); }}
              className={`px-2 py-1 rounded transition-all ${ledMode === 'LOW_POWER_AMBER' ? 'bg-amber-900/60 text-amber-300 font-bold border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'text-slate-400 hover:text-slate-200'}`}
              title="Low Draw Emergency Lighting"
            >
              🟡 Low Power
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Commander Life-Support Override Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 p-2 rounded-xl bg-space-950/80 border border-slate-800 text-xs font-mono relative z-10">
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-slate-200">MANUAL OVERRIDES:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Misting Pulse Button */}
          <button
            onClick={handleTriggerMist}
            disabled={mistActive}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 text-[11px] transition-all shadow-sm ${
              mistActive
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                : 'bg-space-900 border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/80 hover:border-cyan-400'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>{mistActive ? 'Misting Active...' : 'Pulse Mist'}</span>
          </button>

          {/* CO2 Enrichment Button */}
          <button
            onClick={handleToggleCo2}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 text-[11px] transition-all shadow-sm ${
              co2Boosted
                ? 'bg-bio-500 text-slate-950 font-bold border-bio-400'
                : 'bg-space-900 border-bio-500/40 text-bio-300 hover:bg-bio-950/80 hover:border-bio-400'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-bio-400" />
            <span>{co2Boosted ? 'CO₂ 1,200 ppm [ON]' : 'Inject CO₂'}</span>
          </button>

          {/* Thermal Heater Overdrive Button */}
          <button
            onClick={handleToggleHeater}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 text-[11px] transition-all shadow-sm ${
              heaterOverdrive
                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                : 'bg-space-900 border-amber-500/40 text-amber-300 hover:bg-amber-950/80 hover:border-amber-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{heaterOverdrive ? 'Heater 23°C [ON]' : 'Heater Boost'}</span>
          </button>
        </div>
      </div>

      {/* Main Viewport: Either 3D Interactive Three.js Biosphere OR 2D Isometric Trays */}
      {viewMode === '3D_CHAMBER' ? (
        <div className="h-[360px] w-full rounded-2xl overflow-hidden relative shadow-2xl border border-cyan-500/30">
          {/* Active Environmental Hazard Overlay Banner */}
          {activeEventTitle && (
            <div className="absolute top-2.5 left-2.5 right-2.5 z-20 pointer-events-auto p-2 sm:p-3 rounded-xl bg-space-950/90 border border-amber-500/80 backdrop-blur-md shadow-[0_0_25px_rgba(245,158,11,0.35)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-amber-950/90 border border-amber-500 text-amber-400 shrink-0 animate-pulse">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      MRO ORBITAL ALERT
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500/50 text-amber-300">
                      τ Optical Depth: {opticalDepthTau}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-950/80 border border-red-500/50 text-red-300">
                      Solar Irradiance: -65%
                    </span>
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-100 truncate mt-0.5">
                    {activeEventTitle}
                  </p>
                </div>
              </div>

              {onOpenHazardDirectives && (
                <button
                  onClick={() => {
                    playClick();
                    onOpenHazardDirectives();
                  }}
                  className="shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-amber-500 hover:bg-amber-400 text-space-950 transition-all shadow-[0_0_12px_rgba(245,158,11,0.4)] flex items-center gap-1.5"
                >
                  <span>COMMAND DIRECTIVES</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <Greenhouse3DScene
            allocations={allocations}
            cropGrowthProgress={cropGrowthProgress}
            cropHealthStatus={cropHealthStatus}
            activeEventTitle={activeEventTitle}
            solDay={solDay}
            ledMode={ledMode}
            mistActive={mistActive}
            selectedCropId={selectedCropId}
            onSelectCrop={(cropId) => {
              playClick();
              setSelectedCropId(cropId);
            }}
            onResetCrop={() => {
              playClick();
              setSelectedCropId(null);
            }}
            className="h-full w-full"
          />
        </div>
      ) : (
        /* 2D Isometric Grow Beds Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10">
          {CROPS_DATA.map((crop) => {
            const alloc = allocations.find(a => a.cropId === crop.id);
            const allocatedArea = alloc?.areaM2 || 0;
            const growth = cropGrowthProgress[crop.id] || 0;
            const health = cropHealthStatus[crop.id] !== undefined ? cropHealthStatus[crop.id] : 100;
            const isCultivated = allocatedArea > 0;
            const isHarvestReady = growth >= 99.5;
            const isSelected = selectedCropId === crop.id;

            let stageLabel = 'Dormant';
            let stageIcon = '🫘';
            if (isCultivated) {
              if (growth < 25) {
                stageLabel = 'Germination';
                stageIcon = '🌱';
              } else if (growth < 65) {
                stageLabel = 'Vegetative';
                stageIcon = '🌿';
              } else if (growth < 99.5) {
                stageLabel = 'Fruiting/Tuber';
                stageIcon = crop.emoji;
              } else {
                stageLabel = 'Harvest Ready!';
                stageIcon = '✨';
              }
            }

            return (
              <div
                key={crop.id}
                onClick={() => setSelectedCropId(crop.id)}
                className={`
                  relative rounded-xl border p-3 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden
                  ${isCultivated ? 'bg-space-900/90' : 'bg-space-950/50 border-slate-800/80 opacity-50'}
                  ${isSelected ? 'border-cyan-400 ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-slate-800 hover:border-slate-700'}
                  ${isHarvestReady ? 'ring-2 ring-bio-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : ''}
                `}
              >
                {/* Harvest Ready or Mist Badge */}
                {isCultivated && (
                  <div className="absolute top-1 right-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-[8px] font-mono text-cyan-300">AERO</span>
                  </div>
                )}

                {/* Tray Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="relative">
                    <span className="text-2xl filter drop-shadow-md">{stageIcon}</span>
                    {isHarvestReady && (
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300 absolute -top-1 -right-1 animate-spin" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-space-950 border border-slate-800 text-slate-300 font-bold">
                    {allocatedArea} m²
                  </span>
                </div>

                {/* Crop Name & Stage */}
                <div>
                  <p className="text-xs font-display font-bold text-slate-200 truncate">{crop.name}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-0.5">
                    <span className={isHarvestReady ? 'text-bio-300 font-bold' : 'text-slate-400'}>
                      {stageLabel}
                    </span>
                    <span>{crop.growthDays}d sol</span>
                  </div>
                </div>

                {/* Growth Progress Bar */}
                <div className="mt-2.5 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Maturity</span>
                    <span className={`font-bold ${isHarvestReady ? 'text-bio-300' : 'text-cyan-300'}`}>
                      {Math.round(growth)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-space-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isHarvestReady
                          ? 'bg-gradient-to-r from-yellow-400 to-bio-400'
                          : 'bg-gradient-to-r from-cyan-500 to-bio-400'
                      }`}
                      style={{ width: `${Math.min(100, growth)}%` }}
                    />
                  </div>
                </div>

                {/* Quick Action: Harvest Button if ready */}
                {growth >= 80 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHarvestClick(crop.id);
                    }}
                    className="mt-2 w-full py-1 rounded bg-bio-950 border border-bio-500/60 text-bio-300 hover:bg-bio-500 hover:text-slate-950 font-bold text-[10px] font-mono transition-colors shadow-sm"
                  >
                    🌾 Harvest Now
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Crop Interactive Bio-Telemetry Inspector Drawer */}
      {selectedCrop && (
        <div className="mt-4 p-4 rounded-xl bg-space-950/95 border border-cyan-500/40 animate-in fade-in slide-in-from-bottom-2 relative z-20">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-1.5 rounded-xl bg-space-900 border border-slate-800">{selectedCrop.emoji}</span>
              <div>
                <h5 className="text-sm font-bold font-display text-white flex items-center gap-2">
                  <span>{selectedCrop.name}</span>
                  <span className="text-xs text-slate-400 font-mono">({selectedCrop.scientificName})</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bio-950 border border-bio-500/40 text-bio-300">
                    Bed Area: {selectedAlloc?.areaM2 || 0} m²
                  </span>
                </h5>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Photosynthetic PAR Intake: <strong>820 µmol/m²·s</strong> · Harvest Cycle: <strong>{selectedCrop.growthDays} Sols</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedCropId(null)}
              className="p-1 rounded-lg hover:bg-space-900 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono mb-3">
            <div className="p-2.5 rounded-lg bg-space-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Stomatal Conductance</span>
              <span className="text-sm font-bold text-cyan-300">225 mmol/m²·s</span>
              <span className="text-[9px] text-slate-500 block">Gas exchange optimal</span>
            </div>

            <div className="p-2.5 rounded-lg bg-space-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Transpiration Rate</span>
              <span className="text-sm font-bold text-bio-300">2.4 L / m²·sol</span>
              <span className="text-[9px] text-slate-500 block">98% condensed to ECLSS</span>
            </div>

            <div className="p-2.5 rounded-lg bg-space-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Nutrient Solution EC / pH</span>
              <span className="text-sm font-bold text-yellow-300">1.8 mS/cm · pH 5.8</span>
              <span className="text-[9px] text-slate-500 block">NASA Veggie formulation</span>
            </div>

            <div className="p-2.5 rounded-lg bg-space-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Maturity Progress</span>
              <span className="text-sm font-bold text-slate-200">{Math.round(selectedGrowth)}%</span>
              <span className="text-[9px] text-slate-500 block">Vigor: {Math.round(selectedHealth)}%</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-slate-800/80">
            <span className="text-slate-400 text-[11px]">
              {selectedCrop.nutritionalHighlights.join(' · ')}
            </span>

            {selectedGrowth >= 75 && (
              <button
                onClick={() => handleHarvestClick(selectedCrop.id)}
                className="px-3 py-1 rounded bg-bio-500 text-slate-950 font-bold hover:bg-bio-400 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Early Harvest ({selectedAlloc?.areaM2 || 0} m²)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

