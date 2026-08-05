import { MasterDesignSchema, SarakTokenValue } from './types';
import { GlobalSchema } from './schema/global';
import { BrandingSchema } from './schema/branding';
import { SystemSchema } from './schema/system';
import { NavigationSchema } from './schema/navigation';
import { CardSchema } from './schema/cards';
import { CardTitleSchema } from './schema/card-title';
import { CardActionSchema } from './schema/card-action';
import { CardSearchSchema } from './schema/card-search';
import { OverlaysSchema } from './schema/overlays';
import { TablesSchema } from './schema/tables';
import { TypographySchema } from './schema/typography';
import { ButtonsSchema } from './schema/buttons';
import { InputsSchema } from './schema/inputs';
import { SwitchesSchema } from './schema/switches';
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
import { AdvancedSchema } from './schema/advanced';
import { MediaSchema } from './schema/media';
import { StructuralSchema } from './schema/structural';
import themeTableMapping from './catalog/theme_table_mapping.json';

/**
 * MASTER DESIGN MAP (v13.0 - Atomic Granularity)
 * 
 * O ponto central de verdade para 100% das configurações do Sarak UI.
 */
export const MASTER_DESIGN_MAP: MasterDesignSchema = {
    version: '13.0.0',
    components: [
        GlobalSchema,
        BrandingSchema,
        SystemSchema,
        NavigationSchema,
        CardSchema,
        CardTitleSchema,
        CardActionSchema,
        CardSearchSchema,
        OverlaysSchema,
        TablesSchema,
        TypographySchema,
        ButtonsSchema,
        InputsSchema,
        SwitchesSchema,
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
        LayersSchema,
        AdvancedSchema,
        MediaSchema,
        StructuralSchema
    ]
};

/**
 * Helper para obter todos os tokens em uma lista plana.
 */
export const getAllDesignTokens = () => {
    return MASTER_DESIGN_MAP.components.flatMap(c => c.tokens);
};

/**
 * Catálogo de Chaves Estruturais (Alavanca 2): tokens cujo valor não é injetado como
 * CSS Variable, é lido em JS por um Hook Controlador (Camada 6) que decide className/style.
 * Fonte única e viva — nunca copiar esta lista para fora do código (spec 09).
 */
export const getStructuralTokens = () => {
    return getAllDesignTokens().filter(token => !!token.structuralConsumer && token.structuralConsumer.length > 0);
};

/**
 * Helper para obter os valores padrão de todos os tokens.
 */
export const getDefaultDesignState = () => {
    const state: Record<string, SarakTokenValue> = {};
    getAllDesignTokens().forEach(token => {
        state[token.id] = token.defaultValue;
    });
    return state;
};

/**
 * Mapa de Domínios (spec 09 §2.3): agrupa tokens nas duas granularidades usadas
 * por Presets/Temas — por Schema (`bySchema`, ex: "cards", "buttons", escopo fino
 * de um preset de componente) e por Coluna do Banco (`byColumn`, ex: "cards_engine",
 * escopo de persistência, pode agrupar >1 schema). Fonte viva; nunca copiar este
 * resultado para fora do código.
 */
export const getDomainMap = () => {
    const bySchema: Record<string, { label: string; tokenIds: string[] }> = {};
    MASTER_DESIGN_MAP.components.forEach(schema => {
        bySchema[schema.id] = {
            label: schema.label,
            tokenIds: schema.tokens.map(token => token.id)
        };
    });

    const byColumn: Record<string, string[]> = { ...(themeTableMapping as Record<string, string[]>) };

    return { bySchema, byColumn };
};

/**
 * Gabarito Dinâmico (spec 09): devolve o scaffold de valores-padrão vivo, fatiado
 * por domínio (id de Schema OU coluna do banco, ver `getDomainMap`). Sem argumento,
 * devolve o scaffold completo (equivalente a um Tema). É a fonte que qualquer
 * Preset/Tema/Agente deve consultar para saber quais chaves preencher — nunca uma
 * cópia estática (ex: `masterTemplate` hardcoded).
 */
export const getScaffold = (domain?: string): Record<string, SarakTokenValue> => {
    const fullState = getDefaultDesignState();
    if (!domain) return fullState;

    const { bySchema, byColumn } = getDomainMap();
    const tokenIds = byColumn[domain] || bySchema[domain]?.tokenIds;
    if (!tokenIds) return {};

    const scaffold: Record<string, SarakTokenValue> = {};
    tokenIds.forEach(id => {
        if (id in fullState) scaffold[id] = fullState[id];
    });
    return scaffold;
};

/**
 * Theme Migration/Upgrader (Pacote Fechado Retrocompatível)
 * Garante que temas antigos incorporem chaves novas com seus "legacyValues",
 * mantendo-os como pacotes imutáveis e blindados contra fallbacks dinâmicos.
 */
// `themePayload` é um pacote de tema vindo do banco/preset (chaves dinâmicas,
// fora do nosso controle): fronteira dinâmica de verdade → `Record<string, unknown>`.
export const upgradeThemePayload = (themePayload: Record<string, unknown>) => {
    const upgraded = { ...themePayload };
    getAllDesignTokens().forEach(token => {
        // Se a chave não existe no payload
        if (upgraded[token.id] === undefined) {
            // Se o token possui um legacyValue definido (Zero Absoluto para temas antigos)
            if (token.legacyValue !== undefined) {
                upgraded[token.id] = token.legacyValue;
            }
        }
    });
    return upgraded;
};
