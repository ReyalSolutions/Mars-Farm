import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Trophy,
  Users,
  Calendar,
  MapPin,
  Sparkles,
  Sprout,
  ArrowRight,
  Database,
  Cloud,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Code,
  ChevronDown,
  ChevronUp,
  Droplets,
  Zap,
  Flame,
  ShieldAlert,
  Clock,
  Terminal,
  Activity,
  Filter,
  Layers,
  ArrowDownCircle,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { fetchLeaderboardPaginated, fetchMissionTelemetryLogs } from '../services/storageService';
import { DatabaseStatus } from '../services/supabaseClient';
import { LeaderboardEntry, MissionTelemetryLog } from '../types';

const PAGE_SIZE = 20;

export const LeaderboardPage: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    isConfigured: false,
    isLive: false,
    provider: 'LOCAL_STORAGE',
    label: 'LOCAL STORAGE PERSISTENCE'
  });
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showSetupHelp, setShowSetupHelp] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Telemetry Flight Recorder Modal States
  const [selectedMission, setSelectedMission] = useState<LeaderboardEntry | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<MissionTelemetryLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilter, setLogFilter] = useState<'ALL' | 'HARVEST' | 'ALERT' | 'ECLSS'>('ALL');

  // Load first 20 records
  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      const result = await fetchLeaderboardPaginated(0, PAGE_SIZE);
      setEntries(result.entries);
      setDbStatus(result.status);
      setHasMore(result.hasMore);
      setTotalCount(result.totalCount);
      setPage(0);
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Load next 20 records
  const loadMoreData = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      const result = await fetchLeaderboardPaginated(nextPage, PAGE_SIZE);
      if (result.entries.length > 0) {
        setEntries(prev => {
          const existingIds = new Set(prev.map(e => e.id));
          const newUnique = result.entries.filter(e => !existingIds.has(e.id));
          return [...prev, ...newUnique];
        });
        setPage(nextPage);
        setHasMore(result.hasMore);
        setTotalCount(result.totalCount);
      } else {
        setHasMore(false);
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Infinite Scroll Sentinel Observer
  const observerTarget = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || isLoadingMore || isInitialLoading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMoreData();
        }
      },
      { threshold: 0.1, rootMargin: '150px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, isInitialLoading, page]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleOpenTelemetryModal = async (entry: LeaderboardEntry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedMission(entry);
    setLogsLoading(true);
    setLogFilter('ALL');

    try {
      const logs = await fetchMissionTelemetryLogs(entry.id, entry.telemetryLogs);
      setTelemetryLogs(logs);
    } finally {
      setLogsLoading(false);
    }
  };

  const filteredLogs = telemetryLogs.filter(log => {
    if (logFilter === 'ALL') return true;
    return log.type === logFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-200 px-1 sm:px-0">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-yellow-400 uppercase tracking-wider mb-0.5">
            <Trophy className="w-3.5 h-3.5" />
            <span className="font-semibold">Colony Archives & Historical Telemetry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
            Martian Settlement Leaderboard
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-0.5">
            Real-time colony archives streamed from Supabase · 20 records per batch with automated infinite scroll.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadInitialData}
            disabled={isInitialLoading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isInitialLoading ? 'animate-spin' : ''}`} />}
            className="py-1.5 px-3 text-xs flex-1 sm:flex-initial"
          >
            Refresh
          </Button>
          <Link to="/mission/location" className="flex-1 sm:flex-initial">
            <Button variant="mars" size="sm" icon={<Sprout className="w-3.5 h-3.5" />} className="w-full py-1.5 px-3.5 text-xs">
              New Mission
            </Button>
          </Link>
        </div>
      </div>

      {/* Database Connection & Persistence Status Banner */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          dbStatus.isConfigured
            ? 'bg-space-950/80 border-bio-500/40 shadow-[0_0_20px_rgba(16,185,129,0.12)]'
            : 'bg-space-950/80 border-amber-500/30'
        }`}
      >
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
          <div
            className={`p-2 rounded-xl border shrink-0 ${
              dbStatus.isConfigured
                ? 'bg-bio-950/80 border-bio-500/50 text-bio-400'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
            }`}
          >
            {dbStatus.isConfigured ? <Cloud className="w-5 h-5" /> : <Database className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  dbStatus.isConfigured ? 'bg-bio-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span
                className={`text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider ${
                  dbStatus.isConfigured ? 'text-bio-300' : 'text-amber-300'
                }`}
              >
                {dbStatus.isConfigured ? 'DATABASE: SUPABASE CLOUD ACTIVE' : 'DATABASE: LOCAL STORAGE'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-900 border border-slate-700 text-slate-300 flex items-center gap-1">
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>Showing {entries.length} {totalCount > 0 ? `of ${totalCount}` : ''} missions</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] font-mono text-slate-400 mt-0.5">
              {dbStatus.isConfigured
                ? `Synchronized with Supabase Cloud · tables: mars_leaderboard, mars_mission_logs`
                : 'Local mode active. Configure Supabase in .env to enable multi-commander synchronization.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSetupHelp(!showSetupHelp)}
          className="text-[11px] sm:text-xs font-mono text-cyan-400 hover:text-cyan-300 underline shrink-0 self-end sm:self-center"
        >
          {showSetupHelp ? 'Hide SQL' : 'Supabase SQL Setup ↗'}
        </button>
      </div>

      {/* Supabase Schema Helper Box (Collapsible) */}
      {showSetupHelp && (
        <div className="hud-panel rounded-xl p-3 sm:p-4 border-cyan-500/30 text-xs font-mono space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between text-cyan-300 font-bold text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" />
              Supabase SQL Definitions (Telemetry Flight Logs & Leaderboard)
            </span>
            <span className="text-[10px] text-slate-400">Run in SQL Editor</span>
          </div>
          <pre className="bg-space-950 p-2.5 sm:p-3 rounded-lg border border-slate-800 text-[10px] sm:text-[11px] text-slate-200 overflow-x-auto leading-relaxed">
{`-- 1. Main Leaderboard Table with Telemetry Logs
create table if not exists mars_leaderboard (
  id text primary key,
  player_name text not null,
  score integer not null,
  crew_size integer not null,
  mission_days integer not null,
  days_survived integer default 0,
  mission_completed boolean default false,
  total_food_kg numeric default 0,
  water_recycled_l numeric default 0,
  total_energy_kwh numeric default 0,
  tier text default 'Mission Log',
  location_name text not null,
  food_coverage_percent numeric not null default 0,
  telemetry_logs jsonb default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Dedicated Mission Telemetry Flight Logs Table
create table if not exists mars_mission_logs (
  id bigserial primary key,
  mission_id text not null,
  sol integer not null,
  time text not null,
  log_type text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security
alter table mars_leaderboard enable row level security;
create policy "Allow public read" on mars_leaderboard for select using (true);
create policy "Allow public insert" on mars_leaderboard for insert with check (true);

alter table mars_mission_logs enable row level security;
create policy "Allow public read" on mars_mission_logs for select using (true);
create policy "Allow public insert" on mars_mission_logs for insert with check (true);`}
          </pre>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE VIEW (< md): HIGH-TECH RESPONSIVE CARDS                            */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-3">
        {entries.map((entry, idx) => {
          const isExpanded = expandedId === entry.id;
          const survived = entry.daysSurvived ?? entry.missionDays;
          const failed = entry.missionCompleted === false && survived < entry.missionDays;

          return (
            <div
              key={entry.id}
              className={`hud-panel rounded-2xl border p-3.5 space-y-3 transition-all ${
                idx === 0
                  ? 'border-yellow-500/50 bg-gradient-to-b from-yellow-950/20 to-space-950/90 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
                  : idx === 1
                  ? 'border-slate-400/40 bg-space-950/80'
                  : idx === 2
                  ? 'border-amber-600/40 bg-space-950/80'
                  : 'border-slate-800 hover:border-cyan-500/40 bg-space-950/80'
              }`}
            >
              {/* Card Top: Rank, Name, Score */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs font-display">
                    {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 font-mono truncate max-w-[190px]">
                      {entry.playerName}
                    </h3>
                    <span className="text-[9px] font-mono text-slate-400 block">{entry.timestamp}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-extrabold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-bio-400">
                    {entry.score}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 block">PTS</span>
                </div>
              </div>

              {/* Card Body: Key Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-space-900/60 border border-slate-800/80 space-y-0.5">
                  <span className="text-[9px] text-slate-400 uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-mars-400" />
                    Landing Site
                  </span>
                  <span className="text-slate-200 font-bold block truncate">{entry.locationName}</span>
                </div>

                <div className="p-2 rounded-lg bg-space-900/60 border border-slate-800/80 space-y-0.5">
                  <span className="text-[9px] text-slate-400 uppercase flex items-center gap-1">
                    <Users className="w-3 h-3 text-cyan-400" />
                    Crew
                  </span>
                  <span className="text-slate-200 font-bold block">{entry.crewSize} astronauts</span>
                </div>

                <div className="p-2 rounded-lg bg-space-900/60 border border-slate-800/80 space-y-0.5">
                  <span className="text-[9px] text-slate-400 uppercase flex items-center gap-1">
                    <Calendar className={`w-3 h-3 ${failed ? 'text-red-400' : 'text-slate-400'}`} />
                    Survival
                  </span>
                  <span className={`font-bold block ${failed ? 'text-red-400' : 'text-slate-200'}`}>
                    {survived} / {entry.missionDays} sols
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-space-900/60 border border-slate-800/80 space-y-0.5">
                  <span className="text-[9px] text-slate-400 uppercase flex items-center gap-1">
                    <Flame className="w-3 h-3 text-bio-400" />
                    Calorie Coverage
                  </span>
                  <span
                    className={`font-bold block ${
                      entry.foodCoveragePercent >= 100
                        ? 'text-bio-400'
                        : entry.foodCoveragePercent >= 70
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    {entry.foodCoveragePercent}%
                  </span>
                </div>
              </div>

              {/* Quick Resource Recovery Chips on Mobile */}
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-space-900/80 border border-slate-800 text-slate-300 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  {entry.waterRecycledL ? `${Math.round(entry.waterRecycledL).toLocaleString()} L` : 'Closed-Loop'}
                </span>
                <span className="px-2 py-0.5 rounded bg-space-900/80 border border-slate-800 text-slate-300 flex items-center gap-1">
                  <Sprout className="w-3 h-3 text-bio-400" />
                  {entry.totalFoodKg ? `${Math.round(entry.totalFoodKg).toLocaleString()} kg` : 'Harvests Logged'}
                </span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <span
                  className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                    failed
                      ? 'bg-red-950/60 border-red-500/50 text-red-400'
                      : entry.score >= 80
                      ? 'bg-bio-950/60 border-bio-500/50 text-bio-300'
                      : 'bg-space-900 border-slate-700 text-slate-300'
                  }`}
                >
                  {entry.tier || (failed ? 'Critical Failure' : entry.score >= 75 ? 'Pioneer' : 'Bare Survival')}
                </span>

                <span className="text-[9px] font-mono text-slate-500">
                  {failed ? `Failed Sol ${survived}` : 'Mission Target Met'}
                </span>
              </div>

              {/* Card Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                <button
                  onClick={(e) => handleOpenTelemetryModal(entry, e)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-500/30 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Telemetry Logs</span>
                </button>

                <button
                  onClick={() => toggleExpand(entry.id)}
                  className="py-1.5 px-3 rounded-lg border border-slate-700 bg-space-900 text-slate-300 hover:text-white text-[10px] font-mono flex items-center gap-1 transition-all"
                >
                  <span>{isExpanded ? 'Less' : 'Stats'}</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Mobile Expanded Details */}
              {isExpanded && (
                <div className="p-2.5 rounded-lg bg-space-900/90 border border-slate-800 text-[10px] font-mono space-y-2 animate-in fade-in">
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-800">
                    <span className="text-slate-400">Total Food Biomass:</span>
                    <span className="font-bold text-bio-300">
                      {entry.totalFoodKg ? `${entry.totalFoodKg.toLocaleString()} kg` : 'Telemetry Logged'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-800">
                    <span className="text-slate-400">Water Recycled:</span>
                    <span className="font-bold text-cyan-300">
                      {entry.waterRecycledL ? `${entry.waterRecycledL.toLocaleString()} L` : 'Closed-Loop Active'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-800">
                    <span className="text-slate-400">Energy Utilized:</span>
                    <span className="font-bold text-amber-300">
                      {entry.totalEnergyUsedKwh ? `${entry.totalEnergyUsedKwh.toLocaleString()} kWh` : 'Solar + Battery'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-400">Record ID:</span>
                    <span className="text-[9px] text-slate-500 truncate max-w-[170px]">{entry.id}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW (>= md): HIGH-TECH ENHANCED TABLE VIEW                       */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* DESKTOP VIEW (>= md): STREAMLINED 6 ESSENTIAL COLUMNS (NO HORIZONTAL CUT) */}
      {/* ========================================================================= */}
      <div className="hidden md:block hud-panel rounded-2xl border-cyan-500/20 overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 bg-space-950/90 text-slate-400 uppercase text-[10px] tracking-wider select-none">
              <th className="py-3 px-3 font-bold w-14 text-center">Rank</th>
              <th className="py-3 px-4 font-bold">Commander & Station</th>
              <th className="py-3 px-4 font-bold w-44">Duration & Crew</th>
              <th className="py-3 px-4 font-bold w-48">Calorie & Resources</th>
              <th className="py-3 px-4 font-bold w-36">Outcome</th>
              <th className="py-3 px-4 text-right font-bold w-40">Score & Logs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {entries.map((entry, idx) => {
              const isExpanded = expandedId === entry.id;
              const survived = entry.daysSurvived ?? entry.missionDays;
              const failed = entry.missionCompleted === false && survived < entry.missionDays;
              const survivalRatio = Math.min(100, Math.round((survived / entry.missionDays) * 100));

              return (
                <React.Fragment key={entry.id}>
                  <tr
                    onClick={() => toggleExpand(entry.id)}
                    className={`hover:bg-space-900/50 transition-colors cursor-pointer select-none group ${
                      isExpanded ? 'bg-space-900/40' : ''
                    }`}
                  >
                    {/* 1. Rank */}
                    <td className="py-3.5 px-3 text-center font-bold">
                      {idx === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-950/80 border border-yellow-500/50 text-yellow-300 font-display text-xs font-black shadow-[0_0_10px_rgba(234,179,8,0.25)]">
                          🥇 #1
                        </span>
                      ) : idx === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-400/50 text-slate-200 font-display text-xs font-bold">
                          🥈 #2
                        </span>
                      ) : idx === 2 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-600/50 text-amber-300 font-display text-xs font-bold">
                          🥉 #3
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-space-900/60 text-slate-400 text-[11px]">
                          #{idx + 1}
                        </span>
                      )}
                    </td>

                    {/* 2. Commander & Settlement Location */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors text-xs truncate max-w-[260px]">
                        {entry.playerName}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-mars-400">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{entry.locationName}</span>
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{entry.timestamp}</span>
                        </span>
                      </div>
                    </td>

                    {/* 3. Duration, Survival & Crew */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={failed ? 'text-red-400 font-bold' : 'text-slate-200 font-bold'}>
                          {survived} / {entry.missionDays} sols
                        </span>
                        <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{entry.crewSize}</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-space-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full transition-all ${
                            failed ? 'bg-red-500' : survivalRatio === 100 ? 'bg-bio-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${survivalRatio}%` }}
                        />
                      </div>
                    </td>

                    {/* 4. Calorie Coverage & Resource Recovery */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            entry.foodCoveragePercent >= 100
                              ? 'bg-bio-950/80 text-bio-400 border-bio-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                              : entry.foodCoveragePercent >= 70
                              ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                              : 'bg-red-950/80 text-red-400 border-red-500/40'
                          }`}
                        >
                          {entry.foodCoveragePercent}% kcal
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-cyan-300 flex items-center gap-0.5">
                          <Droplets className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>{entry.waterRecycledL ? `${Math.round(entry.waterRecycledL).toLocaleString()}L` : '4.9kL'}</span>
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-bio-300 flex items-center gap-0.5">
                          <Sprout className="w-3 h-3 text-bio-400 shrink-0" />
                          <span>{entry.totalFoodKg ? `${Math.round(entry.totalFoodKg).toLocaleString()}kg` : '7.8kkg'}</span>
                        </span>
                      </div>
                    </td>

                    {/* 5. Outcome Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold border inline-flex items-center gap-1.5 ${
                          failed
                            ? 'bg-red-950/60 border-red-500/50 text-red-400'
                            : entry.score >= 80
                            ? 'bg-bio-950/60 border-bio-500/50 text-bio-300'
                            : 'bg-space-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            failed ? 'bg-red-400' : entry.score >= 80 ? 'bg-bio-400' : 'bg-slate-400'
                          }`}
                        />
                        {entry.tier || (failed ? 'Critical Failure' : entry.score >= 75 ? 'Pioneer' : 'Bare Survival')}
                      </span>
                    </td>

                    {/* 6. Score & Telemetry Flight Logs Button */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <div className="text-right">
                          <span className="text-base font-extrabold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-bio-400 leading-none block">
                            {entry.score}
                          </span>
                          <span className="text-[9px] text-slate-500 block leading-none mt-0.5">pts</span>
                        </div>
                        <button
                          onClick={(e) => handleOpenTelemetryModal(entry, e)}
                          title="Open Flight Telemetry Console for this mission"
                          className="p-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-500/30 hover:text-white hover:border-cyan-400 transition-all flex items-center gap-1 shadow-sm"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold">Logs</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Telemetry Detail Sub-row */}
                  {isExpanded && (
                    <tr className="bg-space-950/80 border-b border-cyan-500/20 animate-in fade-in">
                      <td colSpan={6} className="p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono mb-3">
                          <div className="p-3 rounded-lg bg-space-900/80 border border-slate-800">
                            <div className="flex items-center gap-1.5 text-bio-400 mb-1">
                              <Flame className="w-3.5 h-3.5" />
                              <span className="text-[10px] uppercase font-bold text-slate-400">Total Food Harvested</span>
                            </div>
                            <span className="font-bold text-slate-200">
                              {entry.totalFoodKg ? `${entry.totalFoodKg.toLocaleString()} kg` : 'Telemetry Logged'}
                            </span>
                          </div>

                          <div className="p-3 rounded-lg bg-space-900/80 border border-slate-800">
                            <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
                              <Droplets className="w-3.5 h-3.5" />
                              <span className="text-[10px] uppercase font-bold text-slate-400">Water Recycled</span>
                            </div>
                            <span className="font-bold text-slate-200">
                              {entry.waterRecycledL ? `${entry.waterRecycledL.toLocaleString()} L` : 'Closed-Loop Active'}
                            </span>
                          </div>

                          <div className="p-3 rounded-lg bg-space-900/80 border border-slate-800">
                            <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                              <Zap className="w-3.5 h-3.5" />
                              <span className="text-[10px] uppercase font-bold text-slate-400">Energy Utilized</span>
                            </div>
                            <span className="font-bold text-slate-200">
                              {entry.totalEnergyUsedKwh ? `${entry.totalEnergyUsedKwh.toLocaleString()} kWh` : 'Solar + Battery'}
                            </span>
                          </div>

                          <div className="p-3 rounded-lg bg-space-900/80 border border-slate-800 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-[10px] uppercase font-bold text-slate-400">Mission Record ID</span>
                              </div>
                              <span className="text-[10px] text-slate-400 truncate block font-mono">
                                {entry.id}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Terminal className="w-3.5 h-3.5 text-cyan-400" />}
                            onClick={(e) => handleOpenTelemetryModal(entry, e)}
                            className="py-1 px-3 text-xs"
                          >
                            Launch Mission Telemetry Flight Recorder Modal
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* INFINITE SCROLL / PAGINATION STATUS TRIGGER                               */}
      {/* ========================================================================= */}
      <div ref={observerTarget} className="py-4 text-center">
        {isLoadingMore && (
          <div className="flex items-center justify-center gap-2 p-3 text-cyan-400 font-mono text-xs">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Streaming next 20 mission records from Supabase...</span>
          </div>
        )}

        {!hasMore && entries.length > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-space-950/80 border border-slate-800 text-xs font-mono text-slate-400 shadow-sm">
            <Check className="w-3.5 h-3.5 text-bio-400" />
            <span>NO MORE DATA · All {entries.length} mission archives loaded from database</span>
          </div>
        )}

        {hasMore && !isLoadingMore && (
          <Button
            variant="secondary"
            size="sm"
            onClick={loadMoreData}
            icon={<ArrowDownCircle className="w-3.5 h-3.5" />}
            className="text-xs font-mono py-1.5 px-4"
          >
            Load Next 20 Missions
          </Button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MOBILE-RESPONSIVE MISSION TELEMETRY FLIGHT RECORDER MODAL                 */}
      {/* ========================================================================= */}
      {selectedMission && (
        <Modal
          isOpen={Boolean(selectedMission)}
          onClose={() => setSelectedMission(null)}
          title="Telemetry Flight Recorder"
          subtitle={`ID: ${selectedMission.id} · Site: ${selectedMission.locationName}`}
          maxWidth="2xl"
        >
          <div className="space-y-3 sm:space-y-4">
            {/* Header Telemetry Badge Ribbon */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-space-950 border border-cyan-500/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-1 rounded bg-space-900/40">
                <span className="text-[9px] text-slate-400 block uppercase">Commander</span>
                <span className="font-bold text-white text-[11px] sm:text-xs truncate block">{selectedMission.playerName}</span>
              </div>
              <div className="p-1 rounded bg-space-900/40">
                <span className="text-[9px] text-slate-400 block uppercase">Survival Sols</span>
                <span className="font-bold text-cyan-300 text-[11px] sm:text-xs truncate block">
                  {selectedMission.daysSurvived ?? selectedMission.missionDays} / {selectedMission.missionDays} Sols
                </span>
              </div>
              <div className="p-1 rounded bg-space-900/40">
                <span className="text-[9px] text-slate-400 block uppercase">Calorie Coverage</span>
                <span className="font-bold text-bio-400 text-[11px] sm:text-xs truncate block">{selectedMission.foodCoveragePercent}%</span>
              </div>
              <div className="p-1 rounded bg-space-900/40">
                <span className="text-[9px] text-slate-400 block uppercase">Mission Score</span>
                <span className="font-bold text-yellow-400 text-[11px] sm:text-xs truncate block">{selectedMission.score} pts</span>
              </div>
            </div>

            {/* Filter Tabs — horizontal scrollable on mobile */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
                {(['ALL', 'HARVEST', 'ALERT', 'ECLSS'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setLogFilter(tab)}
                    className={`px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-mono shrink-0 transition-all ${
                      logFilter === tab
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-space-900 border border-transparent'
                    }`}
                  >
                    {tab === 'ALL' && `All (${telemetryLogs.length})`}
                    {tab === 'HARVEST' && `🌾 Harvest (${telemetryLogs.filter(l => l.type === 'HARVEST').length})`}
                    {tab === 'ALERT' && `⚠️ Alert (${telemetryLogs.filter(l => l.type === 'ALERT').length})`}
                    {tab === 'ECLSS' && `💧 ECLSS (${telemetryLogs.filter(l => l.type === 'ECLSS').length})`}
                  </button>
                ))}
              </div>

              <span className="hidden sm:flex text-[10px] font-mono text-bio-400 items-center gap-1 shrink-0">
                <Activity className="w-3 h-3 text-bio-400 animate-pulse" />
                <span>CLOUD SYNCED</span>
              </span>
            </div>

            {/* Monospace Scrolling Console Window */}
            <div className="rounded-xl border border-slate-800 bg-[#050914] p-3 sm:p-4 h-60 sm:h-72 overflow-y-auto font-mono text-xs space-y-2 scrollbar-thin shadow-inner">
              {logsLoading ? (
                <div className="flex items-center justify-center h-full text-cyan-400 text-xs gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading flight recorder logs...</span>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                  No telemetry entries found for: {logFilter}
                </div>
              ) : (
                filteredLogs.map((log, i) => (
                  <div key={log.id || i} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 leading-relaxed pb-1 sm:pb-0 border-b border-slate-900 sm:border-none">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold">
                        [Sol {log.sol}]
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-slate-400">
                        [{log.time}]
                      </span>
                      <span
                        className={`text-[8px] sm:text-[9px] uppercase px-1 py-0.2 rounded font-bold ${
                          log.type === 'ALERT'
                            ? 'bg-red-950 text-red-400 border border-red-500/40'
                            : log.type === 'HARVEST'
                            ? 'bg-bio-950 text-bio-300 border border-bio-500/40'
                            : log.type === 'ECLSS'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                            : 'bg-space-900 text-slate-300 border border-slate-700'
                        }`}
                      >
                        [{log.type}]
                      </span>
                    </div>
                    <span
                      className={`text-[10px] sm:text-[11px] ${
                        log.type === 'ALERT'
                          ? 'text-red-300 font-semibold'
                          : log.type === 'HARVEST'
                          ? 'text-bio-200'
                          : log.type === 'ECLSS'
                          ? 'text-cyan-200'
                          : 'text-slate-300'
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              <span className="truncate max-w-[200px] sm:max-w-none">
                Mission ID: <strong className="text-slate-200 font-mono">{selectedMission.id}</strong>
              </span>
              <Button variant="secondary" size="sm" onClick={() => setSelectedMission(null)} className="py-1 px-3 text-xs">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
