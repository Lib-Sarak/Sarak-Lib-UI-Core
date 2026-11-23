// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { PALETTE_ROLE_MAP } from '../../../palette/role-map';
import { SARAK_PALETTE_PRESETS } from '../../../palette/presets';
import { parsePaletteValue } from '../../../palette/parser';
import { SARAK_ALL_THEMES } from '../all';
import { composeThemeForMode } from '../compose';
import { resolveThemeForMode } from '../color-engine';
import { MASTER_DESIGN_MAP } from '../../../master-map';
import { PAIRS } from '../../../palette/contrast-pairs';
import { evaluatePair } from '../../../../../../gates/scripts/audit/verify_contrast';

const roleKeys = Object.keys(PALETTE_ROLE_MAP);

/**
 * Variantes de cor da galeria (a mesma base de um preset de tema, outra combinação): nenhum tema embarcado as usa.
 * `rosa-synthwave` é a paleta do tema que saiu do catálogo; ela segue na galeria até a decisão sobre as paletas.
 */
const CATALOG_ORIGIN = ['oceano', 'ciano-violeta', 'ciano-azul', 'verde-neon', 'cobalto-vivo', 'azul-projeto', 'amarelo-contraste', 'grafite-rosa', 'terra-argila', 'oliva-viva', 'oliva-dourada', 'ambar-industrial', 'tinta-vinho', 'tinta-azul', 'rosa-synthwave', 'coral-cinetico', 'verde-tecnico', 'ametista-petroleo', 'rosa-pastel'];
const GALLERY_ONLY_PRESETS = ['ciano-azul', 'oliva-dourada', 'oliva-viva', 'rosa-synthwave', 'tinta-azul'];

describe('os temas embarcados tiram a cor de uma paleta', () => {
    it.each(SARAK_ALL_THEMES.map((theme) => [theme.id, theme] as const))('%s declara um preset que existe, ou uma paleta `custom:` válida', (_id, theme) => {
        const palette = (theme.design as Record<string, unknown>).colorPalette;
        expect(typeof palette).toBe('string');
        if (String(palette).startsWith('custom:')) expect(parsePaletteValue(palette), 'paleta custom inválida').not.toBeNull();
        else expect(Object.keys(SARAK_PALETTE_PRESETS)).toContain(palette);
    });

    it('todo preset de origem do catálogo é usado por ao menos um tema, salvo os que só a galeria oferece (as paletas da planilha do dono são só da galeria)', () => {
        const used = new Set(SARAK_ALL_THEMES.map((theme) => (theme.design as Record<string, unknown>).colorPalette));
        const galleryOnly = CATALOG_ORIGIN.filter((id) => !used.has(id));
        expect([...galleryOnly].sort()).toEqual(GALLERY_ONLY_PRESETS);
    });

    it('o tema declara só sobrescrita nos tokens de cor: bem menos que o mapa de papéis inteiro', () => {
        for (const theme of SARAK_ALL_THEMES) {
            const declared = roleKeys.filter((key) => key in (theme.design as Record<string, unknown>));
            expect(declared.length, theme.id).toBeLessThan(roleKeys.length / 2);
        }
    });

    // A faixa da marca é a mesma nos dois modos: o tema que a declara a escreve uma vez, no design, e a contraparte a herda.
    const BRAND_BANDS = ['sidebarBrandBackground', 'topbarBrandBackground'];

    it('toda sobrescrita da contraparte tem a irmã no design e vice-versa (nada vaza para o outro modo), salvo as faixas da marca, que valem nos dois', () => {
        for (const theme of SARAK_ALL_THEMES) {
            const inDesign = roleKeys.filter((key) => key in (theme.design as Record<string, unknown>) && !BRAND_BANDS.includes(key)).sort();
            const inContra = roleKeys.filter((key) => key in (theme.contraparte as Record<string, unknown>) && !BRAND_BANDS.includes(key)).sort();
            expect(inContra, theme.id).toEqual(inDesign);
        }
    });

    it('o design composto de cada tema, nos dois modos, traz todo token de cor do mapa', () => {
        const colorTokenIds = MASTER_DESIGN_MAP.components.flatMap((component) => component.tokens).filter((token) => token.type === 'color').map((token) => token.id);
        for (const theme of SARAK_ALL_THEMES) {
            for (const mode of ['light', 'dark'] as const) {
                const composed = composeThemeForMode(theme as never, mode) as unknown as Record<string, unknown>;
                expect(composed.mode, `${theme.id} ${mode}`).toBe(mode);
                for (const id of colorTokenIds) expect(typeof composed[id], `${theme.id} ${mode} ${id}`).toBe('string');
            }
        }
    });

    it('as faixas da marca são a mesma cor nos dois modos, em todo tema, e o texto sobre elas passa a 4,5:1', () => {
        const bandPairs = PAIRS.filter((pair) => pair.fg === 'sidebarBrandColor' || pair.fg === 'topbarBrandColor');
        expect(bandPairs).toHaveLength(2);
        for (const theme of SARAK_ALL_THEMES) {
            const [light, dark] = (['light', 'dark'] as const).map((mode) => composeThemeForMode(theme as never, mode) as unknown as Record<string, unknown>);
            for (const band of BRAND_BANDS) expect(light[band], `${theme.id} ${band}`).toBe(dark[band]);
            for (const design of [light, dark]) {
                for (const pair of bandPairs) {
                    const result = evaluatePair(pair, design);
                    expect(result.pulado, `${theme.id} ${design.mode} ${pair.fg}`).toBe(false);
                    if (!result.pulado) expect(result.pass, `${theme.id} ${design.mode} ${pair.fg}: ${result.ratio}`).toBe(true);
                }
            }
        }
    });

    it('a cor mantida pelo tema vence a paleta; o resto vem dela', () => {
        const theme = SARAK_ALL_THEMES.find((candidate) => candidate.id === 'neo-brutalism')!;
        const resolved = resolveThemeForMode(theme as never, 'light') as Record<string, unknown>;
        const composed = composeThemeForMode(theme as never, 'light') as unknown as Record<string, unknown>;
        expect(composed.colorBgBody).toBe(resolved.colorBgBody);
        expect(composed.titleColor).not.toBe(resolved.colorBgBody);
        expect(resolved.titleColor).toBeUndefined();
    });
});
