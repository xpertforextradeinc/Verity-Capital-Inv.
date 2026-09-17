const fs = require('fs');
const file = 'src/components/customer/PortfolioView.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto animate-in fade-in duration-300">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Sign in to access your Verity-Capital Inv portfolio, live market executions, and custody balances.
        </p>
        <div className="w-full space-y-3">
          <button
            type="button"
            id="auth-required-google-btn-portfolio"
            onClick={async () => {
              if (onGoogleSignIn) {
                await onGoogleSignIn();
              }
            }}
            className="w-full flex items-center justify-center gap-3 border border-white/20 bg-zinc-900/80 hover:bg-zinc-800 hover:border-emerald-400/50 text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
          <button
            onClick={() => onOpenAuth?.('login')}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Sign In with Credentials
          </button>
        </div>
      </div>
    );
  }`;

const replaceStr = `  if (!user) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-5xl mx-auto">
        
        {/* Hero Section */}
        <div className="relative p-10 md:p-14 bg-[#0B0F19] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[80%] h-[150%] bg-emerald-500/5 blur-[120px] pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 rounded-full mb-6">
              <PieChart className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Institutional Asset Architecture</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-[1.1] mb-6">
              Command your capital<br />with absolute precision.
            </h1>
            <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-2xl mb-8">
              Gain unparalleled visibility into multi-asset portfolios. Our prime brokerage terminal aggregates real-time valuations across Equities, Forex, Commodities, and Digital Assets within a single, secure enclave.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => onOpenAuth?.('register')}
                className="px-8 py-3.5 bg-emerald-500 text-zinc-950 font-bold rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Open Institutional Account
              </button>
              <button
                onClick={() => onOpenAuth?.('login')}
                className="px-8 py-3.5 bg-zinc-900 border border-zinc-700 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Client Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col justify-between">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Global Markets</span>
            </div>
            <div>
              <p className="text-3xl font-black text-white">40+</p>
              <p className="text-sm text-zinc-500 font-medium mt-1">Exchanges & OTC Venues</p>
            </div>
          </div>
          
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col justify-between">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <BarChart4 className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Execution Latency</span>
            </div>
            <div>
              <p className="text-3xl font-black text-white">&lt; 50ms</p>
              <p className="text-sm text-zinc-500 font-medium mt-1">Smart Order Routing</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col justify-between">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <PieChart className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Asset Classes</span>
            </div>
            <div>
              <p className="text-3xl font-black text-white">Multi</p>
              <p className="text-sm text-zinc-500 font-medium mt-1">Fiat, Crypto, Equities</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col justify-between">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Cold Custody</span>
            </div>
            <div>
              <p className="text-3xl font-black text-white">100%</p>
              <p className="text-sm text-zinc-500 font-medium mt-1">Air-gapped architecture</p>
            </div>
          </div>
        </div>

        {/* Detail Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl bg-[#0B0F19] border border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <h3 className="text-xl font-bold text-white mb-4">Unified Fiduciary Reporting</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Consolidate cross-border assets into a single cryptographic ledger. Generate on-demand tax reporting, unrealized PnL snapshots, and risk-weighted asset (RWA) distributions instantly.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Real-time mark-to-market valuations</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Historical performance attribution modeling</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Institutional sub-account segregation</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-[#0B0F19] border border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <h3 className="text-xl font-bold text-white mb-4">Algorithmic Risk Management</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Our automated liquidation engines and margin risk frameworks calculate portfolio stress tests in real-time, protecting capital against extreme black-swan market volatility events.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Live portfolio margin utilization</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Cross-asset collateralization</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Automated VaR (Value at Risk) alerting</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    );
  }`;

// Use string index of to handle exact replacement more safely due to whitespace
const startIndex = code.indexOf('  if (!user) {');
const endIndexStr = `      </div>\n    );\n  }\n\n  const totalEquity = portfolio?.totalEquity || 100000;`;
const endIndex = code.indexOf(endIndexStr);

if (startIndex !== -1 && endIndex !== -1) {
  const newCode = code.slice(0, startIndex) + replaceStr + code.slice(endIndex + 22);
  fs.writeFileSync(file, newCode);
  console.log('Fixed PortfolioView');
} else {
  console.log('Target string indices not found in PortfolioView');
}
