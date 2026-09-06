import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, FileText, CheckCircle2, ShieldCheck, Building2, Coins } from 'lucide-react';

interface InfoPagesProps {
  page: 'about' | 'features' | 'risk-disclosure' | 'terms' | 'privacy' | 'security';
  onBack: () => void;
  onOpenTrade: () => void;
}

export const InfoPages: React.FC<InfoPagesProps> = ({ page, onBack, onOpenTrade }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 px-4">
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
        <div id="about-us-container" className="bg-[#0B0F19] border border-zinc-800/80 rounded-2xl p-8 shadow-2xl space-y-6 text-zinc-300">
          <div className="pb-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" />
                <span>Institutional Profile</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">About Verity Capital</h1>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Institutional Standard
            </span>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
            <p>
              Verity Capital is a premier institutional digital asset and Bitcoin investment platform, engineered for private wealth investors, family offices, and commercial market participants who demand institutional execution standards, qualified cold-storage custody, and complete operational transparency.
            </p>
            <p>
              The platform specializes in Bitcoin (BTC), Ethereum (ETH), institutional digital asset investing, portfolio growth, and wealth preservation. We provide deep liquidity routing across global OTC market makers and primary order books, executing spot positions and structured investment plans exclusively upon client instruction.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800">
                <div className="text-lg font-bold font-mono text-amber-400">Primary Digital Assets</div>
                <div className="text-xs font-semibold text-white mt-1">BTC, ETH, SOL, XRP, ADA</div>
                <div className="text-[11px] text-zinc-400 mt-1">Curated spot liquidity with rigorous asset diligence and zero speculative noise.</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800">
                <div className="text-lg font-bold font-mono text-emerald-400">Qualified Cold Custody</div>
                <div className="text-xs font-semibold text-white mt-1">Air-Gapped Multi-Sig</div>
                <div className="text-[11px] text-zinc-400 mt-1">Institutional vaults engineered with multi-party cryptographic protection.</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800">
                <div className="text-lg font-bold font-mono text-indigo-400">Sub-Millisecond Execution</div>
                <div className="text-xs font-semibold text-white mt-1">Deep OTC Liquidity</div>
                <div className="text-[11px] text-zinc-400 mt-1">Direct access to premier global liquidity pools with minimal price impact.</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 mt-4 space-y-2">
              <h3 className="font-bold text-white text-sm">Core Investment Principles</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>Strict segregation of client fiat and digital asset balances</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>No proprietary counter-trading against client order flow</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>Engineered for capital preservation and long-term portfolio growth</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>Comprehensive compliance verification and audit-ready reporting</span>
                </li>
              </ul>
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
                Digital asset markets experience rapid price fluctuations. Historical asset performance is not indicative of future returns. Clients must carefully assess whether holding or trading Bitcoin (BTC), Ethereum (ETH), Solana (SOL), Ripple (XRP), or Cardano (ADA) aligns with their institutional risk tolerance and balance sheet requirements.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <h3 className="font-bold text-sm text-white">2. No Financial Advice or Predictive Signals</h3>
              <p>
                Verity-Capital Inv is an execution-only broker. We do not provide trading signals, price predictions, portfolio recommendations, or financial advice. All educational and protocol information generated on the platform is purely factual and objective.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <h3 className="font-bold text-sm text-white">3. Cold Storage Custody & On-Chain Finality</h3>
              <p>
                Blockchain network transactions are irreversible once confirmed on-chain. Outbound wallet transfers must be independently verified by the client prior to cryptographic signature authorization.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TERMS OF SERVICE */}
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
