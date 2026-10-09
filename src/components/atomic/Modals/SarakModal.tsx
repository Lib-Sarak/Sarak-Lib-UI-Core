import React, { useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakButton } from '../Buttons/SarakButton';
import { SarakIconButton } from '../Buttons/SarakIconButton';
import { SarakIcon } from '../Icon/SarakIcon';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { useModalBehavior } from './hooks/useModalBehavior';
import { useModalLayoutStyles } from './hooks/useModalLayoutStyles';

export type SarakModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface SarakModalProps {
    /** Controla se o modal está visível. */
    isOpen: boolean;
    /** Chamado ao fechar pelo botão, tecla Escape ou clique no overlay habilitado. */
    onClose: () => void;
    /** Conteúdo do cabeçalho e nome acessível do diálogo. */
    title?: React.ReactNode;
    /** Conteúdo principal do modal; fica em segundo plano quando `steps` é informado. */
    children?: React.ReactNode;
    /** Conteúdo do rodapé; substituído pela navegação quando `steps` está informado. */
    footer?: React.ReactNode;
    /**
     * Sub-wizard multi-step (Spec 13, Regra 2): cada passo é renderizado isolado dentro
     * do overlay, com navegação "Voltar/Avançar" contida no rodapé. Tem precedência
     * sobre `children`. No último passo, "Avançar" é substituído por `onComplete`.
     */
    steps?: React.ReactNode[];
    /** Chamado ao avançar além do último passo (conclusão do wizard). */
    onComplete?: () => void;
    /** Se true, o clique no overlay (fundo) não fecha o modal. */
    disableOverlayClick?: boolean;
    /** Se true, o botão de fechar não é renderizado. */
    hideCloseButton?: boolean;
    /** Classe CSS customizada para o contêiner do modal. */
    className?: string;
    /** Largura máxima controlada por tokens; sem a prop, mantém os 32rem atuais. */
    size?: SarakModalSize;
}

interface ModalWizardFooterProps {
    steps: React.ReactNode[];
    stepIndex: number;
    lastStep: number;
    onBack: () => void;
    onAdvance: () => void;
}

interface ModalHeaderProps {
    title?: React.ReactNode;
    titleId: string;
    hideCloseButton: boolean;
    onClose: () => void;
    headerClass: string;
    closeButtonClass: string;
}

interface ModalPanelProps {
    size: SarakModalSize;
    maxWidth?: string;
    className?: string;
    dialogRef: React.MutableRefObject<HTMLDivElement | null>;
    handleTrap: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    title?: React.ReactNode;
    titleId: string;
    children?: React.ReactNode;
    header: React.ReactNode;
    footer: React.ReactNode;
}

const MODAL_WIDTH_VARIABLES: Readonly<Record<SarakModalSize, string>> = {
    sm: 'var(--sarak-modal-width-sm)',
    md: 'var(--sarak-modal-width-md)',
    lg: 'var(--sarak-modal-width-lg)',
    xl: 'var(--sarak-modal-width-xl)',
    full: 'var(--sarak-modal-width-full)',
};
const MODAL_WIDTH_FALLBACK_CLASSES: Readonly<Record<SarakModalSize, string>> = {
    sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-3xl', full: 'max-w-7xl',
};
const MODAL_ENTER_SCALE = 0.95;
const MODAL_ENTER_OFFSET_Y = 20;
const MODAL_TRANSITION_DAMPING = 25;
const MODAL_TRANSITION_STIFFNESS = 300;
const WIZARD_BUTTON_STYLE: React.CSSProperties = {
    paddingInline: 'var(--sarak-layout-gap-sm, 8px)',
    paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.375)',
};

const ModalWizardFooter = ({
    steps, stepIndex, lastStep, onBack, onAdvance,
}: ModalWizardFooterProps): React.ReactElement => {
    const text = useLibraryText();
    return (
        <div className="flex w-full items-center justify-between">
            <SarakButton type="button" variant="ghost" onClick={onBack} disabled={stepIndex === 0} className="text-sm normal-case font-normal tracking-normal rounded-md disabled:opacity-50" style={WIZARD_BUTTON_STYLE}>
                {text('modalWizardBack')}
            </SarakButton>
            <span className="text-xs text-[var(--theme-muted)]">{stepIndex + 1} / {steps.length}</span>
            <SarakButton type="button" variant="ghost" onClick={onAdvance} className="text-sm normal-case font-normal tracking-normal rounded-md" style={WIZARD_BUTTON_STYLE}>
                {stepIndex === lastStep ? text('modalWizardFinish') : text('modalWizardNext')}
            </SarakButton>
        </div>
    );
};

const ModalHeader = ({
    title, titleId, hideCloseButton, onClose, headerClass, closeButtonClass,
}: ModalHeaderProps): React.ReactElement | null => {
    const text = useLibraryText();
    if (!title && hideCloseButton) return null;
    return (
        <div className={clsx('border-b border-[var(--theme-border)] bg-black/10', headerClass)} style={{ paddingInline: 'var(--sarak-layout-gap-lg, 24px)', paddingBlock: 'var(--sarak-layout-gap-md, 16px)' }}>
            {title && <h2 id={titleId} className="text-lg font-bold text-[var(--color-theme-title,#ffffff)]">{title}</h2>}
            {!hideCloseButton && (
                <SarakIconButton onClick={onClose} variant="ghost" size="sm" className={clsx('text-[var(--theme-muted)] hover:text-white rounded-md hover:bg-white/10', closeButtonClass)} style={{ padding: 'calc(var(--sarak-layout-gap-md, 16px) * 0.375)' }} aria-label={text('modalCloseAriaLabel')} icon={<SarakIcon name="X" size={18} />} />
            )}
        </div>
    );
};

const ModalPanel = ({
    size, maxWidth, className, dialogRef, handleTrap, title, titleId, children, header, footer,
}: ModalPanelProps): React.ReactElement => {
    const text = useLibraryText();
    return (
        <motion.div
            ref={dialogRef}
            tabIndex={-1}
            onKeyDown={handleTrap}
            initial={{ opacity: 0, scale: MODAL_ENTER_SCALE, y: MODAL_ENTER_OFFSET_Y }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: MODAL_ENTER_SCALE, y: MODAL_ENTER_OFFSET_Y }}
            transition={{ type: 'spring', damping: MODAL_TRANSITION_DAMPING, stiffness: MODAL_TRANSITION_STIFFNESS }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={!title ? text('dialogDefaultAriaLabel') : undefined}
            data-size={size}
            className={mergeSarakClasses('relative w-full bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-[var(--radius-modal)] shadow-2xl overflow-hidden flex', MODAL_WIDTH_FALLBACK_CLASSES[size], className)}
            style={{ flexDirection: 'column', maxWidth }}
        >
            {header}
            <div className="flex overflow-y-auto max-h-[70vh]" style={{ flexDirection: 'column', padding: 'var(--sarak-layout-gap-lg, 24px)' }}>{children}</div>
            {footer}
        </motion.div>
    );
};

const ModalFooter = ({ className, children }: { className: string; children: React.ReactNode }): React.ReactElement => (
    <div className={clsx('border-t border-[var(--theme-border)] bg-black/10', className)} style={{ paddingInline: 'var(--sarak-layout-gap-lg, 24px)', paddingBlock: 'var(--sarak-layout-gap-md, 16px)' }}>
        {children}
    </div>
);

const ModalFrame = ({ disableOverlayClick, onClose, children }: {
    disableOverlayClick: boolean;
    onClose: () => void;
    children: React.ReactNode;
}): React.ReactElement => (
    <AnimatePresence>
        <div className="fixed inset-0 z-[var(--z-index-modal)] flex items-center justify-center" style={{ padding: 'var(--sarak-layout-gap-md, 16px)' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={disableOverlayClick ? undefined : onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
            {children}
        </div>
    </AnimatePresence>
);

export const SarakModal = (props: SarakModalProps): React.ReactElement | null => {
    const { isOpen, onClose, title, children, footer, steps, onComplete, disableOverlayClick = false, hideCloseButton = false, className, size = 'lg' } = props;
    const design = useSarakUIOptional()?.design;
    const layout = useModalLayoutStyles(design ?? {});
    const behavior = useModalBehavior(isOpen, onClose);
    const titleId = useId();
    const lastStep = steps?.length ? steps.length - 1 : 0;
    if (!isOpen) return null;

    const handleAdvance = (): void => {
        if (behavior.stepIndex >= lastStep) { onComplete?.(); return; }
        behavior.setStepIndex((index) => Math.min(index + 1, lastStep));
    };
    const handleBack = (): void => behavior.setStepIndex((index) => Math.max(index - 1, 0));
    const body = steps?.length ? steps[behavior.stepIndex] : children;
    const footerContent = steps?.length
        ? <ModalWizardFooter steps={steps} stepIndex={behavior.stepIndex} lastStep={lastStep} onBack={handleBack} onAdvance={handleAdvance} />
        : footer;
    const modalHeader = <ModalHeader title={title} titleId={titleId} hideCloseButton={hideCloseButton} onClose={onClose} headerClass={layout.headerClass} closeButtonClass={layout.closeButtonClass} />;
    const modalFooter = footerContent ? <ModalFooter className={layout.footerClass}>{footerContent}</ModalFooter> : null;

    return (
        <ModalFrame disableOverlayClick={disableOverlayClick} onClose={onClose}>
            <ModalPanel size={size} maxWidth={design ? MODAL_WIDTH_VARIABLES[size] : undefined} className={className} dialogRef={behavior.dialogRef} handleTrap={behavior.handleTrap} title={title} titleId={titleId} header={modalHeader} footer={modalFooter}>
                {body}
            </ModalPanel>
        </ModalFrame>
    );
};
