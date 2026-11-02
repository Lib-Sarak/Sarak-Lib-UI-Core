import { describe, it, expect } from 'vitest';
import { LIBRARY_TEXT_CATALOG, type LibraryTextKey } from '../../../../core/i18n/catalog';
import { fontFamilyName, paletteName, summarizeDecision } from '../decisionSummary';

const text = (key: LibraryTextKey, vars?: Record<string, string | number>): string =>
    Object.entries(vars ?? {}).reduce((out, [name, value]) => out.split(`{${name}}`).join(String(value)), LIBRARY_TEXT_CATALOG[key].pt);

describe('decisionSummary', () => {
    it('fontFamilyName fica com o nome da família, sem aspas nem reservas', () => {
        expect(fontFamilyName("'Outfit', sans-serif")).toBe('Outfit');
        expect(fontFamilyName('Inter')).toBe('Inter');
        expect(fontFamilyName(undefined)).toBe('');
    });

    it('paletteName nomeia a pronta pelo catálogo, a criada como personalizada e, sem paleta, mostra a cor principal', () => {
        expect(paletteName({ colorPalette: 'custom:analogous:#aa3366' }, text)).toBe(text('paletteCustomName'));
        expect(paletteName({ colorPalette: '' , primaryColor: '#123456' }, text)).toBe('#123456');
        expect(paletteName({ colorPalette: 'oceano' }, text)).not.toBe('');
        expect(paletteName({ colorPalette: 'oceano' }, text)).not.toContain('custom');
    });

    const draft = { headingFont: "'Outfit', sans-serif", bodyFont: 'Inter', surfaceMaterial: 'frosted', layoutDensity: 'comfortable', btnStyleType: 'frosted', inputBorderType: 'solid', navigationStyle: 'sidebar' };

    it('cada decisão resume o que vale agora pelo nome legível, nunca pelo id do token', () => {
        expect(summarizeDecision('fonts', draft, text)).toBe('Outfit + Inter');
        expect(summarizeDecision('shape', draft, text)).toBe('Vidro fosco · Confortável');
        expect(summarizeDecision('components', draft, text)).toBe('Botão de vidro · Campo contornado');
        expect(summarizeDecision('layout', draft, text)).toBe('Navegação: lateral');
    });

    it('o valor que o catálogo de textos não conhece some da linha em vez de aparecer como id', () => {
        expect(summarizeDecision('shape', { surfaceMaterial: 'inventado', layoutDensity: 'compact' }, text)).toBe('Compacta');
        expect(summarizeDecision('layout', { navigationStyle: 'inventado' }, text)).toBe('');
        expect(summarizeDecision('components', { btnStyleType: 'inventado', inputBorderType: 'dashed' }, text)).toBe('tracejado');
    });

    it.each(['pt', 'en', 'es', 'fr', 'de', 'it'] as const)('a linha sai no idioma %s, sem sobrar o id', (language) => {
        const translate = (key: LibraryTextKey, vars?: Record<string, string | number>): string =>
            Object.entries(vars ?? {}).reduce((out, [name, value]) => out.split(`{${name}}`).join(String(value)), LIBRARY_TEXT_CATALOG[key][language]);

        const lines = [summarizeDecision('shape', draft, translate), summarizeDecision('components', draft, translate), summarizeDecision('layout', draft, translate)];

        lines.forEach((line) => {
            expect(line).not.toBe('');
            expect(line).not.toMatch(/frosted|solid|sidebar|comfortable|\{/);
        });
    });

    it('uma fonte só no título e no corpo aparece uma vez, e o que falta no rascunho não vira "undefined"', () => {
        expect(summarizeDecision('fonts', { headingFont: 'Inter', bodyFont: 'Inter' }, text)).toBe('Inter');
        expect(summarizeDecision('shape', {}, text)).toBe('');
        expect(summarizeDecision('components', { btnStyleType: 'matte' }, text)).toBe('fosco');
    });
});
