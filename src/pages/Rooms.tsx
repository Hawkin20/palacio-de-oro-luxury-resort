import { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Users, X, Info, Search, MapPin, Star, 
  Wifi, Wind, Droplets, Tv, Coffee, Car, Waves,
  ChevronLeft, ChevronRight, Heart, Share2, Check, Copy,
  ArrowRight, Sparkles, Shield, Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchCatalogResilient } from '../lib/resilientFetch';
import { Room, Cottage, Booking } from '../lib/types';
import GlassCard from '../components/GlassCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { handleImageFallback } from '../lib/images';
import { useCurrency } from '../lib/currency';

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
  const { formatPrice } = useCurrency();
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
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);
  const [confirmedNights, setConfirmedNights] = useState<number>(1);
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);
  const [copiedRef, setCopiedRef] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const getNextDay = (dateStr: string) => {
    if (!dateStr) return today;
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const calculateNights = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  // ─── DATA FETCHING ─────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, [isLoggedIn]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsData, cottagesData] = await Promise.all([
        fetchCatalogResilient<Room>('rooms'),
        fetchCatalogResilient<Cottage>('cottages'),
      ]);

      if (roomsData.length > 0) setRooms(roomsData);
      if (cottagesData.length > 0) setCottages(cottagesData);
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
    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    if (checkOutDate <= checkInDate) {
      setBookingError('Check-out date must be at least one day after check-in date');
      return;
    }

    try {
      const nights = calculateNights(bookingData.checkIn, bookingData.checkOut);
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

      setConfirmedRef(refNumber);
      setConfirmedNights(nights);
      setConfirmedTotal(totalPrice);
      setBookingSuccess(true);
      setBookingError('');
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
                                {formatPrice(item.price_per_night)}
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
                  <p className="text-3xl font-playfair text-palacio-bronze">{formatPrice(quickViewRoom.price_per_night)}</p>
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
                  <td key={room.id} className="py-3 px-4 text-center text-palacio-bronze font-bold font-cinzel">{formatPrice(room.price_per_night)}</td>
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
          BOOKING MODAL (Quiet Luxury Editorial)
          ═══════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false); 
          setSelectedRoom(null); 
          setBookingError(''); 
          setBookingSuccess(false);
          setConfirmedRef(null);
        }}
        title={selectedRoom ? `Reserve ${selectedRoom.name}` : 'Reservation'}
        footer={
          bookingSuccess ? (
            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedRoom(null);
                  setBookingSuccess(false);
                  setConfirmedRef(null);
                  setBookingData({ checkIn: '', checkOut: '', guestCount: 1, paymentMethod: 'card', downpayment: false });
                }}
                className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-palacio-alabaster/70 rounded-lg font-cinzel text-xs uppercase tracking-wider hover:bg-white/[0.08] hover:text-palacio-alabaster transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedRoom(null);
                  setBookingSuccess(false);
                  setConfirmedRef(null);
                  setBookingData({ checkIn: '', checkOut: '', guestCount: 1, paymentMethod: 'card', downpayment: false });
                  onNavigate('bookings');
                }}
                className="flex-1 px-4 py-3 bg-palacio-bronze text-palacio-obsidian rounded-lg font-cinzel text-xs font-semibold uppercase tracking-wider hover:bg-palacio-gold shadow-xl transition-all"
              >
                View in My Bookings
              </button>
            </div>
          ) : (
            <div className="flex gap-3 w-full">
              <button
                onClick={() => { setShowBookingModal(false); setSelectedRoom(null); setBookingError(''); }}
                className="flex-1 px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-palacio-alabaster/70 rounded-lg font-cinzel text-xs uppercase tracking-wider hover:bg-white/[0.08] hover:text-palacio-alabaster transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                className="flex-1 px-4 py-3 bg-palacio-bronze text-palacio-obsidian rounded-lg font-cinzel text-xs font-semibold uppercase tracking-widest hover:bg-palacio-gold shadow-xl shadow-palacio-bronze/10 transition-all"
              >
                Confirm Reservation
              </button>
            </div>
          )
        }
      >
        {bookingSuccess ? (
          <div className="text-center py-6 px-2 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-palacio-bronze/10 border border-palacio-bronze/30 flex items-center justify-center mx-auto mb-5">
              <Check size={28} className="text-palacio-bronze" />
            </div>
            
            <span className="text-[10px] font-cinzel tracking-[0.25em] uppercase text-palacio-bronze block mb-1">
              Confirmed Reservation
            </span>
            <h3 className="font-playfair text-2xl md:text-3xl text-palacio-alabaster mb-2">
              Your Sanctuary Awaits
            </h3>
            <p className="text-palacio-alabaster/70 text-xs italic max-w-sm mx-auto mb-6 leading-relaxed font-light">
              Your stay at Palacio de Oro is secured. A confirmation notice has been recorded in your guest account.
            </p>

            {/* Reference Card */}
            <div className="bg-white/[0.03] rounded-xl border border-white/[0.08] p-4 mb-6 text-left space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <span className="text-[10px] font-cinzel uppercase tracking-wider text-palacio-alabaster/60">
                  Booking Reference
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-palacio-bronze text-sm">
                    #{confirmedRef}
                  </span>
                  <button
                    onClick={() => {
                      if (confirmedRef) {
                        navigator.clipboard.writeText(confirmedRef);
                        setCopiedRef(true);
                        setTimeout(() => setCopiedRef(false), 2000);
                      }
                    }}
                    className="p-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-palacio-alabaster/60 hover:text-palacio-alabaster transition-colors"
                    title="Copy reference"
                  >
                    {copiedRef ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-palacio-alabaster/50 font-cinzel block uppercase">Suite / Room</span>
                  <span className="text-palacio-alabaster font-medium">{selectedRoom?.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-palacio-alabaster/50 font-cinzel block uppercase">Duration</span>
                  <span className="text-palacio-alabaster">{confirmedNights} night{confirmedNights > 1 ? 's' : ''}</span>
                </div>
                <div>
                  <span className="text-[10px] text-palacio-alabaster/50 font-cinzel block uppercase">Dates</span>
                  <span className="text-palacio-alabaster font-mono text-[11px]">{bookingData.checkIn} → {bookingData.checkOut}</span>
                </div>
                <div>
                  <span className="text-[10px] text-palacio-alabaster/50 font-cinzel block uppercase">Total Amount</span>
                  <span className="text-palacio-bronze font-cinzel font-bold text-sm">{formatPrice(confirmedTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {bookingError && (
              <div className="p-3.5 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs font-semibold tracking-wider uppercase text-center animate-shake">
                {bookingError}
              </div>
            )}

            {/* Room Summary Header */}
            {selectedRoom && (
              <div className="flex gap-4 p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                <img 
                  src={selectedRoom.image_url} 
                  alt={selectedRoom.name}
                  onError={(e) => handleImageFallback(e, 'room')}
                  className="w-16 h-16 rounded-lg object-cover" 
                />
                <div className="flex flex-col justify-center">
                  <h4 className="text-palacio-alabaster font-playfair text-base">{selectedRoom.name}</h4>
                  <p className="text-palacio-alabaster/60 text-xs">
                    <span className="text-palacio-bronze font-cinzel font-bold">{formatPrice(selectedRoom.price_per_night)}</span> / night • Max {selectedRoom.capacity} guests
                  </p>
                </div>
              </div>
            )}

            {/* Date Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-cinzel text-palacio-bronze tracking-widest uppercase">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-palacio-bronze/60" size={15} />
                  <input
                    type="date"
                    min={today}
                    value={bookingData.checkIn}
                    onChange={(e) => {
                      const newIn = e.target.value;
                      let newOut = bookingData.checkOut;
                      if (!newOut || newOut <= newIn) {
                        newOut = getNextDay(newIn);
                      }
                      setBookingData({ ...bookingData, checkIn: newIn, checkOut: newOut });
                    }}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-lg text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-cinzel text-palacio-bronze tracking-widest uppercase">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-palacio-bronze/60" size={15} />
                  <input
                    type="date"
                    min={getNextDay(bookingData.checkIn)}
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-lg text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Guests & Payment Method */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-cinzel text-palacio-bronze tracking-widest uppercase">Guests</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-palacio-bronze/60" size={15} />
                  <input
                    type="number"
                    min="1"
                    max={selectedRoom?.capacity || 10}
                    value={bookingData.guestCount}
                    onChange={(e) => setBookingData({ ...bookingData, guestCount: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-lg text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-cinzel text-palacio-bronze tracking-widest uppercase">Payment Method</label>
                <select
                  value={bookingData.paymentMethod}
                  onChange={(e) => setBookingData({ ...bookingData, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-lg text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none transition-all"
                >
                  <option value="card" className="bg-palacio-obsidian text-palacio-alabaster">💳 Credit / Debit Card</option>
                  <option value="gcash" className="bg-palacio-obsidian text-palacio-alabaster">📱 GCash</option>
                  <option value="cash" className="bg-palacio-obsidian text-palacio-alabaster">💵 Cash upon Arrival</option>
                </select>
              </div>
            </div>

            {/* Transparent Price Calculation */}
            {bookingData.checkIn && bookingData.checkOut && selectedRoom && (
              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] space-y-2">
                {(() => {
                  const nights = calculateNights(bookingData.checkIn, bookingData.checkOut);
                  const subtotal = selectedRoom.price_per_night * nights;
                  const downpaymentAmount = subtotal * 0.5;

                  return (
                    <>
                      <div className="flex justify-between text-xs text-palacio-alabaster/70">
                        <span>{formatPrice(selectedRoom.price_per_night)} × {nights} night{nights > 1 ? 's' : ''}</span>
                        <span className="font-mono text-palacio-alabaster">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-palacio-alabaster/70">
                        <span>Resort Services & Amenities</span>
                        <span className="text-emerald-400 font-cinzel text-[10px] uppercase">Complimentary</span>
                      </div>
                      
                      {bookingData.downpayment && (
                        <div className="pt-2 border-t border-white/[0.06] flex justify-between text-xs text-palacio-bronze">
                          <span>Deposit Due Now (50%)</span>
                          <span className="font-mono font-semibold">{formatPrice(downpaymentAmount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-base font-semibold border-t border-white/[0.08] pt-2">
                        <span className="font-cinzel text-palacio-alabaster text-xs tracking-wider uppercase">Estimated Total</span>
                        <span className="font-cinzel text-palacio-bronze text-xl">{formatPrice(subtotal)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Downpayment Checkbox */}
            <label className="flex items-start gap-3 p-3.5 bg-white/[0.02] rounded-xl border border-white/[0.06] cursor-pointer hover:bg-white/[0.04] transition-all">
              <input
                type="checkbox"
                checked={bookingData.downpayment}
                onChange={(e) => setBookingData({ ...bookingData, downpayment: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded accent-palacio-bronze"
              />
              <div className="flex flex-col">
                <span className="text-xs font-cinzel text-palacio-alabaster tracking-wider">Secure with 50% Downpayment</span>
                <span className="text-[11px] text-palacio-alabaster/50 leading-relaxed font-light">Pay half today to guarantee your reservation, pay remaining upon arrival</span>
              </div>
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
