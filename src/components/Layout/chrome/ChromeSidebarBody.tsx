import React from 'react';
import { SarakShellNav, type ShellNavItem } from '../../atomic/Navigation/SarakShellNav';
import { ChromeFrame } from './ChromeFrame';
import { ChromeBrand, ChromeSearchSlot, ChromeSidebarSlot, ChromeTopbarSlot } from './ChromeSlots';
import { resolveChromeAsidePositionClass, resolveChromeBodyDirectionClass, resolveChromeContentAlignmentClass } from './chromeStructuralStyles';
import { useChromeAutoHide } from './useChromeAutoHide';
import { useChromeDesignTokens } from './useChromeDesignTokens';

export interface ChromeSidebarBodyProps {
    brand?: { name?: string; logoUrl?: string };
    logo?: React.ReactNode;
    nav: ShellNavItem[];
    activeRoute?: string;
    onNavigate?: (route: string) => void;
    topbarStart?: React.ReactNode;
    endSlot?: React.ReactNode;
    sidebarHeader?: React.ReactNode;
    sidebarFooter?: React.ReactNode;
    search?: React.ReactNode;
    banner?: React.ReactNode;
    footer?: React.ReactNode;
    decoration?: React.ReactNode;
    className: string;
    rootStyle: React.CSSProperties;
    children: React.ReactNode;
}

/**
 * Corpo do modo SIDEBAR do `SarakAppChrome` — extraído de `SarakAppChrome.tsx`
 * para o arquivo caber no teto de 250 linhas (R9) antes de ganhar o consumo
 * dos tokens de cromo que faltavam.
 */
export const ChromeSidebarBody: React.FC<ChromeSidebarBodyProps> = ({
    brand, logo, nav, activeRoute, onNavigate, topbarStart, endSlot, sidebarHeader, sidebarFooter,
    search, banner, footer, decoration, className, rootStyle, children,
}) => {
    const { sidebarPosition, contentAlignment, isNavHidden, isAutoHideEnabled, searchPositionSidebar } = useChromeDesignTokens();
    const { isVisible, sensorProps, surfaceProps } = useChromeAutoHide(isAutoHideEnabled);

    return (
        <ChromeFrame decoration={decoration} banner={banner} footer={footer} className={className} rootStyle={rootStyle}>
            <div className={`relative flex flex-1 min-w-0 min-h-0 ${resolveChromeBodyDirectionClass(sidebarPosition)}`}>
                {isAutoHideEnabled && !isVisible && (
                    <div {...sensorProps} aria-hidden="true" className="fixed left-0 top-0 w-4 h-full z-[60] cursor-pointer" />
                )}
                {isVisible && (
                    <aside
                        {...surfaceProps}
                        className={`flex flex-col shrink-0 overflow-y-auto transition-[width] duration-300 ${resolveChromeAsidePositionClass(sidebarPosition)}`}
                        style={{
                            width: isNavHidden ? 'var(--sarak-sidebar-collapsed-width, 74px)' : 'var(--sarak-sidebar-width, 240px)',
                            margin: 'var(--sarak-tab-section-margin, 0px)',
                            background: 'var(--sarak-sidebar-bg, var(--theme-sidebar-bg, transparent))',
                            borderColor: 'var(--border-color, var(--theme-border, rgba(255,255,255,0.1)))',
                        }}
                    >
                        <ChromeBrand brand={brand} logo={logo} compact={isNavHidden} />
                        {/* Sem barra superior, `topbarStart`/`topbarEnd` degradam para topo/rodapé da sidebar. */}
                        <ChromeTopbarSlot region="start" className="px-2">{topbarStart}</ChromeTopbarSlot>
                        {searchPositionSidebar === 'top' && (
                            <ChromeSearchSlot position={searchPositionSidebar} className="px-2 pb-2">{search}</ChromeSearchSlot>
                        )}
                        <ChromeSidebarSlot region="header">{sidebarHeader}</ChromeSidebarSlot>
                        {nav.length > 0 && (
                            <SarakShellNav items={nav} activeRoute={activeRoute} onNavigate={onNavigate} orientation="vertical" collapsed={isNavHidden} className="flex-1" />
                        )}
                        {searchPositionSidebar === 'bottom' && (
                            <ChromeSearchSlot position={searchPositionSidebar} className="px-2 pt-2">{search}</ChromeSearchSlot>
                        )}
                        {/* Markup preservado byte a byte do `topbarActions` no modo sidebar (compat). */}
                        {endSlot && <div data-sarak-slot="topbarEnd" className="mt-auto p-2">{endSlot}</div>}
                        <ChromeSidebarSlot region="footer">{sidebarFooter}</ChromeSidebarSlot>
                    </aside>
                )}
                <main
                    className={`relative flex-1 min-w-0 min-h-0 overflow-auto ${resolveChromeContentAlignmentClass(contentAlignment)}`}
                    style={{ color: 'var(--text-main, var(--color-theme-title, inherit))' }}
                >
                    {children}
                </main>
            </div>
        </ChromeFrame>
    );
};

export default ChromeSidebarBody;
