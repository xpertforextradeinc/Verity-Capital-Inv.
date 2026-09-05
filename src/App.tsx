import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Portfolio,
  Position,
  Instrument,
  Order,
  Watchlist,
  AiInsight,
  AppNotification,
  AuditEvent,
  OrderSide,
  OrderType
} from './types.ts';
import { api } from './services/api.ts';
import { Header } from './components/common/Header.tsx';
import { TickerBar } from './components/common/TickerBar.tsx';
import { LandingPage } from './components/public/LandingPage.tsx';
import { InfoPages } from './components/public/InfoPages.tsx';
import { DashboardView } from './components/customer/DashboardView.tsx';
import { PortfolioView } from './components/customer/PortfolioView.tsx';
import { MarketsView } from './components/customer/MarketsView.tsx';
import { WatchlistsView } from './components/customer/WatchlistsView.tsx';
import { OrdersView } from './components/customer/OrdersView.tsx';
import { AiInsightsView } from './components/customer/AiInsightsView.tsx';
import { ActivityView } from './components/customer/ActivityView.tsx';
import { SettingsView } from './components/customer/SettingsView.tsx';
import { AdminPortal } from './components/admin/AdminPortal.tsx';
import { GoogleDriveView } from './components/drive/GoogleDriveView.tsx';
import { TradeModal } from './components/customer/TradeModal.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { ShieldAlert, TrendingUp, Info } from 'lucide-react';

export default function App() {
  // Application State
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activity, setActivity] = useState<AuditEvent[]>([]);

  // Navigation & UI State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState<boolean>(false);
  const [tradeModalInstrument, setTradeModalInstrument] = useState<Instrument | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch all initial data
  const fetchData = useCallback(async () => {
    try {
      const [instList, insList] = await Promise.all([
        api.getInstruments(),
        api.getInsights(),
      ]);
      setInstruments(instList);
      setInsights(insList);

      // Attempt to load authenticated user data
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          const [port, pos, ords, wls, notifs, act] = await Promise.all([
            api.getPortfolio(),
            api.getPositions(),
            api.getOrders(),
            api.getWatchlists(),
            api.getNotifications(),
            api.getActivity(),
          ]);
          setPortfolio(port);
          setPositions(pos);
          setOrders(ords);
          setWatchlists(wls);
          setNotifications(notifs);
          setActivity(act);
        }
      } catch (err) {
        // Not authenticated
        setUser(null);
      }
    } catch (err) {
      console.error('Error loading initial Quantix data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Periodic polling to sync with simulated market tick engine (every 4 seconds)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const instList = await api.getInstruments();
        setInstruments(instList);

        if (user) {
          const [port, pos, ords] = await Promise.all([
            api.getPortfolio(),
            api.getPositions(),
            api.getOrders(),
          ]);
          setPortfolio(port);
          setPositions(pos);
          setOrders(ords);
        }
      } catch (err) {
        // Ignore background polling errors
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [user]);

  // Handlers
  const handleSelectInstrument = (inst: Instrument) => {
    setSelectedInstrument(inst);
    setCurrentTab('markets');
  };

  const handleOpenTrade = (inst?: Instrument) => {
    setTradeModalInstrument(inst || selectedInstrument || instruments[0] || null);
    setIsTradeModalOpen(true);
  };

  const handleExecuteTrade = async (trade: {
    instrumentId: string;
    side: OrderSide;
    orderType: OrderType;
    quantity: number;
    limitPrice?: number;
  }) => {
    await api.placeOrder(trade);
    // Refresh portfolio and orders immediately
    const [port, pos, ords, act, notifs] = await Promise.all([
      api.getPortfolio(),
      api.getPositions(),
      api.getOrders(),
      api.getActivity(),
      api.getNotifications(),
    ]);
    setPortfolio(port);
    setPositions(pos);
    setOrders(ords);
    setActivity(act);
    setNotifications(notifs);
  };

  const handleCancelOrder = async (orderId: string) => {
    await api.cancelOrder(orderId);
    const ords = await api.getOrders();
    setOrders(ords);
  };

  const handleResetPortfolio = async () => {
    await api.resetPortfolio();
    const [port, pos, ords, act] = await Promise.all([
      api.getPortfolio(),
      api.getPositions(),
      api.getOrders(),
      api.getActivity(),
    ]);
    setPortfolio(port);
    setPositions(pos);
    setOrders(ords);
    setActivity(act);
  };

  const handleSwitchDemo = async (role: 'CUSTOMER' | 'ADMIN') => {
    setIsLoading(true);
    try {
      const data = await api.switchDemo(role);
      setUser(data.user);
      if (data.user.role === 'ADMIN') {
        setCurrentTab('admin-overview');
      } else {
        setCurrentTab('dashboard');
      }
      await fetchData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, pass: string) => {
    const data = await api.login(email, pass);
    setUser(data.user);
    setCurrentTab(data.user.role === 'ADMIN' ? 'admin-overview' : 'dashboard');
    await fetchData();
  };

  const handleRegister = async (fName: string, lName: string, email: string, pass: string) => {
    const data = await api.register(fName, lName, email, pass);
    setUser(data.user);
    setCurrentTab('dashboard');
    await fetchData();
  };

  const handleGoogleSignIn = async (email: string, displayName?: string) => {
    try {
      setIsLoading(true);
      const data = await api.syncGoogleUser(email, displayName);
      setUser(data.user);
      setCurrentTab('dashboard');
      await fetchData();
    } catch (err: any) {
      console.error('Failed to sync Google user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setPortfolio(null);
    setPositions([]);
    setOrders([]);
    setCurrentTab('home');
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Watchlist handlers
  const handleCreateWatchlist = async (name: string) => {
    await api.createWatchlist(name);
    const wls = await api.getWatchlists();
    setWatchlists(wls);
  };

  const handleAddToWatchlist = async (watchlistId: string, instrumentId: string) => {
    await api.addToWatchlist(watchlistId, instrumentId);
    const wls = await api.getWatchlists();
    setWatchlists(wls);
  };

  const handleRemoveFromWatchlist = async (watchlistId: string, instrumentId: string) => {
    await api.removeFromWatchlist(watchlistId, instrumentId);
    const wls = await api.getWatchlists();
    setWatchlists(wls);
  };

  // AI Insight generation
  const handleGenerateInsight = async (instrumentId: string, context?: string) => {
    const newInsight = await api.generateInsight(instrumentId, context);
    const insList = await api.getInsights();
    setInsights(insList);
    return newInsight;
  };

  return (
    <div className="min-h-screen bg-[#070A10] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Header */}
      <Header
        user={user}
        portfolio={portfolio}
        instruments={instruments}
        notifications={notifications}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenTrade={handleOpenTrade}
        onResetPortfolio={handleResetPortfolio}
        onSwitchDemo={handleSwitchDemo}
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
      />

      {/* Live Market Ticker Bar */}
      {instruments.length > 0 && (
        <TickerBar
          instruments={instruments}
          onSelectInstrument={handleSelectInstrument}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <span className="text-xs text-zinc-400 font-mono">Loading Quantix Simulated Engine...</span>
          </div>
        ) : (
          <>
            {/* View Routing */}
            {currentTab === 'home' && (
              <LandingPage
                instruments={instruments}
                onOpenTrade={handleOpenTrade}
                onOpenAuth={handleOpenAuth}
                onSelectTab={setCurrentTab}
              />
            )}

            {currentTab === 'dashboard' && (
              <DashboardView
                portfolio={portfolio}
                positions={positions}
                orders={orders}
                instruments={instruments}
                insights={insights}
                onOpenTrade={handleOpenTrade}
                onSelectInstrument={handleSelectInstrument}
                onNavigateTab={setCurrentTab}
                onResetPortfolio={handleResetPortfolio}
              />
            )}

            {currentTab === 'portfolio' && (
              <PortfolioView
                portfolio={portfolio}
                positions={positions}
                instruments={instruments}
                onOpenTrade={handleOpenTrade}
                onResetPortfolio={handleResetPortfolio}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'markets' && (
              <MarketsView
                instruments={instruments}
                selectedInstrument={selectedInstrument}
                onSelectInstrument={setSelectedInstrument}
                onOpenTrade={handleOpenTrade}
                onToggleWatchlist={(instId) => {
                  if (watchlists[0]) {
                    if (watchlists[0].instrumentIds.includes(instId)) {
                      handleRemoveFromWatchlist(watchlists[0].id, instId);
                    } else {
                      handleAddToWatchlist(watchlists[0].id, instId);
                    }
                  }
                }}
                onNavigateAiInsight={(inst) => {
                  setSelectedInstrument(inst);
                  setCurrentTab('insights');
                }}
              />
            )}

            {currentTab === 'watchlists' && (
              <WatchlistsView
                watchlists={watchlists}
                instruments={instruments}
                onOpenTrade={handleOpenTrade}
                onSelectInstrument={handleSelectInstrument}
                onCreateWatchlist={handleCreateWatchlist}
                onRemoveFromWatchlist={handleRemoveFromWatchlist}
                onAddToWatchlist={handleAddToWatchlist}
                onNavigateAiInsight={(inst) => {
                  setSelectedInstrument(inst);
                  setCurrentTab('insights');
                }}
              />
            )}

            {currentTab === 'orders' && (
              <OrdersView
                orders={orders}
                onCancelOrder={handleCancelOrder}
                onOpenTrade={() => handleOpenTrade()}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'insights' && (
              <AiInsightsView
                insights={insights}
                instruments={instruments}
                onGenerateInsight={handleGenerateInsight}
                onOpenTrade={handleOpenTrade}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'activity' && (
              <ActivityView activity={activity} />
            )}

            {currentTab === 'settings-profile' && user && (
              <SettingsView user={user} />
            )}

            {currentTab === 'google-drive' && (
              <GoogleDriveView
                portfolio={portfolio}
                positions={positions}
                orders={orders}
                insights={insights}
              />
            )}

            {currentTab.startsWith('admin') && (
              <AdminPortal onBackToCustomer={() => setCurrentTab('dashboard')} />
            )}

            {/* Info Pages (About, Features, Risk Disclosure, Terms, Privacy) */}
            {(['about', 'features', 'risk-disclosure', 'terms', 'privacy'] as const).includes(currentTab as any) && (
              <InfoPages
                page={currentTab as any}
                onBack={() => setCurrentTab(user ? 'dashboard' : 'home')}
                onOpenTrade={() => handleOpenTrade()}
              />
            )}
          </>
        )}
      </main>

      {/* Trade Modal */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        instruments={instruments}
        selectedInstrument={tradeModalInstrument}
        portfolio={portfolio}
        positions={positions}
        onExecuteTrade={handleExecuteTrade}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onSwitchDemo={handleSwitchDemo}
        onGoogleSignIn={handleGoogleSignIn}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#06090F] py-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
                Q
              </div>
              <span className="font-mono font-bold text-sm text-white">Quantix Exchange</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                PAPER TRADING MVP
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <button
                onClick={() => setCurrentTab('google-drive')}
                className="hover:text-blue-400 text-blue-400/90 font-medium transition-colors cursor-pointer flex items-center space-x-1"
              >
                <span>Google Drive Workspace</span>
              </button>
              <span>•</span>
              <button
                onClick={() => setCurrentTab('risk-disclosure')}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Risk Disclosure
              </button>
              <span>•</span>
              <button
                onClick={() => setCurrentTab('features')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Features & Architecture
              </button>
              <span>•</span>
              <button
                onClick={() => setCurrentTab('about')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                About Us
              </button>
              <span>•</span>
              <button
                onClick={() => setCurrentTab('terms')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <span>•</span>
              <button
                onClick={() => setCurrentTab('privacy')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy Notice
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-900 text-[11px] text-zinc-500 leading-relaxed">
            <p>
              © {new Date().getFullYear()} Quantix Exchange Inc. (quantixexchange.com). All rights reserved. FOR EDUCATIONAL SIMULATION AND PAPER-TRADING DEMONSTRATION PURPOSES ONLY. This platform does not execute live securities transactions, hold real customer funds, or operate as a licensed broker-dealer or investment adviser under FINRA, SEC, or CFTC jurisdiction.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
