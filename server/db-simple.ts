import { createClient } from "@supabase/supabase-js";

// Supabase configuration with your credentials
const SUPABASE_URL = 'https://hgmtumjrramtrohhltqb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbXR1bWpycmFtdHJvaGhsdHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzk1NTgsImV4cCI6MjA2OTYxNTU1OH0.VA9uzkxCf-qiY83IoAMzhfFxLr35Kd9dCmlF-QvVOYM';

console.log('🔌 Connecting to Supabase:', SUPABASE_URL);

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Test connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
}