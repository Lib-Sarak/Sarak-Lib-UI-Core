// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { SARAK_PALETTE_PRESETS } from '../presets';

describe('SARAK_PALETTE_PRESETS', () => {
    it('keeps the initial test registry small and resolvable', () => {
        expect(Object.keys(SARAK_PALETTE_PRESETS)).toEqual(['oceano']);
        expect(SARAK_PALETTE_PRESETS.oceano).toEqual({ type: 'analogous', base: '#2563eb' });
    });
});
