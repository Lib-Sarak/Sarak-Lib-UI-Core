// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { LIBRARY_TEXT_CATALOG } from '../../../i18n/catalog';
import { validateDesign } from '../../../Provider/utils/validation';
import { hexToOklch } from '../color-space';
import { parsePaletteValue } from '../parser';
import { resolvePalette } from '../resolve';
import { SARAK_LEGACY_PALETTE_IDS, SARAK_PALETTE_PRESET_TEXT_KEYS, SARAK_PALETTE_PRESETS } from '../presets';
import type { SarakPaletteType } from '../types';

const TYPES: SarakPaletteType[] = ['monochromatic', 'analogous', 'complementary', 'split-complementary', 'triadic'];
const ids = Object.keys(SARAK_PALETTE_PRESETS);

describe('SARAK_PALETTE_PRESETS — o catálogo de paletas prontas', () => {
    it('tem de 12 a 15 presets', () => {
        expect(ids.length).toBeGreaterThanOrEqual(12);
        expect(ids.length).toBeLessThanOrEqual(15);
    });

    it('tem ao menos três monocromáticos', () => {
        expect(Object.values(SARAK_PALETTE_PRESETS).filter((preset) => preset.type === 'monochromatic').length).toBeGreaterThanOrEqual(3);
    });

    it.each(TYPES)('tem ao menos dois presets do tipo %s', (type) => {
        const count = Object.values(SARAK_PALETTE_PRESETS).filter((preset) => preset.type === type).length;
        expect(count).toBeGreaterThanOrEqual(2);
    });

    it('todo preset é uma entrada válida do cálculo e resolve nos dois modos', () => {
        for (const id of ids) {
            expect(parsePaletteValue(id), id).not.toBeNull();
            for (const mode of ['light', 'dark'] as const) {
                expect(Object.keys(resolvePalette(SARAK_PALETTE_PRESETS[id], mode)).length, `${id} ${mode}`).toBeGreaterThan(0);
            }
        }
    });

    it('todo preset tem o nome no catálogo de textos, nos seis idiomas, e nenhum nome é repetido', () => {
        expect(Object.keys(SARAK_PALETTE_PRESET_TEXT_KEYS).sort()).toEqual([...ids].sort());
        const seen = new Set<string>();
        for (const id of ids) {
            const key = SARAK_PALETTE_PRESET_TEXT_KEYS[id] as keyof typeof LIBRARY_TEXT_CATALOG;
            const entry = LIBRARY_TEXT_CATALOG[key] as Record<string, string> | undefined;
            expect(entry, `${id}: chave ${key} fora do catálogo`).toBeDefined();
            expect(Object.keys(entry!).sort()).toEqual(['de', 'en', 'es', 'fr', 'it', 'pt']);
            expect(seen.has(entry!.pt), `nome repetido: ${entry!.pt}`).toBe(false);
            seen.add(entry!.pt);
        }
    });
});

describe('SARAK_PALETTE_PRESETS — os ids do `colorPalette` antigo', () => {
    it('nenhum preset usa um dos cinco valores antigos como id', () => {
        expect([...SARAK_LEGACY_PALETTE_IDS].sort()).toEqual(['default', 'matrix', 'neon', 'slate', 'sunset']);
        for (const legacy of SARAK_LEGACY_PALETTE_IDS) expect(ids, legacy).not.toContain(legacy);
    });

    it.each([...SARAK_LEGACY_PALETTE_IDS])('um design salvo com `colorPalette: %s` cai no comportamento sem paleta', (legacy) => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        try {
            expect(parsePaletteValue(legacy)).toBeNull();
            expect(validateDesign({ colorPalette: legacy, primaryColor: '#123456' }).colorPalette).toBeUndefined();
            expect(warn).toHaveBeenCalled();
        } finally {
            warn.mockRestore();
        }
    });
});

/** Os ids publicados na rc.4: um tema salvo por importador pode guardá-los, então nenhum sai do registro. */
const RC4_PRESET_IDS = [
    'oceano', 'ciano-violeta', 'verde-neon', 'cobalto-vivo', 'azul-projeto', 'grafite-rosa', 'terra-argila',
    'amarelo-contraste', 'ambar-industrial', 'tinta-vinho', 'rosa-synthwave', 'coral-cinetico', 'verde-tecnico',
    'ametista-petroleo', 'rosa-pastel',
];

describe('SARAK_PALETTE_PRESETS — ids da 8.0.0-rc.4', () => {
    it.each(RC4_PRESET_IDS)('%s continua válido e compõe uma paleta', (id) => {
        expect(ids).toContain(id);
        expect(parsePaletteValue(id)).not.toBeNull();
    });
});

/** O ângulo do matiz da secundária e do acento em relação à base, por tipo. */
const TYPE_ANGLES: Record<SarakPaletteType, [number, number]> = {
    monochromatic: [0, 0],
    analogous: [-30, 30],
    complementary: [30, 180],
    'split-complementary': [150, 210],
    triadic: [120, 240],
};
const hueGap = (left: number, right: number): number => {
    const gap = Math.abs(left - right) % 360;
    return Math.min(gap, 360 - gap);
};

describe('SARAK_PALETTE_PRESETS — harmonia do tipo', () => {
    it.each(ids)('%s: a secundária e o acento saem do ângulo do tipo', (id) => {
        const preset = SARAK_PALETTE_PRESETS[id];
        const base = hexToOklch(preset.base)!;
        const tolerance = preset.type === 'monochromatic' ? 10 : 15;
        ([['secondary', 0], ['accent', 1]] as const).forEach(([key, index]) => {
            const seed = preset[key];
            if (!seed) return;
            const color = hexToOklch(seed)!;
            expect(hueGap(color.hue, base.hue + TYPE_ANGLES[preset.type][index]), `${id} ${key}`).toBeLessThanOrEqual(tolerance);
            expect(color.chroma, `${id} ${key} croma`).toBeGreaterThanOrEqual(base.chroma * 0.6);
        });
    });
});
