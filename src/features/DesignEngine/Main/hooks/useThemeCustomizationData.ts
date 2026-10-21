import React, { useCallback, useMemo } from 'react';
import { Shield, Type, Layout, MousePointer2, Activity, Cpu, Sparkles } from 'lucide-react';
import { SarakDesignToken, ComponentSchema } from '../../../../core/Design/types';

import { MASTER_DESIGN_MAP } from '../../../../core/Design/master-map';
import { TokenCatalog } from '../../../../core/Design/catalog';
import { buildDynamicGroups } from '../../utils/dynamic-categories';
import { searchTokens, buildCatalogMap } from '../../utils/token-search';
import DesignPillars from '../../config/design-pillars.json';
import type { ThemeEditMode } from './usePreviewUIState';

type VisualImpactGroup = 'fontes' | 'cores' | 'fundo' | 'cards' | 'forma';

interface CatalogMetadataEntry {
    tokenId: string;
    name?: string;
    description?: string;
    importance?: number;
    visualImpact?: string;
    categories?: string[];
}

export interface VisualImpactToken {
    token: SarakDesignToken;
    group: VisualImpactGroup;
}

const CATALOG_ENTRIES: readonly CatalogMetadataEntry[] = TokenCatalog;
const VISUAL_IMPACT_GROUPS: readonly VisualImpactGroup[] = ['fontes', 'cores', 'fundo', 'cards', 'forma'];

const isVisualImpactGroup = (group: string | undefined): group is VisualImpactGroup =>
    VISUAL_IMPACT_GROUPS.some((knownGroup) => knownGroup === group);

const getVisualImpactTokens = (
    components: ComponentSchema[],
    catalogMetadataMap: Map<string, CatalogMetadataEntry>
): VisualImpactToken[] => {
    if (!Array.isArray(components)) return [];

    const tokensById = new Map<string, VisualImpactToken>();

    components.forEach((component) => {
        if (!Array.isArray(component.tokens)) return;

        component.tokens.forEach((token) => {
            const group = catalogMetadataMap.get(token.id)?.visualImpact;
            if (!isVisualImpactGroup(group) || tokensById.has(token.id)) return;
            tokensById.set(token.id, { token, group });
        });
    });

    return [...tokensById.values()];
};

export function useThemeCustomizationData(
    searchQuery: string,
    editMode: ThemeEditMode = 'essential'
) {
    const pillars = useMemo(() => {
        const IconMap: Record<string, React.ElementType> = {
            Shield, Type, Layout, MousePointer2, Activity, Cpu, Sparkles
        };

        return DesignPillars.map(p => ({
            ...p,
            icon: IconMap[p.icon] || Layout
        }));
    }, []);

    const globalComponent = useMemo(() => MASTER_DESIGN_MAP?.components?.find(c => c.id === 'global'), []);

    const groupedStructure = useMemo(() => {
        if (!MASTER_DESIGN_MAP?.components || !TokenCatalog) return {};
        return buildDynamicGroups(MASTER_DESIGN_MAP.components as unknown as ComponentSchema[], TokenCatalog as unknown as { tokenId?: string, categories?: string[] }[]);
    }, []);

    const catalogMetadataMap = useMemo(() => {
        const map = new Map<string, CatalogMetadataEntry>();
        CATALOG_ENTRIES.forEach((entry) => map.set(entry.tokenId, entry));
        return map;
    }, []);

    const catalogMap = catalogMetadataMap;

    const searchCatalog = useMemo(() => buildCatalogMap(TokenCatalog), []);
    const visualImpactTokens = useMemo(
        () => getVisualImpactTokens(MASTER_DESIGN_MAP.components, catalogMetadataMap),
        [catalogMetadataMap]
    );

    const isTokenVisible = useCallback((tokenId: string): boolean => {
        if (editMode === 'complete') return true;

        const metadata = catalogMetadataMap.get(tokenId);
        if (editMode === 'impact') return isVisualImpactGroup(metadata?.visualImpact);
        return (metadata?.importance ?? 0) >= 80;
    }, [catalogMetadataMap, editMode]);

    const filteredResults = useMemo(() => {
        if (!searchQuery) return null;
        const searchable = MASTER_DESIGN_MAP.components.flatMap(c =>
            c.tokens.map(t => ({ ...t, componentLabel: c.label }))
        );
        return searchTokens(searchQuery, searchable, searchCatalog);
    }, [searchQuery, searchCatalog]);

    return {
        pillars,
        globalComponent,
        groupedStructure,
        catalogMap,
        visualImpactTokens,
        isTokenVisible,
        filteredResults
    };
}
