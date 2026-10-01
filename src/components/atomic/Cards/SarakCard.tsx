import type { ReactNode } from 'react';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { SarakCardBody } from './SarakCardBody';
import { SarakCardFooter } from './SarakCardFooter';
import { SarakCardHeader } from './SarakCardHeader';
import { useSarakCardLayoutStyles } from './hooks/useSarakCardLayoutStyles';

export interface SarakCardProps {
    /** Conteúdo composto do cartão; se omitido, a moldura temática permanece vazia. */
    children?: ReactNode;
    /** Classes adicionais; se omitidas, o cartão mantém largura total e sua moldura temática. Classes utilitárias conflitantes substituem o padrão; a classe `sarak-card` é preservada para aplicar os tokens do tema. */
    className?: string;
}

/** Cartão genérico com moldura temática e peças opcionais de composição. */
const SarakCardRoot = ({ children, className }: SarakCardProps): React.JSX.Element => {
    const layoutClassName = useSarakCardLayoutStyles();
    const cardClassName = mergeSarakClasses('sarak-card w-full', layoutClassName, className);

    return <div className={cardClassName}>{children}</div>;
};

/** Cartão genérico que expõe cabeçalho, corpo e rodapé por notação de ponto. */
export const SarakCard = Object.assign(SarakCardRoot, {
    Header: SarakCardHeader,
    Body: SarakCardBody,
    Footer: SarakCardFooter,
});
