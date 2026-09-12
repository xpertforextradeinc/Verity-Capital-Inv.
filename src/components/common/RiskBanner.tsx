import React from 'react';
import { ShieldAlert, AlertTriangle, ArrowRight } from 'lucide-react';

interface RiskBannerProps {
  onLearnMore?: () => void;
  compact?: boolean;
}

export const RiskBanner: React.FC<RiskBannerProps> = ({ onLearnMore, compact }) => {
  if (compact) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-700 rounded-xl p-3 flex items-center justify-between text-xs text-zinc-300">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-zinc-400 shrink-0" />
          <span>
            <strong className="text-zinc-300 font-medium">Risk Disclosure:</strong> Trading digital assets involves significant risk and can result in the loss of your invested capital. You should not invest more than you can afford to lose.
          </span>
        </div>
        {onLearnMore && (
          <button
            onClick={onLearnMore}
            className="text-zinc-400 hover:text-zinc-300 font-medium shrink-0 ml-4 flex items-center space-x-1 cursor-pointer"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-5 my-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
              <span>Risk & Regulatory Disclosure</span>
            </h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-3xl leading-relaxed">
              Verity-Capital Inv is a digital asset brokerage. Cryptocurrency and digital assets are highly volatile and subject to market risks. AI-generated market summaries are provided for informational purposes only and do not constitute financial advice, investment advice, or a recommendation to buy or sell any asset. Please consult with a qualified professional before making any financial decisions.
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
