import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { OptionSampleFrame, SAMPLE_FRAME_HEIGHT, SAMPLE_REFERENCE } from '../OptionSampleFrame';

describe('OptionSampleFrame', () => {
    it('desenha o conteúdo no quadro de referência e guarda a proporção dele na opção', () => {
        const { container, getByText } = render(<OptionSampleFrame><span>amostra</span></OptionSampleFrame>);
        const frame = container.querySelector('[data-option-sample]') as HTMLElement;
        expect(frame.style.aspectRatio).toBe(`${SAMPLE_REFERENCE.width} / ${SAMPLE_REFERENCE.height}`);
        const stage = getByText('amostra').parentElement as HTMLElement;
        expect(stage.style.width).toBe(`${SAMPLE_REFERENCE.width}px`);
        expect(stage.style.height).toBe(`${SAMPLE_REFERENCE.height}px`);
    });

    it('a amostra baixa (campo, barra de topo) pede um quadro mais baixo, na mesma largura de referência', () => {
        const { container } = render(<OptionSampleFrame height={SAMPLE_FRAME_HEIGHT.topbar}><span>barra</span></OptionSampleFrame>);
        expect((container.querySelector('[data-option-sample]') as HTMLElement).style.aspectRatio).toBe(`${SAMPLE_REFERENCE.width} / ${SAMPLE_FRAME_HEIGHT.topbar}`);
        expect(SAMPLE_FRAME_HEIGHT.topbar).toBeLessThan(SAMPLE_FRAME_HEIGHT.default);
        expect(SAMPLE_FRAME_HEIGHT.input).toBeLessThan(SAMPLE_FRAME_HEIGHT.default);
    });

    it('sem ResizeObserver (jsdom) parte da escala de partida, sem quebrar', () => {
        const { container } = render(<OptionSampleFrame><span>x</span></OptionSampleFrame>);
        expect(((container.querySelector('[data-option-sample]') as HTMLElement).firstElementChild as HTMLElement).style.transform).toContain('scale(');
    });
});
