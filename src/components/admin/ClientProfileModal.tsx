import React, { useState } from 'react';
import { api } from '../../services/api.ts';
import { X, User2, MapPin, Calendar, Clock, CreditCard, Shield, Activity, Mail, Sparkles, Send } from 'lucide-react';
import { AdminProfile } from './UserTable.tsx';

interface ClientProfileModalProps {
  user: AdminProfile | null;
  onClose: () => void;
}


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
      const profileContext = `Name: ${user.firstName} ${user.lastName}, Email: ${user.email}, Balances: ${JSON.stringify(user.balances)}, Status: ${user.account_status}`;
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


  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B0F19] border border-zinc-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <User2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight uppercase leading-none">Client Master Record</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">ID: {user.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center space-x-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Identity Intelligence</span>
              </h3>
              
              <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800 space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Full Legal Name</p>
                  <p className="text-sm font-bold text-white mt-0.5">{user.firstName || 'Not provided'} {user.lastName || ''}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center space-x-1.5">
                    <Mail className="w-3 h-3" />
                    <span>Registered Email</span>
                  </p>
                  <p className="text-sm font-mono text-zinc-300 mt-0.5">{user.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center space-x-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>Date of Birth</span>
                  </p>
                  <p className="text-sm font-mono text-zinc-300 mt-0.5">{user.dateOfBirth || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center space-x-1.5">
                    <MapPin className="w-3 h-3" />
                    <span>Region / IP Location</span>
                  </p>
                  <p className="text-sm font-mono text-zinc-300 mt-0.5">{user.country || 'Unknown'}</p>
                </div>
              </div>
            </div>

            {/* Account Activity */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Activity & Status</span>
              </h3>
              
              <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800 space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Registration Date</p>
                  <p className="text-sm font-mono text-zinc-300 mt-0.5">
                    {new Date(user.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center space-x-1.5">
                    <Clock className="w-3 h-3" />
                    <span>Last Secure Login</span>
                  </p>
                  <p className="text-sm font-mono text-zinc-300 mt-0.5">
                    {user.last_sign_in ? new Date(user.last_sign_in).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/50">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">KYC Status</p>
                    <p className="text-xs font-bold mt-1">
                      {user.verified ? <span className="text-emerald-400">Verified</span> : <span className="text-rose-400">Unverified</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Account Status</p>
                    <p className="text-xs font-bold text-white mt-1 uppercase">{user.account_status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          

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

          
        </div>
        
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-widest transition-colors"
          >
            Close Master Record
          </button>
        </div>
      </div>
    </div>
  );
};
