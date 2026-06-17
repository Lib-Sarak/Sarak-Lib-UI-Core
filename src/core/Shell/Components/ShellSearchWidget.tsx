import React, { useState, useRef, useEffect } from 'react';
import { Search, Command, ArrowRight } from 'lucide-react';
import { getRegisteredModules } from '../../../core/Discovery/registry';
import { SarakInput } from '../../../components/atomic/Inputs/SarakInput';

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
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const registeredModules = getRegisteredModules();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredModules = registeredModules.filter(m => 
        m.label.toLowerCase().includes(query.toLowerCase()) ||
        m.id.toLowerCase().includes(query.toLowerCase())
    );

    if (variant === 'icon') {
        return (
            <button 
                onClick={onClick}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--theme-muted)] hover:bg-[var(--theme-muted)]/10 hover:text-[var(--theme-title)] transition-all group"
                title="Search (Ctrl + K)"
            >
                <Search size={18} className="text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)]" />
                <span className="text-sm font-tab">Search...</span>
                <div className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--theme-muted)]/10 border border-[var(--theme-border)] text-[8px] text-[var(--theme-muted)] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>CTRL</span>
                    <span>K</span>
                </div>
            </button>
        );
    }

    // Bar / Topbar Variant
    return (
        <div className="hidden md:flex items-center w-64 group relative" ref={containerRef}>
            <SarakInput 
                value={query}
                placeholder="Smart Search..." 
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                leftIcon={<Search size={14} className="text-[var(--theme-muted)] group-focus-within:text-[var(--theme-primary)] transition-colors" />}
                rightIcon={
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--theme-muted)]/10 border border-[var(--theme-border)] text-[8px] text-[var(--theme-muted)] font-black transition-opacity pointer-events-none">
                        <span>CTRL</span>
                        <span>K</span>
                    </div>
                }
                fullWidth
            />

            {/* Dropdown de Resultados */}
            {isOpen && query.length > 0 && (
                <div className="absolute top-[calc(100%+0.5rem)] left-0 w-[400px] bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[var(--radius-theme)] shadow-[var(--dynamic-shadow)] overflow-hidden z-[600]">
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                        {filteredModules.length > 0 ? (
                            <div className="py-2">
                                <h4 className="text-2xs font-black uppercase tracking-[0.2em] text-[var(--theme-muted)] px-4 mb-2">Results</h4>
                                {filteredModules.map(mod => (
                                    <div 
                                        key={mod.id}
                                        className="group h-12 px-4 flex items-center justify-between rounded-[calc(var(--radius-theme)*0.8)] hover:bg-[var(--theme-primary)]/5 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-[calc(var(--radius-theme)*0.5)] bg-[var(--theme-card)] flex items-center justify-center text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)] group-hover:bg-[var(--theme-primary)]/10 transition-all border border-[var(--theme-border)]">
                                                <Command size={14} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-[var(--theme-title)]/80 group-hover:text-[var(--theme-primary)]">{mod.label}</span>
                                                <span className="text-[9px] text-[var(--theme-muted)] uppercase tracking-widest">{mod.category || 'Module'}</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-3 h-3 text-[var(--theme-muted)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 flex flex-col items-center justify-center text-center opacity-40">
                                <Search className="w-8 h-8 mb-2 text-[var(--theme-title)]" />
                                <span className="text-xs font-black uppercase tracking-widest text-[var(--theme-title)]">No results for "{query}"</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShellSearchWidget;
