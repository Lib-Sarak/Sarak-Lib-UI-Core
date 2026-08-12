import { describe, it, expect } from 'vitest';
import { CATALOG_GRID_2COL, CATALOG_GRID_3COL, PREVIEW_DUAL_VIEW_ROW } from '../panelResponsive.presets';
import { BREAKPOINT_TABLET, BREAKPOINT_DESKTOP } from '../../../../core/Design/breakpoints';

describe('panelResponsive.presets (plan-35 — container query, não viewport)', () => {
    it('CATALOG_GRID_2COL usa o MESMO número do antigo `md:` (BREAKPOINT_TABLET), só como container query', () => {
        expect(CATALOG_GRID_2COL).toBe(`grid-cols-1 @min-[${BREAKPOINT_TABLET}px]:grid-cols-2`);
        expect(CATALOG_GRID_2COL).not.toContain('md:');
    });

    it('CATALOG_GRID_3COL usa os MESMOS números dos antigos `md:`/`lg:` (BREAKPOINT_TABLET/BREAKPOINT_DESKTOP)', () => {
        expect(CATALOG_GRID_3COL).toBe(
            `grid-cols-1 @min-[${BREAKPOINT_TABLET}px]:grid-cols-2 @min-[${BREAKPOINT_DESKTOP}px]:grid-cols-3`,
        );
        expect(CATALOG_GRID_3COL).not.toContain('md:');
        expect(CATALOG_GRID_3COL).not.toContain('lg:');
    });

    it('PREVIEW_DUAL_VIEW_ROW usa o MESMO número do antigo `xl:` (1280), só como container query', () => {
        expect(PREVIEW_DUAL_VIEW_ROW).toBe('@min-[1280px]:flex-row');
        expect(PREVIEW_DUAL_VIEW_ROW).not.toContain('xl:');
    });
});
