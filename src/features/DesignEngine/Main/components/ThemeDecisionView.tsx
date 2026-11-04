import React, { useEffect, useMemo, useRef } from 'react';
import { ThemeDecisionOptions, type DecisionOptionsContext } from './ThemeDecisionOptions';
import { DecisionSectionList, DecisionTokenList } from './DecisionTokenList';
import { DecisionQuestionList } from './DecisionQuestionList';
import { ThemeFineTuning } from './ThemeFineTuning';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import { decisionLayers, type DecisionContext, type DecisionDef, type TokenLocation } from '../../utils/decisions';

interface ThemeDecisionViewProps {
    decision: DecisionDef;
    decisionContext: DecisionContext;
    options: DecisionOptionsContext;
    /** O token que a busca quer à vista, e onde ele mora. */
    focusTokenId?: string;
    focusLocation?: TokenLocation;
}

/** Põe o controle achado pela busca à vista e no foco: rolagem, foco no próprio controle e um realce curto. */
const useRevealToken = (focusTokenId: string | undefined, container: React.RefObject<HTMLDivElement>): void => {
    useEffect(() => {
        if (!focusTokenId) return;
        const row = container.current?.querySelector<HTMLElement>(`[data-token-row="${focusTokenId}"]`);
        if (!row) return;
        row.scrollIntoView?.({ block: 'center' });
        row.focus({ preventScroll: true });
    }, [focusTokenId, container]);
};

const revealsFineTuning = (location: TokenLocation | undefined): { open: boolean; showAll: boolean } => ({
    open: location?.layer === 'essential' || location?.layer === 'rest',
    showAll: location?.layer === 'rest',
});

/** Uma decisão aberta: as opções visuais e os ajustes principais (nível 2) e, recolhido, o ajuste fino (nível 3). */
export const ThemeDecisionView: React.FC<ThemeDecisionViewProps> = ({ decision, decisionContext, options, focusTokenId, focusLocation }) => {
    const text = useLibraryText();
    const container = useRef<HTMLDivElement>(null);
    const layers = useMemo(() => decisionLayers(decision, decisionContext), [decision, decisionContext]);
    useRevealToken(focusTokenId, container);
    const reveal = revealsFineTuning(focusLocation);
    const { catalogMap, draft, updateDraft, previewDevice } = options;
    const tokenProps = { catalogMap, draft, updateDraft, previewDevice };

    return (
        <div ref={container} data-testid={`decision-${decision.id}`} className="flex flex-col gap-5 p-[var(--sarak-layout-gap-sm,12px)]">
            <ThemeDecisionOptions groups={decision.groups} context={{ ...options, omitTokenIds: layers.questionTokenIds }} />
            <DecisionQuestionList questions={layers.questions} mode={options.draftMode} {...tokenProps} />
            {layers.mainTokens.length > 0 && (
                <section aria-label={text('optionsMainTitle')} className="flex flex-col gap-3">
                    <h3 className="text-xs font-semibold text-[var(--theme-muted)]">{text('optionsMainTitle')}</h3>
                    <DecisionTokenList tokens={layers.mainTokens} {...tokenProps} />
                </section>
            )}
            <DecisionSectionList sections={layers.barSections} {...tokenProps} />
            <ThemeFineTuning
                key={`${decision.id}:${focusTokenId ?? ''}`}
                layers={layers}
                initialOpen={reveal.open}
                initialShowAll={reveal.showAll}
                {...tokenProps}
            />
        </div>
    );
};
