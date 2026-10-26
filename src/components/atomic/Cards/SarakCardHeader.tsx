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
    'py-[var(--sarak-card-header-padding,12px)]',
    'shadow-[inset_0_calc(var(--sarak-card-border-width,1px)*-1)_0_var(--sarak-card-header-border,transparent)]',
    '[&_h1]:!text-[length:min(var(--sarak-card-title-font-size),var(--sarak-h2-size))]',
    '[&_h2]:!text-[length:min(var(--sarak-card-title-font-size),var(--sarak-h2-size))]',
    '[&_h3]:!text-[length:min(var(--sarak-card-title-font-size),var(--sarak-h2-size))]',
    '[&_h4]:!text-[length:min(var(--sarak-card-title-font-size),var(--sarak-h2-size))]',
    '[&_h5]:!text-[length:min(var(--sarak-card-title-font-size),var(--sarak-h2-size))]',
    '[&_h6]:!text-[length:min(var(--sarak-card-title-font-size),var(--sarak-h2-size))]',
].join(' ');

/** Peça de cabeçalho para compor um cartão Sarak. */
export const SarakCardHeader = ({ children, className }: SarakCardHeaderProps): ReactElement => (
    <header className={mergeSarakClasses(HEADER_TOKEN_CLASSES, className)}>{children}</header>
);
