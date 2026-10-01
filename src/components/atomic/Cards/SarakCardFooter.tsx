import type { ReactElement, ReactNode } from 'react';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export interface SarakCardFooterProps {
    /** Conteúdo do rodapé; se omitido, o invólucro do rodapé permanece vazio. */
    children?: ReactNode;
    /** Classes adicionais; se omitidas, nenhuma classe extra é aplicada. */
    className?: string;
}

/** Peça de rodapé para compor um cartão Sarak. */
export const SarakCardFooter = ({ children, className }: SarakCardFooterProps): ReactElement => (
    <footer className={mergeSarakClasses(className)}>{children}</footer>
);
