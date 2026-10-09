import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command } from 'lucide-react';
import { CategoryLabel, Section } from '../../components/DesignControls';
import { TokenControl } from './TokenControl';
import type { SarakDesignState } from '../../../../core/Provider/types';
import type { SarakDesignToken, SarakTokenValue } from '../../../../core/Design/types';

export interface ThemePillar {
    id: string;
    title: string;
    icon: React.ElementType;
    index: number;
}

interface ThemePillarsListProps {
    pillars: ThemePillar[];
    activePillarId: string | null;
    activeSectionId: string | null;
    setActiveSectionId: (id: string | null) => void;
    groupedStructure: Record<string, Record<string, SarakDesignToken[]>>;
    isTokenVisible: (tokenId: string) => boolean;
    isComponentDirty: (id: string) => boolean;
    resetComponent: (id: string) => void;
    catalogMap: Map<string, { name?: string; description?: string }>;
    draft: SarakDesignState;
    updateDraft: (id: string, val: SarakTokenValue) => void;
    previewDevice: string;
    selectPillar: (id: string | null) => void;
}

interface VisibleSection {
    title: string;
    tokens: SarakDesignToken[];
}

interface VisiblePillar {
    pillar: ThemePillar;
    sections: VisibleSection[];
}

const getVisiblePillarSections = (
    groupedStructure: ThemePillarsListProps['groupedStructure'],
    pillarId: string,
    isTokenVisible: ThemePillarsListProps['isTokenVisible']
): VisibleSection[] => Object.entries(groupedStructure[pillarId] || {}).flatMap(([title, tokens]) => {
    const visibleTokens = tokens.filter((token) => isTokenVisible(token.id));
    return visibleTokens.length > 0 ? [{ title, tokens: visibleTokens }] : [];
});

const getVisiblePillars = (
    pillars: ThemePillar[],
    groupedStructure: ThemePillarsListProps['groupedStructure'],
    isTokenVisible: ThemePillarsListProps['isTokenVisible']
): VisiblePillar[] => pillars.flatMap((pillar) => {
    const sections = getVisiblePillarSections(groupedStructure, pillar.id, isTokenVisible);
    return sections.length > 0 ? [{ pillar, sections }] : [];
});

const getEnhancedToken = (
    token: SarakDesignToken,
    catalogMap: ThemePillarsListProps['catalogMap']
): SarakDesignToken => {
    const metadata = catalogMap.get(token.id);
    return {
        ...token,
        label: metadata?.name || token.label,
        description: metadata?.description || token.description
    };
};

type PillarItemProps = Omit<ThemePillarsListProps, 'pillars' | 'groupedStructure' | 'isTokenVisible'> & {
    item: VisiblePillar;
};

const PillarSectionControls: React.FC<{
    pillarId: string;
    section: VisibleSection;
    activeSectionId: string | null;
    setActiveSectionId: (id: string | null) => void;
    catalogMap: ThemePillarsListProps['catalogMap'];
    draft: SarakDesignState;
    updateDraft: ThemePillarsListProps['updateDraft'];
    previewDevice: string;
}> = ({ pillarId, section, activeSectionId, setActiveSectionId, catalogMap, draft, updateDraft, previewDevice }) => {
    const draftRecord = draft as Record<string, SarakTokenValue>;

    return (
        <Section
            id={`${pillarId}-${section.title}`}
            icon={Command}
            title={`${section.title} (${section.tokens.length})`}
            activeSection={activeSectionId}
            onToggle={setActiveSectionId}
        >
            <div className="flex flex-col gap-4">
                {section.tokens.map((token) => {
                    const enhancedToken = getEnhancedToken(token, catalogMap);
                    return (
                        <TokenControl
                            key={enhancedToken.id}
                            token={enhancedToken}
                            value={draftRecord[enhancedToken.id]}
                            onChange={(value) => updateDraft(enhancedToken.id, value)}
                            previewDevice={previewDevice}
                        />
                    );
                })}
            </div>
        </Section>
    );
};

const ThemePillarItem: React.FC<PillarItemProps> = (props) => {
    const { pillar, sections } = props.item;
    const isOpen = props.activePillarId === pillar.id;
    const handleToggle = () => {
        const nextId = isOpen ? null : pillar.id;
        props.selectPillar(nextId);
    };

    return (
        <div className="border-b border-[var(--theme-border)] last:border-0">
            <CategoryLabel
                icon={pillar.icon}
                title={`${pillar.title} (${sections.length})`}
                index={pillar.index}
                isOpen={isOpen}
                onToggle={handleToggle}
                isDirty={props.isComponentDirty(pillar.id)}
                onReset={() => props.resetComponent(pillar.id)}
                pillarId={pillar.id}
            />
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-[var(--color-theme-card,#1e293b)]">
                        <div className="px-2 py-2 flex flex-col gap-1">
                            {sections.map((section) => (
                                <PillarSectionControls
                                    key={section.title}
                                    pillarId={pillar.id}
                                    section={section}
                                    activeSectionId={props.activeSectionId}
                                    setActiveSectionId={props.setActiveSectionId}
                                    catalogMap={props.catalogMap}
                                    draft={props.draft}
                                    updateDraft={props.updateDraft}
                                    previewDevice={props.previewDevice}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const ThemePillarsList: React.FC<ThemePillarsListProps> = (props) => {
    const visiblePillars = getVisiblePillars(props.pillars, props.groupedStructure, props.isTokenVisible);

    return (
        <>
            {visiblePillars.map((item) => (
                <ThemePillarItem key={item.pillar.id} {...props} item={item} />
            ))}
        </>
    );
};
