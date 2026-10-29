import { describe, expect, it } from 'vitest';
import { composeThemeDesign, THEME_PRESERVED_KEYS } from '../compose';
import { sarakGetDefaultDesignState } from '../../../master-map';
import { SARAK_ALL_THEMES } from '../all';
import { resolveThemeForMode } from '../color-engine';
import { resolvePalette, sarakResolvePalette } from '../../../palette/resolve';
import { parsePaletteValue } from '../../../palette/parser';
import { evaluatePair } from '../../../../../../gates/scripts/audit/verify_contrast';
import { PAIRS } from '../../../palette/contrast-pairs';
import type { SarakTokenValue } from '../../../types';

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

    it('expande a paleta antes do host e do tema, preservando cores explícitas', () => {
        const palette = sarakResolvePalette('oceano', 'light');
        const out = composeThemeDesign(
            { mode: 'light', colorPalette: 'oceano', primaryColor: '#ff00aa' },
            {},
            { colorBgBody: '#123456', primaryColor: '#abcdef' },
        );

        expect(out.colorBgBody).toBe('#123456');
        expect(out.primaryColor).toBe('#ff00aa');
        expect(out.cardBackgroundColor).toBe(palette.cardBackgroundColor);
        expect(out.colorPalette).toBe('oceano');
    });

    it('usa a paleta do config quando o tema não a declara e deixa ajustes de usuário por cima', () => {
        const out = composeThemeDesign({ mode: 'dark' }, {}, { colorPalette: 'oceano', mode: 'light' });
        const palette = sarakResolvePalette('oceano', 'dark');
        const userAdjusted = { ...out, primaryColor: '#123abc' };

        expect(out.colorPalette).toBe('oceano');
        expect(out.primaryColor).toBe(palette.primaryColor);
        expect(userAdjusted.primaryColor).toBe('#123abc');
    });

    it('mantém chave por chave a composição rc.3 dos 19 temas sem colorPalette', () => {
        const defaultsWithoutPalette = { ...defaults } as Record<string, unknown>;
        delete defaultsWithoutPalette.colorPalette;
        expect(SARAK_ALL_THEMES).toHaveLength(19);

        SARAK_ALL_THEMES.forEach((embedded) => {
            const { colorPalette: _palette, ...withoutPalette } = embedded.design as Record<string, SarakTokenValue>;
            const theme = { ...embedded, design: withoutPalette };
            const mode = theme.design.mode === 'light' ? 'light' : 'dark';
            const resolved = resolveThemeForMode({
                design: theme.design as Record<string, SarakTokenValue>,
                ...(theme.contraparte ? { contraparte: theme.contraparte } : {}),
            }, mode);
            const actual = composeThemeDesign(resolved);
            expect(actual).toEqual({ ...defaultsWithoutPalette, ...resolved });
            expect(actual).not.toHaveProperty('colorPalette');
        });
    });
});

describe('composeThemeDesign — o texto da paleta se corrige contra o fundo que o host declara', () => {
    const sidebarTextPair = PAIRS.find((pair) => pair.fg === 'sidebarItemTextColor')!;
    const contrastOf = (design: Record<string, unknown>) =>
        evaluatePair(sidebarTextPair, { ...sarakGetDefaultDesignState(), ...design } as never);

    it('barra escura declarada pelo host num tema claro: o item inativo mantém 4,5', () => {
        const out = composeThemeDesign({ mode: 'light', colorPalette: 'oceano' }, {}, { sidebarColor: '#111111' });

        expect(out.sidebarColor).toBe('#111111');
        expect(contrastOf(out as unknown as Record<string, unknown>)).toMatchObject({ pulado: false, pass: true });
    });

    it('o mesmo vale para a barra que o próprio tema declara', () => {
        const out = composeThemeDesign({ mode: 'light', colorPalette: 'oceano', sidebarColor: '#111111' });

        expect(contrastOf(out as unknown as Record<string, unknown>)).toMatchObject({ pulado: false, pass: true });
    });

    it('texto declarado pelo host não é tocado, mesmo ilegível', () => {
        const out = composeThemeDesign(
            { mode: 'light', colorPalette: 'oceano' },
            {},
            { sidebarColor: '#111111', sidebarItemTextColor: '#222222' },
        );

        expect(out.sidebarItemTextColor).toBe('#222222');
    });

    it('sem fundo declarado, o texto é o que a paleta calcula', () => {
        const palette = sarakResolvePalette('oceano', 'light');
        const out = composeThemeDesign({ mode: 'light', colorPalette: 'oceano' });

        expect(out.sidebarItemTextColor).toBe(palette.sidebarItemTextColor);
    });

    it('nenhum tema embarcado muda de saída: só o texto que reprova contra o fundo declarado é movido', () => {
        const withPalette = SARAK_ALL_THEMES.filter((theme) => (theme.design as Record<string, unknown>).colorPalette);
        expect(withPalette.length).toBeGreaterThan(0);

        withPalette.forEach((theme) => {
            (['light', 'dark'] as const).forEach((mode) => {
                const resolved = resolveThemeForMode({
                    design: theme.design as Record<string, SarakTokenValue>,
                    ...(theme.contraparte ? { contraparte: theme.contraparte } : {}),
                }, mode) as Record<string, unknown>;
                const input = parsePaletteValue(resolved.colorPalette)!;
                const alone = resolvePalette(input, mode);
                const withDeclared = resolvePalette(input, mode, resolved);
                const notDeclared = Object.keys(alone).filter((tokenId) => resolved[tokenId] === undefined);

                notDeclared.forEach((tokenId) => {
                    expect(withDeclared[tokenId], `${theme.id}/${mode}/${tokenId}`).toBe(alone[tokenId]);
                });
            });
        });
    });
});
