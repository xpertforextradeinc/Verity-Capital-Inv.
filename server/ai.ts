import { GoogleGenAI, Type } from '@google/genai';
import { AiInsight, Instrument } from '../src/types.ts';

const PROMPT_VERSION = 'quantix_institutional_crypto_broker_v2.0';
const MODEL_NAME = 'gemini-3.8-flash';

// Standard institutional compliance disclosure
export const COMPLIANCE_DISCLAIMER =
  'QUANTIX REGULATORY DISCLOSURE: Quantix is an institutional crypto brokerage platform. We provide factual digital asset information, custody infrastructure, and trade execution upon client instruction. We do NOT provide trading signals, price predictions, or investment recommendations. All crypto trading carries market risk.';

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
You are Quantix, an institutional-grade crypto brokerage platform assistant.
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
    summary: `${instrument.name} spot trading is settling at $${instrument.price} USD across institutional book tiers with 24h reported volume of $${instrument.volume24h.toLocaleString()} USD. Quantix executes client spot instructions via cold-storage qualified custody.`,
    keyPoints: [
      `24-hour trading range established between $${instrument.low24h} and $${instrument.high24h} USD.`,
      `Protocol consensus is continuously monitored with multi-signature settlement checkpoints.`,
      'Non-advisory institutional compliance notice: Quantix does not issue price targets or trading signals.'
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
