import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const ADMIN_CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'BTC', 'ETH'] as const;
export type AdminCurrency = typeof ADMIN_CURRENCIES[number];

interface EditBalanceModalProps {
  email: string;
  onClose: () => void;
  onSubmit: (currency: AdminCurrency, delta: number, reason?: string) => Promise<void>;
}

export const EditBalanceModal: React.FC<EditBalanceModalProps> = ({ email, onClose, onSubmit }) => {
  const [operation, setOperation] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [currency, setCurrency] = useState<AdminCurrency>('USD');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('Administrative ledger adjustment');
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePreSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const rawVal = Math.abs(Number(amount));
    if (!Number.isFinite(rawVal) || rawVal === 0) {
      setError('Enter a valid positive number for adjustment.');
      return;
    }
    setError(null);
    setShowConfirm(true);
  };

  const handleFinalConfirm = async () => {
    const rawVal = Math.abs(Number(amount));
    const finalDelta = operation === 'ADD' ? rawVal : -rawVal;
    setSaving(true);
    setError(null);
    try {
      await onSubmit(currency, finalDelta, reason);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Balance update failed.');
      setShowConfirm(false);
    } finally {
      setSaving(false);
    }
  };

  const rawAmount = Math.abs(Number(amount) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md border border-cyan-300/25 bg-[#071021] p-6 shadow-[0_25px_100px_rgba(0,0,0,.5)] rounded-lg">
        {!showConfirm ? (
          <form onSubmit={handlePreSubmit}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">Admin Balance Control</p>
                <h2 className="mt-1 text-lg font-semibold text-white">{email}</h2>
              </div>
              <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Action Toggle: Add vs Deduct */}
            <div className="mb-4 grid grid-cols-2 gap-2 border border-white/10 bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setOperation('ADD')}
                className={`py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  operation === 'ADD'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                + Add Balance
              </button>
              <button
                type="button"
                onClick={() => setOperation('DEDUCT')}
                className={`py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  operation === 'DEDUCT'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                - Deduct Balance
              </button>
            </div>

            <label className="mb-2 block text-xs text-zinc-400">Currency</label>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value as AdminCurrency)}
              className="mb-4 w-full border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white"
            >
              {ADMIN_CURRENCIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <label className="mb-2 block text-xs text-zinc-400">
              Amount to {operation === 'ADD' ? 'add' : 'deduct'}
            </label>
            <div className="relative mb-4">
              <span className="absolute left-3.5 top-3.5 font-mono text-sm text-zinc-500">
                {operation === 'ADD' ? '+' : '-'}
              </span>
              <input
                autoFocus
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                type="number"
                min="0.00000001"
                step="any"
                placeholder="0.00"
                className="w-full border border-white/10 bg-slate-950 py-3 pl-8 pr-3 font-mono text-sm text-white outline-none focus:border-cyan-300/60"
              />
            </div>

            <label className="mb-2 block text-xs text-zinc-400">Reason / Reference Note</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for adjustment"
              className="mb-4 w-full border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-300/60"
            />

            {error && <p className="mb-4 border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</p>}

            <button
              type="submit"
              className={`w-full py-3 text-sm font-bold text-slate-950 transition-colors ${
                operation === 'ADD'
                  ? 'bg-emerald-400 hover:bg-emerald-300'
                  : 'bg-rose-400 hover:bg-rose-300'
              }`}
            >
              Review {operation === 'ADD' ? 'Balance Addition' : 'Balance Deduction'}
            </button>
          </form>
        ) : (
          /* Confirmation Dialog Step */
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className={`p-2 rounded-lg ${
                operation === 'ADD' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {operation === 'ADD' ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">
                  Confirmation Dialog
                </p>
                <h3 className="text-base font-semibold text-white">
                  Confirm {operation === 'ADD' ? 'Adding Balance' : 'Deducting Balance'}
                </h3>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Are you sure you want to {operation === 'ADD' ? 'add' : 'deduct'} funds for this account? This action will generate a permanent balance transaction record and audit log.
            </p>

            <div className="rounded border border-white/10 bg-slate-950 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Account:</span>
                <span className="font-mono text-white">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Action:</span>
                <span className={`font-mono font-bold ${operation === 'ADD' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {operation === 'ADD' ? '+ ADD FUNDS' : '- DEDUCT FUNDS'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Amount & Currency:</span>
                <span className="font-mono font-bold text-white">
                  {rawAmount.toLocaleString()} {currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Reason:</span>
                <span className="text-zinc-300 italic">{reason || 'Administrative adjustment'}</span>
              </div>
            </div>

            {error && <p className="border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</p>}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white border border-white/10 bg-white/5 rounded"
              >
                Back / Edit
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleFinalConfirm}
                className={`px-5 py-2.5 text-xs font-bold rounded transition-colors disabled:opacity-50 ${
                  operation === 'ADD'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {saving 
                  ? 'Processing...' 
                  : operation === 'ADD' 
                    ? 'Confirm Add Balance' 
                    : 'Confirm Deduct Balance'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

