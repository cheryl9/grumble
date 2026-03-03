-- Add Telegram integration fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_connected_at TIMESTAMP;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS users_telegram_chat_id_idx ON users (telegram_chat_id);

-- Add comments for documentation
COMMENT ON COLUMN users.telegram_chat_id IS 'Telegram chat ID for sending OTP and notifications (NULL if not connected)';
COMMENT ON COLUMN users.telegram_username IS 'Telegram username (optional, may be NULL)';
COMMENT ON COLUMN users.telegram_first_name IS 'Telegram first name for display';
COMMENT ON COLUMN users.telegram_connected_at IS 'Timestamp when user connected Telegram account';
