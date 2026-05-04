/**
 * Sarak Design Engine - Presets Library (v12.0)
 * Central Hub para todos os átomos de design.
 */

// Importando Presets Atômicos
import { CARD_PRESETS } from './cards';
import type { CardPreset } from './cards';
import { TYPOGRAPHY_PRESETS } from './typography';
import type { TypographyPreset } from './typography';
import { BRANDING_PRESETS } from './branding';
import type { BrandingPreset } from './branding';
import { ATMOSPHERE_PRESETS } from './atmosphere';
import type { AtmospherePreset } from './atmosphere';
import { ANIMATION_PRESETS } from './animations';
import type { AnimationPreset } from './animations';
import { COLOR_PRESETS } from './colors';
import type { ColorPreset } from './colors';
import { DATA_PRESETS } from './data';
import type { DataPreset } from './data';
import { CHART_TYPES_PRESETS } from './charts';
import type { ChartPreset } from './charts';
import { LAYOUT_PRESETS } from './layout';
import { GLOBAL_THEMES } from './themes';

// Exportações Individuais para Galerias Específicas
export { 
    CARD_PRESETS, 
    TYPOGRAPHY_PRESETS, 
    BRANDING_PRESETS,
    ATMOSPHERE_PRESETS, 
    ANIMATION_PRESETS, 
    COLOR_PRESETS, 
    DATA_PRESETS,
    CHART_TYPES_PRESETS,
    LAYOUT_PRESETS,
    GLOBAL_THEMES
};

export type {
    BrandingPreset,
    CardPreset,
    TypographyPreset,
    AtmospherePreset,
    AnimationPreset,
    ColorPreset,
    DataPreset,
    ChartPreset
};

/**
 * Biblioteca Mestra de Presets
 * Este objeto é consumido pelo CustomizationTab e galerias dinâmicas.
 */
export const PRESETS_LIBRARY: any = {
    layouts: GLOBAL_THEMES,
    cards: CARD_PRESETS,
    typography: TYPOGRAPHY_PRESETS,
    branding: BRANDING_PRESETS,
    atmosphere: ATMOSPHERE_PRESETS,
    animations: ANIMATION_PRESETS,
    colors: COLOR_PRESETS,
    data: DATA_PRESETS,
    charts: CHART_TYPES_PRESETS,
    layout: LAYOUT_PRESETS
};

// Alias para compatibilidade legada
export const PRESETS = PRESETS_LIBRARY;
