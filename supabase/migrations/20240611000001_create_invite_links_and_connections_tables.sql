-- Create invite_links table to store generated invite links
CREATE TABLE IF NOT EXISTS invite_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Create connections table to store connections between users
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
ALTER TABLE invite_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Create policies for invite_links
CREATE POLICY "Users can create their own invite links"
  ON invite_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own invite links"
  ON invite_links FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for connections
CREATE POLICY "Users can view their own connections"
  ON connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY "Users can create connections"
  ON connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE invite_links;
ALTER PUBLICATION supabase_realtime ADD TABLE connections;