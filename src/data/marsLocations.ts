import { MarsLocation } from '../types';

export const MARS_LOCATIONS: MarsLocation[] = [
  {
    id: 'jezero-crater',
    name: 'Jezero Crater',
    arabicOrAncientName: 'Ancient Lake Delta',
    type: 'Crater',
    latitude: 18.38,
    longitude: 77.58,
    elevationKm: -2.5,
    temperatureMeanC: -58,
    temperatureMinC: -88,
    temperatureMaxC: -15,
    solarIrradianceWm2: 175,
    solarPotentialScore: 84,
    waterIcePotential: 'Moderate',
    waterPotentialScore: 78,
    radiationLevel: 'Moderate',
    radiationScore: 76,
    dustStormRisk: 'Moderate',
    dustRiskScore: 70,
    terrainScore: 88,
    sourceDataset: 'NASA Mars 2020 Perseverance / CRISM / HiRISE',
    sourceType: 'NASA MOLA / TES / InSight / Mars Odyssey',
    description: 'An ancient river-lake system rich in clay minerals and carbonates with relatively flat crater floor terrain, making it ideal for greenhouse anchoring and subsurface mineral extraction.',
    advantages: [
      'Rich clay minerals & accessible ancient delta sediments',
      'Shielded crater walls reduce extreme surface wind shears',
      'High orbital imaging resolution and rover ground-truth data'
    ],
    challenges: [
      'Seasonal diurnal temperature swings up to 73°C',
      'Subsurface regolith requires heavy perchlorate leaching'
    ]
  },
  {
    id: 'gale-crater',
    name: 'Gale Crater (Mt. Sharp Foothills)',
    arabicOrAncientName: 'Aeolis Palus',
    type: 'Crater',
    latitude: -4.59,
    longitude: 137.44,
    elevationKm: -4.5,
    temperatureMeanC: -48,
    temperatureMinC: -78,
    temperatureMaxC: 0,
    solarIrradianceWm2: 195,
    solarPotentialScore: 92,
    waterIcePotential: 'Low',
    waterPotentialScore: 65,
    radiationLevel: 'Moderate',
    radiationScore: 82,
    dustStormRisk: 'Moderate',
    dustRiskScore: 74,
    terrainScore: 82,
    sourceDataset: 'NASA Curiosity Rover (REMS) / Mars Reconnaissance Orbiter',
    sourceType: 'NASA MOLA / TES / InSight / Mars Odyssey',
    description: 'Near-equatorial basin with thicker atmosphere due to -4.5 km depth, offering slightly higher thermal retention and highest solar irradiance on Mars.',
    advantages: [
      'Highest equatorial solar flux (195 W/m² mean)',
      'Thicker atmospheric column provides ~10% natural radiation shielding',
      'Extensive 10+ year in-situ meteorological baseline from REMS'
    ],
    challenges: [
      'Lower water ice concentration near the equator',
      'Rocky terrain near Mt. Sharp limits large flat greenhouse sprawl'
    ]
  },
  {
    id: 'utopia-planitia',
    name: 'Utopia Planitia',
    arabicOrAncientName: 'Northern Plains Vast Ice Reservoir',
    type: 'Planitia',
    latitude: 46.7,
    longitude: 117.5,
    elevationKm: -5.0,
    temperatureMeanC: -72,
    temperatureMinC: -110,
    temperatureMaxC: -25,
    solarIrradianceWm2: 135,
    solarPotentialScore: 62,
    waterIcePotential: 'Very High',
    waterPotentialScore: 96,
    radiationLevel: 'High',
    radiationScore: 68,
    dustStormRisk: 'Low',
    dustRiskScore: 88,
    terrainScore: 95,
    sourceDataset: 'NASA SHARAD (Radar) / Mars Odyssey GRS',
    sourceType: 'NASA MOLA / TES / InSight / Mars Odyssey',
    description: 'Contains a colossal subsurface water ice sheet holding as much water as Lake Superior (detected via SHARAD), lying just 1–10m below soil.',
    advantages: [
      'Massive subsurface pure water ice reservoir for unlimited closed-loop hydroponics',
      'Exceptionally flat, unobstructed terrain for large modular domes',
      'Lower localized atmospheric dust storm frequency'
    ],
    challenges: [
      'Severe northern winter cold down to -110°C requiring auxiliary heating',
      'Lower solar energy flux requiring larger photovoltaic footprint or backup reactors'
    ]
  },
  {
    id: 'olympus-mons-foothills',
    name: 'Olympus Mons Foothills (Lava Tubes)',
    arabicOrAncientName: 'Tharsis Subterranean Haven',
    type: 'Volcanic Plain',
    latitude: 18.65,
    longitude: -133.8,
    elevationKm: 1.2,
    temperatureMeanC: -55,
    temperatureMinC: -85,
    temperatureMaxC: -10,
    solarIrradianceWm2: 180,
    solarPotentialScore: 86,
    waterIcePotential: 'Moderate',
    waterPotentialScore: 72,
    radiationLevel: 'Low',
    radiationScore: 94,
    dustStormRisk: 'Moderate',
    dustRiskScore: 80,
    terrainScore: 70,
    sourceDataset: 'NASA Viking Orbiter / Mars Global Surveyor / THEMIS',
    sourceType: 'NASA MOLA / TES / InSight / Mars Odyssey',
    description: 'Features colossal volcanic lava tubes capable of housing entire pressurized subterranean bio-domes, providing almost 100% natural radiation shielding.',
    advantages: [
      'Exceptional natural cosmic ray and UV radiation shielding inside lava tubes',
      'Stable interior underground thermal environment',
      'Excellent basalt mineral resources for greenhouse construction'
    ],
    challenges: [
      'Rugged volcanic terrain complicates initial surface transport',
      'Requires artificial high-efficiency LED grow lighting inside caverns'
    ]
  },
  {
    id: 'valles-marineris',
    name: 'Valles Marineris (Candor Chasma)',
    arabicOrAncientName: 'Grand Canyon of Mars',
    type: 'Canyon',
    latitude: -6.5,
    longitude: -75.8,
    elevationKm: -7.0,
    temperatureMeanC: -42,
    temperatureMinC: -70,
    temperatureMaxC: +5,
    solarIrradianceWm2: 185,
    solarPotentialScore: 88,
    waterIcePotential: 'Moderate',
    waterPotentialScore: 82,
    radiationLevel: 'Moderate',
    radiationScore: 89,
    dustStormRisk: 'High',
    dustRiskScore: 62,
    terrainScore: 74,
    sourceDataset: 'NASA MOLA / Mars Express / CRISM',
    sourceType: 'NASA MOLA / TES / InSight / Mars Odyssey',
    description: 'Deepest canyon floor on Mars (-7 km deep), boasting the highest atmospheric pressure (over 1.1 kPa) and mildest daytime temperatures on the planet.',
    advantages: [
      'Highest barometric pressure on Mars, reducing greenhouse hull tension stress',
      'Warmest summer microclimate with daytime highs above 0°C',
      'Hydrated sulfate salts and fog moisture condensates'
    ],
    challenges: [
      'Deep canyon walls cast long morning/evening shadows',
      'Localized dust funneling during regional storm season'
    ]
  },
  {
    id: 'arcadia-planitia',
    name: 'Arcadia Planitia',
    arabicOrAncientName: 'Mid-Latitude Ice Plains',
    type: 'Planitia',
    latitude: 39.3,
    longitude: -171.0,
    elevationKm: -3.8,
    temperatureMeanC: -62,
    temperatureMinC: -95,
    temperatureMaxC: -18,
    solarIrradianceWm2: 155,
    solarPotentialScore: 75,
    waterIcePotential: 'Very High',
    waterPotentialScore: 92,
    radiationLevel: 'Moderate',
    radiationScore: 75,
    dustStormRisk: 'Low',
    dustRiskScore: 85,
    terrainScore: 94,
    sourceDataset: 'NASA Mars Odyssey Gamma Ray Spectrometer & SWIM Project',
    sourceType: 'NASA MOLA / TES / InSight / Mars Odyssey',
    description: 'NASA designated prime human landing candidate site due to shallow surface sheet ice (accessible within 1 meter of soil) combined with manageable mid-latitude solar illumination.',
    advantages: [
      'Shallowest accessible water ice in non-polar region',
      'NASA Subsurface Water Ice Mapping (SWIM) verified',
      'Smooth landing terrain with minimal boulder hazards'
    ],
    challenges: [
      'Moderate winter lighting constraints',
      'Requires continuous dust filtering on solar tracking mounts'
    ]
  },
  {
    id: 'phobos',
    name: 'Phobos (Stickney Crater Outpost)',
    arabicOrAncientName: 'Inner Martian Moon · Stickney Rim',
    type: 'Martian Moon',
    latitude: 9.23,
    longitude: -55.1,
    elevationKm: 0.0,
    temperatureMeanC: -40,
    temperatureMinC: -112,
    temperatureMaxC: -4,
    solarIrradianceWm2: 178,
    solarPotentialScore: 90,
    waterIcePotential: 'Low',
    waterPotentialScore: 52,
    radiationLevel: 'Extreme',
    radiationScore: 45,
    dustStormRisk: 'Low',
    dustRiskScore: 98,
    terrainScore: 72,
    sourceDataset: 'NASA Mars Reconnaissance Orbiter HiRISE & ESA Mars Express HRSC',
    sourceType: 'NASA MOLA / TES / InSight / Mars Odyssey',
    description: 'Innermost and largest moon of Mars, orbiting only 6,000 km above the Martian cloud tops. Features the colossal 9-km Stickney Crater and parallel stress groove fractures. Mars looms across 42° of the celestial dome with minimal escape velocity (11 m/s) ideal for orbital supply staging and microgravity agricultural research.',
    advantages: [
      'Ultra-low delta-v escape velocity (11 m/s) makes cargo transfer and interplanetary transport effortless',
      'Gigantic Mars disk permanently dominates the sky providing continuous line-of-sight and thermal relay',
      'Carbonaceous chondrite regolith containing phyllosilicates, organic compounds, and volatile hydration'
    ],
    challenges: [
      'Microgravity (0.0057 m/s²) requires centrifugal artificial-gravity modules for hydroponic roots and bio-fluids',
      'Extreme cosmic radiation and solar flares with zero natural atmosphere'
    ]
  },
  {
    id: 'deimos',
    name: 'Deimos (Swift Crater Vantage)',
    arabicOrAncientName: 'Outer Martian Moon · Smooth Plains',
    type: 'Martian Moon',
    latitude: 12.5,
    longitude: 35.2,
    elevationKm: 0.0,
    temperatureMeanC: -40,
    temperatureMinC: -120,
    temperatureMaxC: -4,
    solarIrradianceWm2: 178,
    solarPotentialScore: 92,
    waterIcePotential: 'Low',
    waterPotentialScore: 48,
    radiationLevel: 'Extreme',
    radiationScore: 42,
    dustStormRisk: 'Low',
    dustRiskScore: 99,
    terrainScore: 86,
    sourceDataset: 'UAE Hope Probe EXI (2023 100km Flyby) & NASA Viking 2 Orbiter',
    sourceType: 'NASA MOLA / TES / InSight / Mars Odyssey',
    description: 'Outer moon of Mars enveloped by a smooth, continuous blanket of pulverized regolith up to 100 meters deep. Craters Swift and Voltaire are softened by fine dust, creating gentle undulating terrain ideal for tethered surface arrays and long-baseline communications with Earth.',
    advantages: [
      'Smooth, cushioned regolith blanket minimizes jagged boulder landing hazards',
      'Stable synchronous orbit (30.3 hours) provides near-stationary orbital observation of Mars',
      'Zero atmospheric dust storms allowing uninterrupted solar harvesting at 178 W/m²'
    ],
    challenges: [
      'Negligible surface gravity (0.003 m/s²) requires anchor harpoons and spin habitats',
      'Extreme diurnal thermal swings (-120°C to -4°C) without atmospheric insulation'
    ]
  }
];
