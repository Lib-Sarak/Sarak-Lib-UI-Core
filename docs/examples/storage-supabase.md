# Exemplo: `UIStorageAdapter` sobre Supabase

> Documentação, não dependência: `@supabase/supabase-js` **não** entra em `dependencies` nem
> `peerDependencies` da Sarak-Lib-UI-Core. Este código é validado por teste de tipo (sem rede) em
> `backend/node/__tests__/storageSupabaseExample.test.ts`, contra o arquivo espelho
> `docs/examples/storage-supabase.example.ts` — cole-o no seu próprio projeto e injete o client
> Supabase real que você já instala lá.

## Por que um adapter, e não `connectionString`

Consumidores que acessam o Postgres por API (Supabase URL + KEY, PostgREST) — não pela `connectionString`
direta que o driver `pg` exige — não conseguem usar o adapter de referência da lib. A porta
`UIStorageAdapter` (Spec 19) existe exatamente para este caso: você implementa as 7 operações do jeito
que seu provider fala, e injeta via `{ storage: meuAdapter }` em qualquer handler.

## Schema Supabase sugerido (simplificado)

O layout de armazenamento é **decisão do adapter**, não do contrato — só o shape do `UIStorageAdapter`
importa (ver `docs/ui-storage-contract.md` §1 para o schema granular do adapter pg/sqlite de referência).
Este exemplo usa um schema mais simples, com o design inteiro numa única coluna `jsonb`:

```sql
create table custom_themes (
  id uuid primary key default gen_random_uuid(),
  system text default 'global',
  owner_id uuid,
  name text not null,
  description text,
  is_public boolean default false,
  is_active boolean default false,
  design jsonb default '{}'::jsonb
);

create table system_branding (
  id uuid primary key default gen_random_uuid(),
  system text default 'global',
  owner_id uuid,
  company_name text default 'Sarak OS',
  login_name text default 'Acesso ao Sistema',
  tab_name text default 'Sarak OS',
  logo_base64 text,
  unique (system, owner_id)
);
```

## O adapter

```ts
import { createClient } from '@supabase/supabase-js';
import type {
    UIStorageAdapter,
    UIStorageScope,
    UIThemeCreateInput,
    UIThemeUpdateInput,
    UITheme,
    UIBranding,
} from '@sarak/lib-ui-core/backend/node';

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

export function createSupabaseStorageAdapter(client: ReturnType<typeof createClient>): UIStorageAdapter {
    const findActiveThemeRow = (scope: UIStorageScope) =>
        client.from('custom_themes').select('*').match({ system: scope.system, owner_id: scope.userId, is_active: true }).maybeSingle();

    return {
        async getActiveTheme(scope) {
            const { data } = await findActiveThemeRow(scope);
            return data ? rowToTheme(data) : null;
        },
        async saveActiveDesign(scope, design) {
            const { data: activeRow } = await findActiveThemeRow(scope);
            if (activeRow) {
                const { data } = await client.from('custom_themes').update({ design }).match({ id: activeRow.id }).select('*').single();
                return rowToTheme(data!);
            }
            const { data } = await client
                .from('custom_themes')
                .insert({ system: scope.system, owner_id: scope.userId, name: 'Personalizado', is_active: true, design })
                .select('*')
                .single();
            return rowToTheme(data!);
        },
        async createTheme(scope, input: UIThemeCreateInput) {
            const { data } = await client
                .from('custom_themes')
                .insert({ system: scope.system, owner_id: scope.userId, name: input.name, is_active: input.isActive, design: input.design })
                .select('*')
                .single();
            return rowToTheme(data!);
        },
        async updateTheme(_scope, themeId, input: UIThemeUpdateInput) {
            const patch: Record<string, unknown> = {};
            if (input.name !== undefined) patch.name = input.name;
            if (input.design !== undefined) patch.design = input.design;
            if (input.isActive !== undefined) patch.is_active = input.isActive;
            const { data } = await client.from('custom_themes').update(patch).match({ id: themeId }).select('*').single();
            return data ? rowToTheme(data) : null;
        },
        async activateTheme(scope, themeId) {
            await client.from('custom_themes').update({ is_active: false }).match({ system: scope.system, owner_id: scope.userId }).select('*').single();
            const { data } = await client.from('custom_themes').update({ is_active: true }).match({ id: themeId }).select('*').single();
            return data ? rowToTheme(data) : null;
        },
        async getBranding(scope) {
            const { data } = await client.from('system_branding').select('*').match({ system: scope.system, owner_id: scope.userId }).maybeSingle();
            return data ? rowToBranding(data) : null;
        },
        async saveBranding(scope, branding) {
            const { data } = await client
                .from('system_branding')
                .insert({ system: scope.system, owner_id: scope.userId, ...brandingToDbFields(branding) })
                .select('*')
                .single();
            return rowToBranding(data!);
        },
    };
}
```

## Uso

```ts
import { createClient } from '@supabase/supabase-js';
import { createSarakUIExpressMiddleware } from '@sarak/lib-ui-core/backend/node';
import { createSupabaseStorageAdapter } from './createSupabaseStorageAdapter';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

app.use(createSarakUIExpressMiddleware({
    storage: createSupabaseStorageAdapter(supabase),
}));
```

Nenhuma `connectionString` de Postgres é necessária — o Supabase é acessado por API (URL + chave), o
caso real que motivou esta spec (consumidor com adapter manual e `POST /api/ui/design` "dummy").
