import { useCallback } from 'react';
import { buildThemeExportPayload, downloadThemeJson } from '../utils/exportTheme';

import type { SarakDesignState } from '../../../../core/Provider/types';

export interface UseThemePersistenceHandlersProps {
    draft: SarakDesignState;
    setCurrentThemeName: (name: string) => void;
    setIsSaveModalOpen: (open: boolean) => void;
    setIsSaving: (saving: boolean) => void;
    // O toast do painel tem DOIS estados, não três: `useDesignDraft.ts:53` guarda
    // `'success' | 'warning'` e é o único produtor. Nenhum chamador passa `'error'`
    // — a falha de exportação (`:40`) usa `'warning'`. Declarar um terceiro valor que
    // ninguém emite nem renderiza era o `TS2322` de `ThemeCustomizationTab.tsx:86`.
    showToast: (type: 'success' | 'warning', message: string) => void;
    handleApplyToSystem: () => void;
}

/**
 * Handlers de "persistência" do Design Engine (Spec 44 — sem backend próprio):
 * "salvar um tema" É exportar um JSON (`buildThemeExportPayload`/`downloadThemeJson`)
 * que o dev cola num arquivo do próprio repo e passa via `customThemes`; "aplicar"
 * só comita o rascunho no design ativo (localStorage via `useDesignManager`) —
 * nenhuma das duas ações faz uma chamada de rede.
 */
export function useThemePersistenceHandlers(props: UseThemePersistenceHandlersProps) {
    const {
        draft,
        setCurrentThemeName,
        setIsSaveModalOpen, setIsSaving,
        showToast, handleApplyToSystem
    } = props;

    const handleExportTheme = useCallback((name: string) => {
        setIsSaving(true);
        try {
            const payload = buildThemeExportPayload(draft, name);
            downloadThemeJson(payload);
            setCurrentThemeName(payload.name);
            showToast('success', `Tema "${payload.name}" exportado — cole o JSON em \`customThemes\` no seu código.`);
            setIsSaveModalOpen(false);
        } catch (error) {
            console.error(error);
            showToast('warning', 'Erro ao exportar o tema.');
        } finally {
            setIsSaving(false);
        }
    }, [draft, showToast, setCurrentThemeName, setIsSaveModalOpen, setIsSaving]);

    const handleApplyGlobalChanges = useCallback(() => {
        handleApplyToSystem();
        showToast('success', 'Alterações aplicadas ao sistema.');
    }, [handleApplyToSystem, showToast]);

    return { handleExportTheme, handleApplyGlobalChanges };
}
