import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { Instrument, OrderSide, OrderType, Portfolio, Position } from '../../types.ts';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  instruments: Instrument[];
  selectedInstrument: Instrument | null;
  portfolio: Portfolio | null;
  positions: Position[];
  onExecuteTrade: (trade: {
    instrumentId: string;
    side: OrderSide;
    orderType: OrderType;
    quantity: number;
    limitPrice?: number;
  }) => Promise<void>;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  instruments,
  selectedInstrument,
  portfolio,
  positions,
  onExecuteTrade,
}) => {
  const [activeInst, setActiveInst] = useState<Instrument>(selectedInstrument || instruments[0]);
  const [side, setSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [quantity, setQuantity] = useState<string>('10');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selectedInstrument) {
      setActiveInst(selectedInstrument);
      setLimitPrice(selectedInstrument.price.toString());
    } else if (instruments.length > 0 && !activeInst) {
      setActiveInst(instruments[0]);
      setLimitPrice(instruments[0].price.toString());
    }
  }, [selectedInstrument, instruments]);

  useEffect(() => {
    if (activeInst) {
      setLimitPrice(activeInst.price.toString());
    }
  }, [activeInst]);

  if (!isOpen) return null;

  const currentPrice = activeInst ? activeInst.price : 0;
  const execPrice = orderType === 'MARKET' ? currentPrice : Number(limitPrice) || currentPrice;
  const numQty = parseFloat(quantity) || 0;
  const estimatedTotal = Math.round((numQty * execPrice + Number.EPSILON) * 100) / 100;

  const availableCash = portfolio ? portfolio.simulatedCashBalance : 0;
  const ownedPos = positions.find((p) => p.instrumentId === activeInst?.id);
  const ownedQty = ownedPos ? ownedPos.quantity : 0;

  // Percentage preset handler
  const handlePresetPercentage = (pct: number) => {
    if (side === 'BUY') {
      if (execPrice <= 0) return;
      const budget = availableCash * (pct / 100);
      const calculatedQty = activeInst?.assetType === 'CRYPTO'
        ? Math.floor((budget / execPrice) * 1000) / 1000
        : Math.floor(budget / execPrice);
      setQuantity(calculatedQty.toString());
    } else {
      // SELL
      if (ownedQty <= 0) return;
      const calculatedQty = activeInst?.assetType === 'CRYPTO'
        ? Math.floor(ownedQty * (pct / 100) * 1000) / 1000
        : Math.floor(ownedQty * (pct / 100));
      setQuantity(calculatedQty.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (numQty <= 0) {
      setErrorMsg('Please specify a positive quantity');
      return;
    }

    if (side === 'BUY' && estimatedTotal > availableCash) {
      setErrorMsg(`Insufficient simulated cash. Required: $${estimatedTotal.toFixed(2)}, Available: $${availableCash.toFixed(2)}`);
      return;
    }

    if (side === 'SELL' && numQty > ownedQty) {
      setErrorMsg(`Insufficient position. You own ${ownedQty} ${activeInst.symbol}, cannot sell ${numQty}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onExecuteTrade({
        instrumentId: activeInst.id,
        side,
        orderType,
        quantity: numQty,
        limitPrice: orderType === 'LIMIT' ? parseFloat(limitPrice) : undefined,
      });

      setSuccessMsg(`Simulated ${side} order for ${numQty} ${activeInst.symbol} submitted successfully!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-50">
      <div className="bg-[#0D121F] border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-zinc-100">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Place Simulated Order</h3>
              <p className="text-[11px] text-zinc-400">Virtual paper trading execution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Instrument Selector */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">
              Select Instrument
            </label>
            <select
              value={activeInst?.id}
              onChange={(e) => {
                const found = instruments.find((i) => i.id === e.target.value);
                if (found) setActiveInst(found);
              }}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {instruments.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.symbol} - {inst.name} (${inst.price.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Current Quote Card */}
          {activeInst && (
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-mono">Market Price</span>
                <div className="text-base font-bold font-mono text-white">
                  ${activeInst.price.toLocaleString('en-US', {
                    minimumFractionDigits: activeInst.assetType === 'FOREX' ? 4 : 2,
                    maximumFractionDigits: activeInst.assetType === 'FOREX' ? 4 : 2,
                  })}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 uppercase font-mono">24h Movement</span>
                <div
                  className={`text-xs font-mono font-semibold ${
                    activeInst.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {activeInst.changePercent >= 0 ? '+' : ''}
                  {activeInst.changePercent}%
                </div>
              </div>
            </div>
          )}

          {/* Side Selector (BUY / SELL) */}
          <div className="grid grid-cols-2 gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                side === 'BUY'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              BUY / LONG
            </button>
            <button
              type="button"
              onClick={() => setSide('SELL')}
              className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                side === 'SELL'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              SELL / SHORT
            </button>
          </div>

          {/* Order Type (MARKET / LIMIT) */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setOrderType('MARKET')}
              className={`py-2 px-3 rounded-xl border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                orderType === 'MARKET'
                  ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300 font-semibold'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Market Order</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType('LIMIT')}
              className={`py-2 px-3 rounded-xl border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                orderType === 'LIMIT'
                  ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300 font-semibold'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Limit Order</span>
            </button>
          </div>

          {/* Limit Price Input if Limit Order */}
          {orderType === 'LIMIT' && (
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Limit Price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-500">$</span>
                <input
                  type="number"
                  step="any"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-7 pr-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="Enter limit price"
                />
              </div>
            </div>
          )}

          {/* Quantity Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-zinc-400">
                Quantity {activeInst?.assetType === 'CRYPTO' ? '(Coins)' : '(Shares)'}
              </label>
              <span className="text-[11px] text-zinc-400 font-mono">
                {side === 'BUY'
                  ? `Avail. Cash: $${availableCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : `Owned: ${ownedQty} ${activeInst?.symbol}`}
              </span>
            </div>
            <input
              type="number"
              step={activeInst?.assetType === 'CRYPTO' ? '0.001' : '1'}
              min="0.0001"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              placeholder="0"
            />

            {/* Quick Percentage Presets */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePresetPercentage(pct)}
                  className="py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono transition-colors cursor-pointer"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Estimated Execution Price:</span>
              <span className="font-mono text-zinc-200">${execPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Brokerage Commission:</span>
              <span className="font-mono text-emerald-400">$0.00 (Simulated Zero Fee)</span>
            </div>
            <div className="pt-1.5 border-t border-zinc-800 flex items-center justify-between font-bold">
              <span className="text-zinc-200">Total Simulated Value:</span>
              <span className="font-mono text-sm text-white">${estimatedTotal.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 flex items-start space-x-2 text-[11px]">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 flex items-start space-x-2 text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !!successMsg}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              side === 'BUY'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20'
                : 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20'
            } disabled:opacity-50`}
          >
            {isSubmitting ? (
              <span>Transmitting Order...</span>
            ) : (
              <>
                <span>Confirm {side} {numQty} {activeInst?.symbol}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
