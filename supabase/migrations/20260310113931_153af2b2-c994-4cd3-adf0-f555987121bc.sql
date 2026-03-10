-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_hi text,
  title_bn text,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  content_hi text,
  content_bn text,
  excerpt text,
  excerpt_hi text,
  excerpt_bn text,
  cover_image_url text,
  meta_description text,
  keywords text[] DEFAULT '{}',
  category text DEFAULT 'business-tips',
  status text DEFAULT 'published',
  social_caption text,
  social_caption_hi text,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public SELECT
CREATE POLICY "Blog posts are viewable by everyone"
  ON public.blog_posts FOR SELECT
  TO public
  USING (true);

-- Admin INSERT
CREATE POLICY "Admins can insert blog posts"
  ON public.blog_posts FOR INSERT
  TO public
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin UPDATE
CREATE POLICY "Admins can update blog posts"
  ON public.blog_posts FOR UPDATE
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin DELETE
CREATE POLICY "Admins can delete blog posts"
  ON public.blog_posts FOR DELETE
  TO public
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow edge functions (service role) to insert via anon
CREATE POLICY "Edge functions can insert blog posts"
  ON public.blog_posts FOR INSERT
  TO anon
  WITH CHECK (true);