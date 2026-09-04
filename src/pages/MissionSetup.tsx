import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, LayoutGrid, Droplets, Zap, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Slider } from '../components/ui/Slider';
import { useMission } from '../context/MissionContext';

export const MissionSetup: React.FC = () => {
  const navigate = useNavigate();
  const { config, updateConfig, selectedLocation, resourceProjection } = useMission();

  const durationOptions: (30 | 90 | 180 | 365 | 500)[] = [30, 90, 180, 365, 500];

  const totalCalorieDemandMissionKcal = config.crewSize * 2500 * config.missionDays;
  const totalWaterRequirementMinL = Math.round(config.crewSize * 2.5 * config.missionDays + (config.farmAreaM2 * 8));

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* Title Header - Compacted */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-0.5">
            <Users className="w-3.5 h-3.5" />
            <span className="font-semibold">Mission Step 02 / 05</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
            Configure Colony Life Support
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Define astronaut crew population, mission duration, greenhouse footprint, and initial resource payload.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => navigate('/mission/location')} icon={<ArrowLeft className="w-3.5 h-3.5" />} className="py-1.5 px-3 text-xs">
            Back
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/mission/crops')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
            className="py-1.5 px-4 text-xs"
          >
            Continue to Crops
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-7 space-y-6">
          <Card variant="dark" className="space-y-6">
            {/* 1. Crew Size Slider */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
                  Astronaut Crew Population
                </h3>
              </div>
              <Slider
                label="Active Crew Members"
                min={1}
                max={12}
                value={config.crewSize}
                unit="Astronauts"
                subtext="Standard active astronaut diet = 2,500 kcal/day + 75g protein/day"
                onChange={(val) => updateConfig({ crewSize: val })}
              />
            </div>

            {/* 2. Mission Duration Selector */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
                  Mission Duration (Martian Sols / Days)
                </h3>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {durationOptions.map((days) => {
                  const isSelected = config.missionDays === days;
                  return (
                    <button
                      key={days}
                      onClick={() => updateConfig({ missionDays: days })}
                      className={`
                        py-2.5 px-2 rounded-lg border text-xs font-mono transition-all text-center
                        ${isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                          : 'bg-space-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'}
                      `}
                    >
                      {days} Sols
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Farm Area Footprint */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <LayoutGrid className="w-4 h-4 text-bio-400" />
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
                  Greenhouse Bio-Dome Area
                </h3>
              </div>
              <Slider
                label="Total Agricultural Cultivation Area"
                min={25}
                max={500}
                step={25}
                value={config.farmAreaM2}
                unit="m²"
                subtext="Recommendation: ~16–20 m² per astronaut for 100% caloric self-sufficiency"
                onChange={(val) => updateConfig({ farmAreaM2: val })}
              />
            </div>

            {/* 4. Water Reserve */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
                  Initial Water Reserves Payload
                </h3>
              </div>
              <Slider
                label="Storage Tank Capacity"
                min={1000}
                max={20000}
                step={500}
                value={config.waterReserveLiters}
                unit="Liters"
                subtext="Buffer for closed-loop aeroponic misting and life-support humidity losses"
                onChange={(val) => updateConfig({ waterReserveLiters: val })}
              />
            </div>

            {/* 5. Daily Energy Budget */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-100">
                  Baseline Daily Energy Allocation
                </h3>
              </div>
              <Slider
                label="Photovoltaic & Kilopower Energy"
                min={20}
                max={200}
                step={5}
                value={config.dailyEnergyBudgetKwh}
                unit="kWh / Sol"
                subtext="Powers LED PAR lighting strips, water pumps, and subzero thermal heating coils"
                onChange={(val) => updateConfig({ dailyEnergyBudgetKwh: val })}
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Real-Time Calculated Mission Requirements Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="hud-panel rounded-2xl p-6 border-cyan-500/30 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">PROJECTED DEMAND</span>
                <h3 className="text-xl font-bold font-display text-white">Mission Consumption Profile</h3>
              </div>
              <ShieldCheck className="w-6 h-6 text-bio-400" />
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex justify-between items-center p-3 rounded bg-space-950/70 border border-slate-800">
                <span className="text-slate-400">Daily Calorie Demand:</span>
                <span className="text-cyan-300 font-bold text-sm">
                  {(config.crewSize * 2500).toLocaleString()} kcal / day
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded bg-space-950/70 border border-slate-800">
                <span className="text-slate-400">Total Mission Calorie Demand:</span>
                <span className="text-slate-200 font-bold text-sm">
                  {totalCalorieDemandMissionKcal.toLocaleString()} kcal
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded bg-space-950/70 border border-slate-800">
                <span className="text-slate-400">Selected Landing Site:</span>
                <span className="text-amber-400 font-bold">{selectedLocation.name}</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded bg-space-950/70 border border-slate-800">
                <span className="text-slate-400">Area per Crew Member:</span>
                <span className="text-bio-400 font-bold">
                  {(config.farmAreaM2 / config.crewSize).toFixed(1)} m² / astronaut
                </span>
              </div>
            </div>

            {/* Feasibility Advisory Box */}
            <div className="p-4 rounded-xl bg-space-950/90 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase font-display">
                <AlertCircle className="w-4 h-4 text-cyan-400" />
                <span>Astrobotanist Assessment</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {config.farmAreaM2 / config.crewSize >= 16 ? (
                  <span className="text-bio-400">
                    ✅ Your {config.farmAreaM2}m² greenhouse provides ample space ({(config.farmAreaM2 / config.crewSize).toFixed(1)}m²/person) to reach 100%+ calorie self-sufficiency with a balanced crop strategy.
                  </span>
                ) : (
                  <span className="text-amber-400">
                    ⚠️ Your greenhouse area ({(config.farmAreaM2 / config.crewSize).toFixed(1)}m²/person) is tight for {config.crewSize} astronauts. You will need high-density staple crops like Potatoes and Wheat.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
