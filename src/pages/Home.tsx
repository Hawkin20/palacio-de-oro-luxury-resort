import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Room, MenuItem } from '../lib/types';
import GlassCard from '../components/GlassCard';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

interface HomeProps {
  onNavigate: (page: string) => void;
}

// Scroll Reveal Hook
const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll, .stagger-children');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

export default function Home({ onNavigate }: HomeProps) {
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [bestsellers, setBestsellers] = useState<MenuItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useScrollReveal();

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 6000);
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
    <div className="min-h-screen overflow-x-hidden">
      {/* HERO SECTION */}
      <div
        className="relative w-full min-h-[100vh] bg-cover bg-center flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80")',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/60 via-purple-900/40 to-black/80 animate-pulse-slow" />
        <div className="absolute inset-0 bg-black/30" />

        {/* Floating Gold Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-palacio-gold/50 rounded-full animate-float"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${5 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="relative text-center px-6 py-20 max-w-4xl mx-auto z-10">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair text-palacio-gold mb-6 drop-shadow-2xl tracking-wide animate-slide-up">
            Palacio de Oro
          </h1>

          <p className="text-xl md:text-2xl lg:text-3xl text-white/90 font-poppins mb-12 drop-shadow-lg italic font-light animate-slide-up-delay">
            Where Gold Meets Summer Paradise
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up-delay-2">
            <button
              onClick={() => onNavigate('rooms')}
              className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-palacio-gold via-yellow-500 to-palacio-gold text-palacio-black font-cinzel font-bold text-lg md:text-xl rounded-lg shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-105 hover:shadow-[0_0_50px_rgba(212,175,55,0.6)] active:scale-95 transition-all duration-300 min-w-[280px] sm:min-w-[300px] border-2 border-palacio-gold/50 shine-sweep"
            >
              Book Your Summer Stay
            </button>

            <button
              onClick={() => onNavigate('menu')}
              className="w-full sm:w-auto px-10 py-5 bg-white/10 backdrop-blur-md border-2 border-white/80 text-white font-cinzel font-bold text-lg md:text-xl rounded-lg hover:bg-white/20 hover:border-white hover:scale-105 active:scale-95 transition-all duration-300 min-w-[280px] sm:min-w-[300px] shadow-xl group"
            >
              <span className="flex items-center justify-center gap-2">
                Summer Menu <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
          <div className="w-6 h-10 border-2 border-palacio-gold/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-palacio-gold rounded-full animate-scroll-down" />
          </div>
        </div>
      </div>

      {/* HIGHLIGHTS SECTION */}
      <div className="py-20 bg-gradient-to-b from-palacio-black/90 to-palacio-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-palacio-gold mb-12 reveal-on-scroll">
            Summer Highlights
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4 animate-shimmer">
                  <div className="h-48 bg-white/5 rounded-lg mb-4" />
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
              <div className="glass-card p-8 min-h-[400px] border border-white/10 backdrop-blur-xl relative overflow-hidden">
                <div className="animate-fade-in">
                  <h3 className="text-2xl font-playfair text-palacio-gold mb-6 border-b border-palacio-gold/30 pb-2 inline-block">
                    {slides[currentSlide]?.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
                    {slides[currentSlide]?.items?.map((item) => (
                      <div
                        key={item.id}
                        className="group cursor-pointer card-hover"
                      >
                        <div className="relative overflow-hidden rounded-lg shadow-xl group-hover:shadow-palacio-gold/20 transition-shadow duration-500">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          {item.is_bestseller && (
                            <div className="absolute top-2 right-2 bg-palacio-gold text-palacio-black px-3 py-1 rounded-full text-xs font-cinzel font-bold shadow-lg animate-pulse-slow">
                              BESTSELLER
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <h4 className="font-playfair text-xl text-palacio-gold mt-4 group-hover:text-white transition-colors duration-300">
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
                            className="px-4 py-2 bg-palacio-gold/20 text-palacio-gold border border-palacio-gold/50 rounded-full text-sm font-cinzel hover:bg-palacio-gold hover:text-palacio-black transition-all duration-300 hover:scale-105"
                          >
                            Add to Order
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 p-4 bg-black/60 hover:bg-palacio-gold/50 rounded-full transition-all duration-300 border border-palacio-gold/50 shadow-lg hover:scale-110 active:scale-95 z-10"
              >
                <ChevronLeft size={28} className="text-palacio-gold" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 p-4 bg-black/60 hover:bg-palacio-gold/50 rounded-full transition-all duration-300 border border-palacio-gold/50 shadow-lg hover:scale-110 active:scale-95 z-10"
              >
                <ChevronRight size={28} className="text-palacio-gold" />
              </button>

              <div className="flex justify-center gap-2 mt-6">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 hover:scale-125 ${
                      currentSlide === index ? 'bg-palacio-gold w-6' : 'bg-white/30 w-2'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FEATURED ROOMS */}
      <div className="py-20 bg-palacio-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title mb-12 reveal-on-scroll">
            Luxury Accommodations
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-4 animate-shimmer">
                  <div className="h-48 bg-white/5 rounded-lg mb-4" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="group cursor-pointer tilt-card"
                  onClick={() => onNavigate('rooms')}
                >
                  <div className="relative overflow-hidden rounded-t-2xl">
                    <img
                      src={room.image_url}
                      alt={room.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 right-3 bg-palacio-gold/90 text-palacio-black px-3 py-1 rounded-lg font-cinzel font-bold text-sm animate-fade-in">
                      ${room.price_per_night}
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-b from-transparent to-black/40 rounded-b-2xl border border-white/5 border-t-0 group-hover:border-palacio-gold/30 transition-colors duration-500">
                    <h3 className="font-playfair text-lg text-palacio-gold mb-2 group-hover:text-white transition-colors duration-300">
                      {room.name}
                    </h3>
                    <div className="flex justify-between items-center mb-4">
                      <StatusBadge status={room.status} size="sm" />
                      <span className="text-gray-400 text-xs font-cinzel">
                        {room.capacity} GUESTS
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-palacio-gold font-cinzel font-bold text-sm">
                        <span className="text-gray-500 text-[10px] mr-1">FROM</span>
                        ${room.price_per_night}
                        <span className="text-gray-500 text-[10px] ml-1">/ NIGHT</span>
                      </div>
                      <span className="text-xs font-cinzel text-palacio-gold border-b border-palacio-gold hover:text-white transition-colors pb-1 flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                        VIEW DETAILS <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12 reveal-on-scroll">
            <button
              onClick={() => onNavigate('rooms')}
              className="px-8 py-4 bg-transparent border-2 border-palacio-gold text-palacio-gold font-cinzel font-bold rounded-full hover:bg-palacio-gold hover:text-palacio-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] active:scale-95 shine-sweep"
            >
              View All Accommodations
            </button>
          </div>
        </div>
      </div>

      {/* SERVICES FOOTER */}
      <div className="py-20 bg-gradient-to-t from-orange-900/20 to-palacio-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            {[
              { icon: '🏖️', title: 'Summer Paradise', desc: 'Experience the ultimate beach getaway with our seasonal packages.' },
              { icon: '🍸', title: 'Sky Lounge', desc: 'Cool off with our signature summer cocktails and gourmet appetizers.' },
              { icon: '✨', title: 'Gold Standard', desc: 'Uncompromising luxury and personalized service for every guest.' },
            ].map((service) => (
              <div
                key={service.title}
                className="text-center p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-palacio-gold/30 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(212,175,55,0.1)] card-hover"
              >
                <div className="text-4xl mb-4 inline-block p-4 rounded-full bg-gradient-to-br from-palacio-gold/20 to-orange-400/20 group-hover:rotate-12 transition-transform duration-500">
                  {service.icon}
                </div>
                <h3 className="font-playfair text-xl text-palacio-gold mb-2">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
