import React, { useState } from 'react';
import { useFocusTrap } from '../Modals/hooks/useFocusTrap';
import { SarakIconButton } from '../Buttons/SarakIconButton';
import { SarakIcon } from '../Icon/SarakIcon';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import type { PreferenceId } from '../../../core/Provider/preferencesTypes';
import { renderShellPreferenceRow, type ShellPreferenceRowContext } from './shellPreferenceRow';

export interface ShellPreferencesMenuProps extends ShellPreferenceRowContext {
    /** TODAS as preferências oferecidas (fixadas inclusive). Vazio = não monta. */
    menuIds: PreferenceId[];
    /** Lado da tela em que a barra vive — decide para onde o menu abre. */
    align?: 'start' | 'end';
    className?: string;
}

const MENU_ID = 'sarak-preferences-menu';

/**
 * O widget ⚙ "Preferências" (Spec 05 §2.2.1, nova subseção "a barra
 * configurada pelo administrador") — compartilhado pelos DOIS cromos
 * (`SarakShell` e `SarakAppChrome`), porque vive em `components/atomic/`
 * como os demais widgets de cromo (`ShellThemeToggle`, `ShellUserWidget`…):
 * `core/Shell` não pode importar `components/Layout/`, então o único jeito
 * de não duplicar esta UI é morar na camada atômica.
 *
 * Overlay acessível: abre/fecha por teclado, ESC fecha e o foco volta ao
 * próprio botão ao fechar — mesmo modelo de `useFocusTrap` do drawer mobile
 * (`SarakAppChromeMobile`, Spec 10 §2.4a). Nunca monta com o menu vazio: não
 * existe botão que abre um painel sem nada dentro.
 */
export const ShellPreferencesMenu: React.FC<ShellPreferencesMenuProps> = ({
    menuIds, isNavHidden, onToggleNavCollapsed, align = 'end', className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const close = () => setIsOpen(false);
    const { containerRef, handleTrap } = useFocusTrap(isOpen, close);

    if (menuIds.length === 0) return null;

    return (
        <div className={mergeSarakClasses('relative', className)} data-sarak-widget="preferences-menu">
            <SarakIconButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-controls={MENU_ID}
                aria-label={isOpen ? 'Fechar preferências' : 'Preferências'}
                icon={<SarakIcon name="Settings" size={16} />}
            />
            {isOpen && (
                <div
                    id={MENU_ID}
                    ref={containerRef}
                    role="menu"
                    aria-label="Preferências"
                    onKeyDown={handleTrap}
                    className={`absolute z-[1000] top-full mt-[var(--sarak-layout-gap-sm,8px)] min-w-[var(--sarak-context-menu-min-width,220px)] rounded-[var(--sarak-card-radius,12px)] border p-[var(--sarak-layout-gap-sm,4px)] flex shadow-2xl ${
                        align === 'end' ? 'right-0' : 'left-0'
                    }`}
                    style={{
                        flexDirection: 'column',
                        gap: 'var(--sarak-layout-gap-sm, 2px)',
                        background: 'var(--color-theme-card,#1e293b)',
                        borderColor: 'var(--border-color, var(--theme-border, rgba(255,255,255,0.1)))',
                    }}
                >
                    {menuIds.map((id) => renderShellPreferenceRow(id, { isNavHidden, onToggleNavCollapsed }))}
                </div>
            )}
        </div>
    );
};

export default ShellPreferencesMenu;
