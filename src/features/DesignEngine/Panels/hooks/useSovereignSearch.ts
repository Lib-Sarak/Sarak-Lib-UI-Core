import { useMemo } from 'react';
import { Shield, Type, Layout, MousePointer2, Activity, Cpu, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SarakDesignState } from '../../../../core/Provider/types';
import { MASTER_DESIGN_MAP } from '../../../../core/Design/master-map';
import { TokenCatalog } from '../../../../core/Design/catalog';
import { searchTokens, matchesText, buildCatalogMap } from '../../utils/token-search';
import { sanitizeCategory } from '../../utils/dynamic-categories';
import DesignPillars from '../../config/design-pillars.json';

const PILLAR_ICONS: Record<string, LucideIcon> = {
    Shield, Type, Layout, MousePointer2, Activity, Cpu, Sparkles,
};

const catalogByTokenId = new Map(TokenCatalog.map((entry) => [entry.tokenId, entry]));
const searchCatalog = buildCatalogMap(TokenCatalog);

const getTokenCategories = (tokenId: string): string[] => {
    const catalogEntry = catalogByTokenId.get(tokenId);
    if (!catalogEntry || !Array.isArray(catalogEntry.categories)) return ['Especializado'];
    const categories = catalogEntry.categories;
    return [...new Set(categories.map(sanitizeCategory))];
};

const tokenBelongsToPillar = (tokenId: string, categories: string[]): boolean =>
    getTokenCategories(tokenId).some((category) => categories.includes(category));

const getComponentSchemaIds = (categories: string[]): string[] =>
    MASTER_DESIGN_MAP.components
        .filter((component) => component.id !== 'global'
            && component.tokens.some((token) => tokenBelongsToPillar(token.id, categories)))
        .map((component) => component.id);

export const SOVEREIGN_PILLARS = DesignPillars.map((pillar) => ({
    ...pillar,
    label: pillar.title,
    icon: PILLAR_ICONS[pillar.icon] ?? Layout,
    schemas: getComponentSchemaIds(pillar.categories),
}));

export const useSovereignSearch = (draft: Partial<SarakDesignState>, searchQuery: string, activePillar: string) => {
    const pillarsWithDrafts = useMemo(() => {
        const changedTokenIds = new Set(Object.keys(draft));
        return SOVEREIGN_PILLARS
            .filter((pillar) => MASTER_DESIGN_MAP.components
                .filter((component) => pillar.schemas.includes(component.id))
                .some((component) => component.tokens.some((token) =>
                    changedTokenIds.has(token.id) && tokenBelongsToPillar(token.id, pillar.categories))))
            .map((pillar) => pillar.id);
    }, [draft]);

    const filteredComponents = useMemo(() => {
        if (searchQuery) {
            return MASTER_DESIGN_MAP.components.map((component) => {
                const searchable = component.tokens.map((token) => ({ ...token, componentLabel: component.label }));
                const tokens = searchTokens(searchQuery, searchable, searchCatalog);

                if (tokens.length > 0 || matchesText(searchQuery, component.label)) {
                    return { ...component, tokens: tokens.length > 0 ? tokens : component.tokens };
                }
                return null;
            }).filter(Boolean) as typeof MASTER_DESIGN_MAP.components;
        }

        const currentPillar = SOVEREIGN_PILLARS.find((pillar) => pillar.id === activePillar);
        if (!currentPillar) return [];

        return MASTER_DESIGN_MAP.components.flatMap((component) => {
            if (component.id === 'global' || !currentPillar.schemas.includes(component.id)) return [];
            const tokens = component.tokens.filter((token) => tokenBelongsToPillar(token.id, currentPillar.categories));
            return tokens.length ? [{ ...component, tokens }] : [];
        });
    }, [searchQuery, activePillar]);

    return { pillarsWithDrafts, filteredComponents, SOVEREIGN_PILLARS };
};
