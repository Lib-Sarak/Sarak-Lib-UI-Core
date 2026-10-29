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
    toneByMode: Record<SarakPaletteMode, number>;
    alpha?: number;
}

export type PaletteScales = Record<PaletteScaleName, Record<number, RgbColor>>;
