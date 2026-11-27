import React, { useCallback, useState } from 'react';
import { Check } from 'lucide-react';
import { SarakButton } from '../../../../components/atomic/Buttons/SarakButton';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { SarakDirtyToken } from '../../hooks/useDesignDraft';
import { ThemeMoreActionsMenu, type ThemeMenuAction } from './ThemeMoreActionsMenu';
import { ThemePendingChanges } from './ThemePendingChanges';

interface ThemeActionBarProps {
    isDirty: boolean;
    dirtyTokenCount: number;
    /** O que o rascunho muda; o contador abre esta lista. */
    dirtyTokens: SarakDirtyToken[];
    onApply: () => void;
    onDiscard: () => void;
    canSaveToRuntime: boolean;
    canDeleteTheme: boolean;
    /** Tema só de leitura: o menu oferece Duplicar no lugar de Salvar. */
    isReadOnlyTheme?: boolean;
    onSave: () => void;
    onDuplicate?: () => void;
    onExport: () => void;
    onCreateTheme: () => void;
    onDeleteTheme: () => void;
    canUndoLastApply: boolean;
    onUndoLastApply: () => void;
}

/** Uma ação primária (Aplicar), Descartar e o resto no menu; Apagar tema, por último e em tom de perigo. */
export const ThemeActionBar: React.FC<ThemeActionBarProps> = ({
    isDirty,
    dirtyTokenCount,
    dirtyTokens,
    onApply,
    onDiscard,
    canSaveToRuntime,
    canDeleteTheme,
    isReadOnlyTheme = false,
    onSave,
    onDuplicate,
    onExport,
    onCreateTheme,
    onDeleteTheme,
    canUndoLastApply,
    onUndoLastApply
}) => {
    const text = useLibraryText();
    const [openLayer, setOpenLayer] = useState<'changes' | 'menu' | null>(null);
    const toggleChanges = useCallback(() => setOpenLayer((layer) => (layer === 'changes' ? null : 'changes')), []);
    const setMenuOpen = useCallback((open: boolean) => setOpenLayer(open ? 'menu' : null), []);
    const menuActions: ThemeMenuAction[] = [
        ...(canSaveToRuntime ? [
            isReadOnlyTheme
                ? { id: 'duplicate', label: text('themeDuplicateAction'), onSelect: onDuplicate ?? onSave, testId: 'sarak-panel-duplicate-theme' }
                : { id: 'save', label: text('themeSaveDialogTitle'), onSelect: onSave, testId: 'sarak-panel-save-theme' },
            { id: 'create', label: text('themeCreateAction'), onSelect: onCreateTheme, testId: 'sarak-panel-new-theme' },
        ] : []),
        { id: 'export', label: text('themeExportJsonAction'), onSelect: onExport, testId: 'sarak-panel-export-json' },
        ...(canUndoLastApply ? [{ id: 'undo', label: text('themeUndoLastApplyAction'), onSelect: onUndoLastApply }] : []),
        ...(canDeleteTheme ? [{ id: 'delete', label: text('themeDeleteAction'), onSelect: onDeleteTheme, danger: true, testId: 'sarak-panel-delete-theme' }] : []),
    ];

    return (
        <div role="group" aria-label="Ações do tema" className="shrink-0 border-t border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
            <div className="flex flex-col gap-2">
                <ThemePendingChanges tokens={dirtyTokens} isOpen={openLayer === 'changes'} onToggle={toggleChanges} />
                <div className="flex flex-wrap items-center gap-2">
                    <SarakButton
                        onClick={onApply}
                        data-testid="sarak-panel-apply"
                        disabled={dirtyTokenCount === 0}
                        variant="primary"
                        size="md"
                        leftIcon={<Check size={14} />}
                        aria-describedby={dirtyTokenCount > 0 ? 'theme-pending-changes-count' : undefined}
                        className="min-w-fit flex-1 whitespace-nowrap disabled:opacity-80"
                    >
                        {text('themeApplyAction')}
                    </SarakButton>
                    <SarakButton onClick={onDiscard} disabled={!isDirty} variant="secondary" size="md" className="min-w-fit whitespace-nowrap disabled:opacity-80">
                        {text('settingsDiscard')}
                    </SarakButton>
                    <ThemeMoreActionsMenu actions={menuActions} isOpen={openLayer === 'menu'} onOpenChange={setMenuOpen} />
                </div>
            </div>
        </div>
    );
};
