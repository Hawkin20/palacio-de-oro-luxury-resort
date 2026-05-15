import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  CreditCard as Edit2, 
  Bell, 
  Calendar, 
  User, 
  DollarSign, 
  Home, 
  UtensilsCrossed,
  Search,
  ChevronRight,
  X,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BedDouble,
  ShoppingBag,
  Clock3,
  Trash
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Room, Cottage, MenuItem } from '../lib/types';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

interface AdminProps {
  isLoggedIn: boolean;
  userRole: string | null;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface BookingData {
  id: string;
  reference_number: string;
  user_id: string;
  room_id?: string;
  cottage_id?: string;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  status: string;
  created_at: string;
  username?: string;
  user_email?: string;
  room_name?: string;
  cottage_name?: string;
}

interface OrderData {
  id: string;
  reference_number: string;
  user_id: string;
  menu_item_id?: string;
  quantity: number;
  total_amount: number;
  status: string;
  order_type: string;
  created_at: string;
  username?: string;
  user_email?: string;
  product_name?: string;
  category?: string;
}

export default function Admin({ isLoggedIn, userRole }: AdminProps) {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'rooms' | 'menu' | 'bookings' | 'orders'>('dashboard');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'>('all');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<'all' | string>('all');

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    itemId: string;
    itemName: string;
    type: 'room' | 'menu' | 'booking' | 'order';
  }>({ isOpen: false, itemId: '', itemName: '', type: 'room' });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showTabScroll, setShowTabScroll] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    const verifyAdmin = async () => {
      if (!isLoggedIn) {
        setIsAdmin(false);
        return;
      }
      if (userRole === 'admin') {
        setIsAdmin(true);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsAdmin(false);
          return;
        }
        const { data: user, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (error || user?.role !== 'admin') {
          setIsAdmin(false);
          return;
        }
        setIsAdmin(true);
      } catch (err) {
        setIsAdmin(false);
      }
    };
    verifyAdmin();
  }, [isLoggedIn, userRole]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    const checkScroll = () => {
      const tabContainer = document.getElementById('admin-tabs');
      if (tabContainer) {
        setShowTabScroll(tabContainer.scrollWidth > tabContainer.clientWidth);
      }
    };
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setUpdateError(null);

      const [roomsRes, cottagesRes, menuRes, bookingsRes, ordersRes] = await Promise.all([
        supabase.from('rooms').select('*'),
        supabase.from('cottages').select('*'),
        supabase.from('menu_items').select('*'),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
      ]);

      if (roomsRes.data) setRooms(roomsRes.data);
      if (cottagesRes.data) setCottages(cottagesRes.data);
      if (menuRes.data) setMenu(menuRes.data);

      const bookingsData = bookingsRes.data || [];
      const ordersData = ordersRes.data || [];

      const userIds = [...new Set([
        ...bookingsData.map((b: any) => b.user_id),
        ...ordersData.map((o: any) => b.user_id),
      ])].filter(Boolean);

      let usersMap: Record<string, { email?: string; username?: string }> = {};
      if (userIds.length > 0) {
        const { data: usersData } = await supabase
          .from('users')
          .select('id, email, username')
          .in('id', userIds);
        usersMap = (usersData || []).reduce((acc: any, u: any) => {
          acc[u.id] = { email: u.email, username: u.username };
          return acc;
        }, {});
      }

      const enrichedBookings: BookingData[] = bookingsData.map((b: any) => ({
        ...b,
        username: usersMap[b.user_id]?.username || usersMap[b.user_id]?.email?.split('@')[0] || 'Guest',
        user_email: usersMap[b.user_id]?.email || '',
        room_name: roomsRes.data?.find((r: any) => r.id === b.room_id)?.name,
        cottage_name: cottagesRes.data?.find((c: any) => c.id === b.cottage_id)?.name,
      }));

      const enrichedOrders: OrderData[] = ordersData.map((o: any) => ({
        ...o,
        username: usersMap[o.user_id]?.username || usersMap[o.user_id]?.email?.split('@')[0] || 'Guest',
        user_email: usersMap[o.user_id]?.email || '',
        product_name: menuRes.data?.find((m: any) => m.id === o.menu_item_id)?.name,
        category: menuRes.data?.find((m: any) => m.id === o.menu_item_id)?.category,
      }));

      setBookings(enrichedBookings);
      setOrders(enrichedOrders);

      if (bookingsRes.error) console.error('Bookings error:', bookingsRes.error);
      if (ordersRes.error) console.error('Orders error:', ordersRes.error);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: string, name: string, type: 'room' | 'menu' | 'booking' | 'order') => {
    setDeleteModal({ isOpen: true, itemId: id, itemName: name, type });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, itemId: '', itemName: '', type: 'room' });
  };

  const confirmDelete = async () => {
    const { itemId, type } = deleteModal;
    try {
      if (type === 'room') {
        const { error } = await supabase.from('rooms').delete().eq('id', itemId);
        if (!error) {
          setRooms(rooms.filter((r) => r.id !== itemId));
          showToast('Room deleted');
        } else throw error;
      } else if (type === 'menu') {
        const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
        if (!error) {
          setMenu(menu.filter((m) => m.id !== itemId));
          showToast('Menu item deleted');
        } else throw error;
      } else if (type === 'booking') {
        const { error } = await supabase.from('bookings').delete().eq('id', itemId);
        if (!error) {
          setBookings(bookings.filter((b) => b.id !== itemId));
          showToast('Booking deleted');
        } else throw error;
      } else if (type === 'order') {
        const { error } = await supabase.from('orders').delete().eq('id', itemId);
        if (!error) {
          setOrders(orders.filter((o) => o.id !== itemId));
          showToast('Order deleted');
        } else throw error;
      }
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
    closeDeleteModal();
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    setUpdateError(null);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();
      if (error) {
        setUpdateError(`Update failed: ${error.message}`);
        showToast(`Failed: ${error.message}`, 'error');
        return;
      }
      setBookings(prev => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
      showToast(`Status: ${newStatus}`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    setUpdateError(null);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();
      if (error) {
        setUpdateError(`Update failed: ${error.message}`);
        showToast(`Failed: ${error.message}`, 'error');
        return;
      }
      setOrders(prev => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
      showToast(`Status: ${newStatus}`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const filteredRooms = [...rooms, ...cottages].filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.price_per_night.toString().includes(searchQuery)
  );

  const filteredMenu = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCategory = menuCategoryFilter === 'all' || item.category === menuCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = (booking.username || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
      booking.reference_number.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (booking.cottage_name || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (booking.room_name || '').toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesFilter = bookingFilter === 'all' || booking.status === bookingFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.username || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
      (order.product_name || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.reference_number.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    return matchesSearch && matchesFilter;
  });

  const menuCategories = ['all', ...new Set(menu.map(item => item.category))];

  const recentBookings = bookings.slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  const todayRevenue = bookings
    .filter(b => {
      const d = new Date(b.created_at || '');
      const today = new Date();
      return (b.status === 'completed' || b.status === 'confirmed') && 
        d.toDateString() === today.toDateString();
    })
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  const monthRevenue = bookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  const canDeleteBooking = (status: string) => status === 'completed' || status === 'cancelled';
  const canDeleteOrder = (status: string) => status === 'completed' || status === 'cancelled';

  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <GlassCard className="p-8 text-center max-w-md">
          <h2 className="font-playfair text-2xl text-palacio-gold mb-4">Admin Access Required</h2>
          <p className="text-gray-400">
            {!isLoggedIn ? 'Please log in.' : 'No admin privileges.'}
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 relative">
      <div className="fixed top-24 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 smooth-transition ${
              toast.type === 'success' 
                ? 'bg-green-900/90 border border-green-500 text-green-100' 
                : 'bg-red-900/90 border border-red-500 text-red-100'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-8">Admin Dashboard</h1>

        {updateError && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 flex items-center gap-2">
            <AlertTriangle size={18} />
            {updateError}
          </div>
        )}

        <div className="relative mb-8">
          <div id="admin-tabs" className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {[
              { value: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { value: 'rooms', label: 'Rooms & Cottages', icon: BedDouble },
              { value: 'menu', label: 'Menu', icon: UtensilsCrossed },
              { value: 'bookings', label: 'Bookings', icon: Calendar },
              { value: 'orders', label: 'Orders', icon: ShoppingBag },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setCurrentTab(tab.value as any)}
                className={`px-4 py-2 rounded-lg font-cinzel text-sm smooth-transition whitespace-nowrap flex items-center gap-2 ${
                  currentTab === tab.value
                    ? 'bg-palacio-gold text-palacio-black'
                    : 'bg-palacio-gold/10 text-palacio-gold hover:bg-palacio-gold/20'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
          {showTabScroll && (
            <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-palacio-black to-transparent pointer-events-none md:hidden" />
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { val: rooms.length + cottages.length, label: 'Accommodations' },
                    { val: menu.length, label: 'Menu Items' },
                    { val: bookings.filter(b => b.status === 'pending').length, label: 'Pending Bookings' },
                    { val: orders.filter(o => o.status === 'pending').length, label: 'Pending Orders' },
                  ].map((s, i) => (
                    <GlassCard key={i} className="p-4 md:p-6 text-center !bg-white/15 !border-white/25">
                      <div className="text-2xl md:text-3xl font-playfair text-palacio-gold mb-1 font-bold">{s.val}</div>
                      <p className="text-gray-100 text-xs md:text-sm font-bold">{s.label}</p>
                    </GlassCard>
                  ))}
                </div>

                <div className="bg-white/15 border border-white/25 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={20} className="text-palacio-gold" />
                    <h3 className="font-playfair text-lg text-palacio-gold font-bold">Revenue Summary</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                      <p className="text-gray-300 text-[10px] font-bold uppercase mb-1">Today's Revenue</p>
                      <p className="text-2xl font-playfair text-palacio-gold font-bold">${todayRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                      <p className="text-gray-300 text-[10px] font-bold uppercase mb-1">Total Booking Revenue</p>
                      <p className="text-2xl font-playfair text-palacio-gold font-bold">${monthRevenue.toLocaleString()}</p>
                      <p className="text-gray-400 text-xs font-bold mt-1">{bookings.length} total bookings</p>
                    </div>
                    <div className="bg-black/40 rounded-lg p-4 border border-white/10">
                      <p className="text-gray-300 text-[10px] font-bold uppercase mb-1">Total Orders</p>
                      <p className="text-2xl font-playfair text-palacio-gold font-bold">{orders.length}</p>
                      <p className="text-gray-400 text-xs font-bold mt-1">{orders.filter(o => o.status === 'completed').length} completed</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/15 border border-white/25 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign size={18} className="text-palacio-gold" />
                      <h3 className="font-playfair text-lg text-palacio-gold font-bold">Revenue Breakdown</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-100 font-bold text-sm">Today's Revenue</span>
                        <span className="text-palacio-gold font-bold font-cinzel">${todayRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-100 font-bold text-sm">All Bookings</span>
                        <span className="text-palacio-gold font-bold font-cinzel">${monthRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-100 font-bold text-sm">Confirmed Only</span>
                        <span className="text-palacio-gold font-bold font-cinzel">
                          ${bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + (b.total_price || 0), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/15 border border-white/25 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BedDouble size={18} className="text-palacio-gold" />
                      <h3 className="font-playfair text-lg text-palacio-gold font-bold">Occupancy</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-100 font-bold text-sm">Occupied</span>
                        <span className="text-palacio-gold font-bold font-cinzel">
                          {bookings.filter(b => b.status === 'confirmed').length} / {rooms.length + cottages.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div className="bg-palacio-gold h-3 rounded-full" style={{
                          width: `${Math.min(100, (bookings.filter(b => b.status === 'confirmed').length / (rooms.length + cottages.length || 1)) * 100)}%`
                        }} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-xs font-bold">Rate</span>
                        <span className="text-palacio-gold font-bold">
                          {((bookings.filter(b => b.status === 'confirmed').length / (rooms.length + cottages.length || 1)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-playfair text-lg text-palacio-gold font-bold flex items-center gap-2">
                      <Clock3 size={16} /> Recent Bookings
                    </h3>
                    <button onClick={() => setCurrentTab('bookings')} className="text-palacio-gold text-xs font-bold hover:underline">
                      View All →
                    </button>
                  </div>
                  {recentBookings.length === 0 ? (
                    <div className="bg-white/10 border border-white/20 rounded-lg p-6 text-center">
                      <p className="text-gray-300 font-bold">No bookings yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentBookings.map(b => (
                        <div key={b.id} className="bg-white/15 border border-white/25 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-palacio-gold font-bold text-sm">{b.username}</p>
                              <p className="text-gray-200 text-xs font-bold mt-0.5">
                                {b.cottage_name || b.room_name || 'No room assigned'}
                              </p>
                              <p className="text-gray-400 text-xs">{b.check_in_date} → {b.check_out_date}</p>
                            </div>
                            <div className="text-right">
                              <StatusBadge status={b.status} size="sm" />
                              <p className="text-palacio-gold font-bold text-sm mt-1">${b.total_price}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-playfair text-lg text-palacio-gold font-bold flex items-center gap-2">
                      <ShoppingBag size={16} /> Recent Orders
                    </h3>
                    <button onClick={() => setCurrentTab('orders')} className="text-palacio-gold text-xs font-bold hover:underline">
                      View All →
                    </button>
                  </div>
                  {recentOrders.length === 0 ? (
                    <div className="bg-white/10 border border-white/20 rounded-lg p-6 text-center">
                      <p className="text-gray-300 font-bold">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentOrders.map(o => (
                        <div key={o.id} className="bg-white/15 border border-white/25 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-palacio-gold font-bold text-sm">
                                {o.product_name || o.reference_number || 'Order'}
                              </p>
                              <p className="text-gray-200 text-xs font-bold mt-0.5">{o.username}</p>
                              <p className="text-gray-400 text-xs">
                                Qty: {o.quantity} · ${o.total_amount} · {o.order_type === 'dine_in' ? 'Dine-in' : 'Delivery'}
                              </p>
                            </div>
                            <div className="text-right">
                              <StatusBadge status={o.status} size="sm" />
                              <p className="text-palacio-gold font-bold text-sm mt-1">${o.total_amount}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentTab === 'rooms' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <button onClick={() => { setEditingItem(null); setFormData({}); setShowModal(true); }} className="gold-glow-btn">
                    <Plus className="inline mr-2" size={18} /> Add Room
                  </button>
                  <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search rooms..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-palacio-gold/50" />
                    {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"><X size={14} /></button>}
                  </div>
                </div>

                {filteredRooms.length === 0 ? (
                  <GlassCard className="p-12 text-center">
                    <BedDouble size={48} className="text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-300 text-lg mb-2 font-medium">No rooms found</p>
                  </GlassCard>
                ) : (
                  <div className="space-y-4">
                    {filteredRooms.map((item) => (
                      <GlassCard key={item.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-playfair text-lg text-palacio-gold font-medium">{item.name}</h3>
                            <p className="text-gray-300 text-sm font-medium">${item.price_per_night}/night - {item.capacity} guests</p>
                            <div className="mt-2"><StatusBadge status={item.status} size="sm" /></div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingItem(item); setFormData(item); setShowModal(true); }} className="p-2 hover:bg-palacio-gold/20 rounded smooth-transition"><Edit2 size={18} className="text-palacio-gold" /></button>
                            <button onClick={() => openDeleteModal(item.id, item.name, 'room')} className="p-2 hover:bg-red-900/30 rounded smooth-transition"><Trash2 size={18} className="text-red-400" /></button>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentTab === 'menu' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <button onClick={() => { setEditingItem(null); setFormData({}); setShowModal(true); }} className="gold-glow-btn">
                    <Plus className="inline mr-2" size={18} /> Add Menu Item
                  </button>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <select value={menuCategoryFilter} onChange={(e) => setMenuCategoryFilter(e.target.value)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-palacio-gold/50">
                      {menuCategories.map(cat => <option key={cat} value={cat} className="bg-palacio-black">{cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
                    </select>
                    <div className="relative flex-1 sm:w-48">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder="Search menu..." value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-palacio-gold/50" />
                      {menuSearch && <button onClick={() => setMenuSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"><X size={14} /></button>}
                    </div>
                  </div>
                </div>

                {filteredMenu.length === 0 ? (
                  <GlassCard className="p-12 text-center">
                    <UtensilsCrossed size={48} className="text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-300 text-lg mb-2 font-medium">No menu items found</p>
                  </GlassCard>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMenu.map((item) => (
                      <GlassCard key={item.id} className="p-4 group">
                        <div className="relative overflow-hidden rounded mb-3">
                          <img src={item.image_url || '/placeholder-food.jpg'} alt={item.name} className="w-full h-32 object-cover smooth-transition group-hover:scale-105"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-food.jpg'; }} />
                        </div>
                        <h3 className="font-playfair text-palacio-gold mb-1 font-medium">{item.name}</h3>
                        <p className="text-gray-300 text-xs mb-2 capitalize font-medium">{item.category}</p>
                        <p className="font-cinzel text-palacio-gold mb-3 font-medium">${item.price}</p>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingItem(item); setFormData(item); setShowModal(true); }} className="flex-1 p-2 hover:bg-palacio-gold/20 rounded text-sm smooth-transition"><Edit2 size={14} className="inline mr-1 text-palacio-gold" /> Edit</button>
                          <button onClick={() => openDeleteModal(item.id, item.name, 'menu')} className="flex-1 p-2 hover:bg-red-900/30 rounded text-sm smooth-transition"><Trash2 size={14} className="inline mr-1 text-red-400" /> Delete</button>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex gap-3">
                    <select value={bookingFilter} onChange={(e) => setBookingFilter(e.target.value as any)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-palacio-gold/50">
                      <option value="all" className="bg-palacio-black">All Status</option>
                      <option value="pending" className="bg-palacio-black">Pending</option>
                      <option value="confirmed" className="bg-palacio-black">Confirmed</option>
                      <option value="cancelled" className="bg-palacio-black">Cancelled</option>
                      <option value="completed" className="bg-palacio-black">Completed</option>
                    </select>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search by guest, ref, or room..." value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-palacio-gold/50" />
                    {bookingSearch && <button onClick={() => setBookingSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"><X size={14} /></button>}
                  </div>
                </div>

                {filteredBookings.length === 0 ? (
                  <GlassCard className="p-12 text-center">
                    <Calendar size={48} className="text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-300 text-lg mb-2 font-medium">No bookings found</p>
                  </GlassCard>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => {
                      const showDelete = canDeleteBooking(booking.status);
                      return (
                        <GlassCard key={booking.id} className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-palacio-gold/20 flex items-center justify-center">
                                <Bell size={20} className="text-palacio-gold" />
                              </div>
                              <div>
                                <h3 className="font-playfair text-lg text-palacio-gold font-medium">Booking Request</h3>
                                <p className="text-gray-400 text-xs">{new Date(booking.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                            {showDelete && (
                              <button onClick={() => openDeleteModal(booking.id, `Booking ${booking.reference_number}`, 'booking')}
                                className="p-2 hover:bg-red-900/30 rounded smooth-transition">
                                <Trash size={18} className="text-red-400" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 bg-black/30 rounded-lg p-3">
                            <div>
                              <p className="text-gray-400 text-xs font-medium">Guest</p>
                              <p className="font-cinzel text-palacio-gold text-sm font-medium">{booking.username}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs font-medium">Dates</p>
                              <p className="font-cinzel text-palacio-gold text-sm font-medium">{booking.check_in_date} to {booking.check_out_date}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs font-medium">Room</p>
                              <p className="font-cinzel text-palacio-gold text-sm font-medium">{booking.cottage_name || booking.room_name || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs font-medium">Total</p>
                              <p className="font-cinzel text-palacio-gold text-sm font-medium">${booking.total_price}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-white/10">
                            <p className="text-gray-500 text-xs font-mono">Ref: {booking.reference_number}</p>
                            <select value={booking.status} onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                              className="px-3 py-1.5 bg-palacio-gold/20 border border-palacio-gold/30 rounded text-palacio-gold font-cinzel text-sm focus:outline-none cursor-pointer font-medium">
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {currentTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex gap-3">
                    <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value as any)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-palacio-gold/50">
                      <option value="all" className="bg-palacio-black">All Status</option>
                      <option value="pending" className="bg-palacio-black">Pending</option>
                      <option value="preparing" className="bg-palacio-black">Preparing</option>
                      <option value="ready" className="bg-palacio-black">Ready</option>
                      <option value="completed" className="bg-palacio-black">Completed</option>
                      <option value="cancelled" className="bg-palacio-black">Cancelled</option>
                    </select>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search by customer, product..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-palacio-gold/50" />
                    {orderSearch && <button onClick={() => setOrderSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"><X size={14} /></button>}
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <GlassCard className="p-12 text-center">
                    <ShoppingBag size={48} className="text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-300 text-lg mb-2 font-medium">No orders found</p>
                  </GlassCard>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => {
                      const showDelete = canDeleteOrder(order.status);
                      return (
                        <GlassCard key={order.id} className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                              <div>
                                <p className="text-gray-400 text-sm font-medium">Customer</p>
                                <p className="font-cinzel text-palacio-gold font-medium">{order.username}</p>
                                <p className="text-gray-400 text-xs">{order.user_email}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm font-medium">Reference</p>
                                <p className="font-cinzel text-palacio-gold font-medium">{order.reference_number}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm font-medium">Type</p>
                                <p className="font-cinzel text-palacio-gold font-medium">{order.order_type === 'dine_in' ? 'Dine-in' : 'Room Delivery'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm font-medium">Amount</p>
                                <p className="font-cinzel text-palacio-gold font-medium">${order.total_amount}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm font-medium">Product</p>
                                <p className="font-cinzel text-palacio-gold font-medium">{order.product_name || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm font-medium">Category</p>
                                <p className="font-cinzel text-palacio-gold font-medium">{order.category || 'N/A'}</p>
                              </div>
                            </div>
                            {showDelete && (
                              <button onClick={() => openDeleteModal(order.id, `Order ${order.reference_number}`, 'order')}
                                className="p-2 hover:bg-red-900/30 rounded smooth-transition ml-4">
                                <Trash size={18} className="text-red-400" />
                              </button>
                            )}
                          </div>
                          
                          <div className="flex justify-end items-center mt-4 pt-4 border-t border-white/10">
                            <select value={order.status} onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="px-3 py-1.5 bg-palacio-gold/20 border border-palacio-gold/30 rounded text-palacio-gold font-cinzel text-sm focus:outline-none cursor-pointer font-medium">
                              <option value="pending">Pending</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingItem(null); setFormData({}); }}
        title={editingItem ? 'Edit Item' : 'Add Item'}
        footer={
          <div className="flex gap-3">
            <button onClick={() => { setShowModal(false); setEditingItem(null); setFormData({}); }}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 smooth-transition">Cancel</button>
            <button onClick={() => { showToast(editingItem ? 'Updated (demo)' : 'Added (demo)'); setShowModal(false); }}
              className="flex-1 px-4 py-2 bg-palacio-gold text-palacio-black rounded font-cinzel font-semibold hover:bg-palacio-gold/80 smooth-transition">Save</button>
          </div>
        }>
        <div className="space-y-4">
          <p className="text-gray-300 text-sm font-medium">{editingItem ? 'Editing: ' + (editingItem.name || 'Item') : 'Create new item'}</p>
          <div className="p-4 bg-white/10 rounded-lg border border-white/20">
            <p className="text-gray-400 text-sm text-center">Form fields coming soon</p>
          </div>
        </div>
      </Modal>

      <Modal isOpen={deleteModal.isOpen} onClose={closeDeleteModal} title="Confirm Deletion"
        footer={
          <div className="flex gap-3">
            <button onClick={closeDeleteModal} className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 smooth-transition">Cancel</button>
            <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-cinzel font-semibold hover:bg-red-700 smooth-transition">Delete</button>
          </div>
        }>
        <div className="text-center py-4">
          <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-gray-200 mb-2 font-medium">Delete <span className="text-palacio-gold font-semibold">{deleteModal.itemName}</span>?</p>
          <p className="text-gray-400 text-sm">This cannot be undone.</p>
        </div>
      </Modal>
    </div>
  );
}
