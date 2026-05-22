/**
 * Presets: Temas Globais (Preview 2 Globais)
 * 
 * Configurações que alteram a aplicação inteira de uma vez.
 * Formato esperado: { id: string; name: string; design: Record<string, any> }
 */

export interface ThemePreset {
    id: string;
    name: string;
    design: Record<string, any>;
}

export const GLOBAL_THEMES: ThemePreset[] = [];
