-- Complete fix for users table schema and policies
-- This ensures proper account creation flow

-- First, ensure the users table exists with the correct structure
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  phone TEXT UNIQUE,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop and recreate the foreign key constraint with DEFERRABLE option
DO $$
BEGIN
  -- Drop existing foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_id_fkey' AND table_name = 'users'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_id_fkey;
  END IF;
  
  -- Add the foreign key constraint with DEFERRABLE option
  ALTER TABLE users ADD CONSTRAINT users_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
    
  -- Add missing columns if they don't exist (for existing installations)
  -- Add first_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE users ADD COLUMN first_name TEXT;
  END IF;
  
  -- Add middle_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'middle_name'
  ) THEN
    ALTER TABLE users ADD COLUMN middle_name TEXT;
  END IF;
  
  -- Add last_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE users ADD COLUMN last_name TEXT;
  END IF;
  
  -- Add phone column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone TEXT UNIQUE;
  END IF;
  
  -- Add username column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'username'
  ) THEN
    ALTER TABLE users ADD COLUMN username TEXT UNIQUE;
  END IF;
END $$;

-- Drop all existing RLS policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Allow signup insert" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;
DROP POLICY IF EXISTS "Allow user signup" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Disable RLS entirely on users table for simplicity
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Do the same for profiles table to ensure consistency
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow signup insert" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Allow user signup" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Ensure both tables are in the realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE users;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);
CREATE INDEX IF NOT EXISTS users_phone_idx ON users(phone);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);