import React, { useState } from 'react';
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';
import { supabase } from '../../services/supabase.ts';

interface AdminLoginProps {
  onBack: () => void;
  onEmailLogin?: (email: string, password: string) => Promise<void>;
}

const ADMIN_REDIRECT = 'https://veritycapitalinv.vercel.app/admin';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBack, onEmailLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    if (!supabase) throw new Error('Supabase authentication is not configured.');
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: ADMIN_REDIRECT },
    });
    if (authError) throw authError;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (onEmailLogin) await onEmailLogin(email, password);
    } catch (authError: any) {
      setError(authError.message || 'Administrator authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    setError(null);
    try { await signInWithGoogle(); } catch (authError: any) { setError(authError.message || 'Administrator authentication failed.'); setBusy(false); }
  };

  return <main className="flex min-h-[calc(100vh-72px)] items-center justify-center py-12"><div className="grid w-full max-w-4xl gap-10 border border-rose-300/15 bg-[#070d1c] p-6 shadow-[0_30px_120px_rgba(0,0,0,.45)] sm:p-10 lg:grid-cols-[.8fr_1fr]"><div className="flex flex-col justify-center"><button onClick={onBack} className="mb-12 flex items-center gap-2 self-start text-xs text-zinc-500 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to client access</button><div className="flex h-11 w-11 items-center justify-center border border-rose-300/30 bg-rose-300/10 text-rose-200"><ShieldCheck className="h-5 w-5" /></div><p className="mt-7 text-[10px] font-mono uppercase tracking-[0.22em] text-rose-300">Restricted administrator access</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Supervisor sign in</h1><p className="mt-5 text-sm leading-7 text-zinc-400">This gateway is reserved for authorized Verity-Capital Inv administrators. Client accounts must use the standard login.</p></div><form onSubmit={submit} className="border border-white/10 bg-black/20 p-6"><label className="mb-2 block text-xs text-zinc-400">Administrator email</label><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mb-4 w-full border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-rose-300/60" placeholder="admin@institution.com" /><label className="mb-2 block text-xs text-zinc-400">Password</label><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mb-5 w-full border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-rose-300/60" />{error && <p className="mb-4 border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</p>}<button disabled={busy} className="mb-4 flex w-full items-center justify-center gap-2 bg-rose-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-rose-200 disabled:opacity-50"><LockKeyhole className="h-4 w-4" /> Sign in as administrator</button><div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-600"><span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" /></div><button type="button" disabled={busy} onClick={handleGoogle} className="w-full border border-white/15 px-4 py-3 text-sm font-semibold text-white hover:border-rose-300/50 disabled:opacity-50">Continue with Google</button><p className="mt-5 text-center text-[10px] leading-5 text-zinc-600">Access is granted only when the authenticated Supabase user has `user_metadata.role = admin`.</p></form></div></main>;
};
