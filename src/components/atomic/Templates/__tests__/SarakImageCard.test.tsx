import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { SarakImageCard } from '../SarakImageCard';
import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import type { SarakThemePayload } from '../../../../core/Provider/types';

const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

const renderCard = (config: SarakThemePayload) =>
    render(
        <SarakUIProvider config={{ mode: 'dark', ...config }}>
            <SarakImageCard src={PIXEL} title="Capa" />
        </SarakUIProvider>
    );

/** A camada que carrega a imagem de capa: o pai direto do `<img>`. */
const imageLayer = (container: HTMLElement): HTMLElement => container.querySelector('img')!.parentElement as HTMLElement;

describe('SarakImageCard — zoom da capa (imageCardHoverZoom)', () => {
    it('o ponteiro sobre o CONTEÚDO do cartão (não sobre a camada da imagem) dá o zoom do token', async () => {
        const { container, getByText } = renderCard({ imageCardHoverZoom: 1.4 });
        const layer = imageLayer(container);
        expect(layer.style.transform).not.toContain('scale(1.4');
        fireEvent.pointerEnter(getByText('Capa').closest('[data-sx-card-interactive]') as HTMLElement, { pointerType: 'mouse' });
        await waitFor(() => expect(layer.style.transform).toContain('scale(1.4'));
    });

    it('zoom 1: a camada da imagem não cresce', async () => {
        const { container, getByText } = renderCard({ imageCardHoverZoom: 1 });
        const layer = imageLayer(container);
        fireEvent.pointerEnter(getByText('Capa').closest('[data-sx-card-interactive]') as HTMLElement, { pointerType: 'mouse' });
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(layer.style.transform).not.toMatch(/scale\((?!1\))/);
    });

    it('movimento reduzido zera o zoom, mesmo com o token acima de 1', async () => {
        const { container, getByText } = renderCard({ imageCardHoverZoom: 1.4, reducedMotion: true });
        const layer = imageLayer(container);
        fireEvent.pointerEnter(getByText('Capa').closest('[data-sx-card-interactive]') as HTMLElement, { pointerType: 'mouse' });
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(layer.style.transform).not.toContain('scale(1.4');
    });
});
