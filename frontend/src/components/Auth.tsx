import React, { useState } from 'react';
import { Hotel, Mail, Lock, User, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { UserRole } from '../types';

interface AuthProps {
  onAuthSuccess: (token: string, user: { id: string; name: string; email: string; role: UserRole }) => void;
  showToast: (type: 'success' | 'error', message: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess, showToast }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Validations & Loading
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const tempErrors: typeof errors = {};
    let isValid = true;

    if (!isLoginMode && !name.trim()) {
      tempErrors.name = 'Full name is required';
      isValid = false;
    }

    if (!email.trim()) {
      tempErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = 'Invalid email address';
      isValid = false;
    }

    if (!password) {
      tempErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters long';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    const endpoint = isLoginMode ? 'login' : 'signup';
    const payload = isLoginMode
      ? { email: email.trim(), password }
      : { name: name.trim(), email: email.trim(), password, role: 'guest' };

    try {
      const response = await fetch('http://localhost:5000/api/auth/' + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors({ general: result.error || 'Authentication failed' });
        showToast('error', result.error || 'Authentication failed');
        return;
      }

      showToast('success', `${isLoginMode ? 'Signed in' : 'Registered'} successfully! Welcome, ${result.user.name}`);
      onAuthSuccess(result.token, result.user);
    } catch (error) {
      console.error(error);
      setErrors({ general: 'Network connection failed' });
      showToast('error', 'Network error. Please make sure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06080e] relative overflow-hidden px-4">
      {/* Decorative background blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-luxury-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0d121f] border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 space-y-6">
        {/* Branding header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-gold-950/40 rounded-xl border border-gold-500/20 text-gold-400">
            <Hotel className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-[#f4ebd5] tracking-wide uppercase">
              Grand Palace
            </h1>
            <p className="text-3xs tracking-widest uppercase text-gold-400 font-semibold mt-0.5">
              Luxury Hotel Portal
            </p>
          </div>
        </div>

        {/* Form Title & Subtitle */}
        <div className="space-y-1">
          <h2 className="text-xl font-serif text-[#f4ebd5]">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-400">
            {isLoginMode
              ? 'Enter your credentials to access the portal'
              : 'Register your details to establish a portal account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error alert */}
          {errors.general && (
            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Full Name (Only on Signup mode) */}
          {!isLoginMode && (
            <div>
              <label className="block text-3xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-[#1b2230] border rounded-lg pl-10 pr-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold-500 transition-colors ${
                    errors.name ? 'border-rose-500/50' : 'border-slate-800'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {errors.name}
                </p>
              )}
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-3xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="e.g. guest@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-[#1b2230] border rounded-lg pl-10 pr-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold-500 transition-colors ${
                  errors.email ? 'border-rose-500/50' : 'border-slate-800'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-3xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-[#1b2230] border rounded-lg pl-10 pr-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold-500 transition-colors ${
                  errors.password ? 'border-rose-500/50' : 'border-slate-800'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gold-600 hover:bg-gold-500 disabled:bg-gold-800 disabled:text-slate-500 active:bg-gold-700 text-slate-900 font-semibold rounded-lg shadow-md transition-all text-sm mt-6 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            ) : isLoginMode ? (
              'Sign In'
            ) : (
              'Register Account'
            )}
          </button>
        </form>

        {/* Footer switcher Mode */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setErrors({});
            }}
            className="text-xs text-gold-400 hover:text-gold-300 font-medium transition-colors cursor-pointer"
          >
            {isLoginMode ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>

        {/* Secure Note */}
        <div className="border-t border-[#171e2e] pt-4 flex items-center justify-center gap-1.5 text-3xs text-slate-500 uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-500/30" />
          <span>Secure JWT Verification Active</span>
        </div>
      </div>
    </div>
  );
};
