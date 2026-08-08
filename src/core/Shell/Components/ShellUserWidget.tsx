import React from 'react';
import { SarakIcon } from '../../../components/atomic/Icon/SarakIcon';
import { motion } from 'framer-motion';
import { ShellUser } from './types';

interface ShellUserWidgetProps {
    user?: ShellUser;
    logout?: () => void;
    variant?: 'horizontal' | 'vertical' | 'mini';
}

/**
 * ShellUserWidget — Sovereign User Identity Component (v8.5)
 * Unifies profile display and logout actions across all Shell layouts.
 */
export const ShellUserWidget: React.FC<ShellUserWidgetProps> = ({ 
    user, logout, variant = 'vertical' 
}) => {
    const isHorizontal = variant === 'horizontal';
    const isMini = variant === 'mini';

    if (isHorizontal) {
        return (
            <div className="flex items-center gap-4 ml-auto border-l border-[var(--theme-border)] pl-6">
                <div className="flex flex-col items-end">
                    <span className="text-2xs font-black text-[var(--theme-title)] uppercase tracking-widest leading-tight">
                        {user?.username || user?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="text-[var(--sarak-type-scale-micro,7px)] text-[var(--theme-primary)] font-bold uppercase tracking-[var(--sarak-tracking-tight,0.2em)]">
                        {user?.level === 100 ? 'Master' : (user?.level ?? 0) >= 50 ? 'Admin' : 'User'}
                    </span>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[var(--theme-card)] border border-[var(--theme-border)] flex items-center justify-center overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-secondary)] opacity-10" />
                        <SarakIcon name="User" size={16} className="text-[var(--theme-primary)] relative z-10" />
                    </div>
                    
                    <button
                        onClick={logout}
                        className="w-8 h-8 bg-[var(--theme-error-bg)] hover:bg-[var(--theme-error)] text-[var(--theme-error)] hover:text-[var(--theme-on-primary)] rounded-lg flex items-center justify-center transition-all cursor-pointer border border-[var(--theme-error-border)]"
                        title="Logout"
                    >
                        <SarakIcon name="LogOut" size={12} />
                    </button>
                </div>
            </div>
        );
    }

    // Vertical / Sidebar Variant
    return (
        <div className={`p-4 border-t border-[var(--theme-border)] bg-[var(--theme-card)]/50 relative z-20 ${isMini ? 'flex justify-center' : ''}`}>
            <div className={`flex items-center group ${isMini ? 'flex-col gap-3' : 'justify-between w-full'}`}>
                <div className={`flex items-center gap-3 ${isMini ? 'flex-col' : ''}`}>
                    <div className="relative w-9 h-9 rounded-xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 flex items-center justify-center text-[var(--theme-primary)] overflow-hidden">
                         <div className="absolute inset-0 bg-gradient-to-tr from-[var(--theme-primary)] to-transparent opacity-10" />
                        <SarakIcon name="User" size={16} />
                    </div>
                    
                    {!isMini && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-bold text-[var(--theme-title)]/90 leading-tight truncate">
                                {user?.username || user?.email?.split('@')[0] || 'User'}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <SarakIcon name="Shield" size={8} className="text-[var(--theme-primary)]" />
                                <span className="text-[var(--sarak-type-scale-tiny,8px)] text-[var(--theme-muted)] uppercase tracking-widest font-black">
                                    {user?.level === 100 ? 'Master' : (user?.level ?? 0) >= 50 ? 'Admin' : 'User'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
                
                <button 
                    onClick={logout} 
                    className={`p-2 text-[var(--theme-muted)] hover:text-[var(--theme-error)] hover:bg-[var(--theme-error-bg)] rounded-lg transition-all ${isMini ? 'bg-[var(--theme-error-bg)] text-[var(--theme-error)]' : ''}`}
                    title="Logout"
                >
                    <SarakIcon name="LogOut" size={isMini ? 12 : 14} />
                </button>
            </div>
        </div>
    );
};

export default ShellUserWidget;
