import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';

interface RiskBannerProps {
  onLearnMore?: () => void;
  compact?: boolean;
}

export const RiskBanner: React.FC<RiskBannerProps> = ({ onLearnMore, compact }) => {
  if (compact) {
    return (
      <div className="bg-zinc-900/60 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between text-xs text-zinc-300">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-amber-300 font-medium">Educational Simulation Notice:</strong> Past paper-trading performance does not guarantee future financial results. Verity-Capital Inv executes trades in a virtual environment.
          </span>
        </div>
        {onLearnMore && (
          <button
            onClick={onLearnMore}
            className="text-amber-400 hover:text-amber-300 font-medium shrink-0 ml-4 flex items-center space-x-1 cursor-pointer"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/30 via-zinc-900/80 to-amber-950/30 border border-amber-500/20 rounded-2xl p-5 my-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
              <span>Simulated Paper-Trading & AI Regulatory Boundary</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
                Mandatory Notice
              </span>
            </h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-3xl leading-relaxed">
              Verity-Capital Inv Version 1.0 is strictly an educational paper-trading MVP. It does not handle real customer deposits, fiat funds, live securities, or regulated exchange custody. AI-generated market summaries are strictly informational educational tools and must never be construed as financial advice or trade directives.
            </p>
          </div>
        </div>
        {onLearnMore && (
          <button
            onClick={onLearnMore}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-amber-300 border border-amber-500/30 transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-1.5"
          >
            <span>Read Risk Disclosure</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
