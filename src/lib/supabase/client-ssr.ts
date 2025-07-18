// lib/supabase/client-ssr.ts
// SSR-compatible Supabase client for authentication

'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create SSR-compatible browser client that properly handles cookies
export const supabaseClient = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
)

export type { Database } from './types'