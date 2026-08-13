import { useCallback } from 'react';
import { buildThemeExportPayload, downloadThemeJson } from '../utils/exportTheme';

import type { SarakDesignState, ThemeEntry } from '../../../../core/Provider/types';

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
    /** Porta ÚNICA de "salvar em runtime" (ADR-011) — `sarak.saveTheme`. */
    saveTheme: (theme: ThemeEntry) => Promise<void>;
}

/**
 * Handlers de "persistência" do Design Engine: "exportar um tema" gera um JSON
 * (`buildThemeExportPayload`/`downloadThemeJson`) que o dev cola num arquivo do
 * próprio repo e passa via `customThemes` — é o caminho do DESENVOLVEDOR, sem
 * chamada de rede. "Salvar um tema" (ADR-011) é o caminho do USUÁRIO FINAL: monta
 * o mesmo payload completo e entrega a `sarak.saveTheme`, que funde na sessão e
 * chama `options.theme.onSave`, se configurado. "Aplicar" só comita o rascunho no
 * design ativo (localStorage via `useDesignManager`).
 */
export function useThemePersistenceHandlers(props: UseThemePersistenceHandlersProps) {
    const {
        draft,
        setCurrentThemeName,
        setIsSaveModalOpen, setIsSaving,
        showToast, handleApplyToSystem,
        saveTheme
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

    const handleSaveTheme = useCallback(async (name: string) => {
        setIsSaving(true);
        try {
            const payload = buildThemeExportPayload(draft, name);
            await saveTheme({ id: payload.id, name: payload.name, design: payload.design as unknown as Record<string, unknown> });
            setCurrentThemeName(payload.name);
            showToast('success', `Tema "${payload.name}" salvo — disponível nesta sessão.`);
            setIsSaveModalOpen(false);
        } catch (error) {
            console.error(error);
            showToast('warning', 'Erro ao salvar o tema — ele continua disponível nesta sessão.');
        } finally {
            setIsSaving(false);
        }
    }, [draft, saveTheme, showToast, setCurrentThemeName, setIsSaveModalOpen, setIsSaving]);

    const handleApplyGlobalChanges = useCallback(() => {
        handleApplyToSystem();
        showToast('success', 'Alterações aplicadas ao sistema.');
    }, [handleApplyToSystem, showToast]);

    return { handleExportTheme, handleSaveTheme, handleApplyGlobalChanges };
}
