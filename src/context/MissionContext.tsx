import React, { createContext, useContext, useState, useEffect } from 'react';
import { MissionConfig, MarsLocation, CropAllocation, MissionScore, MissionTelemetryLog } from '../types';
import { MARS_LOCATIONS } from '../data/marsLocations';
import { CROPS_DATA } from '../data/cropsData';
import { calculateResourceBalance, ResourceBalanceProjection } from '../engine/resourceEngine';
import { calculateFarmSuitability } from '../engine/suitability';
import { runFullDeterministicSimulation, SimulationResult } from '../engine/simulationEngine';
import { calculateMissionScore } from '../engine/scoringEngine';
import { nasaService, NasaApiStatus } from '../services/nasaService';

interface MissionContextType {
  config: MissionConfig;
  selectedLocation: MarsLocation;
  resourceProjection: ResourceBalanceProjection;
  suitability: ReturnType<typeof calculateFarmSuitability>;
  simulationResult: SimulationResult | null;
  missionScore: MissionScore | null;
  eventChoices: Record<string, string>;
  nasaStatus: NasaApiStatus;
  telemetryLogs: MissionTelemetryLog[];
  setTelemetryLogs: React.Dispatch<React.SetStateAction<MissionTelemetryLog[]>>;
  
  // Actions
  setLocation: (locationId: string) => void;
  updateConfig: (partial: Partial<MissionConfig>) => void;
  setCropAllocation: (cropId: string, areaM2: number) => void;
  clearAllocations: () => void;
  loadDemoMission: () => void;
  runSimulation: () => SimulationResult;
  recordEventChoice: (eventId: string, choiceId: string) => void;
  resetMission: () => void;
}

const DEFAULT_CONFIG: MissionConfig = {
  crewSize: 6,
  missionDays: 365,
  farmAreaM2: 100,
  waterReserveLiters: 5000,
  dailyEnergyBudgetKwh: 50,
  selectedLocationId: 'jezero-crater',
  cropAllocations: [
    { cropId: 'potato', areaM2: 40 },
    { cropId: 'lettuce', areaM2: 20 },
    { cropId: 'tomato', areaM2: 20 },
    { cropId: 'wheat', areaM2: 20 },
  ],
  greenhouseModules: {
    solarArrayLevel: 2,
    batteryBankLevel: 2,
    ledOptimization: true,
    hydroponicClosedLoop: true,
    thermalRegulatorShield: true,
  }
};

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<MissionConfig>(() => {
    const saved = localStorage.getItem('mars_farm_config_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_CONFIG;
  });

  const [eventChoices, setEventChoices] = useState<Record<string, string>>({});
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [missionScore, setMissionScore] = useState<MissionScore | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<MissionTelemetryLog[]>([]);
  const [nasaStatus, setNasaStatus] = useState<NasaApiStatus>({
    isLive: false,
    dataSourceLabel: 'VERIFIED NASA ARCHIVE (OFFLINE CACHE)',
    attribution: 'NASA MOLA / REMS / SHARAD / CRISM'
  });

  // Fetch NASA status on mount
  useEffect(() => {
    nasaService.getMarsLocations().then(res => {
      setNasaStatus(res.status);
    });
  }, []);

  // Save config on changes
  useEffect(() => {
    localStorage.setItem('mars_farm_config_v1', JSON.stringify(config));
  }, [config]);

  const selectedLocation = MARS_LOCATIONS.find(l => l.id === config.selectedLocationId) || MARS_LOCATIONS[0];
  const suitability = calculateFarmSuitability(selectedLocation);
  const resourceProjection = calculateResourceBalance(config, selectedLocation.solarPotentialScore);

  const setLocation = (locationId: string) => {
    setConfig(prev => ({ ...prev, selectedLocationId: locationId }));
  };

  const updateConfig = (partial: Partial<MissionConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }));
  };

  const setCropAllocation = (cropId: string, areaM2: number) => {
    setConfig(prev => {
      const existing = prev.cropAllocations.filter(a => a.cropId !== cropId);
      if (areaM2 > 0) {
        existing.push({ cropId, areaM2 });
      }
      return { ...prev, cropAllocations: existing };
    });
  };

  const clearAllocations = () => {
    setConfig(prev => ({ ...prev, cropAllocations: [] }));
  };

  const loadDemoMission = () => {
    const demo: MissionConfig = {
      crewSize: 6,
      missionDays: 365,
      farmAreaM2: 100,
      waterReserveLiters: 5000,
      dailyEnergyBudgetKwh: 50,
      selectedLocationId: 'jezero-crater',
      cropAllocations: [
        { cropId: 'potato', areaM2: 45 },
        { cropId: 'lettuce', areaM2: 15 },
        { cropId: 'tomato', areaM2: 20 },
        { cropId: 'wheat', areaM2: 20 },
      ],
      greenhouseModules: {
        solarArrayLevel: 2,
        batteryBankLevel: 2,
        ledOptimization: true,
        hydroponicClosedLoop: true,
        thermalRegulatorShield: true,
      }
    };
    setConfig(demo);
    setEventChoices({});
    setSimulationResult(null);
    setMissionScore(null);
  };

  const recordEventChoice = (eventId: string, choiceId: string) => {
    setEventChoices(prev => ({ ...prev, [eventId]: choiceId }));
  };

  const runSimulation = () => {
    const res = runFullDeterministicSimulation(config, eventChoices);
    const score = calculateMissionScore(res, config);
    setSimulationResult(res);
    setMissionScore(score);
    return res;
  };

  const resetMission = () => {
    setEventChoices({});
    setSimulationResult(null);
    setMissionScore(null);
  };

  return (
    <MissionContext.Provider
      value={{
        config,
        selectedLocation,
        resourceProjection,
        suitability,
        simulationResult,
        missionScore,
        eventChoices,
        nasaStatus,
        telemetryLogs,
        setTelemetryLogs,
        setLocation,
        updateConfig,
        setCropAllocation,
        clearAllocations,
        loadDemoMission,
        runSimulation,
        recordEventChoice,
        resetMission
      }}
    >
      {children}
    </MissionContext.Provider>
  );
};

export const useMission = () => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
};
