
-- Recreate view with SECURITY INVOKER (default, safe)
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
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

-- Re-grant access since we recreated the view
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;
