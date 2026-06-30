import React from 'react';
import { Check, X } from 'lucide-react';

export const PremiumCheckbox: React.FC<{ checked: boolean; onChange: () => void; isSmall?: boolean }> = ({ checked, onChange, isSmall }) => (
    <div 
        onClick={(e) => { e.stopPropagation(); onChange(); }}
        className={`rounded flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
            isSmall ? 'w-4 h-4' : 'w-5 h-5'
        } ${
            checked 
            ? 'bg-[var(--sarak-primary-color,#3b82f6)] text-[var(--sarak-primary-color,#3b82f6)] shadow-[0_0_10px_rgba(var(--sarak-primary-color,#3b82f6),0.5)]' 
            : 'bg-[var(--text-muted,#94a3b8)]/10 text-[var(--text-muted,#94a3b8)]/50 hover:bg-[var(--text-muted,#94a3b8)]/20 hover:text-[var(--text-muted,#94a3b8)]'
        }`}
    >
        {checked ? <Check size={isSmall ? 10 : 12} strokeWidth={3} /> : <X size={isSmall ? 8 : 10} />}
    </div>
);
