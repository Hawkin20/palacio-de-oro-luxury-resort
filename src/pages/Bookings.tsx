import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Booking, Order } from '../lib/types';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { 
  Bell, Calendar, Clock, User, DollarSign, Home, UtensilsCrossed, 
  Package, MapPin, CreditCard, ChevronDown, ChevronUp, Sparkles, 
  ArrowRight, BedDouble, Receipt, ClipboardCheck, Loader2, CheckCircle2,
  XCircle, AlertCircle, Timer, Eye
} from 'lucide-react';

interface BookingsProps {
  userId?: string;
  isLoggedIn: boolean;
}

const STATUS_CONFIG: Record<string, { 
  color: string; 
  bg: string; 
  border: string; 
  icon: typeof CheckCircle2;
  label: string;
}> = {
  pending: { 
    color: 'text-amber-400', 
    bg: 'bg-amber-400/10', 
    border: 'border-amber-400/20',
    icon: Timer,
    label: 'Pending'
  },
  confirmed: { 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-400/10', 
    border: 'border-emerald-400/20',
    icon: CheckCircle2,
    label: 'Confirmed'
  },
  completed: { 
    color: 'text-blue-400', 
    bg: 'bg-blue-400/10', 
    border: 'border-blue-400/20',
    icon: CheckCircle2,
    label: 'Completed'
  },
  cancelled: { 
    color: 'text-red-400', 
    bg: 'bg-red-400/10', 
    border: 'border-red-400/20',
    icon: XCircle,
    label: 'Cancelled'
  },
};

export default function Bookings({ userId, isLoggedIn }: BookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'bookings' | 'orders'>('all');

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchBookingsAndOrders();
    }
  }, [isLoggedIn, userId]);

  const fetchBookingsAndOrders = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      
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

  const getBookingOrders = (booking: Booking) => {
    return orders.filter(o => 
      o.created_at && booking.created_at && 
      new Date(o.created_at).toDateString() === new Date(booking.created_at).toDateString()
    );
  };

  const getStandaloneOrders = () => {
    return orders.filter(o => !bookings.some(b => 
      o.created_at && b.created_at && 
      new Date(o.created_at).toDateString() === new Date(b.created_at).toDateString()
    ));
  };

  const toggleExpand = (bookingId: string) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const getStayDuration = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights;
  };

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        
        <GlassCard className="relative z-10 p-10 text-center max-w-md border border-palacio-gold/30 backdrop-blur-xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-palacio-gold/10 flex items-center justify-center">
            <Home size={28} className="text-palacio-gold" />
          </div>
          <h2 className="font-playfair text-3xl text-palacio-gold mb-3">
            Welcome Back
          </h2>
          <p className="text-gray-400 mb-6 leading-relaxed">
            Please log in to view your reservations and order history.
          </p>
          <div className="w-16 h-0.5 bg-palacio-gold/30 mx-auto rounded-full" />
        </GlassCard>
      </div>
    );
  }

  const standaloneOrders = getStandaloneOrders();
  const hasContent = bookings.length > 0 || standaloneOrders.length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[350px] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
        
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-palacio-gold/10 border border-palacio-gold/30 rounded-full mb-6 backdrop-blur-sm">
            <ClipboardCheck size={16} className="text-palacio-gold" />
            <span className="text-palacio-gold font-cinzel text-xs tracking-[0.3em] uppercase">Guest Portal</span>
          </div>
          
          <h1 className="font-playfair text-5xl md:text-6xl text-palacio-gold mb-4 drop-shadow-2xl">
            My Reservations
          </h1>
          <p className="text-gray-300 font-poppins text-lg italic max-w-xl">
            Your journey at Palacio de Oro, all in one place
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm font-cinzel tracking-wider">
            <div className="flex items-center gap-2 text-palacio-gold">
              <BedDouble size={16} />
              <span>{bookings.length} {bookings.length === 1 ? 'Stay' : 'Stays'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <UtensilsCrossed size={16} />
              <span>{orders.length} {orders.length === 1 ? 'Order' : 'Orders'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Sparkles size={16} />
              <span>VIP Guest</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-10">
        {/* Filter Tabs */}
        {hasContent && (
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-sm">
              {[
                { key: 'all', label: 'All Activity', count: bookings.length + standaloneOrders.length },
                { key: 'bookings', label: 'Stays', count: bookings.length },
                { key: 'orders', label: 'Orders', count: standaloneOrders.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-2.5 rounded-full font-cinzel text-xs tracking-wider smooth-transition flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'bg-palacio-gold text-palacio-black shadow-lg shadow-palacio-gold/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.key ? 'bg-palacio-black/20' : 'bg-white/10'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-20">
            <LoadingSpinner />
          </div>
        ) : !hasContent ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <BedDouble size={40} className="text-gray-600" />
            </div>
            <h3 className="font-playfair text-2xl text-gray-400 mb-3">No Bookings Yet</h3>
            <p className="text-gray-500 font-poppins italic mb-8 max-w-md mx-auto">
              Your summer story at Palacio de Oro starts here. Explore our luxury accommodations and begin your journey.
            </p>
            <div className="w-24 h-0.5 bg-palacio-gold/30 mx-auto rounded-full" />
          </div>
        ) : (
          <div className="space-y-6 pb-20">
            {/* Bookings */}
            {(activeTab === 'all' || activeTab === 'bookings') && bookings.map((booking, index) => {
              const bookingOrders = getBookingOrders(booking);
              const isExpanded = expandedBooking === booking.id;
              const nights = getStayDuration(booking.check_in_date, booking.check_out_date);
              const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;

              return (
                <div 
                  key={booking.id} 
                  className="group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 hover:border-palacio-gold/30 transition-all duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Status Ribbon */}
                  <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl ${statusConfig.bg} ${statusConfig.border} border-b border-l flex items-center gap-1.5`}>
                    <StatusIcon size={12} className={statusConfig.color} />
                    <span className={`font-cinzel text-[10px] font-bold uppercase tracking-wider ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6 pr-20">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-palacio-gold/10 border border-palacio-gold/20 flex items-center justify-center">
                          <BedDouble size={24} className="text-palacio-gold" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-playfair text-xl text-white">
                              Booking #{booking.reference_number}
                            </h3>
                          </div>
                          <p className="text-gray-500 text-xs font-cinzel tracking-wider">
                            {booking.created_at ? new Date(booking.created_at).toLocaleDateString(undefined, { 
                              month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                            }) : 'Just now'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Main Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar size={14} className="text-palacio-gold/60" />
                          <span className="text-gray-500 text-[10px] font-cinzel uppercase tracking-wider">Check-in</span>
                        </div>
                        <p className="text-white font-poppins text-sm">
                          {new Date(booking.check_in_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      
                      <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar size={14} className="text-palacio-gold/60" />
                          <span className="text-gray-500 text-[10px] font-cinzel uppercase tracking-wider">Check-out</span>
                        </div>
                        <p className="text-white font-poppins text-sm">
                          {new Date(booking.check_out_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      
                      <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock size={14} className="text-palacio-gold/60" />
                          <span className="text-gray-500 text-[10px] font-cinzel uppercase tracking-wider">Duration</span>
                        </div>
                        <p className="text-white font-poppins text-sm">
                          {nights} {nights === 1 ? 'Night' : 'Nights'}
                        </p>
                      </div>
                      
                      <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign size={14} className="text-palacio-gold/60" />
                          <span className="text-gray-500 text-[10px] font-cinzel uppercase tracking-wider">Total</span>
                        </div>
                        <p className="font-cinzel font-bold text-palacio-gold text-lg">
                          ${booking.total_price?.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Guest & Payment Info */}
                    <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <User size={14} className="text-palacio-gold/60" />
                        <span>{booking.guest_count} {booking.guest_count === 1 ? 'Guest' : 'Guests'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <CreditCard size={14} className="text-palacio-gold/60" />
                        <span className="capitalize">{booking.payment_method}</span>
                      </div>
                      {booking.downpayment_amount > 0 && (
                        <div className="flex items-center gap-2 text-palacio-gold">
                          <Receipt size={14} />
                          <span>Downpayment: ${booking.downpayment_amount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {/* Expandable Orders Section */}
                    {bookingOrders.length > 0 && (
                      <div className="border-t border-white/10 pt-4">
                        <button
                          onClick={() => toggleExpand(booking.id)}
                          className="flex items-center gap-2 text-palacio-gold hover:text-white transition-colors mb-4"
                        >
                          <UtensilsCrossed size={16} />
                          <span className="font-cinzel text-xs tracking-wider uppercase">
                            Your Orders ({bookingOrders.length})
                          </span>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="space-y-3">
                            {bookingOrders.map((order) => {
                              const orderStatus = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                              const OrderStatusIcon = orderStatus.icon;
                              
                              return (
                                <div 
                                  key={order.order_id} 
                                  className="flex items-center justify-between bg-black/30 rounded-xl p-4 border border-white/5 hover:border-palacio-gold/20 transition-colors"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-palacio-gold/10 flex items-center justify-center">
                                      <UtensilsCrossed size={18} className="text-palacio-gold" />
                                    </div>
                                    <div>
                                      <p className="text-white font-poppins text-sm">{order.product_name}</p>
                                      <p className="text-gray-500 text-xs capitalize">
                                        {order.category} × {order.quantity}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="font-cinzel font-bold text-palacio-gold">
                                      ${order.total_amount?.toFixed(2)}
                                    </span>
                                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${orderStatus.bg} ${orderStatus.border} border`}>
                                      <OrderStatusIcon size={12} className={orderStatus.color} />
                                      <span className={`text-[10px] font-cinzel font-bold uppercase ${orderStatus.color}`}>
                                        {orderStatus.label}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <Package size={12} className="text-gray-600" />
                        <span className="text-gray-600 text-[10px] font-mono">
                          {booking.id.slice(0, 12)}...
                        </span>
                      </div>
                      {booking.status === 'pending' && (
                        <div className="flex items-center gap-2 text-amber-400">
                          <Loader2 size={14} className="animate-spin" />
                          <span className="text-xs font-cinzel">Awaiting confirmation...</span>
                        </div>
                      )}
                      {booking.status === 'confirmed' && (
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle2 size={14} />
                          <span className="text-xs font-cinzel">Ready for your stay</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Standalone Orders */}
            {(activeTab === 'all' || activeTab === 'orders') && standaloneOrders.length > 0 && (
              <div className="pt-4">
                {activeTab === 'all' && (
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-palacio-gold/30 to-transparent" />
                    <h2 className="font-cinzel text-palacio-gold text-sm tracking-[0.3em] uppercase whitespace-nowrap">
                      Additional Orders
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-palacio-gold/30 to-transparent" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {standaloneOrders.map((order, index) => {
                    const orderStatus = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    const OrderStatusIcon = orderStatus.icon;

                    return (
                      <div 
                        key={order.order_id} 
                        className="group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 hover:border-palacio-gold/30 transition-all duration-500 hover:-translate-y-1"
                      >
                        {/* Status Badge */}
                        <div className={`absolute top-0 right-0 px-3 py-1.5 rounded-bl-xl ${orderStatus.bg} ${orderStatus.border} border-b border-l`}>
                          <div className="flex items-center gap-1.5">
                            <OrderStatusIcon size={10} className={orderStatus.color} />
                            <span className={`font-cinzel text-[10px] font-bold uppercase ${orderStatus.color}`}>
                              {orderStatus.label}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-palacio-gold/10 border border-palacio-gold/20 flex items-center justify-center">
                              {order.order_type === 'dine_in' ? (
                                <UtensilsCrossed size={20} className="text-palacio-gold" />
                              ) : (
                                <MapPin size={20} className="text-palacio-gold" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-playfair text-lg text-white">
                                {order.order_type === 'dine_in' ? 'Dine-in Order' : 'Room Delivery'}
                              </h3>
                              <p className="text-gray-500 text-xs font-cinzel">
                                {order.created_at ? new Date(order.created_at).toLocaleDateString(undefined, { 
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                }) : 'Just now'}
                              </p>
                            </div>
                          </div>

                          <div className="bg-black/20 rounded-xl p-4 border border-white/5 mb-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-gray-500 text-[10px] font-cinzel uppercase tracking-wider mb-1">Item</p>
                                <p className="text-white font-poppins text-sm">{order.product_name}</p>
                              </div>
                              <span className="font-cinzel font-bold text-palacio-gold text-lg">
                                ${order.total_amount?.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-gray-500 text-xs capitalize">
                              {order.category} × {order.quantity}
                            </p>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-white/10">
                            <div className="flex items-center gap-2">
                              <Receipt size={12} className="text-gray-600" />
                              <span className="text-gray-600 text-[10px] font-mono">
                                {order.reference_number}
                              </span>
                            </div>
                            <span className="text-gray-500 text-xs capitalize flex items-center gap-1">
                              <CreditCard size={12} />
                              {order.payment_method}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
