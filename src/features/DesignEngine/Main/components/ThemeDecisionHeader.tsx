import React, { useEffect, useRef } from 'react';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';

interface ThemeDecisionHeaderProps {
    title: string;
    onBack: () => void;
    /** Há mudança de rascunho nesta decisão: oferece descartar só ela. */
    isDirty?: boolean;
    onDiscard?: () => void;
}

/** O cabeçalho de uma tela aberta na coluna: voltar à lista, o título (que recebe o foco ao entrar) e descartar só esta decisão. */
export const ThemeDecisionHeader: React.FC<ThemeDecisionHeaderProps> = ({ title, onBack, isDirty = false, onDiscard }) => {
    const text = useLibraryText();
    const heading = useRef<HTMLHeadingElement>(null);
    useEffect(() => { heading.current?.focus(); }, []);

    return (
        <div className="flex shrink-0 items-center gap-2 border-b border-[var(--theme-border)] bg-[var(--theme-surface)] px-3 py-3">
            <button
                type="button"
                onClick={onBack}
                aria-label={text('panelBackLabel')}
                className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-[length:var(--sarak-type-scale-caption,12px)] font-semibold text-[var(--theme-muted)] hover:bg-[var(--theme-primary)]/10 hover:text-[var(--theme-title)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]"
            >
                <ChevronLeft size={16} aria-hidden="true" />
                {text('panelBack')}
            </button>
            <h2 ref={heading} tabIndex={-1} className="min-w-0 flex-1 truncate text-base font-semibold text-[var(--theme-title)] outline-none">
                {title}
            </h2>
            {isDirty && onDiscard && (
                <button
                    type="button"
                    onClick={onDiscard}
                    aria-label={text('decisionDiscard')}
                    title={text('decisionDiscard')}
                    className="shrink-0 rounded-lg p-2 text-[var(--theme-muted)] hover:bg-[var(--theme-primary)]/10 hover:text-[var(--theme-title)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]"
                >
                    <RotateCcw size={14} aria-hidden="true" />
                </button>
            )}
        </div>
    );
};
