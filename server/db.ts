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

// Fallback to direct database connection for Drizzle
let db: any;
try {
  if (process.env.DATABASE_URL) {
    const sql = postgres(process.env.DATABASE_URL, {
      connect_timeout: 10,
      idle_timeout: 10
    });
    db = drizzle(sql);
  }
} catch (error) {
  console.warn("Direct database connection failed, using Supabase client only");
}

export { db };