// Quick script to create admin_logs table via Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function createAdminTable() {
  try {
    // Try to insert into admin_logs to see if table exists
    const { error } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: 'test',
        action: 'test',
        details: 'test table creation',
        timestamp: new Date().toISOString()
      });
    
    if (error) {
      console.log('Table may not exist, error:', error.message);
      console.log('Please create the admin_logs table manually in your Supabase dashboard with this SQL:');
      console.log(`
        CREATE TABLE IF NOT EXISTS admin_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          admin_id VARCHAR NOT NULL REFERENCES users(id),
          action VARCHAR NOT NULL,
          details TEXT,
          ip_address VARCHAR,
          user_agent TEXT,
          timestamp TIMESTAMP DEFAULT NOW()
        );
      `);
    } else {
      console.log('Admin logs table exists and working!');
      // Clean up test record
      await supabase.from('admin_logs').delete().eq('admin_id', 'test');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

createAdminTable();