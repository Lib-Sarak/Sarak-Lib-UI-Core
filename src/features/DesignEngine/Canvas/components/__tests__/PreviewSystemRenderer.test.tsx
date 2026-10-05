import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';
import type { SarakUIContextType } from '../../../../../core/Provider/types';
import {
    arePreviewPropsEqual,
    PreviewSystemRenderer,
    type PreviewSystemRendererProps,
} from '../PreviewSystemRenderer';

const apps = {
    dashboard: <div>Dashboard preview</div>,
    reports: <div>Reports preview</div>,
};

const makePreviewProps = (
    overrides: Partial<PreviewSystemRendererProps> = {},
): PreviewSystemRendererProps => ({
    sarak: {} as SarakUIContextType,
    tokens: {},
    previewDevice: 'desktop',
    activePreviewApp: 'dashboard',
    setActivePreviewApp: () => undefined,
    apps,
    ...overrides,
});

const renderPreview = (
    previewDevice: PreviewSystemRendererProps['previewDevice'],
    overrides: Partial<PreviewSystemRendererProps> = {},
) => {
    const setActivePreviewApp = vi.fn();
    const result = render(
        <SarakUIProvider>
            <PreviewSystemRenderer
                {...makePreviewProps({ ...overrides, previewDevice, setActivePreviewApp })}
            />
        </SarakUIProvider>,
    );

    return { ...result, setActivePreviewApp };
};

let resizeObserverCallback: ResizeObserverCallback | undefined;

class ResizeObserverStub implements ResizeObserver {
    constructor(callback: ResizeObserverCallback) {
        resizeObserverCallback = callback;
    }

    observe(_target: Element): void {}
    unobserve(_target: Element): void {}
    disconnect(): void {}
}

const fireObservedWidth = (width: number): void => {
    act(() => {
        resizeObserverCallback?.(
            [{ contentRect: { width } } as ResizeObserverEntry],
            {} as ResizeObserver,
        );
    });
};

afterEach(() => {
    resizeObserverCallback = undefined;
    vi.unstubAllGlobals();
});

describe('PreviewSystemRenderer', () => {
    it.each(['desktop', 'tablet', 'smartphone'] as const)(
        'monta SarakAppChrome na geometria %s com navegação de exemplo',
        (device) => {
            const { container } = renderPreview(device);

            expect(container.querySelector('.sarak-device-' + device)).not.toBeNull();
            expect(screen.getByText('Dashboard preview')).toBeTruthy();
            if (device === 'smartphone') {
                fireEvent.click(screen.getByRole('button', { name: /Abrir menu/ }));
            }
            expect(screen.getByRole('link', { name: 'dashboard' })).toBeTruthy();
            expect(screen.getByRole('link', { name: 'reports' })).toBeTruthy();
        },
    );

    it('encaminha a seleção de navegação para o app ativo', () => {
        const { setActivePreviewApp } = renderPreview('desktop');

        fireEvent.click(screen.getByRole('link', { name: 'reports' }));

        expect(setActivePreviewApp).toHaveBeenCalledWith('reports');
    });
});

describe('PreviewSystemRenderer — escala pela largura real do contêiner', () => {
    it('reduz a escala no contêiner estreito até o piso de 0.5', () => {
        vi.stubGlobal('ResizeObserver', ResizeObserverStub);
        const { container } = renderPreview('desktop');

        fireObservedWidth(320);

        expect(container.querySelector<HTMLElement>('.origin-top-left')?.style.transform).toBe('scale(0.5)');
    });

    it('mantém a escala no teto de 0.95 no contêiner largo', () => {
        vi.stubGlobal('ResizeObserver', ResizeObserverStub);
        const { container } = renderPreview('desktop');

        fireObservedWidth(2000);

        expect(container.querySelector<HTMLElement>('.origin-top-left')?.style.transform).toBe('scale(0.95)');
    });

    it('usa o fallback dual-view sem ResizeObserver', () => {
        vi.stubGlobal('ResizeObserver', undefined);
        const { container } = renderPreview('desktop', { isDualView: true });

        expect(container.querySelector<HTMLElement>('.origin-top-left')?.style.transform).toBe('scale(0.75)');
    });
});

describe('PreviewSystemRenderer — mídia global', () => {
    it('deixa o fundo transparente quando há mídia global', () => {
        const imageUrl = 'https://example.com/preview-background.png';
        const { container } = renderPreview('desktop', {
            tokens: { globalBackgroundImageUrl: imageUrl },
        });

        expect(container.querySelector('[style*="preview-background.png"]')).not.toBeNull();
        expect(container.querySelector<HTMLElement>('.absolute.inset-0.z-0')?.style.backgroundColor)
            .toBe('transparent');
    });

    it('usa a variável de fundo do tema sem mídia global', () => {
        const { container } = renderPreview('desktop', { tokens: {} });

        expect(container.querySelector('[style*="preview-background.png"]')).toBeNull();
        expect(container.querySelector<HTMLElement>('.absolute.inset-0.z-0')?.style.backgroundColor)
            .toBe('var(--sarak-bg-base)');
    });
});

describe('arePreviewPropsEqual — comparador do React.memo', () => {
    it('considera iguais props com as mesmas referências', () => {
        const props = makePreviewProps();

        expect(arePreviewPropsEqual(props, { ...props })).toBe(true);
    });

    it('detecta uma nova referência dos tokens', () => {
        const props = makePreviewProps();

        expect(arePreviewPropsEqual(props, { ...props, tokens: { ...props.tokens } })).toBe(false);
    });

    it('detecta uma nova referência da lista de apps', () => {
        const props = makePreviewProps();

        expect(arePreviewPropsEqual(props, { ...props, apps: { ...props.apps } })).toBe(false);
    });

    it('detecta mudança do app ativo e da geometria', () => {
        const props = makePreviewProps();

        expect(arePreviewPropsEqual(props, { ...props, activePreviewApp: 'reports' })).toBe(false);
        expect(arePreviewPropsEqual(props, { ...props, previewDevice: 'tablet' })).toBe(false);
    });
});
