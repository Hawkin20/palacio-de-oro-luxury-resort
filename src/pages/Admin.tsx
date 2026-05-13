import { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  CreditCard as Edit2, 
  Bell, 
  Calendar, 
  Clock, 
  User, 
  DollarSign, 
  Home, 
  UtensilsCrossed,
  Search,
  Filter,
  ChevronRight,
  X,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BedDouble,
  ShoppingBag,
  Clock3
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Room, Cottage, MenuItem, Booking, Order } from '../lib/types';
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

export default function Admin({ isLoggedIn, userRole }: AdminProps) {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'rooms' | 'menu' | 'bookings' | 'orders'>('dashboard');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Filter states
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'>('all');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<'all' | string>('all');

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    itemId: string;
    itemName: string;
    type: 'room' | 'menu';
  }>({ isOpen: false, itemId: '', itemName: '', type: 'room' });

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Mobile tab scroll indicator
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
        console.error('Admin verification error:', err);
        setIsAdmin(false);
      }
    };

    verifyAdmin();
  }, [isLoggedIn, userRole]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAllData();
  }, [isAdmin]);

  // Check if tabs need scroll indicator on mobile
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
      
      const [roomsRes, cottagesRes, menuRes, bookingsRes, ordersRes] =
        await Promise.all([
          supabase.from('rooms').select('*'),
          supabase.from('cottages').select('*'),
          supabase.from('menu_items').select('*'),
          supabase.from('full_bookings').select('*').order('created_at', { ascending: false }),
          supabase.from('full_order_tracking').select('*').order('created_at', { ascending: false }),
        ]);

      if (roomsRes.data) setRooms(roomsRes.data);
      if (cottagesRes.data) setCottages(cottagesRes.data);
      if (menuRes.data) setMenu(menuRes.data);
      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
      
      if (bookingsRes.error) console.error('Bookings fetch error:', bookingsRes.error);
      if (ordersRes.error) console.error('Orders fetch error:', ordersRes.error);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id: string, name: string, type: 'room' | 'menu') => {
    setDeleteModal({ isOpen: true, itemId: id, itemName: name, type });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, itemId: '', itemName: '', type: 'room' });
  };

  const confirmDelete = async () => {
    const { itemId, type } = deleteModal;
    
    if (type === 'room') {
      const { error } = await supabase.from('rooms').delete().eq('id', itemId);
      if (!error) {
        setRooms(rooms.filter((r) => r.id !== itemId));
        showToast('Room deleted successfully');
      } else {
        showToast('Failed to delete room', 'error');
      }
    } else {
      const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
      if (!error) {
        setMenu(menu.filter((m) => m.id !== itemId));
        showToast('Menu item deleted successfully');
      } else {
        showToast('Failed to delete menu item', 'error');
      }
    }
    
    closeDeleteModal();
  };

  const handleUpdateBookingStatus = async (referenceNumber: string, newStatus: string) => {
    setUpdateError(null);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('reference_number', referenceNumber)
        .select();

      if (error) {
        console.error('Booking update error:', error);
        setUpdateError(`Booking update failed: ${error.message}`);
        showToast(`Failed to update booking: ${error.message}`, 'error');
        return;
      }

      setBookings(prev => 
        prev.map((b) => (b.reference_number === referenceNumber ? { ...b, status: newStatus } : b))
      );
      showToast(`Booking status updated to ${newStatus}`);
      await fetchAllData();
      
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setUpdateError(`Unexpected error: ${err.message}`);
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdateError(null);

    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('Order update error:', error);
        setUpdateError(`Order update failed: ${error.message}`);
        showToast(`Failed to update order: ${error.message}`, 'error');
        return;
      }

      setOrders(prev => 
        prev.map((o) => (o.order_id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast(`Order status updated to ${newStatus}`);
      await fetchAllData();
      
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setUpdateError(`Unexpected error: ${err.message}`);
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const getUserOrders = (userEmail: string) => {
    return orders.filter(o => o.user_email === userEmail);
  };

  // Filter functions
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
      (booking.cottage_name || '').toLowerCase().includes(bookingSearch.toLowerCase());
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

  // Get unique menu categories
  const menuCategories = ['all', ...new Set(menu.map(item => item.category))];

  // Get recent activity for dashboard
  const recentBookings = bookings.slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  // Calculate revenue stats
  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);
  
  const todayRevenue = bookings
    .filter(b => {
      const bookingDate = new Date(b.created_at || '');
      const today = new Date();
      return b.status === 'completed' && 
        bookingDate.toDateString() === today.toDateString();
    })
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <GlassCard className="p-8 text-center max-w-md">
          <h2 className="font-playfair text-2xl text-palacio-gold mb-4">
            Admin Access Required
          </h2>
          <p className="text-gray-400">
            {!isLoggedIn 
              ? 'Please log in to access this panel.' 
              : 'You do not have administrator privileges.'}
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 relative">
      {/* Toast Notifications */}
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

        {/* Error Banner */}
        {updateError && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 flex items-center gap-2">
            <AlertTriangle size={18} />
            {updateError}
          </div>
        )}

        {/* Tab Navigation with Scroll Indicator */}
        <div className="relative mb-8">
          <div 
            id="admin-tabs"
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
          >
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
            {/* DASHBOARD TAB */}
            {currentTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <GlassCard className="p-4 md:p-6 text-center">
                    <div className="text-2xl md:text-3xl font-playfair text-palacio-gold mb-1">
                      {rooms.length + cottages.length}
                    </div>
                    <p className="text-gray-400 text-xs md:text-sm">Total Accommodations</p>
                  </GlassCard>
                  <GlassCard className="p-4 md:p-6 text-center">
                    <div className="text-2xl md:text-3xl font-playfair text-palacio-gold mb-1">
                      {menu.length}
                    </div>
                    <p className="text-gray-400 text-xs md:text-sm">Menu Items</p>
                  </GlassCard>
                  <GlassCard className="p-4 md:p-6 text-center">
                    <div className="text-2xl md:text-3xl font-playfair text-palacio-gold mb-1">
                      {bookings.filter((b) => b.status === 'pending').length}
                    </div>
                    <p className="text-gray-400 text-xs md:text-sm">Pending Bookings</p>
                  </GlassCard>
                  <GlassCard className="p-4 md:p-6 text-center">
                    <div className="text-2xl md:text-3xl font-playfair text-palacio-gold mb-1">
                      {orders.filter((o) => o.status === 'pending').length}
                    </div>
                    <p className="text-gray-400 text-xs md:text-sm">Pending Orders</p>
                  </GlassCard>
                </div>

                {/* Revenue Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <DollarSign size={20} className="text-palacio-gold" />
                      <h3 className="font-playfair text-lg text-palacio-gold">Revenue Overview</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Today's Revenue</span>
                        <span className="font-cinzel text-palacio-gold text-lg">${todayRevenue}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Revenue</span>
                        <span className="font-cinzel text-palacio-gold text-lg">${totalRevenue}</span>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <BedDouble size={20} className="text-palacio-gold" />
                      <h3 className="font-playfair text-lg text-palacio-gold">Occupancy Rate</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Occupied Rooms</span>
                        <span className="font-cinzel text-palacio-gold text-lg">
                          {bookings.filter(b => b.status === 'confirmed').length} / {rooms.length + cottages.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-palacio-gold h-2 rounded-full smooth-transition"
                          style={{ 
                            width: `${Math.min(100, (bookings.filter(b => b.status === 'confirmed').length / (rooms.length + cottages.length || 1)) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Bookings */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-playfair text-lg text-palacio-gold flex items-center gap-2">
                        <Clock3 size={18} />
                        Recent Bookings
                      </h3>
                      <button 
                        onClick={() => setCurrentTab('bookings')}
                        className="text-palacio-gold text-sm hover:underline flex items-center gap-1"
                      >
                        View All <ChevronRight size={14} />
                      </button>
                    </div>
                    {recentBookings.length === 0 ? (
                      <GlassCard className="p-8 text-center">
                        <p className="text-gray-500">No bookings yet</p>
                      </GlassCard>
                    ) : (
                      <div className="space-y-3">
                        {recentBookings.map(booking => (
                          <GlassCard key={booking.reference_number} className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-cinzel text-palacio-gold text-sm">
                                  {booking.username || 'Unknown'}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                  {booking.cottage_name || booking.room_name || 'N/A'}
                                </p>
                                <p className="text-gray-600 text-xs">
                                  {booking.check_in_date} → {booking.check_out_date}
                                </p>
                              </div>
                              <div className="text-right">
                                <StatusBadge status={booking.status} size="sm" />
                                 size="sm" />
                                <p className="font-cinzel text-palacio-gold text-sm mt-1">
                                  ${booking.total_price}
                                </p>
                              </div>
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Orders */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-playfair text-lg text-palacio-gold flex items-center gap-2">
                        <ShoppingBag size={18} />
                        Recent Orders
                      </h3>
                      <button 
                        onClick={() => setCurrentTab('orders')}
                        className="text-palacio-gold text-sm hover:underline flex items-center gap-1"
                      >
                        View All <ChevronRight size={14} />
                      </button>
                    </div>
                    {recentOrders.length === 0 ? (
                      <GlassCard className="p-8 text-center">
                        <p className="text-gray-500">No orders yet</p>
                      </GlassCard>
                    ) : (
                      <div className="space-y-3">
                        {recentOrders.map(order => (
                          <GlassCard key={order.order_id} className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-cinzel text-palacio-gold text-sm">
                                  {order.product_name || 'N/A'}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                  {order.username || 'Unknown'}
                                </p>
                                <p className="text-gray-600 text-xs">
                                  ×{order.quantity} • ${order.total_amount}
                                </p>
                              </div>
                              <StatusBadge status={order.status} size="sm" />
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ROOMS TAB */}
            {currentTab === 'rooms' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setFormData({});
                      setShowModal(true);
                    }}
                    className="gold-glow-btn"
                  >
                    <Plus className="inline mr-2" size={18} />
                    Add Room
                  </button>
                  
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search rooms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-palacio-gold/50"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {filteredRooms.length === 0 ? (
                  <GlassCard className="p-12 text-center">
                    <BedDouble size={48} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No rooms found</p>
                    <p className="text-gray-600 text-sm">
                      {searchQuery ? 'Try adjusting your search' : 'Add your first room to get started'}
                    </p>
                  </GlassCard>
                ) : (
                  <div className="space-y-4">
                    {filteredRooms.map((item) => (
                      <GlassCard key={item.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-playfair text-lg text-palacio-gold">
                              {item.name}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              ${item.price_per_night}/night • {item.capacity} guests
                            </p>
                            <div className="mt-2">
                              <StatusBadge status={item.status} size="sm" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setFormData(item);
                                setShowModal(true);
                              }}
                              className="p-2 hover:bg-palacio-gold/20 rounded smooth-transition"
                              title="Edit"
                            >
                              <Edit2 size={18} className="text-palacio-gold" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(item.id, item.name, 'room')}
                              className="p-2 hover:bg-red-900/20 rounded smooth-transition"
                              title="Delete"
                            >
                              <Trash2 size={18} className="text-red-400" />
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MENU TAB */}
            {currentTab === 'menu' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setFormData({});
                      setShowModal(true);
                    }}
                    className="gold-glow-btn"
                  >
                    <Plus className="inline mr-2" size={18} />
                    Add Menu Item
                  </button>

                  <div className="flex gap-3 w-full sm:w-auto">
                    {/* Category Filter */}
                    <select
                      value={menuCategoryFilter}
                      onChange={(e) => setMenuCategoryFilter(e.target.value)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-palacio-gold/50"
                    >
                      {menuCategories.map(cat => (
                        <option key={cat} value={cat} className="bg-palacio-black">
                          {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>

                    {/* Search Bar */}
                    <div className="relative flex-1 sm:w-48">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search menu..."
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-palacio-gold/50"
                      />
                      {menuSearch && (
                        <button 
                          onClick={() => setMenuSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {filteredMenu.length === 0 ? (
                  <GlassCard className="p-12 text-center">
                    <UtensilsCrossed size={48} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No menu items found</p>
                    <p className="text-gray-600 text-sm">
                      {menuSearch || menuCategoryFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first menu item'}
                    </p>
                  </GlassCard>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMenu.map((item) => (
                      <GlassCard key={item.id} className="p-4 group">
                        <div className="relative overflow-hidden rounded mb-3">
                          <img
                            src={item.image_url || '/placeholder-food.jpg'}
                            alt={item.name}
                            className="w-full h-32 object-cover smooth-transition group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-food.jpg';
                            }}
                          />
                        </div>
                        <h3 className="font-playfair text-palacio-gold mb-1">
                          {item.name}
                        </h3>
                        <p className="text-gray-400 text-xs mb-2 capitalize">
                          {item.category}
                        </p>
                        <p className="font-cinzel text-palacio-gold mb-3">
                          ${item.price}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setFormData(item);
                              setShowModal(true);
                            }}
                            className="flex-1 p-2 hover:bg-palacio-gold/20 rounded text-sm smooth-transition"
                          >
                            <Edit2 size={14} className="inline mr-1 text-palacio-gold" />
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(item.id, item.name, 'menu')}
                            className="flex-1 p-2 hover:bg-red-900/20 rounded text-sm smooth-transition"
                          >
                            <Trash2 size={14} className="inline mr-1 text-red-400" />
                            Delete
                          </button>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* BOOKINGS TAB */}
            {currentTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex gap-3">
                    {/* Status Filter */}
                    <select
                      value={bookingFilter}
                      onChange={(e) => setBookingFilter(e.target.value as any)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-palacio-gold/50"
                    >
                      <option value="all" className="bg-palacio-black">All Status</option>
                      <option value="pending" className="bg-palacio-black">Pending</option>
                      <option value="confirmed" className="bg-palacio-black">Confirmed</option>
                      <option value="cancelled" className="bg-palacio-black">Cancelled</option>
                      <option value="completed" className="bg-palacio-black">Completed</option>
                    </select>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search by guest, ref, or room..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-palacio-gold/50"
                    />
                    {bookingSearch && (
                      <button 
                        onClick={() => setBookingSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {filteredBookings.length === 0 ? (
                  <GlassCard className="p-12 text-center">
                    <Calendar size={48} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No bookings found</p>
                    <p className="text-gray-600 text-sm">
                      {bookingSearch || bookingFilter !== 'all' ? 'Try adjusting your filters' : 'No bookings yet'}
                    </p>
                  </GlassCard>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => {
                      const userOrders = getUserOrders(booking.user_email || '');
                      const hasOrders = userOrders.length > 0;
                      const pendingOrders = userOrders.filter(o => o.status === 'pending').length;

                      return (
                        <GlassCard key={booking.reference_number} className="p-5">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-palacio-gold/20 flex items-center justify-center">
                                <Bell size={20} className="text-palacio-gold" />
                              </div>
                              <div>
                                <h3 className="font-playfair text-lg text-palacio-gold">
                                  New Booking Request
                                </h3>
                                <p className="text-gray-500 text-xs">
                                  {booking.created_at ? new Date(booking.created_at).toLocaleString() : 'Just now'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Booking Details */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 bg-black/20 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <User size={14} className="text-gray-500" />
                              <div>
                                <p className="text-gray-500 text-xs">Guest</p>
                                <p className="font-cinzel text-palacio-gold text-sm">
                                  {booking.username || 'Unknown'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-gray-500" />
                              <div>
                                <p className="text-gray-500 text-xs">Dates</p>
                                <p className="font-cinzel text-palacio-gold text-sm">
                                  {booking.check_in_date} → {booking.check_out_date}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Home size={14} className="text-gray-500" />
                              <div>
                                <p className="text-gray-500 text-xs">Accommodation</p>
                                <p className="font-cinzel text-palacio-gold text-sm">
                                  {booking.cottage_name || booking.room_name || 'N/A'}
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

                          {/* Orders Section */}
                          {hasOrders && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <UtensilsCrossed size={14} className="text-palacio-gold" />
                                <h4 className="font-cinzel text-sm text-palacio-gold">
                                  Guest Orders
                                  {pendingOrders > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                                      {pendingOrders} pending
                                    </span>
                                  )}
                                </h4>
                              </div>
                              <div className="space-y-2">
                                {userOrders.map((order) => (
                                  <div 
                                    key={order.order_id} 
                                    className="flex items-center justify-between bg-black/20 rounded-lg p-2 text-sm"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-400">{order.product_name}</span>
                                      <span className="text-gray-600">×{order.quantity}</span>
                                      <span className="text-palacio-gold/60">${order.total_amount}</span>
                                    </div>
                                    <select
                                      value={order.status}
                                      onChange={(e) => handleUpdateOrderStatus(order.order_id!, e.target.value)}
                                      className="px-2 py-0.5 bg-palacio-gold/20 border border-palacio-gold/30 rounded text-palacio-gold text-xs focus:outline-none cursor-pointer"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="preparing">Preparing</option>
                                      <option value="ready">Ready</option>
                                      <option value="completed">Completed</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <p className="text-gray-500 text-xs font-mono">
                              Ref: {booking.reference_number}
                            </p>
                            <select
                              value={booking.status}
                              onChange={(e) => handleUpdateBookingStatus(booking.reference_number, e.target.value)}
                              className="px-3 py-1.5 bg-palacio-gold/20 border border-palacio-gold/30 rounded text-palacio-gold font-cinzel text-sm focus:outline-none cursor-pointer"
                            >
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

            {/* ORDERS TAB */}
            {currentTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex gap-3">
                    {/* Status Filter */}
                    <select
                      value={orderFilter}
                      onChange={(e) => setOrderFilter(e.target.value as any)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-palacio-gold/50"
                    >
                      <option value="all" className="bg-palacio-black">All Status</option>
                      <option value="pending" className="bg-palacio-black">Pending</option>
                      <option value="preparing" className="bg-palacio-black">Preparing</option>
                      <option value="ready" className="bg-palacio-black">Ready</option>
                      <option value="completed" className="bg-palacio-black">Completed</option>
                      <option value="cancelled" className="bg-palacio-black">Cancelled</option>
                    </select>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search by customer, product..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-palacio-gold/50"
                    />
                    {orderSearch && (
                      <button 
                        onClick={() => setOrderSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <GlassCard className="p-12 text-center">
                    <ShoppingBag size={48} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No orders found</p>
                    <p className="text-gray-600 text-sm">
                      {orderSearch || orderFilter !== 'all' ? 'Try adjusting your filters' : 'No orders yet'}
                    </p>
                  </GlassCard>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <GlassCard key={order.order_id} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-gray-400 text-sm">Customer</p>
                            <p className="font-cinzel text-palacio-gold">
                              {order.username || 'Unknown'}
                            </p>
                            <p className="text-gray-500 text-xs">{order.user_email}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Reference</p>
                            <p className="font-cinzel text-palacio-gold">
                              {order.reference_number}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Type</p>
                            <p className="font-cinzel text-palacio-gold">
                              {order.order_type === 'dine_in' ? 'Dine-in' : 'Room Delivery'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Amount</p>
                            <p className="font-cinzel text-palacio-gold">
                              ${order.total_amount}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Product</p>
                            <p className="font-cinzel text-palacio-gold">
                              {order.product_name || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Category</p>
                            <p className="font-cinzel text-palacio-gold">
                              {order.category || 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Status Update - Only dropdown, no duplicate badge */}
                        <div className="flex justify-end items-center mt-4 pt-4 border-t border-white/5">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.order_id!, e.target.value)}
                            className="px-3 py-1.5 bg-palacio-gold/20 border border-palacio-gold/30 rounded text-palacio-gold font-cinzel text-sm focus:outline-none cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
          setFormData({});
        }}
        title={editingItem ? 'Edit Item' : 'Add Item'}
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowModal(false);
                setEditingItem(null);
                setFormData({});
              }}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 smooth-transition"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                // TODO: Implement actual save logic
                showToast(editingItem ? 'Item updated (demo)' : 'Item added (demo)');
                setShowModal(false);
              }}
              className="flex-1 px-4 py-2 bg-palacio-gold text-palacio-black rounded font-cinzel font-semibold hover:bg-palacio-gold/80 smooth-transition"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            {editingItem ? 'Editing: ' + (editingItem.name || 'Item') : 'Create new item'}
          </p>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-gray-500 text-sm text-center">
              🚧 Form fields coming soon — connect to your Supabase schema
            </p>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Confirm Deletion"
        footer={
          <div className="flex gap-3">
            <button
              onClick={closeDeleteModal}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 smooth-transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded font-cinzel font-semibold hover:bg-red-700 smooth-transition"
            >
              Delete
            </button>
          </div>
        }
      >
        <div className="text-center py-4">
          <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-2">
            Are you sure you want to delete <span className="text-palacio-gold font-semibold">{deleteModal.itemName}</span>?
          </p>
          <p className="text-gray-500 text-sm">
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
