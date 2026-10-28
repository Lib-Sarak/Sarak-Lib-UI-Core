// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { sarakGetAllDesignTokens } from '../../master-map';
import { PALETTE_ROLE_MAP } from '../role-map';

describe('PALETTE_ROLE_MAP', () => {
    it('covers every color token in the live schema exactly once', () => {
        const colorTokenIds = sarakGetAllDesignTokens()
            .filter((token) => token.type === 'color')
            .map((token) => token.id)
            .sort();
        expect(Object.keys(PALETTE_ROLE_MAP).sort()).toEqual(colorTokenIds);
    });

    it('provides a valid tone for both display modes', () => {
        Object.values(PALETTE_ROLE_MAP).forEach(({ toneByMode }) => {
            expect(toneByMode.light).toBeGreaterThan(0);
            expect(toneByMode.dark).toBeGreaterThan(0);
        });
    });

    it('o título e o título do card saem da primária (800 no claro, 200 no escuro), não do tom do texto', () => {
        for (const key of ['titleColor', 'cardTitleColor']) {
            expect(PALETTE_ROLE_MAP[key].scale, key).toBe('primary');
            expect(PALETTE_ROLE_MAP[key].toneByMode, key).toEqual({ light: 800, dark: 200 });
        }
    });

    it('mestre, secundário e apagado têm degraus distintos nos dois modos', () => {
        for (const mode of ['light', 'dark'] as const) {
            const tones = ['textColorMaster', 'textColorSecondary', 'textColorMuted'].map((key) => PALETTE_ROLE_MAP[key].toneByMode[mode]);
            expect(new Set(tones).size, mode).toBe(3);
        }
        expect(PALETTE_ROLE_MAP.subtitleColor.toneByMode).toEqual(PALETTE_ROLE_MAP.textColorSecondary.toneByMode);
    });
});
