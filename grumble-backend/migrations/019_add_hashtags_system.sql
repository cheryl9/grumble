-- Add hashtags column to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS hashtags JSONB DEFAULT '[]'::jsonb;

-- Add hashtag_preferences column to user_preferences table
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS hashtag_preferences JSONB DEFAULT '[]'::jsonb;

-- Create index on hashtags for better query performance
CREATE INDEX IF NOT EXISTS posts_hashtags_idx ON posts USING GIN (hashtags);

-- Create index on user hashtag preferences for faster matching
CREATE INDEX IF NOT EXISTS user_hashtag_prefs_idx ON user_preferences USING GIN (hashtag_preferences);