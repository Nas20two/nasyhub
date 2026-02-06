-- Create resume_requests table for gated resume access
CREATE TABLE public.resume_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_email TEXT NOT NULL,
    requester_name TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    download_token UUID NOT NULL DEFAULT gen_random_uuid(),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resume_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit resume requests (insert)
CREATE POLICY "Anyone can submit resume requests"
ON public.resume_requests
FOR INSERT
WITH CHECK (true);

-- Admins can view all resume requests
CREATE POLICY "Admins can view resume requests"
ON public.resume_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update resume requests (approve/reject)
CREATE POLICY "Admins can update resume requests"
ON public.resume_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete resume requests
CREATE POLICY "Admins can delete resume requests"
ON public.resume_requests
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create youtube_playlists table
CREATE TABLE public.youtube_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    embed_url TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.youtube_playlists ENABLE ROW LEVEL SECURITY;

-- Admins can manage YouTube playlists
CREATE POLICY "Admins can manage youtube playlists"
ON public.youtube_playlists
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Public can view active YouTube playlists
CREATE POLICY "YouTube playlists are viewable by everyone"
ON public.youtube_playlists
FOR SELECT
USING (is_active = true);

-- Add updated_at trigger for youtube_playlists
CREATE TRIGGER update_youtube_playlists_updated_at
BEFORE UPDATE ON public.youtube_playlists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();