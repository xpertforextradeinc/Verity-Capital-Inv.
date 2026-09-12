import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Wallet, 
  RefreshCw, 
  Copy, 
  ExternalLink, 
  Lock, 
  QrCode,
  Info,
  Clock,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { TransferRecord, Portfolio } from '../../types.ts';
import { api } from '../../services/api.ts';
import { useWeb3Wallet } from '../../hooks/useWeb3Wallet.ts';

interface CustodyTransfersModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio | null;
  onTransferCompleted?: () => void;
  onTransferSuccess?: () => void;
}

export interface CryptoNetworkDeposit {
  symbol: 'BTC' | 'ETH';
  name: string;
  tagline: string;
  address: string;
  network: string;
  standard: string;
  protocol: string;
  confirmations: string;
  avgTime: string;
  minDeposit: string;
  custodyTier: string;
  explorerUrl: string;
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
  instructions: string[];
}

export const SUPPORTED_CRYPTO_NETWORKS: Record<'BTC' | 'ETH', CryptoNetworkDeposit> = {
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    tagline: 'Native SegWit Layer-1 Blockchain',
    address: 'bc1qcjaexaws4gna2vvglkwg9gq70ylncxqamymk77',
    network: 'Bitcoin Mainnet (Native SegWit - bech32)',
    standard: 'BIP-84',
    protocol: 'Proof of Work (PoW)',
    confirmations: '3 network confirmations',
    avgTime: '~20-30 mins',
    minDeposit: '0.0005 BTC',
    custodyTier: 'Air-Gapped Multi-Sig Cold Vault (Fidelity Digital Assets)',
    explorerUrl: 'https://mempool.space/address/bc1qcjaexaws4gna2vvglkwg9gq70ylncxqamymk77',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-400',
    borderAccent: 'border-amber-500/30',
    instructions: [
      'Send ONLY Bitcoin (BTC) to this address using the Native SegWit (bech32) network.',
      'Sending tokens from other networks (e.g. BSC, Polygon, Arbitrum) will result in permanent loss.',
      'Assets are instantly swept into segregated multi-party computation (MPC) cold storage upon verification.'
    ],
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    tagline: 'EVM Layer-1 Smart Contract Network',
    address: '0x38647cd2c6a818b72453DC6f21F550B1A2e80606',
    network: 'Ethereum Mainnet (ERC-20)',
    standard: 'ERC-20 / EVM',
    protocol: 'Proof of Stake (PoS)',
    confirmations: '12 network confirmations',
    avgTime: '~2-3 mins',
    minDeposit: '0.005 ETH / 25 USDC',
    custodyTier: 'MPC Tier-1 Institutional Custody (BitGo Trust / Fireblocks)',
    explorerUrl: 'https://etherscan.io/address/0x38647cd2c6a818b72453DC6f21F550B1A2e80606',
    badgeBg: 'bg-indigo-500/15',
    badgeText: 'text-indigo-400',
    borderAccent: 'border-indigo-500/30',
    instructions: [
      'Send ONLY Ethereum (ETH) or ERC-20 compatible assets (USDC, USDT) via Ethereum Mainnet.',
      'Do NOT send via BNB Smart Chain, Polygon PoS, or non-EVM mainnets unless wrapped through a verified gateway.',
      'Real-time account balance reconciliation is completed upon 12 block confirmations.'
    ],
  },
};

export const CustodyTransfersModal: React.FC<CustodyTransfersModalProps> = ({
  isOpen,
  onClose,
  portfolio,
  onTransferCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<'DEPOSIT_CRYPTO' | 'DEPOSIT_USD' | 'WITHDRAW_USD' | 'WITHDRAW_CRYPTO'>('DEPOSIT_CRYPTO');
  const [selectedCrypto, setSelectedCrypto] = useState<'BTC' | 'ETH'>('BTC');
  const [amount, setAmount] = useState<string>('0.5');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [method, setMethod] = useState<string>('Fedwire Institutional Gross Settlement');
  const [notes, setNotes] = useState<string>('');
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { account: web3Account, isConnecting: isWalletConnecting, connect: connectWallet } = useWeb3Wallet();

  const activeConfig = SUPPORTED_CRYPTO_NETWORKS[selectedCrypto];

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
      setMessage({ type: 'error', text: 'Please enter the whitelisted destination account or custody address.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const record = await api.createTransfer({
        type: activeTab,
        asset: activeTab.includes('USD') ? 'USD' : selectedCrypto,
        amount: numAmount,
        destinationAddress: destinationAddress.trim() || undefined,
        method,
        notes: notes.trim() || undefined,
      });

      setMessage({
        type: 'success',
        text: `Transfer instruction submitted successfully. Reference: ${record.referenceId}`,
      });
      fetchTransfers();
      if (onTransferCompleted) {
        onTransferCompleted();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Transfer failed to process.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="custody-transfers-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div id="custody-transfers-modal" className="bg-[#090D16] border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-zinc-200">
        
        {/* Modal Institutional Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/90 flex items-center justify-between bg-gradient-to-r from-zinc-950 via-[#0B0F19] to-zinc-950">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Institutional Capital & Custody Rails
                </h2>
                <span className="hidden sm:inline-flex text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  SEC / FinCEN Regulated
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Segregated client assets • Air-gapped multi-sig cold storage • Same-day settlement
              </p>
            </div>
          </div>
          <button
            id="close-custody-transfers-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-zinc-800/80 bg-zinc-950/60 p-1.5 gap-1 text-xs">
          <button
            id="tab-deposit-crypto"
            onClick={() => { setActiveTab('DEPOSIT_CRYPTO'); setSelectedCrypto('BTC'); }}
            className={`py-2.5 px-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'DEPOSIT_CRYPTO'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">Deposit Crypto</span>
          </button>

          <button
            id="tab-deposit-usd"
            onClick={() => setActiveTab('DEPOSIT_USD')}
            className={`py-2.5 px-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'DEPOSIT_USD'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">Deposit USD (Wire)</span>
          </button>

          <button
            id="tab-withdraw-crypto"
            onClick={() => { setActiveTab('WITHDRAW_CRYPTO'); setSelectedCrypto('BTC'); }}
            className={`py-2.5 px-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'WITHDRAW_CRYPTO'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate">Withdraw to Vault</span>
          </button>

          <button
            id="tab-withdraw-usd"
            onClick={() => setActiveTab('WITHDRAW_USD')}
            className={`py-2.5 px-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'WITHDRAW_USD'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            <span className="truncate">Withdraw USD</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
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

          {/* TAB 1: DEPOSIT CRYPTO (BTC & ETH ONLY) */}
          {activeTab === 'DEPOSIT_CRYPTO' && (
            <div className="space-y-6">
              {/* Asset Selector: STRICTLY BTC & ETH ONLY */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-zinc-300 font-semibold flex items-center space-x-1.5 text-xs sm:text-sm">
                    <span>Select Institutional Digital Asset Rail</span>
                  </label>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    2 Supported Core Networks
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Bitcoin (BTC) Option */}
                  <button
                    type="button"
                    id="crypto-select-btc"
                    onClick={() => { setSelectedCrypto('BTC'); setAmount('0.25'); }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selectedCrypto === 'BTC'
                        ? 'bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/40'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                        selectedCrypto === 'BTC'
                          ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30'
                          : 'bg-zinc-800 text-amber-400'
                      }`}>
                        BTC
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">Bitcoin</span>
                          <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Native SegWit
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">BIP-84 • Bech32 • Layer 1</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-[11px] font-mono text-zinc-400">~20-30 min</div>
                      <div className="text-[10px] text-zinc-500">3 Confirmations</div>
                    </div>
                  </button>

                  {/* Ethereum (ETH) Option */}
                  <button
                    type="button"
                    id="crypto-select-eth"
                    onClick={() => { setSelectedCrypto('ETH'); setAmount('2.5'); }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selectedCrypto === 'ETH'
                        ? 'bg-gradient-to-r from-indigo-500/15 via-indigo-500/5 to-transparent border-indigo-500/60 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/40'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                        selectedCrypto === 'ETH'
                          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                          : 'bg-zinc-800 text-indigo-400'
                      }`}>
                        ETH
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">Ethereum</span>
                          <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            ERC-20
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">EVM • Proof-of-Stake</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-[11px] font-mono text-zinc-400">~2-3 min</div>
                      <div className="text-[10px] text-zinc-500">12 Confirmations</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Deposit Coordinates Card with QR Code */}
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-bold text-white text-sm">
                      Segregated {activeConfig.name} ({activeConfig.symbol}) Custodial Deposit Vault
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className={`px-2.5 py-0.5 rounded font-mono font-bold ${activeConfig.badgeBg} ${activeConfig.badgeText} border ${activeConfig.borderAccent}`}>
                      {activeConfig.network}
                    </span>
                  </div>
                </div>

                {/* QR Code & Address Display */}
                <div className="flex flex-col md:flex-row gap-5 items-center">
                  {/* High-Resolution QR Code */}
                  <div className="bg-white p-3 rounded-2xl border-2 border-zinc-700 shadow-xl shrink-0 flex flex-col items-center justify-center">
                    <QRCodeSVG
                      value={activeConfig.address}
                      size={140}
                      level="H"
                      includeMargin={false}
                    />
                    <span className="text-[9px] font-mono font-bold text-zinc-800 mt-1.5 tracking-wider uppercase">
                      Scan in Wallet
                    </span>
                  </div>

                  {/* Address Details & Copy Block */}
                  <div className="flex-1 w-full space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-zinc-400 font-semibold">
                          Dedicated Institutional Deposit Address:
                        </span>
                        <a
                          href={activeConfig.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-zinc-400 hover:text-white flex items-center space-x-1 transition-colors"
                        >
                          <span>Verify on Blockchain Explorer</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="p-3.5 rounded-xl bg-black/80 border border-zinc-800 font-mono text-xs text-amber-300 break-all select-all flex items-center justify-between gap-2 group">
                        <span className="font-medium tracking-tight">
                          {activeConfig.address}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        id="copy-crypto-address-btn"
                        onClick={() => handleCopy(activeConfig.address)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-amber-500/10 text-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copied ? 'Copied to Clipboard!' : `Copy ${activeConfig.symbol} Address`}</span>
                      </button>

                      <a
                        href={activeConfig.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold flex items-center justify-center space-x-1.5 transition-colors text-xs shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Explorer</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Key Specifications & Security Rules */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-zinc-800/80">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Settlement Speed</div>
                    <div className="text-xs font-bold text-white font-mono mt-0.5">{activeConfig.avgTime}</div>
                    <div className="text-[10px] text-zinc-400">{activeConfig.confirmations}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Minimum Transfer</div>
                    <div className="text-xs font-bold text-white font-mono mt-0.5">{activeConfig.minDeposit}</div>
                    <div className="text-[10px] text-zinc-400">Zero broker deposit fees</div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Custodial Standard</div>
                    <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">Segregated Vault</div>
                    <div className="text-[10px] text-zinc-400">Fidelity / BitGo Cold Storage</div>
                  </div>
                </div>

                {/* Compliance & Security Callout */}
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-zinc-300 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs">
                    <Info className="w-3.5 h-3.5" />
                    <span>Important Transfer Guidelines</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-zinc-400 list-disc list-inside">
                    {activeConfig.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Direct Web3 Institutional Connect */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/20 via-zinc-900/60 to-zinc-950 border border-blue-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-blue-400 font-semibold">
                    <Wallet className="w-4 h-4" />
                    <span>Direct Web3 Wallet Deposit (MetaMask, Base, Trust)</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Optional Direct Connect</span>
                </div>

                {web3Account ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-mono text-xs text-zinc-300">{web3Account}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                        Connected
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          placeholder="Amount to deposit"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-amber-500 focus:outline-none transition-colors"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-mono font-bold text-amber-400">
                          {selectedCrypto}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const val = parseFloat(amount);
                          if (val > 0) {
                            setMessage({ type: 'success', text: `Initiating ${amount} ${selectedCrypto} transfer from connected wallet...` });
                            setTimeout(() => {
                              setMessage({ type: 'success', text: `Deposit of ${amount} ${selectedCrypto} successfully broadcast to blockchain network.` });
                              fetchTransfers();
                              if (onTransferCompleted) onTransferCompleted();
                            }, 2000);
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer whitespace-nowrap shadow-lg shadow-blue-600/20"
                      >
                        Sign & Deposit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-[11px] text-zinc-400">
                      Transfer directly from your browser or mobile Web3 wallet into institutional qualified cold storage.
                    </p>
                    <button
                      type="button"
                      onClick={connectWallet}
                      disabled={isWalletConnecting}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shrink-0 shadow-md"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      <span>{isWalletConnecting ? 'Connecting...' : 'Connect Web3 Wallet'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DEPOSIT USD (FEDWIRE & ACH) */}
          {activeTab === 'DEPOSIT_USD' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="font-bold text-white text-sm">US Commercial Clearing Account Coordinates</h3>
                      <p className="text-[11px] text-zinc-400">FDIC-Insured Custodial Clearing Bank (JPMorgan Chase N.A.)</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Same-Day Fedwire
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                    <div className="text-[10px] text-zinc-500 font-sans uppercase">Beneficiary Bank</div>
                    <div className="font-bold text-white">JPMorgan Chase Bank, N.A.</div>
                    <div className="text-[10px] text-zinc-400 font-sans">270 Park Avenue, New York, NY 10017</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                    <div className="text-[10px] text-zinc-500 font-sans uppercase">Fedwire Routing (ABA)</div>
                    <div className="font-bold text-emerald-400 text-sm">021000021</div>
                    <div className="text-[10px] text-zinc-400 font-sans">ACH Routing: 021000021</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                    <div className="text-[10px] text-zinc-500 font-sans uppercase">Beneficiary Name</div>
                    <div className="font-bold text-white">Verity-Capital Inv Custody LLC</div>
                    <div className="text-[10px] text-zinc-400 font-sans">For the Benefit of (FBO) Client Account</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                    <div className="text-[10px] text-zinc-500 font-sans uppercase">Beneficiary Account #</div>
                    <div className="font-bold text-white text-sm">842109482710</div>
                    <div className="text-[10px] text-zinc-400 font-sans">Type: Commercial Checking</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-400">Mandatory Wire Reference / Memo:</span>
                    <div className="font-mono font-bold text-amber-400 text-sm">
                      VERITY-ACC-{portfolio ? portfolio.userId.slice(-6).toUpperCase() : 'INST-01'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(`VERITY-ACC-${portfolio ? portfolio.userId.slice(-6).toUpperCase() : 'INST-01'}`)}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-700 font-semibold cursor-pointer"
                  >
                    Copy Memo
                  </button>
                </div>
              </div>

              {/* Deposit Intent Form */}
              <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                  Notify Settlement Desk of Incoming Wire
                </h4>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Estimated Deposit Amount (USD)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 100000"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-mono font-bold text-emerald-400">USD</span>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Sending Bank / Institution</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. JPMorgan Chase Commercial Banking"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering Wire Notification...' : 'Submit Wire Deposit Notice'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3 & 4: WITHDRAWALS */}
          {(activeTab === 'WITHDRAW_USD' || activeTab === 'WITHDRAW_CRYPTO') && (
            <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {activeTab === 'WITHDRAW_USD' ? 'Institutional Wire Withdrawal' : `Cold Vault ${selectedCrypto} Withdrawal`}
                  </h3>
                  <p className="text-[11px] text-zinc-400">Whitelisted address validation & cryptographic 2FA authorization required</p>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Tier 2 Limit: $500k/day
                </span>
              </div>

              {activeTab === 'WITHDRAW_CRYPTO' && (
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1.5">Select Asset to Withdraw</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['BTC', 'ETH'] as const).map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => setSelectedCrypto(sym)}
                        className={`p-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                          selectedCrypto === sym
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {sym === 'BTC' ? 'Bitcoin (BTC)' : 'Ethereum (ETH)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-400 font-semibold">
                    Withdrawal Amount ({activeTab === 'WITHDRAW_USD' ? 'USD' : selectedCrypto})
                  </label>
                  {portfolio && (
                    <span className="text-zinc-400 text-[11px]">
                      Available Cash:{' '}
                      <strong className="text-white font-mono">
                        ${portfolio.simulatedCashBalance.toLocaleString()}
                      </strong>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={activeTab === 'WITHDRAW_USD' ? '25000' : '0.25'}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-amber-500 focus:outline-none"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-mono font-bold text-amber-400">
                    {activeTab === 'WITHDRAW_USD' ? 'USD' : selectedCrypto}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">
                  {activeTab === 'WITHDRAW_USD'
                    ? 'Whitelisted Commercial Bank Account (ABA Routing & Account Number)'
                    : `Whitelisted Destination ${selectedCrypto} Address`}
                </label>
                <input
                  type="text"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  placeholder={
                    activeTab === 'WITHDRAW_USD'
                      ? 'Citibank NY - Routing # 021000089 - Acct # 948271048'
                      : `e.g. ${selectedCrypto === 'BTC' ? 'bc1q...' : '0x...'}`
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Clearing Channel</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:border-amber-500 focus:outline-none"
                >
                  {activeTab === 'WITHDRAW_USD' ? (
                    <>
                      <option value="Fedwire Real-Time Gross Settlement">Fedwire Real-Time Gross Settlement (Same-Day)</option>
                      <option value="ACH Institutional Direct Credit">ACH Institutional Direct Credit (1 Business Day)</option>
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
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>
                  {isSubmitting ? 'Verifying Compliance & Transmitting...' : `Authorize ${activeTab.replace('_', ' ')}`}
                </span>
              </button>
            </form>
          )}

          {/* Audit Trail / History */}
          <div className="pt-4 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Recent Custodial & Clearing Audit Ledger</span>
              </h4>
              <button
                type="button"
                onClick={fetchTransfers}
                className="text-zinc-400 hover:text-amber-400 flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Ledger</span>
              </button>
            </div>

            <div className="space-y-2">
              {transfers.length === 0 ? (
                <p className="text-zinc-500 text-center py-4 bg-zinc-950/40 rounded-xl border border-zinc-900">
                  No recent transfers recorded.
                </p>
              ) : (
                transfers.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        t.type.startsWith('DEPOSIT')
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {t.type.startsWith('DEPOSIT') ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white flex items-center space-x-2">
                          <span>{t.type.replace('_', ' ')}</span>
                          <span className="font-mono text-amber-400 font-medium">
                            {t.amount.toLocaleString()} {t.asset}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          Ref: {t.referenceId || t.id} • {new Date(t.createdAt).toLocaleDateString()} • {t.method || 'Fedwire/On-Chain'}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
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
