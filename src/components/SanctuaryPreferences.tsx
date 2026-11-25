import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Moon, Thermometer, GlassWater, Utensils } from 'lucide-react';

const PREFERENCES_STORAGE_KEY = 'palacio_sanctuary_preferences';

export interface GuestPreferences {
  pillow: string;
  temperature: string;
  welcomeDrink: string;
  dietary: string;
}

const DEFAULT_PREFERENCES: GuestPreferences = {
  pillow: 'Hungarian Goose Down',
  temperature: '22°C — Optimal Island Breeze',
  welcomeDrink: 'Dom Pérignon Champagne Flute',
  dietary: 'No Special Restrictions',
};

export default function SanctuaryPreferences() {
  const [prefs, setPrefs] = useState<GuestPreferences>(() => {
    try {
      const saved = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PREFERENCES;
  });

  const [isSaved, setIsSaved] = useState(false);

  const savePreferences = (newPrefs: GuestPreferences) => {
    setPrefs(newPrefs);
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(newPrefs));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch {}
  };

  const pillowOptions = [
    'Hungarian Goose Down',
    'Lavender Aromatherapy Foam',
    'Ergonomic Natural Latex',
    'Organic Bamboo Fibre',
  ];

  const tempOptions = [
    '20°C — Crisp Nordic',
    '22°C — Optimal Island Breeze',
    '24°C — Warm Tropical',
  ];

  const drinkOptions = [
    'Dom Pérignon Champagne Flute',
    'Chilled Fresh Buko Water',
    'Calamansi Hibiscus Elixir',
    'Sparkling Mineral Water with Lime',
  ];

  const dietaryOptions = [
    'No Special Restrictions',
    'Plant-Based / Vegan',
    'Pescatarian Sanctuary',
    'Shellfish & Nut Allergy',
    'Halal Compliant',
  ];

  return (
    <div className="rounded-2xl p-6 sm:p-8 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-palacio-bronze/10 border border-palacio-bronze/30 flex items-center justify-center">
            <Sparkles size={18} className="text-palacio-bronze" />
          </div>
          <div>
            <h3 className="font-playfair text-xl text-palacio-alabaster">
              Bespoke Sanctuary Preferences
            </h3>
            <p className="text-xs text-palacio-alabaster/60 font-cinzel tracking-wider">
              Curate your island arrival and villa atmosphere
            </p>
          </div>
        </div>

        {isSaved && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-cinzel uppercase tracking-wider animate-fade-in">
            <Check size={12} /> Saved to Concierge
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillow Menu */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-cinzel text-palacio-bronze uppercase tracking-wider">
            <Moon size={14} />
            <span>Pillow Atelier Menu</span>
          </label>
          <select
            value={prefs.pillow}
            onChange={(e) => savePreferences({ ...prefs, pillow: e.target.value })}
            className="w-full bg-[#0d0c0a] border border-white/[0.12] rounded-xl px-4 py-3 text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none transition-colors"
          >
            {pillowOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-[#0d0c0a] text-palacio-alabaster">
                {opt}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-palacio-alabaster/40 font-light italic">
            Prepared fresh by housekeeping prior to your arrival.
          </p>
        </div>

        {/* Room Climate */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-cinzel text-palacio-bronze uppercase tracking-wider">
            <Thermometer size={14} />
            <span>Villa Climate on Arrival</span>
          </label>
          <select
            value={prefs.temperature}
            onChange={(e) => savePreferences({ ...prefs, temperature: e.target.value })}
            className="w-full bg-[#0d0c0a] border border-white/[0.12] rounded-xl px-4 py-3 text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none transition-colors"
          >
            {tempOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-[#0d0c0a] text-palacio-alabaster">
                {opt}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-palacio-alabaster/40 font-light italic">
            Automated climate control activates 2 hours before check-in.
          </p>
        </div>

        {/* Welcome Drink */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-cinzel text-palacio-bronze uppercase tracking-wider">
            <GlassWater size={14} />
            <span>Arrival Libation</span>
          </label>
          <select
            value={prefs.welcomeDrink}
            onChange={(e) => savePreferences({ ...prefs, welcomeDrink: e.target.value })}
            className="w-full bg-[#0d0c0a] border border-white/[0.12] rounded-xl px-4 py-3 text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none transition-colors"
          >
            {drinkOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-[#0d0c0a] text-palacio-alabaster">
                {opt}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-palacio-alabaster/40 font-light italic">
            Served chilled upon speedboat landing at the jetty.
          </p>
        </div>

        {/* Dietary */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-cinzel text-palacio-bronze uppercase tracking-wider">
            <Utensils size={14} />
            <span>Dietary & Culinary Notes</span>
          </label>
          <select
            value={prefs.dietary}
            onChange={(e) => savePreferences({ ...prefs, dietary: e.target.value })}
            className="w-full bg-[#0d0c0a] border border-white/[0.12] rounded-xl px-4 py-3 text-xs text-palacio-alabaster focus:border-palacio-bronze/50 outline-none transition-colors"
          >
            {dietaryOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-[#0d0c0a] text-palacio-alabaster">
                {opt}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-palacio-alabaster/40 font-light italic">
            Shared directly with Executive Chef & culinary staff.
          </p>
        </div>
      </div>
    </div>
  );
}
