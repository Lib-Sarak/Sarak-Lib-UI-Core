import { describe, it, expect } from 'vitest';
import { mergeUIContextValue } from '../mergeUIContextValue';
import type { SarakUIContextType } from '../types';

const baseContext = {
    systemDesign: { mode: 'dark', systemName: 'Sistema' },
    design: { mode: 'dark', systemName: 'Sistema' }, // já o EFETIVO
    branding: {},
} as unknown as SarakUIContextType;

describe('mergeUIContextValue (systemDesign RAW × design EFETIVO)', () => {
    it('sem override, `design`/`activeDesign` saem do EFETIVO (`context.design`), não de `systemDesign`', () => {
        const context = {
            ...baseContext,
            systemDesign: { mode: 'dark' },
            design: { mode: 'light' }, // efetivo já sobrepôs uma preferência de modo
        } as unknown as SarakUIContextType;

        const merged = mergeUIContextValue(context, null);

        expect(merged.systemDesign).toEqual({ mode: 'dark' });
        expect(merged.design.mode).toBe('light');
        expect(merged.activeDesign.mode).toBe('light');
    });

    it('com override (rascunho do painel), ele vence — branding ainda se aplica por cima', () => {
        const context = { ...baseContext, branding: { companyName: 'Acme' } } as unknown as SarakUIContextType;
        const merged = mergeUIContextValue(context, { mode: 'light' });

        expect(merged.design.mode).toBe('light');
        expect(merged.design.systemName).toBe('Acme');
    });

    it('branding sobrepõe `systemName`/`logoUrl` do design efetivo', () => {
        const context = {
            ...baseContext,
            design: { mode: 'dark', systemName: 'Original', logoUrl: 'a.png' },
            branding: { companyName: 'Acme', logoBase64: 'data:...' },
        } as unknown as SarakUIContextType;

        const merged = mergeUIContextValue(context, null);

        expect(merged.design.systemName).toBe('Acme');
        expect(merged.design.logoUrl).toBe('data:...');
    });
});

describe('mergeUIContextValue — o mesmo par devolve o mesmo objeto', () => {
    it('mesmo contexto e mesmo override: a mesma fusão, sem copiar o design de novo', () => {
        const context = { ...baseContext } as unknown as SarakUIContextType;
        const override = { mode: 'light' };
        expect(mergeUIContextValue(context, override)).toBe(mergeUIContextValue(context, override));
        expect(mergeUIContextValue(context, null)).toBe(mergeUIContextValue(context, null));
    });

    it('override ou contexto novos: uma fusão nova, com o valor deles', () => {
        const context = { ...baseContext } as unknown as SarakUIContextType;
        const first = mergeUIContextValue(context, { mode: 'light' });
        const second = mergeUIContextValue(context, { mode: 'dark' });
        expect(second).not.toBe(first);
        expect(second.design.mode).toBe('dark');

        const nextContext = { ...baseContext, branding: { companyName: 'Acme' } } as unknown as SarakUIContextType;
        expect(mergeUIContextValue(nextContext, null).design.systemName).toBe('Acme');
        expect(mergeUIContextValue(context, null)).not.toBe(mergeUIContextValue(nextContext, null));
    });
});
