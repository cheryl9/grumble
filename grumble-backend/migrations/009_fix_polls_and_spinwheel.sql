-- Migration 008: Fix polls/spin wheel schema correctness

-- Ensure one poll per poll message
CREATE UNIQUE INDEX IF NOT EXISTS polls_message_id_uidx ON polls(message_id);

-- Ensure one spin wheel session per spin wheel message
CREATE UNIQUE INDEX IF NOT EXISTS spin_wheel_sessions_message_id_uidx ON spin_wheel_sessions(message_id);

-- spin_wheel_sessions should represent a session's canonical options; spins are stored in spin_wheel_spins.
-- Allow spun_by/spun_at to be null until the first spin is recorded.
ALTER TABLE spin_wheel_sessions
  ALTER COLUMN spun_by DROP NOT NULL;

ALTER TABLE spin_wheel_sessions
  ALTER COLUMN spun_at DROP DEFAULT;

-- Backfill: sessions with no result should not look like they were spun
UPDATE spin_wheel_sessions
SET spun_by = NULL,
    spun_at = NULL
WHERE result IS NULL;
