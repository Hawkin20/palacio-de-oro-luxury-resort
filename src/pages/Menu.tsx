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
  { value: 'non_alcoholic', label: 'Non-Alcoholic' },
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
        {
          id: item.id,
          menuItem: item,
          quantity: 1,
        },
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
        cart.map((ci) =>
          ci.id === itemId ? { ...ci, quantity } : ci
        )
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
      setOrderData({
        orderType: 'dine_in',
        paymentMethod: 'card',
        roomId: '',
      });

      setTimeout(() => {
        setShowCart(false);
        setOrderSuccess(false);
      }, 2000);
    } catch (error: any) {
      setOrderError(error.message || 'Failed to place order');
    }
  };

  const filteredItems = menuItems.filter(
    (item) => item.category === selectedCategory
  );

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="section-title">Our Menu</h1>
          <button
            onClick={() => setShowCart(true)}
            className="relative p-3 bg-palacio-gold/20 rounded-lg hover:bg-palacio-gold/30 smooth-transition"
          >
            <ShoppingCart size={24} className="text-palacio-gold" />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-palacio-black bg-palacio-gold rounded-full">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg font-cinzel text-sm smooth-transition ${
                selectedCategory === cat.value
                  ? 'bg-palacio-gold text-palacio-black'
                  : 'bg-palacio-gold/10 text-palacio-gold hover:bg-palacio-gold/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <GlassCard key={item.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-40 object-cover"
                  />
                  {item.is_bestseller && (
                    <div className="absolute top-2 right-2 bg-palacio-gold/90 text-palacio-black px-3 py-1 rounded-full text-xs font-cinzel font-bold">
                      BESTSELLER
                    </div>
                  )}
                  {item.is_featured && (
                    <div className="absolute top-2 left-2 bg-palacio-gold/60 text-palacio-black px-3 py-1 rounded-full text-xs font-cinzel font-bold">
                      FEATURED
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-playfair text-lg text-palacio-gold mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-cinzel font-bold text-palacio-gold text-lg">
                      ${item.price}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="p-2 bg-palacio-gold/20 text-palacio-gold rounded hover:bg-palacio-gold/30 smooth-transition"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showCart}
        onClose={() => {
          setShowCart(false);
          setOrderError('');
          setOrderSuccess(false);
        }}
        title="Your Order"
        footer={
          <div className="flex gap-3 w-full">
            <button
              onClick={() => {
                setShowCart(false);
                setOrderError('');
                setOrderSuccess(false);
              }}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 smooth-transition"
            >
              Continue Shopping
            </button>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || orderSuccess}
              className="flex-1 px-4 py-2 bg-palacio-gold text-palacio-black rounded font-cinzel font-semibold hover:bg-palacio-gold/80 disabled:opacity-50 smooth-transition"
            >
              {orderSuccess ? 'Order Placed!' : `Checkout ($${cartTotal.toFixed(2)})`}
            </button>
          </div>
        }
      >
        {orderSuccess ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="font-playfair text-xl text-palacio-gold mb-2">
              Order Confirmed!
            </h3>
            <p className="text-gray-400">
              Your order has been submitted and will be prepared shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orderError && (
              <div className="p-4 bg-red-900/40 border border-red-500 rounded text-red-300 text-sm">
                {orderError}
              </div>
            )}

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-palacio-gold/10 rounded"
                    >
                      <div className="flex-1">
                        <h4 className="font-playfair text-palacio-gold">
                          {item.menuItem.name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          ${item.menuItem.price} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 hover:bg-palacio-gold/20 rounded"
                        >
                          <Minus size={16} className="text-palacio-gold" />
                        </button>
                        <span className="w-6 text-center text-palacio-gold font-cinzel">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 hover:bg-palacio-gold/20 rounded"
                        >
                          <Plus size={16} className="text-palacio-gold" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-400 hover:bg-red-900/20 rounded ml-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-palacio-gold/20 pt-3">
                  <div className="flex justify-between text-lg font-cinzel text-palacio-gold mb-4">
                    <span>Total:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-cinzel text-palacio-gold mb-2">
                    Order Type
                  </label>
                  <select
                    value={orderData.orderType}
                    onChange={(e) =>
                      setOrderData({
                        ...orderData,
                        orderType: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-palacio-gold/30 rounded text-white focus:border-palacio-gold focus:outline-none"
                  >
                    <option value="dine_in">Dine-in</option>
                    <option value="room_delivery">Room Delivery</option>
                  </select>
                </div>

                {orderData.orderType === 'room_delivery' && (
                  <div>
                    <label className="block text-sm font-cinzel text-palacio-gold mb-2">
                      Room Number
                    </label>
                    <input
                      type="text"
                      value={orderData.roomId}
                      onChange={(e) =>
                        setOrderData({
                          ...orderData,
                          roomId: e.target.value,
                        })
                      }
                      placeholder="e.g., 101"
                      className="w-full px-4 py-2 bg-white/10 border border-palacio-gold/30 rounded text-white placeholder-gray-500 focus:border-palacio-gold focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-cinzel text-palacio-gold mb-2">
                    Payment Method
                  </label>
                  <select
                    value={orderData.paymentMethod}
                    onChange={(e) =>
                      setOrderData({
                        ...orderData,
                        paymentMethod: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-palacio-gold/30 rounded text-white focus:border-palacio-gold focus:outline-none"
                  >
                    <option value="card">Credit Card</option>
                    <option value="gcash">GCash</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
