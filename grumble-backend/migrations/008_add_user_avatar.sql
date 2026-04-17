-- Migration 009: Add avatar_url to users for profile support

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

CREATE INDEX IF NOT EXISTS users_avatar_url_idx ON users(avatar_url);
