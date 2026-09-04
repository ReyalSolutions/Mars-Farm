import { MarsLocation, SuitabilityBreakdown } from '../types';

/**
 * Calculates deterministic Mars Farm Suitability score for any location on Mars.
 * Weights:
 * - Water Potential: 25% (Critical bottleneck for crop life & hydrogen fuel)
 * - Temperature: 20% (Heating energy loads scale with subzero extremes)
 * - Solar Potential: 15% (Photovoltaic & photosynthetic PAR lighting)
 * - Terrain & Elevation: 15% (Atmospheric pressure retention & construction ease)
 * - Radiation Protection: 15% (Shielding against DNA damage & crop cell necrosis)
 * - Dust Storm Resilience: 10% (Photovoltaic panel degradation & dust intrusion risk)
 */
export function calculateFarmSuitability(location: MarsLocation): SuitabilityBreakdown {
  // Normalize each factor to 0 - 100
  const water = Math.min(100, Math.max(0, location.waterPotentialScore));
  
  // Temperature score: based on mean and minimum subzero temperature
  // Ideal mean is close to -20°C or warmer; -100°C is extreme penalty
  let tempScore = 50 + (location.temperatureMeanC + 60) * 1.5 + (location.temperatureMaxC * 0.5);
  tempScore = Math.min(100, Math.max(10, tempScore));

  const solar = Math.min(100, Math.max(0, location.solarPotentialScore));
  const terrain = Math.min(100, Math.max(0, location.terrainScore));
  const radiation = Math.min(100, Math.max(0, location.radiationScore));
  const dust = Math.min(100, Math.max(0, location.dustRiskScore));

  // Weighted calculation
  const rawScore = 
    water * 0.25 +
    tempScore * 0.20 +
    solar * 0.15 +
    terrain * 0.15 +
    radiation * 0.15 +
    dust * 0.10;

  const overallScore = Math.round(Math.min(100, Math.max(0, rawScore)));

  let ratingTier: SuitabilityBreakdown['ratingTier'] = 'Viable';
  if (overallScore >= 88) ratingTier = 'Prime Landing Site';
  else if (overallScore >= 75) ratingTier = 'Optimal';
  else if (overallScore >= 60) ratingTier = 'Viable';
  else if (overallScore >= 45) ratingTier = 'Challenging';
  else ratingTier = 'Critical';

  return {
    temperature: Math.round(tempScore),
    water: Math.round(water),
    solar: Math.round(solar),
    terrain: Math.round(terrain),
    radiation: Math.round(radiation),
    dust: Math.round(dust),
    overallScore,
    ratingTier
  };
}
