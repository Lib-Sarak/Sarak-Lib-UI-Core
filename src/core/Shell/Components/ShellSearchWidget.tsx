import React from 'react';
import { Search } from 'lucide-react';

interface ShellSearchWidgetProps {
    variant?: 'bar' | 'icon';
    onClick: () => void;
    design?: any;
}

/**
 * ShellSearchWidget — Adaptive Search Trigger (v8.5)
 * Standardizes search entry points for Topbar and Sidebar.
 */
export const ShellSearchWidget: React.FC<ShellSearchWidgetProps> = ({ 
    variant = 'bar', onClick 
}) => {
    if (variant === 'icon') {
        return (
            <button 
                onClick={onClick}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-all group"
                title="Search (Ctrl + K)"
            >
                <Search size={18} className="text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)]" />
                <span className="text-sm font-tab">Search...</span>
                <div className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] text-white/20 font-black opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>CTRL</span>
                    <span>K</span>
                </div>
            </button>
        );
    }

    // Bar / Topbar Variant
    return (
        <div className="hidden md:flex items-center w-64 group relative">
            <Search 
                size={14} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-muted)] group-focus-within:text-[var(--theme-primary)] transition-colors" 
            />
            <input 
                type="text" 
                placeholder="Smart Search..." 
                onClick={onClick}
                readOnly 
                className="w-full h-9 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[var(--radius-theme)] pl-10 pr-4 text-xs font-bold text-[var(--theme-title)]/60 hover:bg-white/[0.08] hover:border-[var(--theme-primary)]/50 transition-all cursor-pointer outline-none" 
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] text-white/20 font-black opacity-0 group-hover:opacity-100 transition-opacity">
                <span>CTRL</span>
                <span>K</span>
            </div>
        </div>
    );
};

export default ShellSearchWidget;
