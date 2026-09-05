import React, { useState, useEffect } from 'react';
import { X, BookOpen, ShieldCheck, Database, Layers, Clock, Award, CheckCircle2 } from 'lucide-react';
import { FactualCryptoAsset } from '../../types.ts';
import { api } from '../../services/api.ts';

interface AssetSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSymbol?: string;
  onSelectForTrade?: (symbol: string) => void;
}

export const AssetSpecsModal: React.FC<AssetSpecsModalProps> = ({
  isOpen,
  onClose,
  initialSymbol = 'BTC',
  onSelectForTrade,
}) => {
  const [specs, setSpecs] = useState<FactualCryptoAsset[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialSymbol);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      api.getAssetSpecifications()
        .then(data => {
          setSpecs(data);
          if (initialSymbol && data.some(d => d.symbol === initialSymbol)) {
            setSelectedSymbol(initialSymbol);
          } else if (data.length > 0) {
            setSelectedSymbol(data[0].symbol);
          }
        })
        .catch(err => console.error('Failed to load asset specifications:', err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, initialSymbol]);

  if (!isOpen) return null;

  const currentSpec = specs.find(s => s.symbol === selectedSymbol) || specs[0];

  return (
    <div id="asset-specs-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div id="asset-specs-modal" className="bg-[#0B0F19] border border-amber-500/30 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Factual Digital Asset Specifications</h2>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Non-Advisory • Verified
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Verifiable blockchain parameters, regulatory classifications, and custodian support
              </p>
            </div>
          </div>
          <button
            id="close-asset-specs-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Asset Switcher */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-900/30 p-2 gap-2 overflow-x-auto">
          {specs.map((s) => (
            <button
              key={s.symbol}
              id={`spec-btn-${s.symbol}`}
              onClick={() => setSelectedSymbol(s.symbol)}
              className={`py-2 px-4 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 whitespace-nowrap ${
                selectedSymbol === s.symbol
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 border border-zinc-800/80'
              }`}
            >
              <span>{s.symbol}</span>
              <span className="text-[10px] font-normal opacity-80">{s.name}</span>
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {currentSpec ? (
            <div className="space-y-6">
              {/* Asset Header Banner */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-zinc-400 font-mono text-xs">Protocol Specification Sheet</div>
                  <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                    {currentSpec.name} ({currentSpec.symbol})
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1 max-w-xl leading-relaxed">
                    {currentSpec.networkUtility}
                  </p>
                </div>
                {onSelectForTrade && (
                  <button
                    id="trade-from-spec-btn"
                    onClick={() => {
                      onClose();
                      onSelectForTrade(currentSpec.symbol);
                    }}
                    className="py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 shrink-0 cursor-pointer shadow-md shadow-amber-500/20 transition-all"
                  >
                    Execute {currentSpec.symbol} Spot Trade
                  </button>
                )}
              </div>

              {/* Grid of Verified Technical Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <div className="flex items-center space-x-1.5 text-zinc-400 font-semibold">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Consensus Architecture</span>
                  </div>
                  <div className="text-white font-mono text-sm font-bold pt-1">
                    {currentSpec.consensusMechanism}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <div className="flex items-center space-x-1.5 text-zinc-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>US Regulatory Determination</span>
                  </div>
                  <div className="text-white font-mono text-xs font-bold pt-1">
                    {currentSpec.regulatoryClassification}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <div className="flex items-center space-x-1.5 text-zinc-400 font-semibold">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Supply Mechanics</span>
                  </div>
                  <div className="text-white font-mono text-xs pt-1">
                    <div>Max Supply: <strong>{currentSpec.maxSupply}</strong></div>
                    <div>Circulating: <span className="text-zinc-400">{currentSpec.circulatingSupply}</span></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <div className="flex items-center space-x-1.5 text-zinc-400 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Block Finality & Cryptography</span>
                  </div>
                  <div className="text-white font-mono text-xs pt-1">
                    <div>Avg Block Time: <strong>{currentSpec.averageBlockTime}</strong></div>
                    <div>Curve: <span className="text-zinc-400">{currentSpec.cryptographicStandard}</span></div>
                  </div>
                </div>
              </div>

              {/* Institutional Custodian Support */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center space-x-1.5 text-zinc-400 font-semibold">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Qualified Institutional Custodians</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentSpec.institutionalCustodianSupport.map((cust) => (
                    <span
                      key={cust}
                      className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-amber-500" />
                      <span>{cust}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Compliance Notice */}
              <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-[11px] text-zinc-400 leading-relaxed">
                <strong>Quantix Brokerage Compliance Notice:</strong> Specifications are provided for informational and protocol validation purposes in accordance with US regulatory standards. Quantix does not endorse or offer investment advice regarding any listed digital asset.
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400">Loading asset specifications...</div>
          )}
        </div>
      </div>
    </div>
  );
};
