import { MASTER_DESIGN_MAP } from '../../../core/Design/master-map';
import { TokenCatalog } from '../../../core/Design/catalog';
import { PreferencesSchema } from '../../../core/Design/schema/preferences';
import type { ComponentSchema } from '../../../core/Design/types';
import { buildDynamicGroups } from './dynamic-categories';
import type { DecisionContext, TokenMeta } from './decisions';

interface CatalogRow extends TokenMeta {
    tokenId: string;
    categories?: string[];
}

/** Os dados reais do motor que a coluna de decisões consome: folksonomia, metadados do catálogo e o bloco global. */
export const buildDecisionContext = (): DecisionContext => {
    const rows: readonly CatalogRow[] = TokenCatalog;
    const components = MASTER_DESIGN_MAP.components as unknown as ComponentSchema[];
    return {
        grouped: buildDynamicGroups(components, Array.from(rows)),
        meta: new Map(rows.map((row) => [row.tokenId, row])),
        globalTokens: components.find((component) => component.id === 'global')?.tokens ?? [],
        preferenceTokens: PreferencesSchema.tokens,
    };
};
