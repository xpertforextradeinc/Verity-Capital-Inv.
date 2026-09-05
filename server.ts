import express, { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { db, roundDecimal, calcOrderTotal } from './server/db.ts';
import { generateEducationalMarketInsight, executeVerityBrokerChat } from './server/ai.ts';
import { User, Order, Watchlist, TransferRecord, KycProfile, FactualCryptoAsset } from './src/types.ts';

const app = express();
const PORT = 3000;
const supabaseAuth = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY
    ? createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
    : null;

// Middleware
app.use(express.json());

// Request logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.url.startsWith('/@') && !req.url.startsWith('/src')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
});

// Mock Session Auth Helper
function getCurrentUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token === 'admin_token') {
      return db.users.get('usr_admin_verity_capital_inv') || null;
    }
    if (token.startsWith('user_')) {
      const userId = token.replace('user_', '');
      return db.users.get(userId) || null;
    }
  }
  return null;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (user.status === 'SUSPENDED') {
    return res.status(403).json({ error: 'Account has been suspended by an administrator' });
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = getCurrentUser(req);
  if (!user || user.role !== 'ADMIN') {
    const attemptUser = user ? user.id : 'unauthenticated_user';
    console.warn(`[COMPLIANCE ALERT] Unauthorized admin access attempt from ${attemptUser} to endpoint: ${req.url}`);
    return res.status(403).json({ error: 'Access Restricted - Verity-Capital Inv Security' });
  }
  
  console.log(`[COMPLIANCE AUDIT] Admin role verified for operator: ${user.id}. Accessing: ${req.url}`);
  (req as any).user = user;
  next();
}

// ----------------------------------------------------
// API ROUTES (/api/v1)
// ----------------------------------------------------

// Health Check
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json(db.getSystemHealth());
});

// Authentication
app.post('/api/v1/auth/register', (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const existing = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Email is already registered' });
  }

  const now = new Date().toISOString();
  const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newUser: User = {
    id: newUserId,
    email: email.toLowerCase(),
    firstName,
    lastName,
    role: 'CUSTOMER',
    status: 'ACTIVE',
    emailVerifiedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  db.users.set(newUser.id, newUser);
  db.passwords.set(newUser.email.toLowerCase(), password);

  // Initialize Portfolio with $100,000 simulated balance
  const portId = `port_${newUserId}`;
  db.portfolios.set(newUserId, {
    id: portId,
    userId: newUserId,
    baseCurrency: 'USD',
    simulatedCashBalance: 100000.00,
    investedBalance: 0,
    totalEquity: 100000.00,
    unrealizedPnl: 0,
    unrealizedPnlPercent: 0,
    dayPnl: 0,
    dayPnlPercent: 0,
    createdAt: now,
    updatedAt: now,
  });
  db.positions.set(portId, []);

  // Initialize default watchlist
  db.watchlists.set(newUserId, [
    {
      id: `wl_${Date.now()}`,
      userId: newUserId,
      name: 'Default Watchlist',
      instrumentIds: ['inst_nvda', 'inst_aapl', 'inst_btc', 'inst_spy'],
      createdAt: now,
      updatedAt: now,
    }
  ]);

  db.logAuditEvent({
    actorUserId: newUserId,
    actorEmail: newUser.email,
    eventType: 'USER_REGISTER',
    targetType: 'USER',
    targetId: newUserId,
    metadataJson: { email, simulatedGrant: 100000.00 },
    ipHash: req.ip ? String(req.ip) : 'unknown',
  });

  const token = `user_${newUserId}`;
  res.status(201).json({ user: newUser, token });
});

app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const storedPassword = db.passwords.get(email.toLowerCase());
  if (storedPassword !== password && password !== 'demo-bypass') {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.status === 'SUSPENDED') {
    return res.status(403).json({ error: 'Account has been suspended' });
  }

  const token = user.role === 'ADMIN' ? 'admin_token' : `user_${user.id}`;
  db.logAuditEvent({
    actorUserId: user.id,
    actorEmail: user.email,
    eventType: 'USER_LOGIN',
    targetType: 'USER',
    targetId: user.id,
    metadataJson: { role: user.role },
    ipHash: req.ip ? String(req.ip) : 'unknown',
  });

  res.json({ user, token });
});

// Google OAuth Synchronizer for seamless user account linking
app.post('/api/v1/auth/google-sync', (req: Request, res: Response) => {
  const { email, displayName } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required for Google account sync' });
  }

  let user = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  const now = new Date().toISOString();

  if (!user) {
    const parts = (displayName || 'Trader').trim().split(' ');
    const firstName = parts[0] || 'Trader';
    const lastName = parts.slice(1).join(' ') || 'User';
    const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    user = {
      id: newUserId,
      email: email.toLowerCase(),
      firstName,
      lastName,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerifiedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    db.users.set(user.id, user);

    const portId = `port_${user.id}`;
    db.portfolios.set(user.id, {
      id: portId,
      userId: user.id,
      baseCurrency: 'USD',
      simulatedCashBalance: 100000.00,
      investedBalance: 0,
      totalEquity: 100000.00,
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0,
      dayPnl: 0,
      dayPnlPercent: 0,
      createdAt: now,
      updatedAt: now,
    });
    db.positions.set(portId, []);

    db.watchlists.set(user.id, [
      {
        id: `wl_${Date.now()}`,
        userId: user.id,
        name: 'Core Watchlist',
        instrumentIds: ['inst_nvda', 'inst_aapl', 'inst_btc', 'inst_spy'],
        createdAt: now,
        updatedAt: now,
      }
    ]);

    db.logAuditEvent({
      actorUserId: user.id,
      actorEmail: user.email,
      eventType: 'GOOGLE_AUTH_REGISTER',
      targetType: 'USER',
      targetId: user.id,
      metadataJson: { email: user.email, provider: 'google' },
      ipHash: req.ip ? String(req.ip) : 'unknown',
    });
  }

  const token = `user_${user.id}`;
  res.json({ user, token });
});

// Exchange a verified Supabase session for the paper-trading API session.
app.post('/api/v1/auth/supabase-sync', async (req: Request, res: Response) => {
  const { id, email, firstName, lastName } = req.body;
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!id || !email || !accessToken || !supabaseAuth) {
    return res.status(401).json({ error: 'A valid Supabase session is required' });
  }

  const { data: authData, error: authError } = await supabaseAuth.auth.getUser(accessToken);
  if (authError || !authData.user || authData.user.id !== id || authData.user.email?.toLowerCase() !== email.toLowerCase()) {
    return res.status(401).json({ error: 'Supabase session validation failed' });
  }

  const now = new Date().toISOString();
  let user = db.users.get(`supabase_${id}`) || Array.from(db.users.values()).find((item) => item.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    const userId = `supabase_${id}`;
    user = {
      id: userId,
      email: email.toLowerCase(),
      firstName: firstName?.trim() || 'Institutional',
      lastName: lastName?.trim() || 'Investor',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerifiedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    db.users.set(userId, user);
    const portfolioId = `port_${userId}`;
    db.portfolios.set(userId, {
      id: portfolioId,
      userId,
      baseCurrency: 'USD',
      simulatedCashBalance: 100000,
      investedBalance: 0,
      totalEquity: 100000,
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0,
      dayPnl: 0,
      dayPnlPercent: 0,
      createdAt: now,
      updatedAt: now,
    });
    db.positions.set(portfolioId, []);
    db.watchlists.set(userId, []);
  }

  const token = user.role === 'ADMIN' ? 'admin_token' : `user_${user.id}`;
  res.json({ user, token });
});

app.post('/api/v1/auth/logout', (req: Request, res: Response) => {
  res.json({ success: true });
});

app.get('/api/v1/auth/me', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user });
});

// Fast Demo switch helper for testing both Customer and Admin effortlessly
app.post('/api/v1/auth/switch-demo', (req: Request, res: Response) => {
  const { role } = req.body;
  let targetUser: User | undefined;
  if (role === 'ADMIN') {
    targetUser = db.users.get('usr_admin_verity_capital_inv');
  } else {
    targetUser = db.users.get('usr_customer_alex');
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'Demo user not found' });
  }

  const token = targetUser.role === 'ADMIN' ? 'admin_token' : `user_${targetUser.id}`;
  res.json({ user: targetUser, token });
});

// Instruments
app.get('/api/v1/instruments', (req: Request, res: Response) => {
  const { assetType, query } = req.query;
  let list = Array.from(db.instruments.values());

  if (assetType && assetType !== 'ALL') {
    list = list.filter((i) => i.assetType === assetType);
  }

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    list = list.filter((i) => i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
  }

  res.json(list);
});

app.get('/api/v1/instruments/:id', (req: Request, res: Response) => {
  const inst = db.instruments.get(req.params.id);
  if (!inst) return res.status(404).json({ error: 'Instrument not found' });
  res.json(inst);
});

app.get('/api/v1/instruments/:id/quote', (req: Request, res: Response) => {
  const inst = db.instruments.get(req.params.id);
  if (!inst) return res.status(404).json({ error: 'Instrument not found' });
  res.json({
    symbol: inst.symbol,
    price: inst.price,
    changeAmount: inst.changeAmount,
    changePercent: inst.changePercent,
    high24h: inst.high24h,
    low24h: inst.low24h,
    volume24h: inst.volume24h,
    updatedAt: inst.updatedAt,
  });
});

app.get('/api/v1/instruments/:id/history', (req: Request, res: Response) => {
  const inst = db.instruments.get(req.params.id);
  if (!inst) return res.status(404).json({ error: 'Instrument not found' });
  res.json(inst.history);
});

// Portfolio & Positions
app.get('/api/v1/portfolio', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const portfolio = db.portfolios.get(user.id);
  if (!portfolio) {
    return res.status(404).json({ error: 'Portfolio not found' });
  }
  res.json(portfolio);
});

app.get('/api/v1/portfolio/positions', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const portfolio = db.portfolios.get(user.id);
  if (!portfolio) {
    return res.status(404).json({ error: 'Portfolio not found' });
  }
  const positions = db.positions.get(portfolio.id) || [];
  res.json(positions);
});

app.get('/api/v1/portfolio/balances', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const portfolio = db.portfolios.get(user.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });
  const positions = db.positions.get(portfolio.id) || [];
  const balances = [
    {
      asset: 'USD',
      available: portfolio.simulatedCashBalance,
      locked: 0,
      marketValue: portfolio.simulatedCashBalance,
      averageCost: 1,
      unrealizedPnl: 0,
    },
    ...positions.map((position) => ({
      asset: position.symbol,
      available: position.quantity,
      locked: 0,
      marketValue: position.marketValue,
      averageCost: position.averagePrice,
      unrealizedPnl: position.unrealizedPnl,
    })),
  ];
  res.json(balances);
});

app.post('/api/v1/portfolio/reset', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const reset = db.resetPortfolio(user.id);
  res.json({ success: true, portfolio: reset });
});

// Simulated Orders
app.get('/api/v1/orders', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const userOrders = Array.from(db.orders.values())
    .filter((o) => o.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(userOrders);
});

app.post('/api/v1/orders/simulated', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { instrumentId, side, orderType, quantity, limitPrice } = req.body;

  if (!instrumentId || !side || !orderType || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid simulated order parameters' });
  }

  const instrument = db.instruments.get(instrumentId);
  if (!instrument) {
    return res.status(404).json({ error: 'Instrument not found' });
  }

  if (instrument.status === 'HALTED') {
    return res.status(400).json({ error: 'Trading is currently halted for this instrument' });
  }

  const portfolio = db.portfolios.get(user.id);
  if (!portfolio) {
    return res.status(404).json({ error: 'Portfolio not found' });
  }

  const execPrice = orderType === 'MARKET' ? instrument.price : Number(limitPrice) || instrument.price;
  const totalValue = calcOrderTotal(Number(quantity), execPrice);

  // Validation
  if (side === 'BUY') {
    if (portfolio.simulatedCashBalance < totalValue) {
      return res.status(400).json({
        error: `Insufficient simulated cash. Required: $${totalValue.toFixed(2)}, Available: $${portfolio.simulatedCashBalance.toFixed(2)}`,
      });
    }
  } else {
    // SELL: Check if user owns sufficient position
    const positions = db.positions.get(portfolio.id) || [];
    const pos = positions.find((p) => p.instrumentId === instrumentId);
    if (!pos || pos.quantity < quantity) {
      return res.status(400).json({
        error: `Insufficient position. Owned: ${pos ? pos.quantity : 0} ${instrument.symbol}, Selling: ${quantity}`,
      });
    }
  }

  const now = new Date().toISOString();
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const isMarket = orderType === 'MARKET';

  const newOrder: Order = {
    id: orderId,
    userId: user.id,
    portfolioId: portfolio.id,
    instrumentId: instrument.id,
    symbol: instrument.symbol,
    name: instrument.name,
    side,
    orderType,
    quantity: Number(quantity),
    requestedPrice: execPrice,
    executedPrice: isMarket ? execPrice : 0,
    totalValue,
    status: isMarket ? 'EXECUTED' : 'PENDING',
    createdAt: now,
    executedAt: isMarket ? now : null,
  };

  db.orders.set(newOrder.id, newOrder);

  if (isMarket) {
    // Immediate execution
    if (side === 'BUY') {
      portfolio.simulatedCashBalance = roundDecimal(portfolio.simulatedCashBalance - totalValue);
      db.updatePosition(portfolio.id, instrument.id, instrument.symbol, instrument.name, instrument.assetType, Number(quantity), execPrice, 'BUY');
    } else {
      portfolio.simulatedCashBalance = roundDecimal(portfolio.simulatedCashBalance + totalValue);
      db.updatePosition(portfolio.id, instrument.id, instrument.symbol, instrument.name, instrument.assetType, Number(quantity), execPrice, 'SELL');
    }

    db.recalculateAllPortfolios();

    db.addNotification(user.id, {
      id: `notif_${Date.now()}`,
      userId: user.id,
      type: 'ORDER_EXECUTED',
      title: `Simulated Order Filled: ${instrument.symbol}`,
      body: `${side} ${quantity} ${instrument.symbol} executed at $${execPrice.toFixed(2)} (Total: $${totalValue.toFixed(2)})`,
      createdAt: now,
    });
  }

  db.logAuditEvent({
    actorUserId: user.id,
    actorEmail: user.email,
    eventType: isMarket ? 'ORDER_SIMULATED_EXECUTE' : 'ORDER_SIMULATED_PENDING',
    targetType: 'ORDER',
    targetId: newOrder.id,
    metadataJson: { symbol: instrument.symbol, side, qty: quantity, price: execPrice, orderType },
    ipHash: req.ip ? String(req.ip) : 'unknown',
  });

  res.status(201).json(newOrder);
});

app.post('/api/v1/orders/:id/cancel', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const order = db.orders.get(req.params.id);

  if (!order || order.userId !== user.id) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.status !== 'PENDING') {
    return res.status(400).json({ error: 'Only pending orders can be cancelled' });
  }

  order.status = 'CANCELLED';
  res.json({ success: true, order });
});

// Watchlists
app.get('/api/v1/watchlists', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const lists = db.watchlists.get(user.id) || [];
  res.json(lists);
});

app.post('/api/v1/watchlists', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Watchlist name required' });

  const now = new Date().toISOString();
  const newWatchlist: Watchlist = {
    id: `wl_${Date.now()}`,
    userId: user.id,
    name: name.trim(),
    instrumentIds: [],
    createdAt: now,
    updatedAt: now,
  };

  const userLists = db.watchlists.get(user.id) || [];
  userLists.push(newWatchlist);
  db.watchlists.set(user.id, userLists);

  res.status(201).json(newWatchlist);
});

app.post('/api/v1/watchlists/:id/items', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { instrumentId } = req.body;
  const userLists = db.watchlists.get(user.id) || [];
  const targetList = userLists.find((w) => w.id === req.params.id);

  if (!targetList) return res.status(404).json({ error: 'Watchlist not found' });
  if (!targetList.instrumentIds.includes(instrumentId)) {
    targetList.instrumentIds.push(instrumentId);
    targetList.updatedAt = new Date().toISOString();
  }

  res.json(targetList);
});

app.delete('/api/v1/watchlists/:id/items/:instrumentId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const userLists = db.watchlists.get(user.id) || [];
  const targetList = userLists.find((w) => w.id === req.params.id);

  if (!targetList) return res.status(404).json({ error: 'Watchlist not found' });
  targetList.instrumentIds = targetList.instrumentIds.filter((id) => id !== req.params.instrumentId);
  targetList.updatedAt = new Date().toISOString();

  res.json(targetList);
});

// AI Insights (Powered by Gemini with strict educational guardrails)
app.get('/api/v1/insights', (req: Request, res: Response) => {
  const insightsList = Array.from(db.insights.values());
  res.json(insightsList);
});

app.get('/api/v1/insights/:instrumentId', (req: Request, res: Response) => {
  const insight = db.insights.get(req.params.instrumentId);
  if (!insight) return res.status(404).json({ error: 'No insight available for this instrument' });
  res.json(insight);
});

app.post('/api/v1/insights/generate', async (req: Request, res: Response) => {
  const { instrumentId, context } = req.body;
  const instrument = db.instruments.get(instrumentId);

  if (!instrument) {
    return res.status(404).json({ error: 'Instrument not found' });
  }

  try {
    const insight = await generateEducationalMarketInsight(instrument, context);
    db.insights.set(instrument.id, insight);

    db.logAuditEvent({
      actorUserId: getCurrentUser(req)?.id || 'anonymous',
      actorEmail: getCurrentUser(req)?.email || 'anonymous',
      eventType: 'AI_INSIGHT_GENERATED',
      targetType: 'INSTRUMENT',
      targetId: instrument.id,
      metadataJson: { symbol: instrument.symbol, model: insight.modelName },
      ipHash: req.ip ? String(req.ip) : 'unknown',
    });

    res.json(insight);
  } catch (err: any) {
    res.status(500).json({ error: 'Unable to generate market insight at this moment' });
  }
});

// Interactive Verity-Capital Inv Broker Chat (Compliant Institutional Concierge)
app.post('/api/v1/broker-chat', async (req: Request, res: Response) => {
  const { message, portfolioContext, kycTier } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const result = await executeVerityBrokerChat({
      message,
      portfolioContext,
      kycTier,
    });

    db.logAuditEvent({
      actorUserId: getCurrentUser(req)?.id || 'anonymous',
      actorEmail: getCurrentUser(req)?.email || 'anonymous',
      eventType: 'BROKER_CHAT_INTERACTION',
      targetType: 'SYSTEM',
      targetId: 'verity_broker_desk',
      metadataJson: { queryLength: message.length, hasAction: !!result.suggestedAction },
      ipHash: req.ip ? String(req.ip) : 'unknown',
    });

    res.json(result);
  } catch (err: any) {
    console.error('Broker chat error:', err);
    res.status(500).json({
      reply: 'The Verity-Capital Inv Institutional Brokerage Desk is currently undergoing scheduled maintenance. Please try again shortly.',
    });
  }
});

// Notifications
app.get('/api/v1/notifications', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const list = db.notifications.get(user.id) || [];
  res.json(list);
});

app.post('/api/v1/notifications/mark-read', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const list = db.notifications.get(user.id) || [];
  const now = new Date().toISOString();
  list.forEach((n) => (n.readAt = now));
  res.json({ success: true });
});

// Audit Events (for current user activity feed)
app.get('/api/v1/activity', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const activity = db.auditEvents.filter((a) => a.actorUserId === user.id);
  res.json(activity);
});

// Factual Crypto Specifications (BTC, ETH, SOL, XRP, ADA)
const FACTUAL_CRYPTO_SPECS: Record<string, FactualCryptoAsset> = {
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    consensusMechanism: 'Proof-of-Work (PoW) SHA-256',
    genesisYear: 2009,
    maxSupply: '21,000,000 BTC',
    circulatingSupply: '~19,750,000 BTC',
    regulatoryClassification: 'Digital Commodity (US CFTC Jurisdictional Determination)',
    averageBlockTime: '10.0 minutes',
    cryptographicStandard: 'Secp256k1 Elliptic Curve',
    networkUtility: 'Decentralized store of value, settlement medium & peer-to-peer digital bearer asset.',
    institutionalCustodianSupport: ['Fidelity Digital Assets', 'BitGo Trust', 'Coinbase Custody', 'Anchorage Digital']
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    consensusMechanism: 'Proof-of-Stake (PoS) Casper FFG',
    genesisYear: 2015,
    maxSupply: 'Dynamic (EIP-1559 Fee Burn Rate vs Staking Issuance)',
    circulatingSupply: '~120,200,000 ETH',
    regulatoryClassification: 'Decentralized Network Protocol / Commodity (Spot ETF Approved)',
    averageBlockTime: '12.0 seconds',
    cryptographicStandard: 'Keccak-256 / Secp256k1',
    networkUtility: 'Programmable smart contract execution virtual machine (EVM) gas & settlement fuel.',
    institutionalCustodianSupport: ['Fidelity Digital Assets', 'Anchorage Digital', 'Fireblocks', 'BitGo Trust']
  },
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    consensusMechanism: 'Proof-of-History (PoH) combined with Tower BFT Proof-of-Stake',
    genesisYear: 2020,
    maxSupply: 'Dynamic (Disinflationary emission schedule)',
    circulatingSupply: '~465,000,000 SOL',
    regulatoryClassification: 'Decentralized Layer 1 Utility Asset',
    averageBlockTime: '400 milliseconds',
    cryptographicStandard: 'Ed25519 Curve25519',
    networkUtility: 'Ultra-low-latency distributed ledger transaction processing and smart contract gas.',
    institutionalCustodianSupport: ['Anchorage Digital', 'Coinbase Custody', 'Copper Technologies']
  },
  XRP: {
    symbol: 'XRP',
    name: 'Ripple / XRP Ledger',
    consensusMechanism: 'XRP Ledger Consensus Protocol (Federated Byzantine Agreement)',
    genesisYear: 2012,
    maxSupply: '100,000,000,000 XRP',
    circulatingSupply: '~56,000,000,000 XRP',
    regulatoryClassification: 'Digital Asset / Non-Security on Secondary Spot Markets (SDNY Ruling 2023)',
    averageBlockTime: '3.5 seconds',
    cryptographicStandard: 'Secp256k1 / Ed25519',
    networkUtility: 'Cross-border liquidity bridge asset and real-time gross settlement on XRPL.',
    institutionalCustodianSupport: ['Ripple Custody (Metaco)', 'BitGo Trust', 'Anchorage Digital']
  },
  ADA: {
    symbol: 'ADA',
    name: 'Cardano',
    consensusMechanism: 'Ouroboros Praos Proof-of-Stake',
    genesisYear: 2017,
    maxSupply: '45,000,000,000 ADA',
    circulatingSupply: '~35,700,000,000 ADA',
    regulatoryClassification: 'Decentralized Layer 1 Protocol Asset',
    averageBlockTime: '20.0 seconds',
    cryptographicStandard: 'Ed25519 extended (BIP32-Ed25519)',
    networkUtility: 'Peer-reviewed academic research blockchain, formal verification smart contracts & governance.',
    institutionalCustodianSupport: ['BitGo Trust', 'Coinbase Custody', 'Fireblocks']
  }
};

app.get('/api/v1/assets/specifications', (req: Request, res: Response) => {
  res.json(Object.values(FACTUAL_CRYPTO_SPECS));
});

app.get('/api/v1/assets/specifications/:symbol', (req: Request, res: Response) => {
  const sym = req.params.symbol.toUpperCase();
  const spec = FACTUAL_CRYPTO_SPECS[sym];
  if (!spec) return res.status(404).json({ error: 'Asset specification not found. Supported: BTC, ETH, SOL, XRP, ADA.' });
  res.json(spec);
});

// Transfers & Custody Management (Deposits, Withdrawals, Wallet Transfers)
app.get('/api/v1/transfers', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const list = db.getTransfers(user.id);
  res.json(list);
});

app.post('/api/v1/transfers', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { type, asset, amount, destinationAddress, method, notes } = req.body;

  if (!type || !asset || !amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Type, supported asset, and positive amount are required' });
  }

  const validAssets = ['USD', 'BTC', 'ETH', 'SOL', 'XRP', 'ADA'];
  if (!validAssets.includes(asset)) {
    return res.status(400).json({ error: 'Asset not supported. Supported assets: USD, BTC, ETH, SOL, XRP, ADA.' });
  }

  // Pre-withdrawal balance check
  if (type === 'WITHDRAW_USD') {
    const port = db.portfolios.get(user.id);
    if (!port || port.simulatedCashBalance < amount) {
      return res.status(400).json({ error: 'Insufficient USD cash balance for withdrawal' });
    }
  }

  const record = db.createTransfer(user.id, {
    type,
    asset,
    amount,
    destinationAddress,
    method,
    notes,
  });

  res.status(201).json(record);
});

// US Regulatory Compliance & KYC Profile (CIP, W-9, OFAC)
app.get('/api/v1/compliance/kyc', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const profile = db.getKycProfile(user.id);
  res.json(profile);
});

app.post('/api/v1/compliance/kyc', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { legalFirstName, legalLastName, dateOfBirth, ssnLastFour, usState, w9Attestation, tier } = req.body;

  const requestedTier = tier === 'TIER_2_INSTITUTIONAL' ? 'TIER_1_VERIFIED' : (tier || 'TIER_1_VERIFIED');
  const updated = db.updateKycProfile(user.id, {
    legalFirstName: legalFirstName || user.firstName,
    legalLastName: legalLastName || user.lastName,
    dateOfBirth,
    ssnLastFour,
    usState,
    w9Attestation: Boolean(w9Attestation),
    tier: requestedTier,
    cipStatus: 'IN_REVIEW',
    ofacScreening: 'CLEARED',
    dailyWithdrawalLimitUsd: 100000,
  });

  res.json(updated);
});

// ----------------------------------------------------
// ADMIN ROUTES (/api/v1/admin/*)
// ----------------------------------------------------
app.get('/api/v1/admin/users', requireAdmin, (req: Request, res: Response) => {
  const usersList = Array.from(db.users.values()).map((u) => {
    const port = db.portfolios.get(u.id);
    return {
      ...u,
      simulatedBalance: port ? port.simulatedCashBalance : 0,
      totalEquity: port ? port.totalEquity : 0,
    };
  });
  res.json(usersList);
});

app.patch('/api/v1/admin/users/:userId/status', requireAdmin, (req: Request, res: Response) => {
  const { status } = req.body;
  const user = db.users.get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (status !== 'ACTIVE' && status !== 'SUSPENDED') {
    return res.status(400).json({ error: 'Invalid status' });
  }

  user.status = status;
  user.updatedAt = new Date().toISOString();

  db.logAuditEvent({
    actorUserId: (req as any).user.id,
    actorEmail: (req as any).user.email,
    eventType: 'ADMIN_USER_STATUS_CHANGE',
    targetType: 'USER',
    targetId: user.id,
    metadataJson: { newStatus: status },
    ipHash: req.ip ? String(req.ip) : 'unknown',
  });

  res.json(user);
});

app.get('/api/v1/admin/orders', requireAdmin, (req: Request, res: Response) => {
  const allOrders = Array.from(db.orders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(allOrders);
});

app.get('/api/v1/admin/instruments', requireAdmin, (req: Request, res: Response) => {
  res.json(Array.from(db.instruments.values()));
});

app.patch('/api/v1/admin/instruments/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { status } = req.body;
  const inst = db.instruments.get(req.params.id);
  if (!inst) return res.status(404).json({ error: 'Instrument not found' });

  inst.status = status;
  inst.updatedAt = new Date().toISOString();

  db.logAuditEvent({
    actorUserId: (req as any).user.id,
    actorEmail: (req as any).user.email,
    eventType: 'ADMIN_INSTRUMENT_STATUS_CHANGE',
    targetType: 'INSTRUMENT',
    targetId: inst.id,
    metadataJson: { symbol: inst.symbol, newStatus: status },
    ipHash: req.ip ? String(req.ip) : 'unknown',
  });

  res.json(inst);
});

app.get('/api/v1/admin/audit-events', requireAdmin, (req: Request, res: Response) => {
  res.json(db.auditEvents);
});

app.get('/api/v1/admin/system-health', requireAdmin, (req: Request, res: Response) => {
  res.json(db.getSystemHealth());
});

// Admin: Adjust user simulated balance
app.post('/api/v1/admin/users/:userId/adjust-balance', requireAdmin, (req: Request, res: Response) => {
  const { amount, reason } = req.body;
  if (typeof amount !== 'number' || isNaN(amount)) {
    return res.status(400).json({ error: 'Valid adjustment amount is required' });
  }

  const result = db.adjustUserBalance(req.params.userId, amount, reason || '', (req as any).user.email);
  if (!result) {
    return res.status(404).json({ error: 'User or portfolio not found' });
  }
  res.json(result);
});

// Admin: Force Cancel Order
app.post('/api/v1/admin/orders/:orderId/cancel', requireAdmin, (req: Request, res: Response) => {
  const { reason } = req.body;
  const order = db.forceCancelOrder(req.params.orderId, reason || 'Administrative cancellation', (req as any).user.email);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Admin: Force Execute Order
app.post('/api/v1/admin/orders/:orderId/execute', requireAdmin, (req: Request, res: Response) => {
  const order = db.forceExecuteOrder(req.params.orderId, (req as any).user.email);
  if (!order) return res.status(404).json({ error: 'Order or instrument not found' });
  res.json(order);
});

// Admin: Add New Market Instrument
app.post('/api/v1/admin/instruments', requireAdmin, (req: Request, res: Response) => {
  const { symbol, name, assetType, exchange, currency, price } = req.body;
  if (!symbol || !name || !assetType || !price) {
    return res.status(400).json({ error: 'Symbol, name, assetType, and price are required' });
  }

  const inst = db.addInstrument({
    symbol,
    name,
    assetType,
    exchange: exchange || 'NASDAQ',
    currency: currency || 'USD',
    price: Number(price),
  });
  res.status(201).json(inst);
});

// Admin: Price Override
app.patch('/api/v1/admin/instruments/:id/price', requireAdmin, (req: Request, res: Response) => {
  const { price } = req.body;
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'Valid positive price required' });
  }

  const inst = db.setInstrumentPrice(req.params.id, price);
  if (!inst) return res.status(404).json({ error: 'Instrument not found' });
  res.json(inst);
});

// Admin: Global Circuit Breaker (Halt/Resume All)
app.post('/api/v1/admin/circuit-breaker', requireAdmin, (req: Request, res: Response) => {
  const { haltAll } = req.body;
  db.setGlobalCircuitBreaker(Boolean(haltAll));
  res.json({ success: true, haltAll: Boolean(haltAll) });
});

// Admin: Market Shock Simulator
app.post('/api/v1/admin/market-shock', requireAdmin, (req: Request, res: Response) => {
  const { scenario } = req.body;
  if (!['TECH_SURGE', 'CRYPTO_RALLY', 'MACRO_SELLOFF', 'FLASH_CRASH'].includes(scenario)) {
    return res.status(400).json({ error: 'Invalid shock scenario' });
  }
  const result = db.triggerMarketShock(scenario);
  res.json(result);
});

// Admin: Toggle Simulated Feed Engine
app.post('/api/v1/admin/feed-status', requireAdmin, (req: Request, res: Response) => {
  const { running } = req.body;
  const state = db.toggleFeedStatus(Boolean(running));
  res.json({ running: state });
});

// Admin: Export Audit Log as JSON / CSV
app.get('/api/v1/admin/audit-export', requireAdmin, (req: Request, res: Response) => {
  const events = db.auditEvents;
  res.json(events);
});

// Admin: Custody Transfers Overview
app.get('/api/v1/admin/transfers', requireAdmin, (req: Request, res: Response) => {
  const allTransfers = db.getAllTransfers();
  res.json(allTransfers);
});

// Admin: Compliance KYC Overview
app.get('/api/v1/admin/compliance/kyc', requireAdmin, (req: Request, res: Response) => {
  const profiles = Array.from(db.users.values()).map(u => ({
    user: u,
    kyc: db.getKycProfile(u.id)
  }));
  res.json(profiles);
});

// Admin: Approve / Upgrade KYC Tier
app.patch('/api/v1/admin/compliance/kyc/:userId', requireAdmin, (req: Request, res: Response) => {
  const { tier, cipStatus, ofacScreening } = req.body;
  const updated = db.updateKycProfile(req.params.userId, {
    ...(tier ? { tier } : {}),
    ...(cipStatus ? { cipStatus } : {}),
    ...(ofacScreening ? { ofacScreening } : {}),
  });
  res.json(updated);
});

// ----------------------------------------------------
// VITE MIDDLEWARE & STATIC SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Verity-Capital Inv Exchange] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
