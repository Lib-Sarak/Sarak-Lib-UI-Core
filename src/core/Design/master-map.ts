import { MasterDesignSchema } from './types';
import { CardSchema } from './schema/cards';
import { ShellSchema } from './schema/shell';
import { TypographySchema } from './schema/typography';
import { ControlsSchema } from './schema/controls';
import { AtmosphereSchema } from './schema/atmosphere';
import { DataSchema } from './schema/data';
import { IdentitySchema } from './schema/identity';
import { AnimationSchema } from './schema/animations';
import { SpecializedSchema } from './schema/specialized';

/**
 * MASTER DESIGN MAP (v11.0)
 * 
 * O ponto central de verdade para 100% das configurações do Sarak UI.
 * Este objeto é usado para:
 * 1. Gerar a UI do Painel de Personalização automaticamente.
 * 2. Validar a persistência (localStorage/backend).
 * 3. Injetar variáveis CSS no DOM.
 * 4. Definir a estrutura de Presets.
 */
export const MASTER_DESIGN_MAP: MasterDesignSchema = {
    version: '11.0.0',
    components: [
        ShellSchema,
        IdentitySchema,
        TypographySchema,
        AtmosphereSchema,
        CardSchema,
        ControlsSchema,
        DataSchema,
        AnimationSchema,
        SpecializedSchema
    ]
};

/**
 * Helper para obter todos os tokens em uma lista plana.
 */
export const getAllDesignTokens = () => {
    return MASTER_DESIGN_MAP.components.flatMap(c => c.tokens);
};

/**
 * Helper para obter os valores padrão de todos os tokens.
 */
export const getDefaultDesignState = () => {
    const state: Record<string, any> = {};
    getAllDesignTokens().forEach(token => {
        state[token.id] = token.defaultValue;
    });
    return state;
};
