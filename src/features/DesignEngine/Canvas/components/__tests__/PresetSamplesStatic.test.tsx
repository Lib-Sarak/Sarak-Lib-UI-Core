import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { getPresetGroup } from '../../../../../core/Design/presets/components/registry';
import { ModalWindowSample, MotionCurveSample, PageStageSample, ScrollBarSample } from '../PresetSamplesStatic';

const presetsOf = (group: string) => getPresetGroup(group)!.presets;
const curveOf = (id: string): string => {
    const preset = presetsOf('motion').find((candidate) => candidate.id === id)!;
    const { container } = render(<MotionCurveSample preset={preset} />);
    return container.querySelector('polyline')!.getAttribute('points')!;
};

describe('PresetSamplesStatic', () => {
    it('cada opção de movimento desenha uma curva própria', () => {
        const curves = presetsOf('motion').map((preset) => curveOf(preset.id));
        expect(new Set(curves).size).toBe(curves.length);
    });

    it('o movimento sem duração é um degrau: todos os pontos no mesmo tempo', () => {
        const xs = curveOf('motion-instant').split(' ').map((point) => point.split(',')[0]);
        expect(new Set(xs).size).toBe(1);
    });

    it('o ricochete passa do alvo e a curva sem ricochete não', () => {
        const topOf = (id: string): number => Math.min(...curveOf(id).split(' ').map((point) => Number(point.split(',')[1])));
        const targetOf = (id: string): number => Number(curveOf(id).split(' ').at(-1)!.split(',')[1]);
        expect(topOf('motion-expressive')).toBeLessThan(targetOf('motion-expressive'));
        expect(topOf('motion-calm')).toBeCloseTo(targetOf('motion-calm'), 0);
    });

    it('a troca de página leva o tipo e desenha a tela que sai só quando há transição', () => {
        for (const preset of presetsOf('pageTransition')) {
            const { container } = render(<PageStageSample preset={preset} />);
            const type = String(preset.design.pageTransitionType);
            expect(container.querySelector('[data-sample-page]')?.getAttribute('data-sample-page')).toBe(type);
            expect(container.querySelectorAll('[data-sample-page] > div')).toHaveLength(type === 'none' ? 1 : 3);
        }
    });

    it('a barra de rolagem lê a largura, o raio e o recuo das variáveis do tema', () => {
        const { container } = render(<ScrollBarSample />);
        const track = container.querySelector('[data-sample-scrollbar]') as HTMLElement;
        expect(track.style.width).toContain('--sarak-scroll-width');
        expect(track.style.width).toContain('--sarak-scroll-padding');
        expect(track.style.borderRadius).toContain('--sarak-scroll-radius');
    });

    it('a janela leva o cabeçalho de cada opção, e o flutuante tira o título de dentro do painel', () => {
        for (const preset of presetsOf('modal')) {
            const { container } = render(<ModalWindowSample preset={preset} />);
            const header = String(preset.design.modalHeaderStyle);
            expect(container.querySelector('[data-sample-modal]')?.getAttribute('data-sample-modal')).toBe(header);
            const panel = container.querySelector('[data-sample-modal-panel]') as HTMLElement;
            expect(panel.querySelector('h4') === null).toBe(header === 'floating');
        }
    });
});
