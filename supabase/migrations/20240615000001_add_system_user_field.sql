-- Add is_system_user field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_system_user BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_is_system_user ON users(is_system_user);

-- Create Remi system user if it doesn't exist
INSERT INTO users (email, name, is_system_user)
SELECT 'remi@reminisce.app', 'Remi', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'remi@reminisce.app');

-- Get the ID of the Remi user
DO $$
DECLARE
    remi_user_id UUID;
BEGIN
    SELECT id INTO remi_user_id FROM users WHERE email = 'remi@reminisce.app';
    
    -- Create profile for Remi if it doesn't exist
    INSERT INTO profiles (user_id, full_name, avatar_url, bio)
    SELECT remi_user_id, 'Remi', '/remi-logo-purple.png', 'Hi there! I''m Remi, your guide to Reminisce. I''ll help you navigate the app and show you how to connect with old friends. Feel free to explore our shared memories or message me if you have any questions!'
    WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = remi_user_id);
END $$;

-- Enable realtime for users table
alter publication supabase_realtime add table users;
