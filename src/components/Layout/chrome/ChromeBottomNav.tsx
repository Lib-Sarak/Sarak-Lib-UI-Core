import React from 'react';
import { SarakMenuItem } from '../../atomic/Navigation/SarakMenuItem';
import type { SarakShellNavItem } from '../../atomic/Navigation/SarakShellNav';
import { useLibraryText } from '../../../core/i18n/useLibraryText';

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
    return (
        <nav
            aria-label={t('shellNavAriaLabel')}
            data-sarak-bottom-nav=""
            className="flex items-stretch shrink-0 w-full min-w-0 overflow-x-auto border-t"
            style={{
                background: 'var(--sarak-topbar-bg, var(--theme-sidebar-bg, transparent))',
                borderColor: 'var(--border-color, var(--theme-border, rgba(255,255,255,0.1)))',
                gap: 'var(--sarak-layout-gap-sm, 8px)',
                paddingInline: 'var(--sarak-layout-gap-sm, 8px)',
                paddingTop: 'var(--sarak-layout-gap-sm, 8px)',
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + var(--sarak-layout-gap-sm, 8px))',
            }}
        >
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
                        className="relative flex-1 flex-col gap-1 px-1 py-1 rounded-lg text-xs font-medium"
                        style={{
                            minHeight: 'var(--sarak-touch-target-active, 0px)',
                            minWidth: 'var(--sarak-touch-target-active, 0px)',
                        }}
                    >
                        {active && (
                            <span
                                aria-hidden="true"
                                className="absolute left-1/2 -translate-x-1/2 top-0 h-0.5 w-4 rounded-full"
                                style={{ background: 'var(--sarak-nav-marker-color, #00f2ff)' }}
                            />
                        )}
                    </SarakMenuItem>
                );
            })}
        </nav>
    );
};

export default ChromeBottomNav;
