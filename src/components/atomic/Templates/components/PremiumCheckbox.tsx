import React from 'react';

import { SarakIcon } from "../../Icon/SarakIcon";
export const PremiumCheckbox: React.FC<{ checked: boolean; onChange: () => void; isSmall?: boolean }> = ({ checked, onChange, isSmall }) => (
    <div 
        onClick={(e) => { e.stopPropagation(); onChange(); }}
        className={`rounded flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
            isSmall ? 'w-4 h-4' : 'w-5 h-5'
        } ${
            checked 
            ? 'bg-[var(--sarak-primary-color,#00f2ff)] text-[var(--sarak-primary-color,#00f2ff)] shadow-[0_0_10px_color-mix(in_srgb,var(--sarak-primary-color,#00f2ff)_50%,transparent)]' 
            : 'bg-[var(--text-muted,rgba(255,255,255,0.4))]/10 text-[var(--text-muted,rgba(255,255,255,0.4))]/50 hover:bg-[var(--text-muted,rgba(255,255,255,0.4))]/20 hover:text-[var(--text-muted,rgba(255,255,255,0.4))]'
        }`}
    >
        {checked ? <SarakIcon name="Check" size={isSmall ? 10 : 12} strokeWidth={3} /> : <SarakIcon name="X" size={isSmall ? 8 : 10} />}
    </div>
);
