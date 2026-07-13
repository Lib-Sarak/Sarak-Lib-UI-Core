import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
            <button data-testid="btn-set-drafting" onClick={() => ui.setIsDrafting(true)}>Set Drafting</button>
            <button data-testid="btn-lock-drafting" onClick={() => ui.lockDrafting()}>Lock Drafting</button>
            <button data-testid="btn-smart-apply" onClick={() => ui.applyConfig({ mode: 'dark' })}>Smart Apply</button>
            <button data-testid="btn-smart-apply-full" onClick={() => ui.applyFullConfig({ mode: 'dark' })}>Smart Apply Full</button>
            <span data-testid="draft-mode">{ui.draftDesign?.mode || 'null'}</span>
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

    it('injeta as fontes no head do document ao montar', () => {
        render(
            <SarakUIProvider>
                <div />
            </SarakUIProvider>
        );

        const styleTag = document.getElementById('sarak-core-fonts');
        expect(styleTag).toBeInTheDocument();
        expect(styleTag?.textContent).toContain('@import url');

        const links = document.querySelectorAll('link[rel="preconnect"]');
        expect(links.length).toBeGreaterThan(0);
    });

    it('injeta o stylesheet da Sarak no head ao carregar o módulo (Spec 08 §2 — Instalação Zero-Config)', () => {
        // A injeção roda no top-level do módulo (import de `SarakUIProvider`), não
        // dentro de um efeito de render — trava a regressão de o consumidor precisar
        // importar `dist/sarak.css` manualmente (o bundle publicado substitui o
        // placeholder pelo CSS real via scripts/inject-css.mjs; em teste/dev o
        // placeholder mesmo é injetado, provando que o mecanismo dispara).
        const styleTag = document.getElementById('sarak-ui-core-styles');
        expect(styleTag).toBeInTheDocument();
        expect(styleTag?.tagName).toBe('STYLE');
        expect(styleTag?.textContent).toBeTruthy();
    });

    it('altera o estado de rascunho com setIsDrafting e lockDrafting', () => {
        render(
            <SarakUIProvider>
                <TestConsumer />
            </SarakUIProvider>
        );

        expect(screen.getByTestId('is-drafting')).toHaveTextContent('false');
        
        fireEvent.click(screen.getByTestId('btn-set-drafting'));
        expect(screen.getByTestId('is-drafting')).toHaveTextContent('true');
        
        // lockDrafting atualiza o ref, mas não o estado renderizado, 
        // então checamos se o smartApply reage ao lock.
        fireEvent.click(screen.getByTestId('btn-lock-drafting'));
        
        // Ao clicar em smartApply com isDrafting=true ou lockDrafting, ele seta o draftDesign ao invés de chamar applyConfig
        fireEvent.click(screen.getByTestId('btn-smart-apply'));
        expect(screen.getByTestId('draft-mode')).toHaveTextContent('dark');
        
        // E smartApplyFullConfig
        fireEvent.click(screen.getByTestId('btn-smart-apply-full'));
        expect(screen.getByTestId('draft-mode')).toHaveTextContent('dark');
    });
});
