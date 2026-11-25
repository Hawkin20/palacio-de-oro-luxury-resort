import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, MapPin, Sparkles, ArrowRight, Eye, Users, BedDouble, UtensilsCrossed } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  subtitle: string;
  category: 'villas' | 'dining' | 'cottages' | 'wellness' | 'arrival';
  x: number; // percentage
  y: number; // percentage
  image: string;
  description: string;
  highlights: string[];
  actionLabel: string;
  actionPage: string;
}

const ZONES: Zone[] = [
  {
    id: 'overwater-villas',
    name: 'Overwater Sanctuary Villas',
    subtitle: 'North Lagoon Enclave',
    category: 'villas',
    x: 28,
    y: 26,
    image: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Exclusive stilted private villas situated directly over the turquoise coral lagoon with private infinity plunge pools and direct ocean ladder access.',
    highlights: ['Private Infinity Pool', 'Butler Dispatch', 'Direct Coral Reef Access'],
    actionLabel: 'View Villa Details',
    actionPage: 'rooms'
  },
  {
    id: 'dining-pavilion',
    name: 'Palacio Fine Dining & Wine Cellar',
    subtitle: 'Central Botanical Plateau',
    category: 'dining',
    x: 52,
    y: 44,
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Mediterranean-Spanish gastronomy led by Master Chefs, featuring wild-caught seafood, Iberian jamón, and sommelier-curated Rioja vintages.',
    highlights: ['Michelin-Caliber Culinary', 'Ocean Sunset Terrace', 'Sommelier Cellar'],
    actionLabel: 'Explore Dining Menu',
    actionPage: 'menu'
  },
  {
    id: 'beach-lagoon',
    name: 'Private Lagoon & Beach Club',
    subtitle: 'Sunset Strand',
    category: 'wellness',
    x: 68,
    y: 32,
    image: 'https://images.pexels.com/photos/1454496/pexels-photo-1454496.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Expansive private white-sand beach featuring bespoke cabanas, hydrotherapy spa pools, and open-air sunset cocktail rituals.',
    highlights: ['Heated Hydrotherapy', 'Sunset Libation Ritual', 'Private Cabanas'],
    actionLabel: 'Reserve Sanctuary',
    actionPage: 'rooms'
  },
  {
    id: 'cottage-enclave',
    name: 'Estate Cottages Enclave',
    subtitle: 'South Palm Grove',
    category: 'cottages',
    x: 42,
    y: 72,
    image: 'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Secluded tropical hardwood cottages designed for families and intimate gatherings, enveloped by whispering coconut palms and indigenous flora.',
    highlights: ['Full Chef Kitchen', 'Private Garden Veranda', '2 to 8 Guests'],
    actionLabel: 'View Cottages',
    actionPage: 'rooms'
  },
  {
    id: 'marina-jetty',
    name: 'Private Marina & Heliport',
    subtitle: 'Arrival Gateway',
    category: 'arrival',
    x: 82,
    y: 78,
    image: 'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=600',
    description: 'Dedicated deep-water private jetty accommodating resort speedboats and yachts, alongside a twin-engine certified helicopter landing pad.',
    highlights: ['VIP Speedboat Dock', 'Twin-Engine Helipad', 'Customs & Concierge'],
    actionLabel: 'Contact Concierge',
    actionPage: 'contact'
  }
];

interface ResortMapProps {
  onNavigate?: (page: string) => void;
}

export default function ResortMap({ onNavigate }: ResortMapProps) {
  const [activeZone, setActiveZone] = useState<Zone>(ZONES[0]);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2.5 px-5 py-2 bg-black/40 border border-white/10 rounded-full mb-4 backdrop-blur-md">
          <Compass size={14} className="text-palacio-bronze" />
          <span className="text-palacio-alabaster/90 font-cinzel text-[11px] tracking-[0.25em] uppercase">
            Private Island Geography
          </span>
        </div>
        <h2 className="font-playfair text-3xl sm:text-5xl font-normal text-palacio-alabaster mb-4">
          Interactive Sanctuary Map
        </h2>
        <p className="text-palacio-alabaster/60 font-poppins text-sm sm:text-base font-light max-w-2xl mx-auto italic">
          Explore our exclusive private atoll. Select any enclave to preview accommodations, culinary pavilions, and private retreat zones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Interactive SVG Island Map (7 cols) */}
        <div className="lg:col-span-7 relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#08141f] via-[#0b1926] to-[#070e17] border border-palacio-bronze/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] aspect-[4/3] flex items-center justify-center p-6 select-none">
          
          {/* Oceanic Contour Waves SVG Background */}
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 800 600" preserveAspectRatio="none">
            <defs>
              <radialGradient id="islandWater" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#1a3d54" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#0b1e2c" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#07121a" stopOpacity="0.9" />
              </radialGradient>
              <linearGradient id="islandSand" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C5A880" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8c704a" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Ocean Depth Rings */}
            <circle cx="420" cy="310" r="340" fill="none" stroke="#25516b" strokeWidth="1" strokeDasharray="6 8" opacity="0.4" />
            <circle cx="420" cy="310" r="280" fill="none" stroke="#316787" strokeWidth="1" opacity="0.3" />
            <circle cx="420" cy="310" r="220" fill="none" stroke="#488ca8" strokeWidth="1" strokeDasharray="4 6" opacity="0.3" />

            {/* Island Outer Reef / Sandbar */}
            <path
              d="M 230 180 C 350 110, 560 130, 640 220 C 720 310, 680 460, 580 510 C 480 560, 310 540, 240 460 C 170 380, 160 250, 230 180 Z"
              fill="url(#islandSand)"
              stroke="#C5A880"
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />

            {/* Lush Island Interior Topography */}
            <path
              d="M 270 210 C 360 150, 520 170, 580 250 C 640 330, 610 430, 530 460 C 450 490, 320 480, 270 410 C 220 340, 210 260, 270 210 Z"
              fill="#102319"
              stroke="#2e543e"
              strokeWidth="2"
              opacity="0.8"
            />
            
            {/* Mountain Ridge lines */}
            <path d="M 330 290 Q 420 250 510 320" fill="none" stroke="#427857" strokeWidth="1.5" opacity="0.6" />
            <path d="M 310 350 Q 430 380 530 360" fill="none" stroke="#427857" strokeWidth="1.5" opacity="0.6" />

            {/* Stilted Overwater Villa Boardwalk SVG */}
            <path d="M 270 220 L 220 160 L 170 180" fill="none" stroke="#C5A880" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M 220 160 L 230 120" fill="none" stroke="#C5A880" strokeWidth="2" strokeDasharray="3 3" />

            {/* Arrival Jetty Pier SVG */}
            <path d="M 580 470 L 670 510 L 710 490" fill="none" stroke="#C5A880" strokeWidth="3" />
          </svg>

          {/* Compass Rose */}
          <div className="absolute top-4 left-4 flex flex-col items-center opacity-70 pointer-events-none">
            <div className="w-8 h-8 rounded-full border border-palacio-bronze/40 flex items-center justify-center">
              <span className="text-[10px] font-cinzel font-bold text-palacio-bronze">N</span>
            </div>
            <div className="w-px h-3 bg-palacio-bronze/40 mt-1" />
          </div>

          {/* Interactive Zone Pins */}
          {ZONES.map((zone) => {
            const isSelected = activeZone.id === zone.id;
            const isHovered = hoveredZone === zone.id;

            return (
              <div
                key={zone.id}
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                onClick={() => setActiveZone(zone)}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
              >
                {/* Glowing Pulse Radar for Selected */}
                {isSelected && (
                  <span className="absolute -inset-3 rounded-full bg-palacio-bronze/30 animate-ping pointer-events-none" />
                )}

                {/* Pin Head */}
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                    isSelected
                      ? 'bg-palacio-bronze text-palacio-obsidian scale-125 border-2 border-white'
                      : isHovered
                      ? 'bg-palacio-bronze/80 text-palacio-obsidian scale-110 border border-white/60'
                      : 'bg-black/80 text-palacio-bronze border border-palacio-bronze/50 hover:border-palacio-bronze'
                  }`}
                >
                  <MapPin size={15} className={isSelected ? 'fill-current' : ''} />
                </div>

                {/* Floating Pin Label */}
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[9px] font-cinzel tracking-wider uppercase backdrop-blur-md transition-all pointer-events-none ${
                  isSelected 
                    ? 'bg-palacio-bronze text-palacio-obsidian font-bold shadow-lg' 
                    : 'bg-black/70 text-palacio-alabaster/80 border border-white/10'
                }`}>
                  {zone.name.split(' ')[0]}
                </div>
              </div>
            );
          })}

          {/* Bottom Map Legend */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-cinzel text-palacio-alabaster/60 pointer-events-none">
            <span>Palacio de Oro Atoll (11°12'N 119°24'E)</span>
            <span className="text-palacio-bronze">Click pins to inspect enclave</span>
          </div>
        </div>

        {/* Selected Zone Detail Card (5 cols) */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeZone.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl p-7 bg-white/[0.03] border border-palacio-bronze/30 backdrop-blur-xl shadow-2xl space-y-6"
            >
              {/* Photo Preview */}
              <div className="relative h-48 rounded-xl overflow-hidden border border-white/[0.08]">
                <img
                  src={activeZone.image}
                  alt={activeZone.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] font-cinzel tracking-wider uppercase text-palacio-bronze backdrop-blur-md">
                  {activeZone.subtitle}
                </div>
              </div>

              {/* Title & Info */}
              <div>
                <h3 className="font-playfair text-2xl text-palacio-alabaster font-medium mb-2">
                  {activeZone.name}
                </h3>
                <p className="text-xs text-palacio-alabaster/70 leading-relaxed font-light">
                  {activeZone.description}
                </p>
              </div>

              {/* Highlights Chips */}
              <div className="space-y-2">
                <span className="text-[10px] font-cinzel uppercase tracking-widest text-palacio-bronze block font-semibold">
                  Enclave Amenities
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeZone.highlights.map((h, i) => (
                    <span 
                      key={i}
                      className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-palacio-alabaster/80 font-cinzel"
                    >
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Direct Action Button */}
              <button
                onClick={() => onNavigate?.(activeZone.actionPage)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-palacio-bronze via-[#E5C9A3] to-palacio-bronze text-palacio-obsidian font-cinzel text-xs font-bold tracking-[0.2em] uppercase hover:brightness-110 shadow-xl transition-all flex items-center justify-center gap-2 group"
              >
                <span>{activeZone.actionLabel}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
