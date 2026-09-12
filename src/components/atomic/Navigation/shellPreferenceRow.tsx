import React from 'react';
import type { PreferenceId } from '../../../core/Provider/preferencesTypes';
import { SarakMenuItem } from './SarakMenuItem';
import { ShellThemeToggle } from './ShellThemeToggle';
import { ShellLanguageSelector } from './ShellLanguageSelector';
import { ShellFontSizeControl } from './ShellFontSizeControl';
import { ShellNavigationStyleControl } from './ShellNavigationStyleControl';

export interface ShellPreferenceRowContext {
    /** Estado atual de `design.isNavHidden` — só usado pela linha de `navCollapsed`. */
    isNavHidden: boolean;
    /** Grava a preferência de recolhimento (a mesma função que o toggle de sempre usa). */
    onToggleNavCollapsed: () => void;
}

/**
 * Um item de menu por LINHA (label + controle), para as duas preferências
 * que não têm átomo próprio de navegação (`fontSize`/`navigationStyle`).
 */
const PreferenceMenuRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex items-center justify-between gap-[var(--sarak-layout-gap-sm,12px)] px-[var(--sarak-layout-gap-sm,12px)] py-[var(--sarak-layout-gap-sm,8px)]">
        <span className="text-sm text-[var(--text-muted,#94a3b8)]">{label}</span>
        {children}
    </div>
);

/**
 * Dispatcher central — a ÚNICA função que decide qual controle representa
 * cada preferência dentro do ⚙ "Preferências" ou do drawer mobile (onde tudo
 * que é oferecido é listado sem distinção fixada/no-menu — Spec 05 §2.3).
 * `colorMode`/`language` reusam os átomos que já existiam antes desta barra
 * (`ShellThemeToggle`/`ShellLanguageSelector`, variante `vertical` = linha de
 * menu); `navCollapsed` ganha uma linha própria porque `ChromeCollapseToggle`
 * (o botão-ícone do `SarakAppChrome`) não tem variante de linha.
 */
export const renderShellPreferenceRow = (id: PreferenceId, ctx: ShellPreferenceRowContext): React.ReactNode => {
    switch (id) {
        case 'colorMode':
            return <ShellThemeToggle key={id} variant="vertical" />;
        case 'navCollapsed':
            return (
                <SarakMenuItem
                    key={id}
                    onClick={ctx.onToggleNavCollapsed}
                    label={ctx.isNavHidden ? 'Expandir navegação' : 'Recolher navegação'}
                />
            );
        case 'fontSize':
            return (
                <PreferenceMenuRow key={id} label="Tamanho da fonte">
                    <ShellFontSizeControl />
                </PreferenceMenuRow>
            );
        case 'navigationStyle':
            return (
                <PreferenceMenuRow key={id} label="Navegação">
                    <ShellNavigationStyleControl />
                </PreferenceMenuRow>
            );
        case 'language':
            return <ShellLanguageSelector key={id} variant="vertical" />;
        default:
            return null;
    }
};
