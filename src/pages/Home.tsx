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
      {/* LUXURY SUNSET BEACH HERO */}
      <div
        className="relative w-full min-h-[100vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80")', // Luxury beach sunset
          backgroundAttachment: 'fixed',
        }}
      >
        {/* WARM SUNSET OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/50 via-purple-900/30 to-black/70" />
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative text-center px-6 py-20 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair text-palacio-gold mb-6 drop-shadow-2xl tracking-wide">
            Palacio de Oro
          </h1>
          
          <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-poppins mb-12 drop-shadow-lg italic font-light">
            Where Gold Meets Summer Paradise
          </p>
          
          {/* LUXURY GOLD BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => onNavigate('rooms')}
              className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-palacio-gold via-yellow-500 to-palacio-gold text-palacio-black font-cinzel font-bold text-lg md:text-xl rounded-lg shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 min-w-[280px] sm:min-w-[300px] border-2 border-palacio-gold/50"
            >
              Book Your Summer Stay
            </button>
            
            <button
              onClick={() => onNavigate('menu')}
              className="w-full sm:w-auto px-10 py-5 bg-white/10 backdrop-blur-md border-2 border-white/80 text-white font-cinzel font-bold text-lg md:text-xl rounded-lg hover:bg-white/20 hover:border-white hover:scale-105 active:scale-95 transition-all duration-300 min-w-[280px] sm:min-w-[300px] shadow-xl"
            >
              Summer Menu
            </button>
          </div>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="py-20 bg-gradient-to-b from-palacio-black/90 to-palacio-black">
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
                            className="px-4 py-2 bg-palacio-gold/20 text-palacio-gold border border-palacio-gold/50 rounded-full text-sm font-cinzel hover:bg-palacio-gold hover:text-palacio-black smooth-transition"
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
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 p-4 bg-black/60 hover:bg-palacio-gold/50 rounded-full smooth-transition border border-palacio-gold/50 shadow-lg"
              >
                <ChevronLeft size={28} className="text-palacio-gold" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 p-4 bg-black/60 hover:bg-palacio-gold/50 rounded-full smooth-transition border border-palacio-gold/50 shadow-lg"
              >
                <ChevronRight size={28} className="text-palacio-gold" />
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
                        className="text-xs font-cinzel text-palacio-gold border-b border-palacio-gold hover:text-white transition-colors pb-1"
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
      <div className="py-20 bg-gradient-to-t from-orange-900/20 to-palacio-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="text-4xl mb-4 shadow-gold inline-block p-4 rounded-full bg-gradient-to-br from-palacio-gold/20 to-orange-400/20">🏖️</div>
              <h3 className="font-playfair text-xl text-palacio-gold mb-2">Summer Paradise</h3>
              <p className="text-gray-400 text-sm">Experience the ultimate beach getaway with our seasonal packages.</p>
            </div>
            <div className="text-center p-8 border-x border-white/5">
              <div className="text-4xl mb-4 inline-block p-4 rounded-full bg-gradient-to-br from-palacio-gold/20 to-orange-400/20">🍸</div>
              <h3 className="font-playfair text-xl text-palacio-gold mb-2">Sky Lounge</h3>
              <p className="text-gray-400 text-sm">Cool off with our signature summer cocktails and gourmet appetizers.</p>
            </div>
            <div className="text-center p-8">
              <div className="text-4xl mb-4 inline-block p-4 rounded-full bg-gradient-to-br from-palacio-gold/20 to-orange-400/20">✨</div>
              <h3 className="font-playfair text-xl text-palacio-gold mb-2">Gold Standard</h3>
              <p className="text-gray-400 text-sm">Uncompromising luxury and personalized service for every guest.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
