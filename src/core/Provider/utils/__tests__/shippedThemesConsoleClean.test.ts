import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateDesign } from '../validation';
import { getDefaultDesignState } from '../../../Design/master-map';
import { GLOBAL_THEMES } from '../../../Design/presets/themes';
import { minimalistAiry } from '../../../Design/presets/themes/minimalist-airy';

/**
 * Spec 40.4 L4 — verificação de propagação: com o drift reconciliado (L2), o boot
 * real (`getSeedConfig` em `useDesignManager.ts`: `{...masterDefaults,
 * ...themeDesignTokens, ...config}` passado por `validateDesign`) não pode mais
 * emitir nenhum aviso `fora do contrato` para nenhum tema shippado pela lib.
 */
describe('Console limpo ao carregar os temas shippados (Spec 40.4 L4)', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
    });

    it.each(GLOBAL_THEMES.map((theme) => [theme.id, theme] as const))(
        'tema "%s": validateDesign(defaults + tema) não emite aviso "fora do contrato"',
        (_id, theme) => {
            const merged = { ...getDefaultDesignState(), ...(theme.design as Record<string, unknown>) };
            validateDesign(merged);

            const contractWarnings = warnSpy.mock.calls.filter((call: unknown[]) =>
                String(call[0]).includes('fora do contrato')
            );
            expect(contractWarnings).toEqual([]);
        }
    );
});

/**
 * Spec 40.4 L4 — caracterização: prova que a reconciliação (i) fez os 9 eixos antes
 * descartados do `minimalist-airy` (a amostra original do achado de browser)
 * APLICAREM de verdade, e (ii) não alterou nenhum outro token do mesmo tema —
 * a aparência pretendida do tema, fora dos 9 eixos corrigidos, é preservada bit-a-bit.
 */
describe('Caracterização — minimalist-airy antes/depois da reconciliação (Spec 40.4 L4)', () => {
    it('os 9 tokens antes descartados agora aplicam com um valor válido do próprio contrato', () => {
        const merged = { ...getDefaultDesignState(), ...(minimalistAiry.design as Record<string, unknown>) };
        const result = validateDesign(merged);

        expect(result.easeOut).toBe('cubic-bezier(0, 0, 0.2, 1)');
        expect(result.surfaceMaterial).toBe('sleek');
        expect(result.systemTone).toBe('light');
        expect(result.shadowColorMode).toBe('neutral');
        expect(result.btnStyleType).toBe('matte');
        expect(result.cardVariant).toBe('classic');
        expect(result.searchPositionSidebar).toBe('hidden');
        expect(result.switchStyleType).toBe('tactile');
        expect(result.h1Weight).toBe('800');
    });

    it('preserva os demais eixos do tema (cor/tipografia/cromo) fora dos 9 tokens corrigidos', () => {
        const merged = { ...getDefaultDesignState(), ...(minimalistAiry.design as Record<string, unknown>) };
        const result = validateDesign(merged);

        expect(result.mode).toBe('light');
        expect(result.navigationStyle).toBe('topbar');
        expect(result.primaryColor).toBe('#111827');
        expect(result.accentColor).toBe('#E5E7EB');
        expect(result.colorBgBody).toBe('#F9FAFB');
        expect(result.cardBorderRadius).toBe(0);
        expect(result.cardRadiusTL).toBe(32);
        expect(result.headingFont).toBe('"Inter", sans-serif');
        expect(result.h1Size).toBe(36);
        expect(result.borderType).toBe('solid');
        expect(result.btnRadiusTL).toBe(120);
        expect(result.sidebarWidth).toBe(260);
        expect(result.topbarHeight).toBe(64);
    });
});
