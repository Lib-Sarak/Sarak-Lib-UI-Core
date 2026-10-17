// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { FONT_OPTIONS } from '../../../../core/Design/schema/typography';
import { getHostFontRegistry } from '../../../../core/Provider/utils/hostFonts';
import { composeFontOptions } from '../composeFontOptions';

const registry = getHostFontRegistry({
    custom: [
        { family: 'Painel Sans', category: 'Sans-Serif', files: [{ url: '/p.woff2', weight: 400 }] },
        { family: 'Painel Livre', files: [{ url: '/l.woff2', weight: 400 }] },
        { family: 'Painel Serif', category: 'Serif', files: [{ url: '/s.woff2', weight: 400 }] },
    ],
});

describe('composeFontOptions — lib + host, em runtime', () => {
    it('sem fonte registrada, a lista volta igual (mesma referência)', () => {
        expect(composeFontOptions(FONT_OPTIONS)).toBe(FONT_OPTIONS);
    });

    it('cada família do host entra logo depois da última da mesma categoria; sem par, no fim em "Personalizadas"', () => {
        const options = composeFontOptions(FONT_OPTIONS, registry);
        const labels = options.map((option) => (typeof option === 'object' ? option.label : option));
        const lastSans = FONT_OPTIONS.map((option) => option.label).lastIndexOf('System Default [Sans-Serif]');
        expect(labels[lastSans + 1]).toBe('Painel Sans [Sans-Serif]');
        expect(labels[labels.indexOf('PT Serif [Serif]') + 1]).toBe('Painel Serif [Serif]');
        expect(labels.at(-1)).toBe('Painel Livre [Personalizadas]');
        expect(options).toHaveLength(FONT_OPTIONS.length + 3);
        expect(options).toContainEqual({ id: "'Painel Sans', sans-serif", label: 'Painel Sans [Sans-Serif]' });
    });

    it('não altera a lista do schema', () => {
        const before = FONT_OPTIONS.length;
        composeFontOptions(FONT_OPTIONS, registry);
        expect(FONT_OPTIONS).toHaveLength(before);
    });
});
