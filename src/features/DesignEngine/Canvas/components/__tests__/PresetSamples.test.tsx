import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { PRESET_GROUPS } from '../../../../../core/Design/presets/components/registry';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { PresetSample } from '../PresetSamples';

/** Uma amostra por tipo declarado no registro: cada uma tem de desenhar alguma coisa e nunca lançar. */
const KINDS = [...new Map(PRESET_GROUPS.map((group) => [group.sample, group])).values()];

describe('PresetSample', () => {
    it.each(KINDS.map((group) => [group.sample, group] as const))('%s desenha sem lançar', (kind, group) => {
        const { container } = render(<SarakUIProvider><PresetSample kind={kind} preset={group.presets[0]} /></SarakUIProvider>);
        expect(container.firstElementChild).not.toBeNull();
    });

    it('a amostra de gráfico muda de forma com o tipo do preset', () => {
        const charts = PRESET_GROUPS.find((group) => group.id === 'charts')!.presets;
        const shapes = charts.map((preset) => {
            const { container } = render(<PresetSample kind="chart" preset={preset} />);
            return [preset.design.chartType, container.querySelectorAll('rect').length, container.querySelectorAll('circle').length, container.querySelectorAll('polygon').length].join(':');
        });
        expect(shapes.some((shape) => shape.startsWith('bar:7'))).toBe(true);
        expect(shapes.some((shape) => shape.startsWith('scatter:0:7'))).toBe(true);
        expect(shapes.some((shape) => shape.startsWith('radar:0:0:1'))).toBe(true);
    });

    it('a largura do conteúdo vira uma caixa proporcional', () => {
        const widths = PRESET_GROUPS.find((group) => group.id === 'contentWidth')!.presets;
        const percent = (index: number): string => {
            const { container } = render(<PresetSample kind="width" preset={widths[index]} />);
            return (container.querySelector('[data-sample-width] > div') as HTMLElement).style.width;
        };
        expect(percent(0)).toBe('100%');
        expect(Number.parseFloat(percent(1))).toBeLessThan(Number.parseFloat(percent(3)));
    });
});
