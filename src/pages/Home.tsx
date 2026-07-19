import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { 
  ArrowRight, Star, MapPin, Calendar, Users, Clock, 
  Award, Sparkles, Heart, Eye, Instagram, Mail, Phone, 
  BedDouble, UtensilsCrossed, AlertCircle, ChevronLeft, 
  ChevronRight, Play, Pause, Zap, Diamond, Crown
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Room, Cottage, MenuItem } from '../lib/types';
import StatusBadge from '../components/StatusBadge';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';

interface HomeProps {
  onNavigate: (page: string) => void;
}

// ===== DATA =====
const testimonials = [
  {
    id: 1,
    name: "Isabella Montenegro",
    role: "Travel Blogger",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100",
    rating: 5,
    quote: "Palacio de Oro redefined luxury for me. The attention to detail is unmatched.",
  },
  {
    id: 2,
    name: "James Harrington",
    role: "Business Executive",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100",
    rating: 5,
    quote: "I've stayed at resorts worldwide, but nothing compares to the personalized service here.",
  },
  {
    id: 3,
    name: "Sofia Dela Cruz",
    role: "Honeymoon Guest",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100",
    rating: 5,
    quote: "Our honeymoon was magical. The private beach dinner under the stars was the highlight.",
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
  { name: "TripAdvisor Travelers' Choice", year: "2026", icon: <Crown size={20} /> },
  { name: "Forbes Travel Guide", year: "5-Star", icon: <Star size={20} /> },
  { name: "AAA Five Diamond", year: "Award", icon: <Diamond size={20} /> },
  { name: "Conde Nast Traveler", year: "Gold List", icon: <Award size={20} /> },
];

const amenitiesList = [
  { icon: "🏊", label: "Infinity Pool" },
  { icon: "🍷", label: "Wine Cellar" },
  { icon: "🧖", label: "Spa & Wellness" },
  { icon: "🏋️", label: "Fitness Center" },
  { icon: "🚁", label: "Helipad" },
  { icon: "🎯", label: "Private Beach" },
];

// ===== ANIMATION VARIANTS =====
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (delay: number = 0) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] } 
  })
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({ 
    opacity: 1, 
    transition: { duration: 1, delay } 
  })
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (delay: number = 0) => ({ 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.6, delay, ease: "easeOut" } 
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } 
  }
};

const slideIn = {
  hidden: { opacity: 0, x: -60 },
  visible: (delay: number = 0) => ({ 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] } 
  })
};

// ===== COMPONENTS =====

const AnimatedSection = memo(({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={delay}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
});

const StaggerContainer = memo(({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
});

const StaggerItem = memo(({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div variants={staggerItem} className={className}>
    {children}
  </motion.div>
));

const CountUp = memo(({ end, duration = 2, suffix = "" }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);
  
  return <span ref={ref}>{count}{suffix}</span>;
});

const TiltCard = memo(({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(1000px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) scale3d(1.02, 1.02, 1.02)`);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  }, []);
  
  return (
    <div
      ref={ref}
      className={className}
      style={{ transform, transition: "transform 0.3s ease-out" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
});

// ===== PARTICLES =====
const GoldParticles = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles: { x: number; y: number; size: number; speedY: number; opacity: number }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedY: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.speedY;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();
    
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />;
});

// ===== MAIN COMPONENT =====
export default function Home({ onNavigate }: HomeProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRoom, setHoveredRoom] = useState<number | null>(null);
  const [countdown, setCountdown] = useState({ days: 12, hours: 5, minutes: 43, seconds: 21 });
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  
  const menuScrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsRes, cottagesRes, menuRes] = await Promise.all([
        supabase.from('rooms').select('*'),
        supabase.from('cottages').select('*'),
        supabase.from('menu_items').select('*').eq('is_featured', true).limit(8),
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

  const getTopBestsellers = () => {
    const sorted = [...menuItems].sort((a, b) => (b.order_count || 0) - (a.order_count || 0));
    return sorted.slice(0, 3).map(m => m.id);
  };

  const scrollMenu = (direction: 'left' | 'right') => {
    if (!menuScrollRef.current) return;
    const scrollAmount = 320;
    menuScrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const urgency = getUrgencyMessage();
  const bestsellerIds = getTopBestsellers();
  const allAccommodations = [...rooms, ...cottages];

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-palacio-black">
        <motion.div 
          className="w-16 h-16 border-2 border-palacio-gold/30 border-t-palacio-gold rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-palacio-black">
      {/* Announcement Bar */}
      <motion.div 
        className="sticky top-0 z-50 bg-gradient-to-r from-palacio-gold via-yellow-500 to-palacio-gold text-palacio-black py-2.5 px-4 text-center font-cinzel shadow-lg"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Sparkles size={16} />
          <span className="font-bold text-sm md:text-base">SUMMER EXCLUSIVE:</span>
          <span className="text-sm hidden sm:inline">Book 3 nights, get the 4th FREE + complimentary spa session</span>
          <div className="flex items-center gap-1.5 bg-palacio-black/20 px-3 py-1 rounded-full text-xs font-mono">
            <Clock size={12} />
            <span>{countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s</span>
          </div>
        </div>
      </motion.div>

      {/* ===== HERO SECTION ===== */}
      <motion.div 
        ref={heroRef}
        className="relative w-full min-h-[100vh] flex items-center justify-center overflow-hidden"
        style={{ opacity: heroOpacity }}
      >
        {/* Parallax Background */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80")',
            scale: heroScale,
            y: heroY
          }}
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/30 via-transparent to-purple-900/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />
        
        {/* Gold Particles */}
        <GoldParticles />

        {/* Content */}
        <div className="relative text-center px-6 py-20 max-w-6xl mx-auto z-20">
          <motion.div 
            className="inline-flex items-center gap-2 glass-card px-5 py-2 mb-8"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Crown size={16} className="text-palacio-gold" />
            <span className="text-palacio-gold text-xs font-cinzel tracking-[0.2em]">LUXURY RESORT & SPA</span>
          </motion.div>

          <motion.div 
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 ${urgency.bg} border ${urgency.border} backdrop-blur-sm`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            <Zap size={16} className={urgency.color} />
            <span className={`font-bold text-sm ${urgency.color}`}>{urgency.text}</span>
          </motion.div>

          <motion.h1 
            className="text-6xl md:text-8xl lg:text-9xl font-playfair text-palacio-gold mb-6 drop-shadow-2xl tracking-wide"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Palacio de Oro
          </motion.h1>

          <motion.p 
            className="text-xl md:text-3xl lg:text-4xl text-white/90 font-poppins mb-4 drop-shadow-lg italic font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Where Gold Meets Paradise
          </motion.p>

          <motion.div 
            className="flex items-center justify-center gap-2 text-white/60 mb-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <MapPin size={16} className="text-palacio-gold" />
            <span className="text-sm font-cinzel tracking-wider">Boracay Island, Philippines</span>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <motion.button
              onClick={() => onNavigate('rooms')}
              className="group relative w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-palacio-gold via-yellow-500 to-palacio-gold text-palacio-black font-cinzel font-bold text-lg rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.3)] min-w-[300px] overflow-hidden"
              whileHover={{ scale: 1.05, boxShadow: "0 0 70px rgba(212,175,55,0.5)" }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <Calendar size={20} />
                BOOK YOUR STAY
                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </motion.button>

            <motion.button
              onClick={() => onNavigate('menu')}
              className="w-full sm:w-auto px-12 py-5 bg-white/5 backdrop-blur-xl border-2 border-white/40 text-white font-cinzel font-bold text-lg rounded-2xl min-w-[300px] hover:border-palacio-gold hover:text-palacio-gold transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex items-center justify-center gap-3">
                <UtensilsCrossed size={20} />
                EXPLORE DINING
              </span>
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="flex justify-center gap-12 md:gap-20 mt-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            {[
              { value: 500, suffix: "+", label: "Happy Guests", icon: Heart },
              { value: 50, suffix: "+", label: "Luxury Rooms", icon: BedDouble },
              { value: 15, suffix: "", label: "Awards Won", icon: Award },
            ].map((stat, i) => (
              <div key={i} className="text-center group cursor-default">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <stat.icon size={24} className="mx-auto text-palacio-gold mb-3" />
                </motion.div>
                <div className="text-3xl md:text-4xl font-playfair text-white font-bold">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-white/40 text-xs font-cinzel mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-white/30 text-[10px] font-cinzel tracking-[0.3em] group-hover:text-palacio-gold transition-colors">SCROLL</span>
          <div className="w-7 h-12 border-2 border-white/20 group-hover:border-palacio-gold rounded-full flex justify-center pt-2 transition-colors">
            <motion.div 
              className="w-1.5 h-3 bg-palacio-gold rounded-full"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* ===== AMENITIES STRIP ===== */}
      <AnimatedSection className="py-10 bg-gradient-to-r from-palacio-black via-palacio-black/95 to-palacio-black border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-10 md:gap-16">
            {amenitiesList.map((amenity, i) => (
              <motion.div 
                key={i} 
                className="flex items-center gap-3 group cursor-default"
                whileHover={{ scale: 1.15, y: -5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <span className="text-3xl group-hover:rotate-12 transition-transform duration-300">{amenity.icon}</span>
                <span className="text-white/50 font-cinzel text-sm group-hover:text-palacio-gold transition-colors">{amenity.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ===== ACCOMMODATIONS ===== */}
      <div className="py-28 bg-palacio-black relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.04)_0%,transparent_70%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection className="text-center mb-20">
            <motion.span 
              className="text-palacio-gold/60 text-xs font-cinzel tracking-[0.3em] uppercase inline-block"
              whileInView={{ letterSpacing: "0.5em" }}
              transition={{ duration: 1 }}
            >
              Stay With Us
            </motion.span>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-playfair text-palacio-gold mt-3 mb-5">
              Luxury Accommodations
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base">
              Each room is thoughtfully designed with golden accents, premium linens, and breathtaking views of the Philippine sunset.
            </p>
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-palacio-gold to-transparent mx-auto mt-8" />
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allAccommodations.slice(0, 8).map((item) => {
              const isHovered = hoveredRoom === item.id;
              const quantity = item.quantity || 0;
              const isAvailable = quantity > 0 && item.status === 'available';
              
              return (
                <StaggerItem key={item.id}>
                  <TiltCard className="group cursor-pointer">
                    <div
                      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-palacio-gold/50 transition-all duration-500 shadow-xl hover:shadow-palacio-gold/20"
                      onMouseEnter={() => setHoveredRoom(item.id)}
                      onMouseLeave={() => setHoveredRoom(null)}
                      onClick={() => onNavigate('rooms')}
                    >
                      {/* Image */}
                      <div className="relative h-60 overflow-hidden">
                        <motion.img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          animate={{ scale: isHovered ? 1.1 : 1 }}
                          transition={{ duration: 0.7 }}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        
                        {/* Badges */}
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm ${
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

                        {/* Hover Overlay */}
                        <AnimatePresence>
                          {isHovered && isAvailable && (
                            <motion.div 
                              className="absolute inset-0 bg-black/50 flex items-center justify-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <motion.div 
                                className="w-16 h-16 glass-card rounded-full flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring" }}
                              >
                                <Eye size={28} className="text-palacio-gold" />
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-playfair text-lg text-palacio-gold group-hover:text-white transition-colors">
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
                          {['WiFi', 'AC', 'Mini Bar', 'Ocean View'].slice(0, 3).map((amenity) => (
                            <motion.span 
                              key={amenity} 
                              className="text-[10px] bg-white/5 text-gray-400 px-2.5 py-1 rounded-md border border-white/5 hover:bg-palacio-gold/10 transition-colors"
                              whileHover={{ scale: 1.1 }}
                            >
                              {amenity}
                            </motion.span>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-white/5">
                          <div>
                            <span className="text-gray-500 text-[10px] font-cinzel">FROM</span>
                            <span className="text-palacio-gold font-cinzel font-bold text-2xl ml-2">
                              ${item.price_per_night}
                            </span>
                            <span className="text-gray-600 text-[10px]">/NIGHT</span>
                          </div>
                          <motion.span 
                            className={`text-xs font-cinzel flex items-center gap-1 ${isAvailable ? 'text-palacio-gold' : 'text-gray-500'}`}
                            whileHover={{ x: 5 }}
                          >
                            {isAvailable ? 'VIEW DETAILS' : 'UNAVAILABLE'}
                            <ArrowRight size={14} />
                          </motion.span>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </div>

      {/* ===== AWARDS STRIP ===== */}
      <AnimatedSection className="py-14 border-y border-white/5 bg-gradient-to-r from-palacio-black via-palacio-black/90 to-palacio-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20">
            {awards.map((award, i) => (
              <motion.div 
                key={i} 
                className="flex items-center gap-4 group cursor-default"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="text-palacio-gold/60 group-hover:text-palacio-gold transition-colors"
                  whileHover={{ rotate: 15, scale: 1.2 }}
                >
                  {award.icon}
                </motion.div>
                <div>
                  <div className="text-white/80 font-cinzel font-bold text-sm group-hover:text-white transition-colors">{award.name}</div>
                  <div className="text-palacio-gold/60 text-xs">{award.year}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ===== SIGNATURE DISHES - HORIZONTAL SCROLL ===== */}
      <div className="py-28 bg-gradient-to-b from-palacio-black via-orange-900/5 to-palacio-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-palacio-gold/3 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <span className="text-palacio-gold/60 text-xs font-cinzel tracking-[0.3em] uppercase">Culinary Excellence</span>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-playfair text-palacio-gold mt-3 mb-5">
              Signature Dishes
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-base">
              Savor the finest flavors crafted by our world-renowned chefs using locally-sourced ingredients.
            </p>
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-palacio-gold to-transparent mx-auto mt-8" />
          </AnimatedSection>

          {/* Scroll Controls */}
          <div className="flex justify-end gap-3 mb-6">
            <motion.button
              onClick={() => scrollMenu('left')}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-palacio-gold hover:text-palacio-gold transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft size={20} />
            </motion.button>
            <motion.button
              onClick={() => scrollMenu('right')}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-palacio-gold hover:text-palacio-gold transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>

          {/* Horizontal Scroll Container */}
          <div 
            ref={menuScrollRef}
            className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {menuItems.map((item) => {
              const orderCount = item.order_count || 0;
              const isBestseller = bestsellerIds.includes(item.id);
              
              return (
                <motion.div 
                  key={item.id}
                  className="flex-shrink-0 w-80 snap-start group cursor-pointer"
                  whileHover={{ y: -10 }}
                  onClick={() => onNavigate('menu')}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-palacio-gold/40 transition-all duration-500 shadow-xl">
                    <div className="relative h-56 overflow-hidden">
                      <motion.img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.7 }}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      {isBestseller && (
                        <motion.div 
                          className="absolute top-4 left-4 px-4 py-2 bg-palacio-gold text-palacio-black rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
                          initial={{ x: -20, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                        >
                          <Star size={14} fill="currentColor" /> BESTSELLER
                        </motion.div>
                      )}

                      {!item.available && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <span className="text-red-400 font-bold font-cinzel text-lg">UNAVAILABLE</span>
                        </div>
                      )}

                      <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 rounded-lg text-xs text-gray-300 backdrop-blur-sm">
                        {orderCount} sold
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-playfair text-palacio-gold text-xl">{item.name}</h3>
                        <span className="text-palacio-gold font-cinzel font-bold text-xl">${item.price}</span>
                      </div>
                      <p className="text-gray-400 text-sm capitalize mb-4">{item.category}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-3 py-1.5 rounded-lg ${
                          item.available 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {item.available ? 'Available Now' : 'Out of Stock'}
                        </span>
                        <motion.span 
                          className="text-palacio-gold text-sm font-cinzel flex items-center gap-2"
                          whileHover={{ x: 5 }}
                        >
                          ORDER <ArrowRight size={14} />
                        </motion.span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== TESTIMONIALS - CAROUSEL ===== */}
      <div className="py-28 bg-gradient-to-b from-palacio-black via-orange-900/5 to-palacio-black relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-palacio-gold/3 rounded-full blur-3xl" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection className="text-center mb-16">
            <span className="text-palacio-gold/60 text-xs font-cinzel tracking-[0.3em] uppercase">Guest Stories</span>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-playfair text-palacio-gold mt-3 mb-5">
              What Our Guests Say
            </h2>
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-palacio-gold to-transparent mx-auto" />
          </AnimatedSection>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="relative p-10 md:p-14 rounded-3xl glass-card border border-white/10"
              >
                <div className="absolute top-8 right-10 text-8xl text-palacio-gold/10 font-serif leading-none">"</div>
                
                <div className="flex gap-1 mb-8">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: j * 0.1 }}
                    >
                      <Star size={20} className="text-yellow-400 fill-yellow-400" />
                    </motion.div>
                  ))}
                </div>

                <p className="text-gray-300 italic mb-10 leading-relaxed text-lg md:text-xl relative z-10">
                  "{testimonials[activeTestimonial].quote}"
                </p>

                <div className="flex items-center gap-5">
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                  >
                    <img 
                      src={testimonials[activeTestimonial].avatar} 
                      alt={testimonials[activeTestimonial].name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-palacio-gold/50"
                      loading="lazy"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-palacio-black" />
                  </motion.div>
                  <div>
                    <h4 className="text-palacio-gold font-cinzel font-bold text-lg">{testimonials[activeTestimonial].name}</h4>
                    <p className="text-gray-500 text-sm">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-3 h-3 rounded-full transition-colors ${i === activeTestimonial ? 'bg-palacio-gold' : 'bg-white/20'}`}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== INSTAGRAM GALLERY ===== */}
      <AnimatedSection className="py-28 bg-palacio-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-palacio-gold/60 text-xs font-cinzel tracking-[0.3em] uppercase">Follow Us</span>
            <h2 className="text-5xl md:text-6xl font-playfair text-palacio-gold mt-3 mb-4">
              @PalacioDeOro
            </h2>
            <p className="text-gray-400 text-sm">
              Share your golden moments with us
            </p>
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-palacio-gold to-transparent mx-auto mt-6" />
          </div>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {instagramPhotos.map((photo) => (
              <StaggerItem key={photo.id}>
                <motion.div 
                  className="relative aspect-square group overflow-hidden rounded-xl cursor-pointer"
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img 
                    src={photo.url} 
                    alt={`Instagram ${photo.id}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <motion.div 
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    <Heart size={24} className="text-white fill-white" />
                    <span className="text-white font-cinzel text-sm">{photo.likes.toLocaleString()}</span>
                  </motion.div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </AnimatedSection>

      {/* ===== NEWSLETTER ===== */}
      <AnimatedSection className="py-24 bg-gradient-to-b from-palacio-black to-palacio-black/95 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Sparkles size={40} className="mx-auto text-palacio-gold mb-6" />
          </motion.div>
          <h3 className="text-4xl md:text-5xl font-playfair text-palacio-gold mb-4">
            Join the Golden Circle
          </h3>
          <p className="text-gray-400 text-base mb-10">
            Subscribe for exclusive offers, early access to seasonal packages, and insider perks reserved for our most valued guests.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-palacio-gold/50 focus:ring-2 focus:ring-palacio-gold/20 transition-all font-cinzel text-sm"
            />
            <motion.button 
              className="px-10 py-4 bg-palacio-gold text-palacio-black font-cinzel font-bold rounded-xl shadow-[0_0_30px_rgba(212,175,55,0.2)]"
              whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(212,175,55,0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              SUBSCRIBE
            </motion.button>
          </div>
          
          <p className="text-gray-600 text-xs mt-5">By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.</p>
        </div>
      </AnimatedSection>

      {/* ===== FOOTER ===== */}
      <footer className="bg-palacio-black border-t border-white/5 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
            <div>
              <h4 className="text-palacio-gold font-playfair text-2xl mb-4">Palacio de Oro</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                Where Gold Meets Comfort. Experience luxury like never before in the heart of Boracay.
              </p>
              <div className="flex gap-4 mt-6">
                {[Instagram, Mail, Phone].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-palacio-gold hover:border-palacio-gold transition-colors"
                    whileHover={{ scale: 1.1, y: -3 }}
                  >
                    <Icon size={18} />
                  </motion.a>
                ))}
              </div>
            </div>
            
            {[
              { title: "QUICK LINKS", links: ['About Us', 'Privacy Policy', 'Terms & Conditions'] },
              { title: "SERVICES", links: ['Room Booking', 'Fine Dining', 'Events & Weddings'] },
            ].map((section, i) => (
              <div key={i}>
                <h5 className="text-palacio-gold font-cinzel text-sm mb-5 tracking-wider">{section.title}</h5>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <motion.button 
                        onClick={() => onNavigate(link.toLowerCase().replace(' ', ''))}
                        className="text-gray-500 text-sm hover:text-palacio-gold transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        {link}
                      </motion.button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            <div>
              <h5 className="text-palacio-gold font-cinzel text-sm mb-5 tracking-wider">CONTACT</h5>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-500 text-sm">
                  <Mail size={16} className="text-palacio-gold" />
                  reservations@palaciodeoro.com
                </li>
                <li className="flex items-center gap-3 text-gray-500 text-sm">
                  <Phone size={16} className="text-palacio-gold" />
                  +63 912 345 6789
                </li>
                <li className="flex items-center gap-3 text-gray-500 text-sm">
                  <MapPin size={16} className="text-palacio-gold" />
                  Boracay Island, Philippines
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm"> 2026 Palacio de Oro. All rights reserved.</p>
            <p className="text-gray-700 text-xs font-cinzel tracking-wider">
              DEVELOPED BY VINCENT ECALDRE
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
