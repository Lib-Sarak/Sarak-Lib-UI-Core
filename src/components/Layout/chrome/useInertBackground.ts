import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Enquanto a gaveta modal está aberta, tudo o que não é ela fica inerte (fora do `Tab` e da árvore de acessibilidade), menos o scrim
 * que a fecha: é o irmão imediatamente anterior à gaveta. O `inert` ainda não está nos tipos do React 18, por isso o atributo é
 * escrito no nó. Entra depois do foco preso (que guarda o elemento focado antes de o `inert` tirar o foco dele) e sai ANTES de o foco
 * ser devolvido ao gatilho: um elemento inerte não recebe foco, então a saída roda no ciclo de layout, que desfaz antes dos efeitos.
 */
export const useInertBackground = (isOpen: boolean, drawerId: string): void => {
    const inerted = useRef<Element[]>([]);

    useLayoutEffect(() => () => {
        inerted.current.forEach((node) => node.removeAttribute('inert'));
        inerted.current = [];
    }, [isOpen, drawerId]);

    useEffect(() => {
        if (!isOpen) return;
        const drawer = document.getElementById(drawerId);
        const siblings = drawer?.parentElement ? Array.from(drawer.parentElement.children) : [];
        inerted.current = siblings.filter((node) => node !== drawer && node !== drawer?.previousElementSibling && !node.hasAttribute('inert'));
        inerted.current.forEach((node) => node.setAttribute('inert', ''));
    }, [isOpen, drawerId]);
};
