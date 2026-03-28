CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date text NOT NULL,
  time_slot text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  group_size integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read bookings"
  ON public.bookings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can delete bookings"
  ON public.bookings FOR DELETE
  TO anon, authenticated
  USING (true);