import { describe, expect, it } from 'vitest';
import { BP_SM } from '../../hooks/useStructuralStyles.presets';
import { INLINE_COLUMNS_CLASS } from '../resourceRowLayout';

describe('resourceRowLayout', () => {
    it('a linha inline vira três colunas no mesmo ponto do breakpoint pequeno', () => {
        expect(INLINE_COLUMNS_CLASS).toContain(`@min-[${BP_SM}px]:grid-cols-[minmax(0,1fr)_auto_auto]`);
        expect(INLINE_COLUMNS_CLASS.startsWith('grid-cols-1 ')).toBe(true);
    });
});
