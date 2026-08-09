import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useModalLayoutStyles } from './hooks/useModalLayoutStyles';
import { useModalBehavior } from './hooks/useModalBehavior';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakIconButton } from '../Buttons/SarakIconButton';

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
    const wizardBtnStyle = { paddingInline: 'var(--sarak-layout-gap-sm, 8px)', paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.375)' };
    const wizardFooter = hasSteps ? (
        <div className="flex items-center justify-between w-full">
            <SarakButton
                type="button"
                variant="ghost"
                onClick={goBack}
                disabled={stepIndex === 0}
                className="text-sm normal-case font-normal tracking-normal rounded-md disabled:opacity-50"
                style={wizardBtnStyle}
            >
                Voltar
            </SarakButton>
            <span className="text-xs text-[var(--theme-muted)]">
                {stepIndex + 1} / {steps.length}
            </span>
            <SarakButton type="button" variant="ghost" onClick={advance} className="text-sm normal-case font-normal tracking-normal rounded-md" style={wizardBtnStyle}>
                {stepIndex === lastStep ? 'Concluir' : 'Avançar'}
            </SarakButton>
        </div>
    ) : (
        footer
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[var(--z-index-modal)] flex items-center justify-center" style={{ padding: 'var(--sarak-layout-gap-md, 16px)' }}>
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
                        "relative w-full max-w-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-[var(--radius-modal)] shadow-2xl overflow-hidden flex",
                        className
                    )}
                    style={{ flexDirection: 'column' }}
                >
                    {/* Header */}
                    {(title || !hideCloseButton) && (
                        <div
                            className={clsx("border-b border-[var(--theme-border)] bg-black/10", headerClass)}
                            style={{ paddingInline: 'var(--sarak-layout-gap-lg, 24px)', paddingBlock: 'var(--sarak-layout-gap-md, 16px)' }}
                        >
                            {title && (
                                <h2 className="text-lg font-bold text-[var(--color-theme-title,#ffffff)]">
                                    {title}
                                </h2>
                            )}

                            {!hideCloseButton && (
                                <SarakIconButton
                                    onClick={onClose}
                                    variant="ghost"
                                    size="sm"
                                    className={clsx(
                                        "text-[var(--theme-muted)] hover:text-white rounded-md hover:bg-white/10",
                                        closeButtonClass
                                    )}
                                    style={{ padding: 'calc(var(--sarak-layout-gap-md, 16px) * 0.375)' }}
                                    aria-label="Fechar modal"
                                    icon={<X size={18} />}
                                />
                            )}
                        </div>
                    )}

                    {/* Body */}
                    <div className="flex overflow-y-auto max-h-[70vh]" style={{ flexDirection: 'column', padding: 'var(--sarak-layout-gap-lg, 24px)' }}>
                        {body}
                    </div>

                    {/* Footer */}
                    {wizardFooter && (
                        <div
                            className={clsx("border-t border-[var(--theme-border)] bg-black/10", footerClass)}
                            style={{ paddingInline: 'var(--sarak-layout-gap-lg, 24px)', paddingBlock: 'var(--sarak-layout-gap-md, 16px)' }}
                        >
                            {wizardFooter}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
