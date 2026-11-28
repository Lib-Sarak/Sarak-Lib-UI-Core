import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { getPresetGroup } from '../../../../../core/Design/presets/components/registry';
import SarakUIProvider from '../../../../../core/Provider/SarakUIProvider';
import { prazoDeTeste } from '../../../../../shared/testing/prazoDeTeste';
import { BorderCornerSample, CardTextureCornerSample, GradientAreaSample, ShadowPanelSample, ShadowDirectionSample } from '../PresetSamplesDepth';

/** Cada render do Provider leva cerca de 1 s no jsdom: os casos com várias opções pedem teto próprio. */
const RENDER_LOOP_TIMEOUT_MS = prazoDeTeste(30_000);
const inProvider = (node: React.ReactElement) => render(<SarakUIProvider>{node}</SarakUIProvider>);
const presetsOf = (group: string) => getPresetGroup(group)!.presets;

describe('PresetSamplesDepth', () => {
    it('os oito grupos de contraste baixo e de animação deixam todas as opções à vista', () => {
        for (const id of ['modal', 'scroll', 'motion', 'pageTransition', 'shadow', 'shadowDirection', 'border', 'gradient']) {
            const group = getPresetGroup(id)!;
            expect(group.featured, id).toEqual(group.presets.map((preset) => preset.id));
        }
    });

    it('a sombra desenha o painel e a moldura recorta o canto do cartão ampliado', () => {
        expect(inProvider(<ShadowPanelSample />).container.querySelector('[data-sample-shadow]')?.hasAttribute('data-sample-shadow')).toBe(true);
        expect(inProvider(<BorderCornerSample />).container.querySelector('[data-sample-border]')?.getAttribute('data-sample-border')).toBe('top-left');
    }, RENDER_LOOP_TIMEOUT_MS);

    it('a textura do cartão amplia a borda do cartão real, o mesmo quadro para qualquer opção', () => {
        const sample = inProvider(<CardTextureCornerSample texture="grid" />).container.querySelector('[data-sample-card-texture]') as HTMLElement;
        expect(sample.getAttribute('data-sample-card-texture')).toBe('bottom-left');
        expect(sample.querySelector('.sarak-card')?.getAttribute('data-sx-card-texture-type')).toBe('grid');
        expect((sample.firstElementChild as HTMLElement).style.transform).toMatch(/scale\(\d/);
        expect(sample.textContent).toBe('');
    }, RENDER_LOOP_TIMEOUT_MS);

    it('a direção da sombra marca a luz: uma para cada lado, quatro no halo, e a órbita só na que segue o ponteiro', () => {
        const lights = (id: string): number => {
            const preset = presetsOf('shadowDirection').find((candidate) => candidate.id === id)!;
            return inProvider(<ShadowDirectionSample preset={preset} />).container.querySelectorAll('[data-sample-shadow-direction] > span:not(.border-dashed)').length;
        };
        expect(lights('shadow-dir-bottom')).toBe(1);
        expect(lights('shadow-dir-center')).toBe(4);
        const follow = presetsOf('shadowDirection').find((candidate) => candidate.id === 'shadow-dir-follow')!;
        expect(inProvider(<ShadowDirectionSample preset={follow} />).container.querySelector('.border-dashed')).not.toBeNull();
    }, RENDER_LOOP_TIMEOUT_MS);

    it('cada tipo de degradê pinta de um jeito, e o linear leva o ângulo da opção', () => {
        const images = presetsOf('gradient').map((preset) => (render(<GradientAreaSample preset={preset} />).container.firstElementChild as HTMLElement).style.backgroundImage);
        expect(new Set(images).size).toBe(images.length);
        const linear = presetsOf('gradient').find((preset) => preset.id === 'bg-gradient-linear')!;
        const shown = (render(<GradientAreaSample preset={linear} />).container.firstElementChild as HTMLElement).style.backgroundImage;
        expect(shown).toContain('135deg');
    });
});
