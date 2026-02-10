
-- Create a public view that excludes the email column
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  user_id,
  display_name,
  avatar_url,
  bio,
  hero_subtitle,
  hero_tagline,
  github_url,
  linkedin_url,
  twitter_url,
  location,
  resume_url,
  skills,
  created_at,
  updated_at
FROM public.profiles;

-- Grant anon and authenticated access to the view
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Allow authenticated users to read profiles (needed for admin panel)
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
