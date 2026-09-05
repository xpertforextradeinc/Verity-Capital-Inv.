const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add layout imports
code = code.replace(
  "import { TickerBar } from './components/common/TickerBar.tsx';",
  "import { TickerBar } from './components/common/TickerBar.tsx';\nimport { PublicLayout } from './components/layout/PublicLayout.tsx';\nimport { AuthenticatedLayout } from './components/layout/AuthenticatedLayout.tsx';"
);

// 2. Replace the return statement
const returnStart = code.indexOf('  return (\n    <div className="min-h-screen bg-[#070A10]');
const returnEnd = code.indexOf('      {/* Trade Modal with Explicit Confirmation */}');

if (returnStart !== -1 && returnEnd !== -1) {
  const newReturn = `
  const publicTabs = ['home', 'about', 'features', 'risk-disclosure', 'terms', 'privacy', 'security'];
  const isPublicTab = publicTabs.includes(currentTab);
  const isAdminTab = currentTab.startsWith('admin');

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-xs text-zinc-400 font-mono">Loading Verity-Capital Inv Simulated Engine...</span>
        </div>
      );
    }

    if (currentTab === 'home') {
      return (
        <LandingPage
          instruments={instruments}
          onOpenTrade={handleOpenTrade}
          onOpenAuth={handleOpenAuth}
          onSelectTab={setCurrentTab}
        />
      );
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
        return <AdminPortal onBackToCustomer={() => setCurrentTab('dashboard')} />;
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
      case 'markets':
        return (
          <MarketsView
            instruments={instruments}
            selectedInstrument={selectedInstrument}
            onSelectInstrument={handleSelectInstrument}
            onOpenTrade={handleOpenTrade}
            onOpenSpecs={handleOpenSpecs}
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
      case 'google-drive':
        return (
          <GoogleDriveView
            portfolio={portfolio}
            positions={positions}
            orders={orders}
            insights={insights}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {isPublicTab ? (
        <PublicLayout
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenAuth={handleOpenAuth}
        >
          {renderContent()}
        </PublicLayout>
      ) : isAdminTab ? (
        <div className="min-h-screen bg-[#070A10] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
          <main className="flex-1 w-full mx-auto p-0 m-0">
            {renderContent()}
          </main>
        </div>
      ) : (
        <AuthenticatedLayout
          user={user as User}
          portfolio={portfolio}
          instruments={instruments}
          notifications={notifications}
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenTrade={handleOpenTrade}
          onResetPortfolio={handleResetPortfolio}
          onSwitchDemo={handleSwitchDemo}
          onLogout={handleLogout}
          onSelectInstrument={handleSelectInstrument}
        >
          {renderContent()}
        </AuthenticatedLayout>
      )}

`;
  code = code.substring(0, returnStart) + newReturn + code.substring(returnEnd);
  fs.writeFileSync('src/App.tsx', code);
  console.log("App.tsx patched successfully");
} else {
  console.log("Could not find start or end block.");
}
