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
import { InvestmentPlans } from './components/public/InvestmentPlans.tsx';
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
import { AdminLogin } from './components/admin/AdminLogin.tsx';
import { MediaVaultView } from './components/media/MediaVaultView.tsx';
import { TradeModal } from './components/customer/TradeModal.tsx';
import { BrokerDeskAssistant } from './components/customer/BrokerDeskAssistant.tsx';
import { CustodyTransfersModal } from './components/customer/CustodyTransfersModal.tsx';
import { AssetSpecsModal } from './components/customer/AssetSpecsModal.tsx';
import { KycModal } from './components/customer/KycModal.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { TestimonialPopup } from './components/common/TestimonialPopup.tsx';
import { ShieldAlert, TrendingUp, Info, AlertTriangle, Lock } from 'lucide-react';
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
    if (path === 'admin/login') return 'admin-login';
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
  const [supabaseRole, setSupabaseRole] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [isAuthenticatingOAuth, setIsAuthenticatingOAuth] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.location.hash.includes('access_token=') ||
      window.location.hash.includes('refresh_token=') ||
      window.location.search.includes('code=');
  });

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
    user_metadata?: {
      first_name?: string;
      last_name?: string;
      role?: string;
      full_name?: string;
      name?: string;
    };
  }) => {
    if (!authUser.email) {
      console.warn('Supabase auth user missing email address');
      setIsAuthenticatingOAuth(false);
      return;
    }

    try {
      setIsLoading(true);
      // Extract names cleanly for Google OAuth (which provides full_name / name)
      const rawFullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || '';
      const nameParts = rawFullName.trim().split(/\s+/);
      const firstName = authUser.user_metadata?.first_name || nameParts[0] || 'Investor';
      const lastName = authUser.user_metadata?.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Client');

      // Detect admin credentials
      let isAdmin = authUser.email.toLowerCase() === 'verifycapitalinv@gmail.com' ||
        authUser.user_metadata?.role === 'admin' ||
        localStorage.getItem('supabase_user_role') === 'admin';

      if (!isAdmin && hasSupabaseClient() && supabase) {
        try {
          const { data: roleData } = await supabase.from('user_roles')
            .select('role')
            .eq('user_id', authUser.id)
            .eq('role', 'admin')
            .maybeSingle();
          if (roleData) isAdmin = true;
        } catch (err) {
          console.warn('Role lookup check error:', err);
        }
      }

      if (isAdmin) {
        setSupabaseRole('admin');
        localStorage.setItem('supabase_user_role', 'admin');
      } else {
        setSupabaseRole(null);
        localStorage.removeItem('supabase_user_role');
      }

      const data = await api.syncSupabaseUser({
        id: authUser.id,
        email: authUser.email,
        firstName,
        lastName,
      }, authUser.access_token);

      if (isAdmin && data.user) {
        data.user.role = 'ADMIN';
      }

      setUser(data.user);
      const destinationTab = isAdmin ? 'admin-overview' : 'dashboard';
      const destinationRoute = isAdmin ? '/admin' : '/dashboard';

      // Cleanly transition route in browser history
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', destinationRoute);
      }
      setCurrentTab(destinationTab);
      await fetchData();
    } catch (err: any) {
      console.error('Error syncing Supabase user:', err);
      setAuthNotice(err?.message || 'Authentication synchronization error');
    } finally {
      setIsAuthenticatingOAuth(false);
      setIsLoading(false);
    }
  }, [fetchData]);

  // Combined auth initialisation and OAuth URL parameter handling
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      // 1. Check if returning with OAuth callback parameters in URL
      if (typeof window !== 'undefined') {
        const hasHashToken = window.location.hash.includes('access_token=') || window.location.hash.includes('refresh_token=');
        const hasCodeParam = window.location.search.includes('code=');
        const hasError = window.location.search.includes('error=') || window.location.hash.includes('error=');

        if (hasError) {
          const urlParams = new URLSearchParams(window.location.search || window.location.hash.replace(/^#/, '?'));
          const desc = urlParams.get('error_description') || urlParams.get('error') || 'OAuth authorization failed';
          setAuthNotice(decodeURIComponent(desc));
          setIsAuthenticatingOAuth(false);
        } else if (hasHashToken || hasCodeParam) {
          setIsAuthenticatingOAuth(true);
          setIsLoading(true);

          if (hasSupabaseClient() && supabase) {
            try {
              if (hasCodeParam) {
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');
                if (code) {
                  await supabase.auth.exchangeCodeForSession(code);
                }
              }

              const { data: sessionData } = await supabase.auth.getSession();
              if (sessionData?.session?.user && mounted) {
                await syncSupabaseUser({
                  ...sessionData.session.user,
                  access_token: sessionData.session.access_token
                });
                return;
              }
            } catch (err) {
              console.warn('OAuth callback token exchange warning:', err);
            }
          }
        }
      }

      // 2. Fetch standard application data and current session
      await fetchData();

      // 3. Fallback getSession verification
      if (hasSupabaseClient() && supabase && mounted) {
        try {
          const { data } = await supabase.auth.getSession();
          if (mounted && data.session?.user) {
            await syncSupabaseUser({
              ...data.session.user,
              access_token: data.session.access_token
            });
          }
        } catch (e) {
          console.warn('Session verification notice:', e);
        }
      }
    }

    initializeAuth();

    if (!hasSupabaseClient() || !supabase) return;

    // Listen for auth state transitions
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSupabaseRole(null);
        localStorage.removeItem('supabase_user_role');
        api.logout();
      } else if (session?.user) {
        await syncSupabaseUser({ ...session.user, access_token: session.access_token });
      }
    });

    // Listen for postMessage from Google OAuth popup window
    const handleMessage = async (event: MessageEvent) => {
      if (!mounted) return;
      if (event.data?.type === 'SUPABASE_AUTH_CALLBACK' || event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        if (hasSupabaseClient() && supabase) {
          if (event.data.search && event.data.search.includes('code=')) {
            const urlParams = new URLSearchParams(event.data.search);
            const code = urlParams.get('code');
            if (code) {
              await supabase.auth.exchangeCodeForSession(code);
            }
          }
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user && mounted) {
            await syncSupabaseUser({ ...data.session.user, access_token: data.session.access_token });
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, [fetchData, syncSupabaseUser]);

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
    if (user?.status === 'SUSPENDED') {
      alert('Your account has been suspended by the platform administrator. Trading operations are disabled.');
      return;
    }
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


  const publicTabs = ['home', 'markets', 'investment-plans', 'about', 'features', 'testimonials', 'coverage', 'risk-disclosure', 'terms', 'privacy', 'security', 'login', 'onboarding', 'open-account'];
  const isPublicTab = publicTabs.includes(currentTab);
  const isAdminTab = currentTab.startsWith('admin');
  const setPublicRoute = (tab: string) => {
    const route = tab === 'home' ? '/' : `/${tab === 'onboarding' ? 'open-account' : tab}`;
    window.history.pushState({}, '', route);
    setCurrentTab(tab);
  };

  const navigateApp = (tab: string) => {
    const route = tab === 'admin-login' ? '/admin/login' : tab.startsWith('admin') ? '/admin' : tab === 'home' ? '/' : `/${tab}`;
    window.history.pushState({}, '', route);
    setCurrentTab(tab);
  };

  useEffect(() => {
    if (!isLoading && isAdminTab && currentTab !== 'admin-login' && supabaseRole !== 'admin') {
      window.history.replaceState({}, '', '/admin/login');
      setCurrentTab('admin-login');
    }
  }, [currentTab, isAdminTab, isLoading, supabaseRole]);

  useEffect(() => {
    if (user && (currentTab === 'login' || currentTab === 'onboarding' || currentTab === 'open-account' || (currentTab === 'admin-login' && user.role === 'ADMIN'))) {
      const destination = user.role === 'ADMIN' ? 'admin-overview' : 'dashboard';
      const route = user.role === 'ADMIN' ? '/admin' : '/dashboard';
      window.history.replaceState({}, '', route);
      setCurrentTab(destination);
    }
  }, [user, currentTab]);

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

    if (currentTab === 'admin-login') {
      return <AdminLogin
        onBack={() => setPublicRoute('login')}
        onEmailLogin={async (email, password) => {
          const { data, error } = await signInWithSupabase(email, password);
          if (error) throw error;

          let isAdmin = false;
          const userEmail = data.user?.email?.toLowerCase();
          if (userEmail === 'verifycapitalinv@gmail.com' || data.user?.user_metadata?.role === 'admin') {
            isAdmin = true;
          } else if (data.user && hasSupabaseClient() && supabase) {
            try {
              const { data: roleData } = await supabase.from('user_roles')
                .select('role')
                .eq('user_id', data.user.id)
                .eq('role', 'admin')
                .maybeSingle();
              if (roleData) isAdmin = true;
            } catch (err) {
              console.warn('Admin check error:', err);
            }
          }

          if (!isAdmin) {
            await supabase?.auth.signOut();
            throw new Error('This account is not authorized for administrator access.');
          }

          localStorage.setItem('supabase_user_role', 'admin');
          if (data.user) await syncSupabaseUser({ ...data.user, access_token: data.session?.access_token });
        }}
      />;
    }

    if (currentTab === 'login' || currentTab === 'onboarding' || currentTab === 'open-account') {
      if (user) {
        if (user.role === 'ADMIN') {
          return <AdminSupervisorView />;
        }
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
      }
      return <InstitutionalAccess
        mode={currentTab === 'login' ? 'login' : 'onboarding'}
        onBack={() => setPublicRoute('home')}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGoogleSignIn={async () => {
          const { error } = await signInWithGoogleSupabase('/dashboard');
          if (error) throw error;
        }}
      />;
    }

    if (currentTab === 'investment-plans') {
      return <InvestmentPlans onOpenAuth={(mode) => setPublicRoute(mode === 'login' ? 'login' : 'onboarding')} />;
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
      if (supabaseRole === 'admin') {
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

    if (isAuthenticatingOAuth) {
      return (
        <div className="flex flex-col items-center justify-center py-28 text-center px-4">
          <div className="w-12 h-12 border-3 border-zinc-800 border-t-emerald-400 rounded-full animate-spin mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Synchronizing Institutional Session</h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Verifying your Google authentication credentials and synchronizing your portfolio...
          </p>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            Sign in to access your Verity-Capital Inv portfolio, live market executions, and custody balances.
          </p>

          {authNotice && (
            <div className="mb-6 w-full p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs text-left">
              {authNotice}
            </div>
          )}

          <div className="w-full space-y-3">
            <button
              type="button"
              id="auth-required-google-btn"
              onClick={async () => {
                setAuthNotice(null);
                try {
                  const { error } = await signInWithGoogleSupabase('/dashboard');
                  if (error) throw error;
                } catch (err: any) {
                  setAuthNotice(err?.message || 'Google sign in failed');
                }
              }}
              className="w-full flex items-center justify-center gap-3 border border-white/20 bg-zinc-900/80 hover:bg-zinc-800 hover:border-emerald-400/50 text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              onClick={() => handleOpenAuth('login')}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Sign In with Credentials
            </button>

            <button
              onClick={async () => {
                try {
                  const res = await api.login('client@verity-capital.com', 'demo-bypass');
                  setUser(res.user);
                  await fetchData();
                } catch {
                  // ignore
                }
              }}
              className="w-full py-2.5 px-4 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium rounded-xl border border-zinc-800 transition-colors cursor-pointer"
            >
              Explore with Demo Account
            </button>
          </div>
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
          {user?.status === 'SUSPENDED' && (
            <div className="mb-6 flex items-center gap-3 border border-rose-500/40 bg-rose-500/10 p-4 text-xs text-rose-300">
              <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-rose-200">Account Suspended</p>
                <p className="text-zinc-400">Your account is currently suspended by the platform administrator. Trading, transfers, and order placement are disabled.</p>
              </div>
            </div>
          )}
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
        onGoogleSignIn={async () => {
          const { error } = await signInWithGoogleSupabase('/dashboard');
          if (error) throw error;
        }}
      />

      <TestimonialPopup />

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
