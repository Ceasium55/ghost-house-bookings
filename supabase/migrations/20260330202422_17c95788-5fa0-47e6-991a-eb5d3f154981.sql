-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can delete bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can read bookings" ON bookings;

-- Allow only authenticated users (admins) to read all booking data
CREATE POLICY "Authenticated users can read bookings"
  ON bookings FOR SELECT TO authenticated
  USING (true);