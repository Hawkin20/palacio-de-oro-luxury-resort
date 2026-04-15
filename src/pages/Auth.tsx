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
        options: {
          data: {
            name,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        await supabase.from('users').insert([
          {
            id: data.user.id,
            email,
            name,
            role: 'guest',
          },
        ]);

        setEmail('');
        setPassword('');
        setName('');
        alert('Sign up successful! Please check your email to confirm.');
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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      setEmail('');
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center px-4">
      <GlassCard className="w-full max-w-md p-8">
        <h1 className="font-playfair text-3xl text-palacio-gold mb-2 text-center">
          Palacio de Oro
        </h1>
        <p className="text-gray-400 text-center mb-8">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </p>

        <form
          onSubmit={isSignUp ? handleSignUp : handleSignIn}
          className="space-y-4"
        >
          {error && (
            <div className="p-3 bg-red-900/40 border border-red-500 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-sm font-cinzel text-palacio-gold mb-2">
                Full Name
              </label>
              <input
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
  minLength={5}
  maxLength={18}
  pattern="^[A-Z][a-zA-Z0-9_ ]*$"
  title="Dapat magsimula sa Capital Letter at hanggang 18 characters lang."
  className="w-full px-4 py-2 bg-white/10 border border-palacio-gold/30 rounded text-white placeholder-gray-400 focus:outline-none focus:border-palacio-gold"
  placeholder="Your name"
/>
            </div>
          )}

          <div>
            <label className="block text-sm font-cinzel text-palacio-gold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white/10 border border-palacio-gold/30 rounded text-white placeholder-gray-500 focus:border-palacio-gold focus:outline-none"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-cinzel text-palacio-gold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-white/10 border border-palacio-gold/30 rounded text-white placeholder-gray-500 focus:border-palacio-gold focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-palacio-gold text-palacio-black font-cinzel font-semibold rounded hover:bg-palacio-gold/80 disabled:opacity-50 smooth-transition"
          >
            {loading
              ? 'Processing...'
              : isSignUp
                ? 'Create Account'
                : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-palacio-gold hover:underline ml-1 font-cinzel"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 bg-gray-700/40 text-gray-300 rounded hover:bg-gray-700 smooth-transition"
        >
          Close
        </button>
      </GlassCard>
    </div>
  );
}
