-- Fix messaging schema to work with string IDs for testing

-- Drop existing tables to recreate with proper types
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS message_sessions CASCADE;

-- Create message_sessions table with TEXT IDs for testing
CREATE TABLE message_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  friend_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table with TEXT IDs for testing
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES message_sessions(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_message_sessions_user_id ON message_sessions(user_id);
CREATE INDEX idx_message_sessions_friend_id ON message_sessions(friend_id);
CREATE INDEX idx_message_sessions_created_at ON message_sessions(created_at);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);

-- Add unique constraint to prevent duplicate sessions
CREATE UNIQUE INDEX idx_message_sessions_unique 
ON message_sessions(LEAST(user_id, friend_id), GREATEST(user_id, friend_id));

-- Enable realtime for both tables
alter publication supabase_realtime add table message_sessions;
alter publication supabase_realtime add table messages;
