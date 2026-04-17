 import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Room, MenuItem } from '../lib/types';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [bestsellers, setBestsellers] = useState<MenuItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
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

  const slides = [
    { title: 'Summer Featured Dishes', items: featuredItems },
    { title: 'Seasonal Best Sellers', items: bestsellers },
    { title: 'Luxury Promotions', items: featuredItems },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % 3);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + 3) % 3);

  return (
    <div className="min-h-screen">
      {/* Summer Hero Section */}
      <div
        className="relative w-full h-screen bg-cover bg-center flex items-center justify-center transition-all duration-1000"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80")', // Light tropical beach resort
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Lighter Overlay for Summer Feel */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-palacio-black/70" />
        
        <div className="relative text-center px-4 animate-fade-in">
          <h1 className="hero-title mb-4 drop-shadow-2xl">Palacio de Oro</h1>
          <p className="text-2xl md:text-3xl text-white font-poppins mb-8 drop-shadow-lg italic">
            Where Gold Meets Summer Paradise
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('rooms')}
              className="gold-glow-btn transform hover:scale-105 active:scale-95 transition-all"
            >
              Book Your Summer Stay
            </button>
            <button
              onClick={() => onNavigate('menu')}
              className="px-6 py-3 bg-white/10 backdrop-blur-md border-2 border-palacio-gold text-palacio-gold font-cinzel font-semibold rounded hover:bg-palacio-gold hover:text-palacio-black smooth-transition shadow-lg"
            >
              Summer Menu
            </button>
          </div>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="py-20 bg-gradient-to-b from-palacio-black/80 to-palacio-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-palacio-gold">Summer Highlights</h2>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="relative">
              <div className="glass-card p-8 min-h-[400px] border border-white/10 backdrop-blur-xl">
                <div>
                  <h3 className="text-2xl font-playfair text-palacio-gold mb-6 border-b border-palacio-gold/30 pb-2 inline-block">
                    {slides[currentSlide]?.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {slides[currentSlide]?.items?.map((item) => (
                      <div key={item.id} className="animate-carousel-slide group">
                        <div className="relative overflow-hidden rounded-lg shadow-xl">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
                          />
                          {item.is_bestseller && (
                            <div className="absolute top-2 right-2 bg-palacio-gold text-palacio-black px-3 py-1 rounded-full text-xs font-cinzel font-bold shadow-lg">
                              BESTSELLER
                            </div>
                          )}
                        </div>
                        <h4 className="font-playfair text-xl text-palacio-gold mt-4">
                          {item.name}
                        </h4>
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-palacio-gold font-cinzel font-bold text-lg">
                            ${item.price}
                          </span>
                          <button
                            onClick={() => onNavigate('menu')}
                            className="px-4 py-1.5 bg-palacio-gold/20 text-palacio-gold border border-palacio-gold/50 rounded-full text-xs font-cinzel hover:bg-palacio-gold hover:text-palacio-black smooth-transition"
                          >
                            Add to Order
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 md:-translate-x-16 p-3 bg-black/50 hover:bg-palacio-gold/40 rounded-full smooth-transition border border-palacio-gold/30"
              >
                <ChevronLeft size={24} className="text-palacio-gold" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 md:translate-x-16 p-3 bg-black/50 hover:bg-palacio-gold/40 rounded-full smooth-transition border border-palacio-gold/30"
              >
                <ChevronRight size={24} className="text-palacio-gold" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Featured Rooms Section */}
      <div className="py-20 bg-palacio-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title">Luxury Accommodations</h2>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {rooms.map((room) => (
                <GlassCard key={room.id} className="overflow-hidden hover:border-palacio-gold/50 transition-colors group">
                  <div className="overflow-hidden">
                    <img
                      src={room.image_url}
                      alt={room.name}
                      className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 bg-gradient-to-b from-transparent to-black/20">
                    <h3 className="font-playfair text-lg text-palacio-gold mb-2">
                      {room.name}
                    </h3>
                    <div className="flex justify-between items-center mb-4">
                      <StatusBadge status={room.status} size="sm" />
                      <span className="text-gray-400 text-xs font-cinzel">
                        {room.capacity} GUESTS
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-palacio-gold font-cinzel font-bold">
                        ${room.price_per_night}
                        <span className="text-gray-500 text-[10px] ml-1 uppercase">/ night</span>
                      </div>
                      <button 
                        onClick={() => onNavigate('rooms')}
                        className="text-[10px] font-cinzel text-palacio-gold border-b border-palacio-gold hover:text-white transition-colors"
                      >
                        VIEW DETAILS
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Services Footer Section */}
      <div className="py-20 bg-palacio-dark-green/10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="text-4xl mb-4 shadow-gold inline-block p-4 rounded-full bg-palacio-gold/10">🏖️</div>
              <h3 className="font-playfair text-xl text-palacio-gold mb-2">Summer Paradise</h3>
              <p className="text-gray-400 text-sm">Experience the ultimate beach getaway with our seasonal packages.</p>
            </div>
            <div className="text-center p-8 border-x border-white/5">
              <div className="text-4xl mb-4 inline-block p-4 rounded-full bg-palacio-gold/10">🍸</div>
              <h3 className="font-playfair text-xl text-palacio-gold mb-2">Sky Lounge</h3>
              <p className="text-gray-400 text-sm">Cool off with our signature summer cocktails and gourmet appetizers.</p>
            </div>
            <div className="text-center p-8">
              <div className="text-4xl mb-4 inline-block p-4 rounded-full bg-palacio-gold/10">✨</div>
              <h3 className="font-playfair text-xl text-palacio-gold mb-2">Gold Standard</h3>
              <p className="text-gray-400 text-sm">Uncompromising luxury and personalized service for every guest.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
              }
