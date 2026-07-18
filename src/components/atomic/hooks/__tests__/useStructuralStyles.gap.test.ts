import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveGap } from '../useStructuralStyles.gap';
import { resetTokenWarnings } from '../../../../core/Manifest/Tokens';

describe('resolveGap (ponte prop → resolutor de tokens, Spec 16)', () => {
    beforeEach(() => resetTokenWarnings());

    it('devolve o fallback quando não há override (ausência legítima)', () => {
        expect(resolveGap(undefined, 'var(--sarak-layout-gap-md, 16px)', 'SarakFlex')).toBe(
            'var(--sarak-layout-gap-md, 16px)',
        );
    });

    it('preserva um fallback numérico do Design Engine', () => {
        expect(resolveGap(undefined, 16, 'SarakFlex')).toBe(16);
    });

    it('traduz um token semântico para a CSS Variable', () => {
        expect(resolveGap('spacing-md', 'DEFAULT', 'SarakFlex')).toBe('var(--sarak-layout-gap-md, 16px)');
    });

    it('deixa CSS válido passar direto', () => {
        expect(resolveGap('12px', 'DEFAULT', 'SarakFlex')).toBe('12px');
    });

    it('avisa e cai no fallback para valor inventado', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        expect(resolveGap('spacing-xxl', 'DEFAULT', 'SarakFlex')).toBe('DEFAULT');
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });
});
