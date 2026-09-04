/// <reference types="vite/client" />

interface ImportMetaEnv {
  // ─── Supabase ──────────────────────────────────────────────────────────────
  // These VITE_ prefixes are INTENTIONAL.
  // The Supabase anon key is designed to be public — it is NOT a secret.
  // Security is enforced by Supabase Row Level Security (RLS) policies, not
  // by hiding the key. See: https://supabase.com/docs/guides/api/api-keys
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;

  // ─── Server-side keys (NOT declared here — they must never reach the browser)
  // NASA_API_KEY, OPENAI_API_KEY, OPENROUTER_API_KEY → use /api/* serverless routes
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
