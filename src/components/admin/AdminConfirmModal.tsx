import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, X } from 'lucide-react';

export interface AdminConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  clientEmail?: string;
  details?: { label: string; value: string | number }[];
  actionType: 'approve' | 'suspend' | 'add_balance' | 'deduct_balance' | 'reject' | 'hold' | 'generic';
  confirmText?: string;
  isProcessing?: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export const AdminConfirmModal: React.FC<AdminConfirmModalProps> = ({
  isOpen,
  title,
  description,
  clientEmail,
  details,
  actionType,
  confirmText,
  isProcessing = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const isDestructive = actionType === 'suspend' || actionType === 'deduct_balance' || actionType === 'reject';
  const isPositive = actionType === 'approve' || actionType === 'add_balance';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md border border-cyan-300/25 bg-[#071021] p-6 shadow-[0_25px_100px_rgba(0,0,0,.6)] rounded-lg text-left"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isDestructive 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                : isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {isDestructive ? (
                <AlertTriangle className="h-5 w-5" />
              ) : isPositive ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <ShieldAlert className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">
                Security Confirmation Required
              </p>
              <h2 className="text-base font-semibold text-white mt-0.5">{title}</h2>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isProcessing}
            className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-xs text-zinc-300 leading-relaxed">{description}</p>

          {clientEmail && (
            <div className="rounded border border-white/10 bg-[#050816] p-3 text-xs">
              <span className="text-zinc-500 block text-[10px] uppercase font-mono">Target Client Account</span>
              <span className="font-mono font-medium text-white">{clientEmail}</span>
            </div>
          )}

          {details && details.length > 0 && (
            <div className="rounded border border-white/10 bg-[#050816] divide-y divide-white/5 text-xs">
              {details.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5">
                  <span className="text-zinc-400 text-[11px]">{item.label}</span>
                  <span className="font-mono font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {isDestructive && (
            <div className="rounded border border-rose-500/30 bg-rose-950/20 p-2.5 text-[11px] text-rose-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>High-risk administrative operation: This action will be immutably recorded in the Supabase audit logs.</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors border border-white/10 bg-white/5 rounded disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold rounded transition-colors disabled:opacity-50 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : isPositive
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
            }`}
          >
            {isProcessing ? 'Processing...' : confirmText || 'Confirm Action'}
          </button>
        </div>
      </div>
    </div>
  );
};
