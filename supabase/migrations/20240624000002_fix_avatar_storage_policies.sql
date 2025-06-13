-- Drop all existing policies for storage.objects related to profile-images bucket
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users Can Upload" ON storage.objects;
DROP POLICY IF EXISTS "Users Can Update Own Files" ON storage.objects;
DROP POLICY IF EXISTS "Users Can Delete Own Files" ON storage.objects;

-- Ensure the profile-images bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
SELECT 'profile-images', 'profile-images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-images');

-- Update existing bucket to be public
UPDATE storage.buckets
SET public = true
WHERE id = 'profile-images';

-- Create simple, permissive policies for avatar storage
-- Allow public read access to all files in profile-images bucket
CREATE POLICY "Public avatar read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Allow authenticated users to upload files to profile-images bucket
CREATE POLICY "Authenticated avatar upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images');

-- Allow authenticated users to update files in profile-images bucket
CREATE POLICY "Authenticated avatar update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images');

-- Allow authenticated users to delete files in profile-images bucket
CREATE POLICY "Authenticated avatar delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images');

-- Enable realtime for storage objects (optional but helpful for debugging)
alter publication supabase_realtime add table storage.objects;
