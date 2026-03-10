INSERT INTO storage.buckets (id, name, public) VALUES ('blog-covers', 'blog-covers', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Blog covers are viewable by everyone" ON storage.objects FOR SELECT USING (bucket_id = 'blog-covers');
CREATE POLICY "Admins and service role can upload blog covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-covers');
CREATE POLICY "Admins can delete blog covers" ON storage.objects FOR DELETE USING (bucket_id = 'blog-covers' AND has_role(auth.uid(), 'admin'::app_role));