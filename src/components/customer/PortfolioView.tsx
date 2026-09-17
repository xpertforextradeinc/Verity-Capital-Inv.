import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Lock
,
  PieChart,
  Globe,
  BarChart4,
  CheckCircle2} from 'lucide-react';
import { Portfolio, Position, Instrument, User } from '../../types.ts';
import { RiskBanner } from '../common/RiskBanner.tsx';
import { api } from '../../services/api.ts';

interface PortfolioViewProps {
  user?: User | null;
  portfolio: Portfolio | null;
  positions: Position[];
  instruments: Instrument[];
  onOpenTrade: (instrument?: any) => void;
  onResetPortfolio?: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenCustody?: () => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onGoogleSignIn?: () => Promise<void>;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  user,
  portfolio,
  positions,
  instruments,
  onOpenTrade,
  onResetPortfolio,
  onNavigateTab,
  onOpenAuth,
  onGoogleSignIn
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!user) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-5xl mx-auto">
        
        {/* Hero Section */}
        <div className="relative p-10 md:p-14 bg-[#0B0F19] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[80%] h-[150%] bg-emerald-500/5 blur-[120px] pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 rounded-full mb-6">
              <PieChart className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Institutional Asset Architecture</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-[1.1] mb-6">
              Command your capital<br />with absolute precision.
            </h1>
            <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-2xl mb-8">
              Gain unparalleled visibility into multi-asset portfolios. Our prime brokerage terminal aggregates real-time valuations across Equities, Forex, Commodities, and Digital Assets within a single, secure enclave.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onOpenAuth?.('register')}
                className="px-8 py-3.5 bg-emerald-500 text-zinc-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Open Institutional Account
              </button>
              <button
                onClick={() => onOpenAuth?.('login')}
                className="px-8 py-3.5 bg-zinc-900 border border-zinc-700 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Client Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col justify-between">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Global Markets</span>
            </div>
            <div>
              <p className="text-3xl font-black text-white">40+</p>
              <p className="text-sm text-zinc-500 font-medium mt-1">Exchanges & OTC Venues</p>
            </div>
          </div>
          
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col justify-between">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <BarChart4 className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Execution Latency</span>
            </div>
            <div>
              <p className="text-3xl font-black text-white">&lt; 50ms</p>
              <p className="text-sm text-zinc-500 font-medium mt-1">Smart Order Routing</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col justify-between">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <PieChart className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Asset Classes</span>
            </div>
            <div>
              <p className="text-3xl font-black text-white">Multi</p>
              <p className="text-sm text-zinc-500 font-medium mt-1">Fiat, Crypto, Equities</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col justify-between">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Cold Custody</span>
            </div>
            <div>
              <p className="text-3xl font-black text-white">100%</p>
              <p className="text-sm text-zinc-500 font-medium mt-1">Air-gapped architecture</p>
            </div>
          </div>
        </div>

        {/* Detail Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl bg-[#0B0F19] border border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <h3 className="text-xl font-bold text-white mb-4">Unified Fiduciary Reporting</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Consolidate cross-border assets into a single cryptographic ledger. Generate on-demand tax reporting, unrealized PnL snapshots, and risk-weighted asset (RWA) distributions instantly.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Real-time mark-to-market valuations</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Historical performance attribution modeling</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Institutional sub-account segregation</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-[#0B0F19] border border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <h3 className="text-xl font-bold text-white mb-4">Algorithmic Risk Management</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Our automated liquidation engines and margin risk frameworks calculate portfolio stress tests in real-time, protecting capital against extreme black-swan market volatility events.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Live portfolio margin utilization</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Cross-asset collateralization</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Automated VaR (Value at Risk) alerting</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    );
  }

  const totalEquity = portfolio?.totalEquity || 100000;
  const cashBalance = portfolio?.simulatedCashBalance || 65000;
  const invested = portfolio?.investedBalance || 35000;
  const unrealizedPnl = portfolio?.unrealizedPnl || 0;
  const unrealizedPnlPercent = portfolio?.unrealizedPnlPercent || 0;

  // Calculate allocation breakdown
  const stockValue = positions
    .filter((p) => p.assetType === 'STOCK')
    .reduce((sum, p) => sum + p.marketValue, 0);
  const cryptoValue = positions
    .filter((p) => p.assetType === 'CRYPTO')
    .reduce((sum, p) => sum + p.marketValue, 0);
  const etfValue = positions
    .filter((p) => p.assetType === 'ETF')
    .reduce((sum, p) => sum + p.marketValue, 0);

  const stockPct = totalEquity > 0 ? ((stockValue / totalEquity) * 100).toFixed(1) : '0';
  const cryptoPct = totalEquity > 0 ? ((cryptoValue / totalEquity) * 100).toFixed(1) : '0';
  const etfPct = totalEquity > 0 ? ((etfValue / totalEquity) * 100).toFixed(1) : '0';
  const cashPct = totalEquity > 0 ? ((cashBalance / totalEquity) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0B0F19] border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Portfolio Holdings & Positions
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5">
            Monitor asset weighting, unrealized returns, and execution costs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onOpenTrade()}
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Trade</span>
          </button>
        </div>
      </div>

      {/* Allocation Breakdown Bar */}
      <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-xs">
          <span className="font-bold text-white flex items-center space-x-2">
            <PieIcon className="w-4 h-4 text-indigo-400" />
            <span>Capital Allocation</span>
          </span>
          <span className="text-zinc-400 font-mono text-[11px]">
            Total Balance: ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="h-4 w-full bg-zinc-900 rounded-full overflow-hidden flex border border-zinc-800">
          <div
            style={{ width: `${cashPct}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Cash: ${cashPct}%`}
          />
          <div
            style={{ width: `${stockPct}%` }}
            className="bg-indigo-500 transition-all duration-500"
            title={`Stocks: ${stockPct}%`}
          />
          <div
            style={{ width: `${cryptoPct}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Crypto: ${cryptoPct}%`}
          />
          <div
            style={{ width: `${etfPct}%` }}
            className="bg-cyan-500 transition-all duration-500"
            title={`ETFs: ${etfPct}%`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <div className="text-zinc-400 text-[10px]">Settled Cash</div>
              <div className="font-bold text-white">${cashBalance.toFixed(2)} ({cashPct}%)</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
            <div>
              <div className="text-zinc-400 text-[10px]">Stocks</div>
              <div className="font-bold text-white">${stockValue.toFixed(2)} ({stockPct}%)</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <div>
              <div className="text-zinc-400 text-[10px]">Crypto</div>
              <div className="font-bold text-white">${cryptoValue.toFixed(2)} ({cryptoPct}%)</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500 shrink-0" />
            <div>
              <div className="text-zinc-400 text-[10px]">ETFs</div>
              <div className="font-bold text-white">${etfValue.toFixed(2)} ({etfPct}%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Open Positions</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live updates linked to the market data feed
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {positions.length} active asset{positions.length === 1 ? '' : 's'}
          </span>
        </div>

        {positions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-zinc-400">Your portfolio is currently 100% in cash.</p>
            <p className="text-xs text-zinc-500 mt-1">
              Explore the markets table to execute orders.
            </p>
            <button
              onClick={() => onOpenTrade()}
              className="mt-4 px-4 py-2 bg-emerald-500 text-zinc-950 font-bold rounded-xl text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              Browse Instruments & Trade
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Instrument</th>
                  <th className="py-3 px-4 font-semibold text-right">Holdings</th>
                  <th className="py-3 px-4 font-semibold text-right">Avg Buy Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Current Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Market Value</th>
                  <th className="py-3 px-4 font-semibold text-right">Unrealized P&L</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {positions.map((pos) => {
                  const isGain = pos.unrealizedPnl >= 0;
                  const inst = instruments.find((i) => i.id === pos.instrumentId);

                  return (
                    <tr key={pos.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center space-x-2">
                          <div>
                            <div className="font-bold text-white font-mono flex items-center space-x-1.5">
                              <span>{pos.symbol}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-sans">
                                {pos.assetType}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-400">{pos.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-zinc-100">
                        {pos.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-right text-zinc-300">
                        ${pos.averagePrice.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white">
                        ${pos.currentPrice.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-zinc-100">
                        ${pos.marketValue.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className={isGain ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {isGain ? '+' : ''}${pos.unrealizedPnl.toFixed(2)}
                        </div>
                        <div className={`text-[10px] flex items-center justify-end ${isGain ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isGain ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                          {isGain ? '+' : ''}{pos.unrealizedPnlPercent.toFixed(2)}%
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onOpenTrade(inst)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Trade
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-[#0D121F] border border-amber-500/30 w-full max-w-sm rounded-2xl shadow-2xl p-5 text-zinc-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Reset Portfolio?</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              This action will liquidate all positions and reset your cash balance to the default <strong>$100,000.00 USD</strong>.
            </p>
            <div className="flex items-center justify-end space-x-2 mt-5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetPortfolio();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Callout Banner */}
      <RiskBanner onLearnMore={() => onNavigateTab('risk-disclosure')} />
    </div>
  );
};
