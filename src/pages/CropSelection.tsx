import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, ArrowRight, ArrowLeft, Flame, Droplets, Zap, Shield, Sparkles, Clock, Layers } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { CROPS_DATA } from '../data/cropsData';
import { Crop } from '../types';

export const CropSelection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCrop, setSelectedCrop] = useState<Crop>(CROPS_DATA[0]);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* Title Header - Compacted */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-bio-400 uppercase tracking-wider mb-0.5">
            <Sprout className="w-3.5 h-3.5" />
            <span className="font-semibold">Mission Step 03 / 05</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
            Martian Crop Cultivar Database
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Explore scientifically modeled space cultivars engineered for closed-loop aeroponics and high-radiation resilience.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => navigate('/mission/setup')} icon={<ArrowLeft className="w-3.5 h-3.5" />} className="py-1.5 px-3 text-xs">
            Back
          </Button>
          <Button
            variant="bio"
            size="sm"
            onClick={() => navigate('/mission/farm')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
            className="py-1.5 px-4 text-xs"
          >
            Continue to Farm
          </Button>
        </div>
      </div>

      {/* Main Grid: Crop Cards + Selected Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Grid of All 6 Crops */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CROPS_DATA.map((crop) => {
            const isSelected = crop.id === selectedCrop.id;
            return (
              <div
                key={crop.id}
                onClick={() => setSelectedCrop(crop)}
                className={`
                  p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between
                  ${isSelected
                    ? 'bg-space-900 border-bio-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                    : 'bg-space-950/80 border-slate-800 hover:border-slate-700 hover:bg-space-900/50'}
                `}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{crop.emoji}</span>
                    <Badge variant={isSelected ? 'bio' : 'neutral'} size="sm">
                      {crop.category}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold font-display text-slate-100">{crop.name}</h3>
                  <p className="text-[11px] font-mono text-slate-400 italic mt-0.5">{crop.scientificName}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="flex items-center gap-1 text-yellow-300">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{crop.caloriesPerKg} kcal/kg</span>
                  </div>
                  <div className="flex items-center gap-1 text-cyan-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{crop.growthDays}d cycle</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-300">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>{crop.waterPerKgLiters} L/kg H₂O</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-300">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{crop.baseYieldKgPerM2PerCycle} kg/m²</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: In-Depth Cultivar Biological Analysis */}
        <div className="lg:col-span-5 space-y-6">
          <div className="hud-panel-bio rounded-2xl p-6 border-bio-500/30 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-bio-500/20">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedCrop.emoji}</span>
                <div>
                  <h3 className="text-xl font-bold font-display text-white">{selectedCrop.name}</h3>
                  <p className="text-xs font-mono text-bio-400">{selectedCrop.scientificName}</p>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded bg-space-950 border border-bio-500/40 text-bio-300">
                {selectedCrop.category}
              </span>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-space-950 border border-slate-800">
                <span className="text-slate-400 block">Calorie Density:</span>
                <span className="text-base font-bold text-yellow-300">{selectedCrop.caloriesPerKg} kcal / kg</span>
              </div>
              <div className="p-3 rounded-lg bg-space-950 border border-slate-800">
                <span className="text-slate-400 block">Protein Content:</span>
                <span className="text-base font-bold text-bio-400">{selectedCrop.proteinGramsPerKg} g / kg</span>
              </div>
              <div className="p-3 rounded-lg bg-space-950 border border-slate-800">
                <span className="text-slate-400 block">Water Consumption:</span>
                <span className="text-base font-bold text-cyan-300">{selectedCrop.waterPerKgLiters} L / kg</span>
              </div>
              <div className="p-3 rounded-lg bg-space-950 border border-slate-800">
                <span className="text-slate-400 block">Lighting / Energy:</span>
                <span className="text-base font-bold text-amber-300">{selectedCrop.energyPerKgKwh} kWh / kg</span>
              </div>
            </div>

            {/* Tolerance Ratings */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono uppercase text-slate-300 font-bold">Space Adaptation Metrics:</h4>
              <ProgressBar
                label="Radiation Tolerance & DNA Stability"
                value={selectedCrop.radiationToleranceScore}
                variant="cyan"
              />
              <ProgressBar
                label="Bacterial / Pathogen Resilience"
                value={selectedCrop.resilienceScore}
                variant="bio"
              />
            </div>

            {/* Nutritional & Agronomic Highlights */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-xs font-mono uppercase text-bio-400 font-bold">Astrobotany Highlights:</h4>
              <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                {selectedCrop.nutritionalHighlights.map((hl, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-bio-400">🌱</span>
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
