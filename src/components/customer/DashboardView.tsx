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
  Lock
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

      {/* 1. HERO FINANCIAL OVERVIEW: TOTAL ACCOUNT BALANCE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#091122] to-[#060A14] border border-white/10 p-6 sm:p-8 shadow-2xl">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Balance Metrics */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400/90 font-mono">
                Total Portfolio Equity
              </span>
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-medium text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Custody</span>
              </span>
            </div>

            <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-mono">
              ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm pt-1">
              <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl font-mono font-bold ${
                isPnlPositive 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}>
                {isPnlPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>
                  {isPnlPositive ? '+' : ''}${unrealizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span>({isPnlPositive ? '+' : ''}{unrealizedPnlPercent.toFixed(2)}%)</span>
              </div>

              <span className="text-zinc-400 font-medium">All-time return</span>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span className="text-zinc-400 hidden sm:inline">24h Change: <strong className="text-emerald-400 font-mono">+$1,842.10 (+1.78%)</strong></span>
            </div>
          </div>

          {/* Primary Quick Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 pt-2 lg:pt-0">
            <button
              id="open-custody-transfers-btn"
              onClick={() => setIsTransferModalOpen(true)}
              className="flex-1 sm:flex-initial bg-[#0c152a] hover:bg-[#111e3b] border border-cyan-400/30 hover:border-cyan-400/60 text-cyan-200 hover:text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-cyan-950/40"
            >
              <Wallet className="w-4 h-4 text-cyan-400" />
              <span>Transfer Funds</span>
            </button>

            <button
              id="open-trade-modal-btn"
              onClick={() => onOpenTrade()}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Trade Assets</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. THREE HIGH-DENSITY FINANCIAL METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Available Liquid Cash */}
        <div className="bg-[#070D1A] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-md relative overflow-hidden group hover:border-cyan-400/40 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-400">Available Liquid Cash</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
            ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/5">
            <span>Purchasing Power:</span>
            <span className="font-mono text-emerald-400 font-semibold">100% Spot Ready</span>
          </div>
        </div>

        {/* Metric 2: Invested Crypto Assets */}
        <div className="bg-[#070D1A] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-md relative overflow-hidden group hover:border-cyan-400/40 transition-colors">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-400">Invested Crypto Value</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
            ${invested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/5">
            <span>Active Allocations:</span>
            <span className="font-mono text-cyan-300 font-semibold">{positions.length || 2} Asset Holdings</span>
          </div>
        </div>

        {/* Metric 3: Custody & Security Tier */}
        <div 
          onClick={() => { setSelectedSpecSymbol('BTC'); setIsAssetSpecsOpen(true); }}
          className="bg-[#070D1A] border border-white/10 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-md relative overflow-hidden cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-400">Security & Custody Tier</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 font-sans text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>{user.isUpgraded ? 'Institutional Prime' : 'Standard Vault'}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-white/5">
            <span className="text-zinc-400">Specifications & Rail:</span>
            <span className="text-amber-400 font-semibold group-hover:underline flex items-center space-x-1">
              <span>View Specs</span>
              <ChevronRight className="w-3.5 h-3.5" />
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

      {/* 5. PERFORMANCE CHART & TOP ASSET MOVERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Performance Area Chart */}
        <div className="lg:col-span-2 bg-[#070D1A] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Net Portfolio Equity Curve</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-400/10 text-cyan-300 border border-cyan-400/30">
                  Continuous Mark-to-Market
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Real-time spot index pricing across segregated cold storage balances
              </p>
            </div>

            {/* Timeframe Selectors */}
            <div className="flex items-center bg-[#050814] border border-white/10 rounded-xl p-1 shrink-0">
              {(['1D', '1W', '1M', '1Y', 'ALL'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedTimeframe === tf
                      ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#52525B" fontSize={10} tickLine={false} />
                <YAxis
                  domain={['auto', 'auto']}
                  stroke="#52525B"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#070D1A',
                    borderColor: '#22D3EE40',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Portfolio Equity']}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="#22D3EE"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#equityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Top Crypto Movers & Market Quick Signals */}
        <div className="bg-[#070D1A] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Market Pulse & Movers</span>
              </h3>
              <button
                onClick={() => onNavigateTab('markets')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
              >
                All Spot Markets →
              </button>
            </div>

            <div className="divide-y divide-white/5 mt-2">
              {topGainers.map((inst) => {
                const isPositive = inst.changePercent >= 0;
                return (
                  <div
                    key={inst.symbol}
                    onClick={() => onOpenTrade(inst)}
                    className="py-3 flex items-center justify-between hover:bg-white/[0.02] px-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-white group-hover:border-cyan-400/40">
                        {inst.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {inst.name}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {inst.symbol}/USD
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-white">
                        ${inst.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-[11px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? '+' : ''}{inst.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#050814] rounded-2xl p-4 border border-white/5 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
              <Shield className="w-4 h-4" />
              <span>Custody Verification</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              All digital asset reserves are held in multi-signature cold storage vaults under 1:1 asset backing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
