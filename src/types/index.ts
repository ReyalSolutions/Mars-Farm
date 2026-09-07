// Types for MARS FARM Application

export interface MarsLocation {
  id: string;
  name: string;
  arabicOrAncientName?: string;
  type: 'Crater' | 'Volcanic Plain' | 'Canyon' | 'Planitia' | 'Polar Basin' | 'Martian Moon' | 'Earth Station' | 'Lunar Base' | 'Lunar Mare';
  celestialBody?: 'mars' | 'earth' | 'moon';
  latitude: number; // degrees (-90 to 90)
  longitude: number; // degrees (-180 to 180)
  elevationKm: number; // relative to planet datum
  temperatureMeanC: number; // mean surface temp
  temperatureMinC: number;
  temperatureMaxC: number;
  solarIrradianceWm2: number; // avg daily W/m2
  solarPotentialScore: number; // 0-100
  waterIcePotential: 'Low' | 'Moderate' | 'High' | 'Very High';
  waterPotentialScore: number; // 0-100
  radiationLevel: 'Low' | 'Moderate' | 'High' | 'Extreme'; // mSv/year scale
  radiationScore: number; // 0-100 (higher = safer)
  dustStormRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
  dustRiskScore: number; // 0-100 (higher = safer / lower risk)
  terrainScore: number; // 0-100 (higher = flatter/easier construction)
  sourceDataset: string;
  sourceType: 'NASA MOLA / TES / InSight / Mars Odyssey' | 'Simulation Model' | 'NASA Landsat / MODIS' | 'NASA LRO / Apollo PDS';
  description: string;
  advantages: string[];
  challenges: string[];
}

export interface SuitabilityBreakdown {
  temperature: number; // 20%
  water: number;       // 25%
  solar: number;       // 15%
  terrain: number;     // 15%
  radiation: number;   // 15%
  dust: number;        // 10%
  overallScore: number; // 0-100
  ratingTier: 'Critical' | 'Challenging' | 'Viable' | 'Optimal' | 'Prime Landing Site';
}

export interface Crop {
  id: string;
  name: string;
  scientificName: string;
  emoji: string;
  category: 'Staple Root' | 'Leafy Green' | 'Fruiting' | 'Grain' | 'Legume Protein';
  growthDays: number; // Days from planting to harvest
  waterPerKgLiters: number; // Liters of water required per kg biomass
  energyPerKgKwh: number; // kWh required for lighting & thermal regulation per kg
  spaceRequiredM2PerKg: number; // m² needed per kg yield
  caloriesPerKg: number; // kcal / kg
  proteinGramsPerKg: number; // g / kg
  baseYieldKgPerM2PerCycle: number; // yield per m² per harvest cycle
  harvestsPerYear: number;
  temperatureOptimalC: number;
  temperatureToleranceRange: [number, number]; // [min, max]
  radiationToleranceScore: number; // 0-100
  resilienceScore: number; // resistance to disease & fluctuations
  co2Affinity: 'Moderate' | 'High' | 'Very High';
  nutritionalHighlights: string[];
  iconColor: string;
}

export interface CropAllocation {
  cropId: string;
  areaM2: number;
}

export interface MissionConfig {
  crewSize: number; // 1 - 12 (default 6)
  missionDays: 30 | 90 | 180 | 365 | 500; // default 365
  farmAreaM2: number; // 25 - 500 (default 100)
  waterReserveLiters: number; // default 5000
  dailyEnergyBudgetKwh: number; // default 50
  selectedLocationId: string;
  cropAllocations: CropAllocation[];
  greenhouseModules: {
    solarArrayLevel: number; // 1-3
    batteryBankLevel: number; // 1-3
    ledOptimization: boolean;
    hydroponicClosedLoop: boolean;
    thermalRegulatorShield: boolean;
  };
}

export interface DailySimulationStep {
  day: number;
  sol: number;
  
  // Food & Calories
  dailyFoodHarvestedKg: number;
  dailyCaloriesProducedKcal: number;
  dailyProteinProducedG: number;
  dailyCaloriesConsumedKcal: number;
  dailyFoodDeficitKcal: number;
  cumulativeFoodHarvestedKg: number;
  storedFoodReserveKcal: number;
  foodCoveragePercent: number; // % of daily crew caloric need met
  
  // Water
  dailyWaterConsumedL: number;
  dailyWaterRecycledL: number;
  waterReserveRemainingL: number;
  
  // Energy
  dailyEnergyGeneratedKwh: number;
  dailyEnergyConsumedKwh: number;
  batteryReserveKwh: number;
  energyDeficitKwh: number;
  
  // Crop States
  cropGrowthProgress: Record<string, number>; // 0 to 100%
  cropHealthStatus: Record<string, number>; // 0 to 100%
  
  // Environmental Factors of Day
  effectiveSolarFactor: number; // modifier 0-1 (affected by dust storms)
  effectiveTempC: number;
  effectiveRadiationLevel: number;
  
  // Mission Status
  crewHealthPercent: number;
  activeEventId?: string;
  eventDescription?: string;
  isMissionFailed: boolean;
  failureReason?: string;
}

export interface MissionEventChoice {
  id: string;
  label: string;
  description: string;
  costDescription: string;
  actionType: 'battery' | 'lighting' | 'ration' | 'shield' | 'repair' | 'quarantine' | 'passive';
  immediateEffects: {
    waterDeltaL?: number;
    batteryDeltaKwh?: number;
    cropHealthDeltaPercent?: number;
    crewHealthDeltaPercent?: number;
    energyModifier?: number;
  };
}

export interface MissionEvent {
  id: string;
  name: string;
  icon: string;
  type: 'DUST_STORM' | 'SOLAR_FLARE' | 'WATER_FAILURE' | 'TEMP_DROP' | 'CROP_DISEASE' | 'POWER_GRID_FAULT';
  triggerDay: number;
  durationDays: number;
  severity: 'Moderate' | 'Severe' | 'Critical';
  title: string;
  description: string;
  scientificContext: string;
  choices: MissionEventChoice[];
}

export interface MissionScore {
  overallScore: number; // 0-100
  tier: 'Critical Failure' | 'Bare Survival' | 'Moderate Settlement' | 'Self-Sustaining Pioneer' | 'Master of the Red Planet';
  breakdown: {
    foodSupplyScore: number;       // 30%
    waterEfficiencyScore: number;  // 25%
    energyEfficiencyScore: number; // 20%
    farmStabilityScore: number;    // 15%
    environmentalRiskScore: number;// 10%
  };
  keyMetrics: {
    totalFoodKg: number;
    avgDailyCalorieCoveragePercent: number;
    totalWaterUsedL: number;
    waterRecycledL: number;
    totalEnergyUsedKwh: number;
    cropsHarvestedTotal: number;
    criticalEventsHandled: number;
    daysSurvived: number;
    missionCompleted: boolean;
  };
  evaluationSummary: string;
  recommendations: string[];
}

export interface MissionTelemetryLog {
  id: string;
  sol: number;
  time: string;
  type: 'INFO' | 'HARVEST' | 'ALERT' | 'ECLSS';
  message: string;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  crewSize: number;
  missionDays: number;
  daysSurvived?: number;
  missionCompleted?: boolean;
  totalFoodKg?: number;
  waterRecycledL?: number;
  totalEnergyUsedKwh?: number;
  tier?: string;
  locationName: string;
  foodCoveragePercent: number;
  timestamp: string;
  telemetryLogs?: MissionTelemetryLog[];
}

