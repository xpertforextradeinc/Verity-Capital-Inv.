import React, { useState } from 'react';
import { 
  PieChart as PieChartIcon, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Wallet, 
  ArrowUpRight, 
  RefreshCw, 
  Layers, 
  Lock,
  ChevronRight,
  ExternalLink,
  Activity,
  DollarSign
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis 
} from 'recharts';
import { Position, Instrument, Portfolio } from '../../types.ts';

interface CryptoPortfolioCardProps {
  positions: Position[];
  instruments: Instrument[];
  portfolio: Portfolio | null;
  onOpenTrade: (instrument?: Instrument) => void;
  onOpenTransfers: () => void;
  onSelectSpec: (symbol: string) => void;
}

const ALLOCATION_COLORS = [
  '#F59E0B', // Bitcoin Gold
  '#6366F1', // Ethereum Indigo
  '#10B981', // Solana Emerald
  '#38BDF8', // Cyan
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#71717A', // Cash Neutral
];

export const CryptoPortfolioCard: React.FC<CryptoPortfolioCardProps> = ({
  positions,
  instruments,
  portfolio,
  onOpenTrade,
  onOpenTransfers,
  onSelectSpec,
}) => {
  const [activeMetricTab, setActiveMetricTab] = useState<'ALLOCATION' | 'PERFORMANCE' | 'TREND'>('ALLOCATION');
  const [selectedAssetTimeframe, setSelectedAssetTimeframe] = useState<'24H' | '7D' | '30D'>('24H');

  const cashBalance = portfolio?.simulatedCashBalance || 0;
  const totalCryptoValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
  const totalAccountValue = totalCryptoValue + cashBalance;

  // Pie chart data preparation
  const allocationData = [
    ...positions.map((p, idx) => ({
      name: p.symbol,
      fullName: p.name,
      value: p.marketValue,
      percentage: totalAccountValue > 0 ? (p.marketValue / totalAccountValue) * 100 : 0,
      quantity: p.quantity,
      unrealizedPnl: p.unrealizedPnl,
      unrealizedPnlPercent: p.unrealizedPnlPercent,
      color: ALLOCATION_COLORS[idx % (ALLOCATION_COLORS.length - 1)],
      isCrypto: true,
      instrumentId: p.instrumentId
    })),
    ...(cashBalance > 0 ? [{
      name: 'USD Cash',
      fullName: 'US Dollar Cash (Clearing)',
      value: cashBalance,
      percentage: totalAccountValue > 0 ? (cashBalance / totalAccountValue) * 100 : 0,
      quantity: cashBalance,
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0,
      color: '#3F3F46',
      isCrypto: false,
      instrumentId: ''
    }] : [])
  ];

  // Simulated 24-hour balance trend trajectory based on current positions and hourly price movement
  const trendData = React.useMemo(() => {
    const hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', 'Now'];
    const multipliers = [0.978, 0.982, 0.975, 0.989, 0.994, 0.991, 1.008, 1.003, 1.0];
    
    return hours.map((hour, idx) => {
      const cryptoPortion = totalCryptoValue * multipliers[idx];
      const equity = cryptoPortion + cashBalance;
      return {
        time: hour,
        equity: Math.round(equity * 100) / 100,
        cryptoValue: Math.round(cryptoPortion * 100) / 100,
      };
    });
  }, [totalCryptoValue, cashBalance]);

  // Total 24h P&L Calculation
  const totalCryptoPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const cryptoWeight = totalAccountValue > 0 ? (totalCryptoValue / totalAccountValue) * 100 : 0;
  const isPnlPositive = totalCryptoPnl >= 0;

  return (
    <div id="crypto-portfolio-card" className="bg-[#0B0F19] border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title & Quick Action Rails */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Institutional Digital Asset Custody Allocation
              </h3>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Live Recharts
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Multi-Asset Cold Vault Holdings • Real-Time Mark-to-Market • NAV Breakdown
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            id="crypto-card-deposit-btn"
            onClick={onOpenTransfers}
            className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deposit Crypto</span>
          </button>
          <button
            type="button"
            id="crypto-card-trade-btn"
            onClick={() => onOpenTrade()}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Spot Execution</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 relative z-10">
        <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Total Crypto Under Custody</span>
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="my-1.5 font-mono text-2xl font-bold text-white tracking-tight">
            ${totalCryptoValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center space-x-1.5">
            <span className="font-mono text-amber-400 font-bold">{cryptoWeight.toFixed(1)}%</span>
            <span>of total account balance</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Total Unrealized Crypto P&L</span>
            {isPnlPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>
          <div className={`my-1.5 font-mono text-2xl font-bold tracking-tight ${isPnlPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPnlPositive ? '+' : ''}${totalCryptoPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400">
            <span>Marked against real-time spot feed</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Clearing Cash Liquidity</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="my-1.5 font-mono text-2xl font-bold text-white tracking-tight">
            ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400">
            <span>USD Fedwire settlement reserve</span>
          </div>
        </div>
      </div>

      {/* Interactive View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 relative z-10">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setActiveMetricTab('ALLOCATION')}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
              activeMetricTab === 'ALLOCATION'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            Asset Allocation Donut
          </button>
          <button
            type="button"
            onClick={() => setActiveMetricTab('TREND')}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
              activeMetricTab === 'TREND'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            24h Balance Trend Line
          </button>
        </div>

        <div className="text-[11px] font-mono text-zinc-500 hidden sm:block">
          Fidelity & BitGo Qualified Custody
        </div>
      </div>

      {/* Dynamic Visualizations Area */}
      <div className="relative z-10">
        {activeMetricTab === 'ALLOCATION' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Donut Chart Visual */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-2">
              <div className="h-56 w-full relative flex items-center justify-center">
                {allocationData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#090D16',
                            borderColor: '#27272A',
                            borderRadius: '12px',
                            color: '#F4F4F5',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                          }}
                          formatter={(value: any, name: any) => [
                            `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })} (${((Number(value) / totalAccountValue) * 100).toFixed(1)}%)`,
                            name,
                          ]}
                        />
                        <Pie
                          data={allocationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={92}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {allocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#0B0F19" strokeWidth={2} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Donut Center Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Holdings</span>
                      <span className="text-sm font-mono font-bold text-white">{positions.length} Cryptos</span>
                    </div>
                  </>
                ) : (
                  <div className="text-zinc-500 text-xs font-mono">No assets to display</div>
                )}
              </div>
            </div>

            {/* Holdings Table & Breakdown */}
            <div className="lg:col-span-7 space-y-2.5">
              <div className="text-xs font-semibold text-zinc-300 pb-1 flex items-center justify-between">
                <span>Holdings Distribution</span>
                <span className="text-[10px] text-zinc-500 font-mono">Weight / Value</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {allocationData.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-3 h-3 rounded-md shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <div className="font-bold text-white flex items-center space-x-1.5">
                          <span>{item.name}</span>
                          {item.isCrypto && (
                            <button
                              type="button"
                              onClick={() => onSelectSpec(item.name)}
                              className="text-[10px] text-amber-400/80 hover:text-amber-300 hover:underline cursor-pointer"
                            >
                              (Specs)
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-sans">{item.fullName}</div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="font-bold text-zinc-100">
                        ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-zinc-400 flex items-center justify-end space-x-2">
                        <span>{item.percentage.toFixed(1)}%</span>
                        {item.isCrypto && (
                          <span className={item.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {item.unrealizedPnl >= 0 ? '+' : ''}{item.unrealizedPnlPercent.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* 24h Trend Chart */
          <div className="space-y-2">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cryptoTrendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#52525B" fontSize={10} tickLine={false} />
                  <YAxis
                    domain={['auto', 'auto']}
                    stroke="#52525B"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090D16',
                      borderColor: '#27272A',
                      borderRadius: '12px',
                      color: '#F4F4F5',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Balance']}
                  />
                  <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#cryptoTrendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono px-2">
              <span>24h Intraday Mark-to-Market Valuation</span>
              <span className="text-emerald-400">100% Fully Backed 1:1 Reserves</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Assurance Banner */}
      <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-400 relative z-10">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Assets secured with air-gapped multi-sig vaults (Fidelity Digital Assets / BitGo Trust).
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenTransfers}
          className="text-amber-400 hover:underline font-semibold flex items-center space-x-1 shrink-0 cursor-pointer"
        >
          <span>View Custody Network Addresses</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
