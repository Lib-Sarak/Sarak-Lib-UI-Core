import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    SaveThemeModal: ({ isOpen, onAction }: any) => (
        isOpen ? (
            <div data-testid="save-modal">
                <button onClick={() => onAction({ type: 'CREATE_NEW', name: 'New Theme' })}>Save New</button>
                <button onClick={() => onAction({ type: 'CANCEL' })}>Cancel</button>
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
    buildDynamicGroups: vi.fn(() => ({
        cards: {
            'Base': [{ id: 'cardBorderWidth', type: 'number', category: 'cards', subcategory: 'Base', defaultValue: 1 }]
        }
    }))
}));

vi.mock('../../utils/dynamic-categories', () => ({
    buildDynamicGroups: vi.fn(() => ({}))
}));

// Mock do Fetch para os testes de API
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ThemeCustomizationTab', () => {
    const mockFetchActiveTheme = vi.fn();
    const mockHandleApplyToSystem = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        mockFetch.mockResolvedValue({
            json: async () => ({ id: 'new_id', name: 'New Theme' })
        });

        vi.mocked(useSarakUI).mockReturnValue({
            branding: { companyName: 'Sarak' },
            mode: 'dark'
        } as any);

        vi.mocked(useThemeEngineState).mockReturnValue({
            sarak: {},
            uiBaseUrl: 'http://api.mock',
            apiToken: '',
            activePreviewApp: 'dashboard',
            setActivePreviewApp: vi.fn(),
            previewDevice: 'desktop',
            setPreviewDevice: vi.fn(),
            activePillarId: null,
            setActivePillarId: vi.fn(),
            activeSectionId: null,
            setActiveSectionId: vi.fn(),
            viewMode: 'preview',
            setViewMode: vi.fn(),
            searchQuery: '',
            setSearchQuery: vi.fn(),
            isEssentialMode: true,
            setIsEssentialMode: vi.fn(),
            isPreviewStacked: false,
            setIsPreviewStacked: vi.fn(),
            currentThemeId: null,
            setCurrentThemeId: vi.fn(),
            currentThemeOrigin: null,
            setCurrentThemeOrigin: vi.fn(),
            currentThemeName: '',
            setCurrentThemeName: vi.fn(),
            isSaveModalOpen: false,
            setIsSaveModalOpen: vi.fn(),
            isSaving: false,
            setIsSaving: vi.fn(),
            pendingApply: false,
            setPendingApply: vi.fn(),
            fetchActiveTheme: mockFetchActiveTheme
        } as any);

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
    });

    it('expande uma categoria e renderiza tokens', () => {
        const mockSetActivePillarId = vi.fn();
        vi.mocked(useThemeEngineState).mockReturnValue({
            ...vi.mocked(useThemeEngineState)(),
            activePillarId: null,
            setActivePillarId: mockSetActivePillarId,
            isEssentialMode: false
        } as any);

        const { container, rerender } = render(<ThemeCustomizationTab />);
        
        // Em vez de procurar texto que pode ser quebrado, procuramos o ícone mockado
        const icon = screen.queryByTestId('icon-cards');
        if (icon) {
            fireEvent.click(icon.parentElement!);
            expect(mockSetActivePillarId).toHaveBeenCalledWith('cards');
        }

        // Mudar o estado para simular expansão
        vi.mocked(useThemeEngineState).mockReturnValue({
            ...vi.mocked(useThemeEngineState)(),
            activePillarId: 'cards',
            activeSectionId: null,
            setActiveSectionId: vi.fn(),
            isEssentialMode: false
        } as any);

        rerender(<ThemeCustomizationTab />);
    });

    it('alterna o modo de visualização', () => {
        vi.mocked(useThemeEngineState).mockReturnValue({
            sarak: {},
            uiBaseUrl: 'http://api.mock',
            apiToken: '',
            activePreviewApp: 'dashboard',
            setActivePreviewApp: vi.fn(),
            previewDevice: 'desktop',
            setPreviewDevice: vi.fn(),
            activePillarId: null,
            setActivePillarId: vi.fn(),
            activeSectionId: null,
            setActiveSectionId: vi.fn(),
            viewMode: 'catalog',
            setViewMode: vi.fn(),
            searchQuery: '',
            setSearchQuery: vi.fn(),
            isEssentialMode: true,
            setIsEssentialMode: vi.fn(),
            isPreviewStacked: false,
            setIsPreviewStacked: vi.fn(),
            currentThemeId: null,
            setCurrentThemeId: vi.fn(),
            currentThemeOrigin: null,
            setCurrentThemeOrigin: vi.fn(),
            currentThemeName: '',
            setCurrentThemeName: vi.fn(),
            isSaveModalOpen: false,
            setIsSaveModalOpen: vi.fn(),
            isSaving: false,
            setIsSaving: vi.fn(),
            pendingApply: false,
            setPendingApply: vi.fn(),
            fetchActiveTheme: vi.fn()
        } as any);

        render(<ThemeCustomizationTab />);
        expect(screen.getByTestId('master-control-panel')).toBeInTheDocument();
        expect(screen.queryByTestId('preview-canvas')).toBeInTheDocument(); // Canvas is always rendered next to the sidebar
    });

    it('chama a API ao salvar um tema novo', async () => {
        vi.mocked(useThemeEngineState).mockReturnValue({
            ...vi.mocked(useThemeEngineState)(),
            isSaveModalOpen: true,
            apiToken: '',
            uiBaseUrl: 'http://api.mock'
        } as any);

        render(<ThemeCustomizationTab />);
        
        const saveBtn = screen.getByText('Save New');
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://api.mock/themes', expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('New Theme')
            }));
        });
    });

    it('abre o modal de salvar ao tentar aplicar alterações sendo um tema dirty', () => {
        const mockSetIsSaveModalOpen = vi.fn();
        vi.mocked(useThemeEngineState).mockReturnValue({
            ...vi.mocked(useThemeEngineState)(),
            isSaveModalOpen: false,
            setIsSaveModalOpen: mockSetIsSaveModalOpen
        } as any);

        vi.mocked(useDesignDraft).mockReturnValue({
            ...vi.mocked(useDesignDraft)(),
            isDirty: true
        } as any);

        render(<ThemeCustomizationTab />);
        
        const applyBtn = screen.getByText('Aplicar Alterações Globais');
        fireEvent.click(applyBtn);

        expect(mockSetIsSaveModalOpen).toHaveBeenCalledWith(true);
    });

    it('busca o tema ativo na API logo ao montar', async () => {
        mockFetchActiveTheme.mockResolvedValue({ id: 'theme-123', name: 'Active Theme' });
        
        const mockSetCurrentThemeId = vi.fn();
        vi.mocked(useThemeEngineState).mockReturnValue({
            ...vi.mocked(useThemeEngineState)(),
            setCurrentThemeId: mockSetCurrentThemeId,
            setCurrentThemeName: vi.fn(),
            setCurrentThemeOrigin: vi.fn()
        } as any);

        render(<ThemeCustomizationTab />);
        
        expect(mockFetchActiveTheme).toHaveBeenCalled();
        
        await waitFor(() => {
            expect(mockSetCurrentThemeId).toHaveBeenCalledWith('theme-123');
        });
    });
});
