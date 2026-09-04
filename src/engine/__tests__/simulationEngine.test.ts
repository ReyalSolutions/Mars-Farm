import { describe, it, expect } from 'vitest';
import { runFullDeterministicSimulation } from '../simulationEngine';
import { MissionConfig } from '../../types';

const BALANCED_CONFIG: MissionConfig = {
  crewSize: 6,
  missionDays: 90,          // shorter mission to avoid water depletion
  farmAreaM2: 100,
  waterReserveLiters: 50000,  // large reserve so water isn't the failure mode
  dailyEnergyBudgetKwh: 100,  // generous energy
  selectedLocationId: 'jezero-crater',
  cropAllocations: [
    { cropId: 'potato', areaM2: 45 },
    { cropId: 'lettuce', areaM2: 15 },
    { cropId: 'wheat', areaM2: 20 },
    { cropId: 'tomato', areaM2: 20 },
  ],
  greenhouseModules: {
    solarArrayLevel: 3,
    batteryBankLevel: 3,
    ledOptimization: true,
    hydroponicClosedLoop: true,
    thermalRegulatorShield: true,
  },
};

describe('runFullDeterministicSimulation', () => {
  it('Scenario A — balanced farm produces simulation steps', () => {
    const result = runFullDeterministicSimulation(BALANCED_CONFIG, {});
    expect(result.steps.length).toBeGreaterThan(0);
    // Mission may complete or fail gracefully — what matters is steps are generated
    expect(typeof result.isFailed).toBe('boolean');
    expect(typeof result.isCompleted).toBe('boolean');
  });

  it('Scenario A — steps count equals missionDays for well-resourced config', () => {
    const result = runFullDeterministicSimulation(BALANCED_CONFIG, {});
    // With large water/energy reserves the simulation runs to completion
    expect(result.steps.length).toBe(BALANCED_CONFIG.missionDays);
    expect(result.isCompleted).toBe(true);
  });

  it('Scenario B — no crops causes food deficit / failure', () => {
    const noFarm: MissionConfig = {
      ...BALANCED_CONFIG,
      cropAllocations: [],
    };
    const result = runFullDeterministicSimulation(noFarm, {});
    // Without any crops, stored food reserve depletes and mission should fail
    const lastStep = result.steps[result.steps.length - 1];
    // Either mission failed OR food coverage dropped severely
    const missionFailed = result.isFailed || lastStep.isMissionFailed;
    const foodCritical = lastStep.foodCoveragePercent < 10;
    expect(missionFailed || foodCritical).toBe(true);
  });

  it('Scenario D — oversized crew reduces food coverage vs small crew', () => {
    const bigCrew: MissionConfig = { ...BALANCED_CONFIG, crewSize: 12 };
    const smallCrew: MissionConfig = { ...BALANCED_CONFIG, crewSize: 2 };
    const bigResult = runFullDeterministicSimulation(bigCrew, {});
    const smallResult = runFullDeterministicSimulation(smallCrew, {});
    const bigAvg = bigResult.avgCaloricCoveragePercent;
    const smallAvg = smallResult.avgCaloricCoveragePercent;
    expect(bigAvg).toBeLessThan(smallAvg);
  });

  it('Scenario E — tiny farm results in insufficient food', () => {
    const tinyFarm: MissionConfig = {
      ...BALANCED_CONFIG,
      farmAreaM2: 10,
      cropAllocations: [{ cropId: 'lettuce', areaM2: 10 }],
      missionDays: 180,
    };
    const result = runFullDeterministicSimulation(tinyFarm, {});
    expect(result.avgCaloricCoveragePercent).toBeLessThanOrEqual(50);
  });

  it('is deterministic — identical configs produce identical results', () => {
    const r1 = runFullDeterministicSimulation(BALANCED_CONFIG, {});
    const r2 = runFullDeterministicSimulation(BALANCED_CONFIG, {});
    expect(r1.totalFoodHarvestedKg).toBe(r2.totalFoodHarvestedKg);
    expect(r1.avgCaloricCoveragePercent).toBe(r2.avgCaloricCoveragePercent);
    expect(r1.steps.length).toBe(r2.steps.length);
  });

  it('produces simulation steps with required daily fields', () => {
    const result = runFullDeterministicSimulation(BALANCED_CONFIG, {});
    const step = result.steps[0];
    expect(step).toHaveProperty('day');
    expect(step).toHaveProperty('dailyCaloriesProducedKcal');
    expect(step).toHaveProperty('foodCoveragePercent');
    expect(step).toHaveProperty('waterReserveRemainingL');
    expect(step).toHaveProperty('crewHealthPercent');
  });
});
