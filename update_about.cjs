const fs = require('fs');
const file = 'src/components/public/InfoPages.tsx';
let code = fs.readFileSync(file, 'utf8');

const startMarker = "{/* ABOUT PAGE */}";
const endMarker = "{/* PRIVACY POLICY */}";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const replacementStr = `      {/* ABOUT PAGE */}
      {page === 'about' && (
        <div id="about-us-container" className="bg-[#050912] border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
          
          {/* Header Banner */}
          <div className="relative p-10 md:p-16 border-b border-zinc-800 overflow-hidden">
            <div className="absolute top-0 right-0 w-[80%] h-[150%] bg-blue-500/5 blur-[120px] pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center space-x-2 border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 rounded-full mb-8">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Institutional Profile</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.1] mb-6">
                Redefining digital asset infrastructure for the private wealth sector.
              </h1>
              <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                Verity-Capital Inv is a premier institutional brokerage platform, engineered strictly for private wealth investors, family offices, and commercial market participants who demand absolute security, deep liquidity, and regulatory transparency.
              </p>
            </div>
          </div>

          {/* Grid Content */}
          <div className="p-10 md:p-16 space-y-24">
            
            {/* Section 1: Background & Mission */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
              <div className="md:col-span-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 border-l-2 border-blue-500 pl-4">01 // The Firm</h3>
                <h2 className="text-2xl font-bold text-white tracking-tight">Corporate<br/>Background</h2>
              </div>
              <div className="md:col-span-8 space-y-6 text-zinc-400 leading-relaxed font-medium">
                <p>
                  Founded by veterans of traditional electronic trading and cryptographic security, Verity-Capital Inv was established to bridge the gap between legacy financial infrastructure and the rapidly evolving digital asset economy. 
                </p>
                <p>
                  Our core mission is to provide an uncompromised institutional conduit into digital markets. We eliminate the retail-centric noise, speculative gamification, and counterparty risks inherent in standard exchanges, delivering a pure, execution-focused environment engineered for capital preservation and portfolio growth.
                </p>
              </div>
            </div>

            {/* Section 2: Regulatory & Compliance */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 pt-16 border-t border-zinc-800/80">
              <div className="md:col-span-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 border-l-2 border-emerald-500 pl-4">02 // Governance</h3>
                <h2 className="text-2xl font-bold text-white tracking-tight">Regulatory<br/>Framework</h2>
              </div>
              <div className="md:col-span-8 space-y-6 text-zinc-400 leading-relaxed font-medium">
                <p>
                  We operate under a rigorous global compliance mandate, enforcing comprehensive Know Your Customer (KYC), Anti-Money Laundering (AML), and Counter-Terrorism Financing (CTF) protocols. Our systems are continuously audited to ensure strict adherence to international financial standards.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                    <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
                    <h4 className="text-white font-bold text-sm mb-1">Fiduciary Segregation</h4>
                    <p className="text-xs text-zinc-500">100% segregation of client fiat and digital assets from operational capital.</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                    <FileText className="w-6 h-6 text-emerald-400 mb-3" />
                    <h4 className="text-white font-bold text-sm mb-1">Audit-Ready Reporting</h4>
                    <p className="text-xs text-zinc-500">Comprehensive real-time reporting ledgers for institutional tax and compliance mandates.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Liquidity & Execution */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 pt-16 border-t border-zinc-800/80">
              <div className="md:col-span-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 border-l-2 border-indigo-500 pl-4">03 // Markets</h3>
                <h2 className="text-2xl font-bold text-white tracking-tight">Liquidity &<br/>Execution</h2>
              </div>
              <div className="md:col-span-8 space-y-6 text-zinc-400 leading-relaxed font-medium">
                <p>
                  Verity-Capital Inv does not operate a proprietary trading desk and never trades against client order flow. We function strictly as an agency broker.
                </p>
                <p>
                  Our Smart Order Routing (SOR) engine aggregates liquidity from 14+ Tier-1 OTC desks and primary exchanges. This dark-pool aggregation allows institutional clients to execute multi-million dollar block trades with sub-millisecond latency and mathematically minimal market impact.
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <span className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">OTC Block Trading</span>
                  <span className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Smart Order Routing</span>
                  <span className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">&lt; 50ms Latency</span>
                  <span className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Zero Proprietary Counter-Trading</span>
                </div>
              </div>
            </div>

            {/* Section 4: Operational Standards */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 pt-16 border-t border-zinc-800/80">
              <div className="md:col-span-4">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 border-l-2 border-amber-500 pl-4">04 // Custody</h3>
                <h2 className="text-2xl font-bold text-white tracking-tight">Operational<br/>Standards</h2>
              </div>
              <div className="md:col-span-8 space-y-6 text-zinc-400 leading-relaxed font-medium">
                <p>
                  Security is the foundational pillar of our infrastructure. We utilize military-grade Hardware Security Modules (HSMs) and strictly air-gapped cold storage environments. 
                </p>
                <ul className="space-y-4 mt-6">
                  <li className="flex items-start space-x-4 p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-white font-bold text-sm mb-1">Multi-Signature Consensus</span>
                      <span className="block text-xs text-zinc-500">Asset transfers require mathematically proven m-of-n cryptographic signatures distributed across geographically isolated key holders.</span>
                    </div>
                  </li>
                  <li className="flex items-start space-x-4 p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-white font-bold text-sm mb-1">Curated Asset Diligence</span>
                      <span className="block text-xs text-zinc-500">We do not list highly speculative or unregulated tokens. We support only Tier-1 digital assets that meet strict institutional and regulatory benchmarks (e.g., BTC, ETH).</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}

      `;

  const newCode = code.slice(0, startIndex) + replacementStr + code.slice(endIndex);
  fs.writeFileSync(file, newCode);
  console.log('Fixed About Page');
} else {
  console.log('Start or end marker not found');
}
