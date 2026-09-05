import React from 'react';

interface VerifyToggleProps {
  verified: boolean;
  disabled?: boolean;
  onChange: (verified: boolean) => void;
}

export const VerifyToggle: React.FC<VerifyToggleProps> = ({ verified, disabled, onChange }) => (
  <button type="button" role="switch" aria-checked={verified} disabled={disabled} onClick={() => onChange(!verified)} className={`relative h-6 w-11 rounded-full border transition ${verified ? 'border-emerald-400/60 bg-emerald-400/20' : 'border-zinc-700 bg-zinc-900'} disabled:cursor-not-allowed disabled:opacity-50`}>
    <span className={`absolute top-0.5 h-5 w-5 rounded-full transition ${verified ? 'left-[22px] bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,.7)]' : 'left-0.5 bg-zinc-500'}`} />
  </button>
);
