import React from 'react';
import { SarakIcon } from '../../../components/atomic/Icon/SarakIcon';
import { SarakButton } from '../../../components/atomic/Buttons/SarakButton';
import { SarakIconButton } from '../../../components/atomic/Buttons/SarakIconButton';
import { DiscoveredModule } from '../../../core/Discovery/types';
import { SarakDesignState } from '../../../core/Provider/types';
import { ShellUser } from './types';
import { ShellSearchWidget } from './ShellSearchWidget';
import { ShellUserWidget } from './ShellUserWidget';
import { ShellLanguageSelector } from './ShellLanguageSelector';
import { ShellThemeToggle } from './ShellThemeToggle';
import { IconRenderer } from './IconRenderer';
import { useShellLayoutStyles } from '../hooks/useShellLayoutStyles';

interface TopbarNavProps {
    design: SarakDesignState;
    brand: { name?: string };
    toggleNav: () => void;
    setIsSearchOpen: (open: boolean) => void;
    activeModuleId: string | null;
    setActiveModuleId: (id: string) => void;
    discoveredModules: DiscoveredModule[];
    extraToolbarItems?: React.ReactNode;
    user?: ShellUser;
    logout?: () => void;
    startResizing: () => void;
}

export const TopbarNav: React.FC<TopbarNavProps> = ({
    design, brand, toggleNav, setIsSearchOpen, activeModuleId, setActiveModuleId, discoveredModules, extraToolbarItems, user, logout, startResizing
}) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const {
        mode, navigationStyle, isNavHidden, systemName, logoUrl, logoDarkUrl, logoScale,
        logoPosition, tabSectionMargin, borderRadius, borderWidth, borderStyle, animationSpeed,
        topbarHeight
    } = design || {};
    
    const { topbarClass } = useShellLayoutStyles(design);

    const isTopbar = navigationStyle === 'topbar';

    // Sovereign Logic: Parity with Sidebar Hover
    const effectiveIsNavHidden = isNavHidden && !isHovered;

    const searchPos = design?.searchPositionTopbar || 'left';
    
    const activeLogo = mode === 'dark' && logoDarkUrl ? logoDarkUrl : logoUrl;
    const isVideo = (url?: string) => url?.includes('video') || url?.endsWith('.webm') || url?.endsWith('.mp4');

    const renderSearch = () => {
        if (searchPos === 'hidden') return null;
        return <ShellSearchWidget variant={effectiveIsNavHidden ? 'icon' : 'bar'} onClick={() => setIsSearchOpen(true)} />;
    };

    return (
        <header
            onMouseEnter={() => isNavHidden && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`${topbarClass} px-6 flex items-center justify-between z-[45] shrink-0 group relative !overflow-visible`}
            style={{
                margin: `var(--theme-tab-section-margin, ${tabSectionMargin ?? 12}px)`,
                borderRadius: `var(--radius-theme, ${borderRadius ?? 12}px)`,
                height: effectiveIsNavHidden ? 'var(--sarak-topbar-collapsed-height, 40px)' : `${topbarHeight || 64}px`,
                backgroundColor: 'var(--theme-topbar-bg)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                border: `var(--border-width, 1px) solid var(--theme-border)`,
            }}
        >
            {/* Background isolado para evitar o bug de clip-path do backdrop-filter no Chromium */}
            <div className="absolute inset-0 backdrop-blur-2xl pointer-events-none" style={{ borderRadius: `inherit` }} />
            
            <div className="flex items-center justify-between w-full h-full relative z-10 !overflow-visible">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <SarakIconButton
                            onClick={toggleNav}
                            variant="secondary"
                            size="sm"
                            className="shrink-0"
                            icon={<SarakIcon name="Menu" size={16} />}
                        />

                        <div className={`flex items-center gap-3 ${!effectiveIsNavHidden ? 'pr-6 border-r border-[var(--theme-border)]' : ''} shrink-0`}>
                            {logoUrl ? (
                                <div style={{ height: effectiveIsNavHidden ? 'var(--sarak-brand-logo-size-collapsed, 20px)' : 'var(--sarak-shell-brand-logo-size, 32px)', display: 'flex', alignItems: 'center' }}>
                                    {isVideo(activeLogo) ? (
                                        <video
                                            src={activeLogo}
                                            autoPlay loop muted playsInline
                                            style={{ height: `${(effectiveIsNavHidden ? 20 : 32) * (logoScale || 1)}px` }}
                                            className="object-contain transition-all"
                                        />
                                    ) : (
                                        <img
                                            src={activeLogo}
                                            alt={systemName}
                                            style={{ height: `${(effectiveIsNavHidden ? 20 : 32) * (logoScale || 1)}px` }}
                                            className="object-contain transition-all"
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className={`${effectiveIsNavHidden ? 'w-6 h-6 text-2xs' : 'w-8 h-8 text-xs'} rounded-lg bg-[var(--theme-primary)] flex items-center justify-center font-bold shrink-0`}>S</div>
                            )}
                            {!effectiveIsNavHidden && <span className="font-black tracking-tighter text-sm uppercase italic truncate max-w-[var(--sarak-topbar-label-max-width,150px)]">{systemName || brand.name}</span>}
                        </div>
                        {searchPos === 'left' && renderSearch()}
                    </div>

                    {isTopbar && (
                        <nav
                            // O scanner do Tailwind v4 lê o arquivo como texto, então o breakpoint tem de
                            // estar LITERAL na classe (mesmo valor de BREAKPOINT_DESKTOP) — não é valor de
                            // tema, é sintaxe da ferramenta em build-time (07-responsividade-e-multidispositivo.md §2.1).
                            // sarak-allow-hardcode: breakpoint de container query do Tailwind (plan-39), não valor de tema
                            className="hidden @min-[1024px]:flex flex-1 items-center gap-1 overflow-x-auto custom-scrollbar-hide mx-4"
                            style={{
                                justifyContent: discoveredModules.length > 6 ? 'flex-start' : 'center',
                            }}
                        >
                            {discoveredModules.filter(m => m.status === 'online').map(mod => (
                                <SarakButton
                                    key={mod.id}
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => setActiveModuleId(mod.id)}
                                    title={mod.label}
                                    className={`whitespace-nowrap font-tab shrink-0
                                        ${effectiveIsNavHidden
                                            ? `w-8 h-8 !p-0 rounded-lg ${activeModuleId === mod.id ? 'bg-[var(--sarak-topbar-active-color,rgba(var(--theme-primary-rgb),0.2))] text-[var(--theme-primary)]' : 'text-[var(--theme-muted)] hover:text-[var(--theme-title)] hover:bg-[var(--theme-muted)]/10'}`
                                            : `rounded-full text-2xs ${activeModuleId === mod.id ? 'bg-[var(--sarak-topbar-active-color,var(--theme-primary))] text-[var(--theme-on-primary)] shadow-lg shadow-[var(--theme-primary)]/30 scale-105' : 'text-[var(--theme-muted)] hover:text-[var(--theme-title)] hover:bg-[var(--theme-muted)]/10'}`
                                        }
                                    `}
                                >
                                    {effectiveIsNavHidden ? (
                                        <div className="scale-75"><IconRenderer name={mod.icon} /></div>
                                    ) : mod.label}
                                </SarakButton>
                            ))}
                        </nav>
                    )}
                    
                    {searchPos === 'center' && (
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
                            {renderSearch()}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* 1. Search Widget */}
                    {searchPos === 'right' && renderSearch()}

                    <div className={`flex items-center gap-2 p-1 bg-[var(--theme-muted)]/10 rounded-xl border border-[var(--theme-border)] !overflow-visible ${effectiveIsNavHidden ? 'scale-90' : ''}`}>
                        <ShellLanguageSelector variant="horizontal" />

                        <div className="w-[var(--theme-border-width,1px)] h-4 bg-[var(--theme-border)] mx-1" />

                        <ShellThemeToggle variant="horizontal" />

                        <SarakIconButton
                            variant="ghost"
                            size="xs"
                            className="relative text-[var(--theme-muted)] hover:text-[var(--theme-title)]"
                            icon={<>
                                <SarakIcon name="Bell" size={14} />
                                <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-[var(--theme-primary)] rounded-full border border-[var(--theme-card)]" />
                            </>}
                        />
                        {extraToolbarItems}
                    </div>

                    {/* 4. User Widget */}
                    <ShellUserWidget user={user} logout={logout} variant={effectiveIsNavHidden ? 'mini' : 'horizontal'} />
                </div>
            </div>

            {/* RESIZE HANDLE (Y-AXIS) */}
            {!effectiveIsNavHidden && (
                <div
                    onMouseDown={startResizing}
                    className="absolute bottom-0 left-0 w-full h-1.5 cursor-row-resize hover:bg-[var(--theme-primary)]/40 active:bg-[var(--theme-primary)] transition-all z-[1000]"
                    title="Arraste para ajustar a altura"
                />
            )}
        </header>
    );
};
