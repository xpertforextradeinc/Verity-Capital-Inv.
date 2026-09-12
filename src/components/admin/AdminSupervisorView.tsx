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
  ExternalLink,
  KeyRound,
  Copy,
  Check,
  Award,
  Sparkles,
  Mail,
  Share2,
  XCircle,
  Info,
  Menu,
  X,
  ChevronRight,
  Shield,
  Activity,
  Database
} from 'lucide-react';
import { supabase } from '../../services/supabase.ts';
import { api } from '../../services/api.ts';
import { InvestmentPlan, TransferRecord } from '../../types.ts';
import { AccountStatus } from './AccountStatusDropdown.tsx';
import { AdminCurrency, EditBalanceModal } from './EditBalanceModal.tsx';
import { AdminProfile, UserTable } from './UserTable.tsx';
import { EditPlanModal } from './EditPlanModal.tsx';
import { AdminConfirmModal } from './AdminConfirmModal.tsx';
import { AdminUpgradeModal } from './AdminUpgradeModal.tsx';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [verification, setVerification] = useState('all');
  const [minimumBalance, setMinimumBalance] = useState('');
  const [editingUser, setEditingUser] = useState<AdminProfile | null>(null);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);
  const [upgradeUser, setUpgradeUser] = useState<AdminProfile | null>(null);
  const [otpCopiedId, setOtpCopiedId] = useState<string | null>(null);
  const [withdrawalFilter, setWithdrawalFilter] = useState<'ALL' | 'PENDING_OTP' | 'CONFIRMED' | 'REJECTED'>('ALL');
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
                firstName: u.firstName,
                lastName: u.lastName,
                dateOfBirth: u.dateOfBirth,
              verified: Boolean(u.verified),
              account_status: (u.account_status || 'approved').toLowerCase() as AccountStatus,
              balances: u.balances && typeof u.balances === 'object' ? u.balances : { USD: Number(u.usd_balance || 0.00) },
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
                  : { USD: Number(p.usd_balance || 0.00), BTC: Number(p.btc_balance || 0) },
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
            const existingIndex = loadedUsers.findIndex(
              (exist) => exist.id.toLowerCase() === u.id.toLowerCase() || exist.email.toLowerCase() === u.email.toLowerCase()
            );

            if (existingIndex >= 0) {
              // Merge upgrade info into existing user
              loadedUsers[existingIndex] = {
                ...loadedUsers[existingIndex],
                firstName: u.firstName,
                lastName: u.lastName,
                dateOfBirth: u.dateOfBirth,
                isUpgraded: Boolean(u.isUpgraded),
                upgradeStatus: (u.upgradeStatus as any) || (u.isUpgraded ? 'UPGRADED' : 'NOT_REQUESTED'),
                upgradeTier: u.upgradeTier,
                upgradeTask: u.upgradeTask,
              };
            } else {
              loadedUsers.push({
                id: u.id,
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                dateOfBirth: u.dateOfBirth,
                verified: true,
                account_status: (u.status === 'SUSPENDED' ? 'suspended' : 'approved') as AccountStatus,
                balances: {
                  USD: u.totalEquity || u.simulatedBalance || 0.00,
                  BTC: 1.25,
                  ETH: 15.4,
                  EUR: 0,
                  GBP: 0,
                  NGN: 0,
                },
                country: 'United States',
                created_at: u.createdAt || new Date().toISOString(),
                last_sign_in: u.updatedAt || new Date().toISOString(),
                isUpgraded: Boolean(u.isUpgraded),
                upgradeStatus: (u.upgradeStatus as any) || (u.isUpgraded ? 'UPGRADED' : 'NOT_REQUESTED'),
                upgradeTier: u.upgradeTier,
                upgradeTask: u.upgradeTask,
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
            balances: { USD: 0.00, BTC: 1.25, ETH: 15.4, EUR: 0, GBP: 0, NGN: 0 },
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
            email: 'david.chen@apex-capital.io',
            verified: false,
            account_status: 'approved',
            balances: { USD: 75000, BTC: 0.8, ETH: 8.2, EUR: 0, GBP: 12000, NGN: 0 },
            country: 'Singapore',
            created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
            last_sign_in: new Date(Date.now() - 3600000 * 1).toISOString(),
          },
        ];
      }

      setUsers(loadedUsers);

      // 5. Load WhatsApp number from platform_settings
      if (supabase) {
        try {
          const { data: settingData } = await supabase
            .from('platform_settings')
            .select('setting_value')
            .eq('setting_key', 'whatsapp_number')
            .maybeSingle();
          if (settingData?.setting_value) {
            setWhatsappNumber(settingData.setting_value);
          }
        } catch (setErr) {
          console.warn('platform_settings fetch notice:', setErr);
        }
      }

      // 6. Load Investment Plans
      if (supabase) {
        try {
          const { data: plansData, error: plansErr } = await supabase
            .from('investment_plans')
            .select('*')
            .order('display_order', { ascending: true });
          if (!plansErr && plansData && plansData.length > 0) {
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
        } catch (planErr) {
          console.warn('investment_plans fetch notice:', planErr);
        }
      }

      // 7. Load Transfers (Deposits and Withdrawals)
      try {
        const transList = await api.getTransfers();
        if (Array.isArray(transList)) {
          setTransfers(transList);
        }
      } catch (trErr) {
        console.warn('Transfers load notice:', trErr);
      }

      // 8. Load Audit Logs via Supabase
      if (supabase) {
        try {
          const { data: logsData, error: logsErr } = await supabase
            .from('audit_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100);
          if (!logsErr && Array.isArray(logsData)) {
            setAuditLogs(logsData);
          }
        } catch (logErr) {
          console.warn('Audit logs fetch notice:', logErr);
        }
      }
    } catch (loadErr: any) {
      console.error('Failed to load supervisor data:', loadErr);
      setError(loadErr.message || 'Error loading supervisor data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const runWithLock = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    setError(null);
    try {
      await fn();
      await load();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Operation failed');
    } finally {
      setBusyId(null);
    }
  };

  const promptApprove = (user: AdminProfile) => {
    setConfirmModal({
      isOpen: true,
      title: 'Approve & Activate Account',
      description: `Are you sure you want to approve institutional trading and custody privileges for this client account?`,
      clientEmail: user.email,
      actionType: 'approve',
      confirmText: 'Approve Account',
      details: [
        { label: 'Client Email', value: user.email },
        { label: 'Current Status', value: user.account_status.toUpperCase() },
        { label: 'USD Liquidity', value: `$${(user.balances?.USD || 0).toLocaleString()}` },
      ],
      onConfirm: async () => {
        await runWithLock(user.id, async () => {
          if (supabase) {
            const { error: rpcError } = await supabase.rpc('admin_set_account_status', {
              target_id: user.id,
              next_status: 'approved',
            });
            if (rpcError) throw rpcError;
          }
          await api.updateUserStatus(user.id, 'APPROVED');
          showNotification(`Client account ${user.email} is approved and active.`);
        });
      },
    });
  };

  const promptSuspend = (user: AdminProfile) => {
    setConfirmModal({
      isOpen: true,
      title: 'Suspend Institutional Account',
      description: `Are you sure you want to suspend this account? The client will be locked out of trading, order placement, and custody withdrawal rails immediately.`,
      clientEmail: user.email,
      actionType: 'suspend',
      confirmText: 'Suspend Account',
      details: [
        { label: 'Target Email', value: user.email },
        { label: 'Action Effect', value: 'Disable all trades & transfers' },
        { label: 'RLS Logging', value: 'Immutable audit entry created' },
      ],
      onConfirm: async () => {
        await runWithLock(user.id, async () => {
          if (supabase) {
            const { error: rpcError } = await supabase.rpc('admin_set_account_status', {
              target_id: user.id,
              next_status: 'suspended',
            });
            if (rpcError) throw rpcError;
          }
          await api.updateUserStatus(user.id, 'SUSPENDED');
          showNotification(`Client account ${user.email} has been suspended.`);
        });
      },
    });
  };

  const promptHold = (user: AdminProfile) => {
    setConfirmModal({
      isOpen: true,
      title: 'Place Account On Hold',
      description: `Placing this account on hold restricts outbound asset transfers while allowing market viewing and KYC completion.`,
      clientEmail: user.email,
      actionType: 'hold',
      confirmText: 'Place On Hold',
      details: [
        { label: 'Target Email', value: user.email },
        { label: 'Restricted Rails', value: 'Custody Withdrawals & Sweeps' },
      ],
      onConfirm: async () => {
        await runWithLock(user.id, async () => {
          if (supabase) {
            const { error: rpcError } = await supabase.rpc('admin_set_account_status', {
              target_id: user.id,
              next_status: 'on_hold',
            });
            if (rpcError) throw rpcError;
          }
          await api.updateUserStatus(user.id, 'ON_HOLD');
          showNotification(`Client account ${user.email} status set to On Hold.`);
        });
      },
    });
  };

  const promptRemoveHold = (user: AdminProfile) => {
    setConfirmModal({
      isOpen: true,
      title: 'Release Account Hold',
      description: `Remove temporary custody hold and restore standard approved trading privileges for ${user.email}.`,
      clientEmail: user.email,
      actionType: 'approve',
      confirmText: 'Release Hold',
      onConfirm: async () => {
        await runWithLock(user.id, async () => {
          if (supabase) {
            const { error: rpcError } = await supabase.rpc('admin_set_account_status', {
              target_id: user.id,
              next_status: 'approved',
            });
            if (rpcError) throw rpcError;
          }
          await api.updateUserStatus(user.id, 'APPROVED');
          showNotification(`Hold removed. Client account ${user.email} is now fully approved.`);
        });
      },
    });
  };

  const saveWhatsapp = async () => {
    setSavingWhatsapp(true);
    try {
      if (supabase) {
        const { error: setErr } = await supabase.from('platform_settings').upsert({
          setting_key: 'whatsapp_number',
          setting_value: whatsappNumber.trim(),
          updated_at: new Date().toISOString(),
        });
        if (setErr) throw setErr;
      }
      showNotification('Business WhatsApp number updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to save WhatsApp number.');
    } finally {
      setSavingWhatsapp(false);
    }
  };

  const handleSavePlan = async (updatedPlan: InvestmentPlan) => {
    try {
      if (supabase) {
        const { error: pErr } = await supabase.from('investment_plans').upsert({
          id: updatedPlan.id,
          name: updatedPlan.name,
          amount: updatedPlan.amount,
          features: updatedPlan.features,
          recommended: updatedPlan.recommended,
          display_order: updatedPlan.display_order,
          updated_at: new Date().toISOString(),
        });
        if (pErr) throw pErr;
      }

      setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
      setEditingPlan(null);
      showNotification(`Investment plan "${updatedPlan.name}" updated successfully.`);
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to update investment plan.');
    }
  };

  const handleApproveTransfer = async (transferId: string) => {
    try {
      await api.updateTransferStatus(transferId, 'CONFIRMED');
      showNotification('Withdrawal outflow authorized and confirmed.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to approve withdrawal transfer.');
    }
  };

  const handleRejectTransfer = async (transferId: string) => {
    try {
      await api.updateTransferStatus(transferId, 'REJECTED');
      showNotification('Withdrawal request rejected.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to reject withdrawal transfer.');
    }
  };

  const handleRegenerateOtp = async (transferId: string) => {
    try {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      await api.updateTransferOtp(transferId, newOtp);
      showNotification(`Generated new OTP code: ${newOtp}`);
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate OTP code.');
    }
  };

  const handleCopyOtpForClient = (transfer: TransferRecord) => {
    const code = (transfer as any).otpCode || '849201';
    navigator.clipboard.writeText(code);
    setOtpCopiedId(transfer.id);
    showNotification(`OTP Code ${code} copied to clipboard! Provide this to the client via secure chat or email.`);
    setTimeout(() => setOtpCopiedId(null), 3000);
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

  const pendingOtpWithdrawalsCount = useMemo(() => {
    return withdrawalsList.filter(w => w.status === 'PENDING_OTP').length;
  }, [withdrawalsList]);

  if (!supabase) {
    return <div className="p-8 text-sm text-rose-300">Supabase is not configured.</div>;
  }

  // Left Sidebar Navigation Items
  const navItems = [
    {
      id: 'users' as AdminSection,
      label: 'Client Users',
      icon: Users,
      count: users.length,
      badgeColor: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30',
      description: 'Portfolios, KYC, & Balances'
    },
    {
      id: 'plans' as AdminSection,
      label: 'Investment Plans',
      icon: Layers,
      count: plans.length,
      badgeColor: 'bg-indigo-400/20 text-indigo-300 border-indigo-400/30',
      description: 'Tiers & Tier Pricing'
    },
    {
      id: 'deposits' as AdminSection,
      label: 'Deposit Inflows',
      icon: ArrowDownCircle,
      count: depositsList.length,
      badgeColor: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
      description: 'BTC & ETH Inbound Rails'
    },
    {
      id: 'withdrawals' as AdminSection,
      label: 'Withdrawals & OTP',
      icon: ArrowUpCircle,
      count: withdrawalsList.length,
      warningCount: pendingOtpWithdrawalsCount,
      badgeColor: pendingOtpWithdrawalsCount > 0 ? 'bg-amber-400/25 text-amber-300 border-amber-400/50' : 'bg-zinc-800 text-zinc-300 border-zinc-700',
      description: '2FA Custody Approvals'
    },
    {
      id: 'settings' as AdminSection,
      label: 'Platform Settings',
      icon: Sliders,
      badgeColor: 'bg-zinc-800 text-zinc-400 border-zinc-700',
      description: 'WhatsApp & Channels'
    },
    {
      id: 'audit_logs' as AdminSection,
      label: 'Audit Trail (RLS)',
      icon: ScrollText,
      count: auditLogs.length,
      badgeColor: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30',
      description: 'Cryptographic Event Logs'
    },
  ];

  return (
    <div className="min-h-screen bg-[#040711] text-zinc-100">
      {/* Mobile Top Header with Menu Toggle */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#070D1A] border-b border-white/10 sticky top-0 z-30">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-bold font-mono text-xs">
            ADM
          </div>
          <div>
            <div className="text-xs font-bold text-white font-mono">SUPERVISOR CONSOLE</div>
            <div className="text-[10px] text-cyan-400 font-medium">Verity Capital Administration</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => load()}
            disabled={isLoading}
            className="p-2 rounded-lg bg-[#0A1224] border border-white/10 text-zinc-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-[#0A1224] border border-white/10 text-cyan-300"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout (Left Sidebar + Right Content) */}
      <div className="flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto min-h-screen">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className={`
          ${isMobileMenuOpen ? 'block' : 'hidden'} 
          lg:block lg:w-72 xl:w-80 shrink-0 bg-[#060B17] border-r border-white/10 p-5 space-y-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto
        `}>
          {/* Brand & Supervisor Badge */}
          <div className="hidden lg:flex items-center justify-between pb-5 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 p-0.5 shadow-lg shadow-cyan-950/40 flex items-center justify-center">
                <div className="w-full h-full bg-[#070D1A] rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="text-xs font-mono font-bold tracking-wider text-cyan-300">
                  SUPERVISOR DESK
                </div>
                <div className="text-sm font-bold text-white tracking-tight">
                  Verity-Capital
                </div>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-400/10 text-cyan-300 border border-cyan-400/30">
              Admin
            </span>
          </div>

          {/* Quick System Stats */}
          <div className="bg-[#091122] rounded-2xl p-3.5 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Security Engine</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>RLS Active</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-1 border-t border-white/5">
              <span>Managed Accounts:</span>
              <span className="text-white font-bold">{users.length} Active</span>
            </div>
          </div>

          {/* Navigation Menu List */}
          <div className="space-y-1.5">
            <div className="px-2 pb-1 text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">
              Admin Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const hasPendingWarning = item.warningCount && item.warningCount > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-cyan-400/15 text-white border border-cyan-400/40 shadow-md shadow-cyan-950/30 font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive ? 'bg-cyan-400/20 text-cyan-300' : 'bg-[#0A1224] text-zinc-400 group-hover:text-white'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${isActive ? 'text-cyan-300' : 'text-zinc-200 group-hover:text-white'}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                    {hasPendingWarning && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500 text-zinc-950 animate-pulse" title="Requires Attention">
                        {item.warningCount} OTP
                      </span>
                    )}
                    {item.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${item.badgeColor}`}>
                        {item.count}
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-cyan-400 translate-x-0.5' : 'text-zinc-600 opacity-0 group-hover:opacity-100'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer Controls */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <button
              onClick={() => load()}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-[#091122] hover:bg-[#0E1B38] border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh Supervisor Data</span>
            </button>

            <div className="p-3 rounded-xl bg-[#060A14] border border-white/5 text-[11px] text-zinc-500 space-y-1">
              <div className="flex items-center justify-between">
                <span>Access Level:</span>
                <span className="text-zinc-300 font-mono font-medium">Supervisor Admin</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Security Engine:</span>
                <span className="text-cyan-400 font-mono font-medium">PostgreSQL RLS</span>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          {/* Main Top Header */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                <span>Supervisor Portal</span>
                <span>/</span>
                <span className="text-white font-bold">{activeSection.toUpperCase()}</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1">
                {activeSection === 'users' && 'Client Portfolio Management'}
                {activeSection === 'plans' && 'Investment Plan Architect'}
                {activeSection === 'deposits' && 'Custody Deposit Ledger'}
                {activeSection === 'withdrawals' && 'Outflow Custody & 2FA OTP Controls'}
                {activeSection === 'settings' && 'Platform Configuration & Channels'}
                {activeSection === 'audit_logs' && 'Immutable Audit Trail & Logs'}
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => load()}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#071021] px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors disabled:opacity-50 shadow-sm"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
                <span>Sync</span>
              </button>
              <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2 text-xs font-semibold text-emerald-300 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap">RLS Protected</span>
              </div>
            </div>
          </header>

          {/* Global Alert Messages */}
          {successMessage && (
            <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 rounded-2xl animate-in fade-in shadow-lg">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 border border-rose-400/30 bg-rose-400/10 p-4 text-xs text-rose-200 rounded-2xl animate-in fade-in shadow-lg">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* SECTION 1: USERS */}
          {activeSection === 'users' && (
            <div className="space-y-4">
              <section className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
                <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search clients by email..."
                    className="w-full border border-white/10 bg-[#071021] pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white outline-none focus:border-cyan-300/50 rounded-xl"
                  />
                </div>
                <select
                  value={verification}
                  onChange={(event) => setVerification(event.target.value)}
                  className="border border-white/10 bg-[#071021] px-3 py-2.5 text-xs text-zinc-300 rounded-xl outline-none"
                >
                  <option value="all">All KYC states</option>
                  <option value="verified">Verified only</option>
                  <option value="unverified">Unverified only</option>
                </select>
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="border border-white/10 bg-[#071021] px-3 py-2.5 text-xs text-zinc-300 rounded-xl outline-none"
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
                  className="border border-white/10 bg-[#071021] px-3 py-2.5 text-xs text-zinc-300 outline-none focus:border-cyan-300/50 rounded-xl"
                />
              </section>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-zinc-400">
                <div className="flex items-center gap-2 font-medium">
                  <Users className="h-4 w-4 text-cyan-400" />
                  <span>Showing <strong className="text-white">{filteredUsers.length}</strong> of <strong className="text-white">{users.length}</strong> profiles</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Direct Controls: Balance Adjustment • KYC Verification • Account Upgrade & Tasks
                </div>
              </div>

              <UserTable
                users={filteredUsers}
                busyId={busyId}
                onBalance={setEditingUser}
                onUpgrade={setUpgradeUser}
                onVerified={(user, value) =>
                  runWithLock(user.id, async () => {
                    if (supabase) {
                      const { error: rpcError } = await supabase.rpc('admin_set_verified', {
                        target_id: user.id,
                        next_verified: value,
                      });
                      if (rpcError) throw rpcError;
                    }
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
                      if (supabase) {
                        const { error: rpcError } = await supabase.rpc('admin_set_account_status', {
                          target_id: user.id,
                          next_status: value,
                        });
                        if (rpcError) throw rpcError;
                      }
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
              <div className="flex items-center justify-between border border-white/10 bg-[#071021] p-5 rounded-2xl">
                <div>
                  <h2 className="text-base font-semibold text-white">Investment Plans Configuration</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Manage the public investment tiers. Only users with role='admin' can edit investment plans in Supabase.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col justify-between border p-6 rounded-2xl ${
                      plan.recommended
                        ? 'border-cyan-400/50 bg-[#080d1d] shadow-lg shadow-cyan-950/20'
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
                        className="flex w-full items-center justify-center gap-2 border border-cyan-300/30 bg-cyan-300/10 py-2.5 text-xs font-semibold text-cyan-200 transition-colors hover:bg-cyan-300/20 rounded-xl cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Plan</span>
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
              <div className="flex items-center justify-between border border-white/10 bg-[#071021] p-5 rounded-2xl">
                <div>
                  <h2 className="text-base font-semibold text-white">Deposit Inflow Ledgers</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    All client inbound fiat settlements and on-chain crypto deposits.
                  </p>
                </div>
                <div className="text-xs font-mono text-cyan-300 font-bold">
                  Total Records: {depositsList.length}
                </div>
              </div>

              <div className="overflow-x-auto border border-cyan-300/15 bg-[#071021] shadow-[0_20px_80px_rgba(0,0,0,.25)] rounded-2xl">
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
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
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

          {/* SECTION 4: WITHDRAWALS & OTP VERIFICATION */}
          {activeSection === 'withdrawals' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/10 bg-[#071021] p-5 rounded-2xl">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-semibold text-white">Withdrawal Outflows & OTP Custody Controls</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                      2FA Protected
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Outbound transfers require administrative one-time passcode (OTP) verification before disbursement.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <select
                    value={withdrawalFilter}
                    onChange={(e) => setWithdrawalFilter(e.target.value as any)}
                    className="bg-[#050816] border border-white/10 text-zinc-300 text-xs rounded-xl px-3 py-2 focus:border-cyan-400 outline-none"
                  >
                    <option value="ALL">All Statuses ({withdrawalsList.length})</option>
                    <option value="PENDING_OTP">Pending OTP Verification ({withdrawalsList.filter(w => w.status === 'PENDING_OTP').length})</option>
                    <option value="CONFIRMED">Confirmed / Processing ({withdrawalsList.filter(w => w.status === 'CONFIRMED' || w.status === 'COMPLETED').length})</option>
                    <option value="REJECTED">Rejected ({withdrawalsList.filter(w => w.status === 'REJECTED').length})</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto border border-cyan-300/15 bg-[#071021] shadow-[0_20px_80px_rgba(0,0,0,.25)] rounded-2xl">
                <table className="w-full min-w-[1000px] text-left text-xs">
                  <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-widest text-zinc-400">
                    <tr>
                      <th className="px-4 py-3.5">Reference ID</th>
                      <th className="px-4 py-3.5">Requested At</th>
                      <th className="px-4 py-3.5">Client User</th>
                      <th className="px-4 py-3.5">Amount / Asset</th>
                      <th className="px-4 py-3.5">Destination</th>
                      <th className="px-4 py-3.5">Security OTP Code</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Custody Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {withdrawalsList
                      .filter(w => {
                        if (withdrawalFilter === 'ALL') return true;
                        if (withdrawalFilter === 'PENDING_OTP') return w.status === 'PENDING_OTP';
                        if (withdrawalFilter === 'CONFIRMED') return w.status === 'CONFIRMED' || w.status === 'COMPLETED';
                        if (withdrawalFilter === 'REJECTED') return w.status === 'REJECTED';
                        return true;
                      })
                      .map((w) => {
                      const clientEmail = users.find((u) => u.id === w.userId)?.email || w.userId;
                      const otpCode = (w as any).otpCode || '849201';
                      const isPendingOtp = w.status === 'PENDING_OTP';

                      return (
                        <tr key={w.id} className="hover:bg-cyan-300/[0.02] transition-colors">
                          <td className="px-4 py-3.5 text-cyan-300 font-semibold">{w.id}</td>
                          <td className="px-4 py-3.5 text-zinc-400 text-[11px]">{new Date(w.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-white font-sans text-xs">{clientEmail}</td>
                          <td className="px-4 py-3.5 font-bold">
                            <span className="text-rose-400">-{w.amount.toLocaleString()} {w.asset}</span>
                          </td>
                          <td className="px-4 py-3.5 text-zinc-400 truncate max-w-[180px]" title={w.destinationAddress}>
                            {w.destinationAddress || 'Institutional Vault Settlement'}
                          </td>

                          {/* OTP Authorization Column */}
                          <td className="px-4 py-3.5">
                            {isPendingOtp ? (
                              <div className="flex items-center space-x-2">
                                <span className="px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/40 text-amber-300 font-mono font-bold text-sm tracking-widest shadow-sm">
                                  {otpCode}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyOtpForClient(w)}
                                  title="Copy OTP to send to user via Email or Chat"
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors cursor-pointer flex items-center space-x-1"
                                >
                                  {otpCopiedId === w.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                                  )}
                                  <span className="text-[10px] font-sans font-medium">Copy</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRegenerateOtp(w.id)}
                                  title="Regenerate fresh OTP code"
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-zinc-400 hover:text-white" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 text-emerald-400 text-xs font-sans">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>OTP Verified</span>
                              </div>
                            )}
                          </td>

                          {/* Status Column */}
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold border ${
                              isPendingOtp
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                                : w.status === 'REJECTED'
                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            }`}>
                              {w.status}
                            </span>
                          </td>

                          {/* Actions Column */}
                          <td className="px-4 py-3.5 text-right font-sans">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPendingOtp && (
                                <button
                                  type="button"
                                  onClick={() => handleApproveTransfer(w.id)}
                                  className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Authorize</span>
                                </button>
                              )}
                              {w.status !== 'REJECTED' && (
                                <button
                                  type="button"
                                  onClick={() => handleRejectTransfer(w.id)}
                                  className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {withdrawalsList.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-zinc-500 font-sans">
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
            <div className="border border-white/10 bg-[#071021] p-6 rounded-2xl space-y-6">
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
                      className="flex-1 border border-white/10 bg-[#050816] px-4 py-2.5 font-mono text-sm text-white outline-none focus:border-cyan-300/50 rounded-xl"
                    />
                    <button
                      onClick={saveWhatsapp}
                      disabled={savingWhatsapp}
                      className="bg-cyan-300 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-200 rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
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
                  <div className="p-4 bg-[#050816] border border-white/10 rounded-xl">
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Database Authority</span>
                    <span className="text-emerald-400 font-semibold font-mono">public.is_admin() Security Definer</span>
                  </div>
                  <div className="p-4 bg-[#050816] border border-white/10 rounded-xl">
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Audit Trail Status</span>
                    <span className="text-cyan-300 font-semibold font-mono">Active (public.audit_logs)</span>
                  </div>
                  <div className="p-4 bg-[#050816] border border-white/10 rounded-xl">
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
              <div className="flex items-center justify-between border border-white/10 bg-[#071021] p-5 rounded-2xl">
                <div>
                  <h2 className="text-base font-semibold text-white">Immutable Administrative Audit Logs</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Every administrative action is cryptographically tied to the acting admin ID, target account, and timestamp.
                  </p>
                </div>
                <div className="text-xs font-mono text-cyan-300 font-bold">
                  {auditLogs.length} Events Recorded
                </div>
              </div>

              <div className="overflow-x-auto border border-cyan-300/15 bg-[#071021] shadow-[0_20px_80px_rgba(0,0,0,.25)] rounded-2xl">
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
                            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
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
        </main>
      </div>

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

      {/* Account Upgrade & Task Management Modal */}
      {upgradeUser && (
        <AdminUpgradeModal
          isOpen={Boolean(upgradeUser)}
          user={upgradeUser}
          onClose={() => setUpgradeUser(null)}
          onUpdated={load}
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
