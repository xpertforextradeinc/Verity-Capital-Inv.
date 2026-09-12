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
  DollarSign,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
    { id: 'asset-vault', label: 'Asset Vault', icon: ShieldCheck, badge: 'Cold' },
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
      <div className="flex min-h-screen bg-[#070A10] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
        
        {/* Desktop Sidebar (Permanent) */}
        <aside className={`
          ${mobileOpen ? 'fixed inset-0 z-50 bg-[#0B0F19]/95 backdrop-blur-xl p-6 flex flex-col' : 'hidden'} 
          lg:flex lg:flex-col lg:static lg:w-64 xl:w-72 shrink-0 bg-[#0B0F19] border-r border-zinc-800/80 shadow-2xl z-50 transition-all duration-300
        `}>
          <div className="flex flex-col flex-grow pt-8 pb-4 overflow-y-auto">
            {/* Brand Header */}
            <div className="flex items-center justify-between px-6 mb-10">
              <div className="flex items-center group cursor-pointer" onClick={() => navigate('dashboard')}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-zinc-950 font-black text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  V
                </div>
                <div className="ml-3 flex flex-col">
                  <span className="text-lg font-black tracking-tighter text-white leading-none">VERITY</span>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-500/80 leading-none mt-1 uppercase">Capital Inv</span>
                </div>
              </div>
              {mobileOpen && (
                <button onClick={() => setMobileOpen(false)} className="lg:hidden p-2 text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* User Profile Card */}
            <div className="px-4 mb-8">
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400 font-bold overflow-hidden shadow-inner">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0B0F19] rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-[10px] font-medium text-emerald-500/70 truncate uppercase tracking-widest">
                      {user.isUpgraded ? (user.upgradeTier?.replace('_', ' ') || 'INSTITUTIONAL') : 'STANDARD VAULT'}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-zinc-800/50">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">System Node</span>
                    <span className="text-emerald-400 font-mono">SECURE-NY-01</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-3 space-y-1">
              <div className="px-4 mb-2 text-[10px] font-black tracking-[0.15em] text-zinc-600 uppercase">Principal Menu</div>
              {authenticatedNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id || (item.id === 'admin-overview' && currentTab.startsWith('admin'));

                return (
                  <button
                    key={item.id}
                    onClick={() => { navigate(item.id); setMobileOpen(false); }}
                    className={`
                      w-full group flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer
                      ${isActive 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      }
                    `}
                  >
                    <Icon className={`mr-3.5 h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto inline-block py-0.5 px-2 text-[10px] font-bold rounded uppercase tracking-wider ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Sidebar Footer */}
          <div className="flex-shrink-0 p-4 border-t border-zinc-800/80 bg-black/20">
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer font-bold text-xs border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Protocol</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Top Header Bar (Desktop & Mobile Unified) */}
          <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-[#070A10]/80 backdrop-blur-xl border-b border-zinc-800/50 z-40">
            <div className="flex items-center">
              <button 
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 -ml-2 mr-2 text-zinc-400 hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex flex-col">
                <h2 className="text-sm font-bold text-white tracking-tight uppercase">
                  {authenticatedNavItems.find(n => n.id === currentTab)?.label || 'Console Overview'}
                </h2>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Real-time Institutional Data Feed
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">Portfolio Equity</span>
                <span className="text-sm font-mono font-black text-emerald-400 leading-none">
                  ${portfolio?.totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-8 w-px bg-zinc-800/80 mx-1 hidden sm:block"></div>
              <button className="p-2 text-zinc-400 hover:text-white bg-zinc-900/50 rounded-xl border border-zinc-800 transition-all">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-[#070A10] relative">
            <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-24">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // If user is not authenticated (Public Visitor Mode)
  return (
    <div className="min-h-screen bg-[#070A10] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-[#070A10]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('home')} className="flex items-center gap-3 transition-transform hover:scale-[1.02] cursor-pointer">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 font-black text-zinc-950 shadow-lg shadow-emerald-500/20">V</div>
            <span className="hidden text-sm font-black tracking-tighter text-white sm:block uppercase">Verity Capital</span>
          </button>
          
          <nav className={`${mobileOpen ? 'absolute left-4 right-4 top-20 flex' : 'hidden'} flex-col gap-2 rounded-2xl border border-zinc-800 bg-[#0B0F19]/95 backdrop-blur-xl p-6 shadow-2xl md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
            {publicNavItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => navigate(item.id)} 
                className={`w-full text-center md:w-auto rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${currentTab === item.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-400 hover:text-white'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <button 
              onClick={() => onOpenAuth?.('login')} 
              className="hidden px-4 py-2.5 text-sm font-bold text-zinc-400 hover:text-white sm:block transition-colors cursor-pointer"
            >
              Login
            </button>
            <button 
              onClick={() => onOpenAuth?.('register')} 
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-black text-zinc-950 hover:bg-emerald-400 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              Open Account
            </button>
            <button 
              onClick={() => setMobileOpen((open) => !open)} 
              className="rounded-xl border border-zinc-800 p-2.5 md:hidden cursor-pointer text-zinc-400 hover:text-white" 
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>
      
      <main className="mx-auto min-h-[calc(100vh-64px)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};
