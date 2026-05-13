import { useState } from 'react';
import { 
  Mail, Facebook, MessageSquare, Send, MapPin, Phone, 
  Clock, Star, ArrowRight, CheckCircle2, Sparkles,
  Headphones, Crown, Building2, Wifi, Shield
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    }, 1500);
  };

  const teamMembers = [
    {
      icon: Crown,
      title: 'Developer & Admin',
      subtitle: 'Primary contact for resort and system inquiries',
      name: 'Vincent Ecaldre',
      role: 'Lead System Architect',
      email: 'vincentecaldre25@gmail.com',
      facebook: 'https://www.facebook.com/Ilove.tomboybaddie',
      featured: true,
    },
    {
      icon: Headphones,
      title: 'Support Lead',
      subtitle: 'Guest service and reservation assistance',
      name: 'Rommel Cabanza',
      role: 'Customer Support Manager',
      facebook: 'https://www.facebook.com/rommel.cabanza.2025',
      featured: false,
    },
    {
      icon: Building2,
      title: 'Official Page',
      subtitle: 'Direct support and official announcements',
      name: 'Palacio de Oro',
      role: 'Main Support Channel',
      facebook: 'https://www.facebook.com/profile.php?id=61588094229904',
      featured: false,
    },
  ];

  const highlights = [
    { icon: Star, title: 'Summer Paradise', desc: 'The ultimate beach getaway vibe.' },
    { icon: Clock, title: '24/7 Concierge', desc: 'Round-the-clock personal support.' },
    { icon: Sparkles, title: 'Spanish Cuisine', desc: 'Authentic flavors by master chefs.' },
    { icon: Shield, title: 'Easy Booking', desc: 'Seamless reservation experience.' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Hero Section */}
      <div className="relative h-[45vh] min-h-[400px] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
        
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4 pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-palacio-gold/10 border border-palacio-gold/30 rounded-full mb-6 backdrop-blur-sm">
            <MessageSquare size={16} className="text-palacio-gold" />
            <span className="text-palacio-gold font-cinzel text-xs tracking-[0.3em] uppercase">We're Here For You</span>
          </div>
          
          <h1 className="font-playfair text-5xl md:text-7xl text-palacio-gold mb-4 drop-shadow-2xl">
            Contact & Support
          </h1>
          <p className="text-gray-300 font-poppins text-lg md:text-xl italic max-w-2xl leading-relaxed">
            Get in touch with our luxury team. We're here to ensure your summer experience is unforgettable.
          </p>
          
          {/* Contact Quick Info */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-8 text-sm font-cinzel tracking-wider">
            <div className="flex items-center gap-2 text-palacio-gold">
              <Phone size={16} />
              <span>+63 912 345 6789</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin size={16} />
              <span>Golden Beach, Philippines</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Wifi size={16} />
              <span>24/7 Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16">
        {/* Team Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {teamMembers.map((member, index) => {
            const Icon = member.icon;
            return (
              <div 
                key={index}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-2 ${
                  member.featured 
                    ? 'bg-palacio-gold/5 border-2 border-palacio-gold/40 shadow-xl shadow-palacio-gold/10' 
                    : 'bg-white/[0.03] border border-white/10 hover:border-palacio-gold/30'
                }`}
              >
                {/* Glow effect for featured */}
                {member.featured && (
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-palacio-gold/20 rounded-full blur-3xl" />
                )}
                
                <div className="relative p-8 text-center">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${
                    member.featured 
                      ? 'bg-palacio-gold/20 border-2 border-palacio-gold/40' 
                      : 'bg-palacio-gold/10 border border-palacio-gold/20'
                  }`}>
                    <Icon size={28} className="text-palacio-gold" />
                  </div>

                  {/* Title */}
                  <h3 className="font-playfair text-2xl text-palacio-gold mb-2">
                    {member.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    {member.subtitle}
                  </p>

                  {/* Name & Role */}
                  <div className="mb-6">
                    <p className="font-cinzel text-lg text-white mb-1 tracking-wider">
                      {member.name}
                    </p>
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                      {member.role}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-palacio-gold/10 border border-palacio-gold/30 text-palacio-gold rounded-xl hover:bg-palacio-gold hover:text-palacio-black smooth-transition text-xs font-cinzel font-bold tracking-wider group/link"
                      >
                        <Mail size={14} />
                        <span>{member.email}</span>
                        <ArrowRight size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </a>
                    )}

                    <a
                      href={member.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600/10 border border-blue-500/30 text-blue-300 rounded-xl hover:bg-blue-600/20 hover:border-blue-500/50 smooth-transition text-xs font-cinzel font-bold tracking-wider"
                    >
                      <Facebook size={14} />
                      <span>{member.name === 'Palacio de Oro' ? 'Support Page' : 'Facebook Profile'}</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Form - Takes 3 columns */}
          <div className="lg:col-span-3">
            <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-8 hover:border-palacio-gold/20 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-palacio-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-palacio-gold/10 flex items-center justify-center border border-palacio-gold/20">
                    <Send size={20} className="text-palacio-gold" />
                  </div>
                  <div>
                    <h2 className="font-playfair text-2xl text-palacio-gold">Quick Inquiry</h2>
                    <p className="text-gray-500 text-xs font-cinzel">We typically respond within 2 hours</p>
                  </div>
                </div>

                {submitted ? (
                  <div className="text-center py-12 animate-fade-in">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                      <CheckCircle2 size={32} className="text-emerald-400" />
                    </div>
                    <h3 className="font-playfair text-xl text-emerald-400 mb-2">Message Sent!</h3>
                    <p className="text-gray-400 text-sm">Our team will reach out to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-cinzel text-palacio-gold tracking-widest uppercase">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your name"
                          required
                          className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-palacio-gold focus:outline-none smooth-transition text-sm focus:shadow-lg focus:shadow-palacio-gold/5"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-cinzel text-palacio-gold tracking-widest uppercase">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="your@email.com"
                          required
                          className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-palacio-gold focus:outline-none smooth-transition text-sm focus:shadow-lg focus:shadow-palacio-gold/5"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-[10px] font-cinzel text-palacio-gold tracking-widest uppercase">
                        Your Message
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your plans, questions, or special requests..."
                        rows={5}
                        required
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-palacio-gold focus:outline-none smooth-transition resize-none text-sm focus:shadow-lg focus:shadow-palacio-gold/5"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-palacio-gold text-palacio-black rounded-xl font-cinzel text-sm font-bold tracking-wider hover:bg-white disabled:opacity-50 smooth-transition shadow-xl shadow-palacio-gold/20 flex items-center justify-center gap-2 group"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-palacio-black/30 border-t-palacio-black rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                          Send Summer Inquiry
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Why Choose Us - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 p-8 hover:border-palacio-gold/20 transition-all duration-500 h-full">
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-palacio-gold/5 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-palacio-gold/10 flex items-center justify-center border border-palacio-gold/20">
                    <Star size={20} className="text-palacio-gold" />
                  </div>
                  <h2 className="font-playfair text-2xl text-palacio-gold">Why Palacio?</h2>
                </div>

                <div className="space-y-5">
                  {highlights.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={idx} 
                        className="flex gap-4 p-4 rounded-xl bg-black/20 border border-white/5 hover:border-palacio-gold/20 transition-all duration-300 group"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-palacio-gold/10 flex items-center justify-center border border-palacio-gold/20 group-hover:bg-palacio-gold/20 transition-colors">
                          <Icon size={20} className="text-palacio-gold" />
                        </div>
                        <div>
                          <h4 className="font-cinzel text-palacio-gold text-sm font-bold tracking-wide mb-1">
                            {item.title}
                          </h4>
                          <p className="text-gray-400 text-xs leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quote */}
                <div className="mt-8 p-5 bg-palacio-gold/5 border border-palacio-gold/20 rounded-xl relative">
                  <div className="absolute -top-3 left-6 text-4xl text-palacio-gold/20 font-serif">"</div>
                  <p className="text-gray-300 text-sm italic text-center leading-relaxed relative z-10">
                    Our mission is to bridge the gap between golden luxury and the warmth of a summer breeze.
                  </p>
                  <div className="mt-3 text-center">
                    <div className="w-12 h-0.5 bg-palacio-gold/30 mx-auto rounded-full" />
                  </div>
                </div>

                {/* Response Time Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <Clock size={16} className="text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-cinzel font-bold tracking-wider">
                    Average Response: 2 Hours
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 bg-palacio-gold/5 border border-palacio-gold/20 rounded-2xl backdrop-blur-sm">
            <MapPin size={20} className="text-palacio-gold" />
            <div className="text-left">
              <p className="text-palacio-gold font-cinzel text-xs font-bold tracking-wider">VISIT US</p>
              <p className="text-gray-400 text-sm">Golden Beach, Palawan, Philippines</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
