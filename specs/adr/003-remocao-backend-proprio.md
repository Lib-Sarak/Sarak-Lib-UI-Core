---
tipo: "adr"
titulo: "Remoção do backend próprio — tema é dado no código do consumidor"
status: "🟢 Aceito"
tags: ["adr", "remocao", "backend", "persistencia", "seguranca", "temas"]
relacionados: ["[[001-tres-arquiteturas]]", "[[002-remocao-motor-manifesto]]", "[[005-modelo-modulos-plugin-e-apps-separados]]"]
substitui: ""
substituido_por: ""
---

# 1. Contexto e Problema

**Data da decisão: 2026-07-22 · Executada em 2026-07-24.**

A Sarak-Lib-UI-Core é uma biblioteca de **front**. Mesmo assim, ela mantinha um backend próprio para persistir temas e branding: uma ponte Node (`backend/node/`) com drivers de Postgres e SQLite, uma implementação Python (`backend/sarak_ui_core/`), scripts SQL, um segundo build `tsup` produzindo `dist/backend-node`, um export dedicado no `package.json`, e um contrato REST de cinco endpoints que o próprio front chamava — inclusive `options.endpoints.branding`, um `fetch` a servidor.

Três problemas convergiram:

**1. É passivo de segurança que não pertence à lib.** Endpoint, banco e autenticação são superfície de ataque. Uma biblioteca de front que embarca servidor obriga todo consumidor a herdar essa superfície, sem que ela resolva nenhum problema de renderização.

**2. A ponte não era genérica, apesar de se dizer genérica.** As queries Postgres tinham o schema `"ui_core"` literal — um consumidor com regra de schema própria foi forçado a **patchear `node_modules` via postinstall** para instalar. Os handlers exigiam `connectionString`, então um consumidor que acessa o banco por API (Supabase/PostgREST) simplesmente não conseguia usar a ponte: no teste real, o adapter manual ficou com um `POST /design` *dummy* — salvar tema não persistia, e o endpoint respondia sucesso falso.

**3. Com temas virando dado no código do consumidor, o backend perdeu função.** O pedido explícito do mantenedor era que o importador criasse temas em JSON dentro do próprio repositório. O `SarakUIProvider` já aceitava `customThemes`. Persistir a *definição* de um tema num banco da lib passou a ser resolver um problema que ninguém tinha.

Houve uma tentativa anterior de consertar em vez de remover — a "porta de persistência" de 2026-07-18, que criou a interface `UIStorageAdapter`, tornou schema e prefixo de tabela configuráveis e documentou o contrato REST. Ela resolveu os sintomas do item 2, mas não os itens 1 e 3: **a lib continuava sendo dona de um servidor.**

A distinção que destravou a decisão foi separar três necessidades de persistência que estavam misturadas numa só:

| O que persistir | Onde | Precisa de backend da lib? |
| --- | --- | --- |
| **Definição** de tema/template (o dev cria) | JSON no código do consumidor | Não — é código |
| **Seleção** do usuário final (sobreviver ao reload) | `localStorage` | Não |
| **Sync multi-dispositivo** (opcional) | Backend **do consumidor**, via callback | Só se ele quiser, e é dele |

Nenhuma das três exige servidor **da biblioteca**.

# 2. Decisão

**Remover o backend próprio por completo.** Saíram: `backend/node/`, `backend/sarak_ui_core/`, `backend/sql/`, o segundo comando `tsup` do `build:js`, o artefato `dist/backend-node.*`, o export `./backend/node`, as dependências `pg`/`better-sqlite3`, o gerador de servidor do scaffolder, e `options.endpoints.branding` como `fetch` a servidor.

No lugar:

- **Tema é dado no código do consumidor** — arquivos JSON no repositório dele, passados por `customThemes` ao `SarakUIProvider`.
- **A seleção do usuário final vive em `localStorage`**, na camada Provider/Design.
- **O painel de customização EXPORTA JSON** — "salvar novo tema" passou a significar exportar o conjunto completo de tokens para o dev colar num arquivo, não gravar num servidor.
- **`onThemeChange` é a porta "traga sua persistência"** — quem quiser sincronizar no backend *dele* usa o callback. A lib nunca faz `fetch`/`POST` para servidor nenhum.

Esta decisão **supersede a porta de persistência** de 2026-07-18: a interface de storage, os adapters de referência e o contrato REST de cinco endpoints deixaram de existir junto com o backend que os hospedava.

## A fronteira que substituiu a validação server-side

Tirar o servidor tira também a validação que acontecia nele. O que assumiu esse papel é `validateDesign`, em `src/core/Provider/utils/validation.ts:184`.

Ele foi reescrito nesta decisão: antes apenas clampava cinco campos fixos e **deixava passar qualquer chave**. Passou a validar contra o catálogo real de tokens — domínio de chaves fechado, cada valor tipo-checado pela definição do próprio token (número com clamp, enum contra as opções declaradas, cor contra padrão seguro, texto contra um filtro anti-breakout de CSS), e chave desconhecida descartada com aviso, nunca injetada.

Isso é o que torna `localStorage` e um JSON de tema escrito à mão **seguros por construção**: a validação vale igual para qualquer origem, porque ela é a fronteira — não uma checagem de conveniência que existia só no caminho do servidor.

## Prova de que a remoção está completa

```
$ test -d backend && echo EXISTE || echo "NAO EXISTE"
NAO EXISTE
```

E o campo removido: `options.endpoints` ainda existe em `src/core/Provider/types.ts:145`, mas hoje contém apenas `discoveryPath`/`discovery` — o `branding` que apontava para um servidor não está mais lá.

# 3. Consequências

- **Positivas:**
  - **Uma biblioteca de front deixa de embarcar superfície de ataque.** Sem endpoint, sem banco, sem credencial, sem driver.
  - **A instalação encolhe e simplifica:** duas dependências de driver a menos, um build a menos, um export a menos, um gerador de servidor a menos no scaffolder.
  - **A segurança do tema melhorou ao mesmo tempo em que o servidor saiu** — e melhorou onde importa, porque `validateDesign` protege *toda* origem de tema, não só a que passava pelo servidor.
  - **O consumidor ganha liberdade real de infraestrutura.** Quem quer sincronizar tema entre dispositivos implementa um callback contra o próprio backend, com o próprio schema e a própria autenticação. A lib não escolhe nada por ele.

- **Negativas (Trade-offs):**
  - **BREAKING CHANGE conhecido e não mitigado:** o `Sarak-MyService` passava `options.endpoints.branding: '/api/ui/branding'`. O campo deixou de existir, e a correção é no repositório dele — não houve camada de compatibilidade.
  - **Sync de tema entre dispositivos deixa de vir pronto.** Quem precisar escreve. A lib oferece a porta, não a implementação.
  - **Documentação que virou ficção.** A spec de pipeline de tema descrevia `router.py`, `models.py`, a tabela `ui_core.custom_themes` e o contrato REST completo dos endpoints (§4/§5/§6 de `specs/arquitetura/09-pipeline-criacao-aplicacao-tema.md`) — tudo passou a descrever código que não existe mais, e permaneceu assim até a reescrita da base de specs.
  - **Uma dependência real ficou exposta ao remover o driver.** `@types/node` nunca tinha sido dependência direta: chegava transitivamente por `@types/pg`. Tirar o driver quebrou o build de tipos, e o acoplamento acidental teve de ser corrigido explicitamente. Lição: remover uma dependência revela o que ela carregava por acidente.
