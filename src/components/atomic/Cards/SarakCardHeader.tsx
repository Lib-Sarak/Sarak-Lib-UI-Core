import type { ReactElement, ReactNode } from 'react';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export interface SarakCardHeaderProps {
    /** Conteúdo do cabeçalho; se omitido, o invólucro do cabeçalho permanece vazio. */
    children?: ReactNode;
    /** Classes adicionais; se omitidas, nenhuma classe extra é aplicada. */
    className?: string;
}

/** Peça de cabeçalho para compor um cartão Sarak. */
export const SarakCardHeader = ({ children, className }: SarakCardHeaderProps): ReactElement => (
    <header className={mergeSarakClasses(className)}>{children}</header>
);
