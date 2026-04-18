-- from onboarding page

CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  cuisines JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id);