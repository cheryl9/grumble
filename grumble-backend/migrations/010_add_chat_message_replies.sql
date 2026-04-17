-- Migration 010: Add threaded replies support for chat messages

ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS reply_to_message_id INTEGER REFERENCES chat_messages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS chat_messages_reply_to_message_id_idx
  ON chat_messages(reply_to_message_id);
