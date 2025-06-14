-- Drop dependent policies first before dropping the column
DROP POLICY IF EXISTS "Users can view their own connections" ON connections;
DROP POLICY IF EXISTS "Users can create connections" ON connections;

-- Fix the connections table schema to match the code expectations
ALTER TABLE connections DROP COLUMN IF EXISTS connected_user_id;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add missing fields to invite_links table
ALTER TABLE invite_links ADD COLUMN IF NOT EXISTS used BOOLEAN DEFAULT FALSE;
ALTER TABLE invite_links ADD COLUMN IF NOT EXISTS used_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE invite_links ADD COLUMN IF NOT EXISTS used_at TIMESTAMP WITH TIME ZONE;

-- Add invited_by_user_id column to profiles table to track who invited the user
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invited_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update the unique constraint to use the correct column names
ALTER TABLE connections DROP CONSTRAINT IF EXISTS connections_user_id_connected_user_id_key;
DO $$
BEGIN
    -- Only add the constraint if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'connections_user_id_friend_id_unique'
    ) THEN
        ALTER TABLE connections ADD CONSTRAINT connections_user_id_friend_id_unique UNIQUE(user_id, friend_id);
    END IF;
END $$;

-- Recreate RLS policies for connections table with correct column names
CREATE POLICY "Users can view their own connections"
  ON connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create connections"
  ON connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);

-- Add policy for invite_links to allow reading by code (for processing invites)
DROP POLICY IF EXISTS "Anyone can read invite links by code" ON invite_links;
CREATE POLICY "Anyone can read invite links by code"
  ON invite_links FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update invite links" ON invite_links;
CREATE POLICY "Users can update invite links"
  ON invite_links FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable realtime for the updated tables (only if not already added)
DO $$
BEGIN
    -- Add connections table to realtime if not already present
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'connections'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE connections;
    END IF;
    
    -- Add invite_links table to realtime if not already present
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'invite_links'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE invite_links;
    END IF;
END $$;