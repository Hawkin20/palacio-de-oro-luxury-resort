export interface User {
  id: string;
  email: string;
  name: string;
  role: 'guest' | 'admin' | 'support';
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  room_type: 'standard' | 'deluxe' | 'suite' | 'luxury_villa';
  price_per_night: number;
  capacity: number;
  status: 'available' | 'booked' | 'closed' | 'maintenance';
  image_url: string;
  description: string;
  amenities: string[];
  created_at: string;
}

export interface Cottage {
  id: string;
  name: string;
  cottage_type: 'small' | 'family' | 'barkada';
  price_per_night: number;
  capacity: number;
  status: 'available' | 'booked' | 'closed' | 'maintenance';
  image_url: string;
  description: string;
  amenities: string[];
  created_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'appetizers' | 'main_course' | 'seafood' | 'grilled' | 'desserts' | 'cocktails' | 'wine' | 'non_alcoholic';
  description: string;
  price: number;
  image_url: string;
  is_featured: boolean;
  is_bestseller: boolean;
  available: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  guest_id: string;
  room_id?: string;
  cottage_id?: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  total_price: number;
  payment_method: 'cash' | 'gcash' | 'card';
  downpayment_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reference_number: string;
  created_at: string;
}

export interface Order {
  id: string;
  guest_id: string;
  total_amount: number;
  payment_method: 'cash' | 'gcash' | 'card';
  order_type: 'dine_in' | 'room_delivery';
  room_id?: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  reference_number: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface Review {
  id: string;
  guest_id: string;
  room_id?: string;
  menu_item_id?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
}
