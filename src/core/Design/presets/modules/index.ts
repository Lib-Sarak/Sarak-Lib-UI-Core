/**
 * Presets: Módulos Granulares
 * 
 * Presets granulares divididos pelas abas do Gêmeo Digital.
 * O usuário pode aplicar apenas o preset de um módulo (ex: Chat) sem afetar o resto do tema.
 */

export interface ModulePreset {
    id: string;
    moduleId: string;
    name: string;
    design: Record<string, any>;
}

export const MODULE_PRESETS: ModulePreset[] = [];
