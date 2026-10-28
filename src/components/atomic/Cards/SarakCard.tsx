import type { ReactNode } from 'react';
import { mergeSarakClasses } from '../hooks/mergeSarakClasses';
import { SarakCardBody } from './SarakCardBody';
import { SarakCardFooter } from './SarakCardFooter';
import { SarakCardHeader } from './SarakCardHeader';
import { compositeCardLayoutClassName } from './compositeCardLayoutClassName';

export type SarakCardDensity = 'sm' | 'md' | 'lg';

export interface SarakCardProps {
    /** Conteúdo composto do cartão; se omitido, a moldura temática permanece vazia. */
    children?: ReactNode;
    /** Classes adicionais; se omitidas, o cartão mantém largura total e sua moldura temática. Classes utilitárias conflitantes substituem o padrão; a classe `sarak-card` é preservada para aplicar os tokens do tema. */
    className?: string;
    /** Marca o cartão inteiro como alvo do ponteiro: só ele sobe, cresce ou brilha no hover (`cardHoverStyle`). Omitida, o cartão é contêiner e não se move. */
    interactive?: boolean;
    /** Espaçamento interno: `sm` e `lg` leem `--sarak-card-padding-sm|lg` (derivados do `md` do tema, sobrescrevíveis em CSS). Omitida, `md`, como sempre foi. */
    density?: SarakCardDensity;
}

/** Cartão genérico com moldura temática e peças opcionais de composição. */
const SarakCardRoot = ({ children, className, interactive = false, density = 'md' }: SarakCardProps): React.JSX.Element => {
    // Ao contrário dos cartões de domínio, que leem os tokens de direção e alinhamento por
    // `useCardLayoutStyles(design)`, o cartão composto não os lê: suas peças (cabeçalho, corpo
    // e rodapé) são explícitas, então a coluna é fixa e só o intervalo vem do token.
    const layoutClassName = compositeCardLayoutClassName();
    const cardClassName = mergeSarakClasses('sarak-card w-full', layoutClassName, className);

    return (
        <div
            className={cardClassName}
            data-sx-card-interactive={interactive ? 'true' : undefined}
            data-sx-card-density={density === 'md' ? undefined : density}
        >
            {children}
        </div>
    );
};

/** Cartão genérico que expõe cabeçalho, corpo e rodapé por notação de ponto. */
export const SarakCard = Object.assign(SarakCardRoot, {
    Header: SarakCardHeader,
    Body: SarakCardBody,
    Footer: SarakCardFooter,
});
