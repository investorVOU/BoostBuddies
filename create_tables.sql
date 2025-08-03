-- Create tables in Supabase
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL UNIQUE,
  password VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  points INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  premium_expires_at TIMESTAMP,
  bio TEXT,
  website VARCHAR,
  profile_photo VARCHAR,
  otp_secret VARCHAR,
  otp_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL,
  updated_by VARCHAR REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  platform VARCHAR NOT NULL,
  post_url VARCHAR,
  status VARCHAR DEFAULT 'pending',
  approved_by VARCHAR REFERENCES users(id),
  approved_at TIMESTAMP,
  rejected_reason TEXT,
  auto_approved BOOLEAN DEFAULT false,
  likes_received INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  token VARCHAR NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default system settings
INSERT INTO system_settings (key, value, description, category) VALUES
('FLUTTERWAVE_PUBLIC_KEY', '', 'Flutterwave public key for payments', 'payment'),
('FLUTTERWAVE_SECRET_KEY', '', 'Flutterwave secret key for payments', 'payment'),
('PAYSTACK_PUBLIC_KEY', '', 'Paystack public key for payments', 'payment'),
('PAYSTACK_SECRET_KEY', '', 'Paystack secret key for payments', 'payment'),
('BTC_ADDRESS', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'Bitcoin wallet address', 'crypto'),
('ETH_ADDRESS', '0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2', 'Ethereum wallet address', 'crypto'),
('USDT_ADDRESS', '0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2', 'USDT wallet address', 'crypto'),
('MATIC_ADDRESS', '0x742d35Cc6634C0532925a3b8D6f9C0d9D5b1e3a2', 'Polygon wallet address', 'crypto')
ON CONFLICT (key) DO NOTHING;

-- Create admin user (password: admin123)
INSERT INTO users (email, password, first_name, last_name, is_premium, points) VALUES
('admin@boostbuddies.com', '$2b$10$mDDZ9jHZ8iZZtEcT4xGKgO2Y1Nk9qS4.sB7sZ2YsOe9sOe9sOe9sO2', 'Admin', 'User', true, 0)
ON CONFLICT (email) DO NOTHING;