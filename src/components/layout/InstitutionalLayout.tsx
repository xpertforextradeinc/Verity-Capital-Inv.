import React from 'react';
import { 
  BarChart2,
  LogOut,
  Menu,
  ShieldAlert,
  X
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
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const publicItems = [
    { id: 'investment-plans', label: 'Investment Plans' },
    { id: 'open-account', label: 'Open Account' },
    { id: 'about', label: 'About' },
    { id: 'how-it-works', label: 'How it works' },
    { id: 'risk-disclosure', label: 'Risk Management' },
    { id: 'privacy', label: 'Privacy Policy' },
  ];
  const authenticatedItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'investment-plans', label: 'Investment Plans' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'markets', label: 'Markets' },
    { id: 'media-vault', label: 'Asset Vault' },
    { id: 'settings-profile', label: 'Settings' },
    ...(user?.role === 'ADMIN' ? [{ id: 'admin-overview', label: 'Admin' }] : []),
  ];
  const items = user ? authenticatedItems : publicItems;
  const navigate = (id: string) => {
    setMobileOpen(false);
    if (!user && ['features', 'testimonials', 'coverage', 'about'].includes(id)) {
      onSelectTab('home');
      window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      return;
    }
    onSelectTab(id);
  };

  return (
    <div className="min-h-screen bg-[#050816] text-zinc-100 font-sans selection:bg-cyan-400/30 selection:text-cyan-200">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[1440px] items-center gap-8 px-5 lg:px-10">
          <button onClick={() => navigate(user ? 'dashboard' : 'home')} className="flex shrink-0 items-center gap-3 text-left">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/50 bg-cyan-300/10 font-mono text-sm font-bold text-cyan-300">VC</span>
            <span className="hidden text-sm font-semibold tracking-[0.16em] text-white sm:block">VERITY-CAPITAL INV</span>
          </button>
          <nav className={`${mobileOpen ? 'absolute left-4 right-4 top-20 flex' : 'hidden'} flex-col gap-2 rounded-2xl border border-white/10 bg-[#080d1d]/95 backdrop-blur-xl p-6 shadow-2xl md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
            {items.map((item) => <button key={item.id} onClick={() => navigate(item.id)} className={`w-full text-center md:w-auto rounded-lg px-4 py-3 text-base md:text-sm transition-colors ${currentTab === item.id || (item.id === 'admin-overview' && currentTab.startsWith('admin')) ? 'bg-white/10 text-white font-medium' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>{item.label}</button>)}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {user ? <button onClick={onLogout} className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-zinc-300 hover:border-rose-400/50 hover:text-rose-300"><LogOut className="h-4 w-4" /> Sign out</button> : <><button onClick={() => onOpenAuth?.('login')} className="hidden px-4 py-2.5 text-sm text-zinc-300 hover:text-white sm:block font-medium">Login</button><button onClick={() => onOpenAuth?.('register')} className="rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-200">Open Account</button></>}
            <button onClick={() => setMobileOpen((open) => !open)} className="rounded-lg border border-white/10 p-2.5 md:hidden" aria-label="Toggle navigation">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
      </header>
      <main className="mx-auto min-h-[calc(100vh-72px)] max-w-[1440px] px-5 py-8 lg:px-10">{children}</main>

    </div>
  );
};
