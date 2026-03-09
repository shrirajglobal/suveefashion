
CREATE TABLE public.chat_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_state text,
  business_type text,
  question_topic text,
  question_summary text,
  key_insight text
);

ALTER TABLE public.chat_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view chat insights" ON public.chat_insights
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Edge functions can insert insights" ON public.chat_insights
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE TABLE public.chat_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  message_content text NOT NULL,
  rating text NOT NULL,
  user_state text
);

ALTER TABLE public.chat_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert feedback" ON public.chat_feedback
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view feedback" ON public.chat_feedback
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
