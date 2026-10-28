export type SarakPaletteType =
    | 'monochromatic'
    | 'analogous'
    | 'complementary'
    | 'split-complementary'
    | 'triadic';

export type PaletteMode = 'light' | 'dark';

export type PaletteScaleName =
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'neutral'
    | 'success'
    | 'error'
    | 'warning'
    | 'info';

export interface OklchColor {
    lightness: number;
    chroma: number;
    hue: number;
}

export interface RgbColor {
    red: number;
    green: number;
    blue: number;
}

export interface PaletteInput {
    type: SarakPaletteType;
    base: string;
    secondary?: string;
    accent?: string;
}

export interface PaletteSeeds {
    primary: OklchColor;
    secondary: OklchColor;
    accent: OklchColor;
    neutral: OklchColor;
    success: OklchColor;
    error: OklchColor;
    warning: OklchColor;
    info: OklchColor;
}

export interface PaletteColorRole {
    scale: PaletteScaleName;
    toneByMode: Record<PaletteMode, number>;
    alpha?: number;
}

export type PaletteScales = Record<PaletteScaleName, Record<number, RgbColor>>;
