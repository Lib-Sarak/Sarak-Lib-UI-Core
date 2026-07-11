import { getDesignCatalog } from '@sarak/lib-ui-core/backend/node';

/**
 * Serializa o catálogo real de tokens em texto compacto para injetar no system
 * prompt do LLM — é a "fonte da verdade" que impede o agente de inventar chaves
 * (Spec 09: o agente só Configura valores em chaves que já existem).
 */
export function buildCatalogPromptBlock(): string {
    const tokens = getDesignCatalog();
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
