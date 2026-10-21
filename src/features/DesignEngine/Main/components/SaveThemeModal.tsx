import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileJson, Save, X } from 'lucide-react';
import { SarakInput } from '../../../../components/atomic/Inputs';
import { SarakRadio } from '../../../../components/atomic/Inputs/SarakRadio';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { useModalLayoutStyles } from '../../../../components/atomic/Modals/hooks/useModalLayoutStyles';
import type { SarakThemeSaveOperation } from '../../../../core/Provider/types';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';

type SaveAction = 'replace' | 'new' | 'duplicate';

interface SaveThemeModalProps {
    isOpen: boolean;
    purpose: 'runtime' | 'export';
    themeName?: string;
    canReplace?: boolean;
    initialAction?: SaveAction;
    onClose: () => void;
    onExport: (name: string) => void;
    onSave?: (name: string, operation: SarakThemeSaveOperation) => void;
    isSaving?: boolean;
}

const nameForAction = (action: SaveAction, themeName?: string): string => {
    if (action === 'replace') return themeName || 'Meu Novo Tema';
    if (action === 'duplicate') return themeName ? `${themeName} (cópia)` : '';
    return '';
};

export const SaveThemeModal: React.FC<SaveThemeModalProps> = ({
    isOpen,
    purpose,
    themeName,
    canReplace = false,
    initialAction = 'new',
    onClose,
    onExport,
    onSave,
    isSaving = false,
}) => {
    const { design, options } = useSarakUI();
    const text = useLibraryText();
    const modalLayout = useModalLayoutStyles(design);
    const canSaveToRuntime = typeof options?.theme?.onSave === 'function' && typeof onSave === 'function';
    const [action, setAction] = useState<SaveAction>('new');
    const [name, setName] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        const nextAction = canReplace && initialAction === 'replace'
            ? 'replace'
            : initialAction === 'duplicate'
                ? 'duplicate'
                : 'new';
        setAction(nextAction);
        setName(purpose === 'export' ? themeName || '' : nameForAction(nextAction, themeName));
    }, [isOpen, purpose, themeName, initialAction, canReplace]);

    if (!isOpen) return null;

    const selectAction = (nextAction: SaveAction) => {
        setAction(nextAction);
        setName(nameForAction(nextAction, themeName));
    };

    const submit = () => {
        if (!name.trim()) return;
        if (purpose === 'export') {
            onExport(name.trim());
            return;
        }
        onSave?.(name.trim(), action === 'replace' ? 'replace' : 'create');
    };

    const title = purpose === 'export' ? text('themeExportDialogTitle') : text('themeSaveDialogTitle');

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={!isSaving ? onClose : undefined}
                    className="absolute inset-0 bg-theme-body/60 backdrop-blur-sm"
                />

                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="save-theme-title"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    <div className={`px-6 py-4 border-b border-[var(--theme-border)] bg-theme-body/20 ${modalLayout.headerClass}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--theme-primary)]/10 rounded-lg">
                                {purpose === 'export'
                                    ? <FileJson size={18} className="text-[var(--theme-primary)]" />
                                    : <Save size={18} className="text-[var(--theme-primary)]" />}
                            </div>
                            <h2 id="save-theme-title" className="text-sm font-bold text-[var(--color-theme-title,#f2f6fb)]">{title}</h2>
                        </div>
                        <button
                            type="button"
                            aria-label={text('modalCloseAriaLabel')}
                            onClick={!isSaving ? onClose : undefined}
                            className={`p-1 text-[var(--theme-muted)] hover:text-theme-text transition-colors rounded-md hover:bg-theme-text/5 ${modalLayout.closeButtonClass}`}
                            disabled={isSaving}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="p-6 flex flex-col gap-6">
                        <p className="text-xs text-[var(--theme-muted)] leading-relaxed">
                            {purpose === 'export'
                                ? text('themeExportDescription')
                                : text('themeRuntimeSaveDescription')}
                        </p>

                        {purpose === 'runtime' && canSaveToRuntime && (
                            <fieldset className={`grid gap-2 ${canReplace ? 'grid-cols-3' : 'grid-cols-2'}`}>
                                <legend className="sr-only">{text('themeSaveActionGroupLabel')}</legend>
                                {canReplace && (
                                    <SarakRadio
                                        name="theme-save-action"
                                        value="replace"
                                        label={text('themeSaveAction')}
                                        checked={action === 'replace'}
                                        onChange={() => selectAction('replace')}
                                        className="rounded-lg border border-[var(--theme-border)] p-3"
                                    />
                                )}
                                <SarakRadio
                                    name="theme-save-action"
                                    value="new"
                                    label={text('themeSaveAsNewAction')}
                                    checked={action === 'new'}
                                    onChange={() => selectAction('new')}
                                    className="rounded-lg border border-[var(--theme-border)] p-3"
                                />
                                <SarakRadio
                                    name="theme-save-action"
                                    value="duplicate"
                                    label={text('themeDuplicateAction')}
                                    checked={action === 'duplicate'}
                                    onChange={() => selectAction('duplicate')}
                                    className="rounded-lg border border-[var(--theme-border)] p-3"
                                />
                            </fieldset>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="save-theme-name" className="text-[var(--sarak-type-scale2xs,10px)] font-bold text-[var(--color-theme-title,#f2f6fb)] uppercase tracking-widest">
                                {text('themeNameLabel')}
                            </label>
                            <SarakInput
                                id="save-theme-name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Ex: Sarak Sovereign Customizado"
                                disabled={isSaving}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className={`px-6 py-4 border-t border-[var(--theme-border)] bg-theme-body/20 ${modalLayout.footerClass}`}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-4 py-2 text-xs font-bold text-[var(--theme-muted)] hover:text-theme-text transition-colors"
                        >
                            {text('dialogCancel')}
                        </button>
                        <button
                            type="button"
                            onClick={submit}
                            disabled={isSaving || !name.trim() || (purpose === 'runtime' && !canSaveToRuntime)}
                            className="flex items-center gap-2 px-6 py-2 bg-[var(--theme-primary)] text-theme-on-primary rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {purpose === 'export' ? <FileJson size={16} /> : <Save size={16} />}
                            {isSaving
                                ? text('themeSavingState')
                                : purpose === 'export'
                                    ? text('themeExportJsonAction')
                                    : action === 'replace'
                                        ? text('themeSaveAction')
                                        : action === 'duplicate'
                                            ? text('themeDuplicateAction')
                                            : text('themeSaveAsNewAction')}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
