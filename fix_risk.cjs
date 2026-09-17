const fs = require('fs');
let code = fs.readFileSync('src/components/public/InfoPages.tsx', 'utf8');

const targetRisk = `      {page === 'risk-disclosure' && (
        <div id="risk-disclosure-container" className="bg-[#0B0F19] border border-amber-500/30 rounded-2xl p-8 shadow-2xl space-y-6 text-zinc-300">
          <div className="flex items-center space-x-3 pb-4 border-b border-zinc-800">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Institutional Risk Disclosure Statement
              </h1>
              <p className="text-xs text-amber-300/80 font-mono mt-0.5">
                US Digital Asset Market Notice & Factual Disclosures
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs leading-relaxed">
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/50 text-amber-200">
              <h3 className="font-bold text-sm mb-1 text-amber-100 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>1. Volatility and Market Risk</span>
              </h3>
              <p>
                Digital asset prices are highly volatile and subject to extreme price swings.
                Unlike traditional fiat currencies backed by sovereign governments, digital assets are largely decentralized.
                Market manipulation, sudden shifts in liquidity, and rapid macroeconomic changes can result in complete loss of allocated capital.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/50 text-amber-200">
              <h3 className="font-bold text-sm mb-1 text-amber-100 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>2. Custody and Security Risks</span>
              </h3>
              <p>
                While Verity-Capital Inv utilizes enterprise-grade, air-gapped cold storage with Fidelity Digital Assets and BitGo,
                the fundamental nature of cryptography means that if private keys are compromised through coordinated state-level attacks or catastrophic protocol failures,
                the assets may be irrecoverable.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/50 text-amber-200">
              <h3 className="font-bold text-sm mb-1 text-amber-100 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>3. Regulatory Uncertainty</span>
              </h3>
              <p>
                The regulatory landscape for digital assets in the US and globally remains highly uncertain.
                Future actions by the SEC, CFTC, FinCEN, or foreign regulatory bodies could severely impact the legality,
                taxation, and trading operations of specific digital assets supported on this platform.
              </p>
            </div>
          </div>
        </div>
      )}`;

const replacementRisk = `      {page === 'risk-disclosure' && (
        <div id="risk-disclosure-container" className="bg-[#050912] border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
          
          {/* Header */}
          <div className="bg-zinc-900/40 p-8 lg:p-12 border-b border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-amber-500/5 blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full mb-6">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                  Regulatory Compliance
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight mb-4">
                Institutional Risk Disclosure Statement
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
                This document details the material risks associated with digital asset markets, custody infrastructure, and execution systems. Acknowledgement of these risks is a mandatory prerequisite for all Verity-Capital Inv accounts.
              </p>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-8 lg:p-12 space-y-8 bg-[#070A10]">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2 flex items-center space-x-2">
                  <span className="text-amber-500">01.</span>
                  <span>Market Volatility</span>
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Systemic risks related to pricing, liquidity constraints, and flash crashes.
                </p>
              </div>
              <div className="md:col-span-8 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 lg:p-8">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Digital asset prices are uniquely volatile and subject to extreme, unprecedented price swings. 
                  Unlike traditional fiat currencies backed by sovereign governments or physical commodities, digital assets are highly decentralized and rely purely on market consensus. 
                  <br/><br/>
                  Institutional clients must be prepared for the possibility that market manipulation, sudden shifts in macro-level liquidity, or algorithmic cascading liquidations can result in the rapid and complete loss of allocated capital.
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-zinc-800/50" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2 flex items-center space-x-2">
                  <span className="text-amber-500">02.</span>
                  <span>Custodial Infrastructure</span>
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Cryptographic key management and vault limitations.
                </p>
              </div>
              <div className="md:col-span-8 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 lg:p-8">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Verity-Capital Inv utilizes enterprise-grade, air-gapped cold storage arrays in partnership with industry-leading trusts (e.g., Fidelity Digital Assets, BitGo). 
                  <br/><br/>
                  However, the fundamental nature of blockchain cryptography dictates that if master private keys are compromised through coordinated state-level attacks, zero-day quantum computing exploits, or catastrophic multi-sig protocol failures, the underlying assets may be permanently and irrevocably lost without recourse.
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-zinc-800/50" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2 flex items-center space-x-2">
                  <span className="text-amber-500">03.</span>
                  <span>Regulatory Shifts</span>
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Jurisdictional uncertainty and compliance impacts.
                </p>
              </div>
              <div className="md:col-span-8 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 lg:p-8">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  The global regulatory landscape for digital assets remains highly fragmented and uncertain. 
                  Future legislative actions or enforcement mandates by the SEC, CFTC, FinCEN, or international regulatory bodies could severely impact the legality, taxation, and operational feasibility of specific digital assets supported on this platform.
                </p>
              </div>
            </div>

          </div>
          
          <div className="bg-zinc-900/80 border-t border-zinc-800 p-8 flex items-center justify-between">
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              Document ID: VC-RSK-2026-V1.4
            </p>
            <button
              onClick={onOpenTrade}
              className="px-6 py-3 bg-white text-zinc-950 text-sm font-bold rounded-xl hover:bg-zinc-200 transition-colors"
            >
              I Understand the Risks
            </button>
          </div>
        </div>
      )}`;

if(code.includes(targetRisk)){
  code = code.replace(targetRisk, replacementRisk);
} else {
  // Use a regex to replace everything between {page === 'risk-disclosure' && ( ... )}
  // This is safer if whitespace slightly changed.
  
  // Find where it starts
  const startIdx = code.indexOf("{page === 'risk-disclosure' && (");
  if(startIdx > -1) {
    // Find the ending bracket of the JSX block. We know the next one is {page === 'terms'
    const nextIdx = code.indexOf("{page === 'terms'");
    if(nextIdx > -1) {
      code = code.substring(0, startIdx) + replacementRisk + "\n\n      " + code.substring(nextIdx);
    }
  }
}

fs.writeFileSync('src/components/public/InfoPages.tsx', code);
