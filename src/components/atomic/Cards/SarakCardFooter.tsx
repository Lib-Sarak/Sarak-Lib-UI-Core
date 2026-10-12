import type { ReactElement, ReactNode } from 'react';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export interface SarakCardFooterProps {
    /** Conteúdo do rodapé; se omitido, o invólucro do rodapé permanece vazio. */
    children?: ReactNode;
    /** Classes adicionais; se omitidas, nenhuma classe extra é aplicada. */
    className?: string;
}

/**
 * Aparência padrão do rodapé, dos tokens `cardFooterBg` e `cardFooterBorder`. A linha
 * divisória do topo é sombra interna: não ocupa espaço, então o padrão (transparente)
 * deixa o rodapé idêntico ao de antes.
 */
const FOOTER_TOKEN_CLASSES = [
    'bg-[var(--sarak-card-footer-bg,transparent)]',
    'shadow-[inset_0_var(--sarak-card-border-width,1px)_0_var(--sarak-card-footer-border,transparent)]',
].join(' ');

/** Peça de rodapé para compor um cartão Sarak. */
export const SarakCardFooter = ({ children, className }: SarakCardFooterProps): ReactElement => (
    <footer className={mergeSarakClasses(FOOTER_TOKEN_CLASSES, className)}>{children}</footer>
);
