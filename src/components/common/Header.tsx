import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Bell,
  User as UserIcon,
  LogOut,
  RotateCcw,
  Zap,
  LayoutDashboard,
  PieChart,
  LineChart,
  Bookmark,
  FileText,
  Sparkles,
  Activity,
  Settings,
  ShieldAlert,
  ChevronDown,
  Info,
  Box
} from 'lucide-react';
import { User, Portfolio, AppNotification, Instrument } from '../../types.ts';

interface HeaderProps {
  user: User | null;
  portfolio: Portfolio | null;
  instruments: Instrument[];
  notifications: AppNotification[];
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenTrade: (instrument?: Instrument) => void;
  onResetPortfolio: () => void;
  onSwitchDemo: (role: 'CUSTOMER' | 'ADMIN') => void;
  onLogout: () => void;
  onOpenAuth: (initialMode?: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  portfolio,
  instruments,
  notifications,
  currentTab,
  onSelectTab,
  onOpenTrade,
  onResetPortfolio,
  onSwitchDemo,
  onLogout,
  onOpenAuth,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.readAt).length;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 bg-[#090D14]/95 backdrop-blur-md border-b border-zinc-800 text-zinc-100">
      {/* Top Launch Boundary Disclaimer Bar */}
      <div className="bg-amber-950/40 border-b border-amber-900/30 px-4 py-1.5 text-xs text-amber-300 flex items-center justify-between">
        <div className="flex items-center space-x-2 mx-auto sm:mx-0">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-medium tracking-wide">
            INSTITUTIONAL CRYPTO BROKERAGE:
          </span>
          <span className="text-amber-200/80 hidden md:inline">
            Factual digital asset information, segregated cold custody, and spot executions upon explicit client confirmation. No financial advice or trading signals.
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-[11px] text-amber-200/70">
          <button
            onClick={() => onSelectTab('risk-disclosure')}
            className="hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
          >
            Risk Disclosure & Compliance
          </button>
          <span>•</span>
          <span>BTC • ETH • SOL • XRP • ADA</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onSelectTab(user ? 'dashboard' : 'home')}
              className="flex items-center space-x-2.5 group cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 p-0.5 shadow-lg shadow-amber-950/40 flex items-center justify-center">
                <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-lg font-bold tracking-tight text-white font-mono">
                    VERITY-CAPITAL
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold">
                    INV
                  </span>
                </div>
                <div className="text-[10px] uppercase tracking-wider text-amber-400/80 font-medium -mt-0.5">
                  Digital Asset Brokerage
                </div>
              </div>
            </button>

            {/* Navigation Links for Authenticated Users */}
            {user && (
              <nav className="hidden lg:flex items-center space-x-1 ml-6 border-l border-zinc-800 pl-4 text-xs font-medium">
                {isAdmin ? (
                  <>
                    <button
                      onClick={() => onSelectTab('admin-overview')}
                      className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer ${
                        currentTab.startsWith('admin')
                          ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Admin Control Center</span>
                    </button>
                    <button
                      onClick={() => onSelectTab('dashboard')}
                      className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                    >
                      <span>Customer View</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onSelectTab('dashboard')}
                      className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer ${
                        currentTab === 'dashboard'
                          ? 'bg-zinc-800 text-white font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => onSelectTab('portfolio')}
                      className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer ${
                        currentTab === 'portfolio'
                          ? 'bg-zinc-800 text-white font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                      }`}
                    >
                      <PieChart className="w-3.5 h-3.5" />
                      <span>Portfolio</span>
                    </button>
                    <button
                      onClick={() => onSelectTab('markets')}
                      className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer ${
                        currentTab === 'markets'
                          ? 'bg-zinc-800 text-white font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                      }`}
                    >
                      <LineChart className="w-3.5 h-3.5" />
                      <span>Spot Markets</span>
                    </button>
                    <button
                      onClick={() => onSelectTab('broker-desk')}
                      className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer ${
                        currentTab === 'broker-desk'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                          : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-950/20'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Verity Desk</span>
                    </button>
                    <button
                      onClick={() => onSelectTab('orders')}
                      className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer ${
                        currentTab === 'orders'
                          ? 'bg-zinc-800 text-white font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Orders</span>
                    </button>
                    <button
                      onClick={() => onSelectTab('watchlists')}
                      className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer ${
                        currentTab === 'watchlists'
                          ? 'bg-zinc-800 text-white font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Watchlists</span>
                    </button>
                    <button
                      onClick={() => onSelectTab('media-vault')}
                      className={`px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer ${
                        currentTab === 'google-drive'
                          ? 'bg-blue-950/40 text-blue-300 border border-blue-500/30 font-semibold'
                          : 'text-zinc-400 hover:text-blue-300 hover:bg-zinc-800/50'
                      }`}
                    >
                      <Box className="w-3.5 h-3.5 text-blue-400" />
                      <span>Drive</span>
                    </button>
                  </>
                )}
              </nav>
            )}

            {/* Public Links when not authenticated or exploring */}
            {!user && (
              <nav className="hidden md:flex items-center space-x-6 ml-6 text-sm text-zinc-300">
                <button
                  onClick={() => onSelectTab('home')}
                  className={`hover:text-white transition-colors cursor-pointer ${
                    currentTab === 'home' ? 'text-white font-semibold' : ''
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => onSelectTab('markets')}
                  className={`hover:text-white transition-colors cursor-pointer ${
                    currentTab === 'markets' ? 'text-white font-semibold' : ''
                  }`}
                >
                  Markets
                </button>
                <button
                  onClick={() => onSelectTab('media-vault')}
                  className={`hover:text-blue-300 transition-colors cursor-pointer flex items-center space-x-1 ${
                    currentTab === 'google-drive' ? 'text-blue-400 font-semibold' : ''
                  }`}
                >
                    <Box className="w-3.5 h-3.5 text-blue-400" />
                  <span>Drive Sync</span>
                </button>
                <button
                  onClick={() => onSelectTab('features')}
                  className={`hover:text-white transition-colors cursor-pointer ${
                    currentTab === 'features' ? 'text-white font-semibold' : ''
                  }`}
                >
                  Features
                </button>
                <button
                  onClick={() => onSelectTab('about')}
                  className={`hover:text-white transition-colors cursor-pointer ${
                    currentTab === 'about' ? 'text-white font-semibold' : ''
                  }`}
                >
                  About
                </button>
              </nav>
            )}
          </div>

          {/* Right Header Action Items */}
          <div className="flex items-center space-x-3">
            {/* Quick Demo Switcher Pill */}
            <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => onSwitchDemo('CUSTOMER')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  user && user.role === 'CUSTOMER'
                    ? 'bg-zinc-800 text-white font-medium shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Switch to Demo Customer with $100k balance"
              >
                Customer ($100k)
              </button>
            </div>

            {/* If Authenticated: Balance badge, Quick Trade, Notifications */}
            {user ? (
              <>
                {/* Simulated Balance Pill */}
                {portfolio && !isAdmin && (
                  <div className="hidden md:flex items-center bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-1.5 text-right">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium flex items-center justify-end space-x-1">
                        <span>Simulated Equity</span>
                      </div>
                      <div className="font-mono text-sm font-bold text-white">
                        ${portfolio.totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <button
                      onClick={onResetPortfolio}
                      title="Reset simulated portfolio to $100,000 default"
                      className="ml-2.5 p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Quick Trade Button */}
                {!isAdmin && (
                  <button
                    onClick={() => onOpenTrade()}
                    className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Trade</span>
                  </button>
                )}

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer relative"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-zinc-950 font-bold text-[9px] rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in-50 zoom-in-95">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2">
                        <span className="text-xs font-semibold text-white">Activity Alerts</span>
                        <span className="text-[10px] text-zinc-400">{notifications.length} total</span>
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
                        {notifications.length === 0 ? (
                          <div className="py-4 text-center text-zinc-500">No notifications</div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className="p-2 rounded-lg bg-zinc-800/40 border border-zinc-800/60 text-left"
                            >
                              <div className="font-semibold text-zinc-200 flex items-center justify-between">
                                <span>{notif.title}</span>
                                <span className="text-[9px] text-zinc-500">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-zinc-400 text-[11px] mt-0.5">{notif.body}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 transition-colors cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold text-xs flex items-center justify-center">
                      {user.firstName[0]}
                    </div>
                    <span className="text-xs font-medium hidden sm:inline">{user.firstName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-50">
                      <div className="px-3 py-2 border-b border-zinc-800">
                        <div className="text-xs font-semibold text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-[11px] text-zinc-400 truncate">{user.email}</div>
                        <div className="mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold ${
                            user.role === 'ADMIN' ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          }`}>
                            {user.role} ROLE
                          </span>
                        </div>
                      </div>

                      <div className="py-1 text-xs">
                        <button
                          onClick={() => {
                            onSelectTab('settings-profile');
                            setShowUserMenu(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center space-x-2 cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Settings & Preferences</span>
                        </button>
                        <button
                          onClick={() => {
                            onSelectTab('activity');
                            setShowUserMenu(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center space-x-2 cursor-pointer"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>Account Activity Log</span>
                        </button>
                        <button
                          onClick={() => {
                            onSelectTab('google-drive');
                            setShowUserMenu(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-blue-300 hover:bg-blue-950/40 flex items-center space-x-2 cursor-pointer"
                        >
                          <Box className="w-3.5 h-3.5 text-blue-400" />
                          <span>3D Asset Vault</span>
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              onSelectTab('admin-overview');
                              setShowUserMenu(false);
                            }}
                            className="w-full px-3 py-1.5 text-left text-indigo-300 hover:bg-indigo-950/40 flex items-center space-x-2 cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Administrator Suite</span>
                          </button>
                        )}
                      </div>

                      <div className="pt-1 border-t border-zinc-800">
                        <button
                          onClick={() => {
                            onLogout();
                            setShowUserMenu(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-rose-400 hover:bg-rose-950/30 flex items-center space-x-2 cursor-pointer text-xs"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* If Not Authenticated: Sign in / Register buttons */
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-md shadow-emerald-500/10 transition-colors cursor-pointer"
                >
                  Open Demo Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
