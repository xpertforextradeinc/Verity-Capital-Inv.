import React from 'react';
import { Header } from '../common/Header.tsx';

interface PublicLayoutProps {
  children: React.ReactNode;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  onOpenAuth,
  currentTab,
  onSelectTab
}) => {
  return (
    <div className="min-h-screen bg-[#070A10] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <Header
        user={null} // Force unauthenticated state
        portfolio={null}
        instruments={[]}
        notifications={[]}
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        onOpenTrade={() => {}}
        onResetPortfolio={() => {}}
        onSwitchDemo={async () => {}}
        onLogout={() => {}}
        onOpenAuth={onOpenAuth}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};
