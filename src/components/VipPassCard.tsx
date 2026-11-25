import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, QrCode, ShieldCheck, Download, Check, KeyRound } from 'lucide-react';
import PalacioLogo from './PalacioLogo';

interface VipPassCardProps {
  guestName: string;
  guestEmail: string;
  memberSince?: string;
  role?: string;
}

export default function VipPassCard({
  guestName,
  guestEmail,
  memberSince = '2026',
  role = 'guest'
}: VipPassCardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [showQrExpanded, setShowQrExpanded] = useState(false);

  const memberId = `PDO-${guestEmail ? Math.abs(guestEmail.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0) % 90000 + 10000) : '88219'}`;
  const isVip = role === 'admin' || role === 'vip';
  const tierName = isVip ? 'Palacio Imperial Resident' : 'Palacio Sanctuary Club';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotateX(-y / 15);
    setRotateY(x / 15);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(memberId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center">
      {/* 3D Interactive Card Container */}
      <div 
        className="w-full max-w-md perspective-1000 cursor-pointer select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          animate={{ rotateX, rotateY }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative rounded-2xl p-7 bg-gradient-to-br from-[#1c1813] via-[#0d0c0a] to-[#080808] border border-[#C5A880]/50 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(197,168,128,0.15)] overflow-hidden"
        >
          {/* Subtle Metallic Foil Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[#C5A880]/10 blur-3xl pointer-events-none" />

          {/* Card Header: Crest + Tier */}
          <div className="flex items-start justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <PalacioLogo size={34} />
              <div>
                <h3 className="font-playfair text-lg text-palacio-alabaster tracking-wider leading-none">
                  Palacio de Oro
                </h3>
                <p className="text-[9px] font-cinzel tracking-[0.25em] uppercase text-palacio-bronze mt-1">
                  Private Island Sanctuary
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-palacio-bronze/10 border border-palacio-bronze/30">
              <Sparkles size={11} className="text-palacio-bronze" />
              <span className="text-[9px] font-cinzel font-bold tracking-widest uppercase text-palacio-bronze">
                {isVip ? 'Imperial' : 'Resident'}
              </span>
            </div>
          </div>

          {/* Chip & NFC Indicator */}
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="w-11 h-8 rounded-md bg-gradient-to-br from-[#d4af37] via-[#f3e5ab] to-[#aa771c] border border-amber-300/40 p-1 flex flex-col justify-between shadow-inner">
              <div className="w-full h-1 bg-amber-900/30 rounded-sm" />
              <div className="flex justify-between">
                <div className="w-3 h-3 border border-amber-900/30 rounded-sm" />
                <div className="w-3 h-3 border border-amber-900/30 rounded-sm" />
              </div>
              <div className="w-full h-1 bg-amber-900/30 rounded-sm" />
            </div>

            <div className="flex items-center gap-2 text-palacio-alabaster/40 font-mono text-[10px] tracking-widest">
              <KeyRound size={14} className="text-palacio-bronze/70" />
              <span>SMART KEYPASS</span>
            </div>
          </div>

          {/* Card Body: Member Info + Mini QR */}
          <div className="flex items-end justify-between relative z-10">
            <div>
              <p className="text-[9px] font-cinzel tracking-[0.2em] uppercase text-palacio-alabaster/50 mb-1">
                Resident Name
              </p>
              <h4 className="font-playfair text-xl text-palacio-alabaster tracking-wide">
                {guestName || 'Distinguished Guest'}
              </h4>
              <p className="text-[10px] font-cinzel tracking-wider text-palacio-bronze/90 mt-1">
                {tierName} • Est. {memberSince}
              </p>
            </div>

            {/* Simulated QR Code for island entry */}
            <div 
              onClick={() => setShowQrExpanded(!showQrExpanded)}
              className="p-2 bg-white rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
              title="Click to expand Island QR Pass"
            >
              <svg viewBox="0 0 25 25" className="w-10 h-10">
                <rect width="25" height="25" fill="white" />
                {/* QR Finder patterns */}
                <rect x="2" y="2" width="7" height="7" fill="black" />
                <rect x="3" y="3" width="5" height="5" fill="white" />
                <rect x="4" y="4" width="3" height="3" fill="black" />
                <rect x="16" y="2" width="7" height="7" fill="black" />
                <rect x="17" y="3" width="5" height="5" fill="white" />
                <rect x="18" y="4" width="3" height="3" fill="black" />
                <rect x="2" y="16" width="7" height="7" fill="black" />
                <rect x="3" y="17" width="5" height="5" fill="white" />
                <rect x="4" y="18" width="3" height="3" fill="black" />
                {/* Random decorative QR data blocks */}
                <rect x="11" y="3" width="2" height="4" fill="black" />
                <rect x="11" y="9" width="3" height="2" fill="black" />
                <rect x="5" y="11" width="4" height="2" fill="black" />
                <rect x="12" y="14" width="3" height="3" fill="black" />
                <rect x="17" y="11" width="5" height="2" fill="black" />
                <rect x="16" y="16" width="3" height="5" fill="black" />
                <rect x="21" y="18" width="2" height="3" fill="black" />
              </svg>
            </div>
          </div>

          {/* Card Footer: ID Code */}
          <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-palacio-alabaster/60 relative z-10">
            <span className="tracking-widest">{memberId}</span>
            <button 
              onClick={handleCopyId}
              className="text-[10px] font-cinzel text-palacio-bronze hover:text-palacio-gold transition-colors flex items-center gap-1"
            >
              {isCopied ? <Check size={11} className="text-emerald-400" /> : null}
              {isCopied ? 'Copied' : 'Copy Key ID'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Quick Action Badges below card */}
      <div className="flex items-center gap-4 mt-4 text-xs font-cinzel text-palacio-alabaster/60">
        <span className="flex items-center gap-1.5 text-palacio-bronze">
          <ShieldCheck size={14} />
          <span>Biometric & NFC Island Entry</span>
        </span>
        <span>•</span>
        <span className="text-emerald-400">Status: Active</span>
      </div>

      {/* Expanded QR Modal */}
      {showQrExpanded && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowQrExpanded(false)}
        >
          <div 
            className="bg-[#0f0e0c] border border-palacio-bronze/40 p-8 rounded-2xl max-w-xs text-center shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-palacio-bronze/10 border border-palacio-bronze/30 flex items-center justify-center">
              <QrCode size={24} className="text-palacio-bronze" />
            </div>
            <h4 className="font-playfair text-xl text-palacio-alabaster">Sanctuary KeyPass</h4>
            <p className="text-xs text-palacio-alabaster/60">Scan at the Marina Jetty, Helipad, or Villa Keycard Terminal.</p>
            
            <div className="bg-white p-4 rounded-xl mx-auto inline-block shadow-lg">
              <svg viewBox="0 0 25 25" className="w-40 h-40">
                <rect width="25" height="25" fill="white" />
                <rect x="2" y="2" width="7" height="7" fill="black" />
                <rect x="3" y="3" width="5" height="5" fill="white" />
                <rect x="4" y="4" width="3" height="3" fill="black" />
                <rect x="16" y="2" width="7" height="7" fill="black" />
                <rect x="17" y="3" width="5" height="5" fill="white" />
                <rect x="18" y="4" width="3" height="3" fill="black" />
                <rect x="2" y="16" width="7" height="7" fill="black" />
                <rect x="3" y="17" width="5" height="5" fill="white" />
                <rect x="4" y="18" width="3" height="3" fill="black" />
                <rect x="11" y="3" width="2" height="4" fill="black" />
                <rect x="11" y="9" width="3" height="2" fill="black" />
                <rect x="5" y="11" width="4" height="2" fill="black" />
                <rect x="12" y="14" width="3" height="3" fill="black" />
                <rect x="17" y="11" width="5" height="2" fill="black" />
                <rect x="16" y="16" width="3" height="5" fill="black" />
                <rect x="21" y="18" width="2" height="3" fill="black" />
              </svg>
            </div>

            <p className="font-mono text-xs text-palacio-bronze font-bold">{memberId}</p>

            <button
              onClick={() => setShowQrExpanded(false)}
              className="w-full py-2.5 rounded-lg bg-palacio-bronze text-palacio-obsidian font-cinzel text-xs font-semibold uppercase tracking-wider"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
