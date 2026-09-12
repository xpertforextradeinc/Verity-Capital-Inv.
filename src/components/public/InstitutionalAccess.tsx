import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, LockKeyhole, Mail, UserRound } from 'lucide-react';

interface InstitutionalAccessProps {
  mode: 'login' | 'onboarding';
  onBack: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
}

export const InstitutionalAccess: React.FC<InstitutionalAccessProps> = ({ mode, onBack, onLogin, onRegister, onGoogleSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLogin = mode === 'login';

  const [googleBusy, setGoogleBusy] = useState(false);

  const handleGoogle = async () => {
    setError(null);
    setGoogleBusy(true);
    try {
      await onGoogleSignIn();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please check your configuration.');
      setGoogleBusy(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        if (!firstName || !lastName) throw new Error('Please provide your full name.');
        await onRegister(firstName, lastName, email, password);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('405')) {
        setError('Server unavailable (405). If deployed on Vercel, please ensure Supabase environment variables are configured.');
      } else {
        setError(err.message || 'Unable to complete this request.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 py-10 lg:grid-cols-[.8fr_1.2fr] lg:py-20">
      <div className="flex flex-col justify-center"><button onClick={onBack} className="mb-10 flex items-center gap-2 self-start text-xs text-zinc-500 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Verity-Capital</button><p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">{isLogin ? 'Secure client access' : 'Client onboarding'}</p><h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">{isLogin ? 'Client Login' : 'Create an Account'}</h1><p className="mt-5 max-w-md text-sm leading-7 text-zinc-400">{isLogin ? 'Access your dashboard, market intelligence, custody workflows, and reporting tools.' : 'Register to access premium digital asset execution, custody, and analytics.'}</p><div className="mt-10 space-y-4 text-xs text-zinc-400"><div className="flex gap-3"><LockKeyhole className="h-4 w-4 text-cyan-300" />Secure identity and access controls</div><div className="flex gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-300" />KYC, AML, and jurisdictional review</div><div className="flex gap-3"><Building2 className="h-4 w-4 text-indigo-300" />Coverage across global markets</div></div></div>
      <form onSubmit={submit} className="border border-white/10 bg-white/[0.035] p-6 shadow-[0_30px_90px_rgba(0,0,0,.28)] sm:p-8">
        {isLogin ? <><label className="mb-2 block text-xs text-zinc-400">Email address</label><div className="relative mb-4"><Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-white/10 bg-slate-950/70 px-10 py-3 text-sm text-white outline-none focus:border-cyan-300/60" placeholder="name@example.com" /></div><label className="mb-2 block text-xs text-zinc-400">Password</label><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-5 w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60" placeholder="Enter your password" /></> : <><div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-2 block text-xs text-zinc-400">First name</label><div className="relative mb-4"><UserRound className="absolute left-3 top-3 h-4 w-4 text-zinc-500" /><input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-white/10 bg-slate-950/70 px-10 py-3 text-sm text-white outline-none focus:border-cyan-300/60" placeholder="First name" /></div></div><div><label className="mb-2 block text-xs text-zinc-400">Last name</label><input required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60" placeholder="Last name" /></div></div><label className="mb-2 block text-xs text-zinc-400">Email address</label><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-4 w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60" placeholder="name@example.com" /><label className="mb-2 block text-xs text-zinc-400">Create password</label><input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-5 w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60" /></>}
        {error && <p className="mb-4 border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</p>}
        <button disabled={submitting || googleBusy} className="flex w-full items-center justify-center gap-2 bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200 disabled:opacity-50">{submitting ? 'Processing...' : isLogin ? 'Sign in securely' : 'Sign up'} <ArrowRight className="h-4 w-4" /></button>
        <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-600"><span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" /></div>
        <button type="button" disabled={submitting || googleBusy} onClick={handleGoogle} className="w-full flex items-center justify-center gap-2 border border-white/15 px-4 py-3 text-sm font-semibold text-white hover:border-cyan-300/50 hover:bg-white/[0.03] transition-colors disabled:opacity-50">
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          {googleBusy ? 'Connecting to Google...' : 'Continue with Google'}
        </button>
        {!isLogin && <p className="mt-5 text-[11px] leading-5 text-zinc-500">Verity-Capital Inv provides services to qualified clients. Onboarding is subject to KYC and regulatory review.</p>}
      </form>
    </div>
  );
};