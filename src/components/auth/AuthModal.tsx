import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  AlertCircle
} from 'lucide-react';
import { User } from '../../types.ts';
import { googleSignIn } from '../../services/firebase.ts';
import { GoogleSignInButton } from '../common/GoogleSignInButton.tsx';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  onSwitchDemo: (role: 'CUSTOMER' | 'ADMIN') => Promise<void>;
  onGoogleSignIn?: (email: string, displayName?: string) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onLogin,
  onRegister,
  onSwitchDemo,
  onGoogleSignIn,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await onLogin(email, password);
        onClose();
      } else if (mode === 'register') {
        if (!firstName.trim() || !lastName.trim()) {
          throw new Error('Please provide your name');
        }
        await onRegister(firstName, lastName, email, password);
        onClose();
      } else {
        // Forgot password
        setInfoMsg('In this paper trading demo, you can log in directly using the 1-click demo buttons below.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: 'CUSTOMER' | 'ADMIN') => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onSwitchDemo(role);
      onClose();
    } catch (err: any) {
      setErrorMsg('Failed to switch demo account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await googleSignIn();
      if (res && res.user) {
        if (onGoogleSignIn) {
          await onGoogleSignIn(res.user.email || '', res.user.displayName || undefined);
        }
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-50">
      <div className="bg-[#0D121F] border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {mode === 'login' ? 'Sign In to Quantix' : mode === 'register' ? 'Open Simulated Account' : 'Reset Demo Credentials'}
              </h3>
              <p className="text-[11px] text-zinc-400">Virtual Paper Trading Sandbox</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Fast Demo Launcher */}
        <div className="p-4 bg-zinc-900/80 border-b border-zinc-800 space-y-2">
          <div className="text-[11px] font-semibold text-zinc-400 flex items-center justify-between">
            <span>Fast Instant Demo Access</span>
            <span className="text-emerald-400 font-mono text-[10px]">No signup needed</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('CUSTOMER')}
              className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Alex M. ($100k)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Admin Supervisor</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Jordan"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Lee"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-zinc-400">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-emerald-300 text-[11px] flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Includes automatic $100,000 USD simulated starting balance.</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-xs">
              {infoMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>
              {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Demo Account' : 'Reset Password'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Google Sign-in Alternative */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-2 text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
              or connect with
            </span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <div className="flex justify-center">
            <GoogleSignInButton
              onClick={handleGoogleAuth}
              isLoading={isSubmitting}
              text="Continue with Google"
              className="w-full !max-w-none"
            />
          </div>

          {/* Switch mode links */}
          <div className="pt-2 text-center text-[11px] text-zinc-400">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-emerald-400 font-semibold hover:underline cursor-pointer"
                >
                  Register Demo
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-emerald-400 font-semibold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
