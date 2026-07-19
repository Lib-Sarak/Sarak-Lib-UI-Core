# Contrato da Porta de Persistência de UI

> Fonte da verdade: `backend/node/contract.ts` (o teste `backend/node/__tests__/contract.test.ts`
> roda os handlers de referência e compara as chaves da resposta real contra este documento —
> divergência é bug, não "documentação desatualizada"). Ver Spec 19 (`specs/plan/19-porta-de-persistencia-ui.md`).

## 0. Princípio

A Sarak-Lib-UI-Core **declara** duas estruturas de dados e 7 operações sobre elas. Ela **não escolhe**
onde/como esses dados vivem — qualquer banco (Postgres, SQLite, MySQL…), qualquer provider (Supabase,
Firebase, AWS…), qualquer linguagem de backend (Node, Python, PHP, Go…) pode implementar este contrato.

Duas portas equivalentes, para dois níveis de acoplamento diferentes:

- **Porta em código** (`UIStorageAdapter`, TypeScript/Node) — para quem já está no ecossistema Node da lib.
- **Porta em rede** (5 endpoints REST) — para qualquer backend, em qualquer linguagem. Um servidor
  Python/PHP/Go que implemente esses 5 endpoints substitui a ponte Node inteira; o frontend
  (`SarakUIProvider`) não sabe a diferença.

## 1. Estruturas de dados

### 1.1 `custom_themes`

Um tema é um design completo do Design Engine, guardado como colunas top-level + 9 colunas JSONB
granulares (mapeadas por família — ver `src/core/Design/catalog/theme_table_mapping.json`).

| Coluna | Tipo | Semântica |
|---|---|---|
| `id` | uuid/text | Chave primária. |
| `name` | string | Nome do tema (`"Personalizado"` no autosave; livre nos temas nomeados). |
| `description` | string \| null | Opcional. |
| `system` | string | Namespace lógico do consumidor (default `'global'`) — separa temas de sistemas diferentes na mesma tabela. |
| `owner_id` | string \| null | Dono do tema; `null` = tema global do `system` (compartilhado). Resolução de escopo tem fallback: se o usuário não tem tema ativo próprio, cai para o ativo global. |
| `is_public` | boolean | Reservado para compartilhamento entre usuários (não usado pelos endpoints atuais). |
| `is_active` | boolean | Só um tema é `is_active = true` por `(system, owner_id)` — ativar um desativa os demais do escopo. |
| `mode`, `navigation_style`, `body_size` | string | Colunas top-level (fora do JSONB granular). |
| `branding_config`, `colors_and_atmosphere`, `typography`, `layout_and_navigation`, `components_base`, `cards_engine`, `data_and_charts`, `motion_and_animation`, `specialized_engines` | jsonb/json | As ~416 chaves de token do Design Engine, particionadas por família. O consumidor nunca escreve nelas diretamente — a porta (`UIStorageAdapter`) faz o merge granular a partir de um objeto `design` flat. |
| `created_at`, `updated_at` | timestamp | Auditoria. |

Nomenclatura das tabelas físicas: **schema Postgres configurável** (`options.schema`, default `'ui_core'`)
OU **prefixo de tabela** (`options.tablePrefix`, default `'ui_core_'`) quando o banco não tem schemas
nomeados (SQLite, MySQL). Nunca hardcoded — ver §4.

### 1.2 `system_branding`

Identidade corporativa (nome, título de aba, logo) por escopo `(system, owner_id)`.

| Coluna | Tipo | Semântica |
|---|---|---|
| `id` | uuid/text | Chave primária. |
| `system`, `owner_id` | string / string \| null | Mesmo escopo de `custom_themes`; `UNIQUE(system, owner_id)`. |
| `company_name` | string | Default `'Sarak OS'`. |
| `login_name` | string | Default `'Acesso ao Sistema'`. |
| `tab_name` | string | Default `'Sarak OS'`. |
| `logo_base64` | string \| null | Logo embutido (data URI). |
| `created_at`, `updated_at` | timestamp | Auditoria. |

## 2. Porta em código — `UIStorageAdapter`

```ts
interface UIStorageScope {
    system: string;
    userId: string | null;
}

interface UITheme {
    id: string;
    name: string;
    description: string | null;
    system: string;
    ownerId: string | null;
    isPublic: boolean;
    isActive: boolean;
    design: Record<string, unknown>; // flatten das 9 colunas granulares + top-level
}

interface UIBranding {
    companyName: string;
    loginName: string;
    tabName: string;
    logoBase64: string | null;
}

interface UIStorageAdapter {
    getActiveTheme(scope: UIStorageScope): Promise<UITheme | null>;
    saveActiveDesign(scope: UIStorageScope, design: Record<string, unknown>): Promise<UITheme>;
    createTheme(scope: UIStorageScope, input: { name: string; design: Record<string, unknown>; isActive: boolean }): Promise<UITheme>;
    updateTheme(scope: UIStorageScope, themeId: string, input: { name?: string; design?: Record<string, unknown>; isActive?: boolean }): Promise<UITheme | null>;
    activateTheme(scope: UIStorageScope, themeId: string): Promise<UITheme | null>;
    getBranding(scope: UIStorageScope): Promise<UIBranding | null>;
    saveBranding(scope: UIStorageScope, branding: Record<string, unknown>): Promise<UIBranding>;
}
```

Exportada por `@sarak/lib-ui-core/backend/node`. Os handlers (`createDesignApiHandler`,
`createBrandingApiHandler`, `createThemesApiHandler`, `createSarakUIExpressMiddleware`) aceitam:

```ts
{ storage: UIStorageAdapter }             // adapter próprio — bypassa pg/sqlite por completo
// OU
{ connectionString: string, schema?, tablePrefix? }  // adapter de referência (pg ou sqlite, auto-detectado)
```

**Implementações de referência embarcadas:** `createPostgresStorageAdapter`/`createSqliteStorageAdapter`
(mesmo comportamento que a lib sempre teve — agora atrás da porta). **Providers externos** (Supabase,
Firebase, AWS…) não entram como dependência da lib — são exemplos documentados da interface: ver
`docs/examples/storage-supabase.md`.

## 3. Porta em rede — os 5 endpoints REST

Base default: `/api/ui` (`SarakUIOptions.endpoints.baseUrl`; `{base}` abaixo). Autenticação/tenant é
resolvida pelo consumidor via `options.getUserId(req)` — a lib não embute nenhuma lógica de auth (Spec 08 §6.2).

### 3.1 Design (tema ativo)

| Método | Path | Uso |
|---|---|---|
| `GET` | `{base}/design` | Lê o design do tema ativo do escopo. |
| `POST` | `{base}/design` | Salva o design do tema ativo (cria "Personalizado" se não houver um). |

**`GET` — 200 (sem tema ativo):**
```json
{ "design": {} }
```
**`GET` — 200 (com tema ativo):**
```json
{
  "id": "uuid", "name": "Personalizado", "description": null,
  "system": "global", "owner_id": null, "is_public": false, "is_active": true,
  "design": { "mode": "light", "primaryColor": "#123456", "...": "..." }
}
```
**`POST` — body:**
```json
{ "design": { "mode": "light", "primaryColor": "#123456" } }
```
**`POST` — 200:** mesmo shape do `GET` com tema ativo (tema criado/atualizado).

### 3.2 Branding

| Método | Path | Uso |
|---|---|---|
| `GET` | `{base}/branding` | Lê o branding do escopo. |
| `POST` | `{base}/branding` | Cria ou atualiza o branding do escopo (upsert). |

**`GET` — 200:**
```json
{ "branding": { "companyName": "Automação Ltda", "loginName": "Acesso ao Sistema", "tabName": "Automação", "logoBase64": null } }
```
(ou `{ "branding": {} }` se não cadastrado)

**`POST` — body:**
```json
{ "branding": { "companyName": "Automação Ltda", "tabName": "Automação" } }
```
**`POST` — 200:**
```json
{ "success": true }
```

### 3.3 Temas nomeados

| Método | Path | Uso |
|---|---|---|
| `POST` | `{base}/themes` | Cria um tema nomeado. |
| `PUT` | `{base}/themes/:id` | Atualiza nome/design/ativação de um tema existente. |
| `PUT` | `{base}/themes/:id/activate` | Ativa o tema (desativa os demais do escopo). |

**`POST {base}/themes` — body:**
```json
{ "name": "Meu Tema", "design": { "mode": "light" }, "is_active": false }
```
**200:** mesmo shape do tema (`id, name, description, system, owner_id, is_public, is_active, design`).

**`PUT {base}/themes/:id` — body:** mesmos campos, todos opcionais (`{ "name": "Novo nome" }` é válido).
**200:** tema atualizado. **404** se `:id` não existir: `{ "error": "Tema não encontrado" }`.

**`PUT {base}/themes/:id/activate` — sem body.**
**200:** tema ativado. **404** se `:id` não existir: `{ "error": "Tema não encontrado" }`.

### 3.4 Erros

Qualquer rota pode devolver `500` em falha de infraestrutura: `{ "error": "Internal Server Error" }`.
As rotas de tema por id devolvem `404` com `{ "error": "Tema não encontrado" }` quando `:id` não existe.

## 4. Configuração de schema/prefixo (fim do `ui_core` fixo)

```ts
// Postgres com schema próprio (ex.: consumidor com convenção PascalCase de schema)
createSarakUIExpressMiddleware({ connectionString: process.env.DATABASE_URL, schema: 'MeuSchema' });

// SQLite/banco sem schema nomeado, com prefixo de tabela próprio
createSarakUIExpressMiddleware({ connectionString: './app.db', tablePrefix: 'meu_app_' });

// Storage 100% custom (nenhum SQL da lib é executado)
createSarakUIExpressMiddleware({ storage: meuAdapterSupabase });
```

`schema`/`tablePrefix` são validados por um regex estrito (`^[A-Za-z_][A-Za-z0-9_-]*$`) antes de qualquer
interpolação em texto de query — nunca concatenação livre (identificador de tabela/schema não é bindável
como valor pelos drivers `pg`/`better-sqlite3`).

## 5. Ver também

- `docs/examples/storage-supabase.md` — implementação de `UIStorageAdapter` sobre Supabase (PostgREST),
  ~40 linhas, sem SDK novo na lib.
- `specs/specs/08-consumo-externo-e-integracao.md` — contrato geral de consumo externo da lib.
