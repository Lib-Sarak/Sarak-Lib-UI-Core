// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
    CATALOG_GRID,
    CATALOG_GRID_2COL,
    CATALOG_GRID_3COL,
    PERSONALITY_GRID,
    WIDE_SAMPLE_GRID,
    THEME_GALLERY_GRID_2COL,
    THEME_GALLERY_GRID_MIN_WIDTH,
    PANEL_SPLIT_COLUMN,
    PANEL_SPLIT_HANDLE,
    PANEL_SPLIT_MIN_WIDTH,
    PANEL_SPLIT_PREVIEW,
    PANEL_SPLIT_ROW,
    PREVIEW_TOOLBAR_HINT,
    getPreviewLayoutPreset,
} from '../panelResponsive.presets';

describe('panelResponsive.presets (plan-35 — container query, não viewport)', () => {
    it('a grade das opções é uma só e mede a coluna: colunas automáticas, sem `md:` nem `lg:` de janela', () => {
        expect(CATALOG_GRID).toBe('grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))]');
        expect(CATALOG_GRID_2COL).toBe(CATALOG_GRID);
        expect(CATALOG_GRID_3COL).toBe(CATALOG_GRID);
        expect(PERSONALITY_GRID).toBe('grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))]');
        expect(WIDE_SAMPLE_GRID).toBe('grid-cols-[repeat(auto-fill,minmax(15rem,1fr))]');
        [CATALOG_GRID, PERSONALITY_GRID, WIDE_SAMPLE_GRID].forEach((value) => expect(value).not.toMatch(/(^|\s)(sm|md|lg|xl):/));
    });

    it('a galeria de temas abre duas colunas quando cabem dois cartões legíveis e o vão', () => {
        expect(THEME_GALLERY_GRID_MIN_WIDTH).toBe(240);
        expect(THEME_GALLERY_GRID_2COL).toBe('grid-cols-1 @min-[240px]:grid-cols-2');
    });

    it('o painel inteiro mede o contêiner: coluna e prévia lado a lado só a partir do limiar, nunca pela janela', () => {
        const classes = [PANEL_SPLIT_ROW, PANEL_SPLIT_COLUMN, PANEL_SPLIT_HANDLE, PANEL_SPLIT_PREVIEW, PREVIEW_TOOLBAR_HINT];
        const widths = classes.flatMap((value) => [...value.matchAll(/@min-\[(\d+)px\]/g)].map((match) => Number(match[1])));
        expect(widths.length).toBeGreaterThan(0);
        expect(new Set(widths.filter((width) => width <= PANEL_SPLIT_MIN_WIDTH))).toEqual(new Set([PANEL_SPLIT_MIN_WIDTH]));
        expect(PANEL_SPLIT_ROW).toContain(`@min-[${PANEL_SPLIT_MIN_WIDTH}px]:flex-row`);
        classes.forEach((value) => expect(value).not.toMatch(/(^|\s)(sm|md|lg|xl):/));
    });

    it('a prévia é um quadro só: sem linha dupla nem altura calculada da galeria', () => {
        const preset = getPreviewLayoutPreset();
        expect(preset.rowClassName).not.toContain('@min-');
        expect(preset.frameStyle).toEqual({});
    });
});
