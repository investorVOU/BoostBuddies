import { createClient } from '@supabase/supabase-js';

// For direct database access with Drizzle (fallback)
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Supabase client for API access (recommended)
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn("SUPABASE_URL and SUPABASE_ANON_KEY not set, falling back to direct database connection");
}

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// For BoostBuddies, we're using Supabase client only
// Direct database connection disabled to avoid network issues in Replit
export const db = null;