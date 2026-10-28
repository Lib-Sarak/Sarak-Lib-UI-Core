import React, { useMemo } from 'react';
import { resolvePalette } from '../../../../core/Design/palette/resolve';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { PaletteInput, PaletteMode } from '../../../../core/Design/palette/types';

/** Papéis mostrados na amostra, do fundo ao acento — a mesma leitura que a tela faz da paleta. */
const SWATCH_TOKENS = ['colorBgBody', 'titleColor', 'primaryColor', 'secondaryColor', 'accentColor'] as const;

const MODES: readonly PaletteMode[] = ['light', 'dark'];

interface PaletteSwatchProps {
    input: PaletteInput;
}

/** Amostra de uma paleta nos dois modos: faixas de cor sobre o fundo do próprio modo. */
export const PaletteSwatch: React.FC<PaletteSwatchProps> = ({ input }) => {
    const text = useLibraryText();
    const byMode = useMemo(
        () => MODES.map((mode) => ({ mode, colors: resolvePalette(input, mode) })),
        [input],
    );
    return (
        <span aria-hidden="true" className="flex w-full flex-col gap-1">
            {byMode.map(({ mode, colors }) => (
                <span
                    key={mode}
                    data-testid={`palette-swatch-${mode}`}
                    className="flex items-center gap-1 rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-border)] p-1"
                    style={{ background: colors.colorBgBody }}
                >
                    <span className="w-16 shrink-0 text-[var(--sarak-type-scale-tiny,11px)] font-semibold" style={{ color: colors.titleColor }}>
                        {text(mode === 'light' ? 'paletteModeLight' : 'paletteModeDark')}
                    </span>
                    {SWATCH_TOKENS.slice(2).map((tokenId) => (
                        <span key={tokenId} className="h-3 flex-1 rounded-sm" style={{ background: colors[tokenId] }} />
                    ))}
                </span>
            ))}
        </span>
    );
};
