# Prompts de Execução — Onda "Renderizador Genérico" (specs 16-24)

Cada bloco abaixo é um prompt COMPLETO para iniciar a execução de uma spec **numa conversa nova** (agente sem contexto anterior). Copie e cole o bloco inteiro. A ordem dos prompts é a ordem de execução do roteiro (`00-indice.md`). Specs agrupáveis têm prompt único (P8).

Regras comuns já embutidas em todos os prompts: acionar `ui-contexto-repositorio` primeiro; ler `00-indice.md`, `00-progresso.md` e a spec inteira; ao terminar, atualizar status/checkbox/progresso; gates permanentes (`RegistryParity`, `catalog:check`, `npm run build`, testes por pasta, `run_audit.mjs`).

---

## P1 — Spec 16: Tokens Semânticos e Validação de Valores

```
Execute a spec `specs/plan/16-tokens-semanticos-e-validacao-de-valores.md` da Sarak-Lib-UI-Core.

Preparação obrigatória, nesta ordem: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md`; (3) leia a spec 16 inteira; (4) leia as relacionadas `specs/specs/11-engine-declarativa-e-manifestos.md` e `specs/specs/00-manifesto-arquitetural-ui-core.md`. Skills de execução: `ui-arquitetura-design` (tokens/CSS vars) e `sarak:padrao-typescript`.

Contexto essencial: hoje `SarakFlex`/átomos estruturais jogam `gap`/medidas CRUS no CSS (`src/components/atomic/hooks/useStructuralStyles.ts`, `getFlexStyles` ~linha 70) — o padrão ensinado (`"gap": "spacing-md"`) é CSS inválido descartado em silêncio; e o catálogo gerado (`docs/manifest-catalog.md`, gerador `scripts/generate-manifest-catalog.mjs`) não documenta VALORES permitidos, então agentes consumidores inventam tokens.

Entregue: resolutor oficial de tokens semânticos (spacing-* → var com fallback; passthrough p/ CSS válido; warn com sugestão p/ valor desconhecido) aplicado em todos os átomos estruturais; seção "Tokens e valores permitidos" GERADA no catálogo; template starter (`templates/app-starter.manifest.json` + gate `StarterManifest.test.tsx`) validado contra o resolutor; testes conforme o plano da spec.

Ao terminar: `npx vitest run src/core/Manifest` e `src/components/atomic/Layouts` verdes; `npm run catalog` regenerado + `npm run build` verde; `node .agents/skills/ui-auditoria-modulo/scripts/run_audit.mjs` com 0 falhas; atualize o frontmatter da spec, o checkbox no `00-indice.md` e adicione entrada no `00-progresso.md`. NUNCA rode `vitest run` completo sem necessidade — rode por pasta.
```

---

## P2 — Spec 17: Resiliência Leniente e DX de Erros

```
Execute a spec `specs/plan/17-resiliencia-leniente-e-dx-de-erros.md` da Sarak-Lib-UI-Core.

Preparação obrigatória, nesta ordem: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md`; (3) leia a spec 17 inteira; (4) leia as relacionadas `specs/specs/11-engine-declarativa-e-manifestos.md` e `specs/specs/12-modelo-de-seguranca-e-acessibilidade.md`. Skill de execução: `sarak:padrao-typescript`.

Contexto essencial: erro de AUTORIA no manifesto (ex.: `"actions"` como objeto em vez de array) explode em runtime no `LeafNode` e o Error Boundary derruba o container inteiro ("aba vazia"); payload raiz ausente/inválido mostra a mensagem enganosa "Componente desconhecido: ManifestoInvalido" (`SarakManifestRenderer.tsx` + `Registry/Fallback.tsx`). A spec define a matriz de severidade: erro de diretiva DEGRADA (diretiva ignorada + console.warn com exemplo correto, deduplicado por nó); erro estrutural mantém fallback visível; erro real de runtime mantém boundary.

Entregue: `sanitizeDirectives` no pipeline de nós (`src/core/Manifest/nodes/`), telas DX dedicadas para payload ausente/malformado (listando TODOS os erros com paths), testes conforme o plano. NÃO afrouxe segurança (Safe Eval/sanitizeHtml/anti-DoS intactos).

Ao terminar: `npx vitest run src/core/Manifest` verde (incl. Resilience.integration); gates `RegistryParity`/`catalog:check`/`npm run build` verdes; `run_audit.mjs` 0 falhas; atualize frontmatter da spec, checkbox no `00-indice.md` e entrada no `00-progresso.md`.
```

---

## P3 — Spec 18: Shell Consome Design Engine

```
Execute a spec `specs/plan/18-shell-consome-design-engine.md` da Sarak-Lib-UI-Core.

Preparação obrigatória, nesta ordem: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md`; (3) leia a spec 18 inteira; (4) leia as relacionadas `specs/specs/04-estrutura-shell-discovery.md` (o shell LEGADO — referência de paridade) e `specs/specs/01-painel-customizacao-temas.md`. Skills de execução: `ui-arquitetura-design` e `sarak:padrao-typescript`.

Contexto essencial: o Design Engine JÁ emite `--sarak-topbar-bg`/`--sarak-topbar-height`/`--sarak-sidebar-bg` (`src/core/Provider/manifest.ts` ~linhas 69-76 e 228), mas o `ShellRouterNode` (`src/core/Manifest/nodes/ShellRouterNode.tsx`) renderiza as regiões cruas — personalizar a topbar no painel não muda nada no shell do manifesto (regressão de paridade contra o MyService, que consome tudo via `TopbarNav`/`SidebarNav`).

Entregue: chrome de tokens nas regiões do shell (header da topbar com altura/cor; background da sidebar; sempre `var(--x, fallback)`, zero hardcode, namespace `--sx-*` proibido); prop `orientation: 'vertical'|'horizontal'|'auto'` no `SarakShellNav` (`auto` segue `design.navigationStyle` — 'topbar' → horizontal; dock/glass ficam FORA desta spec); catálogo regenerado; testes conforme o plano, incluindo E2E de "mudar cor no painel reflete no shell ao vivo".

Ao terminar: suítes de `src/core/Manifest` e `src/components/atomic/Navigation` verdes; gates `RegistryParity`/`catalog:check`/`npm run build` verdes; `run_audit.mjs` 0 falhas; frontmatter + checkbox + entrada no progresso.
```

---

## P4 — Spec 24: Modo Embarcado e Adoção Incremental

```
Execute a spec `specs/plan/24-modo-embarcado-adocao-incremental.md` da Sarak-Lib-UI-Core.

Preparação obrigatória, nesta ordem: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md`; (3) leia a spec 24 inteira; (4) leia a relacionada `specs/specs/08-consumo-externo-e-integracao.md`. Skills de execução: `ui-arquitetura-design` (CSS escopado) e `sarak:padrao-typescript`; ao editar a skill de importação, respeite o formato de `meta-create-skill`.

Contexto essencial: a lib tem 2 modos de consumo — Modo App (sistema nasce com a lib; validado) e Modo Embarcado (renderizar via manifesto SOBRE um frontend existente; nunca testado). Hoje o `SarakUIProvider` age como dono da página: CSS global com preflight do Tailwind (`src/styles/sarak-base.css:1` → bundle injetado re-estiliza o host), `document.title` sobrescrito (`DesignInjector.tsx:38`, `useSarakUIEffects.ts:29`), vars/data-* no `:root`, `NoiseOverlay`/`SarakBackgroundRenderer` fixos sobre o viewport, fontes globais. Os 5 vazamentos estão tabelados na spec com paths.

Entregue: `SarakUIOptions.mode: 'app'|'embedded'` (default 'app', zero breaking change); variante `dist/sarak-scoped.css` (preflight/utilities confinados a `.sarak-scope`); em embedded, tokens no container (mecanismo do `DesignScope`), overlays/título/fontes globais desligados, portais de toast/overlay recebendo o escopo; gate E2E de não-vazamento BIDIRECIONAL (host intacto + ilha estilizada); seção "Modos de Consumo" na Spec 08; atualizar a pergunta de modo na skill `ui-integra-consumidor` (Etapa 1 já pergunta o modo — remova o aviso de "ainda não implementado" e complete o fluxo embedded), espelhando `.agents` → `.claude` com hash igual.

Ao terminar: suítes de `src/core/Provider` e `src/core/Manifest` verdes SEM modificação nos testes do modo app; gates + `run_audit.mjs` 0 falhas; frontmatter + checkbox + entrada no progresso.
```

---

## P5 — Spec 19: Porta de Persistência de UI

```
Execute a spec `specs/plan/19-porta-de-persistencia-ui.md` da Sarak-Lib-UI-Core.

Preparação obrigatória, nesta ordem: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md`; (3) leia a spec 19 inteira; (4) leia a relacionada `specs/specs/08-consumo-externo-e-integracao.md`. Skill de execução: `sarak:padrao-typescript`; para o documento de contrato, `sarak:test-api-contrato` é referência de forma.

Contexto essencial: princípio da onda — a lib declara APENAS o que precisa (estrutura das tabelas `custom_themes`/`system_branding` e 7 operações), o consumidor decide onde/como (qualquer banco/provider/linguagem). Hoje `backend/node/` viola isso: schema `"ui_core"` hardcoded nas queries PG (`api.ts`, `branding.ts`, `themes.ts`, `database.ts`); handlers exigem `connectionString` (consumidor via API — ex. Supabase URL+KEY — não consegue usar; caso real documentado na spec); contrato REST dos 5 endpoints (design GET/POST, branding GET/POST, themes POST/PUT/:id/PUT/:id/activate) nunca documentado.

Entregue: opções `schema`/`tablePrefix` com sanitização estrita de identificadores; interface `UIStorageAdapter` (7 operações) com os handlers virando orquestradores (aceitam `storage` OU `connectionString`); pg/sqlite refatorados para TRÁS da interface sem mudança de comportamento (testes SQLite existentes em `backend/node/__tests__/` continuam verdes); exemplo Supabase como DOCUMENTAÇÃO (nenhum SDK novo em dependencies/peerDependencies); `docs/ui-storage-contract.md` com estruturas + 5 endpoints + teste de contrato validando os handlers de referência contra o documento.

Ao terminar: `npx vitest run backend/node` verde; `npm run build` verde (inclui dts do backend); `run_audit.mjs` 0 falhas; frontmatter + checkbox + entrada no progresso.
```

---

## P6 — Spec 20: Fronteira de Autenticação

```
Execute a spec `specs/plan/20-fronteira-de-autenticacao.md` da Sarak-Lib-UI-Core.

Preparação obrigatória, nesta ordem: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md`; (3) leia a spec 20 inteira; (4) leia as relacionadas `specs/specs/08-consumo-externo-e-integracao.md` (fronteira de confiança §6) e `specs/specs/11-engine-declarativa-e-manifestos.md`. Skills de execução: `sarak:padrao-typescript`; `sarak:cyber-auth` como CONSULTA de boas práticas (a lib não implementa auth — só renderiza).

Contexto essencial: a lib NÃO autentica — renderiza a tela de login e entrega credenciais ao host pelos canais do contrato (`actions`/`$event` → `networkInterceptor`); provider de auth (próprio/Supabase/Cognito/...) é 100% do consumidor. Lacunas: `SarakAuthScreen` (registrado no NATIVE_COMPONENTS) nunca foi validado ponta-a-ponta via manifesto; não há receita canônica de sessão (onde o token vive, 401→redirect, logout declarativo); risco de acoplamento não auditado.

Entregue: auditoria do `SarakAuthScreen` (`src/components/atomic/Templates/SarakAuthScreen.tsx` + `components/Auth*`) garantindo que todo campo/botão é alcançável via props/`$event`/`actions` (upgrade declarativo onde faltar, padrão `onChange` do motor — mesmo mecanismo do SarakShellNav); E2E de login 100% JSON contra backend fake (login → rota protegida via renderIf → logout → redirect); receita canônica na Spec 08 (§6.2-b) e na skill `ui-integra-escrever-manifesto` (espelhos sincronizados); gate anti-acoplamento (grep: nenhum SDK/leitura de token de provider em `src/`, com allowlist justificada se necessário).

Ao terminar: suítes de `src/core/Manifest` e `src/components/atomic/Templates` verdes; gates + `run_audit.mjs` 0 falhas; frontmatter + checkbox + entrada no progresso.
```

---

## P7 — Spec 23: Remoção do Design Agent (⚠️ contém 2 decisões HITL)

```
Execute a spec `specs/plan/23-remocao-design-agent.md` da Sarak-Lib-UI-Core.

Preparação obrigatória, nesta ordem: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md` (a entrada "Histórico condensado" explica o que o sub-plano Design Agent construiu e o que sobrevive); (3) leia a spec 23 inteira — ela contém o INVENTÁRIO exato com paths. Skills de execução: `ui-refatorar-componente` (remoção com paridade) e `sarak:padrao-typescript`.

ANTES de tocar em qualquer arquivo, resolva com o usuário as 2 decisões HITL da spec: (1) destino do código de `agent-design-operator/` — extração p/ repositório próprio (recomendado) ou deleção; (2) manter ou não uma porta genérica "traga seu agente" — recomendação da spec: NÃO manter, remover 100%.

Contexto essencial: o agente LLM de temas viola o princípio "renderizador genérico". Superfície: pasta `agent-design-operator/` (~131 arquivos); `DesignAgentChatCard`/`useDesignAgentChat`/`useAgentGeneratedPresets` + montagem no `PreviewCanvas` (`src/features/DesignEngine/Canvas/`); `options.designAgent` + 4 tipos públicos (`src/core/Provider/types.ts`, `src/index.ts` ~12-17); `getDesignCatalog`/`getDesignScaffold` no backend (INVESTIGUE consumidores restantes antes de decidir remover); Etapas da skill `ui-integra-consumidor` + §6.2 da Spec 08; specs plan/01-07 (marcar frontmatter `⚫ Cancelada (plan/23)`, NÃO deletar os arquivos).

É BREAKING CHANGE: o `Sarak-MyService` injeta `options.designAgent` — produza a nota de migração exigida pela spec (a mudança no MyService em si é feita no repo dele, fora desta execução).

Ao terminar: grep-zero de `designagent` em `src/`/`backend/`/`templates/`/`docs/`; painel `/design` completo sem card de chat (E2E); gates `RegistryParity`/`catalog:check`/`npm run build` + suítes de `src/features/DesignEngine` verdes; `run_audit.mjs` 0 falhas; frontmatter + checkbox + entrada no progresso registrando as 2 decisões HITL e quem decidiu.
```

---

## P8 — Specs 21 + 22 (CONJUNTO): Scaffolder Init + Skills de Consumo

> Prompt único: a 22 documenta o `init` que a 21 cria — executar na mesma conversa elimina a dependência. Ordem interna: 21 primeiro, 22 depois.

```
Execute, NESTA ORDEM e na mesma sessão, as specs `specs/plan/21-scaffolder-init.md` e depois `specs/plan/22-skills-de-consumo-golden-path.md` da Sarak-Lib-UI-Core.

Preparação obrigatória, nesta ordem: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md`; (3) leia as specs 21 e 22 inteiras; (4) leia `specs/specs/08-consumo-externo-e-integracao.md` e as 3 skills que a 22 atualiza (`.agents/skills/ui-integra-consumidor/SKILL.md` + `references/examples.md`, `.agents/skills/ui-integra-escrever-manifesto/SKILL.md`, `.agents/skills/ui-auditoria-manifesto/SKILL.md`). Skills de execução: `sarak:padrao-typescript` (o bin do init) e `meta-create-skill` (formato das skills). Pré-requisito: specs 16, 19, 20 e 24 executadas (o init e as skills referenciam resolutor de tokens, porta de storage, receita de auth e modos App/Embarcado — confira no `00-progresso.md`; se alguma faltar, PARE e avise o usuário).

Parte 1 (spec 21): binário `npx @sarak/lib-ui-core init` — Node puro, sem dependência nova, idempotente (nunca sobrescreve sem --force). Perguntas: modo (App/Embarcado — alinhado à pergunta da skill), stack (vite-express monolítico = Golden Path default | next | frontend-only), storage (sqlite | postgres+schema | contrato-próprio), portas. Gera: package.json com scripts + TODAS as peerDependencies gravadas + typescript@^5 (NUNCA ^7 — incompatível com ts-node-dev), vite.config com proxy, tsconfig, main.tsx, Sarak-Engine/, manifesto do template, server.ts com middleware+storage, skills copiadas p/ .agents e .claude do consumidor. Smoke test: init em pasta tmp → npm install → build do consumidor verde.

Parte 2 (spec 22): atualizar as 3 skills — ui-integra-consumidor orquestra o init (entrevista → comando → validação → handoff) com Golden Path explícito e aviso anti-workspace (NPM Workspaces quebram binários no Windows); ui-integra-escrever-manifesto ganha o exemplo COMPLETO de lista auto-carregada (`source` + states loading/empty/error) como padrão obrigatório e a regra dura "só tokens do catálogo"; ui-auditoria-manifesto valida VALORES (tokens/vars contra o catálogo) e flagra lista-sem-source. Espelhar `.agents` → `.claude` e conferir hash igual nas 3.

Ao terminar: smoke do init verde; `npm run build` da lib verde; dry-run descrito na spec 22 (agente limpo + skills + catálogo → manifesto com source/states e zero token inventado); `run_audit.mjs` 0 falhas; frontmatter + checkboxes + UMA entrada no progresso cobrindo as duas specs.
```
