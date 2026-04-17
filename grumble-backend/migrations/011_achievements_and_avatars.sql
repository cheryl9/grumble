-- Tracks which achievements each user has unlocked
CREATE TABLE IF NOT EXISTS user_achievements (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_key VARCHAR(64) NOT NULL,
  unlocked_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, achievement_key)
);

-- Tracks which avatar the user currently has equipped
-- (null = default logo, otherwise an achievement_key)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS equipped_avatar VARCHAR(64) DEFAULT NULL;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);