import { useState, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MenuItem, CartItem } from '../lib/types';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

interface MenuProps {
  userId?: string;
  isLoggedIn: boolean;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
}

const CATEGORIES = [
  { value: 'appetizers', label: 'Appetizers' },
  { value: 'main_course', label: 'Main Course' },
  { value: 'seafood', label: 'Seafood' },
  { value: 'grilled', label: 'Grilled' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'cocktails', label: 'Cocktails' },
  { value: 'wine', label: 'Wine' },
  { value: 'non_alcoholic', label: 'Refreshments' },
];

export default function Menu({ userId, isLoggedIn, cart, setCart }: MenuProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('appetizers');
  const [showCart, setShowCart] = useState(false);
  const [orderData, setOrderData] = useState({
    orderType: 'dine_in' as 'dine_in' | 'room_delivery',
    paymentMethod: 'card' as 'cash' | 'gcash' | 'card',
    roomId: '',
  });
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('name');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((ci) => ci.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((ci) =>
          ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        )
      );
    } else {
      setCart([
        ...cart,
        { id: item.id, menuItem: item, quantity: 1 },
      ]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((ci) => ci.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(
        cart.map((ci) => (ci.id === itemId ? { ...ci, quantity } : ci))
      );
    }
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (!isLoggedIn || !userId) {
      setOrderError('Please log in to place an order');
      return;
    }

    if (cart.length === 0) {
      setOrderError('Your cart is empty');
      return;
    }

    if (orderData.orderType === 'room_delivery' && !orderData.roomId) {
      setOrderError('Please enter your room number for delivery');
      return;
    }

    try {
      const refNumber = `ORD${Date.now()}`;
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            guest_id: userId,
            total_amount: cartTotal,
            payment_method: orderData.paymentMethod,
            order_type: orderData.orderType,
            status: 'pending',
            reference_number: refNumber,
          },
        ])
        .select()
        .maybeSingle();

      if (orderError) throw orderError;
      if (!order) throw new Error('Failed to create order');

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        unit_price: item.menuItem.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderSuccess(true);
      setCart([]);
      setOrderData({ orderType: 'dine_in', paymentMethod: 'card', roomId: '' });

      setTimeout(() => {
        setShowCart(false);
        setOrderSuccess(false);
      }, 2000);
    } catch (error: any) {
      setOrderError(error.message || 'Failed to place order');
    }
  };

  const filteredItems = menuItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="relative min-h-screen pt-24 pb-20 overflow-hidden">
      {/* Summer Background Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center fixed"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&q=80")', // Food photography/Summer vibe
          filter: 'brightness(0.15) saturate(1.2)' 
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="section-title text-left mb-2 text-palacio-gold">Palacio Dining</h1>
            <p className="text-gray-400 font-poppins text-sm italic">Savor the flavors of summer luxury</p>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative p-4 bg-palacio-gold/20 border border-palacio-gold/30 rounded-full hover:bg-palacio-gold/30 hover:scale-110 smooth-transition"
          >
            <ShoppingCart size={24} className="text-palacio-gold" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-palacio-black bg-palacio-gold rounded-full shadow-lg">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* Category Navigation */}
        <div className="mb-12 flex flex-wrap gap-3 pb-4 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-6 py-2 rounded-full font-cinzel text-xs tracking-widest smooth-transition border ${
                selectedCategory === cat.value
                  ? 'bg-palacio-gold text-palacio-black border-palacio-gold'
                  : 'bg-white/5 text-palacio-gold border-palacio-gold/20 hover:bg-palacio-gold/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <GlassCard key={item.id} className="overflow-hidden group hover:border-palacio-gold/50 transition-all duration-500">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {item.is_bestseller && (
                      <span className="bg-palacio-gold text-palacio-black px-3 py-1 rounded-full text-[10px] font-cinzel font-bold shadow-xl">
                        BESTSELLER
                      </span>
                    )}
                    {item.is_featured && (
                      <span className="bg-white/90 text-palacio-black px-3 py-1 rounded-full text-[10px] font-cinzel font-bold shadow-xl">
                        SUMMER SPECIAL
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-playfair text-xl text-palacio-gold mb-2 group-hover:text-white transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 text-xs mb-6 line-clamp-2 italic">
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center border-t border-white/5 pt-4">
                    <span className="font-cinzel font-bold text-palacio-gold text-xl tracking-tighter">
                      ${item.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="flex items-center gap-2 px-4 py-2 bg-palacio-gold text-palacio-black rounded-full font-cinzel text-[10px] font-bold hover:bg-white hover:scale-105 smooth-transition shadow-lg shadow-palacio-gold/10"
                    >
                      <Plus size={14} /> ADD TO CART
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Cart Modal with Summer Styling */}
      <Modal
        isOpen={showCart}
        onClose={() => {
          setShowCart(false);
          setOrderError('');
          setOrderSuccess(false);
        }}
        title="Your Selection"
        footer={
          <div className="flex gap-3 w-full">
            <button
              onClick={() => setShowCart(false)}
              className="flex-1 px-4 py-3 bg-white/5 text-gray-400 rounded-lg font-cinzel text-xs hover:bg-white/10 transition-all"
            >
              Continue
            </button>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || orderSuccess}
              className="flex-1 px-4 py-3 bg-palacio-gold text-palacio-black rounded-lg font-cinzel text-xs font-bold hover:bg-white disabled:opacity-50 smooth-transition shadow-xl shadow-palacio-gold/20"
            >
              {orderSuccess ? 'Order Placed!' : `Order ($${cartTotal.toFixed(2)})`}
            </button>
          </div>
        }
      >
        {/* Same modal content logic with updated Tailwind classes */}
        {orderSuccess ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-6 animate-bounce">🌊</div>
            <h3 className="font-playfair text-2xl text-palacio-gold mb-3">Order Confirmed!</h3>
            <p className="text-gray-400 text-sm">Sit back and relax. Your summer feast is being prepared.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orderError && (
              <div className="p-3 bg-red-900/40 border border-red-500 rounded text-red-300 text-[10px] uppercase font-bold tracking-widest">
                {orderError}
              </div>
            )}

            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={48} className="mx-auto text-gray-700 mb-4 opacity-20" />
                <p className="text-gray-500 font-cinzel text-xs">Your tray is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex-1">
                        <h4 className="font-playfair text-white text-sm">{item.menuItem.name}</h4>
                        <p className="text-[10px] text-palacio-gold font-cinzel font-bold">${item.menuItem.price}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-black/40 rounded-full px-2 py-1 border border-white/10">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-palacio-gold transition-colors">
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-xs font-cinzel text-white">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-palacio-gold transition-colors">
                            <Plus size={14} />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500/50 hover:text-red-500 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 border-t border-white/10 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-cinzel text-palacio-gold tracking-widest uppercase">Type</label>
                      <select
                        value={orderData.orderType}
                        onChange={(e) => setOrderData({ ...orderData, orderType: e.target.value as any })}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:border-palacio-gold focus:outline-none"
                      >
                        <option value="dine_in">Dine-in</option>
                        <option value="room_delivery">Room Delivery</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-cinzel text-palacio-gold tracking-widest uppercase">Payment</label>
                      <select
                        value={orderData.paymentMethod}
                        onChange={(e) => setOrderData({ ...orderData, paymentMethod: e.target.value as any })}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:border-palacio-gold focus:outline-none"
                      >
                        <option value="card">Card</option>
                        <option value="gcash">GCash</option>
                        <option value="cash">Cash</option>
                      </select>
                    </div>
                  </div>
                  
                  {orderData.orderType === 'room_delivery' && (
                    <div className="animate-fade-in">
                      <label className="text-[10px] font-cinzel text-palacio-gold tracking-widest uppercase mb-2 block">Room Number</label>
                      <input
                        type="text"
                        value={orderData.roomId}
                        onChange={(e) => setOrderData({ ...orderData, roomId: e.target.value })}
                        placeholder="e.g., 204"
                        className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:border-palacio-gold outline-none"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
