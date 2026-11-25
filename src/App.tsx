import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { CartItem } from './lib/types';
import { CurrencyProvider } from './lib/currency';
import { ThemeProvider } from './lib/theme';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Menu from './pages/Menu';
import Bookings from './pages/Bookings';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import Profile from './pages/Profile';

const VALID_PAGES = ['home', 'rooms', 'menu', 'bookings', 'contact', 'admin', 'profile'];

const getInitialPage = () => {
  const path = window.location.pathname.replace(/^\//, '').toLowerCase();
  return VALID_PAGES.includes(path) ? path : 'home';
};

function App() {
  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string>();
  const [userEmail, setUserEmail] = useState<string>();
  const [userName, setUserName] = useState<string>();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showAuth, setShowAuth] = useState(false);

  const fetchRole = async (uid: string, email?: string) => {
    if (email === 'vincentecaldre25@gmail.com') {
      setUserRole('admin');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', uid)
        .maybeSingle();
      if (!error && data?.role) {
        setUserRole(data.role);
      } else {
        setUserRole('guest');
      }
    } catch {
      setUserRole('guest');
    }
  };

  useEffect(() => {
    checkAuth();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
          setUserEmail(session.user.email);
          setUserName(session.user.user_metadata?.full_name);
          fetchRole(session.user.id, session.user.email);
        } else {
          setIsLoggedIn(false);
          setUserId(undefined);
          setUserEmail(undefined);
          setUserName(undefined);
          setUserRole(null);
        }
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setIsLoggedIn(true);
      setUserId(session.user.id);
      setUserEmail(session.user.email);
      setUserName(session.user.user_metadata?.full_name);
      fetchRole(session.user.id, session.user.email);
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    const path = page === 'home' ? '/' : `/${page}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '').toLowerCase();
      setCurrentPage(VALID_PAGES.includes(path) ? path : 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserId(undefined);
    setUserEmail(undefined);
    setUserName(undefined);
    setUserRole(null);
    handleNavigate('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'rooms':
        return <Rooms userId={userId} isLoggedIn={isLoggedIn} onNavigate={handleNavigate} />;
      case 'menu':
        return <Menu userId={userId} isLoggedIn={isLoggedIn} cart={cart} setCart={setCart} />;
      case 'bookings':
        return <Bookings userId={userId} isLoggedIn={isLoggedIn} onNavigate={handleNavigate} />;
      case 'contact':
        return <Contact />;
      case 'admin':
        return <Admin isLoggedIn={isLoggedIn} userRole={userRole} />;
      case 'profile':
        return <Profile />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  if (showAuth) {
    return <Auth onClose={() => setShowAuth(false)} />;
  }

  return (
    <ThemeProvider>
      <CurrencyProvider>
        <div className="min-h-screen bg-palacio-black flex flex-col transition-colors duration-500">
          <Navbar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            cartItemCount={cart.length}
            isLoggedIn={isLoggedIn}
            onLogout={handleLogout}
            onShowAuth={() => setShowAuth(true)}
            userEmail={userEmail}
            userName={userName}
            userRole={userRole}
          />
          <main className="flex-1">
            {renderPage()}
          </main>
        </div>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;
