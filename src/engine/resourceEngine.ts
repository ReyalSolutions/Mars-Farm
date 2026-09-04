import { Crop, CropAllocation, MissionConfig } from '../types';
import { CROPS_DATA } from '../data/cropsData';

export interface ResourceBalanceProjection {
  totalAllocatedAreaM2: number;
  remainingAreaM2: number;
  dailyWaterConsumptionL: number;
  dailyWaterRecycledL: number;
  netDailyWaterDrainL: number;
  dailyEnergyConsumptionKwh: number;
  dailyEnergyGeneratedKwh: number;
  netDailyEnergyDeltaKwh: number;
  estimatedDailyFoodYieldKg: number;
  estimatedDailyCaloriesProducedKcal: number;
  crewDailyCaloricRequirementKcal: number;
  projectedCaloricCoveragePercent: number;
  dailyProteinProducedG: number;
  crewDailyProteinRequirementG: number;
  projectedProteinCoveragePercent: number;
  cropSummary: {
    crop: Crop;
    areaM2: number;
    dailyWaterL: number;
    dailyEnergyKwh: number;
    dailyCalories: number;
  }[];
}

const CALORIES_PER_CREW_MEMBER_PER_SOL = 2500; // NASA standard active astronaut dietary need
const PROTEIN_GRAMS_PER_CREW_MEMBER_PER_SOL = 75; // g/day
const WATER_RECYCLING_EFFICIENCY_BASE = 0.92; // 92% closed-loop aeroponic recovery

export function calculateResourceBalance(
  config: MissionConfig,
  solarPotentialScore: number = 80
): ResourceBalanceProjection {
  const totalAllocatedAreaM2 = config.cropAllocations.reduce((sum, item) => sum + item.areaM2, 0);
  const remainingAreaM2 = Math.max(0, config.farmAreaM2 - totalAllocatedAreaM2);

  let totalDailyWaterL = 0;
  let totalDailyEnergyKwh = 0;
  let totalDailyFoodYieldKg = 0;
  let totalDailyCalories = 0;
  let totalDailyProteinG = 0;

  const cropSummary = config.cropAllocations.map(alloc => {
    const crop = CROPS_DATA.find(c => c.id === alloc.cropId);
    if (!crop || alloc.areaM2 <= 0) {
      return {
        crop: crop || CROPS_DATA[0],
        areaM2: 0,
        dailyWaterL: 0,
        dailyEnergyKwh: 0,
        dailyCalories: 0
      };
    }

    // Daily harvest biomass yield = (area * baseYieldPerCycle) / growthDays
    const dailyBiomassYieldKg = (alloc.areaM2 * crop.baseYieldKgPerM2PerCycle) / crop.growthDays;
    
    // Daily water = (daily yield * waterPerKg)
    const dailyWater = dailyBiomassYieldKg * crop.waterPerKgLiters;
    
    // Daily energy = base greenhouse lighting + climate load per m2 + crop specific
    const dailyEnergy = (dailyBiomassYieldKg * crop.energyPerKgKwh) + (alloc.areaM2 * 0.12);
    
    // Daily calories & protein
    const dailyCalories = dailyBiomassYieldKg * crop.caloriesPerKg;
    const dailyProtein = dailyBiomassYieldKg * crop.proteinGramsPerKg;

    totalDailyWaterL += dailyWater;
    totalDailyEnergyKwh += dailyEnergy;
    totalDailyFoodYieldKg += dailyBiomassYieldKg;
    totalDailyCalories += dailyCalories;
    totalDailyProteinG += dailyProtein;

    return {
      crop,
      areaM2: alloc.areaM2,
      dailyWaterL: Number(dailyWater.toFixed(1)),
      dailyEnergyKwh: Number(dailyEnergy.toFixed(1)),
      dailyCalories: Math.round(dailyCalories)
    };
  });

  // Closed loop recovery calculation
  let recoveryRate = WATER_RECYCLING_EFFICIENCY_BASE;
  if (config.greenhouseModules?.hydroponicClosedLoop) recoveryRate += 0.05; // up to 97%
  const dailyWaterRecycledL = totalDailyWaterL * recoveryRate;
  const netDailyWaterDrainL = Math.max(0, totalDailyWaterL - dailyWaterRecycledL);

  // Daily energy generation from solar array + location irradiance
  const solarTierMultiplier = 1 + ((config.greenhouseModules?.solarArrayLevel || 1) - 1) * 0.35;
  const dailyEnergyGeneratedKwh = (config.dailyEnergyBudgetKwh * (solarPotentialScore / 100)) * solarTierMultiplier;
  const netDailyEnergyDeltaKwh = dailyEnergyGeneratedKwh - totalDailyEnergyKwh;

  const crewDailyCaloricRequirementKcal = config.crewSize * CALORIES_PER_CREW_MEMBER_PER_SOL;
  const projectedCaloricCoveragePercent = crewDailyCaloricRequirementKcal > 0
    ? Math.min(150, Math.round((totalDailyCalories / crewDailyCaloricRequirementKcal) * 100))
    : 0;

  const crewDailyProteinRequirementG = config.crewSize * PROTEIN_GRAMS_PER_CREW_MEMBER_PER_SOL;
  const projectedProteinCoveragePercent = crewDailyProteinRequirementG > 0
    ? Math.min(150, Math.round((totalDailyProteinG / crewDailyProteinRequirementG) * 100))
    : 0;

  return {
    totalAllocatedAreaM2,
    remainingAreaM2,
    dailyWaterConsumptionL: Number(totalDailyWaterL.toFixed(1)),
    dailyWaterRecycledL: Number(dailyWaterRecycledL.toFixed(1)),
    netDailyWaterDrainL: Number(netDailyWaterDrainL.toFixed(1)),
    dailyEnergyConsumptionKwh: Number(totalDailyEnergyKwh.toFixed(1)),
    dailyEnergyGeneratedKwh: Number(dailyEnergyGeneratedKwh.toFixed(1)),
    netDailyEnergyDeltaKwh: Number(netDailyEnergyDeltaKwh.toFixed(1)),
    estimatedDailyFoodYieldKg: Number(totalDailyFoodYieldKg.toFixed(2)),
    estimatedDailyCaloriesProducedKcal: Math.round(totalDailyCalories),
    crewDailyCaloricRequirementKcal,
    projectedCaloricCoveragePercent,
    dailyProteinProducedG: Math.round(totalDailyProteinG),
    crewDailyProteinRequirementG,
    projectedProteinCoveragePercent,
    cropSummary
  };
}
