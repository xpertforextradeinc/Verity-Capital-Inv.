import React from 'react';
import { ArrowLeft, UserPlus, ShieldCheck, TrendingUp, Layers, CheckCircle2, ChevronRight, BarChart4, Server, Cpu, Activity, Globe, LockKeyhole, Network, Workflow } from 'lucide-react';
import OrbImage from '../../assets/images/bitcoin_orb_1788676652641.jpg';
import IceImage from '../../assets/images/bitcoin_ice_1788676669279.jpg';
import NeonImage from '../../assets/images/bitcoin_neon_1788676683129.jpg';

interface HowItWorksProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onBack: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenAuth, onBack }) => {
  return (
    <div className="mx-auto max-w-[1400px] py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in zoom-in-95 duration-700 font-sans">
      
      {/* Header Section */}
      <div className="mb-24 mt-8">
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors mb-16">
          <ArrowLeft className="h-4 w-4" /> Return Home
        </button>
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full mb-8">
          <Workflow className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Platform Architecture</span>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[1.1] mb-8">
          The engine powering <br className="hidden md:block"/>institutional wealth.
        </h1>
        <p className="max-w-3xl text-base md:text-xl text-zinc-400 leading-relaxed font-medium">
          Verity-Capital Inv streamlines the complex processes of digital asset custody, market execution, and portfolio growth into a seamless, highly secure pipeline tailored for premium investors.
        </p>
      </div>

      {/* 1. Execution Model Metrics */}
      <div className="mb-32">
        <div className="flex items-center space-x-4 mb-10 border-b border-zinc-800 pb-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">Execution Engine Capabilities</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800/80">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Order Matching</p>
            <p className="text-4xl font-black text-white mb-1">&lt; 50ms</p>
            <p className="text-sm text-zinc-400">Sub-millisecond latency</p>
          </div>
          <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800/80">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Liquidity Providers</p>
            <p className="text-4xl font-black text-white mb-1">14+</p>
            <p className="text-sm text-zinc-400">Tier-1 global venues</p>
          </div>
          <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800/80">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Annual Volume</p>
            <p className="text-4xl font-black text-white mb-1">$4.2B</p>
            <p className="text-sm text-zinc-400">Cleared securely</p>
          </div>
          <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800/80">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">System Uptime</p>
            <p className="text-4xl font-black text-emerald-400 mb-1">99.99%</p>
            <p className="text-sm text-zinc-400">Enterprise reliability</p>
          </div>
        </div>
      </div>

      {/* 2. Technology Stack - Bento Grid */}
      <div className="mb-32">
        <div className="flex items-center space-x-4 mb-10 border-b border-zinc-800 pb-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">Institutional Technology Stack</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[240px]">
          {/* Main Block */}
          <div className="md:col-span-8 p-8 rounded-[2rem] bg-[#0A0E17] border border-cyan-900/30 relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-[60%] h-[150%] bg-cyan-500/5 blur-[80px] pointer-events-none group-hover:bg-cyan-500/10 transition-colors duration-1000" />
            <div className="relative z-10">
              <Server className="w-8 h-8 text-cyan-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">Distributed Matching Core</h3>
              <p className="text-zinc-400 leading-relaxed max-w-lg text-sm">
                Built from the ground up in Rust, our high-frequency matching engine processes millions of orders per second. Smart Order Routing (SOR) algorithms split large block trades across multiple liquidity pools to minimize slippage and eliminate market impact.
              </p>
            </div>
          </div>
          {/* Side Block */}
          <div className="md:col-span-4 p-8 rounded-[2rem] bg-zinc-900/30 border border-zinc-800/80 relative overflow-hidden group flex flex-col justify-between">
            <div className="relative z-10">
              <Network className="w-8 h-8 text-indigo-400 mb-6" />
              <h3 className="text-lg font-bold text-white mb-2">Connectivity Protocols</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Direct market access via FIX 4.4 APIs and low-latency WebSockets for algorithmic trading firms.
              </p>
            </div>
          </div>
          {/* Bottom Side 1 */}
          <div className="md:col-span-4 p-8 rounded-[2rem] bg-zinc-900/30 border border-zinc-800/80 relative overflow-hidden group flex flex-col justify-between">
            <div className="relative z-10">
              <LockKeyhole className="w-8 h-8 text-emerald-400 mb-6" />
              <h3 className="text-lg font-bold text-white mb-2">Hardware Enclaves</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Cryptographic keys are generated and stored inside FIPS 140-2 Level 3 certified Hardware Security Modules (HSMs).
              </p>
            </div>
          </div>
          {/* Bottom Main */}
          <div className="md:col-span-8 p-8 rounded-[2rem] bg-[#0A0E17] border border-amber-900/30 relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute bottom-0 left-0 w-[50%] h-[100%] bg-amber-500/5 blur-[80px] pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-1000" />
            <div className="relative z-10">
              <Activity className="w-8 h-8 text-amber-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">AI-Powered Surveillance</h3>
              <p className="text-zinc-400 leading-relaxed max-w-lg text-sm">
                Real-time machine learning models continuously monitor order flow to detect and prevent wash trading, spoofing, and market manipulation—ensuring a fair, regulated trading environment for all participants.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The Institutional Asset Flow */}
      <div className="mb-32">
        <div className="flex items-center space-x-4 mb-16 border-b border-zinc-800 pb-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">The Institutional Asset Lifecycle</h2>
        </div>
        
        <div className="space-y-24">
          {/* Flow 1 */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 md:order-1 relative group">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-[2rem] border border-zinc-800 relative shadow-2xl">
                <img src={OrbImage} alt="Onboarding" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b1b] via-transparent to-transparent opacity-90" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-zinc-900 border border-zinc-700 p-5 rounded-2xl shadow-xl flex items-center space-x-4 backdrop-blur-xl">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Compliance Status</p>
                  <p className="text-sm font-black text-white">Verified</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest border border-cyan-400/20 bg-cyan-400/10 inline-block px-3 py-1.5 rounded-full">Lifecycle Phase 01</div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-[1.2]">Secure Onboarding & Fiat Clearing</h2>
              <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                Establish your digital identity within our secure enclave. Following rigorous KYC/AML clearance, clients can rapidly deploy capital via seamless integration with global fiat rails.
              </p>
              <ul className="space-y-4 pt-4 border-t border-zinc-800/80">
                <li className="flex items-start space-x-3 text-sm text-zinc-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Automated identity document processing & jurisdictional clearance</span>
                </li>
                <li className="flex items-start space-x-3 text-sm text-zinc-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Direct Fedwire, SWIFT, and SEPA integrations for rapid settlement</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Flow 2 */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-6">
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-400/20 bg-indigo-400/10 inline-block px-3 py-1.5 rounded-full">Lifecycle Phase 02</div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-[1.2]">Capital Deployment & Execution</h2>
              <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                Deploy capital across highly liquid digital asset markets or enroll in structured investment plans. Our algorithmic routing ensures optimal execution with minimal slippage.
              </p>
              <ul className="space-y-4 pt-4 border-t border-zinc-800/80">
                <li className="flex items-start space-x-3 text-sm text-zinc-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Smart Order Routing across 14+ Tier-1 liquidity providers</span>
                </li>
                <li className="flex items-start space-x-3 text-sm text-zinc-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Proprietary structured vaults for risk-adjusted yield generation</span>
                </li>
              </ul>
            </div>
            <div className="relative group">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-[2rem] border border-zinc-800 relative shadow-2xl">
                <img src={NeonImage} alt="Execution" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b1b] via-transparent to-transparent opacity-90" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-zinc-900 border border-zinc-700 p-5 rounded-2xl shadow-xl flex items-center space-x-4 backdrop-blur-xl">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <BarChart4 className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Execution Latency</p>
                  <p className="text-sm font-black text-white">&lt; 50ms (SOR)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Flow 3 */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 md:order-1 relative group">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-[2rem] border border-zinc-800 relative shadow-2xl">
                <img src={IceImage} alt="Custody" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b1b] via-transparent to-transparent opacity-90" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-zinc-900 border border-zinc-700 p-5 rounded-2xl shadow-xl flex items-center space-x-4 backdrop-blur-xl">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Asset Custody</p>
                  <p className="text-sm font-black text-white">100% Air-gapped</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-400/20 bg-emerald-400/10 inline-block px-3 py-1.5 rounded-full">Lifecycle Phase 03</div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-[1.2]">Air-gapped Custody & Settlement</h2>
              <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                Following execution, assets are settled directly into institutional cold storage vaults. We utilize zero-trust cryptographic architectures to mathematically eliminate counterparty risk.
              </p>
              <ul className="space-y-4 pt-4 border-t border-zinc-800/80">
                <li className="flex items-start space-x-3 text-sm text-zinc-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Multi-signature cold storage vaults requiring consensus</span>
                </li>
                <li className="flex items-start space-x-3 text-sm text-zinc-300 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Real-time cryptographic proof-of-reserves available on-chain</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section (No Client Login) */}
      <div className="mt-32 mb-16 rounded-[2.5rem] bg-zinc-900/50 border border-zinc-800/80 p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute -top-[50%] -left-[10%] w-[50%] h-[150%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-[50%] -right-[10%] w-[50%] h-[150%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-[1.1]">
            Ready to step into the future of capital?
          </h2>
          <p className="text-zinc-400 text-sm md:text-lg leading-relaxed">
            Join thousands of private wealth clients and institutional funds already utilizing the Verity-Capital Inv infrastructure for their digital asset strategies.
          </p>
          <div className="pt-6 w-full sm:w-auto">
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-10 py-5 bg-white text-zinc-950 font-bold rounded-2xl hover:bg-zinc-200 transition-colors flex items-center justify-center space-x-3 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              <span>Open an Institutional Account</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
