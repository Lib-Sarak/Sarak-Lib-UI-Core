// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
    CATALOG_GRID_2COL,
    CATALOG_GRID_3COL,
    PREVIEW_DUAL_VIEW_ITEM_ROW,
    PREVIEW_DUAL_VIEW_MIN_WIDTH,
    PREVIEW_DUAL_VIEW_ROW,
    PREVIEW_LAYOUT_GAP,
    PREVIEW_MIN_FRAME_WIDTH,
} from '../panelResponsive.presets';
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

    it('o dual-view só entra em linha quando duas larguras legíveis e o espaçamento cabem', () => {
        expect(PREVIEW_DUAL_VIEW_MIN_WIDTH).toBe(PREVIEW_MIN_FRAME_WIDTH * 2 + PREVIEW_LAYOUT_GAP);
        expect(PREVIEW_DUAL_VIEW_ROW).toBe(`@min-[${PREVIEW_DUAL_VIEW_MIN_WIDTH}px]:flex-row`);
        expect(PREVIEW_DUAL_VIEW_ITEM_ROW).toBe(
            `@min-[${PREVIEW_DUAL_VIEW_MIN_WIDTH}px]:flex-1 @min-[${PREVIEW_DUAL_VIEW_MIN_WIDTH}px]:min-h-0`,
        );
        expect(PREVIEW_DUAL_VIEW_ROW).not.toContain('xl:');
    });
});
