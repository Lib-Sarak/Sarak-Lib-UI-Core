import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SarakPortalScope } from '../../../../core/Provider/components/SarakPortalScope';
import { placeAnchored, type AnchoredCoords, type AnchoredPlacement } from './anchoredPosition';

export interface ShellNavFlyoutProps {
    id: string;
    label: string;
    /** Âncora de que o balão parte; a lateral recolhida abre ao lado, a topbar abaixo. */
    anchorRef: React.RefObject<HTMLElement>;
    placement: Extract<AnchoredPlacement, 'side' | 'below'>;
    onClose: () => void;
    children: React.ReactNode;
}

const FOCUSABLE = 'a[href], button:not([disabled])';

/**
 * Balão dos filhos de um grupo quando a lista não cabe na própria barra: ao lado do ícone na lateral recolhida,
 * abaixo do item na topbar. Vive num portal no `body`, posicionado por `fixed` a partir do retângulo da âncora —
 * o `overflow` da barra e o `backdrop-filter` dela (que ancora descendentes `fixed`) não o cortam.
 *
 * Teclado: o foco entra no primeiro item; setas movem entre os itens; Esc fecha e devolve o foco ao gatilho;
 * Tab fecha (a ordem de foco do portal não segue a da barra) e devolve o foco ao gatilho.
 */
export const ShellNavFlyout: React.FC<ShellNavFlyoutProps> = ({ id, label, anchorRef, placement, onClose, children }) => {
    const flyoutRef = useRef<HTMLDivElement | null>(null);
    const [coords, setCoords] = useState<AnchoredCoords | null>(null);

    useLayoutEffect(() => {
        if (!anchorRef.current || !flyoutRef.current) return;
        setCoords(placeAnchored(anchorRef.current.getBoundingClientRect(), flyoutRef.current.getBoundingClientRect(), placement));
    }, [anchorRef, placement]);

    // O balão nasce `visibility: hidden` até ser medido, e elemento oculto não recebe foco: o foco entra quando ele aparece.
    const isPlaced = coords !== null;
    useEffect(() => {
        if (isPlaced) flyoutRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    }, [isPlaced]);

    useEffect(() => {
        const closeOnOutsidePointer = (event: MouseEvent): void => {
            const target = event.target as Node;
            if (flyoutRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
            onClose();
        };
        document.addEventListener('mousedown', closeOnOutsidePointer);
        return () => document.removeEventListener('mousedown', closeOnOutsidePointer);
    }, [anchorRef, onClose]);

    const closeAndReturnFocus = (): void => {
        onClose();
        anchorRef.current?.querySelector<HTMLElement>('button')?.focus();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        if (event.key === 'Escape' || event.key === 'Tab') {
            if (event.key === 'Escape') event.stopPropagation();
            if (event.key === 'Tab') event.preventDefault();
            closeAndReturnFocus();
            return;
        }
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        const items = Array.from(flyoutRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
        const current = items.indexOf(document.activeElement as HTMLElement);
        const step = event.key === 'ArrowDown' ? 1 : -1;
        items[(current + step + items.length) % items.length]?.focus();
    };

    if (typeof document === 'undefined') return null;
    return createPortal(
        <SarakPortalScope>
            <div
                id={id}
                ref={flyoutRef}
                role="group"
                aria-label={label}
                data-sarak-nav-flyout="true"
                onKeyDown={handleKeyDown}
                className="fixed flex shadow-[var(--dynamic-shadow)]"
                style={{
                    flexDirection: 'column',
                    gap: 'calc(var(--sarak-tab-gap, 8px) * 0.5)',
                    padding: 'var(--sarak-layout-gap-sm, 8px)',
                    minWidth: 'var(--sarak-context-menu-min-width, 10rem)',
                    borderRadius: 'var(--sarak-card-radius, 10px)',
                    background: 'var(--color-theme-card, #101622)',
                    border: 'var(--sarak-border-width, 1px) solid var(--border-color, rgba(255,255,255,0.09))',
                    top: coords ? coords.top : -9999,
                    left: coords ? coords.left : -9999,
                    visibility: coords ? 'visible' : 'hidden',
                    zIndex: 'calc(var(--sarak-z-sidebar, 500) + 100)' as React.CSSProperties['zIndex'],
                }}
            >
                {children}
            </div>
        </SarakPortalScope>,
        document.body,
    );
};

export default ShellNavFlyout;
