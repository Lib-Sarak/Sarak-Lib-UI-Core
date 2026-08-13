import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SarakPortalScope } from '../../../core/Provider/components/SarakPortalScope';
import { Maximize2, Minimize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSarakUI } from '../../../core/Provider/SarakUIProvider';
import { useCardLayoutStyles } from './hooks/useCardLayoutStyles';
import { useExpandableCard } from './hooks/useExpandableCard';
import { useStructuralStyles } from '../hooks/useStructuralStyles';
import { SarakIconButton } from '../Buttons/SarakIconButton';

export interface ExpandableCardProps {
    title: string;
    iconContent?: React.ReactNode;
    helpButton?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
    baseHeight?: number;
}

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
    title,
    iconContent,
    helpButton,
    children,
    className = "",
    contentClassName = "",
    baseHeight = 300
}) => {
    const globalUI = useSarakUI();
    const design = globalUI.design;
    const layout = useCardLayoutStyles(design);
    const { isExpanded, setIsExpanded, mounted } = useExpandableCard();
    const { getResponsiveSpacingStyles } = useStructuralStyles();
    const bodyPadding = getResponsiveSpacingStyles('expandableCardBody');
    const headerMargin = getResponsiveSpacingStyles('expandableCardHeader');

    // Dynamic height based on global font scale factor, ensuring it scales up
    const dynamicStyle = {
        minHeight: isExpanded ? '100%' : `calc(${baseHeight}px * var(--font-size-factor, 1))`
    };

    return (
        <>
            <div className={`${layout.containerClass} sarak-card bg-[var(--color-theme-card,#1e293b)] border border-[var(--border-color,#334155)]-border rounded-sarak shadow-lg relative group transition-sarak ${isExpanded ? 'opacity-0 pointer-events-none' : ''} ${className}`}>
                <div className={layout.contentClass}>
                <div className={layout.headerClass}>
                    <h3 className="text-xs font-black text-theme-main uppercase tracking-widest flex items-center" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                        {iconContent}
                        <span className="truncate">{title}</span>
                    </h3>
                    <div className="flex items-center shrink-0" style={{ gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
                        {helpButton}
                        <SarakIconButton
                            onClick={() => setIsExpanded(true)}
                            variant="ghost"
                            size="xs"
                            className="text-theme-muted hover:text-theme-primary hover:bg-theme-primary/10 rounded-lg"
                            style={{ padding: 'calc(var(--sarak-layout-gap-md, 16px) * 0.375)' }}
                            title="Expandir Tela Cheia"
                            icon={<Maximize2 className="w-4 h-4" />}
                        />
                    </div>
                </div>
                <div className={`w-full flex-1 relative p-[var(--sarak-card-padding-md,24px)] ${contentClassName}`} style={dynamicStyle}>
                    {children}
                </div>
                </div>
            </div>

            {mounted && createPortal(
                <SarakPortalScope>
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            animate={{ opacity: 1, backdropFilter: 'blur(var(--sarak-glass-blur, 12px))' }}
                            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            transition={{ duration: 0.3 }}
                            // plan-41: `@container` plantado aqui, não na raiz do card — o
                            // conteúdo com `@min-[…]` (`bodyPadding`/`headerMargin`) vive
                            // dentro do `createPortal` (renderiza em `document.body`, fora
                            // da subárvore da raiz do card). Sem ancestral com
                            // `container-type` DENTRO do portal, a classe nunca casava.
                            className="@container fixed inset-0 z-[99999] bg-theme-body flex"
                            style={{ flexDirection: 'column' }}
                        >
                            <motion.div
                                initial={{ scale: 0.95, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.95, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className={`flex-1 w-full h-full mx-auto ${bodyPadding.className} relative flex overflow-hidden`}
                                style={{ flexDirection: 'column' }}
                            >
                                <div
                                    className={`flex items-center justify-between shrink-0 flex-wrap ${headerMargin.className}`}
                                    style={{ gap: 'var(--sarak-layout-gap-md, 16px)' }}
                                >
                                    <h3 className="text-lg sm:text-2xl font-black text-theme-title uppercase tracking-widest flex items-center" style={{ gap: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)' }}>
                                        {iconContent}
                                        {title}
                                    </h3>
                                    <div className="flex items-center flex-wrap justify-end" style={{ gap: 'var(--sarak-layout-gap-md, 16px)' }}>
                                        {helpButton && <div className="flex items-center">{helpButton}</div>}
                                        <SarakIconButton
                                            onClick={() => setIsExpanded(false)}
                                            variant="secondary"
                                            size="lg"
                                            className="bg-[var(--color-theme-card,#1e293b)] hover:bg-theme-primary/20 text-theme-primary border border-[var(--border-color,#334155)]-border rounded-sarak shadow-lg shrink-0"
                                            style={{ padding: 'calc(var(--sarak-layout-gap-md, 16px) * 0.75)', marginLeft: 'var(--sarak-layout-gap-sm, 8px)' }}
                                            title="Fechar"
                                            icon={<X className="w-5 h-5 sm:w-6 sm:h-6" />}
                                        />
                                    </div>
                                </div>
                                <div
                                    className={`sarak-card flex-1 w-full relative flex min-h-0 bg-[var(--color-theme-card,#1e293b)] rounded-sarak border border-[var(--border-color,#334155)]-border shadow-lg ${contentClassName} p-[var(--sarak-card-padding-md,24px)]`}
                                    style={{ flexDirection: 'column' }}
                                >
                                    {children}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
                </SarakPortalScope>,
                document.body
            )}
        </>
    );
};

