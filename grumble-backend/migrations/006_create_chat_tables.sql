-- Migration 006: Create chat tables for messaging feature

-- Chat Rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group')), -- direct or group
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX chat_rooms_created_by_idx ON chat_rooms(created_by);
CREATE INDEX chat_rooms_type_idx ON chat_rooms(type);

-- Chat Room Members
CREATE TABLE IF NOT EXISTS chat_room_members (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (room_id, user_id)
);

CREATE INDEX chat_room_members_room_id_idx ON chat_room_members(room_id);
CREATE INDEX chat_room_members_user_id_idx ON chat_room_members(user_id);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('text', 'food_suggestion', 'poll', 'spin_wheel')),
  content JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX chat_messages_room_id_idx ON chat_messages(room_id);
CREATE INDEX chat_messages_sender_id_idx ON chat_messages(sender_id);
CREATE INDEX chat_messages_created_at_idx ON chat_messages(created_at);
CREATE INDEX chat_messages_is_deleted_idx ON chat_messages(is_deleted);

-- Food Suggestions (for food_suggestion message type)
CREATE TABLE IF NOT EXISTS food_suggestions (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  food_place_id INTEGER NOT NULL REFERENCES food_places(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX food_suggestions_message_id_idx ON food_suggestions(message_id);
CREATE INDEX food_suggestions_food_place_id_idx ON food_suggestions(food_place_id);

-- Food Suggestion Reactions (user reactions to food suggestions)
CREATE TABLE IF NOT EXISTS food_suggestion_reactions (
  id SERIAL PRIMARY KEY,
  suggestion_id INTEGER NOT NULL REFERENCES food_suggestions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction VARCHAR(20) NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (suggestion_id, user_id)
);

CREATE INDEX food_suggestion_reactions_suggestion_id_idx ON food_suggestion_reactions(suggestion_id);
CREATE INDEX food_suggestion_reactions_user_id_idx ON food_suggestion_reactions(user_id);

-- Polls (for poll message type)
CREATE TABLE IF NOT EXISTS polls (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  question VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX polls_message_id_idx ON polls(message_id);

-- Poll Options
CREATE TABLE IF NOT EXISTS poll_options (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  text VARCHAR(255) NOT NULL,
  votes INTEGER DEFAULT 0
);

CREATE INDEX poll_options_poll_id_idx ON poll_options(poll_id);

-- Poll Votes (user votes on poll options)
CREATE TABLE IF NOT EXISTS poll_votes (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id INTEGER NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (poll_id, user_id)
);

CREATE INDEX poll_votes_poll_id_idx ON poll_votes(poll_id);
CREATE INDEX poll_votes_user_id_idx ON poll_votes(user_id);

-- Spin Wheel Sessions (for spin_wheel message type)
CREATE TABLE IF NOT EXISTS spin_wheel_sessions (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  options JSONB NOT NULL, -- Array of options
  result VARCHAR(255),
  spun_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spun_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX spin_wheel_sessions_message_id_idx ON spin_wheel_sessions(message_id);
CREATE INDEX spin_wheel_sessions_spun_by_idx ON spin_wheel_sessions(spun_by);
