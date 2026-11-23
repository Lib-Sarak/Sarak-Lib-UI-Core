import React from 'react';

import { SarakIcon } from "../Icon/SarakIcon";
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakIconButton } from '../Buttons/SarakIconButton';
import { SarakMenuItem } from './SarakMenuItem';

export interface SarakShellThemeToggleProps {
    /** Define o formato horizontal, vertical ou compacto; omitida, usa `horizontal`. O clique grava a preferência do usuário. */
    variant?: 'horizontal' | 'vertical' | 'mini';
}

export const SarakShellThemeToggle: React.FC<SarakShellThemeToggleProps> = ({ variant = 'horizontal' }) => {
    const { design, updatePreferences } = useSarakUI();
    const t = useLibraryText();

    // Safely fallback to 'dark' if undefined
    const isDarkMode = (design?.mode || 'dark') === 'dark';

    /**
     * Este toggle grava PREFERÊNCIA de modo, nunca o tema — para não deixar
     * o clique de um usuário reescrever o design do sistema para todos. Quem
     * resolve a contraparte autorada (ou o fallback sintetizado dos temas
     * legados) é `overlayPreferences`, no Provider. Assim, a preferência
     * guardada controla o modo sem reescrever o design do sistema.
     */
    const toggleTheme = () => {
        updatePreferences({ colorMode: isDarkMode ? 'light' : 'dark' });
    };

    // Lateral: uma linha com a métrica do item de menu (recolhida, só o ícone, no eixo dos ícones da lista).
    if (variant === 'mini' || variant === 'vertical') {
        return (
            <SarakMenuItem
                onClick={toggleTheme}
                className="font-tab"
                collapsed={variant === 'mini'}
                title={isDarkMode ? t('themeToggleTitleToLight') : t('themeToggleTitleToDark')}
                icon={isDarkMode ? 'Sun' : 'Moon'}
                label={isDarkMode ? t('themeToggleLabelLight') : t('themeToggleLabelDark')}
            />
        );
    }

    // Horizontal Variant (Topbar)
    return (
        <SarakIconButton
            onClick={toggleTheme}
            variant="ghost"
            size="xs"
            className="relative text-[var(--theme-muted)] hover:text-[var(--theme-text-primary,var(--sarak-text-main,#f2f6fb))] hover:bg-[var(--theme-muted)]/10"
            title={isDarkMode ? t('themeToggleTitleToLight') : t('themeToggleTitleToDark')}
            icon={isDarkMode ? <SarakIcon name="Sun" size={16} /> : <SarakIcon name="Moon" size={16} />}
        />
    );
};
