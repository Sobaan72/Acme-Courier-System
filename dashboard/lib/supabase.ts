import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Server-only Supabase client using the service role key. Never import this in a client component. */
export function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env.local and fill them in.");
  }
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

/** True when the server has the settings it needs to reach the database. */
export const isConfigured = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export const COMPANY_ID = process.env.COMPANY_ID ?? "e9937002-053d-4f65-8274-b3c2d6eb8037";
export const COMPANY_NAME = process.env.COMPANY_NAME ?? "Acme Courier Co.";
export const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID ?? "";
