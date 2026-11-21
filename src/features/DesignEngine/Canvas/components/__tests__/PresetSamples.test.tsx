import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { PRESET_GROUPS } from '../../../../../core/Design/presets/components/registry';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { PresetSample } from '../PresetSamples';

// O motor de gráfico (echarts) não roda no jsdom: a prova é que a amostra monta O componente real, uma vez, com o tipo.
vi.mock('../../../../../components/engines/charts', () => ({
    SarakChartEngine: ({ type }: { type?: string }) => <div data-chart-engine={type} />,
}));

// A tabela real virtualiza as linhas e não desenha nada sem altura medida (jsdom): o que se prova é que ela é montada.
vi.mock('../../../../../components/atomic/DataDisplay/SarakDataTable', () => ({
    SarakDataTable: () => <div data-real-table="" />,
}));

/** O que cada componente real deixa no DOM para a amostra ser reconhecida. */
const REAL_MARK = { table: '[data-real-table]', badge: '[role="progressbar"]', empty: '[role="status"], h2' } as const;

/** Uma amostra por tipo declarado no registro: cada uma tem de desenhar alguma coisa e nunca lançar. */
const KINDS = [...new Map(PRESET_GROUPS.map((group) => [group.sample, group])).values()];

describe('PresetSample', () => {
    it.each(KINDS.map((group) => [group.sample, group] as const))('%s desenha sem lançar', (kind, group) => {
        const { container } = render(<SarakUIProvider><PresetSample kind={kind} preset={group.presets[0]} /></SarakUIProvider>);
        expect(container.firstElementChild).not.toBeNull();
    });

    it('a amostra de gráfico é um único gráfico real, do mesmo tipo em todas as opções', async () => {
        const charts = PRESET_GROUPS.find((group) => group.id === 'charts')!.presets;
        for (const preset of charts) {
            const { container, unmount } = render(<SarakUIProvider><PresetSample kind="chart" preset={preset} /></SarakUIProvider>);
            await waitFor(() => expect(container.querySelectorAll('[data-chart-engine]').length).toBe(1));
            expect(container.querySelector('[data-chart-engine]')?.getAttribute('data-chart-engine')).toBe('area');
            unmount();
        }
    });

    it.each([['table', 'tabela'], ['badge', 'selo e progresso'], ['empty', 'estado vazio']] as const)('a amostra de %s (%s) carrega o componente real sob demanda', async (kind, _label) => {
        const group = PRESET_GROUPS.find((candidate) => candidate.sample === kind)!;
        const { container } = render(<SarakUIProvider><PresetSample kind={kind} preset={group.presets[0]} /></SarakUIProvider>);
        // O quadro vazio segura o lugar até o módulo do componente real chegar.
        expect(container.firstElementChild).not.toBeNull();
        await waitFor(() => expect(container.querySelector(REAL_MARK[kind])).not.toBeNull());
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
