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
});
