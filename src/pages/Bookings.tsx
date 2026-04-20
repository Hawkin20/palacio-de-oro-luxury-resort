import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Booking, Order } from '../lib/types';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { Bell, Calendar, Clock, User, DollarSign, Home, UtensilsCrossed, Package } from 'lucide-react';

interface BookingsProps {
  userId?: string;
  isLoggedIn: boolean;
}

export default function Bookings({ userId, isLoggedIn }: BookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchBookingsAndOrders();
    }
  }, [isLoggedIn, userId]);

  const fetchBookingsAndOrders = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      
      // Fetch both bookings and orders in parallel
      const [bookingsRes, ordersRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('*')
          .eq('guest_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('full_order_tracking')
          .select('*')
          .eq('guest_id', userId)
          .order('created_at', { ascending: false })
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (ordersRes.error) throw ordersRes.error;

      setBookings(bookingsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get orders for a specific booking reference
  const getBookingOrders = (bookingRef: string) => {
    // Match orders that were created around the same time or by same user
    // For now, we match by guest_id which is already filtered
    return orders;
  };

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen pt-24 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80")',
            filter: 'brightness(0.2)' 
          }}
        />
        <GlassCard className="relative z-10 p-8 text-center max-w-md border border-palacio-gold/30">
          <h2 className="font-playfair text-2xl text-palacio-gold mb-4">
            Login Required
          </h2>
          <p className="text-gray-300">
            Please log in to view your luxury bookings.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-20 overflow-hidden">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center fixed"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80")',
          filter: 'brightness(0.15) saturate(1.2)' 
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-8 text-palacio-gold drop-shadow-lg">My Reservations</h1>

        {loading ? (
          <LoadingSpinner />
        ) : bookings.length === 0 && orders.length === 0 ? (
          <GlassCard className="p-12 text-center border border-white/10 backdrop-blur-md">
            <p className="text-gray-300 mb-6 font-cinzel">No bookings yet</p>
            <p className="text-sm text-gray-400 italic">
              Your summer story at Palacio de Oro starts here.
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-6">
            {/* Bookings Section */}
            {bookings.map((booking) => {
              const bookingOrders = orders.filter(o => 
                o.created_at && booking.created_at && 
                new Date(o.created_at).toDateString() === new Date(booking.created_at).toDateString()
              );

              return (
                <GlassCard key={booking.id} className="p-6 hover:border-palacio-gold/40 transition-all border border-white/10">
                  {/* Notification Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-palacio-gold/20 flex items-center justify-center">
                        <Home size={20} className="text-palacio-gold" />
                      </div>
                      <div>
                        <h3 className="font-playfair text-lg text-palacio-gold">
                          Booking Confirmed
                        </h3>
                        <p className="text-gray-500 text-xs">
                          {booking.created_at ? new Date(booking.created_at).toLocaleString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={booking.status} size="md" />
                  </div>

                  {/* Booking Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 bg-black/20 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-gray-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Reference</p>
                        <p className="font-cinzel text-palacio-gold text-sm">
                          {booking.reference_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Check-in</p>
                        <p className="text-white text-sm font-poppins">
                          {new Date(booking.check_in_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Check-out</p>
                        <p className="text-white text-sm font-poppins">
                          {new Date(booking.check_out_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-gray-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Total</p>
                        <p className="font-cinzel text-palacio-gold text-sm">
                          ${booking.total_price}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Guest Info */}
                  <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {booking.guest_count} Guest/s
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={12} />
                      {booking.payment_method}
                    </span>
                    {booking.downpayment_amount > 0 && (
                      <span className="text-palacio-gold">
                        Downpayment: ${booking.downpayment_amount}
                      </span>
                    )}
                  </div>

                  {/* Orders Section */}
                  {bookingOrders.length > 0 && (
                    <div className="mb-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <UtensilsCrossed size={14} className="text-palacio-gold" />
                        <h4 className="font-cinzel text-sm text-palacio-gold">
                          Your Orders
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {bookingOrders.map((order) => (
                          <div 
                            key={order.order_id} 
                            className="flex items-center justify-between bg-black/20 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-palacio-gold/10 flex items-center justify-center">
                                <UtensilsCrossed size={14} className="text-palacio-gold" />
                              </div>
                              <div>
                                <p className="text-white text-sm">{order.product_name}</p>
                                <p className="text-gray-500 text-xs">
                                  {order.category} × {order.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-palacio-gold font-cinzel text-sm">
                                ${order.total_amount}
                              </span>
                              <StatusBadge status={order.status} size="sm" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                    <p className="text-gray-600 text-xs font-mono">
                      ID: {booking.id.slice(0, 8)}...
                    </p>
                    {booking.status === 'pending' && (
                      <span className="text-xs text-yellow-400 animate-pulse">
                        Awaiting confirmation...
                      </span>
                    )}
                  </div>
                </GlassCard>
              );
            })}

            {/* Standalone Orders (without booking match) */}
            {orders.filter(o => !bookings.some(b => 
              o.created_at && b.created_at && 
              new Date(o.created_at).toDateString() === new Date(b.created_at).toDateString()
            )).length > 0 && (
              <div className="pt-6">
                <h2 className="section-title mb-6 text-palacio-gold drop-shadow-lg text-xl">
                  Additional Orders
                </h2>
                {orders.filter(o => !bookings.some(b => 
                  o.created_at && b.created_at && 
                  new Date(o.created_at).toDateString() === new Date(b.created_at).toDateString()
                )).map((order) => (
                  <GlassCard key={order.order_id} className="p-5 mb-4 hover:border-palacio-gold/40 transition-all border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-palacio-gold/20 flex items-center justify-center">
                          <UtensilsCrossed size={20} className="text-palacio-gold" />
                        </div>
                        <div>
                          <h3 className="font-playfair text-lg text-palacio-gold">
                            {order.order_type === 'dine_in' ? 'Dine-in Order' : 'Room Delivery'}
                          </h3>
                          <p className="text-gray-500 text-xs">
                            {order.created_at ? new Date(order.created_at).toLocaleString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={order.status} size="md" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 bg-black/20 rounded-lg p-3">
                      <div>
                        <p className="text-gray-500 text-xs">Product</p>
                        <p className="text-white text-sm">{order.product_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Category</p>
                        <p className="text-white text-sm">{order.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Total</p>
                        <p className="font-cinzel text-palacio-gold text-sm">${order.total_amount}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/10">
                      <p className="text-gray-600 text-xs font-mono">
                        Ref: {order.reference_number}
                      </p>
                      <span className="text-gray-500 text-xs">
                        {order.payment_method}
                      </span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
