-- Add Fridge Feast Finder (Recipe Remix) to NaSy Hub apps
-- Run this in Supabase SQL Editor

INSERT INTO public.apps (name, description, app_url, tags, image_url, is_active, display_order)
VALUES (
  'Recipe Remix',
  'Turn leftover ingredients into delicious meals. AI-powered recipe generator that creates custom recipes from what you have in your fridge.',
  'https://fridge-feast-finder.vercel.app',
  ARRAY['AI', 'Food', 'Recipes', 'Gemini'],
  'https://fridge-feast-finder.vercel.app/favicon.svg',
  true,
  5
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  app_url = EXCLUDED.app_url,
  tags = EXCLUDED.tags,
  is_active = true;

-- Verify
SELECT * FROM public.apps WHERE name = 'Recipe Remix';
