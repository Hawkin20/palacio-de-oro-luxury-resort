import { useState, useEffect } from 'react';
import { Plus, Trash2, CreditCard as Edit2, Bell, Calendar, Clock, User, DollarSign, Home, UtensilsCrossed } from 'lucide-react';
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

  const handleDeleteRoom = async (id: string) => {
    if (!confirm('Delete this room?')) return;
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    if (!error) {
      setRooms(rooms.filter((r) => r.id !== id));
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    if (!error) {
      setMenu(menu.filter((m) => m.id !== id));
    }
  };

  const handleUpdateBookingStatus = async (referenceNumber: string, newStatus: string) => {
    console.log('🔧 Updating booking:', referenceNumber, '→', newStatus);
    setUpdateError(null);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('reference_number', referenceNumber)
        .select();

      if (error) {
        console.error('❌ Booking update error:', error);
        setUpdateError(`Booking update failed: ${error.message}`);
        alert(`Failed to update booking status: ${error.message}`);
        return;
      }

      console.log('✅ Booking update success:', data);
      setBookings(prev => 
        prev.map((b) => (b.reference_number === referenceNumber ? { ...b, status: newStatus } : b))
      );
      await fetchAllData();
      
    } catch (err: any) {
      console.error('❌ Unexpected error:', err);
      setUpdateError(`Unexpected error: ${err.message}`);
      alert(`Error: ${err.message}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    console.log('🔧 Updating order:', orderId, '→', newStatus);
    setUpdateError(null);

    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select();

      if (error) {
        console.error('❌ Order update error:', error);
        setUpdateError(`Order update failed: ${error.message}`);
        alert(`Failed to update order status: ${error.message}`);
        return;
      }

      console.log('✅ Order update success:', data);
      setOrders(prev => 
        prev.map((o) => (o.order_id === orderId ? { ...o, status: newStatus } : o))
      );
      await fetchAllData();
      
    } catch (err: any) {
      console.error('❌ Unexpected error:', err);
      setUpdateError(`Unexpected error: ${err.message}`);
      alert(`Error: ${err.message}`);
    }
  };

  // Helper: Get orders for a specific user/email
  const getUserOrders = (userEmail: string) => {
    return orders.filter(o => o.user_email === userEmail);
  };

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
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-8">Admin Dashboard</h1>

        {/* Error Banner */}
        {updateError && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            ⚠️ {updateError}
          </div>
        )}

        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { value: 'dashboard', label: 'Dashboard' },
            { value: 'rooms', label: 'Rooms & Cottages' },
            { value: 'menu', label: 'Menu' },
            { value: 'bookings', label: 'Bookings' },
            { value: 'orders', label: 'Orders' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setCurrentTab(tab.value as any)}
              className={`px-4 py-2 rounded-lg font-cinzel text-sm smooth-transition whitespace-nowrap ${
                currentTab === tab.value
                  ? 'bg-palacio-gold text-palacio-black'
                  : 'bg-palacio-gold/10 text-palacio-gold hover:bg-palacio-gold/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="p-6 text-center">
                  <div className="text-3xl font-playfair text-palacio-gold mb-2">
                    {rooms.length + cottages.length}
                  </div>
                  <p className="text-gray-400">Total Accommodations</p>
                </GlassCard>
                <GlassCard className="p-6 text-center">
                  <div className="text-3xl font-playfair text-palacio-gold mb-2">
                    {menu.length}
                  </div>
                  <p className="text-gray-400">Menu Items</p>
                </GlassCard>
                <GlassCard className="p-6 text-center">
                  <div className="text-3xl font-playfair text-palacio-gold mb-2">
                    {bookings.filter((b) => b.status === 'pending').length}
                  </div>
                  <p className="text-gray-400">Pending Bookings</p>
                </GlassCard>
                <GlassCard className="p-6 text-center">
                  <div className="text-3xl font-playfair text-palacio-gold mb-2">
                    {orders.filter((o) => o.status === 'pending').length}
                  </div>
                  <p className="text-gray-400">Pending Orders</p>
                </GlassCard>
              </div>
            )}

            {currentTab === 'rooms' && (
              <div>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setFormData({});
                    setShowModal(true);
                  }}
                  className="gold-glow-btn mb-6"
                >
                  <Plus className="inline mr-2" size={18} />
                  Add Room
                </button>

                <div className="space-y-4">
                  {[...rooms, ...cottages].map((item) => (
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
                            className="p-2 hover:bg-palacio-gold/20 rounded"
                          >
                            <Edit2 size={18} className="text-palacio-gold" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(item.id)}
                            className="p-2 hover:bg-red-900/20 rounded"
                          >
                            <Trash2 size={18} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {currentTab === 'menu' && (
              <div>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setFormData({});
                    setShowModal(true);
                  }}
                  className="gold-glow-btn mb-6"
                >
                  <Plus className="inline mr-2" size={18} />
                  Add Menu Item
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menu.map((item) => (
                    <GlassCard key={item.id} className="p-4">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-24 object-cover rounded mb-3"
                      />
                      <h3 className="font-playfair text-palacio-gold mb-1">
                        {item.name}
                      </h3>
                      <p className="text-gray-400 text-xs mb-2">
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
                          className="flex-1 p-2 hover:bg-palacio-gold/20 rounded text-sm"
                        >
                          <Edit2 size={14} className="inline mr-1 text-palacio-gold" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="flex-1 p-2 hover:bg-red-900/20 rounded text-sm"
                        >
                          <Trash2 size={14} className="inline mr-1 text-red-400" />
                          Delete
                        </button>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {/* NOTIFICATION-STYLE BOOKINGS TAB WITH ORDERS */}
            {currentTab === 'bookings' && (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const userOrders = getUserOrders(booking.user_email || '');
                  const hasOrders = userOrders.length > 0;
                  const pendingOrders = userOrders.filter(o => o.status === 'pending').length;

                  return (
                    <GlassCard key={booking.reference_number} className="p-5">
                      {/* Header: Notification style */}
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
                        <StatusBadge status={booking.status} size="md" />
                      </div>

                      {/* Booking Details - Compact */}
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

                      {/* ORDERS SECTION - Show user's orders */}
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
                                <div className="flex items-center gap-2">
                                  <StatusBadge status={order.status} size="sm" />
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
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
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

            {/* ORDERS TAB - Standalone orders list */}
            {currentTab === 'orders' && (
              <div className="space-y-4">
                {orders.map((order) => (
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
                    <div className="flex justify-between items-center mt-4">
                      <StatusBadge status={order.status} size="md" />
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.order_id!, e.target.value)}
                        className="px-3 py-1 bg-palacio-gold/20 border border-palacio-gold/30 rounded text-palacio-gold font-cinzel text-sm focus:outline-none cursor-pointer"
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
          </>
        )}
      </div>

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
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-palacio-gold text-palacio-black rounded font-cinzel font-semibold hover:bg-palacio-gold/80">
              Save
            </button>
          </div>
        }
      >
        <p className="text-gray-400">Admin form fields would be configured based on item type</p>
      </Modal>
    </div>
  );
}
