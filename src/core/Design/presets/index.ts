/**
 * Sarak Design Engine - Presets Library (Empty Placeholder)
 */

export const PRESETS_LIBRARY: any = {};
export const PRESETS = PRESETS_LIBRARY;

export * from './layout';
export * from './themes';
export * from './animations';
export * from './typography';
export * from './surfaces';

// Aliases para evitar erros de importação em outros componentes
export const BRANDING_PRESETS: any[] = [];
export const CARD_PRESETS: any[] = [];
export const DATA_PRESETS: any[] = [];
export const CHART_TYPES_PRESETS: any[] = [];
export const NAVIGATION_PRESETS: any[] = [];

// Interfaces vazias para o compilador
export type BrandingPreset = any;
export type { TypographyPreset } from './typography';
export type CardPreset = any;
export type { AnimationPreset } from './animations';
export type { AtmospherePreset } from './surfaces';
export type ChartPreset = any;
export type { LayoutPreset } from './layout';
