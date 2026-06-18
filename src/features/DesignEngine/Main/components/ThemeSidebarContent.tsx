import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeGlobalSettings } from './ThemeGlobalSettings';
import { ThemePillarsList } from './ThemePillarsList';
import { TokenControl } from './TokenControl';
import { MasterControlPanel } from '../MasterControlPanel';
import { TemplatesTab } from '../TemplatesTab';

interface ThemeSidebarContentProps {
    searchQuery: string;
    filteredResults: any[];
    catalogMap: Map<string, any>;
    draft: any;
    updateDraft: (id: string, val: any) => void;
    previewDevice: string;
    viewMode: string;
    activePillarId: string | null;
    setActivePillarId: (id: string | null) => void;
    activeSectionId: string | null;
    setActiveSectionId: (id: string | null) => void;
    isComponentDirty: (id: string) => boolean;
    resetComponent: (id: string) => void;
    handleApplyComponent: (id: string) => void;
    globalComponent: any;
    sarak: any;
    pillars: any[];
    groupedStructure: any;
    isEssentialMode: boolean;
    dynamicEssentialTokens: Set<string>;
    setActivePreviewApp: (app: string) => void;
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
    handleApplyComponent,
    globalComponent,
    sarak,
    pillars,
    groupedStructure,
    isEssentialMode,
    dynamicEssentialTokens,
    setActivePreviewApp
}) => {
    return (
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-sidebar bg-[var(--theme-bg)]/30">
            <AnimatePresence mode="wait">
                {searchQuery ? (
                    <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
                        <div className="text-[8px] font-black text-[var(--theme-muted)] uppercase tracking-widest mb-4">Resultados da Busca</div>
                        {filteredResults?.map(token => {
                            const meta = catalogMap.get(token.id);
                            const enhancedToken = { ...token, label: meta?.name || token.label, description: meta?.description || token.description };
                            return (
                                <TokenControl key={enhancedToken.id} token={enhancedToken} value={draft[enhancedToken.id]} onChange={(val) => updateDraft(enhancedToken.id, val)} previewDevice={previewDevice} />
                            );
                        })}
                    </motion.div>
                ) : viewMode === 'preview' ? (
                    <motion.div key="pillars" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="pt-2 pb-20">

                        {/* PILAR 0: CONFIGURAÇÕES GLOBAIS */}
                        <ThemeGlobalSettings
                            activePillarId={activePillarId}
                            setActivePillarId={setActivePillarId}
                            activeSectionId={activeSectionId}
                            setActiveSectionId={setActiveSectionId}
                            isDirty={isComponentDirty('global')}
                            onReset={() => resetComponent('global')}
                            onApply={() => handleApplyComponent('global')}
                            globalComponent={globalComponent}
                            catalogMap={catalogMap}
                            draft={draft}
                            updateDraft={updateDraft}
                            previewDevice={previewDevice}
                            sarak={sarak}
                        />

                        {/* DEMAIS PILARES */}
                        <ThemePillarsList
                            pillars={pillars}
                            activePillarId={activePillarId}
                            setActivePillarId={setActivePillarId}
                            activeSectionId={activeSectionId}
                            setActiveSectionId={setActiveSectionId}
                            groupedStructure={groupedStructure}
                            isEssentialMode={isEssentialMode}
                            dynamicEssentialTokens={dynamicEssentialTokens}
                            isComponentDirty={isComponentDirty}
                            resetComponent={resetComponent}
                            handleApplyComponent={handleApplyComponent}
                            catalogMap={catalogMap}
                            draft={draft}
                            updateDraft={updateDraft}
                            previewDevice={previewDevice}
                            setActivePreviewApp={setActivePreviewApp}
                        />
                    </motion.div>
                ) : viewMode === 'catalog' ? (
                    <motion.div key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                        <MasterControlPanel />
                    </motion.div>
                ) : (
                    <motion.div key="templates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                        <TemplatesTab />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
