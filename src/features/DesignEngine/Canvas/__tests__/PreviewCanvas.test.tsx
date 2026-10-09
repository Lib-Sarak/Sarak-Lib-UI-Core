import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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
    AnimatePresence: ({ children }: React.PropsWithChildren<unknown>) => <>{children}</>
}));

vi.mock('../Mocks/DashboardMock', () => ({
    MockDashboard: () => <div data-testid="mock-dashboard">Dashboard Mocked</div>
}));

vi.mock('../KitchenSinkPreview', () => ({
    KitchenSinkPreview: () => <div data-testid="mock-kitchen-sink">Kitchen Sink Mocked</div>
}));

import { SarakUIProvider } from '../../../../core/Provider/SarakUIProvider';
import { SarakUIContextType } from '../../../../core/Provider/types';

describe('PreviewCanvas - Refatoração Data-Driven', () => {
    it('deve usar propriedades de estilo reais (width/height) em vez de custom properties fantasma', () => {
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
                draftTokens={{ sidebarWidth: 250 }}
                onUpdateDraft={() => {}}
                sarak={{} as unknown as SarakUIContextType}
                isDualView={true}
                isPreviewStacked={false}
            />
            </SarakUIProvider>
        );

        // A div externa do Preview deve setar width/height como propriedades reais do style,
        // não mais via custom property fantasma (--device-width) que a engine nunca emitia.
        const deviceWrapper = container.querySelector('[class*="min-h-[var(--sarak-engine-min-h-sm,300px)]"]');
        expect(deviceWrapper).not.toBeNull();
        if (deviceWrapper) {
            const style = deviceWrapper.getAttribute('style') || '';
            expect(style).toContain('width');
            expect(style).not.toContain('--device-width');
        }

        expect(container).toMatchSnapshot();
    }, 30000); // 15000 não bastava sob `vitest --coverage` (instrumentação V8 + contenção de workers, plan-12/R8.1)

    it('o dual-view reage ao CONTAINER (@min-[1280px]:flex-row), não mais à viewport (`xl:`) — plan-35, fecha 06-painel-de-customizacao-e-preview.md §6.2', () => {
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
                    draftTokens={{ sidebarWidth: 250 }}
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
        expect((dualViewRow as HTMLElement).className).toMatch(/@min-\[1280px\]:flex-row/);
    }, 30000);

    it('mantém só o preview quando a galeria fecha e a reabre pelo estado controlado', () => {
        const onCloseGallery = vi.fn();
        const renderCanvas = (isDualView: boolean) => (
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

    it('divide o espaço do contêiner entre preview e galeria ao empilhar, sem unidade de janela', () => {
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
                    draftTokens={{}}
                    onUpdateDraft={() => {}}
                    sarak={{} as unknown as SarakUIContextType}
                    isDualView
                    isPreviewStacked
                />
            </SarakUIProvider>,
        );
        const previewFrame = container.querySelector('.group') as HTMLElement;
        const catalog = container.querySelector('#presets-catalog') as HTMLElement;
        const catalogFrame = catalog.parentElement as HTMLElement;
        const viewportHeightUnit = ['v', 'h'].join('');

        expect(previewFrame.className).toMatch(/\bflex-1\b/);
        expect(previewFrame.className).toMatch(/\bmin-h-0\b/);
        expect(catalogFrame.className).toMatch(/\bflex-1\b/);
        expect(catalogFrame.className).toMatch(/\bmin-h-0\b/);
        expect(`${previewFrame.className} ${previewFrame.getAttribute('style')}`).not.toContain(`${viewportHeightUnit}]`);
        expect(`${previewFrame.className} ${previewFrame.getAttribute('style')}`).not.toContain(`45${viewportHeightUnit}`);
        expect(`${catalogFrame.className} ${catalogFrame.getAttribute('style')}`).not.toContain(`${viewportHeightUnit}]`);
        expect(`${catalogFrame.className} ${catalogFrame.getAttribute('style')}`).not.toContain(`45${viewportHeightUnit}`);
        expect(previewFrame.style.height).toBe('');
        expect(previewFrame.style.maxHeight).toBe('');
    }, 30000);
});

// A MEDIÇÃO de estabilidade do `design` do DesignScope externo (plan-36) mora em
// `PreviewCanvas.designScopeStability.test.tsx` — isolada da árvore real do
// `SarakUIProvider`, que contamina qualquer contagem de `computeColorVariants` com
// chamadas do `DesignInjector` de nível superior do Provider (não relacionadas a
// este componente).
