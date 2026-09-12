import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Send, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { User } from '../../types.ts';
import { api } from '../../services/api.ts';

interface AccountUpgradeSectionProps {
  user: User;
  onRefreshUser?: () => void;
  compact?: boolean;
}

export const AccountUpgradeSection: React.FC<AccountUpgradeSectionProps> = ({
  user,
  onRefreshUser,
  compact = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionNote, setSubmissionNote] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isUpgraded = Boolean(user.isUpgraded) || user.upgradeStatus === 'UPGRADED';
  const task = user.upgradeTask;
  const isTaskRequired = user.upgradeStatus === 'TASK_REQUIRED' && task;
  const isTaskSubmitted = user.upgradeStatus === 'TASK_SUBMITTED' && task;

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionNote.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter verification notes or details for your submission.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      await api.submitUpgradeTask(submissionNote.trim());
      setStatusMessage({ 
        type: 'success', 
        text: 'Task successfully submitted for Administrative Review. Your supervisor will verify and approve the upgrade.' 
      });
      setShowSubmitModal(false);
      setSubmissionNote('');
      if (onRefreshUser) onRefreshUser();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to submit upgrade task.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUpgraded) {
    return (
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-cyan-500/10 border border-amber-500/25 rounded-2xl p-4 shadow-sm relative overflow-hidden transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Tier-1 Upgraded
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-zinc-950 flex items-center space-x-1">
                  <Sparkles className="w-2.5 h-2.5 fill-current" />
                  <span>{user.upgradeTier || 'INSTITUTIONAL PRIME'}</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Enhanced liquidity, zero-fee crypto sweeps, and institutional limits active.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified VIP</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (isTaskRequired) {
    return (
      <div className="bg-[#0c1222] border border-amber-500/30 rounded-2xl p-4 shadow-lg relative transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  UPGRADE TASK PENDING
                </span>
                <span className="text-[11px] font-semibold text-zinc-400">
                  Target: <span className="text-amber-300 font-mono">{task?.targetTier || 'Institutional Prime'}</span>
                </span>
              </div>
              
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                {task?.title || 'Account Upgrade Requirement'}
              </h4>

              {!isCollapsed && (
                <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xl">
                  {task?.description || 'Your account supervisor has assigned an upgrade task. Submit verification notes to unlock institutional privileges.'}
                </p>
              )}

              {task?.status === 'REJECTED' && task.rejectionReason && (
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center space-x-1.5 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Submission feedback: {task.rejectionReason}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
            >
              <span>Submit Task</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
              title={isCollapsed ? 'Expand details' : 'Collapse'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submission Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#0B0F19] border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Submit Upgrade Task</h3>
                </div>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="text-zinc-400 hover:text-white text-xs p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-800 space-y-1">
                <div className="text-xs font-bold text-amber-400">{task?.title}</div>
                <p className="text-xs text-zinc-300">{task?.description}</p>
                <div className="text-[11px] font-mono text-zinc-500 pt-1">
                  Requirement Type: {task?.requirementType}
                </div>
              </div>

              <form onSubmit={handleSubmitTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Completion Details / Document Reference / Notes:
                  </label>
                  <textarea
                    rows={4}
                    value={submissionNote}
                    onChange={(e) => setSubmissionNote(e.target.value)}
                    placeholder="E.g., Proof of accredited investor status uploaded / Wire reference #882941 finalized with Bank of America / ID attestation confirmed..."
                    className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-xl p-3 text-xs text-white placeholder-zinc-500 outline-none"
                    required
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Your note will be sent directly to your supervisor's admin dashboard for immediate review and account upgrade approval.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !submissionNote.trim()}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit for Admin Approval</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isTaskSubmitted) {
    return (
      <div className="bg-[#091122] border border-blue-500/30 rounded-2xl p-4 shadow-sm relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white">
                  Upgrade Submission Under Review
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  PENDING APPROVAL
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Submission for <strong className="text-zinc-200">{task?.title}</strong> is being verified by your supervisor.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 text-xs">
            <span className="text-zinc-500">Target Tier:</span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-amber-300 font-mono text-xs font-bold">
              {task?.targetTier || 'Institutional'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
