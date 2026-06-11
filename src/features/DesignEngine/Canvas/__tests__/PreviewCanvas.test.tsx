import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { PreviewCanvas } from '../PreviewCanvas';

// Mocks simples para não quebrar dependências de hooks externos complexos
vi.mock('../../../../core/Provider/SarakUIProvider', async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        UIContext: { Provider: ({ children }: any) => <div>{children}</div> },
        DesignOverrideContext: { Provider: ({ children }: any) => <div>{children}</div> },
        useSarakUI: () => ({ options: { user: {} } })
    };
});

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
        aside: ({ children, ...props }: any) => <aside {...props}>{children}</aside>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

vi.mock('../Mocks/DashboardMock', () => ({
    MockDashboard: () => <div data-testid="mock-dashboard">Dashboard Mocked</div>
}));

vi.mock('../KitchenSinkPreview', () => ({
    KitchenSinkPreview: () => <div data-testid="mock-kitchen-sink">Kitchen Sink Mocked</div>
}));

describe('PreviewCanvas - Refatoração Data-Driven', () => {
    it('deve usar variaveis CSS injetadas no style em vez de inline widths', () => {
        const { container } = render(
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
                activeCategory="colors"
                onUpdateDraft={() => {}}
                sarak={{}}
                isDualView={true}
                isPreviewStacked={false}
            />
        );

        // A div externa do Preview deve conter o css variable --device-width em vez de width explícito
        const deviceWrapper = container.querySelector('[class*="w-[var(--device-width)]"]');
        expect(deviceWrapper).not.toBeNull();
        if (deviceWrapper) {
            const style = deviceWrapper.getAttribute('style') || '';
            expect(style).toContain('--device-width');
            expect(style).not.toMatch(/(^|;)\s*width:\s*50%/i); // Não deve ter "width: 50%" como propriedade CSS direta
        }
    });
});
