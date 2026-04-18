-- Consolidated Migration (006-012)
-- Combines: Chat tables, buildings, user preferences, postal codes, achievements, and support reports
-- Final schema state: All tables and columns in their final form without redundant ALTERs

BEGIN;

-- ============================================================================
-- CHAT MESSAGING INFRASTRUCTURE
-- ============================================================================

-- Chat Rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group')),
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_rooms_created_by_idx ON chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS chat_rooms_type_idx ON chat_rooms(type);

-- Chat Room Members
CREATE TABLE IF NOT EXISTS chat_room_members (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS chat_room_members_room_id_idx ON chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS chat_room_members_user_id_idx ON chat_room_members(user_id);

-- Chat Messages (with reply_to_message_id baked in directly)
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('text', 'food_suggestion', 'poll', 'spin_wheel')),
  content JSONB NOT NULL,
  reply_to_message_id INTEGER REFERENCES chat_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS chat_messages_room_id_idx ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS chat_messages_sender_id_idx ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS chat_messages_is_deleted_idx ON chat_messages(is_deleted);
CREATE INDEX IF NOT EXISTS chat_messages_reply_to_message_id_idx ON chat_messages(reply_to_message_id);

-- ============================================================================
-- FOOD SUGGESTIONS
-- ============================================================================

-- Food Suggestions (for food_suggestion message type)
CREATE TABLE IF NOT EXISTS food_suggestions (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  food_place_id INTEGER NOT NULL REFERENCES food_places(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS food_suggestions_message_id_idx ON food_suggestions(message_id);
CREATE INDEX IF NOT EXISTS food_suggestions_food_place_id_idx ON food_suggestions(food_place_id);

-- Food Suggestion Reactions
CREATE TABLE IF NOT EXISTS food_suggestion_reactions (
  id SERIAL PRIMARY KEY,
  suggestion_id INTEGER NOT NULL REFERENCES food_suggestions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction VARCHAR(20) NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (suggestion_id, user_id)
);

CREATE INDEX IF NOT EXISTS food_suggestion_reactions_suggestion_id_idx ON food_suggestion_reactions(suggestion_id);
CREATE INDEX IF NOT EXISTS food_suggestion_reactions_user_id_idx ON food_suggestion_reactions(user_id);

-- ============================================================================
-- POLLS
-- ============================================================================

-- Polls (one poll per message - enforced by unique index)
CREATE TABLE IF NOT EXISTS polls (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  question VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS polls_message_id_idx ON polls(message_id);
CREATE UNIQUE INDEX IF NOT EXISTS polls_message_id_uidx ON polls(message_id);

-- Poll Options
CREATE TABLE IF NOT EXISTS poll_options (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  text VARCHAR(255) NOT NULL,
  votes INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS poll_options_poll_id_idx ON poll_options(poll_id);

-- Poll Votes
CREATE TABLE IF NOT EXISTS poll_votes (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id INTEGER NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (poll_id, user_id)
);

CREATE INDEX IF NOT EXISTS poll_votes_poll_id_idx ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS poll_votes_user_id_idx ON poll_votes(user_id);

-- ============================================================================
-- SPIN WHEEL
-- ============================================================================

-- Spin Wheel Sessions (final state: spun_by/spun_at nullable, no default on spun_at)
CREATE TABLE IF NOT EXISTS spin_wheel_sessions (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  options JSONB NOT NULL,
  result VARCHAR(255),
  spun_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  spun_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS spin_wheel_sessions_message_id_idx ON spin_wheel_sessions(message_id);
CREATE UNIQUE INDEX IF NOT EXISTS spin_wheel_sessions_message_id_uidx ON spin_wheel_sessions(message_id);
CREATE INDEX IF NOT EXISTS spin_wheel_sessions_spun_by_idx ON spin_wheel_sessions(spun_by);

-- Spin Wheel Spins (spin history)
CREATE TABLE IF NOT EXISTS spin_wheel_spins (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES spin_wheel_sessions(id) ON DELETE CASCADE,
  result VARCHAR(255) NOT NULL,
  spun_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spun_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS spin_wheel_spins_session_id_idx ON spin_wheel_spins(session_id);
CREATE INDEX IF NOT EXISTS spin_wheel_spins_spun_at_idx ON spin_wheel_spins(spun_at);
CREATE INDEX IF NOT EXISTS spin_wheel_spins_spun_by_idx ON spin_wheel_spins(spun_by);

-- ============================================================================
-- BUILDINGS (Postcode to Coordinates Lookup)
-- ============================================================================

CREATE TABLE IF NOT EXISTS buildings (
  id SERIAL PRIMARY KEY,
  postal_code VARCHAR(6) NOT NULL,
  latitude DECIMAL(11, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  building_name VARCHAR(255),
  address TEXT,
  road_name VARCHAR(255),
  blk_no VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_buildings_postal_code ON buildings(postal_code);
CREATE INDEX IF NOT EXISTS idx_buildings_coords ON buildings(latitude, longitude);

COMMENT ON TABLE buildings IS
  'Singapore buildings with postal codes and coordinates - imported from buildings.json (1.8M+ records). Used for postal code to coordinate conversion.';

COMMENT ON COLUMN buildings.postal_code IS
  '6-digit Singapore postal code (000001-999999). Indexed for fast lookup.';

COMMENT ON COLUMN buildings.latitude IS
  'WGS84 latitude coordinate (SRID 4326). Range: -90 to 90 degrees.';

COMMENT ON COLUMN buildings.longitude IS
  'WGS84 longitude coordinate (SRID 4326). Range: -180 to 180 degrees.';

-- ============================================================================
-- USER ENHANCEMENTS
-- ============================================================================

-- Add avatar support to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

CREATE INDEX IF NOT EXISTS users_avatar_url_idx ON users(avatar_url);

-- Add postal code support to posts
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(6);

CREATE INDEX IF NOT EXISTS idx_posts_postal_code ON posts(postal_code);

-- ============================================================================
-- USER PREFERENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  cuisines JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE user_preferences
  ADD CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id);

-- ============================================================================
-- ACHIEVEMENTS AND AVATARS
-- ============================================================================

-- Tracks which achievements each user has unlocked
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_key VARCHAR(64) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, achievement_key)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Tracks which avatar the user currently has equipped (null = default logo)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS equipped_avatar VARCHAR(64) DEFAULT NULL;

-- ============================================================================
-- SUPPORT REPORTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  contact_email VARCHAR(255),
  status VARCHAR(32) DEFAULT 'open',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_reports_user_id ON support_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_support_reports_status ON support_reports(status);
CREATE INDEX IF NOT EXISTS idx_support_reports_created_at ON support_reports(created_at DESC);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- FAQ Seed Data
INSERT INTO faqs (question, answer, category, display_order, is_active) VALUES
  ('How do I change my username?', 'Go to Profile → Edit Profile → Account Info. Update your username and tap Save Changes.', 'account', 1, true),
  ('How do I reset my password?', 'On the login screen, tap Forgot Password. Enter your phone number and you will receive an OTP via Telegram to reset your password.', 'account', 2, true),
  ('How do I connect my Telegram account?', 'Go to Profile → scroll down to Telegram Integration → tap Connect Telegram. Enter your Telegram Chat ID from @grumble1122_bot.', 'account', 3, true),
  ('How do I create a post?', 'Tap the + button on the Explore page. Add a photo, select a food place, give it a rating and description, then publish.', 'posts', 4, true),
  ('Can I delete a post I made?', 'Yes. Open your post, tap the three-dot menu, and select Delete. This cannot be undone.', 'posts', 5, true),
  ('What is a streak?', 'A streak tracks how many consecutive days you have posted. Post every day to keep your streak alive — missing a day resets it to 1.', 'streaks', 6, true),
  ('How do I add friends?', 'Tap Add Friends on your Profile page. Search by username and send a friend request.', 'friends', 7, true),
  ('Why is my streak showing 0?', 'Streaks only start counting once you make your first post. If you missed a day, your streak resets. Keep posting daily to build it back up!', 'streaks', 8, true)
ON CONFLICT DO NOTHING;

COMMIT;
