import { describe, expect, it } from 'vitest';
import { composeThemeDesign, THEME_PRESERVED_KEYS } from '../compose';
import { sarakGetDefaultDesignState } from '../../../master-map';

describe('composeThemeDesign — a troca de tema nunca herda token do tema anterior', () => {
    const defaults = sarakGetDefaultDesignState();

    it('o token que o tema A declara e o B não, depois do B, é o PADRÃO do schema', () => {
        const themeA = { primaryColor: '#ff0000', cardBorderRadius: 33 };
        const themeB = { primaryColor: '#0000ff' };

        const afterA = composeThemeDesign(themeA, {});
        const afterB = composeThemeDesign(themeB, afterA);

        expect(afterA.cardBorderRadius).toBe(33);
        expect(afterB.cardBorderRadius).toEqual(defaults.cardBorderRadius);
        expect(afterB.primaryColor).toBe('#0000ff');
    });

    it('o tema vence o padrão e o preservado', () => {
        const out = composeThemeDesign({ mode: 'light', systemName: 'do tema' }, { mode: 'dark', systemName: 'do host' });
        expect(out.mode).toBe('light');
        expect(out.systemName).toBe('do tema');
    });

    it('preserva a identidade do host e o modo do usuário quando o tema não os declara', () => {
        const previous = { systemName: 'ERP', logoUrl: '/logo.svg', logoDarkUrl: '/logo-dark.svg', mode: 'light', language: 'pt-BR' };
        const out = composeThemeDesign({ primaryColor: '#123456' }, previous);
        THEME_PRESERVED_KEYS.forEach((key) => {
            if (key in previous) expect(out[key as keyof typeof out], key).toBe(previous[key as keyof typeof previous]);
        });
    });

    it('sem anterior, parte do padrão do schema', () => {
        const out = composeThemeDesign({ primaryColor: '#abcdef' });
        expect(out.primaryColor).toBe('#abcdef');
        expect(out.cardBorderRadius).toEqual(defaults.cardBorderRadius);
    });

    it('não vaza token solto do anterior que não é preservado', () => {
        const out = composeThemeDesign({ primaryColor: '#111111' }, { primaryColor: '#999999', tokenSoltoDoAnterior: 'x' });
        expect((out as Record<string, unknown>).tokenSoltoDoAnterior).toBeUndefined();
    });

    it('a ordem é padrão → identidade → config do host → tema: o tema vence o que declara, o config vale no resto', () => {
        const out = composeThemeDesign(
            { primaryColor: '#0000ff' },
            { systemName: 'ERP', cardBorderRadius: 33 },
            { primaryColor: '#999999', layoutMaxWidth: 777, systemName: 'do config' },
        );
        expect(out.primaryColor).toBe('#0000ff');
        expect(out.layoutMaxWidth).toBe(777);
        expect(out.cardBorderRadius).toEqual(defaults.cardBorderRadius);
        expect(out.systemName).toBe('do config');
    });
});
