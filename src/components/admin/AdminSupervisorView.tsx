import React, { useEffect, useMemo, useState } from 'react';
import { Search, ShieldCheck, Users } from 'lucide-react';
import { supabase } from '../../services/supabase.ts';
import { AccountStatus } from './AccountStatusDropdown.tsx';
import { AdminCurrency, EditBalanceModal } from './EditBalanceModal.tsx';
import { AdminProfile, UserTable } from './UserTable.tsx';

export const AdminSupervisorView: React.FC = () => {
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [verification, setVerification] = useState('all');
  const [minimumBalance, setMinimumBalance] = useState('');
  const [editing, setEditing] = useState<AdminProfile | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!supabase) { setError('Supabase is not configured.'); return; }
    const { data, error: loadError } = await supabase.rpc('admin_list_users');
    if (loadError) setError(loadError.message); else setUsers((data || []) as AdminProfile[]);
  };
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => users.filter((user) => {
    const minimum = Number(minimumBalance) || 0;
    const usd = Number(user.balances?.USD || 0);
    return user.email.toLowerCase().includes(query.toLowerCase()) && (!country || user.country === country) && (verification === 'all' || (verification === 'verified' ? user.verified : !user.verified)) && usd >= minimum;
  }), [users, query, country, verification, minimumBalance]);
  const countries = [...new Set(users.map((user) => user.country).filter(Boolean))] as string[];
  const run = async (user: AdminProfile, action: () => Promise<unknown>) => { setBusyId(user.id); setError(null); try { await action(); await load(); } catch (err: any) { setError(err.message || 'Admin action failed.'); } finally { setBusyId(null); } };

  if (!supabase) return <div className="p-8 text-sm text-rose-300">Supabase is not configured.</div>;
  return <div className="space-y-6"><header className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end"><div><p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-300">Supervisor console</p><h1 className="mt-2 text-3xl font-semibold text-white">Institutional client administration</h1><p className="mt-2 text-sm text-zinc-400">Manage verified access, balances, and account status with an auditable control surface.</p></div><div className="flex items-center gap-2 text-xs text-emerald-300"><ShieldCheck className="h-4 w-4" /> RLS-protected controls</div></header><section className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_1fr]"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by email" className="w-full border border-white/10 bg-[#071021] px-10 py-3 text-sm text-white outline-none focus:border-cyan-300/50" /></div><select value={verification} onChange={(event) => setVerification(event.target.value)} className="border border-white/10 bg-[#071021] px-3 py-3 text-sm text-zinc-300"><option value="all">All verification states</option><option value="verified">Verified only</option><option value="unverified">Unverified only</option></select><select value={country} onChange={(event) => setCountry(event.target.value)} className="border border-white/10 bg-[#071021] px-3 py-3 text-sm text-zinc-300"><option value="">All countries</option>{countries.map((item) => <option key={item}>{item}</option>)}</select><input value={minimumBalance} onChange={(event) => setMinimumBalance(event.target.value)} type="number" placeholder="Min USD balance" className="border border-white/10 bg-[#071021] px-3 py-3 text-sm text-zinc-300 outline-none focus:border-cyan-300/50" /></section>{error && <div className="border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</div>}<div className="flex items-center gap-3 text-xs text-zinc-500"><Users className="h-4 w-4 text-cyan-300" /> Showing {filtered.length} of {users.length} profiles</div><UserTable users={filtered} busyId={busyId} onBalance={setEditing} onVerified={(user, value) => run(user, async () => { const { error: rpcError } = await supabase.rpc('admin_set_verified', { target_id: user.id, next_verified: value }); if (rpcError) throw rpcError; })} onStatus={(user, value: AccountStatus) => run(user, async () => { const { error: rpcError } = await supabase.rpc('admin_set_account_status', { target_id: user.id, next_status: value }); if (rpcError) throw rpcError; })} />{editing && <EditBalanceModal email={editing.email} onClose={() => setEditing(null)} onSubmit={async (currency: AdminCurrency, delta: number) => { const { error: rpcError } = await supabase.rpc('admin_adjust_balance', { target_id: editing.id, currency_code: currency, delta }); if (rpcError) throw rpcError; await load(); }} />}</div>;
};
