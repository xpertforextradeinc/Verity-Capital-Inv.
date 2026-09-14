import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PieChart as PieIcon,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  BookOpen,
  ArrowDownLeft,
  UserCheck,
  CheckCircle2,
  Coins,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  Shield,
  Award,
  Layers,
  Activity,
  Lock,
  ArrowRightLeft,
  Smartphone,
  ChevronDown
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Portfolio, Position, Order, Instrument, AiInsight, User } from '../../types.ts';
import { RiskBanner } from '../common/RiskBanner.tsx';
import { CustodyTransfersModal } from './CustodyTransfersModal.tsx';
import { AssetSpecsModal } from './AssetSpecsModal.tsx';
import { KycModal } from './KycModal.tsx';
import { InternalTransferModal } from './InternalTransferModal.tsx';
import { CryptoPortfolioCard } from './CryptoPortfolioCard.tsx';
import { AccountUpgradeSection } from './AccountUpgradeSection.tsx';
import { api } from '../../services/api.ts';

interface DashboardViewProps {
  user?: User | null;
  portfolio: Portfolio | null;
  positions: Position[];
  orders: Order[];
  instruments: Instrument[];
  insights?: AiInsight[];
  onOpenTrade: (instrument?: any) => void;
  onSelectInstrument?: (instrument: Instrument) => void;
  onNavigateTab: (tab: string) => void;
  onResetPortfolio?: () => void;
  onOpenCustody?: () => void;
  onOpenSpecs?: (sym?: string) => void;
  onKycOpen?: () => void;
  onGoogleSignIn?: () => Promise<void>;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  portfolio,
  positions,
  orders,
  instruments,
  insights = [],
  onOpenTrade,
  onSelectInstrument,
  onNavigateTab,
  onResetPortfolio,
  onGoogleSignIn,
  onOpenAuth,
}) => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
  const [isAssetSpecsOpen, setIsAssetSpecsOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [selectedSpecSymbol, setSelectedSpecSymbol] = useState('BTC');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | 'ALL'>('1D');

  const totalEquity = portfolio?.totalEquity || 105898.38;
  const cashBalance = portfolio?.simulatedCashBalance || 65000.00;
  const invested = portfolio?.investedBalance || 40898.38;
  const unrealizedPnl = portfolio?.unrealizedPnl || 11435.63;
  const unrealizedPnlPercent = portfolio?.unrealizedPnlPercent || 21.37;
  const isPnlPositive = unrealizedPnl >= 0;

  // Generate synthetic performance timeline for chart based on selected timeframe
  const chartData = React.useMemo(() => {
    const count = selectedTimeframe === '1D' ? 24 : selectedTimeframe === '1W' ? 7 : 30;
    const points = [];
    const baseline = totalEquity - unrealizedPnl;
    const now = Date.now();
    const stepMs = selectedTimeframe === '1D' ? 3600000 : selectedTimeframe === '1W' ? 86400000 : 86400000;

    for (let i = count; i >= 0; i--) {
      const date = new Date(now - i * stepMs);
      const timeStr = selectedTimeframe === '1D' 
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      
      const progress = (count - i) / count;
      const noise = (Math.sin(i * 0.7) + (Math.random() - 0.5) * 0.25) * (totalEquity * 0.006);
      const val = Math.round((baseline + (totalEquity - baseline) * progress + noise) * 100) / 100;
      points.push({
        time: timeStr,
        equity: i === 0 ? totalEquity : val,
      });
    }
    return points;
  }, [totalEquity, unrealizedPnl, selectedTimeframe]);

  // Sorted movers
  const sortedByChange = [...instruments].sort((a, b) => b.changePercent - a.changePercent);
  const topGainers = sortedByChange.slice(0, 4);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto animate-in fade-in duration-300">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Sign in to access your Verity-Capital Inv portfolio, live market executions, and custody balances.
        </p>

        <div className="w-full space-y-3">
          <button
            type="button"
            id="auth-required-google-btn"
            onClick={async () => {
              if (onGoogleSignIn) {
                await onGoogleSignIn();
              }
            }}
            className="w-full flex items-center justify-center gap-3 border border-white/20 bg-zinc-900/80 hover:bg-zinc-800 hover:border-cyan-400/50 text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            onClick={() => onOpenAuth?.('login')}
            className="w-full py-3 px-4 bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Sign In with Credentials
          </button>
          <div className="pt-4 mt-4 border-t border-zinc-800 text-center">
            <span className="text-zinc-500 text-sm">Don't have an account? </span>
            <button
              onClick={() => onOpenAuth?.('onboarding')}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-bold ml-1"
            >
              Open an Account
            </button>
          </div>
          <button
            onClick={async () => {
              try {
                await api.login('client@verity-capital.com', 'demo-bypass');
                window.location.reload();
              } catch (err) {
                console.error(err);
              }
            }}
            className="w-full py-2.5 px-4 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium rounded-xl border border-zinc-800 transition-colors cursor-pointer"
          >
            Explore with Demo Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modals */}
      <CustodyTransfersModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        portfolio={portfolio}
        onTransferCompleted={() => {
          if (onResetPortfolio) onResetPortfolio();
        }}
      />
      <AssetSpecsModal
        isOpen={isAssetSpecsOpen}
        onClose={() => setIsAssetSpecsOpen(false)}
        initialSymbol={selectedSpecSymbol}
        onSelectForTrade={(sym) => {
          const inst = instruments.find(i => i.symbol === sym);
          if (inst) onOpenTrade(inst);
          else onOpenTrade();
        }}
      />
      <KycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
      />

      {portfolio && (
        <InternalTransferModal
          portfolio={portfolio}
          isOpen={isInternalModalOpen}
          onClose={() => setIsInternalModalOpen(false)}
          onSuccess={(updated) => {
            if (onResetPortfolio) onResetPortfolio();
          }}
        />
      )}

      {/* 1. HERO FINANCIAL OVERVIEW: TOTAL ACCOUNT BALANCE */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 border border-zinc-800 p-8 sm:p-10 shadow-2xl group">
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #10b981 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        {/* Ambient background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-700"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/15 transition-all duration-700"></div>

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Institutional Tier Active</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                Verified Node
              </div>
            </div>
            
            <div>
              <h1 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-3">Net Portfolio Equity</h1>
              <div className="flex items-baseline space-x-4">
                <span className="text-5xl sm:text-7xl font-black text-white tracking-tighter tabular-nums leading-none">
                  ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xl font-mono font-bold text-emerald-500/60 uppercase">USD</span>
              </div>
            </div>

            <div className="flex items-center space-x-8 pt-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">24h Net Gain</span>
                <div className="flex items-center text-emerald-400 font-mono font-black text-base">
                  <TrendingUp className="w-4 h-4 mr-1.5" />
                  <span>+$2,492.10</span>
                  <span className="ml-2 text-[11px] opacity-70">(+1.24%)</span>
                </div>
              </div>
              <div className="w-px h-10 bg-zinc-800/50"></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Account Status</span>
                <div className="text-white font-mono font-black text-base flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setIsTransferModalOpen(true)}
              className="px-10 py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm uppercase tracking-widest shadow-2xl shadow-emerald-500/30 transition-all flex items-center justify-center space-x-3 active:scale-95"
            >
              <ArrowDownLeft className="w-5 h-5" />
              <span>Deposit Funds</span>
            </button>
            <button 
              onClick={() => onOpenTrade()}
              className="px-10 py-5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-sm uppercase tracking-widest border border-zinc-800 transition-all flex items-center justify-center space-x-3 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Portfolio Pulse</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. THREE HIGH-DENSITY FINANCIAL METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Metric 1: Available Liquid Cash */}
        <div className="bg-[#0B0F19] border border-zinc-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-3">
            <span className="font-bold uppercase tracking-[0.15em] text-[10px] text-zinc-500">Available USD</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-3xl font-black text-white tracking-tight">
            ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] text-zinc-500 pt-3 border-t border-zinc-800/50">
            <span className="uppercase tracking-widest font-bold">Buying Power</span>
            <span className="font-mono text-emerald-400 font-black tracking-tighter">MAX READY</span>
          </div>
        </div>

        {/* Metric 2: Invested Crypto Assets */}
        <div className="bg-[#0B0F19] border border-zinc-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-3">
            <span className="font-bold uppercase tracking-[0.15em] text-[10px] text-zinc-500">Asset Value</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-3xl font-black text-white tracking-tight">
            ${invested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] text-zinc-500 pt-3 border-t border-zinc-800/50">
            <span className="uppercase tracking-widest font-bold">Allocations</span>
            <span className="font-mono text-emerald-400 font-black tracking-tighter">{positions.length || 0} POSITIONS</span>
          </div>
        </div>

        {/* Quick Wallet Transfer Card (Internal) */}
        <div 
          onClick={() => setIsInternalModalOpen(true)}
          className="bg-[#0B0F19] border border-zinc-800/80 hover:border-emerald-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-3">
            <span className="font-bold uppercase tracking-[0.15em] text-[10px] text-zinc-500">Internal Transfer</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="font-sans text-xl font-black text-white tracking-tight leading-tight">
            Move Funds Instantly
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] text-zinc-500 pt-3 border-t border-zinc-800/50">
            <span className="uppercase tracking-widest font-bold">Between Wallets</span>
            <span className="text-emerald-400 font-black flex items-center space-x-1 uppercase tracking-tighter">
              <span>Transfer</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 3: Custody & Security Tier */}
        <div 
          onClick={() => { setSelectedSpecSymbol('BTC'); setIsAssetSpecsOpen(true); }}
          className="bg-[#0B0F19] border border-zinc-800/80 hover:border-emerald-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-3">
            <span className="font-bold uppercase tracking-[0.15em] text-[10px] text-zinc-500">Trust Level</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="font-sans text-xl font-black text-white tracking-tight leading-tight">
            {user.isUpgraded ? 'Institutional Prime' : 'Standard Vault'}
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] text-zinc-500 pt-3 border-t border-zinc-800/50">
            <span className="uppercase tracking-widest font-bold">Security Grade</span>
            <span className="text-emerald-400 font-black flex items-center space-x-1 uppercase tracking-tighter">
              <span>Specs</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* 3. ACCOUNT UPGRADE NOTIFICATION (Sleek, non-intrusive, placed below main metrics) */}
      {user && (
        <AccountUpgradeSection
          user={user}
          onRefreshUser={onResetPortfolio}
        />
      )}

      {/* 4. CRYPTO-CENTRIC LIVE HOLDINGS & ALLOCATION CARD */}
      <CryptoPortfolioCard
        positions={positions}
        instruments={instruments}
        portfolio={portfolio}
        onOpenTrade={(inst) => onOpenTrade(inst)}
        onOpenTransfers={() => setIsTransferModalOpen(true)}
        onSelectSpec={(sym) => {
          setSelectedSpecSymbol(sym);
          setIsAssetSpecsOpen(true);
        }}
      />

      {/* 5. RECENT ACTIVITY & MARKET CONTEXT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Institutional Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Institutional Ledger</h3>
            </div>
            <button className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-emerald-400 transition-colors">
              Request Full Audit
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="divide-y divide-zinc-900">
              {[
                { type: 'Deposit', amount: '+$50,000.00', status: 'Settled', date: 'Today, 09:14', icon: ArrowDownLeft, color: 'text-emerald-400' },
                { type: 'Trade', amount: '-0.24 BTC', status: 'Filled', date: 'Yesterday, 23:45', icon: RefreshCw, color: 'text-zinc-300' },
                { type: 'Internal', amount: '$10,000.00', status: 'Instant', date: 'Yesterday, 14:20', icon: ArrowRightLeft, color: 'text-blue-400' },
                { type: 'Reward', amount: '+$142.20', status: 'Credited', date: '2 days ago', icon: Sparkles, color: 'text-emerald-400' },
              ].map((activity, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-zinc-900/40 transition-colors group cursor-pointer">
                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:border-zinc-700 transition-all">
                      <activity.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white leading-tight">{activity.type} Settlement</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-widest">{activity.date} • NODE_ID: VC_US_01</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-black font-mono ${activity.color}`}>{activity.amount}</p>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter mt-1">{activity.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-zinc-900/20 border-t border-zinc-900 text-center">
              <button className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em] hover:text-white transition-colors">
                View All Historical Settlements
              </button>
            </div>
          </div>
        </div>

        {/* Support & Relationship Manager */}
        <div className="space-y-4">
          <div className="px-2">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Relationship Support</h3>
          </div>
          
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
            
            <div className="relative space-y-8">
              <div className="flex items-center space-x-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200" 
                      alt="Manager" 
                      className="w-full h-full object-cover opacity-90 grayscale group-hover:grayscale-0 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-[4px] border-zinc-950 rounded-full"></div>
                </div>
                <div>
                  <p className="text-lg font-black text-white leading-tight">James Sterling</p>
                  <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-[0.2em] mt-1">Lead Relationship Desk</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <p className="text-xs text-zinc-400 leading-relaxed italic">
                  "Institutional desk is active. Contact me directly for large-block execution or priority custody withdrawals."
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button className="w-full py-4 rounded-2xl bg-emerald-500 text-zinc-950 font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/10 hover:bg-emerald-400 transition-all flex items-center justify-center space-x-2">
                  <span>Open Direct Line</span>
                </button>
                <button className="w-full py-4 rounded-2xl bg-zinc-900 text-white font-black text-xs uppercase tracking-widest border border-zinc-800 hover:bg-zinc-800 transition-all">
                  Contact Institutional Desk
                </button>
              </div>
            </div>
          </div>

          {/* Service Health Card */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Network Health</span>
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-black text-emerald-500 uppercase">Operational</span>
              </div>
            </div>
            <div className="space-y-5">
              {[
                { label: 'Custody Rails', value: '100% SECURE', color: 'text-emerald-400' },
                { label: 'Exchange Node', value: '14MS LATENCY', color: 'text-white' },
                { label: 'Audit Engine', value: 'SYNCHRONIZED', color: 'text-white' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{stat.label}</span>
                  <span className={`text-[11px] font-black font-mono ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
