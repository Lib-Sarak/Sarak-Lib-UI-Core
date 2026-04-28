import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import ThemeToggle from '../../../components/atomic/Buttons/ThemeToggle';
import { DiscoveredModule } from '../../../constants/discovery';
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
}

export const TopbarNav: React.FC<TopbarNavProps> = ({
    design, brand, toggleNav, setIsSearchOpen, activeModuleId, setActiveModuleId, discoveredModules, extraToolbarItems
}) => {
    const { 
        mode, navigationStyle, isNavHidden, systemName, logoUrl, logoDarkUrl, logoScale, 
        logoPosition, searchStyle, tabSectionMargin, borderRadius, borderWidth, borderStyle
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
                {searchStyle === 'minimal' && (
                    <div className="hidden md:flex items-center w-64 group relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-muted)] group-focus-within:text-[var(--theme-primary)] transition-colors" />
                        <input type="text" placeholder="Smart Search..." onClick={() => setIsSearchOpen(true)} readOnly className="w-full h-9 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-[var(--radius-theme)] pl-10 pr-4 text-xs font-bold text-[var(--theme-title)]/60 hover:bg-white/[0.08] hover:border-[var(--theme-primary)]/50 transition-all cursor-pointer" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-3xs text-white/20 font-black opacity-0 group-hover:opacity-100"><span>CTRL</span><span>K</span></div>
                    </div>
                )}
                
                <div className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <ThemeToggle />
                    {searchStyle !== 'minimal' && (
                        <button onClick={() => setIsSearchOpen(true)} className="p-2 text-white/20 hover:text-white transition-colors"><Search size={16} /></button>
                    )}
                    {extraToolbarItems}
                </div>
                <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"><Bell size={14} /></div>
            </div>
        </header>
    );
};

