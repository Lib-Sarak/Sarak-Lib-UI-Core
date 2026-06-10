import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SarakUIProvider, useSarakUI } from '../SarakUIProvider';
import { useDesignManager } from '../hooks/useDesignManager';

// Mock dependências do SarakUIProvider
vi.mock('../hooks/useRegistryManager', () => ({
    useRegistryManager: vi.fn(() => ({ registeredModules: [], isHydrated: true }))
}));

vi.mock('../hooks/useDesignManager', () => ({
    useDesignManager: vi.fn()
}));

vi.mock('../hooks/useBrandingManager', () => ({
    useBrandingManager: vi.fn(() => ({
        branding: { companyName: 'MockCompany', tabName: 'MockTab' },
        updateBranding: vi.fn(),
        isBrandingLoaded: true
    }))
}));

vi.mock('../components/DesignInjector', () => ({
    DesignInjector: () => <div data-testid="design-injector" />
}));

vi.mock('../components/SovereignThemeInjector', () => ({
    SovereignThemeInjector: () => <div data-testid="sovereign-theme-injector" />
}));

vi.mock('../../Design/components/SarakBackgroundRenderer', () => ({
    SarakBackgroundRenderer: () => <div data-testid="sarak-background-renderer" />
}));

vi.mock('../../../effects/NoiseOverlay', () => ({
    NoiseOverlay: () => <div data-testid="noise-overlay" />
}));

vi.mock('../DeviceProvider', () => ({
    DeviceProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="device-provider">{children}</div>
}));

// Componente para testar o contexto injectado
const TestConsumer = () => {
    const ui = useSarakUI();
    return (
        <div>
            <span data-testid="active-design-systemName">{ui.activeDesign.systemName}</span>
            <span data-testid="is-drafting">{ui.isDrafting ? 'true' : 'false'}</span>
        </div>
    );
};

describe('SarakUIProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Setup default mock for useDesignManager
        vi.mocked(useDesignManager).mockReturnValue({
            design: { mode: 'light', systemName: 'TestSystem' },
            setDesign: vi.fn(),
            applyConfig: vi.fn(),
            applyFullConfig: vi.fn(),
            persistDesign: vi.fn(),
            isBackendLoaded: true
        } as any);
    });

    it('deve inicializar e renderizar os children e componentes de infraestrutura', () => {
        render(
            <SarakUIProvider>
                <div data-testid="child-component">Child Component</div>
            </SarakUIProvider>
        );

        expect(screen.getByTestId('child-component')).toBeInTheDocument();
        expect(screen.getByTestId('design-injector')).toBeInTheDocument();
        expect(screen.getByTestId('sovereign-theme-injector')).toBeInTheDocument();
        expect(screen.getByTestId('sarak-background-renderer')).toBeInTheDocument();
        expect(screen.getByTestId('noise-overlay')).toBeInTheDocument();
        expect(screen.getByTestId('device-provider')).toBeInTheDocument();
    });

    it('deve prover o UIContext corretamente, aplicando branding no design', () => {
        render(
            <SarakUIProvider>
                <TestConsumer />
            </SarakUIProvider>
        );

        expect(screen.getByTestId('active-design-systemName')).toHaveTextContent('MockCompany');
        expect(screen.getByTestId('is-drafting')).toHaveTextContent('false');
    });

    it('não deve renderizar children se isStrictSync for true e isBackendLoaded for false', () => {
        // Mock isBackendLoaded false
        vi.mocked(useDesignManager).mockReturnValue({
            design: { mode: 'light' },
            setDesign: vi.fn(),
            applyConfig: vi.fn(),
            applyFullConfig: vi.fn(),
            persistDesign: vi.fn(),
            isBackendLoaded: false
        } as any);

        render(
            <SarakUIProvider options={{ persistence: { strictBackendSync: true } }}>
                <div data-testid="hidden-child">Should not be visible</div>
            </SarakUIProvider>
        );

        expect(screen.queryByTestId('hidden-child')).not.toBeInTheDocument();
    });
});
