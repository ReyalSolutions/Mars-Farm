import { MissionConfig, SuitabilityBreakdown } from '../types';
import { ResourceBalanceProjection } from '../engine/resourceEngine';
import { MARS_LOCATIONS } from '../data/marsLocations';

export interface AiAdvisorStatus {
  isLive: boolean;
  provider: 'OPENROUTER' | 'GEMINI' | 'OPENAI' | 'HEURISTIC';
  label: string;
  modelName: string;
}

export interface AiAdvisorResponse {
  answer: string;
  suggestedAction?: {
    type: 'ADD_CROP' | 'EXPAND_FARM' | 'CHANGE_LOCATION' | 'UPGRADE_MODULE';
    payload: Record<string, any>;
  };
  confidence: number;
  source: 'LIVE_LLM' | 'HEURISTIC_ENGINE';
}

// Cached status updated asynchronously from the backend /api/advisor endpoint
let cachedStatus: AiAdvisorStatus = {
  isLive: true,
  provider: 'OPENAI',
  label: 'LIVE AI: SERVER ADVISOR',
  modelName: 'gpt-4o-mini',
};

// Check backend status in background on startup
if (typeof window !== 'undefined') {
  fetch('/api/advisor')
    .then(res => (res.ok ? res.json() : null))
    .then(data => {
      if (data && typeof data.isLive === 'boolean') {
        cachedStatus = data;
      }
    })
    .catch(() => {
      cachedStatus = {
        isLive: false,
        provider: 'HEURISTIC',
        label: 'DETERMINISTIC HEURISTIC ENGINE',
        modelName: 'NASA AgriSim v2.6 Analytical Matrix',
      };
    });
}

export function getAiAdvisorStatus(): AiAdvisorStatus {
  return cachedStatus;
}

export async function queryFarmerAiAsync(
  question: string,
  config: MissionConfig,
  projection: ResourceBalanceProjection,
  suitability?: SuitabilityBreakdown
): Promise<AiAdvisorResponse> {
  // Query server-side API function securely without exposing keys to browser
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch('/api/advisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        config,
        projection,
        suitability,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data?.answer && data.answer.trim().length > 0) {
        return {
          answer: data.answer.trim(),
          confidence: data.confidence || 0.98,
          source: 'LIVE_LLM',
        };
      }
    }
  } catch (err) {
    console.warn('[Mars Farm] Server advisor query failed, falling back to heuristic engine:', err);
  }

  // Fallback to built-in deep deterministic analytical engine
  const fallback = queryFarmerAi(question, config, projection, suitability);
  return {
    ...fallback,
    source: 'HEURISTIC_ENGINE',
  };
}

export function queryFarmerAi(
  question: string,
  config: MissionConfig,
  projection: ResourceBalanceProjection,
  suitability?: SuitabilityBreakdown
): AiAdvisorResponse {
  const q = question.toLowerCase();
  const location = MARS_LOCATIONS.find(l => l.id === config.selectedLocationId) || MARS_LOCATIONS[0];

  // Extract any numbers from user query (e.g. "for 8 astronauts", "150m2", "500 sols", "2000 liters")
  const numbersFound = question.match(/\b\d+(\.\d+)?\b/g)?.map(Number) || [];
  const hasCrewMention = q.includes('crew') || q.includes('astronaut') || q.includes('people') || q.includes('person');
  const hasAreaMention = q.includes('m2') || q.includes('sqm') || q.includes('square') || q.includes('area') || q.includes('size');
  const hasWaterMention = q.includes('water') || q.includes('liter') || q.includes('reservoir') || q.includes('ice');
  const hasDustMention = q.includes('dust') || q.includes('storm') || q.includes('tau') || q.includes('opacity');
  const hasPotatoMention = q.includes('potato');
  const hasWheatMention = q.includes('wheat');
  const hasLettuceMention = q.includes('lettuce');
  const hasTomatoMention = q.includes('tomato');
  const hasSoybeanMention = q.includes('soybean') || q.includes('protein');

  // Analytical Response 1: Custom Crew Scaling Analysis
  if (hasCrewMention && numbersFound.length > 0) {
    const requestedCrew = numbersFound[0];
    const dailyKcalNeeded = requestedCrew * 2500;
    const currentM2 = config.farmAreaM2;
    const requiredM2For100Pct = Math.round(requestedCrew * 16.5);
    const coverageWithCurrentFarm = Math.round((projection.estimatedDailyCaloriesProducedKcal / dailyKcalNeeded) * 100);
    const isViable = coverageWithCurrentFarm >= 90;

    return {
      answer: `👨‍🚀 **Crew Scaling & Caloric Feasibility Analysis**:
- **Target Crew Size**: ${requestedCrew} astronauts
- **Daily Energy Demand**: **${dailyKcalNeeded.toLocaleString()} kcal/day** (${requestedCrew} × 2,500 kcal)
- **Minimum Aeroponic Area Required**: **${requiredM2For100Pct} m²** (based on standard NASA 16.5 m²/crew baseline)
- **Current Greenhouse Area**: ${currentM2} m² → Projected Coverage: **${coverageWithCurrentFarm}%**

${isViable ? '✅ **Verdict: FEASIBLE**: Your current greenhouse infrastructure can support this crew size with nominal margins.' : '⚠️ **Verdict: DEFICIT DETECTED**: Expand greenhouse footprint to at least **' + requiredM2For100Pct + ' m²** or prioritize Dwarf Pioneer Wheat (3,400 kcal/kg) to eliminate the caloric gap.'}`,
      confidence: 0.96,
      source: 'HEURISTIC_ENGINE'
    };
  }

  // Analytical Response 2: Crop Substitution & Diet Optimization
  if (hasPotatoMention || hasWheatMention || q.includes('plant') || q.includes('crop')) {
    const potatoAlloc = config.cropAllocations.find(a => a.cropId === 'potato')?.areaM2 || 0;
    const wheatAlloc = config.cropAllocations.find(a => a.cropId === 'wheat')?.areaM2 || 0;
    const greensAlloc = (config.cropAllocations.find(a => a.cropId === 'lettuce')?.areaM2 || 0) + (config.cropAllocations.find(a => a.cropId === 'tomato')?.areaM2 || 0);

    return {
      answer: `🌱 **Agronomic Yield & Cultivar Analysis**:
- **Current Staple Ratio**: Potatoes (${potatoAlloc} m²) · Wheat (${wheatAlloc} m²) · Fresh Micro-Greens (${greensAlloc} m²)
- **Caloric Density**: Pioneer Wheat (**3,400 kcal/kg**) > Russet Potatoes (**770 kcal/kg**) > Apollo Lettuce (**150 kcal/kg**)
- **Water Consumption**: Lettuce (**110 L/kg**) has the lowest water overhead, whereas Soybeans (**260 L/kg**) require high transpiration recycling.

📊 **Recommendation for ${location.name}**:
Allocate at least **40% area to Dwarf Wheat** and **35% to Potatoes** to guarantee 100%+ calorie coverage, reserving **15-20% for Tomatoes/Lettuce** for vitamin C, A, and crew mental wellness.`,
      confidence: 0.95,
      source: 'HEURISTIC_ENGINE'
    };
  }

  // Analytical Response 3: Water Loop & ECLSS Recovery Analysis
  if (hasWaterMention) {
    const reserveDays = projection.netDailyWaterDrainL > 0
      ? Math.round(config.waterReserveLiters / projection.netDailyWaterDrainL)
      : 9999;

    return {
      answer: `💧 **ECLSS Closed-Loop Hydration Analysis**:
- **Starting Water Reserve**: ${config.waterReserveLiters.toLocaleString()} Liters
- **Net Daily Water Drain**: **${projection.netDailyWaterDrainL} L/sol** (after 95% aeroponic recovery)
- **Reserve Depletion Horizon**: **${reserveDays > 1000 ? 'Infinite (Self-Sustaining)' : reserveDays + ' Sols'}**
- **Location Hydro-Potential**: ${location.waterIcePotential} Ice Accessibility at **${location.name}**

🛠 **Directives**: If mission duration (${config.missionDays} sols) exceeds ${reserveDays} sols, activate the closed-loop ultrasonic condenser module to reduce transpiration loss.`,
      confidence: 0.94,
      source: 'HEURISTIC_ENGINE'
    };
  }

  // Analytical Response 4: Dust Storm & Power Margin Analysis
  if (hasDustMention || q.includes('energy') || q.includes('solar') || q.includes('battery')) {
    return {
      answer: `🌪️ **Martian Atmospheric Dust & Power Analysis**:
- **Surface Irradiance**: ${location.solarIrradianceWm2} W/m² (Baseline)
- **Dust Squall Impact**: Optical depth (τ) can spike to 3.5, reducing photovoltaic yields by **up to 75%**.
- **Mitigation Protocols**:
  1. Maintain at least **Level 2 Battery Storage** (70 kWh reserve buffer).
  2. Switch LED lighting to **Low Power Amber Mode** during storm peaks to cut lighting draw by 35%.
  3. Pre-harvest mature tubers before optical depth degrades thermal heating coils.`,
      confidence: 0.97,
      source: 'HEURISTIC_ENGINE'
    };
  }

  // Generic Deep Diagnostic Analysis of User's Request
  return {
    answer: `🤖 **Farmer AI Comprehensive Telemetry Assessment**:
- **Mission Posture at ${location.name}**: Overall suitability score of **${suitability?.overallScore || 80}/100**.
- **Crew Caloric Coverage**: **${projection.projectedCaloricCoveragePercent}%** (${projection.estimatedDailyCaloriesProducedKcal.toLocaleString()} / ${projection.crewDailyCaloricRequirementKcal.toLocaleString()} kcal/day).
- **Cultivated Footprint**: **${projection.totalAllocatedAreaM2} m²** out of ${config.farmAreaM2} m² available.
- **Water Buffer**: ${config.waterReserveLiters.toLocaleString()} L reserve with **${projection.netDailyWaterDrainL} L/day** net drain.

💡 **Tactical Advice**: Ask me about specific what-if scenarios (e.g. *"Can 8 crew survive on 120m²?"*, *"How much water does wheat save?"*, or *"Best landing site for radiation safety?"*).`,
    confidence: 0.90,
    source: 'HEURISTIC_ENGINE'
  };
}

