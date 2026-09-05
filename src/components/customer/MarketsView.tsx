import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Bookmark,
  Sparkles,
  BarChart2,
  Clock,
  Layers,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Instrument, AssetType } from '../../types.ts';

interface MarketsViewProps {
  instruments: Instrument[];
  selectedInstrument: Instrument | null;
  onSelectInstrument: (inst: Instrument) => void;
  onOpenTrade: (inst: Instrument) => void;
  onToggleWatchlist?: (instrumentId: string) => void;
  onNavigateAiInsight?: (inst: Instrument) => void;
  isWatchlisted?: (instrumentId: string) => boolean;
}

export const MarketsView: React.FC<MarketsViewProps> = ({
  instruments,
  selectedInstrument,
  onSelectInstrument,
  onOpenTrade,
  onToggleWatchlist,
  onNavigateAiInsight,
  isWatchlisted,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');

  const active = selectedInstrument || instruments[0];

  // Filter instruments
  const filteredInstruments = useMemo(() => {
    return instruments.filter((inst) => {
      const matchesType = selectedType === 'ALL' || inst.assetType === selectedType;
      const matchesQuery =
        inst.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesQuery;
    });
  }, [instruments, selectedType, searchQuery]);

  // Generate synthetic order book for simulated depth view
  const orderBook = useMemo(() => {
    if (!active) return { bids: [], asks: [] };
    const p = active.price;
    const spread = p * 0.0008;
    const bids = [
      { price: p - spread * 1, size: Math.floor(Math.random() * 400 + 100) },
      { price: p - spread * 2, size: Math.floor(Math.random() * 600 + 200) },
      { price: p - spread * 3, size: Math.floor(Math.random() * 900 + 300) },
      { price: p - spread * 4, size: Math.floor(Math.random() * 1200 + 400) },
    ];
    const asks = [
      { price: p + spread * 1, size: Math.floor(Math.random() * 350 + 100) },
      { price: p + spread * 2, size: Math.floor(Math.random() * 550 + 200) },
      { price: p + spread * 3, size: Math.floor(Math.random() * 850 + 300) },
      { price: p + spread * 4, size: Math.floor(Math.random() * 1100 + 400) },
    ];
    return { bids, asks };
  }, [active?.price]);

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Market Instruments</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time simulated pricing across stocks, crypto, ETFs, and foreign exchange
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search symbol or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 w-48 sm:w-60"
            />
          </div>

          {/* Asset Category Pills */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
            {['ALL', 'STOCK', 'CRYPTO', 'ETF', 'FOREX'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedType === type
                    ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Terminal View: 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Instruments Browser List */}
        <div className="lg:col-span-5 bg-[#0B0F19] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[640px]">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Asset ({filteredInstruments.length})</span>
            <span>Price / 24h Movement</span>
          </div>

          <div className="overflow-y-auto divide-y divide-zinc-800/60 flex-1">
            {filteredInstruments.map((inst) => {
              const isSelected = active?.id === inst.id;
              const isPositive = inst.changePercent >= 0;

              return (
                <div
                  key={inst.id}
                  onClick={() => onSelectInstrument(inst)}
                  className={`p-3.5 flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected ? 'bg-zinc-800/80 border-l-2 border-emerald-400' : 'hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-xs text-zinc-200">
                      {inst.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5 font-mono">
                        <span className="font-bold text-sm text-white">{inst.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                          {inst.assetType}
                        </span>
                        {inst.status === 'HALTED' && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold">
                            HALTED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate max-w-[150px]">
                        {inst.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="font-bold text-sm text-white">
                      ${inst.price.toLocaleString('en-US', {
                        minimumFractionDigits: inst.assetType === 'FOREX' ? 4 : 2,
                        maximumFractionDigits: inst.assetType === 'FOREX' ? 4 : 2,
                      })}
                    </div>
                    <div
                      className={`text-xs font-semibold flex items-center justify-end ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 mr-0.5" />
                      )}
                      {isPositive ? '+' : ''}
                      {inst.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 cols): Selected Instrument Deep View */}
        {active && (
          <div className="lg:col-span-7 space-y-6">
            {/* Instrument Detail Card */}
            <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-5 shadow-xl">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono font-semibold">
                      {active.assetType}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">Simulated Quote</span>
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <h2 className="text-2xl font-bold font-mono text-white tracking-tight">
                      {active.symbol}
                    </h2>
                    <span className="text-sm text-zinc-400">{active.name}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {onToggleWatchlist && (
                    <button
                      onClick={() => onToggleWatchlist(active.id)}
                      className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      title="Add to Watchlist"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  )}
                  {onNavigateAiInsight && (
                    <button
                      onClick={() => onNavigateAiInsight(active)}
                      className="px-3 py-2 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/50 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>AI Insight</span>
                    </button>
                  )}
                  <button
                    onClick={() => onOpenTrade(active)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Simulate Trade</span>
                  </button>
                </div>
              </div>

              {/* Live Price & 24h Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-zinc-800 text-xs font-mono">
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase">Current Price</span>
                  <div className="text-lg font-bold text-white mt-0.5">
                    ${active.price.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase">24h Net Change</span>
                  <div
                    className={`text-lg font-bold mt-0.5 ${
                      active.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {active.changePercent >= 0 ? '+' : ''}${active.changeAmount.toFixed(2)} ({active.changePercent}%)
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase">24h Range</span>
                  <div className="text-xs font-semibold text-zinc-200 mt-1">
                    ${active.low24h.toFixed(2)} - ${active.high24h.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase">24h Volume</span>
                  <div className="text-xs font-semibold text-zinc-200 mt-1">
                    {active.volume24h.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Interactive Price Chart */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-zinc-300">Simulated Price Trajectory</span>
                  <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[11px] font-mono">
                    {(['1D', '1W', '1M', '1Y'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTimeframe(t)}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          timeframe === t ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={active.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={active.changePercent >= 0 ? '#10B981' : '#F43F5E'}
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor={active.changePercent >= 0 ? '#10B981' : '#F43F5E'}
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="timestamp" stroke="#52525B" fontSize={10} tickLine={false} />
                      <YAxis
                        domain={['auto', 'auto']}
                        stroke="#52525B"
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(val) => `$${Number(val).toFixed(1)}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#18181B',
                          borderColor: '#27272A',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                        }}
                        formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Simulated Price']}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={active.changePercent >= 0 ? '#10B981' : '#F43F5E'}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#chartGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Simulated Depth & Order Book Preview */}
            <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-xs font-bold text-white">
                <span className="flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Simulated Order Book Depth</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-400 font-normal">
                  Simulated Level 2 Book
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                {/* Bids (Buy Orders) */}
                <div>
                  <div className="text-zinc-500 text-[10px] pb-1 border-b border-zinc-800 flex justify-between font-sans">
                    <span>Bid Size</span>
                    <span>Bid Price (USD)</span>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    {orderBook.bids.map((b, i) => (
                      <div key={i} className="flex items-center justify-between text-zinc-200">
                        <span className="text-zinc-400">{b.size}</span>
                        <span className="font-bold text-emerald-400">${b.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Asks (Sell Orders) */}
                <div>
                  <div className="text-zinc-500 text-[10px] pb-1 border-b border-zinc-800 flex justify-between font-sans">
                    <span>Ask Price (USD)</span>
                    <span>Ask Size</span>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    {orderBook.asks.map((a, i) => (
                      <div key={i} className="flex items-center justify-between text-zinc-200">
                        <span className="font-bold text-rose-400">${a.price.toFixed(2)}</span>
                        <span className="text-zinc-400">{a.size}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
