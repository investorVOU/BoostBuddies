import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Use Replit's built-in PostgreSQL database if available
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

if (!connectionString || connectionString.includes('undefined')) {
  console.error("Database connection not available. Please ensure PostgreSQL is set up in Replit.");
  process.exit(1);
}

const sql = postgres(connectionString, { 
  ssl: false,
  max: 1,
  idle_timeout: 20,
  connect_timeout: 60,
});

export const db = drizzle(sql, { schema });