import React from 'react';
import { ChevronUp } from 'lucide-react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { SarakDirtyToken } from '../../hooks/useDesignDraft';

const LIST_ID = 'theme-pending-changes-list';
const COUNT_ID = 'theme-pending-changes-count';

/** Um valor de token legível: texto como veio, número e booleano em texto, objeto em JSON, ausente em travessão. */
const formatValue = (value: unknown): string => {
    if (value === undefined || value === null || value === '') return '—';
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
};

interface ThemePendingChangesProps {
    tokens: SarakDirtyToken[];
    /** Quem hospeda decide se a lista está aberta: a barra mantém só uma camada aberta por vez. */
    isOpen: boolean;
    onToggle: () => void;
}

/**
 * O contador "N alterações" do rascunho; clicar abre a lista do que mudou (nome do token, valor aplicado e valor do
 * rascunho). Sem alteração não há o que mostrar e o componente some.
 */
export const ThemePendingChanges: React.FC<ThemePendingChangesProps> = ({ tokens, isOpen, onToggle }) => {
    const text = useLibraryText();
    if (tokens.length === 0) return null;
    const label = text(tokens.length === 1 ? 'themePendingChangeCount' : 'themePendingChangesCount', { count: tokens.length });

    return (
        <div className="flex flex-col gap-1">
            <span id={COUNT_ID} role="status" className="text-center">
                <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={LIST_ID}
                    onClick={onToggle}
                    className="inline-flex items-center gap-1 text-[var(--sarak-type-scale-caption,12px)] text-[var(--color-theme-title,CanvasText)] underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]"
                >
                    {label}
                    <ChevronUp size={12} aria-hidden="true" className={isOpen ? '' : 'rotate-180'} />
                </button>
            </span>
            {isOpen && (
                <ul
                    id={LIST_ID}
                    aria-label={text('themeChangesListLabel')}
                    className="max-h-40 overflow-y-auto rounded-md border border-[var(--theme-border)] p-1 text-[var(--sarak-type-scale-caption,12px)]"
                >
                    {tokens.map((token) => (
                        <li key={token.id} className="flex flex-col gap-0.5 px-1 py-1">
                            <span className="font-medium text-[var(--color-theme-title,CanvasText)]">{token.label}</span>
                            <span className="break-words text-[var(--theme-muted)]">
                                {text('themeChangeApplied')}: {formatValue(token.applied)} → {text('themeChangeDraft')}: {formatValue(token.draft)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
