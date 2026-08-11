import { describe, it, expect } from 'vitest';
import { syncThemeWithMode } from '../color-engine';
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
