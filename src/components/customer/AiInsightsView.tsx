import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Info,
  Clock,
  Send,
  Zap,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { AiInsight, Instrument } from '../../types.ts';
import { RiskBanner } from '../common/RiskBanner.tsx';

interface AiInsightsViewProps {
  insights: AiInsight[];
  instruments: Instrument[];
  onGenerateInsight: (instrumentId: string, context?: string) => Promise<AiInsight>;
  onOpenTrade: (instrument?: Instrument) => void;
  onNavigateTab: (tab: string) => void;
}

export const AiInsightsView: React.FC<AiInsightsViewProps> = ({
  insights,
  instruments,
  onGenerateInsight,
  onOpenTrade,
  onNavigateTab,
}) => {
  const [selectedInstId, setSelectedInstId] = useState<string>(
    instruments[0]?.id || ''
  );
  const [userPromptContext, setUserPromptContext] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const selectedInst = instruments.find((i) => i.id === selectedInstId) || instruments[0];

  const handleGenerate = async () => {
    if (!selectedInst) return;
    setIsGenerating(true);
    setGenerationError(null);
    try {
      await onGenerateInsight(selectedInst.id, userPromptContext.trim() || undefined);
      setUserPromptContext('');
    } catch (err: any) {
      setGenerationError(err.message || 'Failed to generate market insight');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-[#0D1426] to-[#0A0E18] border border-indigo-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-semibold flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                <span>Gemini 3.8 Flash Educational Intelligence</span>
              </span>
              <span className="text-xs text-zinc-400 font-mono">v1.4 Safety Architecture</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              AI-Assisted Market & Macro Insights
            </h1>
            <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
              Synthesizes real-time simulated price action, historical volatility patterns, and macro market structure. All outputs are strictly educational and do not constitute financial advice.
            </p>
          </div>

          <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs space-y-1 shrink-0">
            <div className="text-zinc-400 text-[10px] uppercase font-mono">Safety Compliance</div>
            <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Non-Advisory Guardrails Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insight Generator Control Box */}
      <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Generate Institutional Educational Analysis</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Select Market Instrument
            </label>
            <select
              value={selectedInstId}
              onChange={(e) => setSelectedInstId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {instruments.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.symbol} - {inst.name} (${inst.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-6">
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Educational Focus / Question (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Evaluate support bands, volume trends, or rate sensitivity..."
              value={userPromptContext}
              onChange={(e) => setUserPromptContext(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>
        </div>

        {generationError && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{generationError}</span>
          </div>
        )}
      </div>

      {/* Insights Cards Feed */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center justify-between">
          <span>Active Intelligence Reports ({insights.length})</span>
          <span className="text-xs text-zinc-400 font-normal">
            Updated in accordance with model freshness standards
          </span>
        </h3>

        {insights.length === 0 ? (
          <div className="p-12 text-center bg-[#0B0F19] border border-zinc-800 rounded-2xl text-zinc-500 text-xs">
            No intelligence reports generated yet. Click "Analyze" above to generate your first educational insight.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {insights.map((insight) => {
              const inst = instruments.find((i) => i.id === insight.instrumentId);
              const isBullish = insight.sentiment === 'BULLISH';
              const isBearish = insight.sentiment === 'BEARISH';

              return (
                <div
                  key={insight.id}
                  className="bg-[#0B0F19] border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all"
                >
                  <div>
                    {/* Header: Instrument & Tags */}
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-base text-white">
                          {insight.symbol}
                        </span>
                        {inst && (
                          <span className="text-xs font-mono text-zinc-400">
                            ${inst.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-xs font-mono">
                        {/* Sentiment Badge */}
                        <span
                          className={`px-2 py-0.5 rounded font-bold flex items-center space-x-1 ${
                            isBullish
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : isBearish
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          {isBullish && <TrendingUp className="w-3 h-3 mr-1" />}
                          {isBearish && <TrendingDown className="w-3 h-3 mr-1" />}
                          {!isBullish && !isBearish && <Minus className="w-3 h-3 mr-1" />}
                          <span>{insight.sentiment}</span>
                        </span>

                        {/* Risk Level Badge */}
                        <span
                          className={`px-2 py-0.5 rounded font-medium ${
                            insight.riskLevel === 'HIGH'
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                              : insight.riskLevel === 'MODERATE'
                              ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/40'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {insight.riskLevel} RISK
                        </span>
                      </div>
                    </div>

                    {/* Title & Executive Summary */}
                    <div className="mt-3.5">
                      <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                        {insight.title}
                      </h4>
                      <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                        {insight.summary}
                      </p>
                    </div>

                    {/* Key Observation Bullet Points */}
                    <div className="mt-4 pt-3 border-t border-zinc-800/80">
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Educational Observations:
                      </span>
                      <ul className="mt-2 space-y-1.5 text-xs text-zinc-300 list-disc list-inside">
                        {insight.keyPoints.map((pt, idx) => (
                          <li key={idx} className="leading-relaxed">
                            <span className="text-zinc-200">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer: Metadata & Compliance Disclaimer */}
                  <div className="mt-5 pt-3 border-t border-zinc-800 text-[10px] space-y-2">
                    <div className="flex items-center justify-between text-zinc-400 font-mono">
                      <span>Model: {insight.modelName}</span>
                      <span>Confidence: {insight.confidenceScore}%</span>
                      <span>{new Date(insight.generatedAt).toLocaleDateString()}</span>
                    </div>

                    {/* Disclaimer box */}
                    <div className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-400 leading-normal">
                      <div className="flex items-center space-x-1 text-amber-400/90 font-medium mb-0.5">
                        <Info className="w-3 h-3 shrink-0" />
                        <span>Regulatory Disclaimer:</span>
                      </div>
                      {insight.disclaimer}
                    </div>

                    {inst && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => onOpenTrade(inst)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                          <Zap className="w-3 h-3 fill-current" />
                          <span>Simulate {inst.symbol} Trade</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <RiskBanner onLearnMore={() => onNavigateTab('risk-disclosure')} />
    </div>
  );
};
