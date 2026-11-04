// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveAxisGaps, resolveGap } from '../useStructuralStyles.gap';
import { resetTokenWarnings } from '../../../../core/Design/resolveToken';

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
        // @ts-expect-error o runtime também valida valores fora do contrato quando o tipo é contornado.
        expect(resolveGap('spacing-xxl', 'DEFAULT', 'SarakFlex')).toBe('DEFAULT');
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });
});

describe('resolveAxisGaps (espaço por eixo que vence o gap)', () => {
    beforeEach(() => resetTokenWarnings());

    it('sem eixo pedido devolve objeto SEM chaves — uma chave undefined depois de `gap` zeraria o eixo', () => {
        const axes = resolveAxisGaps(undefined, undefined, 'SarakGrid');
        expect(axes).toEqual({});
        expect(Object.keys(axes)).toEqual([]);
    });

    it('traduz token semântico e passa CSS válido, cada eixo no seu', () => {
        expect(resolveAxisGaps('spacing-xl', '12px', 'SarakGrid')).toEqual({
            rowGap: 'calc(var(--sarak-layout-gap-lg, 24px) * 1.5)',
            columnGap: '12px',
        });
    });

    it('pede só um eixo: o outro não aparece', () => {
        expect(Object.keys(resolveAxisGaps(undefined, 'spacing-sm', 'SarakFlex'))).toEqual(['columnGap']);
    });

    it('valor inválido é ignorado (com aviso), sem chave', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        expect(resolveAxisGaps('spacing-zz' as never, undefined, 'SarakGrid')).toEqual({});
        expect(warn).toHaveBeenCalledOnce();
        warn.mockRestore();
    });
});
