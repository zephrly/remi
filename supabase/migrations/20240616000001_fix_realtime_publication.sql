-- This migration fixes the issue with tables already being members of the supabase_realtime publication

-- First, check if tables exist and create them if they don't
CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interest_level INTEGER NOT NULL CHECK (interest_level BETWEEN 1 AND 7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, rated_user_id)
);

CREATE TABLE IF NOT EXISTS invite_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, friend_id)
);

-- Instead of trying to add tables to the publication directly,
-- we'll check if they're already members first

DO $$
BEGIN
  -- Check if user_ratings is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_ratings'
  ) THEN
    -- Only add if it's not already a member
    ALTER PUBLICATION supabase_realtime ADD TABLE user_ratings;
  END IF;
  
  -- Check if invite_links is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'invite_links'
  ) THEN
    -- Only add if it's not already a member
    ALTER PUBLICATION supabase_realtime ADD TABLE invite_links;
  END IF;
  
  -- Check if connections is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'connections'
  ) THEN
    -- Only add if it's not already a member
    ALTER PUBLICATION supabase_realtime ADD TABLE connections;
  END IF;
END
$$;
