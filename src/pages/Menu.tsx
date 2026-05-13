import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, X, Plus, Minus, Search, Star, Flame, Leaf, ChefHat, Wine, Coffee, UtensilsCrossed, Fish, Beef, CakeSlice, GlassWater } from 'lucide-react';
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
  { value: 'appetizers', label: 'Appetizers', icon: UtensilsCrossed },
  { value: 'main_course', label: 'Main Course', icon: Beef },
  { value: 'seafood', label: 'Seafood', icon: Fish },
  { value: 'grilled', label: 'Grilled', icon: Flame },
  { value: 'desserts', label: 'Desserts', icon: CakeSlice },
  { value: 'cocktails', label: 'Cocktails', icon: Wine },
  { value: 'wine', label: 'Wine', icon: GlassWater },
  { value: 'non_alcoholic', label: 'Refreshments', icon: Coffee },
];

const DIETARY_ICONS: Record<string, { icon: typeof Leaf; color: string; label: string }> = {
  spicy: { icon: Flame, color: 'text-red-400', label: 'Spicy' },
  vegan: { icon: Leaf, color: 'text-green-400', label: 'Vegan' },
  vegetarian: { icon: Leaf, color: 'text-emerald-400', label: 'Vegetarian' },
  gluten_free: { icon: ChefHat, color: 'text-amber-400', label: 'Gluten-Free' },
};

export default function Menu({ userId, isLoggedIn, cart, setCart }: MenuProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('appetizers');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState({
    orderType: 'dine_in' as 'dine_in' | 'room_delivery',
    paymentMethod: 'card' as 'cash' | 'gcash' | 'card',
    roomId: '',
  });
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

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
    
    // Animation trigger
    setAddedItemId(item.id);
    setTimeout(() => setAddedItemId(null), 800);
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

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
      }, 2500);
    } catch (error: any) {
      setOrderError(error.message || 'Failed to place order');
    }
  };

  // Filter logic
  let filteredItems = menuItems;
  
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    filteredItems = menuItems.filter(item =>
      item.name?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    );
  } else {
    filteredItems = menuItems.filter((item) => item.category === selectedCategory);
  }

  // Featured items for hero carousel (top 4 featured/bestseller)
  const featuredItems = menuItems.filter(item => item.is_featured || item.is_bestseller).slice(0, 4);

  const scrollToCategory = (value: string) => {
    setSelectedCategory(value);
    setSearchQuery('');
    categoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
        
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-palacio-gold/10 border border-palacio-gold/30 rounded-full mb-6 backdrop-blur-sm">
            <ChefHat size={16} className="text-palacio-gold" />
            <span className="text-palacio-gold font-cinzel text-xs tracking-[0.3em] uppercase">Culinary Excellence</span>
          </div>
          
          <h1 className="font-playfair text-5xl md:text-7xl text-palacio-gold mb-4 drop-shadow-2xl">
            Palacio Dining
          </h1>
          <p className="text-gray-300 font-poppins text-lg md:text-xl italic max-w-2xl mb-8">
            Savor the flavors of summer luxury
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm font-cinzel tracking-wider">
            <div className="flex items-center gap-2 text-palacio-gold">
              <Star size={16} className="fill-palacio-gold" />
              <span>4.9 Rating</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Wine size={16} />
              <span>50+ Wines</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <ChefHat size={16} />
              <span>Award-Winning Chef</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Header Bar */}
      <div className="sticky top-20 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-full md:max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-palacio-gold/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu items..."
                className="w-full pl-12 pr-10 py-3 bg-white/5 border border-palacio-gold/20 rounded-full text-sm text-white placeholder-gray-500 focus:border-palacio-gold focus:outline-none focus:bg-white/10 smooth-transition focus:shadow-lg focus:shadow-palacio-gold/10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-palacio-gold smooth-transition"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center gap-3 px-6 py-3 bg-palacio-gold/10 border border-palacio-gold/30 rounded-full hover:bg-palacio-gold/20 hover:scale-105 smooth-transition group"
            >
              <ShoppingCart size={20} className="text-palacio-gold group-hover:scale-110 transition-transform" />
              <span className="text-palacio-gold font-cinzel text-xs tracking-wider hidden sm:inline">Your Tray</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-bold text-palacio-black bg-palacio-gold rounded-full shadow-lg shadow-palacio-gold/30 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Chef's Recommendations - Only show when not searching */}
        {!searchQuery && featuredItems.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-palacio-gold/30 to-transparent" />
              <h2 className="font-cinzel text-palacio-gold text-sm tracking-[0.3em] uppercase whitespace-nowrap">
                Chef's Recommendations
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-palacio-gold/30 to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-palacio-gold/50 transition-all duration-500 cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => addToCart(item)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {item.is_bestseller && (
                        <span className="bg-palacio-gold text-palacio-black px-3 py-1 rounded-full text-[10px] font-cinzel font-bold shadow-lg flex items-center gap-1">
                          <Star size={10} className="fill-palacio-black" /> BESTSELLER
                        </span>
                      )}
                      {item.is_featured && (
                        <span className="bg-white/90 text-palacio-black px-3 py-1 rounded-full text-[10px] font-cinzel font-bold shadow-lg">
                          SUMMER SPECIAL
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-playfair text-lg text-white mb-1">{item.name}</h3>
                      <div className="flex justify-between items-center">
                        <span className="font-cinzel font-bold text-palacio-gold text-lg">${item.price.toFixed(2)}</span>
                        <div className="w-8 h-8 rounded-full bg-palacio-gold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={16} className="text-palacio-black" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Navigation */}
        <div ref={categoryRef} className="mb-12">
          <div className="flex flex-wrap justify-center gap-3 pb-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.value && !searchQuery;
              return (
                <button
                  key={cat.value}
                  onClick={() => scrollToCategory(cat.value)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full font-cinzel text-xs tracking-widest smooth-transition border ${
                    isActive
                      ? 'bg-palacio-gold text-palacio-black border-palacio-gold shadow-lg shadow-palacio-gold/20 scale-105'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-palacio-gold hover:border-palacio-gold/30'
                  }`}
                >
                  <Icon size={14} />
                  {cat.label}
                </button>
              );
            })}
          </div>
          
          {/* Active Category Title */}
          {!searchQuery && (
            <div className="text-center mt-6 mb-2">
              <h2 className="font-playfair text-3xl text-white mb-2">
                {CATEGORIES.find(c => c.value === selectedCategory)?.label}
              </h2>
              <div className="w-24 h-0.5 bg-palacio-gold/50 mx-auto rounded-full" />
            </div>
          )}
          
          {searchQuery && (
            <div className="text-center mt-6 mb-2">
              <h2 className="font-playfair text-3xl text-white mb-2">
                Search Results
              </h2>
              <p className="text-gray-400 text-sm font-poppins">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found for "{searchQuery}"
              </p>
              <div className="w-24 h-0.5 bg-palacio-gold/50 mx-auto rounded-full mt-4" />
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <GlassCard 
                  key={item.id} 
                  className="overflow-hidden group hover:border-palacio-gold/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-palacio-gold/5"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {item.is_bestseller && (
                        <span className="bg-palacio-gold text-palacio-black px-3 py-1.5 rounded-full text-[10px] font-cinzel font-bold shadow-xl flex items-center gap-1 animate-pulse">
                          <Star size={10} className="fill-palacio-black" /> BESTSELLER
                        </span>
                      )}
                      {item.is_featured && (
                        <span className="bg-white/90 text-palacio-black px-3 py-1.5 rounded-full text-[10px] font-cinzel font-bold shadow-xl">
                          SUMMER SPECIAL
                        </span>
                      )}
                      {item.is_new && (
                        <span className="bg-emerald-500/90 text-white px-3 py-1.5 rounded-full text-[10px] font-cinzel font-bold shadow-xl">
                          NEW
                        </span>
                      )}
                    </div>

                    {/* Quick Add Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button
                        onClick={() => addToCart(item)}
                        className={`px-6 py-3 bg-palacio-gold text-palacio-black rounded-full font-cinzel text-xs font-bold transform transition-all duration-300 flex items-center gap-2 shadow-xl ${
                          addedItemId === item.id ? 'scale-110 bg-white' : 'hover:scale-105'
                        }`}
                      >
                        {addedItemId === item.id ? (
                          <>✓ ADDED</>
                        ) : (
                          <><Plus size={16} /> ADD TO CART</>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            className={i < 4 ? "fill-palacio-gold text-palacio-gold" : "text-gray-600"} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 font-cinzel">4.9</span>
                    </div>

                    <h3 className="font-playfair text-2xl text-palacio-gold mb-2 group-hover:text-white transition-colors duration-300">
                      {item.name}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 italic leading-relaxed">
                      {item.description}
                    </p>

                    {/* Dietary Tags */}
                    {item.dietary_tags && item.dietary_tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.dietary_tags.map((tag) => {
                          const config = DIETARY_ICONS[tag];
                          if (!config) return null;
                          const TagIcon = config.icon;
                          return (
                            <span 
                              key={tag} 
                              className={`flex items-center gap-1 text-[10px] font-cinzel px-2 py-1 rounded-full bg-white/5 border border-white/10 ${config.color}`}
                              title={config.label}
                            >
                              <TagIcon size={10} />
                              {config.label}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex justify-between items-center border-t border-white/10 pt-4">
                      <div className="flex flex-col">
                        {item.original_price && item.original_price > item.price && (
                          <span className="text-gray-500 text-xs line-through font-cinzel">
                            ${item.original_price.toFixed(2)}
                          </span>
                        )}
                        <span className="font-cinzel font-bold text-palacio-gold text-2xl tracking-tighter">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className={`flex items-center gap-2 px-5 py-2.5 bg-palacio-gold text-palacio-black rounded-full font-cinzel text-[10px] font-bold smooth-transition shadow-lg shadow-palacio-gold/10 ${
                          addedItemId === item.id 
                            ? 'bg-white scale-110' 
                            : 'hover:bg-white hover:scale-105 hover:shadow-palacio-gold/20'
                        }`}
                      >
                        {addedItemId === item.id ? (
                          <><span className="text-lg">✓</span> ADDED</>
                        ) : (
                          <><Plus size={14} /> ADD</>
                        )}
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                  <Search size={32} className="text-gray-600" />
                </div>
                <h3 className="font-playfair text-xl text-gray-400 mb-2">
                  {searchQuery ? `No results for "${searchQuery}"` : 'No items available'}
                </h3>
                <p className="text-gray-500 font-cinzel text-xs">
                  {searchQuery ? 'Try a different search term' : 'Check back later for new additions'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Slide-in Drawer */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          showCart ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => {
            setShowCart(false);
            setOrderError('');
            setOrderSuccess(false);
          }}
        />
        
        <div 
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-[#0f0f0f] border-l border-white/10 shadow-2xl transform transition-transform duration-500 ease-out ${
            showCart ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Cart Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0f0f0f]">
            <div>
              <h2 className="font-playfair text-2xl text-palacio-gold">Your Selection</h2>
              <p className="text-gray-500 text-xs font-cinzel mt-1">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
            </div>
            <button
              onClick={() => {
                setShowCart(false);
                setOrderError('');
                setOrderSuccess(false);
              }}
              className="p-2 hover:bg-white/5 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex flex-col h-[calc(100%-180px)] overflow-hidden">
            {orderSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-palacio-gold/10 flex items-center justify-center mb-6 animate-bounce">
                  <span className="text-5xl">🌊</span>
                </div>
                <h3 className="font-playfair text-3xl text-palacio-gold mb-3">Order Confirmed!</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Sit back and relax. Your summer feast is being prepared with love.
                </p>
                <div className="mt-6 w-16 h-1 bg-palacio-gold/30 rounded-full" />
              </div>
            ) : cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <ShoppingCart size={40} className="text-gray-700" />
                </div>
                <h3 className="font-playfair text-xl text-gray-400 mb-2">Your tray is empty</h3>
                <p className="text-gray-600 text-xs font-cinzel">Add some delicious items to get started</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {orderError && (
                    <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-300 text-xs uppercase font-bold tracking-widest flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      {orderError}
                    </div>
                  )}

                  {cart.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-palacio-gold/20 transition-colors group"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.menuItem.image_url}
                          alt={item.menuItem.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-playfair text-white text-sm truncate mb-1">{item.menuItem.name}</h4>
                        <p className="text-palacio-gold font-cinzel text-xs font-bold mb-3">
                          ${item.menuItem.price.toFixed(2)}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-black/40 rounded-full px-2 py-1 border border-white/10">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                              className="p-1.5 hover:text-palacio-gold transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-10 text-center text-sm font-cinzel text-white">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                              className="p-1.5 hover:text-palacio-gold transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            className="p-2 text-gray-600 hover:text-red-400 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Details */}
                <div className="p-6 border-t border-white/10 bg-[#0a0a0a] space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-cinzel text-palacio-gold tracking-widest uppercase">Order Type</label>
                      <select
                        value={orderData.orderType}
                        onChange={(e) => setOrderData({ ...orderData, orderType: e.target.value as any })}
                        className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:border-palacio-gold focus:outline-none smooth-transition"
                      >
                        <option value="dine_in">🍽️ Dine-in</option>
                        <option value="room_delivery">🚪 Room Delivery</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-cinzel text-palacio-gold tracking-widest uppercase">Payment</label>
                      <select
                        value={orderData.paymentMethod}
                        onChange={(e) => setOrderData({ ...orderData, paymentMethod: e.target.value as any })}
                        className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white focus:border-palacio-gold focus:outline-none smooth-transition"
                      >
                        <option value="card">💳 Card</option>
                        <option value="gcash">📱 GCash</option>
                        <option value="cash">💵 Cash</option>
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
                        className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:border-palacio-gold outline-none smooth-transition"
                      />
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-gray-400 font-cinzel text-sm">Total</span>
                    <span className="font-cinzel font-bold text-palacio-gold text-2xl">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Cart Footer */}
          {!orderSuccess && cart.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#0f0f0f] border-t border-white/10">
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-4 bg-palacio-gold text-palacio-black rounded-xl font-cinzel text-sm font-bold hover:bg-white disabled:opacity-50 smooth-transition shadow-xl shadow-palacio-gold/20 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                Place Order — ${cartTotal.toFixed(2)}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {addedItemId && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="px-6 py-3 bg-palacio-gold text-palacio-black rounded-full font-cinzel text-xs font-bold shadow-2xl shadow-palacio-gold/30 flex items-center gap-2">
            <Plus size={16} />
            Item added to your tray
          </div>
        </div>
      )}
    </div>
  );
}
