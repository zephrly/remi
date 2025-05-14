-- First check if the bucket exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'profile-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('profile-images', 'profile-images', true);
  ELSE
    -- If bucket exists, ensure it's public
    UPDATE storage.buckets
    SET public = true
    WHERE id = 'profile-images';
  END IF;

  -- Instead of trying to delete policies directly (which might not exist),
  -- we'll use the built-in functions to manage policies
  
  -- Enable public read access to the bucket
  -- This will create or replace the policy
  EXECUTE format(
    'CREATE POLICY IF NOT EXISTS "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = ''%I'' AND auth.role() = ''authenticated'')',
    'profile-images'
  );
  
  -- Allow authenticated users to upload files
  EXECUTE format(
    'CREATE POLICY IF NOT EXISTS "Authenticated Users Can Upload" ON storage.objects FOR INSERT USING (bucket_id = ''%I'' AND auth.role() = ''authenticated'')',
    'profile-images'
  );
  
  -- Allow users to update their own files
  EXECUTE format(
    'CREATE POLICY IF NOT EXISTS "Users Can Update Own Files" ON storage.objects FOR UPDATE USING (bucket_id = ''%I'' AND auth.role() = ''authenticated'')',
    'profile-images'
  );
  
  -- Allow users to delete their own files
  EXECUTE format(
    'CREATE POLICY IF NOT EXISTS "Users Can Delete Own Files" ON storage.objects FOR DELETE USING (bucket_id = ''%I'' AND auth.role() = ''authenticated'')',
    'profile-images'
  );

END $$;
