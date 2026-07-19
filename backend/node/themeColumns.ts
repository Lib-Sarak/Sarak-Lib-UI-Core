/**
 * Lógica pura (dialeto-agnóstica) de mapeamento entre a linha da tabela `custom_themes`
 * (colunas top-level + granulares JSONB) e o shape `UITheme`/design flat que o
 * frontend consome. Compartilhada pelos dois adapters de referência (`adapters/`).
 */
import ThemeMappingRaw from '../../src/core/Design/catalog/theme_table_mapping.json';
import type { UITheme } from './storageAdapter';

const ThemeMapping: Record<string, string[]> = ThemeMappingRaw;

export const GRANULAR_COLUMNS = [
    'branding_config',
    'colors_and_atmosphere',
    'typography',
    'layout_and_navigation',
    'components_base',
    'cards_engine',
    'data_and_charts',
    'motion_and_animation',
    'specialized_engines',
];

export const TOP_LEVEL_COLUMNS = ['mode', 'navigation_style', 'body_size'];

export interface ThemeRow {
    id: string;
    name: string;
    description: string | null;
    system: string;
    owner_id: string | null;
    is_public: boolean;
    is_active: boolean;
    [key: string]: unknown;
}

/** Flatten das colunas granulares + top-level num único objeto de design. */
export const flattenTheme = (theme: ThemeRow): Record<string, unknown> => {
    const designFlat: Record<string, unknown> = {};
    for (const col of TOP_LEVEL_COLUMNS) {
        if (theme[col] !== undefined && theme[col] !== null) designFlat[col] = theme[col];
    }
    for (const col of GRANULAR_COLUMNS) {
        const value = theme[col];
        if (value && typeof value === 'object') Object.assign(designFlat, value);
    }
    return designFlat;
};

const resolveGranularColumn = (key: string): string => {
    for (const [col, fields] of Object.entries(ThemeMapping)) {
        if (GRANULAR_COLUMNS.includes(col) && fields.includes(key)) return col;
    }
    return 'branding_config';
};

/** Merge de updates (top-level + granular) a partir do design recebido. */
export const mergeUpdates = (
    updateDesign: Record<string, unknown>,
    currentTheme: Partial<ThemeRow>,
): Record<string, unknown> => {
    const updates: Record<string, unknown> = {};
    const granularData: Record<string, Record<string, unknown>> = {};
    for (const col of GRANULAR_COLUMNS) {
        granularData[col] = (currentTheme[col] as Record<string, unknown>) || {};
    }
    for (const [key, value] of Object.entries(updateDesign)) {
        if (TOP_LEVEL_COLUMNS.includes(key) || GRANULAR_COLUMNS.includes(key)) {
            updates[key] = value;
        } else {
            granularData[resolveGranularColumn(key)][key] = value;
        }
    }
    for (const col of GRANULAR_COLUMNS) {
        updates[col] = granularData[col];
    }
    return updates;
};

/** `ThemeRow` (snake_case, formato de banco) → `UITheme` (camelCase, formato da porta). */
export const rowToUITheme = (row: ThemeRow): UITheme => ({
    id: row.id,
    name: row.name,
    description: row.description,
    system: row.system,
    ownerId: row.owner_id,
    isPublic: row.is_public,
    isActive: row.is_active,
    design: flattenTheme(row),
});

/** `UITheme` (porta) → shape de resposta HTTP (contrato histórico, snake_case — Spec 19 §2.3). */
export const uiThemeToResponse = (theme: UITheme) => ({
    id: theme.id,
    name: theme.name,
    description: theme.description,
    system: theme.system,
    owner_id: theme.ownerId,
    is_public: theme.isPublic,
    is_active: theme.isActive,
    design: theme.design,
});
