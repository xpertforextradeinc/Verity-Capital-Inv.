import {
  User,
  Instrument,
  Position,
  Portfolio,
  PortfolioBalance,
  Order,
  Watchlist,
  AiInsight,
  SystemHealth,
  TradeRequest,
  TransferRecord,
  KycProfile,
  BrokerChatResponse,
  InvestmentPlan
} from '../types.ts';

// Decimal helper
function round(val: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((val + Number.EPSILON) * factor) / factor;
}

// Initial Instruments
const INITIAL_INSTRUMENTS: Instrument[] = [
  {
    id: 'inst_btc',
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    assetType: 'CRYPTO',
    exchange: 'GLOBAL_CRYPTO',
    currency: 'USD',
    status: 'ACTIVE',
    dataSource: 'COINGECKO_API',
    price: 64250.00,
    changeAmount: 1420.00,
    changePercent: 2.26,
    high24h: 65100.00,
    low24h: 62400.00,
    volume24h: 28400000000,
    marketCap: 1260000000000,
    sparkline: [63100, 63250, 63400, 63200, 63800, 64100, 64250],
    history: [
      { time: '00:00', price: 62800 },
      { time: '04:00', price: 63200 },
      { time: '08:00', price: 63600 },
      { time: '12:00', price: 63900 },
      { time: '16:00', price: 64150 },
      { time: '20:00', price: 64250 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inst_eth',
    symbol: 'ETH/USD',
    name: 'Ethereum',
    assetType: 'CRYPTO',
    exchange: 'GLOBAL_CRYPTO',
    currency: 'USD',
    status: 'ACTIVE',
    dataSource: 'COINGECKO_API',
    price: 3480.50,
    changeAmount: -45.00,
    changePercent: -1.28,
    high24h: 3560.00,
    low24h: 3420.00,
    volume24h: 14200000000,
    marketCap: 418000000000,
    sparkline: [3520, 3510, 3495, 3480, 3470, 3490, 3480.5],
    history: [
      { time: '00:00', price: 3530 },
      { time: '04:00', price: 3515 },
      { time: '08:00', price: 3490 },
      { time: '12:00', price: 3475 },
      { time: '16:00', price: 3485 },
      { time: '20:00', price: 3480.5 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inst_sol',
    symbol: 'SOL/USD',
    name: 'Solana',
    assetType: 'CRYPTO',
    exchange: 'GLOBAL_CRYPTO',
    currency: 'USD',
    status: 'ACTIVE',
    dataSource: 'COINGECKO_API',
    price: 152.40,
    changeAmount: 6.80,
    changePercent: 4.67,
    high24h: 156.00,
    low24h: 144.50,
    volume24h: 4200000000,
    marketCap: 71000000000,
    sparkline: [146, 147.5, 149, 148, 150.5, 151.8, 152.4],
    history: [
      { time: '00:00', price: 145.5 },
      { time: '04:00', price: 147.0 },
      { time: '08:00', price: 149.2 },
      { time: '12:00', price: 150.8 },
      { time: '16:00', price: 151.9 },
      { time: '20:00', price: 152.4 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inst_xrp',
    symbol: 'XRP/USD',
    name: 'Ripple',
    assetType: 'CRYPTO',
    exchange: 'GLOBAL_CRYPTO',
    currency: 'USD',
    status: 'ACTIVE',
    dataSource: 'COINGECKO_API',
    price: 0.52,
    changeAmount: 0.01,
    changePercent: 1.96,
    high24h: 0.54,
    low24h: 0.50,
    volume24h: 1200000000,
    marketCap: 28000000000,
    sparkline: [0.51, 0.512, 0.515, 0.518, 0.521, 0.519, 0.52],
    history: [
      { time: '00:00', price: 0.508 },
      { time: '04:00', price: 0.512 },
      { time: '08:00', price: 0.516 },
      { time: '12:00', price: 0.519 },
      { time: '16:00', price: 0.521 },
      { time: '20:00', price: 0.52 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inst_ada',
    symbol: 'ADA/USD',
    name: 'Cardano',
    assetType: 'CRYPTO',
    exchange: 'GLOBAL_CRYPTO',
    currency: 'USD',
    status: 'ACTIVE',
    dataSource: 'COINGECKO_API',
    price: 0.44,
    changeAmount: -0.02,
    changePercent: -4.34,
    high24h: 0.47,
    low24h: 0.43,
    volume24h: 350000000,
    marketCap: 15500000000,
    sparkline: [0.46, 0.455, 0.45, 0.445, 0.442, 0.44, 0.44],
    history: [
      { time: '00:00', price: 0.462 },
      { time: '04:00', price: 0.455 },
      { time: '08:00', price: 0.448 },
      { time: '12:00', price: 0.442 },
      { time: '16:00', price: 0.441 },
      { time: '20:00', price: 0.44 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_PLANS: InvestmentPlan[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    amount: 1000,
    features: ['Access to standard markets', 'Basic portfolio reporting', 'Email support', 'Standard execution'],
    recommended: false,
    display_order: 1,
  },
  {
    id: 'silver',
    name: 'Silver Plan',
    amount: 5000,
    features: ['Advanced market access', 'Daily market insights', 'Priority email support', 'Fast execution'],
    recommended: false,
    display_order: 2,
  },
  {
    id: 'gold',
    name: 'Gold Plan',
    amount: 10000,
    features: ['Global OTC access', 'Dedicated account manager', '24/7 priority support', 'Institutional execution'],
    recommended: true,
    display_order: 3,
  },
  {
    id: 'vip',
    name: 'VIP Plan',
    amount: 25000,
    features: ['Exclusive block trades', 'Private custody solutions', 'Direct broker line', 'Zero-latency execution'],
    recommended: false,
    display_order: 4,
  },
];

class ClientStorageEngine {
  private getStorage<T>(key: string, defaultVal: T): T {
    if (typeof window === 'undefined') return defaultVal;
    try {
      const stored = localStorage.getItem(`verity_${key}`);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`verity_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  public getDemoUser(): User {
    return {
      id: 'usr_customer_alex',
      email: 'alex.morgan@example.com',
      firstName: 'Alex',
      lastName: 'Morgan',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Active current user resolution
  public getCurrentUser(): User | null {
    return this.getStorage<User | null>('current_user', null);
  }

  public setCurrentUser(user: User | null): void {
    this.setStorage('current_user', user);
  }

  // Handle all API routes locally if backend server is not available (e.g. Vercel)
  public async handleRequest<T>(endpoint: string, options: RequestInit = {}, token: string | null): Promise<T> {
    const method = options.method ? options.method.toUpperCase() : 'GET';
    const body = options.body ? JSON.parse(options.body as string) : {};
    const currentUser = this.getCurrentUser() || this.getDemoUser();

    // 1. Auth Sync (Supabase)
    if (endpoint === '/auth/supabase-sync') {
      const isAdmin = body.email?.toLowerCase() === 'verifycapitalinv@gmail.com' ||
        body.user_metadata?.role === 'admin' ||
        localStorage.getItem('supabase_user_role') === 'admin';

      const user: User = {
        id: `supabase_${body.id}`,
        email: (body.email || '').toLowerCase(),
        firstName: body.firstName?.trim() || (isAdmin ? 'System' : 'Institutional'),
        lastName: body.lastName?.trim() || (isAdmin ? 'Administrator' : 'Investor'),
        role: isAdmin ? 'ADMIN' : 'CUSTOMER',
        status: 'ACTIVE',
        emailVerifiedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.setCurrentUser(user);
      this.getPortfolio(user.id); // ensure portfolio exists

      // Add to users list
      const users = this.getStorage<User[]>('all_users', []);
      const existingIdx = users.findIndex(u => u.id === user.id || u.email === user.email);
      if (existingIdx >= 0) {
        users[existingIdx] = user;
      } else {
        users.push(user);
      }
      this.setStorage('all_users', users);

      return {
        user,
        token: user.role === 'ADMIN' ? 'admin_token' : `user_${user.id}`,
      } as unknown as T;
    }

    // 2. Auth Login / Register
    if (endpoint === '/auth/login') {
      const isAdmin = body.email?.toLowerCase() === 'verifycapitalinv@gmail.com' ||
        body.email?.toLowerCase() === 'admin@verity-capital.com';
      const user: User = {
        id: isAdmin ? 'usr_admin_verity_capital_inv' : 'usr_customer_alex',
        email: body.email.toLowerCase(),
        firstName: isAdmin ? 'System' : 'Alex',
        lastName: isAdmin ? 'Administrator' : 'Morgan',
        role: isAdmin ? 'ADMIN' : 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.setCurrentUser(user);
      return { user, token: isAdmin ? 'admin_token' : `user_${user.id}` } as unknown as T;
    }

    if (endpoint === '/auth/register') {
      const newUserId = `usr_${Date.now()}`;
      const user: User = {
        id: newUserId,
        email: body.email.toLowerCase(),
        firstName: body.firstName || 'Investor',
        lastName: body.lastName || 'Member',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.setCurrentUser(user);
      this.getPortfolio(user.id);
      return { user, token: `user_${user.id}` } as unknown as T;
    }

    if (endpoint === '/auth/switch-demo') {
      const isAdmin = body.role === 'ADMIN';
      const user: User = {
        id: isAdmin ? 'usr_admin_verity_capital_inv' : 'usr_customer_alex',
        email: isAdmin ? 'admin@verity-capital.com' : 'alex.morgan@example.com',
        firstName: isAdmin ? 'System' : 'Alex',
        lastName: isAdmin ? 'Administrator' : 'Morgan',
        role: isAdmin ? 'ADMIN' : 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.setCurrentUser(user);
      return { user, token: isAdmin ? 'admin_token' : `user_${user.id}` } as unknown as T;
    }

    if (endpoint === '/auth/me') {
      const activeUser = this.getCurrentUser();
      if (!activeUser) {
        throw new Error('Not authenticated');
      }
      return { user: activeUser } as unknown as T;
    }

    // 3. Instruments
    if (endpoint.startsWith('/instruments')) {
      const instruments = this.getStorage<Instrument[]>('instruments', INITIAL_INSTRUMENTS);
      return instruments as unknown as T;
    }

    // 4. Portfolio & Balances
    if (endpoint === '/portfolio') {
      const port = this.getPortfolio(currentUser.id);
      return port as unknown as T;
    }

    if (endpoint === '/portfolio/positions') {
      const positions = this.getPositions(currentUser.id);
      return positions as unknown as T;
    }

    if (endpoint === '/portfolio/balances') {
      const port = this.getPortfolio(currentUser.id);
      const balances: PortfolioBalance[] = [
        {
          asset: 'USD',
          available: port.simulatedCashBalance,
          locked: 0,
          marketValue: port.simulatedCashBalance,
          averageCost: 1,
          unrealizedPnl: 0,
        }
      ];
      return balances as unknown as T;
    }

    if (endpoint === '/portfolio/reset') {
      const port = this.resetPortfolio(currentUser.id);
      return { success: true, portfolio: port } as unknown as T;
    }

    // 5. Orders
    if (endpoint === '/orders') {
      const orders = this.getStorage<Order[]>(`orders_${currentUser.id}`, []);
      return orders as unknown as T;
    }

    if (endpoint === '/orders/simulated') {
      const order = this.executeTrade(currentUser.id, body as TradeRequest);
      return order as unknown as T;
    }

    if (endpoint.startsWith('/orders/') && endpoint.endsWith('/cancel')) {
      const orderId = endpoint.split('/')[2];
      const orders = this.getStorage<Order[]>(`orders_${currentUser.id}`, []);
      const order = orders.find(o => o.id === orderId);
      if (order) order.status = 'CANCELLED';
      this.setStorage(`orders_${currentUser.id}`, orders);
      return { success: true, order: order || { id: orderId, status: 'CANCELLED' } } as unknown as T;
    }

    // 6. Watchlists
    if (endpoint === '/watchlists') {
      if (method === 'POST') {
        const watchlists = this.getStorage<Watchlist[]>(`wl_${currentUser.id}`, []);
        const newWl: Watchlist = {
          id: `wl_${Date.now()}`,
          userId: currentUser.id,
          name: body.name || 'Watchlist',
          instrumentIds: ['inst_btc', 'inst_eth', 'inst_sol'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        watchlists.push(newWl);
        this.setStorage(`wl_${currentUser.id}`, watchlists);
        return newWl as unknown as T;
      }
      const watchlists = this.getStorage<Watchlist[]>(`wl_${currentUser.id}`, [
        {
          id: `wl_default_${currentUser.id}`,
          userId: currentUser.id,
          name: 'Core Holdings',
          instrumentIds: ['inst_btc', 'inst_eth', 'inst_sol', 'inst_xrp', 'inst_ada'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]);
      return watchlists as unknown as T;
    }

    // 7. Investment Plans
    if (endpoint === '/plans') {
      const plans = this.getStorage<InvestmentPlan[]>('plans', DEFAULT_PLANS);
      return { plans } as unknown as T;
    }

    if (endpoint === '/admin/plans') {
      const plans = this.getStorage<InvestmentPlan[]>('plans', DEFAULT_PLANS);
      const index = plans.findIndex(p => p.id === body.id);
      if (index >= 0) {
        plans[index] = { ...plans[index], ...body };
      } else {
        plans.push(body);
      }
      this.setStorage('plans', plans);
      return { success: true, plan: body } as unknown as T;
    }

    // 8. Admin Users & Balances
    if (endpoint === '/admin/users') {
      const storedUsers = this.getStorage<User[]>('all_users', []);
      const usersList = storedUsers.length > 0 ? storedUsers : [
        {
          id: 'usr_customer_alex',
          email: 'alex.morgan@example.com',
          firstName: 'Alex',
          lastName: 'Morgan',
          role: 'CUSTOMER' as const,
          status: 'ACTIVE' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'usr_admin_verity_capital_inv',
          email: 'verifycapitalinv@gmail.com',
          firstName: 'System',
          lastName: 'Administrator',
          role: 'ADMIN' as const,
          status: 'ACTIVE' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];

      const enriched = usersList.map(u => {
        const port = this.getPortfolio(u.id);
        return {
          ...u,
          simulatedBalance: port.simulatedCashBalance,
          totalEquity: port.totalEquity,
        };
      });
      return enriched as unknown as T;
    }

    if (endpoint.includes('/adjust-balance')) {
      const parts = endpoint.split('/');
      const userId = parts[3];
      const amount = Number(body.amount) || 0;
      const port = this.getPortfolio(userId);
      port.simulatedCashBalance = round(port.simulatedCashBalance + amount);
      port.totalEquity = round(port.totalEquity + amount);
      this.setStorage(`port_${userId}`, port);
      return { success: true, newBalance: port.simulatedCashBalance } as unknown as T;
    }

    if (endpoint === '/admin/orders') {
      return this.getStorage<Order[]>('admin_orders', []) as unknown as T;
    }

    if (endpoint === '/admin/system-health') {
      const health: SystemHealth = {
        status: 'HEALTHY',
        uptimeSeconds: 86400,
        cpuUsagePercent: 12.5,
        memoryUsageMb: 48.2,
        dbLatencyMs: 4,
        activeUsersCount: 18,
        totalOrdersCount: 142,
        simulatedFeedStatus: 'RUNNING',
        lastTickTimestamp: new Date().toISOString(),
        version: '1.4.2',
      };
      return health as unknown as T;
    }

    // 9. WhatsApp Number
    if (endpoint === '/settings/whatsapp') {
      const num = this.getStorage<string>('whatsapp', '+1234567890');
      return { whatsappNumber: num } as unknown as T;
    }
    if (endpoint === '/admin/settings/whatsapp') {
      this.setStorage('whatsapp', body.whatsappNumber);
      return { whatsappNumber: body.whatsappNumber } as unknown as T;
    }

    // 10. Transfers
    if (endpoint === '/transfers' || endpoint === '/admin/transfers') {
      if (method === 'POST') {
        const transfers = this.getStorage<TransferRecord[]>(`transfers_${currentUser.id}`, []);
        const newTransfer: TransferRecord = {
          id: `tr_${Date.now()}`,
          userId: currentUser.id,
          type: body.type,
          asset: body.asset,
          amount: body.amount,
          status: 'COMPLETED',
          destinationAddress: body.destinationAddress,
          txHash: `0x${Math.random().toString(16).substring(2, 18)}`,
          notes: body.notes || 'Institutional Transfer',
          createdAt: new Date().toISOString(),
          confirmedAt: new Date().toISOString(),
        };
        transfers.unshift(newTransfer);
        this.setStorage(`transfers_${currentUser.id}`, transfers);
        return newTransfer as unknown as T;
      }
      const transfers = this.getStorage<TransferRecord[]>(`transfers_${currentUser.id}`, []);
      return transfers as unknown as T;
    }

    // 11. KYC Profile
    if (endpoint === '/compliance/kyc' || endpoint.startsWith('/admin/compliance/kyc')) {
      if (method === 'POST' || method === 'PATCH') {
        const existing = this.getStorage<KycProfile>(`kyc_${currentUser.id}`, {
          userId: currentUser.id,
          tier: 'TIER_1_VERIFIED',
          legalFirstName: currentUser.firstName,
          legalLastName: currentUser.lastName,
          cipStatus: 'PASSED',
          ofacScreening: 'CLEARED',
          w9Attestation: true,
          dailyWithdrawalLimitUsd: 1000000,
        });
        const updated = { ...existing, ...body };
        this.setStorage(`kyc_${currentUser.id}`, updated);
        return updated as unknown as T;
      }
      const kyc = this.getStorage<KycProfile>(`kyc_${currentUser.id}`, {
        userId: currentUser.id,
        tier: 'TIER_1_VERIFIED',
        legalFirstName: currentUser.firstName,
        legalLastName: currentUser.lastName,
        cipStatus: 'PASSED',
        ofacScreening: 'CLEARED',
        w9Attestation: true,
        dailyWithdrawalLimitUsd: 1000000,
      });
      return kyc as unknown as T;
    }

    // 12. Insights & Broker Chat
    if (endpoint === '/insights') {
      const insights: AiInsight[] = [
        {
          id: 'ins_btc_1',
          instrumentId: 'inst_btc',
          symbol: 'BTC/USD',
          title: 'Institutional Inflows & Liquidity Consolidation',
          summary: 'Bitcoin order depth showcases persistent limit buying across institutional liquidity pools.',
          keyPoints: ['ETF Net Inflows', 'Spot Premium Stability', 'Mining Difficulty All-Time High'],
          sentiment: 'BULLISH',
          riskLevel: 'MODERATE',
          confidenceScore: 0.92,
          modelName: 'gemini-2.5-flash',
          promptVersion: 'v2.1',
          generatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          disclaimer: 'Educational intelligence. Not financial advice.',
        }
      ];
      return insights as unknown as T;
    }

    if (endpoint === '/broker-chat') {
      const resp: BrokerChatResponse = {
        reply: `Thank you for your message. As your Verity-Capital Inv representative, I confirm that your institutional paper-trading portfolio is properly allocated with optimal liquidity. Current portfolio equity is maintained securely.`,
        suggestedAction: {
          type: 'NAVIGATE',
          label: 'Review Market Depth',
        },
      };
      return resp as unknown as T;
    }

    // Fallback default
    return {} as unknown as T;
  }

  // Helper: Portfolio management
  public getPortfolio(userId: string): Portfolio {
    const existing = this.getStorage<Portfolio | null>(`port_${userId}`, null);
    if (existing) return existing;

    const newPort: Portfolio = {
      id: `port_${userId}`,
      userId,
      baseCurrency: 'USD',
      simulatedCashBalance: 100000.00,
      investedBalance: 0,
      totalEquity: 100000.00,
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0,
      dayPnl: 0,
      dayPnlPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.setStorage(`port_${userId}`, newPort);
    return newPort;
  }

  public getPositions(userId: string): Position[] {
    return this.getStorage<Position[]>(`pos_${userId}`, []);
  }

  public resetPortfolio(userId: string): Portfolio {
    const port = this.getPortfolio(userId);
    port.simulatedCashBalance = 100000.00;
    port.investedBalance = 0;
    port.totalEquity = 100000.00;
    port.unrealizedPnl = 0;
    port.unrealizedPnlPercent = 0;
    this.setStorage(`port_${userId}`, port);
    this.setStorage(`pos_${userId}`, []);
    return port;
  }

  // Trade Execution
  public executeTrade(userId: string, req: TradeRequest): Order {
    const port = this.getPortfolio(userId);
    const positions = this.getPositions(userId);
    const instruments = this.getStorage<Instrument[]>('instruments', INITIAL_INSTRUMENTS);
    const inst = instruments.find(i => i.id === req.instrumentId) || instruments[0];

    const price = inst.price;
    const total = round(req.quantity * price, 2);

    if (req.side === 'BUY' && port.simulatedCashBalance < total) {
      throw new Error(`Insufficient cash. Required: $${total}, Available: $${port.simulatedCashBalance}`);
    }

    const order: Order = {
      id: `ord_${Date.now()}`,
      userId,
      portfolioId: port.id,
      instrumentId: inst.id,
      symbol: inst.symbol,
      name: inst.name,
      side: req.side,
      orderType: req.orderType || 'MARKET',
      quantity: req.quantity,
      requestedPrice: price,
      executedPrice: price,
      totalValue: total,
      status: 'EXECUTED',
      createdAt: new Date().toISOString(),
      executedAt: new Date().toISOString(),
    };

    if (req.side === 'BUY') {
      port.simulatedCashBalance = round(port.simulatedCashBalance - total, 2);
      const posIdx = positions.findIndex(p => p.instrumentId === inst.id);
      if (posIdx >= 0) {
        const pos = positions[posIdx];
        const newQty = pos.quantity + req.quantity;
        pos.averagePrice = round((pos.quantity * pos.averagePrice + total) / newQty, 2);
        pos.quantity = newQty;
        pos.marketValue = round(newQty * price, 2);
        pos.unrealizedPnl = round(newQty * (price - pos.averagePrice), 2);
      } else {
        positions.push({
          id: `pos_${Date.now()}`,
          portfolioId: port.id,
          instrumentId: inst.id,
          symbol: inst.symbol,
          name: inst.name,
          assetType: inst.assetType,
          quantity: req.quantity,
          averagePrice: price,
          currentPrice: price,
          marketValue: total,
          unrealizedPnl: 0,
          unrealizedPnlPercent: 0,
          updatedAt: new Date().toISOString(),
        });
      }
    } else {
      // SELL
      const posIdx = positions.findIndex(p => p.instrumentId === inst.id);
      if (posIdx >= 0) {
        const pos = positions[posIdx];
        if (pos.quantity >= req.quantity) {
          pos.quantity = round(pos.quantity - req.quantity, 6);
          port.simulatedCashBalance = round(port.simulatedCashBalance + total, 2);
          if (pos.quantity <= 0) {
            positions.splice(posIdx, 1);
          } else {
            pos.marketValue = round(pos.quantity * price, 2);
            pos.unrealizedPnl = round(pos.quantity * (price - pos.averagePrice), 2);
          }
        }
      }
    }

    // Recalculate portfolio equity
    const invested = positions.reduce((sum, p) => sum + p.marketValue, 0);
    port.investedBalance = round(invested, 2);
    port.totalEquity = round(port.simulatedCashBalance + port.investedBalance, 2);
    port.unrealizedPnl = round(positions.reduce((sum, p) => sum + p.unrealizedPnl, 0), 2);
    port.unrealizedPnlPercent = port.investedBalance > 0
      ? round((port.unrealizedPnl / (port.investedBalance - port.unrealizedPnl)) * 100, 2)
      : 0;

    this.setStorage(`port_${userId}`, port);
    this.setStorage(`pos_${userId}`, positions);

    // Record order in history
    const orders = this.getStorage<Order[]>(`orders_${userId}`, []);
    orders.unshift(order);
    this.setStorage(`orders_${userId}`, orders);

    const adminOrders = this.getStorage<Order[]>('admin_orders', []);
    adminOrders.unshift(order);
    this.setStorage('admin_orders', adminOrders);

    return order;
  }
}

export const clientStorageEngine = new ClientStorageEngine();
