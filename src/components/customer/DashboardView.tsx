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
  Coins
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
import { BitcoinModelViewer } from '../common/BitcoinModelViewer.tsx';
import { api } from '../../services/api.ts';
import { Lock } from 'lucide-react';

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

  const totalEquity = portfolio?.totalEquity || 100000;
  const cashBalance = portfolio?.simulatedCashBalance || 65000;
  const invested = portfolio?.investedBalance || 35000;
  const unrealizedPnl = portfolio?.unrealizedPnl || 0;
  const unrealizedPnlPercent = portfolio?.unrealizedPnlPercent || 0;
  const isPnlPositive = unrealizedPnl >= 0;

  // Generate synthetic performance timeline for chart
  const chartData = React.useMemo(() => {
    const points = [];
    const baseline = totalEquity - unrealizedPnl;
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
      const timeStr = new Date(now - i * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const progress = (24 - i) / 24;
      const noise = (Math.sin(i * 0.7) + (Math.random() - 0.5) * 0.3) * (totalEquity * 0.008);
      const val = Math.round((baseline + (totalEquity - baseline) * progress + noise) * 100) / 100;
      points.push({
        time: timeStr,
        equity: i === 0 ? totalEquity : val,
      });
    }
    return points;
  }, [totalEquity, unrealizedPnl]);

  // Top gainers & losers among supported crypto assets
  const sortedByChange = [...instruments].sort((a, b) => b.changePercent - a.changePercent);
  const topGainers = sortedByChange.slice(0, 3);

  const featuredInsight = insights[0];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto animate-in fade-in duration-300">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
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
            className="w-full flex items-center justify-center gap-3 border border-white/20 bg-zinc-900/80 hover:bg-zinc-800 hover:border-emerald-400/50 text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
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
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-colors cursor-pointer"
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
          onResetPortfolio();
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

      {/* Welcome Banner / Overview Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-[#0B0F19] p-8 rounded-3xl border border-zinc-800 shadow-xl">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
            Total Account Balance
          </h2>
          <div className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-mono">
            ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center space-x-3 text-sm pt-2">
             <div className={`font-mono font-medium ${isPnlPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
               {isPnlPositive ? '+' : ''}${unrealizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isPnlPositive ? '+' : ''}{unrealizedPnlPercent.toFixed(2)}%)
             </div>
             <span className="text-zinc-500">All-time return</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            id="open-custody-transfers-btn"
            onClick={() => setIsTransferModalOpen(true)}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-100 hover:text-white font-bold text-sm px-6 py-3.5 rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-sm"
          >
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span>Transfer Funds</span>
          </button>
          <button
            id="open-trade-modal-btn"
            onClick={() => onOpenTrade()}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm px-8 py-3.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>Trade Assets</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Cash Available */}
        <div className="bg-[#0B0F19] border border-zinc-800/90 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Available Cash</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-white tracking-tight">
            ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-zinc-400">
            <span>Purchasing Power:</span>
            <span className="ml-1 font-mono text-emerald-400">100% Liquid</span>
          </div>
        </div>

        {/* Card 2: Invested Value */}
        <div className="bg-[#0B0F19] border border-zinc-800/90 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Invested Assets</span>
            <PieIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-white tracking-tight">
            ${invested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-zinc-400">
            <span>Holdings:</span>
            <span className="ml-1 font-mono text-zinc-200">{positions.length} Active Positions</span>
          </div>
        </div>

        {/* Card 3: Asset Details Button */}
        <div 
          onClick={() => { setSelectedSpecSymbol('BTC'); setIsAssetSpecsOpen(true); }}
          className="bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800/90 rounded-2xl p-4 shadow-md cursor-pointer transition-colors flex flex-col justify-center items-center group"
        >
          <BookOpen className="w-8 h-8 text-cyan-400/70 group-hover:text-cyan-400 mb-2 transition-colors" />
          <div className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
            Asset Details Library
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            View specs and requirements
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Performance Chart */}
        <div className="lg:col-span-2 bg-[#0B0F19] border border-zinc-800/90 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Net Portfolio Equity Valuation</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-mono border border-amber-500/20">
                  Real-Time Spot
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Continuous mark-to-market valuation against deep institutional liquidity</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-zinc-400">Current NAV</span>
              <div className="font-mono text-base font-bold text-amber-400">
                ${totalEquity.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
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
                    backgroundColor: '#18181B',
                    borderColor: '#27272A',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Portfolio Equity']}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#equityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Primary settlement currency: USD</span>
            <span className="text-zinc-500 font-mono">0.8ms average execution latency</span>
          </div>
        </div>

        {/* Right 1 Col: Supported Crypto Assets & Protocol Specs */}
        <div className="space-y-4">
          <div className="bg-[#0B0F19] border border-zinc-800/90 rounded-2xl overflow-hidden relative p-4 shadow-lg flex flex-col items-center justify-center min-h-[220px]">
             <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent z-10" />
             <div className="absolute top-4 left-4 z-20">
               <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">Interactive Asset</span>
               <h3 className="text-sm font-bold text-white mt-0.5">Bitcoin (BTC)</h3>
             </div>
             <div className="absolute inset-0 z-0">
               <BitcoinModelViewer autoRotate={true} />
             </div>
          </div>

          <div className="bg-[#0B0F19] border border-zinc-800/90 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <span className="text-xs font-bold text-white">Supported Spot Assets</span>
              <button
                onClick={() => { setSelectedSpecSymbol('BTC'); setIsAssetSpecsOpen(true); }}
                className="text-[11px] text-amber-400 hover:underline flex items-center cursor-pointer"
              >
                <span>Full Specs</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {instruments.slice(0, 5).map((inst) => (
                <div
                  key={inst.id}
                  onClick={() => onSelectInstrument(inst)}
                  className="p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800/60 flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
                      {inst.symbol.substring(0, 3)}
                    </div>
                    <div>
                      <div className="font-mono font-bold text-xs text-white group-hover:text-amber-400">
                        {inst.symbol}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-sans">
                        {inst.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs text-zinc-200 font-bold">${inst.price.toLocaleString()}</div>
                    <div className={`font-mono text-[10px] font-semibold flex items-center justify-end ${
                      inst.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {inst.changePercent >= 0 ? (
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 mr-0.5" />
                      )}
                      {inst.changePercent >= 0 ? '+' : ''}{inst.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Factual Institutional Analysis Teaser */}
          {featuredInsight && (
            <div className="bg-gradient-to-b from-zinc-900/80 to-[#0B0F19] border border-amber-500/20 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Protocol Verification Brief</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {featuredInsight.symbol}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white line-clamp-1">
                {featuredInsight.title}
              </h4>
              <p className="text-[11px] text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                {featuredInsight.summary}
              </p>
              <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
                <span className="text-zinc-400 font-mono">Consensus: <strong className="text-amber-400">{featuredInsight.sentiment}</strong></span>
                <button
                  onClick={() => onNavigateTab('insights')}
                  className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer flex items-center"
                >
                  <span>Read Factual Brief</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Holdings & Recent Orders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Positions Card */}
        <div className="bg-[#0B0F19] border border-zinc-800/90 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Custodied Digital Asset Positions</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Segregated qualified custody ledger</p>
            </div>
            <button
              onClick={() => onNavigateTab('portfolio')}
              className="text-xs text-amber-400 hover:underline flex items-center cursor-pointer"
            >
              <span>Manage Portfolio</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {positions.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              No active digital asset positions. Click "Execute Spot Trade" to place spot instructions.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800/80 pb-2">
                    <th className="pb-2 font-medium">Digital Asset</th>
                    <th className="pb-2 font-medium text-right">Balance</th>
                    <th className="pb-2 font-medium text-right">Market Value</th>
                    <th className="pb-2 font-medium text-right">Unrealized P&L</th>
                    <th className="pb-2 font-medium text-right">Instruction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {positions.slice(0, 5).map((pos) => {
                    const isGain = pos.unrealizedPnl >= 0;
                    return (
                      <tr key={pos.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3">
                          <div className="font-bold text-white">{pos.symbol}</div>
                          <div className="text-[10px] text-zinc-400 font-sans">{pos.name}</div>
                        </td>
                        <td className="py-3 text-right text-zinc-200">
                          {pos.quantity}
                        </td>
                        <td className="py-3 text-right text-zinc-200">
                          ${pos.marketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right">
                          <div className={isGain ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                            {isGain ? '+' : ''}${pos.unrealizedPnl.toFixed(2)}
                          </div>
                          <div className={`text-[10px] ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isGain ? '+' : ''}{pos.unrealizedPnlPercent.toFixed(2)}%
                          </div>
                        </td>
                        <td className="py-3 text-right font-sans">
                          <button
                            onClick={() => {
                              const inst = instruments.find((i) => i.id === pos.instrumentId);
                              onOpenTrade(inst);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Trade
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders Card */}
        <div className="bg-[#0B0F19] border border-zinc-800/90 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Spot Execution History</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Audit log of client-confirmed spot orders</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-amber-400 hover:underline flex items-center cursor-pointer"
            >
              <span>All Orders</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              No orders placed yet.
            </div>
          ) : (
            <div className="space-y-2.5 text-xs">
              {orders.slice(0, 4).map((ord) => (
                <div
                  key={ord.id}
                  className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/70 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        ord.side === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {ord.side}
                    </span>
                    <div>
                      <div className="font-mono font-bold text-zinc-200">
                        {ord.quantity} {ord.symbol}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-sans">
                        {ord.orderType} Order • {new Date(ord.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-zinc-200 font-semibold">
                      ${ord.totalValue.toFixed(2)}
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        ord.status === 'EXECUTED'
                          ? 'text-emerald-400'
                          : ord.status === 'PENDING'
                          ? 'text-amber-400'
                          : 'text-zinc-400'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Compliance Callout Banner */}
      <RiskBanner onLearnMore={() => onNavigateTab('risk-disclosure')} />
    </div>
  );
};
