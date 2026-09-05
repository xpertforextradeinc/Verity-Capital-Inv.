import React from 'react';

export type AccountStatus = 'active' | 'restricted' | 'closed';

interface AccountStatusDropdownProps {
  value: AccountStatus;
  disabled?: boolean;
  onChange: (status: AccountStatus) => void;
}

export const AccountStatusDropdown: React.FC<AccountStatusDropdownProps> = ({ value, disabled, onChange }) => (
  <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value as AccountStatus)} className={`border bg-slate-950 px-2 py-1.5 text-xs outline-none ${value === 'active' ? 'border-emerald-400/30 text-emerald-300' : value === 'restricted' ? 'border-amber-400/30 text-amber-300' : 'border-rose-400/30 text-rose-300'} disabled:opacity-50`}>
    <option value="active">Active</option>
    <option value="restricted">Restricted</option>
    <option value="closed">Closed</option>
  </select>
);
