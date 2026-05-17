/**
 * Presets: Temas Globais (Combinações cross-schema)
 * 
 * TODO: Criar presets data-driven que combinam tokens de múltiplos schemas
 * Formato esperado: { id: string; name: string; design: Record<string, any> }
 */

export interface ThemePreset {
    id: string;
    name: string;
    design: Record<string, any>;
}

export const GLOBAL_THEMES: ThemePreset[] = [];
