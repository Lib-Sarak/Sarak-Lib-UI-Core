import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSarakUI } from '../../Provider/SarakUIProvider';
import { SarakIconButton } from '../../../components/atomic/Buttons/SarakIconButton';
import { SarakButton } from '../../../components/atomic/Buttons/SarakButton';
import { syncThemeWithMode } from '../../Design/presets/themes/color-engine';
import type { SarakTokenValue } from '../../Design/types';
import type { SarakThemePayload } from '../../Provider/types';

interface ShellThemeToggleProps {
    variant?: 'horizontal' | 'vertical' | 'mini';
}

export const ShellThemeToggle: React.FC<ShellThemeToggleProps> = ({ variant = 'horizontal' }) => {
    const { design, applyFullConfigRaw } = useSarakUI();

    // Safely fallback to 'dark' if undefined
    const isDarkMode = (design?.mode || 'dark') === 'dark';

    /**
     * Decisão D (plan-24-1 §2.8): este toggle é o ÚNICO lugar que expressa a
     * intenção "quero ver ESTE tema no OUTRO modo" — por isso é aqui, e só
     * aqui, que `syncThemeWithMode` roda, computando a contraparte UMA vez e
     * persistindo o resultado completo. `useDesignVariables` deixou de
     * chamá-la a cada render: no modo nativo, emitido = escrito.
     */
    const toggleTheme = () => {
        const targetMode = isDarkMode ? 'light' : 'dark';
        const synced = syncThemeWithMode((design || {}) as Record<string, SarakTokenValue>, targetMode);
        applyFullConfigRaw(synced as unknown as SarakThemePayload);
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
            <SarakButton
                onClick={toggleTheme}
                variant="ghost"
                fullWidth
                className="text-[var(--theme-muted)] hover:bg-[var(--theme-muted)]/10 hover:text-[var(--theme-title)] group justify-start normal-case font-tab tracking-normal"
                leftIcon={isDarkMode ? (
                    <Sun size={18} className="text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)]" />
                ) : (
                    <Moon size={18} className="text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)]" />
                )}
            >
                <span className="text-sm font-tab flex-1 text-left">
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
            </SarakButton>
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
