import { MissionEvent } from '../types';

export const MISSION_EVENTS: MissionEvent[] = [
  {
    id: 'event-dust-storm',
    name: 'Global Dust Storm',
    icon: '🌪️',
    type: 'DUST_STORM',
    triggerDay: 45,
    durationDays: 14,
    severity: 'Severe',
    title: 'Atmospheric Dust Squall Enveloping Colony',
    description: 'Orbital Mars Reconnaissance Orbiter data indicates a regional dust storm has expanded globally. Atmospheric optical depth (tau) has surged to 3.2, reducing solar panel irradiance by 65%.',
    scientificContext: 'Mars global dust storms (like the 2018 storm that ended the Opportunity rover) block incident sunlight and settle fine electrostatically-charged particulate on photovoltaic panels.',
    choices: [
      {
        id: 'storm-opt-battery',
        label: 'Discharge Backup Battery Grid',
        description: 'Keep full LED grow-spectrum lighting active by tapping into secondary energy reserves.',
        costDescription: 'Consumes 18 kWh of battery storage per day for the storm duration. Crops maintain 100% growth.',
        actionType: 'battery',
        immediateEffects: {
          batteryDeltaKwh: -40,
          cropHealthDeltaPercent: 0,
          energyModifier: 0.9
        }
      },
      {
        id: 'storm-opt-lighting',
        label: 'Dim Grow Lights to Maintenance Mode',
        description: 'Throttle LED photosynthetic active radiation (PAR) to 40% survival baseline to conserve power.',
        costDescription: 'Saves battery power, but crop growth rate slows by 45% during the storm.',
        actionType: 'lighting',
        immediateEffects: {
          batteryDeltaKwh: -5,
          cropHealthDeltaPercent: -8,
          energyModifier: 0.5
        }
      },
      {
        id: 'storm-opt-sacrifice',
        label: 'Divert Energy to Crew Habitat Only',
        description: 'Shut down non-essential greenhouse bays entirely to protect crew life support batteries.',
        costDescription: 'Guarantees crew survival; vulnerable crops (tomatoes/wheat) suffer 25% biomass loss.',
        actionType: 'passive',
        immediateEffects: {
          batteryDeltaKwh: 0,
          cropHealthDeltaPercent: -25,
          crewHealthDeltaPercent: +5
        }
      }
    ]
  },
  {
    id: 'event-solar-flare',
    name: 'Coronal Mass Ejection & Solar Flare',
    icon: '☀️',
    type: 'SOLAR_FLARE',
    triggerDay: 110,
    durationDays: 5,
    severity: 'Critical',
    title: 'Severe Solar Energetic Particle (SEP) Surge',
    description: 'NOAA Deep Space Space-Weather Network alerts a coronal mass ejection is impacting Mars. Unshielded cosmic radiation levels jump to 8.5 mSv/day.',
    scientificContext: 'Without a global magnetic field, Mars surface receives dangerous SPE radiation capable of mutating plant DNA and damaging crew cells unless electromagnetic or water-wall shielding is engaged.',
    choices: [
      {
        id: 'flare-opt-shield',
        label: 'Deploy Electromagnetic Hull Deflectors',
        description: 'Energize magnetic superconducting coils to form an artificial magnetosphere over the greenhouse.',
        costDescription: 'Drains 25 kWh total energy from colony grid. 100% radiation protection for crops and crew.',
        actionType: 'shield',
        immediateEffects: {
          batteryDeltaKwh: -25,
          cropHealthDeltaPercent: 0,
          crewHealthDeltaPercent: 0
        }
      },
      {
        id: 'flare-opt-water-wall',
        label: 'Flood Ceiling Jackets with Graywater',
        description: 'Pump 800L of water reserve into hollow greenhouse ceiling panels as a dense hydrogen radiation shield.',
        costDescription: 'Temporary 5% water evaporation loss, but protects botanical genetic integrity.',
        actionType: 'ration',
        immediateEffects: {
          waterDeltaL: -50,
          cropHealthDeltaPercent: -2,
          crewHealthDeltaPercent: 0
        }
      },
      {
        id: 'flare-opt-bunker',
        label: 'Evacuate Crew to Regolith Storm Shelter',
        description: 'Astronauts retreat to underground shelter, leaving greenhouse unshielded for 5 days.',
        costDescription: 'Zero energy cost. High-sensitivity crops suffer minor radiation DNA degradation (-12% health).',
        actionType: 'passive',
        immediateEffects: {
          batteryDeltaKwh: 0,
          cropHealthDeltaPercent: -12,
          crewHealthDeltaPercent: 0
        }
      }
    ]
  },
  {
    id: 'event-water-failure',
    name: 'Hydroponic Loop Pressure Failure',
    icon: '💧',
    type: 'WATER_FAILURE',
    triggerDay: 190,
    durationDays: 8,
    severity: 'Severe',
    title: 'Subsurface Closed-Loop Water Recycling Anomaly',
    description: 'Regolith dust abrasive intrusion has clogged the primary water filtration membranes, reducing closed-loop recycling efficiency from 95% down to 50%.',
    scientificContext: 'Martian life support systems (like ECLSS on the ISS) rely on continuous water recovery from plant transpiration and humidity condensates.',
    choices: [
      {
        id: 'water-opt-repair',
        label: 'Perform Astronaut EVA Filter Overhaul',
        description: 'Dispatch crew members on a surface EVA to flush sand filters and replace seals with spare 3D-printed parts.',
        costDescription: 'Uses 200L flushing water and crew labor. Restores recycling efficiency to 98%.',
        actionType: 'repair',
        immediateEffects: {
          waterDeltaL: -120,
          cropHealthDeltaPercent: +5,
          crewHealthDeltaPercent: -2
        }
      },
      {
        id: 'water-opt-ration',
        label: 'Ration Water to High-Yield Crops',
        description: 'Cut water delivery to low-calorie greens (lettuce) while maintaining potatoes and wheat.',
        costDescription: 'Lettuce yield is halved, but saves 400L of water reserves for mission buffer.',
        actionType: 'ration',
        immediateEffects: {
          waterDeltaL: +50,
          cropHealthDeltaPercent: -10,
          crewHealthDeltaPercent: 0
        }
      }
    ]
  },
  {
    id: 'event-temp-drop',
    name: 'Aphelion Sub-Zero Thermal Drop',
    icon: '🌡️',
    type: 'TEMP_DROP',
    triggerDay: 260,
    durationDays: 10,
    severity: 'Moderate',
    title: 'Martian Winter Deep Freeze Extreme',
    description: 'Mars orbital aphelion has coincided with polar vortex shifts, dropping ambient night temperatures to an extreme -98°C. Greenhouse insulation is operating at thermal limit.',
    scientificContext: 'Mars has an eccentric orbit causing 40% variations in solar heating between perihelion and aphelion. Extreme cold causes root freeze if subfloor heating fails.',
    choices: [
      {
        id: 'temp-opt-heat',
        label: 'Overdrive Geothermal / Electrical Heat Coils',
        description: 'Increase thermal regulation power budget by 12 kWh/day to hold soil temperature at +18°C.',
        costDescription: 'Higher daily power consumption, maintaining 100% crop growth rates.',
        actionType: 'battery',
        immediateEffects: {
          batteryDeltaKwh: -20,
          cropHealthDeltaPercent: +2
        }
      },
      {
        id: 'temp-opt-insulate',
        label: 'Apply Aerogel Thermal Blankets',
        description: 'Deploy silica aerogel quilts over crop beds to trap ground heat passively.',
        costDescription: 'Consumes zero energy, but reduces daylight canopy penetration by 15%.',
        actionType: 'passive',
        immediateEffects: {
          batteryDeltaKwh: 0,
          cropHealthDeltaPercent: -5
        }
      }
    ]
  },
  {
    id: 'event-crop-disease',
    name: 'Bacterial Root Blight Outbreak',
    icon: '🦠',
    type: 'CROP_DISEASE',
    triggerDay: 310,
    durationDays: 7,
    severity: 'Moderate',
    title: 'Opportunistic Biofilm Mutation in Nutrient Reservoir',
    description: 'A benign Earth-origin bacterium in the hydroponic fertilizer mix has mutated in the high-radiation Martian environment, causing root rot symptoms in tomato and potato beds.',
    scientificContext: 'Space microbiology studies aboard the ISS prove microgravity and radiation increase microbial biofilm virulence while weakening plant immune responses.',
    choices: [
      {
        id: 'disease-opt-uv',
        label: 'Pulse UV-C Sterilization & Ozone Flush',
        description: 'Run deep ultraviolet germicidal irradiation cycles through hydroponic plumbing.',
        costDescription: 'Uses 15 kWh of energy and 80L ozone fluid; stops infection instantly with zero crop losses.',
        actionType: 'shield',
        immediateEffects: {
          batteryDeltaKwh: -15,
          waterDeltaL: -40,
          cropHealthDeltaPercent: +8
        }
      },
      {
        id: 'disease-opt-quarantine',
        label: 'Quarantine & Cull Infected 10m² Bed',
        description: 'Physically excise the infected modular tray to save the rest of the farm.',
        costDescription: 'Zero energy cost, but lose 10m² of current crop cycle biomass.',
        actionType: 'quarantine',
        immediateEffects: {
          batteryDeltaKwh: 0,
          cropHealthDeltaPercent: -15
        }
      }
    ]
  }
];
