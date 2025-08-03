import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import * as schema from "@shared/schema";

// Create Supabase clients for different purposes

// Extract Supabase URL from DATABASE_URL if not provided directly
function getSupabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!databaseUrl || !serviceRoleKey) {
    throw new Error("DATABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  
  // Extract Supabase URL from database connection string
  // Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
  const match = databaseUrl.match(/db\.([^.]+)\.supabase\.co/);
  if (!match) {
    throw new Error("Invalid Supabase DATABASE_URL format");
  }
  
  const projectRef = match[1];
  const supabaseUrl = `https://${projectRef}.supabase.co`;
  
  return { supabaseUrl, serviceRoleKey };
}

const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();

// Initialize Supabase client for server-side operations with service role key
export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Initialize Supabase client for regular operations with service role key (since we don't have anon key)
export const supabase = createClient(
  supabaseUrl,
  serviceRoleKey
);

// Use the DATABASE_URL directly from environment
function getDatabaseConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  
  return databaseUrl;
}

let connectionString: string;
let client: ReturnType<typeof postgres>;

try {
  connectionString = getDatabaseConnection();
  console.log("Using optimized Supabase connection");
  
  // Create postgres connection with optimized settings for Supabase
  client = postgres(connectionString, {
    prepare: false, // Disable prepared statements for Supabase compatibility
    ssl: 'require', // Always use SSL for Supabase
    max: 10, // Connection pool size
    idle_timeout: 20,
    connect_timeout: 10,
  });
  
} catch (error) {
  console.error("Database connection error:", error);
  throw new Error("Failed to establish database connection");
}

export const db = drizzle(client, { schema });

// Test database connection
async function testConnection() {
  try {
    await client`SELECT 1`;
    console.log("✅ Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    console.log("ℹ️ Application will continue with limited functionality");
  }
}

// Test connection in development
if (process.env.NODE_ENV === 'development') {
  testConnection();
}

console.log("Database connection configured with Drizzle ORM");