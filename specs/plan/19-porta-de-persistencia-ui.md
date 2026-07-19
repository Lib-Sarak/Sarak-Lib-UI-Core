---
tipo: "spec"
titulo: "Porta de Persistência de UI (Storage Agnóstico + Contrato REST)"
dominio: "Backend Bridge / Arquitetura de Portas"
status: "🟢 Concluída (2026-07-18)"
prioridade: "Máxima"
tags: ["spec", "backend", "persistencia", "porta", "storage", "schema"]
relacionados: ["08-consumo-externo-e-integracao", "01-painel-customizacao-temas"]
---

# 1. Visão Geral e Descrição do Problema

**Princípio:** a lib é um renderizador genérico. Em persistência, ela deve declarar APENAS o que precisa (suas tabelas/estruturas e as operações), e o consumidor decide ONDE e COMO isso vive — qualquer banco (Postgres, SQLite, MySQL...), qualquer provider (Supabase, Firebase, AWS...), qualquer linguagem de backend (Node, Python, PHP...).

Hoje a ponte Node viola isso em três pontos (`backend/node/`):
1. **Schema hardcoded:** as queries PG usam `"ui_core"."custom_themes"` literal (`api.ts`, `branding.ts`, `themes.ts`, `database.ts`). Consumidor com regra de schema próprio (caso real: `"ERP-Iarendel"`) foi forçado a patchear `node_modules` via postinstall.
2. **Acoplamento ao driver:** os handlers exigem `connectionString` (driver `pg` direto ou arquivo SQLite). Consumidor que acessa o banco por API (Supabase URL+KEY/PostgREST) não consegue usar a ponte — no teste real, o adapter manual ficou com `POST /api/ui/design` dummy (salvar tema não persistia) e `/api/ui/themes` respondendo sucesso falso.
3. **Contrato não documentado:** o frontend chama 5 endpoints (`GET/POST {base}/design`, `GET/POST {base}/branding`, `POST {base}/themes`, `PUT {base}/themes/:id`, `PUT {base}/themes/:id/activate` — ver `src/core/Provider/hooks/*` e `src/features/DesignEngine/Main/hooks/useThemeActions.ts`), mas não existe documento canônico de request/response para quem quer implementar em outra linguagem.

# 2. Regras de Negócio (Solução — arquitetura de porta)

## 2.1 A lib declara a ESTRUTURA, não o lugar
- Documento gerado/estático `docs/ui-storage-contract.md` (nome sugerido) com: as 2 estruturas (`custom_themes`, `system_branding`) — colunas, tipos, semântica (`system`, `owner_id`, `is_active`, colunas granulares JSONB) — e a regra de nomenclatura: **prefixo `ui_core_` nas tabelas** quando não houver schema próprio, OU schema configurável.
- `setupUIDatabase(connectionString, options?)` e todos os handlers passam a aceitar `{ schema?: string }` (PG; default `'ui_core'`) e `{ tablePrefix?: string }` (default `'ui_core_'` no SQLite/sem-schema). Interpolação de identificadores com sanitização estrita (regex `^[A-Za-z_][A-Za-z0-9_-]*$`) — nunca concatenação livre.

## 2.2 Interface `UIStorageAdapter` (porta em código)
```ts
export interface UIStorageAdapter {
    getActiveTheme(scope: { system: string; userId: string | null }): Promise<UITheme | null>;
    saveActiveDesign(scope, design: Record<string, unknown>): Promise<UITheme>;
    createTheme(scope, input: { name: string; design; isActive: boolean }): Promise<UITheme>;
    updateTheme(scope, themeId: string, input): Promise<UITheme | null>;
    activateTheme(scope, themeId: string): Promise<UITheme | null>;
    getBranding(scope): Promise<UIBranding | null>;
    saveBranding(scope, branding: Record<string, unknown>): Promise<UIBranding>;
}
```
- Os handlers atuais (`createDesignApiHandler`/`createBrandingApiHandler`/`createThemesApiHandler`) e o `createSarakUIExpressMiddleware` viram **orquestradores sobre a porta**: aceitam `storage: UIStorageAdapter` OU `connectionString` (que instancia o adapter de referência).
- **Implementações de referência embarcadas:** `pg` e `sqlite` (o código atual, refatorado para trás da interface — sem mudança de comportamento; os testes SQLite existentes viram testes do adapter).
- **Providers externos (Supabase/Firebase/AWS/…):** NÃO entram como dependência nem adapter embarcado. Entram como **exemplos documentados** da interface (ex.: `docs/examples/storage-supabase.md` com implementação de ~40 linhas usando o client injetado pelo consumidor). Least privilege por construção: o consumidor dá à porta só o acesso que quiser.

## 2.3 Contrato REST (porta em rede — para qualquer linguagem)
- Documentar os 5 endpoints (método, path, request body, response shape, códigos de erro) no `docs/ui-storage-contract.md`. Um backend Python/PHP/Go que implemente esses endpoints substitui a ponte Node inteira — o frontend não sabe a diferença.
- Fonte da verdade: extrair os shapes dos handlers existentes; adicionar teste de contrato que valida os handlers de referência contra o documento (mesmos campos).

## 2.4 Escopo negativo
- Nenhum SDK de provider entra em `dependencies`/`peerDependencies`.
- Sem breaking change: `connectionString` puro continua funcionando com defaults atuais.

# 3. Critérios de Aceite
- [x] `createSarakUIExpressMiddleware({ connectionString, schema: 'MeuSchema' })` cria/consulta tabelas no schema informado (PG) — sem patch em node_modules.
- [x] `createSarakUIExpressMiddleware({ storage: meuAdapter })` funciona sem nenhuma connectionString (adapter fake em teste).
- [x] Exemplo Supabase documentado compila e cobre as 7 operações (validação por teste de tipo, sem rede).
- [x] `docs/ui-storage-contract.md` publica estruturas + 5 endpoints; teste de contrato verde contra os adapters de referência.
- [x] Suítes `backend/node/__tests__/` existentes verdes (refactor sem mudança de comportamento).

# 4. Plano de Testes (Quality Gate)
## Unitários
- [x] Adapter fake (memória) → middleware atende os 5 endpoints corretamente.
- [x] Sanitização de `schema`/`tablePrefix` rejeita identificadores inválidos (`"a";DROP`).
## Contrato
- [x] Shapes de request/response dos handlers = documento (teste que compara campos).
## Integração
- [x] SQLite de referência: fluxo completo criar→ativar→get ativo com `tablePrefix` custom.
- [x] PG (se ambiente disponível) com `schema` custom — senão, queries geradas assertadas por snapshot.
