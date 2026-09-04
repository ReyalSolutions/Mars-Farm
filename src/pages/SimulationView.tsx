import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, FastForward, RotateCcw, AlertTriangle, ShieldCheck, Activity, Droplets, Zap, Flame, Users, Calendar, ArrowRight, Terminal, Volume2, VolumeX, Sparkles, Wind, Gauge, Sun } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MetricCard } from '../components/ui/MetricCard';
import { Modal } from '../components/ui/Modal';
import { GreenhouseView } from '../components/visualization/GreenhouseView';
import { useMission } from '../context/MissionContext';
import { useAudio } from '../context/AudioContext';
import { MISSION_EVENTS } from '../data/eventsData';
import { CROPS_DATA } from '../data/cropsData';
import { MissionEvent } from '../types';

interface ConsoleLogEntry {
  id: string;
  sol: number;
  time: string;
  type: 'INFO' | 'HARVEST' | 'ALERT' | 'ECLSS';
  message: string;
}

export const SimulationView: React.FC = () => {
  const navigate = useNavigate();
  const { config, runSimulation, simulationResult, recordEventChoice, eventChoices, resetMission, setTelemetryLogs } = useMission();
  const { playClick, playAlarm, playSuccess, playDayTick, playHarvestChime, startAmbientLoop, stopAmbientLoop, soundEnabled, toggleSound } = useAudio();

  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 5 | 20>(5);
  const [activePromptEvent, setActivePromptEvent] = useState<MissionEvent | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLogEntry[]>([
    {
      id: 'init-1',
      sol: 1,
      time: '06:00 MTC',
      type: 'INFO',
      message: 'Life Support ECLSS loop initialized. Bio-dome pressure stable at 101.3 kPa.'
    },
    {
      id: 'init-2',
      sol: 1,
      time: '06:15 MTC',
      type: 'ECLSS',
      message: 'Aeroponic ultrasonic misting active. Nutrient solution EC 1.8 mS/cm, pH 5.8 nominal.'
    }
  ]);

  const prevHarvestRef = useRef<number>(0);
  const lastLoggedEventIdRef = useRef<string | null>(null);
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);

  // Run or regenerate simulation on mount
  useEffect(() => {
    runSimulation();
  }, [config, eventChoices]);

  // Sync telemetry logs to context so Results Page can persist to Supabase
  useEffect(() => {
    setTelemetryLogs(consoleLogs);
  }, [consoleLogs]);

  // Ambient sound management
  useEffect(() => {
    if (isPlaying) {
      startAmbientLoop();
    } else {
      stopAmbientLoop();
    }
    return () => {
      stopAmbientLoop();
    };
  }, [isPlaying]);

  // Playback timer ticker
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && simulationResult && simulationResult.steps.length > 0) {
      const intervalMs = Math.max(30, 250 / speedMultiplier);
      timer = setInterval(() => {
        setCurrentDayIndex((prev) => {
          if (prev >= simulationResult.steps.length - 1) {
            setIsPlaying(false);
            playSuccess();
            return prev;
          }

          const next = prev + 1;
          const nextStep = simulationResult.steps[next];
          
          if (next % 10 === 0) {
            playDayTick();
          }

          // 1. Check if today produced a harvest milestone (deduplicated)
          if (nextStep.dailyFoodHarvestedKg > 0 && nextStep.cumulativeFoodHarvestedKg > prevHarvestRef.current) {
            playHarvestChime();
            prevHarvestRef.current = nextStep.cumulativeFoodHarvestedKg;
            
            const harvestLog: ConsoleLogEntry = {
              id: `log-harvest-${nextStep.day}-${Date.now()}`,
              sol: nextStep.day,
              time: '14:30 MTC',
              type: 'HARVEST',
              message: `HARVEST ACHIEVED: +${Math.round(nextStep.dailyFoodHarvestedKg)} kg fresh crop biomass (+${Math.round(nextStep.dailyCaloriesProducedKcal).toLocaleString()} kcal) harvested into storage.`
            };
            setConsoleLogs((logs) => [...logs.slice(-45), harvestLog]);
          }

          // 2. Anomaly logging (only logged ONCE when the event starts, avoiding repeated spam)
          if (nextStep.activeEventId && nextStep.activeEventId !== lastLoggedEventIdRef.current) {
            lastLoggedEventIdRef.current = nextStep.activeEventId;
            const alertLog: ConsoleLogEntry = {
              id: `log-alert-${nextStep.day}-${Date.now()}`,
              sol: nextStep.day,
              time: '10:00 MTC',
              type: 'ALERT',
              message: `ANOMALY DETECTED: ${nextStep.eventDescription || 'Atmospheric fluctuation impacting greenhouse array.'}`
            };
            setConsoleLogs((logs) => [...logs.slice(-45), alertLog]);
          } else if (!nextStep.activeEventId) {
            lastLoggedEventIdRef.current = null;
          }

          // 3. Routine Sol telemetry logging (every 25 sols)
          if (next % 25 === 0 && !nextStep.activeEventId) {
            const routineLog: ConsoleLogEntry = {
              id: `log-eclss-${nextStep.day}-${Date.now()}`,
              sol: nextStep.day,
              time: `${String(8 + (next % 12)).padStart(2, '0')}:00 MTC`,
              type: 'ECLSS',
              message: `ECLSS Loop: ${Math.round(nextStep.dailyWaterRecycledL)} L recovered. Stored reserve: ${Math.round(nextStep.storedFoodReserveKcal).toLocaleString()} kcal. Crew vitals ${nextStep.crewHealthPercent}%.`
            };
            setConsoleLogs((logs) => [...logs.slice(-45), routineLog]);
          }

          // Check if today triggered a major unhandled event that needs player prompt
          if (nextStep.activeEventId) {
            const ev = MISSION_EVENTS.find(e => e.id === nextStep.activeEventId);
            if (ev && nextStep.day === ev.triggerDay && !eventChoices[ev.id]) {
              setIsPlaying(false);
              playAlarm();
              setActivePromptEvent(ev);
            }
          }

          return next;
        });
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speedMultiplier, simulationResult, eventChoices]);

  // Scroll internal console terminal box only (never scroll the outer page)
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const currentStep = simulationResult?.steps[currentDayIndex] || simulationResult?.steps[0];
  const isMissionFinished = simulationResult && currentDayIndex >= simulationResult.steps.length - 1;

  const handlePlayPause = () => {
    playClick();
    if (isMissionFinished) {
      setCurrentDayIndex(0);
      prevHarvestRef.current = 0;
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    playClick();
    stopAmbientLoop();
    setIsPlaying(false);
    setCurrentDayIndex(0);
    prevHarvestRef.current = 0;
    resetMission();
    runSimulation();
  };

  const handleEventChoice = (choiceId: string) => {
    if (!activePromptEvent) return;
    playClick();
    recordEventChoice(activePromptEvent.id, choiceId);
    setActivePromptEvent(null);
    setIsPlaying(true);
  };

  const handleEmergencyHarvest = (cropId: string) => {
    const cropDef = CROPS_DATA.find(c => c.id === cropId);
    const alloc = config.cropAllocations.find(a => a.cropId === cropId);
    const harvestedKg = Math.max(15, Math.round((alloc?.areaM2 || 10) * 1.8));
    const harvestedKcal = Math.round(harvestedKg * (cropDef?.caloriesPerKg || 1000));
    
    playHarvestChime();
    const emergencyLog: ConsoleLogEntry = {
      id: `log-harvest-manual-${Date.now()}`,
      sol: currentStep?.day || 1,
      time: '12:00 MTC',
      type: 'HARVEST',
      message: `COMMANDER EARLY HARVEST: +${harvestedKg} kg fresh ${cropDef?.name || cropId} (+${harvestedKcal.toLocaleString()} kcal) banked to colony reserve!`
    };
    setConsoleLogs((logs) => [...logs.slice(-45), emergencyLog]);
  };

  // Historical slice for telemetry graphs
  const chartData = simulationResult?.steps.slice(0, currentDayIndex + 1).map((s) => ({
    sol: `Sol ${s.day}`,
    caloriesProduced: s.dailyCaloriesProducedKcal,
    caloriesNeeded: s.dailyCaloriesConsumedKcal,
    waterRemaining: s.waterReserveRemainingL,
    batteryRemaining: s.batteryReserveKwh,
    crewHealth: s.crewHealthPercent,
  })) || [];

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* Top Header & Simulation Controls Ribbon - Compacted & High-Tech */}
      <div className="hud-panel rounded-xl p-3 sm:p-4 border-cyan-500/30 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 shadow-md relative overflow-hidden">
        {/* Subtle warning strobe if critical event */}
        {currentStep?.activeEventId && (
          <div className="absolute inset-0 bg-amber-500/10 pointer-events-none animate-pulse" />
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-0.5">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Sol {currentStep?.day || 1} of {config.missionDays}</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-yellow-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              {((currentStep?.day || 1) % 2 === 0) ? 'Sol Midday' : 'Sol Night'}
            </span>
          </div>
          <h1 className="text-base sm:text-xl font-bold font-display text-white flex items-center gap-2 tracking-tight flex-wrap">
            <span>MISSION CONTROL SIMULATOR</span>
            {currentStep?.isMissionFailed ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/90 border border-red-500 text-red-300">
                CRITICAL EMERGENCY
              </span>
            ) : isMissionFinished ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-bio-950/90 border border-bio-500 text-bio-300">
                MISSION COMPLETE
              </span>
            ) : isPlaying ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-500 text-cyan-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                SIMULATING
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-space-950 border border-slate-700 text-slate-400">
                PAUSED
              </span>
            )}
          </h1>
        </div>

        {/* Playback Controls & Audio Switcher - Fluid Mobile Responsive Strip */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-1.5 sm:gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
          <div className="flex items-center gap-1.5">
            {/* Audio Ambience Toggle */}
            <button
              onClick={toggleSound}
              className={`p-1.5 rounded-lg border text-xs font-mono transition-colors ${
                soundEnabled
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'bg-space-950 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'Martian Audio Ambience & Sound Effects Active' : 'Sound Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <Button
              variant={isPlaying ? 'secondary' : 'primary'}
              size="sm"
              onClick={handlePlayPause}
              icon={isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              className="py-1.5 px-3 text-xs"
            >
              {isMissionFinished ? 'Replay' : isPlaying ? 'Pause' : 'Play'}
            </Button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Speed toggles */}
            <div className="flex items-center bg-space-950 border border-slate-800 rounded-md p-0.5 text-[11px] font-mono">
              {([1, 5, 20] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSpeedMultiplier(spd)}
                  className={`px-2 py-0.5 rounded transition-colors ${speedMultiplier === spd ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                playAlarm();
                const stormIdx = simulationResult?.steps.findIndex(s => s.day === 45) ?? -1;
                if (stormIdx !== -1) {
                  setCurrentDayIndex(stormIdx);
                  setIsPlaying(false);
                }
                const ev = MISSION_EVENTS.find(e => e.id === 'event-dust-storm');
                if (ev) setActivePromptEvent(ev);
              }}
              className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border border-amber-500/70 bg-amber-950/80 hover:bg-amber-900 text-amber-300 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)] animate-pulse"
              title="Trigger & View Sol 45 Global Dust Storm Hazard Alert"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Sol 45 Hazard</span>
            </button>

            <Button variant="ghost" size="sm" onClick={handleRestart} icon={<RotateCcw className="w-3 h-3" />} className="py-1.5 px-2.5 text-xs">
              Reset
            </Button>

            {isMissionFinished && (
              <Button
                variant="bio"
                size="sm"
                onClick={() => navigate('/mission/results')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                iconPosition="right"
                className="py-1.5 px-3.5 text-xs"
              >
                Results
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Status Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="Crew Caloric Coverage"
          value={currentStep?.foodCoveragePercent || 0}
          unit="%"
          subtext={`${currentStep?.dailyCaloriesProducedKcal || 0} / ${currentStep?.dailyCaloriesConsumedKcal || 0} kcal`}
          icon={<Flame className="w-5 h-5" />}
          colorScheme={currentStep?.foodCoveragePercent && currentStep.foodCoveragePercent >= 100 ? 'bio' : 'amber'}
        />
        <MetricCard
          label="Cumulative Biomass"
          value={Math.round(currentStep?.cumulativeFoodHarvestedKg || 0)}
          unit="kg"
          subtext={`Cumulative: ${Math.round(currentStep?.cumulativeFoodHarvestedKg || 0)} kg harvested`}
          icon={<Users className="w-5 h-5" />}
          colorScheme="cyan"
        />
        <MetricCard
          label="Water Reserves"
          value={Math.round(currentStep?.waterReserveRemainingL || 0).toLocaleString()}
          unit="L"
          subtext={`Recycled: ${Math.round(currentStep?.dailyWaterRecycledL || 0)} L/sol`}
          icon={<Droplets className="w-5 h-5" />}
          colorScheme="cyan"
        />
        <MetricCard
          label="Crew Health & Vitals"
          value={currentStep?.crewHealthPercent || 0}
          unit="%"
          subtext={`Battery: ${Math.round(currentStep?.batteryReserveKwh || 0)} kWh`}
          icon={<ShieldCheck className="w-5 h-5" />}
          colorScheme={currentStep?.crewHealthPercent && currentStep.crewHealthPercent > 70 ? 'bio' : 'mars'}
        />
      </div>

      {/* Greenhouse Animated Growth View with 3D Chamber & NASA Veggie Spectrum */}
      <GreenhouseView
        allocations={config.cropAllocations}
        totalFarmAreaM2={config.farmAreaM2}
        cropGrowthProgress={currentStep?.cropGrowthProgress}
        cropHealthStatus={currentStep?.cropHealthStatus}
        activeEventTitle={currentStep?.eventDescription}
        solDay={currentStep?.day}
        onEmergencyHarvest={handleEmergencyHarvest}
        onOpenHazardDirectives={() => {
          const ev = MISSION_EVENTS.find(e => e.id === currentStep?.activeEventId) || MISSION_EVENTS[0];
          if (ev) setActivePromptEvent(ev);
        }}
      />

      {/* Realtime Live Recharts Telemetry Dashboard + Live Mission Console Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Caloric Production vs Crew Need Graph */}
        <div className="lg:col-span-7 hud-panel rounded-2xl p-4 sm:p-5 border-cyan-500/20 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-200 tracking-wider">
              Caloric Production vs Crew Demand (kcal / Sol)
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">REALTIME TELEMETRY</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNeed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="sol" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#060B18', borderColor: '#00F0FF', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="caloriesProduced" name="Farm Harvest (kcal)" stroke="#10B981" fillOpacity={1} fill="url(#colorCalories)" />
                <Area type="monotone" dataKey="caloriesNeeded" name="Crew Need (kcal)" stroke="#00F0FF" fillOpacity={1} fill="url(#colorNeed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Mission Control Console Terminal */}
        <div className="lg:col-span-5 hud-panel rounded-2xl p-3.5 sm:p-5 border-cyan-500/20 space-y-2 flex flex-col h-[260px] sm:h-[288px]">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-200 tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-bio-400" />
              Mission Telemetry Console
            </h3>
            <span className="text-[9px] font-mono text-bio-400 animate-pulse">STREAMING LIVE</span>
          </div>

          <div
            ref={terminalContainerRef}
            className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[10px] sm:text-[11px] text-slate-300 leading-tight scrollbar-thin"
          >
            {consoleLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-1.5 break-words">
                <span className="text-slate-500 shrink-0 text-[9px] sm:text-[10px]">[{log.time}]</span>
                <span className={`shrink-0 font-bold text-[9px] sm:text-[10px] ${
                  log.type === 'ALERT'
                    ? 'text-red-400'
                    : log.type === 'HARVEST'
                    ? 'text-yellow-300'
                    : log.type === 'ECLSS'
                    ? 'text-cyan-400'
                    : 'text-bio-400'
                }`}>
                  [{log.type}]
                </span>
                <span className={`min-w-0 flex-1 ${log.type === 'ALERT' ? 'text-amber-200' : 'text-slate-300'}`}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NASA Flight-Director Environmental Hazard Modal */}
      {activePromptEvent && (
        <Modal
          isOpen={true}
          onClose={() => handleEventChoice(activePromptEvent.choices[0].id)}
          title={`ALERT: ${activePromptEvent.name}`}
          subtitle={`Sol ${activePromptEvent.triggerDay} Martian Environmental Anomaly`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            {/* Mission Alert Header Banner */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-950/90 via-red-950/80 to-space-950 border border-amber-500/70 text-amber-100 space-y-2 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    NASA MRO ORBITAL RECONNAISSANCE ALERT
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/90 border border-red-500/60 text-red-300">
                  CRITICAL THREAT // SEV-1
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-bold font-display text-white tracking-wide">
                {activePromptEvent.title}
              </h4>

              <p className="text-xs font-mono text-amber-200/90 leading-relaxed">
                {activePromptEvent.description}
              </p>

              {/* Real-time Atmospheric Telemetry Chips */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-[10px] sm:text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-space-950/90 border border-amber-500/60 text-amber-300 font-bold">
                  τ Optical Depth: 3.2
                </span>
                <span className="px-2 py-0.5 rounded bg-space-950/90 border border-red-500/60 text-red-300 font-bold">
                  Solar Irradiance: -65%
                </span>
                <span className="px-2 py-0.5 rounded bg-space-950/90 border border-slate-700 text-slate-300">
                  Duration: {activePromptEvent.durationDays} Sols
                </span>
              </div>
            </div>

            {/* NASA Science Context Card */}
            <div className="p-3 rounded-lg bg-space-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed space-y-1">
              <span className="text-cyan-400 font-bold uppercase text-[10px] tracking-wider block">
                NASA Science Context:
              </span>
              <p className="italic text-slate-300">
                {activePromptEvent.scientificContext}
              </p>
            </div>

            {/* Commander Action Directives */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono text-slate-200 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Commander Action Directives:</span>
                </p>
                <span className="text-[10px] font-mono text-slate-400">Select Response</span>
              </div>

              <div className="space-y-2">
                {activePromptEvent.choices.map((choice) => {
                  const isBattery = choice.actionType === 'battery';
                  const isLighting = choice.actionType === 'lighting';
                  const borderHover = isBattery
                    ? 'hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                    : isLighting
                    ? 'hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'hover:border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]';

                  return (
                    <div
                      key={choice.id}
                      onClick={() => handleEventChoice(choice.id)}
                      className={`p-3.5 rounded-xl border border-slate-800 bg-space-950/90 ${borderHover} cursor-pointer transition-all space-y-1.5 group`}
                    >
                      <div className="flex justify-between items-center text-xs font-mono font-bold">
                        <div className="flex items-center gap-2">
                          {isBattery ? (
                            <Zap className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                          ) : isLighting ? (
                            <Sun className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-red-400 shrink-0 group-hover:scale-110 transition-transform" />
                          )}
                          <span className={isBattery ? 'text-cyan-300' : isLighting ? 'text-amber-300' : 'text-red-300'}>
                            {choice.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-space-900 border border-slate-700 text-slate-400 group-hover:text-white group-hover:border-slate-500 transition-colors">
                          Action ↗
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 pl-6 leading-relaxed">
                        {choice.description}
                      </p>
                      <p className="text-[11px] font-mono text-amber-400 pl-6 font-semibold pt-0.5">
                        {choice.costDescription}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
