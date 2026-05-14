import { MasterDesignSchema } from './types';
import { BrandingSchema } from './schema/branding';
import { SystemSchema } from './schema/system';
import { NavigationSchema } from './schema/navigation';
import { CardSchema } from './schema/cards';
import { OverlaysSchema } from './schema/overlays';
import { TablesSchema } from './schema/tables';
import { TypographySchema } from './schema/typography';
import { ButtonsSchema } from './schema/buttons';
import { InputsSchema } from './schema/inputs';
import { ColorsSchema } from './schema/colors';
import { DataSchema } from './schema/data';
import { AnimationSchema } from './schema/animations';
import { AtmosphereSchema } from './schema/atmosphere';
import { ChatSchema } from './schema/chat';
import { StatusSchema } from './schema/status';
import { EngineeringSchema } from './schema/engineering';
import { SpecializedSchema } from './schema/specialized';
import { MotionSchema } from './schema/motion';
import { ScrollbarsSchema } from './schema/scrollbars';
import { LayersSchema } from './schema/layers';

/**
 * MASTER DESIGN MAP (v13.0 - Atomic Granularity)
 * 
 * O ponto central de verdade para 100% das configurações do Sarak UI.
 */
export const MASTER_DESIGN_MAP: MasterDesignSchema = {
    version: '13.0.0',
    components: [
        BrandingSchema,
        SystemSchema,
        NavigationSchema,
        CardSchema,
        OverlaysSchema,
        TablesSchema,
        TypographySchema,
        ButtonsSchema,
        InputsSchema,
        ColorsSchema,
        DataSchema,
        AnimationSchema,
        AtmosphereSchema,
        ChatSchema,
        StatusSchema,
        EngineeringSchema,
        SpecializedSchema,
        MotionSchema,
        ScrollbarsSchema,
        LayersSchema
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
