import { useCallback, useEffect, useRef, type RefObject } from 'react';
import type { SarakDesignState } from '../../../../core/Provider/types';

/**
 * Quem recebe a espiada: os tokens a compor por cima do rascunho, ou `null` para voltar ao rascunho.
 * `screen` é a tela de amostra em que o componente aparece (spec 06 §6.4): a prévia vai até ela enquanto dura.
 */
export type PeekHandler = (tokens: Partial<SarakDesignState> | null, screen?: string) => void;

/** O que a opção compõe: já na mão, ainda por chegar (tema que carrega sob demanda) ou nada (a prévia fica como está). */
export type PeekTokens = Partial<SarakDesignState> | null | Promise<Partial<SarakDesignState> | null>;

/** Espera antes de compor a espiada: atravessar a lista com o mouse não faz a prévia piscar a cada opção. */
export const PEEK_DELAY_MS = 150;

/** Quanto esperar para o navegador atualizar o :hover de um elemento recém-montado. */
const HOVER_SETTLE_MS = 200;

/**
 * Rolar a lista leva opções para debaixo de um ponteiro parado, e o navegador dispara o `mouseenter` delas. Isso não é o
 * usuário escolhendo olhar a opção: enquanto a rolagem corre (e por esta janela depois do último `scroll`), o enter não espia.
 * Mexer o mouse depois dela espia, pelo `mousemove` — mas só o movimento de verdade: o navegador também dispara um `mousemove`
 * sintético quando a rolagem acaba (mesma posição do ponteiro), e esse não espia.
 */
export const SCROLL_QUIET_MS = 200;

let lastScrollAt = Number.NEGATIVE_INFINITY;
let pointerMoved = false;
let lastPointer: { x: number; y: number } | null = null;
let tracked = false;

const trackScrollAndPointer = (): void => {
    if (tracked || typeof window === 'undefined') return;
    tracked = true;
    window.addEventListener('scroll', () => { lastScrollAt = Date.now(); }, { capture: true, passive: true });
    window.addEventListener('mousemove', (event) => {
        pointerMoved = lastPointer === null || lastPointer.x !== event.clientX || lastPointer.y !== event.clientY;
        lastPointer = { x: event.clientX, y: event.clientY };
    }, { capture: true, passive: true });
};

const isScrolling = (): boolean => Date.now() - lastScrollAt < SCROLL_QUIET_MS;

/** Em aparelho sem ponteiro que paire (toque), o toque já escolhe: não há espiada. */
export const canPeekHere = (): boolean => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
    return !window.matchMedia('(hover: none)').matches;
};

/** O que o navegador entrega no `mouseenter`: a posição do ponteiro, para distinguir o enter do mouse que se mexeu do que a rolagem causou. */
interface PointerPosition {
    clientX: number;
    clientY: number;
}

interface PeekHandlers {
    onMouseEnter: (event?: PointerPosition) => void;
    onMouseMove: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
}

const isPromise = (value: PeekTokens): value is Promise<Partial<SarakDesignState> | null> =>
    value !== null && typeof (value as Promise<unknown>).then === 'function';

/**
 * Os eventos que fazem uma opção espiar. `getTokens` devolve o que compor, uma promessa do que vai chegar, ou `null`
 * quando não dá: a prévia fica como está. Sair antes de a promessa resolver não aplica nada. Nada aqui grava no rascunho.
 */
export const usePeekHandlers = (
    onPeek: PeekHandler | undefined,
    getTokens: () => PeekTokens,
    hoverTarget?: RefObject<HTMLElement | null>,
): PeekHandlers => {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const peeking = useRef(false);
    // Muda a cada início e a cada saída: a promessa que volta depois de a opção ter sido largada vê a época trocada.
    const epoch = useRef(0);
    const latest = useRef({ onPeek, getTokens });
    latest.current = { onPeek, getTokens };

    const clearTimer = useCallback(() => {
        if (timer.current !== null) clearTimeout(timer.current);
        timer.current = null;
    }, []);

    const stop = useCallback(() => {
        epoch.current += 1;
        clearTimer();
        if (!peeking.current) return;
        peeking.current = false;
        latest.current.onPeek?.(null);
    }, [clearTimer]);

    const show = useCallback((tokens: Partial<SarakDesignState> | null) => {
        if (!tokens) return;
        peeking.current = true;
        latest.current.onPeek?.(tokens);
    }, []);

    const start = useCallback(() => {
        if (!latest.current.onPeek || !canPeekHere()) return;
        clearTimer();
        epoch.current += 1;
        const mine = epoch.current;
        timer.current = setTimeout(() => {
            timer.current = null;
            const tokens = latest.current.getTokens();
            if (!isPromise(tokens)) { show(tokens); return; }
            void tokens.then((arrived) => { if (epoch.current === mine) show(arrived); }, () => undefined);
        }, PEEK_DELAY_MS);
    }, [clearTimer, show]);

    useEffect(() => stop, [stop]);
    useEffect(trackScrollAndPointer, []);

    const startByPointer = useCallback((event?: PointerPosition) => {
        if (isScrolling()) return;
        // Entrar sem o ponteiro ter saído do lugar é a rolagem pondo a opção sob ele (o navegador dispara o enter um pouco depois dela).
        if (event && lastPointer && lastPointer.x === event.clientX && lastPointer.y === event.clientY) return;
        start();
    }, [start]);

    // O ponteiro que se mexe sobre a opção espia se o enter foi engolido pela rolagem; com a espiada já em curso, nada a fazer.
    const moveOver = useCallback(() => {
        if (peeking.current || timer.current !== null || !pointerMoved || isScrolling()) return;
        start();
    }, [start]);

    // O elemento que já nasce sob o ponteiro (o cartão que trocou o pendente) espia sem esperar um novo movimento do mouse.
    // O navegador só atualiza o :hover de um nó novo depois do próximo quadro, por isso a conferência se repete uma vez.
    useEffect(() => {
        const check = (): void => {
            const node = hoverTarget?.current;
            if (peeking.current || timer.current !== null || isScrolling()) return;
            if (node && typeof node.matches === 'function' && node.matches(':hover')) start();
        };
        check();
        const later = hoverTarget ? setTimeout(check, HOVER_SETTLE_MS) : null;
        return () => { if (later !== null) clearTimeout(later); };
    }, [hoverTarget, start]);

    return { onMouseEnter: startByPointer, onMouseMove: moveOver, onMouseLeave: stop, onFocus: start, onBlur: stop };
};
