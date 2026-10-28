import { describe, it, expect } from 'vitest';
import {
    buildCustomPaletteValue,
    buildPaletteDraftPatch,
    findManualColorAdjustments,
    groupPresetsByType,
    presetLabel,
    presetTextKey,
    toValidPaletteInput,
} from '../paletteDraft';
import { parsePaletteValue } from '../../../../../core/Design/palette/parser';
import { sarakResolvePalette } from '../../../../../core/Design/palette/resolve';

describe('paletteDraft', () => {
    it('agrupa o registro por tipo, na ordem dos tipos, sem grupo vazio', () => {
        const groups = groupPresetsByType({
            b: { type: 'triadic', base: '#112233' },
            a: { type: 'analogous', base: '#2563eb' },
            c: { type: 'analogous', base: '#16a34a' },
        });
        expect(groups.map((group) => group.type)).toEqual(['analogous', 'triadic']);
        expect(groups[0].entries.map((entry) => entry.id)).toEqual(['a', 'c']);
    });

    it('rotula o preset a partir do id (só o recuo)', () => {
        expect(presetLabel('ceu-aberto')).toBe('Ceu aberto');
    });

    it('todo preset real do registro tem chave de nome no catálogo', () => {
        const entries = groupPresetsByType().flatMap((group) => group.entries);
        expect(entries.length).toBeGreaterThan(1);
        entries.forEach((entry) => expect(entry.textKey, `${entry.id} sem chave de texto`).toBeDefined());
        expect(presetTextKey('ciano-violeta')).toBe('palettePresetCianoVioleta');
        expect(presetTextKey('inexistente')).toBeUndefined();
    });

    it('monta o valor custom com vírgula entre as sementes e o parser o devolve igual', () => {
        const input = { type: 'analogous' as const, base: '#2563eb', secondary: '#16a34a', accent: '#f59e0b' };
        const value = buildCustomPaletteValue(input);
        expect(value).toBe('custom:analogous:#2563eb,sec=#16a34a,acc=#f59e0b');
        expect(value).not.toContain(';');
        expect(parsePaletteValue(value)).toEqual(input);
    });

    it('recusa entrada com cor que o motor não entende', () => {
        expect(toValidPaletteInput({ type: 'triadic', base: 'azul' })).toBeNull();
        expect(toValidPaletteInput({ type: 'triadic', base: '#2563eb', accent: '#zzz' })).toBeNull();
        expect(toValidPaletteInput({ type: 'triadic', base: '#2563eb' })).not.toBeNull();
    });

    it('o patch traz colorPalette e as cores calculadas do modo', () => {
        const value = 'custom:complementary:#2563eb';
        const patch = buildPaletteDraftPatch(value, 'light');
        expect(patch.colorPalette).toBe(value);
        const calculated = sarakResolvePalette(value, 'light');
        Object.entries(calculated).forEach(([tokenId, color]) => expect(patch[tokenId]).toBe(color));
    });

    it('o patch poupa os tokens mantidos', () => {
        const patch = buildPaletteDraftPatch('custom:complementary:#2563eb', 'dark', ['sidebarColor']);
        expect(patch).not.toHaveProperty('sidebarColor');
        expect(patch).toHaveProperty('topbarColor');
    });

    it('detecta só o token de cor que difere da referência', () => {
        const reference = sarakResolvePalette('custom:analogous:#2563eb', 'dark');
        const draft = { ...reference, sidebarColor: '#123456', systemName: 'ERP' };
        expect(findManualColorAdjustments(draft, reference)).toEqual(['sidebarColor']);
        expect(findManualColorAdjustments(reference, reference)).toEqual([]);
    });
});
