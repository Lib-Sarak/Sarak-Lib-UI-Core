/**
 * Lógica pura (dialeto-agnóstica) de mapeamento entre a linha da tabela
 * `system_branding` (snake_case) e o shape `UIBranding` (camelCase) da porta.
 * Compartilhada pelos dois adapters de referência (`adapters/`).
 */
import type { UIBranding } from './storageAdapter';

export interface BrandingRow {
    id: string;
    company_name: string;
    login_name: string;
    tab_name: string;
    logo_base64: string | null;
}

export const rowToUIBranding = (row: BrandingRow): UIBranding => ({
    companyName: row.company_name,
    loginName: row.login_name,
    tabName: row.tab_name,
    logoBase64: row.logo_base64,
});

/** Mapeia o payload camelCase (`UIBranding` parcial) para as colunas snake_case do banco. */
export const brandingInputToDbFields = (input: Record<string, unknown>): Record<string, unknown> => {
    const dbData: Record<string, unknown> = {};
    if (input.companyName !== undefined) dbData.company_name = input.companyName;
    if (input.loginName !== undefined) dbData.login_name = input.loginName;
    if (input.tabName !== undefined) dbData.tab_name = input.tabName;
    if (input.logoBase64 !== undefined) dbData.logo_base64 = input.logoBase64;
    return dbData;
};
