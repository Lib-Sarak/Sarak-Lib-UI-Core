import type { DesignScaffoldToken } from '@sarak/lib-ui-core/backend/node';
import { ProviderInterface } from '../core/providers/provider_interface.js';
import { THEME_SLICES } from '../config/shared/theme_slices.js';
import { fillThemeSlice } from './theme_slice_filler.js';
import { themeValidator } from './validator.js';
import { logger } from '../utils/logger.js';

export interface ThemeOrchestrationParams {
    scaffold: DesignScaffoldToken[];
    brief: string;
    mode: 'create' | 'patch';
    baseTheme?: Record<string, unknown>;
    provider: ProviderInterface;
    identity: string;
    rules: string;
    temperature: number;
    maxTokens: number;
    model: string;
}

export interface ThemeOrchestrationResult {
    /** Merge das fatias que passaram no parse E na validação de catálogo. `undefined` se nenhuma. */
    payload?: Record<string, unknown>;
    /** Labels legíveis (`ThemeSlice.label`) das fatias que falharam — nunca detalhe técnico. */
    failedSliceLabels: string[];
}

/**
 * Etapa 2 completa: dispara as 6 fatias em `Promise.allSettled` (uma fatia
 * falhando — JSON inválido ou reprovada no catálogo — nunca derruba as
 * demais, política de falha parcial da Regra 4 da Spec 03), valida cada fatia
 * isoladamente contra o catálogo real (`ThemeValidator`, a mesma engine que
 * `processThemeUpdate` usa no fim da cadeia) e funde só as que passaram.
 *
 * Política de falha parcial (documentada, não é a única possível): aplica as
 * fatias que passaram e reporta as que não passaram por `failedSliceLabels`
 * — só o nome humano da fatia (ex. "Atmosfera e Movimento"), nunca a chave
 * técnica nem o erro cru. Não tenta retry automático da fatia (dobraria
 * latência/custo pra um caso já raro por construção — cada fatia é pequena o
 * bastante pra não truncar; se ainda assim falhar, é mais provável ser um
 * problema pontual do provider do que algo que um retry sozinho resolveria de
 * forma confiável).
 */
export async function generateThemeSlices(params: ThemeOrchestrationParams): Promise<ThemeOrchestrationResult> {
    const { scaffold, brief, mode, baseTheme, provider, identity, rules, temperature, maxTokens, model } = params;

    // Idempotente e barato (sem I/O) — garante que o validador tem o catálogo
    // carregado independente da ordem de boot, sem depender de `main.ts` já
    // ter rodado `themeValidator.loadDynamicCatalog()`.
    await themeValidator.loadDynamicCatalog();

    const settled = await Promise.allSettled(
        THEME_SLICES.map((slice) =>
            fillThemeSlice({ slice, scaffold, brief, mode, baseTheme, provider, identity, rules, temperature, maxTokens, model })
        )
    );

    const payload: Record<string, unknown> = {};
    const failedSliceLabels: string[] = [];

    settled.forEach((result, index) => {
        const slice = THEME_SLICES[index];

        if (result.status === 'rejected') {
            logger.warning(`[ThemeOrchestrator] Fatia "${slice.label}" falhou: ${result.reason?.message ?? result.reason}`);
            failedSliceLabels.push(slice.label);
            return;
        }

        const sliceValues = result.value;
        if (Object.keys(sliceValues).length === 0) {
            return; // NENHUMA_ALTERACAO nesta fatia — não é falha, só não contribui pro payload.
        }

        try {
            themeValidator.validatePayload(sliceValues);
            Object.assign(payload, sliceValues);
        } catch (validationError: unknown) {
            const message = validationError instanceof Error ? validationError.message : String(validationError);
            logger.warning(`[ThemeOrchestrator] Fatia "${slice.label}" reprovada na validação: ${message}`);
            failedSliceLabels.push(slice.label);
        }
    });

    return {
        payload: Object.keys(payload).length > 0 ? payload : undefined,
        failedSliceLabels,
    };
}
