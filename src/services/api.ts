import {
  User,
  Instrument,
  Position,
  Portfolio,
  PortfolioBalance,
  Order,
  Watchlist,
  AiInsight,
  AuditEvent,
  AppNotification,
  SystemHealth,
  TradeRequest,
  TransferRecord,
  KycProfile,
  FactualCryptoAsset,
  BrokerChatResponse,
  InvestmentPlan
} from '../types.ts';
import { clientStorageEngine } from './clientStorage.ts';

const API_BASE = '/api/v1';

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('verity_capital_inv_token');
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('verity_capital_inv_token', token);
    } else {
      localStorage.removeItem('verity_capital_inv_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type') || '';

      // When deployed to Vercel/static hosts without Express, any POST or GET to missing /api route
      // returns 405 (Method Not Allowed) or 404 or text/html (Vercel SPA rewrite fallback to index.html).
      // Seamlessly handle with clientStorageEngine!
      if (response.status === 405 || response.status === 404 || !contentType.includes('application/json')) {
        return await clientStorageEngine.handleRequest<T>(endpoint, options, this.token);
      }

      if (!response.ok) {
        // If server returned 500/502/503, fallback safely
        if (response.status >= 500) {
          return await clientStorageEngine.handleRequest<T>(endpoint, options, this.token);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      return response.json();
    } catch (err: any) {
      // If network offline or fetch failed (e.g. Vercel static environment or network block)
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('405'))) {
        return await clientStorageEngine.handleRequest<T>(endpoint, options, this.token);
      }
      throw err;
    }
  }

  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(firstName: string, lastName: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async switchDemo(role: 'CUSTOMER' | 'ADMIN'): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>('/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    this.setToken(data.token);
    return data;
  }

  

  async syncSupabaseUser(data: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  }, accessToken?: string): Promise<{ user: User; token: string }> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      } else if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_BASE}/auth/supabase-sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        this.setToken(result.token);
        clientStorageEngine.setCurrentUser(result.user);
        return result;
      }
    } catch (err) {
      console.warn('Backend syncSupabaseUser failed, falling back to client storage:', err);
    }

    // Direct fallback to clientStorageEngine so login never breaks
    const fallbackResult = await clientStorageEngine.handleRequest<{ user: User; token: string }>(
      '/auth/supabase-sync',
      { method: 'POST', body: JSON.stringify(data) },
      accessToken || this.token
    );
    this.setToken(fallbackResult.token);
    clientStorageEngine.setCurrentUser(fallbackResult.user);
    return fallbackResult;
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) {
      return null;
    }
    try {
      const data = await this.request<{ user: User }>('/auth/me');
      if (data?.user) {
        clientStorageEngine.setCurrentUser(data.user);
        return data.user;
      }
    } catch {
      // ignore
    }
    const localUser = clientStorageEngine.getCurrentUser();
    if (localUser) {
      return localUser;
    }
    return null;
  }

  async logout(): Promise<void> {
    this.setToken(null);
  }

  // Instruments
  async getInstruments(assetType?: string, query?: string): Promise<Instrument[]> {
    const params = new URLSearchParams();
    if (assetType && assetType !== 'ALL') params.append('assetType', assetType);
    if (query) params.append('query', query);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request<Instrument[]>(`/instruments${queryString}`);
  }

  async getInstrument(id: string): Promise<Instrument> {
    return this.request<Instrument>(`/instruments/${id}`);
  }

  // Portfolio
  async getPortfolio(): Promise<Portfolio> {
    return this.request<Portfolio>('/portfolio');
  }

  async getPositions(): Promise<Position[]> {
    return this.request<Position[]>('/portfolio/positions');
  }

  async getPortfolioBalances(): Promise<PortfolioBalance[]> {
    return this.request<PortfolioBalance[]>('/portfolio/balances');
  }

  async resetPortfolio(): Promise<{ success: boolean; portfolio: Portfolio }> {
    return this.request<{ success: boolean; portfolio: Portfolio }>('/portfolio/reset', {
      method: 'POST',
    });
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders');
  }

  async placeOrder(order: TradeRequest): Promise<Order> {
    return this.request<Order>('/orders/simulated', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async cancelOrder(orderId: string): Promise<{ success: boolean; order: Order }> {
    return this.request<{ success: boolean; order: Order }>(`/orders/${orderId}/cancel`, {
      method: 'POST',
    });
  }

  // Watchlists
  async getWatchlists(): Promise<Watchlist[]> {
    return this.request<Watchlist[]>('/watchlists');
  }

  async createWatchlist(name: string): Promise<Watchlist> {
    return this.request<Watchlist>('/watchlists', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async addToWatchlist(watchlistId: string, instrumentId: string): Promise<Watchlist> {
    return this.request<Watchlist>(`/watchlists/${watchlistId}/items`, {
      method: 'POST',
      body: JSON.stringify({ instrumentId }),
    });
  }

  async removeFromWatchlist(watchlistId: string, instrumentId: string): Promise<Watchlist> {
    return this.request<Watchlist>(`/watchlists/${watchlistId}/items/${instrumentId}`, {
      method: 'DELETE',
    });
  }

  // AI Insights
  async getInsights(): Promise<AiInsight[]> {
    return this.request<AiInsight[]>('/insights');
  }

  async getInstrumentInsight(instrumentId: string): Promise<AiInsight> {
    return this.request<AiInsight>(`/insights/${instrumentId}`);
  }

  async generateInsight(instrumentId: string, context?: string): Promise<AiInsight> {
    return this.request<AiInsight>('/insights/generate', {
      method: 'POST',
      body: JSON.stringify({ instrumentId, context }),
    });
  }

  // Interactive Verity-Capital Inv Broker Chat
  async brokerChat(payload: {
    message: string;
    portfolioContext?: {
      cashBalance: number;
      totalEquity: number;
      positions: { symbol: string; quantity: number; currentPrice: number; marketValue: number; unrealizedPnl: number }[];
    };
    kycTier?: string;
  }): Promise<BrokerChatResponse> {
    return this.request<BrokerChatResponse>('/broker-chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    return this.request<AppNotification[]>('/notifications');
  }

  async markNotificationsRead(): Promise<void> {
    await this.request('/notifications/mark-read', { method: 'POST' });
  }

  // Activity
  async getActivity(): Promise<AuditEvent[]> {
    return this.request<AuditEvent[]>('/activity');
  }

  // Settings
  async getWhatsAppNumber(): Promise<string> {
    const data = await this.request<{ whatsappNumber: string }>('/settings/whatsapp');
    return data.whatsappNumber;
  }

  async updateWhatsAppNumber(whatsappNumber: string): Promise<string> {
    const data = await this.request<{ whatsappNumber: string }>('/admin/settings/whatsapp', {
      method: 'POST',
      body: JSON.stringify({ whatsappNumber }),
    });
    return data.whatsappNumber;
  }

  // Investment Plans
  async getInvestmentPlans(): Promise<InvestmentPlan[]> {
    const data = await this.request<{ plans: InvestmentPlan[] }>('/plans');
    return data.plans;
  }

  async adminUpdateInvestmentPlan(plan: InvestmentPlan): Promise<InvestmentPlan> {
    const data = await this.request<{ success: boolean; plan: InvestmentPlan }>('/admin/plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
    return data.plan;
  }

  // Admin
  async getAdminUsers(): Promise<(User & { simulatedBalance: number; totalEquity: number })[]> {
    return this.request<(User & { simulatedBalance: number; totalEquity: number })[]>('/admin/users');
  }

  async updateAdminUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<User> {
    return this.request<User>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getAdminOrders(): Promise<Order[]> {
    return this.request<Order[]>('/admin/orders');
  }

  async getAdminInstruments(): Promise<Instrument[]> {
    return this.request<Instrument[]>('/admin/instruments');
  }

  async updateInstrumentStatus(instrumentId: string, status: 'ACTIVE' | 'HALTED'): Promise<Instrument> {
    return this.request<Instrument>(`/admin/instruments/${instrumentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getAdminAuditEvents(): Promise<AuditEvent[]> {
    return this.request<AuditEvent[]>('/admin/audit-events');
  }

  async getSystemHealth(): Promise<SystemHealth> {
    return this.request<SystemHealth>('/admin/system-health');
  }

  async adjustUserBalance(userId: string, amount: number, reason?: string): Promise<{ success: boolean; newBalance: number }> {
    return this.request<{ success: boolean; newBalance: number }>(`/admin/users/${userId}/adjust-balance`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  }

  async adminCancelOrder(orderId: string, reason?: string): Promise<Order> {
    return this.request<Order>(`/admin/orders/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async adminExecuteOrder(orderId: string): Promise<Order> {
    return this.request<Order>(`/admin/orders/${orderId}/execute`, {
      method: 'POST',
    });
  }

  async adminAddInstrument(data: {
    symbol: string;
    name: string;
    assetType: 'STOCK' | 'CRYPTO' | 'ETF' | 'FOREX';
    exchange: string;
    currency: string;
    price: number;
  }): Promise<Instrument> {
    return this.request<Instrument>('/admin/instruments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async adminUpdateInstrumentPrice(id: string, price: number): Promise<Instrument> {
    return this.request<Instrument>(`/admin/instruments/${id}/price`, {
      method: 'PATCH',
      body: JSON.stringify({ price }),
    });
  }

  async adminSetCircuitBreaker(haltAll: boolean): Promise<{ success: boolean; haltAll: boolean }> {
    return this.request<{ success: boolean; haltAll: boolean }>('/admin/circuit-breaker', {
      method: 'POST',
      body: JSON.stringify({ haltAll }),
    });
  }

  async adminTriggerMarketShock(scenario: 'TECH_SURGE' | 'CRYPTO_RALLY' | 'MACRO_SELLOFF' | 'FLASH_CRASH'): Promise<{ scenario: string; affectedCount: number }> {
    return this.request<{ scenario: string; affectedCount: number }>('/admin/market-shock', {
      method: 'POST',
      body: JSON.stringify({ scenario }),
    });
  }

  async adminSetFeedStatus(running: boolean): Promise<{ running: boolean }> {
    return this.request<{ running: boolean }>('/admin/feed-status', {
      method: 'POST',
      body: JSON.stringify({ running }),
    });
  }

  async adminExportAuditEvents(): Promise<AuditEvent[]> {
    return this.request<AuditEvent[]>('/admin/audit-export');
  }

  // Transfers & Custody Management
  async getTransfers(): Promise<TransferRecord[]> {
    return this.request<TransferRecord[]>('/transfers');
  }

  async createTransfer(data: {
    type: 'DEPOSIT_USD' | 'WITHDRAW_USD' | 'DEPOSIT_CRYPTO' | 'WITHDRAW_CRYPTO';
    asset: 'USD' | 'BTC' | 'ETH' | 'SOL' | 'XRP' | 'ADA';
    amount: number;
    destinationAddress?: string;
    method?: string;
    notes?: string;
  }): Promise<TransferRecord> {
    return this.request<TransferRecord>('/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // US Regulatory Compliance & KYC Profile
  async getKycProfile(): Promise<KycProfile> {
    return this.request<KycProfile>('/compliance/kyc');
  }

  async updateKycProfile(data: Partial<KycProfile>): Promise<KycProfile> {
    return this.request<KycProfile>('/compliance/kyc', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Factual Asset Specifications (BTC, ETH, SOL, XRP, ADA)
  async getAssetSpecifications(): Promise<FactualCryptoAsset[]> {
    return this.request<FactualCryptoAsset[]>('/assets/specifications');
  }

  async getAssetSpecification(symbol: string): Promise<FactualCryptoAsset> {
    return this.request<FactualCryptoAsset>(`/assets/specifications/${symbol}`);
  }

  // Admin Custody & Compliance
  async adminGetTransfers(): Promise<TransferRecord[]> {
    return this.request<TransferRecord[]>('/admin/transfers');
  }

  async adminGetKycProfiles(): Promise<{ user: User; kyc: KycProfile }[]> {
    return this.request<{ user: User; kyc: KycProfile }[]>('/admin/compliance/kyc');
  }

  async adminUpdateUserKyc(userId: string, updates: Partial<KycProfile>): Promise<KycProfile> {
    return this.request<KycProfile>(`/admin/compliance/kyc/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }
}

export const api = new ApiService();
