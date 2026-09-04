export interface NasaDatasetInfo {
  id: string;
  name: string;
  instrument: string;
  mission: string;
  parametersProvided: string[];
  scientificRelevance: string;
  nasaDataPortalUrl: string;
  sampleReading: Record<string, string | number>;
}

export const NASA_DATASETS: NasaDatasetInfo[] = [
  {
    id: 'mola-elevation',
    name: 'Mars Orbiter Laser Altimeter (MOLA)',
    instrument: 'Precision Laser Altimeter',
    mission: 'Mars Global Surveyor (MGS)',
    parametersProvided: ['Topography Elevation (km)', 'Surface Slope Gradient', 'Crater Basin Depth'],
    scientificRelevance: 'Determines atmospheric column density, pressure (which scales exponentially with depth), and structural foundation viability for greenhouse anchor pylons.',
    nasaDataPortalUrl: 'https://pds-geosciences.wustl.edu/missions/mgs/mola.html',
    sampleReading: {
      datumReference: 'Mars Areoid (0 km elevation)',
      deepestLocationRecorded: 'Hellas Basin (-8.2 km)',
      highestLocationRecorded: 'Olympus Mons (+21.9 km)'
    }
  },
  {
    id: 'rems-weather',
    name: 'Rover Environmental Monitoring Station (REMS)',
    instrument: 'Ground & Air Temperature, Pressure, Relative Humidity Sensors',
    mission: 'NASA Curiosity Rover (MSL)',
    parametersProvided: ['Diurnal Air Temperature (°C)', 'Ground Regolith Temperature (°C)', 'UV Flux (A/B/C/D bands)', 'Atmospheric Pressure (Pa)'],
    scientificRelevance: 'Provides ground-truth daily Martian weather profiles used to simulate greenhouse heating loads and solar transmittance.',
    nasaDataPortalUrl: 'https://pds-atmospheres.nmsu.edu/data_and_services/atmospheres_data/MARS/curiosity/rems.html',
    sampleReading: {
      averageDailyTemp: '-48°C',
      minimumNightTemp: '-78°C',
      ambientPressure: '840 Pa (0.84 kPa)'
    }
  },
  {
    id: 'sharad-radar',
    name: 'Shallow Radar (SHARAD)',
    instrument: 'Subsurface Sounding Synthetic Aperture Radar',
    mission: 'Mars Reconnaissance Orbiter (MRO)',
    parametersProvided: ['Dielectric Permittivity', 'Subsurface Water Ice Sheet Depth (m)', 'Ice Purity (% Volume)'],
    scientificRelevance: 'Identifies massive subterranean glacial ice sheets in Utopia and Arcadia Planitia, determining in-situ water extraction feasibility for closed-loop hydroponics.',
    nasaDataPortalUrl: 'https://pds-geosciences.wustl.edu/mro/mro-m-sharad-3-edr-v1/mrosh_0001/',
    sampleReading: {
      icePurityEstimate: '85–98% H2O ice',
      overburdenThickness: '1 to 10 meters of dry regolith'
    }
  },
  {
    id: 'rad-radiation',
    name: 'Radiation Assessment Detector (RAD)',
    instrument: 'Charged Particle & Neutron Spectrometer',
    mission: 'NASA Mars Science Laboratory',
    parametersProvided: ['Galactic Cosmic Ray (GCR) Dose Rate', 'Solar Particle Event (SPE) Flux', 'Equivalent Biological Dose (mSv/yr)'],
    scientificRelevance: 'Directly informs greenhouse hull shielding thickness requirements and biological mutation risk factors for crop cultivars.',
    nasaDataPortalUrl: 'https://pds-ppi.igpp.ucla.edu/mission/MarsScienceLaboratory/RAD',
    sampleReading: {
      surfaceDoseRate: '0.64 mSv/day (unshielded)',
      shieldedUndergroundEstimate: '< 0.05 mSv/day'
    }
  }
];

export const NASA_ATTRIBUTION_STATEMENT = 
  "NASA planetary science data (MOLA, REMS, SHARAD, RAD, CRISM) informs the Martian environmental baseline. Agricultural suitability scores, crop thermodynamic cycles, and crew survival percentages are validated simulation models engineered specifically for the MARS FARM simulation project.";
