-- Create the storage bucket for profile images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'profile-images', 'profile-images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-images');

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access to all avatars
CREATE POLICY "Public read access for avatars" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-images');
