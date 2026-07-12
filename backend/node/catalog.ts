import { getAllDesignTokens, MASTER_DESIGN_MAP } from '../../src/core/Design/master-map';
import type { DesignToken, TokenValueType, SarakTokenValue } from '../../src/core/Design/types';

export interface DesignCatalogToken {
    id: string;
    label: string;
    type: TokenValueType;
    description?: string;
    axis?: 'color' | 'geometry' | 'elevation' | 'texture' | 'density' | 'motion';
    options?: { value?: string; id?: string; label: string }[];
    min?: number;
    max?: number;
}

export interface DesignScaffoldToken extends DesignCatalogToken {
    /** id do `ComponentSchema` de origem (ex: 'buttons', 'cards') — a "família" do token. */
    schemaId: string;
    /** Valor padrão real do gabarito (mesma fonte de `getScaffold()`), usado no modo `create`. */
    defaultValue: SarakTokenValue;
}

/**
 * Catálogo real de tokens configuráveis (Schema/MasterMap — mesma SSOT da paridade
 * 1:1:1:1:1), para consumo por backends Node externos (ex: agent-design-operator)
 * que precisam garantir que um payload gerado por IA só preenche valores de chaves
 * que já existem no sistema — nunca inventa chave nova (Spec 08 §4, Spec 09).
 *
 * A partir da Spec 02, também expõe `label`/`description`/`axis` — insumo do
 * pipeline de indexação semântica (RAG) do Design Agent, que precisa do texto
 * humano de cada token para gerar embeddings, não só o formato do valor.
 */
export function getDesignCatalog(): DesignCatalogToken[] {
    return getAllDesignTokens().map((token: DesignToken) => ({
        id: token.id,
        label: token.label,
        type: token.type,
        description: token.description,
        axis: token.axis,
        options: token.options ?? token.constraints?.options,
        min: token.min ?? token.constraints?.min,
        max: token.max ?? token.constraints?.max,
    }));
}

/**
 * Gabarito completo do tema (Spec 02, revisão pós-incidente de produção) — mesma
 * SSOT de `getScaffold()` (`src/core/Design/master-map.ts`), mas com a metadata
 * humana (`label`/`description`/`axis`) e o `schemaId` (família de origem) que o
 * pipeline de preenchimento fatiado do `agent-design-operator` precisa pra
 * agrupar as ~416 chaves em fatias por família sem duplicar a lista em nenhum
 * outro lugar (paridade 1:1:1:1:1 — a família é sempre lida de `MASTER_DESIGN_MAP`,
 * nunca hardcoded no consumidor).
 */
export function getDesignScaffold(): DesignScaffoldToken[] {
    return MASTER_DESIGN_MAP.components.flatMap((schema) =>
        schema.tokens.map((token: DesignToken) => ({
            id: token.id,
            label: token.label,
            type: token.type,
            description: token.description,
            axis: token.axis,
            options: token.options ?? token.constraints?.options,
            min: token.min ?? token.constraints?.min,
            max: token.max ?? token.constraints?.max,
            schemaId: schema.id,
            defaultValue: token.defaultValue,
        }))
    );
}
