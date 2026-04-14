-- Migration 005: create saves table

CREATE TABLE IF NOT EXISTS saves (
  id         SERIAL PRIMARY KEY,
  post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (post_id, user_id)   -- one save per user per post
);

CREATE INDEX IF NOT EXISTS saves_user_id_idx ON saves(user_id);
CREATE INDEX IF NOT EXISTS saves_post_id_idx ON saves(post_id);