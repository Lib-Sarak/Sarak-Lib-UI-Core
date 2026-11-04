import { describe, it, expect } from 'vitest';
import { TYPOGRAPHY_PRESETS } from '../typography';

describe('TYPOGRAPHY_PRESETS', () => {
    it('um preset de fonte grava só headingFont e bodyFont — nem mono nem token de H1', () => {
        for (const preset of TYPOGRAPHY_PRESETS) {
            expect(Object.keys(preset.design).sort()).toEqual(['bodyFont', 'headingFont']);
            expect(preset.design.headingFont).toBe(preset.design.bodyFont);
        }
    });

    it('não toca monoFont nem nenhum token de H1', () => {
        const written = new Set(TYPOGRAPHY_PRESETS.flatMap((preset) => Object.keys(preset.design)));
        expect(written.has('monoFont')).toBe(false);
        expect([...written].some((id) => id.startsWith('h1'))).toBe(false);
    });
});
