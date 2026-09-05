import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DriveConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export const DriveConfirmModal: React.FC<DriveConfirmModalProps> = ({
  isOpen,
  title,
  description,
  itemName,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-50">
      <div
        id="drive-confirm-dialog"
        role="dialog"
        aria-modal="true"
        className="bg-[#0E131F] border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-zinc-100"
      >
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isDestructive
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                    : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                }`}
              >
                {isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Google Drive Workspace Confirmation</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">{description}</p>

          {itemName && (
            <div className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs text-amber-300 break-all">
              {itemName}
            </div>
          )}

          <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-300/90 text-[11px] leading-tight">
            ⚠️ This will directly affect files stored in your personal Google Drive account.
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer disabled:opacity-50 ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30'
                  : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
              }`}
            >
              {isLoading && <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
              <span>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
