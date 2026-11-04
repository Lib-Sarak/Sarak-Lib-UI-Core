import React, { useCallback, useRef, useState } from 'react';
import { useOnFirstVisible } from '../hooks/useOnFirstVisible';

interface LazyWhenVisibleProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Só desenha o conteúdo quando o espaço entra na área visível, e o mantém depois. Numa lista longa de opções
 * com componentes reais, é isto que faz abrir a aba custar o que cabe na tela e não a lista inteira.
 * O espaço reservado (a altura vem de `className`) já existe antes, então a rolagem não pula.
 */
export const LazyWhenVisible: React.FC<LazyWhenVisibleProps> = ({ children, className }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [seen, setSeen] = useState(false);
    const show = useCallback(() => setSeen(true), []);
    useOnFirstVisible(ref, show);
    return <div ref={ref} className={className} data-sx-lazy={seen ? 'shown' : 'pending'}>{seen ? children : null}</div>;
};
