import React from 'react';
import type { ComponentPreset } from '../../../../core/Design/presets/components/cards';

const MAX_CONTENT_WIDTH_REFERENCE = 1600;

export const Frame: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`flex min-h-48 w-full items-center justify-center p-6 ${className}`}>{children}</div>
);

/** A largura do conteúdo desenhada como proporção da janela: não há componente que a mostre em miniatura. */
export const WidthSample: React.FC<{ preset: ComponentPreset }> = ({ preset }) => {
    const raw = String(preset.design.maxContentWidth ?? 'fluid');
    const percent = raw.endsWith('px') ? Math.min(100, (Number.parseInt(raw, 10) / MAX_CONTENT_WIDTH_REFERENCE) * 100) : 100;
    return (
        <Frame>
            <div data-sample-width={raw} className="flex h-28 w-full justify-center rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-border)] p-2">
                <div className="h-full rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-border)]" style={{ width: `${percent}%`, backgroundColor: 'color-mix(in srgb, var(--theme-primary) 55%, transparent)' }} />
            </div>
        </Frame>
    );
};
