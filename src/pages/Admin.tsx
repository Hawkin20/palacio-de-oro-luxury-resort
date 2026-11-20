import { useState, useEffect, useMemo } from 'react';
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
  X,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BedDouble,
  ShoppingBag,
  Clock3,
  BarChart3,
  Trash,
  Star,
  Shield
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
  type: 'success' | 'error' | 'info';
}

type TimeRange = 'today' | 'week' | 'month' | 'year';
type ModalType = 'room' | 'cottage' | 'menu' | null;

export default function Admin({ isLoggedIn, userRole }: AdminProps) {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'rooms' | 'menu' | 'bookings' | 'orders'>('dashboard');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'>('all');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<'all' | string>('all');
  const [analyticsRange, setAnalyticsRange] = useState<TimeRange>('month');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    itemId: string;
    itemName: string;
    type: 'room' | 'menu' | 'booking' | 'order';
  }>({ isOpen: false, itemId: '', itemName: '', type: 'room' });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showTabScroll, setShowTabScroll] = useState(false);
  const [previousCounts, setPreviousCounts] = useState({ bookings: 0, orders: 0 });

  const [formData, setFormData] = useState({
    name: '',
    price_per_night: 0,
    capacity: 1,
    status: 'available' as 'available' | 'booked' | 'closed' | 'maintenance',
    image_url: '',
    description: '',
    quantity: 1,
    category: 'appetizers' as MenuItem['category'],
    price: 0,
    available: true,
    is_featured: false,
    is_bestseller: false,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
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

  useEffect(() => {
    if (previousCounts.bookings > 0 && bookings.length > previousCounts.bookings) {
      const newCount = bookings.length - previousCounts.bookings;
      showToast(`${newCount} new booking${newCount > 1 ? 's' : ''} received!`, 'info');
    }
    if (previousCounts.orders > 0 && orders.length > previousCounts.orders) {
      const newCount = orders.length - previousCounts.orders;
      showToast(`${newCount} new order${newCount > 1 ? 's' : ''} received!`, 'info');
    }
    setPreviousCounts({ bookings: bookings.length, orders: orders.length });
  }, [bookings.length, orders.length]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setUpdateError(null);
      const [roomsRes, cottagesRes, menuRes, bookingsRes, ordersRes, usersRes] =
        await Promise.all([
          supabase.from('rooms').select('*'),
          supabase.from('cottages').select('*'),
          supabase.from('menu_items').select('*'),
          supabase.from('full_bookings').select('*').order('created_at', { ascending: false }),
          supabase.from('full_order_tracking').select('*').order('created_at', { ascending: false }),
          supabase.from('users').select('id, name, email'),
        ]);
      if (roomsRes.data) setRooms(roomsRes.data);
      if (cottagesRes.data) setCottages(cottagesRes.data);
      if (menuRes.data) setMenu(menuRes.data);
      if (bookingsRes.data) {
        const usersMap = new Map();
        if (usersRes.data) {
          usersRes.data.forEach((u: any) => usersMap.set(u.id, u));
        }
        const processedBookings = bookingsRes.data.map((b: any) => ({
          ...b,
          username: b.username || usersMap.get(b.guest_id)?.name || 'Guest',
          user_email: b.user_email || usersMap.get(b.guest_id)?.email || '',
          cottage_name: b.cottage_name || b.accommodation_name || '',
          room_name: b.room_name || b.accommodation_name || '',
        }));
        setBookings(processedBookings);
      }
      if (ordersRes.data) {
        const usersMap = new Map();
        if (usersRes.data) {
          usersRes.data.forEach((u: any) => usersMap.set(u.id, u));
        }
        const menuMap = new Map();
        if (menuRes.data) {
          menuRes.data.forEach((m: any) => menuMap.set(m.id, m));
        }
        const processedOrders = ordersRes.data.map((o: any) => {
          const user = usersMap.get(o.guest_id);
          const menuItem = menuMap.get(o.menu_item_id);
          return {
            ...o,
            username: o.username || user?.name || 'Unknown',
            user_email: o.user_email || user?.email || '',
            product_name: o.product_name || menuItem?.name || 'N/A',
            category: o.category || menuItem?.category || 'N/A',
            quantity: o.quantity || 1,
          };
        });
        setOrders(processedOrders);
      }
      if (bookingsRes.error) console.error('Bookings fetch error:', bookingsRes.error);
      if (ordersRes.error) console.error('Orders fetch error:', ordersRes.error);
    } catch (error) {
      console.error('Error fetching data:', error);
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
          showToast('Room deleted successfully');
        } else throw error;
      } else if (type === 'menu') {
        const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
        if (!error) {
          setMenu(menu.filter((m) => m.id !== itemId));
          showToast('Menu item deleted successfully');
        } else throw error;
      } else if (type === 'booking') {
        const { error } = await supabase.from('bookings').delete().eq('reference_number', itemId);
        if (!error) {
          setBookings(bookings.filter((b) => b.reference_number !== itemId));
          showToast('Booking deleted successfully');
        } else throw error;
      } else if (type === 'order') {
        const { error } = await supabase.from('orders').delete().eq('id', itemId);
        if (!error) {
          setOrders(orders.filter((o) => o.id !== itemId));
          showToast('Order deleted successfully');
        } else throw error;
      }
    } catch (err: any) {
      showToast(`Failed to delete: ${err.message}`, 'error');
    }
    closeDeleteModal();
  };

  const handleUpdateBookingStatus = async (referenceNumber: string, newStatus: string) => {
    setUpdateError(null);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('reference_number', referenceNumber)
        .select();
      if (error) {
        setUpdateError(`Booking update failed: ${error.message}`);
        showToast(`Failed to update booking: ${error.message}`, 'error');
        return;
      }
      setBookings(prev => 
        prev.map((b) => (b.reference_number === referenceNumber ? { ...b, status: newStatus } : b))
      );
      showToast(`Booking status updated to ${newStatus}`);
    } catch (err: any) {
      setUpdateError(`Unexpected error: ${err.message}`);
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdateError(null);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select();
      if (error) {
        setUpdateError(`Order update failed: ${error.message}`);
        showToast(`Failed to update order: ${error.message}`, 'error');
        return;
      }
      setOrders(prev => 
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      setUpdateError(`Unexpected error: ${err.message}`);
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const openEditModal = (item: any, type: ModalType) => {
    setEditingItem(item);
    setModalType(type);
    if (type === 'room' || type === 'cottage') {
      setFormData({
        name: item.name || '',
        price_per_night: item.price_per_night || 0,
        capacity: item.capacity || 1,
        status: item.status || 'available',
        image_url: item.image_url || '',
        description: item.description || '',
        quantity: item.quantity || 1,
        category: 'appetizers',
        price: 0,
        available: true,
        is_featured: false,
        is_bestseller: false,
      });
    } else {
      setFormData({
        name: item.name || '',
        price: item.price || 0,
        category: item.category || 'appetizers',
        image_url: item.image_url || '',
        description: item.description || '',
        available: item.available !== false,
        is_featured: item.is_featured || false,
        is_bestseller: item.is_bestseller || false,
        price_per_night: 0,
        capacity: 1,
        status: 'available',
        quantity: 1,
      });
    }
    setShowModal(true);
  };

  const openAddModal = (type: ModalType) => {
    setEditingItem(null);
    setModalType(type);
    setFormData({
      name: '',
      price_per_night: 0,
      capacity: 1,
      status: 'available',
      image_url: '',
      description: '',
      quantity: 1,
      category: 'appetizers',
      price: 0,
      available: true,
      is_featured: false,
      is_bestseller: false,
    });
    setShowModal(true);
  };

  const handleSaveItem = async () => {
    try {
      if (modalType === 'room') {
        const data = {
          name: formData.name,
          price_per_night: Number(formData.price_per_night),
          capacity: Number(formData.capacity),
          status: formData.status,
          image_url: formData.image_url,
          description: formData.description,
          quantity: Number(formData.quantity),
          room_type: 'standard' as const,
        };
        if (editingItem) {
          const { error } = await supabase.from('rooms').update(data).eq('id', editingItem.id);
          if (error) throw error;
          setRooms(prev => prev.map(r => r.id === editingItem.id ? { ...r, ...data } : r));
          showToast('Room updated successfully');
        } else {
          const { data: newItem, error } = await supabase.from('rooms').insert(data).select().single();
          if (error) throw error;
          setRooms(prev => [...prev, newItem]);
          showToast('Room added successfully');
        }
      } else if (modalType === 'cottage') {
        const data = {
          name: formData.name,
          price_per_night: Number(formData.price_per_night),
          capacity: Number(formData.capacity),
          status: formData.status,
          image_url: formData.image_url,
          description: formData.description,
          quantity: Number(formData.quantity),
          cottage_type: 'small' as const,
        };
        if (editingItem) {
          const { error } = await supabase.from('cottages').update(data).eq('id', editingItem.id);
          if (error) throw error;
          setCottages(prev => prev.map(c => c.id === editingItem.id ? { ...c, ...data } : c));
          showToast('Cottage updated successfully');
        } else {
          const { data: newItem, error } = await supabase.from('cottages').insert(data).select().single();
          if (error) throw error;
          setCottages(prev => [...prev, newItem]);
          showToast('Cottage added successfully');
        }
      } else if (modalType === 'menu') {
        const data = {
          name: formData.name,
          price: Number(formData.price),
          category: formData.category,
          image_url: formData.image_url,
          description: formData.description,
          available: formData.available,
          is_featured: formData.is_featured,
          is_bestseller: formData.is_bestseller,
        };
        if (editingItem) {
          const { error } = await supabase.from('menu_items').update(data).eq('id', editingItem.id);
          if (error) throw error;
          setMenu(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...data } : m));
          showToast('Menu item updated successfully');
        } else {
          const { data: newItem, error } = await supabase.from('menu_items').insert(data).select().single();
          if (error) throw error;
          setMenu(prev => [...prev, newItem]);
          showToast('Menu item added successfully');
        }
      }
      setShowModal(false);
      setEditingItem(null);
    } catch (err: any) {
      showToast(`Failed to save: ${err.message}`, 'error');
    }
  };

  const getMenuOrderCount = (menuItemId: string) => {
    return orders.filter(o => o.menu_item_id === menuItemId && o.status === 'completed').length;
  };

  const getTopBestsellers = () => {
    const orderCounts = new Map<string, number>();
    orders.filter(o => o.status === 'completed').forEach(o => {
      if (o.menu_item_id) {
        orderCounts.set(o.menu_item_id, (orderCounts.get(o.menu_item_id) || 0) + (o.quantity || 1));
      }
    });
    return Array.from(orderCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);
  };

  const getDateRange = (range: TimeRange) => {
    const now = new Date();
    const start = new Date(now);
    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    return { start, end: now };
  };

  const analytics = useMemo(() => {
    const { start, end } = getDateRange(analyticsRange);
    const periodBookings = bookings.filter(b => {
      const d = new Date(b.created_at || '');
      return d >= start && d <= end;
    });
    const periodOrders = orders.filter(o => {
      const d = new Date(o.created_at || '');
      return d >= start && d <= end;
    });
    const bookingRevenue = periodBookings
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.total_price || 0), 0);
    const orderRevenue = periodOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalRevenue = bookingRevenue + orderRevenue;
    const periodLength = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodLength);
    const prevEnd = new Date(start.getTime());
    const prevBookings = bookings.filter(b => {
      const d = new Date(b.created_at || '');
      return d >= prevStart && d <= prevEnd;
    });
    const prevOrders = orders.filter(o => {
      const d = new Date(o.created_at || '');
      return d >= prevStart && d <= prevEnd;
    });
    const prevRevenue = prevBookings.filter(b => b.status === 'completed' || b.status === 'confirmed').reduce((s, b) => s + (b.total_price || 0), 0)
      + prevOrders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.total_amount || 0), 0);
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const dailyData: Record<string, { bookings: number; orders: number; total: number }> = {};
    const days = Math.min(Math.ceil(periodLength / (1000 * 60 * 60 * 24)), 7);
    for (let i = 0; i < days; i++) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyData[key] = { bookings: 0, orders: 0, total: 0 };
    }
    periodBookings.filter(b => b.status === 'completed' || b.status === 'confirmed').forEach(b => {
      const key = (b.created_at || '').split('T')[0];
      if (dailyData[key]) {
        dailyData[key].bookings += b.total_price || 0;
        dailyData[key].total += b.total_price || 0;
      }
    });
    periodOrders.filter(o => o.status === 'completed').forEach(o => {
      const key = (o.created_at || '').split('T')[0];
      if (dailyData[key]) {
        dailyData[key].orders += o.total_amount || 0;
        dailyData[key].total += o.total_amount || 0;
      }
    });
    const chartData = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date,
        bookings: data.bookings,
        orders: data.orders,
        total: data.total
      }));
    return {
      totalRevenue,
      bookingRevenue,
      orderRevenue,
      totalBookings: periodBookings.length,
      totalOrders: periodOrders.length,
      revenueChange,
      chartData,
      avgBookingValue: periodBookings.length > 0 ? bookingRevenue / periodBookings.length : 0,
      avgOrderValue: periodOrders.length > 0 ? orderRevenue / periodOrders.length : 0
    };
  }, [bookings, orders, analyticsRange]);

  const getUserOrders = (guestId: string) => {
    return orders.filter(o => o.guest_id === guestId);
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
      (booking.room_name || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (booking.accommodation_name || '').toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesFilter = bookingFilter === 'all' || booking.status === bookingFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.username || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
      (order.product_name || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.reference_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (order.category || '').toLowerCase().includes(orderSearch.toLowerCase());
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    return matchesSearch && matchesFilter;
  });

  const menuCategories = ['all', ...new Set(menu.map(item => item.category))];
  const recentBookings = bookings.slice(0, 5);
  const recentOrders = orders.slice(0, 5);
  const todayRevenue = bookings
    .filter(b => {
      const bookingDate = new Date(b.created_at || '');
      const today = new Date();
      return (b.status === 'completed' || b.status === 'confirmed') && 
        bookingDate.toDateString() === today.toDateString();
    })
    .reduce((sum, b) => sum + (b.total_price || 0), 0);
  const canDeleteBooking = (status: string) => status === 'completed' || status === 'cancelled';
  const canDeleteOrder = (status: string) => status === 'completed' || status === 'cancelled';
  const bestsellerIds = getTopBestsellers();

  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-palacio-obsidian px-4">
        <div className="relative p-8 md:p-12 text-center max-w-lg w-full rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-palacio-bronze/10 border border-palacio-bronze/30 flex items-center justify-center mx-auto mb-6">
            <Shield size={28} className="text-palacio-bronze" />
          </div>
          <span className="text-[10px] font-cinzel tracking-[0.25em] uppercase text-palacio-bronze block mb-2 font-semibold">
            Executive Portal
          </span>
          <h2 className="font-playfair text-3xl text-palacio-alabaster mb-3">
            Admin Access Required
          </h2>
          <p className="text-palacio-alabaster/70 text-sm leading-relaxed mb-8 font-light">
            {!isLoggedIn 
              ? 'Please sign in with your authorized administrator credentials to manage resort operations.' 
              : 'Your current account does not have administrator privileges to access executive management.'}
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-palacio-bronze text-palacio-obsidian rounded-lg font-cinzel text-xs font-semibold uppercase tracking-wider hover:bg-palacio-gold shadow-xl transition-all"
          >
            Return to Sanctuary
          </a>
        </div>
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
                : toast.type === 'info'
                ? 'bg-blue-900/90 border border-blue-500 text-blue-100'
                : 'bg-red-900/90 border border-red-500 text-red-100'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : toast.type === 'info' ? <Bell size={18} /> : <AlertTriangle size={18} />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-palacio-bronze/10 border border-palacio-bronze/20 rounded-full mb-3">
            <Shield size={13} className="text-palacio-bronze" />
            <span className="text-[10px] font-cinzel tracking-[0.25em] uppercase text-palacio-bronze font-semibold">
              Executive Console
            </span>
          </div>
          <h1 className="font-playfair font-normal text-3xl md:text-5xl text-palacio-alabaster">
            Resort Operations
          </h1>
          <p className="text-palacio-alabaster/60 font-poppins text-xs md:text-sm mt-1 font-light">
            Real-time management for suites, culinary orders, guest reservations, and inventory.
          </p>
        </div>

        {updateError && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle size={16} />
            {updateError}
          </div>
        )}

        <div className="relative mb-8">
          <div 
            id="admin-tabs"
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
          >
            {[
              { value: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { value: 'rooms', label: 'Suites & Villas', icon: BedDouble },
              { value: 'menu', label: 'Culinary Menu', icon: UtensilsCrossed },
              { value: 'bookings', label: 'Reservations', icon: Calendar },
              { value: 'orders', label: 'Dining Orders', icon: ShoppingBag },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setCurrentTab(tab.value as any)}
                className={`px-4 py-2.5 rounded-lg font-cinzel text-xs tracking-wider uppercase smooth-transition whitespace-nowrap flex items-center gap-2 border ${
                  currentTab === tab.value
                    ? 'bg-palacio-bronze text-palacio-obsidian font-bold border-palacio-bronze shadow-md'
                    : 'bg-white/[0.03] text-palacio-alabaster/70 border-white/[0.08] hover:bg-white/[0.06] hover:text-palacio-alabaster'
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
                    { val: menu.length, label: 'Menu Offerings' },
                    { val: bookings.filter(b => b.status === 'pending').length, label: 'Pending Bookings' },
                    { val: orders.filter(o => o.status === 'pending').length, label: 'Pending Orders' },
                  ].map((s, i) => (
                    <div key={i} className="p-4 md:p-6 text-center rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-palacio-bronze/40 transition-all shadow-lg">
                      <div className="text-2xl md:text-3xl font-cinzel text-palacio-bronze mb-1 font-bold">{s.val}</div>
                      <p className="text-palacio-alabaster/60 text-xs uppercase tracking-wider font-cinzel">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                    <div className="flex items-center gap-2.5">
                      <BarChart3 size={18} className="text-palacio-bronze" />
                      <h3 className="font-playfair text-xl text-palacio-alabaster">Executive Analytics</h3>
                    </div>
                    <div className="flex gap-2">
                      {(['today','week','month','year'] as TimeRange[]).map(r => (
                        <button key={r} onClick={() => setAnalyticsRange(r)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-cinzel tracking-wider uppercase smooth-transition ${
                            analyticsRange === r 
                              ? 'bg-palacio-bronze text-palacio-obsidian font-bold shadow-md' 
                              : 'bg-white/[0.04] text-palacio-alabaster/60 hover:text-palacio-alabaster border border-white/[0.06]'
                          }`}>
                          {r === 'today' ? 'Today' : r === 'week' ? '7D' : r === 'month' ? '30D' : '1Y'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-black/30 rounded-lg p-4 border border-white/[0.06]">
                      <p className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase tracking-wider mb-1">Total Revenue</p>
                      <p className="text-2xl font-cinzel text-palacio-bronze font-bold">${analytics.totalRevenue.toLocaleString()}</p>
                      <p className={`text-xs font-medium mt-1 ${analytics.revenueChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {analytics.revenueChange >= 0 ? '▲' : '▼'} {Math.abs(analytics.revenueChange).toFixed(1)}% vs previous
                      </p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 border border-white/[0.06]">
                      <p className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase tracking-wider mb-1">Booking Revenue</p>
                      <p className="text-2xl font-cinzel text-palacio-bronze font-bold">${analytics.bookingRevenue.toLocaleString()}</p>
                      <p className="text-palacio-alabaster/50 text-xs mt-1">{analytics.totalBookings} reservations</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4 border border-white/[0.06]">
                      <p className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase tracking-wider mb-1">Dining Orders Revenue</p>
                      <p className="text-2xl font-cinzel text-palacio-bronze font-bold">${analytics.orderRevenue.toLocaleString()}</p>
                      <p className="text-palacio-alabaster/50 text-xs mt-1">{analytics.totalOrders} dining orders</p>
                    </div>
                  </div>

                  {analytics.chartData.length > 0 && (
                    <div className="mb-6">
                      <p className="text-palacio-alabaster/60 font-cinzel text-xs uppercase tracking-wider mb-3">Revenue Trend (Last 7 Days)</p>
                      <div className="flex items-end gap-2 h-28 pt-2">
                        {analytics.chartData.map((day, i) => {
                          const maxVal = Math.max(...analytics.chartData.map(d => d.total), 1);
                          const h = maxVal > 0 ? (day.total / maxVal) * 100 : 0;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                              <div className="text-[10px] text-palacio-bronze font-mono font-medium">${Math.round(day.total)}</div>
                              <div className="w-full bg-white/[0.06] rounded-t-sm relative h-full flex items-end">
                                <div 
                                  className="w-full bg-palacio-bronze rounded-t-sm hover:brightness-110 transition-all" 
                                  style={{ height: `${Math.max(h, 6)}%` }} 
                                />
                              </div>
                              <div className="text-[9px] text-palacio-alabaster/50 font-cinzel">{day.date.split(' ')[0]}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.08]">
                    <div className="flex justify-between items-center">
                      <span className="text-palacio-alabaster/60 font-cinzel text-xs uppercase">Avg Booking Value</span>
                      <span className="text-palacio-bronze font-cinzel font-bold text-sm">${analytics.avgBookingValue.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-palacio-alabaster/60 font-cinzel text-xs uppercase">Avg Order Value</span>
                      <span className="text-palacio-bronze font-cinzel font-bold text-sm">${analytics.avgOrderValue.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign size={18} className="text-palacio-bronze" />
                      <h3 className="font-playfair text-lg text-palacio-alabaster">Revenue Overview</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Today's Revenue", val: todayRevenue },
                        { label: 'This Month (Bookings)', val: analytics.bookingRevenue },
                        { label: 'This Month (Orders)', val: analytics.orderRevenue },
                      ].map((r, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-palacio-alabaster/70 font-cinzel uppercase tracking-wider">{r.label}</span>
                          <span className="text-palacio-bronze font-bold font-cinzel text-sm">${r.val.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6 shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <BedDouble size={18} className="text-palacio-bronze" />
                      <h3 className="font-playfair text-lg text-palacio-alabaster">Occupancy Rate</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-palacio-alabaster/70 font-cinzel uppercase tracking-wider">Occupied Suites</span>
                        <span className="text-palacio-bronze font-bold font-cinzel text-sm">
                          {bookings.filter(b => b.status === 'confirmed').length} / {rooms.length + cottages.length}
                        </span>
                      </div>
                      <div className="w-full bg-white/[0.06] rounded-full h-2">
                        <div className="bg-palacio-bronze h-2 rounded-full transition-all duration-700" style={{
                          width: `${Math.min(100, (bookings.filter(b => b.status === 'confirmed').length / (rooms.length + cottages.length || 1)) * 100)}%`
                        }} />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-palacio-alabaster/50 font-cinzel uppercase">Capacity Utilization</span>
                        <span className="text-palacio-bronze font-bold font-cinzel">
                          {((bookings.filter(b => b.status === 'confirmed').length / (rooms.length + cottages.length || 1)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-playfair text-xl text-palacio-alabaster flex items-center gap-2">
                      <Clock3 size={16} className="text-palacio-bronze" /> Recent Reservations
                    </h3>
                    <button onClick={() => setCurrentTab('bookings')} className="text-palacio-bronze text-xs font-cinzel tracking-wider uppercase hover:text-palacio-alabaster transition-colors">
                      View All →
                    </button>
                  </div>
                  {recentBookings.length === 0 ? (
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-8 text-center">
                      <p className="text-palacio-alabaster/50 text-xs font-cinzel uppercase">No recent bookings recorded</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {recentBookings.map(b => (
                        <div key={b.reference_number} className="bg-white/[0.03] border border-white/[0.08] hover:border-palacio-bronze/30 rounded-xl p-4 transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-palacio-alabaster font-medium text-sm">{b.username || 'Guest'}</p>
                              <p className="text-palacio-alabaster/60 text-xs mt-0.5">{b.cottage_name || b.room_name || b.accommodation_name || 'N/A'}</p>
                              <p className="text-palacio-alabaster/40 font-mono text-xs">{b.check_in_date} → {b.check_out_date}</p>
                            </div>
                            <div className="text-right">
                              <StatusBadge status={b.status} size="sm" />
                              <p className="text-palacio-bronze font-cinzel font-bold text-sm mt-1.5">${b.total_price}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-playfair text-xl text-palacio-alabaster flex items-center gap-2">
                      <ShoppingBag size={16} className="text-palacio-bronze" /> Recent Culinary Orders
                    </h3>
                    <button onClick={() => setCurrentTab('orders')} className="text-palacio-bronze text-xs font-cinzel tracking-wider uppercase hover:text-palacio-alabaster transition-colors">
                      View All →
                    </button>
                  </div>
                  {recentOrders.length === 0 ? (
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-8 text-center">
                      <p className="text-palacio-alabaster/50 text-xs font-cinzel uppercase">No recent dining orders recorded</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {recentOrders.map(o => (
                        <div key={o.id} className="bg-white/[0.03] border border-white/[0.08] hover:border-palacio-bronze/30 rounded-xl p-4 transition-all">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-palacio-alabaster font-medium text-sm">
                                {o.product_name || o.reference_number || 'Order'}
                              </p>
                              <p className="text-palacio-alabaster/60 text-xs mt-0.5">
                                {o.username || o.user_email || 'Guest'}
                              </p>
                              <p className="text-palacio-alabaster/40 text-xs">
                                Qty: {o.quantity || 1} · ${o.total_amount}
                                {o.order_type && ` · ${o.order_type === 'dine_in' ? 'Dine-in' : 'Room Delivery'}`}
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
                  <div className="flex gap-3">
                    <button 
                      onClick={() => openAddModal('room')} 
                      className="px-4 py-2.5 bg-palacio-bronze text-palacio-obsidian rounded-lg font-cinzel text-xs font-semibold uppercase tracking-wider hover:bg-palacio-gold shadow-md flex items-center gap-2 transition-all"
                    >
                      <Plus size={15} />
                      Add Room
                    </button>
                    <button 
                      onClick={() => openAddModal('cottage')} 
                      className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.1] text-palacio-alabaster rounded-lg font-cinzel text-xs font-semibold uppercase tracking-wider hover:bg-white/[0.08] hover:border-palacio-bronze/50 shadow-md flex items-center gap-2 transition-all"
                    >
                      <Plus size={15} />
                      Add Cottage
                    </button>
                  </div>
                  
                  <div className="relative w-full sm:w-64">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-palacio-bronze/60" />
                    <input
                      type="text"
                      placeholder="Search suites & villas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-palacio-alabaster text-xs placeholder-palacio-alabaster/40 focus:border-palacio-bronze/50 outline-none transition-all"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-palacio-alabaster/40 hover:text-palacio-alabaster"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {filteredRooms.length === 0 ? (
                  <div className="p-12 text-center rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <BedDouble size={36} className="text-palacio-alabaster/30 mx-auto mb-3" />
                    <p className="text-palacio-alabaster text-base mb-1 font-playfair">No accommodations found</p>
                    <p className="text-palacio-alabaster/50 text-xs font-cinzel">
                      {searchQuery ? 'Try adjusting your search criteria' : 'Create your first luxury suite or villa to get started'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRooms.map((item) => (
                      <div key={item.id} className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-palacio-bronze/40 transition-all shadow-md">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-playfair text-lg text-palacio-alabaster">
                                {item.name}
                              </h3>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-cinzel font-semibold uppercase ${
                                (item.quantity || 0) > 0 
                                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                              }`}>
                                {(item.quantity || 0) > 0 ? `${item.quantity} available` : 'Fully Reserved'}
                              </span>
                            </div>
                            <p className="text-palacio-alabaster/60 text-xs">
                              <span className="text-palacio-bronze font-cinzel font-bold text-sm">${item.price_per_night}</span> / night • Capacity: {item.capacity} guests
                            </p>
                            <div className="mt-2.5">
                              <StatusBadge status={item.status} size="sm" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(item, 'room')}
                              className="p-2 hover:bg-white/[0.08] text-palacio-bronze hover:text-palacio-alabaster rounded-lg smooth-transition"
                              title="Edit Accommodation"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(item.id, item.name, 'room')}
                              className="p-2 hover:bg-rose-950/40 text-rose-400 rounded-lg smooth-transition"
                              title="Delete Accommodation"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentTab === 'menu' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <button 
                    onClick={() => openAddModal('menu')} 
                    className="px-4 py-2.5 bg-palacio-bronze text-palacio-obsidian rounded-lg font-cinzel text-xs font-semibold uppercase tracking-wider hover:bg-palacio-gold shadow-md flex items-center gap-2 transition-all"
                  >
                    <Plus size={15} />
                    Add Menu Item
                  </button>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <select
                      value={menuCategoryFilter}
                      onChange={(e) => setMenuCategoryFilter(e.target.value)}
                      className="px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-palacio-alabaster text-xs focus:border-palacio-bronze/50 outline-none"
                    >
                      {menuCategories.map(cat => (
                        <option key={cat} value={cat} className="bg-palacio-obsidian text-palacio-alabaster">
                          {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>

                    <div className="relative flex-1 sm:w-48">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-palacio-bronze/60" />
                      <input
                        type="text"
                        placeholder="Search menu..."
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-palacio-alabaster text-xs placeholder-palacio-alabaster/40 focus:border-palacio-bronze/50 outline-none transition-all"
                      />
                      {menuSearch && (
                        <button 
                          onClick={() => setMenuSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-palacio-alabaster/40 hover:text-palacio-alabaster"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {filteredMenu.length === 0 ? (
                  <div className="p-12 text-center rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <UtensilsCrossed size={36} className="text-palacio-alabaster/30 mx-auto mb-3" />
                    <p className="text-palacio-alabaster text-base mb-1 font-playfair">No culinary items found</p>
                    <p className="text-palacio-alabaster/50 text-xs font-cinzel">
                      {menuSearch || menuCategoryFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first menu offering'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMenu.map((item) => {
                      const orderCount = getMenuOrderCount(item.id);
                      const isBestseller = bestsellerIds.includes(item.id);
                      return (
                        <div key={item.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-palacio-bronze/40 group transition-all shadow-md flex flex-col justify-between">
                          <div>
                            <div className="relative overflow-hidden rounded-lg mb-3 h-36">
                              <img
                                src={item.image_url || '/placeholder-food.jpg'}
                                alt={item.name}
                                className="w-full h-full object-cover smooth-transition group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';
                                }}
                              />
                              {isBestseller && (
                                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-palacio-bronze text-palacio-obsidian rounded-full text-[10px] font-cinzel font-bold flex items-center gap-1 shadow-md">
                                  <Star size={10} className="fill-palacio-obsidian" /> BESTSELLER
                                </div>
                              )}
                              {!item.available && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                  <span className="text-rose-400 font-cinzel text-xs font-bold uppercase tracking-wider">Unavailable</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-playfair text-palacio-alabaster font-normal text-base group-hover:text-palacio-bronze transition-colors">
                                {item.name}
                              </h3>
                              <span className="text-palacio-alabaster/50 text-xs font-cinzel">
                                {orderCount} orders
                              </span>
                            </div>
                            <p className="text-palacio-alabaster/50 text-xs mb-2 capitalize">
                              {item.category}
                            </p>
                            <p className="font-cinzel text-palacio-bronze mb-4 font-bold text-base">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex gap-2 pt-3 border-t border-white/[0.06]">
                            <button
                              onClick={() => openEditModal(item, 'menu')}
                              className="flex-1 py-1.5 px-2 bg-white/[0.04] hover:bg-white/[0.08] text-palacio-bronze rounded text-xs font-cinzel uppercase tracking-wider smooth-transition flex items-center justify-center gap-1.5"
                            >
                              <Edit2 size={13} />
                              Edit
                            </button>
                            <button
                              onClick={() => openDeleteModal(item.id, item.name, 'menu')}
                              className="flex-1 py-1.5 px-2 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 rounded text-xs font-cinzel uppercase tracking-wider smooth-transition flex items-center justify-center gap-1.5"
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {currentTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex gap-3">
                    <select
                      value={bookingFilter}
                      onChange={(e) => setBookingFilter(e.target.value as any)}
                      className="px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-palacio-alabaster text-xs focus:border-palacio-bronze/50 outline-none"
                    >
                      <option value="all" className="bg-palacio-obsidian text-palacio-alabaster">All Statuses</option>
                      <option value="pending" className="bg-palacio-obsidian text-palacio-alabaster">Pending</option>
                      <option value="confirmed" className="bg-palacio-obsidian text-palacio-alabaster">Confirmed</option>
                      <option value="cancelled" className="bg-palacio-obsidian text-palacio-alabaster">Cancelled</option>
                      <option value="completed" className="bg-palacio-obsidian text-palacio-alabaster">Completed</option>
                    </select>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-palacio-bronze/60" />
                    <input
                      type="text"
                      placeholder="Search by guest, ref, or room..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-palacio-alabaster text-xs placeholder-palacio-alabaster/40 focus:border-palacio-bronze/50 outline-none transition-all"
                    />
                    {bookingSearch && (
                      <button 
                        onClick={() => setBookingSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-palacio-alabaster/40 hover:text-palacio-alabaster"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="p-12 text-center rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <Calendar size={36} className="text-palacio-alabaster/30 mx-auto mb-3" />
                    <p className="text-palacio-alabaster text-base mb-1 font-playfair">No reservations found</p>
                    <p className="text-palacio-alabaster/50 text-xs font-cinzel">
                      {bookingSearch || bookingFilter !== 'all' ? 'Try adjusting your filters' : 'No guest reservations recorded yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => {
                      const userOrders = getUserOrders(booking.guest_id || '');
                      const hasOrders = userOrders.length > 0;
                      const pendingOrders = userOrders.filter(o => o.status === 'pending').length;
                      const showDelete = canDeleteBooking(booking.status);

                      return (
                        <div key={booking.reference_number} className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-palacio-bronze/30 transition-all shadow-md">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-palacio-bronze/10 border border-palacio-bronze/20 flex items-center justify-center">
                                <Bell size={18} className="text-palacio-bronze" />
                              </div>
                              <div>
                                <h3 className="font-playfair text-lg text-palacio-alabaster">
                                  Reservation #{booking.reference_number}
                                </h3>
                                <p className="text-palacio-alabaster/50 text-xs font-cinzel">
                                  {booking.created_at ? new Date(booking.created_at).toLocaleString() : 'Recently'}
                                </p>
                              </div>
                            </div>
                            {showDelete && (
                              <button
                                onClick={() => openDeleteModal(booking.reference_number, `Booking ${booking.reference_number}`, 'booking')}
                                className="p-2 hover:bg-rose-950/40 text-rose-400 rounded-lg smooth-transition"
                                title="Delete booking"
                              >
                                <Trash size={16} />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 bg-black/30 rounded-lg p-3.5 border border-white/[0.06]">
                            <div className="flex items-center gap-2">
                              <User size={13} className="text-palacio-bronze/60" />
                              <div>
                                <p className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase">Guest</p>
                                <p className="text-palacio-alabaster text-xs font-medium">
                                  {booking.username || 'Guest'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={13} className="text-palacio-bronze/60" />
                              <div>
                                <p className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase">Dates</p>
                                <p className="text-palacio-alabaster font-mono text-xs">
                                  {booking.check_in_date} → {booking.check_out_date}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Home size={13} className="text-palacio-bronze/60" />
                              <div>
                                <p className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase">Accommodation</p>
                                <p className="text-palacio-alabaster text-xs font-medium">
                                  {booking.cottage_name || booking.room_name || booking.accommodation_name || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign size={13} className="text-palacio-bronze/60" />
                              <div>
                                <p className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase">Total</p>
                                <p className="font-cinzel text-palacio-bronze font-bold text-sm">
                                  ${booking.total_price?.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {hasOrders && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <UtensilsCrossed size={13} className="text-palacio-bronze" />
                                <h4 className="font-cinzel text-xs text-palacio-bronze tracking-wider uppercase">
                                  Associated Dining Orders
                                  {pendingOrders > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] rounded-full font-bold">
                                      {pendingOrders} pending
                                    </span>
                                  )}
                                </h4>
                              </div>
                              <div className="space-y-1.5">
                                {userOrders.map((order) => (
                                  <div 
                                    key={order.id} 
                                    className="flex items-center justify-between bg-black/40 rounded-lg p-2.5 text-xs border border-white/[0.06]"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-palacio-alabaster font-medium">{order.product_name}</span>
                                      <span className="text-palacio-alabaster/50">×{order.quantity}</span>
                                      <span className="text-palacio-bronze font-mono font-medium">${order.total_amount?.toFixed(2)}</span>
                                    </div>
                                    <select
                                      value={order.status}
                                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                      className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.1] rounded text-palacio-bronze text-xs font-cinzel focus:border-palacio-bronze/50 outline-none cursor-pointer"
                                    >
                                      <option value="pending" className="bg-palacio-obsidian">Pending</option>
                                      <option value="preparing" className="bg-palacio-obsidian">Preparing</option>
                                      <option value="ready" className="bg-palacio-obsidian">Ready</option>
                                      <option value="completed" className="bg-palacio-obsidian">Completed</option>
                                      <option value="cancelled" className="bg-palacio-obsidian">Cancelled</option>
                                    </select>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                            <p className="text-palacio-alabaster/40 text-xs font-mono">
                              Ref: {booking.reference_number}
                            </p>
                            <div className="flex items-center gap-2">
                              <select
                                value={booking.status}
                                onChange={(e) => handleUpdateBookingStatus(booking.reference_number, e.target.value)}
                                className="px-3 py-1.5 bg-palacio-bronze/10 border border-palacio-bronze/30 rounded text-palacio-bronze font-cinzel text-xs uppercase tracking-wider focus:border-palacio-bronze/50 outline-none cursor-pointer font-semibold"
                              >
                                <option value="pending" className="bg-palacio-obsidian">Pending</option>
                                <option value="confirmed" className="bg-palacio-obsidian">Confirmed</option>
                                <option value="cancelled" className="bg-palacio-obsidian">Cancelled</option>
                                <option value="completed" className="bg-palacio-obsidian">Completed</option>
                              </select>
                            </div>
                          </div>
                        </div>
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
                    <select
                      value={orderFilter}
                      onChange={(e) => setOrderFilter(e.target.value as any)}
                      className="px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-palacio-alabaster text-xs focus:border-palacio-bronze/50 outline-none"
                    >
                      <option value="all" className="bg-palacio-obsidian text-palacio-alabaster">All Statuses</option>
                      <option value="pending" className="bg-palacio-obsidian text-palacio-alabaster">Pending</option>
                      <option value="preparing" className="bg-palacio-obsidian text-palacio-alabaster">Preparing</option>
                      <option value="ready" className="bg-palacio-obsidian text-palacio-alabaster">Ready</option>
                      <option value="completed" className="bg-palacio-obsidian text-palacio-alabaster">Completed</option>
                      <option value="cancelled" className="bg-palacio-obsidian text-palacio-alabaster">Cancelled</option>
                    </select>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-palacio-bronze/60" />
                    <input
                      type="text"
                      placeholder="Search by customer, product..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-palacio-alabaster text-xs placeholder-palacio-alabaster/40 focus:border-palacio-bronze/50 outline-none transition-all"
                    />
                    {orderSearch && (
                      <button 
                        onClick={() => setOrderSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-palacio-alabaster/40 hover:text-palacio-alabaster"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="p-12 text-center rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <ShoppingBag size={36} className="text-palacio-alabaster/30 mx-auto mb-3" />
                    <p className="text-palacio-alabaster text-base mb-1 font-playfair">No dining orders found</p>
                    <p className="text-palacio-alabaster/50 text-xs font-cinzel">
                      {orderSearch || orderFilter !== 'all' ? 'Try adjusting your filters' : 'No guest orders placed yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => {
                      const showDelete = canDeleteOrder(order.status);
                      return (
                        <div key={order.id} className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-palacio-bronze/30 transition-all shadow-md">
                          <div className="flex items-start justify-between mb-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                              <div>
                                <p className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase tracking-wider">Customer</p>
                                <p className="text-palacio-alabaster font-medium text-sm">
                                  {order.username || 'Guest'}
                                </p>
                                <p className="text-palacio-alabaster/40 text-xs">{order.user_email}</p>
                              </div>
                              <div>
                                <p className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase tracking-wider">Reference</p>
                                <p className="font-mono text-palacio-bronze text-xs font-semibold">
                                  #{order.reference_number}
                                </p>
                              </div>
                              <div>
                                <p className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase tracking-wider">Service Type</p>
                                <p className="text-palacio-alabaster text-xs capitalize">
                                  {order.order_type === 'dine_in' ? '🍽️ Dine-in' : '🚪 Room Suite Delivery'}
                                </p>
                              </div>
                              <div>
                                <p className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase tracking-wider">Order Amount</p>
                                <p className="font-cinzel text-palacio-bronze font-bold text-base">
                                  ${order.total_amount?.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase tracking-wider">Selection</p>
                                <p className="text-palacio-alabaster text-xs font-medium">
                                  {order.product_name || 'Item'}
                                </p>
                              </div>
                              <div>
                                <p className="text-palacio-alabaster/50 text-[10px] font-cinzel uppercase tracking-wider">Category</p>
                                <p className="text-palacio-alabaster/60 text-xs capitalize">
                                  {order.category || 'Culinary'}
                                </p>
                              </div>
                            </div>
                            {showDelete && (
                              <button
                                onClick={() => openDeleteModal(order.id, `Order ${order.reference_number}`, 'order')}
                                className="p-2 hover:bg-rose-950/40 text-rose-400 rounded-lg smooth-transition ml-4"
                                title="Delete order"
                              >
                                <Trash size={16} />
                              </button>
                            )}
                          </div>
                          
                          <div className="flex justify-end items-center mt-4 pt-3 border-t border-white/[0.08]">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="px-3 py-1.5 bg-palacio-bronze/10 border border-palacio-bronze/30 rounded text-palacio-bronze font-cinzel text-xs uppercase tracking-wider focus:border-palacio-bronze/50 outline-none cursor-pointer font-semibold"
                            >
                              <option value="pending" className="bg-palacio-obsidian">Pending</option>
                              <option value="preparing" className="bg-palacio-obsidian">Preparing</option>
                              <option value="ready" className="bg-palacio-obsidian">Ready</option>
                              <option value="completed" className="bg-palacio-obsidian">Completed</option>
                              <option value="cancelled" className="bg-palacio-obsidian">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
          setModalType(null);
        }}
        title={editingItem ? 'Edit Offering' : 'Add New Offering'}
        footer={
          <div className="flex gap-3 w-full">
            <button
              onClick={() => {
                setShowModal(false);
                setEditingItem(null);
                setModalType(null);
              }}
              className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] text-palacio-alabaster/70 rounded-lg font-cinzel text-xs uppercase tracking-wider hover:bg-white/[0.08] smooth-transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveItem}
              className="flex-1 px-4 py-2.5 bg-palacio-bronze text-palacio-obsidian rounded-lg font-cinzel text-xs font-semibold uppercase tracking-wider hover:bg-palacio-gold smooth-transition shadow-md"
            >
              Save Changes
            </button>
          </div>
        }
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <p className="text-palacio-alabaster/60 text-xs font-cinzel">
            {editingItem ? `Editing: ${editingItem.name || 'Item'}` : `Create new ${modalType === 'room' ? 'suite' : modalType === 'cottage' ? 'cottage' : 'culinary menu item'}`}
          </p>

          {(modalType === 'room' || modalType === 'cottage') && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-cinzel text-palacio-bronze tracking-widest uppercase block mb-1">Accommodation Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-lg text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none"
                  placeholder="e.g. Royal Oceanfront Villa"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-cinzel text-palacio-bronze tracking-widest uppercase block mb-1">Price/Night ($)</label>
                  <input
                    type="number"
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-lg text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-cinzel text-palacio-bronze tracking-widest uppercase block mb-1">Max Guests</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-lg text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-cinzel text-palacio-bronze tracking-widest uppercase block mb-1">Available Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-lg text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-cinzel text-palacio-bronze tracking-widest uppercase block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-lg text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none"
                  >
                    <option value="available" className="bg-palacio-obsidian">Available</option>
                    <option value="booked" className="bg-palacio-obsidian">Booked</option>
                    <option value="closed" className="bg-palacio-obsidian">Closed</option>
                    <option value="maintenance" className="bg-palacio-obsidian">Maintenance</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-cinzel text-palacio-bronze tracking-widest uppercase block mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-lg text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <div>
                <label className="text-[10px] font-cinzel text-palacio-bronze tracking-widest uppercase block mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-lg text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none h-20 resize-none"
                  placeholder="Editorial description of the accommodation..."
                />
              </div>
            </div>
          )}

          {modalType === 'menu' && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-cinzel text-palacio-bronze tracking-widest uppercase block mb-1">Dish / Beverage Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-lg text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none"
                  placeholder="e.g. Lobster Paella Valenciana"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-cinzel text-palacio-bronze tracking-widest uppercase block mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-lg text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-cinzel text-palacio-bronze tracking-widest uppercase block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-lg text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none"
                  >
                    <option value="appetizers" className="bg-palacio-obsidian">Appetizers</option>
                    <option value="main_course" className="bg-palacio-obsidian">Main Course</option>
                    <option value="seafood" className="bg-palacio-obsidian">Seafood</option>
                    <option value="grilled" className="bg-palacio-obsidian">Grilled</option>
                    <option value="desserts" className="bg-palacio-obsidian">Desserts</option>
                    <option value="cocktails" className="bg-palacio-obsidian">Cocktails</option>
                    <option value="wine" className="bg-palacio-obsidian">Wine</option>
                    <option value="non_alcoholic" className="bg-palacio-obsidian">Refreshments</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-cinzel text-palacio-bronze tracking-widest uppercase block mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-lg text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-[10px] font-cinzel text-palacio-bronze tracking-widest uppercase block mb-1">Culinary Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.1] rounded-lg text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none h-20 resize-none"
                  placeholder="Ingredients and culinary notes..."
                />
              </div>
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4 accent-palacio-bronze"
                  />
                  <span className="text-palacio-alabaster text-xs">Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 accent-palacio-bronze"
                  />
                  <span className="text-palacio-alabaster text-xs">Chef's Special</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_bestseller}
                    onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                    className="w-4 h-4 accent-palacio-bronze"
                  />
                  <span className="text-palacio-alabaster text-xs">Bestseller</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Confirm Removal"
        footer={
          <div className="flex gap-3 w-full">
            <button
              onClick={closeDeleteModal}
              className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] text-palacio-alabaster/70 rounded-lg font-cinzel text-xs uppercase tracking-wider hover:bg-white/[0.08] smooth-transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-lg font-cinzel text-xs font-semibold uppercase tracking-wider hover:bg-rose-700 smooth-transition shadow-md"
            >
              Confirm Delete
            </button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={26} className="text-rose-400" />
          </div>
          <p className="text-palacio-alabaster text-sm mb-2 font-medium">
            Are you sure you wish to delete <span className="text-palacio-bronze font-semibold">"{deleteModal.itemName}"</span>?
          </p>
          <p className="text-palacio-alabaster/50 text-xs font-light">
            This action will permanently remove this record from the database.
          </p>
        </div>
      </Modal>
    </div>
  );
}
