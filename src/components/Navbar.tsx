import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, LogOut, LogIn } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartItemCount: number;
  isLoggedIn: boolean;
  onLogout: () => void;
  onShowAuth?: () => void;
}

export default function Navbar({
  currentPage,
  onNavigate,
  cartItemCount,
  isLoggedIn,
  onLogout,
  onShowAuth,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <nav
      className={`fixed w-full z-50 smooth-transition ${
        isScrolled
          ? 'bg-palacio-black/95 backdrop-blur-glass shadow-glass border-b border-palacio-gold/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <button
            onClick={() => onNavigate('home')}
            className="flex-shrink-0 flex items-center space-x-2 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 bg-palacio-gold rounded flex items-center justify-center">
              <span className="font-cinzel font-bold text-palacio-black text-lg">P</span>
            </div>
            <span className="hidden sm:block font-playfair text-xl font-bold text-palacio-gold">
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
                className={`px-3 py-2 rounded-md text-sm font-cinzel smooth-transition ${
                  currentPage === item.value
                    ? 'text-palacio-gold bg-palacio-gold/10'
                    : 'text-gray-300 hover:text-palacio-gold hover:bg-palacio-gold/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => onNavigate('admin')}
              className="text-sm font-cinzel text-gray-300 hover:text-palacio-gold smooth-transition"
            >
              Admin
            </button>
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
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-cinzel text-gray-300 hover:text-palacio-gold smooth-transition"
              >
                <LogOut size={18} />
                <span className="hidden sm:block">Logout</span>
              </button>
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
            <button
              onClick={() => {
                onNavigate('admin');
                setIsOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-sm font-cinzel text-gray-300 hover:text-palacio-gold hover:bg-palacio-gold/5"
            >
              Admin
            </button>
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
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-sm font-cinzel text-gray-300 hover:text-palacio-gold hover:bg-palacio-gold/5"
              >
                Logout
              </button>
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
  );
}
