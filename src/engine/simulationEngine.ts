import { DailySimulationStep, MissionConfig, MissionEvent, MissionEventChoice, MarsLocation } from '../types';
import { CROPS_DATA } from '../data/cropsData';
import { MISSION_EVENTS } from '../data/eventsData';
import { MARS_LOCATIONS } from '../data/marsLocations';

export interface SimulationResult {
  steps: DailySimulationStep[];
  isCompleted: boolean;
  isFailed: boolean;
  failureDay?: number;
  failureReason?: string;
  totalFoodHarvestedKg: number;
  totalWaterConsumedL: number;
  totalWaterRecycledL: number;
  totalEnergyConsumedKwh: number;
  totalCaloriesProducedKcal: number;
  avgCaloricCoveragePercent: number;
  criticalEventsEncountered: number;
}

export function runFullDeterministicSimulation(
  config: MissionConfig,
  eventChoicesMade: Record<string, string> = {} // eventId -> choiceId
): SimulationResult {
  const location = MARS_LOCATIONS.find(l => l.id === config.selectedLocationId) || MARS_LOCATIONS[0];
  const steps: DailySimulationStep[] = [];
  
  // State variables across days
  let currentWaterL = config.waterReserveLiters;
  let currentBatteryKwh = (config.greenhouseModules?.batteryBankLevel || 1) * 35; // 35 - 105 kWh reserve
  // Standard NASA Mars landing contingency rations (60 sols buffer to bridge initial crop maturation)
  const initialRationSols = 60;
  let storedFoodReserveKcal = config.crewSize * 2500 * initialRationSols;
  const maxStorageCapacityKcal = Math.max(1000000, storedFoodReserveKcal * 2);
  let crewHealthPercent = 100;
  
  // Crop growth progress tracking (0 to 100%) and health (0 to 100%)
  const cropGrowth: Record<string, number> = {};
  const cropHealth: Record<string, number> = {};
  config.cropAllocations.forEach(alloc => {
    cropGrowth[alloc.cropId] = 0;
    cropHealth[alloc.cropId] = 100;
  });

  let cumulativeFoodKg = 0;
  let cumulativeCaloriesKcal = 0;
  let cumulativeWaterL = 0;
  let cumulativeWaterRecycledL = 0;
  let cumulativeEnergyKwh = 0;
  let criticalEventsCount = 0;
  let isFailed = false;
  let failureReason = '';
  let failureDay: number | undefined = undefined;

  const totalDays = config.missionDays;
  const crewCalorieDemandPerSol = config.crewSize * 2500;

  for (let day = 1; day <= totalDays; day++) {
    // Check if an event triggers or is active today
    const activeEvent = MISSION_EVENTS.find(
      e => day >= e.triggerDay && day < e.triggerDay + e.durationDays
    );

    let effectiveSolarFactor = location.solarPotentialScore / 100;
    let effectiveTempC = location.temperatureMeanC;
    let effectiveRadiation = 1.0;
    let eventEnergyModifier = 1.0;

    // Apply player's chosen response if an active event exists
    if (activeEvent) {
      if (day === activeEvent.triggerDay) {
        criticalEventsCount++;
      }

      const choiceId = eventChoicesMade[activeEvent.id];
      const selectedChoice = activeEvent.choices.find(c => c.id === choiceId) || activeEvent.choices[0];

      // Apply choice effects
      if (selectedChoice.immediateEffects.energyModifier) {
        eventEnergyModifier = selectedChoice.immediateEffects.energyModifier;
      }

      if (activeEvent.type === 'DUST_STORM') {
        effectiveSolarFactor *= (0.35 * eventEnergyModifier);
      } else if (activeEvent.type === 'TEMP_DROP') {
        effectiveTempC -= 25;
      } else if (activeEvent.type === 'SOLAR_FLARE') {
        effectiveRadiation = 3.5;
      }

      // One-time per day drain if active choice applied
      if (selectedChoice.immediateEffects.batteryDeltaKwh) {
        currentBatteryKwh = Math.max(0, currentBatteryKwh + (selectedChoice.immediateEffects.batteryDeltaKwh / activeEvent.durationDays));
      }
      if (selectedChoice.immediateEffects.waterDeltaL) {
        currentWaterL = Math.max(0, currentWaterL + (selectedChoice.immediateEffects.waterDeltaL / activeEvent.durationDays));
      }
      if (selectedChoice.immediateEffects.cropHealthDeltaPercent) {
        Object.keys(cropHealth).forEach(k => {
          cropHealth[k] = Math.max(0, Math.min(100, cropHealth[k] + (selectedChoice.immediateEffects.cropHealthDeltaPercent! / activeEvent.durationDays)));
        });
      }
    }

    // Daily crop production calculations
    let dailyFoodKg = 0;
    let dailyCalories = 0;
    let dailyProteinG = 0;
    let dailyWaterNeeded = 0;
    let dailyEnergyNeeded = 0;

    config.cropAllocations.forEach(alloc => {
      if (alloc.areaM2 <= 0) return;
      const crop = CROPS_DATA.find(c => c.id === alloc.cropId);
      if (!crop) return;

      const healthFactor = (cropHealth[crop.id] || 100) / 100;
      
      // Advance growth
      const growthIncrement = (100 / crop.growthDays) * healthFactor;
      cropGrowth[crop.id] = (cropGrowth[crop.id] || 0) + growthIncrement;

      // When crop reaches 100% growth, a harvest batch occurs!
      if (cropGrowth[crop.id] >= 100) {
        cropGrowth[crop.id] -= 100;
        const harvestBatchKg = alloc.areaM2 * crop.baseYieldKgPerM2PerCycle * healthFactor;
        dailyFoodKg += harvestBatchKg;
        dailyCalories += harvestBatchKg * crop.caloriesPerKg;
        dailyProteinG += harvestBatchKg * crop.proteinGramsPerKg;
      }

      // Daily ongoing resource consumption per m2
      const dailyCropBiomassWater = (alloc.areaM2 * crop.baseYieldKgPerM2PerCycle / crop.growthDays) * crop.waterPerKgLiters;
      const dailyCropBiomassEnergy = (alloc.areaM2 * crop.baseYieldKgPerM2PerCycle / crop.growthDays) * crop.energyPerKgKwh + (alloc.areaM2 * 0.12);
      
      dailyWaterNeeded += dailyCropBiomassWater;
      dailyEnergyNeeded += dailyCropBiomassEnergy;
    });

    // Daily energy generated by solar
    const solarGenBase = config.dailyEnergyBudgetKwh * effectiveSolarFactor;
    const netEnergy = solarGenBase - dailyEnergyNeeded;
    if (netEnergy >= 0) {
      currentBatteryKwh = Math.min((config.greenhouseModules?.batteryBankLevel || 1) * 35, currentBatteryKwh + netEnergy * 0.5);
    } else {
      currentBatteryKwh = Math.max(0, currentBatteryKwh + netEnergy);
      // If battery is empty, energy shortfall reduces crop health
      if (currentBatteryKwh <= 0) {
        Object.keys(cropHealth).forEach(k => {
          cropHealth[k] = Math.max(10, cropHealth[k] - 1.2);
        });
      }
    }

    // Daily water recycling & drain
    const recycleRate = config.greenhouseModules?.hydroponicClosedLoop ? 0.96 : 0.91;
    const dailyWaterRecycled = dailyWaterNeeded * recycleRate;
    const netWaterDrain = dailyWaterNeeded - dailyWaterRecycled;
    currentWaterL = Math.max(0, currentWaterL - netWaterDrain);

    if (currentWaterL <= 0) {
      // Severe water drought: crop health collapses quickly
      Object.keys(cropHealth).forEach(k => {
        cropHealth[k] = Math.max(0, cropHealth[k] - 4.5);
      });
    }

    // Caloric consumption & reserve management
    cumulativeFoodKg += dailyFoodKg;
    cumulativeCaloriesKcal += dailyCalories;
    cumulativeWaterL += dailyWaterNeeded;
    cumulativeWaterRecycledL += dailyWaterRecycled;
    cumulativeEnergyKwh += dailyEnergyNeeded;

    // Daily food coverage
    let dayFoodCoverage = 0;
    if (crewCalorieDemandPerSol > 0) {
      if (dailyCalories >= crewCalorieDemandPerSol) {
        // Surplus food stored into emergency reserve
        const surplus = dailyCalories - crewCalorieDemandPerSol;
        storedFoodReserveKcal = Math.min(maxStorageCapacityKcal, storedFoodReserveKcal + surplus);
        dayFoodCoverage = 100;
      } else {
        // Deficit: draw from stored reserve
        const deficit = crewCalorieDemandPerSol - dailyCalories;
        if (storedFoodReserveKcal >= deficit) {
          storedFoodReserveKcal -= deficit;
          dayFoodCoverage = 100;
        } else {
          // Reserve exhausted: food coverage drops!
          const caloriesProvided = dailyCalories + storedFoodReserveKcal;
          storedFoodReserveKcal = 0;
          dayFoodCoverage = Math.round((caloriesProvided / crewCalorieDemandPerSol) * 100);
          
          // Crew health degrades when starving
          const hungerPenalty = ((100 - dayFoodCoverage) / 100) * 1.5;
          crewHealthPercent = Math.max(0, crewHealthPercent - hungerPenalty);
        }
      }
    }

    // Check failure conditions
    if (crewHealthPercent <= 15 && !isFailed) {
      isFailed = true;
      failureDay = day;
      failureReason = 'Crew Starvation & Health Collapse: Food reserves depleted for sustained duration.';
    }

    // Record step
    steps.push({
      day,
      sol: day,
      dailyFoodHarvestedKg: Number(dailyFoodKg.toFixed(2)),
      dailyCaloriesProducedKcal: Math.round(dailyCalories),
      dailyProteinProducedG: Math.round(dailyProteinG),
      dailyCaloriesConsumedKcal: crewCalorieDemandPerSol,
      dailyFoodDeficitKcal: Math.max(0, crewCalorieDemandPerSol - dailyCalories),
      cumulativeFoodHarvestedKg: Number(cumulativeFoodKg.toFixed(2)),
      storedFoodReserveKcal: Math.round(storedFoodReserveKcal),
      foodCoveragePercent: dayFoodCoverage,
      dailyWaterConsumedL: Number(dailyWaterNeeded.toFixed(1)),
      dailyWaterRecycledL: Number(dailyWaterRecycled.toFixed(1)),
      waterReserveRemainingL: Math.round(currentWaterL),
      dailyEnergyGeneratedKwh: Number(solarGenBase.toFixed(1)),
      dailyEnergyConsumedKwh: Number(dailyEnergyNeeded.toFixed(1)),
      batteryReserveKwh: Number(currentBatteryKwh.toFixed(1)),
      energyDeficitKwh: Math.max(0, dailyEnergyNeeded - solarGenBase),
      cropGrowthProgress: { ...cropGrowth },
      cropHealthStatus: { ...cropHealth },
      effectiveSolarFactor: Number(effectiveSolarFactor.toFixed(2)),
      effectiveTempC,
      effectiveRadiationLevel: effectiveRadiation,
      crewHealthPercent: Math.round(crewHealthPercent),
      activeEventId: activeEvent?.id,
      eventDescription: activeEvent ? `${activeEvent.icon} ${activeEvent.title}` : undefined,
      isMissionFailed: isFailed,
      failureReason: isFailed ? failureReason : undefined
    });

    // If completely failed, can break or finish tracking
    if (isFailed && day >= (failureDay || day) + 5) {
      break;
    }
  }

  const avgCaloricCoveragePercent = steps.length > 0
    ? Math.round(steps.reduce((sum, s) => sum + s.foodCoveragePercent, 0) / steps.length)
    : 0;

  return {
    steps,
    isCompleted: !isFailed && steps.length >= totalDays,
    isFailed,
    failureDay,
    failureReason,
    totalFoodHarvestedKg: Number(cumulativeFoodKg.toFixed(2)),
    totalWaterConsumedL: Math.round(cumulativeWaterL),
    totalWaterRecycledL: Math.round(cumulativeWaterRecycledL),
    totalEnergyConsumedKwh: Math.round(cumulativeEnergyKwh),
    totalCaloriesProducedKcal: Math.round(cumulativeCaloriesKcal),
    avgCaloricCoveragePercent,
    criticalEventsEncountered: criticalEventsCount
  };
}
