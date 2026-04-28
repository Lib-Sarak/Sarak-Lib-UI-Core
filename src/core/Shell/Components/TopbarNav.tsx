import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { DiscoveredModule } from '../../../constants/discovery';
import { ShellSearchWidget } from './ShellSearchWidget';
import { ShellUserWidget } from './ShellUserWidget';

interface TopbarNavProps {
    design: any;
    brand: any;
    toggleNav: () => void;
    setIsSearchOpen: (open: boolean) => void;
    activeModuleId: string | null;
    setActiveModuleId: (id: string) => void;
    discoveredModules: DiscoveredModule[];
    extraToolbarItems?: React.ReactNode;
    user?: any;
    logout?: () => void;
}

export const TopbarNav: React.FC<TopbarNavProps> = ({
    design, brand, toggleNav, setIsSearchOpen, activeModuleId, setActiveModuleId, discoveredModules, extraToolbarItems, user, logout
}) => {
    const { 
        mode, navigationStyle, isNavHidden, systemName, logoUrl, logoDarkUrl, logoScale, 
        logoPosition, tabSectionMargin, borderRadius, borderWidth, borderStyle
    } = design || {};

    const isSidebar = navigationStyle === 'sidebar';
    const isTopbar = navigationStyle === 'topbar';

    return (
        <header 
            className={`h-16 border border-[var(--theme-border)] bg-[var(--theme-card)] backdrop-blur-2xl px-6 flex items-center justify-between z-[45] shrink-0`}
            style={{ 
                margin: `var(--theme-tab-section-margin, ${tabSectionMargin}px)`,
                borderRadius: `var(--radius-theme, ${borderRadius}px)`,
                borderWidth: `${borderWidth}px`,
                borderStyle: borderStyle
            }}
        >
            <div className="flex items-center gap-6">
                {(isTopbar || (isSidebar && isNavHidden)) && (
                    <div className="flex items-center gap-4">
                        {isNavHidden && isSidebar && (
                            <button onClick={toggleNav} className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-all mr-2"><Menu size={18} /></button>
                        )}
                        <div className={`flex items-center gap-3 pr-6 border-r border-white/5 ${logoPosition === 'center' ? 'mx-auto' : ''}`}>
                            {logoUrl ? (
                                <img src={mode === 'dark' && logoDarkUrl ? logoDarkUrl : logoUrl} alt={systemName} style={{ transform: `scale(${logoScale})` }} className="max-h-8 object-contain transition-transform" />
                            ) : (
                                <div className="w-8 h-8 rounded-lg bg-[var(--theme-primary)] flex items-center justify-center font-bold text-xs shrink-0">S</div>
                            )}
                            <span className="font-black tracking-tighter text-sm uppercase italic truncate">{systemName || brand.name}</span>
                        </div>
                    </div>
                )}
                
                {isTopbar && (
                    <nav 
                        className="hidden lg:flex flex-1 items-center gap-1 overflow-x-auto no-scrollbar mx-8 justify-center"
                        style={{
                            maskImage: 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)',
                            WebkitMaskImage: 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)'
                        }}
                    >
                        {discoveredModules.filter(m => m.status === 'online').map(mod => (
                            <button 
                                key={mod.id} 
                                onClick={() => setActiveModuleId(mod.id)} 
                                className={`px-4 py-1.5 rounded-full text-2xs font-black uppercase tracking-widest transition-all whitespace-nowrap font-tab shrink-0 ${activeModuleId === mod.id ? 'bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/30' : 'text-white/40 hover:text-white'}`}
                            >
                                {mod.label}
                            </button>
                        ))}
                    </nav>
                )}
            </div>

            <div className="flex items-center gap-4">
                {/* 1. Search Widget */}
                <ShellSearchWidget variant="bar" onClick={() => setIsSearchOpen(true)} />
                
                <div className="flex items-center gap-2 px-1 py-1 bg-white/5 rounded-2xl border border-white/10">
                    {/* 1. Notifications */}
                    <button className="p-2 text-white/20 hover:text-white transition-colors relative">
                        <Bell size={16} />
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[var(--theme-primary)] rounded-full border border-black shadow-[0_0_10px_var(--theme-primary)]" />
                    </button>
                    
                    {extraToolbarItems}
                </div>

                {/* 4. User Widget */}
                <ShellUserWidget user={user} logout={logout} variant="horizontal" />
            </div>
        </header>
    );
};
;

