import React from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import type { SarakFontSizePreference } from '../../../core/Provider/preferencesTypes';

const OPTIONS: { value: SarakFontSizePreference; label: string; full: string }[] = [
    { value: 'sm', label: 'P', full: 'Pequena' },
    { value: 'md', label: 'M', full: 'Média' },
    { value: 'lg', label: 'G', full: 'Grande' },
];

/**
 * Controle da preferência "tamanho da fonte" (Spec 09 §4.7) — três degraus
 * relativos à base do tema, nunca um valor absoluto. Grava PREFERÊNCIA, nunca
 * o tema: quem resolve o `bodySize` efetivo é `overlayPreferences`.
 *
 * @sarak-encapsula button — segmented control de 3 opções, sem equivalente em
 *   `SarakButton`/`SarakIconButton` (não são ação isolada, são grupo exclusivo
 *   com `aria-pressed`); o `<button>` nativo aqui é o que dá foco/teclado por
 *   construção, como em `SarakMenuItem`.
 */
export const ShellFontSizeControl: React.FC = () => {
    const sarak = useSarakUIOptional();
    const current = sarak?.preferences.fontSize ?? 'md';

    return (
        <div
            role="group"
            aria-label="Tamanho da fonte"
            className="inline-flex items-center gap-[var(--sarak-layout-gap-sm,2px)] rounded-[var(--sarak-card-radius,8px)] p-[var(--sarak-layout-gap-sm,2px)] bg-[var(--theme-muted,#94a3b8)]/10"
        >
            {OPTIONS.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    aria-pressed={current === opt.value}
                    title={opt.full}
                    onClick={() => sarak?.updatePreferences({ fontSize: opt.value })}
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

export default ShellFontSizeControl;
