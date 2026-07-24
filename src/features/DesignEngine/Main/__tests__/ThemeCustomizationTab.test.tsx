import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeCustomizationTab } from '../ThemeCustomizationTab';
import { useThemeEngineState } from '../hooks/useThemeEngineState';
import { useDesignDraft } from '../../hooks/useDesignDraft';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';

vi.mock('../../../../core/Provider/SarakUIProvider', () => ({
    useSarakUI: vi.fn()
}));

vi.mock('../hooks/useThemeEngineState', () => ({
    useThemeEngineState: vi.fn()
}));

vi.mock('../../hooks/useDesignDraft', () => ({
    useDesignDraft: vi.fn()
}));

vi.mock('../../hooks/useResizable', () => ({
    useResizable: vi.fn(() => ({
        size: 300,
        startResizing: vi.fn(),
        isResizing: false
    }))
}));

// Mocks dos Sub-componentes
vi.mock('../../Canvas/PreviewCanvas', () => ({
    PreviewCanvas: () => <div data-testid="preview-canvas" />
}));

vi.mock('../MasterControlPanel', () => ({
    MasterControlPanel: () => <div data-testid="master-control-panel" />
}));

vi.mock('../TemplatesTab', () => ({
    TemplatesTab: () => <div data-testid="templates-tab" />
}));

vi.mock('../components/SaveThemeModal', () => ({
    SaveThemeModal: ({ isOpen, onExport }: { isOpen: boolean, onExport: (name: string) => void }) => (
        isOpen ? (
            <div data-testid="save-modal">
                <button onClick={() => onExport('New Theme')}>Export</button>
            </div>
        ) : null
    )
}));

vi.mock('../../../../core/Design/master-map', () => ({
    MASTER_DESIGN_MAP: {
        components: [
            { id: 'cards', title: 'Cards', icon: () => <div data-testid="icon-cards" /> }
        ]
    }
}));

vi.mock('../../../../core/Design/catalog', () => ({
    TokenCatalog: [
        { id: 'cardBorderWidth', type: 'number', category: 'cards', subcategory: 'Base', defaultValue: 1 }
    ]
}));

vi.mock('../../utils/dynamic-categories', () => ({
    buildDynamicGroups: vi.fn(() => ({}))
}));

const baseThemeEngineState = {
    sarak: {},
    activePreviewApp: 'dashboard',
    setActivePreviewApp: vi.fn(),
    previewDevice: 'desktop',
    setPreviewDevice: vi.fn(),
    activePillarId: null as string | null,
    setActivePillarId: vi.fn(),
    activeSectionId: null as string | null,
    setActiveSectionId: vi.fn(),
    viewMode: 'preview',
    setViewMode: vi.fn(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
    isEssentialMode: true,
    setIsEssentialMode: vi.fn(),
    isPreviewStacked: false,
    setIsPreviewStacked: vi.fn(),
    currentThemeName: '',
    setCurrentThemeName: vi.fn(),
    isSaveModalOpen: false,
    setIsSaveModalOpen: vi.fn(),
    isSaving: false,
    setIsSaving: vi.fn()
};

describe('ThemeCustomizationTab (Spec 44 — sem backend próprio)', () => {
    const mockHandleApplyToSystem = vi.fn();
    let fetchSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.clearAllMocks();
        fetchSpy = vi.spyOn(globalThis, 'fetch');

        vi.mocked(useSarakUI).mockReturnValue({
            branding: { companyName: 'Sarak' },
            mode: 'dark'
        } as any);

        vi.mocked(useThemeEngineState).mockReturnValue({ ...baseThemeEngineState } as any);

        vi.mocked(useDesignDraft).mockReturnValue({
            draft: { mode: 'light' },
            updateDraft: vi.fn(),
            handleApplyToSystem: mockHandleApplyToSystem,
            handleApplyComponent: vi.fn(),
            isComponentDirty: vi.fn(() => false),
            resetComponent: vi.fn(),
            isDirty: false,
            toast: null,
            showToast: vi.fn(),
            handleThemePreview: vi.fn()
        } as any);
    });

    it('renderiza os componentes principais no modo de preview', () => {
        render(<ThemeCustomizationTab />);

        expect(screen.getByText('Design Engine')).toBeInTheDocument();
        expect(screen.getByTestId('preview-canvas')).toBeInTheDocument();
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('alterna o modo de visualização', () => {
        vi.mocked(useThemeEngineState).mockReturnValue({
            ...baseThemeEngineState,
            viewMode: 'catalog'
        } as any);

        render(<ThemeCustomizationTab />);
        expect(screen.getByTestId('master-control-panel')).toBeInTheDocument();
        expect(screen.queryByTestId('preview-canvas')).toBeInTheDocument();
    });

    it('exporta o tema como JSON ao confirmar no modal — nunca faz uma chamada de rede', () => {
        vi.mocked(useThemeEngineState).mockReturnValue({
            ...baseThemeEngineState,
            isSaveModalOpen: true
        } as any);

        render(<ThemeCustomizationTab />);

        fireEvent.click(screen.getByText('Export'));

        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('aplica as alterações globais diretamente ao sistema, sem abrir modal de exportação (sem conceito de "tema no banco")', () => {
        const mockSetIsSaveModalOpen = vi.fn();
        vi.mocked(useThemeEngineState).mockReturnValue({
            ...baseThemeEngineState,
            setIsSaveModalOpen: mockSetIsSaveModalOpen
        } as any);

        vi.mocked(useDesignDraft).mockReturnValue({
            draft: { mode: 'light' },
            updateDraft: vi.fn(),
            handleApplyToSystem: mockHandleApplyToSystem,
            handleApplyComponent: vi.fn(),
            isComponentDirty: vi.fn(() => false),
            resetComponent: vi.fn(),
            isDirty: true,
            toast: null,
            showToast: vi.fn(),
            handleThemePreview: vi.fn()
        } as any);

        render(<ThemeCustomizationTab />);

        const applyBtn = screen.getByText('Aplicar Alterações Globais');
        fireEvent.click(applyBtn);

        expect(mockHandleApplyToSystem).toHaveBeenCalledTimes(1);
        expect(mockSetIsSaveModalOpen).not.toHaveBeenCalled();
        expect(fetchSpy).not.toHaveBeenCalled();
    });
});
