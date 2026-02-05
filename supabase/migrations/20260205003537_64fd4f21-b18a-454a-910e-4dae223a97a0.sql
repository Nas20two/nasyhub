-- Add hero content columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS hero_tagline TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

-- Create resume_entries table for experience and education
CREATE TABLE public.resume_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('experience', 'education')),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    period TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resume_entries ENABLE ROW LEVEL SECURITY;

-- Public can view resume entries
CREATE POLICY "Resume entries are viewable by everyone"
ON public.resume_entries
FOR SELECT
USING (true);

-- Admins can manage resume entries
CREATE POLICY "Admins can manage resume entries"
ON public.resume_entries
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_resume_entries_updated_at
BEFORE UPDATE ON public.resume_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();