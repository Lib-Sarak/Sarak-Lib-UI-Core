import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeDecisionList } from './ThemeDecisionList';
import { ThemeDecisionView } from './ThemeDecisionView';
import { ThemeSearchResults } from './ThemeSearchResults';
import { BrandShortcut } from './BrandShortcut';
import { MasterControlPanel } from '../MasterControlPanel';
import { TemplatesTab } from '../TemplatesTab';
import { HyperGranularityTab } from '../../Panels/HyperGranularityTab';
import { getDecision, type DecisionContext, type DecisionId, type TokenLocation } from '../../utils/decisions';
import type { DecisionOptionsContext } from './ThemeDecisionOptions';
import type { PanelView } from '../hooks/usePreviewUIState';
import type { PendingBranding } from '../hooks/usePendingBranding';
import type { SarakDesignToken } from '../../../../core/Design/types';
import type { SarakDesignState } from '../../../../core/Provider/types';

interface ThemeSidebarContentProps {
    searchQuery: string;
    filteredResults: SarakDesignToken[];
    viewMode: string;
    panelView: PanelView;
    /** Tudo que os grupos de opção e os controles precisam (rascunho, prévia ao vivo, portas de aplicar). */
    options: DecisionOptionsContext;
    decisionContext: DecisionContext;
    tokenIndex: ReadonlyMap<string, TokenLocation>;
    themeName: string;
    dirtyDecisions: ReadonlySet<DecisionId>;
    onOpenDecision: (id: DecisionId, focusTokenId?: string) => void;
    onOpenBrand: () => void;
    setPendingBranding: (branding: PendingBranding) => void;
    onBrandGenerated: () => void;
    brandInitialName?: string;
    /** Para as telas avançadas (tabela de tokens e Command Center). */
    resetComponent: (schemaIdOrSchemas: string | string[]) => void;
    resetToken: (id: string) => void;
    handleApplyToSystem: () => void;
    toast: { type: 'success' | 'warning'; message: string } | null;
    onApplyFullTheme: (design: Partial<SarakDesignState>, themeId?: string) => void;
}

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 } };

const DecisionColumn: React.FC<ThemeSidebarContentProps> = (props) => {
    const { panelView, options } = props;
    if (panelView.kind === 'brand') {
        return (
            <BrandShortcut
                draft={options.draft}
                appliedDesign={options.sarak.systemDesign as unknown as Record<string, unknown> | undefined}
                updateDraft={options.updateDraft}
                onPeek={options.onPeek}
                setPendingBranding={props.setPendingBranding}
                onGenerated={props.onBrandGenerated}
                initialName={props.brandInitialName}
            />
        );
    }
    if (panelView.kind === 'decision') {
        const decision = getDecision(panelView.id);
        if (decision) {
            return (
                <ThemeDecisionView
                    decision={decision}
                    decisionContext={props.decisionContext}
                    options={options}
                    focusTokenId={panelView.focusTokenId}
                    focusLocation={panelView.focusTokenId ? props.tokenIndex.get(panelView.focusTokenId) : undefined}
                />
            );
        }
    }
    return (
        <ThemeDecisionList
            draft={options.draft as unknown as Record<string, unknown>}
            themeName={props.themeName}
            dirtyDecisions={props.dirtyDecisions}
            onOpen={(id) => props.onOpenDecision(id)}
            onOpenBrand={props.onOpenBrand}
            restoreFocusId={panelView.kind === 'home' ? panelView.focusId : undefined}
        />
    );
};

const AdvancedScreen: React.FC<ThemeSidebarContentProps> = (props) => {
    const { options } = props;
    if (props.viewMode === 'catalog') return <MasterControlPanel draft={options.draft} updateDraft={options.updateDraft} resetToken={props.resetToken} />;
    if (props.viewMode === 'command-center') {
        return (
            <HyperGranularityTab
                draft={options.draft}
                updateDraft={options.updateDraft}
                handleApplyToSystem={props.handleApplyToSystem}
                resetComponent={props.resetComponent}
                resetToken={props.resetToken}
                toast={props.toast}
            />
        );
    }
    return <TemplatesTab onApplyFullTheme={props.onApplyFullTheme} />;
};

/** O corpo da coluna: a busca, a lista de decisões (ou a decisão aberta) ou, pelo menu Avançado, as telas de quem já conhece o motor. */
export const ThemeSidebarContent: React.FC<ThemeSidebarContentProps> = (props) => {
    const { searchQuery, options } = props;
    const { catalogMap, draft, updateDraft, previewDevice } = options;
    const columnKey = props.panelView.kind === 'decision' ? `decision-${props.panelView.id}` : props.panelView.kind;

    return (
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-sidebar bg-[var(--theme-bg)]/30">
            <AnimatePresence mode="wait">
                {searchQuery ? (
                    <motion.div key="search" {...fade}>
                        <ThemeSearchResults
                            query={searchQuery}
                            results={props.filteredResults}
                            tokenIndex={props.tokenIndex}
                            onOpenToken={props.onOpenDecision}
                            catalogMap={catalogMap}
                            draft={draft}
                            updateDraft={updateDraft}
                            previewDevice={previewDevice}
                        />
                    </motion.div>
                ) : props.viewMode === 'preview' ? (
                    <motion.div key={columnKey} {...fade} className="pt-2">
                        <DecisionColumn {...props} />
                    </motion.div>
                ) : (
                    <motion.div key={props.viewMode} {...fade} className="h-full">
                        <AdvancedScreen {...props} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
