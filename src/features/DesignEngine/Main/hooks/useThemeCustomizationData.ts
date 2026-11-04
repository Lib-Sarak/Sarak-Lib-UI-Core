import { useMemo } from 'react';
import { MASTER_DESIGN_MAP } from '../../../../core/Design/master-map';
import { TokenCatalog } from '../../../../core/Design/catalog';
import { searchTokens, buildCatalogMap } from '../../utils/token-search';
import { buildDecisionContext } from '../../utils/decisionContext';
import { buildTokenIndex, decisionTokenIds, DECISIONS, type DecisionId } from '../../utils/decisions';

interface CatalogMetadataEntry {
    tokenId: string;
    name?: string;
    description?: string;
    importance?: number;
    visualImpact?: string;
    categories?: string[];
}

const CATALOG_ENTRIES: readonly CatalogMetadataEntry[] = TokenCatalog;

export function useThemeCustomizationData(searchQuery: string) {
    const globalComponent = useMemo(() => MASTER_DESIGN_MAP?.components?.find(c => c.id === 'global'), []);

    // Os dados que a coluna consome: folksonomia por pilar, metadados do catálogo e o bloco global.
    const decisionContext = useMemo(() => buildDecisionContext(), []);
    const tokenIndex = useMemo(() => buildTokenIndex(decisionContext), [decisionContext]);
    const decisionIds = useMemo(
        () => new Map<DecisionId, Set<string>>(DECISIONS.map((decision) => [decision.id, decisionTokenIds(decision, decisionContext)])),
        [decisionContext],
    );

    const catalogMap = useMemo(() => {
        const map = new Map<string, CatalogMetadataEntry>();
        CATALOG_ENTRIES.forEach((entry) => map.set(entry.tokenId, entry));
        return map;
    }, []);

    const searchCatalog = useMemo(() => buildCatalogMap(TokenCatalog), []);

    const filteredResults = useMemo(() => {
        if (!searchQuery) return null;
        const searchable = MASTER_DESIGN_MAP.components.flatMap(c =>
            c.tokens.map(t => ({ ...t, componentLabel: c.label }))
        );
        return searchTokens(searchQuery, searchable, searchCatalog);
    }, [searchQuery, searchCatalog]);

    return {
        globalComponent,
        decisionContext,
        tokenIndex,
        decisionIds,
        catalogMap,
        filteredResults
    };
}
