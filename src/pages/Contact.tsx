import { Mail, Facebook, MessageSquare } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function Contact() {
  return (
    <div className="relative min-h-screen pt-24 pb-20 overflow-hidden">
      {/* Summer Background Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center fixed"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80")', // Light beach hut vibe
          filter: 'brightness(0.2) saturate(1.2)' 
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-4 text-palacio-gold">Contact & Support</h1>
        <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto italic font-poppins">
          Get in touch with our luxury team. We're here to ensure your summer experience
          is unforgettable.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Vincent - Lead Developer */}
          <GlassCard className="p-8 text-center border border-palacio-gold/40 ring-1 ring-palacio-gold/20 hover:ring-palacio-gold animate-glow-pulse backdrop-blur-xl">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-palacio-gold/20 shadow-lg shadow-palacio-gold/10">
                <span className="text-3xl">👑</span>
              </div>
            </div>
            <h3 className="font-playfair text-2xl text-palacio-gold mb-2">
              Developer & Admin
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Primary contact for resort and system inquiries
            </p>

            <div className="space-y-4">
              <div>
                <p className="font-cinzel text-lg text-palacio-gold mb-1 tracking-wider">
                  Vincent Ecaldre
                </p>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Lead System Architect</p>
              </div>

              <a
                href="mailto:vincentecaldre25@gmail.com"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-palacio-gold/10 border border-palacio-gold/30 text-palacio-gold rounded hover:bg-palacio-gold hover:text-palacio-black smooth-transition w-full justify-center text-xs"
              >
                <Mail size={14} />
                <span className="font-cinzel">vincentecaldre25@gmail.com</span>
              </a>

              <a
                href="https://www.facebook.com/Ilove.tomboybaddie"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded hover:bg-blue-600/40 smooth-transition w-full justify-center text-xs"
              >
                <Facebook size={14} />
                <span className="font-cinzel">Facebook Profile</span>
              </a>
            </div>
          </GlassCard>

          {/* Rommel - Support Lead */}
          <GlassCard className="p-8 text-center border border-white/10 backdrop-blur-md">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-palacio-gold/20">
                <MessageSquare size={32} className="text-palacio-gold" />
              </div>
            </div>
            <h3 className="font-playfair text-2xl text-palacio-gold mb-2">
              Support Lead
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Guest service and reservation assistance
            </p>

            <div className="space-y-4">
              <div>
                <p className="font-cinzel text-lg text-palacio-gold mb-1 tracking-wider">
                  Rommel Cabanza
                </p>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Customer Support Manager</p>
              </div>

              <a
                href="https://www.facebook.com/rommel.cabanza.2025"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded hover:bg-blue-600/40 smooth-transition w-full justify-center text-xs"
              >
                <Facebook size={14} />
                <span className="font-cinzel">Facebook Profile</span>
              </a>
            </div>
          </GlassCard>

          {/* Official Support Page */}
          <GlassCard className="p-8 text-center border border-white/10 backdrop-blur-md">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-palacio-gold/20">
                <span className="text-3xl">🏨</span>
              </div>
            </div>
            <h3 className="font-playfair text-2xl text-palacio-gold mb-2">
              Official Page
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Direct support and official announcements
            </p>

            <div className="space-y-4">
              <div>
                <p className="font-cinzel text-lg text-palacio-gold mb-1 tracking-wider">
                  Palacio de Oro
                </p>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Main Support Channel</p>
              </div>

              <a
                href="https://www.facebook.com/profile.php?id=61588094229904"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded hover:bg-blue-600/40 smooth-transition w-full justify-center text-xs"
              >
                <Facebook size={14} />
                <span className="font-cinzel">Support Page</span>
              </a>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Contact Form */}
          <GlassCard className="p-8 border border-white/10">
            <h2 className="font-playfair text-2xl text-palacio-gold mb-6 border-b border-palacio-gold/20 pb-2">
              Quick Inquiry
            </h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-cinzel text-palacio-gold mb-2 tracking-widest">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded text-white placeholder-gray-600 focus:border-palacio-gold focus:outline-none smooth-transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-cinzel text-palacio-gold mb-2 tracking-widest">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded text-white placeholder-gray-600 focus:border-palacio-gold focus:outline-none smooth-transition text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-cinzel text-palacio-gold mb-2 tracking-widest">Message</label>
                <textarea
                  placeholder="Tell us about your plans..."
                  rows={4}
                  className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded text-white placeholder-gray-600 focus:border-palacio-gold focus:outline-none smooth-transition resize-none text-sm"
                />
              </div>
              <button className="gold-glow-btn w-full py-3">Send Summer Inquiry</button>
            </form>
          </GlassCard>

          {/* Why Choose Us */}
          <GlassCard className="p-8 border border-white/10">
            <h2 className="font-playfair text-2xl text-palacio-gold mb-6 border-b border-palacio-gold/20 pb-2">
              Why Experience Palacio?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'Summer Paradise', desc: 'The ultimate beach getaway vibe.' },
                { title: '24/7 Concierge', desc: 'Round-the-clock personal support.' },
                { title: 'Spanish Cuisine', desc: 'Authentic flavors by master chefs.' },
                { title: 'Easy Booking', desc: 'Seamless reservation experience.' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-palacio-gold/10 flex items-center justify-center mt-1 border border-palacio-gold/30">
                    <span className="text-palacio-gold text-xs">★</span>
                  </div>
                  <div>
                    <h4 className="font-cinzel text-palacio-gold text-sm font-bold tracking-wide">
                      {item.title}
                    </h4>
                    <p className="text-gray-400 text-[11px] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-palacio-gold/5 border border-palacio-gold/20 rounded-lg">
              <p className="text-gray-300 text-xs italic text-center">
                "Our mission is to bridge the gap between golden luxury and the warmth of a summer breeze."
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
