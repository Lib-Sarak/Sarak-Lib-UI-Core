import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/** O menor slot em que o campo de busca ainda é útil (10rem em px), a mesma medida que o campo usa para virar ícone. */
const MIN_USEFUL_FIELD_PX = 160;

export interface SearchSlotCollapse {
    /** Verdadeiro quando o campo não cabe: o slot desenha só o ícone e deixa de guardar a largura do campo. */
    collapsed: boolean;
    /** Ref de callback da barra (`header`): a barra é quem se mede, o slot não. */
    barRef: (element: HTMLElement | null) => void;
}

const readSearchSlotWidth = (bar: HTMLElement): number | null => {
    const slot = bar.querySelector<HTMLElement>('[data-sarak-slot="search"]');
    const field = slot?.firstElementChild;
    // Campo fora de cena (abaixo de `md` o campo nem é desenhado): não há o que recolher.
    if (!slot || !field || getComputedStyle(field).display === 'none') return null;
    return slot.getBoundingClientRect().width;
};

/**
 * Assinatura do que molda o espaço da busca e NÃO depende de ela ser campo ou ícone: a largura da barra, a do grupo final (rígido,
 * nunca cede à busca), o tamanho da fonte raiz e a chave do chamador (tema, itens). Marca, busca e lista ficam de fora porque
 * mudam de tamanho justamente quando a busca troca de estado.
 */
const readSignature = (bar: HTMLElement, resetKey: string): string | null => {
    const barWidth = bar.getBoundingClientRect().width;
    if (barWidth === 0) return null;
    const endGroupWidth = bar.querySelector<HTMLElement>('[data-sarak-chrome-end-group]')?.getBoundingClientRect().width ?? 0;
    const rootFontSize = getComputedStyle(document.documentElement).fontSize;
    return [barWidth, endGroupWidth, rootFontSize, resetKey].join('|');
};

/**
 * Decide, medindo a barra, se a busca em barra do topo vira ícone. Recolhida, guarda a assinatura do que mediu; enquanto a assinatura é a
 * mesma, nada se mede de novo (campo e ícone não se alternam, porque a troca não muda a assinatura). Quando ela muda, por qualquer causa
 * (barra mais larga, outro tema, outra fonte, outra lista), o campo volta a ser tentado uma vez e só recolhe de novo se ainda não couber.
 */
export const useSearchSlotCollapse = (enabled: boolean, resetKey: string): SearchSlotCollapse => {
    const [bar, setBar] = useState<HTMLElement | null>(null);
    const [collapsedAt, setCollapsedAt] = useState<string | null>(null);
    const barRef = useCallback((element: HTMLElement | null) => setBar(element), []);

    const evaluate = useCallback(() => {
        if (!enabled || !bar) return;
        const signature = readSignature(bar, resetKey);
        if (signature === null) return;
        if (collapsedAt !== null) {
            if (collapsedAt !== signature) setCollapsedAt(null);
            return;
        }
        const slotWidth = readSearchSlotWidth(bar);
        if (slotWidth !== null && slotWidth < MIN_USEFUL_FIELD_PX) setCollapsedAt(signature);
    }, [enabled, bar, resetKey, collapsedAt]);

    const evaluateRef = useRef(evaluate);
    evaluateRef.current = evaluate;

    // A cada desenho: tema, fonte, idioma e lista mudam o desenho da barra, e o redesenho é o aviso.
    useLayoutEffect(() => {
        evaluate();
    });

    useEffect(() => {
        if (!enabled || !bar || typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(() => evaluateRef.current());
        observer.observe(bar);
        const watched = bar.querySelector('[data-sarak-chrome-end-group], [data-sarak-slot="search"]');
        if (watched) observer.observe(watched);
        return () => observer.disconnect();
    }, [enabled, bar]);

    return { collapsed: enabled && collapsedAt !== null, barRef };
};
