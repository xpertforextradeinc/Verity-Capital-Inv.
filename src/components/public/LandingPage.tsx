import React from 'react';
import { ArrowRight, BarChart3, Globe2, LockKeyhole, Network, Zap } from 'lucide-react';
import { BitcoinModelViewer } from '../common/BitcoinModelViewer.tsx';
import OrbImage from '../../assets/images/bitcoin_orb_1788676652641.jpg';
import IceImage from '../../assets/images/bitcoin_ice_1788676669279.jpg';
import NeonImage from '../../assets/images/bitcoin_neon_1788676683129.jpg';

interface LandingPageProps {
  instruments: Array<{ symbol: string; price: number; changePercent: number }>;
  onOpenTrade: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onSelectTab: (tab: string) => void;
}

const testimonials = [
  ['US', '“Verity-Capital provides the fastest institutional Bitcoin settlement we have used.”', 'Michael R. · Chicago'],
  ['FR', '“Crypto execution quality is exceptional. It feels like a true prime brokerage.”', 'Claire D. · Paris'],
  ['DE', '“Reliable digital asset custody and transparent reporting for regulated firms.”', 'Jonas K. · Frankfurt'],
  ['UK', '“The Bitcoin onboarding process was smooth, measured, and professional.”', 'Amelia S. · London'],
  ['NG', '“A serious institutional cryptocurrency partner for African markets.”', 'Tunde A. · Lagos'],
];

const services = [
  ['Bitcoin Prime Brokerage', 'Deep liquidity and low-latency execution for large-scale Bitcoin and crypto investments.', Network],
  ['Crypto Custody', 'Secure multi-signature vaulting and cold storage with global compliance controls.', LockKeyhole],
  ['OTC Desk', 'High-volume cryptocurrency block trades with coordinated settlement workflows.', Zap],
  ['Portfolio Reporting', 'Institutional dashboards and audit-ready statements for digital asset portfolios.', BarChart3],
] as const;

export const LandingPage: React.FC<LandingPageProps> = ({ instruments, onOpenAuth, onSelectTab }) => (
  <div className="space-y-24 pb-16">
    <section className="relative isolate overflow-hidden border border-white/10 bg-[#070b1b] px-6 py-16 sm:px-10 lg:min-h-[650px] lg:px-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(rgba(56,189,248,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,.07)_1px,transparent_1px)] [background-size:54px_54px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="pointer-events-none absolute -right-32 top-0 -z-10 h-[620px] w-[620px] rounded-full bg-cyan-400/10 blur-[100px]" />
      <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" /> Institutional market access</div>
          <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">Institutional Bitcoin & Cryptocurrency Investment</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-400">Secure Bitcoin investment strategies, bank-grade crypto custody, and premium global market access.</p>
          <div className="mt-9 flex flex-wrap gap-3"><button onClick={() => onOpenAuth('register')} className="group flex items-center gap-3 bg-cyan-300 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200">Start Investing <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button><button onClick={() => onOpenAuth('login')} className="border border-white/15 px-5 py-3.5 text-sm font-semibold text-white transition hover:border-cyan-300/60 hover:bg-white/5">Client Login</button></div>
          <p className="mt-5 max-w-lg text-[11px] leading-5 text-zinc-500">Services are available to qualified institutional clients only. Onboarding is subject to KYC, AML, and regulatory review.</p>
        </div>
        <div className="relative min-h-[370px] overflow-hidden rounded-xl border border-cyan-300/15 bg-[#050816] p-0 shadow-[0_0_80px_rgba(34,211,238,.08)] sm:min-h-[470px]">
          <div className="pointer-events-none absolute inset-0 z-0 [background-image:linear-gradient(rgba(34,211,238,.09)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.09)_1px,transparent_1px)] [background-size:42px_42px]" />
          <BitcoinModelViewer className="absolute inset-0 z-10 h-full w-full opacity-90" autoRotate={true} />
          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-[#050816] via-[#050816]/20 to-transparent" />
          <div className="pointer-events-none relative z-30 flex items-center justify-between p-5 text-[10px] font-mono uppercase tracking-widest text-zinc-400"><span>VCX / Bitcoin Markets</span><span className="text-emerald-300">Live</span></div>
          <div className="pointer-events-none absolute bottom-6 left-6 right-6 z-30 grid grid-cols-3 gap-3">{[['BTC/USD', '$79,663.11'], ['ETH/USD', '$2,487.20'], ['Latency', '<250ms']].map(([label, value]) => <div key={label} className="border border-white/10 bg-slate-950/75 p-3 backdrop-blur"><p className="text-[9px] uppercase tracking-widest text-zinc-500">{label}</p><p className="mt-2 font-mono text-sm text-white">{value}</p></div>)}</div>
        </div>
      </div>
    </section>

    <section id="features" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{services.map(([title, description, Icon]) => <div key={title} className="group border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-300/[0.06] hover:shadow-[0_20px_50px_rgba(34,211,238,.08)]"><Icon className="h-6 w-6 text-cyan-300" /><h2 className="mt-6 text-lg font-semibold text-white">{title}</h2><p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p></div>)}</section>

    <section id="how-it-works" className="mt-16 sm:mt-24">
      <div className="mb-10 text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">Simplified Process</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">How it works</h2>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="border border-white/10 bg-white/[0.03] overflow-hidden group">
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img src={OrbImage} alt="Step 1: Open Account" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="p-6">
            <div className="mb-3 text-[10px] font-mono text-cyan-300">01 / ONBOARDING</div>
            <h3 className="text-lg font-semibold text-white">Open Account</h3>
            <p className="mt-2 text-sm text-zinc-400">Complete our secure, institutionally compliant KYC/AML process and get approved for trading.</p>
          </div>
        </div>
        
        <div className="border border-white/10 bg-white/[0.03] overflow-hidden group">
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img src={IceImage} alt="Step 2: Secure Funds" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="p-6">
            <div className="mb-3 text-[10px] font-mono text-emerald-300">02 / FUNDING</div>
            <h3 className="text-lg font-semibold text-white">Secure Custody</h3>
            <p className="mt-2 text-sm text-zinc-400">Transfer fiat or digital assets into our bank-grade cold storage facilities with zero counterparty risk.</p>
          </div>
        </div>
        
        <div className="border border-white/10 bg-white/[0.03] overflow-hidden group">
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img src={NeonImage} alt="Step 3: Trade" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="p-6">
            <div className="mb-3 text-[10px] font-mono text-indigo-400">03 / EXECUTION</div>
            <h3 className="text-lg font-semibold text-white">Execute Trades</h3>
            <p className="mt-2 text-sm text-zinc-400">Access deep liquidity pools and execute high-volume block trades with institutional precision.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="markets" className="grid items-center gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">Live market access</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">A clear view of liquidity before execution.</h2><p className="mt-4 max-w-lg text-sm leading-7 text-zinc-400">Observe live BTC and ETH market conditions, level-2 depth, spreads, and execution context through the institutional terminal.</p><button onClick={() => onSelectTab('markets')} className="mt-6 flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">Explore Markets <ArrowRight className="h-4 w-4" /></button></div><div className="border border-white/10 bg-[#080d1d] p-5"><div className="mb-4 flex items-center justify-between text-xs"><span className="font-mono text-zinc-400">LIVE INSTRUMENTS</span><span className="text-emerald-300">Market open</span></div><div className="space-y-2">{instruments.slice(0, 4).map((instrument) => <div key={instrument.symbol} className="grid grid-cols-3 items-center border-t border-white/5 py-3 text-sm"><span className="font-mono text-white">{instrument.symbol}</span><span className="text-right font-mono text-zinc-200">${instrument.price.toLocaleString()}</span><span className={`text-right font-mono ${instrument.changePercent >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{instrument.changePercent >= 0 ? '+' : ''}{instrument.changePercent.toFixed(2)}%</span></div>)}</div></div></section>

    <section id="testimonials"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">Global perspective</p><h2 className="mt-3 text-3xl font-semibold text-white">Built for institutional conviction.</h2></div><Globe2 className="hidden h-10 w-10 text-cyan-300/50 sm:block" /></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">{testimonials.map(([region, quote, author]) => <figure key={region} className="border border-white/10 bg-white/[0.03] p-5"><div className="flex items-center justify-between text-xs font-mono text-cyan-300"><span>{region}</span><span>CLIENT VOICE</span></div><blockquote className="mt-8 min-h-24 text-sm leading-6 text-zinc-200">{quote}</blockquote><figcaption className="mt-6 border-t border-white/10 pt-4 text-xs text-zinc-500">{author}</figcaption></figure>)}</div></section>

    <section id="coverage" className="border border-white/10 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-300/5 p-8 sm:p-12"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">Global coverage</p><h2 className="mt-3 text-3xl font-semibold text-white">One operating standard across major financial hubs.</h2><p className="mt-4 text-sm leading-7 text-zinc-400">Verity-Capital Inv supports institutional clients across major global financial hubs with coordinated coverage, reporting, and settlement operations.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{['US', 'EU', 'UK', 'Africa', 'Middle East', 'Asia'].map((region) => <div key={region} className="flex items-center gap-3 border border-white/10 bg-slate-950/40 px-4 py-4 text-sm font-medium text-white"><span className="h-2 w-2 rounded-full bg-cyan-300" />{region}</div>)}</div></div></section>

    <section id="about" className="flex flex-col items-start justify-between gap-5 border-t border-white/10 pt-10 sm:flex-row sm:items-center"><div><h2 className="text-2xl font-semibold text-white">Ready for institutional cryptocurrency access?</h2><p className="mt-2 text-sm text-zinc-400">Begin a regulated onboarding review to start investing in Bitcoin and digital assets.</p></div><button onClick={() => onOpenAuth('register')} className="flex items-center gap-2 bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-300">Start onboarding <ArrowRight className="h-4 w-4" /></button></section>
  </div>
);
