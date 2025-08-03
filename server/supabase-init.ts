import { supabaseAdmin } from "./db";

// Initialize database tables using Supabase client
export async function initializeDatabase() {
  try {
    console.log("Initializing database tables...");

    // Create users table if it doesn't exist
    await supabaseAdmin.rpc('create_users_table_if_not_exists');

    // Create system settings with default values
    const defaultSettings = [
      { key: 'FLUTTERWAVE_PUBLIC_KEY', value: '', description: 'Flutterwave public key for payments', category: 'payment' },
      { key: 'FLUTTERWAVE_SECRET_KEY', value: '', description: 'Flutterwave secret key for payments', category: 'payment' },
      { key: 'FLUTTERWAVE_ENCRYPTION_KEY', value: '', description: 'Flutterwave encryption key', category: 'payment' },
      { key: 'PAYSTACK_PUBLIC_KEY', value: '', description: 'Paystack public key for payments', category: 'payment' },
      { key: 'PAYSTACK_SECRET_KEY', value: '', description: 'Paystack secret key for payments', category: 'payment' },
      { key: 'BTC_ADDRESS', value: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', description: 'Bitcoin wallet address', category: 'crypto' },
      { key: 'ETH_ADDRESS', value: '0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2', description: 'Ethereum wallet address', category: 'crypto' },
      { key: 'USDT_ADDRESS', value: '0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2', description: 'USDT wallet address', category: 'crypto' },
      { key: 'MATIC_ADDRESS', value: '0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2', description: 'Polygon wallet address', category: 'crypto' },
      { key: 'PREMIUM_MONTHLY_PRICE', value: '9.99', description: 'Monthly premium subscription price', category: 'general' },
      { key: 'PREMIUM_YEARLY_PRICE', value: '99.99', description: 'Yearly premium subscription price', category: 'general' },
      { key: 'POINTS_PER_LIKE', value: '10', description: 'Points awarded per like', category: 'general' },
      { key: 'POINTS_PER_SHARE', value: '20', description: 'Points awarded per share', category: 'general' },
    ];

    // Insert default settings
    for (const setting of defaultSettings) {
      await supabaseAdmin
        .from('system_settings')
        .upsert(setting, { onConflict: 'key' });
    }

    console.log("✅ Database initialization completed");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
  }
}

// Create admin user if not exists
export async function createAdminUser() {
  try {
    const adminEmail = 'admin@boostbuddies.com';
    const adminPassword = 'admin123'; // Change this in production!

    // Check if admin user exists
    const { data: existingAdmin } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', adminEmail)
      .single();

    if (!existingAdmin) {
      // Hash password
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Create admin user
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          email: adminEmail,
          password: hashedPassword,
          first_name: 'Admin',
          last_name: 'User',
          is_premium: true,
          points: 0,
        })
        .select()
        .single();

      if (error) throw error;
      console.log("✅ Admin user created:", adminEmail);
    } else {
      console.log("ℹ️ Admin user already exists");
    }
  } catch (error) {
    console.error("❌ Failed to create admin user:", error);
  }
}