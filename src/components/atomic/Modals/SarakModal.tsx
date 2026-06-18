import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useModalLayoutStyles } from './hooks/useModalLayoutStyles';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SarakModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
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
    disableOverlayClick = false,
    hideCloseButton = false,
    className,
}) => {
    const { design } = useSarakUI();
    const { headerClass, footerClass, closeButtonClass } = useModalLayoutStyles(design);

    // Bloqueia rolagem do body quando aberto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

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
                        {children}
                    </div>

                    {/* Footer */}
                    {footer && (
                        <div className={clsx("px-6 py-4 border-t border-[var(--theme-border)] bg-black/10", footerClass)}>
                            {footer}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
