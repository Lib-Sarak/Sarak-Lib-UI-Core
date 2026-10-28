// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { LIBRARY_TEXT_CATALOG } from '../../../i18n/catalog';
import { validateDesign } from '../../../Provider/utils/validation';
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
