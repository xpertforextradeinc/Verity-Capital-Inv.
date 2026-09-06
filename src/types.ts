export type UserRole = 'CUSTOMER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AssetType = 'STOCK' | 'CRYPTO' | 'ETF' | 'FOREX';
export type InstrumentStatus = 'ACTIVE' | 'HALTED';

export interface PricePoint {
  time: string;
  price: number;
  volume?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

export interface Instrument {
  id: string;
  symbol: string;
  name: string;
  assetType: AssetType;
  exchange: string;
  currency: string;
  status: InstrumentStatus;
  dataSource: string;
  price: number;
  changeAmount: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap?: number;
  sparkline: number[];
  history: PricePoint[];
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  portfolioId: string;
  instrumentId: string;
  symbol: string;
  name: string;
  assetType: AssetType;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  updatedAt: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  baseCurrency: string;
  simulatedCashBalance: number;
  investedBalance: number;
  totalEquity: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  dayPnl: number;
  dayPnlPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioBalance {
  asset: string;
  available: number;
  locked: number;
  marketValue: number;
  averageCost: number;
  unrealizedPnl: number;
}

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type OrderStatus = 'EXECUTED' | 'PENDING' | 'CANCELLED' | 'REJECTED';

export interface Order {
  id: string;
  userId: string;
  portfolioId: string;
  instrumentId: string;
  symbol: string;
  name: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  requestedPrice: number;
  executedPrice: number;
  totalValue: number;
  status: OrderStatus;
  rejectionReason?: string | null;
  createdAt: string;
  executedAt?: string | null;
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  instrumentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type InsightSentiment = 'BULLISH' | 'BEARISH' | 'NEUTRAL';
export type InsightRiskLevel = 'LOW' | 'MODERATE' | 'HIGH';

export interface AiInsight {
  id: string;
  instrumentId: string;
  symbol: string;
  title: string;
  summary: string;
  keyPoints: string[];
  sentiment: InsightSentiment;
  riskLevel: InsightRiskLevel;
  confidenceScore: number;
  modelName: string;
  promptVersion: string;
  generatedAt: string;
  expiresAt: string;
  disclaimer: string;
}

export interface AuditEvent {
  id: string;
  actorUserId: string;
  actorEmail: string;
  eventType: string;
  targetType: string;
  targetId: string;
  metadataJson: Record<string, any>;
  ipHash: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'ORDER_EXECUTED' | 'PRICE_ALERT' | 'SYSTEM' | 'SECURITY';
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
}

export interface SystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  uptimeSeconds: number;
  cpuUsagePercent: number;
  memoryUsageMb: number;
  dbLatencyMs: number;
  activeUsersCount: number;
  totalOrdersCount: number;
  simulatedFeedStatus: 'RUNNING' | 'PAUSED';
  lastTickTimestamp: string;
  version: string;
}

export interface TradeRequest {
  instrumentId: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  limitPrice?: number;
}

// Custody, Deposit & Withdrawal Types
export type TransferType = 'DEPOSIT_USD' | 'WITHDRAW_USD' | 'DEPOSIT_CRYPTO' | 'WITHDRAW_CRYPTO';
export type TransferStatus = 'PENDING' | 'COMPLETED' | 'CONFIRMED' | 'FAILED';

export interface TransferRecord {
  id: string;
  userId: string;
  type: TransferType;
  asset: 'USD' | 'BTC' | 'ETH' | 'SOL' | 'XRP' | 'ADA';
  amount: number;
  destinationAddress?: string;
  txHash?: string;
  referenceId?: string;
  method?: string; // 'FEDWIRE' | 'ACH' | 'ON_CHAIN'
  status: TransferStatus;
  notes?: string;
  createdAt: string;
  confirmedAt?: string;
}

// US Regulatory Compliance & KYC Profile
export type KycTier = 'TIER_0_UNVERIFIED' | 'TIER_1_VERIFIED' | 'TIER_2_INSTITUTIONAL';

export interface KycProfile {
  userId: string;
  tier: KycTier;
  legalFirstName: string;
  legalLastName: string;
  dateOfBirth?: string;
  ssnLastFour?: string;
  usState?: string;
  cipStatus: 'PASSED' | 'PENDING' | 'IN_REVIEW';
  ofacScreening: 'CLEARED' | 'FLAGGED';
  w9Attestation: boolean;
  dailyWithdrawalLimitUsd: number;
  verifiedAt?: string;
}

export interface FactualCryptoAsset {
  symbol: 'BTC' | 'ETH' | 'SOL' | 'XRP' | 'ADA';
  name: string;
  consensusMechanism: string;
  genesisYear: number;
  maxSupply: string;
  circulatingSupply: string;
  regulatoryClassification: string;
  averageBlockTime: string;
  cryptographicStandard: string;
  networkUtility: string;
  institutionalCustodianSupport: string[];
}

// Interactive Institutional Broker Assistant Types
export interface BrokerChatMessage {
  id: string;
  sender: 'USER' | 'BROKER';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'NAVIGATE' | 'SPOT_TRADE_DRAFT' | 'CUSTODY_TRANSFER' | 'KYC_ONBOARDING' | 'FACTUAL_SPECS';
    label: string;
    payload?: any;
  };
}

export interface BrokerChatResponse {
  reply: string;
  suggestedAction?: {
    type: 'NAVIGATE' | 'SPOT_TRADE_DRAFT' | 'CUSTODY_TRANSFER' | 'KYC_ONBOARDING' | 'FACTUAL_SPECS';
    label: string;
    payload?: any;
  };
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}


