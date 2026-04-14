/*
  # Create core tables for Palacio de Oro resort system
  
  ## Overview
  This migration creates the foundational database structure for a luxury resort and fine dining system. It includes tables for room management, restaurant menu items, bookings, orders, reviews, and users.
  
  ## Tables Created
  1. **rooms** - Resort room inventory with types (Standard, Deluxe, Suite, Luxury Villa)
  2. **cottages** - Cottage inventory (Small, Family, Barkada)
  3. **menu_items** - Restaurant menu with categories and pricing
  4. **bookings** - Guest room/cottage reservations with dates and status
  5. **orders** - Restaurant orders with items and payment tracking
  6. **order_items** - Line items for orders
  7. **reviews** - Ratings and comments for rooms and menu items
  8. **users** - Admin and guest profiles
  
  ## Security
  - Row Level Security enabled on all tables
  - Policies enforce authentication and data ownership
  - Public read access for room/menu browsing
  - Authenticated users can manage their own bookings and orders
  - Admin-only access for management operations
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'guest' CHECK (role IN ('guest', 'admin', 'support')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can create user on signup"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  room_type text NOT NULL CHECK (room_type IN ('standard', 'deluxe', 'suite', 'luxury_villa')),
  price_per_night numeric NOT NULL,
  capacity integer NOT NULL DEFAULT 2,
  status text DEFAULT 'available' CHECK (status IN ('available', 'booked', 'closed', 'maintenance')),
  image_url text,
  description text,
  amenities text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rooms"
  ON rooms FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admins can update rooms"
  ON rooms FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admins can delete rooms"
  ON rooms FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Create cottages table
CREATE TABLE IF NOT EXISTS cottages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cottage_type text NOT NULL CHECK (cottage_type IN ('small', 'family', 'barkada')),
  price_per_night numeric NOT NULL,
  capacity integer NOT NULL DEFAULT 4,
  status text DEFAULT 'available' CHECK (status IN ('available', 'booked', 'closed', 'maintenance')),
  image_url text,
  description text,
  amenities text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cottages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cottages"
  ON cottages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage cottages"
  ON cottages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admins can update cottages"
  ON cottages FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admins can delete cottages"
  ON cottages FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('appetizers', 'main_course', 'seafood', 'grilled', 'desserts', 'cocktails', 'wine', 'non_alcoholic')),
  description text,
  price numeric NOT NULL,
  image_url text,
  is_featured boolean DEFAULT false,
  is_bestseller boolean DEFAULT false,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view menu items"
  ON menu_items FOR SELECT
  TO public
  USING (available = true);

CREATE POLICY "Only admins can manage menu items"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admins can update menu items"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admins can delete menu items"
  ON menu_items FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  cottage_id uuid REFERENCES cottages(id) ON DELETE SET NULL,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  guest_count integer NOT NULL,
  total_price numeric NOT NULL,
  payment_method text CHECK (payment_method IN ('cash', 'gcash', 'card')),
  downpayment_amount numeric DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  reference_number text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guests can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (guest_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Guests can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (guest_id = auth.uid());

CREATE POLICY "Guests can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (guest_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (guest_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  payment_method text CHECK (payment_method IN ('cash', 'gcash', 'card')),
  order_type text DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'room_delivery')),
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  reference_number text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guests can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (guest_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Guests can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (guest_id = auth.uid());

CREATE POLICY "Only admins and owners can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (guest_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (guest_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guests can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.guest_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "Guests can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id
      AND (orders.guest_id = auth.uid())
    )
  );

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (guest_id = auth.uid());

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (guest_id = auth.uid())
  WITH CHECK (guest_id = auth.uid());

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON bookings(check_in_date);
CREATE INDEX IF NOT EXISTS idx_orders_guest_id ON orders(guest_id);
CREATE INDEX IF NOT EXISTS idx_reviews_room_id ON reviews(room_id);
CREATE INDEX IF NOT EXISTS idx_reviews_menu_item_id ON reviews(menu_item_id);
