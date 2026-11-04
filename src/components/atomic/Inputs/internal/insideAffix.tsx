import React, { useState } from 'react';

export const AFFIX_PADDING = 'var(--sarak-input-padding-horizontal, 16px)';
const AFFIX_GAP = 'var(--sarak-layout-gap-sm, 8px)';
/** Mesma reserva do `pl-11`/`pr-11` do campo com ícone (2,75 vezes o respiro médio). */
export const ICON_INSET = 'calc(var(--sarak-layout-gap-md, 16px) * 2.75)';

export interface InsideAffixes {
    prefix: React.ReactNode;
    suffix: React.ReactNode;
    prefixId: string;
    suffixId: string;
    hasLeftIcon: boolean;
    hasRightIcon: boolean;
}

const hasNode = (node: React.ReactNode): boolean => node !== undefined && node !== null && node !== false;

/** Largura dos afixos de dentro: medida para reservar o `padding` do campo sem mexer na largura dele. */
const useAffixWidths = (hasPrefix: boolean, hasSuffix: boolean) => {
    const prefixRef = React.useRef<HTMLSpanElement>(null);
    const suffixRef = React.useRef<HTMLSpanElement>(null);
    const [widths, setWidths] = useState({ prefix: 0, suffix: 0 });
    React.useLayoutEffect(() => {
        const measure = (): void => {
            const next = { prefix: prefixRef.current?.offsetWidth ?? 0, suffix: suffixRef.current?.offsetWidth ?? 0 };
            setWidths((current) => (current.prefix === next.prefix && current.suffix === next.suffix ? current : next));
        };
        measure();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(measure);
        [prefixRef.current, suffixRef.current].forEach((node) => { if (node) observer.observe(node); });
        return () => observer.disconnect();
    }, [hasPrefix, hasSuffix]);
    return { prefixRef, suffixRef, widths };
};

/** O que o campo precisa para abrir lugar aos afixos de dentro: refs, bases e o `padding` a somar ao estilo do `<input>`. */
export const useInsideAffixInset = (affixes?: InsideAffixes) => {
    const hasPrefix = hasNode(affixes?.prefix);
    const hasSuffix = hasNode(affixes?.suffix);
    const { prefixRef, suffixRef, widths } = useAffixWidths(hasPrefix, hasSuffix);
    const leftBase = affixes?.hasLeftIcon ? ICON_INSET : AFFIX_PADDING;
    const rightBase = affixes?.hasRightIcon ? ICON_INSET : AFFIX_PADDING;
    const insetStyle: React.CSSProperties = {
        ...(hasPrefix ? { paddingLeft: `calc(${leftBase} + ${widths.prefix}px + ${AFFIX_GAP})` } : {}),
        ...(hasSuffix ? { paddingRight: `calc(${rightBase} + ${widths.suffix}px + ${AFFIX_GAP})` } : {}),
    };
    return { hasPrefix, hasSuffix, prefixRef, suffixRef, leftBase, rightBase, insetStyle };
};

const affixStyle = (side: 'left' | 'right', inset: string): React.CSSProperties => ({
    position: 'absolute', top: 0, bottom: 0, [side]: inset, display: 'flex', alignItems: 'center', zIndex: 10, pointerEvents: 'none',
});

export const InsideAffix = React.forwardRef<HTMLSpanElement, { id: string; side: 'left' | 'right'; inset: string; children: React.ReactNode }>(
    ({ id, side, inset, children }, ref) => (
        <span id={id} ref={ref} className="text-[var(--sarak-input-icon-color,var(--text-muted,rgba(242,246,251,0.55)))]" style={affixStyle(side, inset)}>{children}</span>
    ),
);
InsideAffix.displayName = 'InsideAffix';
