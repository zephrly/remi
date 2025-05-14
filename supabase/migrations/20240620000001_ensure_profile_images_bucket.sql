-- Create the profile-images bucket if it doesn't exist
BEGIN;

DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'profile-images'
  ) INTO bucket_exists;

  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('profile-images', 'profile-images', true);
    
    -- Set up a policy to allow authenticated users to upload their own avatars
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Avatar images are publicly accessible',
      'bucket_id = ''profile-images'' AND authenticated = true',
      'profile-images'
    );
  END IF;
END
$$;

COMMIT;