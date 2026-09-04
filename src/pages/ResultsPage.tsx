import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Share2, Sparkles, Droplets, Zap, Flame, Users, Calendar, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { MetricCard } from '../components/ui/MetricCard';
import { AiFarmAdvisor } from '../components/ui/AiFarmAdvisor';
import { useMission } from '../context/MissionContext';
import { useToast } from '../components/ui/Toast';
import { saveLeaderboardEntry } from '../services/storageService';

export const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { missionScore, config, selectedLocation, resetMission, telemetryLogs } = useMission();
  const { showToast } = useToast();

  useEffect(() => {
    if (missionScore && missionScore.overallScore >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  }, [missionScore]);

  const handleSaveToLeaderboard = async () => {
    if (!missionScore) return;
    const { savedToSupabase } = await saveLeaderboardEntry({
      playerName: `Colony Commander (${selectedLocation.name.split(' ')[0]})`,
      score: missionScore.overallScore,
      crewSize: config.crewSize,
      missionDays: config.missionDays,
      daysSurvived: missionScore.keyMetrics.daysSurvived,
      missionCompleted: missionScore.keyMetrics.missionCompleted,
      totalFoodKg: missionScore.keyMetrics.totalFoodKg,
      waterRecycledL: missionScore.keyMetrics.waterRecycledL,
      totalEnergyUsedKwh: missionScore.keyMetrics.totalEnergyUsedKwh,
      tier: missionScore.tier,
      locationName: selectedLocation.name,
      foodCoveragePercent: missionScore.keyMetrics.avgDailyCalorieCoveragePercent,
      telemetryLogs: telemetryLogs || [],
    });

    if (savedToSupabase) {
      showToast({
        type: 'success',
        title: 'Supabase Cloud Sync',
        message: 'Mission results successfully saved to Supabase Cloud Database!'
      });
    } else {
      showToast({
        type: 'info',
        title: 'Local Cache Saved',
        message: 'Mission results stored to local browser cache.'
      });
    }

    navigate('/leaderboard');
  };

  const handleTryAgain = () => {
    resetMission();
    navigate('/mission/location');
  };

  if (!missionScore) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-sm font-mono text-slate-400">No active simulation results detected.</p>
        <Button variant="mars" onClick={() => navigate('/mission/location')}>
          Start Mission
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* 1. Cinematic Score Banner */}
      <div className="hud-panel-mars rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-space-950 border border-mars-500/40 text-mars-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MISSION DEBRIEFING REPORT</span>
        </div>

        <div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight">
            {missionScore.keyMetrics.missionCompleted ? 'MISSION COMPLETED' : 'MISSION TERMINATED'}
          </h1>
          <p className="text-sm sm:text-base font-mono text-cyan-300 mt-2">
            {missionScore.tier} · {selectedLocation.name} · {config.missionDays} Sols
          </p>
        </div>

        {/* Big Overall Survival Score Display */}
        <div className="inline-flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-space-950/80 border border-cyan-500/40 shadow-[0_0_40px_rgba(0,240,255,0.25)]">
          <span className="text-5xl sm:text-7xl font-extrabold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-bio-300 to-yellow-300">
            {missionScore.overallScore}
          </span>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest mt-1">
            Overall Survival Score / 100
          </span>
        </div>

        {/* Narrative Summary */}
        <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed font-mono">
          {missionScore.evaluationSummary}
        </p>

        {/* Action Button Strip */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button variant="bio" size="lg" onClick={handleSaveToLeaderboard} icon={<Trophy className="w-5 h-5" />}>
            Save to Colony Leaderboard
          </Button>
          <Button variant="secondary" size="lg" onClick={handleTryAgain} icon={<RotateCcw className="w-4 h-4" />}>
            Try New Strategy
          </Button>
        </div>
      </div>

      {/* 2. Key Telemetry Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          label="Total Food Produced"
          value={missionScore.keyMetrics.totalFoodKg.toLocaleString()}
          unit="kg"
          subtext={`Avg ${missionScore.keyMetrics.avgDailyCalorieCoveragePercent}% daily coverage`}
          icon={<Flame className="w-5 h-5" />}
          colorScheme="bio"
        />
        <MetricCard
          label="Water Recovered"
          value={missionScore.keyMetrics.waterRecycledL.toLocaleString()}
          unit="L"
          subtext={`${missionScore.keyMetrics.totalWaterUsedL.toLocaleString()}L total fluid throughput`}
          icon={<Droplets className="w-5 h-5" />}
          colorScheme="cyan"
        />
        <MetricCard
          label="Energy Expended"
          value={missionScore.keyMetrics.totalEnergyUsedKwh.toLocaleString()}
          unit="kWh"
          subtext="Lighting & subzero heating"
          icon={<Zap className="w-5 h-5" />}
          colorScheme="amber"
        />
        <MetricCard
          label="Events Navigated"
          value={missionScore.keyMetrics.criticalEventsHandled}
          unit="Emergencies"
          subtext={`${config.crewSize} astronauts sustained`}
          icon={<ShieldCheck className="w-5 h-5" />}
          colorScheme="cyan"
        />
      </div>

      {/* 3. Multi-Factor Breakdown Bars & Astrobotanist Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 5 Factor Score Breakdown */}
        <div className="lg:col-span-6 hud-panel rounded-2xl p-6 border-cyan-500/20 space-y-4">
          <h3 className="text-xs font-mono uppercase font-bold text-slate-200 tracking-wider pb-2 border-b border-slate-800">
            Mission Survival Breakdown Factors
          </h3>

          <div className="space-y-3.5">
            <ProgressBar
              label="1. Calorie Supply & Food Reserves (30%)"
              value={missionScore.breakdown.foodSupplyScore}
              variant="bio"
            />
            <ProgressBar
              label="2. Closed-Loop Water Efficiency (25%)"
              value={missionScore.breakdown.waterEfficiencyScore}
              variant="cyan"
            />
            <ProgressBar
              label="3. Energy & Solar Power Grid (20%)"
              value={missionScore.breakdown.energyEfficiencyScore}
              variant="amber"
            />
            <ProgressBar
              label="4. Bio-Dome Crop Stability (15%)"
              value={missionScore.breakdown.farmStabilityScore}
              variant="bio"
            />
            <ProgressBar
              label="5. Environmental Risk Mitigation (10%)"
              value={missionScore.breakdown.environmentalRiskScore}
              variant="cyan"
            />
          </div>
        </div>

        {/* Right: Astrobotanist Recommendations */}
        <div className="lg:col-span-6 hud-panel-bio rounded-2xl p-6 border-bio-500/30 space-y-4">
          <h3 className="text-xs font-mono uppercase font-bold text-bio-400 tracking-wider pb-2 border-b border-bio-500/20">
            Astrobotany Debriefing Recommendations
          </h3>

          <div className="space-y-2.5">
            {missionScore.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs font-mono text-slate-200 p-2.5 rounded bg-space-950/80 border border-slate-800">
                <span className="text-bio-400 font-bold">{i + 1}.</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link to="/science" className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1">
              Read NASA datasets & scientific methodology ↗
            </Link>
          </div>
        </div>
      </div>
      {/* 4. AI Post-Mission Analysis */}
      <AiFarmAdvisor
        contextNote={`Post-Mission Analysis — Score: ${missionScore.overallScore}/100 (${missionScore.tier}). Ask for improvement strategies.`}
      />
    </div>
  );
};
