// Supabase client configuration for frontend
import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uwizdypmlvfvegklnogq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3aXpkeXBtbHZmdmVna2xub2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5Mzk3MDUsImV4cCI6MjA2NjUxNTcwNX0.KQ3_XiXJERD7mA4iZOaon82hcR7g6PBigelW_rie7Ew'

if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Export for default import
export default supabase
