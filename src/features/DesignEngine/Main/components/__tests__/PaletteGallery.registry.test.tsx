import { describe, it, expect } from 'vitest';
import { SARAK_PALETTE_PRESETS } from '../../../../../core/Design/palette/presets';
import { groupPresetsByType } from '../../utils/paletteDraft';

const REAL_PALETTES = Object.keys(SARAK_PALETTE_PRESETS).length;
const GROUPS = groupPresetsByType();
const GROUPED_IDS = GROUPS.flatMap((group) => group.entries.map((entry) => entry.id));

describe('registro real de PaletteGallery', () => {
    it('agrupa cada paleta exatamente uma vez, sem opções Claro/Escuro duplicadas', () => {
        expect(REAL_PALETTES).toBeGreaterThan(3);
        expect(REAL_PALETTES).toBeLessThanOrEqual(78);
        expect(GROUPED_IDS).toHaveLength(REAL_PALETTES);
        expect(new Set(GROUPED_IDS).size).toBe(REAL_PALETTES);
        expect(GROUPED_IDS).not.toContain('light');
        expect(GROUPED_IDS).not.toContain('dark');
    });

    it('os filtros por tipo particionam o registro sem perder ou duplicar paletas', () => {
        expect(GROUPS.every((group) => group.entries.every((entry) => entry.input.type === group.type))).toBe(true);
        expect(GROUPS.reduce((sum, group) => sum + group.entries.length, 0)).toBe(REAL_PALETTES);
    });
});

