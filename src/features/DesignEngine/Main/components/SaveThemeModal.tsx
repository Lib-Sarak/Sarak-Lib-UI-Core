import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Copy, X, Database } from 'lucide-react';
import { SarakInput } from '../../../../components/atomic/Inputs';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';
import { useModalLayoutStyles } from '../../../../components/atomic/Modals/hooks/useModalLayoutStyles';

export type SaveThemeAction = 
    | { type: 'CREATE_NEW'; name: string }
    | { type: 'OVERWRITE_EXISTING' }
    | { type: 'CANCEL' };

interface SaveThemeModalProps {
    isOpen: boolean;
    origin: 'script' | 'database';
    themeName?: string;
    onClose: () => void;
    onAction: (action: SaveThemeAction) => void;
    isSaving?: boolean;
}

export const SaveThemeModal: React.FC<SaveThemeModalProps> = ({
    isOpen,
    origin,
    themeName,
    onClose,
    onAction,
    isSaving = false
}) => {
    const { design } = useSarakUI();
    const modalLayout = useModalLayoutStyles(design);

    const [newName, setNewName] = useState('');

    // Pre-fill a base name when copying
    React.useEffect(() => {
        if (!isOpen) return;

        if (themeName) {
            setNewName(`${themeName} (Custom)`);
            return;
        }
        
        setNewName('Meu Novo Tema');
    }, [isOpen, themeName]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={!isSaving ? onClose : undefined}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className={`px-6 py-4 border-b border-[var(--theme-border)] bg-black/20 ${modalLayout.headerClass}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--theme-primary)]/10 rounded-lg">
                                <Database size={18} className="text-[var(--theme-primary)]" />
                            </div>
                            <h2 className="text-sm font-bold text-[var(--theme-text)]">Persistência de Tema</h2>
                        </div>
                        <button 
                            onClick={!isSaving ? onClose : undefined}
                            className={`p-1 text-[var(--theme-muted)] hover:text-white transition-colors rounded-md hover:bg-white/5 ${modalLayout.closeButtonClass}`}
                            disabled={isSaving}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 flex flex-col gap-6">
                        {origin === 'script' ? (
                            <div className="flex flex-col gap-2">
                                <p className="text-xs text-[var(--theme-muted)] leading-relaxed">
                                    Você está modificando um tema padrão da biblioteca (Read-Only). 
                                    Precisamos salvar suas alterações como um <strong>Novo Tema</strong> no seu banco de dados.
                                </p>
                                <div className="mt-2 flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-[var(--theme-text)] uppercase tracking-widest">Nome do Novo Tema</label>
                                    <SarakInput 
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="Ex: Sarak Sovereign Customizado"
                                        disabled={isSaving}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <p className="text-xs text-[var(--theme-muted)] leading-relaxed">
                                    Você modificou o tema <strong>{themeName || 'Atual'}</strong> que já existe no banco de dados. 
                                    Deseja atualizar este tema para todos os usuários ou salvar uma cópia?
                                </p>
                                
                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={() => onAction({ type: 'OVERWRITE_EXISTING' })}
                                        disabled={isSaving}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black/20 border border-[var(--theme-border)] hover:border-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/5 transition-all text-left group"
                                    >
                                        <Save size={18} className="text-[var(--theme-muted)] group-hover:text-[var(--theme-primary)] transition-colors" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[var(--theme-text)]">Atualizar Tema Atual</span>
                                            <span className="text-[10px] text-[var(--theme-muted)]">Sobrescreve o payload no banco de dados</span>
                                        </div>
                                    </button>

                                    <div className="relative py-2 flex items-center justify-center">
                                        <div className="absolute inset-x-0 h-px bg-[var(--theme-border)]" />
                                        <span className="relative bg-[var(--theme-surface)] px-2 text-[10px] font-bold text-[var(--theme-muted)] uppercase">OU</span>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <SarakInput 
                                                    value={newName}
                                                    onChange={(e) => setNewName(e.target.value)}
                                                    placeholder="Nome para a cópia"
                                                    disabled={isSaving}
                                                />
                                            </div>
                                            <button 
                                                onClick={() => onAction({ type: 'CREATE_NEW', name: newName })}
                                                disabled={isSaving || !newName.trim()}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--theme-primary)] text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                                            >
                                                <Copy size={16} />
                                                Salvar Cópia
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer for Script origin */}
                    {origin === 'script' && (
                        <div className={`px-6 py-4 border-t border-[var(--theme-border)] bg-black/20 ${modalLayout.footerClass}`}>
                            <button 
                                onClick={() => onAction({ type: 'CANCEL' })}
                                disabled={isSaving}
                                className="px-4 py-2 text-xs font-bold text-[var(--theme-muted)] hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => onAction({ type: 'CREATE_NEW', name: newName })}
                                disabled={isSaving || !newName.trim()}
                                className="flex items-center gap-2 px-6 py-2 bg-[var(--theme-primary)] text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isSaving ? 'Salvando...' : 'Salvar Novo Tema'}
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
