import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as ComponentModule from '../PreviewSystemRenderer';
import { PreviewSystemRenderer } from '../PreviewSystemRenderer';
import { SarakUIContextType } from '../../../../../core/Provider/types';

// Mocks
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<unknown>) => <div {...props}>{children}</div>,
        section: ({ children, ...props }: React.PropsWithChildren<unknown>) => <section {...props}>{children}</section>,
        aside: ({ children, ...props }: React.PropsWithChildren<unknown>) => <aside {...props}>{children}</aside>
    },
    AnimatePresence: ({ children }: React.PropsWithChildren<unknown>) => <>{children}</>
}));

import { SarakUIProvider } from '../../../../../core/Provider/SarakUIProvider';

describe('PreviewSystemRenderer', () => {
    it('should be defined and export its contents without crashing', () => {
        expect(ComponentModule).toBeDefined();
    });

    it('should render and match snapshot', () => {
        const { container } = render(
            <SarakUIProvider>
                <PreviewSystemRenderer 
                    previewDevice="desktop"
                    previewNavVisible={true}
                    setPreviewNavVisible={() => {}}
                    previewMobileNavOpen={false}
                    setPreviewMobileNavOpen={() => {}}
                    isSidebar={true}
                    isDock={false}
                    isTopbar={false}
                    parentContext={{} as unknown as SarakUIContextType}
                    onUpdateDraft={() => {}}
                    mockGroupedModules={{}}
                    mockDiscoveredModules={[]}
                    startResizingTopbar={() => {}}
                    tokens={{}}
                    sarak={{} as unknown as SarakUIContextType}
                    startResizingSidebar={() => {}}
                    apps={{ dashboard: <div>Mock App</div> }}
                    activePreviewApp="dashboard"
                    setActivePreviewApp={() => {}}
                />
            </SarakUIProvider>
        );
        expect(container).toMatchSnapshot();
    });
});

describe('PreviewSystemRenderer — escala pela largura REAL do container (plan-35, fecha 06-painel-de-customizacao-e-preview.md §6.2)', () => {
    // Stub controlável: dispara o callback do ResizeObserver com a largura que o teste
    // escolher, simulando o container-pai em duas larguras — NÃO usa `overrideDevice`/
    // viewport (isto é container, não dispositivo; ver spec 07 §7.2 sobre a diferença).
    let observedCallback: ResizeObserverCallback | null = null;
    class ResizeObserverStub {
        constructor(cb: ResizeObserverCallback) {
            observedCallback = cb;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
    }

    const fireWidth = (width: number) => {
        act(() => {
            observedCallback?.(
                [{ contentRect: { width } } as unknown as ResizeObserverEntry],
                {} as ResizeObserver,
            );
        });
    };

    const baseProps = {
        previewDevice: 'desktop' as const,
        previewNavVisible: true,
        setPreviewNavVisible: () => {},
        previewMobileNavOpen: false,
        setPreviewMobileNavOpen: () => {},
        isSidebar: true,
        isDock: false,
        isTopbar: false,
        parentContext: {} as unknown as SarakUIContextType,
        onUpdateDraft: () => {},
        mockGroupedModules: {},
        mockDiscoveredModules: [],
        startResizingTopbar: () => {},
        tokens: {},
        sarak: {} as unknown as SarakUIContextType,
        startResizingSidebar: () => {},
        apps: { dashboard: <div>Mock App</div> },
        activePreviewApp: 'dashboard',
        setActivePreviewApp: () => {},
    };

    afterEach(() => {
        observedCallback = null;
        vi.unstubAllGlobals();
    });

    it('num container ESTREITO, reduz a escala proporcionalmente (mínimo 0.5)', async () => {
        vi.stubGlobal('ResizeObserver', ResizeObserverStub);
        const { SarakUIProvider } = await import('../../../../../core/Provider/SarakUIProvider');

        const { container } = render(
            <SarakUIProvider>
                <PreviewSystemRenderer {...baseProps} />
            </SarakUIProvider>,
        );

        fireWidth(320); // bem abaixo da referência (1280) — deve saturar no piso 0.5
        // `.origin-top-left` é exclusivo do nó escalado — não colide com nenhum estilo
        // inline de infraestrutura do Provider (DesignInjector/NoiseOverlay/etc.).
        const scaledNode = container.querySelector('.origin-top-left') as HTMLElement | null;
        expect(scaledNode).not.toBeNull();
        expect(scaledNode?.style.transform).toBe('scale(0.5)');
    });

    it('num container LARGO, a escala fica no teto (0.95) — nunca ultrapassa', async () => {
        vi.stubGlobal('ResizeObserver', ResizeObserverStub);
        const { SarakUIProvider } = await import('../../../../../core/Provider/SarakUIProvider');

        const { container } = render(
            <SarakUIProvider>
                <PreviewSystemRenderer {...baseProps} />
            </SarakUIProvider>,
        );

        fireWidth(2000); // bem acima da referência (1280) — deve saturar no teto 0.95
        // `.origin-top-left` é exclusivo do nó escalado — não colide com nenhum estilo
        // inline de infraestrutura do Provider (DesignInjector/NoiseOverlay/etc.).
        const scaledNode = container.querySelector('.origin-top-left') as HTMLElement | null;
        expect(scaledNode?.style.transform).toBe('scale(0.95)');
    });

    it('sem ResizeObserver no ambiente (SSR/jsdom sem polyfill), degrada para a constante de antes desta plan — nunca quebra', async () => {
        vi.stubGlobal('ResizeObserver', undefined);
        const { SarakUIProvider } = await import('../../../../../core/Provider/SarakUIProvider');

        const { container } = render(
            <SarakUIProvider>
                <PreviewSystemRenderer {...baseProps} isDualView={true} />
            </SarakUIProvider>,
        );

        // `.origin-top-left` é exclusivo do nó escalado — não colide com nenhum estilo
        // inline de infraestrutura do Provider (DesignInjector/NoiseOverlay/etc.).
        const scaledNode = container.querySelector('.origin-top-left') as HTMLElement | null;
        expect(scaledNode?.style.transform).toBe('scale(0.75)'); // fallback dual-view de antes
    });
});
