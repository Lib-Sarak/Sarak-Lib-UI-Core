import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { getPresetGroup } from '../../../../../core/Design/presets/components/registry';
import { Frame, WidthSample } from '../PresetSamplesMotion';

describe('PresetSamplesMotion', () => {
    it('o quadro centraliza o que recebe', () => {
        const { container, getByText } = render(<Frame>dentro</Frame>);
        expect(getByText('dentro')).toBe(container.firstElementChild);
        expect(container.firstElementChild).toHaveClass('justify-center');
    });

    it('a largura em pixels vira uma proporção e a fluida ocupa tudo', () => {
        const widths = getPresetGroup('contentWidth')!.presets;
        const fluid = render(<WidthSample preset={widths[0]} />);
        expect((fluid.container.querySelector('[data-sample-width] > div') as HTMLElement).style.width).toBe('100%');
        const narrow = render(<WidthSample preset={widths[1]} />);
        expect(Number.parseFloat((narrow.container.querySelector('[data-sample-width] > div') as HTMLElement).style.width)).toBeLessThan(100);
    });
});
