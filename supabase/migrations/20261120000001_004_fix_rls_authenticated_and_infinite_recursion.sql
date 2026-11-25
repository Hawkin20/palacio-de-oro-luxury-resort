/*
  # Migration 004: Universal RLS Permissions, Infinite Recursion Prevention, and View Access

  ## Fixes:
  1. Fixes missing products/menu_items when signed in:
     - Explicitly grants SELECT on `menu_items`, `rooms`, and `cottages` to both `anon` and `authenticated` (public).
  2. Fixes PostgreSQL Error 42P17 / infinite recursion on `users`:
     - Creates `public.is_admin()` helper function with SECURITY DEFINER.
     - Refactors `users` table policies to use `is_admin()` so evaluating policies does not recursively trigger `users` SELECT policies.
  3. Fixes user sign-up insert failure:
     - Allows public user registration insert.
  4. Fixes view permission security on `full_order_tracking` and `full_bookings`:
     - Sets `security_invoker = false` so orders and bookings joins are readable by owner privileges.
*/

-- 1. Helper function with SECURITY DEFINER to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Explicit SELECT permissions on core inventory (menu_items, rooms, cottages)
-- Menu items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Public can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Authenticated can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Anon can view menu items" ON public.menu_items;

CREATE POLICY "Anyone can view menu items"
  ON public.menu_items FOR SELECT
  TO public
  USING (available = true OR public.is_admin());

DROP POLICY IF EXISTS "Only admins can manage menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Only admins can update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Only admins can delete menu items" ON public.menu_items;

CREATE POLICY "Admins can insert menu items"
  ON public.menu_items FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update menu items"
  ON public.menu_items FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete menu items"
  ON public.menu_items FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view rooms" ON public.rooms;
DROP POLICY IF EXISTS "Public can view rooms" ON public.rooms;
DROP POLICY IF EXISTS "Authenticated can view rooms" ON public.rooms;
DROP POLICY IF EXISTS "Anon can view rooms" ON public.rooms;

CREATE POLICY "Anyone can view rooms"
  ON public.rooms FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Only admins can manage rooms" ON public.rooms;
DROP POLICY IF EXISTS "Only admins can update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Only admins can delete rooms" ON public.rooms;

CREATE POLICY "Admins can insert rooms"
  ON public.rooms FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update rooms"
  ON public.rooms FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete rooms"
  ON public.rooms FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Cottages
ALTER TABLE public.cottages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view cottages" ON public.cottages;
DROP POLICY IF EXISTS "Public can view cottages" ON public.cottages;
DROP POLICY IF EXISTS "Authenticated can view cottages" ON public.cottages;
DROP POLICY IF EXISTS "Anon can view cottages" ON public.cottages;

CREATE POLICY "Anyone can view cottages"
  ON public.cottages FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Only admins can manage cottages" ON public.cottages;
DROP POLICY IF EXISTS "Only admins can update cottages" ON public.cottages;
DROP POLICY IF EXISTS "Only admins can delete cottages" ON public.cottages;

CREATE POLICY "Admins can insert cottages"
  ON public.cottages FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update cottages"
  ON public.cottages FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete cottages"
  ON public.cottages FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 3. Fix users table RLS policies to eliminate infinite recursion
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Anyone can create user on signup" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can read own profile and admins can read all"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Anyone can create user on signup"
  ON public.users FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 4. View security settings
DO $$
BEGIN
  BEGIN
    ALTER VIEW public.full_order_tracking SET (security_invoker = false);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  BEGIN
    ALTER VIEW public.full_bookings SET (security_invoker = false);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;
