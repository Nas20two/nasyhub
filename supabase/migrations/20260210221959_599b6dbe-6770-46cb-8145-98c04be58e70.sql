
-- Drop the view approach - use a function instead
DROP VIEW IF EXISTS public.public_profiles;

-- Create a SECURITY DEFINER function to return public profile data (no email)
CREATE OR REPLACE FUNCTION public.get_public_profile()
RETURNS TABLE (
  id uuid,
  display_name text,
  avatar_url text,
  bio text,
  hero_subtitle text,
  hero_tagline text,
  github_url text,
  linkedin_url text,
  twitter_url text,
  location text,
  resume_url text,
  skills text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id, display_name, avatar_url, bio, hero_subtitle, hero_tagline,
    github_url, linkedin_url, twitter_url, location, resume_url, skills
  FROM public.profiles
  LIMIT 1;
$$;
