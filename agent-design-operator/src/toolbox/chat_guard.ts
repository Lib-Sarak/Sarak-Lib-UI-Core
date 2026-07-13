import { getDesignCatalog } from '@sarak/lib-ui-core/backend/node';
import { logger } from '../utils/logger.js';

const NEUTRAL_FALLBACK_MESSAGE = 'Entendido — ajustei o tema conforme o seu pedido.';

const STRUCTURAL_LEAK_MARKERS = ['[THEME_UPDATE', '{', '}'];

let cachedTokenIdPattern: RegExp | null = null;

const CAMEL_CASE_COMPOUND = /^[a-z]+[A-Z]/;

function getTokenIdPattern(): RegExp {
    if (cachedTokenIdPattern) return cachedTokenIdPattern;
    // Só ids camelCase COMPOSTOS (ex: `primaryColor`, `cardBorderRadius`) —
    // exatamente os exemplos que o prompt da Chamada A já cita como proibidos.
    // Ids de uma palavra só (`mode`, `layout`, `texture`...) ficam de fora de
    // propósito: são palavras comuns/empréstimos do português técnico e
    // dispararíamos falso-positivo numa frase legítima (ex. "um layout mais
    // compacto"), o que violaria a própria Regra 4 (nunca sacrificar uma
    // resposta válida por excesso de zelo).
    const ids = getDesignCatalog()
        .map((token) => token.id)
        .filter((id) => CAMEL_CASE_COMPOUND.test(id));
    cachedTokenIdPattern = new RegExp(`\\b(${ids.join('|')})\\b`);
    return cachedTokenIdPattern;
}

/**
 * Defesa em profundidade do Critério de Aceite 2 da Spec 03 ("a message nunca
 * contém `{`, `[THEME_UPDATE`, ou chave de token reconhecível do catálogo").
 * A correção primária é o prompt (Chamada A + `rules.md` proíbem isso
 * explicitamente) — este guard é o cinto de segurança pra quando um modelo
 * mais fraco desobedece de qualquer forma: nunca deixa o texto cru vazar pro
 * usuário, substitui por uma confirmação neutra em vez de expor o erro.
 */
export function sanitizeChatMessage(rawMessage: string): string {
    const hasStructuralLeak = STRUCTURAL_LEAK_MARKERS.some((marker) => rawMessage.includes(marker));
    const hasTokenNameLeak = getTokenIdPattern().test(rawMessage);

    if (hasStructuralLeak || hasTokenNameLeak) {
        logger.warning('[chat_guard] Chamada de chat vazou JSON/token técnico — substituindo por confirmação neutra.');
        return NEUTRAL_FALLBACK_MESSAGE;
    }

    return rawMessage;
}
