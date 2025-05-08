-- Drop the existing connections table if it exists with issues
DROP TABLE IF EXISTS connections;

-- Create the connections table with the correct structure
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'connected',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

-- Enable row level security
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Create policies for connections
DROP POLICY IF EXISTS "Users can view their own connections" ON connections;
CREATE POLICY "Users can view their own connections"
  ON connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

DROP POLICY IF EXISTS "Users can create connections" ON connections;
CREATE POLICY "Users can create connections"
  ON connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- Make sure connections table is added to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE connections;