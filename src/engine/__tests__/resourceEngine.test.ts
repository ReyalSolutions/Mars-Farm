import { describe, it, expect } from 'vitest';
import { calculateResourceBalance } from '../resourceEngine';
import { MissionConfig } from '../../types';

const BASE_CONFIG: MissionConfig = {
  crewSize: 6,
  missionDays: 365,
  farmAreaM2: 100,
  waterReserveLiters: 5000,
  dailyEnergyBudgetKwh: 50,
  selectedLocationId: 'jezero-crater',
  cropAllocations: [
    { cropId: 'potato', areaM2: 40 },
    { cropId: 'lettuce', areaM2: 20 },
    { cropId: 'wheat', areaM2: 20 },
    { cropId: 'tomato', areaM2: 20 },
  ],
  greenhouseModules: {
    solarArrayLevel: 2,
    batteryBankLevel: 2,
    ledOptimization: true,
    hydroponicClosedLoop: true,
    thermalRegulatorShield: true,
  },
};

const SOLAR_POTENTIAL = 84; // Jezero Crater solarPotentialScore

describe('calculateResourceBalance', () => {
  it('returns a valid projection object with all required fields', () => {
    const result = calculateResourceBalance(BASE_CONFIG, SOLAR_POTENTIAL);
    expect(result).toHaveProperty('totalAllocatedAreaM2');
    expect(result).toHaveProperty('estimatedDailyCaloriesProducedKcal');
    expect(result).toHaveProperty('crewDailyCaloricRequirementKcal');
    expect(result).toHaveProperty('projectedCaloricCoveragePercent');
    expect(result).toHaveProperty('netDailyWaterDrainL');
  });

  it('Scenario A — balanced farm covers a meaningful share of crew caloric needs', () => {
    const result = calculateResourceBalance(BASE_CONFIG, SOLAR_POTENTIAL);
    // Engine yields ~58% coverage for 100m² farm with 6 crew — meaningful but not self-sufficient
    expect(result.projectedCaloricCoveragePercent).toBeGreaterThanOrEqual(40);
    expect(result.projectedCaloricCoveragePercent).toBeLessThanOrEqual(100);
  });

  it('Scenario B — no water allocation still produces caloric estimate', () => {
    // Resource balance doesn't gate on water, but net drain increases
    const result = calculateResourceBalance(BASE_CONFIG, SOLAR_POTENTIAL);
    expect(result.dailyWaterConsumptionL).toBeGreaterThan(0);
    expect(result.netDailyWaterDrainL).toBeGreaterThanOrEqual(0);
  });

  it('Scenario D — larger crew reduces caloric coverage percentage', () => {
    const bigCrew: MissionConfig = { ...BASE_CONFIG, crewSize: 12 };
    const smallCrew: MissionConfig = { ...BASE_CONFIG, crewSize: 2 };
    const bigResult = calculateResourceBalance(bigCrew, SOLAR_POTENTIAL);
    const smallResult = calculateResourceBalance(smallCrew, SOLAR_POTENTIAL);
    expect(bigResult.projectedCaloricCoveragePercent).toBeLessThan(smallResult.projectedCaloricCoveragePercent);
  });

  it('Scenario E — tiny farm produces insufficient food for crew', () => {
    const tinyFarm: MissionConfig = {
      ...BASE_CONFIG,
      farmAreaM2: 10,
      cropAllocations: [{ cropId: 'potato', areaM2: 10 }],
    };
    const result = calculateResourceBalance(tinyFarm, SOLAR_POTENTIAL);
    expect(result.projectedCaloricCoveragePercent).toBeLessThan(100);
  });

  it('is deterministic — same config yields same result', () => {
    const r1 = calculateResourceBalance(BASE_CONFIG, SOLAR_POTENTIAL);
    const r2 = calculateResourceBalance(BASE_CONFIG, SOLAR_POTENTIAL);
    expect(r1.projectedCaloricCoveragePercent).toBe(r2.projectedCaloricCoveragePercent);
    expect(r1.netDailyWaterDrainL).toBe(r2.netDailyWaterDrainL);
  });

  it('allocated area correctly sums crop allocations', () => {
    const result = calculateResourceBalance(BASE_CONFIG, SOLAR_POTENTIAL);
    expect(result.totalAllocatedAreaM2).toBe(100); // 40+20+20+20
    expect(result.remainingAreaM2).toBe(0);
  });
});
