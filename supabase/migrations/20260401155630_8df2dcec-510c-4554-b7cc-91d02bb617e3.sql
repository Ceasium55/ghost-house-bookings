
-- Super admins table
CREATE TABLE public.super_admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- Haunted house admins
CREATE TABLE public.haunted_house_admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.haunted_house_admins ENABLE ROW LEVEL SECURITY;

-- Escape room admins
CREATE TABLE public.escape_room_admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.escape_room_admins ENABLE ROW LEVEL SECURITY;

-- Games admins
CREATE TABLE public.games_admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.games_admins ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user is a super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.super_admins WHERE email = lower(_email)
  )
$$;

-- RLS: only super admins can read/manage all admin tables
CREATE POLICY "Super admins can read super_admins" ON public.super_admins FOR SELECT TO authenticated USING (public.is_super_admin(auth.jwt()->>'email'));
CREATE POLICY "Super admins can insert super_admins" ON public.super_admins FOR INSERT TO authenticated WITH CHECK (public.is_super_admin(auth.jwt()->>'email'));
CREATE POLICY "Super admins can delete super_admins" ON public.super_admins FOR DELETE TO authenticated USING (public.is_super_admin(auth.jwt()->>'email'));

CREATE POLICY "Super admins can read haunted_house_admins" ON public.haunted_house_admins FOR SELECT TO authenticated USING (public.is_super_admin(auth.jwt()->>'email'));
CREATE POLICY "Super admins can insert haunted_house_admins" ON public.haunted_house_admins FOR INSERT TO authenticated WITH CHECK (public.is_super_admin(auth.jwt()->>'email'));
CREATE POLICY "Super admins can delete haunted_house_admins" ON public.haunted_house_admins FOR DELETE TO authenticated USING (public.is_super_admin(auth.jwt()->>'email'));

CREATE POLICY "Super admins can read escape_room_admins" ON public.escape_room_admins FOR SELECT TO authenticated USING (public.is_super_admin(auth.jwt()->>'email'));
CREATE POLICY "Super admins can insert escape_room_admins" ON public.escape_room_admins FOR INSERT TO authenticated WITH CHECK (public.is_super_admin(auth.jwt()->>'email'));
CREATE POLICY "Super admins can delete escape_room_admins" ON public.escape_room_admins FOR DELETE TO authenticated USING (public.is_super_admin(auth.jwt()->>'email'));

CREATE POLICY "Super admins can read games_admins" ON public.games_admins FOR SELECT TO authenticated USING (public.is_super_admin(auth.jwt()->>'email'));
CREATE POLICY "Super admins can insert games_admins" ON public.games_admins FOR INSERT TO authenticated WITH CHECK (public.is_super_admin(auth.jwt()->>'email'));
CREATE POLICY "Super admins can delete games_admins" ON public.games_admins FOR DELETE TO authenticated USING (public.is_super_admin(auth.jwt()->>'email'));

-- Insert the super admin
INSERT INTO public.super_admins (email) VALUES ('smskackov@outlook.com');
