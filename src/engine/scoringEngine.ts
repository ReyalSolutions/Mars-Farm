import { MissionScore, MissionConfig, MarsLocation } from '../types';
import { SimulationResult } from './simulationEngine';
import { MARS_LOCATIONS } from '../data/marsLocations';

export function calculateMissionScore(
  result: SimulationResult,
  config: MissionConfig
): MissionScore {
  const location = MARS_LOCATIONS.find(l => l.id === config.selectedLocationId) || MARS_LOCATIONS[0];
  const lastStep = result.steps[result.steps.length - 1];

  // 1. Food Supply Score (30% weight) - based on average calorie coverage and final reserve
  const foodSupplyScore = Math.min(100, Math.max(0, Math.round(result.avgCaloricCoveragePercent * 0.95 + (lastStep?.storedFoodReserveKcal > 10000 ? 5 : 0))));

  // 2. Water Efficiency Score (25% weight) - based on remaining water and recycling ratio
  const waterRemainingRatio = lastStep ? (lastStep.waterReserveRemainingL / config.waterReserveLiters) : 0;
  const recyclingRatio = result.totalWaterConsumedL > 0 ? (result.totalWaterRecycledL / result.totalWaterConsumedL) : 0.9;
  const waterEfficiencyScore = Math.min(100, Math.max(0, Math.round((waterRemainingRatio * 40) + (recyclingRatio * 60))));

  // 3. Energy Efficiency Score (20% weight) - based on battery health & avoiding grid blackouts
  const batteryEndRatio = lastStep ? (lastStep.batteryReserveKwh / 35) : 0;
  const energyEfficiencyScore = Math.min(100, Math.max(0, Math.round(Math.min(1, batteryEndRatio) * 50 + (location.solarPotentialScore * 0.5))));

  // 4. Farm Stability Score (15% weight) - average crop health and surviving crop cycles
  let avgCropHealth = 85;
  if (lastStep?.cropHealthStatus) {
    const healthValues = Object.values(lastStep.cropHealthStatus);
    if (healthValues.length > 0) {
      avgCropHealth = healthValues.reduce((sum, h) => sum + h, 0) / healthValues.length;
    }
  }
  const farmStabilityScore = Math.min(100, Math.max(0, Math.round(avgCropHealth)));

  // 5. Environmental Risk Score (10% weight) - surviving critical events & crew health
  const finalCrewHealth = lastStep?.crewHealthPercent || 0;
  const environmentalRiskScore = Math.min(100, Math.max(0, Math.round((finalCrewHealth * 0.7) + (location.radiationScore * 0.3))));

  // Overall Score (Weighted Sum)
  let rawOverall = 
    foodSupplyScore * 0.30 +
    waterEfficiencyScore * 0.25 +
    energyEfficiencyScore * 0.20 +
    farmStabilityScore * 0.15 +
    environmentalRiskScore * 0.10;

  if (result.isFailed) {
    rawOverall = Math.min(38, rawOverall * 0.4);
  }

  const overallScore = Math.round(Math.min(100, Math.max(0, rawOverall)));

  let tier: MissionScore['tier'] = 'Moderate Settlement';
  if (overallScore >= 90) tier = 'Master of the Red Planet';
  else if (overallScore >= 75) tier = 'Self-Sustaining Pioneer';
  else if (overallScore >= 60) tier = 'Moderate Settlement';
  else if (overallScore >= 40) tier = 'Bare Survival';
  else tier = 'Critical Failure';

  let evaluationSummary = '';
  const recommendations: string[] = [];

  if (overallScore >= 85) {
    evaluationSummary = `Outstanding Mission Outcome! Your agricultural strategy at ${location.name} successfully sustained ${config.crewSize} astronauts for ${config.missionDays} sols, meeting ${result.avgCaloricCoveragePercent}% of dietary calorie needs with robust water recovery.`;
    recommendations.push('Maintain this balanced crop rotation of energy-dense potatoes and fast-turnover microgreens.');
    recommendations.push('Consider expanding farm area to export surplus biomass to secondary Martian outposts.');
  } else if (overallScore >= 65) {
    evaluationSummary = `Viable Colony Baseline: The farm sustained the crew through major Martian environmental events, but periodic caloric deficits required drawing upon emergency rations.`;
    recommendations.push('Increase allocation of high-calorie staple crops (potatoes or wheat) to elevate daily energy reserves.');
    recommendations.push('Upgrade hydroponic closed-loop modules to reduce net water replenishment drain.');
  } else {
    evaluationSummary = `Challenging Agronomic Survival: Substantial resource deficits or crop stress compromised the colony food buffer.`;
    recommendations.push('Reallocate farm space towards fast-growing, water-efficient crops.');
    recommendations.push('Ensure landing at higher water potential sites like Arcadia Planitia or Utopia Planitia.');
    recommendations.push('Increase solar panel levels to prevent thermal drops during Martian night cycles.');
  }

  return {
    overallScore,
    tier,
    breakdown: {
      foodSupplyScore,
      waterEfficiencyScore,
      energyEfficiencyScore,
      farmStabilityScore,
      environmentalRiskScore
    },
    keyMetrics: {
      totalFoodKg: result.totalFoodHarvestedKg,
      avgDailyCalorieCoveragePercent: result.avgCaloricCoveragePercent,
      totalWaterUsedL: result.totalWaterConsumedL,
      waterRecycledL: result.totalWaterRecycledL,
      totalEnergyUsedKwh: result.totalEnergyConsumedKwh,
      cropsHarvestedTotal: Math.round(result.totalFoodHarvestedKg / 6.5),
      criticalEventsHandled: result.criticalEventsEncountered,
      daysSurvived: result.steps.length,
      missionCompleted: result.isCompleted
    },
    evaluationSummary,
    recommendations
  };
}
