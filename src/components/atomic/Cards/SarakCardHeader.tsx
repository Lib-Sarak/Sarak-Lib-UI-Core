import type { ReactElement, ReactNode } from 'react';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';

export interface SarakCardHeaderProps {
    /** Conteúdo do cabeçalho; se omitido, o invólucro do cabeçalho permanece vazio. */
    children?: ReactNode;
    /** Classes adicionais; se omitidas, nenhuma classe extra é aplicada. */
    className?: string;
}

/**
 * Aparência padrão do cabeçalho, dos tokens `cardHeaderBg`, `cardHeaderPadding` e
 * `cardHeaderBorder`. A linha divisória é sombra interna: não ocupa espaço, então o
 * padrão (transparente) deixa o cabeçalho idêntico ao de antes.
 */
const HEADER_TOKEN_CLASSES = [
    'bg-[var(--sarak-card-header-bg,transparent)]',
    'py-[var(--sarak-card-header-padding,0px)]',
    'shadow-[inset_0_calc(var(--sarak-card-border-width,1px)*-1)_0_var(--sarak-card-header-border,transparent)]',
].join(' ');

/** Peça de cabeçalho para compor um cartão Sarak. */
export const SarakCardHeader = ({ children, className }: SarakCardHeaderProps): ReactElement => (
    <header className={mergeSarakClasses(HEADER_TOKEN_CLASSES, className)}>{children}</header>
);
