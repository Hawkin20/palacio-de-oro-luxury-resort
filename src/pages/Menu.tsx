import { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, ArrowRight, Star, MapPin, 
  Calendar, Users, Clock, Award, Sparkles, Heart, Eye, 
  Instagram, Mail, Phone, Shield, CheckCircle2, Flame,
  BedDouble, UtensilsCrossed, Wine, Sun, ThermometerSun,
  Droplets, Wind, ChevronDown, Menu, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Room, MenuItem } from '../lib/types';
import StatusBadge from '../components/StatusBadge';

interface HomeProps {
  onNavigate: (page: string) => void;
  userId?: string;
}

// ─── MOCK DATA ───────────────────────────────────────────────────────
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

export default function Home({ onNavigate, userId }: HomeProps) {
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [bestsellers, setBestsellers] = useState<MenuItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [countdown, setCountdown] = useState({ days: 12, hours: 5, minutes: 43, seconds: 21 });
  const [hoveredRoom, setHoveredRoom] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingsLastHour, setBookingsLastHour] = useState(3);

  // ─── FETCH USER ROLE ──────────────────────────────────────────────
  useEffect(() => {
    if (userId) {
      supabase.from('users').select('role').eq('id', userId).single()
        .then(({ data }) => setUserRole(data?.role || ''));
    }
  }, [userId]);

  // ─── SCROLL PARALLAX ──────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── COUNTDOWN TIMER ──────────────────────────────────────────────
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

  // ─── DATA FETCHING ─────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
    const autoSlide = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(autoSlide);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menuRes, roomsRes] = await Promise.all([
        supabase.from('menu_items').select('*').eq('available', true).limit(10),
        supabase.from('rooms').select('*').limit(4),
      ]);

      if (menuRes.data) {
        const featured = menuRes.data.filter((item) => item.is_featured);
        const best = menuRes.data.filter((item) => item.is_bestseller);
        setFeaturedItems(featured.slice(0, 3));
        setBestsellers(best.slice(0, 3));
      }

      if (roomsRes.data) {
        setRooms(roomsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── ADMIN BLOCK FOR ADD TO ORDER ─────────────────────────────────
  const handleAddToOrder = (e: React.MouseEvent) => {
    if (userRole === 'admin') {
      e.stopPropagation();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    onNavigate('menu');
  };

  const tabs = [
    { title: 'Summer Featured', items: featuredItems, icon: Sparkles },
    { title: 'Best Sellers', items: bestsellers, icon: Star },
    { title: 'Chef\'s Specials', items: featuredItems, icon: Award },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % 3);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + 3) % 3);

  const navLinks = [
    { label: 'HOME', page: 'home' },
    { label: 'ROOMS', page: 'rooms' },
    { label: 'MENU', page: 'menu' },
    { label: 'BOOKINGS', page: 'bookings' },
    { label: 'CONTACT', page: 'contact' },
    { label: 'ADMIN', page: 'admin' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a]">
      {/* Admin Block Toast */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-fade-in-up">
          <div className="px-6 py-3 bg-red-500/90 backdrop-blur-sm text-white rounded-full font-cinzel text-xs font-bold shadow-2xl flex items-center gap-2">
            <Shield size={16} />
            Admin accounts cannot place orders
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl md:hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <div className="w-10 h-10 rounded-xl bg-palacio-gold flex items-center justify-center">
                <span className="text-palacio-black font-playfair font-bold text-xl">P</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => { onNavigate(link.page); setMobileMenuOpen(false); }}
                  className="block w-full text-left py-4 px-4 text-lg font-cinzel tracking-widest text-white/80 hover:text-palacio-gold hover:bg-white/5 rounded-xl transition-all"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STICKY PROMO BANNER
          ═══════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-palacio-gold via-yellow-500 to-palacio-gold text-palacio-black py-2.5 px-4 text-center font-cinzel shadow-lg">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Sparkles size={16} className="animate-pulse" />
          <span className="font-bold text-sm md:text-base">SUMMER EXCLUSIVE:</span>
          <span className="text-sm hidden sm:inline">Book 3 nights, get the 4th FREE + complimentary spa session</span>
          <div className="flex items-center gap-1.5 bg-palacio-black/20 px-3 py-1 rounded-full text-xs font-mono">
            <Clock size={12} />
            <span>{countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════════ */}
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

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => {
            const size = 1 + Math.random() * 3;
            return (
              <div
                key={i}
                className="absolute rounded-full animate-float"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: `radial-gradient(circle, rgba(212,175,55,${0.4 + Math.random() * 0.6}) 0%, transparent 70%)`,
                  boxShadow: `0 0 ${size * 4}px rgba(212,175,55,0.3)`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${5 + Math.random() * 7}s`,
                }}
              />
            );
          })}
        </div>

        {/* Weather Widget */}
        <div className="absolute top-24 right-4 md:right-12 z-20 glass-card p-4 text-center animate-fade-in border border-white/10">
          <div className="flex items-center justify-center mb-1">
            <Sun size={28} className="text-yellow-400" />
          </div>
          <div className="text-palacio-gold font-cinzel font-bold text-xl">29°C</div>
          <div className="text-white/70 text-xs flex items-center justify-center gap-1">
            <ThermometerSun size={12} />
            Sunny
          </div>
          <div className="text-white/50 text-[10px] mt-1 flex items-center justify-center gap-1">
            <Droplets size={10} />
            Humidity 65%
          </div>
          <div className="text-palacio-gold/60 text-[10px] mt-1 flex items-center justify-center gap-1">
            <Wind size={10} />
            Perfect beach weather!
          </div>
        </div>

        {/* Live Booking Indicator */}
        <div className="absolute top-24 left-4 md:left-12 z-20 animate-fade-in">
          <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-pulse flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            <Flame size={14} />
            {bookingsLastHour} rooms booked in the last hour
          </div>
        </div>

        {/* Main Content */}
        <div className="relative text-center px-6 py-20 max-w-5xl mx-auto z-10">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-1.5 mb-8 animate-fade-in border border-palacio-gold/20">
            <Award size={14} className="text-palacio-gold" />
            <span className="text-palacio-gold text-xs font-cinzel tracking-widest">LUXURY RESORT & SPA</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-9xl font-playfair text-palacio-gold mb-4 drop-shadow-2xl tracking-wide">
            {"Palacio".split("").map((char, i) => (
              <span key={i} className="inline-block animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                {char}
              </span>
            ))}
            <span className="inline-block mx-2 md:mx-4" />
            {"de Oro".split("").map((char, i) => (
              <span key={`oro-${i}`} className="inline-block animate-slide-up" style={{ animationDelay: `${(i + 7) * 0.08}s` }}>
                {char}
              </span>
            ))}
          </h1>

          <p className="text-lg md:text-2xl lg:text-3xl text-white/90 font-poppins mb-4 drop-shadow-lg italic font-light animate-slide-up-delay">
            Where Gold Meets Summer Paradise
          </p>

          <div className="flex items-center justify-center gap-2 text-white/60 mb-12 animate-slide-up-delay-2">
            <MapPin size={16} className="text-palacio-gold" />
            <span className="text-sm font-cinzel">Boracay Island, Philippines</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up-delay-2">
            <button
              onClick={() => onNavigate('rooms')}
              className="group relative w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-palacio-gold via-yellow-500 to-palacio-gold text-palacio-black font-cinzel font-bold text-lg md:text-xl rounded-xl shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_60px_rgba(212,175,55,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 min-w-[280px] sm:min-w-[320px] overflow-hidden"
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
                <UtensilsCrossed size={20} />
                SUMMER MENU
                <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex justify-center gap-8 md:gap-16 mt-16 animate-fade-in">
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

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce cursor-pointer group">
          <span className="text-white/40 text-[10px] font-cinzel tracking-widest group-hover:text-palacio-gold transition-colors">SCROLL</span>
          <div className="w-6 h-10 border-2 border-white/30 group-hover:border-palacio-gold rounded-full flex justify-center pt-2 transition-colors">
            <div className="w-1 h-2.5 bg-palacio-gold rounded-full animate-scroll-down" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          AMENITIES STRIP
          ═══════════════════════════════════════════════════════════════ */}
      <div className="py-8 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/95 to-[#0a0a0a] border-y border-white/5">
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

      {/* ═══════════════════════════════════════════════════════════════
          SUMMER HIGHLIGHTS — Tabbed with Progress
          ═══════════════════════════════════════════════════════════════ */}
      <div className="py-24 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/95 to-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-palacio-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <span className="text-palacio-gold/60 text-xs font-cinzel tracking-[0.3em] uppercase">Culinary Excellence</span>
            <h2 className="section-title mt-2">Summer Highlights</h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-palacio-gold to-transparent mx-auto" />
          </div>

          <div className="flex justify-center gap-3 mb-10 flex-wrap">
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => { setActiveTab(i); setCurrentSlide(0); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-cinzel text-sm transition-all duration-300 ${
                  activeTab === i
                    ? 'bg-palacio-gold text-palacio-black shadow-[0_0_20px_rgba(212,175,55,0.3)] scale-105'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                <tab.icon size={16} />
                {tab.title}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4 animate-pulse">
                  <div className="h-56 bg-white/5 rounded-xl mb-4" />
                  <div className="h-6 bg-white/5 rounded mb-2 w-3/4" />
                  <div className="h-4 bg-white/5 rounded mb-4 w-full" />
                  <div className="flex justify-between">
                    <div className="h-6 bg-white/5 rounded w-1/3" />
                    <div className="h-8 bg-white/5 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="glass-card p-6 md:p-10 min-h-[400px] relative overflow-hidden rounded-3xl border border-white/10">
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 rounded-t-3xl overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-palacio-gold to-yellow-400 transition-all duration-500"
                    style={{ width: `${((currentSlide + 1) / 3) * 100}%` }}
                  />
                </div>

                <div className="animate-fade-in">
                  <h3 className="text-2xl md:text-3xl font-playfair text-palacio-gold mb-8 flex items-center gap-3">
                    <Sparkles size={24} className="animate-pulse" />
                    {tabs[activeTab]?.title}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {tabs[activeTab]?.items?.map((item, index) => (
                      <div
                        key={item.id}
                        className="group cursor-pointer"
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        <div className="relative overflow-hidden rounded-2xl shadow-2xl group-hover:shadow-palacio-gold/20 transition-all duration-500 aspect-[4/3]">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <div className="absolute bottom-4 left-4 right-4">
                              <button
                                onClick={() => onNavigate('menu')}
                                className="w-full py-3 bg-palacio-gold text-palacio-black font-cinzel font-bold rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2"
                              >
                                <Eye size={16} />
                                View Details
                              </button>
                            </div>
                          </div>

                          {item.is_bestseller && (
                            <div className="absolute top-3 right-3 bg-palacio-gold text-palacio-black px-3 py-1.5 rounded-full text-xs font-cinzel font-bold shadow-lg animate-pulse flex items-center gap-1">
                              <Star size={12} fill="currentColor" />
                              BESTSELLER
                            </div>
                          )}
                          {item.is_featured && (
                            <div className="absolute top-3 left-3 bg-black/80 text-palacio-gold px-3 py-1.5 rounded-full text-xs font-cinzel border border-palacio-gold/30">
                              FEATURED
                            </div>
                          )}

                          {item.is_new && (
                            <div className="absolute top-3 left-3 bg-emerald-500/90 text-white px-3 py-1.5 rounded-full text-xs font-cinzel font-bold shadow-lg">
                              NEW
                            </div>
                          )}

                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
                            <div className="w-14 h-14 glass-card rounded-full flex items-center justify-center">
                              <Eye size={24} className="text-palacio-gold" />
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 px-1">
                          <h4 className="font-playfair text-xl text-palacio-gold mt-4 group-hover:text-white transition-colors duration-300">
                            {item.name}
                          </h4>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-baseline gap-1">
                              <span className="text-palacio-gold font-cinzel font-bold text-2xl">
                                ${item.price}
                              </span>
                              {item.original_price && (
                                <span className="text-gray-600 line-through text-sm">${item.original_price}</span>
                              )}
                            </div>
                            <button
                              onClick={handleAddToOrder}
                              className={`px-5 py-2.5 rounded-full text-sm font-cinzel transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                                userRole === 'admin'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed'
                                  : 'bg-palacio-gold/20 text-palacio-gold border border-palacio-gold/50 hover:bg-palacio-gold hover:text-palacio-black'
                              }`}
                            >
                              <Heart size={14} />
                              {userRole === 'admin' ? 'Admin Only' : 'Add to Order'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-14 p-4 bg-black/70 hover:bg-palacio-gold rounded-full transition-all duration-300 border border-palacio-gold/50 shadow-lg hover:scale-110 active:scale-95 z-10 group"
              >
                <ChevronLeft size={28} className="text-palacio-gold group-hover:text-palacio-black transition-colors" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-14 p-4 bg-black/70 hover:bg-palacio-gold rounded-full transition-all duration-300 border border-palacio-gold/50 shadow-lg hover:scale-110 active:scale-95 z-10 group"
              >
                <ChevronRight size={28} className="text-palacio-gold group-hover:text-palacio-black transition-colors" />
              </button>

              <div className="flex justify-center gap-3 mt-8">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2.5 rounded-full transition-all duration-500 hover:scale-125 ${
                      currentSlide === index 
                        ? 'bg-palacio-gold w-8 shadow-[0_0_10px_rgba(212,175,55,0.5)]' 
                        : 'bg-white/20 w-2.5 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          LUXURY ACCOMMODATIONS
          ═══════════════════════════════════════════════════════════════ */}
      <div className="py-24 bg-[#0a0a0a] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.03)_0%,transparent_70%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-palacio-gold/60 text-xs font-cinzel tracking-[0.3em] uppercase">Stay With Us</span>
            <h2 className="section-title mt-2">Luxury Accommodations</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
              Each room is thoughtfully designed with golden accents, premium linens, and breathtaking views.
            </p>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-palacio-gold to-transparent mx-auto mt-6" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4 animate-pulse">
                  <div className="h-56 bg-white/5 rounded-xl mb-4" />
                  <div className="h-6 bg-white/5 rounded mb-2 w-3/4" />
                  <div className="h-4 bg-white/5 rounded mb-4 w-full" />
                  <div className="flex justify-between">
                    <div className="h-6 bg-white/5 rounded w-1/3" />
                    <div className="h-8 bg-white/5 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {rooms.map((room, index) => {
                  const isHovered = hoveredRoom === room.id;
                  return (
                    <div
                      key={room.id}
                      className="group cursor-pointer relative"
                      style={{ 
                        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        animationDelay: `${index * 100}ms`,
                      }}
                      onMouseEnter={() => setHoveredRoom(room.id)}
                      onMouseLeave={() => setHoveredRoom(null)}
                      onClick={() => onNavigate('rooms')}
                    >
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 group-hover:border-palacio-gold/40 transition-all duration-500 shadow-xl group-hover:shadow-palacio-gold/10">
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={room.image_url}
                            alt={room.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                          
                          <div className="absolute top-4 right-4 bg-palacio-gold text-palacio-black px-4 py-2 rounded-xl font-cinzel font-bold text-sm shadow-lg transform rotate-2 group-hover:rotate-0 transition-transform duration-300">
                            ${room.price_per_night}
                            <span className="text-[10px] font-normal block">/night</span>
                          </div>

                          <div className="absolute top-4 left-4">
                            <StatusBadge status={room.status} size="sm" />
                          </div>

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
                              {room.name}
                            </h3>
                            <div className="flex items-center gap-1 text-yellow-400 text-xs">
                              <Star size={12} fill="currentColor" />
                              <span className="font-bold">4.9</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-gray-500 text-xs mb-4">
                            <span className="flex items-center gap-1">
                              <Users size={12} />
                              {room.capacity} Guests
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              Ocean View
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {['WiFi', 'AC', 'Mini Bar', 'Balcony'].slice(0, 3).map((amenity) => (
                              <span key={amenity} className="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded-md border border-white/5">
                                {amenity}
                              </span>
                            ))}
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-white/5">
                            <div>
                              <span className="text-gray-500 text-[10px] font-cinzel">FROM</span>
                              <span className="text-palacio-gold font-cinzel font-bold text-xl ml-1">
                                ${room.price_per_night}
                              </span>
                              <span className="text-gray-600 text-[10px]">/NIGHT</span>
                            </div>
                            <span className="text-xs font-cinzel text-palacio-gold flex items-center gap-1 group-hover:gap-2 transition-all">
                              VIEW DETAILS
                              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-14">
                <button
                  onClick={() => onNavigate('rooms')}
                  className="group relative px-10 py-4 bg-transparent border-2 border-palacio-gold text-palacio-gold font-cinzel font-bold rounded-full hover:bg-palacio-gold hover:text-palacio-black transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] active:scale-95 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    VIEW ALL ACCOMMODATIONS
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════════════════════════════ */}
      <div className="py-24 bg-gradient-to-b from-[#0a0a0a] via-orange-900/10 to-[#0a0a0a] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-palacio-gold/5 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-palacio-gold/60 text-xs font-cinzel tracking-[0.3em] uppercase">Guest Stories</span>
            <h2 className="section-title mt-2">What Our Guests Say</h2>
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
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-[#0a0a0a]" />
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

      {/* ═══════════════════════════════════════════════════════════════
          AWARDS STRIP
          ═══════════════════════════════════════════════════════════════ */}
      <div className="py-16 border-y border-white/5 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 hover:opacity-100 transition-opacity duration-700">
            {awards.map((award, i) => (
              <div key={i} className="flex items-center gap-3 group cursor-default grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110">
                <span className="text-3xl group-hover:animate-bounce">{award.icon}</span>
                <div>
                  <div className="text-white font-cinzel font-bold text-sm">{award.name}</div>
                  <div className="text-palacio-gold text-xs">{award.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          INSTAGRAM GALLERY
          ═══════════════════════════════════════════════════════════════ */}
      <div className="py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-palacio-gold/60 text-xs font-cinzel tracking-[0.3em] uppercase">Follow Us</span>
            <h2 className="section-title mt-2">@PalacioDeOro</h2>
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

          <div className="text-center mt-10">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-palacio-gold/60 hover:text-palacio-gold font-cinzel text-sm transition-colors"
            >
              <Instagram size={16} />
              Follow us on Instagram
            </a>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SERVICES FOOTER
          ═══════════════════════════════════════════════════════════════ */}
      <div className="py-24 bg-gradient-to-t from-orange-900/20 via-[#0a0a0a] to-[#0a0a0a] border-t border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.05)_0%,transparent_70%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🏖️', title: 'Summer Paradise', desc: 'Experience the ultimate beach getaway with our seasonal packages featuring private cabanas and sunset cruises.' },
              { icon: '🍸', title: 'Sky Lounge', desc: 'Cool off with our signature summer cocktails and gourmet appetizers while overlooking the crystal-clear waters.' },
              { icon: '✨', title: 'Gold Standard', desc: 'Uncompromising luxury and personalized service for every guest, from arrival champagne to 24/7 concierge.' },
            ].map((service) => (
              <div
                key={service.title}
                className="text-center p-10 rounded-3xl glass-card hover:border-palacio-gold/30 transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_30px_60px_rgba(212,175,55,0.12)] group"
              >
                <div className="text-5xl mb-6 inline-block p-5 rounded-2xl bg-gradient-to-br from-palacio-gold/20 to-orange-400/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  {service.icon}
                </div>
                <h3 className="font-playfair text-2xl text-palacio-gold mb-4 group-hover:text-white transition-colors">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{service.desc}</p>
                
                <button className="mt-6 text-palacio-gold/60 text-xs font-cinzel hover:text-palacio-gold transition-colors flex items-center gap-1 mx-auto group/btn">
                  LEARN MORE
                  <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          NEWSLETTER
          ═══════════════════════════════════════════════════════════════ */}
      <div className="py-20 bg-gradient-to-b from-[#0a0a0a] to-[#0a0a0a]/95 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-palacio-gold/10 flex items-center justify-center border border-palacio-gold/20">
            <Mail size={28} className="text-palacio-gold" />
          </div>
          <h3 className="text-3xl font-playfair text-palacio-gold mb-3">Join the Golden Circle</h3>
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

      {/* ═══════════════════════════════════════════════════════════════
          MAIN FOOTER
          ═══════════════════════════════════════════════════════════════ */}
      <footer className="py-16 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <h3 className="font-playfair text-2xl text-palacio-gold mb-3">Palacio de Oro</h3>
              <p className="text-gray-500 text-sm italic mb-4">Where Gold Meets Comfort. Experience luxury like never before.</p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-palacio-gold/20 transition-colors border border-white/10">
                  <Instagram size={18} className="text-gray-400" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-palacio-gold/20 transition-colors border border-white/10">
                  <Mail size={18} className="text-gray-400" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-palacio-gold/20 transition-colors border border-white/10">
                  <Phone size={18} className="text-gray-400" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-cinzel text-palacio-gold text-sm tracking-wider mb-4">QUICK LINKS</h4>
              <div className="space-y-3">
                {['About Us', 'Privacy Policy', 'Terms & Conditions'].map((link) => (
                  <a key={link} href="#" className="block text-gray-500 text-sm hover:text-palacio-gold transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-cinzel text-palacio-gold text-sm tracking-wider mb-4">SERVICES</h4>
              <div className="space-y-3">
                {['Room Booking', 'Fine Dining', 'Events'].map((link) => (
                  <a key={link} href="#" className="block text-gray-500 text-sm hover:text-palacio-gold transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-cinzel text-palacio-gold text-sm tracking-wider mb-4">CONTACT</h4>
              <div className="space-y-3 text-gray-500 text-sm">
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-palacio-gold/60" />
                  Boracay Island, Philippines
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-palacio-gold/60" />
                  +63 912 345 6789
                </p>
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-palacio-gold/60" />
                  hello@palaciodeoro.com
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-xs">© 2026 Palacio de Oro. All rights reserved.</p>
            <p className="text-gray-600 text-xs flex items-center gap-1">
              Crafted with <Heart size={12} className="text-palacio-gold" /> by Vincent Ecaldre
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
