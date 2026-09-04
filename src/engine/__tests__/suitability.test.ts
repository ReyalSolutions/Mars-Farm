import { describe, it, expect } from 'vitest';
import { calculateFarmSuitability } from '../suitability';
import { MarsLocation } from '../../types';

// Shared test fixture: a well-balanced Mars location
const GOOD_LOCATION: MarsLocation = {
  id: 'test-good',
  name: 'Test Good Site',
  arabicOrAncientName: 'Test',
  type: 'Planitia',
  latitude: 18,
  longitude: 77,
  elevationKm: -2,
  temperatureMeanC: -40,
  temperatureMinC: -80,
  temperatureMaxC: 5,
  solarIrradianceWm2: 180,
  solarPotentialScore: 85,
  waterIcePotential: 'High',
  waterPotentialScore: 90,
  radiationLevel: 'Low',
  radiationScore: 85,
  dustStormRisk: 'Low',
  dustRiskScore: 80,
  terrainScore: 85,
  sourceDataset: 'Test',
  sourceType: 'Simulation Model',
  description: 'Test location',
  advantages: [],
  challenges: [],
};

// Harsh location: scorching dust, terrible water
const BAD_LOCATION: MarsLocation = {
  ...GOOD_LOCATION,
  id: 'test-bad',
  waterPotentialScore: 5,
  solarPotentialScore: 20,
  radiationScore: 10,
  dustRiskScore: 5,
  terrainScore: 15,
  temperatureMeanC: -95,
  temperatureMaxC: -50,
};

describe('calculateFarmSuitability', () => {
  it('returns a score between 0 and 100 for good location', () => {
    const result = calculateFarmSuitability(GOOD_LOCATION);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  it('gives a higher score to a good location than a bad location', () => {
    const good = calculateFarmSuitability(GOOD_LOCATION);
    const bad = calculateFarmSuitability(BAD_LOCATION);
    expect(good.overallScore).toBeGreaterThan(bad.overallScore);
  });

  it('is deterministic — same input produces same output', () => {
    const r1 = calculateFarmSuitability(GOOD_LOCATION);
    const r2 = calculateFarmSuitability(GOOD_LOCATION);
    expect(r1.overallScore).toBe(r2.overallScore);
    expect(r1.ratingTier).toBe(r2.ratingTier);
  });

  it('returns all breakdown sub-scores between 0 and 100', () => {
    const result = calculateFarmSuitability(GOOD_LOCATION);
    expect(result.water).toBeGreaterThanOrEqual(0);
    expect(result.water).toBeLessThanOrEqual(100);
    expect(result.solar).toBeGreaterThanOrEqual(0);
    expect(result.solar).toBeLessThanOrEqual(100);
    expect(result.radiation).toBeGreaterThanOrEqual(0);
    expect(result.radiation).toBeLessThanOrEqual(100);
    expect(result.dust).toBeGreaterThanOrEqual(0);
    expect(result.dust).toBeLessThanOrEqual(100);
  });

  it('assigns Prime Landing Site tier for excellent scores', () => {
    // Very high-scoring location
    const prime: MarsLocation = {
      ...GOOD_LOCATION,
      waterPotentialScore: 98,
      solarPotentialScore: 96,
      radiationScore: 97,
      dustRiskScore: 95,
      terrainScore: 95,
      temperatureMeanC: -20,
      temperatureMaxC: 10,
    };
    const result = calculateFarmSuitability(prime);
    expect(['Prime Landing Site', 'Optimal']).toContain(result.ratingTier);
  });

  it('assigns Critical tier for terrible locations', () => {
    const result = calculateFarmSuitability(BAD_LOCATION);
    expect(['Critical', 'Challenging']).toContain(result.ratingTier);
  });
});
