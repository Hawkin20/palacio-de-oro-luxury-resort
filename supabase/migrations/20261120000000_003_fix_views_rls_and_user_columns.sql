/*
  # Migration 003: Fix missing views, add user profile columns, and complete RLS policies
  
  ## Changes
  1. Add missing user profile columns (phone, address, avatar_url) to public.users
  2. Add missing RLS policies:
     - Allow authenticated users to update their own profile
     - Allow admins to view all users for guest management
     - Allow admins to delete bookings and orders
  3. Create public.full_bookings view joining bookings with users, rooms, and cottages
  4. Create public.full_order_tracking view joining orders with order_items, menu_items, and users
  5. Set initial admin role for system administrator
*/

-- 1. Add missing columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url text;

-- 2. Add missing RLS policies
DO $$
BEGIN
  -- Users update own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.users FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Admins can view all users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Admins can view all users'
  ) THEN
    CREATE POLICY "Admins can view all users"
      ON public.users FOR SELECT
      TO authenticated
      USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
  END IF;

  -- Admins can delete bookings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Admins can delete bookings'
  ) THEN
    CREATE POLICY "Admins can delete bookings"
      ON public.bookings FOR DELETE
      TO authenticated
      USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
  END IF;

  -- Admins can delete orders
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Admins can delete orders'
  ) THEN
    CREATE POLICY "Admins can delete orders"
      ON public.orders FOR DELETE
      TO authenticated
      USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

-- 3. Create full_bookings view
CREATE OR REPLACE VIEW public.full_bookings AS
SELECT 
  b.id,
  b.guest_id,
  b.room_id,
  b.cottage_id,
  b.check_in_date,
  b.check_out_date,
  b.guest_count,
  b.total_price,
  b.payment_method,
  b.downpayment_amount,
  b.status,
  b.reference_number,
  b.created_at,
  b.updated_at,
  u.name AS username,
  u.email AS user_email,
  COALESCE(r.name, c.name, 'Resort Accommodation') AS accommodation_name,
  r.name AS room_name,
  c.name AS cottage_name
FROM public.bookings b
LEFT JOIN public.users u ON b.guest_id = u.id
LEFT JOIN public.rooms r ON b.room_id = r.id
LEFT JOIN public.cottages c ON b.cottage_id = c.id;

-- 4. Create full_order_tracking view
CREATE OR REPLACE VIEW public.full_order_tracking AS
SELECT 
  o.id,
  o.guest_id,
  o.total_amount,
  o.payment_method,
  o.order_type,
  o.room_id,
  o.status,
  o.reference_number,
  o.created_at,
  o.updated_at,
  u.name AS username,
  u.email AS user_email,
  oi.id AS order_item_id,
  oi.menu_item_id,
  oi.quantity,
  oi.unit_price,
  (oi.quantity * oi.unit_price) AS subtotal,
  m.name AS product_name,
  m.category
FROM public.orders o
LEFT JOIN public.users u ON o.guest_id = u.id
LEFT JOIN public.order_items oi ON o.id = oi.order_id
LEFT JOIN public.menu_items m ON oi.menu_item_id = m.id;

-- 5. Promote primary administrator
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'vincentecaldre25@gmail.com';
