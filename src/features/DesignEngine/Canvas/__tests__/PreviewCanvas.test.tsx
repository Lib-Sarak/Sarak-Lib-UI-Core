import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
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
                setActivePreviewApp={() => {}}
                previewAnimationStyle="none"
                previewEmojiSet="apple"
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
                    setActivePreviewApp={() => {}}
                    previewAnimationStyle="none"
                    previewEmojiSet="apple"
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
});

// A MEDIÇÃO de estabilidade do `design` do DesignScope externo (plan-36) mora em
// `PreviewCanvas.designScopeStability.test.tsx` — isolada da árvore real do
// `SarakUIProvider`, que contamina qualquer contagem de `computeColorVariants` com
// chamadas do `DesignInjector` de nível superior do Provider (não relacionadas a
// este componente).
