export type SarakPaletteType =
    | 'monochromatic'
    | 'analogous'
    | 'complementary'
    | 'split-complementary'
    | 'triadic';

export type SarakPaletteMode = 'light' | 'dark';

export type PaletteScaleName =
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'neutral'
    | 'success'
    | 'error'
    | 'warning'
    | 'info';

export interface SarakOklchColor {
    lightness: number;
    chroma: number;
    hue: number;
}

export interface RgbColor {
    red: number;
    green: number;
    blue: number;
}

export interface SarakPaletteInput {
    type: SarakPaletteType;
    base: string;
    secondary?: string;
    accent?: string;
}

export interface SarakPaletteSeeds {
    primary: SarakOklchColor;
    secondary: SarakOklchColor;
    accent: SarakOklchColor;
    neutral: SarakOklchColor;
    success: SarakOklchColor;
    error: SarakOklchColor;
    warning: SarakOklchColor;
    info: SarakOklchColor;
}

export interface PaletteColorRole {
    scale: PaletteScaleName;
    /** O tom de cada modo; `PALETTE_BASE_TONE` é a cor da semente, exata. */
    toneByMode: Record<SarakPaletteMode, number>;
    alpha?: number;
    /**
     * Texto que se corrige por deslocamento mínimo de luminosidade (mesmo matiz e croma), em vez de saltar de tom
     * em tom. Lista as origens do deslocamento: o tom da escala de onde a busca parte (a base, ou os dois extremos).
     */
    shiftFrom?: readonly number[];
}

export type PaletteScales = Record<PaletteScaleName, Record<number, RgbColor>>;
