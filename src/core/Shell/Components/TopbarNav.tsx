import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { DiscoveredModule } from '../../../constants/discovery';
import { ShellSearchWidget } from './ShellSearchWidget';
import { ShellUserWidget } from './ShellUserWidget';
import { IconRenderer } from './IconRenderer';

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
    const [isHovered, setIsHovered] = React.useState(false);
    const { 
        mode, navigationStyle, isNavHidden, systemName, logoUrl, logoDarkUrl, logoScale, 
        logoPosition, tabSectionMargin, borderRadius, borderWidth, borderStyle, animationSpeed
    } = design || {};

    const isTopbar = navigationStyle === 'topbar';
    
    // Sovereign Logic: Parity with Sidebar Hover
    const effectiveIsNavHidden = isNavHidden && !isHovered;

    return (
        <header 
            onMouseEnter={() => isNavHidden && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`border border-[var(--theme-border)] bg-[var(--theme-card)] backdrop-blur-2xl px-6 flex items-center justify-between z-[45] shrink-0 overflow-hidden group`}
            style={{ 
                margin: `var(--theme-tab-section-margin, ${tabSectionMargin ?? 12}px)`,
                borderRadius: `var(--radius-theme, ${borderRadius ?? 12}px)`,
                borderWidth: `${borderWidth ?? 1}px`,
                borderStyle: borderStyle || 'solid',
                height: effectiveIsNavHidden ? '40px' : '64px',
                transition: `all ${animationSpeed || 0.4}s cubic-bezier(0.16, 1, 0.3, 1)`,
            }}
        >
            <div className="flex items-center justify-between w-full h-full">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={toggleNav} 
                            className={`p-1.5 bg-white/5 hover:bg-[var(--theme-primary)] hover:text-white rounded-lg text-white/40 transition-all shadow-lg border border-white/5 shrink-0`}
                        >
                            <Menu size={16} />
                        </button>
                        
                        <div className={`flex items-center gap-3 ${!effectiveIsNavHidden ? 'pr-6 border-r border-white/5' : ''} shrink-0`}>
                            {logoUrl ? (
                                <div style={{ height: effectiveIsNavHidden ? '20px' : '32px', display: 'flex', alignItems: 'center' }}>
                                    <img 
                                        src={mode === 'dark' && logoDarkUrl ? logoDarkUrl : logoUrl} 
                                        alt={systemName} 
                                        style={{ height: `${(effectiveIsNavHidden ? 20 : 32) * (logoScale || 1)}px` }} 
                                        className="object-contain transition-all" 
                                    />
                                </div>
                            ) : (
                                <div className={`${effectiveIsNavHidden ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'} rounded-lg bg-[var(--theme-primary)] flex items-center justify-center font-bold shrink-0`}>S</div>
                            )}
                            {!effectiveIsNavHidden && <span className="font-black tracking-tighter text-sm uppercase italic truncate max-w-[150px]">{systemName || brand.name}</span>}
                        </div>
                    </div>
                    
                    {isTopbar && (
                        <nav 
                            className="hidden lg:flex flex-1 items-center gap-1 overflow-x-auto custom-scrollbar-hide mx-4"
                            style={{
                                justifyContent: discoveredModules.length > 6 ? 'flex-start' : 'center',
                            }}
                        >
                            {discoveredModules.filter(m => m.status === 'online').map(mod => (
                                <button 
                                    key={mod.id} 
                                    onClick={() => setActiveModuleId(mod.id)} 
                                    title={mod.label}
                                    className={`flex items-center justify-center transition-all whitespace-nowrap font-tab shrink-0 
                                        ${effectiveIsNavHidden 
                                            ? `w-8 h-8 rounded-lg ${activeModuleId === mod.id ? 'bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]' : 'text-white/20 hover:text-white'}`
                                            : `px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${activeModuleId === mod.id ? 'bg-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/30 scale-105' : 'text-white/40 hover:text-white hover:bg-white/5'}`
                                        }
                                    `}
                                >
                                    {effectiveIsNavHidden ? (
                                        <div className="scale-75"><IconRenderer name={mod.icon} /></div>
                                    ) : mod.label}
                                </button>
                            ))}
                        </nav>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* 1. Search Widget */}
                    <ShellSearchWidget variant={effectiveIsNavHidden ? 'icon' : 'bar'} onClick={() => setIsSearchOpen(true)} />
                    
                    <div className={`flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10 ${effectiveIsNavHidden ? 'scale-90' : ''}`}>
                        <button className="p-1.5 text-white/20 hover:text-white transition-colors relative">
                            <Bell size={14} />
                            <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-[var(--theme-primary)] rounded-full border border-black" />
                        </button>
                        {extraToolbarItems}
                    </div>

                    {/* 4. User Widget */}
                    <ShellUserWidget user={user} logout={logout} variant={effectiveIsNavHidden ? 'mini' : 'horizontal'} />
                </div>
            </div>
        </header>
    );
};
;

