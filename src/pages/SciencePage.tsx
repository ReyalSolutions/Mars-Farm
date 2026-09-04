import React from 'react';
import { Database, ExternalLink, ShieldCheck, BookOpen, Layers, Satellite, Activity } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { NASA_DATASETS, NASA_ATTRIBUTION_STATEMENT } from '../data/nasaDataFallback';
import { useMission } from '../context/MissionContext';

export const SciencePage: React.FC = () => {
  const { nasaStatus } = useMission();
  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="text-center space-y-3 pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
          <Database className="w-4 h-4" />
          <span>DATA TRANSPARENCY & SCIENTIFIC METHODOLOGY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
          NASA Planetary Science & Agricultural Models
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-mono max-w-2xl mx-auto">
          {NASA_ATTRIBUTION_STATEMENT}
        </p>
      </div>

      {/* NASA Live Data Status Banner */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border ${
        nasaStatus.isLive
          ? 'bg-cyan-950/40 border-cyan-500/40'
          : 'bg-space-900/60 border-slate-700/60'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${
            nasaStatus.isLive
              ? 'bg-cyan-900/60 border-cyan-500/50 text-cyan-300'
              : 'bg-space-950 border-slate-700 text-slate-400'
          }`}>
            <Satellite className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                nasaStatus.isLive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'
              }`} />
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                nasaStatus.isLive ? 'text-cyan-300' : 'text-slate-400'
              }`}>
                {nasaStatus.dataSourceLabel}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              {nasaStatus.attribution}
            </p>
          </div>
        </div>
        {nasaStatus.lastSyncTimestamp && (
          <span className="text-[10px] font-mono text-slate-500 shrink-0">
            Synced: {nasaStatus.lastSyncTimestamp}
          </span>
        )}
      </div>

      {/* 1. Verified NASA Datasets & Instrument Records */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-display uppercase tracking-wider text-cyan-300 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span>Integrated NASA Instruments & Datasets</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {NASA_DATASETS.map((ds) => (
            <div key={ds.id} className="hud-panel rounded-2xl p-6 border-cyan-500/20 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold font-display text-white">{ds.name}</h3>
                    <p className="text-xs font-mono text-cyan-400">{ds.mission} · {ds.instrument}</p>
                  </div>
                  <a
                    href={ds.nasaDataPortalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-space-950 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {ds.scientificRelevance}
                </p>
              </div>

              {/* Sample Reading & Parameters */}
              <div className="space-y-2 pt-3 border-t border-slate-800/80">
                <div className="flex flex-wrap gap-1.5">
                  {ds.parametersProvided.map((param, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-950 border border-slate-800 text-slate-300">
                      {param}
                    </span>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-space-950/90 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                  {Object.entries(ds.sampleReading).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="capitalize text-slate-400">{k.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="text-cyan-300 font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Agricultural & Thermodynamic Mathematical Formulations */}
      <div className="hud-panel-bio rounded-2xl p-8 border-bio-500/30 space-y-6">
        <h2 className="text-lg font-bold font-display uppercase tracking-wider text-bio-300 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-bio-400" />
          <span>Agronomic Simulation Formulations</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-space-950 border border-slate-800 space-y-2">
            <h4 className="text-bio-400 font-bold uppercase">1. Daily Biomass Harvest</h4>
            <div className="p-2.5 rounded bg-space-900 text-cyan-300">
              Daily Harvest (kg) = (Area × Base Yield / Growth Days) × Health
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Reflects continuous rotational staggered planting cycles inside greenhouse trays.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-space-950 border border-slate-800 space-y-2">
            <h4 className="text-cyan-400 font-bold uppercase">2. Closed-Loop Water Recovery</h4>
            <div className="p-2.5 rounded bg-space-900 text-cyan-300">
              Net Water Drain = Crop Demand × (1 - ECLSS Efficiency)
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Base recovery is 92% (up to 97% with advanced closed-loop hydroponics modules).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-space-950 border border-slate-800 space-y-2">
            <h4 className="text-yellow-400 font-bold uppercase">3. Astronaut Nutrition Standard</h4>
            <div className="p-2.5 rounded bg-space-900 text-cyan-300">
              Crew Demand = Crew Size × 2,500 kcal/sol + 75g protein
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Based on NASA active astronaut metabolic expenditure guidelines for Mars gravity (0.38g).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
