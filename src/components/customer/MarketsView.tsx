import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Server,
  Shield,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface MarketData {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  priceChange: string;
  volume: string;
  highPrice: string;
  lowPrice: string;
}

interface OrderBook {
  bids: [string, string][]; // [price, quantity]
  asks: [string, string][];
}

export const MarketsView: React.FC = () => {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
  const [selectedPair, setSelectedPair] = useState<string>('BTCUSDT');
  const [isLoading, setIsLoading] = useState(true);

  // Simulated chart data for the mini candlestick/area chart
  const [chartData, setChartData] = useState<{ time: string; price: number }[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchMarkets = async () => {
      try {
        const symbols = encodeURIComponent('["BTCUSDT","ETHUSDT","SOLUSDT"]');
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`);
        const data = await res.json();
        
        if (isMounted && Array.isArray(data)) {
          setMarkets(data);
          
          // Generate a synthetic micro-chart based on the current price for visual flair
          const activeMarket = data.find(m => m.symbol === selectedPair);
          if (activeMarket) {
            const basePrice = parseFloat(activeMarket.lastPrice);
            const history = Array.from({ length: 24 }).map((_, i) => {
              const variance = basePrice * 0.005;
              const val = basePrice + (Math.random() * variance * 2 - variance);
              return { time: `${i}:00`, price: val };
            });
            setChartData(history);
          }
        }

        const depthRes = await fetch(`https://api.binance.com/api/v3/depth?symbol=${selectedPair}&limit=10`);
        const depthData = await depthRes.json();
        
        if (isMounted && depthData.bids && depthData.asks) {
          setOrderBook({
            bids: depthData.bids.slice(0, 8),
            asks: depthData.asks.slice(0, 8),
          });
        }
      } catch (err) {
        console.error('Failed to fetch market data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMarkets();
    const interval = setInterval(fetchMarkets, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedPair]);

  const activeMarket = markets.find(m => m.symbol === selectedPair) || markets[0];
  const isPositive = activeMarket ? parseFloat(activeMarket.priceChangePercent) >= 0 : true;

  if (isLoading && !activeMarket) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Institutional Markets</h1>
          <p className="text-zinc-400 mt-1">Live digital asset liquidity and execution venues.</p>
        </div>
        
        {/* Institutional Metrics */}
        <div className="flex items-center gap-4 bg-[#090D14] border border-zinc-800/80 px-4 py-2.5 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-300">
            <Activity className="w-4 h-4 text-emerald-500" />
            <div>
              <div className="text-zinc-500 text-[9px] uppercase tracking-wider">Latency</div>
              <div className="font-bold">12ms</div>
            </div>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div className="flex items-center gap-2 text-zinc-300">
            <Server className="w-4 h-4 text-emerald-500" />
            <div>
              <div className="text-zinc-500 text-[9px] uppercase tracking-wider">Uptime</div>
              <div className="font-bold">99.999%</div>
            </div>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div className="flex items-center gap-2 text-zinc-300">
            <Shield className="w-4 h-4 text-emerald-500" />
            <div>
              <div className="text-zinc-500 text-[9px] uppercase tracking-wider">Custody</div>
              <div className="font-bold">SECURED</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Market List */}
        <div className="xl:col-span-4 bg-[#090D14] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[700px]">
          <div className="p-4 border-b border-zinc-800/80 flex justify-between text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            <span>Market</span>
            <span>Last / 24h</span>
          </div>
          <div className="overflow-y-auto divide-y divide-zinc-800/50 flex-1">
            {markets.map((m) => {
              const isSel = selectedPair === m.symbol;
              const pos = parseFloat(m.priceChangePercent) >= 0;
              const name = m.symbol.replace('USDT', '');
              
              return (
                <div
                  key={m.symbol}
                  onClick={() => setSelectedPair(m.symbol)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    isSel ? 'bg-indigo-600/10 border-l-2 border-indigo-500' : 'hover:bg-zinc-900/50 border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs">
                      {name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-white font-mono">{name}/USD</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Vol: {parseFloat(m.volume).toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-white">${parseFloat(m.lastPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className={`text-xs font-semibold flex items-center justify-end mt-0.5 ${pos ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pos ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                      {Math.abs(parseFloat(m.priceChangePercent)).toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Market Detail */}
        {activeMarket && (
          <div className="xl:col-span-8 space-y-6">
            <div className="bg-[#090D14] border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
              
              <div className="flex flex-wrap gap-6 border-b border-zinc-800/80 pb-6 mb-6">
                <div>
                  <h2 className="text-3xl font-bold font-mono text-white tracking-tight">
                    {activeMarket.symbol.replace('USDT', '')}/USD
                  </h2>
                  <div className="text-zinc-500 text-sm mt-1">Live Global Pricing</div>
                </div>
                <div className="ml-auto text-right font-mono">
                  <div className="text-3xl font-bold text-white">
                    ${parseFloat(activeMarket.lastPrice).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </div>
                  <div className={`text-sm font-semibold flex items-center justify-end mt-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? '+' : ''}{parseFloat(activeMarket.priceChangePercent).toFixed(2)}% 
                    <span className="text-zinc-500 ml-2">(${Math.abs(parseFloat(activeMarket.priceChange)).toLocaleString(undefined, {minimumFractionDigits: 2})})</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 font-mono">
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">24h High</div>
                  <div className="text-sm font-semibold text-zinc-200">${parseFloat(activeMarket.highPrice).toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">24h Low</div>
                  <div className="text-sm font-semibold text-zinc-200">${parseFloat(activeMarket.lowPrice).toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">24h Volume (Base)</div>
                  <div className="text-sm font-semibold text-zinc-200">{parseFloat(activeMarket.volume).toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Liquidity Score</div>
                  <div className="text-sm font-semibold text-emerald-400">Excellent</div>
                </div>
              </div>

              {/* Chart */}
              <div className="h-64 w-full bg-zinc-900/20 rounded-xl p-2 border border-zinc-800/50">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '8px' }}
                      itemStyle={{ color: '#E4E4E7', fontFamily: 'monospace' }}
                      formatter={(val: number) => [`$${val.toFixed(2)}`, 'Price']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke={isPositive ? '#10B981' : '#F43F5E'} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Book */}
            <div className="bg-[#090D14] border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 text-white font-semibold mb-6">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3>Live Order Book Depth</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-8 font-mono text-xs">
                {/* Bids */}
                <div>
                  <div className="flex justify-between text-zinc-500 uppercase tracking-wider pb-2 border-b border-zinc-800/80 mb-3">
                    <span>Size</span>
                    <span>Bid Price</span>
                  </div>
                  <div className="space-y-1.5">
                    {orderBook.bids.map(([price, qty], i) => (
                      <div key={i} className="flex justify-between relative group cursor-pointer hover:bg-zinc-800/50 rounded px-1 -mx-1">
                        <span className="text-zinc-400">{parseFloat(qty).toFixed(4)}</span>
                        <span className="text-emerald-400 font-semibold">${parseFloat(price).toFixed(2)}</span>
                        <div 
                          className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none"
                          style={{ width: `${Math.min(100, parseFloat(qty) * 10)}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Asks */}
                <div>
                  <div className="flex justify-between text-zinc-500 uppercase tracking-wider pb-2 border-b border-zinc-800/80 mb-3">
                    <span>Ask Price</span>
                    <span>Size</span>
                  </div>
                  <div className="space-y-1.5">
                    {orderBook.asks.map(([price, qty], i) => (
                      <div key={i} className="flex justify-between relative group cursor-pointer hover:bg-zinc-800/50 rounded px-1 -mx-1">
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-rose-500/10 pointer-events-none"
                          style={{ width: `${Math.min(100, parseFloat(qty) * 10)}%` }}
                        />
                        <span className="text-rose-400 font-semibold">${parseFloat(price).toFixed(2)}</span>
                        <span className="text-zinc-400">{parseFloat(qty).toFixed(4)}</span>
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

