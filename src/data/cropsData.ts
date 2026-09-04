import { Crop } from '../types';

export const CROPS_DATA: Crop[] = [
  {
    id: 'potato',
    name: 'Mars Russet Potato',
    scientificName: 'Solanum tuberosum (Martian Cultivar)',
    emoji: '🥔',
    category: 'Staple Root',
    growthDays: 90,
    waterPerKgLiters: 180, // efficient aeroponic/hydroponic rate
    energyPerKgKwh: 1.8,
    spaceRequiredM2PerKg: 0.12, // ~8.3 kg per m2 per harvest
    caloriesPerKg: 770,
    proteinGramsPerKg: 20,
    baseYieldKgPerM2PerCycle: 8.5,
    harvestsPerYear: 4.0,
    temperatureOptimalC: 18,
    temperatureToleranceRange: [10, 24],
    radiationToleranceScore: 88,
    resilienceScore: 85,
    co2Affinity: 'High',
    nutritionalHighlights: [
      'Dense carbohydrate source for physical crew labor',
      'High Potassium (420mg/100g) & Vitamin C',
      'Thrives in controlled high-CO₂ aeroponic mist chambers'
    ],
    iconColor: '#EAB308' // Amber
  },
  {
    id: 'lettuce',
    name: 'Apollo Crisp Lettuce',
    scientificName: 'Lactuca sativa (Fast-Cycle)',
    emoji: '🥬',
    category: 'Leafy Green',
    growthDays: 28,
    waterPerKgLiters: 110,
    energyPerKgKwh: 0.9,
    spaceRequiredM2PerKg: 0.18, // ~5.5 kg per m2
    caloriesPerKg: 150,
    proteinGramsPerKg: 14,
    baseYieldKgPerM2PerCycle: 4.2,
    harvestsPerYear: 13.0,
    temperatureOptimalC: 17,
    temperatureToleranceRange: [8, 23],
    radiationToleranceScore: 78,
    resilienceScore: 92,
    co2Affinity: 'Very High',
    nutritionalHighlights: [
      'Rapid continuous harvests (every 28 days)',
      'Rich in Vitamin K, Folate & lutein for eye health',
      'High psychological boost (fresh crisp greens for crew)'
    ],
    iconColor: '#22C55E' // Green
  },
  {
    id: 'tomato',
    name: 'Red Planet Micro-Tomato',
    scientificName: 'Solanum lycopersicum (Dwarf Red Dwarf)',
    emoji: '🍅',
    category: 'Fruiting',
    growthDays: 70,
    waterPerKgLiters: 210,
    energyPerKgKwh: 2.2,
    spaceRequiredM2PerKg: 0.15,
    caloriesPerKg: 180,
    proteinGramsPerKg: 9,
    baseYieldKgPerM2PerCycle: 6.8,
    harvestsPerYear: 5.2,
    temperatureOptimalC: 22,
    temperatureToleranceRange: [14, 28],
    radiationToleranceScore: 82,
    resilienceScore: 75,
    co2Affinity: 'Moderate',
    nutritionalHighlights: [
      'High Lycopene antioxidant: protects astronauts against cosmic radiation damage',
      'Vitamins A, C, and E vital for immune resilience in space',
      'Excellent culinary versatility and crew morale enhancement'
    ],
    iconColor: '#EF4444' // Red
  },
  {
    id: 'wheat',
    name: 'Dwarf Pioneer Wheat',
    scientificName: 'Triticum aestivum (Super-Dwarf)',
    emoji: '🌾',
    category: 'Grain',
    growthDays: 65,
    waterPerKgLiters: 290,
    energyPerKgKwh: 3.1,
    spaceRequiredM2PerKg: 0.22,
    caloriesPerKg: 3400,
    proteinGramsPerKg: 130,
    baseYieldKgPerM2PerCycle: 4.8,
    harvestsPerYear: 5.6,
    temperatureOptimalC: 20,
    temperatureToleranceRange: [12, 26],
    radiationToleranceScore: 92,
    resilienceScore: 80,
    co2Affinity: 'High',
    nutritionalHighlights: [
      'Highest caloric density (3,400 kcal/kg) of all crops',
      'High protein (130g/kg) and dietary fiber',
      'Milling yields flour for bread, pasta, and long-term shelf-stable rations'
    ],
    iconColor: '#F59E0B' // Golden
  },
  {
    id: 'soybean',
    name: 'Bio-Shield Soybean',
    scientificName: 'Glycine max (High-Protein Space Strain)',
    emoji: '🫘',
    category: 'Legume Protein',
    growthDays: 85,
    waterPerKgLiters: 260,
    energyPerKgKwh: 2.5,
    spaceRequiredM2PerKg: 0.20,
    caloriesPerKg: 4460,
    proteinGramsPerKg: 360,
    baseYieldKgPerM2PerCycle: 3.6,
    harvestsPerYear: 4.3,
    temperatureOptimalC: 23,
    temperatureToleranceRange: [15, 29],
    radiationToleranceScore: 86,
    resilienceScore: 88,
    co2Affinity: 'Very High',
    nutritionalHighlights: [
      'Essential complete amino acid profile replacing animal meat',
      'Highest protein density (360g/kg) for muscle mass retention in 0.38g gravity',
      'Fixes atmospheric nitrogen into hydroponic bio-fluid'
    ],
    iconColor: '#10B981' // Emerald
  },
  {
    id: 'carrot',
    name: 'Deep-Reach Nebula Carrot',
    scientificName: 'Daucus carota (Hydroponic Sweet)',
    emoji: '🥕',
    category: 'Staple Root',
    growthDays: 60,
    waterPerKgLiters: 140,
    energyPerKgKwh: 1.4,
    spaceRequiredM2PerKg: 0.14,
    caloriesPerKg: 410,
    proteinGramsPerKg: 9,
    baseYieldKgPerM2PerCycle: 5.4,
    harvestsPerYear: 6.0,
    temperatureOptimalC: 18,
    temperatureToleranceRange: [10, 25],
    radiationToleranceScore: 84,
    resilienceScore: 86,
    co2Affinity: 'Moderate',
    nutritionalHighlights: [
      'Massive Beta-Carotene (Provitamin A) for vision maintenance in low lighting',
      'Low water footprint relative to calorie yield',
      'Fast 60-day turnover with high storage longevity'
    ],
    iconColor: '#F97316' // Orange
  }
];
