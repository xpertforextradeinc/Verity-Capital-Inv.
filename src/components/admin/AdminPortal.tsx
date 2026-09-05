import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  FileText,
  Activity,
  Cpu,
  CheckCircle,
  AlertOctagon,
  Ban,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Server,
  Lock,
  Search,
  Plus,
  Download,
  DollarSign,
  TrendingUp,
  Zap,
  Flame,
  BarChart3,
  Sliders,
  ShieldCheck,
  Eye,
  RefreshCw,
  X,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Database
} from 'lucide-react';
import { User, Order, Instrument, AuditEvent, SystemHealth, TransferRecord } from '../../types.ts';
import { api } from '../../services/api.ts';

interface AdminPortalProps {
  onBackToCustomer: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToCustomer }) => {
  const [activeTab, setActiveTab] = useState<'health' | 'users' | 'orders' | 'instruments' | 'audit' | 'ai' | 'custody'>('health');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [users, setUsers] = useState<(User & { simulatedBalance: number; totalEquity: number })[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusNotification, setStatusNotification] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Modals state
  const [adjustBalanceUser, setAdjustBalanceUser] = useState<(User & { simulatedBalance: number }) | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('10000');
  const [adjustReason, setAdjustReason] = useState<string>('Test liquidity injection');

  const [inspectUser, setInspectUser] = useState<(User & { simulatedBalance: number; totalEquity: number }) | null>(null);
  const [inspectAudit, setInspectAudit] = useState<AuditEvent | null>(null);

  const [overrideInst, setOverrideInst] = useState<Instrument | null>(null);
  const [overridePrice, setOverridePrice] = useState<string>('');

  const [isAddInstrumentOpen, setIsAddInstrumentOpen] = useState(false);
  const [newInstSymbol, setNewInstSymbol] = useState('');
  const [newInstName, setNewInstName] = useState('');
  const [newInstType, setNewInstType] = useState<'STOCK' | 'CRYPTO' | 'ETF' | 'FOREX'>('STOCK');
  const [newInstPrice, setNewInstPrice] = useState('');
  const [newInstExchange, setNewInstExchange] = useState('NASDAQ');

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>('ALL');

  const notify = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setStatusNotification({ text, type });
    setTimeout(() => setStatusNotification(null), 4500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [h, u, o, insts, evs, trs] = await Promise.all([
        api.getSystemHealth(),
        api.getAdminUsers(),
        api.getAdminOrders(),
        api.getAdminInstruments(),
        api.getAdminAuditEvents(),
        api.getTransfers().catch(() => []),
      ]);
      setHealth(h);
      setUsers(u);
      setOrders(o);
      setInstruments(insts);
      setAuditEvents(evs);
      setTransfers(trs);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      notify('Failed to refresh telemetry from backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      // Background poll health every 6 seconds
      api.getSystemHealth().then(setHealth).catch(() => {});
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Platform Aggregate KPIs
  const totalPlatformEquity = useMemo(() => {
    return users.reduce((acc, u) => acc + (u.totalEquity || 0), 0);
  }, [users]);

  const totalExecutedVolume = useMemo(() => {
    return orders
      .filter((o) => o.status === 'EXECUTED')
      .reduce((acc, o) => acc + (o.totalValue || 0), 0);
  }, [orders]);

  const haltedInstrumentsCount = useMemo(() => {
    return instruments.filter((i) => i.status === 'HALTED').length;
  }, [instruments]);

  // Actions
  const handleToggleUserStatus = async (user: User) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      setActionLoading(true);
      await api.updateAdminUserStatus(user.id, nextStatus);
      notify(`User ${user.email} status changed to ${nextStatus}`, 'success');
      await loadData();
    } catch (err: any) {
      notify(err.message || 'Failed to update user status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustBalanceUser) return;
    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum)) {
      notify('Please enter a valid numeric amount', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.adjustUserBalance(adjustBalanceUser.id, amountNum, adjustReason);
      notify(`Balance adjusted! New virtual balance: $${res.newBalance.toLocaleString()}`, 'success');
      setAdjustBalanceUser(null);
      await loadData();
    } catch (err: any) {
      notify(err.message || 'Failed to adjust balance', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleInstrumentStatus = async (inst: Instrument) => {
    const nextStatus = inst.status === 'ACTIVE' ? 'HALTED' : 'ACTIVE';
    try {
      setActionLoading(true);
      await api.updateInstrumentStatus(inst.id, nextStatus);
      notify(`${inst.symbol} circuit breaker set to ${nextStatus}`, 'success');
      await loadData();
    } catch (err: any) {
      notify('Failed to update instrument status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGlobalCircuitBreaker = async (haltAll: boolean) => {
    try {
      setActionLoading(true);
      await api.adminSetCircuitBreaker(haltAll);
      notify(haltAll ? 'EMERGENCY: All market instruments HALTED' : 'All market instruments RESUMED for trading', haltAll ? 'error' : 'success');
      await loadData();
    } catch (err: any) {
      notify('Failed to toggle global circuit breaker', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeed = async () => {
    if (!health) return;
    const nextState = health.simulatedFeedStatus !== 'RUNNING';
    try {
      setActionLoading(true);
      await api.adminSetFeedStatus(nextState);
      notify(`Simulated price feed ${nextState ? 'RUNNING' : 'PAUSED'}`, 'info');
      await loadData();
    } catch (err: any) {
      notify('Failed to toggle feed engine', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarketShock = async (scenario: 'TECH_SURGE' | 'CRYPTO_RALLY' | 'MACRO_SELLOFF' | 'FLASH_CRASH') => {
    try {
      setActionLoading(true);
      const res = await api.adminTriggerMarketShock(scenario);
      notify(`Market shock executed: ${res.scenario} applied across ${res.affectedCount} instruments`, 'info');
      await loadData();
    } catch (err: any) {
      notify('Failed to execute market shock scenario', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    const reason = prompt(`Cancel order ${order.id} for ${order.symbol}? Enter reason:`, 'Administrative risk cancellation');
    if (reason === null) return;
    try {
      setActionLoading(true);
      await api.adminCancelOrder(order.id, reason);
      notify(`Order ${order.id} cancelled`, 'info');
      await loadData();
    } catch (err: any) {
      notify('Failed to cancel order', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteOrder = async (order: Order) => {
    try {
      setActionLoading(true);
      await api.adminExecuteOrder(order.id);
      notify(`Order ${order.id} for ${order.symbol} forced executed at market price`, 'success');
      await loadData();
    } catch (err: any) {
      notify(err.message || 'Failed to execute order', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriceOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideInst) return;
    const priceNum = parseFloat(overridePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      notify('Enter a valid positive price', 'error');
      return;
    }
    try {
      setActionLoading(true);
      await api.adminUpdateInstrumentPrice(overrideInst.id, priceNum);
      notify(`Price for ${overrideInst.symbol} overridden to $${priceNum}`, 'success');
      setOverrideInst(null);
      await loadData();
    } catch (err: any) {
      notify('Failed to override price', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddInstrumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstSymbol || !newInstName || !newInstPrice) {
      notify('Fill in symbol, name, and initial price', 'error');
      return;
    }
    try {
      setActionLoading(true);
      const created = await api.adminAddInstrument({
        symbol: newInstSymbol.trim().toUpperCase(),
        name: newInstName.trim(),
        assetType: newInstType,
        exchange: newInstExchange.trim(),
        currency: 'USD',
        price: parseFloat(newInstPrice),
      });
      notify(`Instrument ${created.symbol} added to live catalog!`, 'success');
      setIsAddInstrumentOpen(false);
      setNewInstSymbol('');
      setNewInstName('');
      setNewInstPrice('');
      await loadData();
    } catch (err: any) {
      notify('Failed to add instrument', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportAuditCSV = () => {
    if (auditEvents.length === 0) {
      notify('No audit events to export', 'info');
      return;
    }
    const headers = ['ID', 'Timestamp', 'Actor Email', 'Event Type', 'Target Type', 'Target ID', 'IP Hash', 'Metadata'];
    const rows = auditEvents.map((e) => [
      e.id,
      e.createdAt,
      e.actorEmail,
      e.eventType,
      e.targetType,
      e.targetId,
      e.ipHash,
      JSON.stringify(e.metadataJson || {}).replace(/"/g, '""'),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => `"${r.join('","')}"`)].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `verity_capital_inv_audit_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Audit ledger CSV exported successfully', 'success');
  };

  // Filtered lists
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        o.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.userId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderStatusFilter, searchQuery]);

  const filteredInstruments = useMemo(() => {
    if (!searchQuery.trim()) return instruments;
    const q = searchQuery.toLowerCase();
    return instruments.filter((i) => i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
  }, [instruments, searchQuery]);

  const filteredAuditEvents = useMemo(() => {
    return auditEvents.filter((ev) => {
      const matchesCategory =
        auditCategoryFilter === 'ALL' ||
        (auditCategoryFilter === 'ADMIN' && ev.eventType.startsWith('ADMIN')) ||
        (auditCategoryFilter === 'ORDER' && ev.eventType.includes('ORDER')) ||
        (auditCategoryFilter === 'USER' && ev.eventType.includes('USER')) ||
        (auditCategoryFilter === 'SYSTEM' && (ev.eventType.includes('SYSTEM') || ev.eventType.includes('CIRCUIT')));
      const matchesSearch =
        !searchQuery.trim() ||
        ev.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.targetId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [auditEvents, auditCategoryFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {statusNotification && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xl transition-all animate-in fade-in-50 ${
            statusNotification.type === 'error'
              ? 'bg-rose-950/90 border-rose-700/60 text-rose-200'
              : statusNotification.type === 'info'
              ? 'bg-cyan-950/90 border-cyan-700/60 text-cyan-200'
              : 'bg-emerald-950/90 border-emerald-700/60 text-emerald-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 fill-current" />
            <span>{statusNotification.text}</span>
          </div>
          <button onClick={() => setStatusNotification(null)} className="text-white/60 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Admin Executive Header */}
      <div className="bg-gradient-to-r from-[#0C111F] via-[#10182E] to-[#0C111F] border border-indigo-500/30 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-md border border-indigo-400/30 font-bold flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                <span>Superintendent Console</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Firestore Cloud Sync Active</span>
              </span>
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-md">
                DB ID: {health ? health.version : 'Verity-Capital Inv Core'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1.5 flex items-center space-x-2">
              <span>Verity-Capital Inv Super-Admin Control & Oversight Suite</span>
            </h1>
            <p className="text-xs text-zinc-300 mt-1 max-w-2xl">
              Simulated brokerage oversight: inspect active portfolios, grant or adjust paper trading balances, control market circuit breakers, test liquidity shocks, and audit cryptographic transaction logs.
            </p>
          </div>

          {/* Quick Global Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Global Circuit Breaker Toggle */}
            <button
              onClick={() => handleGlobalCircuitBreaker(haltedInstrumentsCount === 0)}
              disabled={actionLoading}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-lg cursor-pointer ${
                haltedInstrumentsCount > 0
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-rose-600/90 hover:bg-rose-500 text-white'
              }`}
              title="Emergency global kill-switch for all market instruments"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>{haltedInstrumentsCount > 0 ? 'Resume All Markets' : 'Halt All Markets'}</span>
            </button>

            {/* Export Audit Log */}
            <button
              onClick={handleExportAuditCSV}
              className="px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {/* Refresh Data */}
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-indigo-900/40 border border-indigo-500/30 text-xs font-semibold text-indigo-200 hover:text-white transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>

            {/* Exit to Customer View */}
            <button
              onClick={onBackToCustomer}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
            >
              Exit to Customer
            </button>
          </div>
        </div>

        {/* Global Key Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-zinc-800/80">
          <div className="bg-[#090D16] border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] uppercase font-mono text-zinc-400">Total Virtual Volume</span>
            <div className="text-base font-mono font-bold text-white mt-0.5">
              ${totalExecutedVolume.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <span className="text-[10px] text-emerald-400">{orders.length} orders recorded</span>
          </div>

          <div className="bg-[#090D16] border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] uppercase font-mono text-zinc-400">Customer Equity Base</span>
            <div className="text-base font-mono font-bold text-white mt-0.5">
              ${totalPlatformEquity.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <span className="text-[10px] text-indigo-300">{users.length} active portfolios</span>
          </div>

          <div className="bg-[#090D16] border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] uppercase font-mono text-zinc-400">Trading Engine</span>
            <div className="text-base font-mono font-bold text-white mt-0.5 flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${health?.simulatedFeedStatus === 'RUNNING' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span>{health?.simulatedFeedStatus || 'RUNNING'}</span>
            </div>
            <span className="text-[10px] text-zinc-400">Tick frequency: 4s</span>
          </div>

          <div className="bg-[#090D16] border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] uppercase font-mono text-zinc-400">Circuit Breakers</span>
            <div className="text-base font-mono font-bold text-white mt-0.5">
              {haltedInstrumentsCount > 0 ? (
                <span className="text-rose-400 font-bold">{haltedInstrumentsCount} HALTED</span>
              ) : (
                <span className="text-emerald-400 font-bold">ALL CLEAR</span>
              )}
            </div>
            <span className="text-[10px] text-zinc-400">{instruments.length} tradeable symbols</span>
          </div>

          <div className="bg-[#090D16] border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] uppercase font-mono text-zinc-400">DB Response Latency</span>
            <div className="text-base font-mono font-bold text-white mt-0.5">
              {health?.dbLatencyMs || 1.4} ms
            </div>
            <span className="text-[10px] text-emerald-400">Optimal throughput</span>
          </div>

          <div className="bg-[#090D16] border border-zinc-800/80 rounded-xl p-3">
            <span className="text-[10px] uppercase font-mono text-zinc-400">Security Audit Events</span>
            <div className="text-base font-mono font-bold text-white mt-0.5">
              {auditEvents.length}
            </div>
            <span className="text-[10px] text-zinc-400">Append-only ledger</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center bg-[#0B0F19] border border-zinc-800 rounded-xl p-1 text-xs gap-1">
        {[
          { id: 'health', label: 'Command Center & Telemetry', icon: Server },
          { id: 'users', label: `Accounts & Ledger (${users.length})`, icon: Users },
          { id: 'orders', label: `Execution Engine (${orders.length})`, icon: FileText },
          { id: 'custody', label: `Custody & Clearing (${transfers.length})`, icon: ShieldCheck },
          { id: 'instruments', label: `Asset Catalog (${instruments.length})`, icon: BarChart3 },
          { id: 'ai', label: 'AI Safety & Governance', icon: Sparkles },
          { id: 'audit', label: `Security Audit Ledger (${auditEvents.length})`, icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery('');
              }}
              className={`px-3.5 py-2.5 rounded-lg font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: COMMAND CENTER & MARKET TELEMETRY */}
      {activeTab === 'health' && health && (
        <div className="space-y-6">
          {/* Hardware & System Performance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-4">
              <span className="text-zinc-400 text-xs">Matching Engine Status</span>
              <div className="flex items-center space-x-2 mt-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-lg font-bold text-white font-mono">{health.status}</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Uptime: {Math.floor(health.uptimeSeconds / 60)} minutes</p>
            </div>

            <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-4">
              <span className="text-zinc-400 text-xs">Database Latency & Cloud State</span>
              <div className="flex items-center space-x-2 mt-2">
                <Database className="w-5 h-5 text-cyan-400" />
                <span className="text-lg font-bold text-white font-mono">{health.dbLatencyMs} ms</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Managed Firestore instance</p>
            </div>

            <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-4">
              <span className="text-zinc-400 text-xs">V8 Node Process Memory</span>
              <div className="flex items-center space-x-2 mt-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <span className="text-lg font-bold text-white font-mono">{health.memoryUsageMb} MB</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">CPU Load: {health.cpuUsagePercent}%</p>
            </div>

            <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-4">
              <span className="text-zinc-400 text-xs">Simulated Tick Generator</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-lg font-bold text-white font-mono">{health.simulatedFeedStatus}</span>
                <button
                  onClick={handleToggleFeed}
                  className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                    health.simulatedFeedStatus === 'RUNNING'
                      ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                      : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  }`}
                  title="Pause or Resume market simulation"
                >
                  {health.simulatedFeedStatus === 'RUNNING' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">Brownian motion random walk</p>
            </div>
          </div>

          {/* Market Stress Test & Shock Injector */}
          <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Market Liquidity Stress-Test & Shock Injector</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Inject simulated macro market conditions to verify margin compliance, limit order triggers, and portfolio P&L recalculations in real time.
                </p>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">Simulated Environment Only</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => handleMarketShock('TECH_SURGE')}
                disabled={actionLoading}
                className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-700/40 hover:bg-emerald-900/30 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Bull Shock</span>
                  <ArrowUpRight className="w-4 h-4 text-emerald-400 group-hover:scale-125 transition-transform" />
                </div>
                <div className="text-sm font-bold text-white mt-1">Tech Sector Surge</div>
                <p className="text-[11px] text-zinc-400 mt-1">Rallies NASDAQ stocks & ETFs by +5.5% to +7.5%</p>
              </button>

              <button
                onClick={() => handleMarketShock('CRYPTO_RALLY')}
                disabled={actionLoading}
                className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-700/40 hover:bg-cyan-900/30 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Crypto Mania</span>
                  <Zap className="w-4 h-4 text-cyan-400 group-hover:scale-125 transition-transform" />
                </div>
                <div className="text-sm font-bold text-white mt-1">Crypto Flash Bull</div>
                <p className="text-[11px] text-zinc-400 mt-1">Pumps BTC, ETH, and digital assets by +11% to +15%</p>
              </button>

              <button
                onClick={() => handleMarketShock('MACRO_SELLOFF')}
                disabled={actionLoading}
                className="p-4 rounded-xl bg-amber-950/20 border border-amber-700/40 hover:bg-amber-900/30 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Correction</span>
                  <ArrowDownRight className="w-4 h-4 text-amber-400 group-hover:scale-125 transition-transform" />
                </div>
                <div className="text-sm font-bold text-white mt-1">Macro De-risking</div>
                <p className="text-[11px] text-zinc-400 mt-1">Simulates rate hike selloff of -4.5% to -6.5%</p>
              </button>

              <button
                onClick={() => handleMarketShock('FLASH_CRASH')}
                disabled={actionLoading}
                className="p-4 rounded-xl bg-rose-950/20 border border-rose-700/40 hover:bg-rose-900/30 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Stress Test</span>
                  <AlertOctagon className="w-4 h-4 text-rose-400 group-hover:scale-125 transition-transform" />
                </div>
                <div className="text-sm font-bold text-white mt-1">Flash Crash Stress</div>
                <p className="text-[11px] text-zinc-400 mt-1">Aggressive drop of -12% to -18% to test margin calls</p>
              </button>
            </div>
          </div>

          {/* Architecture & Compliance Boundary Specification */}
          <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-6 text-xs text-zinc-300 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>MVP Architecture & Regulatory Sandbox Bounds</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="font-bold text-white block mb-1">Simulated Execution Sandbox</span>
                Paper-trading MVP with no live broker connectivity. All balance changes are virtual records with no real securities clearing.
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="font-bold text-white block mb-1">Zero-Trust Data Protection</span>
                Firestore security rules enforce that customers cannot modify administrative roles, bypass trade boundaries, or access unauthorized records.
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="font-bold text-white block mb-1">Audit Trail Immutability</span>
                Every registration, order fill, administrative price override, and status change is immutably recorded to the append-only ledger.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER ACCOUNTS & SIMULATED LEDGER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#0B0F19] border border-zinc-800 rounded-2xl p-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users by name, email, or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs text-zinc-400">
              <span>Total Accounts:</span>
              <span className="font-bold text-white font-mono">{users.length}</span>
              <span>•</span>
              <span className="text-emerald-400">{users.filter((u) => u.status === 'ACTIVE').length} Active</span>
              <span>•</span>
              <span className="text-rose-400">{users.filter((u) => u.status === 'SUSPENDED').length} Suspended</span>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">User Identity</th>
                    <th className="px-4 py-3.5">Role</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Simulated Cash</th>
                    <th className="px-4 py-3.5 text-right">Total Portfolio Equity</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-zinc-500">
                        No users match the search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-white">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-zinc-400 text-[11px]">{u.email}</div>
                          <div className="text-zinc-500 text-[9px] font-mono mt-0.5">{u.id}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                              u.role === 'ADMIN'
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/50'
                                : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-mono font-semibold text-zinc-200">
                          ${(u.simulatedBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-4 text-right font-mono font-bold text-white">
                          ${(u.totalEquity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          {/* Adjust Capital Button */}
                          <button
                            onClick={() => {
                              setAdjustBalanceUser(u);
                              setAdjustAmount('10000');
                              setAdjustReason('Admin balance adjustment');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-700/40 text-emerald-300 hover:bg-emerald-900/60 transition-colors text-[11px] font-medium cursor-pointer"
                            title="Credit or debit virtual funds"
                          >
                            Adjust Balance
                          </button>

                          {/* Toggle Status */}
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            disabled={u.role === 'ADMIN'}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                              u.status === 'ACTIVE'
                                ? 'bg-rose-950/30 border-rose-800/50 text-rose-300 hover:bg-rose-900/50'
                                : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/50'
                            } ${u.role === 'ADMIN' ? 'opacity-40 cursor-not-allowed' : ''}`}
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>

                          {/* Inspect Profile */}
                          <button
                            onClick={() => setInspectUser(u)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-[11px] cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXECUTION ENGINE & GLOBAL ORDER BOOK */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Order Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#0B0F19] border border-zinc-800 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {['ALL', 'EXECUTED', 'PENDING', 'CANCELLED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    orderStatusFilter === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by symbol, order ID, or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900 border border-zinc-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Order ID & Timestamp</th>
                    <th className="px-4 py-3.5">User Account</th>
                    <th className="px-4 py-3.5">Instrument</th>
                    <th className="px-4 py-3.5">Side / Type</th>
                    <th className="px-4 py-3.5 text-right">Quantity</th>
                    <th className="px-4 py-3.5 text-right">Requested / Executed</th>
                    <th className="px-4 py-3.5 text-right">Total Value</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-8 text-center text-zinc-500">
                        No orders recorded matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-mono text-white text-[11px] font-bold">{ord.id}</div>
                          <div className="text-[10px] text-zinc-500 flex items-center space-x-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(ord.createdAt).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-[11px] text-zinc-300">{ord.userId}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-white font-mono">{ord.symbol}</span>
                          <span className="text-[10px] text-zinc-400 block">{ord.name}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center space-x-1.5">
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                                ord.side === 'BUY'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                              }`}
                            >
                              {ord.side}
                            </span>
                            <span className="text-zinc-400 font-mono text-[10px]">{ord.orderType}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-zinc-200">
                          {ord.quantity.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono">
                          <div className="text-white">${ord.executedPrice ? ord.executedPrice.toFixed(2) : ord.requestedPrice.toFixed(2)}</div>
                          {ord.orderType === 'LIMIT' && (
                            <div className="text-[9px] text-zinc-500">Limit: ${ord.requestedPrice.toFixed(2)}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-white">
                          ${ord.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ord.status === 'EXECUTED'
                                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/50'
                                : ord.status === 'PENDING'
                                ? 'bg-amber-950/70 text-amber-300 border border-amber-700/50 animate-pulse'
                                : ord.status === 'CANCELLED'
                                ? 'bg-zinc-800 text-zinc-400'
                                : 'bg-rose-950/70 text-rose-300 border border-rose-700/50'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1.5">
                          {ord.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleExecuteOrder(ord)}
                                className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/60 text-[10px] font-bold cursor-pointer"
                                title="Force fill at current market price"
                              >
                                Force Fill
                              </button>
                              <button
                                onClick={() => handleCancelOrder(ord)}
                                className="px-2 py-1 rounded bg-rose-950/60 border border-rose-700/50 text-rose-300 hover:bg-rose-900/60 text-[10px] font-bold cursor-pointer"
                                title="Cancel pending order"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-zinc-600 font-mono">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MARKET INSTRUMENTS & ASSET MANAGEMENT */}
      {activeTab === 'instruments' && (
        <div className="space-y-4">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#0B0F19] border border-zinc-800 rounded-2xl p-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search symbol or instrument name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAddInstrumentOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Symbol</span>
              </button>
            </div>
          </div>

          {/* Instruments Table */}
          <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Asset / Symbol</th>
                    <th className="px-4 py-3.5">Asset Class</th>
                    <th className="px-4 py-3.5">Exchange</th>
                    <th className="px-4 py-3.5 text-right">Simulated Price</th>
                    <th className="px-4 py-3.5 text-right">24h Movement</th>
                    <th className="px-4 py-3.5 text-right">24h Volume</th>
                    <th className="px-4 py-3.5">Trading Status</th>
                    <th className="px-5 py-3.5 text-right">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredInstruments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white font-mono text-sm">{inst.symbol}</div>
                        <div className="text-[11px] text-zinc-400">{inst.name}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-zinc-800 text-zinc-300">
                          {inst.assetType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-zinc-400 text-[11px]">{inst.exchange}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-white text-sm">
                        ${inst.price >= 1 ? inst.price.toFixed(2) : inst.price.toFixed(4)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold">
                        <span className={inst.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {inst.changePercent >= 0 ? '+' : ''}{inst.changePercent.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-zinc-400">
                        ${(inst.volume24h || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inst.status === 'ACTIVE'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                          }`}
                        >
                          {inst.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        {/* Price Override */}
                        <button
                          onClick={() => {
                            setOverrideInst(inst);
                            setOverridePrice(String(inst.price));
                          }}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Override Price
                        </button>

                        {/* Toggle Circuit Breaker */}
                        <button
                          onClick={() => handleToggleInstrumentStatus(inst)}
                          className={`px-2.5 py-1 rounded border text-[11px] font-semibold transition-colors cursor-pointer ${
                            inst.status === 'ACTIVE'
                              ? 'bg-rose-950/30 border-rose-800/50 text-rose-300 hover:bg-rose-900/50'
                              : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/50'
                          }`}
                        >
                          {inst.status === 'ACTIVE' ? 'Halt' : 'Resume'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AI SAFETY & GOVERNANCE */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Gemini Market AI Governance & Prompt Safety</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Educational insight verification, model guardrails compliance, and mandatory simulation risk disclosures.
                </p>
              </div>
              <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800 px-2.5 py-1 rounded-md">
                Model: gemini-3.8-flash
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4">
                <span className="text-zinc-400 text-[11px]">System Prompt Version</span>
                <div className="font-mono font-bold text-white text-sm mt-1">verity_capital_inv_market_educational_v1.4</div>
                <p className="text-[11px] text-emerald-400 mt-2 flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mandatory disclaimers enforced</span>
                </p>
              </div>

              <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4">
                <span className="text-zinc-400 text-[11px]">Safety Filter Configuration</span>
                <div className="font-mono font-bold text-white text-sm mt-1">BLOCK_FINANCIAL_ADVICE_TRUE</div>
                <p className="text-[11px] text-zinc-400 mt-2">
                  Prevents generating personalized trade recommendations or live portfolio guarantees.
                </p>
              </div>

              <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4">
                <span className="text-zinc-400 text-[11px]">Confidence & Risk Grading</span>
                <div className="font-mono font-bold text-white text-sm mt-1">LOW / MODERATE / HIGH</div>
                <p className="text-[11px] text-zinc-400 mt-2">
                  Every AI briefing must output multi-factor risk categorization before publishing.
                </p>
              </div>
            </div>

            {/* Mandatory Disclaimer Compliance Preview */}
            <div className="mt-5 p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs">
              <span className="font-bold text-amber-300 block mb-1">Standardized Regulatory Disclaimer Requirement:</span>
              <p className="text-amber-200/80 text-[11px] leading-relaxed">
                "FOR EDUCATIONAL PAPER-TRADING PURPOSES ONLY. This insight does not constitute financial, investment, legal, or tax advice. Verity-Capital Inv is a simulated platform with no real securities or funds."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY AUDIT LEDGER */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Audit Search and Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#0B0F19] border border-zinc-800 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {['ALL', 'ADMIN', 'ORDER', 'USER', 'SYSTEM'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAuditCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    auditCategoryFilter === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search audit trail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                onClick={handleExportAuditCSV}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 flex items-center space-x-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Audit Events Table */}
          <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-4 py-3.5">Event Type</th>
                    <th className="px-4 py-3.5">Actor</th>
                    <th className="px-4 py-3.5">Target</th>
                    <th className="px-4 py-3.5">IP Hash</th>
                    <th className="px-5 py-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {filteredAuditEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-zinc-500 font-sans">
                        No audit events match current criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditEvents.map((ev) => (
                      <tr key={ev.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-5 py-3 text-zinc-400 text-[11px]">
                          {new Date(ev.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ev.eventType.startsWith('ADMIN')
                                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/40'
                                : ev.eventType.includes('ORDER')
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/40'
                                : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            {ev.eventType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-200 text-[11px]">{ev.actorEmail}</td>
                        <td className="px-4 py-3 text-zinc-400 text-[11px]">
                          {ev.targetType}: {ev.targetId}
                        </td>
                        <td className="px-4 py-3 text-zinc-500 text-[10px] truncate max-w-[120px]">
                          {ev.ipHash}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => setInspectAudit(ev)}
                            className="text-indigo-400 hover:text-indigo-300 text-[11px] underline cursor-pointer"
                          >
                            View JSON
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CUSTODY & CLEARING LEDGER */}
      {activeTab === 'custody' && (
        <div className="space-y-6">
          <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Institutional Custody, Fedwire & Air-Gapped Vault Ledger</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Track inbound and outbound capital clearing, whitelisted cold wallet destinations, and regulatory settlement status.
                </p>
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Transfers</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-400 border-b border-zinc-800 bg-zinc-900/40 font-mono">
                    <th className="px-4 py-3 font-semibold">Reference ID</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Asset</th>
                    <th className="px-4 py-3 font-semibold text-right">Amount</th>
                    <th className="px-4 py-3 font-semibold">Clearing Rail / Vault</th>
                    <th className="px-4 py-3 font-semibold">Destination / Address</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-zinc-500 font-sans">
                        No custody or clearing records found.
                      </td>
                    </tr>
                  ) : (
                    transfers.map((t) => (
                      <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-bold text-white">
                          {t.referenceId || t.id.substring(0, 12)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.type.startsWith('DEPOSIT')
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {t.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-amber-400">
                          {t.asset}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-white">
                          {t.amount.toLocaleString()} {t.asset}
                        </td>
                        <td className="px-4 py-3 text-zinc-300 font-sans text-[11px]">
                          {t.method || 'Fedwire / Air-Gapped Vault'}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-[11px] truncate max-w-[150px]" title={t.destinationAddress || 'Custody Primary Vault'}>
                          {t.destinationAddress || 'Segregated Custody Vault'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-[11px]">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADJUST BALANCE */}
      {adjustBalanceUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-[#0D121F] border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6 text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Adjust Virtual Cash Balance</h3>
              </div>
              <button onClick={() => setAdjustBalanceUser(null)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustBalanceSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <span className="text-zinc-400 block mb-1">Target Account:</span>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="font-bold text-white">{adjustBalanceUser.firstName} {adjustBalanceUser.lastName}</div>
                  <div className="text-zinc-400">{adjustBalanceUser.email}</div>
                  <div className="text-emerald-400 font-mono mt-1">
                    Current Balance: ${adjustBalanceUser.simulatedBalance.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Adjustment Amount ($ USD)</label>
                <input
                  type="number"
                  step="any"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 10000 or -5000"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
                <div className="flex items-center space-x-2 mt-2">
                  {['+10000', '+50000', '+100000', '-10000'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAdjustAmount(val.replace('+', ''))}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono cursor-pointer"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Audit Reason</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g., Trader granted testing funds"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAdjustBalanceUser(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW INSTRUMENT */}
      {isAddInstrumentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-[#0D121F] border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6 text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Add New Market Symbol</h3>
              </div>
              <button onClick={() => setIsAddInstrumentOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddInstrumentSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Ticker Symbol</label>
                <input
                  type="text"
                  placeholder="e.g. PLTR, SOL, EUR/USD"
                  value={newInstSymbol}
                  onChange={(e) => setNewInstSymbol(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. Palantir Technologies Inc."
                  value={newInstName}
                  onChange={(e) => setNewInstName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Asset Class</label>
                  <select
                    value={newInstType}
                    onChange={(e) => setNewInstType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="STOCK">STOCK</option>
                    <option value="CRYPTO">CRYPTO</option>
                    <option value="ETF">ETF</option>
                    <option value="FOREX">FOREX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Exchange</label>
                  <input
                    type="text"
                    value={newInstExchange}
                    onChange={(e) => setNewInstExchange(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Initial Price ($ USD)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 24.50"
                  value={newInstPrice}
                  onChange={(e) => setNewInstPrice(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddInstrumentOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Create Instrument
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PRICE OVERRIDE */}
      {overrideInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-[#0D121F] border border-zinc-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Override Price: {overrideInst.symbol}</h3>
              <button onClick={() => setOverrideInst(null)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePriceOverrideSubmit} className="mt-4 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="text-zinc-400">Current Market Price:</div>
                <div className="text-lg font-bold text-white font-mono">${overrideInst.price}</div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">New Simulated Price ($)</label>
                <input
                  type="number"
                  step="any"
                  value={overridePrice}
                  onChange={(e) => setOverridePrice(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono text-base focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setOverrideInst(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                >
                  Apply Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: INSPECT AUDIT JSON */}
      {inspectAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-[#0D121F] border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white font-mono">Event Payload: {inspectAudit.id}</h3>
              <button onClick={() => setInspectAudit(null)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-[11px] text-emerald-400">
              <pre>{JSON.stringify(inspectAudit, null, 2)}</pre>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setInspectAudit(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: INSPECT USER PROFILE */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-[#0D121F] border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6 text-zinc-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">Account Details: {inspectUser.firstName} {inspectUser.lastName}</h3>
              <button onClick={() => setInspectUser(null)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1">
                <div className="text-zinc-400">User ID: <span className="text-white font-mono">{inspectUser.id}</span></div>
                <div className="text-zinc-400">Email: <span className="text-white">{inspectUser.email}</span></div>
                <div className="text-zinc-400">Role: <span className="text-indigo-300 font-bold">{inspectUser.role}</span></div>
                <div className="text-zinc-400">Status: <span className="text-emerald-400 font-bold">{inspectUser.status}</span></div>
                <div className="text-zinc-400">Registered: <span className="text-white">{new Date(inspectUser.createdAt).toLocaleDateString()}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <div className="text-zinc-400 text-[10px] uppercase">Simulated Cash</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-1">
                    ${inspectUser.simulatedBalance.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <div className="text-zinc-400 text-[10px] uppercase">Total Equity</div>
                  <div className="text-base font-bold text-white font-mono mt-1">
                    ${inspectUser.totalEquity.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setInspectUser(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
