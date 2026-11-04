import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
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
                draftTokens={{ sidebarWidth: TEST_SIDEBAR_WIDTH }}
                onUpdateDraft={() => {}}
                sarak={{} as unknown as SarakUIContextType}
            />
            </SarakUIProvider>
        );

        // A div externa do Preview deve setar width/height como propriedades reais do style,
        // não mais via custom property fantasma (--device-width) que a engine nunca emitia.
        const deviceWrapper = container.querySelector('[data-testid="device-viewport"]');
        expect(deviceWrapper?.getAttribute('style') || '').toContain('width');
        expect(deviceWrapper?.getAttribute('style') || '').not.toContain('--device-width');

        // Prazo folgado: a prévia monta o Provider e o catálogo lazy e, com a suíte inteira rodando em paralelo, passa dos 1000 ms padrão do `waitFor`.
        await waitFor(() => expect(container.querySelector('[aria-busy="true"]')).toBeNull(), {
            timeout: THEME_LOAD_TIMEOUT_MS,
        });
        expect(container).toMatchSnapshot();
    }, 30000); // A montagem do Provider e do catálogo lazy pode exceder o timeout padrão sob coverage.
});

describe('PreviewCanvas — quadro único', () => {
    const renderCanvas = (): HTMLElement => render(
        <SarakUIProvider>
            <PreviewCanvas
                previewDevice="desktop"
                previewLayoutId="test"
                activePreviewApp="dashboard"
                selectPreviewApp={() => {}}
                previewAnimationStyle="none"
                config={{}}
                previewPrimaryColor="#000"
                draftTokens={{ sidebarWidth: TEST_SIDEBAR_WIDTH }}
                onUpdateDraft={() => {}}
                sarak={{} as unknown as SarakUIContextType}
            />
        </SarakUIProvider>,
    ).container;

    it('mede o container e nunca desenha a galeria: a prévia está sempre à vista', () => {
        const container = renderCanvas();

        expect(Array.from(container.querySelectorAll('div')).some((el) => el.className.split(' ').includes('@container'))).toBe(true);
        expect(container.querySelector('#presets-catalog')).toBeNull();
        expect(container.querySelector('[data-testid="catalog-preview-frame"]')).toBeNull();
        expect(container.querySelectorAll('[data-testid="device-viewport"]')).toHaveLength(1);
    }, 30000);

    it('o quadro rola por conta própria, sem altura calculada nem redimensionador', () => {
        const container = renderCanvas();
        const previewFrame = container.querySelector('[data-testid="live-preview-frame"]') as HTMLElement;
        const previewLayout = container.querySelector('[data-testid="preview-layout"]') as HTMLElement;

        expect(previewLayout.className).toContain('overflow-y-auto');
        expect(previewFrame.className).toContain('overflow-y-auto');
        expect(previewFrame.style.height).toBe('');
        expect(previewFrame.className).not.toMatch(/resize/);
        expect(`${previewFrame.className} ${previewFrame.getAttribute('style')}`).not.toContain('vh');
    }, 30000);
});

// A medição de estabilidade do `design` do DesignScope externo mora em
// `PreviewCanvas.designScopeStability.test.tsx` — isolada da árvore real do
// `SarakUIProvider`, que contamina qualquer contagem de `computeColorVariants` com
// chamadas do `DesignInjector` de nível superior do Provider (não relacionadas a
// este componente).
