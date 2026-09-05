import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Send,
  Sparkles,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Shield,
  FileCheck2,
  Lock,
  DollarSign,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Coins
} from 'lucide-react';
import { BrokerChatMessage, Portfolio, Position, Instrument } from '../../types.ts';
import { api } from '../../services/api.ts';

interface BrokerDeskAssistantProps {
  portfolio: Portfolio | null;
  positions: Position[];
  instruments: Instrument[];
  onOpenTrade: (draft?: { symbol: string; side: 'BUY' | 'SELL'; orderType?: 'MARKET' | 'LIMIT'; quantity?: number }) => void;
  onOpenCustody: () => void;
  onOpenKyc: () => void;
  onOpenSpecs: (symbol?: string) => void;
  onNavigateTab: (tab: string) => void;
}

const INITIAL_MESSAGES: BrokerChatMessage[] = [
  {
    id: 'msg_welcome',
    sender: 'BROKER',
    timestamp: new Date().toISOString(),
    text: `### Welcome to Verity-Capital Inv Institutional Brokerage Desk
I am your institutional crypto broker assistant. I am programmed under strict US compliance guidelines to assist you with:

- **Portfolio & Valuations**: Real-time breakdown of cash balances, spot holdings, and mark-to-market performance.
- **Spot Order Preparation**: Formulating market and limit orders for **BTC, ETH, SOL, XRP, and ADA** (executed *only* upon your explicit confirmation).
- **Custody & Capital Rails**: Fedwire USD clearing and air-gapped qualified cold storage vault transfers.
- **Regulatory Onboarding**: FinCEN CIP verification, OFAC screening, and Form W-9 tax attestations.

*Regulatory Notice: Verity-Capital Inv strictly refrains from providing trading signals, price predictions, or investment advice. All trades require your manual authorization.*`,
  },
];

const PROMPT_SUGGESTIONS = [
  {
    label: 'Portfolio Breakdown',
    query: 'Can you summarize my current crypto portfolio, cash balance, and performance?',
  },
  {
    label: 'Fedwire & Vault Custody',
    query: 'How do I deposit USD via Fedwire or transfer digital assets to qualified cold custody?',
  },
  {
    label: 'Protocol Specifications',
    query: 'What are the consensus mechanisms and supply schedules for Bitcoin and Ethereum?',
  },
  {
    label: 'US KYC & FinCEN CIP',
    query: 'What information is required for US regulatory compliance and Tier 2 verification?',
  },
  {
    label: 'Draft Spot Order: BTC',
    query: 'I would like to buy 0.25 BTC at market. Please prepare the order ticket.',
  },
  {
    label: 'Trading Signals Check',
    query: 'Can you give me trading signals or predict Bitcoin price direction this week?',
  },
];

export const BrokerDeskAssistant: React.FC<BrokerDeskAssistantProps> = ({
  portfolio,
  positions,
  instruments,
  onOpenTrade,
  onOpenCustody,
  onOpenKyc,
  onOpenSpecs,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<BrokerChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMessage: BrokerChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'USER',
      text: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const portfolioContext = portfolio
        ? {
            cashBalance: portfolio.simulatedCashBalance,
            totalEquity: portfolio.totalEquity,
            positions: positions.map((p) => ({
              symbol: p.symbol,
              quantity: p.quantity,
              currentPrice: p.currentPrice,
              marketValue: p.marketValue,
              unrealizedPnl: p.unrealizedPnl,
            })),
          }
        : undefined;

      const res = await api.brokerChat({
        message: query,
        portfolioContext,
        kycTier: 'TIER_1_VERIFIED',
      });

      const brokerReply: BrokerChatMessage = {
        id: `msg_broker_${Date.now()}`,
        sender: 'BROKER',
        text: res.reply,
        timestamp: new Date().toISOString(),
        suggestedAction: res.suggestedAction,
      };

      setMessages((prev) => [...prev, brokerReply]);
    } catch (err: any) {
      const errorReply: BrokerChatMessage = {
        id: `msg_error_${Date.now()}`,
        sender: 'BROKER',
        text: 'The Verity-Capital Inv Institutional Broker Desk is momentarily unavailable. Please try again shortly.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: BrokerChatMessage['suggestedAction']) => {
    if (!action) return;
    switch (action.type) {
      case 'SPOT_TRADE_DRAFT':
        onOpenTrade(action.payload);
        break;
      case 'CUSTODY_TRANSFER':
        onOpenCustody();
        break;
      case 'KYC_ONBOARDING':
        onOpenKyc();
        break;
      case 'FACTUAL_SPECS':
        onOpenSpecs(action.payload?.symbol);
        break;
      case 'NAVIGATE':
        if (action.payload?.tab) {
          onNavigateTab(action.payload.tab);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Institutional Header */}
      <div className="bg-gradient-to-r from-[#0C101A] via-[#101726] to-[#0A0D15] border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30 font-bold flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Verity Institutional Concierge</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>US Regulated Architecture</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
                Strict Non-Advisory Guardrails
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-2 flex items-center space-x-2">
              <span>Institutional Brokerage Desk</span>
            </h1>
            <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
              Your compliant gateway for portfolio telemetry, spot trade draft formulation, qualified cold vault custody, and protocol specifications across supported assets: <strong className="text-amber-400 font-mono">BTC, ETH, SOL, XRP, ADA</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-[#090D14] border border-amber-500/20 rounded-xl text-xs space-y-1.5 shrink-0">
            <div className="text-zinc-400 text-[10px] uppercase font-mono tracking-wider">Asset Coverage Policy</div>
            <div className="flex items-center space-x-1.5 font-mono text-xs font-bold text-amber-400">
              <Coins className="w-3.5 h-3.5" />
              <span>BTC • ETH • SOL • XRP • ADA</span>
            </div>
            <div className="text-[10px] text-zinc-500">No forex • No automated trading</div>
          </div>
        </div>
      </div>

      {/* Suggested Quick Inquiries Ribbon */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
        <span className="text-[11px] uppercase font-mono text-zinc-400 shrink-0 flex items-center space-x-1">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Topics:</span>
        </span>
        {PROMPT_SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(s.query)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-[#0C101A] border border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-800/80 text-zinc-300 hover:text-white text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Main Broker Terminal Window */}
      <div className="bg-[#0A0D15] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col h-[560px] overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-[#0E121D] border-b border-zinc-800 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Verity-Capital Inv Broker Terminal • Live Session
            </span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-zinc-400 font-mono">
            <span>Execution: Spot Only</span>
            <span>•</span>
            <span className="text-amber-400">Confirmation Required</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'USER' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center space-x-2 mb-1 px-1 text-[10px] text-zinc-500 font-mono">
                <span>{m.sender === 'USER' ? 'Client Instruction' : 'Verity-Capital Inv Broker Desk'}</span>
                <span>•</span>
                <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 shadow-md ${
                  m.sender === 'USER'
                    ? 'bg-amber-600/20 border border-amber-500/40 text-amber-100 rounded-tr-sm'
                    : 'bg-[#0E1322] border border-zinc-800 text-zinc-200 rounded-tl-sm'
                }`}
              >
                <div className="prose prose-invert prose-xs max-w-none space-y-2 leading-relaxed whitespace-pre-wrap">
                  {m.text}
                </div>

                {/* Interactive Action Card if suggested by Verity-Capital Inv */}
                {m.suggestedAction && (
                  <div className="mt-3 pt-3 border-t border-zinc-700/60 flex items-center justify-between gap-3">
                    <div className="text-[11px] font-mono text-amber-300 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Action prepared: {m.suggestedAction.label}</span>
                    </div>
                    <button
                      onClick={() => handleActionClick(m.suggestedAction)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center space-x-1.5 cursor-pointer shrink-0"
                    >
                      <span>Authorize / Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-2">
              <div className="bg-[#0E1322] border border-zinc-800 rounded-2xl rounded-tl-sm p-4 text-xs text-zinc-400 flex items-center space-x-2.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Evaluating institutional parameters & regulatory compliance...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#0B0F19] border-t border-zinc-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-3"
          >
            <input
              type="text"
              placeholder="Ask about your portfolio, custody rails, factual specs, or formulate a spot order..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-sans transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <span>Transmit</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Compliance Bottom Footer */}
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>US Regulatory Disclosures Enforced • Spot Orders Require Explicit Confirmation</span>
            </span>
            <span>Assets: BTC, ETH, SOL, XRP, ADA</span>
          </div>
        </div>
      </div>
    </div>
  );
};
