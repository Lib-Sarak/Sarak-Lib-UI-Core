/**
 * useOverlayLayer
 *
 * Pilha única das camadas abertas (Modal e Drawer): a camada que abre fica acima da última
 * aberta, seja qual for o tipo de cada uma, sem número fixo por tipo. Quem abre uma camada
 * só continua em `depth` 0 e no z-index de sempre.
 *
 * A pilha mora no módulo (não no Provider): `SarakModal` e `SarakDrawer` funcionam sem
 * Provider e podem ser montados em árvores distintas, como o drawer do consumidor e a
 * confirmação do `SarakOverlayProvider`.
 */

import { useLayoutEffect, useRef, useSyncExternalStore } from 'react';

/** Folga entre duas camadas: cada uma ainda guarda um z-index interno acima do próprio fundo. */
export const OVERLAY_LAYER_STEP = 10;

export interface OverlayLayer {
    /** Quantas camadas abertas há abaixo desta. */
    depth: number;
    /** Só a camada do topo responde a Escape e ao Tab. */
    isTop: boolean;
}

// Símbolo e não `useId`: este hook roda em todo modal e gaveta, e um `useId` a mais desloca os ids dos snapshots.
let stack: readonly symbol[] = [];
const listeners = new Set<() => void>();

/** A rolagem da página fica travada enquanto houver camada aberta e só volta quando a última fecha. */
const syncScrollLock = (): void => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = stack.length > 0 ? 'hidden' : '';
};

const publish = (next: readonly symbol[]): void => {
    stack = next;
    syncScrollLock();
    listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

const getStack = (): readonly symbol[] => stack;

export const useOverlayLayer = (isOpen: boolean): OverlayLayer => {
    const id = useRef(Symbol('overlay-layer')).current;
    const openStack = useSyncExternalStore(subscribe, getStack, getStack);
    // Na saída animada a camada já deixou a pilha, mas ainda está na tela: segura o último degrau.
    const lastDepth = useRef(0);

    useLayoutEffect(() => {
        if (!isOpen) return undefined;
        publish([...stack, id]);
        return () => publish(stack.filter((entry) => entry !== id));
    }, [isOpen, id]);

    const index = openStack.indexOf(id);
    const registered = index !== -1;
    // Aberta e ainda sem registro (primeiro render): entra por cima de quem já está aberto.
    const depth = registered ? index : openStack.length;
    if (registered || isOpen) lastDepth.current = depth;

    return {
        depth: lastDepth.current,
        isTop: !registered || index === openStack.length - 1,
    };
};

/** Esvazia a pilha entre testes. */
export const resetOverlayLayersForTests = (): void => publish([]);
