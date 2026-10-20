import { useCallback } from 'react';
import { buildThemeExportPayload, createUniqueThemeId, downloadThemeJson, slugifyThemeId } from '../utils/exportTheme';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';

import type { SarakDesignState, SarakThemeEntry, SarakThemeSaveOperation } from '../../../../core/Provider/types';

export interface UseThemePersistenceHandlersProps {
    draft: SarakDesignState;
    sourceTheme?: SarakThemeEntry;
    counterpart?: Partial<SarakDesignState>;
    existingThemeIds: ReadonlySet<string>;
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
    saveTheme: (theme: SarakThemeEntry, operation?: SarakThemeSaveOperation) => Promise<void>;
    setResolvedThemeId: (id: string | undefined) => void;
    applyFullConfigRaw: (design: SarakDesignState) => void;
    persistDesign: (design: SarakDesignState) => Promise<void>;
    onThemeSaved?: (theme: SarakThemeEntry) => void;
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
    const text = useLibraryText();
    const {
        draft,
        sourceTheme,
        counterpart,
        existingThemeIds,
        setCurrentThemeName,
        setIsSaveModalOpen, setIsSaving,
        showToast, handleApplyToSystem,
        saveTheme,
        setResolvedThemeId,
        applyFullConfigRaw,
        persistDesign,
        onThemeSaved,
    } = props;

    const handleExportTheme = useCallback((name: string) => {
        setIsSaving(true);
        try {
            const payload = buildThemeExportPayload(draft, name, counterpart);
            downloadThemeJson(payload);
            if (payload.requiresFonts) {
                showToast('warning', `Tema "${payload.name}" exportado — usa fontes deste host (${payload.requiresFonts.join(', ')}): quem o importar precisa registrá-las em \`options.fonts.custom\`.`);
            } else {
                showToast('success', `Tema "${payload.name}" exportado — cole o JSON em \`customThemes\` no seu código.`);
            }
            setIsSaveModalOpen(false);
        } catch (error) {
            console.error(error);
            showToast('warning', 'Erro ao exportar o tema.');
        } finally {
            setIsSaving(false);
        }
    }, [draft, counterpart, showToast, setIsSaveModalOpen, setIsSaving]);

    const handleSaveTheme = useCallback(async (name: string, operation: SarakThemeSaveOperation) => {
        const normalizedName = name.trim();
        if (!normalizedName) return;

        if (operation === 'replace' && !sourceTheme) {
            showToast('warning', text('themeSaveImporterSourceRequired'));
            return;
        }
        if (operation === 'create' && sourceTheme?.name?.trim().toLowerCase() === normalizedName.toLowerCase()) {
            showToast('warning', text('themeSaveDifferentNameRequired'));
            return;
        }

        setIsSaving(true);
        try {
            const payload = buildThemeExportPayload(draft, normalizedName, counterpart);
            const id = operation === 'replace'
                ? sourceTheme!.id
                : createUniqueThemeId(payload.name, existingThemeIds);
            const savedTheme: SarakThemeEntry = {
                id,
                name: payload.name,
                design: payload.design as unknown as Record<string, unknown>,
                ...(payload.contraparte ? { contraparte: payload.contraparte } : {}),
            };
            await saveTheme(savedTheme, operation);
            setResolvedThemeId(id);
            applyFullConfigRaw(payload.design);
            await persistDesign(payload.design);
            onThemeSaved?.(savedTheme);
            setCurrentThemeName(payload.name);
            const collisionMessage = operation === 'create' && id !== slugifyThemeId(payload.name)
                ? ` ${text('themeIdAdjusted', { id })}`
                : '';
            showToast('success', `${text('themeSavedActivated', { name: payload.name })}${collisionMessage}`);
            setIsSaveModalOpen(false);
        } catch (error) {
            console.error(error);
            showToast('warning', text('themeSaveFailed'));
        } finally {
            setIsSaving(false);
        }
    }, [draft, sourceTheme, counterpart, existingThemeIds, saveTheme, setResolvedThemeId, applyFullConfigRaw, persistDesign, onThemeSaved, showToast, setCurrentThemeName, setIsSaveModalOpen, setIsSaving, text]);

    const handleApplyGlobalChanges = useCallback(() => {
        handleApplyToSystem();
        showToast('success', 'Alterações aplicadas ao sistema.');
    }, [handleApplyToSystem, showToast]);

    return { handleExportTheme, handleSaveTheme, handleApplyGlobalChanges };
}
