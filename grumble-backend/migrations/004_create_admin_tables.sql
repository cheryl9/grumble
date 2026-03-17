-- Migration 004: Create admin panel tables

-- 1. Admins table (separate from users for security)
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin', -- 'admin', 'superadmin'
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Admin activity logs (for audit trail)
CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'user_deleted', 'post_removed', 'faq_updated', etc.
  target_type VARCHAR(50), -- 'user', 'post', 'comment', 'report', 'faq'
  target_id INTEGER,
  details JSONB, -- Store action details as JSON
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Posts table (currently using mock data in frontend)
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  food_place_id INTEGER REFERENCES food_places(id) ON DELETE SET NULL,
  location_name VARCHAR(255) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  image_url TEXT,
  description TEXT,
  visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'friends', 'private'
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Likes table
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 6. Friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'blocked'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- 7. Reports table (for user complaints)
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reported_post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL,
  reported_comment_id INTEGER REFERENCES comments(id) ON DELETE SET NULL,
  reported_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewing', 'resolved', 'dismissed'
  reviewed_by INTEGER REFERENCES admins(id),
  reviewed_at TIMESTAMP,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(50), -- 'account', 'posts', 'friends', 'general'
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INTEGER REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. User streaks table (for gamification tracking)
CREATE TABLE IF NOT EXISTS user_streaks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_post_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Modify existing users table to support account status
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active'; 
-- 'active', 'frozen', 'suspended', 'deleted'

ALTER TABLE users ADD COLUMN IF NOT EXISTS frozen_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS frozen_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_visibility_idx ON posts(visibility);
CREATE INDEX IF NOT EXISTS posts_is_deleted_idx ON posts(is_deleted);

CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments(post_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_is_deleted_idx ON comments(is_deleted);

CREATE INDEX IF NOT EXISTS likes_post_id_idx ON likes(post_id);
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON likes(user_id);

CREATE INDEX IF NOT EXISTS friendships_user_id_idx ON friendships(user_id);
CREATE INDEX IF NOT EXISTS friendships_friend_id_idx ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS friendships_status_idx ON friendships(status);

CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS reports_reporter_id_idx ON reports(reporter_id);

CREATE INDEX IF NOT EXISTS admin_logs_admin_id_idx ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS admin_logs_created_at_idx ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS admin_logs_action_idx ON admin_logs(action);

CREATE INDEX IF NOT EXISTS faqs_category_idx ON faqs(category);
CREATE INDEX IF NOT EXISTS faqs_is_active_idx ON faqs(is_active);
CREATE INDEX IF NOT EXISTS faqs_display_order_idx ON faqs(display_order);

CREATE INDEX IF NOT EXISTS user_streaks_user_id_idx ON user_streaks(user_id);

-- Add comments for documentation
COMMENT ON TABLE admins IS 'Admin users with separate authentication from regular users';
COMMENT ON TABLE admin_logs IS 'Audit trail of all admin actions for security and compliance';
COMMENT ON TABLE posts IS 'User food posts with location, rating, and visibility settings';
COMMENT ON TABLE reports IS 'User-submitted reports for inappropriate content';
COMMENT ON TABLE user_streaks IS 'Gamification: tracks user posting streaks and engagement';
