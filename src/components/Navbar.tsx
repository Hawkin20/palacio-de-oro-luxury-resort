import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, LogOut, LogIn, User, ChevronDown, Calendar, Heart, Settings, Sparkles } from 'lucide-react';
import Auth from '../pages/Auth';

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
    { label: 'Rooms', value: 'rooms' },
    { label: 'Menu', value: 'menu' },
    { label: 'Bookings', value: 'bookings' },
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
                className="group flex-shrink-0 flex items-center space-x-2.5 hover:opacity-90 transition-opacity"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-palacio-gold to-[#997A15] rounded-md flex items-center justify-center shadow-md">
                  <span className="font-cinzel font-bold text-palacio-black text-lg">P</span>
                </div>
                <span className="hidden sm:block font-playfair text-xl font-bold tracking-wider text-palacio-alabaster group-hover:text-palacio-gold transition-colors">
                  Palacio de Oro
                </span>
              </button>

              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      onNavigate(item.value);
                      setIsOpen(false);
                    }}
                    className={`px-3.5 py-1.5 rounded text-xs font-cinzel tracking-[0.2em] uppercase smooth-transition ${
                      currentPage === item.value
                        ? 'text-palacio-gold bg-palacio-gold/10 font-bold border-b border-palacio-gold/50'
                        : 'text-palacio-alabaster/70 hover:text-palacio-gold hover:bg-white/[0.03]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="hidden md:flex items-center space-x-4">
                {userRole === 'admin' && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className="text-sm font-cinzel text-gray-300 hover:text-palacio-gold smooth-transition"
                  >
                    Admin
                  </button>
                )}
              <button
                onClick={() => onNavigate('menu')}
                className="relative p-2 text-gray-300 hover:text-palacio-gold smooth-transition"
              >
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-palacio-black bg-palacio-gold rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-full border border-palacio-gold/30 bg-white/5 hover:bg-white/10 smooth-transition"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-palacio-gold to-orange-400 flex items-center justify-center text-palacio-black font-bold text-sm">
                      {initial}
                    </div>
                    <span className="text-palacio-gold text-sm hidden lg:block max-w-[80px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown size={16} className="text-palacio-gold" />
                  </button>

                  {showDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                      <div className="absolute right-0 top-12 w-60 bg-palacio-black border border-palacio-gold/20 rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-4 bg-gradient-to-r from-palacio-gold/10 to-transparent border-b border-palacio-gold/10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-palacio-gold to-orange-400 flex items-center justify-center text-palacio-black font-bold">
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <p className="text-palacio-gold font-semibold text-sm truncate">{displayName}</p>
                              <p className="text-gray-400 text-xs truncate">{userEmail}</p>
                            </div>
                          </div>
                        </div>

                        <nav className="p-2">
                          <button
                            onClick={() => { onNavigate('profile'); setShowDropdown(false); }}
                            className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-gray-300 hover:text-palacio-gold hover:bg-palacio-gold/10 smooth-transition text-sm"
                          >
                            <User size={16} /> My Profile
                          </button>
                          <button
                            onClick={() => { onNavigate('bookings'); setShowDropdown(false); }}
                            className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-gray-300 hover:text-palacio-gold hover:bg-palacio-gold/10 smooth-transition text-sm"
                          >
                            <Calendar size={16} /> My Bookings
                          </button>
                          <button
                            onClick={() => { onNavigate('favorites'); setShowDropdown(false); }}
                            className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-gray-300 hover:text-palacio-gold hover:bg-palacio-gold/10 smooth-transition text-sm"
                          >
                            <Heart size={16} /> Saved Rooms
                          </button>
                          <button
                            onClick={() => { onNavigate('settings'); setShowDropdown(false); }}
                            className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-gray-300 hover:text-palacio-gold hover:bg-palacio-gold/10 smooth-transition text-sm"
                          >
                            <Settings size={16} /> Settings
                          </button>
                        </nav>

                        <div className="p-2 border-t border-palacio-gold/10">
                          <button
                            onClick={handleLogoutClick}
                            className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 smooth-transition text-sm"
                          >
                            <LogOut size={16} /> Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={onShowAuth}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-cinzel text-gray-300 hover:text-palacio-gold smooth-transition"
                >
                  <LogIn size={18} />
                  <span className="hidden sm:block">Login</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-palacio-gold"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isOpen && (
            <div className="md:hidden pb-4 space-y-2 border-t border-palacio-gold/20">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    onNavigate(item.value);
                    setIsOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm font-cinzel smooth-transition ${
                    currentPage === item.value
                      ? 'text-palacio-gold bg-palacio-gold/10'
                      : 'text-gray-300 hover:text-palacio-gold hover:bg-palacio-gold/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {userRole === 'admin' && (
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-cinzel text-gray-300 hover:text-palacio-gold hover:bg-palacio-gold/5"
                >
                  Admin
                </button>
              )}
              <button
                onClick={() => {
                  onNavigate('menu');
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-sm font-cinzel text-gray-300 hover:text-palacio-gold hover:bg-palacio-gold/5 flex items-center justify-between"
              >
                <span>Cart</span>
                {cartItemCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-palacio-black bg-palacio-gold rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {isLoggedIn ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-3 border-t border-palacio-gold/10 mt-2 pt-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-palacio-gold to-orange-400 flex items-center justify-center text-palacio-black font-bold text-sm">
                      {initial}
                    </div>
                    <div>
                      <p className="text-palacio-gold text-sm font-semibold">{displayName}</p>
                      <p className="text-gray-400 text-xs">{userEmail}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { onNavigate('profile'); setIsOpen(false); }}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm font-cinzel text-gray-300 hover:text-palacio-gold hover:bg-palacio-gold/5"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => { onNavigate('bookings'); setIsOpen(false); }}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm font-cinzel text-gray-300 hover:text-palacio-gold hover:bg-palacio-gold/5"
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm font-cinzel text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onShowAuth?.();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-cinzel text-gray-300 hover:text-palacio-gold hover:bg-palacio-gold/5"
                >
                  Login
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
