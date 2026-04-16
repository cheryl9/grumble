-- Migration 007: Add spin wheel spin history table

-- spin_wheel_sessions currently stores the canonical options for a spin wheel message.
-- This table stores every spin result (history) for a session.

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
