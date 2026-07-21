# Prompts de Execução — Onda "Renderizador Genérico" (specs 16-24 + Fase 5 pós-Selo: 27-31, 30 e 40-42)

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


---

## P9 — Spec 25: Limpeza dos Testes Práticos (remoção do módulo UI do ERP)

```
Execute a spec `specs/plan/25-limpeza-testes-praticos.md` da Sarak-Lib-UI-Core.

Preparação obrigatória, nesta ordem: (1) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md` da lib; (2) leia a spec 25 INTEIRA — ela contém o inventário exato do que remover e do que é PROIBIDO tocar no repositório-alvo `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP`.

Regras inegociáveis: esta operação REMOVE artefatos da Sarak-UI de um consumidor de teste — nada do NEGÓCIO do ERP (Modulos/, specs/, scripts Python, SQLs de negócio, .env, skills de negócio em .agents/) pode ser modificado. Faça o inventário VIVO (grep por "sarak" fora de node_modules/.git) antes de deletar qualquer coisa e compare com a tabela 2.1 da spec. Resolva as 3 decisões HITL da seção 2.3 com o usuário ANTES de agir (linhas do .env; limpeza do schema ui_core no Supabase remoto; quem faz o commit).

Ao terminar: verificação de integridade da seção 3.4 (git status só com as remoções esperadas + grep de resíduo com saída literal no relatório), entrada no `00-progresso.md` da LIB, frontmatter da spec 🟢. NÃO commite sem autorização explícita.
```

---

## P10 — Spec 26: Instalação Teste / SELO DA ONDA (AGENTE EXTERNO)

> Materializa a spec `specs/plan/26-instalacao-teste.md` (protocolo + matriz de medição M1-M10). Deve ser executado por um agente SEM nenhum contexto desta base (outra conversa/outro agente), DEPOIS da limpeza do P9. **O objetivo NÃO é instalar — é TESTAR a instalação**: o produto principal é o RELATÓRIO honesto; obstáculo se registra, não se contorna.

```
Você vai instalar a biblioteca Sarak-UI (@sarak/lib-ui-core) DO ZERO no sistema `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP` e produzir um relatório de avaliação da experiência. Contexto mínimo: o ERP Earendel é um sistema de gestão (módulos de Propostas, Contratos e Projetos, banco Supabase, scripts Python de negócio) que hoje NÃO tem frontend — a Sarak-UI será responsável por TODA a renderização, via manifestos JSON.

REGRAS DO TESTE (inegociáveis):
1. Use SOMENTE o caminho oficial da biblioteca: `npm install github:Lib-Sarak/Sarak-Lib-UI-Core` e depois `npx @sarak/lib-ui-core init` (o scaffolder faz a entrevista: modo/stack/storage — em caso de dúvida, use os defaults do Golden Path). Após o init, siga as skills que ele instala em `.agents/skills/` (`ui-integra-consumidor` → `ui-integra-escrever-manifesto` → `ui-auditoria-manifesto`) e o catálogo `node_modules/@sarak/lib-ui-core/docs/manifest-catalog.md`.
2. É PROIBIDO: modificar qualquer arquivo dentro de `node_modules/@sarak/lib-ui-core`; criar patch/postinstall sobre a lib; escrever componente React de interface no consumidor (só o plumbing que o init gera: Provider/Renderer/interceptors/store). Se algo só funcionar com um contorno desses, NÃO aplique o contorno — registre o problema no relatório e siga para o próximo item. O teste mede a BIBLIOTECA, não a sua habilidade de contorná-la.
3. Não leia o código-fonte da lib para descobrir como usá-la — use apenas skills, catálogo, templates e mensagens de erro/warns. Se a instrução fornecida não bastar, isso É um achado para o relatório.

O QUE CONSTRUIR (critério de sucesso funcional):
- App Modo App com shell + navegação (Início, Propostas, Contratos, Projetos, Design Engine) partindo do template starter.
- Pelo menos UMA tela de lista real com carga automática (`source` com states loading/empty/error + `renderFor`) consumindo um endpoint do backend gerado pelo init (pode ser dado de exemplo servido pelo server.ts; integração real com o Supabase do ERP é bônus, não requisito).
- UM formulário com validação + `api_call` + toasts de sucesso/erro.
- Design Engine acessível em `/design`, com personalização aplicando ao vivo (ex.: cor da topbar) e tema salvo persistindo após reload (use o storage escolhido na entrevista do init).
- Um teste PROPOSITAL de erro de autoria (ex.: um token de espaçamento inventado e um `"actions"` como objeto num nó de rascunho): a tela deve continuar de pé e o console deve ensinar a correção — registre o comportamento observado.
- Validação real: `npm run dev` com backend+frontend de pé, telas conferidas no browser, `npm run build` do consumidor verde.

RELATÓRIO OBRIGATÓRIO (entregável principal) — salve como `RELATORIO-INSTALACAO-UI.md` na raiz do ERP e reproduza o conteúdo integral na conversa:
1. Ambiente (SO, Node, npm) e tempo total aproximado.
2. Passo a passo executado (comandos reais, na ordem).
3. O que funcionou DE PRIMEIRA, sem intervenção.
4. PROBLEMAS, um a um: sintoma exato (mensagem/print), onde apareceu (init/skill/catálogo/motor/build), se bloqueou ou só atrapalhou, e o que você fez (registrou e seguiu / parou o item).
5. Avaliação das instruções: as skills e o catálogo bastaram? Onde você precisou adivinhar?
6. Contornos que teriam sido necessários (e que a regra 2 proibiu) — cada um é uma falha da biblioteca a corrigir.
7. MATRIZ DE MEDIÇÃO M1-M10 — preencha cada item com PASS/PARCIAL/FAIL + evidência (mensagem/saída literal):
   M1 init gera projeto completo em 1 comando · M2 install+dev sobem sem ajuste manual · M3 telas do template corretas de primeira · M4 erro de autoria proposital não derruba a tela e o warn ensina · M5 lista com source+states funciona pelo exemplo da skill · M6 formulário completo (validação barra submit; toasts) · M7 topbar personalizada reflete ao vivo · M8 tema persiste após reload · M9 skills+catálogo bastaram (zero leitura do código-fonte da lib) · M10 zero contorno necessário.
8. Veredito final: a instalação foi efetivamente plug-and-play? Nota 0-10 com justificativa, e as 3 melhorias que você mais sentiria falta.

NÃO corrija a biblioteca, NÃO abra specs dela, NÃO commite nada sem autorização do usuário.
```

---

# Fase 5 — Correção pós-Selo + Teste Real (P11-P17)

> Rodada de correção dos achados do Selo negado (`RELATORIO-INSTALACAO-CONSOLIDADO.md (Anexo B)` + triagem da Spec 26 no `00-progresso.md`). Ordem: P11 e P12 (os dois FAIL/críticos) → P13 (robustez de instalação) → **P14 (desinstalar o ERP)** → **P15 (re-Selo)** → **P16 (Spec 30, fechamento dos achados residuais)** → **P17 (Spec 40, Teste Real — funcionalidades reais)**. Cada correção de código segue o mesmo ciclo da onda: spec → execução → revisão independente → re-teste. **A validação final é o re-teste real (P15/P17), não a suíte unitária.**
>
> **O ciclo do re-Selo é de dois passos:** desinstalar (P14) e reinstalar do zero medindo (P15). O ERP hoje tem a instalação completa da rodada 1 na raiz — pular o P14 faria o teste medir uma instalação sobre a outra.
>
> **P16 vs P17:** o P16 (Spec 30) fecha os achados residuais das rodadas 1/2 (polimento + `SarakActionCard` genérico + empacotamento). O P17 (Spec 40) é a **2ª parte do teste real**: implementar as funcionalidades REAIS do ERP 100% via manifesto, corrigindo lacunas NA FONTE — não é medição de instalação, é prova de produção.

## P11 — Spec 27: Paridade de navigationStyle no Shell

```
Execute a spec `specs/plan/27-paridade-navigationstyle-shell.md` da Sarak-Lib-UI-Core.

Preparação obrigatória, nesta ordem: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md`; (3) leia a spec 27 inteira; (4) leia as relacionadas `specs/plan/18-shell-consome-design-engine.md` (a base que esta corrige) e `specs/specs/04-estrutura-shell-discovery.md` (o shell LEGADO — referência de paridade). Skills de execução: `ui-arquitetura-design` e `sarak:padrao-typescript`.

Contexto essencial: `navigationStyle: "topbar"` no Design Engine quebra a navegação — `SarakShellNav` vira horizontal (`src/components/atomic/Navigation/SarakShellNav.tsx:114-119`) mas o `ShellRouterNode` (`src/core/Manifest/nodes/ShellRouterNode.tsx:154-172`) SEMPRE envolve a região sidebar num `<aside>` de 240px fixos, independentemente do estilo. O Shell legado (`src/core/Shell/SarakShell.tsx:78-194`) já trata isso com ramos mutuamente exclusivos (`isTopbar`/`isSidebar`/...). É item de PARIDADE: o `Sarak-MyService` usa `navigationStyle: "topbar"` em produção e quebraria ao migrar pro motor novo.

Entregue: helper compartilhado de leitura de `navigationStyle` (fonte única entre `ShellRouterNode` e `SarakShellNav` — não duplicar a leitura do contexto); `ShellRouterNode` realoca a região sidebar para faixa de largura CHEIA quando `navigationStyle` é `topbar` (horizontal), mantendo o `<aside>` fixo quando `sidebar`/ausente; zero hardcode (`var(--sarak-*, fallback)`, sem `--sx-*`, sem token órfão); `dock`/`glass` FORA do escopo (default vertical). Testes conforme o plano, incluindo o E2E browser de topbar full-width (jsdom não computa `var()`).

Ao terminar: suítes de `src/core/Manifest` e `src/components/atomic/Navigation` verdes; gates `RegistryParity`/`catalog:check`/`npm run build` verdes; `run_audit.mjs` 0 falhas; frontmatter da spec + checkbox (item 11) no `00-indice.md` + entrada no `00-progresso.md`. A validação definitiva de topbar é o re-Selo (P15), não só o unitário.
```

---

## P12 — Spec 28: Gate de Submit à prova de erro de autoria

```
Execute a spec `specs/plan/28-gate-submit-validacao.md` da Sarak-Lib-UI-Core.

Preparação obrigatória, nesta ordem: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md`; (3) leia a spec 28 inteira; (4) leia as relacionadas `specs/plan/17-resiliencia-leniente-e-dx-de-erros.md` (a postura de degradar-com-warn) e as definitivas `specs/specs/29`/`32`/`25` (validação/binding/dispatcher). Skills de execução: `sarak:padrao-typescript` e, ao editar a skill, `meta-create-skill`.

Contexto essencial (a triagem supôs a causa ERRADA — leia o diagnóstico refinado da spec): o gate de submit EXISTE e funciona (`src/core/Manifest/Dispatcher/createDispatcher.ts:87-94` — `action.submit && ctx.form` → `SubmitBlockedError`). O bug é degradação SILENCIOSA: o gate só dispara com `submit` no TOPO da ação (`types.ts:58`), com `form: { id }` no escopo (`LeafNode.tsx:100`) e campos com `model`+`validation` (`LeafNode.tsx:72-75`) — e nada avisa quando falha. O executor escreveu `payload: { submit: true }` e a skill só tem o exemplo `params: "{{form}}"` que NÃO valida; não há exemplo do form que barra nem shape de `validation` documentado (M9).

Entregue: (a) leniência — aceitar `payload.submit` como alias de `action.submit`; (b) `console.warn` defensivo quando um `api_call` envia um form-escopo COM erros sem ser submit (decidir com o mantenedor se barra incondicionalmente) e quando `submit:true` sem form-escopo; (c) warn de shape inválido de `validation` no pipeline de `sanitizeDirectives`; (d) skill `ui-integra-escrever-manifesto` com o exemplo COMPLETO do form que barra (form-escopo + model + validation + `submit:true` no topo) e o shape de `validation` por `rule`; catálogo regenerado com a seção de `validation`. Espelhar `.agents`→`.claude` (hash igual). NÃO afrouxe segurança.

Ao terminar: suítes de `src/core/Manifest` (incl. `Form.integration` e Dispatcher) verdes; gates `RegistryParity`/`catalog:check`/`npm run build` verdes; `run_audit.mjs` 0 falhas; frontmatter + checkbox (item 12) + entrada no progresso. A prova de que M6/M9 voltaram a PASS é o re-Selo (P15).
```

---

## P13 — Spec 29: Robustez da primeira instalação

```
Execute a spec `specs/plan/29-robustez-instalacao-pacote.md` da Sarak-Lib-UI-Core.

Preparação obrigatória, nesta ordem: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md`; (3) leia a spec 29 inteira; (4) leia as relacionadas `specs/plan/21-scaffolder-init.md` e `specs/plan/22-skills-de-consumo-golden-path.md`. Skills de execução: `sarak:padrao-typescript` (o bin) e `meta-create-skill` (as skills). ANTES de fechar o `files`, mapeie exatamente o que `runInit`/`copySkills` lê do pacote instalado (`bin/scaffold/context.mjs` → `skillsSourceDir`), senão o `init` do consumidor não acha as skills.

Contexto essencial: (achado 4) `package.json` sem `files`/`.npmignore` → `npm install github:...` copia `src/`/`specs/`/`playwright/` inteiros pro `node_modules`; (achado 3) `bin/sarak-ui.mjs:44-50` não tem `--help` real e `bin/scaffold/prompts.mjs:25-27` abre `readline` sem guard de TTY (sem TTY e sem `--yes` → exit 0 mudo, zero arquivos); (achado 2) skill `ui-integra-consumidor:42-43` manda `npm install github:` sem garantir `package.json` antes (npm sobe a árvore e polui um ancestral); (achado 5) fluxo "tema padrão read-only → salvar novo tema" não documentado.

Entregue: campo `files` no `package.json` da lib (allowlist: `dist/`,`bin/`,`backend/`,`docs/manifest-catalog.*`,`templates/` + o que o init copia) validado por `npm pack`; `--help`/`-h` real no `bin/sarak-ui.mjs` (exit 0, todas as flags) + guard `process.stdin.isTTY` (sem TTY e sem `--yes`/flags → exit 1 com instrução, nunca exit 0 mudo); skill `ui-integra-consumidor` com passo "garanta `package.json` (npm init -y) antes do `npm install github:`" + o fluxo de salvar novo tema documentado; espelhos `.agents`→`.claude` com hash igual. Testes conforme o plano (smoke do init com flags continua verde).

Ao terminar: smoke do `init` verde; `npm run build` verde; checagem do tarball (`npm pack --dry-run`) sem `src/`/`specs/`; gates + `run_audit.mjs` 0 falhas; frontmatter + checkbox (item 13) + entrada no progresso.
```

---

## P14 — Spec 31: Limpeza da Rodada 2 (desinstalar a Sarak-UI do ERP)

> Pré-requisito do re-Selo. **NÃO reuse o P9/Spec 25** — o inventário daquela spec aponta para `frontend/`, pasta que não existe mais; a rodada 1 instalou na RAIZ do ERP.

```
Execute a spec `specs/plan/31-limpeza-rodada2-erp.md` da Sarak-Lib-UI-Core.

Preparação obrigatória, nesta ordem: (1) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md` da lib; (2) leia a spec 31 INTEIRA — ela contém o inventário exato do que remover e do que é PROIBIDO tocar no repositório-alvo `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP`; (3) leia a `specs/plan/25-limpeza-testes-praticos.md` APENAS como referência histórica da rodada 1 — o inventário dela (pasta `frontend/`) está OBSOLETO e não descreve a instalação atual.

Contexto essencial: o ERP recebeu, na rodada 1 do Selo, uma instalação COMPLETA da Sarak-UI via `npx @sarak/lib-ui-core init` — na RAIZ do repositório (não em `frontend/`). Ela precisa sair inteira antes do re-Selo, senão o teste mede uma instalação sobre a outra. Pegada real (verificada 2026-07-20): `src/` (main.tsx, Sarak-Engine/, manifests/, server.ts), `package.json`, `package-lock.json`, `node_modules/`, `dist/`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.server.json`, `database.sqlite`, e as skills de UI copiadas para `.agents/skills/` E `.claude/skills/` (`ui-integra-escrever-manifesto`, `ui-auditoria-manifesto`).

Regras inegociáveis: esta operação REMOVE artefatos da Sarak-UI de um consumidor de teste — nada do NEGÓCIO do ERP pode ser modificado (`Modulos/`, `specs/`, `.githooks/`, `CLAUDE.md`, `.env`, scripts Python, SQLs de negócio, o PDF de template, e as 8 skills de negócio em `.agents/skills/`). Faça o INVENTÁRIO VIVO (listar a raiz + grep por "sarak" fora de node_modules/.git) ANTES de deletar e compare com a tabela 2.1 da spec — a pegada muda conforme as respostas do `init`. Rode `git status`/`git ls-files` para separar o que é tracked (precisa `git rm --cached`) do que é só disco. Resolva as 5 decisões HITL da seção 2.3 com o usuário ANTES de agir (package.json híbrido — recomendação é remover por completo, pois o re-Selo precisa medir a instalação num diretório SEM package.json; database.sqlite; schema ui_core remoto; linhas do .env; quem commita).

O relatório da rodada 1 já está arquivado nesta lib (`specs/plan/RELATORIO-INSTALACAO-CONSOLIDADO.md (Anexo A)`) — pode remover o `RELATORIO-INSTALACAO-UI.md` do ERP.

Ao terminar: verificação de integridade da seção 3 passo 5 (git status só com as remoções esperadas + grep de resíduo com SAÍDA LITERAL + um script Python de negócio executando); entrada no `00-progresso.md` da LIB; frontmatter da spec 🟢; checkbox item 14 no `00-indice.md`. NÃO commite sem autorização explícita.
```

---

## P15 — Re-Selo da Onda (2ª execução da Spec 26, AGENTE EXTERNO)

> Só dispare DEPOIS de P11+P12+P13 executadas E revisadas (código lido, gates re-rodados) **e** do P14 (limpeza) concluído. Reinstala o ERP do zero e repete o Selo. Mesmas regras do P10 (agente sem contexto, só caminho oficial, contornos proibidos, matriz M1-M10). Antes de disparar: confirme que `origin/main` da lib está sincronizado com as correções (o `init`/pacote testado tem que ser o corrigido) e que o ERP está limpo (gate de prontidão da Spec 31).

```
Você vai REINSTALAR a biblioteca Sarak-UI (@sarak/lib-ui-core) DO ZERO no sistema `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP` e produzir um relatório de avaliação da experiência. Esta é a SEGUNDA rodada do Selo da Onda: a primeira (2026-07-20) foi NEGADA (nota 6,5/10) e uma rodada de correção (specs 27/28/29) foi executada desde então — seu teste mede se as correções realmente fecharam os achados. Contexto mínimo: o ERP Earendel é um sistema de gestão (módulos de Propostas, Contratos e Projetos, banco Supabase, scripts Python de negócio) que hoje NÃO tem frontend — a Sarak-UI será responsável por TODA a renderização, via manifestos JSON. NÃO leia o relatório anterior nem as specs de correção: você é um agente externo sem contexto da lib; o teste mede a instalação como um consumidor novo a vê.

REGRAS DO TESTE (inegociáveis):
1. Use SOMENTE o caminho oficial da biblioteca: garanta um `package.json` na raiz do diretório-alvo (se não existir, `npm init -y` primeiro), depois `npm install github:Lib-Sarak/Sarak-Lib-UI-Core` e depois `npx @sarak/lib-ui-core init` (o scaffolder faz a entrevista: modo/stack/storage — em caso de dúvida, use os defaults do Golden Path, ou `--help` para ver as flags). Após o init, siga as skills que ele instala em `.agents/skills/` (`ui-integra-consumidor` → `ui-integra-escrever-manifesto` → `ui-auditoria-manifesto`) e o catálogo `node_modules/@sarak/lib-ui-core/docs/manifest-catalog.md`.
2. É PROIBIDO: modificar qualquer arquivo dentro de `node_modules/@sarak/lib-ui-core`; criar patch/postinstall sobre a lib; escrever componente React de interface no consumidor (só o plumbing que o init gera: Provider/Renderer/interceptors/store). Se algo só funcionar com um contorno desses, NÃO aplique o contorno — registre o problema no relatório e siga para o próximo item. O teste mede a BIBLIOTECA, não a sua habilidade de contorná-la.
3. Não leia o código-fonte da lib para descobrir como usá-la — use apenas skills, catálogo, templates e mensagens de erro/warns. Se a instrução fornecida não bastar, isso É um achado para o relatório.

O QUE CONSTRUIR (critério de sucesso funcional):
- App Modo App com shell + navegação (Início, Propostas, Contratos, Projetos, Design Engine) partindo do template starter.
- Pelo menos UMA tela de lista real com carga automática (`source` com states loading/empty/error + `renderFor`) consumindo um endpoint do backend gerado pelo init (pode ser dado de exemplo servido pelo server.ts; integração real com o Supabase do ERP é bônus, não requisito).
- UM formulário com validação + `api_call` + toasts de sucesso/erro.
- PELO MENOS UMA tela com grid e/ou cards (não só empilhamento flex) — a rodada anterior só exercitou flex+form+lista e deixou essa lacuna de cobertura; force grid/`SarakCard` desta vez.
- Design Engine acessível em `/design`, com personalização aplicando ao vivo (ex.: cor da topbar) e tema salvo persistindo após reload (use o storage escolhido na entrevista do init).
- Um teste PROPOSITAL de erro de autoria (ex.: um token de espaçamento inventado e um `"actions"` como objeto num nó de rascunho): a tela deve continuar de pé e o console deve ensinar a correção — registre o comportamento observado.
- Validação real: `npm run dev` com backend+frontend de pé, telas conferidas no browser, `npm run build` do consumidor verde.

FOCO DE REGRESSÃO (os itens que falharam/atritaram na rodada anterior — teste cada um explicitamente e registre a evidência):
- M6 (validação): o formulário com `validation` DEVE barrar o submit vazio — nenhum registro vazio persistido, nenhum toast de sucesso, os campos revelam o erro. Teste também com `curl` no endpoint que NÃO há registro vazio criado.
- M7 (navegação): ative `navigationStyle: "topbar"` no Design Engine e confirme que a navegação ocupa a largura CHEIA com TODOS os itens visíveis — não uma faixa horizontal estreita e cortada. Personalizar um tema padrão pode abrir um modal de "salvar novo tema": registre se a skill/catálogo avisaram sobre isso.
- M1/M2 (instalação): descubra as flags do `init` via `--help` (não por acidente); ao instalar, confirme que o `package.json`/`node_modules` foram criados NO diretório do ERP e que NENHUM projeto ancestral (ex.: `C:\Users\Igor\`) foi poluído.
- M9 (empacotamento): confirme que `node_modules/@sarak/lib-ui-core` NÃO contém `src/`/`specs/`/`playwright/` (só `dist/`/`bin/`/`backend/`/`docs/`/`templates/` e o necessário).

RELATÓRIO OBRIGATÓRIO (entregável principal) — salve como `RELATORIO-INSTALACAO-UI.md` na raiz do ERP (sobrescrevendo a versão anterior) e reproduza o conteúdo integral na conversa:
1. Ambiente (SO, Node, npm) e tempo total aproximado.
2. Passo a passo executado (comandos reais, na ordem).
3. O que funcionou DE PRIMEIRA, sem intervenção.
4. PROBLEMAS, um a um: sintoma exato (mensagem/print), onde apareceu (init/skill/catálogo/motor/build), se bloqueou ou só atrapalhou, e o que você fez (registrou e seguiu / parou o item).
5. Avaliação das instruções: as skills e o catálogo bastaram? Onde você precisou adivinhar?
6. Contornos que teriam sido necessários (e que a regra 2 proibiu) — cada um é uma falha da biblioteca a corrigir.
7. MATRIZ DE MEDIÇÃO M1-M10 — preencha cada item com PASS/PARCIAL/FAIL + evidência (mensagem/saída literal):
   M1 init gera projeto completo em 1 comando · M2 install+dev sobem sem ajuste manual (e sem poluir diretório ancestral) · M3 telas do template corretas de primeira · M4 erro de autoria proposital não derruba a tela e o warn ensina · M5 lista com source+states funciona pelo exemplo da skill · M6 formulário completo (validação barra submit; toasts) · M7 topbar/navigationStyle personalizada reflete ao vivo sem quebrar o layout · M8 tema persiste após reload · M9 skills+catálogo bastaram (zero leitura do código-fonte da lib; pacote sem o fonte) · M10 zero contorno necessário.
8. Veredito final: a instalação foi efetivamente plug-and-play? Nota 0-10 com justificativa, e as 3 melhorias que você mais sentiria falta.

NÃO corrija a biblioteca, NÃO abra specs dela, NÃO commite nada sem autorização do usuário.
```

---

## P16 — Spec 30: Fechamento de Achados pós-Selo (SÓ depois do re-Selo)

```
Execute a spec `specs/plan/30-fechamento-achados-pos-selo.md` da Sarak-Lib-UI-Core. NÃO execute antes do re-Selo (P15). Fecha TODOS os achados residuais das rodadas 1 e 2 do Selo — não bloqueia o Selo, mas fecha o objetivo por completo.

Preparação obrigatória, nesta ordem: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md`; (3) leia a spec 30 inteira; (4) leia os dois relatórios de origem `specs/plan/RELATORIO-INSTALACAO-CONSOLIDADO.md (Anexo A)` e `RELATORIO-INSTALACAO-CONSOLIDADO.md (Anexo C)`. Skills de execução: `sarak:padrao-typescript`, `sarak:otimizacao-nivel-1` (bundle — medir antes/depois) e `ui-refatorar-componente` (para o `SarakActionCard`, que muda assinatura de props — paridade 1:1:1:1:1:1).

Contexto essencial: seis frentes. (6) `renderFor` avisa "item sem id/uuid" por item quando a chave natural é outra (`hash`); (7) bundle de app mínimo em 3,9 MB / 993 KB gzip sem code-splitting (pesados já são `React.lazy` no `LeafNode`) — incluir `manualChunks` no `vite.config.ts` do `init`; (8) `input[type=color]` do CustomizationPanel recebe `var(...)` cru; (M9) o pacote ainda tem `src/styles/sarak-base.css` — mover para `dist/` e reapontar o export `./sarak-base.css` (zera `src/` do pacote, M9 vira PASS puro); (Problema 4) `SarakActionCard` (`src/components/atomic/Cards/SarakActionCard.tsx`) é um card de LLM com botão "Executar" HARDCODED (linha 118), subtitle "Modelo" e painel de custo de tokens fixo — generalizar (props/mapping) ou separar em card especializado, + varrer strings de UI hardcoded em `atomic/`; (Problema 1) documentar o fluxo do Design Engine "Commit por categoria → Aplicar Alterações Globais → modal Salvar Novo Tema".

Entregue: os 6 itens da seção 2 da spec (2.1 a 2.6), cada um com seu teste; `check-package-contents.mjs` estendido para negar `src/`; catálogo regenerado (SarakActionCard/renderFor); skill do fluxo do Design Engine (espelho `.claude`, hash igual). Confirme com o mantenedor (HITL) a decisão do `SarakActionCard` (generalizar in-place vs. card especializado separado).

Ao terminar: gates `RegistryParity`/`catalog:check`/`npm run build` verdes; `run_audit.mjs` sem regressão (baseline conhecido); `npm pack --dry-run` sem `src/`; frontmatter + checkbox (item 16) + entrada no progresso com os números de bundle antes/depois e a decisão HITL do card.
```

---

## P17 — Spec 40: Teste Real (2ª parte do teste — funcionalidades reais do ERP via manifesto)

> Só dispare DEPOIS do re-Selo (P15) concedido E da Spec 30 (P16) executada. Diferente do re-Selo (que MEDE a instalação), aqui se CONSTRÓI as funcionalidades reais do ERP e se CORRIGE na fonte toda lacuna da lib. O importador só mexe no manifesto.

```
Execute a spec `specs/plan/40-teste-real.md` da Sarak-Lib-UI-Core. É a 2ª parte do teste em consumidor real: implementar as funcionalidades REAIS do ERP Earendel (`C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP`) — Propostas, Contratos, Projetos — com conexões REAIS (Supabase do ERP), 100% via manifesto JSON.

Preparação obrigatória: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md`, `00-progresso.md` e a spec 40 INTEIRA; (3) leia as skills de consumo `ui-integra-escrever-manifesto` e `ui-auditoria-manifesto` e o catálogo `docs/manifest-catalog.md`. Pré-condições: re-Selo concedido (P15) e Spec 30 executada (P16) — se faltar, PARE e avise.

REGRA DE OURO (o que esta spec mede): no ERP, APENAS o `manifest.json` pode ser alterado para construir a UI — ZERO componente/tela/CSS React no importador. Se a UI precisa de algo que o manifesto não entrega, o problema é da BIBLIOTECA e se corrige NA FONTE (Sarak-Lib-UI-Core), com o ciclo da onda (spec/fix + gates verdes + catálogo/rebuild + reinstala no ERP) — NUNCA se adapta o ERP. A porta de dados (interceptor/backend) pode ser CONFIGURADA para apontar ao Supabase real do ERP (é plumbing de contrato, não UI); se conectar dado real exigir mais que configurar a porta, isso é um achado sobre a ergonomia da porta.

Construa, por módulo (Propostas/Contratos/Projetos): listagem real via `source` sobre dado real (Supabase), detalhe/leitura, formulário real (create/edit) que GRAVA de verdade com validação barrando inválidos, e ≥1 composição densa real (grid/cards/tabela). Ciclo: montar no manifesto → rodar → se lacuna do autor, corrige o manifesto; se lacuna da lib, corrige na fonte e retoma.

Entregue: `RELATORIO-TESTE-REAL.md` na raiz do ERP + na conversa, com as telas reais por módulo (evidência de dado real + persistência via curl/consulta), a LISTA de defeitos da lib corrigidos na fonte (sintoma→causa→correção), o diff do ERP provando que só o `manifest.json` mudou (R4), e a matriz R1-R7. `npm run build` do ERP verde. Entrada no `00-progresso.md` da lib. NÃO commite sem autorização.
```

---

## P18 — Spec 41: Piso de Bundle / barris de ícone (rodar ANTES da Spec 42)

> Origem: achado da execução da Spec 30. Toca 2 arquivos em comum com a Spec 42 (`SarakCoreCard`, `SarakCardGrid`) — **nunca em paralelo**; esta vem primeiro.

```
Execute a spec `specs/plan/41-piso-de-bundle-barris-de-icone.md` da Sarak-Lib-UI-Core.

Preparação obrigatória, nesta ordem: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md` (especialmente a entrada da Spec 30, que contém o achado que originou esta spec); (3) leia a spec 41 INTEIRA; (4) leia a `specs/plan/42-generalizar-cardgrid-corecard.md` para saber o que NÃO invadir (ela vem depois e toca 2 dos mesmos arquivos). Skills de execução: `sarak:otimizacao-nivel-1` (disciplina de medir antes/depois — é o coração desta spec) e `sarak:padrao-typescript`.

Contexto essencial: a Spec 30 tentou reduzir o bundle com `manualChunks` e NÃO reduziu bytes (~2,44 MB antes e depois). A razão é estrutural: num renderizador de manifesto a ligação é por STRING em runtime (`{"type": "X"}`), então o Registry precisa de todo componente não-lazy de forma ansiosa — o bundler não pode podar o que não sabe que não será usado. A causa ATACÁVEL é outra: 6 arquivos fazem `import * as LucideIcons from 'lucide-react'` e acessam por índice DINÂMICO (`LucideIcons[nomeEmRuntime]`), o que impede tree-shaking e arrasta ~1500 ícones. Os 5 cards (`SarakActionCard`, `SarakSearchCard`, `SarakTitleCard`, `SarakCoreCard`, `SarakCardGrid`) burlam o átomo oficial `SarakIcon`, que já resolve nome→ícone via `IconMap` CURADO. Atenção às duas mecânicas diferentes: `lucide-react` é peerDependency e está em `--external` (incha o bundle do CONSUMIDOR), enquanto `@phosphor-icons/react` e `@tabler/icons-react` são `dependencies` e NÃO estão em `--external` (hipótese a verificar: podem estar sendo empacotadas inteiras dentro do `dist/` da lib).

REGRA DURA: **meça ANTES de refatorar.** Isole com número quanto cada família de ícone contribui (dist da lib vs bundle do consumidor), usando um app mínimo do `init` como cobaia. Se o ganho for irrelevante, a spec fecha com a CONCLUSÃO NEGATIVA documentada — não force o refactor para justificar a spec.

Entregue: os itens 2.1 a 2.4 da spec — medição antes/depois registrada; zero `import * as *Icons` com acesso dinâmico em `src/` (cards usando `SarakIcon`); cobertura do `IconMap` estendida onde faltar + nome desconhecido degradando com `console.warn` (postura da Spec 17), nunca quebrando a tela; nomes de ícone válidos DOCUMENTADOS no catálogo gerado (hoje ícone é a exceção não documentada da regra dura de tokens); e a conclusão "manualChunks não reduz bundle em renderizador de manifesto" registrada no `vite.config.ts` gerado pelo `init` e/ou na skill, para não voltar como achado na próxima rodada de teste.

Ao terminar: gates `RegistryParity`/`catalog:check`/`npm run build` verdes; `run_audit.mjs` sem regressão (compare com o baseline conhecido, não espere 0); suítes de `src/components/atomic/Cards`, `Templates` e `Icon` verdes (snapshots dos 5 cards mudam de propósito — revise cada um); frontmatter da spec + checkbox (item 18) no `00-indice.md` + entrada no `00-progresso.md` com os NÚMEROS de antes/depois.
```

---

## P19 — Spec 42: Generalizar SarakCoreCard / SarakCardGrid (follow-up da Spec 30)

> Follow-up da Spec 30 (decisão HITL de 2026-07-21): não bloqueia nenhum Selo, mas fecha a mesma classe de defeito (domínio LLM embutido) que sobrou fora do escopo nomeado da 40. Pode rodar a qualquer momento depois da Spec 30 — sem dependência do re-Selo/Teste Real.

```
Execute a spec `specs/plan/42-generalizar-cardgrid-corecard.md` da Sarak-Lib-UI-Core.

Preparação obrigatória, nesta ordem: (1) acione a skill `ui-contexto-repositorio`; (2) leia `specs/plan/00-indice.md` e `specs/plan/00-progresso.md`; (3) leia a spec 42 inteira; (4) leia a relacionada `specs/plan/30-fechamento-achados-pos-selo.md` (o precedente direto — mesma solução aplicada ao `SarakActionCard`) e a entrada de 2026-07-21 no `00-progresso.md` (as 4 decisões HITL que criaram esta spec). Skills de execução: `sarak:padrao-typescript` e `ui-refatorar-componente` (o tipo público `SarakCardGridProps.mapping` perde campos — paridade/quebra de contrato).

Contexto essencial: `SarakCoreCard` (`src/components/atomic/Templates/components/SarakCoreCard.tsx`) é a variante `"classic"` — a DEFAULT de `SarakCardGrid` — e tem o mesmo domínio de catálogo de modelos LLM que o `SarakActionCard` tinha antes da Spec 30: painel fixo "Custo In/Out (1M)" e "Janela de Contexto" com aritmética embutida (`Number(context)/1000`), bloco "Tokenizer", default de subtitle `'Modelo'`. Pior: a interface pública `SarakCardGridProps.mapping` (`SarakCardGrid.tsx` linhas 36-47) declara `price_in?`/`price_out?`/`context?` NO TIPO, já publicado no catálogo (`docs/manifest-catalog.md`, seção `SarakCardGrid`) — removê-los é BREAKING CHANGE de contrato tipado, não só de comportamento.

Ordem obrigatória: (1) criar `SarakCoreCard.test.tsx` (caracterização do comportamento ATUAL, snapshot) ANTES de tocar no componente; (2) só então generalizar o painel de detalhes para `mapping.details` (mesmo modelo da Spec 30 — array de pares `{label, value}` pré-formatados pelo consumidor, sem aritmética de domínio na Sarak); (3) remover `price_in`/`price_out`/`context` do tipo `SarakCardGridProps.mapping`; (4) escrever nota de migração (antes/depois) e remover a nota temporária que a Spec 30 deixou no catálogo/skill sobre esta pendência.

Entregue: os 4 itens da seção 2 da spec (2.1 a 2.4); `SarakCardGrid.test.tsx` com fixtures migradas para `details`; catálogo regenerado (a seção `SarakCardGrid` reflete o tipo novo); nota de migração documentada.

Ao terminar: gates `RegistryParity`/`catalog:check`/`npm run build` verdes; `run_audit.mjs` sem regressão (baseline conhecido); suítes de `src/components/atomic/Templates` verdes; frontmatter da spec 42 + checkbox (item 19) no `00-indice.md` + entrada no `00-progresso.md`. Pré-requisito: a **Spec 41 (P18)** deve ter rodado antes — vocês tocam `SarakCoreCard`/`SarakCardGrid` em comum; se por algum motivo a 43 ainda não rodou, PRESERVE a troca de ícone que ela fará (use o átomo `SarakIcon`, nunca `import * as LucideIcons` com índice dinâmico).
```
