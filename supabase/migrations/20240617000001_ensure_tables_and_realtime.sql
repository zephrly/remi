-- Create user_ratings table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_level INTEGER NOT NULL CHECK (interest_level BETWEEN 1 AND 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, rated_user_id)
);

-- Create invite_links table if it doesn't exist
CREATE TABLE IF NOT EXISTS invite_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'connected', 'declined', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, friend_id)
);

-- Safely add tables to supabase_realtime publication
DO $$
DECLARE
  table_exists BOOLEAN;
  is_in_publication BOOLEAN;
BEGIN
  -- Check if user_ratings is in the publication
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_ratings'
  ) INTO is_in_publication;
  
  IF NOT is_in_publication THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_ratings;
  END IF;
  
  -- Check if invite_links is in the publication
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'invite_links'
  ) INTO is_in_publication;
  
  IF NOT is_in_publication THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE invite_links;
  END IF;
  
  -- Check if connections is in the publication
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'connections'
  ) INTO is_in_publication;
  
  IF NOT is_in_publication THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE connections;
  END IF;
END
$$;
