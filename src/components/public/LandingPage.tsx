import React from 'react';
import { Shield, Zap, Globe, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  instruments: any[];
  onOpenTrade: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onSelectTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onSelectTab
}) => {
  return (
    <div className="space-y-24 pb-24 animate-in fade-in zoom-in-95 duration-700">
      
      {/* 3D Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#0A0E17] flex flex-col lg:flex-row items-center">
        <div className="flex-1 p-12 lg:p-20 z-10 space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <span>Institutional Grade Infrastructure</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
            Confident, Institutional-Grade <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Execution & Custody
            </span>
          </h1>
          
          <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
            Built for professional traders who demand precision, liquidity, and regulatory strength. Access global crypto markets with uncompromised compliance.
          </p>
          
          <div className="flex items-center space-x-4 pt-4">
            <button
              onClick={() => onOpenAuth('register')}
              className="bg-white hover:bg-zinc-200 text-black font-semibold px-8 py-4 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <span>Open Institutional Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="px-8 py-4 rounded-xl font-semibold text-white border border-zinc-700 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Client Login
            </button>
          </div>
        </div>

        {/* 3D Model Container */}
        <div className="w-full lg:w-1/2 h-[500px] lg:h-[700px] relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E17] to-transparent z-10 w-32 hidden lg:block"></div>
          {/* @ts-ignore */}
          <model-viewer
            src="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb"
            auto-rotate
            camera-controls
            disable-zoom
            style={{ width: '100%', height: '100%' }}
            class="w-full h-full outline-none"
            camera-orbit="45deg 75deg 2.5m"
            exposure="1"
          >
          </model-viewer>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800">
          <Shield className="w-10 h-10 text-emerald-400 mb-6" />
          <h3 className="text-xl font-bold text-white mb-3">Bank-Grade Custody</h3>
          <p className="text-zinc-400 leading-relaxed">
            Assets are secured in cold storage with multi-signature authorization and comprehensive insurance coverage.
          </p>
        </div>
        <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800">
          <Zap className="w-10 h-10 text-amber-400 mb-6" />
          <h3 className="text-xl font-bold text-white mb-3">Ultra-Low Latency</h3>
          <p className="text-zinc-400 leading-relaxed">
            Direct market access and smart order routing across premium global liquidity venues.
          </p>
        </div>
        <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800">
          <Globe className="w-10 h-10 text-indigo-400 mb-6" />
          <h3 className="text-xl font-bold text-white mb-3">Global Compliance</h3>
          <p className="text-zinc-400 leading-relaxed">
            Built from the ground up for rigorous regulatory adherence, KYC/AML screening, and audit reporting.
          </p>
        </div>
      </section>

    </div>
  );
};
