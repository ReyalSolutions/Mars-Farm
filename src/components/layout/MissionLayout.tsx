import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { MapPin, Users, Sprout, LayoutGrid, Activity, ChevronRight } from 'lucide-react';
import { useMission } from '../../context/MissionContext';

export const MissionLayout: React.FC = () => {
  const location = useLocation();
  const { config, selectedLocation, suitability, resourceProjection } = useMission();

  const steps = [
    { to: '/mission/location', label: '1. Location', icon: <MapPin className="w-3.5 h-3.5" /> },
    { to: '/mission/setup', label: '2. Setup', icon: <Users className="w-3.5 h-3.5" /> },
    { to: '/mission/crops', label: '3. Crops', icon: <Sprout className="w-3.5 h-3.5" /> },
    { to: '/mission/farm', label: '4. Farm Builder', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { to: '/mission/simulation', label: '5. Simulation', icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Top HUD Telemetry Ribbon - Compacted */}
      <div className="w-full bg-space-900/95 border-b border-slate-800/80 px-4 py-1.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4 text-xs font-mono">
          {/* Stepper Wizard */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
            {steps.map((step, idx) => {
              const isActive = location.pathname === step.to;
              return (
                <React.Fragment key={step.to}>
                  <NavLink
                    to={step.to}
                    className={`
                      flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] tracking-wider transition-all whitespace-nowrap
                      ${isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-semibold shadow-[0_0_8px_rgba(0,240,255,0.25)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-space-800/60'}
                    `}
                  >
                    {step.icon}
                    <span>{step.label}</span>
                  </NavLink>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-slate-500 shrink-0 hidden sm:block" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Realtime Telemetry Pills - Compacted */}
          <div className="hidden md:flex items-center gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-space-950/90 border border-slate-800">
              <span className="text-slate-400">SITE:</span>
              <span className="text-cyan-300 font-bold">{selectedLocation.name}</span>
              <span className="text-[10px] px-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 leading-tight">
                {suitability.overallScore}/100
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-space-950/90 border border-slate-800">
              <span className="text-slate-400">CREW:</span>
              <span className="text-slate-200 font-bold">{config.crewSize}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">DAYS:</span>
              <span className="text-slate-200 font-bold">{config.missionDays}d</span>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-space-950/90 border border-slate-800">
              <span className="text-slate-400">CALORIE PROJ:</span>
              <span className={`font-bold ${resourceProjection.projectedCaloricCoveragePercent >= 100 ? 'text-bio-400' : 'text-amber-400'}`}>
                {resourceProjection.projectedCaloricCoveragePercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Wizard Page Outlet - Compacted Vertical Padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <Outlet />
      </main>
    </div>
  );
};
