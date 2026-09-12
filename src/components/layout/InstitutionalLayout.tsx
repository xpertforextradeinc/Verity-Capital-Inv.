import React, { useState } from 'react';
import { 
  LayoutDashboard,
  PieChart,
  TrendingUp,
  Layers,
  ShieldCheck,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Wallet,
  Sparkles,
  Lock,
  Building2,
  DollarSign
} from 'lucide-react';
import { User, Portfolio } from '../../types.ts';

interface InstitutionalLayoutProps {
  children: React.ReactNode;
  user: User | null;
  portfolio: Portfolio | null;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const InstitutionalLayout: React.FC<InstitutionalLayoutProps> = ({
  children,
  user,
  portfolio,
  currentTab,
  onSelectTab,
  onLogout,
  onOpenAuth,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const publicNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'markets', label: 'Markets', icon: TrendingUp },
    { id: 'investment-plans', label: 'Investment Plans', icon: Layers },
    { id: 'open-account', label: 'Open Account', icon: Building2 },
    { id: 'about', label: 'About', icon: ShieldCheck },
    { id: 'how-it-works', label: 'How it works', icon: Sparkles },
    { id: 'risk-disclosure', label: 'Risk Management', icon: ShieldAlert },
    { id: 'privacy', label: 'Privacy Policy', icon: Lock },
  ];

  const authenticatedNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart, badge: null },
    { id: 'markets', label: 'Live Markets', icon: TrendingUp, badge: 'Spot' },
    { id: 'investment-plans', label: 'Investment Plans', icon: Layers, badge: null },
    { id: 'media-vault', label: 'Asset Vault', icon: ShieldCheck, badge: 'Cold' },
    { id: 'settings-profile', label: 'Settings', icon: Settings, badge: null },
    ...(user?.role === 'ADMIN' ? [{ id: 'admin-overview', label: 'Admin Console', icon: ShieldAlert, badge: 'Supervisor' }] : []),
  ];

  const navigate = (id: string) => {
    setMobileOpen(false);
    if (!user && ['features', 'testimonials', 'coverage', 'about'].includes(id)) {
      onSelectTab('home');
      window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      return;
    }
    onSelectTab(id);
  };

  // If user is authenticated, render modern dashboard layout with Left Sidebar
  if (user) {
    return (
      <div className="min-h-screen bg-[#040711] text-zinc-100 font-sans flex flex-col selection:bg-cyan-400/30 selection:text-cyan-200">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-[#070D1A] border-b border-white/10 sticky top-0 z-40">
          <button 
            onClick={() => navigate('dashboard')} 
            className="flex items-center gap-2.5 text-left cursor-pointer focus:outline-none"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/50 bg-cyan-400/10 font-mono text-xs font-bold text-cyan-300">
              VC
            </span>
            <span className="text-xs font-bold tracking-wider text-white font-mono">
              VERITY-CAPITAL
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-[#0A1224] border border-white/10 text-zinc-400 hover:text-rose-300 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-300"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Desktop Left-Sidebar & Content Wrapper */}
        <div className="flex flex-1 w-full max-w-[1600px] mx-auto min-h-screen">
          
          {/* USER LEFT SIDEBAR */}
          <aside className={`
            ${mobileOpen ? 'fixed inset-0 z-50 bg-[#060B17]/95 backdrop-blur-xl p-6 flex flex-col justify-between' : 'hidden'} 
            lg:block lg:static lg:w-64 xl:w-72 shrink-0 bg-[#060B17] border-r border-white/10 p-5 space-y-6 lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto
          `}>
            <div className="space-y-6">
              {/* Brand & Client Tier Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <button 
                  onClick={() => navigate('dashboard')} 
                  className="flex items-center gap-3 text-left cursor-pointer focus:outline-none"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/50 bg-cyan-400/15 font-mono text-sm font-bold text-cyan-300 shadow-md shadow-cyan-950/40">
                    VC
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-wider text-white font-mono">
                      VERITY CAPITAL
                    </div>
                    <div className="text-[10px] text-cyan-400 font-mono">
                      Institutional Custody
                    </div>
                  </div>
                </button>

                {mobileOpen && (
                  <button 
                    onClick={() => setMobileOpen(false)}
                    className="p-1 text-zinc-400 hover:text-white lg:hidden"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* User Account Pill in Sidebar */}
              <div className="p-3 bg-[#081022] border border-white/10 rounded-2xl space-y-1.5">
                <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-semibold flex items-center justify-between">
                  <span>Client Account</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-xs font-bold text-white truncate" title={user.email}>
                  {user.email}
                </div>
                <div className="text-[10px] font-mono text-cyan-300 font-semibold pt-0.5">
                  Tier: {user.isUpgraded ? (user.upgradeTier || 'INSTITUTIONAL PRIME') : 'STANDARD VAULT'}
                </div>
              </div>

              {/* Navigation Links (Left Side) */}
              <nav className="space-y-1">
                <div className="px-2 pb-1 text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">
                  Platform Menu
                </div>

                {authenticatedNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id || (item.id === 'admin-overview' && currentTab.startsWith('admin'));

                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-cyan-400/15 text-white border border-cyan-400/40 shadow-sm font-semibold'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-300' : 'text-zinc-400 group-hover:text-white'}`} />
                        <span className={`text-xs ${isActive ? 'text-cyan-300 font-bold' : 'text-zinc-300 group-hover:text-white'}`}>
                          {item.label}
                        </span>
                      </div>

                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Bottom Controls: Logout & Help */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#091122] hover:bg-rose-950/20 border border-white/10 hover:border-rose-500/30 text-xs text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <LogOut className="w-4 h-4" />
                  <span className="font-semibold">Sign Out</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="px-3 py-2 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
                <span>Network:</span>
                <span className="text-emerald-400 font-semibold">100% Operational</span>
              </div>
            </div>
          </aside>

          {/* MAIN VIEW CONTENT CONTAINER */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // If user is not authenticated (Public Visitor Mode)
  return (
    <div className="min-h-screen bg-[#050816] text-zinc-100 font-sans selection:bg-cyan-400/30 selection:text-cyan-200">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[1440px] items-center gap-8 px-5 lg:px-10">
          <button onClick={() => navigate('dashboard')} className="flex shrink-0 items-center gap-3 text-left cursor-pointer focus:outline-none">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/50 bg-cyan-300/10 font-mono text-sm font-bold text-cyan-300">VC</span>
            <span className="hidden text-sm font-semibold tracking-[0.16em] text-white sm:block">VERITY-CAPITAL INV</span>
          </button>
          
          <nav className={`${mobileOpen ? 'absolute left-4 right-4 top-20 flex' : 'hidden'} flex-col gap-2 rounded-2xl border border-white/10 bg-[#080d1d]/95 backdrop-blur-xl p-6 shadow-2xl md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
            {publicNavItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => navigate(item.id)} 
                className={`w-full text-center md:w-auto rounded-lg px-4 py-3 text-base md:text-sm transition-colors ${currentTab === item.id ? 'bg-white/10 text-white font-medium' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <button 
              onClick={() => onOpenAuth?.('login')} 
              className="hidden px-4 py-2.5 text-sm text-zinc-300 hover:text-white sm:block font-medium cursor-pointer"
            >
              Login
            </button>
            <button 
              onClick={() => onOpenAuth?.('register')} 
              className="rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-200 cursor-pointer shadow-md"
            >
              Open Account
            </button>
            <button 
              onClick={() => setMobileOpen((open) => !open)} 
              className="rounded-lg border border-white/10 p-2.5 md:hidden cursor-pointer" 
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>
      
      <main className="mx-auto min-h-[calc(100vh-72px)] max-w-[1440px] px-5 py-8 lg:px-10">
        {children}
      </main>
    </div>
  );
};
