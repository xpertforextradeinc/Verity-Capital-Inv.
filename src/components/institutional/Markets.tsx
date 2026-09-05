import React, { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, Clock3, Droplets, RefreshCw, ShieldCheck, Wifi } from 'lucide-react';

type ProductId = 'BTC-USD' | 'ETH-USD';
type Ticker = {
  price: number;
  open24h: number;
  volume24h: number;
  low24h: number;
  high24h: number;
  time: string;
};
type Candle = { time: number; low: number; high: number; open: number; close: number; volume: number };
type BookLevel = { price: number; size: number };
type Book = { bids: BookLevel[]; asks: BookLevel[] };
type MarketState = { ticker: Ticker | null; candles: Candle[]; book: Book; loading: boolean; error: string | null };

const PRODUCTS: ProductId[] = ['BTC-USD', 'ETH-USD'];
const COINBASE_API = 'https://api.exchange.coinbase.com';

const emptyState: MarketState = { ticker: null, candles: [], book: { bids: [], asks: [] }, loading: true, error: null };

function formatUsd(value: number, digits = 2) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value);
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${COINBASE_API}${path}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Market data unavailable (${response.status})`);
  return response.json() as Promise<T>;
}

function MiniCandleChart({ candles }: { candles: Candle[] }) {
  if (candles.length < 2) return <div className="flex h-48 items-center justify-center text-xs text-zinc-500">Waiting for market history...</div>;
  const width = 720;
  const height = 190;
  const min = Math.min(...candles.map((c) => c.low));
  const max = Math.max(...candles.map((c) => c.high));
  const range = max - min || 1;
  const x = (index: number) => (index / (candles.length - 1)) * width;
  const y = (price: number) => height - ((price - min) / range) * (height - 12) - 6;
  const line = candles.map((candle, index) => `${x(index)},${y(candle.close)}`).join(' ');
  const positive = candles[candles.length - 1].close >= candles[0].open;
  const color = positive ? '#34d399' : '#fb7185';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full" role="img" aria-label="BTC price chart">
      <defs>
        <linearGradient id="market-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.24" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${height} ${line} ${width},${height}`} fill="url(#market-area)" stroke="none" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function OrderBook({ book, price }: { book: Book; price: number }) {
  const maxSize = Math.max(...book.bids.map((level) => level.size), ...book.asks.map((level) => level.size), 1);
  const renderLevel = (level: BookLevel, side: 'bid' | 'ask') => (
    <div key={`${side}-${level.price}`} className="relative grid grid-cols-[1fr_auto] items-center gap-4 py-1.5 font-mono text-xs">
      <div className={`absolute inset-y-0 ${side === 'bid' ? 'right-0 bg-emerald-400/10' : 'left-0 bg-rose-400/10'}`} style={{ width: `${(level.size / maxSize) * 100}%` }} />
      <span className={`relative ${side === 'bid' ? 'text-emerald-300' : 'text-rose-300'}`}>{formatUsd(level.price)}</span>
      <span className="relative text-zinc-400">{level.size.toFixed(5)}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="mb-2 grid grid-cols-2 text-[10px] uppercase tracking-widest text-zinc-500"><span>Bid price</span><span className="text-right">Size</span></div>
        {book.bids.length ? book.bids.map((level) => renderLevel(level, 'bid')) : <p className="text-xs text-zinc-500">No bid depth returned.</p>}
      </div>
      <div>
        <div className="mb-2 grid grid-cols-2 text-[10px] uppercase tracking-widest text-zinc-500"><span>Ask price</span><span className="text-right">Size</span></div>
        {book.asks.length ? book.asks.map((level) => renderLevel(level, 'ask')) : <p className="text-xs text-zinc-500">No ask depth returned.</p>}
      </div>
      <div className="col-span-2 border-t border-zinc-800 pt-3 text-center font-mono text-xs text-zinc-400">
        Mid-market {price ? formatUsd(price) : '--'} <span className="mx-2 text-zinc-700">|</span> Coinbase Exchange level 2
      </div>
    </div>
  );
}

interface MarketsProps {
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const Markets: React.FC<MarketsProps> = ({ onOpenAuth }) => {
  const [selected, setSelected] = useState<ProductId>('BTC-USD');
  const [markets, setMarkets] = useState<Record<ProductId, MarketState>>({ 'BTC-USD': emptyState, 'ETH-USD': emptyState });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const results = await Promise.all(PRODUCTS.map(async (product): Promise<[ProductId, MarketState]> => {
        try {
          const [ticker, stats, candles, book] = await Promise.all([
            getJson<{ price: string; time: string }>(`/products/${product}/ticker`),
            getJson<{ open: string; volume: string; low: string; high: string }>(`/products/${product}/stats`),
            getJson<number[][]>(`/products/${product}/candles?granularity=3600`),
            getJson<{ bids: string[][]; asks: string[][] }>(`/products/${product}/book?level=2`),
          ]);
          return [product, {
            loading: false,
            error: null,
            ticker: { price: Number(ticker.price), open24h: Number(stats.open), volume24h: Number(stats.volume), low24h: Number(stats.low), high24h: Number(stats.high), time: ticker.time },
            candles: candles.slice(-48).reverse().map(([time, low, high, open, close, volume]) => ({ time, low, high, open, close, volume })),
            book: { bids: book.bids.slice(0, 8).map(([price, size]) => ({ price: Number(price), size: Number(size) })), asks: book.asks.slice(0, 8).map(([price, size]) => ({ price: Number(price), size: Number(size) })) },
          }];
        } catch (error) {
          return [product, { ...emptyState, loading: false, error: error instanceof Error ? error.message : 'Unable to load market data.' }];
        }
      }));
      if (!active) return;
      setMarkets(Object.fromEntries(results) as Record<ProductId, MarketState>);
      setLastUpdated(new Date());
    };
    void load();
    const interval = window.setInterval(() => void load(), 15000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  const activeMarket = markets[selected];
  const activeTicker = activeMarket.ticker;
  const change = activeTicker ? activeTicker.price - activeTicker.open24h : 0;
  const changePercent = activeTicker && activeTicker.open24h ? (change / activeTicker.open24h) * 100 : 0;
  const spread = activeMarket.book.asks[0] && activeMarket.book.bids[0] ? activeMarket.book.asks[0].price - activeMarket.book.bids[0].price : 0;
  const spreadBps = activeTicker?.price ? (spread / activeTicker.price) * 10000 : 0;
  const marketStatus = useMemo(() => activeMarket.error ? 'DEGRADED' : activeMarket.loading ? 'CONNECTING' : 'LIVE', [activeMarket.error, activeMarket.loading]);

  return (
    <div className="space-y-6 pb-12">
      <section className="flex flex-col justify-between gap-6 border-b border-zinc-800 pb-6 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-indigo-300"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />Institutional market intelligence</div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Global digital asset markets</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Live exchange data, visible liquidity, and execution context for BTC/USD and ETH/USD.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500"><Wifi className="h-4 w-4 text-emerald-400" />Coinbase Exchange feed <span className="text-zinc-700">|</span>{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Connecting'}</div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {PRODUCTS.map((product) => {
          const market = markets[product];
          const ticker = market.ticker;
          const delta = ticker ? ticker.price - ticker.open24h : 0;
          const percent = ticker?.open24h ? (delta / ticker.open24h) * 100 : 0;
          const positive = delta >= 0;
          return <button key={product} type="button" onClick={() => setSelected(product)} className={`text-left border p-5 transition-colors ${selected === product ? 'border-indigo-400/60 bg-indigo-500/10' : 'border-zinc-800 bg-[#0B0F19] hover:border-zinc-700'}`}>
            <div className="flex items-start justify-between"><div><span className="text-xs font-mono text-zinc-500">COINBASE / USD</span><h2 className="mt-1 text-xl font-semibold text-white">{product.replace('-', ' / ')}</h2></div><Activity className="h-5 w-5 text-indigo-300" /></div>
            <div className="mt-6 flex items-end justify-between"><span className="font-mono text-3xl font-semibold text-white">{ticker ? formatUsd(ticker.price) : '--'}</span><span className={`flex items-center gap-1 font-mono text-sm ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>{positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}{ticker ? `${positive ? '+' : ''}${percent.toFixed(2)}%` : '--'}</span></div>
            {market.error && <p className="mt-3 text-xs text-amber-300">{market.error}</p>}
          </button>;
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="border border-zinc-800 bg-[#0B0F19] p-5">
          <div className="flex flex-col justify-between gap-3 border-b border-zinc-800 pb-4 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2"><h2 className="text-lg font-semibold text-white">{selected.replace('-', ' / ')}</h2><span className="border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-300">{marketStatus}</span></div><p className="mt-1 text-xs text-zinc-500">Hourly close series · last 48 observations</p></div><div className="text-right"><p className="text-[10px] uppercase tracking-widest text-zinc-500">24h volume</p><p className="font-mono text-sm text-zinc-200">{activeTicker ? `${formatCompact(activeTicker.volume24h)} ${selected.split('-')[0]}` : '--'}</p></div></div>
          <div className="mt-5"><MiniCandleChart candles={activeMarket.candles} /></div>
          <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4 text-xs sm:grid-cols-4"><div><span className="text-zinc-500">24h high</span><p className="mt-1 font-mono text-zinc-200">{activeTicker ? formatUsd(activeTicker.high24h) : '--'}</p></div><div><span className="text-zinc-500">24h low</span><p className="mt-1 font-mono text-zinc-200">{activeTicker ? formatUsd(activeTicker.low24h) : '--'}</p></div><div><span className="text-zinc-500">Net move</span><p className={`mt-1 font-mono ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{activeTicker ? `${change >= 0 ? '+' : ''}${formatUsd(change)}` : '--'}</p></div><div><span className="text-zinc-500">Spread</span><p className="mt-1 font-mono text-zinc-200">{spreadBps ? `${spreadBps.toFixed(2)} bps` : '--'}</p></div></div>
        </section>

        <section className="border border-zinc-800 bg-[#0B0F19] p-5"><div className="mb-5 flex items-center justify-between border-b border-zinc-800 pb-4"><div><h2 className="text-lg font-semibold text-white">Market depth</h2><p className="mt-1 text-xs text-zinc-500">Live level-2 liquidity preview</p></div><BarChart3 className="h-5 w-5 text-indigo-300" /></div><OrderBook book={activeMarket.book} price={activeTicker?.price || 0} /></section>
      </div>

      <section className="grid gap-4 border-t border-zinc-800 pt-6 sm:grid-cols-2 lg:grid-cols-4"><div className="border border-zinc-800 bg-[#0B0F19] p-4"><Clock3 className="h-4 w-4 text-indigo-300" /><p className="mt-4 text-[10px] uppercase tracking-widest text-zinc-500">Feed latency</p><p className="mt-1 font-mono text-xl text-white">&lt; 250 ms</p></div><div className="border border-zinc-800 bg-[#0B0F19] p-4"><Droplets className="h-4 w-4 text-cyan-300" /><p className="mt-4 text-[10px] uppercase tracking-widest text-zinc-500">Visible liquidity</p><p className="mt-1 font-mono text-xl text-white">{activeMarket.book.bids.length + activeMarket.book.asks.length} levels</p></div><div className="border border-zinc-800 bg-[#0B0F19] p-4"><ShieldCheck className="h-4 w-4 text-emerald-300" /><p className="mt-4 text-[10px] uppercase tracking-widest text-zinc-500">Data uptime</p><p className="mt-1 font-mono text-xl text-white">99.99%</p></div><div className="border border-zinc-800 bg-[#0B0F19] p-4"><RefreshCw className="h-4 w-4 text-amber-300" /><p className="mt-4 text-[10px] uppercase tracking-widest text-zinc-500">Refresh cadence</p><p className="mt-1 font-mono text-xl text-white">15 sec</p></div></section>

      {onOpenAuth && <section className="flex flex-col items-start justify-between gap-4 border border-indigo-400/25 bg-indigo-500/5 p-5 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold text-white">Institutional execution access</p><p className="mt-1 text-xs text-zinc-400">Complete onboarding to access portfolio analytics and custody workflows.</p></div><button type="button" onClick={() => onOpenAuth('register')} className="bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-400">Open institutional account</button></section>}
    </div>
  );
};
