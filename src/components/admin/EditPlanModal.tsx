import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { InvestmentPlan } from '../../types.ts';

interface EditPlanModalProps {
  plan: InvestmentPlan;
  onClose: () => void;
  onSave: (updatedPlan: InvestmentPlan) => Promise<void>;
}

export const EditPlanModal: React.FC<EditPlanModalProps> = ({ plan, onClose, onSave }) => {
  const [name, setName] = useState(plan.name);
  const [amount, setAmount] = useState(plan.amount.toString());
  const [recommended, setRecommended] = useState(Boolean(plan.recommended));
  const [featuresText, setFeaturesText] = useState(plan.features.join('\n'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!name.trim()) {
      setError('Plan name is required.');
      return;
    }
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    const features = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    if (features.length === 0) {
      setError('At least one feature is required.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        ...plan,
        name: name.trim(),
        amount: numAmount,
        recommended,
        features,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save plan changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg border border-cyan-300/25 bg-[#071021] p-6 shadow-[0_25px_100px_rgba(0,0,0,.5)]"
      >
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">Investment Tier Configuration</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Edit {plan.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="mb-1.5 block font-mono text-zinc-400">PLAN NAME</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-300/60"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-zinc-400">INVESTMENT AMOUNT (USD)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-mono text-sm text-zinc-500">$</span>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-white/10 bg-slate-950 py-2.5 pl-8 pr-3 font-mono text-sm text-white outline-none focus:border-cyan-300/60"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-zinc-400">FEATURES (ONE PER LINE)</label>
            <textarea
              rows={4}
              required
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              className="w-full border border-white/10 bg-slate-950 p-3 font-mono text-xs text-white outline-none focus:border-cyan-300/60"
              placeholder="Enter tier features, one line each..."
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="recommendedPlan"
              checked={recommended}
              onChange={(e) => setRecommended(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-slate-950 text-cyan-400 focus:ring-0"
            />
            <label htmlFor="recommendedPlan" className="cursor-pointer text-xs text-zinc-300">
              Highlight as <span className="font-semibold text-cyan-300">"Recommended"</span> tier on public pricing
            </label>
          </div>
        </div>

        {error && <p className="mt-4 border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</p>}

        <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-cyan-300 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-200 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            {saving ? 'Saving...' : 'Save Plan Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
