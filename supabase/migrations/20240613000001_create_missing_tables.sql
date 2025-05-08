-- Create user_ratings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  rated_user_id UUID NOT NULL REFERENCES auth.users(id),
  interest_level INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invite_links table if it doesn't exist
CREATE TABLE IF NOT EXISTS invite_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

-- Add tables to realtime publication if they don't already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables 
                 WHERE pubname = 'supabase_realtime' 
                 AND schemaname = 'public' 
                 AND tablename = 'user_ratings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_ratings;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables 
                 WHERE pubname = 'supabase_realtime' 
                 AND schemaname = 'public' 
                 AND tablename = 'invite_links') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE invite_links;
  END IF;
END$$;
