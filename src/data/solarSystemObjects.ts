// Accurate NASA Solar System Minor Bodies, Moons, Comets, and Space Probes
// Sources: NASA JPL Small-Body Database, NASA Planetary Data System, IAU Minor Planet Center

export interface MinorBodyData {
  id: string;
  name: string;
  type: 'dwarf-planet' | 'asteroid' | 'near-earth' | 'comet' | 'moon' | 'spacecraft';
  nasaDesignation: string;
  // Orbital Elements (heliocentric AU, or relative to parent if moon)
  semiMajorAxisAU: number;
  eccentricity: number;
  inclinationDeg: number;
  orbitalPeriodDays: number;
  parentPlanetId?: string;
  // Physical Characteristics
  diameterKm: number;
  surfaceGravityMs2?: number;
  meanSurfaceTempC?: number;
  discoveryYear?: number;
  colorHex: number;
  // Scientific NASA Context
  description: string;
  latestMissionOrFact: string;
  nasaFactUrl: string;
  isHyperbolic?: boolean;
}

// ─── 1. Major Asteroids & Dwarf Planets ────────────────────────────────────────

export const NOTABLE_ASTEROIDS: MinorBodyData[] = [
  {
    id: 'ceres',
    name: '1 Ceres',
    type: 'dwarf-planet',
    nasaDesignation: '1 Ceres / JPL SP-ID 2000001',
    semiMajorAxisAU: 2.767,
    eccentricity: 0.076,
    inclinationDeg: 10.59,
    orbitalPeriodDays: 1682,
    diameterKm: 939.4,
    surfaceGravityMs2: 0.28,
    meanSurfaceTempC: -105,
    discoveryYear: 1801,
    colorHex: 0xd8c8b8,
    description: 'The largest object in the asteroid belt and the only dwarf planet in the inner solar system. Explored extensively by NASA Dawn.',
    latestMissionOrFact: 'NASA Dawn discovered bright sodium carbonate salt deposits in Occator Crater, suggesting ongoing brine percolation from a deep subsurface reservoir.',
    nasaFactUrl: 'https://science.nasa.gov/dwarf-planets/ceres/',
  },
  {
    id: 'vesta',
    name: '4 Vesta',
    type: 'asteroid',
    nasaDesignation: '4 Vesta / JPL SP-ID 2000004',
    semiMajorAxisAU: 2.362,
    eccentricity: 0.089,
    inclinationDeg: 7.14,
    orbitalPeriodDays: 1325,
    diameterKm: 525.4,
    surfaceGravityMs2: 0.25,
    meanSurfaceTempC: -130,
    discoveryYear: 1807,
    colorHex: 0xb5a08e,
    description: 'A differentiated rocky protoplanet with metallic core and basaltic crust. Survived catastrophic impacts that created the South Pole Rheasilvia basin.',
    latestMissionOrFact: 'Source of over 5% of all meteorites found on Earth (HED meteorites), confirmed by NASA Dawn spectrometer data.',
    nasaFactUrl: 'https://science.nasa.gov/vesta/',
  },
  {
    id: 'pallas',
    name: '2 Pallas',
    type: 'asteroid',
    nasaDesignation: '2 Pallas / JPL SP-ID 2000002',
    semiMajorAxisAU: 2.773,
    eccentricity: 0.231,
    inclinationDeg: 34.84,
    orbitalPeriodDays: 1686,
    diameterKm: 512,
    surfaceGravityMs2: 0.21,
    meanSurfaceTempC: -110,
    discoveryYear: 1802,
    colorHex: 0x9e9890,
    description: 'Third-largest asteroid with an unusually steep 35-degree orbital inclination, making it travel far above and below the solar system ecliptic plane.',
    latestMissionOrFact: 'High-angular-resolution imaging reveals a heavily cratered golf-ball surface caused by hypervelocity collisions due to its tilted orbit.',
    nasaFactUrl: 'https://science.nasa.gov/solar-system/asteroids/2-pallas/',
  },
  {
    id: 'bennu',
    name: '101955 Bennu',
    type: 'near-earth',
    nasaDesignation: '101955 Bennu / OSIRIS-REx',
    semiMajorAxisAU: 1.126,
    eccentricity: 0.204,
    inclinationDeg: 6.03,
    orbitalPeriodDays: 436.6,
    diameterKm: 0.492,
    surfaceGravityMs2: 0.00001,
    meanSurfaceTempC: -35,
    discoveryYear: 1999,
    colorHex: 0x4a5568,
    description: 'A carbon-rich rubble-pile near-Earth asteroid containing primitive organic molecules and water-bearing minerals from the early solar system.',
    latestMissionOrFact: 'NASA OSIRIS-REx successfully returned 121.6 grams of pristine pristine Bennu surface material to Earth in September 2023, revealing abundant water and carbon.',
    nasaFactUrl: 'https://science.nasa.gov/mission/osiris-rex/',
  },
  {
    id: 'apophis',
    name: '99942 Apophis',
    type: 'near-earth',
    nasaDesignation: '99942 Apophis / JPL SP-ID 2099942',
    semiMajorAxisAU: 0.922,
    eccentricity: 0.191,
    inclinationDeg: 3.33,
    orbitalPeriodDays: 323.6,
    diameterKm: 0.370,
    surfaceGravityMs2: 0.000008,
    meanSurfaceTempC: -40,
    discoveryYear: 2004,
    colorHex: 0x718096,
    description: 'A famous near-Earth asteroid that will safely fly by Earth on April 13, 2029, passing within 31,600 km—closer than geostationary satellites.',
    latestMissionOrFact: 'NASA redirected the OSIRIS-APEX spacecraft to rendezvous with Apophis immediately after its close Earth tidal encounter in 2029.',
    nasaFactUrl: 'https://science.nasa.gov/mission/osiris-apex/',
  },
  {
    id: 'pluto',
    name: '134340 Pluto',
    type: 'dwarf-planet',
    nasaDesignation: '134340 Pluto / New Horizons',
    semiMajorAxisAU: 39.482,
    eccentricity: 0.249,
    inclinationDeg: 17.16,
    orbitalPeriodDays: 90560,
    diameterKm: 2376.6,
    surfaceGravityMs2: 0.62,
    meanSurfaceTempC: -229,
    discoveryYear: 1930,
    colorHex: 0xd6c2a8,
    description: 'The king of the Kuiper Belt with a complex nitrogen-methane atmosphere, cryovolcanoes, and the vast Sputnik Planitia nitrogen-ice glacier.',
    latestMissionOrFact: 'NASA New Horizons demonstrated Pluto is geologically active with convective ice plains, water-ice mountains 3,500m high, and 5 moons.',
    nasaFactUrl: 'https://science.nasa.gov/dwarf-planets/pluto/',
  },
];

// ─── 2. Famous Comets With Dynamic Solar Tails ─────────────────────────────────

export interface CometData extends MinorBodyData {
  perihelionAU: number;
  aphelionAU: number;
  tailLengthScale: number;
}

export const FAMOUS_COMETS: CometData[] = [
  {
    id: 'halley',
    name: '1P/Halley',
    type: 'comet',
    nasaDesignation: '1P/Halley (Halley\'s Comet)',
    semiMajorAxisAU: 17.834,
    eccentricity: 0.967,
    inclinationDeg: 162.26, // Retrograde
    orbitalPeriodDays: 27500, // ~75.3 years
    perihelionAU: 0.586,
    aphelionAU: 35.082,
    tailLengthScale: 4.5,
    diameterKm: 11.0,
    discoveryYear: 1758,
    colorHex: 0x00ffff,
    description: 'The most famous periodic comet, returning every 75-76 years. Next perihelion passage will occur in mid-2061.',
    latestMissionOrFact: 'Parent body of the Orionid and Eta Aquariid meteor showers. Nucleus is pitch black with an albedo of just 0.04.',
    nasaFactUrl: 'https://science.nasa.gov/solar-system/comets/1p-halley/',
  },
  {
    id: '67p',
    name: '67P/Churyumov-Gerasimenko',
    type: 'comet',
    nasaDesignation: '67P/C-G (ESA Rosetta Target)',
    semiMajorAxisAU: 3.463,
    eccentricity: 0.641,
    inclinationDeg: 7.04,
    orbitalPeriodDays: 2356, // ~6.45 years
    perihelionAU: 1.243,
    aphelionAU: 5.683,
    tailLengthScale: 2.8,
    diameterKm: 4.1,
    discoveryYear: 1969,
    colorHex: 0x67e8f9,
    description: 'Contact-binary duck-shaped comet explored up close for over two years by the ESA Rosetta spacecraft and Philae lander.',
    latestMissionOrFact: 'Rosetta detected glycine (the simplest amino acid) and phosphorus, essential building blocks of terrestrial life, in 67P\'s coma gas.',
    nasaFactUrl: 'https://science.nasa.gov/solar-system/comets/67p-churyumov-gerasimenko/',
  },
  {
    id: 'neowise',
    name: 'C/2020 F3 (NEOWISE)',
    type: 'comet',
    nasaDesignation: 'C/2020 F3 / NEOWISE',
    semiMajorAxisAU: 360.0,
    eccentricity: 0.9992,
    inclinationDeg: 128.94,
    orbitalPeriodDays: 2480000, // ~6,800 years
    perihelionAU: 0.295,
    aphelionAU: 715.0,
    tailLengthScale: 5.2,
    diameterKm: 5.0,
    discoveryYear: 2020,
    colorHex: 0x38bdf8,
    description: 'Spectacular bright naked-eye comet discovered in March 2020 by NASA\'s Wide-field Infrared Survey Explorer (NEOWISE).',
    latestMissionOrFact: 'Developed a dual tail extending over 30 degrees across the sky: a curving white dust tail and a glowing ionized sodium/gas tail.',
    nasaFactUrl: 'https://science.nasa.gov/missions/neowise/',
  },
  {
    id: 'oumuamua',
    name: '1I/\'Oumuamua',
    type: 'comet',
    nasaDesignation: '1I/2017 U1 (First Interstellar Object)',
    semiMajorAxisAU: -1.27, // Hyperbolic
    eccentricity: 1.20,
    inclinationDeg: 122.68,
    orbitalPeriodDays: 0,
    perihelionAU: 0.255,
    aphelionAU: 9999,
    tailLengthScale: 1.2,
    diameterKm: 0.23,
    discoveryYear: 2017,
    colorHex: 0xf87171,
    isHyperbolic: true,
    description: 'The first confirmed interstellar visitor from outside our solar system, discovered passing at hypervelocity in October 2017.',
    latestMissionOrFact: 'Exhibited non-gravitational acceleration likely caused by outgassing of entrapped molecular hydrogen ice from deep interstellar space.',
    nasaFactUrl: 'https://science.nasa.gov/solar-system/comets/oumuamua/',
  },
];

// ─── 3. Detailed Planetary Moon Systems ───────────────────────────────────────

export interface DetailedMoonData {
  id: string;
  name: string;
  parentPlanetId: string;
  semiMajorAxisKm: number;
  orbitalPeriodDays: number;
  diameterKm: number;
  colorHex: number;
  roughness: number;
  hasSubsurfaceOcean?: boolean;
  hasAtmosphere?: boolean;
  specialFeature: string;
  nasaFact: string;
}

export const DETAILED_MOONS: DetailedMoonData[] = [
  // ── Earth ──
  {
    id: 'moon',
    name: 'The Moon (Luna)',
    parentPlanetId: 'earth',
    semiMajorAxisKm: 384400,
    orbitalPeriodDays: 27.32,
    diameterKm: 3474.8,
    colorHex: 0xd8d8d8,
    roughness: 0.9,
    specialFeature: 'Tidally locked with vast basaltic lunar maria and permanently shadowed south pole craters harboring water ice.',
    nasaFact: 'NASA Artemis campaign is preparing to land humans back on the lunar south pole near Shackleton Crater for sustainable habitat construction.',
  },

  // ── Mars (2 Moons) ──
  {
    id: 'phobos',
    name: 'Phobos',
    parentPlanetId: 'mars',
    semiMajorAxisKm: 9376,
    orbitalPeriodDays: 0.3189, // 7.66 hours
    diameterKm: 22.2,
    colorHex: 0x8a7e78,
    roughness: 0.95,
    specialFeature: 'Orbits Mars faster than Mars rotates! Rises in the west and sets in the east twice every Martian day.',
    nasaFact: 'Tidal drag is pulling Phobos 1.8 meters closer every century; in 30–50 million years it will break apart into a Martian planetary ring.',
  },
  {
    id: 'deimos',
    name: 'Deimos',
    parentPlanetId: 'mars',
    semiMajorAxisKm: 23463,
    orbitalPeriodDays: 1.263, // 30.3 hours
    diameterKm: 12.4,
    colorHex: 0x9b9088,
    roughness: 0.9,
    specialFeature: 'Smooth, crater-filled regolith blanket giving it a softer, pillow-like appearance compared to Phobos.',
    nasaFact: 'UAE Hope Probe conducted historic ultra-close 100 km flybys in 2023, revealing a carbon-rich basaltic composition similar to Mars crust.',
  },

  // ── Jupiter (Galilean Moons — 95 Moons Total) ──
  {
    id: 'io',
    name: 'Io',
    parentPlanetId: 'jupiter',
    semiMajorAxisKm: 421700,
    orbitalPeriodDays: 1.769,
    diameterKm: 3643.2,
    colorHex: 0xf5d061,
    roughness: 0.8,
    specialFeature: 'The most volcanically active body in the solar system, with 400+ active silicate volcanoes erupting sulfur 500 km high.',
    nasaFact: 'NASA Juno conducted 1,500 km close passes in 2024, revealing magma lakes with molten lava islands and convective mantle turbulence.',
  },
  {
    id: 'europa',
    name: 'Europa',
    parentPlanetId: 'jupiter',
    semiMajorAxisKm: 670900,
    orbitalPeriodDays: 3.551,
    diameterKm: 3121.6,
    colorHex: 0xe0e7ff,
    roughness: 0.7,
    hasSubsurfaceOcean: true,
    specialFeature: 'Global liquid water ocean containing more water than all Earth\'s oceans combined, capped by a 15–25 km ice shell.',
    nasaFact: 'NASA Europa Clipper launched in October 2024 equipped with ice-penetrating radar to evaluate subsurface habitability and water plumes.',
  },
  {
    id: 'ganymede',
    name: 'Ganymede',
    parentPlanetId: 'jupiter',
    semiMajorAxisKm: 1070400,
    orbitalPeriodDays: 7.155,
    diameterKm: 5268.2,
    colorHex: 0x9c9488,
    roughness: 0.85,
    hasSubsurfaceOcean: true,
    specialFeature: 'Largest moon in the solar system (larger than Mercury and Pluto), and the only moon known to generate its own intrinsic magnetic field.',
    nasaFact: 'ESA JUICE spacecraft will enter permanent orbit around Ganymede in 2034 to study its magnetic auroral belt and saline ocean.',
  },
  {
    id: 'callisto',
    name: 'Callisto',
    parentPlanetId: 'jupiter',
    semiMajorAxisKm: 1882700,
    orbitalPeriodDays: 16.689,
    diameterKm: 4820.6,
    colorHex: 0x766c62,
    roughness: 0.95,
    specialFeature: 'Most heavily cratered object in the solar system; an un-differentiated ancient ice-rock time capsule with lowest radiation exposure near Jupiter.',
    nasaFact: 'Primary candidate for future crewed exploration base stations outside the intense radiation belts of inner Jovian space.',
  },

  // ── Saturn (146 Moons Total) ──
  {
    id: 'titan',
    name: 'Titan',
    parentPlanetId: 'saturn',
    semiMajorAxisKm: 1221870,
    orbitalPeriodDays: 15.945,
    diameterKm: 5149.5,
    colorHex: 0xe0a944,
    roughness: 0.6,
    hasAtmosphere: true,
    hasSubsurfaceOcean: true,
    specialFeature: 'Only moon with a dense nitrogen-methane atmosphere (1.5x Earth pressure) and active weather cycles with lakes of liquid ethane and methane.',
    nasaFact: 'NASA Dragonfly rotorcraft lander is scheduled to arrive in 2034 to fly between dozens of prebiotic organic chemistry sites.',
  },
  {
    id: 'enceladus',
    name: 'Enceladus',
    parentPlanetId: 'saturn',
    semiMajorAxisKm: 238000,
    orbitalPeriodDays: 1.370,
    diameterKm: 504.2,
    colorHex: 0xffffff,
    roughness: 0.5,
    hasSubsurfaceOcean: true,
    specialFeature: 'The most reflective body in the solar system (albedo ~0.99), feeding Saturn\'s outer E-ring via supersonic ice geysers.',
    nasaFact: 'Cassini flew directly through the south pole geyser plumes, sampling molecular hydrogen, organic macromolecules, and phosphorus.',
  },
  {
    id: 'mimas',
    name: 'Mimas',
    parentPlanetId: 'saturn',
    semiMajorAxisKm: 185520,
    orbitalPeriodDays: 0.942,
    diameterKm: 396.4,
    colorHex: 0xcccccc,
    roughness: 0.9,
    specialFeature: 'Dominated by the 130 km Herschel impact crater, giving it an iconic resemblance to the Death Star.',
    nasaFact: '2024 libration analysis by European researchers suggests a young hidden global liquid ocean 20–30 km beneath its cratered shell.',
  },
  {
    id: 'iapetus',
    name: 'Iapetus',
    parentPlanetId: 'saturn',
    semiMajorAxisKm: 3561300,
    orbitalPeriodDays: 79.33,
    diameterKm: 1469.0,
    colorHex: 0xd2c0a5,
    roughness: 0.85,
    specialFeature: 'Extreme two-tone contrast: leading hemisphere is coal-black (albedo 0.04) while trailing hemisphere is brilliant white ice (albedo 0.6).',
    nasaFact: 'Features an unexplained 20 km high, 1,300 km long equatorial mountain ridge that circles the moon like a walnut seam.',
  },

  // ── Uranus (28 Moons Total) ──
  {
    id: 'miranda',
    name: 'Miranda',
    parentPlanetId: 'uranus',
    semiMajorAxisKm: 129390,
    orbitalPeriodDays: 1.413,
    diameterKm: 471.6,
    colorHex: 0xc4dede,
    roughness: 0.9,
    specialFeature: 'Chaotic patchwork jigsaw terrain with giant chevron coronae and Verona Rupes—the tallest cliff in the solar system (20 km sheer drop).',
    nasaFact: 'Photographed during Voyager 2\'s close 1986 flyby; extreme tidal heating during past orbital resonance generated its tectonic scars.',
  },
  {
    id: 'titania',
    name: 'Titania',
    parentPlanetId: 'uranus',
    semiMajorAxisKm: 435910,
    orbitalPeriodDays: 8.706,
    diameterKm: 1577.8,
    colorHex: 0xa9c0c0,
    roughness: 0.85,
    specialFeature: 'Largest moon of Uranus, laced with huge grabens and fault scarps (Messina Chasma) hundreds of kilometers long.',
    nasaFact: 'Infrared spectroscopy indicates Titania has surface carbon dioxide ice alongside water ice.',
  },

  // ── Neptune (16 Moons Total) ──
  {
    id: 'triton',
    name: 'Triton',
    parentPlanetId: 'neptune',
    semiMajorAxisKm: 354760,
    orbitalPeriodDays: 5.877, // Retrograde
    diameterKm: 2706.8,
    colorHex: 0xbcd8e8,
    roughness: 0.75,
    hasAtmosphere: true,
    specialFeature: 'Only large moon in the solar system orbiting retrograde; a captured dwarf planet from the Kuiper Belt with unique cantaloupe terrain.',
    nasaFact: 'Voyager 2 observed active cryovolcanic geysers erupting nitrogen gas and dark dust plumes 8 km into its thin atmosphere.',
  },
];

// ─── 4. Spacecraft & Historic NASA Space Probes ────────────────────────────────

export interface SpacecraftData {
  id: string;
  name: string;
  destination: string;
  heliocentricDistanceAU: number;
  launchYear: number;
  endYear?: number;
  colorHex: number;
  trajectoryAngleRad: number;
  description: string;
  latestStatus: string;
  nasaFactUrl: string;
  orbitingBodyId?: string; // e.g. 'earth', 'mars', 'saturn'
  orbitalAltitudeScale?: number;
  orbitalSpeed?: number;
}

export const HISTORIC_SPACECRAFT: SpacecraftData[] = [
  {
    id: 'iss',
    name: 'International Space Station (ISS)',
    destination: 'Low Earth Orbit (LEO, 420 km)',
    heliocentricDistanceAU: 1.0,
    launchYear: 1998,
    colorHex: 0x38bdf8,
    trajectoryAngleRad: 0.0,
    orbitingBodyId: 'earth',
    orbitalAltitudeScale: 1.25,
    orbitalSpeed: 0.8,
    description: 'Humanity\'s microgravity scientific laboratory continuously inhabited since November 2000, spanning the size of a football field with 8 giant photovoltaic solar wings.',
    latestStatus: 'Conducting advanced crystallization experiments, human physiology space endurance studies, and Earth environmental monitoring.',
    nasaFactUrl: 'https://www.nasa.gov/international-space-station/',
  },
  {
    id: 'hubble',
    name: 'Hubble Space Telescope (HST)',
    destination: 'Low Earth Orbit (540 km)',
    heliocentricDistanceAU: 1.0,
    launchYear: 1990,
    colorHex: 0xa855f7,
    trajectoryAngleRad: 0.0,
    orbitingBodyId: 'earth',
    orbitalAltitudeScale: 1.38,
    orbitalSpeed: 0.65,
    description: 'Revolutionary 2.4-meter optical and ultraviolet space observatory that has made over 1.6 million observations, pin-pointing the expansion rate and age of the universe.',
    latestStatus: 'Operating in synergy with JWST, delivering high-resolution optical and UV spectra of deep space phenomena.',
    nasaFactUrl: 'https://hubblesite.org/',
  },
  {
    id: 'jwst',
    name: 'James Webb Space Telescope (JWST)',
    destination: 'Sun-Earth L2 Lagrange Point (1.5M km)',
    heliocentricDistanceAU: 1.01,
    launchYear: 2021,
    colorHex: 0xf59e0b,
    trajectoryAngleRad: 0.0,
    description: 'NASA\'s premier infrared observatory with a 6.5-meter gold beryllium primary mirror and tennis-court sized 5-layer Kapton sunshield, imaging the earliest cosmic dawn.',
    latestStatus: 'Discovering ancient supermassive black holes in the early universe, detecting carbon dioxide and methane in exoplanet atmospheres.',
    nasaFactUrl: 'https://webb.nasa.gov/',
  },
  {
    id: 'mro',
    name: 'Mars Reconnaissance Orbiter (MRO)',
    destination: 'Mars Science Orbit (300 km)',
    heliocentricDistanceAU: 1.524,
    launchYear: 2005,
    colorHex: 0xef4444,
    trajectoryAngleRad: 0.0,
    orbitingBodyId: 'mars',
    orbitalAltitudeScale: 1.28,
    orbitalSpeed: 0.75,
    description: 'NASA\'s supreme orbital reconnaissance satellite carrying the 0.5-meter HiRISE camera, mapping Mars landing sites and relaying 80% of all rover data from the surface.',
    latestStatus: 'Providing ultra-high-resolution 30-cm/pixel terrain models, tracking recurring slope lineae (RSL), and supporting active Mars rovers.',
    nasaFactUrl: 'https://science.nasa.gov/mission/mro/',
  },
  {
    id: 'cassini',
    name: 'Cassini-Huygens',
    destination: 'Saturn System & Grand Finale',
    heliocentricDistanceAU: 9.58,
    launchYear: 1997,
    endYear: 2017.7,
    colorHex: 0xeab308,
    trajectoryAngleRad: 0.0,
    orbitingBodyId: 'saturn',
    orbitalAltitudeScale: 1.45,
    orbitalSpeed: 0.45,
    description: 'Historic Saturn flagship orbiter that discovered Enceladus water geysers, explored Titan\'s liquid methane lakes, and executed 22 daring dives inside Saturn\'s rings.',
    latestStatus: 'Completed its celebrated Grand Finale plunge into Saturn\'s upper atmosphere; science data continues to unlock planetary science discoveries.',
    nasaFactUrl: 'https://science.nasa.gov/mission/cassini/',
  },
  {
    id: 'new-horizons',
    name: 'New Horizons',
    destination: 'Outer Kuiper Belt',
    heliocentricDistanceAU: 59.2,
    launchYear: 2006,
    colorHex: 0xec4899,
    trajectoryAngleRad: 4.85,
    description: 'First spacecraft to explore Pluto and its moons up close in 2015, followed by the contact-binary Kuiper Belt planetesimal Arrokoth in 2019.',
    latestStatus: 'Measuring cosmic optical background and dust densities at the furthest frontiers of the Kuiper Belt.',
    nasaFactUrl: 'https://science.nasa.gov/mission/new-horizons/',
  },
  {
    id: 'voyager-1',
    name: 'Voyager 1',
    destination: 'Interstellar Space (Heliopause)',
    heliocentricDistanceAU: 163.5,
    launchYear: 1977,
    colorHex: 0x38bdf8,
    trajectoryAngleRad: 0.65,
    description: 'The most distant human artifact in existence, flying beyond the Sun\'s heliosphere and directly sampling interstellar gas and galactic cosmic rays.',
    latestStatus: 'Transmitting science data across 24.5 billion km; radio communications take over 22.5 hours each way at light speed.',
    nasaFactUrl: 'https://voyager.jpl.nasa.gov/mission/status/',
  },
];
