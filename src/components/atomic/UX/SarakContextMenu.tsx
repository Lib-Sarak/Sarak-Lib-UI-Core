/**
 * SarakContextMenu (Spec 13 — Regra 5)
 *
 * Menu que abre exatamente na coordenada X,Y do clique (tipicamente o botão direito) e
 * desaparece instantaneamente ao clicar em qualquer outro lugar (ou ESC). Renderiza num
 * portal no `body` para escapar de `overflow:hidden` de containers ancestrais.
 *
 * Edge detection: se a coordenada jogaria o menu para fora da viewport, ele é deslocado
 * para dentro. Zero Hardcode nas cores (tokens `--sx-*`/`--theme-*`).
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ContextMenuPosition {
    x: number;
    y: number;
}

export interface SarakContextMenuProps {
    /** Controla a visibilidade. */
    isOpen: boolean;
    /** Coordenada (viewport) onde abrir — normalmente `{ x: e.clientX, y: e.clientY }`. */
    position: ContextMenuPosition;
    /** Fecha o menu (clique fora / ESC / escolha de item). */
    onClose: () => void;
    /** Itens do menu (ex.: botões). */
    children: React.ReactNode;
    className?: string;
}

export const SarakContextMenu: React.FC<SarakContextMenuProps> = ({
    isOpen,
    position,
    onClose,
    children,
    className = '',
}) => {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [coords, setCoords] = useState<ContextMenuPosition>(position);

    // Fecha ao clicar fora ou pressionar ESC (Critério: some ao clicar em outro lugar).
    useEffect(() => {
        if (!isOpen) return;
        const handlePointer = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        // `mousedown` no capture fecha antes de um novo clique abrir outro contexto.
        document.addEventListener('mousedown', handlePointer, true);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handlePointer, true);
            document.removeEventListener('keydown', handleKey);
        };
    }, [isOpen, onClose]);

    // Edge detection: corrige a posição para o menu não sair da viewport.
    useLayoutEffect(() => {
        if (!isOpen || !menuRef.current || typeof window === 'undefined') {
            setCoords(position);
            return;
        }
        const rect = menuRef.current.getBoundingClientRect();
        const margin = 8;
        const maxX = window.innerWidth - rect.width - margin;
        const maxY = window.innerHeight - rect.height - margin;
        setCoords({
            x: Math.max(margin, Math.min(position.x, maxX)),
            y: Math.max(margin, Math.min(position.y, maxY)),
        });
    }, [isOpen, position]);

    if (!isOpen || typeof document === 'undefined') return null;

    return createPortal(
        <div
            ref={menuRef}
            role="menu"
            data-sarak-context-menu="true"
            className={`fixed flex shadow-xl ${className}`}
            style={{
                flexDirection: 'column',
                paddingBlock: 'calc(var(--sarak-layout-gap-md, 16px) * 0.25)',
                top: coords.y,
                left: coords.x,
                minWidth: 'var(--sarak-context-menu-min-width, 10rem)',
                borderRadius: 'var(--sarak-card-radius,12px)',
                background: 'var(--color-theme-card,#1e293b)',
                color: 'var(--sarak-text-main,#ffffff)',
                border: 'var(--sarak-border-width, 1px) solid var(--border-color,#334155)',
                zIndex: 'var(--z-index-tooltip, 9000)' as React.CSSProperties['zIndex'],
            }}
        >
            {children}
        </div>,
        document.body,
    );
};
