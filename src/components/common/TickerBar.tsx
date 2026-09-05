import React from 'react';
import { Instrument } from '../../types.ts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TickerBarProps {
  instruments: Instrument[];
  onSelectInstrument: (instrument: Instrument) => void;
}

export const TickerBar: React.FC<TickerBarProps> = ({ instruments, onSelectInstrument }) => {
  return (
    <div className="bg-[#070A10] border-b border-zinc-800/80 overflow-x-auto no-scrollbar py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center space-x-6 min-w-max">
        <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-500 uppercase tracking-wider pr-2 border-r border-zinc-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LIVE TICK FEED</span>
        </div>

        {instruments.slice(0, 8).map((inst) => {
          const isPositive = inst.changePercent >= 0;
          return (
            <button
              key={inst.id}
              onClick={() => onSelectInstrument(inst)}
              className="flex items-center space-x-2 text-xs hover:bg-zinc-800/50 px-2 py-1 rounded-md transition-colors cursor-pointer group"
            >
              <span className="font-mono font-bold text-zinc-200 group-hover:text-white">
                {inst.symbol}
              </span>
              <span className="font-mono text-zinc-300">
                ${inst.price.toLocaleString('en-US', {
                  minimumFractionDigits: inst.assetType === 'FOREX' ? 4 : 2,
                  maximumFractionDigits: inst.assetType === 'FOREX' ? 4 : 2,
                })}
              </span>
              <span
                className={`flex items-center font-mono text-[11px] font-medium ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-0.5" />
                )}
                {isPositive ? '+' : ''}
                {inst.changePercent.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
