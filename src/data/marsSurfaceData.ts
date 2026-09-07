export interface NasaSurfaceImage {
  id: string;
  title: string;
  mission: string;
  instrument: string;
  solOrDate: string;
  credit: string;
  description: string;
  imageUrl: string;
  thumbnailUrl: string;
  fallbackUrl?: string;
  isPanorama?: boolean;
}

export interface MarsSurfaceDetail {
  locationId: string;
  name: string;
  ancientName: string;
  coordinates: string;
  elevation: string;
  atmosphericPressureKpa: number;
  temperatureRangeC: { min: number; max: number; mean: number };
  solarFluxWm2: number;
  waterIceDepthMeters: string;
  radiationDoseMsvYear: number;
  dustOpticalDepthTau: number;
  geologicalContext: string;
  agriculturalAssessment: {
    suitabilityScore: number;
    waterAccessRating: 'Abundant Ice Sheet' | 'Moderate Subsurface' | 'Deep Extraction';
    lightingCondition: 'High Equatorial' | 'Balanced Mid-Latitude' | 'Sub-optimal Polar';
    thermalShieldingNeed: 'Moderate (Canyon buffer)' | 'Extreme (Auxiliary nuclear required)' | 'Natural Lava Tube Insulation';
    recommendedCrops: string[];
    caloricHarvestMultiplier: number;
  };
  terrain3DConfig: {
    groundColorHex: number;
    skyColorHex: number;
    fogDensity: number;
    roughness: number;
    boulderDensity: 'sparse' | 'moderate' | 'heavy';
    craterRimScale: number;
    dustStormColorHex: number;
    hasLavaTubes?: boolean;
    hasCanyonWalls?: boolean;
    hasIceFrost?: boolean;
  };
  images: NasaSurfaceImage[];
}

export const MARS_SURFACE_DATA: Record<string, MarsSurfaceDetail> = {
  'jezero-crater': {
    locationId: 'jezero-crater',
    name: 'Jezero Crater',
    ancientName: 'Ancient Lake Delta & Carbonate Basin',
    coordinates: '18.38° N, 77.58° E',
    elevation: '-2.5 km (NASA MOLA Datum)',
    atmosphericPressureKpa: 0.612,
    temperatureRangeC: { min: -88, max: -15, mean: -58 },
    solarFluxWm2: 175,
    waterIceDepthMeters: '3 to 12 meters (Hydrated phyllosilicates & clays)',
    radiationDoseMsvYear: 248,
    dustOpticalDepthTau: 0.42,
    geologicalContext:
      'Site of the active NASA Mars 2020 Perseverance Rover mission. Jezero preserves an ancient 3.8-billion-year-old river delta that emptied into an open-basin crater lake. Recent Sol 1200+ expeditions across Neretva Vallis discovered organic-bearing mudstones, sulfate veins, and silica deposits ideal for closed-loop bio-regenerative agriculture.',
    agriculturalAssessment: {
      suitabilityScore: 88,
      waterAccessRating: 'Moderate Subsurface',
      lightingCondition: 'Balanced Mid-Latitude',
      thermalShieldingNeed: 'Extreme (Auxiliary nuclear required)',
      recommendedCrops: ['Solanum tuberosum (Potato)', 'Glycine max (Soybean)', 'Microgreens & Chlorella'],
      caloricHarvestMultiplier: 1.18,
    },
    terrain3DConfig: {
      groundColorHex: 0xb55134,
      skyColorHex: 0xd9825b,
      fogDensity: 0.012,
      roughness: 0.88,
      boulderDensity: 'moderate',
      craterRimScale: 1.4,
      dustStormColorHex: 0xa84428,
    },
    images: [
      {
        id: 'jezero-cheyava-falls-2024',
        title: 'Perseverance Sol 1220 "Cheyava Falls" Organic Discovery (2024)',
        mission: 'NASA Mars 2020 (Perseverance Rover)',
        instrument: 'SHERLOC & WATSON Camera System',
        solOrDate: 'Sol 1220 (July 2024)',
        credit: 'NASA / JPL-Caltech / MSSS',
        description: 'Authentic close-up of the "Cheyava Falls" rock at Neretva Vallis displaying organic chemical signatures, white calcium sulfate veins, and millimeter-scale iron phosphate "leopard spots" from ancient microbial chemical reactions.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA26379/PIA26379~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA26379/PIA26379~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA26379.jpg',
      },
      {
        id: 'jezero-delta-pano',
        title: 'Perseverance Mastcam-Z 360° Delta Scarp Panorama',
        mission: 'NASA Mars 2020 (Perseverance Rover)',
        instrument: 'Mastcam-Z Multispectral Stereo Camera',
        solOrDate: 'Sol 482 (Western Delta Front)',
        credit: 'NASA / JPL-Caltech / ASU / MSSS',
        description: 'Billion-pixel panoramic mosaic of the western Jezero delta front ("Kodiak Butte" in distance). The layered sedimentary beds confirm ancient standing water and fine clay deposits ideal for greenhouse regolith buffering.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA24424/PIA24424~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA24424/PIA24424~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA24424.jpg',
        isPanorama: true,
      },
      {
        id: 'jezero-bunsen-peak-2024',
        title: 'Perseverance "Bunsen Peak" Abrasion & Mineral Analysis',
        mission: 'NASA Mars 2020 (Perseverance Rover)',
        instrument: 'PIXL X-ray Fluorescence Spectrometer',
        solOrDate: 'Sol 1100 (March 2024)',
        credit: 'NASA / JPL-Caltech',
        description: 'Investigation of the 100% fine-grained silicate sediment at "Bunsen Peak". Trapped silica grains offer exceptional preservation of biogenic minerals for closed-loop soil enrichment.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA26233/PIA26233~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA26233/PIA26233~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA26233.jpg',
      },
      {
        id: 'ingenuity-final-flight',
        title: 'Ingenuity Helicopter Final Aerial Scouting of Dune Field',
        mission: 'NASA Mars 2020 (Ingenuity Rotorcraft)',
        instrument: 'High-Resolution Color NavCam',
        solOrDate: 'Flight 72 (January 2024)',
        credit: 'NASA / JPL-Caltech',
        description: 'Aerial reconnaissance captured from 12 meters altitude showing smooth regolith plains suitable for landing modules, solar arrays, and inflatable bio-domes.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA25227/PIA25227~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA25227/PIA25227~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA25227.jpg',
      },
      {
        id: 'jezero-hirise-orbital',
        title: 'MRO HiRISE Orbital Map: Delta Fan & Landing Corridor',
        mission: 'NASA Mars Reconnaissance Orbiter',
        instrument: 'High Resolution Imaging Science Experiment (HiRISE)',
        solOrDate: 'Orbit 68,412',
        credit: 'NASA / JPL-Caltech / University of Arizona',
        description: 'High-resolution orbital survey showing ancient serpentine river channels feeding into Jezero Crater, highlighting the proposed Octavia E. Butler Bio-Dome zone.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA23962/PIA23962~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA23962/PIA23962~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA23962.jpg',
      }
    ]
  },

  'gale-crater': {
    locationId: 'gale-crater',
    name: 'Gale Crater (Mt. Sharp Foothills)',
    ancientName: 'Aeolis Palus & Central Mound',
    coordinates: '4.59° S, 137.44° E',
    elevation: '-4.5 km (NASA MOLA Datum)',
    atmosphericPressureKpa: 0.840,
    temperatureRangeC: { min: -78, max: 0, mean: -48 },
    solarFluxWm2: 195,
    waterIceDepthMeters: '15+ meters (Limited equatorial ice; groundwater hydrated minerals)',
    radiationDoseMsvYear: 232,
    dustOpticalDepthTau: 0.48,
    geologicalContext:
      'Explored continuously by NASA Curiosity Rover since 2012. Gale is a deep equatorial impact crater holding Mount Sharp (Aeolis Mons), which towers 5.5 km from the floor. In July 2024, Curiosity crushed a rock at Gediz Vallis revealing bright yellow crystals of 100% elemental sulfur—a crucial plant macronutrient previously never found pure on Mars.',
    agriculturalAssessment: {
      suitabilityScore: 84,
      waterAccessRating: 'Deep Extraction',
      lightingCondition: 'High Equatorial',
      thermalShieldingNeed: 'Moderate (Canyon buffer)',
      recommendedCrops: ['Triticum aestivum (Dwarf Wheat)', 'Raphanus sativus (Radish)', 'Spirulina algae'],
      caloricHarvestMultiplier: 1.25,
    },
    terrain3DConfig: {
      groundColorHex: 0xa8482c,
      skyColorHex: 0xdf8a63,
      fogDensity: 0.009,
      roughness: 0.82,
      boulderDensity: 'moderate',
      craterRimScale: 2.2,
      dustStormColorHex: 0x9e3c20,
    },
    images: [
      {
        id: 'gale-gediz-vallis-sulfur-2024',
        title: 'Curiosity Sol 4200+ Pure Elemental Sulfur Crystals (July 2024)',
        mission: 'NASA Mars Science Laboratory (Curiosity Rover)',
        instrument: 'Mars Hand Lens Imager (MAHLI) & Mastcam',
        solOrDate: 'Sol 4228 (July 2024)',
        credit: 'NASA / JPL-Caltech / MSSS',
        description: 'First discovery of pure elemental sulfur crystals inside crushed white stones on Gediz Vallis Ridge. Sulfur is one of the essential building blocks for plant proteins and hydroponic nutrient solutions.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA26338/PIA26338~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA26338/PIA26338~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA26338.jpg',
      },
      {
        id: 'gale-gediz-ridge-vista-2024',
        title: 'Curiosity Mastcam Vista of Gediz Vallis Debris Flow Channel',
        mission: 'NASA Mars Science Laboratory (Curiosity Rover)',
        instrument: 'Mastcam Telephoto 100mm',
        solOrDate: 'Sol 4100 (Spring 2024)',
        credit: 'NASA / JPL-Caltech / MSSS',
        description: 'Panoramic view of ancient wet debris avalanche boulders that carved their way down Mount Sharp, exposing bedrock rich in bio-essential elements.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA26219/PIA26219~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA26219/PIA26219~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA26219.jpg',
      },
      {
        id: 'gale-mount-sharp-pano',
        title: 'Curiosity Mastcam 360° Panorama of Mount Sharp Foothills',
        mission: 'NASA Mars Science Laboratory (Curiosity Rover)',
        instrument: 'Mast Camera (Mastcam 100mm & 34mm)',
        solOrDate: 'Sol 2618 (Aeolis Mons)',
        credit: 'NASA / JPL-Caltech / MSSS',
        description: 'Billion-pixel mosaic of Gale Crater floor looking toward the sulfate-bearing layered strata of Mount Sharp. Shows flat gravel plains ideal for expansive bio-dome modules.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA23623/PIA23623~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA23623/PIA23623~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA23623.jpg',
        isPanorama: true,
      },
      {
        id: 'gale-yellowknife-bay',
        title: 'Yellowknife Bay Ancient Habitable Mudstone',
        mission: 'NASA Mars Science Laboratory (Curiosity Rover)',
        instrument: 'Mars Hand Lens Imager (MAHLI)',
        solOrDate: 'Sol 137 (Habitable Basin)',
        credit: 'NASA / JPL-Caltech / MSSS',
        description: 'Proof of ancient habitable lake waters: neutral pH mudstone with accessible sulfur, nitrogen, phosphorus, and carbon for astrobotany.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA16568/PIA16568~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA16568/PIA16568~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA16568.jpg',
      }
    ]
  },

  'utopia-planitia': {
    locationId: 'utopia-planitia',
    name: 'Utopia Planitia',
    ancientName: 'Northern Plains Colossal Cryo-Ice Reservoir',
    coordinates: '46.7° N, 117.5° E',
    elevation: '-5.0 km (NASA MOLA Datum)',
    atmosphericPressureKpa: 0.890,
    temperatureRangeC: { min: -110, max: -25, mean: -72 },
    solarFluxWm2: 135,
    waterIceDepthMeters: '1 to 5 meters (90%+ pure water ice sheet)',
    radiationDoseMsvYear: 265,
    dustOpticalDepthTau: 0.28,
    geologicalContext:
      'Landed upon by NASA Viking 2 in 1976 and CNSA Zhurong in 2021. Radar sounding from NASA Mars Reconnaissance Orbiter (SHARAD) confirmed a colossal underground water ice sheet covering more area than the state of New Mexico, with water volume equivalent to Lake Superior, lying just 1 to 10 meters beneath surface soil.',
    agriculturalAssessment: {
      suitabilityScore: 92,
      waterAccessRating: 'Abundant Ice Sheet',
      lightingCondition: 'Sub-optimal Polar',
      thermalShieldingNeed: 'Extreme (Auxiliary nuclear required)',
      recommendedCrops: ['Beta vulgaris (Sugar Beet)', 'Spinacia oleracea (Spinach)', 'Brassica rapa (Turnip)'],
      caloricHarvestMultiplier: 1.10,
    },
    terrain3DConfig: {
      groundColorHex: 0xb86048,
      skyColorHex: 0xd47e5b,
      fogDensity: 0.015,
      roughness: 0.70,
      boulderDensity: 'heavy',
      craterRimScale: 0.8,
      dustStormColorHex: 0x994833,
      hasIceFrost: true,
    },
    images: [
      {
        id: 'utopia-viking-frost',
        title: 'Viking 2 Surface Panorama with Winter Water-Ice Frost',
        mission: 'NASA Viking 2 Lander',
        instrument: 'Facsimile Camera System (Lander Camera 1)',
        solOrDate: 'Sol 960 (Martian Winter)',
        credit: 'NASA / JPL-Caltech',
        description: 'First image ever taken of seasonal water ice frost resting on rocks and soil on the surface of Mars. Proves atmospheric condensation loops operate at this site.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA00572/PIA00572~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA00572/PIA00572~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA00572.jpg',
        isPanorama: true,
      },
      {
        id: 'utopia-sharad-radar',
        title: 'MRO SHARAD Radar Detection of Utopia Glacial Sheet',
        mission: 'NASA Mars Reconnaissance Orbiter',
        instrument: 'Shallow Radar (SHARAD)',
        solOrDate: 'Orbital Radar Composite',
        credit: 'NASA / JPL-Caltech / Univ. of Texas / ASI',
        description: 'Radargram proving an 80–170 meter thick sheet composed of 50–85% pure water ice, sheltered under a 1–10m regolith blanket.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA21132/PIA21132~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA21132/PIA21132~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA21132.jpg',
      },
      {
        id: 'utopia-polygonal-ground',
        title: 'HiRISE: Thermal Contraction Permafrost Polygons',
        mission: 'NASA Mars Reconnaissance Orbiter',
        instrument: 'HiRISE Camera',
        solOrDate: 'ESP_021984_2270',
        credit: 'NASA / JPL-Caltech / University of Arizona',
        description: 'Hexagonal polygonal networks formed by repeated freeze-thaw shrinkage of underground ice wedges, identical to Arctic tundra patterns.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA14115/PIA14115~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA14115/PIA14115~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA14115.jpg',
      }
    ]
  },

  'olympus-mons-foothills': {
    locationId: 'olympus-mons-foothills',
    name: 'Olympus Mons Foothills (Lava Tubes)',
    ancientName: 'Tharsis Shield Volcanic Caverns',
    coordinates: '18.65° N, 133.80° W',
    elevation: '+1.2 km (NASA MOLA Datum)',
    atmosphericPressureKpa: 0.540,
    temperatureRangeC: { min: -85, max: -10, mean: -55 },
    solarFluxWm2: 180,
    waterIceDepthMeters: '8 to 20 meters (Volcanic basal ice & mineral hydration)',
    radiationDoseMsvYear: 85, // Inside lava tube cavern!
    dustOpticalDepthTau: 0.38,
    geologicalContext:
      'Located on the outer apron of Olympus Mons, the largest volcano in the solar system (22 km high, 600 km wide). The foothills feature massive basaltic lava flows containing subterranean lava tubes up to 500 meters in diameter. Establishing agricultural domes inside these natural volcanic vaults provides up to 99% shielding from cosmic radiation and micrometeorites.',
    agriculturalAssessment: {
      suitabilityScore: 85,
      waterAccessRating: 'Moderate Subsurface',
      lightingCondition: 'Balanced Mid-Latitude',
      thermalShieldingNeed: 'Natural Lava Tube Insulation',
      recommendedCrops: ['Lactuca sativa (Butterhead Lettuce)', 'Fragaria vesca (Alpine Strawberry)', 'Agaricus bisporus (Fungi)'],
      caloricHarvestMultiplier: 1.15,
    },
    terrain3DConfig: {
      groundColorHex: 0x782c1f,
      skyColorHex: 0xd68058,
      fogDensity: 0.010,
      roughness: 0.95,
      boulderDensity: 'heavy',
      craterRimScale: 3.0,
      dustStormColorHex: 0x8a2c1a,
      hasLavaTubes: true,
    },
    images: [
      {
        id: 'olympus-flank-scarp',
        title: 'HRSC True-Color 3D Perspective: 6-km Basaltic Scarp',
        mission: 'ESA Mars Express / NASA Data Exchange',
        instrument: 'High Resolution Stereo Camera (HRSC)',
        solOrDate: 'Orbit 1,089',
        credit: 'ESA / DLR / FU Berlin (G. Neukum) / NASA',
        description: 'Sheer vertical basalt cliffs bounding the base of Olympus Mons, showing rockfalls, lava terraces, and tectonic faulting.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA05557/PIA05557~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA05557/PIA05557~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA05557.jpg',
      },
      {
        id: 'olympus-lava-tube-skylight',
        title: 'HiRISE Discovery: Volcanic Lava Tube Skylight Pit',
        mission: 'NASA Mars Reconnaissance Orbiter',
        instrument: 'HiRISE Ultra-Resolution Camera',
        solOrDate: 'PSP_004847_1945',
        credit: 'NASA / JPL-Caltech / University of Arizona',
        description: 'A 190-meter wide circular pit opening into an underground lava tube chamber with complete shadow, confirming deep cavernous volume for pressurized habitats.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA12831/PIA12831~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA12831/PIA12831~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA12831.jpg',
      },
      {
        id: 'olympus-caldera-themis',
        title: 'THEMIS Multi-Spectral View of Olympus Mons Caldera',
        mission: 'NASA 2001 Mars Odyssey',
        instrument: 'Thermal Emission Imaging System (THEMIS)',
        solOrDate: 'Infrared Day/Night Mosaic',
        credit: 'NASA / JPL-Caltech / ASU',
        description: 'Multi-ring caldera summit of Olympus Mons showing collapsed magma chambers and basaltic thermal inertia signatures.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA03825/PIA03825~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA03825/PIA03825~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA03825.jpg',
        isPanorama: true,
      }
    ]
  },

  'valles-marineris': {
    locationId: 'valles-marineris',
    name: 'Valles Marineris (Candor Chasma)',
    ancientName: 'The Grand Canyon of the Red Planet',
    coordinates: '6.50° S, 75.80° W',
    elevation: '-7.0 km (NASA MOLA Datum)',
    atmosphericPressureKpa: 1.150,
    temperatureRangeC: { min: -70, max: 5, mean: -42 },
    solarFluxWm2: 185,
    waterIceDepthMeters: '4 to 10 meters (Hydrated magnesium & iron sulfates)',
    radiationDoseMsvYear: 198,
    dustOpticalDepthTau: 0.55,
    geologicalContext:
      'Valles Marineris is the grandest canyon system in the Solar System, spanning over 4,000 km in length and gouging down to -7 km below the datum. At the chasma floor, atmospheric surface pressure exceeds 1.1 kPa (highest on Mars), with midday summer temperatures occasionally exceeding the melting point of water (+5°C).',
    agriculturalAssessment: {
      suitabilityScore: 89,
      waterAccessRating: 'Moderate Subsurface',
      lightingCondition: 'High Equatorial',
      thermalShieldingNeed: 'Moderate (Canyon buffer)',
      recommendedCrops: ['Phaseolus vulgaris (Pinto Bean)', 'Raphanus sativus (Radish)', 'Spirulina & Chlorella'],
      caloricHarvestMultiplier: 1.28,
    },
    terrain3DConfig: {
      groundColorHex: 0xa84126,
      skyColorHex: 0xdd825c,
      fogDensity: 0.014,
      roughness: 0.90,
      boulderDensity: 'moderate',
      craterRimScale: 3.5,
      dustStormColorHex: 0x9c3418,
      hasCanyonWalls: true,
    },
    images: [
      {
        id: 'valles-candor-chasma-pano',
        title: 'Mars Express HRSC Perspective: Candor Chasma Canyon Floor',
        mission: 'ESA Mars Express / NASA Horizons Archive',
        instrument: 'High Resolution Stereo Camera (HRSC)',
        solOrDate: 'Orbit 1,234 (Composite Perspective)',
        credit: 'ESA / DLR / FU Berlin / NASA JPL',
        description: 'Grand panoramic perspective down the sheer 7-kilometer walls of Candor Chasma showing layered interior deposits, landslide debris fans, and morning atmospheric fog.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA06999/PIA06999~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA06999/PIA06999~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA06999.jpg',
        isPanorama: true,
      },
      {
        id: 'valles-rsl-slopes',
        title: 'HiRISE: Seasonal Recurring Slope Lineae (RSL)',
        mission: 'NASA Mars Reconnaissance Orbiter',
        instrument: 'HiRISE Camera',
        solOrDate: 'ESP_031059_1685',
        credit: 'NASA / JPL-Caltech / University of Arizona',
        description: 'Dark, narrow streaks that incrementally advance down steep, warm canyon slopes in late spring/summer, indicating potential briny groundwater seeps.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA19918/PIA19918~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA19918/PIA19918~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA19918.jpg',
      },
      {
        id: 'valles-mola-topography',
        title: 'MOLA 3D Topographic Altimetry Map: 4,000 km Trench',
        mission: 'NASA Mars Global Surveyor',
        instrument: 'Mars Orbiter Laser Altimeter (MOLA)',
        solOrDate: 'Global Topography Map v2.4',
        credit: 'NASA / GSFC / MOLA Science Team',
        description: 'Color-coded altimetry illustrating depth variations from the Tharsis volcanic plateau (+10 km) down into deep chasm bottoms (-7 km).',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA02820/PIA02820~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA02820/PIA02820~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA02820.jpg',
      }
    ]
  },

  'arcadia-planitia': {
    locationId: 'arcadia-planitia',
    name: 'Arcadia Planitia',
    ancientName: 'Prime Human Settlement Mid-Latitude Ice Plain',
    coordinates: '39.30° N, 171.00° W',
    elevation: '-3.8 km (NASA MOLA Datum)',
    atmosphericPressureKpa: 0.770,
    temperatureRangeC: { min: -95, max: -18, mean: -62 },
    solarFluxWm2: 155,
    waterIceDepthMeters: '0.5 to 2 meters (Directly shovel-accessible sheet ice)',
    radiationDoseMsvYear: 240,
    dustOpticalDepthTau: 0.32,
    geologicalContext:
      'Designated by NASA astrobiologists and SpaceX as the premier candidate location for humanity’s first permanent Martian city. NASA Subsurface Water Ice Mapping (SWIM) identified extensive pure glacier sheets buried beneath just 30 cm to 1.5 meters of loose soil, paired with a broad, flat plain devoid of hazardous boulder fields.',
    agriculturalAssessment: {
      suitabilityScore: 95,
      waterAccessRating: 'Abundant Ice Sheet',
      lightingCondition: 'Balanced Mid-Latitude',
      thermalShieldingNeed: 'Extreme (Auxiliary nuclear required)',
      recommendedCrops: ['Solanum tuberosum (Potato)', 'Pisum sativum (Field Pea)', 'Triticum aestivum (Dwarf Wheat)'],
      caloricHarvestMultiplier: 1.20,
    },
    terrain3DConfig: {
      groundColorHex: 0xba583a,
      skyColorHex: 0xd87f58,
      fogDensity: 0.011,
      roughness: 0.65,
      boulderDensity: 'sparse',
      craterRimScale: 0.9,
      dustStormColorHex: 0x9b3f23,
      hasIceFrost: true,
    },
    images: [
      {
        id: 'arcadia-swim-water-map',
        title: 'NASA Subsurface Water Ice Mapping (SWIM) Multi-Sensor Map',
        mission: 'NASA Mars Odyssey & MRO Multi-Instrument Consortium',
        instrument: 'SWIM Radar / Thermal / Neutron Composite',
        solOrDate: 'Published in Nature Geoscience & NASA Archive',
        credit: 'NASA / JPL-Caltech / Planetary Science Institute',
        description: 'Composite satellite ice consistency index proving sheets of massive water ice lying within 1 meter of the Martian ground surface across Arcadia.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA23512/PIA23512~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA23512/PIA23512~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA23512.jpg',
        isPanorama: true,
      },
      {
        id: 'arcadia-scalloped-terrain',
        title: 'HiRISE: Scalloped Depressions & Shovel-Accessible Ice Scarps',
        mission: 'NASA Mars Reconnaissance Orbiter',
        instrument: 'HiRISE Camera',
        solOrDate: 'ESP_013444_2210',
        credit: 'NASA / JPL-Caltech / University of Arizona',
        description: 'Scalloped depressions created where subsurface sheet ice sublimates upon exposure. Proves pure glacial ice is directly accessible with basic backhoe machinery.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA12493/PIA12493~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA12493/PIA12493~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA12493.jpg',
      },
      {
        id: 'arcadia-hirise-landing-plain',
        title: 'HiRISE Flat Landing Zone Verification',
        mission: 'NASA Mars Reconnaissance Orbiter',
        instrument: 'HiRISE Ultra-Resolution (25 cm/pixel)',
        solOrDate: 'ESP_063819_2195',
        credit: 'NASA / JPL-Caltech / University of Arizona',
        description: 'Smooth, rock-free landing corridor chosen for uncrewed cargo and crewed lander terminal descent with zero slope obstruction hazards.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA23684/PIA23684~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA23684/PIA23684~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA23684.jpg',
      }
    ]
  }
};
