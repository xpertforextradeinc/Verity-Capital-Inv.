import React, { useState } from 'react';
import {
  Play,
  ArrowRight,
  ShieldCheck,
  Activity,
  Server,
  Database,
  Lock,
  Check,
  ChevronRight
} from 'lucide-react';
import { Instrument } from '../../types.ts';
import heroChartImage from '../../assets/images/crypto_3d_chart_hero_1788543287582.jpg';
import testimonialPoster from '../../assets/images/testimonial_video_poster_1788543306138.jpg';

interface LandingPageProps {
  instruments: Instrument[];
  onOpenTrade: (instrument?: Instrument) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onSelectTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  instruments,
  onOpenTrade,
  onOpenAuth,
  onSelectTab,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isUsResident, setIsUsResident] = useState(false);

  const btcInstrument = instruments.find(i => i.symbol === 'BTC/USD');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUsResident) return;
    // Route to actual auth modal for secure flow, could pass params if integrated
    onOpenAuth('register');
  };

  return (
    <div className="font-sans text-zinc-100 bg-black min-h-screen selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-32 overflow-hidden border-b border-zinc-900">
        {/* Abstract Background Element */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
          <img 
            src={heroChartImage} 
            alt="3D Order Book Mesh" 
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            The Institutional-Grade <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
              Bitcoin Trading Arena
            </span>
          </h1>

          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-300">
              Built for US Traders. Engineered for Absolute Precision.
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
              Settle trades instantly on America’s premier hyper-liquid Bitcoin exchange. Enjoy deep liquidity, sub-millisecond execution times, and unmatched cryptographic custody infrastructure.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-none bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center"
            >
              <span>Start Trading Now</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <button
              onClick={() => onSelectTab('markets')}
              className="w-full sm:w-auto px-8 py-4 rounded-none bg-transparent hover:bg-zinc-900 text-white border border-zinc-700 font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center"
            >
              <span>View Live 3D Order Book</span>
              <Activity className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* LIVE DATA MATRIX (THE 3D ENGINE) */}
      <section className="py-20 border-b border-zinc-900 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Live Data Matrix (The 3D Engine)
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 3D Widget Placeholder */}
            <div className="lg:col-span-2 relative rounded-xl border border-zinc-800 bg-black overflow-hidden h-[400px] flex items-center justify-center group">
              <img 
                src={heroChartImage} 
                alt="Live 3D Depth Chart" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 rounded-full border border-amber-500/30 flex items-center justify-center mx-auto mb-4 bg-black/50 backdrop-blur-md">
                  <Activity className="w-6 h-6 text-amber-500 animate-pulse" />
                </div>
                <p className="text-zinc-300 font-mono text-xs uppercase tracking-widest">Interactive 3D Candlestick Engine Active</p>
                <p className="text-zinc-600 font-mono text-[10px] mt-1">Mapping real-time BTC/USD volume clusters</p>
              </div>
            </div>

            {/* Metrics Matrix */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="p-6 border border-zinc-800 bg-zinc-950/50 rounded-xl">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">BTC / USD Live</p>
                <p className="text-3xl font-bold font-mono text-white flex items-center">
                  ${btcInstrument ? btcInstrument.price.toLocaleString(undefined, {minimumFractionDigits: 2}) : '64,285.50'}
                  <span className="text-emerald-400 text-sm ml-3 bg-emerald-400/10 px-2 py-0.5 rounded">
                    {btcInstrument && btcInstrument.changePercent > 0 ? '+' : ''}
                    {btcInstrument ? btcInstrument.changePercent.toFixed(2) : '+3.42'}%
                  </span>
                </p>
              </div>
              
              <div className="p-6 border border-zinc-800 bg-zinc-950/50 rounded-xl">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">24h Institutional Volume</p>
                <p className="text-2xl font-bold font-mono text-white">$1.42B</p>
              </div>

              <div className="p-6 border border-zinc-800 bg-zinc-950/50 rounded-xl">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Average Execution Latency</p>
                <p className="text-2xl font-bold font-mono text-white">0.8ms</p>
              </div>

              <div className="p-6 border border-zinc-800 bg-zinc-950/50 rounded-xl">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">System Uptime</p>
                <p className="text-2xl font-bold font-mono text-emerald-400 flex items-center">
                  99.99% <Server className="w-4 h-4 ml-2" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST & SOCIAL PROOF */}
      <section className="py-20 border-b border-zinc-900 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest flex items-center mb-12">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Trust & Social Proof (Video Testimonial Engine)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="border border-zinc-800 bg-[#0A0A0A] rounded-xl overflow-hidden group">
              <div className="relative h-64 overflow-hidden bg-black">
                <img src={testimonialPoster} alt="Marcus V." className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-black/60 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-amber-500 group-hover:text-black transition-colors cursor-pointer">
                    <Play className="w-6 h-6 ml-1" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-white font-mono flex items-center">
                  <Check className="w-3 h-3 text-emerald-400 mr-1" />
                  Verified institutional Video Review
                </div>
              </div>
              <div className="p-8 space-y-6">
                <h4 className="text-xl font-bold text-white">"The liquidity depth here is unrivaled."</h4>
                <p className="text-zinc-400 leading-relaxed text-sm">
                  "Switching from our legacy platform saved our fund thousands in slippage. The real-time 3D volume profile maps let us pinpoint market turnarounds with incredible accuracy."
                </p>
                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-amber-500 font-bold text-sm">— Marcus V.</p>
                  <p className="text-zinc-500 text-xs mt-1">Managing Director at Apex Crypto Holdings (New York, NY)</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="border border-zinc-800 bg-[#0A0A0A] rounded-xl overflow-hidden group">
              <div className="relative h-64 overflow-hidden bg-black">
                <img src={testimonialPoster} alt="Sarah T." className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" style={{ filter: 'hue-rotate(15deg) contrast(1.1)' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-black/60 border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-amber-500 group-hover:text-black transition-colors cursor-pointer">
                    <Play className="w-6 h-6 ml-1" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-white font-mono flex items-center">
                  <Check className="w-3 h-3 text-emerald-400 mr-1" />
                  Verified User Video Review
                </div>
              </div>
              <div className="p-8 space-y-6">
                <h4 className="text-xl font-bold text-white">"Compliant, fast, and remarkably robust."</h4>
                <p className="text-zinc-400 leading-relaxed text-sm">
                  "As a professional US-based derivatives day trader, execution security is everything. The registration was highly compliant, and the clean dashboard interface keeps me locked into the price action."
                </p>
                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-amber-500 font-bold text-sm">— Sarah T.</p>
                  <p className="text-zinc-500 text-xs mt-1">Professional Quantitative Trader (Austin, TX)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLIANT SIGNUP GATEWAY */}
      <section className="py-24 bg-[#050505]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest flex items-center justify-center">
              <Lock className="w-4 h-4 mr-2" />
              Compliant Signup Gateway
            </h3>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Open Your Institutional Account In Under 3 Minutes.
            </h2>
            <p className="text-zinc-400">
              Fully compliant with US regulatory guidelines. Safely secure your digital trading identity.
            </p>
          </div>

          <form onSubmit={handleSignup} className="bg-black border border-zinc-800 p-8 sm:p-10 rounded-xl text-left space-y-6 shadow-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Full Legal Name</label>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-none px-4 py-3 text-white outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Corporate / Personal Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-none px-4 py-3 text-white outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Secure Strong Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-none px-4 py-3 text-white outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <label className="flex items-start space-x-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input 
                  type="checkbox" 
                  required
                  checked={isUsResident}
                  onChange={(e) => setIsUsResident(e.target.checked)}
                  className="peer appearance-none w-5 h-5 border border-zinc-700 bg-[#0A0A0A] checked:bg-amber-500 checked:border-amber-500 transition-colors"
                />
                <Check className="w-3.5 h-3.5 text-black absolute opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
              </div>
              <span className="text-xs text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                I certify that I am a US resident, at least 18 years of age, and agree to the <button type="button" onClick={() => onSelectTab('terms')} className="text-amber-500 hover:underline">Platform Terms of Service</button> and <button type="button" onClick={() => onSelectTab('privacy')} className="text-amber-500 hover:underline">Privacy Framework</button>.
              </span>
            </label>

            <button
              type="submit"
              disabled={!isUsResident || !email || !password || !fullName}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <span>Secure Instant Access</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </form>
        </div>
      </section>

      {/* COMPLIANCE FOOTER */}
      <footer className="bg-black border-t border-zinc-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Compliance Footer
            </h3>
            <h2 className="text-xl font-bold text-white mt-2">
              Legal Transparency & Regulatory Declarations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-4">
              <h4 className="text-amber-500 font-bold text-sm uppercase tracking-wider">Privacy Policy Framework</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your data infrastructure is completely siloed and encrypted using AES-256 bank-grade security protocols. In accordance with US financial privacy regulations and federal guidelines, we strictly maintain a zero-monetization policy on client trading habits and personal identifiable information (PII). Advanced multi-factor biometrics protect every single account layer.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-amber-500 font-bold text-sm uppercase tracking-wider">Risk Disclosure Notice</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Digital asset trading involves substantial structural volatility and financial risk. Digital assets are not covered by FDIC or SIPC protections. Past performance metrics do not guarantee future profitability. Please ensure you fully understand market liquidity risks prior to allocating capital.
              </p>
            </div>
          </div>
          
        </div>
      </footer>
    </div>
  );
};
