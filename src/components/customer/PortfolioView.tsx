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
  ShieldCheck
} from 'lucide-react';
import { Portfolio, Position, Instrument } from '../../types.ts';
import { RiskBanner } from '../common/RiskBanner.tsx';

interface PortfolioViewProps {
  portfolio: Portfolio | null;
  positions: Position[];
  instruments: Instrument[];
  onOpenTrade: (instrument?: any) => void;
  onResetPortfolio?: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenCustody?: () => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  portfolio,
  positions,
  instruments,
  onOpenTrade,
  onResetPortfolio,
  onNavigateTab,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
              Paper Portfolio
            </span>
            <span className="text-xs text-zinc-400 font-mono">Real-time valuation</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Simulated Holdings & Positions
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monitor asset weighting, unrealized returns, and simulated execution costs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onOpenTrade()}
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Simulate Trade</span>
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-amber-400 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo ($100k)</span>
          </button>
        </div>
      </div>

      {/* Allocation Breakdown Bar */}
      <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-xs">
          <span className="font-bold text-white flex items-center space-x-2">
            <PieIcon className="w-4 h-4 text-indigo-400" />
            <span>Simulated Capital Allocation</span>
          </span>
          <span className="text-zinc-400 font-mono text-[11px]">
            Total NAV: ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
              <div className="text-zinc-400 text-[10px]">Simulated Cash</div>
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
            <h3 className="text-sm font-bold text-white">Open Paper Positions</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live updates linked to simulated market tick stream
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {positions.length} active asset{positions.length === 1 ? '' : 's'}
          </span>
        </div>

        {positions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-zinc-400">Your simulated portfolio is currently 100% in cash.</p>
            <p className="text-xs text-zinc-500 mt-1">
              Explore the markets table to execute virtual buy orders.
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
              <h3 className="text-base font-bold text-white">Reset Simulated Portfolio?</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              This action will liquidate all virtual positions and reset your simulated cash balance to the default <strong>$100,000.00 USD</strong>.
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
