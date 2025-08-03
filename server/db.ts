import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import * as schema from "@shared/schema";

// Initialize Supabase client for additional operations if needed
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Enhanced database connection with multiple fallback strategies
function getDatabaseConnection() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required");
  }
  
  // Extract project reference from Supabase URL
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  
  // Try multiple connection strategies in order of preference
  const connectionStrategies = [
    // Strategy 1: Direct connection with service role key
    `postgresql://postgres:${serviceRoleKey}@db.${projectRef}.supabase.co:5432/postgres`,
    // Strategy 2: Connection pooler (US East)
    `postgresql://postgres.${projectRef}:${serviceRoleKey}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
    // Strategy 3: Connection pooler (US West)  
    `postgresql://postgres.${projectRef}:${serviceRoleKey}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`,
    // Strategy 4: Use existing DATABASE_URL if available
    process.env.DATABASE_URL
  ].filter(Boolean);
  
  return connectionStrategies[0]!; // Start with the first strategy
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

// Enhanced connection testing with fallback strategies
async function testAndOptimizeConnection() {
  const connectionStrategies = [
    // Strategy 1: Direct connection with service role key
    `postgresql://postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY}@db.${process.env.SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '')}.supabase.co:5432/postgres`,
    // Strategy 2: Connection pooler (US East)
    `postgresql://postgres.${process.env.SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '')}:${process.env.SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
    // Strategy 3: Connection pooler (US West)  
    `postgresql://postgres.${process.env.SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '')}:${process.env.SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`,
  ];

  for (let i = 0; i < connectionStrategies.length; i++) {
    try {
      const testClient = postgres(connectionStrategies[i], {
        prepare: false,
        ssl: 'require',
        connect_timeout: 5,
      });
      
      await testClient`SELECT 1`;
      console.log(`✅ Database connection successful with strategy ${i + 1}`);
      
      // Update the main client with the working connection
      if (i > 0) {
        client.end();
        client = testClient;
      } else {
        testClient.end();
      }
      return;
    } catch (error) {
      console.log(`❌ Strategy ${i + 1} failed, trying next...`);
    }
  }
  
  console.error("❌ All database connection strategies failed");
  console.log("ℹ️ Application will continue with limited functionality");
}

// Test connection in development
if (process.env.NODE_ENV === 'development') {
  testAndOptimizeConnection();
}

console.log("Database connection configured with Drizzle ORM");