import React, { useState } from 'react';
import {
  User as UserIcon,
  User2,
  Shield,
  Bell,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Key,
  Smartphone,
  Clock,
  Activity
} from 'lucide-react';
import { User } from '../../types.ts';
import { supabase } from '../../services/supabase.ts';

interface SettingsViewProps {
  user: User;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user }) => {
  const [riskTolerance, setRiskTolerance] = useState<'CONSERVATIVE' | 'BALANCED' | 'GROWTH' | 'SPECULATIVE'>('GROWTH');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [tradeConfirmations, setTradeConfirmations] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaUri, setMfaUri] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaMessage, setMfaMessage] = useState<string | null>(null);
  const [mfaBusy, setMfaBusy] = useState(false);

  React.useEffect(() => {
    if (!supabase) return;
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const factor = data?.totp?.find((item) => item.status === 'verified');
      setMfaFactorId(factor?.id || null);
    });
  }, []);

  const startMfaEnrollment = async () => {
    if (!supabase) {
      setMfaMessage('Configure Supabase before enabling MFA.');
      return;
    }
    setMfaBusy(true);
    setMfaMessage(null);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `${user.email} authenticator` });
      if (error) throw error;
      setMfaFactorId(data.id);
      setMfaUri(data.totp.uri);
      setMfaMessage('Scan the authenticator URI, then enter the six-digit code to verify.');
    } catch (error: any) {
      setMfaMessage(error.message || 'Unable to start MFA enrollment.');
    } finally {
      setMfaBusy(false);
    }
  };

  const verifyMfaEnrollment = async () => {
    if (!supabase || !mfaFactorId || !mfaCode) return;
    setMfaBusy(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
      if (challenge.error) throw challenge.error;
      const result = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challenge.data.id, code: mfaCode });
      if (result.error) throw result.error;
      setMfaUri(null);
      setMfaCode('');
      setMfaMessage('Multi-factor authentication is enabled for this account.');
    } catch (error: any) {
      setMfaMessage(error.message || 'The MFA code could not be verified.');
    } finally {
      setMfaBusy(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-5 shadow-xl">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <span>Account Settings & Paper Trading Preferences</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Manage demo profile information, risk tolerance models, and security options
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <User2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">Identity Profile</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
              Verified Tier
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Full Legal Name</label>
              <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-200 font-bold">
                {user.firstName} {user.lastName}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Date of Birth</label>
              <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-300 font-mono">
                {user.dateOfBirth || 'October 12, 1992'}
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Registered Institutional Email</label>
              <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-400 font-mono flex items-center justify-between">
                <span>{user.email}</span>
                <Shield className="w-3.5 h-3.5 text-emerald-500/50" />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white mb-1">Institutional Verification (Level 2)</p>
              <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                Your account is fully KYC/AML cleared for high-limit custody transfers and multi-node execution.
              </p>
            </div>
          </div>
        </div>

        {/* Active Session & Security Node */}
        <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">Security Node</h3>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Session</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Browser Intelligence</p>
                  <p className="text-[10px] text-zinc-500 font-mono">{navigator.userAgent.split(' ')[0]} / {navigator.platform}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-zinc-400 mb-1">Last Activity</p>
                <p className="text-[10px] text-emerald-400 font-black">JUST NOW</p>
              </div>
            </div>

            {/* Device History List */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Recent Secure Logins</p>
              {[
                { device: 'macOS / Chrome', ip: '192.168.1.1', time: '14 mins ago', status: 'Current' },
                { device: 'iPhone 15 Pro', ip: '172.20.10.4', time: '2 hours ago', status: 'Inactive' },
                { device: 'Windows Desktop', ip: '10.0.0.45', time: 'Yesterday', status: 'Inactive' },
              ].map((session, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-zinc-900/20 border border-zinc-800/50 flex items-center justify-between group hover:bg-zinc-900/40 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${session.status === 'Current' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`}></div>
                    <div>
                      <p className="text-[11px] font-bold text-zinc-300">{session.device}</p>
                      <p className="text-[9px] text-zinc-600 font-mono">{session.ip}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-zinc-500">{session.time}</p>
                    <p className="text-[8px] text-zinc-700 uppercase font-black">{session.status}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Network IP</span>
                  <Activity className="w-3 h-3 text-zinc-700" />
                </div>
                <p className="text-xs font-black text-zinc-300 font-mono tracking-tighter">192.168.1.1 (SECURE)</p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Login Time</span>
                  <Clock className="w-3 h-3 text-zinc-700" />
                </div>
                <p className="text-xs font-black text-zinc-300 font-mono tracking-tighter">
                  {new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date())}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button className="w-full py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all">
                Terminate Other Sessions
              </button>
            </div>
          </div>
        </div>

        {/* Risk Assessment Card */}
        <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Risk Model</h3>
          </div>

          <p className="text-xs text-zinc-400">
            Select your portfolio risk profile to adapt AI insight alerts and commentary.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            {[
              { id: 'CONSERVATIVE', label: 'Conservative', desc: 'Focus on index stability and low volatility.' },
              { id: 'BALANCED', label: 'Balanced', desc: 'Equities & bonds balanced exposure.' },
              { id: 'GROWTH', label: 'Growth', desc: 'Higher allocation to tech and momentum stocks.' },
              { id: 'SPECULATIVE', label: 'Speculative', desc: 'Crypto assets and active volatility.' },
            ].map((m) => (
              <div
                key={m.id}
                onClick={() => setRiskTolerance(m.id as any)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  riskTolerance === m.id
                    ? 'bg-zinc-800 border-emerald-500 text-white shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="font-bold">{m.label}</div>
                <div className="text-[11px] mt-1 leading-snug text-zinc-400">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Notifications */}
        <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800">
            <Bell className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Notifications & Alerts</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
              <div>
                <span className="font-medium text-white block">Execution Alerts</span>
                <span className="text-[11px] text-zinc-400">Receive in-app alerts whenever limit orders are filled.</span>
              </div>
              <input
                type="checkbox"
                checked={tradeConfirmations}
                onChange={(e) => setTradeConfirmations(e.target.checked)}
                className="w-4 h-4 text-emerald-500 rounded bg-zinc-800 border-zinc-700 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
              <div>
                <span className="font-medium text-white block">AI Market Briefing Updates</span>
                <span className="text-[11px] text-zinc-400">Receive alerts when new educational macro commentary is published.</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-emerald-500 rounded bg-zinc-800 border-zinc-700 focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>

        <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800">
            <Key className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Multi-factor Authentication</h3>
          </div>
          <p className="text-xs text-zinc-400">Protect sign-ins with a time-based authenticator factor managed by Supabase Auth.</p>
          {mfaMessage && <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">{mfaMessage}</div>}
          {mfaFactorId && !mfaUri ? (
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Authenticator verified</span>
              <span className="font-mono text-zinc-500">TOTP</span>
            </div>
          ) : mfaUri ? (
            <div className="space-y-3">
              <code className="block break-all rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-[11px] text-zinc-300">{mfaUri}</code>
              <div className="flex gap-2">
                <input value={mfaCode} onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="6-digit code" className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono" />
                <button type="button" onClick={verifyMfaEnrollment} disabled={mfaBusy || mfaCode.length !== 6} className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold disabled:opacity-50">Verify</button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={startMfaEnrollment} disabled={mfaBusy} className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold disabled:opacity-50">Enable authenticator MFA</button>
          )}
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Preferences saved successfully.</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
