import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, Sparkles, Compass, Sprout, Activity, Database, Trophy, Menu, X, Play } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useMission } from '../../context/MissionContext';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { soundEnabled, toggleSound } = useAudio();
  const { loadDemoMission, nasaStatus } = useMission();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Overview', icon: <Compass className="w-4 h-4" /> },
    { to: '/mission/location', label: 'Mission Planner', icon: <Sprout className="w-4 h-4" /> },
    { to: '/mission/simulation', label: 'Simulation', icon: <Activity className="w-4 h-4" /> },
    { to: '/science', label: 'NASA Science', icon: <Database className="w-4 h-4" /> },
    { to: '/leaderboard', label: 'Colony Log', icon: <Trophy className="w-4 h-4" /> },
  ];

  const handleStartDemo = () => {
    loadDemoMission();
    navigate('/mission/simulation');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-space-950/90 backdrop-blur-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-mars-500 via-mars-600 to-space-900 border border-mars-400/50 shadow-[0_0_12px_rgba(255,77,46,0.4)] group-hover:scale-105 transition-all">
            <span className="text-base">🌱</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200">
                MARS FARM
              </span>
              <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-mars-500/20 text-mars-300 border border-mars-500/40 leading-none">
                NASA 2026
              </span>
            </div>
            <p className="text-[9px] font-mono text-slate-400 hidden sm:block tracking-wide -mt-0.5">
              Autonomous Closed-Loop Agriculture
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider transition-all
                  ${isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.2)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-800/60'}
                `}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* NASA Live Status Pill */}
          <Link
            to="/science"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-space-900/80 border border-slate-700/60 text-[10px] font-mono text-slate-300 hover:border-cyan-500/40 transition-colors"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${nasaStatus.isLive ? 'bg-bio-400 shadow-[0_0_6px_#10B981]' : 'bg-cyan-400 shadow-[0_0_6px_#00F0FF]'}`} />
            <span>{nasaStatus.isLive ? 'NASA API: LIVE' : 'NASA ARCHIVE'}</span>
          </Link>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label="Toggle Sound"
            className="p-1.5 rounded-md border border-slate-800 bg-space-900/80 hover:bg-space-800 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {/* Demo Mode Trigger */}
          <Button
            variant="mars"
            size="sm"
            onClick={handleStartDemo}
            icon={<Sparkles className="w-3 h-3" />}
            className="hidden sm:inline-flex py-1 px-3 text-xs"
          >
            Judge Demo
          </Button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-md border border-slate-800 bg-space-900 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-cyan-500/20 bg-space-950 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-mono text-slate-300 hover:bg-space-800"
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
          <Button
            variant="mars"
            size="sm"
            onClick={() => {
              setMobileMenuOpen(false);
              handleStartDemo();
            }}
            icon={<Play className="w-4 h-4" />}
            className="w-full mt-2"
          >
            Launch Judge Demo
          </Button>
        </div>
      )}
    </header>
  );
};
