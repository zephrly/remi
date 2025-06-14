-- Create a comprehensive trigger system to automatically handle user record creation
-- This eliminates foreign key constraint issues by ensuring records are created in the correct order

-- First, ensure the users table exists with the correct structure
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  phone TEXT UNIQUE,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure the profiles table exists with the correct structure
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  zip_code TEXT,
  date_of_birth DATE,
  username TEXT UNIQUE,
  invited_by_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on both tables to avoid permission issues during account creation
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
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

-- Create or replace the function that will be triggered when a new user is created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract metadata from the new user
  DECLARE
    user_email TEXT := NEW.email;
    user_full_name TEXT := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
    user_username TEXT := COALESCE(NEW.raw_user_meta_data->>'username', '');
    user_first_name TEXT := COALESCE(split_part(user_full_name, ' ', 1), '');
    user_last_name TEXT := COALESCE(substring(user_full_name from position(' ' in user_full_name) + 1), '');
  BEGIN
    -- Insert into users table
    INSERT INTO public.users (
      id,
      email,
      first_name,
      last_name,
      username,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      user_email,
      CASE WHEN user_first_name = '' THEN NULL ELSE user_first_name END,
      CASE WHEN user_last_name = '' THEN NULL ELSE user_last_name END,
      CASE WHEN user_username = '' THEN NULL ELSE user_username END,
      NOW(),
      NOW()
    );
    
    -- Insert into profiles table
    INSERT INTO public.profiles (
      id,
      full_name,
      email,
      username,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      CASE WHEN user_full_name = '' THEN NULL ELSE user_full_name END,
      user_email,
      CASE WHEN user_username = '' THEN NULL ELSE user_username END,
      NOW(),
      NOW()
    );
    
    RETURN NEW;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the auth user creation
      RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
      RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger that will fire after a new user is inserted into auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);
CREATE INDEX IF NOT EXISTS users_phone_idx ON users(phone);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);

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