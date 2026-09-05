import React from 'react';
import { Activity, ShieldCheck, Clock, FileText, CheckCircle, UserCheck } from 'lucide-react';
import { AuditEvent } from '../../types.ts';

interface ActivityViewProps {
  activity: AuditEvent[];
}

export const ActivityView: React.FC<ActivityViewProps> = ({ activity }) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl p-5 shadow-xl">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <span>Account Activity & Audit Ledger</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Immutable event log tracking logins, simulated executions, and account modifications
        </p>
      </div>

      <div className="bg-[#0B0F19] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>Logged Security Events ({activity.length})</span>
          <span className="font-mono">IP Masking Active</span>
        </div>

        {activity.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">
            No recent activity recorded.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {activity.map((ev) => (
              <div key={ev.id} className="p-4 flex items-start justify-between hover:bg-zinc-800/30 transition-colors text-xs">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 mt-0.5">
                    {ev.eventType.includes('ORDER') ? (
                      <FileText className="w-4 h-4 text-emerald-400" />
                    ) : ev.eventType.includes('LOGIN') ? (
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-white font-mono flex items-center space-x-2">
                      <span>{ev.eventType}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-sans">
                        {ev.targetType}: {ev.targetId}
                      </span>
                    </div>
                    <div className="text-zinc-400 text-[11px] mt-1">
                      Actor: <span className="font-mono text-zinc-300">{ev.actorEmail}</span>
                    </div>
                    {ev.metadataJson && (
                      <pre className="mt-1.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800/80 font-mono text-[10px] text-zinc-400 overflow-x-auto">
                        {JSON.stringify(ev.metadataJson, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>

                <div className="text-right text-[11px] text-zinc-500 font-mono shrink-0 ml-4">
                  <div>{new Date(ev.createdAt).toLocaleTimeString()}</div>
                  <div>{new Date(ev.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
