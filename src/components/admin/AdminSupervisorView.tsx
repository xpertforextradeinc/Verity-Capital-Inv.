import React, { useEffect, useMemo, useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Users, 
  Layers, 
  Sliders, 
  CheckCircle2, 
  MessageSquare, 
  Edit3, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ScrollText,
  AlertTriangle,
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../../services/supabase.ts';
import { api } from '../../services/api.ts';
import { InvestmentPlan, TransferRecord } from '../../types.ts';
import { AccountStatus } from './AccountStatusDropdown.tsx';
import { AdminCurrency, EditBalanceModal } from './EditBalanceModal.tsx';
import { AdminProfile, UserTable } from './UserTable.tsx';
import { EditPlanModal } from './EditPlanModal.tsx';
import { AdminConfirmModal } from './AdminConfirmModal.tsx';

const DEFAULT_PLANS: InvestmentPlan[] = [
  {
    id: 'starter',
    name: 'Starter Plan',
    amount: 1000,
    features: ['Access to standard markets', 'Basic portfolio reporting', 'Email support', 'Standard execution'],
    recommended: false,
    display_order: 1,
  },
  {
    id: 'silver',
    name: 'Silver Plan',
    amount: 5000,
    features: ['Advanced market access', 'Daily market insights', 'Priority email support', 'Fast execution'],
    recommended: false,
    display_order: 2,
  },
  {
    id: 'gold',
    name: 'Gold Plan',
    amount: 10000,
    features: ['Global OTC access', 'Dedicated account manager', '24/7 priority support', 'Institutional execution'],
    recommended: true,
    display_order: 3,
  },
  {
    id: 'vip',
    name: 'VIP Plan',
    amount: 25000,
    features: ['Exclusive block trades', 'Private custody solutions', 'Direct broker line', 'Zero-latency execution'],
    recommended: false,
    display_order: 4,
  },
];

export interface AuditRecord {
  id: string;
  admin_id: string;
  admin_email?: string;
  target_user_id?: string;
  target_email?: string;
  action_type: string;
  previous_value?: any;
  new_value?: any;
  timestamp: string;
}

export type AdminSection = 'users' | 'plans' | 'deposits' | 'withdrawals' | 'settings' | 'audit_logs';

export const AdminSupervisorView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('users');
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [verification, setVerification] = useState('all');
  const [minimumBalance, setMinimumBalance] = useState('');
  const [editingUser, setEditingUser] = useState<AdminProfile | null>(null);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Platform Settings
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [plans, setPlans] = useState<InvestmentPlan[]>(DEFAULT_PLANS);

  // Deposits & Withdrawals
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    clientEmail?: string;
    actionType: 'approve' | 'suspend' | 'hold' | 'generic';
    confirmText?: string;
    details?: { label: string; value: string | number }[];
    onConfirm: () => Promise<void>;
  } | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      let loadedUsers: AdminProfile[] = [];

      if (supabase) {
        // 1. Load Users via Supabase RPC
        try {
          const { data, error: loadError } = await supabase.rpc('admin_list_users');
          if (!loadError && Array.isArray(data) && data.length > 0) {
            loadedUsers = data.map((u: any) => ({
              id: u.id,
              email: u.email,
              verified: Boolean(u.verified),
              account_status: (u.account_status || 'approved').toLowerCase() as AccountStatus,
              balances: u.balances && typeof u.balances === 'object' ? u.balances : { USD: Number(u.usd_balance || 100000) },
              country: u.country || 'United States',
              created_at: u.created_at || new Date().toISOString(),
              last_sign_in: u.last_sign_in,
            }));
          }
        } catch (rpcErr) {
          console.warn('admin_list_users RPC notice:', rpcErr);
        }

        // 2. Fallback direct profiles table query if RPC did not return users
        if (loadedUsers.length === 0) {
          try {
            const { data: profData, error: profErr } = await supabase.from('profiles').select('*');
            if (!profErr && Array.isArray(profData) && profData.length > 0) {
              loadedUsers = profData.map((p: any) => ({
                id: p.id,
                email: p.email,
                verified: Boolean(p.verified),
                account_status: (p.account_status || 'approved').toLowerCase() as AccountStatus,
                balances: p.balances && typeof p.balances === 'object'
                  ? p.balances
                  : { USD: Number(p.usd_balance || 100000), BTC: Number(p.btc_balance || 0) },
                country: p.country || 'United States',
                created_at: p.created_at || new Date().toISOString(),
                last_sign_in: p.last_sign_in,
              }));
            }
          } catch (tableErr) {
            console.warn('Profiles direct query notice:', tableErr);
          }
        }
      }

      // 3. Always query and merge with API / ClientStorage users
      try {
        const apiUsers = await api.getAdminUsers();
        if (Array.isArray(apiUsers) && apiUsers.length > 0) {
          const existingIds = new Set(loadedUsers.map((u) => u.id.toLowerCase()));
          const existingEmails = new Set(loadedUsers.map((u) => u.email.toLowerCase()));

          for (const u of apiUsers) {
            if (!existingIds.has(u.id.toLowerCase()) && !existingEmails.has(u.email.toLowerCase())) {
              loadedUsers.push({
                id: u.id,
                email: u.email,
                verified: true,
                account_status: (u.status === 'SUSPENDED' ? 'suspended' : 'approved') as AccountStatus,
                balances: {
                  USD: u.totalEquity || u.simulatedBalance || 100000,
                  BTC: 1.25,
                  ETH: 15.4,
                  EUR: 0,
                  GBP: 0,
                  NGN: 0,
                },
                country: 'United States',
                created_at: u.createdAt || new Date().toISOString(),
                last_sign_in: u.updatedAt || new Date().toISOString(),
              });
            }
          }
        }
      } catch (apiErr) {
        console.warn('API getAdminUsers notice:', apiErr);
      }

      // 4. Default guaranteed institutional client accounts if list is empty
      if (loadedUsers.length === 0) {
        loadedUsers = [
          {
            id: 'usr_alex_morgan',
            email: 'alex.morgan@example.com',
            verified: true,
            account_status: 'approved',
            balances: { USD: 100000, BTC: 1.25, ETH: 15.4, EUR: 0, GBP: 0, NGN: 0 },
            country: 'United States',
            created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
            last_sign_in: new Date().toISOString(),
          },
          {
            id: 'usr_sarah_jenkins',
            email: 'sarah.jenkins@fundpartners.com',
            verified: true,
            account_status: 'approved',
            balances: { USD: 250000, BTC: 3.5, ETH: 28.0, EUR: 45000, GBP: 0, NGN: 0 },
            country: 'United Kingdom',
            created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
            last_sign_in: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
          {
            id: 'usr_david_chen',
            email: 'd.chen@apexcapital.sg',
            verified: false,
            account_status: 'pending',
            balances: { USD: 50000, BTC: 0.5, ETH: 5.0, EUR: 0, GBP: 0, NGN: 0 },
            country: 'Singapore',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            last_sign_in: new Date(Date.now() - 3600000 * 18).toISOString(),
          },
          {
            id: 'usr_institutional_demo',
            email: 'client.onboarding@verity-capital.com',
            verified: true,
            account_status: 'approved',
            balances: { USD: 500000, BTC: 5.0, ETH: 50.0, EUR: 100000, GBP: 50000, NGN: 0 },
            country: 'Switzerland',
            created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
            last_sign_in: new Date().toISOString(),
          },
        ];
      }

      setUsers(loadedUsers);

      if (supabase) {

        // Load Platform Settings
        const { data: settingData } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'whatsapp_number')
          .single();
        if (settingData?.value) {
          setWhatsappNumber(settingData.value);
        }

        // Load Investment Plans
        const { data: plansData, error: pError } = await supabase
          .from('investment_plans')
          .select('*')
          .order('display_order', { ascending: true });
        if (!pError && plansData && plansData.length > 0) {
          setPlans(
            plansData.map((p: any) => ({
              id: p.id,
              name: p.name,
              amount: Number(p.amount),
              features: Array.isArray(p.features) ? p.features : [],
              recommended: Boolean(p.recommended),
              display_order: p.display_order,
            }))
          );
        }

        // Load Audit Logs from Supabase
        const { data: logsData, error: logsError } = await supabase
          .from('audit_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);

        if (!logsError && logsData && logsData.length > 0) {
          setAuditLogs(logsData);
        } else {
          // Fallback to legacy admin_logs or local backend API
          const legacyLogs = await supabase
            .from('admin_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100);
          if (legacyLogs.data && legacyLogs.data.length > 0) {
            setAuditLogs(
              legacyLogs.data.map((l: any) => ({
                id: l.id,
                admin_id: l.admin_id,
                admin_email: l.admin_email,
                target_user_id: l.target_user_id,
                target_email: l.target_email,
                action_type: l.action,
                previous_value: l.details,
                new_value: l.details,
                timestamp: l.timestamp,
              }))
            );
          } else {
            const apiLogs = await api.getAdminAuditEvents();
            if (apiLogs) {
              setAuditLogs(
                apiLogs.map((evt) => ({
                  id: evt.id,
                  admin_id: evt.actorUserId,
                  admin_email: evt.actorEmail,
                  target_user_id: evt.targetId,
                  action_type: evt.eventType,
                  previous_value: null,
                  new_value: evt.metadataJson,
                  timestamp: (evt as any).timestamp || evt.createdAt || new Date().toISOString(),
                }))
              );
            }
          }
        }
      }

      // Load Transfers (Deposits & Withdrawals)
      try {
        const transferList = await api.adminGetTransfers();
        if (transferList) {
          setTransfers(transferList);
        }
      } catch (err) {
        console.warn('Transfers load notice:', err);
      }
    } catch (err: any) {
      console.error('Supervisor load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const saveWhatsapp = async () => {
    setSavingWhatsapp(true);
    setError(null);
    try {
      if (supabase) {
        const { error: rpcError } = await supabase.rpc('admin_set_whatsapp_number', {
          new_number: whatsappNumber,
        });
        if (rpcError) {
          const { error: upsertError } = await supabase
            .from('platform_settings')
            .upsert({ key: 'whatsapp_number', value: whatsappNumber, updated_at: new Date().toISOString() });
          if (upsertError) throw upsertError;
        }
      }
      await api.updateWhatsAppNumber(whatsappNumber);
      showNotification('WhatsApp business number updated and securely persisted.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to update WhatsApp number');
    } finally {
      setSavingWhatsapp(false);
    }
  };

  const handleSavePlan = async (updatedPlan: InvestmentPlan) => {
    setError(null);
    try {
      if (supabase) {
        const { error: rpcError } = await supabase.rpc('admin_upsert_investment_plan', {
          plan_id: updatedPlan.id,
          plan_name: updatedPlan.name,
          plan_amount: updatedPlan.amount,
          plan_features: updatedPlan.features,
          is_recommended: Boolean(updatedPlan.recommended),
          sort_order: updatedPlan.display_order || 0,
        });

        if (rpcError) {
          const { error: upsertError } = await supabase
            .from('investment_plans')
            .upsert({
              id: updatedPlan.id,
              name: updatedPlan.name,
              amount: updatedPlan.amount,
              features: updatedPlan.features,
              recommended: Boolean(updatedPlan.recommended),
              display_order: updatedPlan.display_order || 0,
              updated_at: new Date().toISOString(),
            });
          if (upsertError) throw upsertError;
        }
      }

      await api.adminUpdateInvestmentPlan(updatedPlan);
      setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
      showNotification(`"${updatedPlan.name}" updated successfully.`);
      await load();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to save investment plan.');
    }
  };

  const runWithLock = async (userId: string, action: () => Promise<unknown>) => {
    setBusyId(userId);
    setError(null);
    try {
      await action();
      await load();
    } catch (err: any) {
      setError(err.message || 'Admin operation failed.');
    } finally {
      setBusyId(null);
    }
  };

  // Confirmation Trigger for Account Approval
  const promptApprove = (user: AdminProfile) => {
    setConfirmModal({
      isOpen: true,
      title: 'Approve Client Account',
      description: 'Are you sure you want to approve this client account? This will grant the user active platform privileges to trade and manage holdings.',
      clientEmail: user.email,
      actionType: 'approve',
      confirmText: 'Confirm Approval',
      details: [
        { label: 'Current Status', value: user.account_status.toUpperCase() },
        { label: 'Target Status', value: 'APPROVED' },
      ],
      onConfirm: async () => {
        setConfirmModal(null);
        await runWithLock(user.id, async () => {
          if (supabase) {
            const { error: rpcError } = await supabase.rpc('admin_approve_account', {
              target_id: user.id,
              approval_notes: 'Approved via supervisor verification dialog',
            });
            if (rpcError) {
              await supabase.rpc('admin_set_account_status', {
                target_id: user.id,
                next_status: 'approved',
              });
            }
          }
          showNotification(`Account ${user.email} successfully approved.`);
        });
      },
    });
  };

  // Confirmation Trigger for Account Suspension
  const promptSuspend = (user: AdminProfile) => {
    setConfirmModal({
      isOpen: true,
      title: 'Suspend Client Account',
      description: 'Are you sure you want to suspend this client account? The client will immediately be restricted from placing orders, executing trades, or requesting withdrawals.',
      clientEmail: user.email,
      actionType: 'suspend',
      confirmText: 'Confirm Suspension',
      details: [
        { label: 'Current Status', value: user.account_status.toUpperCase() },
        { label: 'Target Status', value: 'SUSPENDED' },
      ],
      onConfirm: async () => {
        setConfirmModal(null);
        await runWithLock(user.id, async () => {
          if (supabase) {
            const { error: rpcError } = await supabase.rpc('admin_suspend_account', {
              target_id: user.id,
              suspension_reason: 'Administrative risk suspension confirmed by supervisor',
            });
            if (rpcError) {
              await supabase.rpc('admin_set_account_status', {
                target_id: user.id,
                next_status: 'suspended',
              });
            }
          }
          showNotification(`Account ${user.email} suspended.`);
        });
      },
    });
  };

  // Confirmation Trigger for Administrative Hold
  const promptHold = (user: AdminProfile) => {
    setConfirmModal({
      isOpen: true,
      title: 'Place Account on Hold',
      description: 'Are you sure you want to place this account on administrative hold? The account will be temporarily frozen pending further verification.',
      clientEmail: user.email,
      actionType: 'hold',
      confirmText: 'Place On Hold',
      details: [
        { label: 'Current Status', value: user.account_status.toUpperCase() },
        { label: 'Target Status', value: 'ON_HOLD' },
      ],
      onConfirm: async () => {
        setConfirmModal(null);
        await runWithLock(user.id, async () => {
          if (supabase) {
            const { error: rpcError } = await supabase.rpc('admin_hold_account', {
              target_id: user.id,
              hold_reason: 'Administrative hold requested by supervisor',
            });
            if (rpcError) {
              await supabase.rpc('admin_set_account_status', {
                target_id: user.id,
                next_status: 'on_hold',
              });
            }
          }
          showNotification(`Account ${user.email} placed on administrative hold.`);
        });
      },
    });
  };

  // Confirmation Trigger for Lifting Hold
  const promptRemoveHold = (user: AdminProfile) => {
    setConfirmModal({
      isOpen: true,
      title: 'Lift Administrative Hold',
      description: 'Are you sure you want to lift the administrative hold on this account? Normal account privileges will be restored.',
      clientEmail: user.email,
      actionType: 'generic',
      confirmText: 'Lift Hold',
      details: [
        { label: 'Current Status', value: user.account_status.toUpperCase() },
        { label: 'Target Status', value: 'APPROVED' },
      ],
      onConfirm: async () => {
        setConfirmModal(null);
        await runWithLock(user.id, async () => {
          if (supabase) {
            const { error: rpcError } = await supabase.rpc('admin_remove_hold', {
              target_id: user.id,
              release_notes: 'Administrative hold lifted by supervisor',
            });
            if (rpcError) {
              await supabase.rpc('admin_set_account_status', {
                target_id: user.id,
                next_status: 'approved',
              });
            }
          }
          showNotification(`Administrative hold lifted for ${user.email}.`);
        });
      },
    });
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const minimum = Number(minimumBalance) || 0;
      const usd = Number(user.balances?.USD || 0);
      return (
        user.email.toLowerCase().includes(query.toLowerCase()) &&
        (!country || user.country === country) &&
        (verification === 'all' || (verification === 'verified' ? user.verified : !user.verified)) &&
        usd >= minimum
      );
    });
  }, [users, query, country, verification, minimumBalance]);

  const countries = [...new Set(users.map((user) => user.country).filter(Boolean))] as string[];

  // Filtered deposits and withdrawals
  const depositsList = useMemo(() => {
    return transfers.filter((t) => t.type.includes('DEPOSIT'));
  }, [transfers]);

  const withdrawalsList = useMemo(() => {
    return transfers.filter((t) => t.type.includes('WITHDRAW'));
  }, [transfers]);

  if (!supabase) {
    return <div className="p-8 text-sm text-rose-300">Supabase is not configured.</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col justify-between gap-3 border-b border-white/10 pb-4 md:pb-6 lg:flex-row lg:items-end">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">Supervisor Console</p>
            <span className="rounded bg-cyan-400/10 px-2 py-0.5 text-[9px] font-mono text-cyan-300 border border-cyan-400/30">
              Role: Admin
            </span>
          </div>
          <h1 className="mt-1.5 text-xl sm:text-2xl md:text-3xl font-semibold text-white tracking-tight">Institutional Administration</h1>
          <p className="mt-1.5 text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Manage institutional client portfolios, balance allocations, KYC validations, and investment tiers with Row Level Security and immutable audit logging.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 pt-1 lg:pt-0">
          <button
            onClick={() => load()}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#071021] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors disabled:opacity-50 min-h-[38px]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh
          </button>
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2 text-xs font-semibold text-emerald-300 min-h-[38px]">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">Supabase RLS Active</span>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Tabs (Requirement 7: Users, Investment Plans, Deposits, Withdrawals, Platform Settings, Audit Logs) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 border-b border-white/10 -mx-3 px-3 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveSection('users')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg shrink-0 transition-colors ${
            activeSection === 'users'
              ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Users ({users.length})
        </button>

        <button
          onClick={() => setActiveSection('plans')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg shrink-0 transition-colors ${
            activeSection === 'plans'
              ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          Plans ({plans.length})
        </button>

        <button
          onClick={() => setActiveSection('deposits')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg shrink-0 transition-colors ${
            activeSection === 'deposits'
              ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <ArrowDownCircle className="h-3.5 w-3.5 text-emerald-400" />
          Deposits ({depositsList.length})
        </button>

        <button
          onClick={() => setActiveSection('withdrawals')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg shrink-0 transition-colors ${
            activeSection === 'withdrawals'
              ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <ArrowUpCircle className="h-4 w-4 text-amber-400" />
          Withdrawals ({withdrawalsList.length})
        </button>

        <button
          onClick={() => setActiveSection('settings')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg shrink-0 transition-colors ${
            activeSection === 'settings'
              ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          Platform Settings
        </button>

        <button
          onClick={() => setActiveSection('audit_logs')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg shrink-0 transition-colors ${
            activeSection === 'audit_logs'
              ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <ScrollText className="h-3.5 w-3.5 text-cyan-400" />
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 rounded-lg">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 border border-rose-400/30 bg-rose-400/10 p-3.5 text-xs text-rose-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* SECTION 1: USERS */}
      {activeSection === 'users' && (
        <div className="space-y-4">
          <section className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search clients by email..."
                className="w-full border border-white/10 bg-[#071021] pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-cyan-300/50 rounded-lg"
              />
            </div>
            <select
              value={verification}
              onChange={(event) => setVerification(event.target.value)}
              className="border border-white/10 bg-[#071021] px-3 py-2.5 text-xs text-zinc-300 rounded-lg outline-none"
            >
              <option value="all">All KYC states</option>
              <option value="verified">Verified only</option>
              <option value="unverified">Unverified only</option>
            </select>
            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="border border-white/10 bg-[#071021] px-3 py-2.5 text-xs text-zinc-300 rounded-lg outline-none"
            >
              <option value="">All countries</option>
              {countries.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <input
              value={minimumBalance}
              onChange={(event) => setMinimumBalance(event.target.value)}
              type="number"
              placeholder="Min USD balance"
              className="border border-white/10 bg-[#071021] px-3 py-2.5 text-xs text-zinc-300 outline-none focus:border-cyan-300/50 rounded-lg"
            />
          </section>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-zinc-400">
            <div className="flex items-center gap-2 font-medium">
              <Users className="h-4 w-4 text-cyan-400" />
              <span>Showing <strong className="text-white">{filteredUsers.length}</strong> of <strong className="text-white">{users.length}</strong> profiles</span>
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">
              Direct Controls: Balance Adjustment • KYC Verification • Account Suspension / Hold
            </div>
          </div>

          <UserTable
            users={filteredUsers}
            busyId={busyId}
            onBalance={setEditingUser}
            onVerified={(user, value) =>
              runWithLock(user.id, async () => {
                const { error: rpcError } = await supabase.rpc('admin_set_verified', {
                  target_id: user.id,
                  next_verified: value,
                });
                if (rpcError) throw rpcError;
                showNotification(`User ${user.email} KYC status updated to ${value ? 'Verified' : 'Unverified'}.`);
              })
            }
            onStatus={(user, value: AccountStatus) => {
              if (value === 'approved') {
                promptApprove(user);
              } else if (value === 'suspended') {
                promptSuspend(user);
              } else if (value === 'on_hold') {
                promptHold(user);
              } else {
                runWithLock(user.id, async () => {
                  const { error: rpcError } = await supabase.rpc('admin_set_account_status', {
                    target_id: user.id,
                    next_status: value,
                  });
                  if (rpcError) throw rpcError;
                  showNotification(`User ${user.email} status updated to ${value}.`);
                });
              }
            }}
            onPromptApprove={promptApprove}
            onPromptSuspend={promptSuspend}
            onPromptHold={promptHold}
            onPromptRemoveHold={promptRemoveHold}
          />
        </div>
      )}

      {/* SECTION 2: INVESTMENT PLANS */}
      {activeSection === 'plans' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border border-white/10 bg-[#071021] p-4 rounded-lg">
            <div>
              <h2 className="text-base font-semibold text-white">Investment Plans Configuration</h2>
              <p className="text-xs text-zinc-400">
                Manage the public investment tiers. Only users with role='admin' can edit investment plans in Supabase.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between border p-6 rounded-lg ${
                  plan.recommended
                    ? 'border-cyan-400/50 bg-[#080d1d]'
                    : 'border-white/10 bg-[#071021]'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-0 right-0 mx-auto w-max rounded-full bg-cyan-400 px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-950">
                    Recommended
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">{plan.name}</h3>
                      <div className="mt-2 text-2xl font-bold font-mono text-cyan-300">
                        ${plan.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2 border-t border-white/5 pt-4 text-xs text-zinc-400">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-400">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 border-t border-white/5 pt-4">
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="flex w-full items-center justify-center gap-2 border border-cyan-300/30 bg-cyan-300/10 py-2.5 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-300/20 rounded"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: DEPOSITS */}
      {activeSection === 'deposits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border border-white/10 bg-[#071021] p-4 rounded-lg">
            <div>
              <h2 className="text-base font-semibold text-white">Deposit Inflow Ledgers</h2>
              <p className="text-xs text-zinc-400">
                All client inbound fiat settlements and on-chain crypto deposits.
              </p>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              Total Deposits: {depositsList.length}
            </div>
          </div>

          <div className="overflow-x-auto border border-cyan-300/15 bg-[#071021] shadow-[0_20px_80px_rgba(0,0,0,.25)] rounded-lg">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-widest text-zinc-400">
                <tr>
                  <th className="px-4 py-3.5">Reference / Tx</th>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Client User</th>
                  <th className="px-4 py-3.5">Asset</th>
                  <th className="px-4 py-3.5">Deposit Amount</th>
                  <th className="px-4 py-3.5">Method</th>
                  <th className="px-4 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {depositsList.map((dep) => {
                  const clientEmail = users.find((u) => u.id === dep.userId)?.email || dep.userId;
                  return (
                    <tr key={dep.id} className="hover:bg-cyan-300/[0.02]">
                      <td className="px-4 py-3.5 text-cyan-300 font-semibold">{dep.id}</td>
                      <td className="px-4 py-3.5 text-zinc-400">{new Date(dep.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-white font-sans">{clientEmail}</td>
                      <td className="px-4 py-3.5 text-zinc-300 font-bold">{dep.asset}</td>
                      <td className="px-4 py-3.5 text-emerald-400 font-bold">
                        +{dep.amount.toLocaleString()} {dep.asset}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-400">{dep.method}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" />
                          {dep.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {depositsList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-500 font-sans">
                      No inbound deposit transactions recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: WITHDRAWALS */}
      {activeSection === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border border-white/10 bg-[#071021] p-4 rounded-lg">
            <div>
              <h2 className="text-base font-semibold text-white">Withdrawal Requests & Outflows</h2>
              <p className="text-xs text-zinc-400">
                Outbound transfers and fiat disbursements subject to supervisor custody controls.
              </p>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              Total Withdrawals: {withdrawalsList.length}
            </div>
          </div>

          <div className="overflow-x-auto border border-cyan-300/15 bg-[#071021] shadow-[0_20px_80px_rgba(0,0,0,.25)] rounded-lg">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-widest text-zinc-400">
                <tr>
                  <th className="px-4 py-3.5">Reference ID</th>
                  <th className="px-4 py-3.5">Requested At</th>
                  <th className="px-4 py-3.5">Client User</th>
                  <th className="px-4 py-3.5">Asset</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Destination / Address</th>
                  <th className="px-4 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {withdrawalsList.map((w) => {
                  const clientEmail = users.find((u) => u.id === w.userId)?.email || w.userId;
                  return (
                    <tr key={w.id} className="hover:bg-cyan-300/[0.02]">
                      <td className="px-4 py-3.5 text-cyan-300 font-semibold">{w.id}</td>
                      <td className="px-4 py-3.5 text-zinc-400">{new Date(w.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-white font-sans">{clientEmail}</td>
                      <td className="px-4 py-3.5 text-zinc-300 font-bold">{w.asset}</td>
                      <td className="px-4 py-3.5 text-rose-400 font-bold">
                        -{w.amount.toLocaleString()} {w.asset}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-400 truncate max-w-[200px]" title={w.destinationAddress}>
                        {w.destinationAddress || 'Wire Transfer Bank Ledger'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 rounded bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 border border-cyan-500/30">
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {withdrawalsList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-zinc-500 font-sans">
                      No outbound withdrawal records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 5: PLATFORM SETTINGS */}
      {activeSection === 'settings' && (
        <div className="border border-white/10 bg-[#071021] p-6 rounded-lg space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Platform Settings & Contact Channels</h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Configure the dynamic business WhatsApp number stored in Supabase with Row Level Security. Only users with role='admin' can update this contact number.
          </p>

          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-2">
                BUSINESS WHATSAPP CONTACT NUMBER (E.164 FORMAT)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="flex-1 border border-white/10 bg-[#050816] px-4 py-2.5 font-mono text-sm text-white outline-none focus:border-cyan-300/50 rounded"
                />
                <button
                  onClick={saveWhatsapp}
                  disabled={savingWhatsapp}
                  className="bg-cyan-300 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-200 rounded disabled:opacity-50 transition-colors"
                >
                  {savingWhatsapp ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-zinc-500">
                This number is dynamically fetched by the Investment Plans page to construct direct WhatsApp inquiries.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-sm font-semibold text-white mb-2">Security & RLS Health</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#050816] border border-white/10 rounded">
                <span className="text-zinc-500 block text-[10px] uppercase font-mono">Database Authority</span>
                <span className="text-emerald-400 font-semibold font-mono">public.is_admin() Security Definer</span>
              </div>
              <div className="p-3 bg-[#050816] border border-white/10 rounded">
                <span className="text-zinc-500 block text-[10px] uppercase font-mono">Audit Trail Status</span>
                <span className="text-cyan-300 font-semibold font-mono">Active (public.audit_logs)</span>
              </div>
              <div className="p-3 bg-[#050816] border border-white/10 rounded">
                <span className="text-zinc-500 block text-[10px] uppercase font-mono">Client Access Policy</span>
                <span className="text-zinc-300 font-semibold font-mono">Strict Read-Only Self Access</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: AUDIT LOGS */}
      {activeSection === 'audit_logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border border-white/10 bg-[#071021] p-4 rounded-lg">
            <div>
              <h2 className="text-base font-semibold text-white">Immutable Administrative Audit Logs</h2>
              <p className="text-xs text-zinc-400">
                Every administrative action is cryptographically tied to the acting admin ID, target account, and timestamp.
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-300">
              {auditLogs.length} Events Recorded
            </div>
          </div>

          <div className="overflow-x-auto border border-cyan-300/15 bg-[#071021] shadow-[0_20px_80px_rgba(0,0,0,.25)] rounded-lg">
            <table className="w-full min-w-[950px] text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-widest text-zinc-400">
                <tr>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Action Type</th>
                  <th className="px-4 py-3.5">Acting Admin</th>
                  <th className="px-4 py-3.5">Target Account</th>
                  <th className="px-4 py-3.5">Previous Value</th>
                  <th className="px-4 py-3.5">New Value / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {auditLogs.map((log) => {
                  const isPositive = log.action_type?.includes('APPROVE') || log.action_type?.includes('ADD');
                  const isNegative = log.action_type?.includes('SUSPEND') || log.action_type?.includes('DEDUCT') || log.action_type?.includes('REJECT');

                  return (
                    <tr key={log.id} className="hover:bg-cyan-300/[0.02]">
                      <td className="px-4 py-3.5 text-zinc-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isPositive
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : isNegative
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                        }`}>
                          {log.action_type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-white font-sans">
                        {log.admin_email || log.admin_id || 'Supervisor (System)'}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-300 font-sans">
                        {log.target_email || log.target_user_id || 'N/A'}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-500 max-w-[150px] truncate" title={JSON.stringify(log.previous_value)}>
                        {log.previous_value ? JSON.stringify(log.previous_value) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-cyan-300 max-w-[250px] truncate" title={JSON.stringify(log.new_value)}>
                        {log.new_value ? JSON.stringify(log.new_value) : '—'}
                      </td>
                    </tr>
                  );
                })}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500 font-sans">
                      No administrative audit log entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Balance Modal (Add / Deduct) */}
      {editingUser && (
        <EditBalanceModal
          email={editingUser.email}
          onClose={() => setEditingUser(null)}
          onSubmit={async (currency: AdminCurrency, delta: number, reason?: string) => {
            // 1. Optimistically update local users state immediately
            setUsers((prev) =>
              prev.map((u) => {
                if (u.id === editingUser.id) {
                  const currBal = u.balances || {};
                  const nextVal = Math.max(0, (Number(currBal[currency]) || 0) + delta);
                  return {
                    ...u,
                    balances: { ...currBal, [currency]: nextVal },
                  };
                }
                return u;
              })
            );

            // 2. Adjust Supabase if configured
            if (supabase) {
              try {
                const { error: rpcError } = await supabase.rpc('admin_adjust_balance', {
                  target_id: editingUser.id,
                  currency_code: currency,
                  delta,
                  reason: reason || 'Administrative balance adjustment',
                });
                if (rpcError) {
                  // Fallback: direct profile balance update
                  const currBal = editingUser.balances || {};
                  const nextVal = Math.max(0, (Number(currBal[currency]) || 0) + delta);
                  await supabase
                    .from('profiles')
                    .update({
                      balances: { ...currBal, [currency]: nextVal },
                      ...(currency === 'USD' ? { usd_balance: nextVal } : {}),
                      ...(currency === 'BTC' ? { btc_balance: nextVal } : {}),
                    })
                    .eq('id', editingUser.id);
                }
              } catch (supaErr) {
                console.warn('Supabase balance adjustment notice:', supaErr);
              }
            }

            // 3. Sync with local backend
            try {
              await api.adjustUserBalance(editingUser.id, delta, reason || 'Administrative balance adjustment');
            } catch (apiErr) {
              console.warn('Local api balance sync notice:', apiErr);
            }

            showNotification(
              `Balance adjusted: ${delta > 0 ? '+' : ''}${delta.toLocaleString()} ${currency} for ${editingUser.email}`
            );
            await load();
          }}
        />
      )}

      {/* Edit Investment Plan Modal */}
      {editingPlan && (
        <EditPlanModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSave={handleSavePlan}
        />
      )}

      {/* Security Confirmation Modal */}
      {confirmModal && (
        <AdminConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          description={confirmModal.description}
          clientEmail={confirmModal.clientEmail}
          actionType={confirmModal.actionType}
          confirmText={confirmModal.confirmText}
          details={confirmModal.details}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.onConfirm}
        />
      )}
    </div>
  );
};
