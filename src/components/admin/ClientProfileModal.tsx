import React from 'react';
import { X, User2, MapPin, Calendar, Clock, CreditCard, Shield, Activity, Mail } from 'lucide-react';
import { AdminProfile } from './UserTable.tsx';

interface ClientProfileModalProps {
  user: AdminProfile | null;
  onClose: () => void;
}

export const ClientProfileModal: React.FC<ClientProfileModalProps> = ({ user, onClose }) => {
  if (!user) return null;

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
