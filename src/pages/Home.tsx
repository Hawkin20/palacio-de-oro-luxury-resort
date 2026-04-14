import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Room, Cottage, MenuItem } from '../lib/types';
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
    { title: 'Featured Dishes', items: featuredItems },
    { title: 'Best Sellers', items: bestsellers },
    { title: 'Special Promotions', items: featuredItems },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % 3);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + 3) % 3);

  return (
    <div className="min-h-screen">
      <div
        className="relative w-full h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/2349074/pexels-photo-2349074.jpeg?auto=compress&cs=tinysrgb&w=1200)',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-palacio-black/60" />
        <div className="relative text-center px-4 animate-fade-in">
          <h1 className="hero-title mb-4">Palacio de Oro</h1>
          <p className="text-2xl md:text-3xl text-gray-200 font-poppins mb-8 drop-shadow-lg">
            Where Gold Meets Comfort
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('rooms')}
              className="gold-glow-btn"
            >
              Book Now
            </button>
            <button
              onClick={() => onNavigate('menu')}
              className="px-6 py-3 bg-palacio-dark-green/40 border-2 border-palacio-gold text-palacio-gold font-cinzel font-semibold rounded hover:bg-palacio-dark-green/60 smooth-transition"
            >
              Explore Menu
            </button>
          </div>
        </div>
      </div>

      <div className="py-20 bg-palacio-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title">Featured Highlights</h2>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="relative">
              <div className="glass-card p-8 min-h-[400px] flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-playfair text-palacio-gold mb-6">
                    {slides[currentSlide]?.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {slides[currentSlide]?.items?.map((item) => (
                      <div key={item.id} className="animate-carousel-slide">
                        <div className="relative">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          {item.is_bestseller && (
                            <div className="absolute top-2 right-2 bg-palacio-gold/90 text-palacio-black px-3 py-1 rounded-full text-xs font-cinzel font-bold">
                              BESTSELLER
                            </div>
                          )}
                        </div>
                        <h4 className="font-playfair text-lg text-palacio-gold mt-3">
                          {item.name}
                        </h4>
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-palacio-gold font-cinzel font-bold">
                            ${item.price}
                          </span>
                          <button
                            onClick={() => onNavigate('menu')}
                            className="px-3 py-1 bg-palacio-gold/20 text-palacio-gold rounded text-xs font-cinzel hover:bg-palacio-gold/30 smooth-transition"
                          >
                            Order
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 p-2 hover:bg-palacio-gold/20 rounded-lg smooth-transition"
              >
                <ChevronLeft size={32} className="text-palacio-gold" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 p-2 hover:bg-palacio-gold/20 rounded-lg smooth-transition"
              >
                <ChevronRight size={32} className="text-palacio-gold" />
              </button>

              <div className="flex justify-center gap-2 mt-6">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full smooth-transition ${
                      idx === currentSlide ? 'bg-palacio-gold w-8' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title">Featured Rooms</h2>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {rooms.map((room) => (
                <GlassCard key={room.id} className="overflow-hidden">
                  <img
                    src={room.image_url}
                    alt={room.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-playfair text-lg text-palacio-gold mb-2">
                      {room.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {room.description}
                    </p>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="text-palacio-gold font-cinzel font-bold">
                          ${room.price_per_night}
                        </span>
                        <span className="text-gray-500 text-xs">/night</span>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {room.capacity} guests
                      </span>
                    </div>
                    <StatusBadge status={room.status} size="sm" />
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <button
              onClick={() => onNavigate('rooms')}
              className="gold-glow-btn"
            >
              View All Rooms
            </button>
          </div>
        </div>
      </div>

      <div className="py-20 bg-palacio-dark-green/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlassCard className="text-center p-8">
              <div className="text-4xl font-playfair text-palacio-gold mb-2">
                5★
              </div>
              <h3 className="font-playfair text-xl text-palacio-gold mb-2">
                Luxury Experience
              </h3>
              <p className="text-gray-400">
                Premium rooms and cottages with world-class amenities
              </p>
            </GlassCard>
            <GlassCard className="text-center p-8">
              <div className="text-4xl font-playfair text-palacio-gold mb-2">
                🍽️
              </div>
              <h3 className="font-playfair text-xl text-palacio-gold mb-2">
                Fine Dining
              </h3>
              <p className="text-gray-400">
                Spanish-inspired cuisine with world-class chefs
              </p>
            </GlassCard>
            <GlassCard className="text-center p-8">
              <div className="text-4xl font-playfair text-palacio-gold mb-2">
                24/7
              </div>
              <h3 className="font-playfair text-xl text-palacio-gold mb-2">
                Concierge Service
              </h3>
              <p className="text-gray-400">
                Round-the-clock support for all your needs
              </p>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
