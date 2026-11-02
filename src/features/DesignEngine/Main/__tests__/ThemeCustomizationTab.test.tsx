import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeCustomizationTab } from '../ThemeCustomizationTab';
import { useThemeEngineState } from '../hooks/useThemeEngineState';
import { useDesignDraft } from '../../hooks/useDesignDraft';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';

vi.mock('../../../../core/Provider/SarakUIProvider', () => {
    const useSarakUI = vi.fn();
    return { useSarakUI, useSarakUIOptional: useSarakUI };
});

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

// Mocks dos Sub-componentes. O PreviewCanvas expõe `onApplyFullTheme` por um botão
// para cobrir o caminho de aplicar tema completo pelo catálogo — L4.
vi.mock('../../Canvas/PreviewCanvas', () => ({
    PreviewCanvas: ({
        onApplyFullTheme,
        config,
        draftTokens,
        onInspectComponent,
    }: {
        onApplyFullTheme?: (d: Record<string, unknown>) => void;
        config?: { mode?: string };
        draftTokens?: { mode?: string };
        onInspectComponent?: (schemaId: string) => void;
    }) => (
        <div
            data-testid="preview-canvas"
            data-preview-config-mode={config?.mode}
            data-preview-token-mode={draftTokens?.mode}
        >
            <button data-testid="apply-full-theme" onClick={() => onApplyFullTheme?.({ mode: 'dark', primaryColor: '#38bdf8', systemName: 'ERP Noturno' })}>
                Apply Full
            </button>
            <button data-testid="inspect-cards" onClick={() => onInspectComponent?.('cards')}>Inspect</button>
        </div>
    )
}));

vi.mock('../../Canvas/components/PreviewToolbar', () => ({
    PreviewToolbar: ({ setPreviewDevice, onModeChange, mode }: {
        setPreviewDevice: (device: 'desktop' | 'tablet' | 'smartphone') => void;
        onModeChange: (mode: 'light' | 'dark') => void;
        mode: string;
    }) => (
        <div data-testid="preview-toolbar" data-mode={mode}>
            <button data-testid="preview-device-tablet" onClick={() => setPreviewDevice('tablet')}>Tablet</button>
            <button data-testid="preview-mode-light" onClick={() => onModeChange('light')}>Claro</button>
        </div>
    )
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

const mockApplyFullConfigRaw = vi.fn();
const mockPersistDesign = vi.fn();

const baseThemeEngineState = {
    sarak: { applyFullConfigRaw: mockApplyFullConfigRaw, persistDesign: mockPersistDesign },
    activePreviewApp: 'dashboard',
    selectPreviewApp: vi.fn(),
    previewDevice: 'desktop',
    setPreviewDevice: vi.fn(),
    panelView: { kind: 'home' } as { kind: string; id?: string },
    openDecision: vi.fn(),
    openBrand: vi.fn(),
    goHome: vi.fn(),
    viewMode: 'preview',
    setViewMode: vi.fn(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
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
            previewDraft: { mode: 'dark' },
            updateDraft: vi.fn(),
            handleApplyToSystem: mockHandleApplyToSystem,
            isComponentDirty: vi.fn(() => false),
            resetComponent: vi.fn(),
            resetToken: vi.fn(),
            isDirty: false,
            dirtyTokenCount: 0,
            dirtyTokens: [],
            discardDraft: vi.fn(),
            toast: null,
            showToast: vi.fn(),
            handleThemePreview: vi.fn()
        } as any);
    });

    it('renderiza os componentes principais no modo de preview', () => {
        render(<ThemeCustomizationTab />);

        expect(screen.getByText('Design')).toBeInTheDocument();
        expect(screen.getByTestId('preview-canvas')).toBeInTheDocument();
        expect(screen.getByTestId('preview-canvas')).toHaveAttribute('data-preview-config-mode', 'dark');
        expect(screen.getByTestId('preview-canvas')).toHaveAttribute('data-preview-token-mode', 'dark');
        expect(screen.getByTestId('preview-toolbar')).toHaveAttribute('data-mode', 'dark');
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('a prévia está sempre à vista: não há galeria nem interruptor para abri-la', () => {
        render(<ThemeCustomizationTab />);

        expect(screen.getByTestId('preview-canvas')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Abrir galeria' })).toBeNull();
        expect(screen.queryByRole('radiogroup', { name: 'Modo de edição' })).toBeNull();
    });

    it('o modo claro/escuro da barra da prévia grava no rascunho, nunca no sistema', () => {
        const updateDraft = vi.fn();
        vi.mocked(useDesignDraft).mockReturnValue({
            draft: { mode: 'dark' }, previewDraft: { mode: 'dark' }, updateDraft, handleApplyToSystem: mockHandleApplyToSystem,
            isComponentDirty: vi.fn(() => false), resetComponent: vi.fn(), resetToken: vi.fn(), isDirty: false, dirtyTokenCount: 0, dirtyTokens: [],
            discardDraft: vi.fn(), toast: null, showToast: vi.fn(), handleThemePreview: vi.fn(),
        } as any);
        render(<ThemeCustomizationTab />);

        fireEvent.click(screen.getByTestId('preview-mode-light'));

        expect(updateDraft).toHaveBeenCalledWith('mode', 'light');
        expect(mockApplyFullConfigRaw).not.toHaveBeenCalled();
    });

    it('o inspetor da prévia abre a decisão do que foi clicado', () => {
        const openDecision = vi.fn();
        vi.mocked(useThemeEngineState).mockReturnValue({ ...baseThemeEngineState, openDecision } as any);
        render(<ThemeCustomizationTab />);

        fireEvent.click(screen.getByTestId('inspect-cards'));

        expect(openDecision).toHaveBeenCalledWith('shape');
    });

    it('a altura é relativa ao container-pai — nunca à viewport (plan-35, fecha 06-painel-de-customizacao-e-preview.md §6.2)', () => {
        const { container } = render(<ThemeCustomizationTab />);

        const root = container.firstElementChild as HTMLElement;
        expect(root.className).not.toMatch(/\bh-screen\b/);
        expect(root.className).not.toMatch(/\bmax-h-screen\b/);
        expect(root.className).toMatch(/\bh-full\b/);
        expect(root.className).toMatch(/\bmin-h-0\b/);
    });

    it('o canvas de preview tem `min-w-0` — sem isto a sidebar de largura mínima fixa o estoura (plan-35)', () => {
        render(<ThemeCustomizationTab />);

        const canvasWrapper = screen.getByTestId('preview-canvas').parentElement as HTMLElement;
        expect(canvasWrapper.className).toMatch(/\bmin-w-0\b/);
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

    it('encaminha a escolha de dispositivo do preview para o estado compartilhado', () => {
        const setPreviewDevice = vi.fn();
        vi.mocked(useThemeEngineState).mockReturnValue({
            ...baseThemeEngineState,
            setPreviewDevice
        } as any);

        render(<ThemeCustomizationTab />);
        fireEvent.click(screen.getByTestId('preview-device-tablet'));

        expect(setPreviewDevice).toHaveBeenCalledWith('tablet');
    });

    it('aplicar um tema completo pelo catálogo só atualiza o rascunho — não comita nem persiste', () => {
        const mockPreview = vi.fn();
        vi.mocked(useDesignDraft).mockReturnValue({
            draft: { mode: 'light' },
            previewDraft: { mode: 'dark' },
            updateDraft: vi.fn(),
            handleApplyToSystem: mockHandleApplyToSystem,
            isComponentDirty: vi.fn(() => false),
            resetComponent: vi.fn(),
            resetToken: vi.fn(),
            isDirty: false,
            dirtyTokenCount: 0,
            dirtyTokens: [],
            discardDraft: vi.fn(),
            toast: null,
            showToast: vi.fn(),
            handleThemePreview: mockPreview
        } as any);

        render(<ThemeCustomizationTab />);
        fireEvent.click(screen.getByTestId('apply-full-theme'));

        const expected = { mode: 'dark', primaryColor: '#38bdf8', systemName: 'ERP Noturno' };
        // Reflete no rascunho/preview... (3º argumento é o `themeId` — o mock de
        // disparo não simula um clique real no catálogo, então undefined).
        expect(mockPreview).toHaveBeenCalledWith(expected, undefined, undefined);
        // ...e NÃO toca o design do sistema nem o armazenamento — a escolha de um tema
        // no catálogo é rascunho, como qualquer outro token.
        expect(mockApplyFullConfigRaw).not.toHaveBeenCalled();
        expect(mockPersistDesign).not.toHaveBeenCalled();
    });

    it('aplica as alterações globais diretamente ao sistema, sem abrir modal de exportação (sem conceito de "tema no banco")', () => {
        const mockSetIsSaveModalOpen = vi.fn();
        vi.mocked(useThemeEngineState).mockReturnValue({
            ...baseThemeEngineState,
            setIsSaveModalOpen: mockSetIsSaveModalOpen
        } as any);

        vi.mocked(useDesignDraft).mockReturnValue({
            draft: { mode: 'light' },
            previewDraft: { mode: 'dark' },
            updateDraft: vi.fn(),
            handleApplyToSystem: mockHandleApplyToSystem,
            isComponentDirty: vi.fn(() => false),
            resetComponent: vi.fn(),
            resetToken: vi.fn(),
            isDirty: true,
            dirtyTokenCount: 1,
            dirtyTokens: [{ id: 'primaryColor', label: 'Cor primária', applied: '#000000', draft: '#ffffff' }],
            discardDraft: vi.fn(),
            toast: null,
            showToast: vi.fn(),
            handleThemePreview: vi.fn()
        } as any);

        render(<ThemeCustomizationTab />);

        const applyBtn = screen.getByRole('button', { name: 'Aplicar' });
        expect(screen.getByText('1 alteração')).toBeInTheDocument();
        fireEvent.click(applyBtn);

        expect(mockHandleApplyToSystem).toHaveBeenCalledTimes(1);
        expect(mockSetIsSaveModalOpen).not.toHaveBeenCalled();
        expect(fetchSpy).not.toHaveBeenCalled();
    });
});
