import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, X, Sparkles, LogOut, AlertTriangle } from 'lucide-react';

interface AuthProps {
  onClose: () => void;
  isLogout?: boolean;
  onConfirmLogout?: () => void;
}

export default function Auth({ onClose, isLogout, onConfirmLogout }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Password strength
  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

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

  const handleLogout = () => {
    if (onConfirmLogout) {
      onConfirmLogout();
    }
    onClose();
  };

  // LOGOUT CONFIRMATION MODAL
  if (isLogout) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden animate-fade-in">
        {/* Background */}
        <div className="absolute inset-0 z-0 bg-black/80 backdrop-blur-md" />
        
        {/* Modal */}
        <div className="relative z-10 w-full max-w-md animate-scale-in">
          <div className="relative bg-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-[0_0_60px_rgba(212,175,55,0.15)]">
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/60 hover:text-palacio-gold transition-colors rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border-2 border-red-500/50 animate-pulse-slow">
                <AlertTriangle size={36} className="text-red-400" />
              </div>
            </div>

            {/* Text */}
            <h2 className="font-playfair text-3xl text-palacio-gold mb-3 text-center">
              Leave Paradise?
            </h2>
            <p className="text-white/70 text-center mb-8 font-poppins">
              Are you sure you want to sign out? Your session will end and you'll need to sign in again.
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLogout}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-cinzel font-bold text-lg rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2"
              >
                <LogOut size={20} />
                Yes, Sign Out
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-4 bg-white/5 border border-white/20 text-white/80 font-cinzel font-bold text-lg rounded-xl hover:bg-white/10 hover:border-white/40 transition-all duration-300"
              >
                Stay Signed In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN/SIGNUP FORM
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden">
      {/* Animated Ocean Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-ocean-sway"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80")',
            filter: 'brightness(0.25) saturate(1.2)' 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/60" />
        
        {/* Floating gold particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-palacio-gold/60 rounded-full animate-float-auth"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="relative bg-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-[0_0_60px_rgba(212,175,55,0.15)] hover:shadow-[0_0_80px_rgba(212,175,55,0.25)] transition-shadow duration-500">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-palacio-gold transition-colors rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-palacio-gold/30 to-orange-400/20 mb-4 animate-glow-pulse">
              <Sparkles size={28} className="text-palacio-gold" />
            </div>
            <h1 className="font-playfair text-4xl md:text-5xl text-palacio-gold mb-2 drop-shadow-lg">
              Palacio de Oro
            </h1>
            <p className="text-white/80 text-center italic text-lg font-poppins">
              {isSignUp ? 'Begin Your Luxury Journey' : 'Welcome back to Paradise'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex mb-8 bg-black/30 rounded-full p-1 border border-white/10">
            <button
              onClick={() => { setIsSignUp(false); setError(''); }}
              className={`flex-1 py-3 rounded-full text-sm font-cinzel font-bold transition-all duration-300 ${
                !isSignUp 
                  ? 'bg-palacio-gold text-palacio-black shadow-lg' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(''); }}
              className={`flex-1 py-3 rounded-full text-sm font-cinzel font-bold transition-all duration-300 ${
                isSignUp 
                  ? 'bg-palacio-gold text-palacio-black shadow-lg' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-xl text-red-200 text-sm animate-shake">
                {error}
              </div>
            )}

            {/* Name Field (Sign Up only) */}
            {isSignUp && (
              <div className="relative">
                <label className={`absolute left-4 transition-all duration-300 font-cinzel text-sm ${
                  focusedField === 'name' || name 
                    ? '-top-2 text-palacio-gold text-xs bg-palacio-black px-2' 
                    : 'top-4 text-gray-400'
                }`}>
                  Full Name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-palacio-gold/60" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    required={isSignUp}
                    minLength={5}
                    maxLength={18}
                    pattern="^[A-Z][a-zA-Z0-9_ ]*$"
                    title="Name must start with uppercase letter"
                    className="w-full pl-12 pr-4 py-4 bg-black/40 border-2 border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-palacio-gold focus:bg-black/60 transition-all duration-300"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="relative">
              <label className={`absolute left-4 transition-all duration-300 font-cinzel text-sm ${
                focusedField === 'email' || email 
                  ? '-top-2 text-palacio-gold text-xs bg-palacio-black px-2' 
                  : 'top-4 text-gray-400'
              }`}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-palacio-gold/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-black/40 border-2 border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-palacio-gold focus:bg-black/60 transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <label className={`absolute left-4 transition-all duration-300 font-cinzel text-sm ${
                focusedField === 'password' || password 
                  ? '-top-2 text-palacio-gold text-xs bg-palacio-black px-2' 
                  : 'top-4 text-gray-400'
              }`}>
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-palacio-gold/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-black/40 border-2 border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-palacio-gold focus:bg-black/60 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-palacio-gold transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password Strength (Sign Up only) */}
              {isSignUp && password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-cinzel ${
                    passwordStrength > 0 ? 'text-' + strengthColors[passwordStrength - 1].replace('bg-', '') : 'text-gray-500'
                  }`}>
                    {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Enter password'}
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-palacio-gold via-yellow-500 to-palacio-gold text-palacio-black font-cinzel font-bold text-lg rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] shine-sweep relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-palacio-black/30 border-t-palacio-black rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative bg-white/10 backdrop-blur-2xl border-2 border-palacio-gold/50 rounded-3xl p-12 flex flex-col items-center text-center shadow-[0_0_80px_rgba(212,175,55,0.4)] animate-scale-in max-w-md mx-4">
            {/* Confetti effect */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-10%',
                    backgroundColor: ['#D4AF37', '#FFD700', '#FFA500', '#FF6B6B'][Math.floor(Math.random() * 4)],
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            <div className="w-24 h-24 bg-gradient-to-br from-palacio-gold/30 to-orange-400/20 rounded-full flex items-center justify-center mb-6 border-2 border-palacio-gold animate-bounce-slow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-palacio-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-playfair text-4xl text-palacio-gold mb-3">Welcome to Paradise</h2>
            <p className="text-white/90 font-cinzel text-base tracking-widest uppercase">
              {name || 'Guest'}, your luxury journey begins.
            </p>
            <div className="mt-8 w-32 h-1 bg-gradient-to-r from-transparent via-palacio-gold to-transparent animate-pulse" />
            <p className="mt-4 text-white/50 text-sm font-cinzel">Redirecting...</p>
          </div>
        </div>
      )}
    </div>
  );
}
