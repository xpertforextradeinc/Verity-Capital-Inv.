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
  OrderType,
  TransferRecord
} from './types.ts';
import { api } from './services/api.ts';
import { Header } from './components/common/Header.tsx';
import { TickerBar } from './components/common/TickerBar.tsx';
import { PublicLayout } from './components/layout/PublicLayout.tsx';
import { InstitutionalLayout } from './components/layout/InstitutionalLayout.tsx';
import { LandingPage } from './components/public/LandingPage.tsx';
import { InstitutionalAccess } from './components/public/InstitutionalAccess.tsx';
import { InfoPages } from './components/public/InfoPages.tsx';
import { DashboardView } from './components/customer/DashboardView.tsx';
import { PortfolioView } from './components/customer/PortfolioView.tsx';
import { Markets } from './components/institutional/Markets.tsx';
import { WatchlistsView } from './components/customer/WatchlistsView.tsx';
import { OrdersView } from './components/customer/OrdersView.tsx';
import { AiInsightsView } from './components/customer/AiInsightsView.tsx';
import { ActivityView } from './components/customer/ActivityView.tsx';
import { SettingsView } from './components/customer/SettingsView.tsx';
import { AdminSupervisorView } from './components/admin/AdminSupervisorView.tsx';
import { MediaVaultView } from './components/media/MediaVaultView.tsx';
import { TradeModal } from './components/customer/TradeModal.tsx';
import { BrokerDeskAssistant } from './components/customer/BrokerDeskAssistant.tsx';
import { CustodyTransfersModal } from './components/customer/CustodyTransfersModal.tsx';
import { AssetSpecsModal } from './components/customer/AssetSpecsModal.tsx';
import { KycModal } from './components/customer/KycModal.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { ShieldAlert, TrendingUp, Info } from 'lucide-react';
import { hasSupabaseClient, signInWithGoogleSupabase, signInWithSupabase, signUpWithSupabase, supabase } from './services/supabase.ts';

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
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);

  // Navigation & UI State
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname.replace(/^\//, '');
    if (path === 'open-account') return 'onboarding';
    if (path === 'admin') return 'admin-overview';
    return path || 'home';
  });
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState<boolean>(false);
  const [tradeModalInstrument, setTradeModalInstrument] = useState<Instrument | null>(null);
  const [tradeModalDraft, setTradeModalDraft] = useState<{
    symbol?: string;
    side?: OrderSide;
    orderType?: OrderType;
    quantity?: number;
    limitPrice?: number;
  } | null>(null);
  const [isCustodyModalOpen, setIsCustodyModalOpen] = useState<boolean>(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState<boolean>(false);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState<boolean>(false);
  const [specsModalSymbol, setSpecsModalSymbol] = useState<string>('BTC');
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
          const [port, pos, ords, wls, notifs, act, trs] = await Promise.all([
            api.getPortfolio(),
            api.getPositions(),
            api.getOrders(),
            api.getWatchlists(),
            api.getNotifications(),
            api.getActivity(),
            api.getTransfers(),
          ]);
          setPortfolio(port);
          setPositions(pos);
          setOrders(ords);
          setWatchlists(wls);
          setNotifications(notifs);
          setActivity(act);
          setTransfers(trs);
        }
      } catch (err) {
        // Not authenticated
        setUser(null);
      }
    } catch (err) {
      console.error('Error loading initial Verity-Capital Inv data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncSupabaseUser = useCallback(async (authUser: {
    id: string;
    email?: string;
    access_token?: string;
    user_metadata?: { first_name?: string; last_name?: string };
  }) => {
    if (!authUser.email) throw new Error('Your Supabase account does not have an email address.');
    const data = await api.syncSupabaseUser({
      id: authUser.id,
      email: authUser.email,
      firstName: authUser.user_metadata?.first_name,
      lastName: authUser.user_metadata?.last_name,
    }, authUser.access_token);
    setUser(data.user);
    setCurrentTab(data.user.role === 'ADMIN' ? 'admin-overview' : 'dashboard');
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!hasSupabaseClient() || !supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session?.user) {
        void syncSupabaseUser({ ...data.session.user, access_token: data.session.access_token });
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted && session?.user) void syncSupabaseUser({ ...session.user, access_token: session.access_token });
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [syncSupabaseUser]);

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

  const handleOpenTrade = (
    instOrDraft?: Instrument | { symbol?: string; side?: OrderSide; orderType?: OrderType; quantity?: number; limitPrice?: number }
  ) => {
    if (instOrDraft && 'price' in instOrDraft) {
      setTradeModalInstrument(instOrDraft);
      setTradeModalDraft(null);
    } else if (instOrDraft && 'symbol' in instOrDraft) {
      const found = instruments.find(
        (i) => i.symbol.toUpperCase().startsWith(instOrDraft.symbol!.toUpperCase()) ||
               i.name.toUpperCase() === instOrDraft.symbol!.toUpperCase()
      );
      if (found) setTradeModalInstrument(found);
      setTradeModalDraft(instOrDraft);
    } else {
      setTradeModalInstrument(selectedInstrument || instruments[0] || null);
      setTradeModalDraft(null);
    }
    setIsTradeModalOpen(true);
  };

  const handleOpenCustody = () => setIsCustodyModalOpen(true);
  const handleOpenKyc = () => setIsKycModalOpen(true);
  const handleOpenSpecs = (sym: string = 'BTC') => {
    setSpecsModalSymbol(sym);
    setIsSpecsModalOpen(true);
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
    if (hasSupabaseClient()) {
      const { data, error } = await signInWithSupabase(email, pass);
      if (error) throw error;
      if (!data.user) throw new Error('Supabase did not return an authenticated user.');
      await syncSupabaseUser({ ...data.user, access_token: data.session?.access_token });
      return;
    }
    const data = await api.login(email, pass);
    setUser(data.user);
    setCurrentTab(data.user.role === 'ADMIN' ? 'admin-overview' : 'dashboard');
    await fetchData();
  };

  const handleRegister = async (fName: string, lName: string, email: string, pass: string) => {
    if (hasSupabaseClient()) {
      const { data, error } = await signUpWithSupabase(fName, lName, email, pass);
      if (error) throw error;
      if (!data.session || !data.user) {
        throw new Error('Account created. Check your email to confirm the account, then sign in.');
      }
      await syncSupabaseUser({ ...data.user, access_token: data.session?.access_token });
      return;
    }
    const data = await api.register(fName, lName, email, pass);
    setUser(data.user);
    setCurrentTab('dashboard');
    await fetchData();
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
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


  const publicTabs = ['home', 'markets', 'about', 'features', 'testimonials', 'coverage', 'risk-disclosure', 'terms', 'privacy', 'security', 'login', 'onboarding', 'open-account'];
  const isPublicTab = publicTabs.includes(currentTab);
  const isAdminTab = currentTab.startsWith('admin');
  const setPublicRoute = (tab: string) => {
    const route = tab === 'home' ? '/' : `/${tab === 'onboarding' ? 'open-account' : tab}`;
    window.history.pushState({}, '', route);
    setCurrentTab(tab);
  };

  const navigateApp = (tab: string) => {
    const route = tab.startsWith('admin') ? '/admin' : tab === 'home' ? '/' : `/${tab}`;
    window.history.pushState({}, '', route);
    setCurrentTab(tab);
  };

  useEffect(() => {
    if (!isLoading && isAdminTab && user?.role !== 'ADMIN') {
      window.history.replaceState({}, '', '/login');
      setCurrentTab('login');
    }
  }, [isAdminTab, isLoading, user?.role]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-xs text-zinc-400 font-mono">Initializing Verity-Capital Institutional Engine...</span>
        </div>
      );
    }

    if (currentTab === 'home') {
      return (
        <LandingPage
          instruments={instruments}
          onOpenTrade={handleOpenTrade}
          onOpenAuth={(mode) => setPublicRoute(mode === 'login' ? 'login' : 'onboarding')}
          onSelectTab={setPublicRoute}
        />
      );
    }

    if (currentTab === 'markets') {
      return <Markets onOpenAuth={user ? undefined : (mode) => setPublicRoute(mode === 'login' ? 'login' : 'onboarding')} />;
    }

    if (currentTab === 'login' || currentTab === 'onboarding' || currentTab === 'open-account') {
      return <InstitutionalAccess
        mode={currentTab === 'login' ? 'login' : 'onboarding'}
        onBack={() => setPublicRoute('home')}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGoogleSignIn={async () => {
          const { error } = await signInWithGoogleSupabase();
          if (error) throw error;
        }}
      />;
    }

    if (publicTabs.includes(currentTab) && currentTab !== 'home') {
      return (
        <InfoPages
          page={currentTab as any}
          onBack={() => setCurrentTab(user ? 'dashboard' : 'home')}
          onOpenTrade={() => handleOpenTrade()}
        />
      );
    }

    if (isAdminTab) {
      if (user?.role === 'ADMIN') {
        return <AdminSupervisorView />;
      }
      return (
        <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95">
          <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            You do not have the required administrative privileges to view this section. This attempt has been logged for compliance monitoring.
          </p>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors cursor-pointer"
          >
            Return to Authorized Area
          </button>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">Please log in to access the Verity-Capital Inv dashboard.</p>
          <button
            onClick={() => handleOpenAuth('login')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Sign In Securely
          </button>
        </div>
      );
    }

    // Authenticated Views
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            portfolio={portfolio}
            positions={positions}
            orders={orders}
            instruments={instruments}
            onOpenTrade={handleOpenTrade}
            onOpenCustody={handleOpenCustody}
            onOpenSpecs={handleOpenSpecs}
            onNavigateTab={setCurrentTab}
            onKycOpen={handleOpenKyc}
          />
        );
      case 'portfolio':
        return (
          <PortfolioView
            portfolio={portfolio}
            positions={positions}
            instruments={instruments}
            onOpenTrade={handleOpenTrade}
            onOpenCustody={handleOpenCustody}
          />
        );
      case 'watchlists':
        return (
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
        );
      case 'orders':
        return (
          <OrdersView
            orders={orders}
            onCancelOrder={handleCancelOrder}
            onOpenTrade={() => handleOpenTrade()}
            onNavigateTab={setCurrentTab}
          />
        );
      case 'broker-desk':
      case 'insights':
        return (
          <BrokerDeskAssistant
            portfolio={portfolio}
            positions={positions}
            instruments={instruments}
            onOpenTrade={handleOpenTrade}
            onOpenCustody={handleOpenCustody}
            onOpenKyc={handleOpenKyc}
            onOpenSpecs={handleOpenSpecs}
            onNavigateTab={setCurrentTab}
          />
        );
      case 'activity':
        return <ActivityView activity={activity} />;
      case 'settings-profile':
        return <SettingsView user={user} />;
      case 'media-vault':
        return <MediaVaultView />;
      default:
        return null;
    }
  };

  return (
    <>
      {isPublicTab ? (
        <InstitutionalLayout
          user={null}
          portfolio={null}
          currentTab={currentTab}
          onSelectTab={setPublicRoute}
          onLogout={() => {}}
          onOpenAuth={(mode) => setPublicRoute(mode === 'login' ? 'login' : 'onboarding')}
        >
          {renderContent()}
        </InstitutionalLayout>
      ) : isAdminTab ? (
        <div className="min-h-screen bg-[#070A10] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
          <main className="flex-1 w-full mx-auto p-0 m-0">
            {renderContent()}
          </main>
        </div>
      ) : (
        
        <InstitutionalLayout
          user={user as User}
          portfolio={portfolio}
          currentTab={currentTab}
          onSelectTab={navigateApp}
          onLogout={handleLogout}
        >
          {renderContent()}
        </InstitutionalLayout>
  
      )}

      {/* Trade Modal with Explicit Confirmation */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => {
          setIsTradeModalOpen(false);
          setTradeModalDraft(null);
        }}
        instruments={instruments}
        selectedInstrument={tradeModalInstrument}
        portfolio={portfolio}
        positions={positions}
        initialDraft={tradeModalDraft}
        onExecuteTrade={handleExecuteTrade}
      />

      {/* Custody & Transfers Modal */}
      <CustodyTransfersModal
        isOpen={isCustodyModalOpen}
        onClose={() => setIsCustodyModalOpen(false)}
        portfolio={portfolio}
        onTransferSuccess={fetchData}
      />

      {/* Factual Asset Specifications Modal */}
      <AssetSpecsModal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
        initialSymbol={specsModalSymbol}
      />

      {/* KYC & Onboarding Modal */}
      <KycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        user={user}
        onCompleteKyc={fetchData}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#06090F] py-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
                V
              </div>
              <span className="font-mono font-bold text-sm text-white">Verity-Capital Inv</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                INSTITUTIONAL
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
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
              © {new Date().getFullYear()} Verity-Capital Inv Inc. (verity-capital.com). All rights reserved. Institutional Brokerage Platform. Secure execution and custody services.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
