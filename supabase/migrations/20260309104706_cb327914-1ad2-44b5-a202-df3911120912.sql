
-- Create hero_banners table
CREATE TABLE public.hero_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- Everyone can view active banners
CREATE POLICY "Banners are viewable by everyone" ON public.hero_banners
  FOR SELECT USING (true);

-- Admins can manage banners
CREATE POLICY "Admins can insert banners" ON public.hero_banners
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update banners" ON public.hero_banners
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete banners" ON public.hero_banners
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create storage bucket for banner images
INSERT INTO storage.buckets (id, name, public) VALUES ('hero-banners', 'hero-banners', true);

-- Storage policies for hero-banners bucket
CREATE POLICY "Anyone can view banner images" ON storage.objects
  FOR SELECT USING (bucket_id = 'hero-banners');

CREATE POLICY "Admins can upload banner images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'hero-banners' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete banner images" ON storage.objects
  FOR DELETE USING (bucket_id = 'hero-banners' AND public.has_role(auth.uid(), 'admin'::app_role));
