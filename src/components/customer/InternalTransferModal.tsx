import React, { useState } from 'react';
import { X, ArrowRightLeft, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Portfolio } from '../../types.ts';
import { api } from '../../services/api.ts';

interface InternalTransferModalProps {
  portfolio: Portfolio;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedPortfolio: Portfolio) => void;
}

export const InternalTransferModal: React.FC<InternalTransferModalProps> = ({ portfolio, isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const wallets = portfolio.wallets || [
    { id: 'spot', name: 'Institutional Spot Wallet', balance: portfolio.simulatedCashBalance, asset: 'USD' },
    { id: 'savings', name: 'High-Yield Savings Vault', balance: 0.00, asset: 'USD' },
    { id: 'trading', name: 'Active Trading Account', balance: 0.00, asset: 'USD' },
  ];

  const [fromWalletId, setFromWalletId] = useState(wallets[0].id);
  const [toWalletId, setToWalletId] = useState(wallets[1].id);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fromWallet = wallets.find(w => w.id === fromWalletId);
  const toWallet = wallets.find(w => w.id === toWalletId);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (fromWallet && Number(amount) > fromWallet.balance) {
      setError('Insufficient funds in source wallet');
      return;
    }

    if (fromWalletId === toWalletId) {
      setError('Source and destination wallets must be different');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const updated = await api.internalTransfer(fromWalletId, toWalletId, Number(amount));
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0B0F19] border border-zinc-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight uppercase leading-none">Internal Transfer</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Between Institutional Vaults</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleTransfer} className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center space-x-3 text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Source Wallet</label>
              <select 
                value={fromWalletId}
                onChange={(e) => setFromWalletId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-emerald-500/50 outline-none transition-all"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name} (${w.balance.toLocaleString()})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500">
                <RefreshCw className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Destination Vault</label>
              <select 
                value={toWalletId}
                onChange={(e) => setToWalletId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-emerald-500/50 outline-none transition-all"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name} (${w.balance.toLocaleString()})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Transfer Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-zinc-500 font-bold">$</span>
                <input 
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-4 py-3.5 text-xl font-mono font-black text-white focus:border-emerald-500/50 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Execute Internal Transfer</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-zinc-500 text-center mt-4 uppercase tracking-[0.2em] font-bold">
              Instant Settlement • Zero Fee Protocol
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
