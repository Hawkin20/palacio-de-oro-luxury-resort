import { Mail, Facebook, MessageSquare } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function Contact() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="section-title mb-4">Contact & Support</h1>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Get in touch with our luxury team. We're here to ensure your experience
          is unforgettable.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <GlassCard className="p-8 text-center ring-2 ring-palacio-gold/50 hover:ring-palacio-gold animate-glow-pulse">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-palacio-gold/20">
                <span className="text-3xl">👑</span>
              </div>
            </div>
            <h3 className="font-playfair text-2xl text-palacio-gold mb-2">
              Developer & Admin
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Primary contact for resort and dining inquiries
            </p>

            <div className="space-y-4">
              <div>
                <p className="font-cinzel text-lg text-palacio-gold mb-1">
                  Vincent Ecaldre
                </p>
                <p className="text-gray-400 text-sm">Lead Developer</p>
              </div>

              <a
                href="mailto:vincentecaldre25@gmail.com"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-palacio-gold/20 text-palacio-gold rounded hover:bg-palacio-gold/30 smooth-transition w-full justify-center"
              >
                <Mail size={18} />
                <span className="font-cinzel">vincentecaldre25@gmail.com</span>
              </a>

              <a
                href="https://www.facebook.com/Ilove.tomboybaddie"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600/30 text-blue-300 rounded hover:bg-blue-600/40 smooth-transition w-full justify-center"
              >
                <Facebook size={18} />
                <span className="font-cinzel text-sm">Facebook Profile</span>
              </a>
            </div>
          </GlassCard>

          <GlassCard className="p-8 text-center">
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
                <p className="font-cinzel text-lg text-palacio-gold mb-1">
                  Rommel Cabanza
                </p>
                <p className="text-gray-400 text-sm">Customer Support Manager</p>
              </div>

              <a
                href="https://www.facebook.com/rommel.cabanza.2025"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600/30 text-blue-300 rounded hover:bg-blue-600/40 smooth-transition w-full justify-center"
              >
                <Facebook size={18} />
                <span className="font-cinzel text-sm">Facebook Profile</span>
              </a>
            </div>
          </GlassCard>

          <GlassCard className="p-8 text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-palacio-gold/20">
                <MessageSquare size={32} className="text-palacio-gold" />
              </div>
            </div>
            <h3 className="font-playfair text-2xl text-palacio-gold mb-2">
              Support Account
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Direct support and inquiries
            </p>

            <div className="space-y-4">
              <div>
                <p className="font-cinzel text-lg text-palacio-gold mb-1">
                  Palacio de Oro
                </p>
                <p className="text-gray-400 text-sm">Official Support</p>
              </div>

              <a
                href="https://www.facebook.com/profile.php?id=61588094229904"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600/30 text-blue-300 rounded hover:bg-blue-600/40 smooth-transition w-full justify-center"
              >
                <Facebook size={18} />
                <span className="font-cinzel text-sm">Support Page</span>
              </a>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="p-8">
            <h2 className="font-playfair text-2xl text-palacio-gold mb-6">
              Quick Contact Form
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-cinzel text-palacio-gold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-2 bg-white/10 border border-palacio-gold/30 rounded text-white placeholder-gray-500 focus:border-palacio-gold focus:outline-none smooth-transition"
                />
              </div>
              <div>
                <label className="block text-sm font-cinzel text-palacio-gold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 bg-white/10 border border-palacio-gold/30 rounded text-white placeholder-gray-500 focus:border-palacio-gold focus:outline-none smooth-transition"
                />
              </div>
              <div>
                <label className="block text-sm font-cinzel text-palacio-gold mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="How can we help?"
                  className="w-full px-4 py-2 bg-white/10 border border-palacio-gold/30 rounded text-white placeholder-gray-500 focus:border-palacio-gold focus:outline-none smooth-transition"
                />
              </div>
              <div>
                <label className="block text-sm font-cinzel text-palacio-gold mb-2">
                  Message
                </label>
                <textarea
                  placeholder="Tell us more..."
                  rows={4}
                  className="w-full px-4 py-2 bg-white/10 border border-palacio-gold/30 rounded text-white placeholder-gray-500 focus:border-palacio-gold focus:outline-none smooth-transition resize-none"
                />
              </div>
              <button className="gold-glow-btn w-full">Send Message</button>
            </form>
          </GlassCard>

          <GlassCard className="p-8">
            <h2 className="font-playfair text-2xl text-palacio-gold mb-6">
              Why Choose Us
            </h2>
            <ul className="space-y-4">
              {[
                {
                  title: '5-Star Luxury',
                  desc: 'Exquisite accommodations and premium dining experiences',
                },
                {
                  title: '24/7 Support',
                  desc: 'Round-the-clock concierge service for all your needs',
                },
                {
                  title: 'Spanish Heritage',
                  desc: 'Authentic Mediterranean cuisine and architecture',
                },
                {
                  title: 'Premium Location',
                  desc: 'Stunning views and convenient access to attractions',
                },
                {
                  title: 'Personalized Service',
                  desc: 'Tailored experiences for every guest',
                },
                {
                  title: 'Easy Booking',
                  desc: 'Simple online reservation system',
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-palacio-gold/20 flex items-center justify-center mt-1">
                    <span className="text-palacio-gold font-cinzel text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-cinzel text-palacio-gold">
                      {item.title}
                    </h4>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
