DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

ALTER PUBLICATION supabase_realtime ADD TABLE users;
