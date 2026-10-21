import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SARAK_DEFAULT_THEME_ID } from '../../../../core/Design/presets/themes';
import { SARAK_THEME_CATALOG } from '../../../../core/Design/presets/themes/catalog.generated';
import { sarakLoadReferenceThemes } from '../../../../core/Design/presets/themes/reference';
import { useOverlay } from '../../../../components/atomic/Modals/SarakOverlayProvider';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { SarakDesignState, SarakThemeEntry } from '../../../../core/Provider/types';
import type { useDesignDraft } from '../../hooks/useDesignDraft';
import type { useThemeEngineState } from './useThemeEngineState';
import { useThemePersistenceHandlers } from './useThemePersistenceHandlers';
import { getThemeCounterpartForMode } from '../utils/exportTheme';

type ThemeEngineState = ReturnType<typeof useThemeEngineState>;
type DraftState = ReturnType<typeof useDesignDraft>;
type SaveAction = 'replace' | 'new' | 'duplicate';

interface UseThemeCustomizationActionsProps {
    sarak: ThemeEngineState['sarak'];
    draft: DraftState['draft'];
    handleApplyToSystem: DraftState['handleApplyToSystem'];
    handleThemePreview: DraftState['handleThemePreview'];
    discardDraft: DraftState['discardDraft'];
    setDraftThemeId: DraftState['setDraftThemeId'];
    showToast: DraftState['showToast'];
    setCurrentThemeName: ThemeEngineState['setCurrentThemeName'];
    setIsSaveModalOpen: ThemeEngineState['setIsSaveModalOpen'];
    setIsSaving: ThemeEngineState['setIsSaving'];
}

interface ThemeCreationActionProps {
    draft: DraftState['draft'];
    handleThemePreview: DraftState['handleThemePreview'];
    setDraftThemeId: DraftState['setDraftThemeId'];
    setSourceThemeId: (id: string | undefined) => void;
    setSourceThemeOverride: (theme: SarakThemeEntry | undefined) => void;
    setCurrentThemeName: ThemeEngineState['setCurrentThemeName'];
    setIsSaveModalOpen: ThemeEngineState['setIsSaveModalOpen'];
    setModalPurpose: (purpose: 'runtime' | 'export') => void;
    setInitialSaveAction: (action: SaveAction) => void;
    showToast: DraftState['showToast'];
}

interface ThemeDeletionActionProps {
    sarak: ThemeEngineState['sarak'];
    sourceTheme: SarakThemeEntry | undefined;
    isImporterTheme: boolean;
    discardDraft: DraftState['discardDraft'];
    setDraftThemeId: DraftState['setDraftThemeId'];
    setSourceThemeId: (id: string | undefined) => void;
    setSourceThemeOverride: (theme: SarakThemeEntry | undefined) => void;
    setCurrentThemeName: ThemeEngineState['setCurrentThemeName'];
    showToast: DraftState['showToast'];
}

const useSourceThemeState = (
    sarak: ThemeEngineState['sarak'],
    setCurrentThemeName: ThemeEngineState['setCurrentThemeName'],
) => {
    const [sourceThemeId, setSourceThemeId] = useState<string | undefined>(sarak.resolvedThemeId);
    const [sourceThemeOverride, setSourceThemeOverride] = useState<SarakThemeEntry | undefined>();
    const previousResolvedThemeId = useRef<string | undefined>();

    useEffect(() => {
        if (previousResolvedThemeId.current === sarak.resolvedThemeId) return;
        previousResolvedThemeId.current = sarak.resolvedThemeId;
        setSourceThemeId(sarak.resolvedThemeId);
        setSourceThemeOverride(undefined);
        const activeTheme = sarak.allThemes?.find((theme) => theme.id === sarak.resolvedThemeId);
        if (activeTheme) setCurrentThemeName(activeTheme.name || '');
    }, [sarak.resolvedThemeId, sarak.allThemes, setCurrentThemeName]);

    const sourceTheme = sourceThemeOverride?.id === sourceThemeId
        ? sourceThemeOverride
        : sarak.allThemes?.find((theme) => theme.id === sourceThemeId);
    const isImporterTheme = Boolean(sourceTheme && !SARAK_THEME_CATALOG.some((theme) => theme.id === sourceTheme.id));
    const existingThemeIds = useMemo(
        () => new Set((sarak.themeCatalog ?? []).map((theme) => theme.id)),
        [sarak.themeCatalog],
    );

    return { sourceTheme, isImporterTheme, existingThemeIds, setSourceThemeId, setSourceThemeOverride };
};

const useSaveDialogActions = (
    isImporterTheme: boolean,
    setIsSaveModalOpen: ThemeEngineState['setIsSaveModalOpen'],
) => {
    const [modalPurpose, setModalPurpose] = useState<'runtime' | 'export'>('runtime');
    const [initialSaveAction, setInitialSaveAction] = useState<SaveAction>('new');
    const handleOpenRuntimeSave = useCallback(() => {
        setModalPurpose('runtime');
        setInitialSaveAction(isImporterTheme ? 'replace' : 'new');
        setIsSaveModalOpen(true);
    }, [isImporterTheme, setIsSaveModalOpen]);
    const handleOpenExport = useCallback(() => {
        setModalPurpose('export');
        setInitialSaveAction('new');
        setIsSaveModalOpen(true);
    }, [setIsSaveModalOpen]);

    return { modalPurpose, initialSaveAction, setModalPurpose, setInitialSaveAction, handleOpenRuntimeSave, handleOpenExport };
};

const useThemeCreationAction = (props: ThemeCreationActionProps) => {
    const {
        draft, handleThemePreview, setDraftThemeId, setSourceThemeId, setSourceThemeOverride,
        setCurrentThemeName, setIsSaveModalOpen, setModalPurpose, setInitialSaveAction, showToast,
    } = props;
    const text = useLibraryText();
    return useCallback(async () => {
        try {
            const references = await sarakLoadReferenceThemes();
            const mode = draft.mode === 'light' ? 'light' : 'dark';
            const reference = references.find((theme) => theme.design.mode === mode) ?? references[0];
            if (!reference) throw new Error('Nenhum tema de referência está disponível.');

            setSourceThemeId(reference.id);
            setSourceThemeOverride(reference);
            setCurrentThemeName('');
            handleThemePreview(reference.design as Partial<SarakDesignState>, undefined, reference.id);
            setDraftThemeId(undefined);
            setModalPurpose('runtime');
            setInitialSaveAction('new');
            setIsSaveModalOpen(true);
        } catch (error) {
            console.error(error);
            showToast('warning', text('themeReferenceLoadFailed'));
        }
    }, [draft.mode, handleThemePreview, setDraftThemeId, setSourceThemeId, setSourceThemeOverride, setCurrentThemeName, setIsSaveModalOpen, setModalPurpose, setInitialSaveAction, showToast, text]);
};

const useThemeDeletionAction = (props: ThemeDeletionActionProps) => {
    const {
        sarak, sourceTheme, isImporterTheme, discardDraft, setDraftThemeId,
        setSourceThemeId, setSourceThemeOverride, setCurrentThemeName, showToast,
    } = props;
    const overlay = useOverlay();
    const text = useLibraryText();
    return useCallback(async () => {
        if (!sourceTheme || !isImporterTheme) return;
        const name = sourceTheme.name || sourceTheme.id;
        const confirmed = await overlay.confirm({
            title: text('themeDeleteConfirmTitle'),
            message: text('themeDeleteConfirmMessage', { name }),
            tone: 'danger',
        });
        if (!confirmed) return;

        const wasActive = sarak.resolvedThemeId === sourceTheme.id;
        try {
            await sarak.deleteTheme(sourceTheme.id);
            discardDraft();
            setDraftThemeId(undefined);
            setSourceThemeOverride(undefined);
            const nextThemeId = wasActive ? SARAK_DEFAULT_THEME_ID : sarak.resolvedThemeId;
            const nextTheme = sarak.allThemes?.find((theme) => theme.id === nextThemeId);
            const defaultThemeName = SARAK_THEME_CATALOG.find((theme) => theme.id === SARAK_DEFAULT_THEME_ID)?.name || '';
            setSourceThemeId(nextThemeId);
            setCurrentThemeName(nextTheme?.name || (wasActive ? defaultThemeName : ''));
            showToast('success', text(wasActive ? 'themeDeletedAndDefaultActivated' : 'themeDeleted'));
        } catch (error) {
            console.error(error);
            showToast('warning', text('themeDeleteFailed'));
        }
    }, [sourceTheme, isImporterTheme, overlay, text, sarak.deleteTheme, sarak.resolvedThemeId, sarak.allThemes, discardDraft, setDraftThemeId, setSourceThemeOverride, setSourceThemeId, setCurrentThemeName, showToast]);
};

const useThemePersistenceActions = (props: UseThemeCustomizationActionsProps, sourceState: ReturnType<typeof useSourceThemeState>) => {
    const { sarak, draft, handleApplyToSystem, setCurrentThemeName, setIsSaveModalOpen, setIsSaving, showToast, setDraftThemeId } = props;
    const counterpart = getThemeCounterpartForMode(sourceState.sourceTheme, draft.mode === 'light' ? 'light' : 'dark', draft);
    return useThemePersistenceHandlers({
        draft, sourceTheme: sourceState.sourceTheme, counterpart, existingThemeIds: sourceState.existingThemeIds,
        setCurrentThemeName, setIsSaveModalOpen, setIsSaving, showToast, handleApplyToSystem,
        saveTheme: sarak.saveTheme,
        setResolvedThemeId: (id) => sarak.setResolvedThemeId?.(id),
        applyFullConfigRaw: (design) => sarak.applyFullConfigRaw?.(design),
        persistDesign: async (design) => { await sarak.persistDesign?.(design); },
        onThemeSaved: (theme) => {
            sourceState.setSourceThemeId(theme.id);
            sourceState.setSourceThemeOverride(theme);
            setDraftThemeId?.(theme.id);
        },
    });
};

const useThemeDraftActions = (props: UseThemeCustomizationActionsProps, sourceState: ReturnType<typeof useSourceThemeState>) => {
    const { sarak, draft, handleThemePreview, discardDraft, setDraftThemeId, setCurrentThemeName } = props;
    const handleApplyFullTheme = useCallback((design: Partial<SarakDesignState> & { systemName?: string }, themeId?: string) => {
        const selectedTheme = themeId ? sarak.allThemes?.find((theme) => theme.id === themeId) : undefined;
        sourceState.setSourceThemeId(themeId ?? sarak.resolvedThemeId);
        sourceState.setSourceThemeOverride(selectedTheme);
        setCurrentThemeName(selectedTheme?.name || design.systemName || 'Novo Tema');
        handleThemePreview(design, undefined, themeId);
    }, [sarak.allThemes, sarak.resolvedThemeId, sourceState.setSourceThemeId, sourceState.setSourceThemeOverride, setCurrentThemeName, handleThemePreview]);
    const handleDiscardChanges = useCallback(() => {
        discardDraft();
        const activeTheme = sarak.allThemes?.find((theme) => theme.id === sarak.resolvedThemeId);
        setCurrentThemeName(activeTheme?.name || '');
        sourceState.setSourceThemeId(sarak.resolvedThemeId);
        sourceState.setSourceThemeOverride(undefined);
        setDraftThemeId?.(undefined);
    }, [discardDraft, sarak.allThemes, sarak.resolvedThemeId, setCurrentThemeName, sourceState.setSourceThemeId, sourceState.setSourceThemeOverride, setDraftThemeId]);
    return { handleApplyFullTheme, handleDiscardChanges };
};

export const useThemeCustomizationActions = (props: UseThemeCustomizationActionsProps) => {
    const { sarak, draft, handleThemePreview, setDraftThemeId, setCurrentThemeName, setIsSaveModalOpen, showToast } = props;
    const sourceState = useSourceThemeState(sarak, setCurrentThemeName);
    const modal = useSaveDialogActions(sourceState.isImporterTheme, setIsSaveModalOpen);
    const persistence = useThemePersistenceActions(props, sourceState);
    const draftActions = useThemeDraftActions(props, sourceState);
    const handleCreateTheme = useThemeCreationAction({
        draft, handleThemePreview, setDraftThemeId,
        setSourceThemeId: sourceState.setSourceThemeId,
        setSourceThemeOverride: sourceState.setSourceThemeOverride,
        setCurrentThemeName, setIsSaveModalOpen,
        setModalPurpose: modal.setModalPurpose,
        setInitialSaveAction: modal.setInitialSaveAction,
        showToast,
    });
    const handleDeleteTheme = useThemeDeletionAction({
        sarak, sourceTheme: sourceState.sourceTheme, isImporterTheme: sourceState.isImporterTheme,
        discardDraft: props.discardDraft, setDraftThemeId,
        setSourceThemeId: sourceState.setSourceThemeId,
        setSourceThemeOverride: sourceState.setSourceThemeOverride,
        setCurrentThemeName, showToast,
    });

    return {
        ...sourceState,
        ...modal,
        ...persistence,
        ...draftActions,
        canSaveToRuntime: typeof sarak.options?.theme?.onSave === 'function',
        handleCreateTheme,
        handleDeleteTheme,
    };
};
