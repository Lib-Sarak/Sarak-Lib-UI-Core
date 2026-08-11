import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSarakUI } from '../../Provider/SarakUIProvider';
import { SarakIconButton } from '../../../components/atomic/Buttons/SarakIconButton';
import { SarakButton } from '../../../components/atomic/Buttons/SarakButton';
import { syncThemeWithMode, resolveThemeForMode } from '../../Design/presets/themes/color-engine';
import type { SarakTokenValue } from '../../Design/types';
import type { SarakThemePayload, ThemeEntry } from '../../Provider/types';

interface ShellThemeToggleProps {
    variant?: 'horizontal' | 'vertical' | 'mini';
}

export const ShellThemeToggle: React.FC<ShellThemeToggleProps> = ({ variant = 'horizontal' }) => {
    const { design, applyFullConfigRaw, allThemes, activeThemeId } = useSarakUI();

    // Safely fallback to 'dark' if undefined
    const isDarkMode = (design?.mode || 'dark') === 'dark';

    /**
     * Decisão D (plan-24-1 §2.8): este toggle é o ÚNICO lugar que expressa a
     * intenção "quero ver ESTE tema no OUTRO modo" — por isso é aqui, e só
     * aqui, que a contraparte é computada, UMA vez, e o resultado completo é
     * persistido. `useDesignVariables` deixou de chamar conversão a cada
     * render: no modo nativo, emitido = escrito.
     *
     * plan-26: quando o tema ativo é RASTREÁVEL (`activeThemeId` casa com um
     * item de `allThemes`), o toggle passa a usar `resolveThemeForMode` — a
     * contraparte AUTORADA quando existe, o fallback sintetizado
     * (`syncThemeWithMode`) só para os 18 legados. Sem tema rastreável (ex.:
     * design customizado sem id de catálogo), o fallback direto sobre o
     * `design` corrente é preservado — o comportamento de sempre.
     */
    const activeTheme = (allThemes as ThemeEntry[] | undefined)?.find((t) => t.id === activeThemeId);

    const toggleTheme = () => {
        const targetMode = isDarkMode ? 'light' : 'dark';
        const resolved = activeTheme?.design
            ? resolveThemeForMode(
                  { design: activeTheme.design as Record<string, SarakTokenValue>, contraparte: activeTheme.contraparte },
                  targetMode,
              )
            : syncThemeWithMode((design || {}) as Record<string, SarakTokenValue>, targetMode);
        applyFullConfigRaw(resolved as unknown as SarakThemePayload);
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
