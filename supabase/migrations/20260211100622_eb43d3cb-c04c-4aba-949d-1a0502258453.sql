
CREATE TABLE public.soundcloud_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  soundcloud_url TEXT NOT NULL,
  embed_url TEXT,
  use_embed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.soundcloud_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SoundCloud playlists are viewable by everyone"
ON public.soundcloud_playlists FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage soundcloud playlists"
ON public.soundcloud_playlists FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_soundcloud_playlists_updated_at
BEFORE UPDATE ON public.soundcloud_playlists
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
