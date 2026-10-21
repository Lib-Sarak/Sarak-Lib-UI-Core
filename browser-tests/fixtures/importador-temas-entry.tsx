import React, { useCallback, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SARAK_DEFAULT_THEME_ID } from '../../src/core/Design/presets/themes';
import { SARAK_THEME_CATALOG } from '../../src/core/Design/presets/themes/catalog.generated';
import { SarakUIProvider, useSarakUI } from '../../src/core/Provider/SarakUIProvider';
import type { SarakDesignState, SarakThemeEntry, SarakThemeSaveOperation } from '../../src/core/Provider/types';
import { useDesignDraft } from '../../src/features/DesignEngine/hooks/useDesignDraft';
import { ThemeActionBar } from '../../src/features/DesignEngine/Main/components/ThemeActionBar';
import { SaveThemeModal } from '../../src/features/DesignEngine/Main/components/SaveThemeModal';
import { useThemeCustomizationActions } from '../../src/features/DesignEngine/Main/hooks/useThemeCustomizationActions';

const INITIAL_THEMES: SarakThemeEntry[] = [{
    id: 'erp-noite',
    name: 'ERP Noite',
    design: { mode: 'dark', systemName: 'ERP', primaryColor: '#1268a8' },
    contraparte: { mode: 'light', primaryColor: '#1268a8', colorBgBody: '#ffffff' },
}];
const DEFAULT_THEME = SARAK_THEME_CATALOG.find((theme) => theme.id === SARAK_DEFAULT_THEME_ID);

if (!DEFAULT_THEME) throw new Error('Tema padrão ausente do catálogo.');

interface ThemeStateProbeProps {
    themes: SarakThemeEntry[];
    lastOperation: string;
    persistedThemeId: string;
    onActivateTheme: (id: string) => void;
    onChangeDraft: () => void;
    onRejectNextDelete: () => void;
}

const ThemeStateProbe: React.FC<ThemeStateProbeProps> = ({
    themes,
    lastOperation,
    persistedThemeId,
    onActivateTheme,
    onChangeDraft,
    onRejectNextDelete,
}) => {
    const sarak = useSarakUI();

    return (
        <div>
            <span data-testid="active-theme-id">{sarak.resolvedThemeId}</span>
            <span data-testid="default-theme-id">{SARAK_DEFAULT_THEME_ID}</span>
            <span data-testid="default-theme-name">{DEFAULT_THEME.name}</span>
            <span data-testid="last-theme-operation">{lastOperation}</span>
            <span data-testid="persisted-theme-id">{persistedThemeId}</span>
            <span data-testid="theme-collection">{JSON.stringify(themes.map(({ id, name, contraparte }) => ({ id, name, contraparte })))}</span>
            <span data-testid="provider-theme-ids">{sarak.allThemes.map((theme) => theme.id).join(',')}</span>
            <button type="button" data-testid="edit-current-draft" onClick={onChangeDraft}>Editar rascunho</button>
            <button type="button" data-testid="activate-importer" onClick={() => onActivateTheme('erp-noite')}>Ativar tema importado</button>
            <button type="button" data-testid="activate-embedded" onClick={() => onActivateTheme(SARAK_DEFAULT_THEME_ID)}>Ativar tema embarcado</button>
            <button type="button" data-testid="reject-next-delete" onClick={onRejectNextDelete}>Rejeitar próximo apagar</button>
        </div>
    );
};

interface ThemeManagementSceneProps {
    themes: SarakThemeEntry[];
    lastOperation: string;
    persistedThemeId: string;
    onRejectNextDelete: () => void;
}

const ThemeManagementScene: React.FC<ThemeManagementSceneProps> = (props) => {
    const sarak = useSarakUI();
    const draftState = useDesignDraft(sarak);
    const [currentThemeName, setCurrentThemeName] = useState('');
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const showToast = useCallback((_type: 'success' | 'warning', message: string) => setFeedbackMessage(message), []);
    const onActivateTheme = useCallback(async (id: string) => {
        const theme = await sarak.loadTheme(id);
        if (!theme?.design) throw new Error(`Tema "${id}" indisponível no harness.`);
        draftState.discardDraft();
        sarak.applyFullConfigRaw(theme.design as SarakDesignState);
        sarak.setResolvedThemeId?.(id);
        setCurrentThemeName(theme.name || '');
    }, [sarak.loadTheme, sarak.applyFullConfigRaw, sarak.setResolvedThemeId, draftState.discardDraft]);
    const onChangeDraft = useCallback(() => {
        const appliedPrimaryColor = sarak.systemDesign?.primaryColor;
        const primaryColor = ['#7c3aed', '#0ea5e9'].find((candidate) => candidate !== appliedPrimaryColor);
        if (!primaryColor) throw new Error('A fixture não encontrou uma cor diferente da aplicada.');
        draftState.updateDraft('primaryColor', primaryColor);
    }, [sarak.systemDesign, draftState.updateDraft]);
    const actions = useThemeCustomizationActions({
        sarak,
        draft: draftState.draft,
        handleApplyToSystem: draftState.handleApplyToSystem,
        handleThemePreview: draftState.handleThemePreview,
        discardDraft: draftState.discardDraft,
        setDraftThemeId: draftState.setDraftThemeId,
        showToast,
        setCurrentThemeName,
        setIsSaveModalOpen,
        setIsSaving,
    });

    return (
        <>
            <ThemeStateProbe
                {...props}
                onActivateTheme={(id) => void onActivateTheme(id)}
                onChangeDraft={onChangeDraft}
                onRejectNextDelete={props.onRejectNextDelete}
            />
            <div style={{ width: 360 }}>
                <ThemeActionBar
                    isDirty={draftState.isDirty}
                    dirtyTokenCount={draftState.dirtyTokenCount}
                    onApply={actions.handleApplyGlobalChanges}
                    onDiscard={actions.handleDiscardChanges}
                    canSaveToRuntime={actions.canSaveToRuntime}
                    canDeleteTheme={actions.isImporterTheme}
                    onSave={actions.handleOpenRuntimeSave}
                    onExport={actions.handleOpenExport}
                    onCreateTheme={() => void actions.handleCreateTheme()}
                    onDeleteTheme={() => void actions.handleDeleteTheme()}
                    canUndoLastApply={draftState.canUndoLastApply}
                    onUndoLastApply={draftState.undoLastApply}
                />
            </div>
            <SaveThemeModal
                isOpen={isSaveModalOpen}
                purpose={actions.modalPurpose}
                themeName={currentThemeName}
                canReplace={actions.isImporterTheme}
                initialAction={actions.initialSaveAction}
                onClose={() => setIsSaveModalOpen(false)}
                onExport={actions.handleExportTheme}
                onSave={actions.handleSaveTheme}
                isSaving={isSaving}
            />
            <output data-testid="feedback-message">{feedbackMessage}</output>
        </>
    );
};

const ImporterThemeHarness: React.FC = () => {
    const [themes, setThemes] = useState(INITIAL_THEMES);
    const [lastOperation, setLastOperation] = useState('');
    const [persistedThemeId, setPersistedThemeId] = useState('');
    const [rejectNextDelete, setRejectNextDelete] = useState(false);
    const saveTheme = useCallback(async (theme: SarakThemeEntry, operation: SarakThemeSaveOperation = 'create') => {
        setLastOperation(`${operation}:${theme.id}`);
        setThemes((current) => operation === 'replace'
            ? current.map((entry) => entry.id === theme.id ? theme : entry)
            : [...current, theme]);
    }, []);
    const deleteTheme = useCallback(async (id: string) => {
        if (rejectNextDelete) {
            setLastOperation(`delete-rejected:${id}`);
            setRejectNextDelete(false);
            throw new Error('backend offline');
        }
        setLastOperation(`delete:${id}`);
        setThemes((current) => current.filter((entry) => entry.id !== id));
    }, [rejectNextDelete]);
    const persistDesign = useCallback(async (_design: SarakDesignState, activeThemeId?: string) => {
        setPersistedThemeId(activeThemeId ?? '');
    }, []);
    const options = useMemo(() => ({
        theme: { onSave: saveTheme, onDelete: deleteTheme },
        persistence: { onSave: persistDesign },
    }), [saveTheme, deleteTheme, persistDesign]);
    return (
        <SarakUIProvider initialTheme="erp-noite" customThemes={themes} options={options}>
            <ThemeManagementScene
                themes={themes}
                lastOperation={lastOperation}
                persistedThemeId={persistedThemeId}
                onRejectNextDelete={() => setRejectNextDelete(true)}
            />
        </SarakUIProvider>
    );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Harness root ausente.');
createRoot(rootElement).render(<ImporterThemeHarness />);
