import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, LogOut, LogIn, User, ChevronDown, Calendar, Heart, Settings, Sparkles } from 'lucide-react';
import Auth from '../pages/Auth';
import PalacioLogo from './PalacioLogo';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartItemCount: number;
  isLoggedIn: boolean;
  onLogout: () => void;
  onShowAuth?: () => void;
  userEmail?: string;
  userName?: string;
  userRole?: string | null;
}

export default function Navbar({
  currentPage,
  onNavigate,
  cartItemCount,
  isLoggedIn,
  onLogout,
  onShowAuth,
  userEmail,
  userName,
  userRole,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogout, setIsLogout] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [countdown, setCountdown] = useState({ days: 12, hours: 5, minutes: 43, seconds: 21 });

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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', value: 'home' },
    { label: 'Accommodations', value: 'rooms' },
    { label: 'Restaurant & Dining', value: 'menu' },
    { label: 'Guest Portal', value: 'bookings' },
    { label: 'Contact', value: 'contact' },
  ];

  const handleLogoutClick = () => {
    setIsLogout(true);
    setShowAuth(true);
    setIsOpen(false);
    setShowDropdown(false);
  };

  const handleConfirmLogout = () => {
    onLogout();
    setShowAuth(false);
    setIsLogout(false);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
    setIsLogout(false);
  };

  const capitalizeFirst = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const displayName = capitalizeFirst(userName || userEmail?.split('@')[0] || 'Guest');
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {showPromo && currentPage === 'home' && (
          <div className="relative bg-gradient-to-r from-[#997A15] via-[#C5A880] to-[#997A15] text-[#080808] py-2 px-4 text-center font-cinzel text-xs font-semibold shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 pr-8 flex-wrap">
              <Sparkles size={14} className="shrink-0" />
              <span className="tracking-wider">SUMMER EXCLUSIVE:</span>
              <span className="hidden sm:inline font-normal">Book 3 nights, get the 4th FREE + complimentary spa session</span>
              <span className="bg-black/20 px-2.5 py-0.5 rounded-full font-mono text-[11px]">
                {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
              </span>
            </div>
            <button
              onClick={() => setShowPromo(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#080808]/70 hover:text-[#080808] transition"
              aria-label="Dismiss announcement"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <nav
          className={`w-full smooth-transition ${
            isScrolled
              ? 'bg-[#080808]/90 backdrop-blur-md border-b border-white/[0.08] shadow-2xl'
              : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <button
                onClick={() => onNavigate('home')}
                className="group flex-shrink-0 flex items-center space-x-3 hover:opacity-95 transition-opacity"
              >
                <PalacioLogo size={36} />
                <div className="flex flex-col text-left">
                  <span className="font-playfair text-xl md:text-2xl font-bold tracking-wider text-palacio-alabaster group-hover:text-palacio-bronze transition-colors leading-none">
                    Palacio de Oro
                  </span>
                  <span className="text-[9px] font-cinzel tracking-[0.25em] uppercase text-palacio-bronze/90 mt-0.5">
                    Resort & Sanctuary
                  </span>
                </div>
              </button>

              <div className="hidden lg:flex items-center space-x-1">
                {navItems.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      onNavigate(item.value);
                      setIsOpen(false);
                    }}
                    className={`px-2.5 xl:px-3.5 py-1.5 rounded text-xs font-cinzel tracking-[0.15em] xl:tracking-[0.2em] uppercase smooth-transition whitespace-nowrap ${
                      currentPage === item.value
                        ? 'text-palacio-gold bg-palacio-gold/10 font-bold border-b border-palacio-gold/50'
                        : 'text-palacio-alabaster/70 hover:text-palacio-gold hover:bg-white/[0.03]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="hidden lg:flex items-center space-x-3">
                {userRole === 'admin' && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className="text-xs font-cinzel font-semibold tracking-wider text-palacio-bronze border border-palacio-bronze/40 px-3 py-1.5 rounded-lg hover:bg-palacio-bronze/10 smooth-transition"
                  >
                    Admin Portal
                  </button>
                )}

                <button
                  onClick={() => onNavigate('menu')}
                  className="relative p-2 text-gray-300 hover:text-palacio-gold smooth-transition"
                  title="Selection Tray"
                >
                  <ShoppingCart size={19} />
                  {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-palacio-black bg-palacio-gold rounded-full">
                      {cartItemCount}
                    </span>
                  )}
                </button>

                {isLoggedIn ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('profile')}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-palacio-gold/30 bg-white/5 hover:bg-white/10 smooth-transition"
                      title="Profile & Sanctuary Settings"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-palacio-gold to-orange-400 flex items-center justify-center text-palacio-black font-bold text-xs">
                        {initial}
                      </div>
                      <span className="text-palacio-gold text-xs font-cinzel tracking-wider max-w-[100px] truncate">
                        {displayName}
                      </span>
                    </button>

                    <button
                      onClick={handleLogoutClick}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-cinzel tracking-wider uppercase font-semibold smooth-transition shadow-sm"
                      title="Sign Out of Sanctuary"
                    >
                      <LogOut size={13} />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onShowAuth}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-palacio-bronze text-palacio-obsidian font-cinzel text-xs font-semibold uppercase tracking-wider hover:bg-palacio-gold smooth-transition shadow-md shadow-palacio-bronze/20"
                  >
                    <LogIn size={15} />
                    <span>Login</span>
                  </button>
                )}
              </div>

            {/* Mobile & Tablet actions (Cart + Hamburger) */}
            <div className="lg:hidden flex items-center space-x-2">
              <button
                onClick={() => onNavigate('menu')}
                className="relative p-2 text-palacio-alabaster/80 hover:text-palacio-bronze transition-colors"
                aria-label="Selection Tray"
              >
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-palacio-obsidian bg-palacio-bronze rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-palacio-alabaster hover:text-palacio-bronze focus:outline-none"
                aria-label="Toggle Navigation"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {isOpen && (
            <div className="lg:hidden px-6 py-6 space-y-3 bg-[#0a0a0a] border-b border-palacio-bronze/30 shadow-2xl">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
                <ThemeToggle />
                <Soundscape />
                <CurrencySelector />
              </div>
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    onNavigate(item.value);
                    setIsOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-lg text-xs font-cinzel tracking-wider uppercase smooth-transition ${
                    currentPage === item.value
                      ? 'text-palacio-bronze bg-white/[0.06] font-semibold border-l-2 border-palacio-bronze'
                      : 'text-palacio-alabaster/70 hover:text-palacio-alabaster hover:bg-white/[0.04]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {userRole === 'admin' ? (
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg text-xs font-cinzel tracking-wider uppercase text-palacio-bronze hover:bg-white/[0.04]"
                >
                  Admin Portal
                </button>
              ) : (
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg text-xs font-cinzel tracking-wider uppercase text-palacio-alabaster/60 hover:text-palacio-bronze hover:bg-white/[0.04]"
                >
                  Admin Portal
                </button>
              )}
              <button
                onClick={() => {
                  onNavigate('rooms');
                  setIsOpen(false);
                }}
                className="block w-full text-center px-4 py-3 rounded-lg text-xs font-cinzel tracking-[0.2em] uppercase font-bold text-palacio-obsidian bg-gradient-to-r from-palacio-bronze via-[#E5C9A3] to-palacio-bronze shadow-md hover:brightness-110 smooth-transition"
              >
                Book Sanctuary
              </button>
              <button
                onClick={() => {
                  onNavigate('menu');
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-xs font-cinzel tracking-wider uppercase text-palacio-alabaster/70 hover:text-palacio-alabaster hover:bg-white/[0.04] flex items-center justify-between"
              >
                <span>Selection Tray</span>
                {cartItemCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold text-palacio-obsidian bg-palacio-bronze rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {isLoggedIn ? (
                <>
                  <div className="px-4 py-3 flex items-center gap-3 border-t border-white/[0.08] mt-3 pt-3">
                    <div className="w-8 h-8 rounded-full bg-palacio-bronze/20 border border-palacio-bronze/40 flex items-center justify-center text-palacio-bronze font-bold text-sm">
                      {initial}
                    </div>
                    <div>
                      <p className="text-palacio-alabaster text-sm font-medium">{displayName}</p>
                      <p className="text-palacio-alabaster/50 text-xs">{userEmail}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { onNavigate('profile'); setIsOpen(false); }}
                    className="block w-full text-left px-4 py-2.5 rounded-lg text-xs font-cinzel text-palacio-alabaster/70 hover:text-palacio-alabaster hover:bg-white/[0.04]"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => { onNavigate('bookings'); setIsOpen(false); }}
                    className="block w-full text-left px-4 py-2.5 rounded-lg text-xs font-cinzel text-palacio-alabaster/70 hover:text-palacio-alabaster hover:bg-white/[0.04]"
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-center py-2.5 rounded-lg text-xs font-cinzel font-semibold tracking-wider uppercase text-rose-300 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 mt-2 transition flex items-center justify-center gap-2"
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onShowAuth?.();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg text-xs font-cinzel tracking-wider uppercase text-palacio-bronze bg-white/[0.04] hover:bg-white/[0.08]"
                >
                  Guest Login / Register
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>

      {showAuth && (
        <Auth
          onClose={handleCloseAuth}
          isLogout={isLogout}
          onConfirmLogout={handleConfirmLogout}
        />
      )}
    </>
  );
}
