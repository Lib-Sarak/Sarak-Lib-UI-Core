// @vitest-environment node
// A base neutra da amostra de um card: fixa por modo (não segue o tema do rascunho) e igual ao design padrão fora das cores.
import { describe, expect, it } from 'vitest';
import { sarakGetAllDesignTokens, sarakGetDefaultDesignState } from '../../../../../core/Design/master-map';
import { neutralCardBase } from '../neutralCardBase';

const luminance = (hex: string): number => {
    const [red, green, blue] = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
    return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
};
const body = (mode: 'light' | 'dark'): string => String((neutralCardBase(mode) as Record<string, unknown>).colorBgBody);

describe('neutralCardBase', () => {
    it('segue o modo da prévia: o fundo do modo claro é claro e o do escuro é escuro', () => {
        expect(luminance(body('light'))).toBeGreaterThan(0.5);
        expect(luminance(body('dark'))).toBeLessThan(0.2);
    });

    it('é fixa por modo: a mesma entrada devolve o mesmo objeto, sem depender de rascunho algum', () => {
        expect(neutralCardBase('light')).toBe(neutralCardBase('light'));
        expect(neutralCardBase('dark')).toBe(neutralCardBase('dark'));
    });

    it('fora das cores, é o design padrão do motor, nos dois modos', () => {
        const colors = new Set(sarakGetAllDesignTokens().filter((token) => token.type === 'color').map((token) => token.id));
        const defaults = sarakGetDefaultDesignState() as Record<string, unknown>;
        (['light', 'dark'] as const).forEach((mode) => {
            const base = neutralCardBase(mode) as Record<string, unknown>;
            const different = Object.keys(defaults).filter((id) => !colors.has(id) && JSON.stringify(base[id]) !== JSON.stringify(defaults[id]));
            expect(different, `${mode}: tokens que não são cor e saíram do padrão`).toEqual([]);
        });
    });
});
