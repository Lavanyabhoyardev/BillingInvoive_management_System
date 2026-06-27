import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client (browser). Reads credentials from public env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * If these are not set, the app runs in pure-offline mode (IndexedDB only) —
 * exactly as before. Cloud sync + login only activate when configured.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  if (!_client) {
    _client = createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return _client;
}

/** The list of Dexie tables that are synced to the cloud. */
export const SYNCED_TABLES = [
  "company",
  "settings",
  "quotations",
  "templates",
  "invoices",
  "estimates",
] as const;

export type SyncedTable = (typeof SYNCED_TABLES)[number];
