import React from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import type { SarakNavigationStylePreference } from '../../../core/Provider/preferencesTypes';

const OPTIONS: { value: SarakNavigationStylePreference; label: string }[] = [
    { value: 'sidebar', label: 'Lateral' },
    { value: 'topbar', label: 'Topo' },
];

/**
 * Controle da preferência "navegação topo/lateral" (Spec 09 §4.7). Sem
 * escolha do usuário, mostra o que o TEMA já decidiu (`design.navigationStyle`)
 * — o clique grava PREFERÊNCIA, nunca o tema.
 *
 * @sarak-encapsula button — segmented control de 2 opções, mesmo motivo de
 *   `ShellFontSizeControl` (grupo exclusivo com `aria-pressed`, sem
 *   equivalente em `SarakButton`).
 */
export const ShellNavigationStyleControl: React.FC = () => {
    const sarak = useSarakUIOptional();
    const themeStyle: SarakNavigationStylePreference = sarak?.design?.navigationStyle === 'topbar' ? 'topbar' : 'sidebar';
    const current = sarak?.preferences.navigationStyle ?? themeStyle;

    return (
        <div
            role="group"
            aria-label="Estilo de navegação"
            className="inline-flex items-center gap-[var(--sarak-layout-gap-sm,2px)] rounded-[var(--sarak-card-radius,8px)] p-[var(--sarak-layout-gap-sm,2px)] bg-[var(--theme-muted,#94a3b8)]/10"
        >
            {OPTIONS.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    aria-pressed={current === opt.value}
                    onClick={() => sarak?.updatePreferences({ navigationStyle: opt.value })}
                    className={`px-[var(--sarak-layout-gap-sm,8px)] py-[var(--sarak-layout-gap-sm,4px)] rounded-[var(--sarak-card-radius,6px)] text-xs font-black transition-colors ${
                        current === opt.value
                            ? 'bg-[var(--sarak-nav-active-color,#3b82f6)] text-[var(--color-theme-on-primary,#fff)]'
                            : 'text-[var(--text-muted,#94a3b8)] hover:text-[var(--sarak-text-main,#fff)]'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
};

export default ShellNavigationStyleControl;
