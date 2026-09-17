import React from 'react';
import { AuditRecord } from './AdminSupervisorView.tsx';

interface AdminAuditLogProps {
  auditLogs: AuditRecord[];
}

export const AdminAuditLog: React.FC<AdminAuditLogProps> = ({ auditLogs }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border border-white/10 bg-[#071021] p-5 rounded-2xl">
        <div>
          <h2 className="text-base font-semibold text-white">Immutable Administrative Audit Logs</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Every administrative action is cryptographically tied to the acting admin ID, target account, and timestamp. Track manual account upgrades, fund adjustments, and withdrawal approvals for compliance reporting.
          </p>
        </div>
        <div className="text-xs font-mono text-cyan-300 font-bold">
          {auditLogs.length} Events Recorded
        </div>
      </div>

      <div className="overflow-x-auto border border-cyan-300/15 bg-[#071021] shadow-[0_20px_80px_rgba(0,0,0,.25)] rounded-2xl">
        <table className="w-full min-w-[950px] text-left text-xs">
          <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-widest text-zinc-400">
            <tr>
              <th className="px-4 py-3.5">Timestamp</th>
              <th className="px-4 py-3.5">Action Type</th>
              <th className="px-4 py-3.5">Acting Admin</th>
              <th className="px-4 py-3.5">Target Account</th>
              <th className="px-4 py-3.5">Previous Value</th>
              <th className="px-4 py-3.5">New Value / Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-[11px]">
            {auditLogs.map((log) => {
              const isPositive = log.action_type?.includes('APPROVE') || log.action_type?.includes('ADD') || log.action_type?.includes('UPGRADE');
              const isNegative = log.action_type?.includes('SUSPEND') || log.action_type?.includes('DEDUCT') || log.action_type?.includes('REJECT');

              return (
                <tr key={log.id} className="hover:bg-cyan-300/[0.02]">
                  <td className="px-4 py-3.5 text-zinc-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                      isPositive
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : isNegative
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                    }`}>
                      {log.action_type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-white font-sans">
                    {log.admin_email || log.admin_id || 'Supervisor (System)'}
                  </td>
                  <td className="px-4 py-3.5 text-zinc-300 font-sans">
                    {log.target_email || log.target_user_id || 'N/A'}
                  </td>
                  <td className="px-4 py-3.5 text-zinc-500 max-w-[150px] truncate" title={JSON.stringify(log.previous_value)}>
                    {log.previous_value ? JSON.stringify(log.previous_value) : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-cyan-300 max-w-[250px] truncate" title={JSON.stringify(log.new_value)}>
                    {log.new_value ? JSON.stringify(log.new_value) : '—'}
                  </td>
                </tr>
              );
            })}
            {auditLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500 font-sans">
                  No administrative audit log entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
