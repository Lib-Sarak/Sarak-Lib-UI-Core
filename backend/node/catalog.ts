import { getAllDesignTokens } from '../../src/core/Design/master-map';
import type { DesignToken, TokenValueType } from '../../src/core/Design/types';

export interface DesignCatalogToken {
    id: string;
    type: TokenValueType;
    options?: { value?: string; id?: string; label: string }[];
    min?: number;
    max?: number;
}

/**
 * Catálogo real de tokens configuráveis (Schema/MasterMap — mesma SSOT da paridade
 * 1:1:1:1:1), para consumo por backends Node externos (ex: agent-design-operator)
 * que precisam garantir que um payload gerado por IA só preenche valores de chaves
 * que já existem no sistema — nunca inventa chave nova (Spec 08 §4, Spec 09).
 */
export function getDesignCatalog(): DesignCatalogToken[] {
    return getAllDesignTokens().map((token: DesignToken) => ({
        id: token.id,
        type: token.type,
        options: token.options ?? token.constraints?.options,
        min: token.min ?? token.constraints?.min,
        max: token.max ?? token.constraints?.max,
    }));
}
