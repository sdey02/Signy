// DO NOT import cookies from next/headers in this file 
// as it will cause issues in the Pages Router

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Legacy client that will work in both Client and Server Components
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Singleton pattern for browser client to prevent multiple instances
let browserClient: ReturnType<typeof createSupabaseClient> | null = null;

// For use in client components only - ensures a single instance is used
export function createBrowserClient() {
  if (browserClient) return browserClient;
  
  browserClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'supabase-auth', // Explicit storage key to avoid conflicts
    }
  });
  
  return browserClient;
} 