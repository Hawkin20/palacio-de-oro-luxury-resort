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
        alert('Sign up successful! Please check your email.');
        onClose();
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
      {/* Summer Background Layer - Mas maliwanag at makulay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80")',
          filter: 'brightness(0.6) saturate(1.2)' // Binawasan ang dilim para magmukhang summer
        }}
      />

      <GlassCard className="relative z-10 w-full max-w-md p-8 border border-white/20">
        <h1 className="font-playfair text-3xl text-palacio-gold mb-2 text-center drop-shadow-md">
          Palacio de Oro
        </h1>
        <p className="text-white/80 text-center mb-8 italic">
          {isSignUp ? 'Experience Summer Luxury' : 'Welcome back to Paradise'}
        </p>

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-900/60 border border-red-500 rounded text-white text-sm">
              {error}
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-sm font-cinzel text-palacio-gold mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={5}
                maxLength={18} // Limit sa 18 characters
                pattern="^[A-Z][a-zA-Z0-9_ ]*$" // Dapat Capital ang simula
                title="Format invalid: Name must start with an uppercase letter (A-Z) and not exceed 18 characters."
                className="w-full px-4 py-2 bg-black/30 border border-palacio-gold/50 rounded text-white placeholder-gray-300 focus:outline-none focus:border-palacio-gold"
                placeholder="Ex: Vincent Ecaldre"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-cinzel text-palacio-gold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-black/30 border border-palacio-gold/50 rounded text-white placeholder-gray-300 focus:outline-none"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-cinzel text-palacio-gold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-black/30 border border-palacio-gold/50 rounded text-white placeholder-gray-300 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-palacio-gold text-palacio-black font-cinzel font-semibold rounded hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-white hover:text-palacio-gold underline text-sm font-cinzel transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <button onClick={onClose} className="w-full mt-4 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition-all text-sm">
          Close
        </button>
      </GlassCard>
    </div>
  );
}

