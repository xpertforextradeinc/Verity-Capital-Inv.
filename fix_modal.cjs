const fs = require('fs');
let code = fs.readFileSync('src/components/admin/ClientProfileModal.tsx', 'utf8');

const newImports = `import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { X, User2, MapPin, Calendar, Clock, CreditCard, Shield, Activity, Mail, Sparkles, Send } from 'lucide-react';`;

code = code.replace(/import React from 'react';\nimport { X, User2, MapPin, Calendar, Clock, CreditCard, Shield, Activity, Mail } from 'lucide-react';/, newImports);

const componentLogic = `
export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({ user, onClose }) => {
  const [instruction, setInstruction] = useState('');
  const [draftNote, setDraftNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  if (!user) return null;

  const handleGenerateNote = async () => {
    if (!instruction.trim()) return;
    setIsGenerating(true);
    setSendSuccess(false);
    try {
      const profileContext = \`Name: \${user.firstName} \${user.lastName}, Email: \${user.email}, Balances: \${JSON.stringify(user.balances)}, Status: \${user.account_status}\`;
      const res = await api.adminGenerateBillingNote(profileContext, instruction);
      setDraftNote(res.note);
    } catch (err) {
      console.error(err);
      setDraftNote('Error generating note. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendNote = async () => {
    if (!draftNote.trim()) return;
    setIsSending(true);
    try {
      await api.adminSendNotification(user.id, 'Account Billing Update', draftNote, 'SYSTEM');
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        setDraftNote('');
        setInstruction('');
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };
`;

code = code.replace(/export const ClientProfileModal: React\.FC<ClientProfileModalProps> = \(\{ user, onClose \}\) => \{\n  if \(\!user\) return null;/, componentLogic);

const newSection = `
          {/* Institutional Balances Overview */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Asset Custody Balances</span>
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(user.balances).map(([asset, balance]) => (
                <div key={asset} className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
                  <span className="text-xs font-black text-zinc-500">{asset}</span>
                  <span className="text-xs font-mono font-bold text-white">{Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Billing Note Generation */}
          <div className="space-y-4 pt-4 border-t border-zinc-800/50">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI Billing & Account Notifications</span>
            </h3>
            <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">
                  Instruction to AI Assistant
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. Request $5,000 margin deposit or Notify about upgrade fee"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    className="flex-1 bg-[#071021] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    onClick={handleGenerateNote}
                    disabled={isGenerating || !instruction.trim()}
                    className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isGenerating ? <span className="animate-pulse">Drafting...</span> : <span>Draft Note</span>}
                  </button>
                </div>
              </div>

              {draftNote && (
                <div className="space-y-3 pt-3 border-t border-zinc-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                    Generated Note Draft (Edit if needed)
                  </label>
                  <textarea
                    value={draftNote}
                    onChange={(e) => setDraftNote(e.target.value)}
                    className="w-full h-32 bg-[#071021] border border-white/10 rounded-xl p-3 text-sm text-zinc-300 font-mono focus:outline-none focus:border-cyan-500/50 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-emerald-400 font-bold tracking-wide">
                      {sendSuccess ? '✓ Notification sent successfully to user inbox' : ''}
                    </div>
                    <button
                      onClick={handleSendNote}
                      disabled={isSending || !draftNote.trim()}
                      className="px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSending ? 'Sending...' : 'Send to User Inbox'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
`;

code = code.replace(/          \{\/\* Institutional Balances Overview \*\/\}[\s\S]*?<\/div>\n          <\/div>/, newSection);

fs.writeFileSync('src/components/admin/ClientProfileModal.tsx', code);
