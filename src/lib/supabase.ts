import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if Supabase is properly configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Create a mock client for when Supabase is not configured
const createMockClient = (): SupabaseClient => {
  const mockError = { message: 'Supabase not configured', details: '', hint: '', code: '' }
  const mockResponse = { data: null, error: mockError }
  
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: mockError }),
      signUp: async () => ({ data: { user: null, session: null }, error: mockError }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({ data: [], error: null, order: () => ({ data: [], error: null }) }),
      insert: () => mockResponse,
      update: () => ({ eq: () => mockResponse }),
      delete: () => ({ eq: () => mockResponse }),
    }),
  } as unknown as SupabaseClient
}

// Only create the real client if credentials are provided
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient()

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}
