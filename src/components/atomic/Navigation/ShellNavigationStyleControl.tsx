import React from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import type { SarakNavigationStylePreference } from '../../../core/Provider/preferencesTypes';
import { ShellPreferenceChoiceGroup, type ShellPreferenceChoice } from './internal/ShellPreferenceChoiceGroup';

export interface ShellNavigationStyleControlProps {
    /** `bar` é o grupo compacto fixado na barra; `menu`, as linhas do ⚙ e da gaveta. Omitida, vale `bar`. */
    variant?: 'bar' | 'menu';
    /** Só na variante `bar`: `vertical` é a coluna da barra lateral. */
    orientation?: 'horizontal' | 'vertical';
}

/**
 * Controle da preferência "navegação topo/lateral" (Spec 09 §4.7). Sem
 * escolha do usuário, mostra o que o TEMA já decidiu (`design.navigationStyle`)
 * — o clique grava PREFERÊNCIA, nunca o tema.
 */
export const ShellNavigationStyleControl: React.FC<ShellNavigationStyleControlProps> = ({ variant = 'bar', orientation }) => {
    const sarak = useSarakUIOptional();
    const t = useLibraryText();
    const themeStyle: SarakNavigationStylePreference = sarak?.design?.navigationStyle === 'topbar' ? 'topbar' : 'sidebar';
    const current = sarak?.preferences.navigationStyle ?? themeStyle;

    const choices: ShellPreferenceChoice<SarakNavigationStylePreference>[] = [
        { value: 'sidebar', label: t('navigationStyleSidebarLabel') },
        { value: 'topbar', label: t('navigationStyleTopbarLabel') },
    ];

    return (
        <ShellPreferenceChoiceGroup
            label={t('navigationStyleGroupAriaLabel')}
            heading={t('preferenceNavigationStyleRowLabel')}
            choices={choices}
            current={current}
            onSelect={(navigationStyle) => sarak?.updatePreferences({ navigationStyle })}
            variant={variant}
            orientation={orientation}
        />
    );
};

export default ShellNavigationStyleControl;
