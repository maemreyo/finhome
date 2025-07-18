// lib/supabase/client.ts
// Unified Supabase client with SSR support and singleton pattern

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton instance to prevent multiple GoTrueClient instances
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

// Function to get or create the singleton SSR-compatible Supabase client
export const createClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// Export the singleton instance for backward compatibility
export const supabase = createClient()

// Export types for use throughout the application
export type { Database } from './types'
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]