/**
 * Presets: Animações e Efeitos
 * 
 * TODO: Criar presets data-driven com chaves mapeando para AnimationSchema.tokens[].id
 * Formato esperado: { id: string; name: string; design: Record<string, any> }
 */

export interface AnimationPreset {
    id: string;
    name: string;
    design: Record<string, any>;
}

export const ANIMATION_PRESETS: AnimationPreset[] = [];

/**
 * Efeitos de transição de página.
 * Será populado quando os presets de animação forem criados.
 */
export const THEME_EFFECTS = {
    page: {
        fade: {
            page: {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 }
            }
        }
    },
    hover: {}
};
