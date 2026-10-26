import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { PreviewCanvas } from '../PreviewCanvas';

// Removido mock do SarakUIProvider para que os inputs internos funcionem com o contexto real

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<unknown>) => <div {...props}>{children}</div>,
        section: ({ children, ...props }: React.PropsWithChildren<unknown>) => <section {...props}>{children}</section>,
        aside: ({ children, ...props }: React.PropsWithChildren<unknown>) => <aside {...props}>{children}</aside>,
        button: ({ children, ...props }: React.PropsWithChildren<unknown>) => <button {...props}>{children}</button>
    },
    AnimatePresence: ({ children }: React.PropsWithChildren<unknown>) => <>{children}</>,
    MotionConfig: ({ children }: React.PropsWithChildren<unknown>) => <>{children}</>
}));

vi.mock('../Mocks/DashboardMock', () => ({
    MockDashboard: () => <div data-testid="mock-dashboard">Dashboard Mocked</div>
}));

vi.mock('../KitchenSinkPreview', () => ({
    KitchenSinkPreview: () => <div data-testid="mock-kitchen-sink">Kitchen Sink Mocked</div>
}));

import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import type { SarakUIContextType } from '../../../../core/Provider/types';

const TEST_SIDEBAR_WIDTH = 250;
const THEME_LOAD_TIMEOUT_MS = 10_000;

describe('PreviewCanvas', () => {
    it('deve usar propriedades de estilo reais (width/height) em vez de custom properties fantasma', async () => {
        const { container } = render(
            <SarakUIProvider>
                <PreviewCanvas
                previewDevice="desktop"
                previewLayoutId="test"
                activePreviewApp="dashboard"
                selectPreviewApp={() => {}}
                previewAnimationStyle="none"
                config={{}}
                previewPrimaryColor="#000"
                mode="light"
                draftMode="dark"
                draftTokens={{ sidebarWidth: TEST_SIDEBAR_WIDTH }}
                onUpdateDraft={() => {}}
                sarak={{} as unknown as SarakUIContextType}
                isDualView={true}
                isPreviewStacked={false}
            />
            </SarakUIProvider>
        );

        // A div externa do Preview deve setar width/height como propriedades reais do style,
        // não mais via custom property fantasma (--device-width) que a engine nunca emitia.
        const deviceWrapper = container.querySelector('[data-testid="device-viewport"]');
        expect(deviceWrapper?.getAttribute('style') || '').toContain('width');
        expect(deviceWrapper?.getAttribute('style') || '').not.toContain('--device-width');

        // Os temas embarcados chegam sob demanda: o snapshot é do estado em que a galeria já os tem.
        // Prazo folgado: a prévia carrega o tema sob demanda e, com a suíte inteira rodando em paralelo, passa dos 1000 ms padrão do `waitFor`.
        await waitFor(() => expect(container.querySelector('[aria-busy="true"]')).toBeNull(), {
            timeout: THEME_LOAD_TIMEOUT_MS,
        });
        expect(container).toMatchSnapshot();
    }, 30000); // A montagem do Provider e do catálogo lazy pode exceder o timeout padrão sob coverage.
});

describe('PreviewCanvas responsive layout', () => {
    it('o dual-view só usa linha quando os dois quadros cabem no container', () => {
        const { container } = render(
            <SarakUIProvider>
                <PreviewCanvas
                    previewDevice="desktop"
                    previewLayoutId="test"
                    activePreviewApp="dashboard"
                    selectPreviewApp={() => {}}
                    previewAnimationStyle="none"
                    config={{}}
                    previewPrimaryColor="#000"
                    mode="light"
                    draftMode="dark"
                    draftTokens={{ sidebarWidth: TEST_SIDEBAR_WIDTH }}
                    onUpdateDraft={() => {}}
                    sarak={{} as unknown as SarakUIContextType}
                    isDualView={true}
                    isPreviewStacked={false}
                />
            </SarakUIProvider>
        );

        const allDivs = Array.from(container.querySelectorAll('div'));

        // A fronteira de medida (ancestral da linha do dual-view).
        const containerBoundary = allDivs.find((el) => el.className.split(' ').includes('@container'));
        expect(containerBoundary).toBeTruthy();

        const dualViewRow = allDivs.find((el) => el.className.includes('items-stretch'));
        expect(dualViewRow).toBeTruthy();
        expect((dualViewRow as HTMLElement).className).not.toMatch(/\bxl:flex-row\b/);
        expect((dualViewRow as HTMLElement).className).toMatch(/@min-\[524px\]:flex-row/);
    }, 30000);
});

describe('PreviewCanvas gallery state', () => {
    it('mantém só o preview quando a galeria fecha e a reabre pelo estado controlado', () => {
        const onCloseGallery = vi.fn();
        const renderCanvas = (isDualView: boolean): React.ReactElement => (
            <SarakUIProvider>
                <PreviewCanvas
                    previewDevice="desktop"
                    previewLayoutId="test"
                    activePreviewApp="dashboard"
                    selectPreviewApp={() => {}}
                    previewAnimationStyle="none"
                    config={{}}
                    previewPrimaryColor="#000"
                    mode="light"
                    draftMode="dark"
                    draftTokens={{}}
                    onUpdateDraft={() => {}}
                    sarak={{} as unknown as SarakUIContextType}
                    isDualView={isDualView}
                    isPreviewStacked={false}
                    onCloseGallery={onCloseGallery}
                />
            </SarakUIProvider>
        );
        const { container, rerender } = render(renderCanvas(false));

        expect(container.querySelector('#presets-catalog')).toBeNull();
        expect(container.querySelectorAll('.sarak-device-desktop')).toHaveLength(1);

        rerender(renderCanvas(true));
        expect(container.querySelector('#presets-catalog')).not.toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Fechar galeria' }));
        expect(onCloseGallery).toHaveBeenCalledTimes(1);
    }, 30000);
});

describe('PreviewCanvas stacked layout', () => {
    it('mantém cada quadro quase na altura da área e com rolagem própria ao empilhar', () => {
        const { container } = render(
            <SarakUIProvider>
                <PreviewCanvas
                    previewDevice="desktop"
                    previewLayoutId="test"
                    activePreviewApp="dashboard"
                    selectPreviewApp={() => {}}
                    previewAnimationStyle="none"
                    config={{}}
                    previewPrimaryColor="#000"
                    mode="light"
                    draftMode="dark"
                    draftTokens={{}}
                    onUpdateDraft={() => {}}
                    sarak={{} as unknown as SarakUIContextType}
                    isDualView
                    isPreviewStacked
                />
            </SarakUIProvider>,
        );
        const previewFrame = container.querySelector('[data-testid="live-preview-frame"]') as HTMLElement;
        const catalogFrame = container.querySelector('[data-testid="catalog-preview-frame"]') as HTMLElement;
        const previewLayout = container.querySelector('[data-testid="preview-layout"]') as HTMLElement;

        expect(previewLayout.className).toContain('overflow-y-auto');
        expect(previewFrame.className).toContain('overflow-y-auto');
        expect(catalogFrame.className).toContain('overflow-y-auto');
        expect(previewFrame.style.height).toBe('calc(100% - 1.5rem)');
        expect(catalogFrame.style.height).toBe('calc(100% - 1.5rem)');
        expect(previewFrame.className).not.toMatch(/\bresize\b/);
        expect(catalogFrame.className).not.toMatch(/\bresize\b/);
        expect(`${previewFrame.className} ${previewFrame.getAttribute('style')}`).not.toContain('vh');
        expect(`${catalogFrame.className} ${catalogFrame.getAttribute('style')}`).not.toContain('vh');
    }, 30000);
});

// A medição de estabilidade do `design` do DesignScope externo mora em
// `PreviewCanvas.designScopeStability.test.tsx` — isolada da árvore real do
// `SarakUIProvider`, que contamina qualquer contagem de `computeColorVariants` com
// chamadas do `DesignInjector` de nível superior do Provider (não relacionadas a
// este componente).
