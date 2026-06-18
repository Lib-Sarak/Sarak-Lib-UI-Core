import { useMemo } from 'react';
import { Shield, Type, Layout, MousePointer2, Activity, Cpu, Sparkles } from 'lucide-react';

import { MASTER_DESIGN_MAP } from '../../../../core/Design/master-map';
import { TokenCatalog } from '../../../../core/Design/catalog';
import { buildDynamicGroups } from '../../utils/dynamic-categories';
import DesignPillars from '../../config/design-pillars.json';

export function useThemeCustomizationData(searchQuery: string) {
    const pillars = useMemo(() => {
        const IconMap: Record<string, any> = {
            Shield, Type, Layout, MousePointer2, Activity, Cpu, Sparkles
        };

        return DesignPillars.map(p => ({
            ...p,
            icon: IconMap[p.icon] || Layout // Fallback icon
        }));
    }, []);

    const globalComponent = useMemo(() => MASTER_DESIGN_MAP?.components?.find(c => c.id === 'global'), []);

    const groupedStructure = useMemo(() => {
        if (!MASTER_DESIGN_MAP?.components || !TokenCatalog) return {};
        return buildDynamicGroups(MASTER_DESIGN_MAP.components, TokenCatalog);
    }, []);

    const dynamicEssentialTokens = useMemo(() => {
        if (!TokenCatalog) return new Set<string>();
        return new Set(TokenCatalog.filter((t: any) => (t.importance || 0) >= 80).map((t: any) => t.tokenId));
    }, []);

    const catalogMap = useMemo(() => {
        const map = new Map();
        if (TokenCatalog) {
            TokenCatalog.forEach((t: any) => map.set(t.tokenId, t));
        }
        return map;
    }, []);

    const filteredResults = useMemo(() => {
        if (!searchQuery) return null;
        const query = searchQuery.toLowerCase();
        return MASTER_DESIGN_MAP.components.flatMap(c =>
            c.tokens.filter(t => t.label.toLowerCase().includes(query) || t.id.toLowerCase().includes(query))
        );
    }, [searchQuery]);

    return {
        pillars,
        globalComponent,
        groupedStructure,
        dynamicEssentialTokens,
        catalogMap,
        filteredResults
    };
}
