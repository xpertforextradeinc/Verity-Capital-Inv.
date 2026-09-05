import React, { useState } from 'react';
import {
  Bookmark,
  Plus,
  Trash2,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import { Watchlist, Instrument } from '../../types.ts';

interface WatchlistsViewProps {
  watchlists: Watchlist[];
  instruments: Instrument[];
  onOpenTrade: (inst: Instrument) => void;
  onSelectInstrument: (inst: Instrument) => void;
  onCreateWatchlist: (name: string) => Promise<void>;
  onRemoveFromWatchlist: (watchlistId: string, instrumentId: string) => Promise<void>;
  onAddToWatchlist: (watchlistId: string, instrumentId: string) => Promise<void>;
  onNavigateAiInsight: (inst: Instrument) => void;
}

export const WatchlistsView: React.FC<WatchlistsViewProps> = ({
  watchlists,
  instruments,
  onOpenTrade,
  onSelectInstrument,
  onCreateWatchlist,
  onRemoveFromWatchlist,
  onAddToWatchlist,
  onNavigateAiInsight,
}) => {
  const [activeWatchlistId, setActiveWatchlistId] = useState<string>(
    watchlists[0]?.id || ''
  );
  const [newListName, setNewListName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);

  const activeWatchlist =
    watchlists.find((w) => w.id === activeWatchlistId) || watchlists[0];

  const watchlistInstruments = activeWatchlist
    ? instruments.filter((i) => activeWatchlist.instrumentIds.includes(i.id))
    : [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    await onCreateWatchlist(newListName.trim());
    setNewListName('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Watchlist Tabs */}
      <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-emerald-400" />
            <span>Custom Market Watchlists</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monitor target assets, track intraday price action, and execute simulated orders
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Watchlist Tabs */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
            {watchlists.map((wl) => (
              <button
                key={wl.id}
                onClick={() => setActiveWatchlistId(wl.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeWatchlist?.id === wl.id
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {wl.name} ({wl.instrumentIds.length})
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Create New Watchlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Watchlist Card */}
      <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-white">
              {activeWatchlist?.name || 'Watchlist'}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              ({watchlistInstruments.length} items)
            </span>
          </div>

          {/* Add Instrument Quick Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Symbol</span>
            </button>

            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-3 z-50">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search instrument..."
                    value={addSearch}
                    onChange={(e) => setAddSearch(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
                  {instruments
                    .filter((i) => !activeWatchlist?.instrumentIds.includes(i.id))
                    .filter(
                      (i) =>
                        i.symbol.toLowerCase().includes(addSearch.toLowerCase()) ||
                        i.name.toLowerCase().includes(addSearch.toLowerCase())
                    )
                    .map((inst) => (
                      <div
                        key={inst.id}
                        className="p-2 rounded-lg hover:bg-zinc-800 flex items-center justify-between cursor-pointer"
                        onClick={async () => {
                          if (activeWatchlist) {
                            await onAddToWatchlist(activeWatchlist.id, inst.id);
                          }
                          setShowAddMenu(false);
                          setAddSearch('');
                        }}
                      >
                        <div>
                          <span className="font-mono font-bold text-white">{inst.symbol}</span>
                          <span className="text-[10px] text-zinc-400 ml-1.5 truncate max-w-[120px] inline-block align-bottom">
                            {inst.name}
                          </span>
                        </div>
                        <span className="font-mono text-zinc-300 text-[11px]">${inst.price.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {watchlistInstruments.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            No instruments in this watchlist. Click "Add Symbol" above to populate your tracking list.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Instrument</th>
                  <th className="py-3 px-4 font-semibold text-right">Price</th>
                  <th className="py-3 px-4 font-semibold text-right">24h Change</th>
                  <th className="py-3 px-4 font-semibold text-right">24h Range</th>
                  <th className="py-3 px-4 font-semibold text-right">Volume</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {watchlistInstruments.map((inst) => {
                  const isPositive = inst.changePercent >= 0;
                  return (
                    <tr key={inst.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-sans">
                        <div
                          onClick={() => onSelectInstrument(inst)}
                          className="cursor-pointer group flex items-center space-x-2"
                        >
                          <div>
                            <div className="font-bold text-white font-mono flex items-center space-x-1.5 group-hover:text-emerald-400">
                              <span>{inst.symbol}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-sans">
                                {inst.assetType}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-400">{inst.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white">
                        ${inst.price.toLocaleString('en-US', {
                          minimumFractionDigits: inst.assetType === 'FOREX' ? 4 : 2,
                          maximumFractionDigits: inst.assetType === 'FOREX' ? 4 : 2,
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className={`font-semibold flex items-center justify-end ${
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
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-zinc-300">
                        ${inst.low24h.toFixed(2)} - ${inst.high24h.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-zinc-300">
                        {inst.volume24h.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onNavigateAiInsight(inst)}
                            title="Generate AI Market Brief"
                            className="p-1.5 rounded-lg bg-indigo-950/40 text-indigo-400 hover:bg-indigo-900/60 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenTrade(inst)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Trade
                          </button>
                          {activeWatchlist && (
                            <button
                              onClick={() => onRemoveFromWatchlist(activeWatchlist.id, inst.id)}
                              title="Remove from Watchlist"
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Watchlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-50">
          <form onSubmit={handleCreate} className="bg-[#0D121F] border border-zinc-800 w-full max-w-sm rounded-2xl shadow-2xl p-5 text-zinc-100">
            <h3 className="text-sm font-bold text-white mb-3">Create New Watchlist</h3>
            <input
              type="text"
              placeholder="e.g., Tech Growth, High Dividend, Crypto Moon..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 mb-4"
              autoFocus
            />
            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-emerald-500 text-zinc-950 text-xs font-bold hover:bg-emerald-400 cursor-pointer"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
