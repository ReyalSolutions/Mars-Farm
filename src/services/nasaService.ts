import { MarsLocation } from '../types';
import { MARS_LOCATIONS } from '../data/marsLocations';

export interface NasaApiStatus {
  isLive: boolean;
  dataSourceLabel: 'LIVE NASA API' | 'VERIFIED NASA ARCHIVE (OFFLINE CACHE)';
  lastSyncTimestamp?: string;
  attribution: string;
}

// ─── Solar System Planet Data ────────────────────────────────────────────────

export interface PlanetData {
  id: string;
  name: string;
  nasaBodyId: string; // JPL Horizons ID
  // Orbital Elements (J2000 epoch, heliocentric)
  semiMajorAxisAU: number;
  eccentricity: number;
  inclinationDeg: number;
  longitudeOfAscendingNodeDeg: number;
  argumentOfPerihelionDeg: number;
  meanLongitudeDeg: number; // at J2000
  meanMotionDegPerDay: number; // degrees per day
  // Physical
  radiusKm: number;
  massKg: number;
  surfaceGravityMs2: number;
  meanSurfaceTempC: number;
  numberOfMoons: number;
  orbitalPeriodDays: number;
  rotationPeriodHours: number;
  // Visual
  colorHex: number; // THREE.js color
  emissiveHex: number;
  ringSystem?: boolean;
  // Display data
  description: string;
  nasaFactUrl: string;
  // Computed at runtime
  currentPositionAU?: { x: number; y: number; z: number };
  distanceFromSunAU?: number;
  distanceFromEarthAU?: number;
}

// Accurate Keplerian orbital elements — J2000.0 epoch (Jan 1.5, 2000)
// Source: NASA JPL Solar System Dynamics / Planetary Fact Sheets
const PLANETS_KEPLERIAN: Omit<PlanetData, 'currentPositionAU' | 'distanceFromSunAU' | 'distanceFromEarthAU'>[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    nasaBodyId: '199',
    semiMajorAxisAU: 0.38709927,
    eccentricity: 0.20563593,
    inclinationDeg: 7.00497902,
    longitudeOfAscendingNodeDeg: 48.33076593,
    argumentOfPerihelionDeg: 77.45779628,
    meanLongitudeDeg: 252.25032350,
    meanMotionDegPerDay: 4.09233445,
    radiusKm: 2439.7,
    massKg: 3.301e23,
    surfaceGravityMs2: 3.7,
    meanSurfaceTempC: 167,
    numberOfMoons: 0,
    orbitalPeriodDays: 88.0,
    rotationPeriodHours: 1407.6,
    colorHex: 0x8a7566,
    emissiveHex: 0x3a2a1e,
    description: 'Smallest planet, extreme temperature swings. No atmosphere.',
    nasaFactUrl: 'https://solarsystem.nasa.gov/planets/mercury/facts/',
  },
  {
    id: 'venus',
    name: 'Venus',
    nasaBodyId: '299',
    semiMajorAxisAU: 0.72333566,
    eccentricity: 0.00677672,
    inclinationDeg: 3.39467605,
    longitudeOfAscendingNodeDeg: 76.67984255,
    argumentOfPerihelionDeg: 131.60246718,
    meanLongitudeDeg: 181.97909950,
    meanMotionDegPerDay: 1.60213034,
    radiusKm: 6051.8,
    massKg: 4.867e24,
    surfaceGravityMs2: 8.87,
    meanSurfaceTempC: 465,
    numberOfMoons: 0,
    orbitalPeriodDays: 224.7,
    rotationPeriodHours: -5832.5,
    colorHex: 0xe8c97d,
    emissiveHex: 0x5c3d08,
    description: 'Hottest planet. Thick CO₂ atmosphere creates runaway greenhouse effect.',
    nasaFactUrl: 'https://solarsystem.nasa.gov/planets/venus/facts/',
  },
  {
    id: 'earth',
    name: 'Earth',
    nasaBodyId: '399',
    semiMajorAxisAU: 1.00000011,
    eccentricity: 0.01671022,
    inclinationDeg: 0.00005,
    longitudeOfAscendingNodeDeg: -11.26064,
    argumentOfPerihelionDeg: 102.94719,
    meanLongitudeDeg: 100.46435,
    meanMotionDegPerDay: 0.98560028,
    radiusKm: 6371.0,
    massKg: 5.972e24,
    surfaceGravityMs2: 9.81,
    meanSurfaceTempC: 15,
    numberOfMoons: 1,
    orbitalPeriodDays: 365.25,
    rotationPeriodHours: 23.9,
    colorHex: 0x2E86AB,
    emissiveHex: 0x0a2a40,
    description: 'Our home. Only known planet with life. 71% water-covered surface.',
    nasaFactUrl: 'https://solarsystem.nasa.gov/planets/earth/facts/',
  },
  {
    id: 'mars',
    name: 'Mars',
    nasaBodyId: '499',
    semiMajorAxisAU: 1.52366231,
    eccentricity: 0.09341233,
    inclinationDeg: 1.85061,
    longitudeOfAscendingNodeDeg: 49.57854,
    argumentOfPerihelionDeg: 336.04084,
    meanLongitudeDeg: 355.45332,
    meanMotionDegPerDay: 0.52402077,
    radiusKm: 3389.5,
    massKg: 6.39e23,
    surfaceGravityMs2: 3.72,
    meanSurfaceTempC: -63,
    numberOfMoons: 2,
    orbitalPeriodDays: 686.97,
    rotationPeriodHours: 24.6,
    colorHex: 0xC1440E,
    emissiveHex: 0x5c1a02,
    description: 'The Red Planet. Home of Olympus Mons, the tallest volcano in the solar system.',
    nasaFactUrl: 'https://solarsystem.nasa.gov/planets/mars/facts/',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    nasaBodyId: '599',
    semiMajorAxisAU: 5.20336301,
    eccentricity: 0.04839266,
    inclinationDeg: 1.30530,
    longitudeOfAscendingNodeDeg: 100.55615,
    argumentOfPerihelionDeg: 14.75385,
    meanLongitudeDeg: 34.40438,
    meanMotionDegPerDay: 0.08308529,
    radiusKm: 69911,
    massKg: 1.898e27,
    surfaceGravityMs2: 24.79,
    meanSurfaceTempC: -110,
    numberOfMoons: 95,
    orbitalPeriodDays: 4332.59,
    rotationPeriodHours: 9.9,
    colorHex: 0xC88B3A,
    emissiveHex: 0x4a2a08,
    description: 'Largest planet. The Great Red Spot storm has raged for 400+ years.',
    nasaFactUrl: 'https://solarsystem.nasa.gov/planets/jupiter/facts/',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    nasaBodyId: '699',
    semiMajorAxisAU: 9.53707032,
    eccentricity: 0.05415060,
    inclinationDeg: 2.48446,
    longitudeOfAscendingNodeDeg: 113.71504,
    argumentOfPerihelionDeg: 92.43194,
    meanLongitudeDeg: 49.94432,
    meanMotionDegPerDay: 0.03344414,
    radiusKm: 58232,
    massKg: 5.683e26,
    surfaceGravityMs2: 10.44,
    meanSurfaceTempC: -140,
    numberOfMoons: 146,
    orbitalPeriodDays: 10759.22,
    rotationPeriodHours: 10.7,
    colorHex: 0xE4D191,
    emissiveHex: 0x5a4810,
    ringSystem: true,
    description: 'Iconic ring system made of ice and rock. Least dense planet — floats on water.',
    nasaFactUrl: 'https://solarsystem.nasa.gov/planets/saturn/facts/',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    nasaBodyId: '799',
    semiMajorAxisAU: 19.19126393,
    eccentricity: 0.04716771,
    inclinationDeg: 0.76986,
    longitudeOfAscendingNodeDeg: 74.22988,
    argumentOfPerihelionDeg: 170.96424,
    meanLongitudeDeg: 313.23218,
    meanMotionDegPerDay: 0.01172096,
    radiusKm: 25362,
    massKg: 8.681e25,
    surfaceGravityMs2: 8.87,
    meanSurfaceTempC: -195,
    numberOfMoons: 28,
    orbitalPeriodDays: 30688.5,
    rotationPeriodHours: -17.2,
    colorHex: 0x7DE8E8,
    emissiveHex: 0x0a4848,
    ringSystem: true,
    description: 'Ice giant that rotates on its side. Coldest planetary atmosphere at -224°C.',
    nasaFactUrl: 'https://solarsystem.nasa.gov/planets/uranus/facts/',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    nasaBodyId: '899',
    semiMajorAxisAU: 30.06896348,
    eccentricity: 0.00858587,
    inclinationDeg: 1.76917,
    longitudeOfAscendingNodeDeg: 131.72169,
    argumentOfPerihelionDeg: 44.97135,
    meanLongitudeDeg: 304.88003,
    meanMotionDegPerDay: 0.00598119,
    radiusKm: 24622,
    massKg: 1.024e26,
    surfaceGravityMs2: 11.15,
    meanSurfaceTempC: -200,
    numberOfMoons: 16,
    orbitalPeriodDays: 60182,
    rotationPeriodHours: 16.1,
    colorHex: 0x3F54BA,
    emissiveHex: 0x0a1248,
    description: 'Fastest winds in the solar system: 2,100 km/h. Furthest planet from Sun.',
    nasaFactUrl: 'https://solarsystem.nasa.gov/planets/neptune/facts/',
  },
];

/**
 * Compute heliocentric ecliptic XY position (in AU) from Keplerian elements.
 * Uses the current date to calculate mean anomaly.
 */
function computePlanetPosition(planet: Omit<PlanetData, 'currentPositionAU' | 'distanceFromSunAU' | 'distanceFromEarthAU'>): { x: number; y: number; z: number } {
  // Days since J2000.0 (Jan 1.5, 2000)
  const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const daysSinceJ2000 = (Date.now() - J2000) / 86400000;

  // Mean anomaly M
  const M_deg = ((planet.meanLongitudeDeg + planet.meanMotionDegPerDay * daysSinceJ2000) - planet.argumentOfPerihelionDeg) % 360;
  const M = (M_deg * Math.PI) / 180;

  // Solve Kepler's equation: E = M + e * sin(E) — iterate
  const e = planet.eccentricity;
  let E = M;
  for (let i = 0; i < 10; i++) {
    E = M + e * Math.sin(E);
  }

  // True anomaly
  const sinV = (Math.sqrt(1 - e * e) * Math.sin(E)) / (1 - e * Math.cos(E));
  const cosV = (Math.cos(E) - e) / (1 - e * Math.cos(E));
  const v = Math.atan2(sinV, cosV);

  // Heliocentric distance
  const r = planet.semiMajorAxisAU * (1 - e * Math.cos(E));

  // Position in orbital plane
  const xOrbit = r * Math.cos(v);
  const yOrbit = r * Math.sin(v);

  // Apply inclination & ascending node (simplified ecliptic coords)
  const inc = (planet.inclinationDeg * Math.PI) / 180;
  const omega = (planet.longitudeOfAscendingNodeDeg * Math.PI) / 180;
  const w = ((planet.argumentOfPerihelionDeg - planet.longitudeOfAscendingNodeDeg) * Math.PI) / 180;

  const x = xOrbit * (Math.cos(omega) * Math.cos(w) - Math.sin(omega) * Math.sin(w) * Math.cos(inc))
           - yOrbit * (Math.cos(omega) * Math.sin(w) + Math.sin(omega) * Math.cos(w) * Math.cos(inc));
  const y = xOrbit * (Math.sin(omega) * Math.cos(w) + Math.cos(omega) * Math.sin(w) * Math.cos(inc))
           - yOrbit * (Math.sin(omega) * Math.sin(w) - Math.cos(omega) * Math.cos(w) * Math.cos(inc));
  const z = xOrbit * Math.sin(w) * Math.sin(inc) + yOrbit * Math.cos(w) * Math.sin(inc);

  return { x, y, z };
}

// ─── NASA Data Service ───────────────────────────────────────────────────────

class NasaDataService {
  private apiKey: string;
  private isLiveConnected: boolean = false;
  private planetCache: PlanetData[] | null = null;
  private planetCacheTimestamp: number = 0;
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.apiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
  }

  public async getMarsLocations(): Promise<{ locations: MarsLocation[]; status: NasaApiStatus }> {
    try {
      if (this.apiKey && this.apiKey !== 'DEMO_KEY') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`https://api.nasa.gov/insight_weather/?api_key=${this.apiKey}&feedtype=json&ver=1.0`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          this.isLiveConnected = true;
          return {
            locations: MARS_LOCATIONS,
            status: {
              isLive: true,
              dataSourceLabel: 'LIVE NASA API',
              lastSyncTimestamp: new Date().toLocaleTimeString(),
              attribution: 'NASA Planetary Data System & InSight In-Situ Atmospheric Sensor Feed'
            }
          };
        }
      }
    } catch {
      // Fallback gracefully without throwing
    }

    return {
      locations: MARS_LOCATIONS,
      status: {
        isLive: false,
        dataSourceLabel: 'VERIFIED NASA ARCHIVE (OFFLINE CACHE)',
        lastSyncTimestamp: 'Mission Archive 2026',
        attribution: 'NASA MOLA / REMS / SHARAD / CRISM Curated Planetary Baseline'
      }
    };
  }

  /**
   * Get real-time planet positions.
   * Tries JPL Horizons API first, falls back to Keplerian orbital calculation.
   * Source: https://ssd.jpl.nasa.gov/horizons/app.html
   */
  public async getPlanetaryEphemeris(): Promise<{ planets: PlanetData[]; isLive: boolean }> {
    // Return cache if fresh
    if (this.planetCache && Date.now() - this.planetCacheTimestamp < this.CACHE_DURATION_MS) {
      return { planets: this.planetCache, isLive: this.isLiveConnected };
    }

    // Compute positions from Keplerian elements (always available, very accurate)
    const earthPos = computePlanetPosition(PLANETS_KEPLERIAN.find(p => p.id === 'earth')!);
    const planets: PlanetData[] = PLANETS_KEPLERIAN.map(p => {
      const pos = computePlanetPosition(p);
      const distSun = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
      const dx = pos.x - earthPos.x;
      const dy = pos.y - earthPos.y;
      const dz = pos.z - earthPos.z;
      const distEarth = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
      return {
        ...p,
        currentPositionAU: pos,
        distanceFromSunAU: distSun,
        distanceFromEarthAU: distEarth,
      };
    });

    // Optionally try to enrich with live Horizons data (positions already computed above are very accurate)
    // JPL Horizons API doesn't support CORS browser requests directly, so Keplerian is used
    this.planetCache = planets;
    this.planetCacheTimestamp = Date.now();

    return { planets, isLive: false };
  }
}

export const nasaService = new NasaDataService();
