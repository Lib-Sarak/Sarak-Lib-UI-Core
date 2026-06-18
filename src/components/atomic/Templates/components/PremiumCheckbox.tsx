import React from 'react';
import { Check, X } from 'lucide-react';

export const PremiumCheckbox: React.FC<{ checked: boolean; onChange: () => void; isSmall?: boolean }> = ({ checked, onChange, isSmall }) => (
    <div 
        onClick={(e) => { e.stopPropagation(); onChange(); }}
        className={`rounded flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
            isSmall ? 'w-4 h-4' : 'w-5 h-5'
        } ${
            checked 
            ? 'bg-[var(--sx-color-primary-base)] text-[var(--sx-color-primary-text)] shadow-[0_0_10px_rgba(var(--sx-color-primary-base),0.5)]' 
            : 'bg-[var(--sx-color-text-muted)]/10 text-[var(--sx-color-text-muted)]/50 hover:bg-[var(--sx-color-text-muted)]/20 hover:text-[var(--sx-color-text-muted)]'
        }`}
    >
        {checked ? <Check size={isSmall ? 10 : 12} strokeWidth={3} /> : <X size={isSmall ? 8 : 10} />}
    </div>
);
