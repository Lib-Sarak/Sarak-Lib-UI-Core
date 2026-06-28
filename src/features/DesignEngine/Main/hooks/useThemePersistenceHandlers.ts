import { useCallback } from 'react';
import { useThemeActions } from './useThemeActions';
import { SaveThemeAction } from '../components/SaveThemeModal';

import type { SarakDesignState } from '../../../../core/Provider/types';

export interface UseThemePersistenceHandlersProps {
    uiBaseUrl: string;
    apiToken?: string | null;
    draft: SarakDesignState;
    currentThemeId: string | null;
    setCurrentThemeId: (id: string | null) => void;
    currentThemeOrigin: 'script' | 'database';
    setCurrentThemeOrigin: (origin: 'script' | 'database') => void;
    currentThemeName: string;
    setCurrentThemeName: (name: string) => void;
    setIsSaveModalOpen: (open: boolean) => void;
    setIsSaving: (saving: boolean) => void;
    pendingApply: boolean;
    setPendingApply: (pending: boolean) => void;
    showToast: (type: 'success' | 'warning' | 'error', message: string) => void;
    handleApplyToSystem: () => void;
    isDirty: boolean;
}

export function useThemePersistenceHandlers(props: UseThemePersistenceHandlersProps) {
    const {
        uiBaseUrl, apiToken,
        draft,
        currentThemeId, setCurrentThemeId,
        currentThemeOrigin, setCurrentThemeOrigin,
        currentThemeName, setCurrentThemeName,
        setIsSaveModalOpen, setIsSaving,
        pendingApply, setPendingApply,
        showToast, handleApplyToSystem, isDirty
    } = props;

    const { saveNewThemeAPI, updateThemeAPI, activateThemeAPI } = useThemeActions(uiBaseUrl, apiToken || undefined);

    const handleSaveTheme = useCallback(async (action: SaveThemeAction) => {
        if (action.type === 'CANCEL') {
            setIsSaveModalOpen(false);
            setPendingApply(false);
            return;
        }

        setIsSaving(true);
        try {
            if (action.type === 'CREATE_NEW') {
                const newTheme = await saveNewThemeAPI(draft, action.name, pendingApply);
                setCurrentThemeId(newTheme.id);
                setCurrentThemeOrigin('database');
                setCurrentThemeName(newTheme.name);
                showToast('success', `Tema "${newTheme.name}" salvo no banco com sucesso!`);
            }
            if (action.type === 'OVERWRITE_EXISTING') {
                if (currentThemeId) {
                    await updateThemeAPI(currentThemeId, draft, currentThemeName, pendingApply);
                    showToast('success', `Tema atualizado no banco com sucesso!`);
                }
            }

            if (pendingApply) {
                handleApplyToSystem();
            }

            setIsSaveModalOpen(false);
        } catch (error) {
            console.error(error);
            showToast('warning', 'Erro ao salvar o tema.');
        } finally {
            setIsSaving(false);
            setPendingApply(false);
        }
    }, [draft, currentThemeId, currentThemeName, pendingApply, saveNewThemeAPI, updateThemeAPI, handleApplyToSystem, showToast, setCurrentThemeId, setCurrentThemeOrigin, setCurrentThemeName, setIsSaveModalOpen, setIsSaving, setPendingApply]);

    const handleApplyGlobalChanges = useCallback(async () => {
        if (!currentThemeId || currentThemeOrigin === 'script') {
            setPendingApply(true);
            setIsSaveModalOpen(true);
            return;
        }

        if (isDirty) {
            setPendingApply(true);
            setIsSaveModalOpen(true);
            return;
        }

        setIsSaving(true);
        try {
            await activateThemeAPI(currentThemeId);
            handleApplyToSystem();
            showToast('success', `Tema ativado com sucesso!`);
        } catch (e) {
            console.error(e);
            showToast('warning', 'Erro ao ativar tema.');
        } finally {
            setIsSaving(false);
        }
    }, [currentThemeId, currentThemeOrigin, isDirty, activateThemeAPI, handleApplyToSystem, showToast, setPendingApply, setIsSaveModalOpen, setIsSaving]);

    return { handleSaveTheme, handleApplyGlobalChanges };
}
