-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone." ON profiles;

-- Create new policies with proper permissions
CREATE POLICY "Users can insert their own profile."
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Profiles are viewable by everyone."
ON profiles FOR SELECT
USING (true);

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
