import { useDeferredValue, useEffect, useRef, useState, type RefObject } from 'react';

/** Folga além da área visível: a amostra se atualiza um pouco antes de entrar na tela ao rolar. */
const VISIBILITY_MARGIN = '25%';

/**
 * O valor como estava da última vez que o elemento esteve na área visível. Fora dela, o valor fica parado e quem o usa
 * não refaz nada; ao voltar, recebe o valor atual. Sem `IntersectionObserver` (ambiente que não o tem), devolve sempre
 * o valor atual: perder a atualização seria pior que fazê-la.
 *
 * Na área visível o valor novo chega adiado (`useDeferredValue`): a escolha pinta primeiro o que responde a ela (a
 * prévia e o botão Aplicar), e as amostras se refazem logo depois, num render que o React interrompe se vier outra escolha.
 */
export const useValueWhileVisible = <T,>(ref: RefObject<HTMLElement | null>, value: T): T => {
    const [visible, setVisible] = useState(true);
    const held = useRef(value);
    if (visible) held.current = value;

    useEffect(() => {
        const element = ref.current;
        if (!element || typeof IntersectionObserver === 'undefined') return undefined;
        const observer = new IntersectionObserver(
            (entries) => setVisible(entries.some((entry) => entry.isIntersecting)),
            { rootMargin: VISIBILITY_MARGIN },
        );
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref]);

    return useDeferredValue(held.current);
};
