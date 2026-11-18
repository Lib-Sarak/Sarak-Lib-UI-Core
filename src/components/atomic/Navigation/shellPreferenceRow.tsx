import React from 'react';
import type { SarakPreferenceId } from '../../../core/Provider/preferencesTypes';
import type { LibraryTextFn } from '../../../core/i18n/useLibraryText';
import { SarakMenuItem } from './SarakMenuItem';
import { SarakShellThemeToggle } from './SarakShellThemeToggle';
import { SarakShellLanguageSelector } from './SarakShellLanguageSelector';
import { ShellFontSizeControl } from './ShellFontSizeControl';
import { ShellNavigationStyleControl } from './ShellNavigationStyleControl';

export interface ShellPreferenceRowContext {
    /** Estado atual de `design.isNavHidden` — só usado pela linha de `navCollapsed`. */
    isNavHidden: boolean;
    /** Grava a preferência de recolhimento (a mesma função que o toggle de sempre usa). */
    onToggleNavCollapsed: () => void;
    /**
     * O texto da lib no idioma que vale. Recebido de fora — nunca lido por
     * `useLibraryText()` aqui dentro: esta função não é um componente, e é chamada
     * dentro de um `.map()` do chamador; um hook aqui violaria a ordem de chamada
     * entre renders (a lista de preferências muda de tamanho).
     */
    t: LibraryTextFn;
}

/**
 * Dispatcher central — a ÚNICA função que decide qual controle representa
 * cada preferência dentro do ⚙ "Preferências" ou do drawer mobile (onde tudo
 * que é oferecido é listado sem distinção fixada/no-menu — Spec 05 §2.3).
 * `colorMode`/`language` reusam os átomos que já existiam antes desta barra
 * (`ShellThemeToggle`/`ShellLanguageSelector`, variante `vertical` = linha de
 * menu); `navCollapsed` ganha uma linha própria porque `ChromeCollapseToggle`
 * (o botão-ícone do `SarakAppChrome`) não tem variante de linha.
 */
export const renderShellPreferenceRow = (id: SarakPreferenceId, ctx: ShellPreferenceRowContext): React.ReactNode => {
    switch (id) {
        case 'colorMode':
            return <SarakShellThemeToggle key={id} variant="vertical" />;
        case 'navCollapsed':
            return (
                <SarakMenuItem
                    key={id}
                    onClick={ctx.onToggleNavCollapsed}
                    label={ctx.isNavHidden ? ctx.t('chromeCollapseExpand') : ctx.t('chromeCollapseCollapse')}
                />
            );
        case 'fontSize':
            return <ShellFontSizeControl key={id} variant="menu" />;
        case 'navigationStyle':
            return <ShellNavigationStyleControl key={id} variant="menu" />;
        case 'language':
            return <SarakShellLanguageSelector key={id} variant="vertical" />;
        default:
            return null;
    }
};
