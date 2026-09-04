import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Plus, Minus, ArrowRight, ArrowLeft, Bot, Sparkles, Droplets, Zap, Flame, ShieldAlert, Cpu } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { MetricCard } from '../components/ui/MetricCard';
import { GreenhouseView } from '../components/visualization/GreenhouseView';
import { AiFarmAdvisor } from '../components/ui/AiFarmAdvisor';
import { useMission } from '../context/MissionContext';
import { CROPS_DATA } from '../data/cropsData';

export const FarmBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { config, setCropAllocation, clearAllocations, resourceProjection, suitability } = useMission();

  const handleAdjustArea = (cropId: string, delta: number) => {
    const current = config.cropAllocations.find(a => a.cropId === cropId)?.areaM2 || 0;
    const newArea = Math.max(0, current + delta);
    
    // Check if total exceeds farm area
    const totalWithoutThis = config.cropAllocations
      .filter(a => a.cropId !== cropId)
      .reduce((sum, a) => sum + a.areaM2, 0);

    if (totalWithoutThis + newArea <= config.farmAreaM2) {
      setCropAllocation(cropId, newArea);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* Title Header - Compacted */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-bio-400 uppercase tracking-wider mb-0.5">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="font-semibold">Mission Step 04 / 05</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
            Greenhouse Crop Bed Allocation
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Allocate your {config.farmAreaM2}m² greenhouse area across crops. Live resource projection models yield, water drain, and calorie coverage.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => navigate('/mission/crops')} icon={<ArrowLeft className="w-3.5 h-3.5" />} className="py-1.5 px-3 text-xs">
            Back
          </Button>
          <Button
            variant="mars"
            size="sm"
            onClick={() => navigate('/mission/simulation')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
            className="py-1.5 px-4 text-xs"
          >
            Launch Simulation
          </Button>
        </div>
      </div>

      {/* Top 4 Live Projection Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Calorie Coverage"
          value={resourceProjection.projectedCaloricCoveragePercent}
          unit="%"
          subtext={`${resourceProjection.estimatedDailyCaloriesProducedKcal.toLocaleString()} / ${resourceProjection.crewDailyCaloricRequirementKcal.toLocaleString()} kcal/sol`}
          icon={<Flame className="w-5 h-5" />}
          colorScheme={resourceProjection.projectedCaloricCoveragePercent >= 100 ? 'bio' : 'amber'}
        />
        <MetricCard
          label="Farm Area Cultivated"
          value={resourceProjection.totalAllocatedAreaM2}
          unit={`/ ${config.farmAreaM2} m²`}
          subtext={`${resourceProjection.remainingAreaM2} m² unallocated space`}
          icon={<LayoutGrid className="w-5 h-5" />}
          colorScheme="cyan"
        />
        <MetricCard
          label="Net Water Drain"
          value={resourceProjection.netDailyWaterDrainL}
          unit="L / sol"
          subtext={`${resourceProjection.dailyWaterConsumptionL}L used · ${resourceProjection.dailyWaterRecycledL}L recycled`}
          icon={<Droplets className="w-5 h-5" />}
          colorScheme="cyan"
        />
        <MetricCard
          label="Net Daily Energy"
          value={resourceProjection.netDailyEnergyDeltaKwh > 0 ? `+${resourceProjection.netDailyEnergyDeltaKwh}` : resourceProjection.netDailyEnergyDeltaKwh}
          unit="kWh / sol"
          subtext={`${resourceProjection.dailyEnergyGeneratedKwh} kWh gen · ${resourceProjection.dailyEnergyConsumptionKwh} kWh load`}
          icon={<Zap className="w-5 h-5" />}
          colorScheme={resourceProjection.netDailyEnergyDeltaKwh >= 0 ? 'bio' : 'mars'}
        />
      </div>

      {/* Interactive Greenhouse Visualization Panel */}
      <GreenhouseView
        allocations={config.cropAllocations}
        totalFarmAreaM2={config.farmAreaM2}
      />

      {/* Bed Allocation Controls + Farmer AI Advisor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Crop Bed Allocation Sliders / Buttons */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-200">
              Crop Bed Allocation Controls
            </h3>
            <button
              onClick={clearAllocations}
              className="text-xs font-mono text-slate-400 hover:text-red-400 transition-colors"
            >
              Reset All Beds (0m²)
            </button>
          </div>

          <div className="space-y-3">
            {CROPS_DATA.map((crop) => {
              const currentAlloc = config.cropAllocations.find(a => a.cropId === crop.id)?.areaM2 || 0;
              const isAllocated = currentAlloc > 0;

              return (
                <div
                  key={crop.id}
                  className={`
                    hud-panel rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all
                    ${isAllocated ? 'border-bio-500/40 bg-space-900/90' : 'border-slate-800/80 bg-space-950/70'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{crop.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-sm text-slate-100">{crop.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({crop.category})</span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        {crop.caloriesPerKg} kcal/kg · {crop.growthDays}d cycle · {crop.waterPerKgLiters} L/kg
                      </p>
                    </div>
                  </div>

                  {/* Allocation Stepper */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="flex items-center gap-2 bg-space-950 border border-slate-800 rounded-lg p-1">
                      <button
                        onClick={() => handleAdjustArea(crop.id, -5)}
                        disabled={currentAlloc <= 0}
                        className="p-1.5 rounded bg-space-900 hover:bg-space-800 disabled:opacity-30 text-slate-300 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-16 text-center font-mono font-bold text-sm text-cyan-300">
                        {currentAlloc} m²
                      </span>
                      <button
                        onClick={() => handleAdjustArea(crop.id, +5)}
                        disabled={resourceProjection.remainingAreaM2 < 5}
                        className="p-1.5 rounded bg-space-900 hover:bg-space-800 disabled:opacity-30 text-slate-300 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-20 text-right">
                      <span className="text-xs font-mono text-bio-400 font-bold block">
                        {((currentAlloc * crop.baseYieldKgPerM2PerCycle / crop.growthDays) * crop.caloriesPerKg).toFixed(0)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block">kcal / sol</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Persistent Farmer AI Advisor Assistant */}
        <div className="lg:col-span-5 space-y-6">
          <AiFarmAdvisor
            contextNote="Live telemetry connected. Ask for crop bed allocation or water strategy."
            defaultOpen={true}
          />
        </div>
      </div>
    </div>
  );
};
