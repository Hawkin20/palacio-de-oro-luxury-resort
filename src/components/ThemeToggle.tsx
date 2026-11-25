import React from 'react';
import { useTheme } from '../lib/theme';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { mode, toggleMode } = useTheme();
  const isGolden = mode === 'golden-hour';

  return (
    <button
      onClick={toggleMode}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-palacio-bronze/40 hover:bg-white/[0.08] transition-all text-xs font-cinzel text-palacio-alabaster/80 hover:text-palacio-bronze"
      title={isGolden ? 'Switch to Nocturne (Obsidian Noir)' : 'Switch to Golden Hour (Travertine Dawn)'}
      aria-label="Toggle Lighting Mode"
    >
      {isGolden ? (
        <Sun size={14} className="text-amber-500 animate-[spin_10s_linear_infinite]" />
      ) : (
        <Moon size={14} className="text-palacio-bronze/80" />
      )}
      <span className="hidden 2xl:inline text-[10px] tracking-wider uppercase">
        {isGolden ? 'Golden Hour' : 'Nocturne'}
      </span>
    </button>
  );
}
