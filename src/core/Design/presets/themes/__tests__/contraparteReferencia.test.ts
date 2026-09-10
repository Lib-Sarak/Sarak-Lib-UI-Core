// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { minimalistAiry } from '../minimalist-airy';
import { sarakSovereignTheme } from '../sarak-sovereign';
import { resolveThemeForMode, type ModeResolvableTheme } from '../color-engine';
import { deriveThemeFromReference, type DerivedThemePreset } from '../reference';
import type { ThemePreset } from '../index';
import type { SarakTokenValue } from '../../../types';

/** Mesmo cast que `PresetCard.tsx`/`useDesignSync.ts`/`ShellThemeToggle.tsx` já fazem
 *  para chamar `resolveThemeForMode` com um `ThemePreset`/`DerivedThemePreset` real —
 *  `design` é `Record<string, unknown>` por desenho (spec 09 §2.1 item 1). */
const asResolvable = (theme: ThemePreset | DerivedThemePreset): ModeResolvableTheme => ({
    design: theme.design as Record<string, SarakTokenValue>,
    contraparte: theme.contraparte,
});

/**
 * Os dois temas de referência (`SARAK_REFERENCE_THEMES`) ganham contraparte
 * autorada. Sem ela, `resolveThemeForMode` caía no fallback
 * `syncThemeWithMode`, que a spec 09 §2.1 mede como NÃO reversível — a ida e
 * volta devolve faixa de faixa, não o original. Com contraparte, os dois
 * conjuntos são fixos e a reversibilidade é garantida por construção.
 */
describe('minimalist-airy e sarak-sovereign têm contraparte autorada', () => {
    it.each([
        ['minimalist-airy', minimalistAiry],
        ['sarak-sovereign', sarakSovereignTheme],
    ])('%s declara um bloco `contraparte`', (_id, theme) => {
        expect(theme.contraparte).toBeDefined();
        expect(theme.contraparte?.mode).not.toBe(theme.design.mode);
    });

    it.each([
        ['minimalist-airy', minimalistAiry],
        ['sarak-sovereign', sarakSovereignTheme],
    ])('%s — IDA E VOLTA EXATA: trocar de modo e voltar devolve o design ORIGINAL, chave a chave', (_id, theme) => {
        const nativeMode = theme.design.mode as 'light' | 'dark';
        const oppositeMode = nativeMode === 'dark' ? 'light' : 'dark';

        const ida = resolveThemeForMode(asResolvable(theme), oppositeMode);
        expect(ida.mode).toBe(oppositeMode);

        const volta = resolveThemeForMode(asResolvable(theme), nativeMode);
        expect(volta).toEqual(theme.design);
        Object.keys(theme.design).forEach((key) => {
            expect(volta[key]).toBe((theme.design as Record<string, unknown>)[key]);
        });
    });

    it.each([
        ['minimalist-airy', minimalistAiry],
        ['sarak-sovereign', sarakSovereignTheme],
    ])('%s — o modo oposto NÃO é igual ao que `syncThemeWithMode` sintetizaria (é o bloco autorado que vence)', (_id, theme) => {
        const nativeMode = theme.design.mode as 'light' | 'dark';
        const oppositeMode = nativeMode === 'dark' ? 'light' : 'dark';
        const viaContraparte = resolveThemeForMode(asResolvable(theme), oppositeMode);
        const viaSintetizado = resolveThemeForMode({ design: theme.design as Record<string, SarakTokenValue> }, oppositeMode);
        expect(viaContraparte).not.toEqual(viaSintetizado);
    });
});

/**
 * A porta de derivação: recebe o id de uma referência + sobreposições de
 * `design`, devolve um tema COMPLETO (`design` e `contraparte`) — em vez do
 * padrão que a spec 09 §4.1 registrou como erro (`...REF.design` descarta a
 * contraparte e a troca de modo passa a degradar em silêncio).
 */
describe('deriveThemeFromReference', () => {
    it('devolve um tema com design E contraparte completos, não um subconjunto', () => {
        const derivado = deriveThemeFromReference('minimalist-airy', {
            id: 'consumidor-azul',
            name: 'Consumidor Azul',
            design: { primaryColor: '#0044ff', accentColor: '#0044ff', btnPrimaryBg: '#0044ff' },
        });

        expect(derivado.contraparte).toBeDefined();
        expect(Object.keys(derivado.design).length).toBe(Object.keys(minimalistAiry.design).length);
    });

    it('a sobreposição de cor de marca aparece nos DOIS modos — nativo e oposto', () => {
        const derivado = deriveThemeFromReference('minimalist-airy', {
            id: 'consumidor-azul',
            name: 'Consumidor Azul',
            design: { primaryColor: '#0044ff' },
        });

        const nativeMode = derivado.design.mode as 'light' | 'dark';
        const oppositeMode = nativeMode === 'dark' ? 'light' : 'dark';
        const nativo = resolveThemeForMode(asResolvable(derivado), nativeMode);
        const oposto = resolveThemeForMode(asResolvable(derivado), oppositeMode);

        expect(nativo.primaryColor).toBe('#0044ff');
        expect(oposto.primaryColor).toBe('#0044ff');
    });

    it('sobrepor uma chave que TAMBÉM existe na contraparte da referência espelha o valor nos dois modos', () => {
        const derivado = deriveThemeFromReference('sarak-sovereign', {
            id: 'consumidor-claro',
            name: 'Consumidor Claro',
            design: { textColorMaster: '#123456' },
        });

        expect(derivado.design.textColorMaster).toBe('#123456');
        expect(derivado.contraparte?.textColorMaster).toBe('#123456');
    });

    it('a troca de modo do tema derivado continua reversível (a mesma garantia da referência)', () => {
        const derivado = deriveThemeFromReference('sarak-sovereign', {
            id: 'consumidor-claro',
            name: 'Consumidor Claro',
            design: { primaryColor: '#00aa88', accentColor: '#00aa88' },
        });
        const nativeMode = derivado.design.mode as 'light' | 'dark';
        const oppositeMode = nativeMode === 'dark' ? 'light' : 'dark';

        resolveThemeForMode(asResolvable(derivado), oppositeMode);
        const volta = resolveThemeForMode(asResolvable(derivado), nativeMode);

        expect(volta).toEqual(derivado.design);
    });

    it('lança quando o id de referência não existe em GLOBAL_THEMES', () => {
        expect(() =>
            deriveThemeFromReference('tema-inexistente' as never, { id: 'x', name: 'X', design: {} }),
        ).toThrow();
    });
});
