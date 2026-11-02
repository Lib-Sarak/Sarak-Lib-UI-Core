// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
    CATALOG_GRID_2COL,
    CATALOG_GRID_3COL,
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
import { BREAKPOINT_TABLET, BREAKPOINT_DESKTOP } from '../../../../core/Design/breakpoints';

describe('panelResponsive.presets (plan-35 — container query, não viewport)', () => {
    it('CATALOG_GRID_2COL usa o MESMO número do antigo `md:` (BREAKPOINT_TABLET), só como container query', () => {
        expect(CATALOG_GRID_2COL).toBe(`grid-cols-1 @min-[${BREAKPOINT_TABLET}px]:grid-cols-2`);
        expect(CATALOG_GRID_2COL).not.toContain('md:');
    });

    it('a galeria de temas abre duas colunas quando cabem dois cartões legíveis e o vão', () => {
        expect(THEME_GALLERY_GRID_MIN_WIDTH).toBe(240);
        expect(THEME_GALLERY_GRID_2COL).toBe('grid-cols-1 @min-[240px]:grid-cols-2');
    });

    it('CATALOG_GRID_3COL usa os MESMOS números dos antigos `md:`/`lg:` (BREAKPOINT_TABLET/BREAKPOINT_DESKTOP)', () => {
        expect(CATALOG_GRID_3COL).toBe(
            `grid-cols-1 @min-[${BREAKPOINT_TABLET}px]:grid-cols-2 @min-[${BREAKPOINT_DESKTOP}px]:grid-cols-3`,
        );
        expect(CATALOG_GRID_3COL).not.toContain('md:');
        expect(CATALOG_GRID_3COL).not.toContain('lg:');
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
