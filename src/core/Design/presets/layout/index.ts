/**
 * Presets: Layout e Navegação
 * 
 * TODO: Criar presets data-driven com chaves mapeando para NavigationSchema.tokens[].id
 * Formato esperado: { id: string; name: string; design: Record<string, any> }
 */

export interface LayoutPreset {
    id: string;
    name: string;
    design: Record<string, any>;
}

export const LAYOUT_PRESETS: LayoutPreset[] = [];

/**
 * Layouts disponíveis para seleção no sistema.
 * Consumido pelo SarakUIProvider para popular o contexto global.
 * TODO: Substituir por presets data-driven quando os layouts forem migrados.
 */
export const LAYOUTS: Record<string, { id: string; name: string; class: string; animation: string }> = {};
