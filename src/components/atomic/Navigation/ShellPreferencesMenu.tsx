import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SarakPortalScope } from '../../../core/Provider/components/SarakPortalScope';
import { useSarakPortalFrame } from '../../../core/Provider/portalFrame';
import { placeAnchored, type AnchoredCoords } from './internal/anchoredPosition';
import { useFocusTrap } from '../Modals/hooks/useFocusTrap';
import { SarakIconButton } from '../Buttons/SarakIconButton';
import { SarakIcon } from '../Icon/SarakIcon';
import { SarakMenuItem } from './SarakMenuItem';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import type { SarakPreferenceId } from '../../../core/Provider/preferencesTypes';
import { renderShellPreferenceRow, type ShellPreferenceRowContext } from './shellPreferenceRow';

export interface ShellPreferencesMenuProps extends Omit<ShellPreferenceRowContext, 't'> {
    /** TODAS as preferências oferecidas (fixadas inclusive). Vazio = não monta. */
    menuIds: SarakPreferenceId[];
    /** Widgets de composição que compartilham o mesmo menu de preferências. */
    additionalRows?: React.ReactNode;
    /** Lado da tela em que a barra vive — decide para onde o menu abre. */
    align?: 'start' | 'end';
    /**
     * `icon` é o botão só de ícone (barra do topo); `row` é a linha da lateral, com a métrica do item de menu: ícone e
     * rótulo (recolhida, só o ícone centrado no eixo da lista).
     */
    variant?: 'icon' | 'row';
    className?: string;
}

const MENU_ID = 'sarak-preferences-menu';

/**
 * O widget ⚙ "Preferências" (Spec 05 §2.2.1, nova subseção "a barra
 * configurada pelo administrador") — vive na camada atômica para compor
 * a barra do `SarakAppChrome` junto aos demais widgets.
 *
 * O menu vive num portal (o `body`, ou a moldura do host que desenha o sistema, como a prévia do painel), em `fixed` a partir do retângulo do botão: a lateral recolhida tem 74 px e o
 * `overflow` dela cortaria um menu absoluto ("Lateral", "P M G" saíam pela metade). Na lateral abre ao lado do
 * botão, alinhado à base; no topo, abaixo e alinhado à borda final.
 *
 * Overlay acessível: abre/fecha por teclado, ESC fecha e o foco volta ao
 * próprio botão ao fechar — mesmo modelo de `useFocusTrap` do drawer mobile
 * (`SarakAppChromeMobile`, Spec 10 §2.4a). Nunca monta com o menu vazio: não
 * existe botão que abre um painel sem nada dentro.
 */
export const ShellPreferencesMenu: React.FC<ShellPreferencesMenuProps> = ({
    menuIds, isNavHidden, onToggleNavCollapsed, additionalRows, align = 'end', variant = 'icon', className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState<AnchoredCoords | null>(null);
    const anchorRef = useRef<HTMLDivElement | null>(null);
    const close = () => setIsOpen(false);
    const { containerRef, handleTrap } = useFocusTrap(isOpen, close);
    const t = useLibraryText();
    const { container, localize } = useSarakPortalFrame();

    useLayoutEffect(() => {
        if (!isOpen || !anchorRef.current || !containerRef.current) {
            setCoords(null);
            return;
        }
        setCoords(localize(placeAnchored(anchorRef.current.getBoundingClientRect(), containerRef.current.getBoundingClientRect(), align === 'start' ? 'side-up' : 'below-end')));
    }, [isOpen, align, containerRef, localize]);

    if (menuIds.length === 0 && !additionalRows) return null;

    return (
        <div ref={anchorRef} className={mergeSarakClasses('relative', className)} data-sarak-widget="preferences-menu">
            {variant === 'row' ? (
                <SarakMenuItem
                    icon="Settings"
                    label={t('preferencesLabel')}
                    collapsed={isNavHidden}
                    aria-label={t('preferencesLabel')}
                    onClick={() => setIsOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    aria-controls={MENU_ID}
                />
            ) : (
                <SarakIconButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    aria-controls={MENU_ID}
                    aria-label={isOpen ? t('preferencesCloseAriaLabel') : t('preferencesLabel')}
                    icon={<SarakIcon name="Settings" size={16} />}
                />
            )}
            {isOpen && container !== null && createPortal(
                <SarakPortalScope>
                    <div
                        id={MENU_ID}
                        ref={containerRef}
                        role="menu"
                        aria-label={t('preferencesLabel')}
                        onKeyDown={handleTrap}
                        className="fixed z-[calc(var(--sarak-z-sidebar,500)_+_100)] min-w-[var(--sarak-context-menu-min-width,10rem)] max-w-[calc(100vw-var(--sarak-layout-gap-md,16px)*2)] rounded-[var(--sarak-card-radius,10px)] border p-[var(--sarak-layout-gap-sm,8px)] flex shadow-[var(--dynamic-shadow)]"
                        style={{
                            flexDirection: 'column',
                            gap: 'var(--sarak-layout-gap-sm, 8px)',
                            background: 'var(--color-theme-card,#101622)',
                            borderColor: 'var(--border-color, var(--theme-border, rgba(255,255,255,0.09)))',
                            top: coords ? coords.top : -9999,
                            left: coords ? coords.left : -9999,
                            visibility: coords ? 'visible' : 'hidden',
                        }}
                    >
                        {menuIds.map((id) => renderShellPreferenceRow(id, { isNavHidden, onToggleNavCollapsed, t }))}
                        {additionalRows}
                    </div>
                </SarakPortalScope>,
                container,
            )}
        </div>
    );
};

export default ShellPreferencesMenu;
