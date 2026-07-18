/**
 * SarakLightbox (Spec 15, Regra 3) — galeria/carrossel em overlay escuro.
 *
 * Reaproveita o modelo de foco transversal (`useFocusTrap` da Spec 41): trap + ESC +
 * restauração do foco ao fechar. Navega entre mídias por botões prev/next e pelas
 * setas do teclado (←/→), com contador de posição. Renderiza via portal no topo do DOM.
 * Leve (sem dependência nova) — não precisa de `React.lazy`.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SarakPortalScope } from '../../../core/Provider/components/SarakPortalScope';
import { useFocusTrap } from '../Modals/hooks/useFocusTrap';

export interface LightboxImage {
    src: string;
    alt?: string;
}

export interface SarakLightboxProps {
    /** Mídias da galeria, na ordem de exibição. */
    images: LightboxImage[];
    /** Controla a visibilidade do overlay. */
    isOpen: boolean;
    /** Índice inicial ao abrir (default: 0). */
    initialIndex?: number;
    /** Fecha o overlay (ESC, clique no ✕ ou no fundo). */
    onClose: () => void;
    /** Notifica a troca de mídia (avançar/retroceder). */
    onIndexChange?: (index: number) => void;
}

const navBtn =
    'absolute top-1/2 -translate-y-1/2 w-11 h-11 inline-flex items-center justify-center rounded-full bg-white/10 text-white text-2xl hover:bg-white/20 transition-colors';

export const SarakLightbox: React.FC<SarakLightboxProps> = ({
    images,
    isOpen,
    initialIndex = 0,
    onClose,
    onIndexChange,
}) => {
    const { containerRef, handleTrap } = useFocusTrap(isOpen, onClose);
    const [current, setCurrent] = useState(initialIndex);

    // Reposiciona no índice inicial sempre que (re)abre.
    useEffect(() => {
        if (isOpen) setCurrent(initialIndex);
    }, [isOpen, initialIndex]);

    const go = useCallback(
        (next: number) => {
            if (images.length === 0) return;
            const clamped = (next + images.length) % images.length;
            setCurrent(clamped);
            onIndexChange?.(clamped);
        },
        [images.length, onIndexChange],
    );

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        handleTrap(e); // mantém o Tab preso no overlay (Spec 41)
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            go(current + 1);
            return;
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            go(current - 1);
        }
    };

    if (!isOpen || images.length === 0) return null;

    const image = images[current];
    const multiple = images.length > 1;

    const overlay = (
        <div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Galeria de imagens"
            tabIndex={-1}
            onKeyDown={onKeyDown}
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/90"
        >
            <button
                type="button"
                aria-label="Fechar galeria"
                onClick={onClose}
                className="absolute top-4 right-4 w-11 h-11 inline-flex items-center justify-center rounded-full bg-white/10 text-white text-xl hover:bg-white/20 transition-colors"
            >
                ✕
            </button>

            {multiple && (
                <button type="button" aria-label="Imagem anterior" onClick={() => go(current - 1)} className={`${navBtn} left-4`}>
                    ‹
                </button>
            )}

            <img src={image.src} alt={image.alt ?? ''} className="max-w-[90vw] max-h-[85vh] object-contain select-none" />

            {multiple && (
                <button type="button" aria-label="Próxima imagem" onClick={() => go(current + 1)} className={`${navBtn} right-4`}>
                    ›
                </button>
            )}

            {multiple && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm select-none">
                    {current + 1} / {images.length}
                </div>
            )}
        </div>
    );

    return typeof document !== 'undefined'
        ? createPortal(<SarakPortalScope>{overlay}</SarakPortalScope>, document.body)
        : overlay;
};
