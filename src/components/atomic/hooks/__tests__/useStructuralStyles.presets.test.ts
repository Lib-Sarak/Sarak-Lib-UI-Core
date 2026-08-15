import { describe, it, expect } from 'vitest';
import { RESPONSIVE_GRID_PRESETS, RESPONSIVE_SPACING_PRESETS, GRID_LAYOUT_STRATEGIES, BP_SM, BP_XL } from '../useStructuralStyles.presets';
import { BREAKPOINT_TABLET, BREAKPOINT_DESKTOP } from '../../../../core/Design/breakpoints';

describe('useStructuralStyles.presets', () => {
    // plan-49: `col-12` segue 12 trilhas fixas; o default de span por breakpoint usa os
    // MESMOS números de BREAKPOINT_TABLET/DESKTOP/BP_XL, escritos literais (plan-39) — não
    // prova que o filho SEM span vence o default nem que um filho COM span vence o pai
    // (isso é cascata CSS real, jsdom não a resolve); prova só a forma da classe emitida.
    it('GRID_LAYOUT_STRATEGIES["col-12"] usa os MESMOS números de BREAKPOINT_TABLET/DESKTOP/BP_XL para o default de span', () => {
        expect(GRID_LAYOUT_STRATEGIES['col-12']).toBe(
            `grid w-full grid-cols-1 @min-[${BREAKPOINT_TABLET}px]:grid-cols-12 ` +
            `@min-[${BREAKPOINT_TABLET}px]:[:where(&)>*]:col-span-6 ` +
            `@min-[${BREAKPOINT_DESKTOP}px]:[:where(&)>*]:col-span-4 ` +
            `@min-[${BP_XL}px]:[:where(&)>*]:col-span-3`,
        );
    });

    it('exposes the named responsive grid presets used by Templates/CalendarPanel', () => {
        expect(RESPONSIVE_GRID_PRESETS.cardsStandard).toBe(
            `grid-cols-1 @min-[${BREAKPOINT_TABLET}px]:grid-cols-2 @min-[${BP_XL}px]:grid-cols-3`,
        );
        expect(RESPONSIVE_GRID_PRESETS.catalogStandard).toBe(
            `grid-cols-1 @min-[${BREAKPOINT_TABLET}px]:grid-cols-2 @min-[${BREAKPOINT_DESKTOP}px]:grid-cols-3 @min-[${BP_XL}px]:grid-cols-4`,
        );
        expect(RESPONSIVE_GRID_PRESETS.statsStandard).toBe(`grid-cols-2 @min-[${BREAKPOINT_DESKTOP}px]:grid-cols-4`);
    });

    it('exposes the named responsive spacing presets used by ExpandableCard', () => {
        expect(RESPONSIVE_SPACING_PRESETS.expandableCardBody).toBe(`p-4 @min-[${BP_SM}px]:p-6 @min-[${BREAKPOINT_DESKTOP}px]:p-8`);
        expect(RESPONSIVE_SPACING_PRESETS.expandableCardHeader).toBe(`mb-4 @min-[${BP_SM}px]:mb-8`);
    });
});
