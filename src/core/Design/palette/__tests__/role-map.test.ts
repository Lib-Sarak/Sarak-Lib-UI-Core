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
});
