import React from 'react';
import { ShieldCheck, Lock, Key, Server, Search, FileText, CheckCircle2, ChevronRight, HardDrive } from 'lucide-react';
import { Portfolio } from '../../types.ts';

interface AssetVaultViewProps {
  portfolio: Portfolio | null;
}

export const AssetVaultView: React.FC<AssetVaultViewProps> = ({ portfolio }) => {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Cold Asset Vault</h1>
          </div>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Multi-Signature Offline Custody</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-black text-emerald-400 uppercase tracking-widest">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Vault Synchronized</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Cold Storage Value */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"></div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-blue-500/15 transition-all duration-700"></div>
          
          <div className="relative">
            <div className="flex items-center space-x-2 mb-6">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Total Secured Value (TSV)</h2>
            </div>
            
            <div className="flex items-baseline space-x-4 mb-8">
              <span className="text-5xl sm:text-7xl font-black text-white tracking-tighter tabular-nums leading-none">
                ${portfolio ? portfolio.totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </span>
              <span className="text-xl font-mono font-bold text-blue-500/60 uppercase">USD</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Authorization</p>
                <p className="text-sm font-bold text-white">4 of 7 Multi-Sig</p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Time Lock</p>
                <p className="text-sm font-bold text-white">24-Hour Delay</p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Reserves</p>
                <p className="text-sm font-bold text-emerald-400">1:1 Backed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Keys */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Key className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Hardware Keys</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Primary YubiKey', status: 'Active', time: 'Last used 2h ago' },
                { name: 'Backup Ledger', status: 'Vaulted', time: 'Stored offline' },
                { name: 'Institution Admin', status: 'Active', time: 'Verity Capital' },
              ].map((key, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div>
                      <p className="text-xs font-bold text-zinc-300">{key.name}</p>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">{key.time}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{key.status}</span>
                </div>
              ))}
            </div>
          </div>
          
          <button className="w-full mt-6 py-4 rounded-2xl bg-zinc-900 text-white font-black text-xs uppercase tracking-widest border border-zinc-800 hover:bg-zinc-800 transition-all flex items-center justify-center space-x-2">
            <span>Manage Access Keys</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Proof of Reserves & Audits */}
      <div>
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 px-2">Compliance & Audits</h3>
        <div className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="divide-y divide-zinc-900">
            {[
              { doc: 'Monthly Proof of Reserves', date: 'Sep 01, 2026', id: 'POR-2026-09', icon: Search },
              { doc: 'SOC 2 Type II Certification', date: 'Aug 15, 2026', id: 'SOC-2026-A', icon: Server },
              { doc: 'Cold Storage Vault Audit', date: 'Jul 30, 2026', id: 'VAULT-Q3', icon: FileText },
            ].map((audit, i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-zinc-900/40 transition-colors group cursor-pointer">
                <div className="flex items-center space-x-5">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                    <audit.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{audit.doc}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-widest">ID: {audit.id} • Issued {audit.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                    Verified
                  </span>
                  <button className="text-blue-400 hover:text-blue-300 font-black text-[10px] uppercase tracking-widest">
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
};
