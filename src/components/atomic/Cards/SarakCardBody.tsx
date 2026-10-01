import type { ReactElement, ReactNode } from 'react';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export interface SarakCardBodyProps {
    /** Conteúdo principal; se omitido, a área do corpo permanece vazia. */
    children?: ReactNode;
    /** Classes adicionais; se omitidas, nenhuma classe extra é aplicada. */
    className?: string;
}

/** Peça de corpo para compor um cartão Sarak. */
export const SarakCardBody = ({ children, className }: SarakCardBodyProps): ReactElement => (
    <div className={mergeSarakClasses(className)}>{children}</div>
);
