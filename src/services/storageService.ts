import { LeaderboardEntry, MissionTelemetryLog } from '../types';
import { getSupabaseClient, isSupabaseConfigured, getDatabaseStatus, DatabaseStatus } from './supabaseClient';

const LEADERBOARD_STORAGE_KEY = 'mars_farm_leaderboard_v1';

export const INITIAL_DEMO_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lead-1',
    playerName: 'Commander Ares / Apollo Farm',
    score: 96,
    crewSize: 6,
    missionDays: 365,
    daysSurvived: 365,
    missionCompleted: true,
    totalFoodKg: 7850,
    waterRecycledL: 6420,
    totalEnergyUsedKwh: 14200,
    tier: 'Master of the Red Planet',
    locationName: 'Jezero Crater',
    foodCoveragePercent: 104,
    timestamp: '2026-09-01'
  },
  {
    id: 'lead-2',
    playerName: 'RedHarvest Station Alpha',
    score: 92,
    crewSize: 6,
    missionDays: 365,
    daysSurvived: 365,
    missionCompleted: true,
    totalFoodKg: 6940,
    waterRecycledL: 5890,
    totalEnergyUsedKwh: 13800,
    tier: 'Master of the Red Planet',
    locationName: 'Arcadia Planitia',
    foodCoveragePercent: 98,
    timestamp: '2026-08-28'
  },
  {
    id: 'lead-3',
    playerName: 'Terra2Mars Hydro-Outpost',
    score: 89,
    crewSize: 8,
    missionDays: 500,
    daysSurvived: 500,
    missionCompleted: true,
    totalFoodKg: 10200,
    waterRecycledL: 9400,
    totalEnergyUsedKwh: 19500,
    tier: 'Self-Sustaining Pioneer',
    locationName: 'Utopia Planitia',
    foodCoveragePercent: 92,
    timestamp: '2026-08-20'
  },
  {
    id: 'lead-4',
    playerName: 'BioShield Olympus',
    score: 87,
    crewSize: 4,
    missionDays: 180,
    daysSurvived: 180,
    missionCompleted: true,
    totalFoodKg: 2840,
    waterRecycledL: 2150,
    totalEnergyUsedKwh: 5900,
    tier: 'Self-Sustaining Pioneer',
    locationName: 'Olympus Mons Foothills',
    foodCoveragePercent: 88,
    timestamp: '2026-08-15'
  },
  {
    id: 'lead-5',
    playerName: 'Candor Chasma Pioneer',
    score: 83,
    crewSize: 6,
    missionDays: 365,
    daysSurvived: 365,
    missionCompleted: true,
    totalFoodKg: 5820,
    waterRecycledL: 4900,
    totalEnergyUsedKwh: 12400,
    tier: 'Self-Sustaining Pioneer',
    locationName: 'Valles Marineris',
    foodCoveragePercent: 82,
    timestamp: '2026-08-10'
  }
];

export function getLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_LEADERBOARD));
      return INITIAL_DEMO_LEADERBOARD;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_LEADERBOARD;
  }
}

export async function fetchLeaderboard(): Promise<{
  entries: LeaderboardEntry[];
  status: DatabaseStatus;
  source: 'SUPABASE' | 'LOCAL_STORAGE';
}> {
  const status = getDatabaseStatus();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('mars_leaderboard')
          .select('*')
          .order('score', { ascending: false })
          .limit(50);

        if (!error && data && data.length > 0) {
          const mappedEntries: LeaderboardEntry[] = data.map((item: any) => ({
            id: item.id || `supa-${item.created_at}`,
            playerName: item.player_name || 'Anonymous Commander',
            score: Number(item.score) || 0,
            crewSize: Number(item.crew_size) || 6,
            missionDays: Number(item.mission_days) || 365,
            daysSurvived: item.days_survived !== undefined && item.days_survived !== null ? Number(item.days_survived) : (Number(item.mission_days) || 365),
            missionCompleted: item.mission_completed !== undefined && item.mission_completed !== null ? Boolean(item.mission_completed) : (Number(item.score) >= 40),
            totalFoodKg: item.total_food_kg !== undefined && item.total_food_kg !== null ? Number(item.total_food_kg) : undefined,
            waterRecycledL: item.water_recycled_l !== undefined && item.water_recycled_l !== null ? Number(item.water_recycled_l) : undefined,
            totalEnergyUsedKwh: item.total_energy_kwh !== undefined && item.total_energy_kwh !== null ? Number(item.total_energy_kwh) : undefined,
            tier: item.tier || undefined,
            locationName: item.location_name || 'Jezero Crater',
            foodCoveragePercent: Number(item.food_coverage_percent) || 0,
            timestamp: item.created_at ? item.created_at.split('T')[0] : '2026-09-01',
            telemetryLogs: item.telemetry_logs && Array.isArray(item.telemetry_logs) ? item.telemetry_logs : undefined
          }));

          // Cache in local storage for offline resilience
          localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(mappedEntries));

          return {
            entries: mappedEntries,
            status: { ...status, isLive: true },
            source: 'SUPABASE'
          };
        } else if (error) {
          console.warn('Supabase query error (falling back to local cache):', error.message);
        }
      } catch (err) {
        console.warn('Network error reaching Supabase (using offline storage):', err);
      }
    }
  }

  // Fallback to local storage
  return {
    entries: getLocalLeaderboard(),
    status: { ...status, isLive: false },
    source: 'LOCAL_STORAGE'
  };
}

export async function fetchLeaderboardPaginated(
  page: number = 0,
  pageSize: number = 20
): Promise<{
  entries: LeaderboardEntry[];
  hasMore: boolean;
  totalCount: number;
  status: DatabaseStatus;
  source: 'SUPABASE' | 'LOCAL_STORAGE';
}> {
  const status = getDatabaseStatus();

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await supabase
          .from('mars_leaderboard')
          .select('*', { count: 'exact' })
          .order('score', { ascending: false })
          .range(from, to);

        if (!error && data) {
          const mappedEntries: LeaderboardEntry[] = data.map((item: any) => ({
            id: item.id || `supa-${item.created_at}`,
            playerName: item.player_name || 'Anonymous Commander',
            score: Number(item.score) || 0,
            crewSize: Number(item.crew_size) || 6,
            missionDays: Number(item.mission_days) || 365,
            daysSurvived: item.days_survived !== undefined && item.days_survived !== null ? Number(item.days_survived) : (Number(item.mission_days) || 365),
            missionCompleted: item.mission_completed !== undefined && item.mission_completed !== null ? Boolean(item.mission_completed) : (Number(item.score) >= 40),
            totalFoodKg: item.total_food_kg !== undefined && item.total_food_kg !== null ? Number(item.total_food_kg) : undefined,
            waterRecycledL: item.water_recycled_l !== undefined && item.water_recycled_l !== null ? Number(item.water_recycled_l) : undefined,
            totalEnergyUsedKwh: item.total_energy_kwh !== undefined && item.total_energy_kwh !== null ? Number(item.total_energy_kwh) : undefined,
            tier: item.tier || undefined,
            locationName: item.location_name || 'Jezero Crater',
            foodCoveragePercent: Number(item.food_coverage_percent) || 0,
            timestamp: item.created_at ? item.created_at.split('T')[0] : '2026-09-01',
            telemetryLogs: item.telemetry_logs && Array.isArray(item.telemetry_logs) ? item.telemetry_logs : undefined
          }));

          const total = count ?? mappedEntries.length;
          const hasMore = (from + mappedEntries.length) < total;

          return {
            entries: mappedEntries,
            hasMore,
            totalCount: total,
            status: { ...status, isLive: true },
            source: 'SUPABASE'
          };
        } else if (error) {
          console.warn('Supabase paginated query error:', error.message);
        }
      } catch (err) {
        console.warn('Network error reaching Supabase:', err);
      }
    }
  }

  // Fallback to local storage with pagination
  const allLocal = getLocalLeaderboard();
  const from = page * pageSize;
  const paged = allLocal.slice(from, from + pageSize);
  const hasMore = (from + paged.length) < allLocal.length;

  return {
    entries: paged,
    hasMore,
    totalCount: allLocal.length,
    status: { ...status, isLive: false },
    source: 'LOCAL_STORAGE'
  };
}

// Synchronous getter for immediate render
export function getLeaderboard(): LeaderboardEntry[] {
  return getLocalLeaderboard();
}

export async function fetchMissionTelemetryLogs(missionId: string, fallbackLogs?: MissionTelemetryLog[]): Promise<MissionTelemetryLog[]> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('mars_mission_logs')
          .select('*')
          .eq('mission_id', missionId)
          .order('sol', { ascending: true })
          .order('id', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((item: any) => ({
            id: String(item.id),
            sol: item.sol,
            time: item.time,
            type: item.log_type,
            message: item.message
          }));
        }
      } catch (err) {
        console.warn('Could not fetch from mars_mission_logs:', err);
      }
    }
  }

  if (fallbackLogs && fallbackLogs.length > 0) {
    return fallbackLogs;
  }

  return [
    { id: 'syn-1', sol: 1, time: '06:00 MTC', type: 'INFO', message: 'Mission initiated at landing site coordinates. Bio-dome ECLSS activated.' },
    { id: 'syn-2', sol: 15, time: '12:00 MTC', type: 'ECLSS', message: 'Closed-loop water recycling steady. Nutrient solution EC and pH in optimal range.' },
    { id: 'syn-3', sol: 45, time: '10:00 MTC', type: 'ALERT', message: 'ANOMALY DETECTED: Atmospheric dust squall detected; automated supplemental LED lighting engaged.' },
    { id: 'syn-4', sol: 60, time: '14:30 MTC', type: 'HARVEST', message: 'HARVEST ACHIEVED: Fresh crop biomass harvested into storage.' }
  ];
}

export async function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>): Promise<{
  updatedEntries: LeaderboardEntry[];
  savedToSupabase: boolean;
}> {
  const newId = `lead-${Date.now()}`;
  const timestamp = new Date().toISOString().split('T')[0];

  const newEntry: LeaderboardEntry = {
    ...entry,
    daysSurvived: entry.daysSurvived ?? entry.missionDays,
    missionCompleted: entry.missionCompleted ?? (entry.score >= 40),
    telemetryLogs: entry.telemetryLogs || [],
    id: newId,
    timestamp
  };

  // Always update local storage first for immediate UI feedback
  const current = getLocalLeaderboard();
  const updated = [newEntry, ...current].sort((a, b) => b.score - a.score).slice(0, 50);
  localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(updated));

  let savedToSupabase = false;

  // Persist to Supabase if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const payload: Record<string, any> = {
          id: newId,
          player_name: entry.playerName,
          score: entry.score,
          crew_size: entry.crewSize,
          mission_days: entry.missionDays,
          days_survived: newEntry.daysSurvived,
          mission_completed: newEntry.missionCompleted,
          total_food_kg: entry.totalFoodKg ?? 0,
          water_recycled_l: entry.waterRecycledL ?? 0,
          total_energy_kwh: entry.totalEnergyUsedKwh ?? 0,
          tier: entry.tier ?? 'Mission Log',
          location_name: entry.locationName,
          food_coverage_percent: entry.foodCoveragePercent,
          telemetry_logs: newEntry.telemetryLogs,
          created_at: new Date().toISOString()
        };

        const { error } = await supabase.from('mars_leaderboard').insert([payload]);

        if (!error) {
          savedToSupabase = true;
        } else {
          // If columns don't exist yet on user's table, retry with base columns
          console.warn('Retrying insert with base columns due to schema error:', error.message);
          const fallbackPayload = {
            id: newId,
            player_name: entry.playerName,
            score: entry.score,
            crew_size: entry.crewSize,
            mission_days: entry.missionDays,
            location_name: entry.locationName,
            food_coverage_percent: entry.foodCoveragePercent,
            created_at: new Date().toISOString()
          };
          const retry = await supabase.from('mars_leaderboard').insert([fallbackPayload]);
          if (!retry.error) {
            savedToSupabase = true;
          }
        }

        // Also insert into mars_mission_logs table connected by mission_id
        if (newEntry.telemetryLogs && newEntry.telemetryLogs.length > 0) {
          try {
            const logRows = newEntry.telemetryLogs.map(log => ({
              mission_id: newId,
              sol: log.sol,
              time: log.time,
              log_type: log.type,
              message: log.message,
              created_at: new Date().toISOString()
            }));
            await supabase.from('mars_mission_logs').insert(logRows);
          } catch (logErr) {
            console.warn('Note: mars_mission_logs table may not exist yet:', logErr);
          }
        }
      } catch (err) {
        console.warn('Supabase insert network exception:', err);
      }
    }
  }

  return {
    updatedEntries: updated,
    savedToSupabase
  };
}

// ---- AI Chat History Persistence (Supabase Cloud + Local Cache) ----
const AI_CHAT_STORAGE_KEY = 'mars_farm_ai_chat_history_v1';

export interface SavedChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  source?: 'LIVE_LLM' | 'HEURISTIC_ENGINE';
  timestamp: string;
}

export function getSavedChatHistory(): SavedChatMessage[] {
  try {
    const raw = localStorage.getItem(AI_CHAT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [
    {
      id: 'welcome-msg',
      role: 'ai',
      text: '🌱 **Farmer AI Online** — Sol 1, Mission Ready.\n\nI have full telemetry access to your Martian farm configuration. Ask me anything about crop allocation, water recycling, crew nutrition, or colony survival strategy.',
      source: 'HEURISTIC_ENGINE',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];
}

export async function fetchChatHistoryFromSupabase(): Promise<{
  messages: SavedChatMessage[];
  isCloudSynced: boolean;
}> {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('mars_ai_chat')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(60);

        if (!error && data && data.length > 0) {
          const mapped: SavedChatMessage[] = data.map((item: any) => ({
            id: item.id || `msg-${item.created_at}`,
            role: item.role === 'user' ? 'user' : 'ai',
            text: item.message || '',
            source: item.source || 'HEURISTIC_ENGINE',
            timestamp: item.created_at
              ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));

          localStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(mapped));
          return { messages: mapped, isCloudSynced: true };
        }
      } catch (err) {
        console.warn('Could not fetch chat history from Supabase, using local cache:', err);
      }
    }
  }

  return { messages: getSavedChatHistory(), isCloudSynced: false };
}

export async function saveChatMessageToSupabase(msg: SavedChatMessage): Promise<boolean> {
  // Always update local cache first
  const current = getSavedChatHistory();
  const updated = [...current.filter(m => m.id !== msg.id), msg].slice(-50);
  localStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(updated));

  // Sync to Supabase Cloud
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('mars_ai_chat').insert([
          {
            id: msg.id,
            role: msg.role,
            message: msg.text,
            source: msg.source || 'HEURISTIC_ENGINE',
            created_at: new Date().toISOString()
          }
        ]);

        if (!error) {
          return true;
        } else {
          console.warn('Supabase chat insert warning (table may need creating):', error.message);
        }
      } catch (err) {
        console.warn('Network error saving chat to Supabase:', err);
      }
    }
  }

  return false;
}

export function saveChatHistory(messages: SavedChatMessage[]): void {
  try {
    localStorage.setItem(AI_CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-50)));
  } catch {}
}

export async function clearChatHistoryFromSupabase(): Promise<SavedChatMessage[]> {
  try {
    localStorage.removeItem(AI_CHAT_STORAGE_KEY);
  } catch {}

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('mars_ai_chat').delete().neq('id', '');
      } catch {}
    }
  }

  return [
    {
      id: `welcome-${Date.now()}`,
      role: 'ai',
      text: '🌱 **Farmer AI Online** — Chat history cleared. Mission Ready.\n\nAsk me anything about your farm configuration or survival strategy.',
      source: 'HEURISTIC_ENGINE',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];
}


