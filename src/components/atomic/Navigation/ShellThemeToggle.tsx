import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { SarakIconButton } from '../Buttons/SarakIconButton';
import { SarakMenuItem } from './SarakMenuItem';

export interface ShellThemeToggleProps {
    variant?: 'horizontal' | 'vertical' | 'mini';
}

export const ShellThemeToggle: React.FC<ShellThemeToggleProps> = ({ variant = 'horizontal' }) => {
    const { design, updatePreferences } = useSarakUI();

    // Safely fallback to 'dark' if undefined
    const isDarkMode = (design?.mode || 'dark') === 'dark';

    /**
     * Este toggle grava PREFERÊNCIA de modo, nunca o tema — para não deixar
     * o clique de um usuário reescrever o design do sistema para todos. Quem
     * resolve a contraparte autorada (ou o fallback sintetizado dos temas
     * legados) é `overlayPreferences`, no Provider — o mesmo mecanismo da
     * Decisão D (plan-24-1 §2.8), só que reativo à preferência guardada em
     * vez de escrito direto no design do sistema.
     */
    const toggleTheme = () => {
        updatePreferences({ colorMode: isDarkMode ? 'light' : 'dark' });
    };

    if (variant === 'mini') {
        return (
            <SarakIconButton
                onClick={toggleTheme}
                variant="ghost"
                size="md"
                className="w-full rounded-xl text-[var(--theme-muted)] hover:bg-[var(--theme-muted)]/10 hover:text-[var(--theme-title)]"
                title={`Mudar para modo ${isDarkMode ? 'claro' : 'escuro'}`}
                icon={isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            />
        );
    }

    if (variant === 'vertical') {
        return (
            <SarakMenuItem
                onClick={toggleTheme}
                className="group font-tab"
                icon={isDarkMode ? (
                    <Sun size={18} className="text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)]" />
                ) : (
                    <Moon size={18} className="text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)]" />
                )}
                label={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            />
        );
    }

    // Horizontal Variant (Topbar)
    return (
        <SarakIconButton
            onClick={toggleTheme}
            variant="ghost"
            size="xs"
            className="relative text-[var(--theme-muted)] hover:text-[var(--theme-title)] hover:bg-[var(--theme-muted)]/10"
            title={`Mudar para modo ${isDarkMode ? 'claro' : 'escuro'}`}
            icon={isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        />
    );
};
