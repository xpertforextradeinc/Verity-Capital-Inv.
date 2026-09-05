import {
  User,
  Instrument,
  Position,
  Portfolio,
  Order,
  Watchlist,
  AiInsight,
  AuditEvent,
  AppNotification,
  SystemHealth,
  TransferRecord,
  KycProfile
} from '../src/types.ts';

// Decimal-safe arithmetic helpers to avoid JS floating point errors
export function roundDecimal(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calcOrderTotal(quantity: number, price: number): number {
  return roundDecimal(quantity * price, 2);
}

// In-Memory Database State
class VerityDatabase {
  users: Map<string, User> = new Map();
  passwords: Map<string, string> = new Map(); // In a full prod DB, argon2/bcrypt hash
  portfolios: Map<string, Portfolio> = new Map();
  positions: Map<string, Position[]> = new Map(); // portfolioId -> positions
  orders: Map<string, Order> = new Map();
  instruments: Map<string, Instrument> = new Map();
  watchlists: Map<string, Watchlist[]> = new Map(); // userId -> watchlists
  insights: Map<string, AiInsight> = new Map();
  transfers: Map<string, TransferRecord[]> = new Map(); // userId -> TransferRecord[]
  kycProfiles: Map<string, KycProfile> = new Map(); // userId -> KycProfile
  auditEvents: AuditEvent[] = [];
  notifications: Map<string, AppNotification[]> = new Map(); // userId -> notifications
  systemStartTime: number = Date.now();
  feedInterval: NodeJS.Timeout | null = null;
  feedRunning: boolean = true;

  constructor() {
    this.seedInitialData();
    this.startSimulatedPriceFeed();
  }

  private seedInitialData() {
    const now = new Date().toISOString();

    // 1. Seed Users
    const customerUser: User = {
      id: 'usr_customer_alex',
      email: 'alex.morgan@example.com',
      firstName: 'Alex',
      lastName: 'Morgan',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerifiedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const adminUser: User = {
      id: 'usr_admin_verity_capital_inv',
      email: 'admin@verity-capital.com',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerifiedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(customerUser.id, customerUser);
    this.passwords.set(customerUser.email.toLowerCase(), 'Customer123!');

    this.users.set(adminUser.id, adminUser);
    this.passwords.set(adminUser.email.toLowerCase(), 'Admin123!');

    // 2. Seed Instruments
    const instrumentsList: Omit<Instrument, 'sparkline' | 'history'>[] = [
      {
        id: 'inst_btc',
        symbol: 'BTC/USD',
        name: 'Bitcoin',
        assetType: 'CRYPTO',
        exchange: 'GLOBAL_CRYPTO',
        currency: 'USD',
        status: 'ACTIVE',
        dataSource: 'SIMULATED_FEED',
        price: 64250.00,
        changeAmount: 1420.00,
        changePercent: 2.26,
        high24h: 65100.00,
        low24h: 62400.00,
        volume24h: 28400000000,
        marketCap: 1260000000000,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'inst_eth',
        symbol: 'ETH/USD',
        name: 'Ethereum',
        assetType: 'CRYPTO',
        exchange: 'GLOBAL_CRYPTO',
        currency: 'USD',
        status: 'ACTIVE',
        dataSource: 'SIMULATED_FEED',
        price: 3480.50,
        changeAmount: -45.00,
        changePercent: -1.28,
        high24h: 3560.00,
        low24h: 3420.00,
        volume24h: 14200000000,
        marketCap: 418000000000,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'inst_sol',
        symbol: 'SOL/USD',
        name: 'Solana',
        assetType: 'CRYPTO',
        exchange: 'GLOBAL_CRYPTO',
        currency: 'USD',
        status: 'ACTIVE',
        dataSource: 'SIMULATED_FEED',
        price: 152.40,
        changeAmount: 6.80,
        changePercent: 4.67,
        high24h: 156.00,
        low24h: 144.50,
        volume24h: 4200000000,
        marketCap: 71000000000,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'inst_xrp',
        symbol: 'XRP/USD',
        name: 'Ripple',
        assetType: 'CRYPTO',
        exchange: 'GLOBAL_CRYPTO',
        currency: 'USD',
        status: 'ACTIVE',
        dataSource: 'SIMULATED_FEED',
        price: 0.52,
        changeAmount: 0.01,
        changePercent: 1.96,
        high24h: 0.54,
        low24h: 0.50,
        volume24h: 1200000000,
        marketCap: 28000000000,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'inst_ada',
        symbol: 'ADA/USD',
        name: 'Cardano',
        assetType: 'CRYPTO',
        exchange: 'GLOBAL_CRYPTO',
        currency: 'USD',
        status: 'ACTIVE',
        dataSource: 'SIMULATED_FEED',
        price: 0.44,
        changeAmount: -0.02,
        changePercent: -4.34,
        high24h: 0.47,
        low24h: 0.43,
        volume24h: 350000000,
        marketCap: 15500000000,
        createdAt: now,
        updatedAt: now,
      }
    ];

    for (const item of instrumentsList) {
      const history = this.generateHistoricalCandles(item.price, item.changePercent);
      const sparkline = history.slice(-20).map(h => h.price);
      this.instruments.set(item.id, {
        ...item,
        sparkline,
        history,
      });
    }

    // 3. Seed Portfolio for Customer (Crypto Only)
    const customerPortfolioId = 'port_customer_alex';
    const initialCash = 40942.75;

    const initialPositions: Position[] = [
      {
        id: 'pos_1',
        portfolioId: customerPortfolioId,
        instrumentId: 'inst_btc',
        symbol: 'BTC/USD',
        name: 'Bitcoin',
        assetType: 'CRYPTO',
        quantity: 0.5,
        averagePrice: 58000.00,
        currentPrice: 64250.00,
        marketValue: roundDecimal(0.5 * 64250.00),
        unrealizedPnl: roundDecimal(0.5 * (64250.00 - 58000.00)),
        unrealizedPnlPercent: roundDecimal(((64250.00 - 58000.00) / 58000.00) * 100),
        updatedAt: now,
      },
      {
        id: 'pos_2',
        portfolioId: customerPortfolioId,
        instrumentId: 'inst_eth',
        symbol: 'ETH/USD',
        name: 'Ethereum',
        assetType: 'CRYPTO',
        quantity: 4.5,
        averagePrice: 3100.00,
        currentPrice: 3480.50,
        marketValue: roundDecimal(4.5 * 3480.50),
        unrealizedPnl: roundDecimal(4.5 * (3480.50 - 3100.00)),
        unrealizedPnlPercent: roundDecimal(((3480.50 - 3100.00) / 3100.00) * 100),
        updatedAt: now,
      },
      {
        id: 'pos_3',
        portfolioId: customerPortfolioId,
        instrumentId: 'inst_sol',
        symbol: 'SOL/USD',
        name: 'Solana',
        assetType: 'CRYPTO',
        quantity: 25,
        averagePrice: 140.00,
        currentPrice: 152.40,
        marketValue: roundDecimal(25 * 152.40),
        unrealizedPnl: roundDecimal(25 * (152.40 - 140.00)),
        unrealizedPnlPercent: roundDecimal(((152.40 - 140.00) / 140.00) * 100),
        updatedAt: now,
      },
      {
        id: 'pos_4',
        portfolioId: customerPortfolioId,
        instrumentId: 'inst_xrp',
        symbol: 'XRP/USD',
        name: 'Ripple',
        assetType: 'CRYPTO',
        quantity: 8000,
        averagePrice: 0.49,
        currentPrice: 0.52,
        marketValue: roundDecimal(8000 * 0.52),
        unrealizedPnl: roundDecimal(8000 * (0.52 - 0.49)),
        unrealizedPnlPercent: roundDecimal(((0.52 - 0.49) / 0.49) * 100),
        updatedAt: now,
      },
      {
        id: 'pos_5',
        portfolioId: customerPortfolioId,
        instrumentId: 'inst_ada',
        symbol: 'ADA/USD',
        name: 'Cardano',
        assetType: 'CRYPTO',
        quantity: 7500,
        averagePrice: 0.42,
        currentPrice: 0.44,
        marketValue: roundDecimal(7500 * 0.44),
        unrealizedPnl: roundDecimal(7500 * (0.44 - 0.42)),
        unrealizedPnlPercent: roundDecimal(((0.44 - 0.42) / 0.42) * 100),
        updatedAt: now,
      }
    ];

    const investedTotal = roundDecimal(initialPositions.reduce((sum, p) => sum + p.marketValue, 0));
    const totalUnrealized = roundDecimal(initialPositions.reduce((sum, p) => sum + p.unrealizedPnl, 0));

    const customerPortfolio: Portfolio = {
      id: customerPortfolioId,
      userId: customerUser.id,
      baseCurrency: 'USD',
      simulatedCashBalance: initialCash,
      investedBalance: investedTotal,
      totalEquity: roundDecimal(initialCash + investedTotal),
      unrealizedPnl: totalUnrealized,
      unrealizedPnlPercent: roundDecimal((totalUnrealized / (investedTotal - totalUnrealized || 1)) * 100),
      dayPnl: 642.80,
      dayPnlPercent: 0.65,
      createdAt: now,
      updatedAt: now,
    };

    this.portfolios.set(customerUser.id, customerPortfolio);
    this.positions.set(customerPortfolioId, initialPositions);

    // 4. Seed Orders for Customer (Crypto Spot Only)
    const ordersList: Order[] = [
      {
        id: 'ord_1',
        userId: customerUser.id,
        portfolioId: customerPortfolioId,
        instrumentId: 'inst_btc',
        symbol: 'BTC/USD',
        name: 'Bitcoin',
        side: 'BUY',
        orderType: 'MARKET',
        quantity: 0.28,
        requestedPrice: 62400.00,
        executedPrice: 62400.00,
        totalValue: 17472.00,
        status: 'EXECUTED',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        executedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'ord_2',
        userId: customerUser.id,
        portfolioId: customerPortfolioId,
        instrumentId: 'inst_eth',
        symbol: 'ETH/USD',
        name: 'Ethereum',
        side: 'BUY',
        orderType: 'MARKET',
        quantity: 2.5,
        requestedPrice: 3410.00,
        executedPrice: 3410.00,
        totalValue: 8525.00,
        status: 'EXECUTED',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        executedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'ord_3',
        userId: customerUser.id,
        portfolioId: customerPortfolioId,
        instrumentId: 'inst_btc',
        symbol: 'BTC/USD',
        name: 'Bitcoin',
        side: 'BUY',
        orderType: 'MARKET',
        quantity: 0.22,
        requestedPrice: 61500.00,
        executedPrice: 61500.00,
        totalValue: 13530.00,
        status: 'EXECUTED',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        executedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'ord_4',
        userId: customerUser.id,
        portfolioId: customerPortfolioId,
        instrumentId: 'inst_xrp',
        symbol: 'XRP/USD',
        name: 'Ripple',
        side: 'BUY',
        orderType: 'LIMIT',
        quantity: 4000,
        requestedPrice: 0.50,
        executedPrice: 0,
        totalValue: 2000.00,
        status: 'PENDING',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        executedAt: null,
      },
    ];

    for (const ord of ordersList) {
      this.orders.set(ord.id, ord);
    }

    // 5. Seed Watchlists (Strictly Crypto)
    const customerWatchlists: Watchlist[] = [
      {
        id: 'wl_primary',
        userId: customerUser.id,
        name: 'Institutional Core Holdings',
        instrumentIds: ['inst_btc', 'inst_eth', 'inst_sol'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'wl_all_crypto',
        userId: customerUser.id,
        name: 'All Supported Spot Pairs',
        instrumentIds: ['inst_btc', 'inst_eth', 'inst_sol', 'inst_xrp', 'inst_ada'],
        createdAt: now,
        updatedAt: now,
      }
    ];
    this.watchlists.set(customerUser.id, customerWatchlists);

    // 6. Seed Factual, Regulated Asset Intelligence (Non-advisory, zero price predictions)
    const btcInsight: AiInsight = {
      id: 'ins_btc_1',
      instrumentId: 'inst_btc',
      symbol: 'BTC/USD',
      title: 'Bitcoin (BTC) Protocol Architecture & Commodity Classification',
      summary: 'Bitcoin operates as a decentralized, peer-to-peer digital commodity secured by Proof-of-Work (PoW) SHA-256 consensus. It features a mathematically finite supply cap of 21,000,000 coins with quadrennial supply issuance halving cycles. Recognized by the US CFTC as a digital commodity.',
      keyPoints: [
        'Consensus & Security: SHA-256 Proof of Work with 10-minute target block times and difficulty adjustment every 2016 blocks.',
        'Supply Structure: 21M hard cap; current circulating supply is ~19.7M BTC with halving-controlled block subsidies.',
        'Regulatory Framework: Classified under US law as a digital commodity; traded via spot brokerage and regulated derivatives venues.'
      ],
      sentiment: 'NEUTRAL',
      riskLevel: 'MODERATE',
      confidenceScore: 99,
      modelName: 'gemini-3.8-flash',
      promptVersion: 'verity_capital_inv_factual_crypto_v2.0',
      generatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 72).toISOString(),
      disclaimer: 'FOR FACTUAL & EDUCATIONAL PURPOSES ONLY. Verity-Capital Inv provides strictly compliant, non-advisory asset information. We do not provide trading signals, price predictions, or investment advice.'
    };

    const ethInsight: AiInsight = {
      id: 'ins_eth_1',
      instrumentId: 'inst_eth',
      symbol: 'ETH/USD',
      title: 'Ethereum (ETH) Network Specifications & Proof-of-Stake Consensus',
      summary: 'Ethereum is a decentralized global compute and smart contract execution layer running the Ethereum Virtual Machine (EVM). Consensus transitioned to Proof-of-Stake (PoS) via The Merge, utilizing validators requiring 32 ETH stakes and EIP-1559 base fee burning.',
      keyPoints: [
        'Consensus & Staking: Proof-of-Stake validator network with 12-second slot intervals and beacon chain finality.',
        'Economic Mechanics: EIP-1559 burns a variable portion of base transaction fees, linking circulating supply to network utilization.',
        'Institutional Custody: Widely supported across qualified US crypto custodians with ERC-20 token standard interoperability.'
      ],
      sentiment: 'NEUTRAL',
      riskLevel: 'MODERATE',
      confidenceScore: 99,
      modelName: 'gemini-3.8-flash',
      promptVersion: 'verity_capital_inv_factual_crypto_v2.0',
      generatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      expiresAt: new Date(Date.now() + 3600000 * 72).toISOString(),
      disclaimer: 'FOR FACTUAL & EDUCATIONAL PURPOSES ONLY. Verity-Capital Inv provides strictly compliant, non-advisory asset information. We do not provide trading signals, price predictions, or investment advice.'
    };

    this.insights.set('inst_btc', btcInsight);
    this.insights.set('inst_eth', ethInsight);

    // 7. Seed Transfers (Deposits, Withdrawals, Wallet Transfers)
    this.transfers.set(customerUser.id, [
      {
        id: 'tx_1',
        userId: customerUser.id,
        type: 'DEPOSIT_USD',
        asset: 'USD',
        amount: 50000.00,
        method: 'FEDWIRE',
        status: 'COMPLETED',
        notes: 'Institutional Fedwire deposit from JPMorgan Chase Chase Commercial Account',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        confirmedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'tx_2',
        userId: customerUser.id,
        type: 'DEPOSIT_USD',
        asset: 'USD',
        amount: 25000.00,
        method: 'ACH',
        status: 'COMPLETED',
        notes: 'ACH Same-Day Bank Settlement',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        confirmedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'tx_3',
        userId: customerUser.id,
        type: 'DEPOSIT_CRYPTO',
        asset: 'BTC',
        amount: 0.5,
        destinationAddress: 'bc1q9xinstitutionalcoldstoragevault8421',
        txHash: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
        method: 'ON_CHAIN',
        status: 'CONFIRMED',
        notes: 'On-chain deposit via Bitcoin Mainnet (6 network confirmations)',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        confirmedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      }
    ]);

    // 8. Seed KYC Profile (US Regulatory Tier 2 Institutional)
    this.kycProfiles.set(customerUser.id, {
      userId: customerUser.id,
      tier: 'TIER_2_INSTITUTIONAL',
      legalFirstName: 'Alex',
      legalLastName: 'Morgan',
      dateOfBirth: '1988-04-12',
      ssnLastFour: '8421',
      usState: 'California',
      cipStatus: 'PASSED',
      ofacScreening: 'CLEARED',
      w9Attestation: true,
      dailyWithdrawalLimitUsd: 500000,
      verifiedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    });

    // 7. Seed Audit Events
    this.auditEvents.push(
      {
        id: 'aud_1',
        actorUserId: customerUser.id,
        actorEmail: customerUser.email,
        eventType: 'USER_REGISTER',
        targetType: 'USER',
        targetId: customerUser.id,
        metadataJson: { simulatedBalanceGranted: 100000, currency: 'USD' },
        ipHash: 'e3b0c44298fc1c149afbf4c8996fb924',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: 'aud_2',
        actorUserId: customerUser.id,
        actorEmail: customerUser.email,
        eventType: 'ORDER_SIMULATED_EXECUTE',
        targetType: 'ORDER',
        targetId: 'ord_1',
        metadataJson: { symbol: 'NVDA', side: 'BUY', qty: 80, price: 114.20 },
        ipHash: 'e3b0c44298fc1c149afbf4c8996fb924',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'aud_3',
        actorUserId: adminUser.id,
        actorEmail: adminUser.email,
        eventType: 'SYSTEM_STARTUP',
        targetType: 'SYSTEM',
        targetId: 'verity_capital_inv_engine',
        metadataJson: { version: '1.0.0-beta', environment: 'production-vps-ready' },
        ipHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      }
    );

    // 8. Seed Notifications
    this.notifications.set(customerUser.id, [
      {
        id: 'notif_1',
        userId: customerUser.id,
        type: 'SYSTEM',
        title: 'Welcome to Verity-Capital Inv',
        body: 'Your paper trading account has been provisioned with $100,000 in simulated USD capital.',
        readAt: null,
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: 'notif_2',
        userId: customerUser.id,
        type: 'ORDER_EXECUTED',
        title: 'Simulated Order Filled: NVDA',
        body: 'Bought 80 shares of NVDA at $114.20 ($9,136.00).',
        readAt: null,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ]);
  }

  private generateHistoricalCandles(currentPrice: number, changePercent: number): { time: string; price: number }[] {
    const points: { time: string; price: number }[] = [];
    const count = 30;
    const startPrice = roundDecimal(currentPrice / (1 + changePercent / 100));
    let walker = startPrice;

    const now = Date.now();
    for (let i = count; i >= 0; i--) {
      const timeStr = new Date(now - i * 3600000 * 2).toISOString();
      const progress = (count - i) / count;
      const noise = (Math.random() - 0.48) * (currentPrice * 0.012);
      walker = roundDecimal(startPrice + (currentPrice - startPrice) * progress + noise);
      if (i === 0) walker = currentPrice;
      points.push({ time: timeStr, price: Math.max(0.01, walker) });
    }
    return points;
  }

  // Realtime simulated tick engine that updates instrument prices and positions
  private startSimulatedPriceFeed() {
    this.feedInterval = setInterval(() => {
      if (!this.feedRunning) return;

      this.instruments.forEach((instrument) => {
        if (instrument.status === 'HALTED') return;

        // Brownian motion: delta -0.3% to +0.3%
        const volatility = instrument.assetType === 'CRYPTO' ? 0.0035 : 0.0018;
        const delta = (Math.random() - 0.495) * (instrument.price * volatility);
        const newPrice = roundDecimal(Math.max(0.001, instrument.price + delta), instrument.assetType === 'FOREX' ? 4 : 2);

        const changeAmount = roundDecimal(newPrice - (instrument.price - instrument.changeAmount), instrument.assetType === 'FOREX' ? 4 : 2);
        const baseline = newPrice - changeAmount;
        const changePercent = baseline > 0 ? roundDecimal((changeAmount / baseline) * 100, 2) : 0;

        instrument.price = newPrice;
        instrument.changeAmount = changeAmount;
        instrument.changePercent = changePercent;
        if (newPrice > instrument.high24h) instrument.high24h = newPrice;
        if (newPrice < instrument.low24h) instrument.low24h = newPrice;
        instrument.updatedAt = new Date().toISOString();

        // Update sparkline
        instrument.sparkline.push(newPrice);
        if (instrument.sparkline.length > 25) instrument.sparkline.shift();

        // Check if any PENDING limit orders can be filled
        this.checkPendingOrders(instrument);
      });

      // Recalculate positions for all portfolios
      this.recalculateAllPortfolios();
    }, 4000);
  }

  private checkPendingOrders(instrument: Instrument) {
    this.orders.forEach((order) => {
      if (order.status !== 'PENDING' || order.instrumentId !== instrument.id) return;

      let shouldFill = false;
      if (order.side === 'BUY' && instrument.price <= order.requestedPrice) {
        shouldFill = true;
      } else if (order.side === 'SELL' && instrument.price >= order.requestedPrice) {
        shouldFill = true;
      }

      if (shouldFill) {
        this.executePendingOrder(order, instrument.price);
      }
    });
  }

  private executePendingOrder(order: Order, execPrice: number) {
    const portfolio = this.portfolios.get(order.userId);
    if (!portfolio) return;

    const total = calcOrderTotal(order.quantity, execPrice);
    order.executedPrice = execPrice;
    order.totalValue = total;
    order.status = 'EXECUTED';
    order.executedAt = new Date().toISOString();

    if (order.side === 'BUY') {
      portfolio.simulatedCashBalance = roundDecimal(portfolio.simulatedCashBalance - total);
      this.updatePosition(portfolio.id, order.instrumentId, order.symbol, order.name, 'STOCK', order.quantity, execPrice, 'BUY');
    } else {
      portfolio.simulatedCashBalance = roundDecimal(portfolio.simulatedCashBalance + total);
      this.updatePosition(portfolio.id, order.instrumentId, order.symbol, order.name, 'STOCK', order.quantity, execPrice, 'SELL');
    }

    this.addNotification(order.userId, {
      id: `notif_${Date.now()}`,
      userId: order.userId,
      type: 'ORDER_EXECUTED',
      title: `Limit Order Executed: ${order.symbol}`,
      body: `${order.side} ${order.quantity} of ${order.symbol} filled at $${execPrice}.`,
      createdAt: new Date().toISOString(),
    });

    this.logAuditEvent({
      actorUserId: order.userId,
      actorEmail: this.users.get(order.userId)?.email || 'unknown',
      eventType: 'LIMIT_ORDER_FILLED',
      targetType: 'ORDER',
      targetId: order.id,
      metadataJson: { symbol: order.symbol, side: order.side, qty: order.quantity, price: execPrice },
      ipHash: '127.0.0.1_simulated',
    });
  }

  // Position update logic with weighted average price calculation
  public updatePosition(
    portfolioId: string,
    instrumentId: string,
    symbol: string,
    name: string,
    assetType: any,
    quantity: number,
    price: number,
    side: 'BUY' | 'SELL'
  ): Position | null {
    let list = this.positions.get(portfolioId) || [];
    let existingIndex = list.findIndex((p) => p.instrumentId === instrumentId);

    if (side === 'BUY') {
      if (existingIndex >= 0) {
        const existing = list[existingIndex];
        const newQty = roundDecimal(existing.quantity + quantity, 4);
        const newAvg = roundDecimal((existing.quantity * existing.averagePrice + quantity * price) / newQty, 2);
        const marketVal = roundDecimal(newQty * price);
        const unrealizedPnl = roundDecimal(newQty * (price - newAvg));
        const unrealizedPnlPercent = newAvg > 0 ? roundDecimal(((price - newAvg) / newAvg) * 100, 2) : 0;

        list[existingIndex] = {
          ...existing,
          quantity: newQty,
          averagePrice: newAvg,
          currentPrice: price,
          marketValue: marketVal,
          unrealizedPnl,
          unrealizedPnlPercent,
          updatedAt: new Date().toISOString(),
        };
      } else {
        const marketVal = roundDecimal(quantity * price);
        const newPos: Position = {
          id: `pos_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          portfolioId,
          instrumentId,
          symbol,
          name,
          assetType,
          quantity,
          averagePrice: price,
          currentPrice: price,
          marketValue: marketVal,
          unrealizedPnl: 0,
          unrealizedPnlPercent: 0,
          updatedAt: new Date().toISOString(),
        };
        list.push(newPos);
      }
    } else {
      // SELL
      if (existingIndex < 0) return null; // No position to sell
      const existing = list[existingIndex];
      const remainingQty = roundDecimal(existing.quantity - quantity, 4);

      if (remainingQty <= 0.0001) {
        // Fully closed
        list.splice(existingIndex, 1);
      } else {
        const marketVal = roundDecimal(remainingQty * price);
        const unrealizedPnl = roundDecimal(remainingQty * (price - existing.averagePrice));
        const unrealizedPnlPercent = existing.averagePrice > 0 ? roundDecimal(((price - existing.averagePrice) / existing.averagePrice) * 100, 2) : 0;

        list[existingIndex] = {
          ...existing,
          quantity: remainingQty,
          currentPrice: price,
          marketValue: marketVal,
          unrealizedPnl,
          unrealizedPnlPercent,
          updatedAt: new Date().toISOString(),
        };
      }
    }

    this.positions.set(portfolioId, list);
    return list[existingIndex] || null;
  }

  public recalculateAllPortfolios() {
    this.portfolios.forEach((portfolio, userId) => {
      const positions = this.positions.get(portfolio.id) || [];
      let totalInvested = 0;
      let totalUnrealized = 0;

      for (const pos of positions) {
        const inst = this.instruments.get(pos.instrumentId);
        if (inst) {
          pos.currentPrice = inst.price;
          pos.marketValue = roundDecimal(pos.quantity * inst.price);
          pos.unrealizedPnl = roundDecimal(pos.quantity * (inst.price - pos.averagePrice));
          pos.unrealizedPnlPercent = pos.averagePrice > 0 ? roundDecimal(((inst.price - pos.averagePrice) / pos.averagePrice) * 100, 2) : 0;
        }
        totalInvested += pos.marketValue;
        totalUnrealized += pos.unrealizedPnl;
      }

      portfolio.investedBalance = roundDecimal(totalInvested);
      portfolio.unrealizedPnl = roundDecimal(totalUnrealized);
      portfolio.totalEquity = roundDecimal(portfolio.simulatedCashBalance + totalInvested);
      const costBasis = totalInvested - totalUnrealized;
      portfolio.unrealizedPnlPercent = costBasis > 0 ? roundDecimal((totalUnrealized / costBasis) * 100, 2) : 0;
      portfolio.updatedAt = new Date().toISOString();
    });
  }

  // Reset simulated balance to $100,000 for demo customer
  public resetPortfolio(userId: string) {
    const portfolio = this.portfolios.get(userId);
    if (!portfolio) return null;

    portfolio.simulatedCashBalance = 100000.00;
    portfolio.investedBalance = 0;
    portfolio.totalEquity = 100000.00;
    portfolio.unrealizedPnl = 0;
    portfolio.unrealizedPnlPercent = 0;
    portfolio.dayPnl = 0;
    portfolio.dayPnlPercent = 0;
    portfolio.updatedAt = new Date().toISOString();

    this.positions.set(portfolio.id, []);

    this.logAuditEvent({
      actorUserId: userId,
      actorEmail: this.users.get(userId)?.email || 'unknown',
      eventType: 'PORTFOLIO_RESET_SIMULATED',
      targetType: 'PORTFOLIO',
      targetId: portfolio.id,
      metadataJson: { newBalance: 100000.00, currency: 'USD' },
      ipHash: '127.0.0.1_simulated',
    });

    return portfolio;
  }

  public logAuditEvent(eventData: Omit<AuditEvent, 'id' | 'createdAt'>): AuditEvent {
    const event: AuditEvent = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...eventData,
    };
    this.auditEvents.unshift(event);
    if (this.auditEvents.length > 500) this.auditEvents.pop();
    return event;
  }

  public addNotification(userId: string, notification: AppNotification) {
    const list = this.notifications.get(userId) || [];
    list.unshift(notification);
    if (list.length > 50) list.pop();
    this.notifications.set(userId, list);
  }

  public getSystemHealth(): SystemHealth {
    const uptime = Math.floor((Date.now() - this.systemStartTime) / 1000);
    return {
      status: 'HEALTHY',
      uptimeSeconds: uptime,
      cpuUsagePercent: roundDecimal(2.4 + (Math.random() * 2)),
      memoryUsageMb: roundDecimal(118 + (Math.random() * 12)),
      dbLatencyMs: roundDecimal(1.2 + (Math.random() * 0.8)),
      activeUsersCount: this.users.size,
      totalOrdersCount: this.orders.size,
      simulatedFeedStatus: this.feedRunning ? 'RUNNING' : 'PAUSED',
      lastTickTimestamp: new Date().toISOString(),
      version: '1.0.0-verity_capital_inv-mvp',
    };
  }

  // Admin Capital Adjustment: Credit or debit simulated cash
  public adjustUserBalance(userId: string, deltaAmount: number, reason: string, adminEmail: string = 'admin@verity-capital.com'): { success: boolean; newBalance: number } | null {
    const portfolio = this.portfolios.get(userId);
    if (!portfolio) return null;

    portfolio.simulatedCashBalance = roundDecimal(portfolio.simulatedCashBalance + deltaAmount);
    portfolio.totalEquity = roundDecimal(portfolio.simulatedCashBalance + portfolio.investedBalance);
    portfolio.updatedAt = new Date().toISOString();

    this.logAuditEvent({
      actorUserId: 'usr_admin_verity_capital_inv',
      actorEmail: adminEmail,
      eventType: 'ADMIN_BALANCE_ADJUSTMENT',
      targetType: 'USER',
      targetId: userId,
      metadataJson: { deltaAmount, newBalance: portfolio.simulatedCashBalance, reason },
      ipHash: '127.0.0.1_admin',
    });

    this.addNotification(userId, {
      id: `notif_${Date.now()}`,
      userId,
      type: 'SYSTEM',
      title: deltaAmount >= 0 ? 'Simulated Funds Credited' : 'Simulated Funds Adjusted',
      body: `An administrator adjusted your virtual cash balance by ${deltaAmount >= 0 ? '+' : ''}$${Math.abs(deltaAmount).toLocaleString()}. Reason: ${reason || 'Administrative adjustment'}`,
      readAt: null,
      createdAt: new Date().toISOString(),
    });

    return { success: true, newBalance: portfolio.simulatedCashBalance };
  }

  // Admin Order Action: Force execute or cancel
  public forceCancelOrder(orderId: string, reason: string, adminEmail: string = 'admin@verity-capital.com'): Order | null {
    const order = this.orders.get(orderId);
    if (!order) return null;

    order.status = 'CANCELLED';
    order.rejectionReason = `Cancelled by admin: ${reason || 'Risk management directive'}`;
    order.executedAt = new Date().toISOString();

    this.logAuditEvent({
      actorUserId: 'usr_admin_verity_capital_inv',
      actorEmail: adminEmail,
      eventType: 'ADMIN_ORDER_CANCEL',
      targetType: 'ORDER',
      targetId: orderId,
      metadataJson: { symbol: order.symbol, reason },
      ipHash: '127.0.0.1_admin',
    });

    return order;
  }

  public forceExecuteOrder(orderId: string, adminEmail: string = 'admin@verity-capital.com'): Order | null {
    const order = this.orders.get(orderId);
    if (!order) return null;
    const inst = this.instruments.get(order.instrumentId);
    if (!inst) return null;

    this.executePendingOrder(order, inst.price);

    this.logAuditEvent({
      actorUserId: 'usr_admin_verity_capital_inv',
      actorEmail: adminEmail,
      eventType: 'ADMIN_FORCE_EXECUTE_ORDER',
      targetType: 'ORDER',
      targetId: orderId,
      metadataJson: { symbol: order.symbol, price: inst.price },
      ipHash: '127.0.0.1_admin',
    });

    return order;
  }

  // Admin Instrument Management: Add custom symbol
  public addInstrument(instData: {
    symbol: string;
    name: string;
    assetType: 'STOCK' | 'CRYPTO' | 'ETF' | 'FOREX';
    exchange: string;
    currency: string;
    price: number;
  }): Instrument {
    const id = `inst_${instData.symbol.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const inst: Instrument = {
      id,
      symbol: instData.symbol.toUpperCase(),
      name: instData.name,
      assetType: instData.assetType,
      exchange: instData.exchange || 'SIM_EXCHANGE',
      currency: instData.currency || 'USD',
      status: 'ACTIVE',
      dataSource: 'ADMIN_CONFIGURED',
      price: roundDecimal(instData.price, instData.assetType === 'FOREX' ? 4 : 2),
      changeAmount: 0,
      changePercent: 0,
      high24h: roundDecimal(instData.price * 1.02, 2),
      low24h: roundDecimal(instData.price * 0.98, 2),
      volume24h: 1500000,
      sparkline: [instData.price, instData.price, instData.price],
      history: this.generateHistoricalCandles(instData.price, 0),
      createdAt: now,
      updatedAt: now,
    };

    this.instruments.set(id, inst);

    this.logAuditEvent({
      actorUserId: 'usr_admin_verity_capital_inv',
      actorEmail: 'admin@verity-capital.com',
      eventType: 'ADMIN_INSTRUMENT_CREATE',
      targetType: 'INSTRUMENT',
      targetId: id,
      metadataJson: { symbol: inst.symbol, name: inst.name, assetType: inst.assetType, price: inst.price },
      ipHash: '127.0.0.1_admin',
    });

    return inst;
  }

  // Admin Price Override
  public setInstrumentPrice(instrumentId: string, newPrice: number): Instrument | null {
    const inst = this.instruments.get(instrumentId);
    if (!inst) return null;

    const oldPrice = inst.price;
    inst.price = roundDecimal(newPrice, inst.assetType === 'FOREX' ? 4 : 2);
    inst.changeAmount = roundDecimal(inst.price - (oldPrice - inst.changeAmount));
    const baseline = inst.price - inst.changeAmount;
    inst.changePercent = baseline > 0 ? roundDecimal((inst.changeAmount / baseline) * 100, 2) : 0;
    if (inst.price > inst.high24h) inst.high24h = inst.price;
    if (inst.price < inst.low24h) inst.low24h = inst.price;
    inst.sparkline.push(inst.price);
    if (inst.sparkline.length > 25) inst.sparkline.shift();
    inst.updatedAt = new Date().toISOString();

    this.checkPendingOrders(inst);
    this.recalculateAllPortfolios();

    this.logAuditEvent({
      actorUserId: 'usr_admin_verity_capital_inv',
      actorEmail: 'admin@verity-capital.com',
      eventType: 'ADMIN_PRICE_OVERRIDE',
      targetType: 'INSTRUMENT',
      targetId: instrumentId,
      metadataJson: { symbol: inst.symbol, oldPrice, newPrice: inst.price },
      ipHash: '127.0.0.1_admin',
    });

    return inst;
  }

  // Admin Circuit Breaker: Halt or Resume All
  public setGlobalCircuitBreaker(haltAll: boolean): void {
    this.instruments.forEach((inst) => {
      inst.status = haltAll ? 'HALTED' : 'ACTIVE';
      inst.updatedAt = new Date().toISOString();
    });

    this.logAuditEvent({
      actorUserId: 'usr_admin_verity_capital_inv',
      actorEmail: 'admin@verity-capital.com',
      eventType: haltAll ? 'CIRCUIT_BREAKER_GLOBAL_HALT' : 'CIRCUIT_BREAKER_GLOBAL_RESUME',
      targetType: 'SYSTEM',
      targetId: 'verity_capital_inv_matching_engine',
      metadataJson: { haltAll },
      ipHash: '127.0.0.1_admin',
    });
  }

  // Admin Market Shock Simulation
  public triggerMarketShock(scenario: 'TECH_SURGE' | 'CRYPTO_RALLY' | 'MACRO_SELLOFF' | 'FLASH_CRASH'): { scenario: string; affectedCount: number } {
    let affectedCount = 0;
    this.instruments.forEach((inst) => {
      let multiplier = 1.0;
      if (scenario === 'TECH_SURGE' && (inst.assetType === 'STOCK' || inst.assetType === 'ETF')) {
        multiplier = 1.055 + Math.random() * 0.02; // +5.5% to +7.5%
      } else if (scenario === 'CRYPTO_RALLY' && inst.assetType === 'CRYPTO') {
        multiplier = 1.11 + Math.random() * 0.04; // +11% to +15%
      } else if (scenario === 'MACRO_SELLOFF') {
        multiplier = 0.945 - Math.random() * 0.02; // -5.5% to -7.5%
      } else if (scenario === 'FLASH_CRASH') {
        multiplier = inst.assetType === 'CRYPTO' ? 0.82 : 0.89; // -11% to -18%
      }

      if (multiplier !== 1.0) {
        const newPrice = roundDecimal(inst.price * multiplier, inst.assetType === 'FOREX' ? 4 : 2);
        inst.price = newPrice;
        inst.changeAmount = roundDecimal(inst.changeAmount + (newPrice - inst.price));
        inst.sparkline.push(newPrice);
        if (inst.sparkline.length > 25) inst.sparkline.shift();
        inst.updatedAt = new Date().toISOString();
        affectedCount++;
      }
    });

    this.recalculateAllPortfolios();

    this.logAuditEvent({
      actorUserId: 'usr_admin_verity_capital_inv',
      actorEmail: 'admin@verity-capital.com',
      eventType: 'ADMIN_MARKET_SHOCK_SIMULATION',
      targetType: 'MARKET',
      targetId: 'global_simulated_catalog',
      metadataJson: { scenario, affectedCount },
      ipHash: '127.0.0.1_admin',
    });

    return { scenario, affectedCount };
  }

  public toggleFeedStatus(running: boolean): boolean {
    this.feedRunning = running;
    return this.feedRunning;
  }

  // Transfers & Wallet Custody
  public getTransfers(userId: string): TransferRecord[] {
    return this.transfers.get(userId) || [];
  }

  public getAllTransfers(): TransferRecord[] {
    const all: TransferRecord[] = [];
    this.transfers.forEach((list) => all.push(...list));
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createTransfer(userId: string, data: {
    type: 'DEPOSIT_USD' | 'WITHDRAW_USD' | 'DEPOSIT_CRYPTO' | 'WITHDRAW_CRYPTO';
    asset: 'USD' | 'BTC' | 'ETH' | 'SOL' | 'XRP' | 'ADA';
    amount: number;
    destinationAddress?: string;
    method?: string;
    notes?: string;
  }): TransferRecord {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const isCrypto = data.asset !== 'USD';
    const fakeTxHash = isCrypto ? `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}` : undefined;

    const record: TransferRecord = {
      id,
      userId,
      type: data.type,
      asset: data.asset,
      amount: roundDecimal(data.amount, isCrypto ? 6 : 2),
      destinationAddress: data.destinationAddress,
      txHash: fakeTxHash,
      method: data.method || (data.type.includes('USD') ? 'ACH' : 'ON_CHAIN'),
      status: 'CONFIRMED',
      notes: data.notes || (data.type.startsWith('DEPOSIT') ? 'Inbound settlement confirmed' : 'Outbound transfer processed'),
      createdAt: now,
      confirmedAt: now,
    };

    const userTransfers = this.transfers.get(userId) || [];
    userTransfers.unshift(record);
    this.transfers.set(userId, userTransfers);

    // Update cash balance if USD deposit/withdrawal
    const portfolio = this.portfolios.get(userId);
    if (portfolio) {
      if (data.type === 'DEPOSIT_USD') {
        portfolio.simulatedCashBalance = roundDecimal(portfolio.simulatedCashBalance + data.amount);
      } else if (data.type === 'WITHDRAW_USD') {
        if (portfolio.simulatedCashBalance >= data.amount) {
          portfolio.simulatedCashBalance = roundDecimal(portfolio.simulatedCashBalance - data.amount);
        }
      }
      portfolio.totalEquity = roundDecimal(portfolio.simulatedCashBalance + portfolio.investedBalance);
      portfolio.updatedAt = now;
    }

    this.logAuditEvent({
      actorUserId: userId,
      actorEmail: this.users.get(userId)?.email || 'user@verity_capital_inv',
      eventType: `TRANSFER_${data.type}`,
      targetType: 'CUSTODY_TRANSFER',
      targetId: id,
      metadataJson: { asset: data.asset, amount: data.amount, method: record.method },
      ipHash: 'custody_node_us_east',
    });

    return record;
  }

  // US Regulatory Compliance & KYC Profile
  public getKycProfile(userId: string): KycProfile {
    let profile = this.kycProfiles.get(userId);
    if (!profile) {
      const user = this.users.get(userId);
      profile = {
        userId,
        tier: 'TIER_1_VERIFIED',
        legalFirstName: user?.firstName || 'Valued',
        legalLastName: user?.lastName || 'Client',
        cipStatus: 'PASSED',
        ofacScreening: 'CLEARED',
        w9Attestation: true,
        dailyWithdrawalLimitUsd: 100000,
        verifiedAt: new Date().toISOString(),
      };
      this.kycProfiles.set(userId, profile);
    }
    return profile;
  }

  public updateKycProfile(userId: string, updates: Partial<KycProfile>): KycProfile {
    const current = this.getKycProfile(userId);
    const updated: KycProfile = {
      ...current,
      ...updates,
      userId,
      verifiedAt: new Date().toISOString(),
    };
    this.kycProfiles.set(userId, updated);

    this.logAuditEvent({
      actorUserId: userId,
      actorEmail: this.users.get(userId)?.email || 'user@verity_capital_inv',
      eventType: 'KYC_PROFILE_UPDATE',
      targetType: 'COMPLIANCE',
      targetId: userId,
      metadataJson: { tier: updated.tier, cipStatus: updated.cipStatus },
      ipHash: 'cip_validator_node',
    });

    return updated;
  }
}

export const db = new VerityDatabase();
