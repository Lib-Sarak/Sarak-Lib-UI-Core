import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeGlobalSettings } from './ThemeGlobalSettings';
import { ThemePillarsList } from './ThemePillarsList';
import { ThemeImpactList } from './ThemeImpactList';
import { TokenControl } from './TokenControl';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';
import { locateToken } from '../../utils/token-search';
import { MasterControlPanel } from '../MasterControlPanel';
import { TemplatesTab } from '../TemplatesTab';
import { HyperGranularityTab } from '../../Panels/HyperGranularityTab';
import type { SarakDesignState, SarakUIContextType } from '../../../../core/Provider/types';
import type { ComponentSchema, SarakDesignToken, SarakTokenValue } from '../../../../core/Design/types';
import type { ThemePillar } from './ThemePillarsList';
import type { ThemeEditMode } from '../hooks/usePreviewUIState';
import type { VisualImpactToken } from '../hooks/useThemeCustomizationData';

interface ThemeSidebarContentProps {
    searchQuery: string;
    filteredResults: SarakDesignToken[];
    catalogMap: Map<string, { name?: string; description?: string }>;
    draft: SarakDesignState;
    updateDraft: (id: string, val: SarakTokenValue) => void;
    previewDevice: string;
    viewMode: string;
    activePillarId: string | null;
    setActivePillarId: (id: string | null) => void;
    activeSectionId: string | null;
    setActiveSectionId: (id: string | null) => void;
    isComponentDirty: (id: string) => boolean;
    resetComponent: (schemaIdOrSchemas: string | string[]) => void;
    resetToken: (id: string) => void;
    handleApplyToSystem: () => void;
    toast: { type: 'success' | 'warning'; message: string } | null;
    globalComponent: ComponentSchema | undefined;
    sarak: SarakUIContextType;
    pillars: ThemePillar[];
    groupedStructure: Record<string, Record<string, SarakDesignToken[]>>;
    editMode: ThemeEditMode;
    visualImpactTokens: VisualImpactToken[];
    isTokenVisible: (tokenId: string) => boolean;
    selectPillar: (pillarId: string | null) => void;
    isGalleryOpen: boolean;
    setIsGalleryOpen: (isOpen: boolean) => void;
    onApplyFullTheme: (design: Partial<SarakDesignState>, themeId?: string) => void;
}

export const ThemeSidebarContent: React.FC<ThemeSidebarContentProps> = ({
    searchQuery,
    filteredResults,
    catalogMap,
    draft,
    updateDraft,
    previewDevice,
    viewMode,
    activePillarId,
    setActivePillarId,
    activeSectionId,
    setActiveSectionId,
    isComponentDirty,
    resetComponent,
    resetToken,
    handleApplyToSystem,
    toast,
    globalComponent,
    sarak,
    pillars,
    groupedStructure,
    editMode,
    visualImpactTokens,
    isTokenVisible,
    selectPillar,
    isGalleryOpen,
    setIsGalleryOpen,
    onApplyFullTheme,
}) => {
    return (
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-sidebar bg-[var(--theme-bg)]/30">
            <AnimatePresence mode="wait">
                {searchQuery ? (
                    <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-[var(--sarak-layout-gap-sm,12px)] space-y-[var(--sarak-layout-gap-sm,12px)]">
                        <div className="text-[var(--sarak-type-scale-tiny,8px)] font-black text-[var(--theme-muted)] uppercase tracking-widest mb-4">Resultados da busca ({filteredResults?.length ?? 0})</div>
                        {!filteredResults?.length && (
                            <div role="status" className="text-[var(--sarak-type-scale-tiny,8px)] text-[var(--theme-muted)]">Nenhum controle encontrado para &ldquo;{searchQuery}&rdquo;.</div>
                        )}
                        {filteredResults?.map(token => {
                            const meta = catalogMap.get(token.id);
                            const enhancedToken = { ...token, label: meta?.name || token.label, description: meta?.description || token.description };
                            const path = locateToken(token.id, groupedStructure, pillars);
                            return (
                                <div key={enhancedToken.id} className="space-y-1">
                                    {path && <div data-testid="search-result-path" className="text-[var(--sarak-type-scale-tiny,8px)] text-[var(--theme-muted)]">{path}</div>}
                                    <TokenControl token={enhancedToken as SarakDesignToken} value={(draft as Record<string, SarakTokenValue>)[enhancedToken.id]} onChange={(val) => updateDraft(enhancedToken.id, val)} previewDevice={previewDevice} />
                                </div>
                            );
                        })}
                    </motion.div>
                ) : viewMode === 'preview' ? (
                    <motion.div key="pillars" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="pt-2">

                        <section className="mx-[var(--sarak-layout-gap-sm,12px)] mb-[var(--sarak-layout-gap-sm,12px)] flex flex-col gap-[var(--sarak-layout-gap-sm,12px)] rounded-[var(--sarak-card-radius,12px)] border border-[var(--theme-border,rgba(255,255,255,0.1))] bg-[var(--theme-card,rgba(15,23,42,0.6))] p-[var(--sarak-layout-gap-sm,12px)]">
                            <div>
                                <h2 className="text-[var(--sarak-type-scale-caption,12px)] font-semibold text-[var(--theme-title,#ffffff)]">Começar de um tema</h2>
                                <p className="mt-1 text-[var(--sarak-type-scale-caption,12px)] text-[var(--theme-muted,rgba(255,255,255,0.4))]">
                                    Escolha um estilo e ajuste os detalhes abaixo.
                                </p>
                            </div>
                            <SarakButton
                                type="button"
                                variant="secondary"
                                size="sm"
                                aria-expanded={isGalleryOpen}
                                aria-controls={isGalleryOpen ? 'presets-catalog' : undefined}
                                onClick={() => setIsGalleryOpen(!isGalleryOpen)}
                            >
                                {isGalleryOpen ? 'Fechar galeria' : 'Abrir galeria'}
                            </SarakButton>
                        </section>

                        {/* PILAR 0: CONFIGURAÇÕES GLOBAIS */}
                        <ThemeGlobalSettings
                            activePillarId={activePillarId}
                            setActivePillarId={setActivePillarId}
                            activeSectionId={activeSectionId}
                            setActiveSectionId={setActiveSectionId}
                            isDirty={isComponentDirty('global')}
                            onReset={() => resetComponent('global')}
                            globalComponent={globalComponent}
                            catalogMap={catalogMap}
                            draft={draft}
                            updateDraft={updateDraft}
                            previewDevice={previewDevice}
                            sarak={sarak}
                        />

                        {editMode === 'impact' ? (
                            <ThemeImpactList
                                tokens={visualImpactTokens}
                                catalogMap={catalogMap}
                                draft={draft}
                                updateDraft={updateDraft}
                                previewDevice={previewDevice}
                            />
                        ) : (
                            <ThemePillarsList
                                pillars={pillars}
                                activePillarId={activePillarId}
                                activeSectionId={activeSectionId}
                                setActiveSectionId={setActiveSectionId}
                                groupedStructure={groupedStructure}
                                isTokenVisible={isTokenVisible}
                                isComponentDirty={isComponentDirty}
                                resetComponent={resetComponent}
                                catalogMap={catalogMap}
                                draft={draft}
                                updateDraft={updateDraft}
                                previewDevice={previewDevice}
                                selectPillar={selectPillar}
                            />
                        )}
                    </motion.div>
                ) : viewMode === 'catalog' ? (
                    <motion.div key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                        <MasterControlPanel draft={draft} updateDraft={updateDraft} resetToken={resetToken} />
                    </motion.div>
                ) : viewMode === 'command-center' ? (
                    <motion.div key="command-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                        <HyperGranularityTab
                            draft={draft}
                            updateDraft={updateDraft}
                            handleApplyToSystem={handleApplyToSystem}
                            resetComponent={resetComponent}
                            resetToken={resetToken}
                            toast={toast}
                        />
                    </motion.div>
                ) : (
                    <motion.div key="templates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                        <TemplatesTab onApplyFullTheme={onApplyFullTheme} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
