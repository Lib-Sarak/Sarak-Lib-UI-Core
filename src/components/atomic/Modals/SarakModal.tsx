import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useModalLayoutStyles } from './hooks/useModalLayoutStyles';
import { useModalBehavior } from './hooks/useModalBehavior';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SarakModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    /**
     * Sub-wizard multi-step (Spec 13, Regra 2): cada passo é renderizado isolado dentro
     * do overlay, com navegação "Voltar/Avançar" contida no rodapé. Tem precedência
     * sobre `children`. No último passo, "Avançar" é substituído por `onComplete`.
     */
    steps?: React.ReactNode[];
    /** Chamado ao avançar além do último passo (conclusão do wizard). */
    onComplete?: () => void;
    /** Se true, o clique no overlay (fundo) não fecha o modal */
    disableOverlayClick?: boolean;
    /** Se true, o botão de fechar não é renderizado */
    hideCloseButton?: boolean;
    /** Classe CSS customizada para o contêiner do modal */
    className?: string;
}

export const SarakModal: React.FC<SarakModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    steps,
    onComplete,
    disableOverlayClick = false,
    hideCloseButton = false,
    className,
}) => {
    const { design } = useSarakUI();
    const { headerClass, footerClass, closeButtonClass } = useModalLayoutStyles(design);
    const { dialogRef, stepIndex, setStepIndex, handleTrap } = useModalBehavior(isOpen, onClose);

    const hasSteps = Array.isArray(steps) && steps.length > 0;
    const lastStep = hasSteps ? steps.length - 1 : 0;

    if (!isOpen) return null;

    const advance = () => {
        if (stepIndex >= lastStep) {
            onComplete?.();
            return;
        }
        setStepIndex((i) => Math.min(i + 1, lastStep));
    };
    const goBack = () => setStepIndex((i) => Math.max(i - 1, 0));

    const body = hasSteps ? steps[stepIndex] : children;
    const wizardFooter = hasSteps ? (
        <div className="flex items-center justify-between w-full">
            <button
                type="button"
                onClick={goBack}
                disabled={stepIndex === 0}
                className="px-3 py-1.5 text-sm rounded-md disabled:opacity-50"
            >
                Voltar
            </button>
            <span className="text-xs text-[var(--theme-muted)]">
                {stepIndex + 1} / {steps.length}
            </span>
            <button type="button" onClick={advance} className="px-3 py-1.5 text-sm rounded-md">
                {stepIndex === lastStep ? 'Concluir' : 'Avançar'}
            </button>
        </div>
    ) : (
        footer
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[var(--z-index-modal)] flex items-center justify-center p-4">
                {/* Overlay Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={disableOverlayClick ? undefined : onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    aria-hidden="true"
                />

                {/* Modal Container */}
                <motion.div
                    ref={dialogRef}
                    tabIndex={-1}
                    onKeyDown={handleTrap}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    role="dialog"
                    aria-modal="true"
                    className={twMerge(
                        "relative w-full max-w-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-[var(--radius-modal)] shadow-2xl overflow-hidden flex flex-col",
                        className
                    )}
                >
                    {/* Header */}
                    {(title || !hideCloseButton) && (
                        <div className={clsx("px-6 py-4 border-b border-[var(--theme-border)] bg-black/10", headerClass)}>
                            {title && (
                                <h2 className="text-lg font-bold text-[var(--theme-text)]">
                                    {title}
                                </h2>
                            )}
                            
                            {!hideCloseButton && (
                                <button 
                                    onClick={onClose}
                                    className={clsx(
                                        "p-1.5 text-[var(--theme-muted)] hover:text-white transition-colors rounded-md hover:bg-white/10",
                                        closeButtonClass
                                    )}
                                    aria-label="Fechar modal"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Body */}
                    <div className="p-6 flex flex-col overflow-y-auto max-h-[70vh]">
                        {body}
                    </div>

                    {/* Footer */}
                    {wizardFooter && (
                        <div className={clsx("px-6 py-4 border-t border-[var(--theme-border)] bg-black/10", footerClass)}>
                            {wizardFooter}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
