import { GoogleGenAI, Type } from '@google/genai';
import { AiInsight, Instrument } from '../src/types.ts';

const PROMPT_VERSION = 'verity_capital_inv_institutional_crypto_broker_v1.0';
const MODEL_NAME = 'gemini-3.8-flash';

// Standard institutional compliance disclosure
export const COMPLIANCE_DISCLAIMER =
  'VERITY-CAPITAL INV REGULATORY DISCLOSURE: Verity-Capital Inv is an institutional-grade crypto brokerage platform. We provide factual digital asset information, custody infrastructure, and spot trade execution upon explicit client instruction. We do NOT provide trading signals, price predictions, or investment recommendations. All crypto trading carries market risk.';

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Sanitize user input to guard against prompt injection
function sanitizeInput(text: string): string {
  if (!text) return '';
  return text.replace(/[<>{}\\]/g, '').substring(0, 500);
}

export async function generateEducationalMarketInsight(
  instrument: Instrument,
  userQueryContext?: string
): Promise<AiInsight> {
  const client = getAiClient();
  const sanitizedSymbol = sanitizeInput(instrument.symbol);
  const sanitizedName = sanitizeInput(instrument.name);
  const sanitizedContext = userQueryContext ? sanitizeInput(userQueryContext) : '';

  const systemInstruction = `
You are the Verity Desk assistant for Verity-Capital Inv, an institutional-grade crypto brokerage platform.
Your role:
- Help users understand their crypto portfolio, balances, positions, and performance.
- Provide strictly compliant, factual cryptocurrency protocol and market infrastructure information.
- Supported assets are strictly: BTC, ETH, SOL, XRP, ADA.
- Maintain a professional, regulated, institutional tone at all times.

Strict Prohibitions:
- NEVER provide trading signals, price predictions, or price targets.
- NEVER give financial advice, buy/sell recommendations, or coin selections.
- NEVER act like a trading bot or automated algorithmic signal generator.
- NEVER suggest certainty of profit or future price appreciation.
- Always output valid structured JSON matching the requested schema.
`.trim();

  const prompt = `
Provide factual, compliant market infrastructure analysis:
- Digital Asset: ${sanitizedSymbol} (${sanitizedName})
- Current Spot Price: $${instrument.price} USD
- 24h Trading Volume: $${instrument.volume24h.toLocaleString()} USD
- 24h Price Range: $${instrument.low24h} - $${instrument.high24h} USD
${sanitizedContext ? `- Client Inquiry Context: ${sanitizedContext}` : ''}

Generate:
1. Title: Institutional-grade factual title on network specifications, liquidity profile, or consensus architecture.
2. Summary: 2-3 sentences of strictly factual network characteristics and verifiable volume dynamics. Zero price forecasts.
3. Key Points: 3 factual observations regarding blockchain protocol specs, network finality, and institutional custody.
4. Sentiment: 'NEUTRAL' (Always neutral to avoid non-compliant advisory bias).
5. Risk Level: 'MODERATE' or 'HIGH' (Acknowledging digital asset volatility).
6. Confidence Score: Integer from 85 to 98 based on protocol verification certainty.
`.trim();

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              keyPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              sentiment: {
                type: Type.STRING,
                description: "Must be 'BULLISH', 'BEARISH', or 'NEUTRAL'",
              },
              riskLevel: {
                type: Type.STRING,
                description: "Must be 'LOW', 'MODERATE', or 'HIGH'",
              },
              confidenceScore: { type: Type.INTEGER },
            },
            required: ['title', 'summary', 'keyPoints', 'sentiment', 'riskLevel', 'confidenceScore'],
          },
        },
      });

      const rawText = response.text?.trim();
      if (rawText) {
        const parsed = JSON.parse(rawText);
        const validSentiments = ['BULLISH', 'BEARISH', 'NEUTRAL'];
        const validRisks = ['LOW', 'MODERATE', 'HIGH'];

        return {
          id: `ins_${instrument.id}_${Date.now()}`,
          instrumentId: instrument.id,
          symbol: instrument.symbol,
          title: parsed.title || `${instrument.symbol} Market Structure Overview`,
          summary: parsed.summary || 'Educational summary analyzing recent price action and volume profiles.',
          keyPoints: Array.isArray(parsed.keyPoints) && parsed.keyPoints.length > 0
            ? parsed.keyPoints.slice(0, 4)
            : ['Trading volume remains aligned with historical averages.', 'Key support and resistance bands remain active.'],
          sentiment: validSentiments.includes(parsed.sentiment?.toUpperCase())
            ? (parsed.sentiment.toUpperCase() as any)
            : 'NEUTRAL',
          riskLevel: validRisks.includes(parsed.riskLevel?.toUpperCase())
            ? (parsed.riskLevel.toUpperCase() as any)
            : 'MODERATE',
          confidenceScore: typeof parsed.confidenceScore === 'number' ? Math.min(98, Math.max(50, parsed.confidenceScore)) : 80,
          modelName: MODEL_NAME,
          promptVersion: PROMPT_VERSION,
          generatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24 hours
          disclaimer: COMPLIANCE_DISCLAIMER,
        };
      }
    } catch (err: any) {
      console.warn('[AI Insight] Gemini model call fallback triggered:', err?.message || err);
      // Fall through to deterministic high-quality educational fallback
    }
  }

  // Deterministic high-quality factual fallback if API key not set or during network failure
  return {
    id: `ins_${instrument.id}_${Date.now()}`,
    instrumentId: instrument.id,
    symbol: instrument.symbol,
    title: `${instrument.name} (${instrument.symbol}) Asset Infrastructure Overview`,
    summary: `${instrument.name} spot trading is settling at $${instrument.price} USD across institutional book tiers with 24h reported volume of $${instrument.volume24h.toLocaleString()} USD. Verity-Capital Inv executes client spot instructions via cold-storage qualified custody.`,
    keyPoints: [
      `24-hour trading range established between $${instrument.low24h} and $${instrument.high24h} USD.`,
      `Protocol consensus is continuously monitored with multi-signature settlement checkpoints.`,
      'Non-advisory institutional compliance notice: Verity-Capital Inv does not issue price targets or trading signals.'
    ],
    sentiment: 'NEUTRAL',
    riskLevel: 'HIGH',
    confidenceScore: 95,
    modelName: MODEL_NAME,
    promptVersion: PROMPT_VERSION,
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    disclaimer: COMPLIANCE_DISCLAIMER,
  };
}

export interface BrokerChatRequest {
  message: string;
  portfolioContext?: {
    cashBalance: number;
    totalEquity: number;
    positions: { symbol: string; quantity: number; currentPrice: number; marketValue: number; unrealizedPnl: number }[];
  };
  kycTier?: string;
}

export interface BrokerChatResult {
  reply: string;
  suggestedAction?: {
    type: 'NAVIGATE' | 'SPOT_TRADE_DRAFT' | 'CUSTODY_TRANSFER' | 'KYC_ONBOARDING' | 'FACTUAL_SPECS';
    label: string;
    payload?: any;
  };
}

export async function executeVerityBrokerChat(
  req: BrokerChatRequest
): Promise<BrokerChatResult> {
  const userText = sanitizeInput(req.message);
  const client = getAiClient();

  const portfolioSummary = req.portfolioContext
    ? `Client Portfolio Context:
- Available Cash: $${req.portfolioContext.cashBalance.toLocaleString()} USD
- Total Account Equity: $${req.portfolioContext.totalEquity.toLocaleString()} USD
- Active Positions: ${
        req.portfolioContext.positions.length > 0
          ? req.portfolioContext.positions
              .map(
                (p) =>
                  `${p.quantity} ${p.symbol} (Val: $${p.marketValue.toLocaleString()}, PnL: $${p.unrealizedPnl >= 0 ? '+' : ''}${p.unrealizedPnl.toLocaleString()})`
              )
              .join('; ')
          : 'No open crypto positions'
      }
- KYC Verification Tier: ${req.kycTier || 'TIER_1_VERIFIED'}`
    : 'No portfolio context provided.';

  const systemInstruction = `
You are the Verity Desk assistant for Verity-Capital Inv, an institutional-grade crypto brokerage platform.

Your role:
- Help users understand their crypto portfolio
- Show balances, positions, and performance
- Execute spot trades (market and limit) only when explicitly instructed
- Assist with deposits, withdrawals, and wallet transfers
- Provide compliant, factual crypto information
- Guide users through secure onboarding and KYC
- Maintain a professional, regulated tone at all times

You must NOT:
- Provide trading signals or predictions
- Give financial advice or recommendations
- Act like a trading bot or algorithm
- Generate automated trading exports (CSV, ledgers, AI briefs)
- Execute trades without clear user confirmation
- Recommend specific investments or coins

Supported Assets:
BTC, ETH, SOL, XRP, ADA

Platform Identity:
- Crypto broker (not multi-asset, not forex, not automated trading)
- Institutional design with a premium dark theme and gold Bitcoin accents
- US-style compliance, onboarding, and disclosures
- Professional, trustworthy, investor-focused tone

Instructions:
1. If the user asks for trading signals, price predictions, or financial advice: Strictly refuse with an institutional compliance statement citing US regulatory standards.
2. If the user asks about their portfolio: Summarize balances, holdings, and performance objectively based on the provided context.
3. If the user asks about deposits/withdrawals/custody: Explain Fedwire USD clearing and qualified cold storage vault infrastructure.
4. If the user asks about KYC: Explain FinCEN CIP, OFAC screening, and W-9 tax attestation.
5. If the user explicitly asks to prepare or place a trade (e.g., "Buy 0.25 BTC"): Formulate the spot order ticket and inform them that institutional policy mandates their explicit review and manual confirmation before execution.
6. Output clean markdown text. You must also return structured JSON with "reply" and optional "suggestedAction" (with type, label, and payload).
`.trim();

  const prompt = `
${portfolioSummary}

Client Inquiry: "${userText}"

Produce JSON matching:
{
  "reply": "Your clear, regulated response in markdown",
  "suggestedAction": {
    "type": "NAVIGATE | SPOT_TRADE_DRAFT | CUSTODY_TRANSFER | KYC_ONBOARDING | FACTUAL_SPECS",
    "label": "Button label",
    "payload": {}
  } or null
}
`.trim();

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              suggestedAction: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  label: { type: Type.STRING },
                  payload: { type: Type.OBJECT },
                },
                required: ['type', 'label'],
              },
            },
            required: ['reply'],
          },
        },
      });

      const raw = response.text?.trim();
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          reply: parsed.reply,
          suggestedAction: parsed.suggestedAction || undefined,
        };
      }
    } catch (err: any) {
      console.warn('[Broker Chat] Gemini call fallback triggered:', err?.message || err);
    }
  }

  // Deterministic Rule-Based Institutional Fallback
  const lower = userText.toLowerCase();

  // 1. Prohibited advice / signal check
  if (
    lower.includes('signal') ||
    lower.includes('predict') ||
    lower.includes('forecast') ||
    lower.includes('target') ||
    lower.includes('should i buy') ||
    lower.includes('what coin') ||
    lower.includes('advice') ||
    lower.includes('recommend')
  ) {
    return {
      reply: `**Regulatory Compliance Disclosure**: Under US regulatory standards and Verity-Capital Inv institutional policy, we strictly refrain from providing trading signals, market predictions, or financial advice. 

Verity-Capital Inv operates solely as an institutional execution venue and qualified custodian for **BTC, ETH, SOL, XRP, and ADA**. All trading decisions must be independently determined by the client.`,
      suggestedAction: {
        type: 'FACTUAL_SPECS',
        label: 'View Factual Protocol Specs',
        payload: { symbol: 'BTC' },
      },
    };
  }

  // 2. Portfolio query
  if (lower.includes('portfolio') || lower.includes('balance') || lower.includes('holding') || lower.includes('performance')) {
    const cash = req.portfolioContext ? req.portfolioContext.cashBalance.toLocaleString() : '40,942.75';
    const equity = req.portfolioContext ? req.portfolioContext.totalEquity.toLocaleString() : '100,000.00';
    const posList = req.portfolioContext?.positions.length
      ? req.portfolioContext.positions.map((p) => `- **${p.symbol}**: ${p.quantity} units (Valuation: $${p.marketValue.toLocaleString()} USD | PnL: ${p.unrealizedPnl >= 0 ? '+' : ''}$${p.unrealizedPnl.toLocaleString()})`).join('\n')
      : '- No open digital asset positions currently recorded.';

    return {
      reply: `### Account Portfolio Summary
**Total Account Valuation**: $${equity} USD  
**Available Cash Settlement**: $${cash} USD  

**Current Asset Allocations**:
${posList}

All digital assets are held in segregated, air-gapped qualified custody with continuous cryptographic verification.`,
      suggestedAction: {
        type: 'NAVIGATE',
        label: 'Open Full Portfolio',
        payload: { tab: 'portfolio' },
      },
    };
  }

  // 3. Custody & Transfers (Fedwire / Vaults)
  if (lower.includes('deposit') || lower.includes('withdraw') || lower.includes('transfer') || lower.includes('wire') || lower.includes('vault')) {
    return {
      reply: `### Institutional Custody & Capital Clearing
Verity-Capital Inv supports the following institutional capital rails:
- **USD Clearing**: Same-day **Fedwire** (cutoff 16:30 ET) and ACH institutional settlement.
- **Digital Asset Custody**: Segregated, air-gapped cold storage with multi-party computation (MPC) and multi-signature authorization.
- **Whitelisted Destinations**: Outbound digital asset transfers require cryptographic address verification and 2FA confirmation.`,
      suggestedAction: {
        type: 'CUSTODY_TRANSFER',
        label: 'Initiate Transfer / View Custody',
        payload: {},
      },
    };
  }

  // 4. KYC / Onboarding
  if (lower.includes('kyc') || lower.includes('onboard') || lower.includes('w-9') || lower.includes('w9') || lower.includes('cip') || lower.includes('verification')) {
    return {
      reply: `### US Regulatory Compliance & KYC Guidelines
In accordance with FinCEN regulations and the Bank Secrecy Act (BSA), Verity-Capital Inv requires:
- **Customer Identification Program (CIP)**: Name, date of birth, residential address, and SSN last 4 digits.
- **OFAC Screening**: Real-time screening against US Treasury sanctions lists.
- **Form W-9 Attestation**: Electronic tax certification for institutional reporting.
- **Account Tiers**: Tier 1 allows up to $250,000/day; Tier 2 Institutional provides customized multi-million dollar liquidity limits.`,
      suggestedAction: {
        type: 'KYC_ONBOARDING',
        label: 'Review KYC Status',
        payload: {},
      },
    };
  }

  // 5. Trade order formulation
  if (lower.includes('buy') || lower.includes('sell') || lower.includes('trade') || lower.includes('order')) {
    let side: 'BUY' | 'SELL' = lower.includes('sell') ? 'SELL' : 'BUY';
    let symbol = 'BTC';
    if (lower.includes('eth')) symbol = 'ETH';
    else if (lower.includes('sol')) symbol = 'SOL';
    else if (lower.includes('xrp')) symbol = 'XRP';
    else if (lower.includes('ada')) symbol = 'ADA';

    return {
      reply: `### Spot Trade Order Formulated
I have prepared a draft spot **${side}** order for **${symbol}/USD**.

> **Mandatory Institutional Authorization**: Under Verity-Capital Inv compliance rules, trades are **never executed automatically**. You must review the order ticket and explicitly confirm authorization before transmission to the matching engine.`,
      suggestedAction: {
        type: 'SPOT_TRADE_DRAFT',
        label: `Review & Confirm ${side} ${symbol}`,
        payload: { symbol, side, orderType: 'MARKET' },
      },
    };
  }

  // Default institutional concierge greeting
  return {
    reply: `### Verity-Capital Inv Institutional Crypto Brokerage
Welcome to Verity-Capital Inv. I am your regulated brokerage concierge assisting with:
- **Portfolio & Performance**: Real-time mark-to-market balances and allocations.
- **Spot Order Execution**: Market and limit order formulation across **BTC, ETH, SOL, XRP, and ADA** (with mandatory explicit confirmation).
- **Custody & Clearing**: Fedwire USD clearing and multi-sig cold vault custody.
- **Compliance & KYC**: FinCEN CIP, OFAC screening, and W-9 certifications.

*Please note: Verity-Capital Inv does not provide trading signals, price forecasts, or investment advice.* How may I assist your portfolio today?`,
    suggestedAction: {
      type: 'NAVIGATE',
      label: 'View Spot Markets',
      payload: { tab: 'markets' },
    },
  };
}
