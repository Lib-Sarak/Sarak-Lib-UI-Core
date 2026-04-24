import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, User, LogOut } from 'lucide-react';
import { IconRenderer } from './IconRenderer';
import { DiscoveredModule } from '../../../constants/discovery';

interface SidebarNavProps {
    design: any;
    brand: any;
    user: any;
    logout?: () => void;
    toggleNav: () => void;
    activeModuleId: string | null;
    setActiveModuleId: (id: string) => void;
    groupedModules: Record<string, DiscoveredModule[]>;
    setIsNavVisible: (visible: boolean) => void;
    startResizing: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
    design, brand, user, logout, toggleNav, activeModuleId, setActiveModuleId, groupedModules, setIsNavVisible, startResizing
}) => {
    const { 
        mode, animationSpeed, sidebarWidth, isNavHidden, isAutoHideEnabled,
        tabSectionMargin, borderRadius, borderWidth, borderStyle,
        systemName, logoUrl, logoDarkUrl, logoScale, logoPosition, tabGap
    } = design || {};

    return (
        <aside 
            onMouseEnter={() => setIsNavVisible(true)}
            onMouseLeave={() => isAutoHideEnabled && setIsNavVisible(false)}
            style={{ 
                width: isNavHidden ? '0px' : `${sidebarWidth}px`,
                opacity: isNavHidden ? 0 : 1,
                visibility: isNavHidden ? 'hidden' : 'visible',
                transition: `all ${animationSpeed}s cubic-bezier(0.16, 1, 0.3, 1)`,
                margin: `var(--theme-tab-section-margin, ${tabSectionMargin}px)`,
                borderRadius: `var(--radius-theme, ${borderRadius}px)`,
                height: `calc(100vh - (var(--theme-tab-section-margin, ${tabSectionMargin}px) * 2))`,
                borderWidth: `${borderWidth}px`,
                borderStyle: borderStyle
            }}
            className="sarak-shell-sidebar bg-[var(--theme-sidebar)] border border-[var(--theme-border)] flex flex-col shrink-0 relative z-[100] shadow-2xl overflow-hidden"
        >
            <div className="h-16 sarak-shell-header px-6 flex items-center justify-between border-b border-[var(--theme-border)] bg-[var(--theme-title)]/5">
                <div className={`flex items-center gap-3 w-full ${logoPosition === 'center' ? 'justify-center' : ''}`}>
                    {logoUrl ? (
                        <img src={mode === 'dark' && logoDarkUrl ? logoDarkUrl : logoUrl} alt={systemName} style={{ transform: `scale(${logoScale})`, transformOrigin: logoPosition === 'center' ? 'center' : 'left' }} className="max-h-8 object-contain transition-transform" />
                    ) : (
                        <div className="w-8 h-8 rounded-[var(--radius-theme)] bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-primary-rgb),0.5] flex items-center justify-center font-black text-xs text-white shrink-0">S</div>
                    )}
                    <span className="text-sm font-bold tracking-tighter opacity-80 text-[var(--theme-title)] truncate">{systemName || brand.name}</span>
                </div>
                {logoPosition !== 'center' && (
                    <button onClick={toggleNav} className="p-1.5 hover:bg-white/5 rounded-md text-white/20 hover:text-white transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col" style={{ gap: `var(--theme-tab-gap, ${tabGap}px)` }}>
                {Object.entries(groupedModules).map(([category, mods]) => (
                    <div key={category} style={{ marginBottom: `var(--theme-tab-gap, ${tabGap}px)` }}>
                        <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3 px-3">{category}</h4>
                        <div className="space-y-1" style={{ gap: `var(--theme-tab-gap, ${tabGap}px)` }}>
                            {mods.map(mod => {
                                const isOffline = mod.status === 'offline';
                                return (
                                    <button 
                                        key={mod.id} 
                                        onClick={() => !isOffline && setActiveModuleId(mod.id)} 
                                        disabled={isOffline}
                                        title={isOffline ? `Offline Module: ${mod.error || 'Connection error'}` : mod.label}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group font-tab 
                                            ${activeModuleId === mod.id ? 'bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] font-bold shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]' : 'text-white/40 hover:bg-white/5 hover:text-white'}
                                            ${isOffline ? 'opacity-30 grayscale cursor-not-allowed border border-dashed border-white/5' : ''}
                                        `}
                                    >
                                        <IconRenderer name={mod.icon} className={activeModuleId === mod.id ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-muted)]'} />
                                        <div className="flex flex-col items-start overflow-hidden">
                                            <span className="text-sm truncate">{mod.label}</span>
                                            {isOffline && <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider">Service Offline</span>}
                                        </div>
                                        {activeModuleId === mod.id && <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-4 bg-[var(--theme-primary)] rounded-full shadow-[0_0_15px_var(--theme-primary)]" />}
                                        {isOffline && <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_red]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-[var(--theme-border)] bg-[var(--theme-card)]/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--theme-primary)]/20 border border-[var(--theme-primary)]/30 flex items-center justify-center text-[var(--theme-primary)]"><User size={14} /></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[var(--theme-title)]/80">{user?.email?.split('@')[0] || 'Sarak User'}</span>
                            <span className="text-[9px] text-[var(--theme-muted)] uppercase tracking-widest">{user?.role || 'Guest'}</span>
                        </div>
                    </div>
                    <button onClick={logout} className="p-2 text-[var(--theme-muted)] hover:text-red-400 transition-colors"><LogOut size={14} /></button>
                </div>
            </div>
            <div onMouseDown={startResizing} className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--theme-primary)]/50 transition-colors z-[60]" />
        </aside>
    );
};
