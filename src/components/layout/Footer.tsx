import React from 'react';
import { Link } from 'react-router-dom';
import { NASA_ATTRIBUTION_STATEMENT } from '../../data/nasaDataFallback';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-space-950/90 text-slate-400 text-xs font-mono py-8 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🌱</span>
            <span className="font-display font-bold text-slate-200 tracking-wider">MARS FARM SIMULATION</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
            {NASA_ATTRIBUTION_STATEMENT}
          </p>
        </div>

        <div>
          <h4 className="text-slate-200 font-semibold uppercase tracking-wider mb-3 text-xs">Mission Stages</h4>
          <ul className="space-y-2">
            <li><Link to="/mission/location" className="hover:text-cyan-400 transition-colors">1. Landing Site Selection</Link></li>
            <li><Link to="/mission/setup" className="hover:text-cyan-400 transition-colors">2. Life Support Setup</Link></li>
            <li><Link to="/mission/crops" className="hover:text-cyan-400 transition-colors">3. Crop Cultivar Catalog</Link></li>
            <li><Link to="/mission/farm" className="hover:text-cyan-400 transition-colors">4. Greenhouse Builder</Link></li>
            <li><Link to="/mission/simulation" className="hover:text-cyan-400 transition-colors">5. Telemetry Simulation</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-200 font-semibold uppercase tracking-wider mb-3 text-xs">NASA Challenge</h4>
          <ul className="space-y-2">
            <li><Link to="/science" className="hover:text-cyan-400 transition-colors">Scientific Methodology</Link></li>
            <li><Link to="/leaderboard" className="hover:text-cyan-400 transition-colors">Colony Leaderboard</Link></li>
            <li><a href="https://www.spaceappschallenge.org/" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">NASA Space Apps 2026 ↗</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-400">
        <div>
          © 2026 MARS FARM Project. Designed for NASA Space Apps Challenge.
        </div>
        <div className="flex items-center gap-4">
          <span>Zero-carbon simulated food production</span>
          <span className="w-1.5 h-1.5 rounded-full bg-bio-400" />
          <span>Closed-loop aeroponics</span>
        </div>
      </div>
    </footer>
  );
};
