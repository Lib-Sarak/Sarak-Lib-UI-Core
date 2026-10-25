import React from 'react';
import { SarakMenuItem } from '../../atomic/Navigation/SarakMenuItem';
import type { SarakShellNavItem } from '../../atomic/Navigation/SarakShellNav';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { useNavigationAppearance } from '../../../core/Provider/useNavigationAppearance';
import { resolveChromeBackground, resolveChromeSurfaceBorderStyle } from './chromeStructuralStyles';
import { chromeNoiseLayerStyle } from './noiseTexture';

/**
 * ChromeBottomNav — a navegação do celular numa barra na base, na zona do polegar.
 *
 * É irmã do painel de conteúdo dentro da coluna do cromo (não `position: fixed`): a raiz tem
 * altura de janela e o painel é quem rola, então a barra fica na base e nada do conteúdo passa por
 * baixo dela. Cada item é o mesmo `SarakMenuItem` do menu — link de verdade, `aria-current`,
 * `badge`, `disabled` — só empilhado (ícone sobre rótulo). Categoria não vira cabeçalho: a barra é
 * plana.
 *
 * A caixa tocável vem de `--sarak-touch-target-active` (token `touchTargetMin` com ponteiro de dedo,
 * `0px` com mouse), e o respiro da área segura de `env(safe-area-inset-bottom)`.
 */
export interface ChromeBottomNavProps {
    items: SarakShellNavItem[];
    activeRoute?: string;
    onNavigate?: (route: string) => void;
}

export const ChromeBottomNav: React.FC<ChromeBottomNavProps> = ({ items, activeRoute, onNavigate }) => {
    const t = useLibraryText();
    const { topbarBorderSide, topbarBorderStyle, topbarBackgroundStyle, topbarItemDensity } = useNavigationAppearance();
    return (
        <nav
            aria-label={t('shellNavAriaLabel')}
            data-sarak-bottom-nav=""
            className="relative flex items-stretch shrink-0 w-full min-w-0 overflow-x-auto"
            style={{
                background: resolveChromeBackground(topbarBackgroundStyle, '--sarak-topbar-bg', 'var(--theme-topbar-bg, var(--theme-sidebar-bg, transparent))'),
                ...resolveChromeSurfaceBorderStyle({
                    side: topbarBorderSide,
                    style: topbarBorderStyle,
                    widthVariable: '--sarak-topbar-border-width',
                    colorVariable: '--sarak-topbar-border-color',
                    surface: 'bottom-nav',
                }),
                gap: 'var(--sarak-layout-gap-sm, 8px)',
                paddingInline: 'var(--sarak-layout-gap-sm, 8px)',
                paddingTop: 'var(--sarak-layout-gap-sm, 8px)',
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + var(--sarak-layout-gap-sm, 8px))',
            }}
        >
            {topbarBackgroundStyle === 'texture' && (
                <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none mix-blend-overlay"
                    style={chromeNoiseLayerStyle('--sarak-topbar-noise-opacity', true)}
                />
            )}
            {items.map((item) => {
                const active = item.route === activeRoute;
                return (
                    <SarakMenuItem
                        key={item.route}
                        href={item.route}
                        target={item.target}
                        disabled={item.disabled}
                        badge={item.badge}
                        onNavigate={onNavigate}
                        active={active}
                        orientation="horizontal"
                        icon={item.icon}
                        label={item.label}
                        className={`relative z-10 flex-1 flex-col text-xs font-medium ${topbarItemDensity === 'compact' ? 'gap-0.5 px-1 py-0.5' : topbarItemDensity === 'spacious' ? 'gap-2 px-2 py-2' : 'gap-1 px-1 py-1'}`}
                        markerPosition="top"
                        style={{
                            minHeight: 'var(--sarak-touch-target-active, 0px)',
                            minWidth: 'var(--sarak-touch-target-active, 0px)',
                        }}
                    />
                );
            })}
        </nav>
    );
};

export default ChromeBottomNav;
