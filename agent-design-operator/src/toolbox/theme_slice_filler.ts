import type { DesignScaffoldToken } from '@sarak/lib-ui-core/backend/node';
import { ProviderInterface } from '../core/providers/provider_interface.js';
import { GLOBAL_SYSTEM_CONSTRAINTS } from '../config/shared/global_prompts.js';
import { formatCatalogPromptBlock } from './catalog_prompt.js';
import { getSliceTokens, type ThemeSlice } from '../config/shared/theme_slices.js';

// Orçamento de tokens de saída por chave do JSON da fatia (estimativa
// conservadora pra uma entrada `"tokenId": valor,` — cobre chaves camelCase
// longas e valores de cor/rgba, que são o caso mais verboso do catálogo) mais
// uma margem fixa pra chaves/colchetes do objeto. As 6 fatias NÃO são do
// mesmo tamanho (a família `cards` sozinha tem 79 tokens, então a fatia
// "Superfícies" chega a 112 chaves reais — bem acima da média de ~68 —, ver
// Seção 6 da spec 02) — usar sempre o `maxTokens` configurado (pensado pra uma única
// resposta pequena) arriscaria truncar justo a fatia maior, repetindo o
// defeito original que esta arquitetura existe pra evitar. O efetivo usado
// nunca é MENOR que o configurado — só cresce quando a fatia exige mais.
const ESTIMATED_OUTPUT_TOKENS_PER_KEY = 20;
const OUTPUT_TOKENS_MARGIN = 300;

export function computeSliceMaxTokens(sliceKeyCount: number, configuredMaxTokens: number): number {
    return Math.max(configuredMaxTokens, sliceKeyCount * ESTIMATED_OUTPUT_TOKENS_PER_KEY + OUTPUT_TOKENS_MARGIN);
}

export interface FillThemeSliceParams {
    slice: ThemeSlice;
    /** Gabarito completo (~416 chaves) — vai inteiro no prompt, só pra contexto/coerência. */
    scaffold: DesignScaffoldToken[];
    brief: string;
    mode: 'create' | 'patch';
    /** Tema atual completo — obrigatório quando `mode === 'patch'`. */
    baseTheme?: Record<string, unknown>;
    provider: ProviderInterface;
    identity: string;
    rules: string;
    temperature: number;
    maxTokens: number;
    model: string;
}

/**
 * Etapa 2 (uma das 6 chamadas em paralelo): preenche SÓ as chaves de uma
 * família de tokens, usando o Design Brief e o gabarito inteiro como contexto
 * de coerência. Cada fatia devolve uma FRAÇÃO do catálogo (entre 48 e 113
 * chaves, dependendo da fatia — a família `cards` sozinha tem 79 tokens, então
 * "Superfícies" é bem maior que a média) — pequena o bastante, com o
 * `maxTokens` dimensionado por `computeSliceMaxTokens`, pra nunca ser cortada
 * por `max_tokens` POR CONSTRUÇÃO, ao contrário do payload único e grande que
 * causava o truncamento original (Spec 03, Seção 1).
 *
 * Lança erro se o provider não devolver JSON parseável — a chamada quem
 * decide como tratar isso (fatia isolada, não derruba as demais) é
 * `theme_orchestrator.ts` (Regra 4 da Spec 03: falha parcial nunca vaza JSON
 * cru nem produz 500).
 */
export async function fillThemeSlice(params: FillThemeSliceParams): Promise<Record<string, unknown>> {
    const { slice, scaffold, brief, mode, baseTheme, provider, identity, rules, temperature, maxTokens, model } = params;

    if (mode === 'patch' && !baseTheme) {
        throw new Error(`[theme_slice_filler] Fatia "${slice.label}": modo 'patch' exige 'baseTheme'.`);
    }

    const sliceTokens = getSliceTokens(slice, scaffold);
    const sliceIds = sliceTokens.map((token) => token.id);

    const baseSliceValues = mode === 'patch' && baseTheme
        ? Object.fromEntries(sliceIds.filter((id) => id in baseTheme).map((id) => [id, baseTheme[id]]))
        : undefined;

    const modeInstruction = mode === 'create'
        ? 'MODO CRIAÇÃO: preencha TODAS as chaves desta fatia, mesmo que o Brief não mencione uma área específica dela — extrapole com bom senso, mantendo coerência com o resto do Brief.'
        : 'MODO PATCH: o tema base atual desta fatia está em [TEMA BASE ATUAL]. Emita SÓ as chaves que precisam MUDAR pra atender o Brief — não repita chaves cujo valor atual já está correto.';

    const systemPrompt =
        `${GLOBAL_SYSTEM_CONSTRAINTS}\n\n` +
        `[AGENT IDENTITY]\n${identity}\n\n` +
        `[REGRA ABSOLUTA DESTA CHAMADA]\n` +
        `Sua resposta é consumida por um parser JSON, NUNCA por um humano. É TERMINANTEMENTE PROIBIDO:\n` +
        `- Escrever qualquer texto fora do JSON (sem saudação, sem explicação, sem markdown \`\`\`).\n` +
        `- Inventar uma chave que não está em [CHAVES DESTA FATIA] abaixo — mesmo que exista no\n` +
        `  restante do catálogo, ela pertence a outra fatia e outra chamada já cuida dela.\n` +
        `- Devolver um objeto vazio {} se não houver nenhuma alteração a fazer nesta fatia — nesse\n` +
        `  caso devolva literalmente a string "NENHUMA_ALTERACAO" (sem JSON).\n\n` +
        `Você é responsável SOMENTE pela fatia "${slice.label}" do tema — as demais famílias de\n` +
        `tokens são preenchidas por outras chamadas em paralelo, todas seguindo o mesmo Design\n` +
        `Brief abaixo. ${modeInstruction}\n\n` +
        `Sua resposta deve ser SOMENTE um objeto JSON válido, no formato:\n` +
        `{"nomeDoToken1": valor1, "nomeDoToken2": valor2}\n\n` +
        `[DESIGN BRIEF]\n${brief}\n\n` +
        (baseSliceValues ? `[TEMA BASE ATUAL — só as chaves desta fatia]\n${JSON.stringify(baseSliceValues)}\n\n` : '') +
        `[CATÁLOGO COMPLETO — contexto pra coerência entre fatias, ${scaffold.length} chaves ao todo]\n${formatCatalogPromptBlock(scaffold)}\n\n` +
        `[CHAVES DESTA FATIA — "${slice.label}", SÓ estas podem aparecer na sua resposta]\n${sliceIds.join(', ')}\n\n` +
        `[STRICT GUARDRAILS]\n${rules}`;

    const effectiveMaxTokens = computeSliceMaxTokens(sliceIds.length, maxTokens);

    const rawResult = await provider.generateResponse(
        systemPrompt,
        [{ role: 'user', content: brief }],
        temperature,
        effectiveMaxTokens,
        model
    );

    if (typeof rawResult !== 'string') {
        throw new Error(`[theme_slice_filler] Fatia "${slice.label}": provider não retornou uma string.`);
    }

    const trimmed = rawResult.trim();
    if (trimmed === 'NENHUMA_ALTERACAO') {
        return {};
    }

    try {
        return JSON.parse(trimmed);
    } catch {
        throw new Error(`[theme_slice_filler] Fatia "${slice.label}": resposta não é JSON válido.`);
    }
}
