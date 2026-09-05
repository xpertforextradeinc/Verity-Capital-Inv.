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
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [aumRange, setAumRange] = useState('');
  const [volumeRange, setVolumeRange] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLogin = mode === 'login';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        const names = fullName.trim().split(/\s+/);
        if (!company || !jurisdiction || !aumRange || !volumeRange) throw new Error('Please complete all institutional profile fields.');
        await onRegister(names[0] || 'Institutional', names.slice(1).join(' ') || 'Client', email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to complete this request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 py-10 lg:grid-cols-[.8fr_1.2fr] lg:py-20">
      <div className="flex flex-col justify-center"><button onClick={onBack} className="mb-10 flex items-center gap-2 self-start text-xs text-zinc-500 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Verity-Capital</button><p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">{isLogin ? 'Secure client access' : 'Institutional onboarding'}</p><h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">{isLogin ? 'Client Login' : 'Open an Institutional Account'}</h1><p className="mt-5 max-w-md text-sm leading-7 text-zinc-400">{isLogin ? 'Access your institutional dashboard, market intelligence, custody workflows, and reporting tools.' : 'Tell our coverage team about your organization so we can prepare the appropriate onboarding path.'}</p><div className="mt-10 space-y-4 text-xs text-zinc-400"><div className="flex gap-3"><LockKeyhole className="h-4 w-4 text-cyan-300" />Secure identity and access controls</div><div className="flex gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-300" />KYC, AML, and jurisdictional review</div><div className="flex gap-3"><Building2 className="h-4 w-4 text-indigo-300" />Institutional coverage across global markets</div></div></div>
      <form onSubmit={submit} className="border border-white/10 bg-white/[0.035] p-6 shadow-[0_30px_90px_rgba(0,0,0,.28)] sm:p-8">
        {isLogin ? <><label className="mb-2 block text-xs text-zinc-400">Work email</label><div className="relative mb-4"><Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-white/10 bg-slate-950/70 px-10 py-3 text-sm text-white outline-none focus:border-cyan-300/60" placeholder="name@institution.com" /></div><label className="mb-2 block text-xs text-zinc-400">Password</label><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-5 w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60" placeholder="Enter your password" /></> : <><label className="mb-2 block text-xs text-zinc-400">Full name</label><div className="relative mb-4"><UserRound className="absolute left-3 top-3 h-4 w-4 text-zinc-500" /><input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-white/10 bg-slate-950/70 px-10 py-3 text-sm text-white outline-none focus:border-cyan-300/60" placeholder="Full name" /></div><label className="mb-2 block text-xs text-zinc-400">Institution / company</label><input required value={company} onChange={(e) => setCompany(e.target.value)} className="mb-4 w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60" placeholder="Company name" /><div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-2 block text-xs text-zinc-400">Jurisdiction</label><input required value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} className="w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60" placeholder="Country / region" /></div><div><label className="mb-2 block text-xs text-zinc-400">AUM range</label><select required value={aumRange} onChange={(e) => setAumRange(e.target.value)} className="w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"><option value="">Select range</option><option>$1m - $10m</option><option>$10m - $100m</option><option>$100m+</option></select></div></div><label className="mb-2 mt-4 block text-xs text-zinc-400">Expected annual trading volume</label><select required value={volumeRange} onChange={(e) => setVolumeRange(e.target.value)} className="mb-4 w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"><option value="">Select range</option><option>Under $10m</option><option>$10m - $100m</option><option>$100m+</option></select><label className="mb-2 block text-xs text-zinc-400">Primary email</label><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-4 w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60" placeholder="name@institution.com" /><label className="mb-2 block text-xs text-zinc-400">Create password</label><input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-5 w-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60" /></>}
        {error && <p className="mb-4 border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</p>}
        <button disabled={submitting} className="flex w-full items-center justify-center gap-2 bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200 disabled:opacity-50">{submitting ? 'Processing...' : isLogin ? 'Sign in securely' : 'Submit onboarding request'} <ArrowRight className="h-4 w-4" /></button>
        {isLogin && <><div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-600"><span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" /></div><button type="button" onClick={onGoogleSignIn} className="w-full border border-white/15 px-4 py-3 text-sm font-semibold text-white hover:border-cyan-300/50">Continue with Google</button></>}
        {!isLogin && <p className="mt-5 text-[11px] leading-5 text-zinc-500">Verity-Capital Inv provides services to qualified institutional clients only. Onboarding is subject to KYC and regulatory review.</p>}
      </form>
    </div>
  );
};