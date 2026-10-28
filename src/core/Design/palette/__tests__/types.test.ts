// @vitest-environment node
import { describe, expectTypeOf, it } from 'vitest';
import type { SarakPaletteInput, SarakPaletteMode, SarakPaletteType } from '../types';

describe('palette public types', () => {
    it('exposes the five supported harmonies and both color modes', () => {
        expectTypeOf<SarakPaletteType>().toEqualTypeOf<
            'monochromatic' | 'analogous' | 'complementary' | 'split-complementary' | 'triadic'
        >();
        expectTypeOf<SarakPaletteMode>().toEqualTypeOf<'light' | 'dark'>();
    });

    it('accepts optional secondary and accent hex seeds', () => {
        expectTypeOf<SarakPaletteInput>().toMatchTypeOf<{
            type: SarakPaletteType;
            base: string;
            secondary?: string;
            accent?: string;
        }>();
    });
});
