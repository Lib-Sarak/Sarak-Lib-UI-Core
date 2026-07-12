import { getDesignCatalog, type DesignCatalogToken } from '@sarak/lib-ui-core/backend/node';

/**
 * Serializa uma lista de tokens do catálogo em texto compacto para injetar no
 * system prompt do LLM — é a "fonte da verdade" que impede o agente de inventar
 * chaves (Spec 09: o agente só Configura valores em chaves que já existem).
 * Usada por `theme_slice_filler.ts` (Spec 02, revisão pós-incidente) com o
 * gabarito COMPLETO (`getDesignScaffold()`) em cada uma das 6 fatias — é
 * contexto de coerência, não um recorte por relevância (o retrieval semântico
 * que fazia esse recorte foi engavetado, ver `_shelved/catalog_indexer.ts`).
 */
export function formatCatalogPromptBlock(tokens: DesignCatalogToken[]): string {
    const lines = tokens.map(token => {
        if (token.type === 'select' && token.options?.length) {
            const options = token.options.map(opt => opt.value ?? opt.id).join('|');
            return `${token.id} (select: ${options})`;
        }
        if ((token.type === 'slider' || token.type === 'number') && (token.min !== undefined || token.max !== undefined)) {
            return `${token.id} (${token.type}: ${token.min ?? '-inf'}..${token.max ?? '+inf'})`;
        }
        return `${token.id} (${token.type})`;
    });

    return `[DICIONÁRIO DE TOKENS DISPONÍVEIS — ${tokens.length} chaves]\n${lines.join('\n')}`;
}

/**
 * Atalho pro catálogo completo formatado (sem `schemaId`/`defaultValue`) —
 * usado fora do fluxo principal (ex: depuração, testes). `routes.ts` usa
 * `formatCatalogPromptBlock(scaffold)` com `getDesignScaffold()`, não isto.
 */
export function buildCatalogPromptBlock(): string {
    return formatCatalogPromptBlock(getDesignCatalog());
}
