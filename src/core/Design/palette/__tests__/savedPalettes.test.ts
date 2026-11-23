import { describe, it, expect } from 'vitest';
import {
    MAX_SAVED_PALETTES, MAX_SAVED_PALETTE_NAME, decodeSavedPalettes, encodeSavedPalettes, findSavedPaletteByName, nextSavedPaletteId,
    normalizeSavedPalettes, removeSavedPalette, sanitizePaletteName, savePalette, savedPalettesOf, type SarakSavedPalette,
} from '../savedPalettes';

const BLUE = 'custom:analogous:#2563eb';
const WARM = 'custom:complementary:#aa3366,sec=#112233,acc=#f59e0b';
const brand: SarakSavedPalette = { id: 'sp-1', name: 'Marca azul', value: BLUE };

describe('savedPalettes — o texto gravado', () => {
    it('vazio é a lista vazia, nos dois sentidos', () => {
        expect(encodeSavedPalettes([])).toBe('');
        expect(decodeSavedPalettes('')).toEqual([]);
        expect(decodeSavedPalettes(undefined)).toEqual([]);
        expect(decodeSavedPalettes(42)).toEqual([]);
    });

    it('ida e volta devolve a mesma lista, com semente secundária e acento no valor', () => {
        const list: SarakSavedPalette[] = [brand, { id: 'sp-2', name: 'Quente', value: WARM }];
        expect(decodeSavedPalettes(encodeSavedPalettes(list))).toEqual(list);
    });

    it('entrada malformada, id fora do padrão, id repetido e valor que não é custom: são descartados sem lançar', () => {
        const raw = [
            `sp-1|Boa|${BLUE}`,
            `sp-1|Repetida|${WARM}`,
            `x-9|Id ruim|${BLUE}`,
            'sp-3|Sem valor',
            'sp-4|Preset|oceano',
            'sp-5|Cor inválida|custom:analogous:#zzzzzz',
            `sp-6||${BLUE}`,
            `sp-7|Extra|${BLUE}|sobra`,
        ].join('~');
        expect(decodeSavedPalettes(raw)).toEqual([{ id: 'sp-1', name: 'Boa', value: BLUE }]);
    });

    it('passado o teto, o resto é ignorado', () => {
        const raw = Array.from({ length: MAX_SAVED_PALETTES + 5 }, (_, index) => `sp-${index + 1}|P${index + 1}|${BLUE}`).join('~');
        expect(decodeSavedPalettes(raw)).toHaveLength(MAX_SAVED_PALETTES);
    });

    it('o leitor do design lê a chave `savedPalettes`', () => {
        expect(savedPalettesOf({ savedPalettes: encodeSavedPalettes([brand]) })).toEqual([brand]);
        expect(savedPalettesOf(undefined)).toEqual([]);
    });
});

describe('savedPalettes — o nome', () => {
    it.each([
        ['Marca "azul"', 'Marca azul'],
        ['a;b{c}d<e>', 'abcde'],
        ['x\'y\\z(1)/*', 'xyz1'],
        ['  muitos   espaços  ', 'muitos espaços'],
        ['a|b~c', 'abc'],
        ['Verão 2026 — Café', 'Verão 2026 Café'],
    ])('"%s" vira "%s"', (typed, stored) => {
        expect(sanitizePaletteName(typed)).toBe(stored);
    });

    it('o nome tem teto', () => {
        expect(sanitizePaletteName('a'.repeat(MAX_SAVED_PALETTE_NAME + 20))).toHaveLength(MAX_SAVED_PALETTE_NAME);
    });

    it('um valor gravado à mão com nome hostil volta limpo, e o texto canônico não tem caractere que quebre a variável CSS', () => {
        const hostile = `sp-1|Quebra"; } body { display:none|${BLUE}`;
        const canonical = normalizeSavedPalettes(hostile);
        expect(canonical).not.toMatch(/["';{}<>\\]/);
        expect(decodeSavedPalettes(canonical)).toEqual([{ id: 'sp-1', name: 'Quebra body displaynone', value: BLUE }]);
    });
});

describe('savedPalettes — salvar, substituir e apagar', () => {
    it('a primeira paleta ganha sp-1 e a seguinte, um id livre', () => {
        expect(savePalette([], 'Marca azul', BLUE)).toEqual({ ok: true, list: [brand] });
        const second = savePalette([brand], 'Quente', WARM);
        expect(second.ok && second.list.map((entry) => entry.id)).toEqual(['sp-1', 'sp-2']);
    });

    it('o id novo não reaproveita o de uma paleta que sobrou depois de apagar', () => {
        expect(nextSavedPaletteId([{ id: 'sp-2', name: 'B', value: BLUE }])).toBe('sp-3');
    });

    it('nome igual (sem olhar caixa nem espaço) substitui o valor e mantém o id', () => {
        expect(savePalette([brand], '  marca   AZUL ', WARM)).toEqual({ ok: true, list: [{ id: 'sp-1', name: 'Marca azul', value: WARM }] });
        expect(findSavedPaletteByName([brand], 'MARCA azul')).toEqual(brand);
    });

    it('recusa nome vazio, valor que não é paleta custom e lista cheia', () => {
        expect(savePalette([], '   ', BLUE)).toEqual({ ok: false, reason: 'name' });
        expect(savePalette([], '"";', BLUE)).toEqual({ ok: false, reason: 'name' });
        expect(savePalette([], 'X', 'oceano')).toEqual({ ok: false, reason: 'value' });
        expect(savePalette([], 'X', 'custom:analogous:azul')).toEqual({ ok: false, reason: 'value' });
        const full = Array.from({ length: MAX_SAVED_PALETTES }, (_, index) => ({ id: `sp-${index + 1}`, name: `P${index + 1}`, value: BLUE }));
        expect(savePalette(full, 'Nova', WARM)).toEqual({ ok: false, reason: 'full' });
        expect(savePalette(full, 'P3', WARM).ok).toBe(true);
    });

    it('apagar tira só a entrada pedida', () => {
        const list: SarakSavedPalette[] = [brand, { id: 'sp-2', name: 'Quente', value: WARM }];
        expect(removeSavedPalette(list, 'sp-1')).toEqual([list[1]]);
        expect(removeSavedPalette(list, 'sp-9')).toEqual(list);
    });
});
