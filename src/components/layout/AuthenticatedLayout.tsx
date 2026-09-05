import React from 'react';
import { Header } from '../common/Header.tsx';
import { TickerBar } from '../common/TickerBar.tsx';
import { User, Portfolio, Instrument, AppNotification } from '../../types.ts';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  user: User;
  portfolio: Portfolio | null;
  instruments: Instrument[];
  notifications: AppNotification[];
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenTrade: (inst?: any) => void;
  onResetPortfolio: () => void;
  onSwitchDemo: (role: 'CUSTOMER' | 'ADMIN') => Promise<void>;
  onLogout: () => void;
  onSelectInstrument: (inst: Instrument) => void;
}

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
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
  onSelectInstrument
}) => {
  return (
    <div className="min-h-screen bg-[#070A10] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <Header
        user={user}
        portfolio={portfolio}
        instruments={instruments}
        notifications={notifications}
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        onOpenTrade={onOpenTrade}
        onResetPortfolio={onResetPortfolio}
        onSwitchDemo={onSwitchDemo}
        onLogout={onLogout}
        onOpenAuth={() => {}}
      />
      {instruments.length > 0 && (
        <TickerBar
          instruments={instruments}
          onSelectInstrument={onSelectInstrument}
        />
      )}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};
