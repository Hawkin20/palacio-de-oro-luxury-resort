import { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Users, X, Info, Search, MapPin, Star, 
  Wifi, Wind, Droplets, Tv, Coffee, Car, Waves,
  ChevronLeft, ChevronRight, Heart, Share2, Check,
  ArrowRight, Sparkles, Shield, Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Room, Cottage, Booking } from '../lib/types';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { handleImageFallback } from '../lib/images';

interface RoomsProps {
  userId?: string;
  isLoggedIn: boolean;
  onNavigate: (page: string) => void;
}

// ─── AMENITIES ICON MAP ──────────────────────────────────────────────
const amenityIcons: Record<string, React.ReactNode> = {
  'wifi': <Wifi size={14} />,
  'ac': <Wind size={14} />,
  'tv': <Tv size={14} />,
  'mini bar': <Coffee size={14} />,
  'parking': <Car size={14} />,
  'pool': <Waves size={14} />,
  'garden view': <Droplets size={14} />,
  'ocean view': <Waves size={14} />,
  'balcony': <MapPin size={14} />,
};

// ─── MOCK DATA FOR FEATURED / COMPARISON ─────────────────────────────
const featuredAmenities = [
  { icon: <Shield size={16} />, label: 'Secure Booking' },
  { icon: <Clock size={16} />, label: 'Instant Confirmation' },
  { icon: <Sparkles size={16} />, label: 'Best Price Guarantee' },
  { icon: <Heart size={16} />, label: 'Free Cancellation' },
];

export default function Rooms({ userId, isLoggedIn, onNavigate }: RoomsProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'popular'>('popular');
  const [selectedRoom, setSelectedRoom] = useState<Room | Cottage | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewRoom, setQuickViewRoom] = useState<Room | Cottage | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [compareList, setCompareList] = useState<(Room | Cottage)[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guestCount: 1,
    paymentMethod: 'card' as 'cash' | 'gcash' | 'card',
    downpayment: false,
  });
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // ─── DATA FETCHING ─────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsRes, cottagesRes] = await Promise.all([
        supabase.from('rooms').select('*'),
        supabase.from('cottages').select('*'),
      ]);

      if (roomsRes.data) setRooms(roomsRes.data);
      if (cottagesRes.data) setCottages(cottagesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── FAVORITES TOGGLE ──────────────────────────────────────────────
  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ─── QUICK VIEW ────────────────────────────────────────────────────
  const openQuickView = (e: React.MouseEvent, room: Room | Cottage) => {
    e.stopPropagation();
    setQuickViewRoom(room);
    setShowQuickView(true);
  };

  // ─── COMPARE FUNCTIONS ─────────────────────────────────────────────
  const toggleCompare = (e: React.MouseEvent, room: Room | Cottage) => {
    e.stopPropagation();
    setCompareList(prev => {
      const exists = prev.find(r => r.id === room.id);
      if (exists) return prev.filter(r => r.id !== room.id);
      if (prev.length >= 3) return prev; // Max 3
      return [...prev, room];
    });
  };

  // ─── SORT & FILTER LOGIC ───────────────────────────────────────────
  const getFilteredItems = () => {
    const allItems = [
      ...rooms.map(r => ({ ...r, type: 'room' as const, category: r.room_type?.toLowerCase() || '' })),
      ...cottages.map(c => ({ ...c, type: 'cottage' as const, category: c.cottage_type?.toLowerCase() || '' }))
    ];

    let filtered = allItems;

    switch (filter) {
      case 'rooms':
        filtered = rooms.map(r => ({ ...r, type: 'room' as const, category: r.room_type?.toLowerCase() || '' }));
        break;
      case 'luxury':
        filtered = rooms.filter(r => (r.room_type?.toLowerCase() || '').includes('luxury'))
          .map(r => ({ ...r, type: 'room' as const, category: r.room_type?.toLowerCase() || '' }));
        break;
      case 'cottages':
        filtered = cottages.map(c => ({ ...c, type: 'cottage' as const, category: c.cottage_type?.toLowerCase() || '' }));
        break;
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.amenities?.some((a: string) => a.toLowerCase().includes(query)) ||
        item.category?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price_per_night - b.price_per_night);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price_per_night - a.price_per_night);
        break;
      case 'popular':
      default:
        // Keep original order or shuffle
        break;
    }

    return filtered.filter(item => item.name && item.image_url && item.price_per_night);
  };

  const filtered = getFilteredItems();

  // ─── BOOKING HANDLER ───────────────────────────────────────────────
  const handleBooking = async () => {
    if (!isLoggedIn || !userId) {
      setBookingError('Please log in to make a booking');
      return;
    }
    if (!bookingData.checkIn || !bookingData.checkOut) {
      setBookingError('Please select both check-in and check-out dates');
      return;
    }
    if (new Date(bookingData.checkOut) <= new Date(bookingData.checkIn)) {
      setBookingError('Check-out date must be after check-in date');
      return;
    }

    try {
      const nights = (new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24);
      const room = selectedRoom as Room | Cottage;
      const totalPrice = nights * room.price_per_night;
      const refNumber = `BK${Date.now()}`;

      const bookingPayload: any = {
        guest_id: userId,
        check_in_date: bookingData.checkIn,
        check_out_date: bookingData.checkOut,
        guest_count: bookingData.guestCount,
        total_price: totalPrice,
        payment_method: bookingData.paymentMethod,
        downpayment_amount: bookingData.downpayment ? totalPrice * 0.5 : 0,
        reference_number: refNumber,
        status: 'pending',
      };

      if ('room_type' in room) bookingPayload.room_id = room.id;
      else bookingPayload.cottage_id = room.id;

      const { error } = await supabase.from('bookings').insert([bookingPayload]);
      if (error) throw error;

      setBookingSuccess(true);
      setBookingData({ checkIn: '', checkOut: '', guestCount: 1, paymentMethod: 'card', downpayment: false });

      setTimeout(() => {
        setShowBookingModal(false);
        setSelectedRoom(null);
        setBookingSuccess(false);
      }, 2000);
    } catch (error: any) {
      setBookingError(error.message || 'Failed to create booking');
    }
  };

  // ─── HERO SECTION ──────────────────────────────────────────────────
  const HeroSection = () => (
    <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden mb-12">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80")',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-palacio-black" />
      
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2.5 bg-black/40 border border-white/10 rounded-full px-5 py-2 mb-6 animate-fade-in backdrop-blur-md">
          <Sparkles size={14} className="text-palacio-bronze" />
          <span className="text-palacio-alabaster/90 text-[11px] font-cinzel tracking-[0.25em] uppercase">ESTATE & SANCTUARY SUITES</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-playfair font-normal text-palacio-alabaster mb-4 drop-shadow-2xl animate-slide-up">
          Accommodations
        </h1>
        
        <p className="text-base md:text-lg text-palacio-alabaster/70 font-poppins font-light italic mb-8 max-w-xl mx-auto leading-relaxed animate-slide-up-delay">
          From majestic private villas to serene beachside cottages, discover your quiet sanctuary under the golden sun.
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 animate-fade-in">
          {featuredAmenities.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-palacio-alabaster/60">
              <span className="text-palacio-bronze">{item.icon}</span>
              <span className="text-xs font-cinzel tracking-wider">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── COMPARE BAR ───────────────────────────────────────────────────
  const CompareBar = () => {
    if (compareList.length === 0) return null;
    
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#080808]/95 border border-white/[0.12] rounded-xl px-6 py-4 shadow-2xl backdrop-blur-xl animate-slide-up">
        <div className="flex items-center gap-6">
          <span className="text-palacio-bronze font-cinzel text-xs tracking-wider">
            COMPARE ({compareList.length}/3)
          </span>
          <div className="flex gap-2">
            {compareList.map(room => (
              <div key={room.id} className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20">
                <img 
                  src={room.image_url} 
                  alt={room.name}
                  onError={(e) => handleImageFallback(e, room.name, room.type)}
                  className="w-full h-full object-cover" 
                />
                <button 
                  onClick={() => setCompareList(prev => prev.filter(r => r.id !== room.id))}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-white text-[10px]"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setShowCompare(true)}
            className="px-5 py-2 bg-palacio-bronze text-palacio-obsidian rounded-md font-cinzel text-xs font-semibold tracking-wider uppercase hover:bg-palacio-gold transition-colors"
          >
            Compare Now
          </button>
          <button 
            onClick={() => setCompareList([])}
            className="text-gray-400 hover:text-white text-xs font-cinzel tracking-wider"
          >
            Clear
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-palacio-black overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-20"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80")',
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-palacio-black via-palacio-black/95 to-palacio-black" />

      <div className="relative z-10">
        <HeroSection />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          {/* FILTERS & SEARCH BAR */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'All', value: 'all', count: rooms.length + cottages.length },
                { label: 'Rooms', value: 'rooms', count: rooms.length },
                { label: 'Luxury', value: 'luxury', count: rooms.filter(r => (r.room_type?.toLowerCase() || '').includes('luxury')).length },
                { label: 'Cottages', value: 'cottages', count: cottages.length },
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setFilter(btn.value)}
                  className={`relative px-5 py-2.5 rounded-full font-cinzel text-xs tracking-wider transition-all duration-300 border ${
                    filter === btn.value
                      ? 'bg-palacio-bronze text-palacio-obsidian font-semibold border-palacio-bronze shadow-md'
                      : 'bg-white/[0.03] text-palacio-alabaster/70 border-white/[0.08] hover:border-palacio-bronze/40 hover:text-palacio-alabaster'
                  }`}
                >
                  {btn.label}
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${
                    filter === btn.value ? 'bg-black/20' : 'bg-white/10'
                  }`}>
                    {btn.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-palacio-bronze/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search accommodations..."
                  className="w-full sm:w-64 pl-11 pr-10 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-palacio-alabaster placeholder-gray-500 focus:border-palacio-bronze/50 focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-palacio-gold transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-palacio-alabaster/80 focus:border-palacio-bronze/50 focus:outline-none cursor-pointer hover:bg-white/[0.06] transition-all font-cinzel text-xs tracking-wider"
              >
                <option value="popular" className="bg-[#080808]">Sort by: Popular</option>
                <option value="price-asc" className="bg-[#080808]">Price: Low to High</option>
                <option value="price-desc" className="bg-[#080808]">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* RESULTS COUNT */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-500 text-sm font-cinzel">
              Showing <span className="text-palacio-gold">{filtered.length}</span> accommodations
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-palacio-gold text-xs font-cinzel hover:underline"
              >
                Clear search
              </button>
            )}
          </div>

          {/* GRID */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden animate-shimmer">
                  <div className="h-64 bg-white/5" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-white/5 rounded w-3/4" />
                    <div className="h-4 bg-white/5 rounded w-full" />
                    <div className="flex justify-between">
                      <div className="h-6 bg-white/5 rounded w-1/3" />
                      <div className="h-10 bg-white/5 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.length > 0 ? (
                  filtered.map((item: any) => {
                    const isHovered = hoveredCard === item.id;
                    const isFav = favorites.has(item.id);
                    const isCompared = compareList.find(r => r.id === item.id);
                    
                    return (
                      <div
                        key={item.id}
                        className="group relative"
                        onMouseEnter={() => setHoveredCard(item.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <div
                          className={`overflow-hidden transition-all duration-500 flex flex-col h-full rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.08] cursor-pointer hover:border-palacio-bronze/50 hover:shadow-2xl ${
                            isHovered ? 'border-palacio-bronze/50 shadow-[0_15px_40px_rgba(197,168,128,0.12)] -translate-y-1' : ''
                          }`}
                          onClick={() => {
                            setSelectedRoom(item);
                            setShowBookingModal(true);
                          }}
                        >
                          {/* Image Container */}
                          <div className="relative h-72 overflow-hidden">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              onError={(e) => handleImageFallback(e, item.name, item.type)}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                            
                            {/* Top Badges */}
                            <div className="absolute top-4 left-4 flex gap-2">
                              <StatusBadge status={item.status} size="sm" />
                              {item.status === 'available' && (
                                <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-cinzel rounded-full">
                                  AVAILABLE NOW
                                </span>
                              )}
                            </div>

                            {/* Top Right Actions */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                              <button
                                onClick={(e) => toggleFavorite(e, item.id)}
                                className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                                  isFav ? 'bg-rose-500 text-white' : 'bg-black/60 border border-white/20 text-white hover:border-palacio-bronze hover:text-palacio-bronze'
                                }`}
                              >
                                <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />
                              </button>
                              <button
                                onClick={(e) => openQuickView(e, item)}
                                className="w-9 h-9 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-white flex items-center justify-center hover:border-palacio-bronze hover:text-palacio-bronze transition-all"
                              >
                                <Info size={15} />
                              </button>
                              <button
                                onClick={(e) => toggleCompare(e, item)}
                                className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                                  isCompared ? 'bg-palacio-bronze text-palacio-obsidian font-bold' : 'bg-black/60 border border-white/20 text-white hover:border-palacio-bronze hover:text-palacio-bronze'
                                }`}
                              >
                                <Check size={15} />
                              </button>
                            </div>

                            {/* Price Tag */}
                            <div className="absolute bottom-4 right-4 text-right">
                              <p className="text-[9px] text-palacio-alabaster/60 uppercase font-cinzel tracking-wider">Starts at</p>
                              <p className="text-palacio-bronze font-cinzel font-bold text-2xl drop-shadow-lg">
                                ${item.price_per_night}
                                <span className="text-xs text-palacio-alabaster/60 font-normal"> /night</span>
                              </p>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-6 flex-grow flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-playfair text-xl text-palacio-alabaster group-hover:text-palacio-bronze transition-colors line-clamp-1">
                                {item.name}
                              </h3>
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Star size={13} fill="currentColor" />
                                <span className="text-xs font-bold text-palacio-alabaster/90">4.9</span>
                              </div>
                            </div>
                            
                            <p className="text-palacio-alabaster/60 text-xs mb-4 line-clamp-2 italic leading-relaxed font-light">
                              {item.description}
                            </p>

                            {/* Amenities */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {item.amenities?.slice(0, 4).map((amenity: string) => (
                                <span 
                                  key={amenity} 
                                  className="flex items-center gap-1.5 text-[10px] font-cinzel tracking-wider bg-white/[0.04] text-palacio-alabaster/70 px-3 py-1.5 rounded-full border border-white/[0.08] hover:border-palacio-bronze/40 transition-colors"
                                >
                                  {amenityIcons[amenity.toLowerCase()] || <Sparkles size={11} />}
                                  {amenity}
                                </span>
                              ))}
                            </div>

                            {/* Footer Info */}
                            <div className="mt-auto pt-4 border-t border-white/[0.08]">
                              <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1.5 text-palacio-alabaster/60 text-xs">
                                    <Users size={14} className="text-palacio-bronze" />
                                    {item.capacity} Guests
                                  </span>
                                  <span className="flex items-center gap-1.5 text-palacio-alabaster/60 text-xs">
                                    <MapPin size={14} className="text-palacio-bronze" />
                                    {item.type === 'room' ? 'Ocean View' : 'Garden Sanctuary'}
                                  </span>
                                </div>
                              </div>

                              <button
                                disabled={item.status !== 'available'}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRoom(item);
                                  setShowBookingModal(true);
                                }}
                                className="w-full py-3.5 bg-palacio-bronze text-palacio-obsidian rounded-lg font-cinzel text-xs font-semibold tracking-[0.2em] uppercase hover:bg-palacio-gold transition-all duration-300 shadow-md shadow-palacio-bronze/10 disabled:opacity-30 disabled:cursor-not-allowed group/btn"
                              >
                                <span className="flex items-center justify-center gap-2">
                                  {item.status === 'available' ? (
                                    <>
                                      RESERVE NOW
                                      <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                  ) : (
                                    'FULLY BOOKED'
                                  )}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-20">
                    <div className="text-6xl mb-4">🏖️</div>
                    <h3 className="text-palacio-gold font-playfair text-2xl mb-2">No accommodations found</h3>
                    <p className="text-gray-500 font-cinzel text-sm mb-6">
                      {searchQuery ? `No results for "${searchQuery}"` : 'No accommodations available for this category.'}
                    </p>
                    <button 
                      onClick={() => { setFilter('all'); setSearchQuery(''); }}
                      className="px-6 py-3 bg-palacio-gold text-palacio-black rounded-full font-cinzel text-sm font-bold hover:bg-white transition-colors"
                    >
                      View All Accommodations
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Compare Bar */}
      <CompareBar />

      {/* ═══════════════════════════════════════════════════════════════
          QUICK VIEW MODAL
          ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showQuickView}
        onClose={() => { setShowQuickView(false); setQuickViewRoom(null); }}
        title={quickViewRoom?.name || 'Quick View'}
        size="lg"
      >
        {quickViewRoom && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl overflow-hidden">
              <img 
                src={quickViewRoom.image_url} 
                alt={quickViewRoom.name}
                onError={(e) => handleImageFallback(e, quickViewRoom.name, quickViewRoom.type)}
                className="w-full h-64 md:h-full object-cover" 
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-playfair text-palacio-alabaster">{quickViewRoom.name}</h3>
                  <p className="text-gray-400 text-sm italic">{quickViewRoom.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-playfair text-palacio-bronze">${quickViewRoom.price_per_night}</p>
                  <p className="text-gray-500 text-xs">per night</p>
                </div>
              </div>

              <div className="flex gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Users size={14} className="text-palacio-bronze" /> {quickViewRoom.capacity} Guests</span>
                <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400" /> 4.9 (128 reviews)</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {quickViewRoom.amenities?.map((a: string) => (
                  <span key={a} className="text-xs bg-white/5 text-gray-300 px-3 py-1.5 rounded-full border border-white/10 font-cinzel text-[10px]">
                    {a}
                  </span>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowQuickView(false);
                    setSelectedRoom(quickViewRoom);
                    setShowBookingModal(true);
                  }}
                  className="flex-1 py-3.5 bg-palacio-bronze text-palacio-obsidian rounded-lg font-cinzel font-semibold text-xs tracking-[0.2em] uppercase hover:bg-palacio-gold transition-colors"
                >
                  Reserve Suite
                </button>
                <button
                  onClick={() => toggleCompare({ stopPropagation: () => {} } as any, quickViewRoom)}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:border-palacio-bronze/50 transition-colors"
                >
                  <Check size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════
          COMPARE MODAL
          ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showCompare}
        onClose={() => setShowCompare(false)}
        title="Compare Accommodations"
        size="xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-gray-400 font-cinzel text-xs">Feature</th>
                {compareList.map(room => (
                  <th key={room.id} className="py-4 px-4 text-center min-w-[200px]">
                    <img 
                      src={room.image_url} 
                      alt={room.name}
                      onError={(e) => handleImageFallback(e, room.name, room.type)}
                      className="w-full h-32 object-cover rounded-lg mb-2" 
                    />
                    <p className="text-palacio-alabaster font-playfair text-sm">{room.name}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-gray-400 font-cinzel text-xs">Price/Night</td>
                {compareList.map(room => (
                  <td key={room.id} className="py-3 px-4 text-center text-palacio-bronze font-bold font-cinzel">${room.price_per_night}</td>
                ))}
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-gray-400 font-cinzel text-xs">Capacity</td>
                {compareList.map(room => (
                  <td key={room.id} className="py-3 px-4 text-center text-white">{room.capacity} Guests</td>
                ))}
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-gray-400 font-cinzel text-xs">Type</td>
                {compareList.map(room => (
                  <td key={room.id} className="py-3 px-4 text-center text-white capitalize">{'room_type' in room ? 'Room' : 'Cottage'}</td>
                ))}
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4 text-gray-400 font-cinzel text-xs">Amenities</td>
                {compareList.map(room => (
                  <td key={room.id} className="py-3 px-4 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {room.amenities?.slice(0, 3).map((a: string) => (
                        <span key={a} className="text-[10px] bg-white/5 px-2 py-1 rounded-full font-cinzel">{a}</span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 px-4"></td>
                {compareList.map(room => (
                  <td key={room.id} className="py-4 px-4 text-center">
                    <button
                      onClick={() => {
                        setShowCompare(false);
                        setSelectedRoom(room);
                        setShowBookingModal(true);
                      }}
                      className="px-6 py-2 bg-palacio-bronze text-palacio-obsidian rounded-md font-cinzel text-xs font-semibold tracking-wider uppercase hover:bg-palacio-gold transition-colors"
                    >
                      Book This
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════
          BOOKING MODAL (existing, polished)
          ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false); setSelectedRoom(null); setBookingError(''); setBookingSuccess(false);
        }}
        title={selectedRoom ? `Reserve ${selectedRoom.name}` : 'Reservation'}
        footer={
          <div className="flex gap-3 w-full">
            <button
              onClick={() => { setShowBookingModal(false); setSelectedRoom(null); }}
              className="flex-1 px-4 py-3 bg-white/5 text-gray-400 rounded-lg font-cinzel text-xs hover:bg-white/10 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleBooking}
              disabled={bookingSuccess}
              className="flex-1 px-4 py-3 bg-palacio-gold text-palacio-black rounded-lg font-cinzel text-xs font-bold hover:bg-white shadow-xl shadow-palacio-gold/20 transition-all disabled:opacity-50"
            >
              {bookingSuccess ? 'Confirmed!' : 'Confirm Reservation'}
            </button>
          </div>
        }
      >
        {bookingSuccess ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="text-6xl mb-6 animate-bounce-slow">🌞</div>
            <h3 className="font-playfair text-3xl text-palacio-gold mb-3">Reservation Placed!</h3>
            <p className="text-gray-400 text-sm italic max-w-md mx-auto">
              Get your beach gear ready, we'll see you soon at Palacio de Oro.
            </p>
            <div className="mt-6 p-4 bg-palacio-gold/10 rounded-xl border border-palacio-gold/30">
              <p className="text-palacio-gold font-cinzel text-xs">Reference Number</p>
              <p className="text-white font-mono text-lg">BK{Date.now()}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {bookingError && (
              <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-300 text-xs font-bold tracking-widest uppercase text-center animate-shake">
                {bookingError}
              </div>
            )}

            {/* Room Summary */}
            {selectedRoom && (
              <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <img 
                  src={selectedRoom.image_url} 
                  alt={selectedRoom.name}
                  onError={(e) => handleImageFallback(e, 'room')}
                  className="w-20 h-20 rounded-lg object-cover" 
                />
                <div>
                  <h4 className="text-palacio-gold font-playfair">{selectedRoom.name}</h4>
                  <p className="text-gray-400 text-xs">${selectedRoom.price_per_night}/night • {selectedRoom.capacity} guests</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-cinzel text-palacio-gold tracking-widest uppercase">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-palacio-gold/60" size={16} />
                  <input
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-palacio-gold outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-cinzel text-palacio-gold tracking-widest uppercase">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-palacio-gold/60" size={16} />
                  <input
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-palacio-gold outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-cinzel text-palacio-gold tracking-widest uppercase">Guests</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-palacio-gold/60" size={16} />
                  <input
                    type="number"
                    min="1"
                    max={selectedRoom?.capacity || 10}
                    value={bookingData.guestCount}
                    onChange={(e) => setBookingData({ ...bookingData, guestCount: parseInt(e.target.value) || 1 })}
                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-palacio-gold outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-cinzel text-palacio-gold tracking-widest uppercase">Payment</label>
                <select
                  value={bookingData.paymentMethod}
                  onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value as any })}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:border-palacio-gold outline-none transition-all"
                >
                  <option value="card">💳 Credit Card</option>
                  <option value="gcash">📱 GCash</option>
                  <option value="cash">💵 Cash</option>
                </select>
              </div>
            </div>

            {/* Price Calculation */}
            {bookingData.checkIn && bookingData.checkOut && selectedRoom && (
              <div className="p-4 bg-palacio-gold/10 rounded-xl border border-palacio-gold/30">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">${selectedRoom.price_per_night} × {Math.max(1, (new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights</span>
                  <span className="text-white">${selectedRoom.price_per_night * Math.max(1, (new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24))}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-palacio-gold/20 pt-2">
                  <span className="text-palacio-gold">Total</span>
                  <span className="text-palacio-gold">${selectedRoom.price_per_night * Math.max(1, (new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24))}</span>
                </div>
              </div>
            )}

            <label className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all">
              <input
                type="checkbox"
                checked={bookingData.downpayment}
                onChange={(e) => setBookingData({ ...bookingData, downpayment: e.target.checked })}
                className="w-5 h-5 rounded accent-palacio-gold"
              />
              <div className="flex flex-col">
                <span className="text-sm font-cinzel text-white tracking-wider">Secure with Downpayment</span>
                <span className="text-xs text-gray-500 uppercase tracking-tighter italic">Pay 50% now to confirm your slot</span>
              </div>
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
