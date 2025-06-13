-- First, check if we need to modify the existing messages table structure
DO $$
BEGIN
  -- Check if session_id column exists in messages table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'session_id'
  ) THEN
    -- Add session_id column to existing messages table
    ALTER TABLE messages ADD COLUMN session_id UUID;
    
    -- Add foreign key constraint to message_sessions
    ALTER TABLE messages ADD CONSTRAINT messages_session_id_fkey 
      FOREIGN KEY (session_id) REFERENCES message_sessions(id) ON DELETE CASCADE;
  END IF;
END$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_message_sessions_user_id ON message_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_message_sessions_friend_id ON message_sessions(friend_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);

-- Ensure tables are added to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables 
                 WHERE pubname = 'supabase_realtime' 
                 AND schemaname = 'public' 
                 AND tablename = 'message_sessions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE message_sessions;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables 
                 WHERE pubname = 'supabase_realtime' 
                 AND schemaname = 'public' 
                 AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END$$;
