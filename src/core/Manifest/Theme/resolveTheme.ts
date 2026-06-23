/**
 * Resolução da diretiva `theme` (Spec 42 — Ponte Manifesto ↔ Design Engine)
 *
 * Traduz a `ThemeDirective` de um nó no `design` final injetado num `DesignScope`,
 * sem o manifesto tocar CSS (Regra Zero "Design as Data"). Dois ramos:
 *  - **Preset nomeado** (`ThemePresetId`) ou binding interpolável `"{{designTheme}}"`:
 *    procura o preset em `GLOBAL_THEMES` e o aplica (Regra 1 / reatividade da Regra 4).
 *  - **Override parcial** (`SarakThemePayload`): mescla só as chaves declaradas sobre o
 *    tema herdado do pai (Regra 3), interpolando valores-string que contenham `{{ }}`.
 *
 * Falha fechado: preset desconhecido → mantém o tema herdado (não quebra a subárvore).
 * Zero `any`: a fronteira dinâmica é `SarakTokenValue`/`unknown`.
 */

import { GLOBAL_THEMES } from '../../Design/presets/themes';
import type { SarakThemePayload } from '../../Provider/types';
import { resolveBinding } from '../Binding/interpolate';
import type { StateRecord } from '../DataStore/resolvePath';
import type { ThemeDirective } from '../types';

/** Interpola valores-string (`"{{...}}"`) de um override parcial contra o estado atual. */
const interpolateOverride = (
    payload: Partial<SarakThemePayload>,
    scope: StateRecord,
    global: unknown,
): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload)) {
        if (value === undefined) continue;
        if (typeof value === 'string' && value.includes('{{')) {
            const resolved = resolveBinding(value, scope, global);
            out[key] = resolved ?? value;
        } else {
            out[key] = value;
        }
    }
    return out;
};

/**
 * Resolve a diretiva `theme` no `design` final a aplicar na subárvore, mesclado sobre
 * o tema herdado (`inherited`, vindo do `DesignOverrideContext` do pai). O retorno é o
 * `design` (mapa de tokens) que o `DesignScope` injeta como variáveis CSS isoladas.
 */
export const resolveTheme = (
    directive: ThemeDirective,
    scope: StateRecord,
    global: unknown,
    inherited: Partial<SarakThemePayload> | null,
): Record<string, unknown> => {
    const base: Record<string, unknown> = { ...(inherited ?? {}) };

    // Ramo preset nomeado / binding interpolável.
    if (typeof directive === 'string') {
        const id = directive.includes('{{')
            ? String(resolveBinding(directive, scope, global) ?? '')
            : directive;
        const preset = GLOBAL_THEMES.find((theme) => theme.id === id);
        if (!preset) {
            if (id.length > 0) {
                console.warn(`[Sarak:Theme] preset desconhecido "${id}"; mantendo o tema herdado.`);
            }
            return base;
        }
        return { ...base, ...preset.design };
    }

    // Ramo override parcial — mescla só as chaves declaradas sobre o herdado (Regra 3).
    return { ...base, ...interpolateOverride(directive, scope, global) };
};
