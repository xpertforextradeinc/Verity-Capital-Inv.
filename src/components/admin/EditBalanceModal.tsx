import React, { useState } from 'react';
import { X } from 'lucide-react';

export const ADMIN_CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'BTC', 'ETH'] as const;
export type AdminCurrency = typeof ADMIN_CURRENCIES[number];

interface EditBalanceModalProps {
  email: string;
  onClose: () => void;
  onSubmit: (currency: AdminCurrency, delta: number) => Promise<void>;
}

export const EditBalanceModal: React.FC<EditBalanceModalProps> = ({ email, onClose, onSubmit }) => {
  const [currency, setCurrency] = useState<AdminCurrency>('USD');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value === 0) { setError('Enter a non-zero adjustment amount.'); return; }
    setSaving(true); setError(null);
    try { await onSubmit(currency, value); onClose(); } catch (err: any) { setError(err.message || 'Balance update failed.'); } finally { setSaving(false); }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"><form onSubmit={submit} className="w-full max-w-md border border-cyan-300/25 bg-[#071021] p-6 shadow-[0_25px_100px_rgba(0,0,0,.5)]"><div className="mb-6 flex items-center justify-between"><div><p className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">Balance control</p><h2 className="mt-1 text-lg font-semibold text-white">{email}</h2></div><button type="button" onClick={onClose} className="text-zinc-500 hover:text-white"><X className="h-5 w-5" /></button></div><label className="mb-2 block text-xs text-zinc-400">Currency</label><select value={currency} onChange={(event) => setCurrency(event.target.value as AdminCurrency)} className="mb-4 w-full border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white">{ADMIN_CURRENCIES.map((item) => <option key={item}>{item}</option>)}</select><label className="mb-2 block text-xs text-zinc-400">Adjustment amount</label><input autoFocus required value={amount} onChange={(event) => setAmount(event.target.value)} type="number" step="any" placeholder="Positive to add, negative to subtract" className="mb-4 w-full border border-white/10 bg-slate-950 px-3 py-3 font-mono text-sm text-white outline-none focus:border-cyan-300/60" />{error && <p className="mb-4 border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</p>}<button disabled={saving} className="w-full bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200 disabled:opacity-50">{saving ? 'Applying...' : 'Apply balance adjustment'}</button></form></div>;
};
