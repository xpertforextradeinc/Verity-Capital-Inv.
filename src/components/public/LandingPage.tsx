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
  ['US', '“Verity Capital provides the fastest institutional Bitcoin settlement and cleanest execution we have experienced.”', 'Michael R. · Chicago'],
  ['FR', '“The liquidity depth and Bitcoin allocation options are exceptional. A true institutional-grade platform.”', 'Claire D. · Paris'],
  ['DE', '“Uncompromising digital asset security, transparent reporting, and reliable portfolio preservation.”', 'Jonas K. · Frankfurt'],
  ['UK', '“The onboarding was swift, discreet, and tailored for serious digital asset investors.”', 'Amelia S. · London'],
  ['NG', '“Our trusted institutional partner for Bitcoin wealth management and digital market liquidity across emerging markets.”', 'Tunde A. · Lagos'],
];

const services = [
  ['Institutional Bitcoin Allocations', 'Direct spot liquidity and structured digital asset strategies engineered for long-term wealth preservation and capital growth.', Network],
  ['Bank-Grade Cold Custody', 'Multi-jurisdictional air-gapped vaults with multi-sig security protocols ensuring total digital asset protection.', LockKeyhole],
  ['Institutional OTC Desk', 'High-volume block execution and confidential liquidity routing for Bitcoin and Ethereum positions.', Zap],
  ['Portfolio Intelligence', 'Real-time valuation metrics, NAV analytics, and audit-ready performance statements for digital portfolios.', BarChart3],
] as const;

export const LandingPage: React.FC<LandingPageProps> = ({ instruments, onOpenAuth, onSelectTab }) => (
  <div className="space-y-24 pb-16">
    <section className="relative isolate overflow-hidden border border-white/10 bg-[#070b1b] px-6 py-16 sm:px-10 lg:min-h-[650px] lg:px-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background-image:linear-gradient(rgba(56,189,248,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,.07)_1px,transparent_1px)] [background-size:54px_54px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="pointer-events-none absolute -right-32 top-0 -z-10 h-[620px] w-[620px] rounded-full bg-cyan-400/10 blur-[100px]" />
      <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" /> 
            Institutional Digital Asset Platform
          </div>
          <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
            Institutional Bitcoin & Digital Asset Investment Solutions
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-300">
            Accelerate portfolio growth and secure wealth preservation with bank-grade Bitcoin and Ethereum allocations, qualified cold-storage custody, and deep market liquidity.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row flex-wrap gap-3">
            <button onClick={() => onOpenAuth('register')} className="group w-full sm:w-auto justify-center flex items-center gap-3 bg-cyan-300 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200">
              Start Investing <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={() => onOpenAuth('login')} className="w-full sm:w-auto justify-center border border-white/15 px-5 py-3.5 text-sm font-semibold text-white transition hover:border-cyan-300/60 hover:bg-white/5">
              Login your account
            </button>
          </div>
          <p className="mt-5 max-w-lg text-[11px] leading-5 text-zinc-500">
            Trusted by family offices, institutional allocators, and sophisticated investors seeking structured cryptocurrency exposure.
          </p>
        </div>
        <div className="relative min-h-[370px] overflow-hidden rounded-xl border border-cyan-300/15 bg-[#050816] p-0 shadow-[0_0_80px_rgba(34,211,238,.08)] sm:min-h-[470px]">
          <div className="pointer-events-none absolute inset-0 z-0 [background-image:linear-gradient(rgba(34,211,238,.09)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.09)_1px,transparent_1px)] [background-size:42px_42px]" />
          <BitcoinModelViewer className="absolute inset-0 z-10 h-full w-full opacity-90" autoRotate={true} />
          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-[#050816] via-[#050816]/20 to-transparent" />
          <div className="pointer-events-none relative z-30 flex items-center justify-between p-5 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            <span>Verity Capital / Bitcoin Markets</span>
            <span className="text-emerald-300">Live Feeds</span>
          </div>
          <div className="pointer-events-none absolute bottom-6 left-6 right-6 z-30 grid grid-cols-3 gap-3">
            {[['BTC/USD', '$79,663.11'], ['ETH/USD', '$2,487.20'], ['Latency', '<250ms']].map(([label, value]) => (
              <div key={label} className="border border-white/10 bg-slate-950/75 p-3 backdrop-blur">
                <p className="text-[9px] uppercase tracking-widest text-zinc-500">{label}</p>
                <p className="mt-2 font-mono text-sm text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section id="features" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {services.map(([title, description, Icon]) => (
        <div key={title} className="group border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-cyan-300/[0.06] hover:shadow-[0_20px_50px_rgba(34,211,238,.08)]">
          <Icon className="h-6 w-6 text-cyan-300" />
          <h2 className="mt-6 text-lg font-semibold text-white">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
        </div>
      ))}
    </section>

    <section id="how-it-works" className="mt-16 sm:mt-24">
      <div className="mb-10 text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">Streamlined Process</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">How It Works</h2>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="border border-white/10 bg-white/[0.03] overflow-hidden group rounded-lg">
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img src={OrbImage} alt="Step 1: Open Account" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="p-6">
            <div className="mb-3 text-[10px] font-mono text-cyan-300">01 / ONBOARDING</div>
            <h3 className="text-lg font-semibold text-white">Open Your Investor Account</h3>
            <p className="mt-2 text-sm text-zinc-400">Complete streamlined verification tailored for private investors and institutional funds with bank-grade privacy controls.</p>
          </div>
        </div>
        
        <div className="border border-white/10 bg-white/[0.03] overflow-hidden group rounded-lg">
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img src={IceImage} alt="Step 2: Secure Custody" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="p-6">
            <div className="mb-3 text-[10px] font-mono text-emerald-300">02 / CAPITAL ALLOCATION</div>
            <h3 className="text-lg font-semibold text-white">Deploy Capital Securely</h3>
            <p className="mt-2 text-sm text-zinc-400">Deposit fiat or digital assets directly into insured, air-gapped institutional cold storage vaults with zero counterparty compromise.</p>
          </div>
        </div>
        
        <div className="border border-white/10 bg-white/[0.03] overflow-hidden group rounded-lg">
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img src={NeonImage} alt="Step 3: Portfolio Growth" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="p-6">
            <div className="mb-3 text-[10px] font-mono text-indigo-400">03 / WEALTH PRESERVATION</div>
            <h3 className="text-lg font-semibold text-white">Accelerate Growth</h3>
            <p className="mt-2 text-sm text-zinc-400">Select structured investment plans, capture digital asset market opportunities, and monitor portfolio performance with institutional precision.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="markets" className="grid items-center gap-10 lg:grid-cols-[.8fr_1.2fr]">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">Live Market Opportunities</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Institutional liquidity depth and market intelligence.</h2>
        <p className="mt-4 max-w-lg text-sm leading-7 text-zinc-400">
          Observe live Bitcoin (BTC) and Ethereum (ETH) liquidity metrics, order book depth, institutional spreads, and execution pricing via our professional terminal.
        </p>
        <button onClick={() => onSelectTab('markets')} className="mt-6 flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
          Explore Markets <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="border border-white/10 bg-[#080d1d] p-5 rounded-lg">
        <div className="mb-4 flex items-center justify-between text-xs">
          <span className="font-mono text-zinc-400">LIVE INSTITUTIONAL INSTRUMENTS</span>
          <span className="text-emerald-300">Market Active</span>
        </div>
        <div className="space-y-2">
          {instruments.slice(0, 4).map((instrument) => (
            <div key={instrument.symbol} className="grid grid-cols-3 items-center border-t border-white/5 py-3 text-sm">
              <span className="font-mono text-white font-medium">{instrument.symbol}</span>
              <span className="text-right font-mono text-zinc-200">${instrument.price.toLocaleString()}</span>
              <span className={`text-right font-mono ${instrument.changePercent >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {instrument.changePercent >= 0 ? '+' : ''}{instrument.changePercent.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section id="testimonials">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">Investor Perspective</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Built for institutional conviction.</h2>
        </div>
        <Globe2 className="hidden h-10 w-10 text-cyan-300/50 sm:block" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {testimonials.map(([region, quote, author]) => (
          <figure key={region} className="border border-white/10 bg-white/[0.03] p-5 rounded-lg">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
              <span>{region}</span>
              <span>INVESTOR INSIGHT</span>
            </div>
            <blockquote className="mt-8 min-h-24 text-sm leading-6 text-zinc-200">{quote}</blockquote>
            <figcaption className="mt-6 border-t border-white/10 pt-4 text-xs text-zinc-500">{author}</figcaption>
          </figure>
        ))}
      </div>
    </section>

    <section id="coverage" className="border border-white/10 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-300/5 p-8 sm:p-12 rounded-lg">
      <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">Global Liquidity</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">One operating standard across major financial hubs.</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            Verity Capital supports qualified investors across key global economic corridors with coordinated settlement, transparent reporting, and institutional execution.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {['US & Americas', 'European Union', 'United Kingdom', 'Middle East', 'Africa Hub', 'Asia-Pacific'].map((region) => (
            <div key={region} className="flex items-center gap-3 border border-white/10 bg-slate-950/40 px-4 py-4 text-sm font-medium text-white rounded">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              {region}
            </div>
          ))}
        </div>
      </div>
    </section>

    <section id="about" className="flex flex-col items-start justify-between gap-5 border-t border-white/10 pt-10 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-2xl font-semibold text-white">Ready for institutional digital asset investing?</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Partner with Verity Capital to access premium Bitcoin investment plans and institutional digital wealth solutions.
        </p>
      </div>
      <button onClick={() => onOpenAuth('register')} className="flex items-center gap-2 bg-emerald-400 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-emerald-300 transition-colors rounded">
        Start Investing <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  </div>
);
