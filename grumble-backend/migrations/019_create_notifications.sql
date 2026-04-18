-- Stores in-app notifications so toast events can be replayed on login.
CREATE TABLE IF NOT EXISTS user_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(64) NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_read_created
  ON user_notifications(user_id, is_read, created_at DESC);