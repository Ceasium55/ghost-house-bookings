CREATE OR REPLACE FUNCTION public.can_read_activity(_email text, _activity text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin(_email)
    OR (_activity = 'haunted-house' AND EXISTS (SELECT 1 FROM public.haunted_house_admins WHERE lower(email) = lower(_email)))
    OR (_activity = 'escape-room' AND EXISTS (SELECT 1 FROM public.escape_room_admins WHERE lower(email) = lower(_email)))
$$;

DROP POLICY IF EXISTS "Authenticated users can read bookings" ON public.bookings;
CREATE POLICY "Admins can read bookings for their activity" ON public.bookings
  FOR SELECT TO authenticated
  USING (public.can_read_activity(auth.jwt() ->> 'email', activity));

DROP POLICY IF EXISTS "Authenticated users can read chess registrations" ON public.chess_registrations;
CREATE POLICY "Super admins can read chess registrations" ON public.chess_registrations
  FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.jwt() ->> 'email'));