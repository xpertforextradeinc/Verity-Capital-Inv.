import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, ShieldCheck, CheckCircle2, AlertCircle, Building2, Wallet, RefreshCw, Copy, ExternalLink } from 'lucide-react';
import { TransferRecord, Portfolio } from '../../types.ts';
import { api } from '../../services/api.ts';

interface CustodyTransfersModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio | null;
  onTransferCompleted: () => void;
}

export const CustodyTransfersModal: React.FC<CustodyTransfersModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  onTransferCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<'DEPOSIT_USD' | 'WITHDRAW_USD' | 'DEPOSIT_CRYPTO' | 'WITHDRAW_CRYPTO'>('DEPOSIT_USD');
  const [selectedAsset, setSelectedAsset] = useState<'USD' | 'BTC' | 'ETH' | 'SOL' | 'XRP' | 'ADA'>('USD');
  const [amount, setAmount] = useState<string>('50000');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [method, setMethod] = useState<string>('Fedwire Institutional Gross Settlement');
  const [notes, setNotes] = useState<string>('');
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchTransfers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTransfers();
      setTransfers(data);
    } catch (err: any) {
      console.error('Failed to fetch transfers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTransfers();
      setMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid positive transfer amount.' });
      return;
    }

    if ((activeTab === 'WITHDRAW_USD' || activeTab === 'WITHDRAW_CRYPTO') && !destinationAddress.trim()) {
      setMessage({ type: 'error', text: 'Please enter the whitelisted destination account or wallet address.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const record = await api.createTransfer({
        type: activeTab,
        asset: activeTab.includes('USD') ? 'USD' : selectedAsset,
        amount: numAmount,
        destinationAddress: destinationAddress.trim() || undefined,
        method,
        notes: notes.trim() || undefined,
      });

      setMessage({
        type: 'success',
        text: `Institutional transfer submitted successfully. Reference: ${record.referenceId}`,
      });
      fetchTransfers();
      onTransferCompleted();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Transfer failed to process.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="custody-transfers-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div id="custody-transfers-modal" className="bg-[#0B0F19] border border-amber-500/30 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Institutional Custody & Transfers</h2>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Segregated Vaults
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                US Fedwire cash clearing & air-gapped cryptographic wallet infrastructure
              </p>
            </div>
          </div>
          <button
            id="close-custody-transfers-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-900/40 p-1 gap-1 text-xs">
          <button
            id="tab-deposit-usd"
            onClick={() => { setActiveTab('DEPOSIT_USD'); setSelectedAsset('USD'); }}
            className={`flex-1 py-2.5 px-3 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'DEPOSIT_USD'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deposit USD (Wire/ACH)</span>
          </button>
          <button
            id="tab-withdraw-usd"
            onClick={() => { setActiveTab('WITHDRAW_USD'); setSelectedAsset('USD'); }}
            className={`flex-1 py-2.5 px-3 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'WITHDRAW_USD'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            <span>Withdraw USD</span>
          </button>
          <button
            id="tab-deposit-crypto"
            onClick={() => { setActiveTab('DEPOSIT_CRYPTO'); setSelectedAsset('BTC'); }}
            className={`flex-1 py-2.5 px-3 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'DEPOSIT_CRYPTO'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-amber-400" />
            <span>Deposit Crypto</span>
          </button>
          <button
            id="tab-withdraw-crypto"
            onClick={() => { setActiveTab('WITHDRAW_CRYPTO'); setSelectedAsset('BTC'); }}
            className={`flex-1 py-2.5 px-3 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'WITHDRAW_CRYPTO'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Transfer to Cold Wallet</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {message && (
            <div className={`p-4 rounded-xl flex items-start space-x-2.5 ${
              message.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Asset Selection (if Crypto) */}
            {activeTab.includes('CRYPTO') && (
              <div>
                <label className="block text-zinc-400 font-semibold mb-1.5">Select Supported Digital Asset</label>
                <div className="grid grid-cols-5 gap-2">
                  {(['BTC', 'ETH', 'SOL', 'XRP', 'ADA'] as const).map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setSelectedAsset(sym)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedAsset === sym
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-mono font-bold text-sm">{sym}</div>
                      <div className="text-[10px] text-zinc-400">{sym === 'BTC' ? 'Bitcoin' : sym === 'ETH' ? 'Ethereum' : sym === 'SOL' ? 'Solana' : sym === 'XRP' ? 'Ripple' : 'Cardano'}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* If Deposit Crypto: Show Dedicated Whitelisted Segregated Address */}
            {activeTab === 'DEPOSIT_CRYPTO' && (
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-semibold">Your Segregated Institutional {selectedAsset} Deposit Address:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedAsset === 'BTC' ? 'bc1q9u4z4m6d2q3k7a2yv90w5q8x1m9j0z7' : '0x71C...institutional')}
                    className="flex items-center space-x-1 text-amber-400 hover:underline cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-black/60 font-mono text-amber-300 break-all text-[11px] border border-zinc-800">
                  {selectedAsset === 'BTC' && 'bc1q9u4z4m6d2q3k7a2yv90w5q8x1m9j0z789institutional'}
                  {selectedAsset === 'ETH' && '0x71C40274290b79A0BeB0C681A2042398379c0B9e'}
                  {selectedAsset === 'SOL' && 'QuantixSOLVault928374829104829472910293847291'}
                  {selectedAsset === 'XRP' && 'rQuantixUSDSettlementVault9284729104 (Tag: 104829)'}
                  {selectedAsset === 'ADA' && 'addr1q9quantixinstitutionalcoldvault92837492019482'}
                </div>
                <p className="text-[11px] text-zinc-400">
                  Deposits are credited after 3 network confirmations. Client funds are immediately moved into air-gapped cold storage.
                </p>
              </div>
            )}

            {/* Amount input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-zinc-400 font-semibold">
                  Transfer Amount ({activeTab.includes('USD') ? 'USD' : selectedAsset})
                </label>
                {activeTab === 'WITHDRAW_USD' && portfolio && (
                  <span className="text-zinc-400">
                    Available Cash:{' '}
                    <strong className="text-white font-mono">
                      ${portfolio.simulatedCashBalance.toLocaleString()}
                    </strong>
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="transfer-amount-input"
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  required
                />
                <div className="absolute right-3 top-3 font-mono font-bold text-amber-500 text-xs">
                  {activeTab.includes('USD') ? 'USD' : selectedAsset}
                </div>
              </div>
            </div>

            {/* Destination Address / Account if withdrawal */}
            {(activeTab === 'WITHDRAW_USD' || activeTab === 'WITHDRAW_CRYPTO') && (
              <div>
                <label className="block text-zinc-400 font-semibold mb-1.5">
                  {activeTab === 'WITHDRAW_USD'
                    ? 'Whitelisted Bank Account (Routing / Account # or Fedwire)'
                    : `Whitelisted Destination ${selectedAsset} Address`}
                </label>
                <input
                  id="transfer-destination-input"
                  type="text"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  placeholder={
                    activeTab === 'WITHDRAW_USD'
                      ? 'JPMorgan Chase NY - Acct # 948271048'
                      : `e.g. ${selectedAsset === 'BTC' ? 'bc1q...' : '0x...'}`
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            )}

            {/* Method / Clearing Route */}
            <div>
              <label className="block text-zinc-400 font-semibold mb-1.5">Settlement Channel</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
              >
                {activeTab.includes('USD') ? (
                  <>
                    <option value="Fedwire Real-Time Gross Settlement">Fedwire Real-Time Gross Settlement (Same-Day)</option>
                    <option value="ACH Institutional Direct Credit">ACH Institutional Direct Credit (1 Business Day)</option>
                    <option value="Signet / Silvergate SEN (24/7 API Network)">Signet / Real-Time Bank Rails (24/7)</option>
                  </>
                ) : (
                  <>
                    <option value="Air-Gapped Multi-Sig Cold Vault">Air-Gapped Multi-Sig Cold Vault (Fidelity/BitGo)</option>
                    <option value="Direct L1 On-Chain Custody Transfer">Direct L1 On-Chain Custody Transfer</option>
                  </>
                )}
              </select>
            </div>

            <button
              id="submit-transfer-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 fill-current" />
              )}
              <span>
                {isSubmitting
                  ? 'Authorizing Transfer...'
                  : `Submit ${activeTab.replace('_', ' ')} Instruction`}
              </span>
            </button>
          </form>

          {/* Audit History */}
          <div className="pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Recent Custody & Clearing Ledger
              </h4>
              <button
                type="button"
                onClick={fetchTransfers}
                className="text-zinc-400 hover:text-amber-400 flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="space-y-2">
              {transfers.length === 0 ? (
                <p className="text-zinc-500 text-center py-4">No recent transfers recorded.</p>
              ) : (
                transfers.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        t.type.startsWith('DEPOSIT')
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {t.type.startsWith('DEPOSIT') ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white flex items-center space-x-2">
                          <span>{t.type.replace('_', ' ')}</span>
                          <span className="font-mono text-zinc-400 font-normal">
                            ({t.amount.toLocaleString()} {t.asset})
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          Ref: {t.referenceId || t.id} • {new Date(t.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {t.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
