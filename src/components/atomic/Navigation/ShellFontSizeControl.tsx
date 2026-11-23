import React from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import type { SarakFontSizePreference } from '../../../core/Provider/preferencesTypes';
import { ShellPreferenceChoiceGroup, type ShellPreferenceChoice } from './internal/ShellPreferenceChoiceGroup';

export interface ShellFontSizeControlProps {
    /** `bar` é o grupo compacto fixado na barra; `menu`, as linhas do ⚙ e da gaveta. Omitida, vale `bar`. */
    variant?: 'bar' | 'menu';
    /** Só na variante `bar`: `vertical` é a coluna da barra lateral. */
    orientation?: 'horizontal' | 'vertical';
}

/**
 * Controle da preferência "tamanho da fonte" (Spec 09 §4.7) — três degraus
 * relativos à base do tema, nunca um valor absoluto. Grava PREFERÊNCIA, nunca
 * o tema: quem resolve o `bodySize` efetivo é `overlayPreferences`, com a
 * redução de P e o aumento de G que o administrador configurou.
 */
export const ShellFontSizeControl: React.FC<ShellFontSizeControlProps> = ({ variant = 'bar', orientation }) => {
    const sarak = useSarakUIOptional();
    const t = useLibraryText();
    const current = sarak?.preferences.fontSize ?? 'md';

    const choices: ShellPreferenceChoice<SarakFontSizePreference>[] = [
        { value: 'sm', label: t('fontSizeSmallAbbrev'), full: t('fontSizeSmallFull') },
        { value: 'md', label: t('fontSizeMediumAbbrev'), full: t('fontSizeMediumFull') },
        { value: 'lg', label: t('fontSizeLargeAbbrev'), full: t('fontSizeLargeFull') },
    ];

    return (
        <ShellPreferenceChoiceGroup
            label={t('fontSizeGroupAriaLabel')}
            choices={choices}
            current={current}
            onSelect={(fontSize) => sarak?.updatePreferences({ fontSize })}
            variant={variant}
            orientation={orientation}
        />
    );
};

export default ShellFontSizeControl;
