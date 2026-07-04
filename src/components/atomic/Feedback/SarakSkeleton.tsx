/**
 * SarakSkeleton — placeholder de carregamento (Spec 13, Regra 3 + Spec 31, Regra 2)
 *
 * Assume FORMAS declaradas (`shape`): `text` (barras finas), `circle` (avatar) e `rect`
 * (bloco). Mantém o uso original como estado `loading` da Fonte de Dados (linhas-fantasma)
 * por padrão. Zero Hardcode: cores/raio via `[--sarak-*]`; pulso via `animate-pulse`.
 */

import React from 'react';

/** Forma do esqueleto. */
export type SkeletonShape = 'text' | 'circle' | 'rect';

export interface SarakSkeletonProps {
    /** Forma do placeholder (default: `text`). */
    shape?: SkeletonShape;
    /** Número de linhas-fantasma quando `shape="text"` (default: 3). */
    rows?: number;
    /** Altura de cada linha/bloco (default: `1rem`). */
    rowHeight?: string;
    /** Diâmetro quando `shape="circle"` (default: `2.5rem`). */
    size?: string;
    /** Largura quando `shape="rect"`/`circle` (default: `100%` / `size`). */
    width?: string;
}

const PULSE_BG =
    'var(--border-color, rgba(127,127,127,0.18))';

export const SarakSkeleton: React.FC<SarakSkeletonProps> = ({
    shape = 'text',
    rows = 3,
    rowHeight = 'var(--sarak-skeleton-row-height, 1rem)',
    size = 'var(--sarak-skeleton-circle-size, 2.5rem)',
    width,
}) => {
    const common = {
        role: 'status' as const,
        'aria-busy': true,
        'aria-live': 'polite' as const,
        'data-sarak-skeleton': 'true',
    };

    if (shape === 'circle') {
        return (
            <div
                {...common}
                data-shape="circle"
                className="animate-pulse"
                style={{ width: size, height: size, borderRadius: '50%', background: PULSE_BG }}
            />
        );
    }

    if (shape === 'rect') {
        return (
            <div
                {...common}
                data-shape="rect"
                className="animate-pulse"
                style={{
                    width: width ?? '100%',
                    height: rowHeight,
                    borderRadius: 'var(--sarak-card-radius,12px)',
                    background: PULSE_BG,
                }}
            />
        );
    }

    return (
        <div {...common} data-shape="text" className="flex w-full" style={{ flexDirection: 'column', gap: 'var(--sarak-layout-gap-sm, 8px)' }}>
            {Array.from({ length: Math.max(1, rows) }, (_v, index) => (
                <div
                    key={index}
                    className="animate-pulse w-full"
                    style={{
                        height: rowHeight,
                        borderRadius: 'var(--sarak-skeleton-row-radius, 4px)',
                        background: PULSE_BG,
                    }}
                />
            ))}
        </div>
    );
};
