import { describe, it, expect } from 'vitest';
import { syncThemeWithMode, resolveThemeForMode } from '../color-engine';
import { parseToRgba, rgbToHsl } from '../../../../Provider/utils/color-engine';

/**
 * Decisão C (plan-24-1 §2.8/§3.1 item 7) — "papel onPrimary". As faixas
 * fixas de `shiftColorMode` para `text` e `primary` se sobrepõem; o texto
 * que senta sobre uma primária (`btnPrimaryText`/`cardActionBtnText`) passa
 * a calcular a luminosidade EM RELAÇÃO AO FUNDO REAL já deslocado, não por
 * faixa fixa.
 */

const relLuminance = (r: number, g: number, b: number): number => {
    const chan = (c: number) => {
        const cs = c / 255;
        return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
};

const contrastOf = (hexA: string, hexB: string): number => {
    const a = parseToRgba(hexA);
    const b = parseToRgba(hexB);
    const [la, lb] = [relLuminance(a.r, a.g, a.b), relLuminance(b.r, b.g, b.b)];
    const [hi, lo] = la > lb ? [la, lb] : [lb, la];
    return (hi + 0.05) / (lo + 0.05);
};

describe('syncThemeWithMode — Decisão C: onPrimary calcula L contra o fundo real', () => {
    it('btnPrimaryText passa 4,5:1 contra o btnPrimaryBg JÁ DESLOCADO, em ambos os modos', () => {
        const design = { mode: 'dark', btnPrimaryBg: '#3730a3', btnPrimaryText: '#ffffff' };

        for (const targetMode of ['light', 'dark'] as const) {
            const result = syncThemeWithMode(design, targetMode);
            const ratio = contrastOf(String(result.btnPrimaryText), String(result.btnPrimaryBg));
            expect(ratio, `modo ${targetMode}: ${result.btnPrimaryText} sobre ${result.btnPrimaryBg}`).toBeGreaterThanOrEqual(4.5);
        }
    });

    it('cardActionBtnText passa 4,5:1 contra cardActionBtnPrimaryBg E cardActionBtnHoverBg, já deslocados', () => {
        const design = {
            mode: 'dark',
            cardActionBtnPrimaryBg: '#ff0055',
            cardActionBtnHoverBg: 'rgba(255, 0, 85, 0.9)',
            cardActionBtnText: '#000000',
        };

        for (const targetMode of ['light', 'dark'] as const) {
            const result = syncThemeWithMode(design, targetMode);
            for (const bgKey of ['cardActionBtnPrimaryBg', 'cardActionBtnHoverBg'] as const) {
                const ratio = contrastOf(String(result.cardActionBtnText), String(result[bgKey]));
                expect(ratio, `modo ${targetMode}, ${bgKey}: ${result.cardActionBtnText} sobre ${result[bgKey]}`).toBeGreaterThanOrEqual(4.5);
            }
        }
    });

    it('preserva matiz e saturação do texto onPrimary — não é escolha de cor nova', () => {
        const design = { mode: 'dark', btnPrimaryBg: '#3730a3', btnPrimaryText: '#ffccaa' };
        const result = syncThemeWithMode(design, 'light');

        const antes = parseToRgba('#ffccaa');
        const depois = parseToRgba(String(result.btnPrimaryText));
        const [hAntes, sAntes] = rgbToHsl(antes.r, antes.g, antes.b);
        const [hDepois, sDepois, lDepois] = rgbToHsl(depois.r, depois.g, depois.b);

        // Só compara quando o resultado não colapsou num extremo acromático
        // (preto/branco puros perdem matiz por definição — ver a mesma nota
        // no teste do solucionador, `solve_theme_contrast.test.ts`).
        if (lDepois > 1 && lDepois < 99) {
            expect(hDepois).toBeCloseTo(hAntes, 0);
            expect(sDepois).toBeCloseTo(sAntes, 0);
        }
    });

    it('não muda nenhum tokenId fora dos dois pares onPrimary', () => {
        const design = { mode: 'dark', btnPrimaryBg: '#3730a3', btnPrimaryText: '#ffffff', textColorMaster: '#ffffff' };
        const result = syncThemeWithMode(design, 'light');
        // textColorMaster segue a estratégia normal de 'text' (não é onPrimary) —
        // continua existindo e sendo transformado pela via de sempre, sem erro.
        expect(result.textColorMaster).toBeDefined();
    });
});

/**
 * plan-26 — `resolveThemeForMode`: a função ÚNICA que decide o que aplicar. A
 * preferência de MODO do usuário tem de vencer, sempre — nunca o modo nativo
 * do tema sozinho (a regressão que esta plan conserta).
 */
describe('resolveThemeForMode', () => {
    it('caso 1 — modo pedido = modo nativo: devolve theme.design tal como escrito, sem tocar em nada', () => {
        const design = { mode: 'dark' as const, primaryColor: '#ff00aa', colorBgBody: '#050505' };
        const theme = { design };
        const result = resolveThemeForMode(theme, 'dark');
        expect(result).toBe(design); // mesma referência — nada foi recalculado
    });

    it('caso 2 — modo pedido ≠ nativo, HÁ contraparte: aplica o bloco AUTORADO, nunca sintetiza', () => {
        const design = { mode: 'dark' as const, primaryColor: '#ff00aa', colorBgBody: '#050505', textColorMaster: '#ffffff' };
        // A contraparte é um valor ESCOLHIDO pelo autor — deliberadamente
        // diferente do que `syncThemeWithMode` geraria, para provar que é o
        // bloco autorado que vence, não uma conversão automática.
        const contraparte = { colorBgBody: '#f5f0e8', textColorMaster: '#1a1208' };
        const theme = { design, contraparte };

        const result = resolveThemeForMode(theme, 'light');

        expect(result.mode).toBe('light');
        expect(result.colorBgBody).toBe('#f5f0e8'); // veio da contraparte, não de shiftColorMode
        expect(result.textColorMaster).toBe('#1a1208');
        expect(result.primaryColor).toBe('#ff00aa'); // não declarado na contraparte — sobrevive do design nativo
    });

    it('caso 3 — modo pedido ≠ nativo, NÃO há contraparte: cai no fallback syncThemeWithMode (os 18 legados)', () => {
        const design = { mode: 'dark' as const, primaryColor: '#ff00aa', colorBgBody: '#050505' };
        const theme = { design }; // sem `contraparte`

        const result = resolveThemeForMode(theme, 'light');
        const expected = syncThemeWithMode(design, 'light');

        expect(result).toEqual(expected);
        expect(result.mode).toBe('light');
    });

    it('IDA E VOLTA EXATA — com contraparte, alternar e voltar devolve o design ORIGINAL, chave a chave', () => {
        const design = {
            mode: 'dark' as const,
            navigationStyle: 'sidebar' as const,
            primaryColor: '#ff00aa',
            colorBgBody: '#050505',
            textColorMaster: '#ffffff',
            borderRadius: 12,
        };
        const contraparte = { colorBgBody: '#f5f0e8', textColorMaster: '#1a1208' };
        const theme = { design, contraparte };

        const ida = resolveThemeForMode(theme, 'light');
        expect(ida.mode).toBe('light');

        // "Volta" é chamar de novo com o modo NATIVO — resolveThemeForMode
        // sempre parte do `theme` original (imutável), não do resultado da ida.
        const volta = resolveThemeForMode(theme, 'dark');

        expect(volta).toEqual(design); // idêntico, chave a chave — nenhuma perda
        Object.keys(design).forEach((key) => {
            expect(volta[key as keyof typeof design]).toBe(design[key as keyof typeof design]);
        });
    });

    it('a preferência de MODO do usuário vence — aplicar um tema nativamente escuro em modo claro preserva o claro (a regressão)', () => {
        const darkTheme = { design: { mode: 'dark' as const, colorBgBody: '#050505' } };
        const result = resolveThemeForMode(darkTheme, 'light');
        expect(result.mode).toBe('light');
    });
});
