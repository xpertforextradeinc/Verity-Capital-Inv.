import React, { useState } from 'react';
import { Edit3, CheckCircle2, Ban, PauseCircle, PlayCircle, ShieldCheck, Award, Sparkles, Clock } from 'lucide-react';
import { AccountStatusDropdown, AccountStatus } from './AccountStatusDropdown.tsx';
import { VerifyToggle } from './VerifyToggle.tsx';
import { AdminCurrency } from './EditBalanceModal.tsx';
import { ClientProfileModal } from './ClientProfileModal.tsx';

export interface AdminProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  verified: boolean;
  account_status: AccountStatus;
  balances: Record<string, number>;
  country: string | null;
  created_at: string;
  last_sign_in?: string | null;
  isUpgraded?: boolean;
  upgradeStatus?: 'NOT_REQUESTED' | 'TASK_REQUIRED' | 'TASK_SUBMITTED' | 'UPGRADED';
  upgradeTier?: string;
  upgradeTask?: {
    id: string;
    title: string;
    description: string;
    status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    submissionNote?: string;
    submittedAt?: string;
    completedAt?: string;
  };
}

interface UserTableProps {
  users: AdminProfile[];
  busyId?: string | null;
  onBalance: (user: AdminProfile) => void;
  onUpgrade?: (user: AdminProfile) => void;
  onVerified: (user: AdminProfile, value: boolean) => void;
  onStatus: (user: AdminProfile, value: AccountStatus) => void;
  onPromptApprove: (user: AdminProfile) => void;
  onPromptSuspend: (user: AdminProfile) => void;
  onPromptHold: (user: AdminProfile) => void;
  onPromptRemoveHold: (user: AdminProfile) => void;
}

const currencies: AdminCurrency[] = ['USD', 'EUR', 'GBP', 'NGN', 'BTC', 'ETH'];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
    case 'active':
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    case 'suspended':
      return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
    case 'on_hold':
    case 'restricted':
      return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    default:
      return 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30';
  }
};

export const UserTable: React.FC<UserTableProps> = ({
  users,
  busyId,
  onBalance,
  onUpgrade,
  onVerified,
  onStatus,
  onPromptApprove,
  onPromptSuspend,
  onPromptHold,
  onPromptRemoveHold,
}) => {
  const [selectedProfile, setSelectedProfile] = useState<AdminProfile | null>(null);

  return (
    <div className="space-y-3">
  
      <ClientProfileModal user={selectedProfile} onClose={() => setSelectedProfile(null)} />

    {/* MOBILE VIEW: Responsive Cards (<768px) */}
    <div className="space-y-3 block md:hidden">
      {users.map((user) => {
        const status = (user.account_status || 'pending').toLowerCase();
        const isBusy = busyId === user.id;
        const upgradeStatus = user.upgradeStatus || (user.isUpgraded ? 'UPGRADED' : 'NOT_REQUESTED');

        return (
          <div
            key={user.id}
            className="border border-white/10 bg-[#071021] rounded-xl p-4 space-y-3 shadow-lg"
          >
            {/* Top row: Email + Status badge */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-white text-sm truncate flex items-center space-x-1.5">
                  <button onClick={() => setSelectedProfile(user)} className="truncate hover:text-cyan-400 hover:underline transition-colors text-left">{user.email}</button>
                  {user.isUpgraded && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 flex items-center space-x-0.5 shrink-0">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>PRO</span>
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 truncate">ID: {user.id}</div>
              </div>
              <div className="flex items-center space-x-1.5 shrink-0">
                {upgradeStatus === 'TASK_SUBMITTED' && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse flex items-center space-x-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Task Ready</span>
                  </span>
                )}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border ${getStatusBadge(status)}`}>
                  {status}
                </span>
              </div>
            </div>

            {/* Registration, Region & Activity info */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/5">
              <div>
                <span className="text-zinc-500 block text-[10px]">Registered</span>
                <span className="text-zinc-300 font-mono">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Region</span>
                <span className="text-zinc-300">{user.country || 'International'}</span>
              </div>
            </div>

            {/* Portfolio Balances Box */}
            <div className="bg-[#050b17] border border-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">USD Balance</span>
                <span className="text-sm font-bold text-cyan-300 font-mono">
                  ${Number(user.balances?.USD || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono text-zinc-400 pt-1 border-t border-white/5">
                <span>BTC: <b className="text-zinc-200">{Number(user.balances?.BTC || 0).toFixed(4)}</b></span>
                <span>ETH: <b className="text-zinc-200">{Number(user.balances?.ETH || 0).toFixed(4)}</b></span>
                <span>EUR: <b className="text-zinc-200">{Number(user.balances?.EUR || 0).toLocaleString()}</b></span>
              </div>
            </div>

            {/* Verification & Status Selectors */}
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400 font-medium">KYC:</span>
                <VerifyToggle
                  verified={user.verified}
                  disabled={isBusy}
                  onChange={(value) => onVerified(user, value)}
                />
              </div>
              <div className="w-36">
                <AccountStatusDropdown
                  value={user.account_status}
                  disabled={isBusy}
                  onChange={(value) => onStatus(user, value)}
                />
              </div>
            </div>

            {/* Quick Action Touch Targets */}
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/10">
              <button
                onClick={() => onBalance(user)}
                disabled={isBusy}
                className="flex items-center justify-center gap-1 min-h-[40px] py-1.5 px-2 rounded-lg bg-cyan-400/15 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/25 active:scale-95 text-[11px] font-semibold transition-all disabled:opacity-50"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Balance</span>
              </button>

              {onUpgrade && (
                <button
                  onClick={() => onUpgrade(user)}
                  disabled={isBusy}
                  className={`flex items-center justify-center gap-1 min-h-[40px] py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-50 ${
                    upgradeStatus === 'TASK_SUBMITTED'
                      ? 'bg-amber-500/25 border border-amber-500 text-amber-300 animate-pulse'
                      : user.isUpgraded
                      ? 'bg-amber-400/15 border border-amber-400/40 text-amber-300'
                      : 'bg-indigo-500/15 border border-indigo-500/40 text-indigo-300'
                  }`}
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>{upgradeStatus === 'TASK_SUBMITTED' ? 'Review' : 'Upgrade'}</span>
                </button>
              )}

              {status === 'suspended' ? (
                <button
                  onClick={() => onPromptRemoveHold(user)}
                  disabled={isBusy}
                  className="flex items-center justify-center gap-1 min-h-[40px] py-1.5 px-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 active:scale-95 text-[11px] font-semibold transition-all disabled:opacity-50"
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  <span>Lift</span>
                </button>
              ) : status === 'approved' || status === 'active' ? (
                <button
                  onClick={() => onPromptSuspend(user)}
                  disabled={isBusy}
                  className="flex items-center justify-center gap-1 min-h-[40px] py-1.5 px-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 active:scale-95 text-[11px] font-semibold transition-all disabled:opacity-50"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span>Suspend</span>
                </button>
              ) : (
                <button
                  onClick={() => onPromptApprove(user)}
                  disabled={isBusy}
                  className="flex items-center justify-center gap-1 min-h-[40px] py-1.5 px-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 active:scale-95 text-[11px] font-semibold transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Approve</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>

    {/* DESKTOP VIEW: Institutional Table (>=768px) */}
    <div className="hidden md:block overflow-x-auto border border-cyan-300/15 bg-[#071021] shadow-[0_20px_80px_rgba(0,0,0,.25)] rounded-lg">
      <table className="w-full min-w-[1150px] text-left text-xs">
        <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-widest text-zinc-400">
          <tr>
            <th className="px-4 py-4">Client Identity</th>
            <th className="px-4 py-4">Registered / Activity</th>
            <th className="px-4 py-4">Region</th>
            <th className="px-4 py-4">Portfolio Balances</th>
            <th className="px-4 py-4">KYC & Tier</th>
            <th className="px-4 py-4">Account Status</th>
            <th className="px-4 py-4 text-right">Administrative Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {users.map((user) => {
            const status = (user.account_status || 'pending').toLowerCase();
            const isBusy = busyId === user.id;
            const upgradeStatus = user.upgradeStatus || (user.isUpgraded ? 'UPGRADED' : 'NOT_REQUESTED');

            return (
              <tr key={user.id} className="hover:bg-cyan-300/[0.03] transition-colors">
                <td className="px-4 py-4">
                  <div className="font-medium text-white text-sm flex items-center space-x-1.5">
                    <button onClick={() => setSelectedProfile(user)} className="hover:text-cyan-400 hover:underline transition-colors text-left">{user.email}</button>
                    {user.isUpgraded && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 flex items-center space-x-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>PRO TIER</span>
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-zinc-500 flex items-center space-x-2">
                    <span>ID: {user.id}</span>
                    {upgradeStatus === 'TASK_SUBMITTED' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono font-bold border border-amber-500/30 animate-pulse">
                        ⚡ TASK SUBMITTED
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-4 font-mono text-zinc-400">
                  <div>{new Date(user.created_at).toLocaleDateString()}</div>
                  <span className="text-[10px] text-zinc-500">
                    {user.last_sign_in ? `Active: ${new Date(user.last_sign_in).toLocaleDateString()}` : 'Never signed in'}
                  </span>
                </td>

                <td className="px-4 py-4 text-zinc-300">
                  {user.country || 'International'}
                </td>

                <td className="px-4 py-4">
                  <div className="grid grid-cols-3 gap-x-3 gap-y-1 font-mono text-[10px]">
                    {currencies.map((currency) => (
                      <span key={currency} className="text-zinc-400">
                        {currency}: <b className="text-zinc-200">{Number(user.balances?.[currency] || 0).toLocaleString()}</b>
                      </span>
                    ))}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="space-y-1.5">
                    <VerifyToggle
                      verified={user.verified}
                      disabled={isBusy}
                      onChange={(value) => onVerified(user, value)}
                    />
                    <div className="text-[10px] font-mono">
                      {user.isUpgraded ? (
                        <span className="text-amber-400 font-semibold">Tier 3 (Institutional)</span>
                      ) : (
                        <span className="text-zinc-500">Tier 1 (Standard)</span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <AccountStatusDropdown
                    value={user.account_status}
                    disabled={isBusy}
                    onChange={(value) => onStatus(user, value)}
                  />
                </td>

                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    {/* Upgrade / Task button */}
                    {onUpgrade && (
                      <button
                        onClick={() => onUpgrade(user)}
                        disabled={isBusy}
                        title="Manage Account Upgrade & Task Requirements"
                        className={`flex items-center gap-1 rounded border px-2.5 py-1.5 text-[11px] font-semibold transition-colors disabled:opacity-50 ${
                          upgradeStatus === 'TASK_SUBMITTED'
                            ? 'border-amber-500 bg-amber-500/20 text-amber-300 animate-pulse hover:bg-amber-500/30'
                            : user.isUpgraded
                            ? 'border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'
                            : 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'
                        }`}
                      >
                        <Award className="h-3 w-3" />
                        <span>{upgradeStatus === 'TASK_SUBMITTED' ? 'Review Task' : 'Upgrade'}</span>
                      </button>
                    )}

                    {/* Approve button */}
                    {status !== 'approved' && status !== 'active' && (
                      <button
                        onClick={() => onPromptApprove(user)}
                        disabled={isBusy}
                        title="Approve client account"
                        className="flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Approve
                      </button>
                    )}

                    {/* Hold / Remove Hold */}
                    {status === 'on_hold' || status === 'restricted' ? (
                      <button
                        onClick={() => onPromptRemoveHold(user)}
                        disabled={isBusy}
                        title="Remove administrative hold"
                        className="flex items-center gap-1 rounded border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                      >
                        <PlayCircle className="h-3 w-3" />
                        Lift Hold
                      </button>
                    ) : status !== 'suspended' && (
                      <button
                        onClick={() => onPromptHold(user)}
                        disabled={isBusy}
                        title="Place account on administrative hold"
                        className="flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                      >
                        <PauseCircle className="h-3 w-3" />
                        Hold
                      </button>
                    )}

                    {/* Suspend button */}
                    {status !== 'suspended' && (
                      <button
                        onClick={() => onPromptSuspend(user)}
                        disabled={isBusy}
                        title="Suspend account"
                        className="flex items-center gap-1 rounded border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                      >
                        <Ban className="h-3 w-3" />
                        Suspend
                      </button>
                    )}

                    {/* Adjust Balance button */}
                    <button
                      onClick={() => onBalance(user)}
                      disabled={isBusy}
                      title="Add or deduct balances"
                      className="flex items-center gap-1.5 rounded border border-cyan-300/30 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-400/20 transition-colors disabled:opacity-50"
                    >
                      <Edit3 className="h-3 w-3" />
                      Balance
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {users.length === 0 && (
      <div className="p-8 text-center text-xs text-zinc-500 border border-white/5 bg-[#071021] rounded-xl">
        No client accounts found matching the current search filters.
      </div>
    )}
  </div>
  );
};
