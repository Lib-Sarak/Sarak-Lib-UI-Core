import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SarakPortalScope } from '../../../core/Provider/components/SarakPortalScope';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { useLibraryText } from '../../../core/i18n/useLibraryText';
import { SarakIconButton } from '../Buttons/SarakIconButton';
import { useFocusTrap } from '../Modals/hooks/useFocusTrap';
import { OVERLAY_LAYER_STEP, useOverlayLayer } from '../Modals/hooks/useOverlayLayer';

export type SarakPopoverPlacement = 'bottom' | 'top';

export interface SarakPopoverProps {
    /** O que abre o popover ao clicar (um botão, em geral). Um elemento React recebe `aria-expanded` e `aria-haspopup`. */
    trigger: React.ReactNode;
    /** Conteúdo do popover. */
    children: React.ReactNode;
    /** Nome do painel para o leitor de tela; sem ele o painel fica sem nome. */
    label?: string;
    /** Aberto ou fechado quando o host governa o estado; omitido, o popover guarda o estado. */
    open?: boolean;
    /** Estado inicial no modo sem `open`; omitido, fechado. */
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Lado preferido; se não couber na janela, vai para o oposto. Omitido, `bottom`. */
    placement?: SarakPopoverPlacement;
    /** Mostra o botão de fechar no painel; omitido, só `Esc` e o clique fora fecham. */
    showClose?: boolean;
    className?: string;
}

interface Coords { top: number; left: number }

const EDGE_GAP = 8;
const DEFAULT_MODAL_Z_INDEX = 1000;

const computeCoords = (trigger: DOMRect, panel: DOMRect, placement: SarakPopoverPlacement): Coords => {
    const fitsBelow = trigger.bottom + panel.height + EDGE_GAP <= window.innerHeight;
    const fitsAbove = trigger.top - panel.height - EDGE_GAP >= 0;
    const below = placement === 'bottom' ? fitsBelow || !fitsAbove : !fitsAbove && fitsBelow;
    const top = below ? trigger.bottom + EDGE_GAP : trigger.top - panel.height - EDGE_GAP;
    const left = Math.max(EDGE_GAP, Math.min(trigger.left, window.innerWidth - panel.width - EDGE_GAP));
    return { top: Math.max(EDGE_GAP, top), left };
};

/**
 * Painel flutuante preso a um gatilho: foco preso enquanto aberto (devolvido ao gatilho ao fechar), `Esc` e clique fora
 * fecham, e a camada entra na pilha dos modais e gavetas, ficando acima do que já estiver aberto.
 */
export const SarakPopover = ({
    trigger, children, label, open, defaultOpen = false, onOpenChange, placement = 'bottom', showClose = false, className,
}: SarakPopoverProps): React.ReactElement => {
    const text = useLibraryText();
    const design = useSarakUIOptional()?.design;
    const [inner, setInner] = useState(defaultOpen);
    const isOpen = open ?? inner;
    const [coords, setCoords] = useState<Coords | null>(null);
    const triggerRef = useRef<HTMLSpanElement | null>(null);
    const layer = useOverlayLayer(isOpen);

    const setOpen = useCallback((next: boolean): void => {
        setInner(next);
        onOpenChange?.(next);
    }, [onOpenChange]);
    const { containerRef, handleTrap } = useFocusTrap(isOpen, () => setOpen(false), layer.isTop);

    useLayoutEffect(() => {
        if (!isOpen || !triggerRef.current || !containerRef.current) {
            setCoords(null);
            return;
        }
        setCoords(computeCoords(triggerRef.current.getBoundingClientRect(), containerRef.current.getBoundingClientRect(), placement));
    }, [isOpen, placement, containerRef, children]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const closeOutside = (event: PointerEvent): void => {
            const target = event.target as Node;
            if (triggerRef.current?.contains(target) || containerRef.current?.contains(target) || !layer.isTop) return;
            setOpen(false);
        };
        document.addEventListener('pointerdown', closeOutside);
        return () => document.removeEventListener('pointerdown', closeOutside);
    }, [isOpen, layer.isTop, setOpen, containerRef]);

    const zIndex = ((design?.zIndexModal as number) || DEFAULT_MODAL_Z_INDEX) + (layer.depth + 1) * OVERLAY_LAYER_STEP;
    const triggerNode = React.isValidElement<Record<string, unknown>>(trigger)
        ? React.cloneElement(trigger, { 'aria-expanded': isOpen, 'aria-haspopup': 'dialog' })
        : trigger;

    return (
        <>
            <span ref={triggerRef} style={{ display: 'inline-flex' }} onClick={() => setOpen(!isOpen)}>{triggerNode}</span>
            {isOpen && typeof document !== 'undefined' && createPortal(
                <SarakPortalScope>
                    <div
                        ref={containerRef} role="dialog" aria-label={label} tabIndex={-1} data-sarak-popover="true" className={className}
                        onKeyDown={handleTrap}
                        style={{
                            position: 'fixed', zIndex, top: coords?.top ?? -9999, left: coords?.left ?? -9999,
                            visibility: coords ? 'visible' : 'hidden', maxInlineSize: 'calc(100vw - 2 * var(--sarak-layout-gap-md, 16px))',
                            padding: 'var(--sarak-layout-gap-md, 16px)', background: 'var(--color-theme-card, #101622)',
                            color: 'var(--sarak-text-main, #f2f6fb)', border: 'var(--sarak-border-width, 1px) solid var(--theme-border)',
                            borderRadius: 'var(--sarak-card-radius, 10px)', boxShadow: 'var(--dynamic-shadow)',
                        }}
                    >
                        {showClose && <SarakIconButton variant="ghost" size="xs" icon="×" aria-label={text('popoverClose')} onClick={() => setOpen(false)} />}
                        {children}
                    </div>
                </SarakPortalScope>,
                document.body,
            )}
        </>
    );
};
