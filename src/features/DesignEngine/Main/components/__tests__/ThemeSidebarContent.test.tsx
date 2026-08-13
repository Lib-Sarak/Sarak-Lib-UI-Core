import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeSidebarContent } from '../ThemeSidebarContent';

vi.mock('../../MasterControlPanel', () => ({
    MasterControlPanel: (props: { draft: unknown; updateDraft: unknown; resetToken: unknown }) => (
        <div
            data-testid="master-control-panel"
            data-has-draft={String(props.draft !== undefined)}
            data-has-update-draft={String(typeof props.updateDraft === 'function')}
            data-has-reset-token={String(typeof props.resetToken === 'function')}
        />
    )
}));

const hyperGranularityCapture: { props: Record<string, unknown> | null } = { props: null };

vi.mock('../../../Panels/HyperGranularityTab', () => ({
    HyperGranularityTab: (props: Record<string, unknown>) => {
        hyperGranularityCapture.props = props;
        return <div data-testid="hyper-granularity-tab" />;
    }
}));

const baseProps = () => ({
    searchQuery: '',
    filteredResults: [],
    catalogMap: new Map(),
    draft: { mode: 'dark' },
    updateDraft: vi.fn(),
    previewDevice: 'desktop',
    viewMode: 'preview',
    activePillarId: 'global',
    setActivePillarId: vi.fn(),
    activeSectionId: 'global-preferences',
    setActiveSectionId: vi.fn(),
    isComponentDirty: vi.fn(() => false),
    resetComponent: vi.fn(),
    resetToken: vi.fn(),
    handleApplyComponent: vi.fn(),
    handleApplyToSystem: vi.fn(),
    toast: null,
    globalComponent: { tokens: [] },
    sarak: { branding: {}, updateBranding: vi.fn() },
    pillars: [],
    groupedStructure: {},
    isEssentialMode: false,
    dynamicEssentialTokens: new Set<string>(),
    setActivePreviewApp: vi.fn()
});

describe('ThemeSidebarContent', () => {
    it('matches snapshot', () => {
        const FinalProps = baseProps() as unknown as React.ComponentProps<typeof ThemeSidebarContent>;
        const { container } = render(<ThemeSidebarContent {...FinalProps} />);
        expect(container).toMatchSnapshot();
    });

    it('plan-36: no modo catalog, passa draft/updateDraft/resetToken (a MESMA instância de useDesignDraft de ThemeCustomizationTab) para MasterControlPanel — sem instância paralela', () => {
        const FinalProps = { ...baseProps(), viewMode: 'catalog' } as unknown as React.ComponentProps<typeof ThemeSidebarContent>;
        render(<ThemeSidebarContent {...FinalProps} />);

        const panel = screen.getByTestId('master-control-panel');
        expect(panel).toHaveAttribute('data-has-draft', 'true');
        expect(panel).toHaveAttribute('data-has-update-draft', 'true');
        expect(panel).toHaveAttribute('data-has-reset-token', 'true');
    });

    // plan-37: entrada própria do HyperGranularityTab (Command Center), separada do
    // toggle Essencial/Avançado — viewMode='command-center' monta o painel de busca livre.
    it('plan-37: no modo command-center, renderiza o HyperGranularityTab', () => {
        const FinalProps = { ...baseProps(), viewMode: 'command-center' } as unknown as React.ComponentProps<typeof ThemeSidebarContent>;
        render(<ThemeSidebarContent {...FinalProps} />);

        expect(screen.getByTestId('hyper-granularity-tab')).toBeDefined();
    });

    // plan-37 (correção, achado 2): o HyperGranularityTab instanciava a PRÓPRIA
    // useDesignDraft — duas fontes de rascunho vivas ao mesmo tempo (a mesma configuração
    // que a plan-36 removeu do MasterControlPanel). O conserto foi fazer o
    // HyperGranularityTab receber draft/updateDraft/handleApplyToSystem/resetComponent/
    // resetToken/toast por prop. Provar UMA fonte = provar que são as MESMAS referências
    // que o painel usa em todo o resto (identidade, não só "existe").
    it('plan-37 (correção): no modo command-center, passa a MESMA instância de draft/updateDraft/handleApplyToSystem/resetComponent/resetToken/toast do painel para HyperGranularityTab — sem instância paralela de useDesignDraft', () => {
        const draft = { mode: 'dark' };
        const updateDraft = vi.fn();
        const handleApplyToSystem = vi.fn();
        const resetComponent = vi.fn();
        const resetToken = vi.fn();
        const toast = { type: 'success' as const, message: 'Design aplicado.' };

        const FinalProps = {
            ...baseProps(),
            viewMode: 'command-center',
            draft, updateDraft, handleApplyToSystem, resetComponent, resetToken, toast
        } as unknown as React.ComponentProps<typeof ThemeSidebarContent>;
        render(<ThemeSidebarContent {...FinalProps} />);

        const captured = hyperGranularityCapture.props;
        expect(captured).not.toBeNull();
        expect(captured?.draft).toBe(draft);
        expect(captured?.updateDraft).toBe(updateDraft);
        expect(captured?.handleApplyToSystem).toBe(handleApplyToSystem);
        expect(captured?.resetComponent).toBe(resetComponent);
        expect(captured?.resetToken).toBe(resetToken);
        expect(captured?.toast).toBe(toast);
    });
});
