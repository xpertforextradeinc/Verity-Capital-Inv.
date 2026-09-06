import React from 'react';
import { Edit3, CheckCircle2, Ban, PauseCircle, PlayCircle, ShieldCheck } from 'lucide-react';
import { AccountStatusDropdown, AccountStatus } from './AccountStatusDropdown.tsx';
import { VerifyToggle } from './VerifyToggle.tsx';
import { AdminCurrency } from './EditBalanceModal.tsx';

export interface AdminProfile {
  id: string;
  email: string;
  verified: boolean;
  account_status: AccountStatus;
  balances: Record<string, number>;
  country: string | null;
  created_at: string;
  last_sign_in?: string | null;
}

interface UserTableProps {
  users: AdminProfile[];
  busyId?: string | null;
  onBalance: (user: AdminProfile) => void;
  onVerified: (user: AdminProfile, value: boolean) => void;
  onStatus: (user: AdminProfile, value: AccountStatus) => void;
  onPromptApprove: (user: AdminProfile) => void;
  onPromptSuspend: (user: AdminProfile) => void;
  onPromptHold: (user: AdminProfile) => void;
  onPromptRemoveHold: (user: AdminProfile) => void;
}

const currencies: AdminCurrency[] = ['USD', 'EUR', 'GBP', 'NGN', 'BTC', 'ETH'];

export const UserTable: React.FC<UserTableProps> = ({
  users,
  busyId,
  onBalance,
  onVerified,
  onStatus,
  onPromptApprove,
  onPromptSuspend,
  onPromptHold,
  onPromptRemoveHold,
}) => (
  <div className="overflow-x-auto border border-cyan-300/15 bg-[#071021] shadow-[0_20px_80px_rgba(0,0,0,.25)] rounded-lg">
    <table className="w-full min-w-[1150px] text-left text-xs">
      <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-widest text-zinc-400">
        <tr>
          <th className="px-4 py-4">Client Identity</th>
          <th className="px-4 py-4">Registered / Activity</th>
          <th className="px-4 py-4">Region</th>
          <th className="px-4 py-4">Portfolio Balances</th>
          <th className="px-4 py-4">KYC / Verified</th>
          <th className="px-4 py-4">Account Status</th>
          <th className="px-4 py-4 text-right">Administrative Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {users.map((user) => {
          const status = (user.account_status || 'pending').toLowerCase();
          const isBusy = busyId === user.id;

          return (
            <tr key={user.id} className="hover:bg-cyan-300/[0.03] transition-colors">
              <td className="px-4 py-4">
                <div className="font-medium text-white text-sm">{user.email}</div>
                <div className="mt-0.5 font-mono text-[10px] text-zinc-500">ID: {user.id}</div>
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
                <VerifyToggle
                  verified={user.verified}
                  disabled={isBusy}
                  onChange={(value) => onVerified(user, value)}
                />
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
    {users.length === 0 && (
      <div className="p-12 text-center text-sm text-zinc-500">
        No accounts match the current filter criteria.
      </div>
    )}
  </div>
);

