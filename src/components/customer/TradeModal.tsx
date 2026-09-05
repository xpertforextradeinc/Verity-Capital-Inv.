import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Coins
} from 'lucide-react';
import { Instrument, OrderSide, OrderType, Portfolio, Position } from '../../types.ts';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  instruments: Instrument[];
  selectedInstrument: Instrument | null;
  portfolio: Portfolio | null;
  positions: Position[];
  initialDraft?: {
    symbol?: string;
    side?: OrderSide;
    orderType?: OrderType;
    quantity?: number;
    limitPrice?: number;
  } | null;
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
  initialDraft,
  onExecuteTrade,
}) => {
  const [activeInst, setActiveInst] = useState<Instrument>(selectedInstrument || instruments[0]);
  const [side, setSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [quantity, setQuantity] = useState<string>('0.25');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [step, setStep] = useState<'CONFIGURE' | 'CONFIRM'>('CONFIGURE');
  const [userConfirmedCheckbox, setUserConfirmedCheckbox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialDraft) {
      if (initialDraft.symbol) {
        const found = instruments.find(
          (i) => i.symbol.toUpperCase().startsWith(initialDraft.symbol!.toUpperCase()) ||
                 i.name.toUpperCase() === initialDraft.symbol!.toUpperCase()
        );
        if (found) setActiveInst(found);
      }
      if (initialDraft.side) setSide(initialDraft.side);
      if (initialDraft.orderType) setOrderType(initialDraft.orderType);
      if (initialDraft.quantity) setQuantity(initialDraft.quantity.toString());
      if (initialDraft.limitPrice) setLimitPrice(initialDraft.limitPrice.toString());
      setStep('CONFIGURE');
      setUserConfirmedCheckbox(false);
    } else if (selectedInstrument) {
      setActiveInst(selectedInstrument);
      setLimitPrice(selectedInstrument.price.toString());
      setStep('CONFIGURE');
      setUserConfirmedCheckbox(false);
    } else if (instruments.length > 0 && !activeInst) {
      setActiveInst(instruments[0]);
      setLimitPrice(instruments[0].price.toString());
    }
  }, [selectedInstrument, initialDraft, instruments]);

  useEffect(() => {
    if (activeInst && (!limitPrice || limitPrice === '')) {
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
      const calculatedQty = Math.floor((budget / execPrice) * 1000) / 1000;
      setQuantity(calculatedQty.toString());
    } else {
      if (ownedQty <= 0) return;
      const calculatedQty = Math.floor(ownedQty * (pct / 100) * 1000) / 1000;
      setQuantity(calculatedQty.toString());
    }
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (numQty <= 0) {
      setErrorMsg('Please specify a positive quantity.');
      return;
    }

    if (orderType === 'LIMIT' && (!Number(limitPrice) || Number(limitPrice) <= 0)) {
      setErrorMsg('Please specify a valid limit price.');
      return;
    }

    if (side === 'BUY' && estimatedTotal > availableCash) {
      setErrorMsg(`Insufficient available cash balance. Required: $${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}, Available: $${availableCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
      return;
    }

    if (side === 'SELL' && numQty > ownedQty) {
      setErrorMsg(`Insufficient position balance. You hold ${ownedQty} ${activeInst.symbol}, cannot sell ${numQty}.`);
      return;
    }

    setStep('CONFIRM');
    setUserConfirmedCheckbox(false);
  };

  const handleFinalExecution = async () => {
    if (!userConfirmedCheckbox) {
      setErrorMsg('Institutional policy requires your explicit authorization confirmation.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onExecuteTrade({
        instrumentId: activeInst.id,
        side,
        orderType,
        quantity: numQty,
        limitPrice: orderType === 'LIMIT' ? parseFloat(limitPrice) : undefined,
      });

      setSuccessMsg(`Spot ${side} order for ${numQty} ${activeInst.symbol} authorized and executed successfully!`);
      setTimeout(() => {
        setSuccessMsg(null);
        setStep('CONFIGURE');
        onClose();
      }, 1600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to execute spot order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in-50">
      <div className="bg-[#0D121F] border border-amber-500/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-zinc-100">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#0A0E17]">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">Verity Spot Execution</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {step === 'CONFIRM' ? 'Step 2: Explicit Confirmation' : 'Step 1: Order Draft'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Institutional spot execution • Cold custody delivery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: CONFIGURE ORDER */}
        {step === 'CONFIGURE' ? (
          <form onSubmit={handleProceedToReview} className="p-5 space-y-4 text-xs">
            {/* Instrument Selector */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1 uppercase">
                Supported Digital Asset
              </label>
              <select
                value={activeInst?.id}
                onChange={(e) => {
                  const found = instruments.find((i) => i.id === e.target.value);
                  if (found) {
                    setActiveInst(found);
                    setLimitPrice(found.price.toString());
                  }
                }}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {instruments.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.symbol} - {inst.name} (${inst.price.toLocaleString('en-US', { minimumFractionDigits: 2 })})
                  </option>
                ))}
              </select>
            </div>

            {/* Current Quote Card */}
            {activeInst && (
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">Spot Market Price</span>
                  <div className="text-base font-bold font-mono text-white">
                    ${activeInst.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">24h Change</span>
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
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                BUY (Spot Long)
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
                SELL (Spot Liquidate)
              </button>
            </div>

            {/* Order Type (MARKET / LIMIT) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setOrderType('MARKET')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  orderType === 'MARKET'
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-300 font-semibold'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Spot Market Order</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('LIMIT')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  orderType === 'LIMIT'
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-300 font-semibold'
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
                <label className="block text-[11px] font-mono text-zinc-400 mb-1 uppercase">
                  Limit Price (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-500 font-mono">$</span>
                  <input
                    type="number"
                    step="any"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-7 pr-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    placeholder="Enter limit price"
                  />
                </div>
              </div>
            )}

            {/* Quantity Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase">
                  Order Quantity ({activeInst?.symbol.split('/')[0]})
                </label>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {side === 'BUY'
                    ? `Avail. Cash: $${availableCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : `Vault Holding: ${ownedQty} ${activeInst?.symbol}`}
                </span>
              </div>
              <input
                type="number"
                step="0.001"
                min="0.0001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                placeholder="0.00"
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

            {/* Summary Estimate */}
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Execution Unit Price:</span>
                <span className="font-mono text-zinc-200">${execPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Institutional Clearing Fee:</span>
                <span className="font-mono text-emerald-400">$0.00 (Zero-Fee Simulation)</span>
              </div>
              <div className="pt-1.5 border-t border-zinc-800 flex items-center justify-between font-bold">
                <span className="text-zinc-200">Estimated Settlement:</span>
                <span className="font-mono text-sm text-amber-400">${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 flex items-start space-x-2 text-[11px]">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Proceed to Explicit Review */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Review & Explicitly Authorize Spot Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* STEP 2: EXPLICIT CONFIRMATION */
          <div className="p-5 space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#090D14] border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-zinc-400 uppercase font-mono text-[10px]">Order Ticket Summary</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  SPOT {side}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <div className="text-[10px] text-zinc-500">Asset</div>
                  <div className="font-bold text-white text-xs">{activeInst.name} ({activeInst.symbol})</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500">Order Type</div>
                  <div className="font-bold text-white text-xs">{orderType}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500">Quantity</div>
                  <div className="font-bold text-amber-400 text-sm">{numQty} {activeInst.symbol.split('/')[0]}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500">Settlement Total</div>
                  <div className="font-bold text-white text-sm">${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>Estimated Cash After Settlement:</span>
                <span className="font-mono text-zinc-200">
                  ${(side === 'BUY' ? availableCash - estimatedTotal : availableCash + estimatedTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </span>
              </div>
            </div>

            {/* Mandatory Explicit User Confirmation Checkbox */}
            <label className="flex items-start space-x-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={userConfirmedCheckbox}
                onChange={(e) => {
                  setUserConfirmedCheckbox(e.target.checked);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="mt-0.5 rounded border-zinc-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer accent-amber-500"
              />
              <span className="text-[11px] text-zinc-300 leading-snug">
                <strong className="text-white">I explicitly authorize this spot trade.</strong> I confirm that I have reviewed the asset, quantity, and execution pricing. I acknowledge that spot executions settle into institutional qualified cold vault custody.
              </span>
            </label>

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

            {/* Action Buttons */}
            <div className="flex items-center space-x-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep('CONFIGURE');
                  setErrorMsg(null);
                }}
                disabled={isSubmitting || !!successMsg}
                className="px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Modify</span>
              </button>

              <button
                type="button"
                onClick={handleFinalExecution}
                disabled={!userConfirmedCheckbox || isSubmitting || !!successMsg}
                className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  side === 'BUY'
                    ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <span>Executing Spot Order...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Authorize & Execute Spot Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
