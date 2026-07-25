import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    resolveToken,
    isPassthroughCss,
    isResolvableSpacing,
    resetTokenWarnings,
    SPACING_TOKENS,
    SPACING_TOKEN_NAMES,
} from '../resolveToken';

describe('resolveToken (Spec 16)', () => {
    beforeEach(() => resetTokenWarnings());

    describe('tokens semânticos conhecidos', () => {
        it('traduz cada token de espaçamento para a CSS Variable do mapa oficial', () => {
            for (const name of SPACING_TOKEN_NAMES) {
                expect(resolveToken(name)).toBe(SPACING_TOKENS[name]);
            }
        });

        it('traduz "spacing-md" para a var --sarak-layout-gap-md (critério de aceite)', () => {
            expect(resolveToken('spacing-md')).toBe('var(--sarak-layout-gap-md, 16px)');
        });

        it('ignora espaços em volta do token', () => {
            expect(resolveToken('  spacing-lg  ')).toBe('var(--sarak-layout-gap-lg, 24px)');
        });
    });

    describe('CSS já válido (passthrough)', () => {
        it.each(['16px', '1.5rem', '2em', '50%', '100vh', '10vw', '0', 'var(--x, 8px)', 'calc(16px * 2)', 'clamp(8px, 2vw, 24px)'])(
            'deixa "%s" passar sem tradução',
            (value) => {
                expect(resolveToken(value)).toBe(value);
                expect(isPassthroughCss(value)).toBe(true);
            },
        );

        it('converte número finito para px', () => {
            expect(resolveToken(16)).toBe('16px');
        });
    });

    describe('valor inválido → aviso + fallback', () => {
        let warn: ReturnType<typeof vi.spyOn>;
        beforeEach(() => {
            warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        });
        afterEach(() => warn.mockRestore());

        it('avisa com sugestão e cai no fallback do Design Engine', () => {
            const result = resolveToken('banana', {
                atom: 'SarakFlex',
                prop: 'gap',
                fallback: 'var(--sarak-layout-gap-md, 16px)',
            });
            expect(result).toBe('var(--sarak-layout-gap-md, 16px)');
            expect(warn).toHaveBeenCalledTimes(1);
            const message = String(warn.mock.calls[0][0]);
            expect(message).toContain('banana');
            expect(message).toContain('SarakFlex.gap');
            expect(message).toContain('spacing-md');
        });

        it('sugere o token mais próximo (spacing-xs para "spacing-x")', () => {
            resolveToken('spacing-x', { atom: 'SarakFlex', prop: 'gap' });
            expect(String(warn.mock.calls[0][0])).toContain('"spacing-xs"');
        });

        it('não repete o mesmo aviso (cache anti-spam sob re-render)', () => {
            resolveToken('banana', { atom: 'SarakFlex', prop: 'gap' });
            resolveToken('banana', { atom: 'SarakFlex', prop: 'gap' });
            expect(warn).toHaveBeenCalledTimes(1);
        });
    });

    describe('ausência de valor (legítima, sem aviso)', () => {
        let warn: ReturnType<typeof vi.spyOn>;
        beforeEach(() => {
            warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        });
        afterEach(() => warn.mockRestore());

        it.each([undefined, null, ''])('devolve o fallback sem avisar para %s', (value) => {
            expect(resolveToken(value, { fallback: 'DEFAULT' })).toBe('DEFAULT');
            expect(warn).not.toHaveBeenCalled();
        });
    });

    describe('isResolvableSpacing', () => {
        it('aceita token conhecido e CSS válido; rejeita valor inventado', () => {
            expect(isResolvableSpacing('spacing-md')).toBe(true);
            expect(isResolvableSpacing('16px')).toBe(true);
            expect(isResolvableSpacing(24)).toBe(true);
            expect(isResolvableSpacing('banana')).toBe(false);
            expect(isResolvableSpacing('spacing-xxl')).toBe(false);
            expect(isResolvableSpacing({})).toBe(false);
        });
    });
});
