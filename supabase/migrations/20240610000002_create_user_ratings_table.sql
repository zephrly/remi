-- Create a table to store user ratings
CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  rated_user_id UUID NOT NULL REFERENCES auth.users(id),
  interest_level INTEGER NOT NULL CHECK (interest_level BETWEEN 1 AND 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, rated_user_id)
);

-- Enable row level security
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own ratings
DROP POLICY IF EXISTS "Users can read their own ratings" ON user_ratings;
CREATE POLICY "Users can read their own ratings"
  ON user_ratings FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own ratings
DROP POLICY IF EXISTS "Users can insert their own ratings" ON user_ratings;
CREATE POLICY "Users can insert their own ratings"
  ON user_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own ratings
DROP POLICY IF EXISTS "Users can update their own ratings" ON user_ratings;
CREATE POLICY "Users can update their own ratings"
  ON user_ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- Add to realtime publication if not already added
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'user_ratings'
  ) THEN
    alter publication supabase_realtime add table user_ratings;
  END IF;
END$;