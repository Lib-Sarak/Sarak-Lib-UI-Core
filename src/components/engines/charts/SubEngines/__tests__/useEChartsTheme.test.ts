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

const STATUS_COLORS = {
    statusSuccessColor: '#2e8b57', statusWarningColor: '#ffa500',
    statusErrorColor: '#dc143c', statusInfoColor: '#1e90ff',
};

describe('paleta e tokens do tema de gráficos', () => {
    it('resolve os tokens do gráfico e deriva a paleta categórica das cores de marca', () => {
        const { result } = renderHook(() => useEChartsTheme(), {
            wrapper: wrapperWithDesign({
                mode: 'light', colorBgBody: '#fcfcfb',
                chartColorPalette: '#2a78d6', secondaryColor: '#eb6834', accentColor: '#1baf7a', tertiaryColor: '#8a6cc2',
                ...STATUS_COLORS, chartGridOpacity: GRID_OPACITY,
                chartShowGrid: false, chartTooltipBg: 'mediumseagreen', chartType: 'bar',
                chartThickness: LINE_THICKNESS, chartSmoothing: false,
            }),
        });

        expect(result.current.palette).toHaveLength(8);
        expect(result.current.palette[0]).toBe('#2a78d6');
        expect(result.current.primaryColor).toBe(result.current.palette[0]);
        expect(result.current.secondaryColor).toBe(result.current.palette[1]);
        expect(result.current.chartGridOpacity).toBe(GRID_OPACITY);
        expect(result.current.chartShowGrid).toBe(false);
        expect(result.current.chartTooltipBg).toBe('mediumseagreen');
        expect(result.current.chartType).toBe('bar');
        expect(result.current.chartThickness).toBe(LINE_THICKNESS);
        expect(result.current.chartSmoothing).toBe(false);
    });
});

describe('cores de estado fora da paleta', () => {
    it('nenhuma cor de estado entra nas séries automáticas, e elas seguem disponíveis em statusColors', () => {
        const { result } = renderHook(() => useEChartsTheme(), {
            wrapper: wrapperWithDesign({
                mode: 'dark', colorBgBody: '#1a1a19',
                chartColorPalette: '#2a78d6', secondaryColor: '#eb6834', accentColor: '#1baf7a', tertiaryColor: '#8a6cc2',
                ...STATUS_COLORS,
            }),
        });

        for (const status of Object.values(STATUS_COLORS)) {
            expect(result.current.palette).not.toContain(status);
        }
        expect(result.current.statusColors).toEqual(STATUS_COLORS);
    });

    it('o modo claro e o escuro derivam paletas diferentes da mesma marca', () => {
        const brand = { chartColorPalette: '#2a78d6', secondaryColor: '#eb6834', accentColor: '#1baf7a', tertiaryColor: '#8a6cc2' };
        const light = renderHook(() => useEChartsTheme(), { wrapper: wrapperWithDesign({ mode: 'light', colorBgBody: '#ffffff', ...brand }) });
        const dark = renderHook(() => useEChartsTheme(), { wrapper: wrapperWithDesign({ mode: 'dark', colorBgBody: '#0b0f17', ...brand }) });

        expect(light.result.current.palette).not.toEqual(dark.result.current.palette);
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
    it('sem cores no design, deriva a paleta das cores de reserva e a repassa ao ECharts', () => {
        const { result } = renderHook(() => useEChartsTheme(), { wrapper: wrapperWithDesign({}) });

        expect(result.current.palette).toHaveLength(8);
        expect(result.current.baseOption.color).toEqual(result.current.palette);
        expect(result.current.statusColors.statusSuccessColor).toMatch(/^#/);
    });
});
