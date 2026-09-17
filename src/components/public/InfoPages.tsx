import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, FileText, CheckCircle2, ShieldCheck, Building2, Coins } from 'lucide-react';

interface InfoPagesProps {
  page: 'about' | 'features' | 'risk-disclosure' | 'terms' | 'privacy' | 'security';
  onBack: () => void;
  onOpenTrade: () => void;
}

export const InfoPages: React.FC<InfoPagesProps> = ({ page, onBack, onOpenTrade }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 py-6 px-4">
      {/* Back button */}
      <button
        id="info-page-back-btn"
        onClick={onBack}
        className="flex items-center space-x-2 text-xs font-semibold text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Trading Terminal</span>
      </button>

            {/* ABOUT PAGE */}
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

      {/* PRIVACY POLICY */}
      {page === 'privacy' && (
        <div id="privacy-policy-container" className="bg-[#0B0F19] border border-zinc-800/80 rounded-2xl p-8 shadow-2xl space-y-6 text-zinc-300">
          <div className="pb-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
                <Lock className="w-4 h-4" />
                <span>US Regulatory Disclosure</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Privacy Policy & Financial Data Safeguards</h1>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
              GLBA & FinCEN Compliant
            </span>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-zinc-300">
            <p>
              Verity-Capital Inv Brokerage Inc. (“Verity-Capital Inv”, “we”, “us”) is committed to safeguarding the nonpublic personal information (NPI) of our institutional and individual clients in full compliance with the Gramm-Leach-Bliley Act (GLBA), the Bank Secrecy Act (BSA), FinCEN Customer Due Diligence (CDD) requirements, and applicable US state data privacy statutes.
            </p>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <h3 className="font-bold text-sm text-white">1. Information We Collect</h3>
              <p>
                To provide institutional brokerage and custody services and fulfill federal anti-money laundering (AML) mandates, we collect:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                <li><strong>Customer Identification Program (CIP) Data:</strong> Legal full name, residential or commercial address, date of birth, Taxpayer Identification Number (SSN / EIN), and government-issued identification.</li>
                <li><strong>Custody & Settlement Information:</strong> Bank account routing and account numbers for ACH and Fedwire settlements, whitelisted digital asset public wallet addresses.</li>
                <li><strong>Transaction History:</strong> Execution timestamps, order types, prices, quantities, and cryptographic blockchain transaction hashes.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <h3 className="font-bold text-sm text-white">2. Strict Prohibition on Selling Data</h3>
              <p>
                Verity-Capital Inv does NOT sell, rent, license, or trade client personal data or trading activity to third-party data brokers, marketing firms, or algorithmic high-frequency trading firms. Your order book flow remains private and unmonetized.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <h3 className="font-bold text-sm text-white">3. Cryptographic Security Standards</h3>
              <p>
                All account telemetry and custody authorization channels are protected by TLS 1.3 encryption in transit and AES-256 encryption at rest. Cold-storage signing utilizes multi-party computation (MPC) and air-gapped hardware security modules (HSM).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <h3 className="font-bold text-sm text-white">4. Regulatory Inquiries & Legal Compliance</h3>
              <p>
                We disclose client records only when required by valid federal court subpoenas, FinCEN Form 8300 / SAR requirements, or direct regulatory inquiries from authorized US supervisory agencies (SEC, CFTC, FinCEN, IRS).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* RISK DISCLOSURE */}
            {page === 'risk-disclosure' && (
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
      )}

      {page === 'terms' && (
        <div id="terms-of-service-container" className="bg-[#0B0F19] border border-zinc-800/80 rounded-2xl p-8 shadow-2xl space-y-6 text-zinc-300">
          <div className="pb-4 border-b border-zinc-800">
            <h1 className="text-2xl font-bold text-white tracking-tight">Terms of Brokerage Service</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Operating Agreement for Institutional Client Accounts
            </p>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-zinc-300">
            <p>
              By accessing the Verity-Capital Inv platform, executing orders, or initiating custody transfers, you agree to these Terms of Brokerage Service.
            </p>
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <h3 className="font-bold text-sm text-white">Account Eligibility & Verification</h3>
              <p>
                Access requires successful completion of Tier 1 or Tier 2 identity verification, including Customer Identification Program (CIP) checks and OFAC Sanctions screening. Accounts are non-transferable.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <h3 className="font-bold text-sm text-white">Order Execution & Settlement</h3>
              <p>
                Market and limit orders are executed against deep institutional order book liquidity. Trades settle instantly in USD cash and qualified digital asset ledger balances.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY & CUSTODY SPECIFICATIONS */}
      {page === 'security' && (
        <div id="security-specifications-container" className="bg-[#0B0F19] border border-amber-500/30 rounded-2xl p-8 shadow-2xl space-y-6 text-zinc-300">
          <div className="pb-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Cold Custody Infrastructure</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Verity Capital Security Architecture</h1>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Institutional Vault Standards
            </span>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-zinc-300">
            <p>
              At Verity Capital, asset security and wealth preservation are foundational. Our digital asset infrastructure is architected to eliminate single points of failure across key generation, storage, and transaction signing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Air-Gapped Cold Storage</span>
                </h3>
                <p className="text-zinc-400 text-xs">
                  98%+ of client digital assets are retained in segregated, multi-signatory cold storage vaults situated in deep physical vaults with 24/7 biometric controls.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Multi-Party Computation (MPC)</span>
                </h3>
                <p className="text-zinc-400 text-xs">
                  Cryptographic private keys are divided into encrypted key shards across independent geographical jurisdictions. Keys are never assembled in a single memory location.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Whitelisted Settlement Channels</span>
                </h3>
                <p className="text-zinc-400 text-xs">
                  Outbound cryptocurrency withdrawals and fiat settlements are strictly restricted to pre-authorized, whitelisted recipient addresses with mandatory cooling-off intervals.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Continuous Auditing & Proof of Reserves</span>
                </h3>
                <p className="text-zinc-400 text-xs">
                  Our qualified custodian partners undergo continuous third-party financial audits and cryptographic Merkle tree Proof of Reserves attestations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
