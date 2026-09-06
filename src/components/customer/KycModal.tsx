import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, Building2, UserCheck, FileCheck, RefreshCw } from 'lucide-react';
import { KycProfile } from '../../types.ts';
import { api } from '../../services/api.ts';

interface KycModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  onProfileUpdated?: () => void;
  onCompleteKyc?: () => void;
}

export const KycModal: React.FC<KycModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<KycProfile | null>(null);
  const [legalFirstName, setLegalFirstName] = useState('');
  const [legalLastName, setLegalLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [ssnLastFour, setSsnLastFour] = useState('');
  const [usState, setUsState] = useState('New York');
  const [w9Attestation, setW9Attestation] = useState(true);
  const [tier, setTier] = useState<'TIER_1_VERIFIED' | 'TIER_2_INSTITUTIONAL'>('TIER_1_VERIFIED');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getKycProfile()
        .then(data => {
          setProfile(data);
          setLegalFirstName(data.legalFirstName || '');
          setLegalLastName(data.legalLastName || '');
          setDateOfBirth(data.dateOfBirth || '1988-04-12');
          setSsnLastFour(data.ssnLastFour || '4829');
          setUsState(data.usState || 'New York');
          setW9Attestation(Boolean(data.w9Attestation));
          setTier(data.tier === 'TIER_2_INSTITUTIONAL' ? 'TIER_2_INSTITUTIONAL' : 'TIER_1_VERIFIED');
        })
        .catch(err => console.error('Failed to load KYC profile:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const updated = await api.updateKycProfile({
        legalFirstName,
        legalLastName,
        dateOfBirth,
        ssnLastFour,
        usState,
        w9Attestation,
        tier,
      });
      setProfile(updated);
      setMessage({ type: 'success', text: 'US CIP and KYC verification profile updated successfully.' });
      if (onProfileUpdated) onProfileUpdated();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update KYC profile.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="kyc-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div id="kyc-modal" className="bg-[#0B0F19] border border-amber-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">US Regulatory Onboarding & KYC</h2>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {profile?.tier || 'TIER_2_INSTITUTIONAL'}
                </span>
              </div>
              <p className="text-zinc-400">
                FinCEN Customer Identification Program (CIP) & W-9 Tax Attestation
              </p>
            </div>
          </div>
          <button
            id="close-kyc-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {message && (
            <div className={`p-4 rounded-xl flex items-center space-x-2.5 ${
              message.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          {/* Verification Badges */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
            <div>
              <div className="text-[10px] text-zinc-400">CIP Status</div>
              <div className="text-emerald-400 font-bold font-mono text-xs mt-0.5 flex items-center justify-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{profile?.cipStatus || 'IN_REVIEW'}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-400">OFAC Screening</div>
              <div className="text-emerald-400 font-bold font-mono text-xs mt-0.5 flex items-center justify-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>{profile?.ofacScreening || 'PENDING'}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-400">Daily Limit</div>
              <div className="text-amber-400 font-bold font-mono text-xs mt-0.5">
                ${(profile?.dailyWithdrawalLimitUsd || 500000).toLocaleString()} USD
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Legal First Name</label>
                <input
                  type="text"
                  value={legalFirstName}
                  onChange={e => setLegalFirstName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Legal Last Name</label>
                <input
                  type="text"
                  value={legalLastName}
                  onChange={e => setLegalLastName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">SSN / TIN (Last 4 digits)</label>
                <input
                  type="text"
                  maxLength={4}
                  value={ssnLastFour}
                  onChange={e => setSsnLastFour(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">US Jurisdiction / State</label>
                <input
                  type="text"
                  value={usState}
                  onChange={e => setUsState(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Target Account Tier</label>
                <select
                  value={tier}
                  onChange={e => setTier(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="TIER_1_VERIFIED">Tier 1 Verified ($100k/day)</option>
                  <option value="TIER_2_INSTITUTIONAL">Tier 2 Institutional (admin approval)</option>
                </select>
              </div>
            </div>

            {/* W-9 Attestation Checkbox */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={w9Attestation}
                  onChange={e => setW9Attestation(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-zinc-300 text-[11px] leading-relaxed">
                  <strong>Form W-9 Electronic Attestation:</strong> Under penalties of perjury, I certify that the Taxpayer Identification Number shown is correct, that I am a U.S. citizen or other U.S. person, and that I am not subject to backup withholding.
                </span>
              </label>
            </div>

            <button
              id="submit-kyc-btn"
              type="submit"
              disabled={isSubmitting || !w9Attestation}
              className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FileCheck className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Verifying with FinCEN CIP...' : 'Submit Institutional Verification'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
