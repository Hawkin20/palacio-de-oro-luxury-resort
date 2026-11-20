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
  onNavigate?: (page: string) => void;
}

const STATUS_CONFIG: Record<string, { 
  color: string; 
  bg: string; 
  border: string; 
  icon: typeof CheckCircle2;
  label: string;
}> = {
  pending: { 
    color: 'text-amber-300', 
    bg: 'bg-amber-500/10', 
    border: 'border-amber-500/20',
    icon: Timer,
    label: 'Pending Confirmation'
  },
  confirmed: { 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
    label: 'Confirmed'
  },
  completed: { 
    color: 'text-palacio-bronze', 
    bg: 'bg-palacio-bronze/10', 
    border: 'border-palacio-bronze/20',
    icon: CheckCircle2,
    label: 'Completed'
  },
  cancelled: { 
    color: 'text-rose-400', 
    bg: 'bg-rose-500/10', 
    border: 'border-rose-500/20',
    icon: XCircle,
    label: 'Cancelled'
  },
};

export default function Bookings({ userId, isLoggedIn, onNavigate }: BookingsProps) {
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
      
      // Fetch bookings, rooms, cottages in parallel
      const [bookingsRes, roomsRes, cottagesRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('*')
          .eq('guest_id', userId)
          .order('created_at', { ascending: false }),
        supabase.from('rooms').select('id, name'),
        supabase.from('cottages').select('id, name')
      ]);

      if (!bookingsRes.error && bookingsRes.data) {
        const roomMap = new Map((roomsRes.data || []).map((r: any) => [r.id, r.name]));
        const cottageMap = new Map((cottagesRes.data || []).map((c: any) => [c.id, c.name]));
        
        const enrichedBookings: Booking[] = bookingsRes.data.map((b: any) => ({
          ...b,
          room_name: b.room_name || roomMap.get(b.room_id) || '',
          cottage_name: b.cottage_name || cottageMap.get(b.cottage_id) || '',
          accommodation_name: b.accommodation_name || roomMap.get(b.room_id) || cottageMap.get(b.cottage_id) || 'Resort Sanctuary'
        }));
        setBookings(enrichedBookings);
      } else if (bookingsRes.error) {
        console.warn('Bookings fetch issue:', bookingsRes.error.message);
      }

      // Try full_order_tracking first; gracefully fall back to raw orders table if view is missing
      try {
        const ordersRes = await supabase
          .from('full_order_tracking')
          .select('*')
          .eq('guest_id', userId)
          .order('created_at', { ascending: false });

        if (!ordersRes.error && ordersRes.data) {
          setOrders(ordersRes.data);
        } else {
          // Fallback to base orders table
          const baseOrdersRes = await supabase
            .from('orders')
            .select('*')
            .eq('guest_id', userId)
            .order('created_at', { ascending: false });
          if (!baseOrdersRes.error && baseOrdersRes.data) {
            setOrders(baseOrdersRes.data as Order[]);
          }
        }
      } catch (orderErr) {
        console.warn('Orders tracking query fallback:', orderErr);
      }
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
    const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    return nights;
  };

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-palacio-obsidian">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-palacio-obsidian via-transparent to-palacio-obsidian" />
        
        <GlassCard className="relative z-10 p-10 text-center max-w-md border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-palacio-bronze/10 border border-palacio-bronze/30 flex items-center justify-center">
            <Home size={28} className="text-palacio-bronze" />
          </div>
          <h2 className="font-playfair text-3xl text-palacio-alabaster mb-3">
            Welcome to Palacio de Oro
          </h2>
          <p className="text-palacio-alabaster/70 mb-6 leading-relaxed font-light text-sm">
            Please sign in to view your reservation details and private resort requests.
          </p>
          <div className="w-16 h-px bg-palacio-bronze/40 mx-auto" />
        </GlassCard>
      </div>
    );
  }

  const standaloneOrders = getStandaloneOrders();
  const hasContent = bookings.length > 0 || standaloneOrders.length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-palacio-obsidian">
      {/* Hero Section */}
      <div className="relative h-[45vh] min-h-[360px] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-palacio-obsidian" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
        
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 pt-20">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-black/40 border border-white/10 rounded-full mb-6 backdrop-blur-md">
            <ClipboardCheck size={14} className="text-palacio-bronze" />
            <span className="text-palacio-alabaster/90 font-cinzel text-[11px] tracking-[0.25em] uppercase">Guest Sanctuary Portal</span>
          </div>
          
          <h1 className="font-playfair font-normal text-5xl md:text-6xl text-palacio-alabaster mb-4 drop-shadow-2xl">
            My Reservations
          </h1>
          <p className="text-palacio-alabaster/70 font-poppins text-base md:text-lg italic max-w-xl font-light">
            A chronicle of your stays, culinary orders, and experiences at Palacio de Oro.
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-8 text-xs font-cinzel tracking-wider">
            <div className="flex items-center gap-2 text-palacio-bronze">
              <BedDouble size={14} />
              <span>{bookings.length} {bookings.length === 1 ? 'Stay' : 'Stays'}</span>
            </div>
            <div className="flex items-center gap-2 text-palacio-alabaster/60">
              <UtensilsCrossed size={14} />
              <span>{orders.length} {orders.length === 1 ? 'Order' : 'Orders'}</span>
            </div>
            <div className="flex items-center gap-2 text-palacio-alabaster/60">
              <Sparkles size={14} className="text-palacio-bronze" />
              <span>Sanctuary Guest</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-10">
        {/* Filter Tabs */}
        {hasContent && (
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-white/[0.03] border border-white/[0.08] rounded-full p-1.5 backdrop-blur-md">
              {[
                { key: 'all', label: 'All Activity', count: bookings.length + standaloneOrders.length },
                { key: 'bookings', label: 'Stays', count: bookings.length },
                { key: 'orders', label: 'Culinary Orders', count: standaloneOrders.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-5 py-2 rounded-full font-cinzel text-xs tracking-wider smooth-transition flex items-center gap-2 border ${
                    activeTab === tab.key
                      ? 'bg-palacio-bronze text-palacio-obsidian font-semibold border-palacio-bronze shadow-md'
                      : 'border-transparent text-palacio-alabaster/70 hover:text-palacio-alabaster hover:bg-white/[0.04]'
                  }`}
                >
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.key ? 'bg-palacio-obsidian/20' : 'bg-white/10'
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
          <div className="text-center py-20 px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
              <BedDouble size={32} className="text-palacio-alabaster/40" />
            </div>
            <h3 className="font-playfair text-2xl text-palacio-alabaster mb-3">No Reservations Recorded</h3>
            <p className="text-palacio-alabaster/60 font-poppins text-sm italic mb-8 max-w-md mx-auto font-light">
              Your private island sanctuary awaits. Discover our collection of oceanfront villas and private suites.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('rooms')}
                className="px-6 py-3 bg-palacio-bronze text-palacio-obsidian rounded-lg font-cinzel text-xs font-semibold tracking-wider uppercase hover:bg-palacio-gold transition-colors shadow-lg"
              >
                Explore Accommodations
              </button>
            )}
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
                  className="group relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-palacio-bronze/40 transition-all duration-500 shadow-xl"
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
                        <div className="w-12 h-12 rounded-xl bg-palacio-bronze/10 border border-palacio-bronze/20 flex items-center justify-center">
                          <BedDouble size={22} className="text-palacio-bronze" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-playfair text-xl text-palacio-alabaster">
                              Reservation #{booking.reference_number}
                            </h3>
                          </div>
                          <p className="text-palacio-alabaster/50 text-xs font-cinzel tracking-wider">
                            Booked on {booking.created_at ? new Date(booking.created_at).toLocaleDateString(undefined, { 
                              month: 'long', day: 'numeric', year: 'numeric' 
                            }) : 'Recently'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Main Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white/[0.02] rounded-lg p-3.5 border border-white/[0.06]">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Calendar size={13} className="text-palacio-bronze/60" />
                          <span className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase tracking-wider">Check-in</span>
                        </div>
                        <p className="text-palacio-alabaster font-mono text-sm">
                          {new Date(booking.check_in_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      
                      <div className="bg-white/[0.02] rounded-lg p-3.5 border border-white/[0.06]">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Calendar size={13} className="text-palacio-bronze/60" />
                          <span className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase tracking-wider">Check-out</span>
                        </div>
                        <p className="text-palacio-alabaster font-mono text-sm">
                          {new Date(booking.check_out_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      
                      <div className="bg-white/[0.02] rounded-lg p-3.5 border border-white/[0.06]">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Clock size={13} className="text-palacio-bronze/60" />
                          <span className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase tracking-wider">Duration</span>
                        </div>
                        <p className="text-palacio-alabaster font-cinzel text-sm">
                          {nights} {nights === 1 ? 'Night' : 'Nights'}
                        </p>
                      </div>
                      
                      <div className="bg-white/[0.02] rounded-lg p-3.5 border border-white/[0.06]">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <DollarSign size={13} className="text-palacio-bronze/60" />
                          <span className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase tracking-wider">Total</span>
                        </div>
                        <p className="font-cinzel font-bold text-palacio-bronze text-lg">
                          ${booking.total_price?.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Guest & Payment Info */}
                    <div className="flex flex-wrap items-center gap-6 mb-6 text-xs text-palacio-alabaster/70">
                      <div className="flex items-center gap-2">
                        <User size={13} className="text-palacio-bronze/60" />
                        <span>{booking.guest_count} {booking.guest_count === 1 ? 'Guest' : 'Guests'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard size={13} className="text-palacio-bronze/60" />
                        <span className="capitalize">{booking.payment_method}</span>
                      </div>
                      {booking.downpayment_amount > 0 && (
                        <div className="flex items-center gap-2 text-palacio-bronze">
                          <Receipt size={13} />
                          <span>Deposit Paid: ${booking.downpayment_amount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {/* Expandable Orders Section */}
                    {bookingOrders.length > 0 && (
                      <div className="border-t border-white/[0.08] pt-4">
                        <button
                          onClick={() => toggleExpand(booking.id)}
                          className="flex items-center gap-2 text-palacio-bronze hover:text-palacio-alabaster transition-colors mb-4"
                        >
                          <UtensilsCrossed size={14} />
                          <span className="font-cinzel text-xs tracking-wider uppercase">
                            Room Orders ({bookingOrders.length})
                          </span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="space-y-3">
                            {bookingOrders.map((order) => {
                              const orderStatus = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                              const OrderStatusIcon = orderStatus.icon;
                              
                              return (
                                <div 
                                  key={order.order_id} 
                                  className="flex items-center justify-between bg-black/40 rounded-lg p-3.5 border border-white/[0.06] hover:border-palacio-bronze/20 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-palacio-bronze/10 flex items-center justify-center">
                                      <UtensilsCrossed size={16} className="text-palacio-bronze" />
                                    </div>
                                    <div>
                                      <p className="text-palacio-alabaster font-poppins text-xs">{order.product_name}</p>
                                      <p className="text-palacio-alabaster/50 text-[11px] capitalize">
                                        {order.category} × {order.quantity}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="font-cinzel font-bold text-palacio-bronze text-sm">
                                      ${order.total_amount?.toFixed(2)}
                                    </span>
                                    <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full ${orderStatus.bg} ${orderStatus.border} border`}>
                                      <OrderStatusIcon size={10} className={orderStatus.color} />
                                      <span className={`text-[9px] font-cinzel font-bold uppercase ${orderStatus.color}`}>
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
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/[0.08]">
                      <div className="flex items-center gap-2">
                        <Package size={12} className="text-palacio-alabaster/40" />
                        <span className="text-palacio-alabaster/40 text-[10px] font-mono">
                          ID: {booking.id.slice(0, 12)}...
                        </span>
                      </div>
                      {booking.status === 'pending' && (
                        <div className="flex items-center gap-2 text-amber-300">
                          <Loader2 size={13} className="animate-spin" />
                          <span className="text-xs font-cinzel">Awaiting concierge confirmation...</span>
                        </div>
                      )}
                      {booking.status === 'confirmed' && (
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle2 size={13} />
                          <span className="text-xs font-cinzel">Reservation confirmed — we await your arrival</span>
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
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-palacio-bronze/30 to-transparent" />
                    <h2 className="font-cinzel text-palacio-bronze text-xs tracking-[0.3em] uppercase whitespace-nowrap">
                      Culinary Dining Orders
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-palacio-bronze/30 to-transparent" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {standaloneOrders.map((order) => {
                    const orderStatus = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    const OrderStatusIcon = orderStatus.icon;

                    return (
                      <div 
                        key={order.order_id} 
                        className="group relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-palacio-bronze/30 transition-all duration-500"
                      >
                        {/* Status Badge */}
                        <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl ${orderStatus.bg} ${orderStatus.border} border-b border-l`}>
                          <div className="flex items-center gap-1.5">
                            <OrderStatusIcon size={10} className={orderStatus.color} />
                            <span className={`font-cinzel text-[9px] font-bold uppercase ${orderStatus.color}`}>
                              {orderStatus.label}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-palacio-bronze/10 border border-palacio-bronze/20 flex items-center justify-center">
                              {order.order_type === 'dine_in' ? (
                                <UtensilsCrossed size={18} className="text-palacio-bronze" />
                              ) : (
                                <MapPin size={18} className="text-palacio-bronze" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-playfair text-base text-palacio-alabaster">
                                {order.order_type === 'dine_in' ? 'Restaurant Dine-in' : 'Room Suite Delivery'}
                              </h3>
                              <p className="text-palacio-alabaster/50 text-xs font-cinzel">
                                {order.created_at ? new Date(order.created_at).toLocaleDateString(undefined, { 
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                }) : 'Recently'}
                              </p>
                            </div>
                          </div>

                          <div className="bg-white/[0.02] rounded-lg p-3.5 border border-white/[0.06] mb-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase tracking-wider mb-1">Item</p>
                                <p className="text-palacio-alabaster font-poppins text-xs">{order.product_name}</p>
                              </div>
                              <span className="font-cinzel font-bold text-palacio-bronze text-base">
                                ${order.total_amount?.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-palacio-alabaster/50 text-xs capitalize">
                              {order.category} × {order.quantity}
                            </p>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-white/[0.08]">
                            <div className="flex items-center gap-2">
                              <Receipt size={12} className="text-palacio-alabaster/40" />
                              <span className="text-palacio-alabaster/40 text-[10px] font-mono">
                                #{order.reference_number}
                              </span>
                            </div>
                            <span className="text-palacio-alabaster/60 text-xs capitalize flex items-center gap-1">
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
