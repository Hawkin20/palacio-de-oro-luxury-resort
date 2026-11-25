import React, { createContext, useContext, useState, useEffect } from 'react';

export type LightingMode = 'nocturne' | 'golden-hour';

interface ThemeContextType {
  mode: LightingMode;
  toggleMode: () => void;
  setMode: (mode: LightingMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'nocturne',
  toggleMode: () => {},
  setMode: () => {},
});

const STORAGE_KEY = 'palacio_lighting_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<LightingMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LightingMode;
      if (saved === 'golden-hour' || saved === 'nocturne') return saved;
    } catch {}
    return 'nocturne';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'golden-hour') {
      root.setAttribute('data-theme', 'golden-hour');
    } else {
      root.removeAttribute('data-theme');
    }
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  }, [mode]);

  const setMode = (m: LightingMode) => setModeState(m);
  const toggleMode = () => setModeState(prev => (prev === 'nocturne' ? 'golden-hour' : 'nocturne'));

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
