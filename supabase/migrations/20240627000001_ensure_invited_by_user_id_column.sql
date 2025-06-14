-- Ensure the invited_by_user_id column exists in the profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invited_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enable realtime for profiles table if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
    END IF;
END $$;
