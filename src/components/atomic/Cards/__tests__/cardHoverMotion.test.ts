import { describe, it, expect } from 'vitest';
import { resolveCardHoverMotion } from '../cardHoverMotion';

describe('resolveCardHoverMotion — estilo de hover dos cartões que se movem por framer-motion', () => {
    it('lift sobe o valor de cardHoverTranslate', () => {
        const motion = resolveCardHoverMotion({ cardHoverStyle: 'lift', cardHoverTranslate: -10 });
        expect(motion).toEqual({ y: -10, scale: 1.01 });
    });

    it('lift sem cardHoverTranslate sobe o padrão do desenho original (-4px)', () => {
        expect(resolveCardHoverMotion({ cardHoverStyle: 'lift' })).toEqual({ y: -4, scale: 1.01 });
    });

    it('sem estilo declarado vale lift', () => {
        expect(resolveCardHoverMotion(undefined)).toEqual({ y: -4, scale: 1.01 });
    });

    it('expand cresce e não se move', () => {
        expect(resolveCardHoverMotion({ cardHoverStyle: 'expand', cardHoverTranslate: -10 })).toEqual({ scale: 1.02 });
    });

    it('glow-only não move o cartão', () => {
        expect(resolveCardHoverMotion({ cardHoverStyle: 'glow-only', cardHoverTranslate: -10 })).toEqual({});
    });
});
