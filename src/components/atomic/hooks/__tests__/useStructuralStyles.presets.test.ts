import { describe, it, expect } from 'vitest';
import { RESPONSIVE_GRID_PRESETS, RESPONSIVE_SPACING_PRESETS } from '../useStructuralStyles.presets';

describe('useStructuralStyles.presets', () => {
    it('exposes the named responsive grid presets used by Templates/CalendarPanel', () => {
        expect(RESPONSIVE_GRID_PRESETS.cardsStandard).toBe('grid-cols-1 @min-[768px]:grid-cols-2 @min-[1280px]:grid-cols-3');
        expect(RESPONSIVE_GRID_PRESETS.catalogStandard).toBe('grid-cols-1 @min-[768px]:grid-cols-2 @min-[1024px]:grid-cols-3 @min-[1280px]:grid-cols-4');
        expect(RESPONSIVE_GRID_PRESETS.statsStandard).toBe('grid-cols-2 @min-[1024px]:grid-cols-4');
    });

    it('exposes the named responsive spacing presets used by ExpandableCard', () => {
        expect(RESPONSIVE_SPACING_PRESETS.expandableCardBody).toBe('p-4 @min-[640px]:p-6 @min-[1024px]:p-8');
        expect(RESPONSIVE_SPACING_PRESETS.expandableCardHeader).toBe('mb-4 @min-[640px]:mb-8');
    });
});
