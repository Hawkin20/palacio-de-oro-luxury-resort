import React, { useState, useRef, useEffect } from 'react';
import { useCurrency, CURRENCIES, CurrencyCode } from '../lib/currency';
import { Globe, ChevronDown } from 'lucide-react';

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-palacio-bronze/40 hover:bg-white/[0.08] transition-all text-xs font-cinzel text-palacio-alabaster/80 hover:text-palacio-bronze"
        aria-label="Select Currency"
      >
        <Globe size={13} className="text-palacio-bronze/80" />
        <span className="font-semibold tracking-wider">{currency}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-32 rounded-xl bg-[#0d0d0d] border border-palacio-bronze/30 shadow-2xl py-1 z-50 overflow-hidden">
          {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
            const item = CURRENCIES[code];
            const isSelected = currency === code;
            return (
              <button
                key={code}
                onClick={() => {
                  setCurrency(code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-cinzel transition-colors text-left ${
                  isSelected
                    ? 'bg-palacio-bronze/20 text-palacio-bronze font-bold'
                    : 'text-palacio-alabaster/70 hover:text-palacio-alabaster hover:bg-white/[0.04]'
                }`}
              >
                <span>{item.code}</span>
                <span className="text-palacio-bronze/80 font-mono text-[11px]">{item.symbol}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
