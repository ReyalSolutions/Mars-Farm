import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export interface DatabaseStatus {
  isConfigured: boolean;
  isLive: boolean;
  provider: 'SUPABASE' | 'LOCAL_STORAGE';
  label: string;
  projectUrl?: string;
  lastChecked?: string;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url_here' || supabaseUrl.trim() === '') {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 10
  );
}

export function getDatabaseStatus(): DatabaseStatus {
  const configured = isSupabaseConfigured();
  return {
    isConfigured: configured,
    isLive: configured,
    provider: configured ? 'SUPABASE' : 'LOCAL_STORAGE',
    label: configured ? 'SUPABASE CLOUD DATABASE' : 'LOCAL STORAGE PERSISTENCE',
    projectUrl: configured ? supabaseUrl : undefined,
    lastChecked: new Date().toLocaleTimeString()
  };
}
