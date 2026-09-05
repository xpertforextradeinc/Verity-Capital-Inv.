import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  RotateCcw,
  Zap,
  Filter
} from 'lucide-react';
import { Order, OrderStatus } from '../../types.ts';
import { RiskBanner } from '../common/RiskBanner.tsx';

interface OrdersViewProps {
  orders: Order[];
  onCancelOrder: (orderId: string) => Promise<void>;
  onOpenTrade: () => void;
  onNavigateTab: (tab: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onCancelOrder,
  onOpenTrade,
  onNavigateTab,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  const handleCancel = async (orderId: string) => {
    try {
      setCancellingId(orderId);
      await onCancelOrder(orderId);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Simulated Order History</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Full ledger of virtual executions, pending limit orders, and cancellations
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Filter */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
            {['ALL', 'EXECUTED', 'PENDING', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenTrade}
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>Displaying {filteredOrders.length} order{filteredOrders.length === 1 ? '' : 's'}</span>
          <span className="font-mono">Settlement Engine: Instant Simulated Fill</span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No orders found matching the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order ID & Date</th>
                  <th className="py-3 px-4 font-semibold">Instrument</th>
                  <th className="py-3 px-4 font-semibold">Side & Type</th>
                  <th className="py-3 px-4 font-semibold text-right">Quantity</th>
                  <th className="py-3 px-4 font-semibold text-right">Order Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Executed Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Value</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-zinc-300">{ord.id}</div>
                      <div className="text-[10px] text-zinc-500 font-sans">
                        {new Date(ord.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-mono font-bold text-white">{ord.symbol}</div>
                      <div className="text-[10px] text-zinc-400">{ord.name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ord.side === 'BUY'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {ord.side}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-sans">
                          {ord.orderType}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-zinc-100">
                      {ord.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right text-zinc-300">
                      ${ord.requestedPrice.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-zinc-200">
                      {ord.executedPrice > 0 ? `$${ord.executedPrice.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">
                      ${ord.totalValue.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-sans">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          ord.status === 'EXECUTED'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            : ord.status === 'PENDING'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40 animate-pulse'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {ord.status === 'EXECUTED' && <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />}
                        {ord.status === 'PENDING' && <Clock className="w-3 h-3 mr-1 text-amber-400" />}
                        {ord.status === 'CANCELLED' && <XCircle className="w-3 h-3 mr-1 text-zinc-400" />}
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      {ord.status === 'PENDING' ? (
                        <button
                          onClick={() => handleCancel(ord.id)}
                          disabled={cancellingId === ord.id}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {cancellingId === ord.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-zinc-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RiskBanner onLearnMore={() => onNavigateTab('risk-disclosure')} />
    </div>
  );
};
