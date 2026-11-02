import { useCallback, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';

/** Piso e teto de reserva, só para fora do Provider: com o tema, valem `sidebarMinWidth` e `sidebarMaxWidth`. */
const FALLBACK_BOUNDS = { min: 150, max: 450 } as const;
const KEY_STEP = 16;
const KEY_STEP_LARGE = 64;

export interface SidebarResize {
    /** Largura escolhida pelo usuário nesta sessão; `null` = a do tema. */
    width: number | null;
    /** Faixa e valor atuais, em px, para `aria-valuemin/max/now` da alça. */
    bounds: { min: number; max: number; now: number };
    handlers: {
        onPointerDown: (event: PointerEvent<HTMLElement>) => void;
        onPointerMove: (event: PointerEvent<HTMLElement>) => void;
        onPointerUp: (event: PointerEvent<HTMLElement>) => void;
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
        onDoubleClick: () => void;
    };
}

const readPixels = (element: Element, variable: string, fallback: number): number => {
    const value = parseFloat(getComputedStyle(element).getPropertyValue(variable));
    return Number.isFinite(value) && value > 0 ? value : fallback;
};

/**
 * Largura da lateral ajustada pelo usuário: arrasto, teclado (setas; Shift anda mais; Home/End vão aos extremos) e
 * duplo clique para voltar ao padrão. O valor é PREFERÊNCIA do usuário (`sidebarWidth`), nunca do tema, e fica entre
 * `sidebarMinWidth` e `sidebarMaxWidth`. Em arrasto a largura acompanha o ponteiro sem passar pelo Provider; o que
 * se grava é o valor final.
 */
export const useSidebarResize = (
    asideRef: RefObject<HTMLElement>,
    side: 'left' | 'right',
): SidebarResize => {
    const sarak = useSarakUIOptional();
    const [width, setWidth] = useState<number | null>(null);
    const [bounds, setBounds] = useState<SidebarResize['bounds']>({ ...FALLBACK_BOUNDS, now: FALLBACK_BOUNDS.min });
    const drag = useRef<{ startX: number; startWidth: number } | null>(null);

    const measure = useCallback((): SidebarResize['bounds'] => {
        const aside = asideRef.current;
        if (!aside) return { ...FALLBACK_BOUNDS, now: FALLBACK_BOUNDS.min };
        return {
            min: readPixels(aside, '--sidebar-min-width', FALLBACK_BOUNDS.min),
            max: readPixels(aside, '--sidebar-max-width', FALLBACK_BOUNDS.max),
            now: Math.round(aside.getBoundingClientRect().width),
        };
    }, [asideRef]);

    // A faixa e o valor da alça (aria-value*) se medem no layout, depois que a lateral existe e a cada ajuste.
    useLayoutEffect(() => setBounds(measure()), [measure, width]);

    const apply = useCallback((next: number, persist: boolean): void => {
        const { min, max } = measure();
        const clamped = Math.round(Math.min(max, Math.max(min, next)));
        setWidth(clamped);
        if (persist) sarak?.updatePreferences({ sidebarWidth: clamped });
    }, [measure, sarak]);

    const direction = side === 'right' ? -1 : 1;

    const onPointerDown = (event: PointerEvent<HTMLElement>): void => {
        event.currentTarget.setPointerCapture?.(event.pointerId);
        drag.current = { startX: event.clientX, startWidth: measure().now };
    };
    const onPointerMove = (event: PointerEvent<HTMLElement>): void => {
        if (!drag.current) return;
        apply(drag.current.startWidth + (event.clientX - drag.current.startX) * direction, false);
    };
    const onPointerUp = (event: PointerEvent<HTMLElement>): void => {
        if (!drag.current) return;
        apply(drag.current.startWidth + (event.clientX - drag.current.startX) * direction, true);
        drag.current = null;
    };
    const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
        const { min, max, now } = measure();
        const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
        const target: Record<string, number> = {
            ArrowRight: now + step * direction,
            ArrowLeft: now - step * direction,
            Home: min,
            End: max,
        };
        if (!(event.key in target)) return;
        event.preventDefault();
        apply(target[event.key], true);
    };
    const onDoubleClick = (): void => {
        setWidth(null);
        sarak?.updatePreferences({ sidebarWidth: undefined });
    };

    return { width, bounds, handlers: { onPointerDown, onPointerMove, onPointerUp, onKeyDown, onDoubleClick } };
};
