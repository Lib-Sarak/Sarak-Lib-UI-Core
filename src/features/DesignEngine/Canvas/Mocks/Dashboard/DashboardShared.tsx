import React from 'react';
import { useSarakUI } from '../../../../../core/Provider/SarakUIProvider';

export const SmartCard = ({ children, className = "", style = {}, label, variables, textureType }: any) => {
    const globalUI = useSarakUI();
    const cardBaseClass = "sarak-card flex flex-col gap-4 overflow-hidden relative transition-all duration-500";
    
    return (
        <div 
            className={`${cardBaseClass} ${className}`}
            style={{ ...variables, ...style } as any}
            data-sx-card-texture-type={textureType}
        >
            {globalUI?.isDrafting && label && (
                <div className="absolute top-2 left-4 z-40 pointer-events-none flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-[var(--theme-primary)]/20 text-[7px] font-black uppercase tracking-[0.2em] text-[var(--theme-primary)] shadow-[0_0_10px_rgba(0,242,255,0.05)]">
                    <span className="w-1 h-1 rounded-full bg-[var(--theme-primary)] animate-pulse" />
                    {label}
                </div>
            )}
            <div className="relative z-10 w-full h-full flex flex-col gap-inherit">
                {children}
            </div>
        </div>
    );
};
