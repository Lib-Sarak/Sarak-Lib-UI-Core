// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { PALETTE_ROLE_MAP } from '../../../palette/role-map';
import { SARAK_PALETTE_PRESETS } from '../../../palette/presets';
import { SARAK_ALL_THEMES } from '../all';
import { composeThemeForMode } from '../compose';
import { resolveThemeForMode } from '../color-engine';
import { MASTER_DESIGN_MAP } from '../../../master-map';

const roleKeys = Object.keys(PALETTE_ROLE_MAP);

describe('os temas embarcados tiram a cor de uma paleta', () => {
    it.each(SARAK_ALL_THEMES.map((theme) => [theme.id, theme] as const))('%s declara um preset que existe', (_id, theme) => {
        const palette = (theme.design as Record<string, unknown>).colorPalette;
        expect(typeof palette).toBe('string');
        expect(Object.keys(SARAK_PALETTE_PRESETS)).toContain(palette);
    });

    it('todo preset do catálogo é usado por ao menos um tema (nenhuma entrada sobra)', () => {
        const used = new Set(SARAK_ALL_THEMES.map((theme) => (theme.design as Record<string, unknown>).colorPalette));
        for (const id of Object.keys(SARAK_PALETTE_PRESETS)) expect(used.has(id), id).toBe(true);
    });

    it('o tema declara só sobrescrita nos tokens de cor: bem menos que o mapa de papéis inteiro', () => {
        for (const theme of SARAK_ALL_THEMES) {
            const declared = roleKeys.filter((key) => key in (theme.design as Record<string, unknown>));
            expect(declared.length, theme.id).toBeLessThan(roleKeys.length / 2);
        }
    });

    it('toda sobrescrita da contraparte tem a irmã no design e vice-versa (nada vaza para o outro modo)', () => {
        for (const theme of SARAK_ALL_THEMES) {
            const inDesign = roleKeys.filter((key) => key in (theme.design as Record<string, unknown>)).sort();
            const inContra = roleKeys.filter((key) => key in (theme.contraparte as Record<string, unknown>)).sort();
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

    it('a cor mantida pelo tema vence a paleta; o resto vem dela', () => {
        const theme = SARAK_ALL_THEMES.find((candidate) => candidate.id === 'neo-brutalism')!;
        const resolved = resolveThemeForMode(theme as never, 'light') as Record<string, unknown>;
        const composed = composeThemeForMode(theme as never, 'light') as unknown as Record<string, unknown>;
        expect(composed.colorBgBody).toBe(resolved.colorBgBody);
        expect(composed.titleColor).not.toBe(resolved.colorBgBody);
        expect(resolved.titleColor).toBeUndefined();
    });
});
