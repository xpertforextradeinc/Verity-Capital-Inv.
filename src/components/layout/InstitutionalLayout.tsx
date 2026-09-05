import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  BarChart2, 
  ShieldAlert, 
  LogOut, 
  Box,
  Settings,
  ChevronRight
} from 'lucide-react';
import { User, Portfolio, Instrument } from '../../types.ts';

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
  const menuItems = user ? [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio Analytics', icon: Wallet },
    { id: 'markets', label: 'Global Markets', icon: BarChart2 },
    { id: 'media-vault', label: '3D Asset Vault', icon: Box },
    { id: 'settings-profile', label: 'Settings', icon: Settings },
  ] : [
    { id: 'home', label: 'Overview', icon: LayoutDashboard },
    { id: 'markets', label: 'Global Markets', icon: BarChart2 },
    { id: 'security', label: 'Security', icon: ShieldAlert },
    { id: 'features', label: 'Capabilities', icon: Box },
    { id: 'about', label: 'About Verity', icon: Wallet },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ id: 'admin-overview', label: 'Administrator Suite', icon: ShieldAlert });
  }

  return (
    <div className="flex h-screen bg-[#070A10] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-300">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 bg-[#090D14] border-r border-zinc-800/80 flex flex-col">
        <div className="p-6 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm">
              VC
            </div>
            <span className="font-bold text-lg text-white">Verity-Capital Inv</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500 uppercase tracking-wider">Status</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>LIVE</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 flex flex-col space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id || (item.id.startsWith('admin') && currentTab.startsWith('admin'));
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-600/10 text-indigo-400 font-semibold' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-zinc-800/80 space-y-4">
          {user ? <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-900/50 text-indigo-300 flex items-center justify-center font-bold text-xs uppercase border border-indigo-700/50">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user.firstName} {user.lastName}</div>
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{user.role}</div>
            </div>
          </div> : <p className="px-2 text-xs leading-relaxed text-zinc-500">Institutional digital asset execution, custody, and market intelligence.</p>}
          {user ? <button
            onClick={onLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button> : <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => onOpenAuth?.('login')} className="rounded-lg border border-zinc-700 px-2 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800">Client Login</button>
            <button type="button" onClick={() => onOpenAuth?.('register')} className="rounded-lg bg-indigo-500 px-2 py-2 text-xs font-bold text-white hover:bg-indigo-400">Open Account</button>
          </div>}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Simple Top Bar (No duplicate nav) */}
        <header className="h-16 flex-shrink-0 bg-[#070A10]/80 backdrop-blur border-b border-zinc-800/80 flex items-center justify-between px-8 z-10">
          <h2 className="text-lg font-semibold text-white capitalize">
            {currentTab.replace('-', ' ')}
          </h2>
          {portfolio && user && user.role !== 'ADMIN' && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Account Value</div>
                <div className="text-sm font-bold font-mono text-emerald-400">
                  ${portfolio.totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

    </div>
  );
};
