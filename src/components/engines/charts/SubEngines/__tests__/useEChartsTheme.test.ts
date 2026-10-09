import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UIContext } from '../../../../../core/Provider/SarakUIProvider';
import type { SarakUIContextType } from '../../../../../core/Provider/types';
import { useEChartsTheme } from '../useEChartsTheme';

const GRID_OPACITY = 0.23;
const LINE_THICKNESS = 5;
const AXIS_FONT_SIZE = 13;
const SMALL_GAP = 10;
const MOBILE_GAP = 14;
const TABLET_GAP = 20;
const DESKTOP_GAP = 26;

function wrapperWithDesign(design: Record<string, unknown>): React.ComponentType<{ children: React.ReactNode }> {
    const value = { design } as unknown as SarakUIContextType;
    return ({ children }) => React.createElement(UIContext.Provider, { value }, children);
}

describe('paleta e tokens do tema de gráficos', () => {
    it('resolve os sete tokens e a paleta categórica do design', () => {
        const { result } = renderHook(() => useEChartsTheme(), {
            wrapper: wrapperWithDesign({
                chartColorPalette: 'cornflowerblue', secondaryColor: 'darkorchid', accentColor: 'coral',
                statusSuccessColor: 'seagreen', statusWarningColor: 'orange', statusErrorColor: 'crimson',
                statusInfoColor: 'dodgerblue', tertiaryColor: 'rebeccapurple', chartGridOpacity: GRID_OPACITY,
                chartShowGrid: false, chartTooltipBg: 'mediumseagreen', chartType: 'bar',
                chartThickness: LINE_THICKNESS, chartSmoothing: false,
            }),
        });

        expect(result.current.palette).toEqual([
            'cornflowerblue', 'darkorchid', 'coral', 'seagreen',
            'orange', 'crimson', 'dodgerblue', 'rebeccapurple',
        ]);
        expect(result.current.chartGridOpacity).toBe(GRID_OPACITY);
        expect(result.current.chartShowGrid).toBe(false);
        expect(result.current.chartTooltipBg).toBe('mediumseagreen');
        expect(result.current.chartType).toBe('bar');
        expect(result.current.chartThickness).toBe(LINE_THICKNESS);
        expect(result.current.chartSmoothing).toBe(false);
    });
});

describe('tipografia e espaçamento do tema', () => {
    it('resolve fonte, escala de texto e espaçamento responsivo', () => {
        const { result } = renderHook(() => useEChartsTheme(), {
            wrapper: wrapperWithDesign({
                bodyFont: 'Inter', headingFont: 'Georgia', textColorSecondary: 'slategray',
                textColorMaster: 'navy', cardBorderColor: 'silver', colorBgBody: 'whitesmoke',
                typeScaleXs: AXIS_FONT_SIZE, layoutGapSm: SMALL_GAP,
                layoutGapMd: { mob: MOBILE_GAP, tab: TABLET_GAP, desk: DESKTOP_GAP },
            }),
        });

        expect(result.current.axisLabelMargin).toBe(SMALL_GAP);
        expect(result.current.fontSize).toBe(AXIS_FONT_SIZE);
        expect(result.current.baseOption.grid.left).toBe(DESKTOP_GAP);
        expect(result.current.baseOption.tooltip.backgroundColor).toBe(result.current.chartTooltipBg);
    });
});

describe('fallback do tema', () => {
    it('usa uma cor de fallback única quando o design não traz cores', () => {
        const { result } = renderHook(() => useEChartsTheme(), { wrapper: wrapperWithDesign({}) });

        expect(result.current.palette).toHaveLength(8);
        expect(new Set(result.current.palette).size).toBe(1);
        expect(result.current.baseOption.color).toEqual(result.current.palette);
    });
});
