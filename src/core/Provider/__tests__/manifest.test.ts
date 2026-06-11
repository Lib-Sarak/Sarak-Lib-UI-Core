import { describe, it, expect } from 'vitest';
import { DESIGN_MANIFEST } from '../manifest';
import * as colorEngine from '../utils/color-engine';
import { vi } from 'vitest';

vi.mock('../utils/color-engine', () => ({
    computeColorVariants: vi.fn((v, fallback) => v || fallback)
}));

describe('DESIGN_MANIFEST', () => {
    it('should transform mode correctly', () => {
        expect(DESIGN_MANIFEST.mode.transform?.('dark')).toBe('dark');
        expect(DESIGN_MANIFEST.mode.transform?.('light')).toBe('light');
        expect(DESIGN_MANIFEST.mode.transform?.('other')).toBe('light');
    });

    it('should transform colorPalette correctly', () => {
        expect(DESIGN_MANIFEST.colorPalette.transform?.('some-palette')).toBe('some-palette');
    });

    it('should transform colors using computeColorVariants', () => {
        const colorProps = [
            'primaryColor', 'secondaryColor', 'tertiaryColor', 'accentColor',
            'surfaceColor', 'errorColor', 'successColor', 'warningColor',
            'textureColor', 'sidebarColor', 'topbarColor', 'cardBackgroundColor',
            'cardBorderColor', 'buttonColor', 'buttonHoverColor', 'titleColor',
            'sidebarHoverColor', 'sidebarActiveColor', 'topbarHoverColor',
            'topbarActiveColor', 'cardHoverColor', 'cardActiveColor', 'buttonActiveColor'
        ];

        colorProps.forEach(prop => {
            const transform = DESIGN_MANIFEST[prop].transform;
            expect(transform).toBeDefined();
            // Because we mocked it to return v || fallback
            expect(transform?.('custom-color')).toBe('custom-color');
            expect(transform?.(undefined)).toBeDefined(); // should return fallback
        });
    });

    it('should transform integers correctly', () => {
        expect(DESIGN_MANIFEST.colorDepth.transform?.('2')).toBe(2);
        expect(DESIGN_MANIFEST.colorDepth.transform?.('invalid')).toBe(1);
        expect(DESIGN_MANIFEST.colorVariation.transform?.('3')).toBe(3);
        expect(DESIGN_MANIFEST.colorVariation.transform?.('invalid')).toBe(1);
    });

    it('should transform floats correctly', () => {
        expect(DESIGN_MANIFEST.contrastCurve.transform?.('1.5')).toBe(1.5);
        expect(DESIGN_MANIFEST.contrastCurve.transform?.('invalid')).toBe(1.0);
        expect(DESIGN_MANIFEST.logoScale.transform?.('2.0')).toBe('2.0');
        expect(DESIGN_MANIFEST.logoScale.transform?.(undefined)).toBe(1.0);
        expect(DESIGN_MANIFEST.cardSpotlight.transform?.('0.5')).toBe(0.5);
        expect(DESIGN_MANIFEST.cardSpotlight.transform?.('invalid')).toBe(0);
        expect(DESIGN_MANIFEST.hapticIntensity.transform?.('0.05')).toBeCloseTo(0.95);
        expect(DESIGN_MANIFEST.hapticIntensity.transform?.('invalid')).toBeCloseTo(0.98);
        expect(DESIGN_MANIFEST.sidebarMinWidth.transform?.('300')).toBe(300);
        expect(DESIGN_MANIFEST.sidebarMinWidth.transform?.('invalid')).toBe(200);
        expect(DESIGN_MANIFEST.sidebarMaxWidth.transform?.('500')).toBe(500);
        expect(DESIGN_MANIFEST.sidebarMaxWidth.transform?.('invalid')).toBe(450);
        expect(DESIGN_MANIFEST.noiseIntensity.transform?.('50')).toBe(0.5);
        expect(DESIGN_MANIFEST.noiseIntensity.transform?.('invalid')).toBe(0);
    });

    it('should transform headingLetterSpacing correctly', () => {
        const transform = DESIGN_MANIFEST.headingLetterSpacing.transform!;
        expect(transform('tight')).toBe('-0.05em');
        expect(transform('normal')).toBe('0');
        expect(transform('wide')).toBe('0.1em');
        expect(transform('widest')).toBe('0.25em');
        expect(transform('custom')).toBe('custom');
    });

    it('should transform chartPalette correctly', () => {
        const transform = DESIGN_MANIFEST.chartPalette.transform!;
        expect(transform(['#000', '#fff'])).toBe('#000,#fff');
        expect(transform('#ff0000')).toBe('#ff0000');
    });

    it('should transform useTabularNums correctly', () => {
        const transform = DESIGN_MANIFEST.useTabularNums.transform!;
        expect(transform(true)).toBe('tabular-nums');
        expect(transform(false)).toBe('normal');
    });

    it('should transform scaleRatio correctly', () => {
        const transform = DESIGN_MANIFEST.scaleRatio.transform!;
        const result = transform('2.0');
        expect(result.ratio).toBe(2);
        expect(result.gap).toBe('2.5rem');
        expect(result.pad).toBe('3rem');
        expect(result.margin).toBe('2rem');
        expect(result.radius).toBe('24px');

        const resultInvalid = transform('invalid');
        expect(resultInvalid.ratio).toBe(1.0);
    });

    it('should transform layeredShadows correctly', () => {
        const transform = DESIGN_MANIFEST.layeredShadows.transform!;
        const result = transform('2.0');
        expect(result).toContain('rgba(0,0,0,0.1)'); // 0.05 * 2.0 = 0.1

        const resultInvalid = transform('invalid');
        expect(resultInvalid).toContain('rgba(0,0,0,0.05)'); // 0.05 * 1.0 = 0.05
    });

    it('should transform fontScale correctly', () => {
        const transform = DESIGN_MANIFEST.fontScale.transform!;
        expect(transform('pp')).toEqual({ px: '12px', factor: '0.75' });
        expect(transform('p')).toEqual({ px: '14px', factor: '0.85' });
        expect(transform('m')).toEqual({ px: '16px', factor: '1.0' });
        expect(transform('g')).toEqual({ px: '20px', factor: '1.25' });
        expect(transform('gg')).toEqual({ px: '24px', factor: '1.5' });
        expect(transform('unknown')).toEqual({ px: '16px', factor: '1.0' });
    });

    it('should transform fluidScaling correctly', () => {
        const transform = DESIGN_MANIFEST.fluidScaling.transform!;
        const result = transform('2.0');
        expect(result.base).toBe('clamp(12px, 1.6vw + 8px, 40px)');
        expect(result.gap).toBe('clamp(10px, 2vw + 4px, 64px)');
        expect(result.padding).toBe('clamp(16px, 3vw + 8px, 96px)');

        const resultInvalid = transform('invalid');
        expect(resultInvalid.base).toBe('clamp(12px, 0.8vw + 8px, 20px)');
    });
});
