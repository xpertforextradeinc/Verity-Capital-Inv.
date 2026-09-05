import React, { useState } from 'react';
import {
  User as UserIcon,
  Shield,
  Bell,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Key
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
        <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800">
            <UserIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Profile Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">First Name</label>
              <input
                type="text"
                disabled
                value={user.firstName}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Last Name</label>
              <input
                type="text"
                disabled
                value={user.lastName}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-zinc-400 mb-1">Registered Email</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Risk Assessment Card */}
        <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Simulated Risk Model</h3>
          </div>

          <p className="text-xs text-zinc-400">
            Select your simulated portfolio risk profile to adapt AI insight alerts and educational commentary.
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
                <span className="text-[11px] text-zinc-400">Receive in-app alerts whenever simulated limit orders are filled.</span>
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
