// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createPalettePlan } from '../../../palette/tone-plan';
import { evaluatePair } from '../../../../../../gates/scripts/audit/verify_contrast';
import { SARAK_ALL_THEMES } from '../../themes/all';
import { composeThemeDesign } from '../../themes/compose';
import { resolveThemeForMode } from '../../themes/color-engine';
import { sarakGetAllDesignTokens } from '../../../master-map';
import type { SarakTokenValue } from '../../../types';
import { ALL_COMPONENT_PRESETS } from '../registry';

/**
 * Legibilidade: todo preset aplicado sobre cada tema embarcado, nos dois modos, mantém os pares de contraste passando.
 * A aplicação imita a do painel: o tema resolvido para o modo (o que o rascunho guarda) com o preset POR CIMA, e só
 * depois a composição da paleta — que é onde `sidebarTone` e `topbarTone` mudam as cores da barra. Os pares são os do
 * PLANO da paleta para aquele design (`createPalettePlan`): num tom contrastante o texto do corpo deixa de valer sobre a
 * barra e entram os pares do texto da própria barra.
 *
 * Atalho, e a prova dele: os pares só leem token de cor, e a paleta só depende de `colorPalette`, `mode` e dos tons da
 * barra. Preset que não escreve nenhum deles nem token de cor não pode mudar o resultado, então é medido sobre o design
 * já composto do tema (sem recompor a paleta, que custa ~12 ms). O teste de controle abaixo recompõe de verdade uma
 * amostra desses presets e exige o mesmo veredito.
 *
 * LIMITES DECLARADOS (R18): mede os pares de texto do plano; não vê contraste não textual (borda, gráfico) nem o
 * preset empilhado sobre outro (cada um entra sozinho).
 */
const MODES = ['light', 'dark'] as const;
const PALETTE_KEYS: ReadonlySet<string> = new Set(['colorPalette', 'mode', 'sidebarTone', 'topbarTone']);
const COLOR_TOKENS: ReadonlySet<string> = new Set(sarakGetAllDesignTokens().filter((token) => token.type === 'color').map((token) => token.id));

type Theme = (typeof SARAK_ALL_THEMES)[number];

const changesColor = (overlay: Record<string, unknown>): boolean => Object.keys(overlay).some((id) => PALETTE_KEYS.has(id) || COLOR_TOKENS.has(id));

const resolvedFor = (theme: Theme, mode: (typeof MODES)[number]): Record<string, unknown> =>
    resolveThemeForMode({ design: theme.design as Record<string, SarakTokenValue>, contraparte: theme.contraparte }, mode) as Record<string, unknown>;

const failingPairs = (design: Record<string, unknown>): string[] =>
    createPalettePlan(design).pairs
        .map((pair) => evaluatePair(pair, design))
        .filter((result) => !result.pulado && !result.pass)
        .map((result) => `${result.pair.fg} sobre ${result.pair.bgChain.join('>')}`);

const recomposed = (resolved: Record<string, unknown>, overlay: Record<string, unknown>): string[] =>
    failingPairs(composeThemeDesign({ ...resolved, ...overlay }) as unknown as Record<string, unknown>);

describe('presets de componente — legíveis sobre todo tema embarcado, nos dois modos', () => {
    it.each(SARAK_ALL_THEMES.map((theme) => [theme.id, theme] as const))('%s', (_id, theme) => {
        MODES.forEach((mode) => {
            const resolved = resolvedFor(theme, mode);
            const base = composeThemeDesign(resolved) as unknown as Record<string, unknown>;
            const baseline = new Set(failingPairs(base));
            const broken = ALL_COMPONENT_PRESETS.flatMap((preset) => {
                const overlay = preset.design as Record<string, unknown>;
                const failing = changesColor(overlay) ? recomposed(resolved, overlay) : failingPairs({ ...base, ...overlay });
                return failing.filter((pair) => !baseline.has(pair)).map((pair) => `${preset.id} (${mode}): ${pair}`);
            });
            expect(broken).toEqual([]);
        });
    }, 120_000);

    it('controle do atalho: recompor a paleta dá o mesmo veredito nos presets que não mexem em cor', () => {
        const structural = ALL_COMPONENT_PRESETS.filter((preset) => !changesColor(preset.design as Record<string, unknown>));
        const sample = structural.filter((_preset, index) => index % 25 === 0);
        expect(sample.length).toBeGreaterThan(5);
        SARAK_ALL_THEMES.slice(0, 3).forEach((theme) => MODES.forEach((mode) => {
            const resolved = resolvedFor(theme, mode);
            const base = composeThemeDesign(resolved) as unknown as Record<string, unknown>;
            sample.forEach((preset) => {
                const overlay = preset.design as Record<string, unknown>;
                expect(failingPairs({ ...base, ...overlay }).sort()).toEqual(recomposed(resolved, overlay).sort());
            });
        }));
    }, 120_000);

    it('os presets de tom da barra existem e entram no caminho que recompõe a paleta', () => {
        const toned = ALL_COMPONENT_PRESETS.filter((preset) => 'sidebarTone' in preset.design || 'topbarTone' in preset.design);
        expect(toned.length).toBeGreaterThanOrEqual(8);
        toned.forEach((preset) => expect(changesColor(preset.design as Record<string, unknown>)).toBe(true));
    });
});
