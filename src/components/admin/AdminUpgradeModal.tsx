import React, { useState } from 'react';
import { 
  X, 
  Award, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Send, 
  Ban, 
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { AdminProfile } from './UserTable.tsx';

interface AdminUpgradeModalProps {
  isOpen: boolean;
  user: AdminProfile | null;
  onClose: () => void;
  onUpdated: () => void;
}

const PRESET_TASKS = [
  {
    title: 'Submit W-8BEN / W-9 & Accredited Investor Attestation',
    description: 'Provide certified Form W-9 / W-8BEN and proof of accredited investor status (SEC Rule 501 / FINRA Rule 2111) to unlock institutional execution limits.',
  },
  {
    title: 'Institutional Liquidity & Proof of Qualified Assets',
    description: 'Submit bank reference letter or custodial statement demonstrating a minimum of $250,000 in qualifying liquid net worth.',
  },
  {
    title: 'Corporate Resolution & Beneficial Ownership Verification',
    description: 'Provide certified Articles of Organization, Operating Agreement, and FINRA Form 3210 beneficial ownership disclosure for institutional entity trading.',
  },
  {
    title: 'Multi-Sig Hardware Key Whitelist Verification',
    description: 'Complete cryptographic cold vault whitelist sign-off with secondary air-gapped institutional key.',
  }
];

export const AdminUpgradeModal: React.FC<AdminUpgradeModalProps> = ({
  isOpen,
  user,
  onClose,
  onUpdated,
}) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [targetTier, setTargetTier] = useState('TIER_3_INSTITUTIONAL');
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  React.useEffect(() => {
    if (user) {
      const currentTask = (user as any).upgradeTask;
      if (currentTask) {
        setTaskTitle(currentTask.title || '');
        setTaskDescription(currentTask.description || '');
      } else {
        setTaskTitle(PRESET_TASKS[0].title);
        setTaskDescription(PRESET_TASKS[0].description);
      }
      setTargetTier((user as any).upgradeTier || 'TIER_3_INSTITUTIONAL');
      setRejectReason('');
      setFeedback(null);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const userRecord = user as any;
  const upgradeStatus = userRecord.upgradeStatus || (userRecord.isUpgraded ? 'UPGRADED' : 'NOT_REQUESTED');
  const currentTask = userRecord.upgradeTask;

  // Handle Direct Upgrade
  const handleDirectUpgrade = async (upgraded: boolean) => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await api.adminSetUserUpgrade(user.id, {
        isUpgraded: upgraded,
        upgradeTier: targetTier,
        upgradeStatus: upgraded ? 'UPGRADED' : 'NOT_REQUESTED',
        task: currentTask || {
          id: `task_${Date.now()}`,
          title: taskTitle || 'Accredited Institutional Tier Upgrade',
          description: taskDescription || 'Approved by compliance supervisor',
          status: upgraded ? 'APPROVED' : 'PENDING',
          requiredAt: new Date().toISOString(),
          completedAt: upgraded ? new Date().toISOString() : undefined,
        }
      });
      setFeedback({
        type: 'success',
        message: upgraded ? `Account ${user.email} successfully upgraded!` : `Upgrade status for ${user.email} revoked.`
      });
      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update upgrade status' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Setting Required Task
  const handleAssignTask = async () => {
    if (!taskTitle.trim() || !taskDescription.trim()) {
      setFeedback({ type: 'error', message: 'Task title and description are required.' });
      return;
    }
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await api.adminSetUserUpgrade(user.id, {
        isUpgraded: false,
        upgradeTier: targetTier,
        upgradeStatus: 'TASK_REQUIRED',
        task: {
          id: `task_${Date.now()}`,
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          status: 'PENDING',
          requiredAt: new Date().toISOString(),
        }
      });
      setFeedback({
        type: 'success',
        message: `Upgrade task assigned to ${user.email}. User will be prompted to complete it.`
      });
      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to assign task' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Approving Submitted Task
  const handleApproveTask = async () => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await api.adminApproveUpgradeTask(user.id);
      setFeedback({
        type: 'success',
        message: `Task submission approved. Account ${user.email} is now fully UPGRADED!`
      });
      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to approve task submission' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Rejecting Submitted Task
  const handleRejectTask = async () => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await api.adminRejectUpgradeTask(user.id, rejectReason || 'Documentation does not meet institutional verification criteria.');
      setFeedback({
        type: 'success',
        message: `Task rejected and returned to user with feedback.`
      });
      setTimeout(() => {
        onUpdated();
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to reject task submission' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#090D1A] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-[#090D1A] to-amber-950/20">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base sm:text-lg">Account Upgrade & Task Verification</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                  upgradeStatus === 'UPGRADED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : upgradeStatus === 'TASK_SUBMITTED'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                    : upgradeStatus === 'TASK_REQUIRED'
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}>
                  {upgradeStatus.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{user.email} (ID: {user.id})</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {feedback && (
            <div className={`p-4 rounded-xl flex items-start space-x-2.5 ${
              feedback.type === 'success' 
                ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
          )}

          {/* Section 1: Review User's Submitted Task (if any) */}
          {upgradeStatus === 'TASK_SUBMITTED' && currentTask && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 text-sm flex items-center space-x-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Pending Customer Task Submission</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Submitted: {currentTask.submittedAt ? new Date(currentTask.submittedAt).toLocaleString() : 'Recently'}
                </span>
              </div>

              <div className="bg-[#050814] p-3.5 rounded-lg border border-white/5 space-y-2">
                <div className="font-semibold text-white">{currentTask.title}</div>
                <p className="text-zinc-400 text-xs">{currentTask.description}</p>
                {currentTask.submissionNote && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold block mb-1">
                      Customer Verification Note / Proof:
                    </span>
                    <div className="bg-black/60 p-2.5 rounded text-white font-mono text-xs border border-zinc-800">
                      "{currentTask.submissionNote}"
                    </div>
                  </div>
                )}
              </div>

              {/* Approval / Rejection Controls */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleApproveTask}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Upgrade Account</span>
                </button>

                <button
                  type="button"
                  onClick={handleRejectTask}
                  disabled={isSubmitting}
                  className="py-2.5 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" />
                  <span>Reject Submission</span>
                </button>
              </div>

              <div className="pt-1">
                <input
                  type="text"
                  placeholder="Optional rejection reason / corrective instructions..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-[#050814] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:border-rose-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Section 2: Assign a Required Task to User */}
          <div className="p-4 rounded-xl bg-[#071021] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">Assign Required Upgrade Task</h4>
                <p className="text-zinc-400 text-[11px]">
                  Specify the regulatory, deposit, or document requirements the client must submit before receiving upgraded status.
                </p>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="text-[10px] uppercase font-mono text-zinc-400 font-semibold mb-1.5 block">
                Quick Preset Templates
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_TASKS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTaskTitle(preset.title);
                      setTaskDescription(preset.description);
                    }}
                    className={`p-2.5 text-left rounded-lg border text-xs transition-colors cursor-pointer ${
                      taskTitle === preset.title
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-200'
                        : 'bg-[#050814] border-white/5 text-zinc-300 hover:border-white/20'
                    }`}
                  >
                    <div className="font-semibold line-clamp-1">{preset.title}</div>
                    <div className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-zinc-400 font-semibold mb-1 block">
                Task Title
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Provide Accredited Investor Certificate"
                className="w-full bg-[#050814] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-zinc-400 font-semibold mb-1 block">
                Task Instructions & Requirements
              </label>
              <textarea
                rows={2}
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Describe what documentation or step is required..."
                className="w-full bg-[#050814] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-mono text-zinc-400 font-semibold mb-1 block">
                  Target Upgrade Tier
                </label>
                <select
                  value={targetTier}
                  onChange={(e) => setTargetTier(e.target.value)}
                  className="w-full bg-[#050814] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:border-cyan-400 focus:outline-none"
                >
                  <option value="TIER_2_INSTITUTIONAL">Tier 2: Institutional Trader ($500k/day limit)</option>
                  <option value="TIER_3_INSTITUTIONAL">Tier 3: Accredited Prime ($2.5M/day limit)</option>
                  <option value="VIP_FAMILY_OFFICE">VIP: Family Office / Direct Custody (Unlimited)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAssignTask}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Assign Requirement to User</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Direct Manual Upgrade Override */}
          <div className="p-4 rounded-xl bg-[#071021] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white text-xs flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Direct Manual Supervisor Override</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Immediately grant or revoke full institutional upgraded status bypassing task submission.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {upgradeStatus === 'UPGRADED' ? (
                <button
                  type="button"
                  onClick={() => handleDirectUpgrade(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Revoke Upgrade
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDirectUpgrade(true)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-xs transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Directly Set Upgraded</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
