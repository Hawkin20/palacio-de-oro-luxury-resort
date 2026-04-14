import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { CartItem } from './lib/types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Menu from './pages/Menu';
import Bookings from './pages/Bookings';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Auth from './pages/Auth';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string>();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    checkAuth();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
        } else {
          setIsLoggedIn(false);
          setUserId(undefined);
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      setIsLoggedIn(true);
      setUserId(session.user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserId(undefined);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'rooms':
        return (
          <Rooms
            userId={userId}
            isLoggedIn={isLoggedIn}
            onNavigate={setCurrentPage}
          />
        );
      case 'menu':
        return (
          <Menu
            userId={userId}
            isLoggedIn={isLoggedIn}
            cart={cart}
            setCart={setCart}
          />
        );
      case 'bookings':
        return (
          <Bookings userId={userId} isLoggedIn={isLoggedIn} />
        );
      case 'contact':
        return <Contact />;
      case 'admin':
        return <Admin isLoggedIn={isLoggedIn} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  if (showAuth) {
    return <Auth onClose={() => setShowAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-palacio-black flex flex-col">
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        cartItemCount={cart.length}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onShowAuth={() => setShowAuth(true)}
      />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
