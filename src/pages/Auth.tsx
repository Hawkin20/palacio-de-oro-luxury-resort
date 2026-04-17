import { useState } from 'react';
import { supabase } from '../lib/supabase';
import GlassCard from '../components/GlassCard';

interface AuthProps {
  onClose: () => void;
}

export default function Auth({ onClose }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        await supabase.from('users').insert([
          { id: data.user.id, email, name, role: 'guest' },
        ]);
        
        setShowSuccess(true);
        
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      onClose();
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-20 flex items-center justify-center px-4 overflow-hidden">
      {/* LUXURY SUNSET BEACH BACKGROUND */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80")', // Luxury beach sunset
          filter: 'brightness(0.4) saturate(1.3)' 
        }}
      />
      {/* Warm sunset overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-orange-900/40 via-purple-900/20 to-black/60" />

      <GlassCard className="relative z-10 w-full max-w-md p-8 md:p-10 border border-palacio-gold/30 shadow-2xl bg-black/40 backdrop-blur-xl">
        <h1 className="font-playfair text-4xl md:text-5xl text-palacio-gold mb-3 text-center drop-shadow-lg">
          Palacio de Oro
        </h1>
        <p className="text-white/90 text-center mb-10 italic text-lg">
          {isSignUp ? 'Experience Summer Luxury' : 'Welcome back to Paradise'}
        </p>

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-900/70 border border-red-500 rounded-lg text-white text-sm">
              {error}
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-base font-cinzel text-palacio-gold mb-3">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={5}
                maxLength={18}
                pattern="^[A-Z][a-zA-Z0-9_ ]*$"
                title="Format invalid: Name must start with an uppercase letter (A-Z) and not exceed 18 characters."
                className="w-full px-5 py-4 bg-black/50 border-2 border-palacio-gold/50 rounded-lg text-white text-lg placeholder-gray-400 focus:outline-none focus:border-palacio-gold focus:bg-black/70 transition-all"
                placeholder="Ex: Vincent Ecaldre"
              />
            </div>
          )}

          <div>
            <label className="block text-base font-cinzel text-palacio-gold mb-3">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-4 bg-black/50 border-2 border-palacio-gold/50 rounded-lg text-white text-lg placeholder-gray-400 focus:outline-none focus:border-palacio-gold focus:bg-black/70 transition-all"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-base font-cinzel text-palacio-gold mb-3">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-4 bg-black/50 border-2 border-palacio-gold/50 rounded-lg text-white text-lg placeholder-gray-400 focus:outline-none focus:border-palacio-gold focus:bg-black/70 transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* MAIN BUTTON - GOLD LUXURY */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-palacio-gold via-yellow-500 to-palacio-gold text-palacio-black font-cinzel font-bold text-lg rounded-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 shadow-[0_0_20px_rgba(212,175,55,0.4)] border-2 border-palacio-gold mt-4"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* TOGGLE BUTTON */}
        <div className="mt-8 text-center">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-white hover:text-palacio-gold underline text-base font-cinzel transition-colors py-2 px-4"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose} 
          className="w-full mt-6 py-4 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all text-base font-cinzel border border-white/30"
        >
          Close
        </button>
      </GlassCard>

      {/* Success Overlay - LUXURY GOLD */}
      {showSuccess && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-500">
          <GlassCard className="p-12 border-palacio-gold/50 flex flex-col items-center text-center shadow-[0_0_60px_rgba(212,175,55,0.4)] animate-in zoom-in duration-300 bg-gradient-to-b from-black/60 to-orange-900/20">
            <div className="w-24 h-24 bg-gradient-to-br from-palacio-gold to-orange-400 rounded-full flex items-center justify-center mb-6 border-2 border-white animate-bounce shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-playfair text-4xl text-palacio-gold mb-3">Welcome to Paradise</h2>
            <p className="text-white/90 font-cinzel text-base tracking-widest uppercase">
              {name || 'Guest'}, your luxury journey begins.
            </p>
            <div className="mt-8 w-20 h-1 bg-gradient-to-r from-transparent via-palacio-gold to-transparent animate-pulse"></div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
