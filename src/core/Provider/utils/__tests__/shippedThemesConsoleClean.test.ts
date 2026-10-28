// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateDesign } from '../validation';
import { sarakGetDefaultDesignState } from '../../../Design/master-map';
import { SARAK_ALL_THEMES } from '../../../Design/presets/themes/all';
import { minimalistAiry } from '../../../Design/presets/themes/minimalist-airy';
import { composeThemeForMode } from '../../../Design/presets/themes/compose';
import { sarakResolvePalette } from '../../../Design/palette/resolve';

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

    it.each(SARAK_ALL_THEMES.map((theme) => [theme.id, theme] as const))(
        'tema "%s": validateDesign(defaults + tema) não emite aviso "fora do contrato"',
        (_id, theme) => {
            const merged = { ...sarakGetDefaultDesignState(), ...(theme.design as Record<string, unknown>) };
            validateDesign(merged);

            const contractWarnings = warnSpy.mock.calls.filter((call: unknown[]) =>
                String(call[0]).includes('fora do contrato')
            );
            expect(contractWarnings).toEqual([]);
        }
    );
});

/**
 * Spec 40.4 L4 — caracteriza o `minimalist-airy` entregue: os eixos estéticos
 * reconciliados estão declarados e sobrevivem à validação; decisões funcionais
 * descartadas permanecem fora do design do tema.
 */
describe('Caracterização — minimalist-airy reconciliado (Spec 40.4 L4)', () => {
    const appliedAestheticTokens = {
        motionEaseOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
        surfaceMaterial: 'frosted',
        systemTone: 'none',
        shadowColorMode: 'neutral',
        btnStyleType: 'matte',
        switchStyleType: 'tactile',
        h1Weight: '800',
    };

    it('declara e aplica os eixos estéticos reconciliados', () => {
        const merged = { ...sarakGetDefaultDesignState(), ...(minimalistAiry.design as Record<string, unknown>) };
        const result = validateDesign(merged);

        expect(minimalistAiry.design).toEqual(expect.objectContaining(appliedAestheticTokens));
        expect(result).toEqual(expect.objectContaining(appliedAestheticTokens));
    });

    it('mantém fora do design as decisões funcionais descartadas', () => {
        const discardedFunctionalKeys = [
            'cardVariant',
            'searchPositionSidebar',
            'navigationStyle',
            'mobileNavigationStyle',
            'touchTargetMin',
            'sidebarPosition',
            'sidebarWidth',
            'topbarHeight',
        ];
        const themeDesign = minimalistAiry.design as Record<string, unknown>;
        const declaredKeys = discardedFunctionalKeys.filter((key) =>
            Object.prototype.hasOwnProperty.call(themeDesign, key)
        );

        expect(declaredKeys).toEqual([]);
    });

    it('preserva os valores atuais de tipografia e cromo do tema e tira a cor da paleta', () => {
        const merged = { ...sarakGetDefaultDesignState(), ...(minimalistAiry.design as Record<string, unknown>) };
        const result = validateDesign(merged);
        const palette = sarakResolvePalette(String(minimalistAiry.design.colorPalette), 'light');
        const composed = validateDesign(composeThemeForMode(minimalistAiry as never, 'light') as unknown as Record<string, unknown>);
        const currentThemeAppearance = {
            mode: 'light',
            colorPalette: 'oceano',
            headingFont: "'Inter', sans-serif",
            bodyFont: "'Inter', sans-serif",
            monoFont: "'JetBrains Mono', monospace",
            h1Size: { mob: 32, tab: 40, desk: 48 },
            h1Weight: '800',
            navItemRadius: 12,
            cardBorderRadius: { mob: 32, tab: 32, desk: 32 },
            cardRadiusTL: { mob: 32, tab: 32, desk: 32 },
            btnRadiusTL: { mob: 120, tab: 120, desk: 120 },
            inputBorderRadius: { mob: 12, tab: 12, desk: 12 },
            borderType: 'solid',
        };

        expect(minimalistAiry.design).toEqual(expect.objectContaining(currentThemeAppearance));
        expect(result).toEqual(expect.objectContaining(currentThemeAppearance));
        expect(composed).toEqual(expect.objectContaining({
            primaryColor: palette.primaryColor,
            accentColor: palette.accentColor,
            colorBgBody: palette.colorBgBody,
            sidebarColor: palette.sidebarColor,
            topbarColor: palette.topbarColor,
        }));
    });
});
