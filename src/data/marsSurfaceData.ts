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
  celestialBody?: 'mars' | 'earth' | 'moon';
  bodyType?: 'mars' | 'earth' | 'moon';
  hasOcean?: boolean;
  hasClouds?: boolean;
  satelliteTextureUrl?: string;
  googleEarthUrl?: string;
  googleMapsEmbedUrl?: string;
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
    waterAccessRating: 'Abundant Ice Sheet' | 'Moderate Subsurface' | 'Deep Extraction' | 'Hydrated Phyllosilicate / Volatiles Baking' | 'Surface Liquid Hydrosphere' | 'Deep Cryogenic Permafrost' | 'Permanently Shadowed Volatile Ice';
    lightingCondition: 'High Equatorial' | 'Balanced Mid-Latitude' | 'Sub-optimal Polar' | 'Unfiltered Cosmic Sunlight (Zero Atmosphere)' | 'Continuous Peak of Eternal Light' | 'Humid Subtropical PAR';
    thermalShieldingNeed: 'Moderate (Canyon buffer)' | 'Extreme (Auxiliary nuclear required)' | 'Natural Lava Tube Insulation' | 'Extreme Vacuum & Microgravity Containment' | 'Standard Terrestrial HVAC' | 'Extreme Lunar Vacuum & 14-Day Night Thermal Shielding';
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
    isMoon?: boolean;
    moonType?: 'phobos' | 'deimos';
    gravityMss?: number;
    bodyType?: 'mars' | 'earth' | 'moon';
    earthType?: 'kennedy' | 'mauna-kea' | 'svalbard';
    lunarType?: 'shackleton' | 'tranquility';
    hasOcean?: boolean;
    hasClouds?: boolean;
  };
  images: NasaSurfaceImage[];
}

export const MARS_SURFACE_DATA: Record<string, MarsSurfaceDetail> = {

  'jezero-crater': {
    locationId: 'jezero-crater',
    name: 'Jezero Crater',
    ancientName: 'Ancient Lake Delta & Carbonate Basin',
    satelliteTextureUrl: 'https://images-assets.nasa.gov/image/PIA24424/PIA24424~medium.jpg',
    googleEarthUrl: 'https://trek.nasa.gov/mars/#v=0.1&x=77.58&y=18.38&z=11&p=urn%3Aogc%3Adef%3Acrs%3AEPSG%3A%3A104905',
    googleMapsEmbedUrl: 'https://maps.google.com/maps?q=18.38,77.58&t=k&z=6&output=embed',
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
  },

  'phobos': {
    locationId: 'phobos',
    name: 'Phobos (Stickney Crater Outpost)',
    ancientName: 'Inner Martian Moon · Fear / Orbit: 9,376 km',
    coordinates: '9.23° N, 55.1° W (Stickney Meridian)',
    elevation: '0.0 km (Microgravity Hydrostatic Center)',
    atmosphericPressureKpa: 0.000,
    temperatureRangeC: { min: -112, max: -4, mean: -40 },
    solarFluxWm2: 178,
    waterIceDepthMeters: 'Subsurface carbonaceous phyllosilicates (0.5% - 2% H2O equivalent)',
    radiationDoseMsvYear: 1240,
    dustOpticalDepthTau: 0.00,
    geologicalContext:
      'The innermost and largest moon of Mars, orbiting only 6,000 km above the Martian atmosphere. Phobos is tidally locked, heavily cratered, and covered in deep low-albedo regolith. The colossal 9-km Stickney Crater dominates its surface alongside deep parallel grooves. Microgravity is an ultra-low 0.0057 m/s² (0.00058g). Mars looms overwhelmingly across 42° of the sky, creating a breathtaking celestial backdrop.',
    agriculturalAssessment: {
      suitabilityScore: 70,
      waterAccessRating: 'Hydrated Phyllosilicate / Volatiles Baking',
      lightingCondition: 'Unfiltered Cosmic Sunlight (Zero Atmosphere)',
      thermalShieldingNeed: 'Extreme Vacuum & Microgravity Containment',
      recommendedCrops: ['Spirulina platensis (Photobioreactor Algae)', 'Chlorella vulgaris', 'Lemna minor (Duckweed in Centrifuge)'],
      caloricHarvestMultiplier: 1.35,
    },
    terrain3DConfig: {
      groundColorHex: 0x3a3836,
      skyColorHex: 0x020205,
      fogDensity: 0.0001,
      roughness: 0.94,
      boulderDensity: 'heavy',
      craterRimScale: 3.2,
      dustStormColorHex: 0x554477,
      isMoon: true,
      moonType: 'phobos',
      gravityMss: 0.0057,
    },
    images: [
      {
        id: 'phobos-hirise-stickney-color',
        title: 'MRO HiRISE True-Color Portrait: Stickney Crater & Grooves',
        mission: 'NASA Mars Reconnaissance Orbiter',
        instrument: 'HiRISE (High Resolution Imaging Science Experiment)',
        solOrDate: 'Orbit 26,894 (True-Color)',
        credit: 'NASA / JPL-Caltech / University of Arizona',
        description:
          'Spectacular true-color observation of Phobos captured by MRO HiRISE. Highlights the colossal 9-km Stickney Crater with prominent landslide deposits, exposed blue-tinted boulders, and radiating stress fracture grooves.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA10368/PIA10368~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA10368/PIA10368~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA10368.jpg',
      },
      {
        id: 'phobos-mars-express-hrsc-stickney',
        title: 'Mars Express HRSC 3D Horizon Panorama of Stickney Rim',
        mission: 'ESA / NASA Mars Express & MRO',
        instrument: 'High Resolution Stereo Camera (HRSC)',
        solOrDate: 'Flyby Orbit 756',
        credit: 'ESA / DLR / FU Berlin / NASA',
        description:
          'Ultra-high-resolution perspective of the Stickney Crater rim towering 1,200 meters above the crater floor. Shows ancient impact ejecta blankets and parallel seismic trenches.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA10369/PIA10369~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA10369/PIA10369~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA10369.jpg',
        isPanorama: true,
      },
      {
        id: 'phobos-mgs-moc-boulders',
        title: 'Mars Global Surveyor MOC Close-up: Monoliths & Regolith',
        mission: 'NASA Mars Global Surveyor',
        instrument: 'Mars Orbiter Camera (MOC)',
        solOrDate: 'MGS Orbit 551',
        credit: 'NASA / JPL-Caltech / Malin Space Science Systems',
        description:
          'Sub-meter resolution survey of Phobos demonstrating loose particulate regolith and house-sized boulders resting on microgravity slopes near the Phobos Monolith.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA04285/PIA04285~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA04285/PIA04285~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA04285.jpg',
      },
      {
        id: 'phobos-viking-mars-limb',
        title: 'Viking 1 Orbiter: Phobos Silhouette Above Martian Horizon',
        mission: 'NASA Viking 1 Orbiter',
        instrument: 'Visual Imaging Subsystem (VIS)',
        solOrDate: 'Mission Year 1977',
        credit: 'NASA / JPL',
        description:
          'Historic perspective showing Phobos suspended over the rust-red curved limb of Mars and its delicate blue atmospheric hazes, illustrating the view looking upward from the moon.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA00404/PIA00404~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA00404/PIA00404~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA00404.jpg',
      }
    ]
  },

  'deimos': {
    locationId: 'deimos',
    name: 'Deimos (Swift Crater Vantage)',
    ancientName: 'Outer Martian Moon · Dread / Synchronous Orbit: 23,463 km',
    coordinates: '12.5° N, 35.2° E (Sub-Mars Meridian)',
    elevation: '0.0 km (Microgravity Hydrostatic Center)',
    atmosphericPressureKpa: 0.000,
    temperatureRangeC: { min: -120, max: -4, mean: -40 },
    solarFluxWm2: 178,
    waterIceDepthMeters: 'Subsurface carbonaceous clays & deep volatile deposits',
    radiationDoseMsvYear: 1280,
    dustOpticalDepthTau: 0.00,
    geologicalContext:
      'The smaller and outer moon of Mars. Unlike jagged Phobos, Deimos appears softly rounded and enveloped by an extensive blanket of pulverized regolith up to 100 meters thick. Craters Swift and Voltaire are cushioned by fine dust. Historic 2023 100-km flybys by the UAE Hope Probe revealed a composition identical to Mars basaltic crust rather than a captured asteroid. Surface gravity is an ethereal 0.003 m/s².',
    agriculturalAssessment: {
      suitabilityScore: 68,
      waterAccessRating: 'Hydrated Phyllosilicate / Volatiles Baking',
      lightingCondition: 'Unfiltered Cosmic Sunlight (Zero Atmosphere)',
      thermalShieldingNeed: 'Extreme Vacuum & Microgravity Containment',
      recommendedCrops: ['Centrifugal Hydroponic Microgreens', 'Dunaliella salina', 'Spirulina platensis'],
      caloricHarvestMultiplier: 1.30,
    },
    terrain3DConfig: {
      groundColorHex: 0x4a4440,
      skyColorHex: 0x020205,
      fogDensity: 0.0001,
      roughness: 0.82,
      boulderDensity: 'sparse',
      craterRimScale: 1.6,
      dustStormColorHex: 0x443366,
      isMoon: true,
      moonType: 'deimos',
      gravityMss: 0.003,
    },
    images: [
      {
        id: 'deimos-hirise-color-portrait',
        title: 'MRO HiRISE True-Color Observation of Deimos Mantle',
        mission: 'NASA Mars Reconnaissance Orbiter',
        instrument: 'HiRISE Camera',
        solOrDate: 'Orbit 15,221',
        credit: 'NASA / JPL-Caltech / University of Arizona',
        description:
          'True-color observation of Deimos revealing its continuous layer of fine-grained regolith. Prominent bright streaks indicate downslope mass movement on low-gravity crater flanks.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA11826/PIA11826~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA11826/PIA11826~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA11826.jpg',
      },
      {
        id: 'deimos-hope-probe-close-flyby',
        title: 'UAE Hope Probe Historic 100-km Ultra-Close Flyby (2023)',
        mission: 'Emirates Mars Mission (Hope Probe) / NASA DSN',
        instrument: 'Emirates Exploration Imager (EXI)',
        solOrDate: 'Historic Close Flyby March 2023',
        credit: 'MBRSC / UAE Space Agency / LASP / NASA DSN',
        description:
          'Historic high-resolution multi-spectral observation captured from only 100 km above Deimos, demonstrating that its regolith originated from Martian planetary basalt rather than a captured asteroid.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA25920/PIA25920~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA25920/PIA25920~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA25920.jpg',
      },
      {
        id: 'deimos-viking-swift-panorama',
        title: 'Viking 2 Orbiter: Swift Crater & Regolith Cushion Vista',
        mission: 'NASA Viking 2 Orbiter',
        instrument: 'Visual Imaging Subsystem (VIS)',
        solOrDate: 'Orbit 423',
        credit: 'NASA / JPL',
        description:
          'Panoramic view of Swift Crater (1 km diameter) displaying softened, rounded contours smoothed by millennia of electrostatic dust redeposition. Ideal terrain for tethered surface bio-domes.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA00030/PIA00030~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA00030/PIA00030~thumb.jpg',
        fallbackUrl: 'https://photojournal.jpl.nasa.gov/jpeg/PIA00030.jpg',
        isPanorama: true,
      }
    ]
  },

  // ── 3. Planet Earth Surface Stations & Analogues ─────────────────────────────
  'kennedy-space-center': {
    locationId: 'kennedy-space-center',
    name: 'Kennedy Space Center (Space Coast)',
    ancientName: 'NASA Space Coast · Launch Complex 39A / APH Facility',
    celestialBody: 'earth',
    bodyType: 'earth',
    satelliteTextureUrl: '/textures/ksc_satellite.jpg',
    googleEarthUrl: 'https://earth.google.com/web/@28.5721,-80.6480,12a,1500d,35y,0h,45t,0r',
    googleMapsEmbedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=-80.6800%2C28.5500%2C-80.6100%2C28.6100&layer=mapnik&marker=28.5721%2C-80.6480',
    coordinates: '28.5721° N, 80.6480° W',
    elevation: '0.003 km (Atlantic Mean Sea Level)',
    atmosphericPressureKpa: 101.325,
    temperatureRangeC: { min: 10, max: 33, mean: 22 },
    solarFluxWm2: 430,
    waterIceDepthMeters: 'Direct sea-level freshwater aquifer & Atlantic hydrosphere',
    radiationDoseMsvYear: 3.1,
    dustOpticalDepthTau: 0.05,
    geologicalContext:
      'Coastal barrier island along Florida’s Atlantic shoreline. Home of historic Launch Complex 39A/B, the Crawlerway, and NASA’s Space Life Sciences Lab. The site serves as the terrestrial ground-truth calibration facility for the Advanced Plant Habitat (APH) and Veggie flight experiments.',
    agriculturalAssessment: {
      suitabilityScore: 99,
      waterAccessRating: 'Surface Liquid Hydrosphere',
      lightingCondition: 'Humid Subtropical PAR',
      thermalShieldingNeed: 'Standard Terrestrial HVAC',
      recommendedCrops: ['Outredgeous Red Romaine', 'Dwarf Wheat', 'Mizuna Mustard', 'Super-Dwarf Tomato', 'Bok Choy'],
      caloricHarvestMultiplier: 1.00,
    },
    terrain3DConfig: {
      groundColorHex: 0x2e5c32, // Deep coastal turf
      skyColorHex: 0x38bdf8, // Atlantic azure sky
      fogDensity: 0.0010,
      roughness: 0.75,
      boulderDensity: 'sparse',
      craterRimScale: 0.0,
      dustStormColorHex: 0x557799,
      bodyType: 'earth',
      earthType: 'kennedy',
      gravityMss: 9.807,
      hasOcean: true,
      hasClouds: true,
    },
    images: [
      {
        id: 'ksc-pad-39a-aerial',
        title: 'NASA High-Altitude Reconnaissance: Pad 39A Launch Mount & Flame Trench',
        mission: 'NASA Exploration Ground Systems / Aerial Reconnaissance',
        instrument: 'High-Altitude Aerial Reconnaissance Camera',
        solOrDate: 'Artemis & Commercial Crew Era',
        credit: 'NASA / Kennedy Space Center',
        description:
          'High-altitude aerial perspective of historic Launch Complex 39A, the crawlerway, flame trench, and the Atlantic coastline at Cape Canaveral.',
        imageUrl: 'https://images-assets.nasa.gov/image/KSC-05pd2403/KSC-05pd2403~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/KSC-05pd2403/KSC-05pd2403~thumb.jpg',
        fallbackUrl: '/textures/ksc_satellite.jpg',
      },
      {
        id: 'ksc-iss-space-view',
        title: 'NASA Helicopter 3D Aerial: Pad 39B & Atlantic Coastline',
        mission: 'NASA Center Planning and Development Aerial Survey',
        instrument: 'Helicopter Aerial Reconnaissance Survey',
        solOrDate: 'Cape Canaveral Flight Pass',
        credit: 'NASA / KSC / Kim Shiflett',
        description:
          'Helicopter aerial survey capturing the Pad 39B launch apron, lightning protection towers, and coastal marshland along the Atlantic shoreline.',
        imageUrl: 'https://images-assets.nasa.gov/image/KSC-20210113-PH-JBS01_0201/KSC-20210113-PH-JBS01_0201~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/KSC-20210113-PH-JBS01_0201/KSC-20210113-PH-JBS01_0201~thumb.jpg',
        fallbackUrl: '/textures/ksc_satellite.jpg',
      },
      {
        id: 'ksc-pad-mount',
        title: 'Pad 39A Launch Complex Ground-Truth Perspective',
        mission: 'NASA Space Launch System & Shuttle Legacy',
        instrument: 'Optical Ground Telemetry & Reconnaissance',
        solOrDate: 'Launch Mount Engineering Survey',
        credit: 'NASA / Kennedy Space Center',
        description:
          'Oblique engineering survey of the massive concrete launch apron, crawlerway dual tracks, and sound suppression water deluge system.',
        imageUrl: 'https://images-assets.nasa.gov/image/03pd2220/03pd2220~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/03pd2220/03pd2220~thumb.jpg',
        fallbackUrl: '/textures/ksc_satellite.jpg',
        isPanorama: true,
      },
      {
        id: 'ksc-aph-plant-growth',
        title: 'NASA Advanced Plant Habitat (APH) Flight Unit #1',
        mission: 'NASA Space Life Sciences / ISS Research',
        instrument: 'Multispectral LED Biomass Growth Facility',
        solOrDate: 'Flight Qualification Unit Testing',
        credit: 'NASA / Kennedy Space Center',
        description:
          'The Advanced Plant Habitat (APH) is NASA’s flagship closed-loop crop research facility, controlling light spectra, humidity, CO2, and nutrient fluidics.',
        imageUrl: 'https://images-assets.nasa.gov/image/KSC-20170724-PH_CSH01_0060/KSC-20170724-PH_CSH01_0060~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/KSC-20170724-PH_CSH01_0060/KSC-20170724-PH_CSH01_0060~thumb.jpg',
        fallbackUrl: '/textures/ksc_satellite.jpg',
      },
    ],
  },

  'mauna-kea': {
    locationId: 'mauna-kea',
    name: 'HI-SEAS & Mauna Kea Analogue',
    ancientName: 'Puu Waawaa Basalt Ridge · 4,205m Summit',
    celestialBody: 'earth',
    bodyType: 'earth',
    satelliteTextureUrl: '/textures/maunakea_satellite.jpg',
    googleEarthUrl: 'https://earth.google.com/web/@19.8206,-155.4681,4205a,4000d,35y,0h,60t,0r',
    googleMapsEmbedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=-155.5100%2C19.8000%2C-155.4300%2C19.8500&layer=mapnik&marker=19.8206%2C-155.4681',
    coordinates: '19.8206° N, 155.4681° W',
    elevation: '4.205 km (Alpine Summit)',
    atmosphericPressureKpa: 60.5,
    temperatureRangeC: { min: -4, max: 11, mean: 3 },
    solarFluxWm2: 520,
    waterIceDepthMeters: 'Alpine sub-summit permafrost lenses & groundwater collection',
    radiationDoseMsvYear: 4.8,
    dustOpticalDepthTau: 0.02,
    geologicalContext:
      'Dormant shield volcano rising above the trade-wind inversion layer on the Big Island of Hawaii. The barren a‘ā and pāhoehoe basaltic lava fields closely resemble lunar mare and Martian volcanic plains, hosting NASA’s HI-SEAS habitat simulations.',
    agriculturalAssessment: {
      suitabilityScore: 84,
      waterAccessRating: 'Moderate Subsurface',
      lightingCondition: 'High Equatorial',
      thermalShieldingNeed: 'Standard Terrestrial HVAC',
      recommendedCrops: ['Solanum tuberosum (Andean Potato)', 'Quinoa', 'Highland Barley', 'Spinacia oleracea', 'Alpine Radish'],
      caloricHarvestMultiplier: 1.15,
    },
    terrain3DConfig: {
      groundColorHex: 0x5a4638, // Volcanic basalt cinder / tephra
      skyColorHex: 0x3b82f6, // Ultra-clear deep alpine blue
      fogDensity: 0.0006,
      roughness: 0.92,
      boulderDensity: 'heavy',
      craterRimScale: 1.2,
      dustStormColorHex: 0x6e5240,
      bodyType: 'earth',
      earthType: 'mauna-kea',
      gravityMss: 9.807,
      hasClouds: true,
    },
    images: [
      {
        id: 'mauna-kea-cinder-volcano',
        title: 'NASA Terra ASTER 3D Satellite: Mauna Kea Cinder Cones & Ridge',
        mission: 'NASA Earth Observatory / Terra ASTER',
        instrument: 'Advanced Spaceborne Thermal Emission Radiometer',
        solOrDate: 'Satellite Stereo Orthophoto',
        credit: 'NASA / JPL / METI',
        description:
          'High-resolution satellite view of the cinder cones and barren volcanic terrain of Mauna Kea, displaying surface textures comparable to Martian shield volcanoes.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA23339/PIA23339~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA23339/PIA23339~thumb.jpg',
        fallbackUrl: '/textures/maunakea_satellite.jpg',
      },
      {
        id: 'mauna-kea-iss-view',
        title: 'ISS Astronaut Orbital Photograph: Mauna Kea Summit Above Clouds',
        mission: 'International Space Station / Crew Earth Observations',
        instrument: 'Nikon Digital SLR Telephoto',
        solOrDate: 'Expedition 68 Orbital Pass',
        credit: 'NASA / Johnson Space Center',
        description:
          'Astronaut photograph from 400 km altitude showing the volcanic peaks of Hawaii rising above the maritime stratocumulus inversion layer.',
        imageUrl: 'https://images-assets.nasa.gov/image/iss068e033632/iss068e033632~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/iss068e033632/iss068e033632~thumb.jpg',
        fallbackUrl: '/textures/maunakea_satellite.jpg',
      },
      {
        id: 'mauna-kea-keck',
        title: 'NASA / JPL Keck Interferometer Summit Observatory',
        mission: 'NASA Exoplanet Exploration / Keck Telescopes',
        instrument: 'Twin 10-meter Optical / Infrared Telescopes',
        solOrDate: 'Summit Baseline Calibration',
        credit: 'NASA / JPL-Caltech / W. M. Keck Observatory',
        description:
          'The twin Keck telescopes on the summit of Mauna Kea at 4,145 meters elevation, combining light to search for planets around distant stars.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA04494/PIA04494~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA04494/PIA04494~thumb.jpg',
        fallbackUrl: '/textures/maunakea_satellite.jpg',
        isPanorama: true,
      },
    ],
  },

  'svalbard-vault': {
    locationId: 'svalbard-vault',
    name: 'Svalbard Global Seed Vault',
    ancientName: 'Platåberget Permafrost Repository · 78°N Arctic',
    celestialBody: 'earth',
    bodyType: 'earth',
    satelliteTextureUrl: '/textures/svalbard_satellite.jpg',
    googleEarthUrl: 'https://earth.google.com/web/@78.2358,15.4913,130a,1600d,35y,0h,55t,0r',
    googleMapsEmbedUrl: 'https://www.openstreetmap.org/export/embed.html?bbox=15.4000%2C78.2100%2C15.6000%2C78.2600&layer=mapnik&marker=78.2358%2C15.4913',
    coordinates: '78.2358° N, 15.4913° E',
    elevation: '0.130 km (Sandstone Mountain Portal)',
    atmosphericPressureKpa: 100.8,
    temperatureRangeC: { min: -20, max: 8, mean: -5 },
    solarFluxWm2: 120,
    waterIceDepthMeters: 'Continuous Arctic permafrost ice bedrock (130m deep)',
    radiationDoseMsvYear: 2.8,
    dustOpticalDepthTau: 0.01,
    geologicalContext:
      'Embedded 130 meters inside Platåberget in the Norwegian Arctic archipelago of Svalbard. Encased in frozen permafrost sandstone, the facility safeguards over 1.2 million distinct agricultural crop seed samples, serving as humanity’s ultimate biological genetic backup.',
    agriculturalAssessment: {
      suitabilityScore: 79,
      waterAccessRating: 'Deep Cryogenic Permafrost',
      lightingCondition: 'Sub-optimal Polar',
      thermalShieldingNeed: 'Standard Terrestrial HVAC',
      recommendedCrops: ['Triticum aestivum (Winter Wheat)', 'Secale cereale (Rye)', 'Brassica oleracea', 'Pisum sativum', 'Solanum microdontum'],
      caloricHarvestMultiplier: 1.10,
    },
    terrain3DConfig: {
      groundColorHex: 0xd8e4e8, // Arctic snow & permafrost rock
      skyColorHex: 0x7ca8cc, // Pale polar arctic sky
      fogDensity: 0.0018,
      roughness: 0.70,
      boulderDensity: 'moderate',
      craterRimScale: 0.8,
      dustStormColorHex: 0xc8d8e0, // Arctic blizzard / whiteout
      hasIceFrost: true,
      bodyType: 'earth',
      earthType: 'svalbard',
      gravityMss: 9.807,
      hasClouds: true,
    },
    images: [
      {
        id: 'svalbard-glacier-aster',
        title: 'NASA ASTER Satellite Map: Longyearbyen Fjord & Platåberget',
        mission: 'NASA Earth Observatory / Terra ASTER',
        instrument: 'Advanced Spaceborne Thermal Emission Radiometer',
        solOrDate: 'Arctic High-Latitude Reconnaissance',
        credit: 'NASA / JPL / METI',
        description:
          'Multispectral satellite image of Longyearbyen, Adventfjorden, and Platåberget plateau, highlighting frozen glacial channels and permafrost formations.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA10626/PIA10626~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA10626/PIA10626~thumb.jpg',
        fallbackUrl: '/textures/svalbard_satellite.jpg',
      },
      {
        id: 'svalbard-rimfax-field',
        title: 'NASA Testing Sub-Permafrost Radar on Svalbard Arctic Ice',
        mission: 'NASA Mars 2020 / RIMFAX Team',
        instrument: 'Ground-Penetrating Radar Field Qualification',
        solOrDate: 'Svalbard Field Expedition',
        credit: 'NASA / JPL-Caltech / FFI',
        description:
          'NASA scientists field-testing the RIMFAX radar on Svalbard glaciers prior to integration on the Perseverance rover to detect subsurface ice sheets.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA24048/PIA24048~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA24048/PIA24048~thumb.jpg',
        fallbackUrl: '/textures/svalbard_satellite.jpg',
      },
      {
        id: 'svalbard-cryo-survey',
        title: 'NASA Airborne Cryo-Survey: Svalbard Glacier & Sandstone Valleys',
        mission: 'NASA Operation IceBridge',
        instrument: 'Airborne Laser Altimeter & Digital Mapping System',
        solOrDate: 'Arctic Permafrost Campaign',
        credit: 'NASA / Goddard Space Flight Center',
        description:
          'Aerial documentation of the permafrost terrain and glaciated mountains of Spitsbergen surrounding the Global Seed Vault repository.',
        imageUrl: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001496/GSFC_20171208_Archive_e001496~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001496/GSFC_20171208_Archive_e001496~thumb.jpg',
        fallbackUrl: '/textures/svalbard_satellite.jpg',
        isPanorama: true,
      },
    ],
  },

  // ── 4. The Moon (Luna) Surface Bases & Craters ───────────────────────────────
  'shackleton-crater': {
    locationId: 'shackleton-crater',
    name: 'Shackleton Crater (Artemis Base Camp)',
    ancientName: 'Lunar South Pole · Peaks of Eternal Light',
    celestialBody: 'moon',
    bodyType: 'moon',
    satelliteTextureUrl: 'https://images-assets.nasa.gov/image/PIA13517/PIA13517~large.jpg',
    googleEarthUrl: 'https://quickmap.lroc.asu.edu/?extent=-90,-180,90,180&proj=16&layers=nrbt,grid',
    googleMapsEmbedUrl: 'https://maps.google.com/maps?q=-89.9,0.0&t=k&z=4&output=embed',
    coordinates: '89.9° S, 0.0° E (Lunar South Pole)',
    elevation: '-4.2 km (Crater Interior Floor)',
    atmosphericPressureKpa: 0.000,
    temperatureRangeC: { min: -248, max: -10, mean: -50 },
    solarFluxWm2: 440,
    waterIceDepthMeters: 'Gigatons of deep volatile ice sheets inside permanently shadowed cold traps',
    radiationDoseMsvYear: 1360,
    dustOpticalDepthTau: 0.00,
    geologicalContext:
      'Impact crater at the Lunar South Pole whose 4.2-km-high rim peaks receive near-continuous sunlight (up to 92% of the lunar year), while its deep interior floor lies in perpetual darkness at -248°C (25 Kelvin). NASA Artemis has selected this perimeter for humanity’s first permanent lunar habitat camp and water extraction refinery.',
    agriculturalAssessment: {
      suitabilityScore: 91,
      waterAccessRating: 'Permanently Shadowed Volatile Ice',
      lightingCondition: 'Continuous Peak of Eternal Light',
      thermalShieldingNeed: 'Extreme Lunar Vacuum & 14-Day Night Thermal Shielding',
      recommendedCrops: ['Artemis Micro-Greens', 'Chlorella vulgaris', 'Dwarf Sweet Potato', 'Soybean cultivar 88', 'Radish Cherry Belle'],
      caloricHarvestMultiplier: 1.45,
    },
    terrain3DConfig: {
      groundColorHex: 0x888684, // Pulverized lunar anorthosite regolith
      skyColorHex: 0x000003, // Pitch black cosmic vacuum
      fogDensity: 0.0001,
      roughness: 0.88,
      boulderDensity: 'moderate',
      craterRimScale: 3.5,
      dustStormColorHex: 0x333344,
      hasIceFrost: true,
      isMoon: true,
      bodyType: 'moon',
      lunarType: 'shackleton',
      gravityMss: 1.62,
    },
    images: [
      {
        id: 'shackleton-lroc-polar-mosaic',
        title: 'NASA LRO: Shackleton Crater Rim Peaks of Eternal Light',
        mission: 'NASA Lunar Reconnaissance Orbiter (LRO)',
        instrument: 'Lunar Reconnaissance Orbiter Camera (LROC NAC)',
        solOrDate: 'Polar Illumination Campaign',
        credit: 'NASA / GSFC / Arizona State University',
        description:
          'High-resolution multi-orbit illumination mosaic of the 21-km-wide Shackleton Crater rim, revealing the elevated ridges that enjoy continuous solar power while the deep interior floor remains in billion-year shadow.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA13517/PIA13517~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA13517/PIA13517~thumb.jpg',
        fallbackUrl: '/textures/earth_realistic.jpg',
      },
      {
        id: 'shackleton-diviner-temperature',
        title: 'LRO Diviner: Cryogenic 25-Kelvin South Pole Cold Traps',
        mission: 'NASA Lunar Reconnaissance Orbiter',
        instrument: 'Diviner Lunar Radiometer Experiment',
        solOrDate: 'Thermal Mapping Cycle',
        credit: 'NASA / JPL-Caltech / UCLA',
        description:
          'Thermal emission mapping confirming Shackleton Crater floor reaches an astonishing -248°C (25 Kelvin), cold enough to trap water ice, methane, ammonia, and organic volatiles over astronomical timescales.',
        imageUrl: 'https://images-assets.nasa.gov/image/PIA12231/PIA12231~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA12231/PIA12231~thumb.jpg',
        fallbackUrl: '/textures/earth_realistic.jpg',
      },
      {
        id: 'artemis-orion-earthrise',
        title: 'NASA Artemis 1: Earthrise Over the Lunar South Horizon',
        mission: 'NASA Artemis 1 Flight Test',
        instrument: 'Orion Optical Navigation Camera',
        solOrDate: 'Mission Day 20 Flyby',
        credit: 'NASA / Johnson Space Center',
        description:
          'Stunning view of the bright blue Earth rising above the jagged cratered lunar limb, captured by the uncrewed Orion spacecraft during its record-breaking lunar orbit flight test.',
        imageUrl: 'https://images-assets.nasa.gov/image/art001e000672/art001e000672~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/art001e000672/art001e000672~thumb.jpg',
        fallbackUrl: '/textures/earth_realistic.jpg',
        isPanorama: true,
      },
    ],
  },

  'tranquility-base': {
    locationId: 'tranquility-base',
    name: 'Tranquility Base (Apollo 11 Outpost)',
    ancientName: 'Mare Tranquillitatis · Statio Tranquillitatis',
    celestialBody: 'moon',
    bodyType: 'moon',
    satelliteTextureUrl: 'https://images-assets.nasa.gov/image/as11-40-5875/as11-40-5875~large.jpg',
    googleEarthUrl: 'https://quickmap.lroc.asu.edu/?extent=0.674,23.473,0.675,23.474&proj=10',
    googleMapsEmbedUrl: 'https://maps.google.com/maps?q=0.674,23.473&t=k&z=4&output=embed',
    coordinates: '0.674° N, 23.473° E',
    elevation: '-1.2 km (Lunar Mean Radius)',
    atmosphericPressureKpa: 0.000,
    temperatureRangeC: { min: -173, max: 117, mean: -20 },
    solarFluxWm2: 430,
    waterIceDepthMeters: 'Dry ilmenite & pyroxene regolith (oxygen extracted via hydrogen reduction)',
    radiationDoseMsvYear: 1420,
    dustOpticalDepthTau: 0.00,
    geologicalContext:
      'Historic site where human boots first touched another world on July 20, 1969. The flat, basaltic mare volcanic plains are composed of titanium-rich ilmenite regolith. In the sky above, the radiant blue planet Earth hangs stationary at 60° elevation under an eternal star-filled cosmic night.',
    agriculturalAssessment: {
      suitabilityScore: 82,
      waterAccessRating: 'Hydrated Phyllosilicate / Volatiles Baking',
      lightingCondition: 'High Equatorial',
      thermalShieldingNeed: 'Extreme Lunar Vacuum & 14-Day Night Thermal Shielding',
      recommendedCrops: ['Basalt Hydroponic Spirulina', 'Lemna minor (Duckweed)', 'Arabidopsis thaliana (Apollo Lunar Regolith Trial)', 'Dwarf Wheat'],
      caloricHarvestMultiplier: 1.35,
    },
    terrain3DConfig: {
      groundColorHex: 0x767472, // Basaltic lunar mare grey
      skyColorHex: 0x000002, // Vacuum black
      fogDensity: 0.0001,
      roughness: 0.85,
      boulderDensity: 'sparse',
      craterRimScale: 2.0,
      dustStormColorHex: 0x222233,
      isMoon: true,
      bodyType: 'moon',
      lunarType: 'tranquility',
      gravityMss: 1.62,
    },
    images: [
      {
        id: 'apollo11-aldrin-visior',
        title: 'Apollo 11: Buzz Aldrin on the Lunar Surface with Gold Visor',
        mission: 'NASA Apollo 11 Lunar Landing',
        instrument: '70mm Hasselblad 500EL Data Camera',
        solOrDate: 'July 20, 1969',
        credit: 'NASA / Neil A. Armstrong',
        description:
          'Astronaut Buzz Aldrin photographed standing in the powdery lunar regolith. Reflected in his gold sun visor are astronaut Neil Armstrong, the Lunar Module Eagle, the American flag, and the solar wind composition experiment.',
        imageUrl: 'https://images-assets.nasa.gov/image/as11-40-5903/as11-40-5903~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/as11-40-5903/as11-40-5903~thumb.jpg',
        fallbackUrl: '/textures/earth_realistic.jpg',
      },
      {
        id: 'apollo11-eagle-descent-stage',
        title: 'Apollo 11 Lunar Module Eagle Descent Stage at Tranquility Base',
        mission: 'NASA Apollo 11',
        instrument: '70mm Hasselblad Camera',
        solOrDate: 'July 20, 1969',
        credit: 'NASA / Apollo 11 Crew',
        description:
          'The golden Kapton-foil insulated descent stage of Lunar Module Eagle resting on the powdery soil of Mare Tranquillitatis, showing landing footpads with lunar surface probes.',
        imageUrl: 'https://images-assets.nasa.gov/image/AS11-40-5886/AS11-40-5886~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/AS11-40-5886/AS11-40-5886~thumb.jpg',
        fallbackUrl: '/textures/earth_realistic.jpg',
      },
      {
        id: 'apollo11-earth-overhead',
        title: 'Radiant Blue Earth Suspended Above the Stark Lunar Horizon',
        mission: 'NASA Apollo 11',
        instrument: '70mm Hasselblad Camera',
        solOrDate: 'Lunar Orbit & Surface Ingress',
        credit: 'NASA / Apollo 11',
        description:
          'Classic photograph of the fragile, luminous Earth glowing in the pitch-black void of space above the stark, cratered lunar surface.',
        imageUrl: 'https://images-assets.nasa.gov/image/AS11-44-6552/AS11-44-6552~medium.jpg',
        thumbnailUrl: 'https://images-assets.nasa.gov/image/AS11-44-6552/AS11-44-6552~thumb.jpg',
        fallbackUrl: '/textures/earth_realistic.jpg',
        isPanorama: true,
      },
    ],
  },
};
