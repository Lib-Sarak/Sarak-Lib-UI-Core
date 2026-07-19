/**
 * Exemplo de referência mantido em `.ts` para ser type-checado por
 * `backend/node/__tests__/storageSupabaseExample.test.ts` (Spec 19 — "validação
 * por teste de tipo, sem rede"). O import abaixo usa o caminho relativo do
 * MONOREPO da própria lib só para o type-check funcionar aqui dentro; um
 * consumidor real importa de `@sarak/lib-ui-core/backend/node` (ver
 * `docs/examples/storage-supabase.md`, que espelha este arquivo).
 *
 * Layout de armazenamento é DECISÃO DO ADAPTER: aqui usamos uma única coluna
 * jsonb `design` (mais simples que o schema granular do adapter pg/sqlite de
 * referência — `docs/ui-storage-contract.md` §1) porque só o shape de
 * `UIStorageAdapter` é contrato; como os dados ficam guardados não é.
 */
import type {
    UIStorageAdapter,
    UIStorageScope,
    UIThemeCreateInput,
    UIThemeUpdateInput,
    UITheme,
    UIBranding,
} from '../../backend/node/storageAdapter';

interface PostgrestResult<T> {
    data: T | null;
    error: { message: string } | null;
}

/** Shape estrutural mínimo do client Supabase usado aqui — compatível com o `SupabaseClient` real (`@supabase/supabase-js`), sem depender do pacote. */
export interface SupabaseLikeClient {
    from(table: string): {
        select(columns: string): {
            match(query: Record<string, unknown>): { maybeSingle(): Promise<PostgrestResult<Record<string, unknown>>> };
        };
        insert(row: Record<string, unknown>): { select(columns: string): { single(): Promise<PostgrestResult<Record<string, unknown>>> } };
        update(row: Record<string, unknown>): {
            match(query: Record<string, unknown>): { select(columns: string): { single(): Promise<PostgrestResult<Record<string, unknown>>> } };
        };
    };
}

const rowToTheme = (row: Record<string, unknown>): UITheme => ({
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    system: row.system as string,
    ownerId: (row.owner_id as string) ?? null,
    isPublic: Boolean(row.is_public),
    isActive: Boolean(row.is_active),
    design: (row.design as Record<string, unknown>) ?? {},
});

const rowToBranding = (row: Record<string, unknown>): UIBranding => ({
    companyName: row.company_name as string,
    loginName: row.login_name as string,
    tabName: row.tab_name as string,
    logoBase64: (row.logo_base64 as string) ?? null,
});

/** `UIBranding` parcial (camelCase, o shape que a porta recebe) → colunas snake_case. */
const brandingToDbFields = (branding: Record<string, unknown>): Record<string, unknown> => {
    const dbData: Record<string, unknown> = {};
    if (branding.companyName !== undefined) dbData.company_name = branding.companyName;
    if (branding.loginName !== undefined) dbData.login_name = branding.loginName;
    if (branding.tabName !== undefined) dbData.tab_name = branding.tabName;
    if (branding.logoBase64 !== undefined) dbData.logo_base64 = branding.logoBase64;
    return dbData;
};

export function createSupabaseStorageAdapter(client: SupabaseLikeClient): UIStorageAdapter {
    const findActiveThemeRow = (scope: UIStorageScope) =>
        client.from('custom_themes').select('*').match({ system: scope.system, owner_id: scope.userId, is_active: true }).maybeSingle();

    return {
        async getActiveTheme(scope: UIStorageScope) {
            const { data } = await findActiveThemeRow(scope);
            return data ? rowToTheme(data) : null;
        },
        async saveActiveDesign(scope: UIStorageScope, design: Record<string, unknown>) {
            const { data: activeRow } = await findActiveThemeRow(scope);
            if (activeRow) {
                const { data } = await client.from('custom_themes').update({ design }).match({ id: activeRow.id }).select('*').single();
                return rowToTheme(data as Record<string, unknown>);
            }
            const { data } = await client
                .from('custom_themes')
                .insert({ system: scope.system, owner_id: scope.userId, name: 'Personalizado', is_active: true, design })
                .select('*')
                .single();
            return rowToTheme(data as Record<string, unknown>);
        },
        async createTheme(scope: UIStorageScope, input: UIThemeCreateInput) {
            const { data } = await client
                .from('custom_themes')
                .insert({ system: scope.system, owner_id: scope.userId, name: input.name, is_active: input.isActive, design: input.design })
                .select('*')
                .single();
            return rowToTheme(data as Record<string, unknown>);
        },
        async updateTheme(_scope: UIStorageScope, themeId: string, input: UIThemeUpdateInput) {
            const patch: Record<string, unknown> = {};
            if (input.name !== undefined) patch.name = input.name;
            if (input.design !== undefined) patch.design = input.design;
            if (input.isActive !== undefined) patch.is_active = input.isActive;
            const { data } = await client.from('custom_themes').update(patch).match({ id: themeId }).select('*').single();
            return data ? rowToTheme(data) : null;
        },
        async activateTheme(scope: UIStorageScope, themeId: string) {
            await client.from('custom_themes').update({ is_active: false }).match({ system: scope.system, owner_id: scope.userId }).select('*').single();
            const { data } = await client.from('custom_themes').update({ is_active: true }).match({ id: themeId }).select('*').single();
            return data ? rowToTheme(data) : null;
        },
        async getBranding(scope: UIStorageScope) {
            const { data } = await client.from('system_branding').select('*').match({ system: scope.system, owner_id: scope.userId }).maybeSingle();
            return data ? rowToBranding(data) : null;
        },
        async saveBranding(scope: UIStorageScope, branding: Record<string, unknown>) {
            const { data } = await client
                .from('system_branding')
                .insert({ system: scope.system, owner_id: scope.userId, ...brandingToDbFields(branding) })
                .select('*')
                .single();
            return rowToBranding(data as Record<string, unknown>);
        },
    };
}
