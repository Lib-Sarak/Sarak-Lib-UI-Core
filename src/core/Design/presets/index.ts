/**
 * Sarak Design Engine - Presets Library (v4.0 - Clean)
 * 
 * Barrel de exportação centralizado para todos os presets do sistema.
 * Cada subcategoria exporta seus presets como fonte única de verdade.
 */

export * from './layout';
export * from './themes';
export * from './animations';
export * from './typography';
export * from './surfaces';
export * from './advanced';

// Re-exports tipados
export type { TypographyPreset } from './typography';
export type { AnimationPreset } from './animations';
export type { LayoutPreset } from './layout';
export type { ThemePreset } from './themes';
export type { CardPreset } from './surfaces/cards';

// Stubs vazios para galerias que consomem esses arrays (compilação segura)
// TODO: Migrar para subdiretórios próprios com presets data-driven
export interface BrandingPreset { id: string; name: string; description: string; design: Record<string, any>; }
export const BRANDING_PRESETS: BrandingPreset[] = [];

export interface ChartPreset { id: string; name: string; type: string; description: string; }
export const CHART_TYPES_PRESETS: ChartPreset[] = [];

export interface DataPreset { id: string; name: string; type: string; description: string; design: Record<string, any>; }
export const DATA_PRESETS: DataPreset[] = [];
