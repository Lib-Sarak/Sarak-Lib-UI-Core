import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command } from 'lucide-react';
import { CategoryLabel, Section } from '../../components/DesignControls';
import { TokenControl } from './TokenControl';

interface ThemePillarsListProps {
    pillars: any[];
    activePillarId: string | null;
    setActivePillarId: (id: string | null) => void;
    activeSectionId: string | null;
    setActiveSectionId: (id: string | null) => void;
    groupedStructure: any;
    isEssentialMode: boolean;
    dynamicEssentialTokens: Set<string>;
    isComponentDirty: (id: string) => boolean;
    resetComponent: (id: string) => void;
    handleApplyComponent: (id: string) => void;
    catalogMap: Map<string, any>;
    draft: any;
    updateDraft: (id: string, val: any) => void;
    previewDevice: string;
    setActivePreviewApp: (id: string) => void;
}

export const ThemePillarsList: React.FC<ThemePillarsListProps> = ({
    pillars,
    activePillarId,
    setActivePillarId,
    activeSectionId,
    setActiveSectionId,
    groupedStructure,
    isEssentialMode,
    dynamicEssentialTokens,
    isComponentDirty,
    resetComponent,
    handleApplyComponent,
    catalogMap,
    draft,
    updateDraft,
    previewDevice,
    setActivePreviewApp
}) => {
    return (
        <>
            {pillars.map((pillar) => {
                // Conta quantas subcategorias possuem pelo menos 1 token visível
                const activeSubcategoriesCount = Object.values(groupedStructure[pillar.id] || {}).filter((tokens) => {
                    return (tokens as any[]).some((token: any) => !isEssentialMode || dynamicEssentialTokens.has(token.id));
                }).length;

                return (
                    <div key={pillar.id} className="border-b border-[var(--theme-border)] last:border-0">
                        <CategoryLabel
                            icon={pillar.icon}
                            title={`${pillar.title} (${activeSubcategoriesCount})`}
                            index={pillar.index}
                            isOpen={activePillarId === pillar.id}
                            onToggle={() => {
                                const nextId = activePillarId === pillar.id ? null : pillar.id;
                                setActivePillarId(nextId);
                                if (nextId === 'advanced') setActivePreviewApp('matrix');
                            }}
                            isDirty={isComponentDirty(pillar.id)}
                            onReset={() => resetComponent(pillar.id)}
                            onApply={() => handleApplyComponent(pillar.id)}
                        />
                        <AnimatePresence>
                            {activePillarId === pillar.id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-[var(--theme-layer)]">
                                    <div className="px-2 py-2 flex flex-col gap-1">
                                        {Object.entries(groupedStructure[pillar.id] || {}).map(([subcat, tokens]) => {
                                            const visibleTokens = (tokens as any[]).filter((token: any) => !isEssentialMode || dynamicEssentialTokens.has(token.id));
                                            if (visibleTokens.length === 0) return null;
                                            return (
                                                <Section
                                                    key={subcat} id={`${pillar.id}-${subcat}`} icon={Command} title={`${subcat} (${visibleTokens.length})`}
                                                    activeSection={activeSectionId} onToggle={setActiveSectionId}
                                                >
                                                    <div className="flex flex-col gap-4">
                                                        {visibleTokens.map((token: any) => {
                                                            const meta = catalogMap.get(token.id);
                                                            const enhancedToken = {
                                                                ...token,
                                                                label: meta?.name || token.label,
                                                                description: meta?.description || token.description
                                                            };
                                                            return (
                                                                <TokenControl key={enhancedToken.id} token={enhancedToken} value={draft[enhancedToken.id]} onChange={(val) => updateDraft(enhancedToken.id, val)} previewDevice={previewDevice} />
                                                            );
                                                        })}
                                                    </div>
                                                </Section>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </>
    );
};
