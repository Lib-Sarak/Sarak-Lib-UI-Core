import React, { useId, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { DecisionSectionList, type ColumnTokenProps } from './DecisionTokenList';
import type { DecisionLayers } from '../../utils/decisions';

interface ThemeFineTuningProps extends ColumnTokenProps {
    layers: Pick<DecisionLayers, 'essential' | 'rest' | 'fineTotal'>;
    /** A busca levou a um token do ajuste fino: já nasce aberto. */
    initialOpen?: boolean;
    /** ...e a um token fora dos principais: já nasce com todos à vista. */
    initialShowAll?: boolean;
}

const TOGGLE_CLASS = 'flex w-full items-center justify-between gap-2 rounded-[var(--sarak-card-radius,10px)] px-2 py-2 text-left text-[length:var(--sarak-type-scale-caption,12px)] hover:bg-[var(--theme-primary)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]';

/** O nível 3: recolhido, mostra primeiro os ajustes de `importance >= 80` e só depois, sob pedido, todos os outros. */
export const ThemeFineTuning: React.FC<ThemeFineTuningProps> = ({ layers, initialOpen = false, initialShowAll = false, ...tokenProps }) => {
    const text = useLibraryText();
    const panelId = useId();
    const [isOpen, setIsOpen] = useState(initialOpen);
    const [showAll, setShowAll] = useState(initialShowAll);
    if (layers.fineTotal === 0) return null;
    const Chevron = isOpen ? ChevronDown : ChevronRight;

    return (
        <section className="border-t border-[var(--theme-border)] pt-2" data-testid="fine-tuning">
            <button type="button" className={TOGGLE_CLASS} aria-expanded={isOpen} aria-controls={panelId} onClick={() => setIsOpen((open) => !open)}>
                <span className="font-semibold text-[var(--theme-title)]">{text('fineTuningTitle')}</span>
                <span className="flex items-center gap-1 text-[var(--theme-muted)]">
                    {text('fineTuningCount', { count: layers.fineTotal })}
                    <Chevron size={14} aria-hidden="true" />
                </span>
            </button>
            {isOpen && (
                <div id={panelId} className="flex flex-col gap-4 px-2 pb-4 pt-3">
                    <DecisionSectionList sections={layers.essential} {...tokenProps} />
                    {layers.rest.length > 0 && (
                        <button type="button" className={TOGGLE_CLASS + ' text-[var(--theme-muted)]'} aria-expanded={showAll} onClick={() => setShowAll((all) => !all)}>
                            {showAll ? text('fineTuningShowLess') : text('fineTuningShowAll', { count: layers.fineTotal })}
                        </button>
                    )}
                    {showAll && <DecisionSectionList sections={layers.rest} {...tokenProps} />}
                </div>
            )}
        </section>
    );
};
