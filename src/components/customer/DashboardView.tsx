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
import { Portfolio, Position, Order, Instrument, AiInsight } from '../../types.ts';
import { RiskBanner } from '../common/RiskBanner.tsx';
import { CustodyTransfersModal } from './CustodyTransfersModal.tsx';
import { AssetSpecsModal } from './AssetSpecsModal.tsx';
import { KycModal } from './KycModal.tsx';

interface DashboardViewProps {
  portfolio: Portfolio | null;
  positions: Position[];
  orders: Order[];
  instruments: Instrument[];
  insights: AiInsight[];
  onOpenTrade: (instrument?: Instrument) => void;
  onSelectInstrument: (instrument: Instrument) => void;
  onNavigateTab: (tab: string) => void;
  onResetPortfolio: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  portfolio,
  positions,
  orders,
  instruments,
  insights,
  onOpenTrade,
  onSelectInstrument,
  onNavigateTab,
  onResetPortfolio,
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-[#0C121E] via-[#0E1524] to-[#0A0F1A] p-6 rounded-2xl border border-amber-500/25 shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25 font-semibold flex items-center space-x-1">
              <Coins className="w-3.5 h-3.5" />
              <span>Institutional Bitcoin Brokerage</span>
            </span>
            <button
              onClick={() => setIsKycModalOpen(true)}
              className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center space-x-1 hover:bg-emerald-500/20 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tier 2 Institutional Verified (CIP Passed)</span>
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
            Verity-Capital Inv Prime Custody & Spot Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Regulated US digital asset brokerage environment. Manage cash liquidity, cold-storage custody, and execute spot instructions across BTC, ETH, SOL, XRP, and ADA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            id="open-custody-transfers-btn"
            onClick={() => setIsTransferModalOpen(true)}
            className="bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-400 hover:text-amber-300 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-md"
          >
            <Wallet className="w-4 h-4" />
            <span>Custody & Transfers</span>
          </button>
          <button
            id="open-asset-specs-btn"
            onClick={() => { setSelectedSpecSymbol('BTC'); setIsAssetSpecsOpen(true); }}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-xs px-3 py-2.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Factual Asset Specs</span>
          </button>
          <button
            id="open-trade-modal-btn"
            onClick={() => onOpenTrade()}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Execute Spot Trade</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Equity */}
        <div className="bg-[#0B0F19] border border-zinc-800/90 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Portfolio Net Equity</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-white tracking-tight">
            ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-zinc-400">
            <span>Base Currency:</span>
            <span className="ml-1 font-mono text-zinc-300">USD (Clearing Segregated)</span>
          </div>
        </div>

        {/* Card 2: Cash Available */}
        <div className="bg-[#0B0F19] border border-zinc-800/90 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Settled USD Cash Balance</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-white tracking-tight">
            ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-zinc-400">
            <span>Purchasing Power:</span>
            <span className="ml-1 font-mono text-emerald-400">100% Liquid Fedwire</span>
          </div>
        </div>

        {/* Card 3: Invested Value */}
        <div className="bg-[#0B0F19] border border-zinc-800/90 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Digital Asset Holdings Value</span>
            <PieIcon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-white tracking-tight">
            ${invested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs text-zinc-400">
            <span>Qualified Custody:</span>
            <span className="ml-1 font-mono text-zinc-200">{positions.length} Active Coins</span>
          </div>
        </div>

        {/* Card 4: Unrealized PnL */}
        <div className="bg-[#0B0F19] border border-zinc-800/90 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Unrealized Mark-to-Market P&L</span>
            {isPnlPositive ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div
            className={`mt-2 font-mono text-2xl font-bold tracking-tight ${
              isPnlPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPnlPositive ? '+' : ''}
            ${unrealizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 flex items-center text-xs">
            <span
              className={`font-mono font-semibold ${
                isPnlPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPnlPositive ? '+' : ''}
              {unrealizedPnlPercent.toFixed(2)}%
            </span>
            <span className="ml-1.5 text-zinc-400">weighted return</span>
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
