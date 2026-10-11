import { describe, expect, it } from 'vitest';
import type { SarakThemePayload } from '../../../../core/Provider/types';
import { resolveSwitchStyles } from '../switchStyles';

const design = (patch: Record<string, unknown>): SarakThemePayload => patch as unknown as SarakThemePayload;

describe('resolveSwitchStyles', () => {
    it('tactile é a pele neutra: trilho pílula sem borda, sem desfoque e sem animação', () => {
        const { trackStyle, thumbStyle } = resolveSwitchStyles(design({ switchStyleType: 'tactile' }), true);

        expect(trackStyle.borderRadius).toBeUndefined();
        expect(trackStyle.border).toBeUndefined();
        expect(trackStyle.backdropFilter).toBeUndefined();
        expect(thumbStyle.animation).toBeUndefined();
        expect(thumbStyle.transform).toBe('translateX(100%)');
    });

    it('sem token ou com valor desconhecido cai em tactile', () => {
        expect(resolveSwitchStyles(undefined, false)).toEqual(resolveSwitchStyles(design({ switchStyleType: 'tactile' }), false));
        expect(resolveSwitchStyles(design({ switchStyleType: 'inexistente' }), false))
            .toEqual(resolveSwitchStyles(design({ switchStyleType: 'tactile' }), false));
    });

    it('asymmetric desenha cantos desiguais no trilho e no thumb', () => {
        const { trackStyle, thumbStyle } = resolveSwitchStyles(design({ switchStyleType: 'asymmetric' }), false);

        expect(trackStyle.borderRadius).toBe('14px 6px 14px 6px');
        expect(thumbStyle.borderRadius).toBe('8px 3px 8px 3px');
    });

    it('pulsing só anima o thumb quando ligado', () => {
        const on = resolveSwitchStyles(design({ switchStyleType: 'pulsing' }), true);
        const off = resolveSwitchStyles(design({ switchStyleType: 'pulsing' }), false);

        expect(on.thumbStyle.animation).toContain('sarak-switch-pulse');
        expect(off.thumbStyle.animation).toBeUndefined();
    });

    it('glass é translúcido, com borda fina e o desfoque de switchBackdropBlur', () => {
        const { trackStyle, thumbStyle } = resolveSwitchStyles(design({ switchStyleType: 'glass', switchBackdropBlur: 9 }), true);

        expect(trackStyle.backdropFilter).toBe('blur(9px)');
        expect(trackStyle.border).toContain('1px solid');
        expect(String(trackStyle.backgroundColor)).toContain('color-mix');
        expect(String(thumbStyle.backgroundColor)).toContain('color-mix');
    });

    it('o desfoque de vidro só existe em glass', () => {
        for (const switchStyleType of ['tactile', 'asymmetric', 'pulsing']) {
            const { trackStyle } = resolveSwitchStyles(design({ switchStyleType, switchBackdropBlur: 12 }), true);
            expect(trackStyle.backdropFilter, switchStyleType).toBeUndefined();
        }
    });

    it('os quatro estilos produzem peles diferentes entre si, ligados', () => {
        const skins = ['tactile', 'asymmetric', 'pulsing', 'glass']
            .map((switchStyleType) => JSON.stringify(resolveSwitchStyles(design({ switchStyleType }), true)));

        expect(new Set(skins).size).toBe(4);
    });
});
