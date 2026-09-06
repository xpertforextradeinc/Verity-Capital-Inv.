import React from 'react';

export type AccountStatus = 'pending' | 'approved' | 'suspended' | 'on_hold' | 'active' | 'restricted' | 'closed';

interface AccountStatusDropdownProps {
  value: AccountStatus;
  disabled?: boolean;
  onChange: (status: AccountStatus) => void;
}

export const AccountStatusDropdown: React.FC<AccountStatusDropdownProps> = ({ value, disabled, onChange }) => {
  const normalized = (value || 'pending').toLowerCase() as AccountStatus;
  
  return (
    <select 
      value={normalized === 'active' ? 'approved' : normalized === 'restricted' ? 'on_hold' : normalized} 
      disabled={disabled} 
      onChange={(event) => onChange(event.target.value as AccountStatus)} 
      className={`border bg-slate-950 px-2.5 py-1.5 text-xs font-medium rounded outline-none transition-colors ${
        normalized === 'approved' || normalized === 'active'
          ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/20' 
          : normalized === 'pending'
            ? 'border-amber-400/40 text-amber-300 bg-amber-950/20' 
            : normalized === 'on_hold' || normalized === 'restricted'
              ? 'border-cyan-400/40 text-cyan-300 bg-cyan-950/20'
              : 'border-rose-500/50 text-rose-400 bg-rose-950/20'
      } disabled:opacity-50`}
    >
      <option value="pending">Pending</option>
      <option value="approved">Approved</option>
      <option value="on_hold">On Hold</option>
      <option value="suspended">Suspended</option>
    </select>
  );
};

