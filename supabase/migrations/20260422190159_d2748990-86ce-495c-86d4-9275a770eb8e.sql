-- Chess tournament registrations
CREATE TABLE public.chess_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('s1-s3', 's4-s7')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_chess_registrations_category ON public.chess_registrations(category);

ALTER TABLE public.chess_registrations ENABLE ROW LEVEL SECURITY;

-- Authenticated admins can view all registrations
CREATE POLICY "Authenticated users can read chess registrations"
ON public.chess_registrations FOR SELECT
TO authenticated
USING (true);

-- No public insert/delete; handled via edge functions with service role