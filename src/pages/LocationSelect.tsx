import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Thermometer, Sun, Droplets, Shield, Wind, Mountain, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { MarsGlobe } from '../components/visualization/MarsGlobe';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { useMission } from '../context/MissionContext';
import { MARS_LOCATIONS } from '../data/marsLocations';

export const LocationSelect: React.FC = () => {
  const navigate = useNavigate();
  const { config, selectedLocation, suitability, setLocation } = useMission();
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* Page Title Header - Compacted */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-0.5">
            <MapPin className="w-3.5 h-3.5" />
            <span className="font-semibold">Mission Step 01 / 05</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
            Select Martian Landing Site
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Where you build dictates solar irradiance, subsurface ice availability, and radiation shielding.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/mission/setup')}
          icon={<ArrowRight className="w-3.5 h-3.5" />}
          iconPosition="right"
          className="py-1.5 px-4 text-xs shrink-0"
        >
          Confirm Site & Setup Crew
        </Button>
      </div>

      {/* Main Grid: 3D Globe + Location Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive 3D Mars Globe Viewport */}
        <div className="lg:col-span-6 space-y-4">
          <div className="hud-panel rounded-2xl p-4 relative min-h-[440px] flex flex-col justify-between overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.6)]">
            <div className="flex justify-between items-center z-10">
              <span className="text-xs font-mono text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                NASA MARS ORBITAL SURVEY
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                ACTIVE SITE: {selectedLocation.name}
              </span>
            </div>

            <div className="h-[360px] w-full flex items-center justify-center">
              <MarsGlobe
                selectedLocationId={config.selectedLocationId}
                onSelectLocation={(loc) => setLocation(loc.id)}
                className="h-full"
              />
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-2 z-10">
              <span>LAT: {selectedLocation.latitude}° | LON: {selectedLocation.longitude}°</span>
              <span>ELEV: {selectedLocation.elevationKm} km MOLA datum</span>
            </div>
          </div>

          {/* Location Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MARS_LOCATIONS.map((loc) => {
              const isSelected = loc.id === config.selectedLocationId;
              return (
                <div
                  key={loc.id}
                  onClick={() => setLocation(loc.id)}
                  className={`
                    p-3.5 rounded-xl border cursor-pointer transition-all duration-200 text-left flex flex-col justify-between
                    ${isSelected
                      ? 'bg-space-900 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                      : 'bg-space-950/80 border-slate-800 hover:border-slate-700 hover:bg-space-900/60'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-display font-bold text-slate-100">{loc.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{loc.type} · {loc.elevationKm} km</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Suitability:</span>
                    <span className={`font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                      {loc.solarPotentialScore}% Solar | {loc.waterIcePotential} H₂O
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Location Environmental Analysis & Suitability Score */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Suitability Score Banner */}
          <div className="hud-panel rounded-2xl p-6 border-cyan-500/30 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">MARS FARM SIMULATION SCORE</span>
                <h3 className="text-xl font-bold font-display text-white mt-0.5">{selectedLocation.name}</h3>
                <p className="text-xs font-mono text-cyan-400">{suitability.ratingTier}</p>
              </div>

              {/* Huge Circular Metric */}
              <div className="flex items-center gap-3 bg-space-950/80 border border-cyan-500/40 rounded-xl px-5 py-3 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                <div className="text-center">
                  <span className="text-3xl sm:text-4xl font-extrabold font-display text-cyan-300">
                    {suitability.overallScore}
                  </span>
                  <span className="text-xs font-mono text-slate-400 block">/ 100</span>
                </div>
              </div>
            </div>

            {/* Description & Advantages */}
            <p className="text-xs text-slate-300 leading-relaxed py-3">
              {selectedLocation.description}
            </p>

            <div className="space-y-1.5 text-xs font-mono text-slate-300">
              <p className="text-[11px] text-bio-400 font-bold uppercase">Site Key Advantages:</p>
              {selectedLocation.advantages.map((adv, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                  <span className="text-bio-400">✓</span>
                  <span>{adv}</span>
                </div>
              ))}
            </div>

            {/* "How is this calculated?" button */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
              <button
                onClick={() => setShowFormulaModal(true)}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 focus:outline-none"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How is this suitability calculated?</span>
              </button>
            </div>
          </div>

          {/* Environmental Factor Progress Bars */}
          <Card variant="dark" className="space-y-4">
            <h4 className="text-xs font-mono uppercase text-slate-300 font-semibold tracking-wider flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-mars-400" />
              <span>In-Situ Environmental Parameters</span>
            </h4>

            <div className="space-y-3.5">
              <ProgressBar
                label="Water / Glacial Ice Potential"
                value={suitability.water}
                variant="cyan"
                showValue={true}
              />
              <ProgressBar
                label="Thermal Profile (Subzero Tolerance)"
                value={suitability.temperature}
                variant="amber"
                showValue={true}
              />
              <ProgressBar
                label="Solar Irradiance (PAR Photons)"
                value={suitability.solar}
                variant="amber"
                showValue={true}
              />
              <ProgressBar
                label="Atmospheric Shielding & Foundation Terrain"
                value={suitability.terrain}
                variant="bio"
                showValue={true}
              />
              <ProgressBar
                label="Cosmic Radiation Safety Buffer"
                value={suitability.radiation}
                variant="cyan"
                showValue={true}
              />
              <ProgressBar
                label="Dust Storm Resilience"
                value={suitability.dust}
                variant="mars"
                showValue={true}
              />
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Source: {selectedLocation.sourceDataset}</span>
              <span className="text-cyan-400">{selectedLocation.sourceType}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Formula Transparency Modal */}
      <Modal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        title="Scientific Suitability Formula"
        subtitle="Transparent Multi-Factor Model Weights"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs font-mono leading-relaxed">
          <p className="text-slate-300">
            The **MARS FARM Suitability Index (0–100)** is calculated via deterministic weighted evaluation of in-situ NASA environmental measurements:
          </p>

          <div className="p-3.5 rounded-lg bg-space-950 border border-slate-800 space-y-1.5 text-cyan-300">
            <p><strong>Farm Suitability =</strong></p>
            <p className="pl-4">Water Potential × <strong>25%</strong> (Critical closed-loop requirement)</p>
            <p className="pl-4">Thermal Baseline × <strong>20%</strong> (Subzero electrical heating load)</p>
            <p className="pl-4">Solar Irradiance × <strong>15%</strong> (Photovoltaic & PAR grow lighting)</p>
            <p className="pl-4">Topography & Terrain × <strong>15%</strong> (Barometric pressure & foundation)</p>
            <p className="pl-4">Radiation Protection × <strong>15%</strong> (Cosmic ray crop DNA safety)</p>
            <p className="pl-4">Dust Storm Buffer × <strong>10%</strong> (Photovoltaic resilience)</p>
          </div>

          <p className="text-slate-400 text-[11px]">
            *Note: Planetary baseline conditions are informed by NASA MOLA, REMS, SHARAD, and RAD datasets. Agricultural suitability is a simulation output designed for the MARS FARM simulation project.
          </p>
        </div>
      </Modal>
    </div>
  );
};
