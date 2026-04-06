-- Add status column to leads table
ALTER TABLE public.leads ADD COLUMN status text NOT NULL DEFAULT 'new';

-- Allow admins to update leads (for status tracking)
CREATE POLICY "Admins can update leads"
ON public.leads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));
