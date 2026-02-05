import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

// Lazy-initialized client instances
let supabaseClient: SupabaseClient<Database> | null = null;
let serverSupabaseClient: SupabaseClient<Database> | null = null;

// Get or create the client-side Supabase client
export function getSupabase(): SupabaseClient<Database> {
  if (supabaseClient) return supabaseClient;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
  }
  
  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

// For backwards compatibility - lazy getter
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    return (getSupabase() as unknown as Record<string, unknown>)[prop as string];
  },
});

// Server-side Supabase client (with service key)
export function createServerSupabaseClient(): SupabaseClient<Database> {
  if (serverSupabaseClient) return serverSupabaseClient;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
  }
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_KEY is not set');
  }
  
  serverSupabaseClient = createClient<Database>(supabaseUrl, serviceKey);
  return serverSupabaseClient;
}

// Helper to get Supabase client based on environment
export function getSupabaseClient(useServiceKey = false): SupabaseClient<Database> {
  if (useServiceKey && typeof window === 'undefined') {
    return createServerSupabaseClient();
  }
  return getSupabase();
}
