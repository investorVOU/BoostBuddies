-- BoostBuddies Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Session storage table (required for Replit Auth)
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- User storage table (required for Replit Auth)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  password VARCHAR,
  points INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  premium_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  platform VARCHAR NOT NULL,
  url TEXT NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'pending',
  likes_received INTEGER DEFAULT 0,
  likes_needed INTEGER DEFAULT 10,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Communities table
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  icon VARCHAR,
  color VARCHAR,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Community members table
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  community_id UUID NOT NULL REFERENCES communities(id),
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  post_id UUID NOT NULL REFERENCES posts(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Live events table
CREATE TABLE IF NOT EXISTS live_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  host_id VARCHAR REFERENCES users(id),
  status VARCHAR DEFAULT 'upcoming',
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  participant_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Collaboration spotlights table
CREATE TABLE IF NOT EXISTS collab_spotlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  collaborators TEXT NOT NULL,
  image_url VARCHAR,
  views INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  plan VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'active',
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  gateway VARCHAR NOT NULL,
  crypto_type VARCHAR,
  transaction_id VARCHAR NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR DEFAULT 'USD',
  status VARCHAR DEFAULT 'pending',
  subscription_id UUID REFERENCES subscriptions(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id VARCHAR NOT NULL REFERENCES users(id),
  action VARCHAR NOT NULL,
  details TEXT,
  ip_address VARCHAR,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Crypto addresses table
CREATE TABLE IF NOT EXISTS crypto_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crypto_type VARCHAR NOT NULL,
  address VARCHAR NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert some sample communities (only if they don't exist)
INSERT INTO communities (name, description, icon, color) 
SELECT 'Twitter Boost', 'Get more engagement on your Twitter posts', 'Twitter', '#1DA1F2'
WHERE NOT EXISTS (SELECT 1 FROM communities WHERE name = 'Twitter Boost');

INSERT INTO communities (name, description, icon, color) 
SELECT 'Facebook Growth', 'Increase your Facebook post visibility', 'Facebook', '#4267B2'
WHERE NOT EXISTS (SELECT 1 FROM communities WHERE name = 'Facebook Growth');

INSERT INTO communities (name, description, icon, color) 
SELECT 'YouTube Community', 'Boost your YouTube videos', 'Youtube', '#FF0000'
WHERE NOT EXISTS (SELECT 1 FROM communities WHERE name = 'YouTube Community');

INSERT INTO communities (name, description, icon, color) 
SELECT 'TikTok Creators', 'Grow your TikTok presence', 'Music', '#000000'
WHERE NOT EXISTS (SELECT 1 FROM communities WHERE name = 'TikTok Creators');