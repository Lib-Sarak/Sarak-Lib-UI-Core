import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileJson, Save, X } from 'lucide-react';
import { SarakInput } from '../../../../components/atomic/Inputs';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { useModalLayoutStyles } from '../../../../components/atomic/Modals/hooks/useModalLayoutStyles';

interface SaveThemeModalProps {
    isOpen: boolean;
    themeName?: string;
    onClose: () => void;
    onExport: (name: string) => void;
    /**
     * Ação "Salvar" (ADR-011) — só chamada porque o botão só existe quando
     * `options.theme.onSave` está configurado. Sem a porta, este prop é ignorado.
     */
    onSave?: (name: string) => void;
    isSaving?: boolean;
}

/**
 * Modal de tema do painel (ADR-011 substitui o recorte técnico do ADR-010):
 * "Exportar JSON" é o caminho do DESENVOLVEDOR — sempre disponível, gera o JSON
 * do tema atual para colar num arquivo do repo e passar via `customThemes`. Nada
 * é enviado a nenhum servidor. "Salvar" é o caminho do USUÁRIO FINAL — só aparece
 * quando `options.theme.onSave` está configurado; sem a porta, este modal é
 * idêntico ao de antes do ADR-011.
 */
export const SaveThemeModal: React.FC<SaveThemeModalProps> = ({
    isOpen,
    themeName,
    onClose,
    onExport,
    onSave,
    isSaving = false
}) => {
    const { design, options } = useSarakUI();
    const modalLayout = useModalLayoutStyles(design);
    const canSaveToRuntime = typeof options?.theme?.onSave === 'function';

    const [name, setName] = useState('');

    React.useEffect(() => {
        if (!isOpen) return;
        setName(themeName || 'Meu Novo Tema');
    }, [isOpen, themeName]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={!isSaving ? onClose : undefined}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    <div className={`px-6 py-4 border-b border-[var(--theme-border)] bg-black/20 ${modalLayout.headerClass}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--theme-primary)]/10 rounded-lg">
                                <FileJson size={18} className="text-[var(--theme-primary)]" />
                            </div>
                            <h2 className="text-sm font-bold text-[var(--color-theme-title,#ffffff)]">Exportar Tema (JSON)</h2>
                        </div>
                        <button
                            onClick={!isSaving ? onClose : undefined}
                            className={`p-1 text-[var(--theme-muted)] hover:text-white transition-colors rounded-md hover:bg-white/5 ${modalLayout.closeButtonClass}`}
                            disabled={isSaving}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="p-6 flex flex-col gap-6">
                        <p className="text-xs text-[var(--theme-muted)] leading-relaxed">
                            A Sarak UI não tem backend próprio: "salvar" um tema é baixar um arquivo
                            JSON com o design atual. Cole-o num arquivo do seu repositório e passe
                            via <code>customThemes</code> no <code>SarakUIProvider</code>.
                        </p>
                        {canSaveToRuntime && (
                            <p className="text-xs text-[var(--theme-muted)] leading-relaxed">
                                "Salvar" entrega este tema ao sistema que você está usando — ele decide
                                onde guardar e devolve o tema na próxima vez que você abrir.
                            </p>
                        )}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[var(--sarak-type-scale2xs,10px)] font-bold text-[var(--color-theme-title,#ffffff)] uppercase tracking-widest">Nome do Tema</label>
                            <SarakInput
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Sarak Sovereign Customizado"
                                disabled={isSaving}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className={`px-6 py-4 border-t border-[var(--theme-border)] bg-black/20 ${modalLayout.footerClass}`}>
                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-4 py-2 text-xs font-bold text-[var(--theme-muted)] hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        {canSaveToRuntime && (
                            <button
                                onClick={() => onSave?.(name)}
                                disabled={isSaving || !name.trim()}
                                className="flex items-center gap-2 px-6 py-2 bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)] text-[var(--theme-primary)] rounded-lg font-bold text-sm hover:bg-[var(--theme-primary)]/20 transition-colors disabled:opacity-50"
                            >
                                <Save size={16} />
                                {isSaving ? 'Salvando...' : 'Salvar'}
                            </button>
                        )}
                        <button
                            onClick={() => onExport(name)}
                            disabled={isSaving || !name.trim()}
                            className="flex items-center gap-2 px-6 py-2 bg-[var(--theme-primary)] text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            <FileJson size={16} />
                            {isSaving ? 'Exportando...' : 'Exportar JSON'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
