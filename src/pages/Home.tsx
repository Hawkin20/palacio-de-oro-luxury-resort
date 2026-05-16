import { useState, useEffect } from 'react';
import { 
  ArrowRight, Star, MapPin, 
  Calendar, Users, Clock, Award, Sparkles, Heart, Eye, 
  Instagram, Mail, Phone, BedDouble, UtensilsCrossed, AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Room, Cottage, MenuItem } from '../lib/types';
import StatusBadge from '../components/StatusBadge';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const testimonials = [
  {
    id: 1,
    name: "Isabella Montenegro",
    role: "Travel Blogger",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100",
    rating: 5,
    quote: "Palacio de Oro redefined luxury for me. The attention to detail is unmatched — from the gold-infused welcome drink to the panoramic ocean views.",
  },
  {
    id: 2,
    name: "James Harrington",
    role: "Business Executive",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100",
    rating: 5,
    quote: "I've stayed at resorts worldwide, but nothing compares to the personalized service here. The staff remembered my preferences from day one.",
  },
  {
    id: 3,
    name: "Sofia Dela Cruz",
    role: "Honeymoon Guest",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100",
    rating: 5,
    quote: "Our honeymoon was magical. The private beach dinner under the stars was the highlight. We'll definitely be back!",
  },
];

const instagramPhotos = [
  { id: 1, url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=400", likes: 2341 },
  { id: 2, url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400", likes: 1892 },
  { id: 3, url: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=400", likes: 3156 },
  { id: 4, url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400", likes: 2789 },
  { id: 5, url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400", likes: 4521 },
  { id: 6, url: "https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?auto=format&fit=crop&w=400", likes: 1987 },
];

const awards = [
  { name: "TripAdvisor Travelers' Choice", year: "2026", icon: "🏆" },
  { name: "Forbes Travel Guide", year: "5-Star", icon: "⭐" },
  { name: "AAA Five Diamond", year: "Award", icon: "💎" },
  { name: "Conde Nast Traveler", year: "Gold List", icon: "📖" },
];

const amenitiesList = [
  { icon: "🏊", label: "Infinity Pool" },
  { icon: "🍷", label: "Wine Cellar" },
  { icon: "🧖", label: "Spa & Wellness" },
  { icon: "🏋️", label: "Fitness Center" },
  { icon: "🚁", label: "Helipad" },
  { icon: "🎯", label: "Private Beach" },
];

export default function Home({ onNavigate }: HomeProps) {
  const [rooms, setRooms] = useState<<Room[]>([]);
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [menuItems, setMenuItems] = useState<<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [hoveredRoom, setHoveredRoom] = useState<number | null>(null);
  const [countdown, setCountdown] = useState({ days: 12, hours: 5, minutes: 43, seconds: 21 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsRes, cottagesRes, menuRes] = await Promise.all([
        supabase.from('rooms').select('*'),
        supabase.from('cottages').select('*'),
        supabase.from('menu_items').select('*').eq('is_featured', true).limit(6),
      ]);
      if (roomsRes.data) setRooms(roomsRes.data);
      if (cottagesRes.data) setCottages(cottagesRes.data);
      if (menuRes.data) setMenuItems(menuRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalAvailable = () => {
    const roomAvailable = rooms.reduce((sum, r) => sum + (r.quantity || 0), 0);
    const cottageAvailable = cottages.reduce((sum, c) => sum + (c.quantity || 0), 0);
    return roomAvailable + cottageAvailable;
  };

  const getUrgencyMessage = () => {
    const total = getTotalAvailable();
    if (total === 0) return { text: 'Fully Booked!', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' };
    if (total <= 3) return { text: `Only ${total} rooms left!`, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' };
    if (total <= 8) return { text: `${total} rooms remaining — Book now!`, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' };
    return { text: `${total} rooms available`, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' };
  };

  const getMenuOrderCount = (menuItemId: string) => {
    return menuItems.find(m => m.id === menuItemId)?.order_count || 0;
  };

  const getTopBestsellers = () => {
    const sorted = [...menuItems].sort((a, b) => (b.order_count || 0) - (a.order_count || 0));
    return sorted.slice(0, 3).map(m => m.id);
  };

  const urgency = getUrgencyMessage();
  const bestsellerIds = getTopBestsellers();
  const allAccommodations = [...rooms, ...cottages];

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-palacio-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-palacio-black">
      <div className="sticky top-0 z-50 bg-gradient-to-r from-palacio-gold via-yellow-500 to-palacio-gold text-palacio-black py-2.5 px-4 text-center font-cinzel shadow-lg">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Sparkles size={16} className="animate-pulse-slow" />
          <span className="font-bold text-sm md:text-base">SUMMER EXCLUSIVE:</span>
          <span className="text-sm hidden sm:inline">Book 3 nights, get the 4th FREE + complimentary spa session</span>
          <div className="flex items-center gap-1.5 bg-palacio-black/20 px-3 py-1 rounded-full text-xs font-mono">
            <Clock size={12} />
            <span>{countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s</span>
          </div>
        </div>
      </div>

      <div className="relative w-full min-h-[100vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80")',
            transform: `translateY(${scrollY * 0.4}px) scale(1.1)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 via-transparent to-purple-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

        <div className="relative text-center px-6 py-20 max-w-5xl mx-auto z-10">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-1.5 mb-6 animate-fade-in">
            <Award size={14} className="text-palacio-gold" />
            <span className="text-palacio-gold text-xs font-cinzel tracking-widest">LUXURY RESORT & SPA</span>
          </div>

          {/* URGENCY BANNER */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${urgency.bg} border ${urgency.border}`}>
            <AlertCircle size={16} className={urgency.color} />
            <span className={`font-bold text-sm ${urgency.color}`}>{urgency.text}</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-9xl font-playfair text-palacio-gold mb-4 drop-shadow-2xl tracking-wide">
            Palacio de Oro
          </h1>

          <p className="text-lg md:text-2xl lg:text-3xl text-white/90 font-poppins mb-4 drop-shadow-lg italic font-light">
            Where Gold Meets Summer Paradise
          </p>

          <div className="flex items-center justify-center gap-2 text-white/60 mb-12">
            <MapPin size={16} className="text-palacio-gold" />
            <span className="text-sm font-cinzel">Boracay Island, Philippines</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => onNavigate('rooms')}
              className="group relative w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-palacio-gold via-yellow-500 to-palacio-gold text-palacio-black font-cinzel font-bold text-lg md:text-xl rounded-xl shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_60px_rgba(212,175,55,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 min-w-[280px] sm:min-w-[320px]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Calendar size={20} />
                BOOK YOUR SUMMER STAY
              </span>
            </button>

            <button
              onClick={() => onNavigate('menu')}
              className="w-full sm:w-auto px-10 py-5 bg-white/5 backdrop-blur-xl border-2 border-white/60 text-white font-cinzel font-bold text-lg md:text-xl rounded-xl hover:bg-white/15 hover:border-palacio-gold hover:text-palacio-gold hover:scale-105 active:scale-95 transition-all duration-300 min-w-[280px] sm:min-w-[320px] shadow-xl group"
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles size={20} />
                EXPLORE ROOMS
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </button>
          </div>

          <div className="flex justify-center gap-8 md:gap-16 mt-16">
            {[
              { value: "4.9", label: "Guest Rating", icon: Star },
              { value: "500+", label: "Happy Guests", icon: Heart },
              { value: "24/7", label: "Concierge", icon: Clock },
            ].map((stat, i) => (
              <div key={i} className="text-center group cursor-default">
                <stat.icon size={20} className="mx-auto text-palacio-gold mb-2 group-hover:scale-125 transition-transform" />
                <div className="text-2xl md:text-3xl font-playfair text-white font-bold">{stat.value}</div>
                <div className="text-white/50 text-xs font-cinzel">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-slow cursor-pointer group">
          <span className="text-white/40 text-[10px] font-cinzel tracking-widest group-hover:text-palacio-gold transition-colors">SCROLL</span>
          <div className="w-6 h-10 border-2 border-white/30 group-hover:border-palacio-gold rounded-full flex justify-center pt-2 transition-colors">
            <div className="w-1 h-2.5 bg-palacio-gold rounded-full animate-scroll-down" />
          </div>
        </div>
      </div>

      <div className="py-8 bg-gradient-to-r from-palacio-black via-palacio-black/95 to-palacio-black border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {amenitiesList.map((amenity, i) => (
              <div key={i} className="flex items-center gap-3 group cursor-default">
                <span className="text-2xl group-hover:scale-125 transition-transform duration-300">{amenity.icon}</span>
                <span className="text-white/60 font-cinzel text-sm group-hover:text-palacio-gold transition-colors">{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-24 bg-palacio-black relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.03)_0%,transparent_70%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-palacio-gold/60 text-xs font-cinzel tracking-[0.3em] uppercase">Stay With Us</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair text-palacio-gold mt-2 mb-4">Luxury Accommodations</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
              Each room is thoughtfully designed with golden accents, premium linens, and breathtaking views.
            </p>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-palacio-gold to-transparent mx-auto mt-6" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {allAccommodations.slice(0, 8).map((item) => {
                const isHovered = hoveredRoom === item.id;
                const quantity = item.quantity || 0;
                const isAvailable = quantity > 0 && item.status === 'available';
                
                return (
                  <div
                    key={item.id}
                    className="group cursor-pointer relative"
                    style={{ 
                      transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                      transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                    onMouseEnter={() => setHoveredRoom(item.id)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    onClick={() => onNavigate('rooms')}
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 group-hover:border-palacio-gold/40 transition-all duration-500 shadow-xl group-hover:shadow-palacio-gold/10">
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        
                        {/* QUANTITY BADGE */}
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg ${
                            isAvailable
                              ? 'bg-green-500/90 text-white'
                              : 'bg-red-500/90 text-white'
                          }`}>
                            {isAvailable ? `${quantity} left` : 'Fully Booked'}
                          </span>
                        </div>

                        <div className="absolute top-4 left-4">
                          <StatusBadge status={item.status} size="sm" />
                        </div>

                        {!isAvailable && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <span className="text-red-400 font-bold text-lg font-cinzel tracking-wider">SOLD OUT</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                          <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <div className="w-16 h-16 glass-card rounded-full flex items-center justify-center mx-auto mb-3">
                              <Eye size={28} className="text-palacio-gold" />
                            </div>
                            <span className="text-white font-cinzel text-sm">Quick Preview</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-playfair text-lg text-palacio-gold group-hover:text-white transition-colors duration-300">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-1 text-yellow-400 text-xs">
                            <Star size={12} fill="currentColor" />
                            <span className="font-bold">4.9</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-gray-500 text-xs mb-4">
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {item.capacity} Guests
                          </span>
                          <span className="flex items-center gap-1">
                            <BedDouble size={12} />
                            {quantity} available
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {['WiFi', 'AC', 'Mini Bar'].map((amenity) => (
                            <span key={amenity} className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded-md border border-white/5">
                              {amenity}
                            </span>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-white/5">
                          <div>
                            <span className="text-gray-500 text-[10px] font-cinzel">FROM</span>
                            <span className="text-palacio-gold font-cinzel font-bold text-xl ml-1">
                              ${item.price_per_night}
                            </span>
                            <span className="text-gray-600 text-[10px]">/NIGHT</span>
                          </div>
                          <span className={`text-xs font-cinzel flex items-center gap-1 group-hover:gap-2 transition-all ${
                            isAvailable ? 'text-palacio-gold' : 'text-gray-500'
                          }`}>
                            {isAvailable ? 'VIEW DETAILS' : 'UNAVAILABLE'}
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="py-16 border-y border-white/5 bg-gradient-to-r from-palacio-black via-palacio-black/90 to-palacio-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 hover:opacity-100 transition-opacity duration-700">
            {awards.map((award, i) => (
              <div key={i} className="flex items-center gap-3 group cursor-default grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110">
                <span className="text-3xl">{award.icon}</span>
                <div>
                  <div className="text-white font-cinzel font-bold text-sm">{award.name}</div>
                  <div className="text-palacio-gold text-xs">{award.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURED MENU SECTION */}
      <div className="py-24 bg-gradient-to-b from-palacio-black via-orange-900/10 to-palacio-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-palacio-gold/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-palacio-gold/60 text-xs font-cinzel tracking-[0.3em] uppercase">Culinary Excellence</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair text-palacio-gold mt-2 mb-4">Signature Dishes</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
              Savor the finest flavors crafted by our world-renowned chefs.
            </p>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-palacio-gold to-transparent mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.slice(0, 4).map((item) => {
              const orderCount = item.order_count || 0;
              const isBestseller = bestsellerIds.includes(item.id);
              
              return (
                <div key={item.id} className="group cursor-pointer" onClick={() => onNavigate('menu')}>
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 group-hover:border-palacio-gold/40 transition-all duration-500 shadow-xl">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      {/* BESTSELLER BADGE */}
                      {isBestseller && (
                        <div className="absolute top-3 left-3 px-3 py-1.5 bg-palacio-gold text-palacio-black rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
                          <Star size={12} fill="currentColor" /> BESTSELLER
                        </div>
                      )}

                      {/* AVAILABLE BADGE */}
                      {!item.available && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <span className="text-red-400 font-bold font-cinzel">UNAVAILABLE</span>
                        </div>
                      )}

                      {/* ORDER COUNT */}
                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 rounded text-xs text-gray-300">
                        {orderCount} sold
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-playfair text-palacio-gold text-lg">{item.name}</h3>
                        <span className="text-palacio-gold font-cinzel font-bold">${item.price}</span>
                      </div>
                      <p className="text-gray-400 text-xs capitalize mb-3">{item.category}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.available 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {item.available ? 'Available' : 'Not Available'}
                        </span>
                        <span className="text-palacio-gold text-xs font-cinzel flex items-center gap-1 group-hover:gap-2 transition-all">
                          ORDER NOW <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="py-24 bg-gradient-to-b from-palacio-black via-orange-900/10 to-palacio-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-palacio-gold/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-palacio-gold/60 text-xs font-cinzel tracking-[0.3em] uppercase">Guest Stories</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair text-palacio-gold mt-2 mb-4">What Our Guests Say</h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-palacio-gold to-transparent mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="relative p-8 rounded-3xl glass-card hover:border-palacio-gold/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(212,175,55,0.1)] group"
              >
                <div className="absolute top-6 right-8 text-7xl text-palacio-gold/10 font-serif leading-none">"</div>
                
                <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-300 italic mb-8 leading-relaxed text-sm md:text-base relative z-10">
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={t.avatar} 
                      alt={t.name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-palacio-gold/50 group-hover:border-palacio-gold transition-colors"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-palacio-black" />
                  </div>
                  <div>
                    <h4 className="text-palacio-gold font-cinzel font-bold">{t.name}</h4>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-24 bg-palacio-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-palacio-gold/60 text-xs font-cinzel tracking-[0.3em] uppercase">Follow Us</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-playfair text-palacio-gold mt-2 mb-4">@PalacioDeOro</h2>
            <p className="text-gray-400 text-sm">Share your golden moments with us</p>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-palacio-gold to-transparent mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {instagramPhotos.map((photo) => (
              <div 
                key={photo.id} 
                className="relative aspect-square group overflow-hidden rounded-xl cursor-pointer"
              >
                <img 
                  src={photo.url} 
                  alt={`Instagram ${photo.id}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2">
                  <Heart size={24} className="text-white fill-white" />
                  <span className="text-white font-cinzel text-sm">{photo.likes.toLocaleString()} likes</span>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Instagram size={16} className="text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20 bg-gradient-to-b from-palacio-black to-palacio-black/95 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Sparkles size={32} className="mx-auto text-palacio-gold mb-4" />
          <h3 className="text-3xl md:text-4xl font-playfair text-palacio-gold mb-3">Join the Golden Circle</h3>
          <p className="text-gray-400 text-sm mb-8">Subscribe for exclusive offers, early access to seasonal packages, and insider perks.</p>
          
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-palacio-gold/50 focus:ring-1 focus:ring-palacio-gold/30 transition-all font-cinzel text-sm"
            />
            <button className="px-8 py-4 bg-palacio-gold text-palacio-black font-cinzel font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]">
              SUBSCRIBE
            </button>
          </div>
          
          <p className="text-gray-600 text-[10px] mt-4">By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.</p>
        </div>
      </div>

      <footer className="bg-palacio-black border-t border-white/5 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-palacio-gold font-playfair text-xl mb-4">Palacio de Oro</h4>
              <p className="text-gray-500 text-sm leading-relaxed">Where Gold Meets Comfort. Experience luxury like never before.</p>
            </div>
            <div>
              <h5 className="text-palacio-gold font-cinzel text-sm mb-4">QUICK LINKS</h5>
              <ul className="space-y-2">
                <li><button onClick={() => onNavigate('about')} className="text-gray-500 text-sm hover:text-palacio-gold transition-colors">About Us</button></li>
                <li><button onClick={() => onNavigate('privacy')} className="text-gray-500 text-sm hover:text-palacio-gold transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => onNavigate('terms')} className="text-gray-500 text-sm hover:text-palacio-gold transition-colors">Terms & Conditions</button></li>
              </ul>
            </div>
            <div>
              <h5 className="text-palacio-gold font-cinzel text-sm mb-4">SERVICES</h5>
              <ul className="space-y-2">
                <li><button onClick={() => onNavigate('rooms')} className="text-gray-500 text-sm hover:text-palacio-gold transition-colors">Room Booking</button></li>
                <li><button onClick={() => onNavigate('menu')} className="text-gray-500 text-sm hover:text-palacio-gold transition-colors">Fine Dining</button></li>
                <li><button onClick={() => onNavigate('events')} className="text-gray-500 text-sm hover:text-palacio-gold transition-colors">Events</button></li>
              </ul>
            </div>
            <div>
              <h5 className="text-palacio-gold font-cinzel text-sm mb-4">CONTACT</h5>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-500 text-sm">
                  <Mail size={14} className="text-palacio-gold" />
                  reservations@palaciodeoro.com
                </li>
                <li className="flex items-center gap-2 text-gray-500 text-sm">
                  <Phone size={14} className="text-palacio-gold" />
                  +63 912 345 6789
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 text-center">
            <p className="text-gray-600 text-sm"> 2026 Palacio de Oro. All rights reserved.</p>
            <p className="text-gray-700 text-[10px] mt-2 font-cinzel tracking-wider">
              DEVELOPED BY VINCENT ECALDRE | EDUCATIONAL PROJECT
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
