import React, { useMemo } from 'react';
import { resolvePalette } from '../../../../core/Design/palette/resolve';
import { useLibraryText } from '../../../../core/i18n/useLibraryText';
import type { SarakPaletteInput, SarakPaletteMode } from '../../../../core/Design/palette/types';

/** Papéis mostrados na amostra, do fundo ao acento — a mesma leitura que a tela faz da paleta. */
const SWATCH_TOKENS = ['colorBgBody', 'titleColor', 'primaryColor', 'secondaryColor', 'accentColor'] as const;
/** Papéis da faixa única: o fundo tingido e as três cores de identidade. */
const STRIP_TOKENS = ['colorBgBody', 'primaryColor', 'secondaryColor', 'accentColor'] as const;

const MODES: readonly SarakPaletteMode[] = ['light', 'dark'];

interface PaletteSwatchProps {
    input: SarakPaletteInput;
    /** Com o modo, a amostra é uma faixa contínua só dele; sem ele, mostra os dois modos com o nome de cada um. */
    mode?: SarakPaletteMode;
}

/** Faixa contínua da paleta num modo, sem texto: a linha da galeria. */
const PaletteStrip: React.FC<{ input: SarakPaletteInput; mode: SarakPaletteMode }> = ({ input, mode }) => {
    const colors = useMemo(() => resolvePalette(input, mode), [input, mode]);
    return (
        <span aria-hidden="true" data-testid="palette-strip" className="flex h-3 w-full overflow-hidden rounded-full">
            {STRIP_TOKENS.map((tokenId) => (
                <span key={tokenId} className="h-full flex-1" style={{ background: colors[tokenId] }} />
            ))}
        </span>
    );
};

/** Faixas de cor sobre o fundo de cada modo, com o nome dele: a prévia do criador. */
const PaletteModes: React.FC<{ input: SarakPaletteInput }> = ({ input }) => {
    const text = useLibraryText();
    const byMode = useMemo(() => MODES.map((mode) => ({ mode, colors: resolvePalette(input, mode) })), [input]);
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

/** Amostra de uma paleta: uma faixa contínua num modo, ou faixas sobre o fundo de cada um dos dois modos. */
export const PaletteSwatch: React.FC<PaletteSwatchProps> = ({ input, mode }) =>
    mode ? <PaletteStrip input={input} mode={mode} /> : <PaletteModes input={input} />;
