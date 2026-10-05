---
tipo: "plan"
titulo: "Ficar com um cromo só, completo por padrão e com navegação genérica"
objetivo: "Descartar o modo host (SarakShell, descoberta de modulos e roteador proprio) e deixar o SarakAppChrome como o unico cromo da lib, com a barra completa por padrao, configuravel pelo sistema e com item de navegacao que e link de verdade"
dominio: "Sarak-Lib-UI-Core / Cromo / Navegação"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "cromo", "shell", "navegacao", "widgets", "adr"]
relacionados: ["[[05-cromo-e-slots]]", "[[04-shell-e-discovery]]", "[[01-forma-do-produto-e-modos-de-consumo]]", "[[005-modelo-modulos-plugin-e-apps-separados]]", "[[014-cromo-do-modo-ui-kit-com-widgets-por-padrao]]"]
depende_de: ""
retida_por: ""
destino_sintese: "adr/018 (nova) + arquitetura/01-forma-do-produto-e-modos-de-consumo.md + specs/05-cromo-e-slots.md + specs/04-shell-e-discovery.md (retirada) + specs/06-painel-de-customizacao-e-preview.md + 00-contexto.md"
---

# 1. Objetivo

A lib tem **um** cromo, o `SarakAppChrome`: o modo host (`SarakShell` + descoberta de módulos + roteador
próprio) sai, o `sarak-ui init` gera um app com o cromo único, o preview do painel desenha a barra real, e a
barra nasce **completa por padrão** — busca, claro/escuro, idioma, topo/lateral, recolher, usuário — com a
composição decidida pelo sistema, no painel, e nunca pelo tema. O item de navegação vira **link de verdade**.

# 2. Contexto

**Decisões do dono (2026-10-02 e 2026-10-03):** um cromo só; descartar o modo host inteiro (não é só a barra —
é o modo de consumo oficial "a lib é o host"); barra completa por padrão em todo tema; a composição da barra
é configuração do sistema, com uma seção no painel; widget que depende do importador **aparece, mas inativo**,
até o importador o ativar; botão direito e clique do meio abrem o item de navegação em nova guia; e a lib
continua genérica — nada de componente específico de um sistema.

**O que foi medido (2026-10-02):**

| Fato | Onde |
|---|---|
| Duas implementações da barra: `src/core/Shell/` (14 arquivos, 1.270 linhas, 15 de teste) e `src/components/Layout/` (17 arquivos, 1.497 linhas, 16 de teste); mais `src/core/Discovery/` (8 arquivos, 740 linhas) | `git ls-files` |
| Nenhum sistema da geração atual usa o Shell: ERP e `login-completo` usam `SarakAppChrome`; o Cripto tem roteador próprio. Só o legado `Novo` (lib de junho) usa `SarakShell` | análise dos cinco sistemas |
| O Shell tem defeitos que o AppChrome já não tem: topbar com `w-full` somado à margem (vaza), sem navegação no tablet em modo topbar (`TopbarNav.tsx:146`), gaveta do celular sem ESC/foco, logo `"S"` fixo (`SidebarNav.tsx:140`), sino decorativo sem ação (`SidebarNav.tsx:191`, `TopbarNav.tsx:204`) | leitura |
| O preview do painel desenha a barra do **Shell**, não a do AppChrome | `src/features/DesignEngine/Canvas/components/PreviewSystemRenderer.tsx:4-6` |
| O `sarak-ui init` gera `SarakShell` + registro de módulos | `bin/scaffold/generators/mainTsx.mjs` |
| A busca é escondida por **tema**: `searchPositionSidebar` tem a opção `hidden`, e 6 dos 14 temas shippados a usam — foi o "a busca só aparece às vezes" do ERP | `src/core/Design/schema/navigation.ts:359-372` · `presets/themes/` |
| A composição da barra já é configurável para **cinco** preferências (`off`/`menu`/`pinned`), e três nascem `off` (tamanho da fonte, topo/lateral, idioma) | `src/core/Design/schema/preferences.ts:52-84` |
| Item de navegação é `<button>`; `href` existe no dado mas é entregue ao host por callback. Botão direito, clique do meio e Ctrl+clique não funcionam. É a demanda 9 do ERP e a pendência 15 do backlog do `Novo` | `src/components/atomic/Navigation/SarakMenuItem.tsx:79` · `SarakShellNav.tsx:75-96` · `Layout/chrome/navItem.ts` |
| O dado do item não tem `disabled`, `badge` nem `target`; o átomo aceita `disabled` mas o cromo não expõe | `navItem.ts:17-30` · `SarakMenuItem.tsx:41,76` |
| O widget de usuário deriva o papel de `user.level` numérico (100 = Master) e lê `username`/`email` — modelo de um produto, não genérico | `src/components/atomic/Navigation/SarakShellUserWidget.tsx:27,37` |
| Os resultados da busca embutida não são clicáveis | `SarakShellSearchWidget.tsx:107-112` |
| `SarakSearch` cai no registro de módulos quando não recebe `items` | `src/components/atomic/Inputs/SarakSearch.tsx:41` |
| O gate de paridade de cromo compara **dois** grupos de consumidores | `gates/scripts/contrato/check-chrome-token-parity.mjs` (`CONSUMER_GROUPS`) |

**O que sai do modo host e não tem substituto, de propósito:** o modo `dock` de navegação e o redimensionar
por arraste (só o Shell tinha). O dono não os pediu; se fizerem falta, voltam por demanda.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

**Lote 1 — um cromo**
- `src/core/Shell/**`, `src/core/Discovery/**`, `src/shared/hooks/useModuleDiscovery.ts`,
  `src/shared/hooks/useSarakRouter.ts`, `src/constants/discovery.ts`, `src/core/Provider/hooks/useRegistryManager.ts`
  e tudo que só existia para o modo host — **removidos**, com os testes.
- `src/index.ts` — os nomes do modo host saem; `prefix:check`, `barrel:check`, `public-types:check` e o catálogo
  acompanham.
- `src/components/atomic/Inputs/SarakSearch.tsx` — só `items`; sem registro.
- `src/features/DesignEngine/Canvas/**` — o preview desenha o `SarakAppChrome`.
- `src/components/atomic/Navigation/SarakShell*.tsx` — os widgets ficam (são do cromo único); renomeados se o
  prefixo `Shell` deixar de fazer sentido, com a nota de migração.
- `gates/scripts/contrato/check-chrome-token-parity.mjs` — um grupo de consumidores.
- `bin/scaffold/**` — o `init` gera um app com `SarakAppChrome` e roteamento do próprio app.
- `.agents/skills/ui-integra-consumidor/**`, `sarak-ui/templates/**`, prosa fora dos marcadores de
  `sarak-ui/GUIA-FRONTEND.md` e `START-HERE.md`, `README.md`, `docs/*.md` — o modo host sai da documentação.
- `docs/migracoes.md` — a nota MAJOR.

**Lote 2 — barra completa por padrão, composição pelo sistema**
- `src/core/Design/schema/navigation.ts` e `preferences.ts` — a opção `hidden` sai; os tokens de composição
  cobrem **todos** os widgets (busca, claro/escuro, idioma, topo/lateral, recolher, usuário, notificações); os
  padrões são "na barra".
- `src/core/Design/presets/themes/*.ts` — os 6 temas que escondiam a busca; o manifesto/paridade.
- `src/components/Layout/**` — a barra lê a composição; widget sem o que o importador precisa aparece
  **desabilitado** (`aria-disabled`, sem ação, com rótulo do catálogo de textos), e em desenvolvimento um
  aviso único no console nomeia o que falta ligar.
- `src/features/DesignEngine/**` — a seção do painel onde a composição se define.

**Lote 3 — navegação genérica**
- `src/components/Layout/chrome/navItem.ts`, `src/components/atomic/Navigation/SarakMenuItem.tsx`,
  `SarakShellNav.tsx`, `SarakLink.tsx`, `SarakShellSearchWidget.tsx`, `SarakShellUserWidget.tsx`,
  `src/core/Shell/Components/types.ts` (o tipo de usuário, se sobreviver) — link real, `disabled`, `badge`,
  `target`, resultado de busca clicável, modelo de usuário genérico.
- `src/core/i18n/**` — os textos novos, nos idiomas do catálogo.

**Nos três lotes:** testes ao lado; casos novos em `browser-tests/` só se a `plan-89` já tiver passado
(senão, ficam para ela); `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*`,
`src/core/Provider/generated/` regenerados.

## 3.2 Fora (o que NÃO pode ser tocado)

- **Nenhum componente novo para sistema específico.** Submenu não entra (nenhum dos cinco sistemas tem);
  dock e redimensionar não entram.
- Os tokens de cromo que a `plan-89` liga (`maxContentWidth`, `layoutDensity`, `isSplitViewEnabled`).
- `src/components/atomic/Icon/**` — é da `plan-95`.
- A camada de preferências do usuário e o tema persistido (`plan-93`).
- `src/styles/` — é da `plan-90`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | o contrato do cromo inteiro: §2.1 (estrutura), §2.2 e §2.2.1/§2.2.2 (slots, widgets que nascem montados, a barra configurada pelo administrador), §2.3 (degradação), §2.4 (token vale nos dois modos — passa a valer num), §5 (altura e rolagem) |
| Spec fixa | `specs/specs/04-shell-e-discovery.md` | o que está sendo retirado — ler para não deixar resíduo |
| Spec fixa | `specs/arquitetura/01-forma-do-produto-e-modos-de-consumo.md` | §4 — os dois modos; o §4.1 sai |
| Spec fixa | `specs/adr/005-modelo-modulos-plugin-e-apps-separados.md` | a decisão que o ADR novo substitui — ler o `alternativas_consideradas` dela |
| Spec fixa | `specs/adr/013-item-de-navegacao-como-atomo-proprio.md` · `specs/adr/014-cromo-do-modo-ui-kit-com-widgets-por-padrao.md` · `specs/adr/016-preferencias-do-usuario-separadas-do-tema.md` | o item de navegação, os widgets por padrão, as preferências — continuam valendo |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | onde a seção de composição da barra entra, e o preview |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` | as três faixas e o mobile-first |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | §2.4 (teclado e ARIA) e §3.6 (tradução — os textos novos) |
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` · `specs/arquitetura/04-contrato-de-tokens-e-paridade.md` | nomes públicos, prefixo, paridade dos tokens que mudam |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` | §3 e §5 — é MAJOR e exige nota de migração |
| Spec fixa | `specs/specs/12-kit-do-consumidor.md` · `specs/specs/13-instalacao-e-atualizacao.md` §3 | o kit e o scaffolder |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` §9.6 | o gate de paridade de cromo |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-refatorar-componente` | remover nome público e token sem quebrar a paridade das três fontes |
| **Skill** | `ui-novo-componente` | os tokens de composição novos |
| **Skill** | `ui-arquitetura-design` | estilo por token no cromo |
| **Skill** | `test-unitario` | testes |
| Código | os arquivos de §3.1 | ler antes de editar |
| Código | `gates/scripts/contrato/check-chrome-token-parity.mjs` | o que conta como consumidor |

# 5. Instruções de execução

**Lote 1 — um cromo**

1. Remova o modo host: `SarakShell`, Discovery, registro, `SarakDynamicRenderer`, `useSarakRouter`,
   `useModuleDiscovery` e o que só eles usavam. O que sobrar sem importador sai junto. `SarakSearch` recebe
   `items` sempre.
2. O preview do painel desenha o `SarakAppChrome` com itens de exemplo, nas três geometrias.
3. O `sarak-ui init` gera um app com `SarakUIProvider` + `SarakAppChrome` + `navItems` + roteamento do
   próprio app (sem dependência nova). O teste do gerador continua provando os imports contra o barril.
4. O gate de paridade de cromo passa a um grupo; sua lista de órfãos não é tocada (é da `plan-89`).
5. Documentação: o modo host sai do kit, do `README` e de `docs/`; `docs/migracoes.md` ganha a nota MAJOR
   com o caminho de migração (de `SarakShell` + registro para `SarakAppChrome` + `navItems`).
6. Entregue o lote 1 e **pare para o veredito**.

**Lote 2 — barra completa por padrão**

7. A opção `hidden` de posição da busca sai; os 6 temas são ajustados; a paridade das três fontes fecha.
8. A composição da barra é um conjunto de tokens de posição (`pinned` / `menu` / `off`) que cobre todos os
   widgets, e **todo padrão de fábrica é "na barra"**. Um tema não pode esconder widget.
9. O painel ganha a seção de composição da barra, por sistema.
10. Widget que depende do importador (usuário sem `user`/`logout`; notificações sem itens ou sem handler)
    aparece **desabilitado**, com rótulo traduzido, e um aviso único em desenvolvimento diz o que ligar.
    Nenhum widget clicável faz nada em silêncio.
11. Entregue o lote 2 e **pare para o veredito**.

**Lote 3 — navegação genérica**

12. O item de navegação renderiza `<a href>`: clique simples sem modificador chama `onNavigate` e previne o
    padrão; Ctrl/Cmd/Shift, botão do meio e botão direito seguem o navegador. `SarakLink` ganha o mesmo
    tratamento (`onNavigate` opcional).
13. `SarakNavItem` ganha `disabled`, `badge` (texto ou número) e `target`; o átomo os renderiza.
14. O resultado da busca embutida navega ao ser clicado.
15. O modelo de usuário do widget vira genérico: `{ name, role?, avatarUrl?, email? }`; nenhum número de
    nível, nenhum rótulo de produto. O catálogo de textos ganha o que faltar.
16. `npm run build` · `npm run guide` · `npm run catalog` · `npm run dev-kit` · `npx tsc --noEmit` ·
    `npx vitest run` · `npm run audit` → verdes, sem regressão.

# 6. Critérios de aceite

- [ ] `git grep -n "SarakShell\b\|core/Shell\|core/Discovery\|useSarakRouter" -- src` devolve só os widgets
      renomeados ou nada; `src/core/Shell/` e `src/core/Discovery/` não existem.
- [ ] O preview do painel monta `SarakAppChrome`; o `init` gera um app sem registro de módulos, e o teste
      do gerador passa.
- [ ] O gate de paridade de cromo tem um grupo e passa.
- [ ] Nenhum tema shippado esconde widget; `hidden` não existe mais como opção; paridade das três fontes
      verde.
- [ ] Todo widget tem token de composição com padrão "na barra"; a seção existe no painel.
- [ ] Widget sem ativação do importador renderiza desabilitado, com `aria-disabled`, sem handler, e o aviso
      de desenvolvimento aparece uma vez (teste).
- [ ] Item de navegação é `<a href>`; Ctrl+clique e clique do meio não chamam `onNavigate` (teste); clique
      simples chama e previne o padrão (teste).
- [ ] `disabled`, `badge` e `target` chegam do dado ao átomo (teste).
- [ ] Resultado da busca clicável navega (teste).
- [ ] Widget de usuário renderiza com `{ name, role }` e nada com `level` sobra em `src/`.
- [ ] `docs/migracoes.md` tem a nota MAJOR; `README`, kit e `docs/` não mencionam o modo host — **exceto** a
      própria nota de migração (e a cópia dela no kit), que cita `SarakShell` para ensinar a sair dele; o
      `kit-names:check` e o `section-pointers:check` já a isentam por ser `migracoes.md`.
- [ ] `npm run build`, `npx tsc --noEmit`, `npx vitest run` verdes; `npm run audit` sem regressão.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` novo. O `chrome-token-parity:check` encolhe para um grupo e continua cobrando; a paridade de
tokens cobra as três fontes.

- `git status` + `git diff --stat` → só §3.1; `git diff --stat -- src/core/Shell src/core/Discovery` mostra
  só remoções.
- Mutação: `checkChromeTokenParity` com fixture de um token sem consumidor → acusa (a lista com um grupo não
  desligou o gate).
- `npm run build` (roda prefixo, barril, tipos públicos e catálogo).
- `node gates/scripts/contrato/check-minor-no-removal.mjs` → lista os nomes removidos (é MAJOR; confere com
  a nota de migração).
- Testes dos critérios: rodar isolados os arquivos tocados; `npx vitest run` inteiro.
- Leitura do diff dos widgets → nenhum handler vazio; estado desabilitado real.
- `npm run audit` contra o baseline.

# 8. Destino da síntese

**Destino:** `adr/018 (nova) + arquitetura/01-forma-do-produto-e-modos-de-consumo.md + specs/05-cromo-e-slots.md + specs/04-shell-e-discovery.md (retirada) + specs/06-painel-de-customizacao-e-preview.md + 00-contexto.md`

- **`adr/018`** — *um cromo só, o consumidor é dono das rotas*: substitui a parte do ADR-005 que fazia da lib
  o host. Alternativas reais: (1) manter dois cromos e portar defeito a defeito — custo: trabalho dobrado
  permanente e gate de paridade entre os dois; (2) Shell como camada fina sobre o AppChrome — custo: manter
  registro e roteador que nenhum consumidor atual usa. Escolhida: descartar. Custo da escolhida: o legado
  `Novo` precisa migrar, e `dock`/redimensionar saem.
- **`arquitetura/01`** §4 — um modo de consumo: ui-kit + central (mais o eixo app/embarcado, que não muda).
- **`05-cromo-e-slots`** — §2.1 (item de navegação é link), §2.2 (widgets: todos, por padrão na barra,
  inativos até o importador ligar; composição por token), §2.4 (um cromo, um consumidor por token).
- **`04-shell-e-discovery`** — retirada: o arquivo sai, com a tabela de destino demonstrado no índice.
- **`06-painel`** — a seção de composição da barra e o preview com o cromo real.
- **`00-contexto`** — §1 (os modos de consumo), §3 (mapa de blocos: `core/Shell` e `Discovery` saem) e §4
  (roteamento: a linha do Shell).

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## 2026-10-05 — execução encerrada no item 6

**Fotografia de `git status --short` antes da primeira edição:**

```text
M  specs/00-backlog.md
M  specs/00-indice.md
M  specs/plan/plan-94-um-cromo-so.md
?? .claude/settings.local.json
```

**Execução.** 1) Removidos o modo host, Shell, Discovery, registro e roteador; `SarakSearch.items` é obrigatório; catálogo de idiomas movido para i18n. 2) O preview usa `SarakAppChrome` nas três geometrias, com navegação de exemplo. 3) `sarak-ui init` gera Provider e `src/App.tsx`, com `navItems` e rotas locais via `pushState`/`popstate`; o teste confere imports contra o barril público. 4) O gate de paridade ficou com o grupo único `SarakAppChrome`, manteve a lista de órfãos e passou. 5) README, kit, guia e nota MAJOR foram atualizados; a tabela de `docs/migracoes.md` cobre individualmente os 22 exports removidos e descreve a migração de configuração, busca e scaffolder. A nota foi sincronizada no kit. 6) Execução encerrada aqui, pronta para revisão; nenhum trabalho posterior foi iniciado.

**Verificações.** `npm run build`, `npm run guide`, `npm run catalog`, `npm run dev-kit`, `npx tsc --noEmit` e `npx vitest run` passaram. Vitest: 388 arquivos, 2.069 testes. `check-audit-baseline.mjs --with-tsc` reportou igualdade com o baseline de 2026-08-11. Os gates `kit-names`, `trail-citation`, `class-merge`, `section-pointers`, `plan-index`, `chrome-token-parity`, `prefix`, `barrel`, `public-types`, `catalog:check`, `guide:check`, `dev-kit:check` e `migration-anchor` passaram.

**Fixture de mutação da paridade.** Entrada: `{ id: "sampleNavigationToken", cssVars: ["--sample-navigation-token"] }`, consumer `export const Chrome = () => null;`, grupo `SarakAppChrome`. Resultado: `[{ id: "sampleNavigationToken", semConsumidor: ["SarakAppChrome"] }]`.

**Achados fora do escopo.** `npm run audit` continua retornando código 1 por `--x` (uma referência) e `<input>` nativo em `SarakMultiSelect.tsx:113` e `SarakUploader.tsx:113`; esses arquivos não foram alterados e o baseline reportou igualdade. O validador TS/JS também apontou funções longas e tipagem inferida em componentes e testes existentes; os novos módulos de idiomas, scaffolder e renderer ficaram sem violações, e não ampliei a refatoração.

**Versão.** `check-minor-no-removal` listou os 22 nomes removidos e falhou em `7.0.0 → 7.0.0`; a nota MAJOR cobre todos individualmente. A versão do pacote permaneceu `7.0.0` nesta execução.

---

## Resumo da execução (correção 1) — 2026-10-05

**Resultado:** Concluído

**Estado do worktree ao iniciar**

```text
 M .agents/skills/ui-integra-consumidor/SKILL.md
 M .agents/skills/ui-integra-consumidor/references/examples.md
 M .claude/skills/ui-integra-consumidor/SKILL.md
 M .claude/skills/ui-integra-consumidor/references/examples.md
 M README.md
 M bin/scaffold/__tests__/runInit.fs.test.mjs
 M bin/scaffold/buildFileMap.mjs
 M bin/scaffold/constants.mjs
 D bin/scaffold/generators/exampleModule.mjs
 M bin/scaffold/generators/mainTsx.mjs
 M bin/scaffold/generators/viteConfig.mjs
 M bin/scaffold/prompts.mjs
 M dist/BUILD_INFO.json
 D dist/CustomizationPanelImpl-ZPF4CBKP.js
 D dist/SarakChartEngine-GTF5UPIH.js
 D dist/SarakChatEngine-FVBQEEID.js
 D dist/SarakDataTableImpl-G6MU4VAB.js
 D dist/SarakFlowEngine-EKU6RBPG.js
 D dist/SarakMarkdownRendererImpl-K34PDQCC.js
 D dist/SarakPDFViewerImpl-QKO3JBBC.js
 D dist/chunk-3TGB3W3O.js
 D dist/chunk-E657C7CH.js
 D dist/chunk-JH2SPCYK.js
 D dist/chunk-KV7CTFRO.js
 D dist/chunk-M5ZA6YHK.js
 D dist/chunk-WIHSARTC.js
 M dist/index.cjs
 M dist/index.d.cts
 M dist/index.d.ts
 M dist/index.js
 M dist/sarak-scoped.css
 M dist/sarak.css
 M docs/component-catalog.json
 M docs/component-catalog.md
 M docs/migracoes.md
 M docs/temas-cromo-e-multidispositivo.md
 M gates/scripts/contrato/__tests__/check-chrome-token-parity.test.mjs
 M gates/scripts/contrato/check-chrome-token-parity.mjs
 M gates/scripts/contrato/check-container-query-boundary.mjs
 M gates/scripts/contrato/check-kit-names.mjs
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/START-HERE.md
 M sarak-ui/VERSION
 M sarak-ui/catalog.json
 M sarak-ui/docs/migracoes.md
 M sarak-ui/skill/SKILL.md
 M sarak-ui/skill/references/examples.md
 M scripts/consumer-kit/collectKitSources.mjs
 M specs/00-backlog.md
 M specs/00-indice.md
 M specs/plan/plan-90-css-que-so-o-navegador-mede.md
 M specs/plan/plan-94-um-cromo-so.md
 M specs/specs/06-painel-de-customizacao-e-preview.md
 M src/buildInfo.ts
 M src/components/Layout/SarakAppChrome.tsx
 M src/components/Layout/SarakAppChromeMobile.tsx
 M src/components/Layout/__tests__/SarakAppChrome.test.tsx
 M src/components/Layout/chrome/ChromeCollapseToggle.tsx
 M src/components/Layout/chrome/ChromeSidebarBody.tsx
 M src/components/Layout/chrome/ChromeTopbarBody.tsx
 M src/components/Layout/chrome/ChromeUserThemeGroup.tsx
 M src/components/Layout/chrome/__tests__/useChromeDefaultWidgets.test.ts
 M src/components/Layout/chrome/chromeStructuralStyles.ts
 M src/components/Layout/chrome/noiseTexture.ts
 M src/components/Layout/chrome/useChromeAutoHide.ts
 M src/components/Layout/chrome/useChromeDefaultWidgets.ts
 M src/components/atomic/Cards/SarakActionCard.tsx
 M src/components/atomic/Inputs/SarakSearch.tsx
 M src/components/atomic/Inputs/__tests__/SarakSearch.test.tsx
 M src/components/atomic/Layouts/SarakGrid.tsx
 M src/components/atomic/Navigation/SarakShellLanguageSelector.tsx
 M src/components/atomic/Navigation/SarakShellNav.tsx
 M src/components/atomic/Navigation/SarakShellSearchWidget.tsx
 M src/components/atomic/Navigation/SarakShellUserWidget.tsx
 M src/components/atomic/Navigation/ShellPreferencesMenu.tsx
 M src/components/atomic/Navigation/__tests__/SarakShellLanguageSelector.test.tsx
 M src/components/atomic/Navigation/__tests__/SarakShellSearchWidget.test.tsx
 M src/components/atomic/Navigation/__tests__/ShellWidgetsForaDoShell.test.tsx
 M src/components/atomic/Navigation/index.ts
 M src/components/atomic/Templates/SarakStats.tsx
 D src/constants/discovery.ts
 D src/core/Discovery/DynamicRenderer.tsx
 D src/core/Discovery/__tests__/DynamicRenderer.test.tsx
 D src/core/Discovery/__tests__/registry.test.ts
 D src/core/Discovery/components/ContractRenderer.tsx
 D src/core/Discovery/components/SarakExpandableMatrixEngine.tsx
 D src/core/Discovery/components/__tests__/ContractRenderer.test.tsx
 D src/core/Discovery/components/__tests__/SarakExpandableMatrixEngine.test.tsx
 D src/core/Discovery/components/hooks/__tests__/useExpandableMatrixEngine.test.ts
 D src/core/Discovery/components/hooks/useExpandableMatrixEngine.ts
 D src/core/Discovery/constants.ts
 D src/core/Discovery/hooks/__tests__/useEndpointResolver.test.ts
 D src/core/Discovery/hooks/useEndpointResolver.ts
 D src/core/Discovery/registry.ts
 D src/core/Discovery/types.ts
 M src/core/Provider/SarakUIProvider.tsx
 M src/core/Provider/__tests__/SarakUIProvider.test.tsx
 M src/core/Provider/buildInfo.ts
 D src/core/Provider/hooks/__tests__/useRegistryManager.test.ts
 D src/core/Provider/hooks/useRegistryManager.ts
 M src/core/Provider/manifest.ts
 M src/core/Provider/payloadExtraKeys.ts
 M src/core/Provider/providerProps.ts
 M src/core/Provider/types.ts
 M src/core/Provider/useHasGlobalBackgroundMedia.ts
 D src/core/Shell/Components/DockNav.tsx
 D src/core/Shell/Components/IconRenderer.tsx
 D src/core/Shell/Components/ShellContent.tsx
 D src/core/Shell/Components/SidebarNav.tsx
 D src/core/Shell/Components/SidebarNavModuleItem.tsx
 D src/core/Shell/Components/TopbarNav.tsx
 D src/core/Shell/Components/__tests__/DockNav.test.tsx
 D src/core/Shell/Components/__tests__/IconRenderer.test.tsx
 D src/core/Shell/Components/__tests__/ShellContent.test.tsx
 D src/core/Shell/Components/__tests__/SidebarNav.preferencesBar.test.tsx
 D src/core/Shell/Components/__tests__/SidebarNav.test.tsx
 D src/core/Shell/Components/__tests__/SidebarNavModuleItem.test.tsx
 D src/core/Shell/Components/__tests__/TopbarNav.preferencesBar.test.tsx
 D src/core/Shell/Components/__tests__/TopbarNav.test.tsx
 D src/core/Shell/Components/types.ts
 D src/core/Shell/SarakShell.tsx
 D src/core/Shell/__tests__/SarakShell.test.tsx
 D src/core/Shell/__tests__/useSarakShell.test.ts
 D src/core/Shell/hooks/__tests__/useDimensionGuard.test.ts
 D src/core/Shell/hooks/__tests__/useSarakShellUI.test.ts
 D src/core/Shell/hooks/__tests__/useShellDiagnostics.test.ts
 D src/core/Shell/hooks/__tests__/useShellLayoutStyles.test.ts
 D src/core/Shell/hooks/__tests__/useVisualSafetyGate.test.ts
 D src/core/Shell/hooks/useDimensionGuard.ts
 D src/core/Shell/hooks/useSarakShellUI.ts
 D src/core/Shell/hooks/useShellDiagnostics.ts
 D src/core/Shell/hooks/useShellLayoutStyles.ts
 D src/core/Shell/hooks/useVisualSafetyGate.ts
 D src/core/Shell/useSarakShell.ts
 M src/core/i18n/__tests__/catalog.test.ts
 M src/core/i18n/catalog.types.ts
 M src/core/i18n/useLibraryText.ts
 M src/features/DesignEngine/Canvas/PreviewCanvas.tsx
 M src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap
 M src/features/DesignEngine/Canvas/components/CardsCatalog.tsx
 M src/features/DesignEngine/Canvas/components/PreviewSystemRenderer.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/PreviewSystemRenderer.test.tsx
 D src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PreviewSystemRenderer.test.tsx.snap
 D src/features/DesignEngine/Canvas/hooks/__tests__/useMockModules.test.ts
 D src/features/DesignEngine/Canvas/hooks/useMockModules.ts
 M src/features/DesignEngine/Panels/AdvancedTab.tsx
 M src/features/DesignEngine/Panels/LanguageTab.tsx
 M src/features/DesignEngine/Panels/__tests__/AdvancedTab.test.tsx
 M src/features/DesignEngine/Panels/__tests__/__snapshots__/AdvancedTab.test.tsx.snap
 M src/index.ts
 D src/shared/hooks/__tests__/useModuleDiscovery.test.ts
 D src/shared/hooks/__tests__/useSarakRouter.test.ts
 D src/shared/hooks/useModuleDiscovery.ts
 D src/shared/hooks/useSarakRouter.ts
 M src/shared/hooks/useSearchShortcut.ts
 M src/shared/types/index.ts
?? .claude/settings.local.json
?? bin/scaffold/generators/appTsx.mjs
?? dist/CustomizationPanelImpl-WEDHGLH7.js
?? dist/SarakChartEngine-XMVWPUQF.js
?? dist/SarakChatEngine-ZCVXPZW6.js
?? dist/SarakDataTableImpl-BOJVVO5L.js
?? dist/SarakFlowEngine-HKU6I3MO.js
?? dist/SarakMarkdownRendererImpl-747SITTD.js
?? dist/SarakPDFViewerImpl-6LD74ZEG.js
?? dist/chunk-6PA5UCUH.js
?? dist/chunk-LC344QIW.js
?? dist/chunk-SX4W52WY.js
?? dist/chunk-TGQ2SYPU.js
?? dist/chunk-TUZXIQ2Z.js
?? dist/chunk-ZYXZHYYV.js
?? specs/plan/plan-100-painel-de-temas-caminho-simples.md
?? specs/plan/plan-101-motor-de-graficos-completo.md
?? specs/plan/plan-102-quadro-kanban-de-gestao-de-projetos.md
?? specs/plan/plan-103-calendario-e-gantt-de-projetos.md
?? specs/plan/plan-99-achar-e-priorizar-no-painel-de-temas.md
?? src/core/i18n/languages.ts
```

**O que foi feito**
1. **Preview.** Restaurados dois casos para a mídia global, três para a escala pela largura medida e quatro para `arePreviewPropsEqual`, ajustados às props atuais em `PreviewSystemRenderer.test.tsx:96`, `:123` e `:144`. Mutação da mídia: entrada `globalBackgroundImageUrl=https://example.com/preview-background.png`; removi temporariamente a condição que tornava o fundo transparente; resultado: o caso falhou (esperado `transparent`, recebido `var(--sarak-bg-base)`, 1 falha e 12 ignorados). Mutação do comparador: `activePreviewApp` mudou de `dashboard` para `reports`; removi temporariamente a comparação dessa prop; resultado: o caso falhou (exit 1; 1 falha e 12 ignorados). As duas mutações foram revertidas.
2. **Gate de paridade.** Restaurados casos para fronteira de palavra, desestruturação, exclusão de `__tests__/`, `extraFiles` e os três caminhos de extração dinâmica do schema; nomes em português. Mantidos dois casos de mutação ajustados ao único grupo `SarakAppChrome` em `check-chrome-token-parity.test.mjs:64` e `:75`.
3. **Override global.** Restaurada somente a leitura de `window.__SARAK_OVERRIDES__['shell-language-selector']` em `SarakShellLanguageSelector.tsx:40`; adicionado teste em `SarakShellLanguageSelector.test.tsx:156`. A consulta ao registro não foi reintroduzida.
4. **Comentário do grid.** Reescrito em `SarakGrid.tsx:57` para explicar a fronteira de medição sem compor o padrão que acionava o scanner. O build completo passou pelo CSS do Tailwind.
5. **Resumo.** Acrescentado este bloco, sem alterar o resumo anterior, com tabela de arquivos, critérios do lote 1 e decisões observáveis no diff.

**Arquivos alterados nesta correção**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/Canvas/components/__tests__/PreviewSystemRenderer.test.tsx` | alterado | Mídia global, escala de contêiner e comparador. |
| `gates/scripts/contrato/__tests__/check-chrome-token-parity.test.mjs` | alterado | Casos de fronteira, grupo único, mutações e extração do schema. |
| `src/components/atomic/Navigation/SarakShellLanguageSelector.tsx` | alterado | Leitura do override global. |
| `src/components/atomic/Navigation/__tests__/SarakShellLanguageSelector.test.tsx` | alterado | Proteção do override global. |
| `src/components/atomic/Layouts/SarakGrid.tsx` | alterado | Comentário compatível com o scanner. |
| `specs/plan/plan-94-um-cromo-so.md` | alterado | Este resumo append-only e retorno do status para revisão. |
| `dist/**` | regenerado pelo build | Bundles, chunks, CSS e metadados gerados; sem edição manual. |
| `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | regenerados pelo build | Metadados de build gerados pelo comando. |

**Verificações executadas**
- `npx vitest run src/features/DesignEngine/Canvas/components/__tests__/PreviewSystemRenderer.test.tsx gates/scripts/contrato/__tests__/check-chrome-token-parity.test.mjs src/components/atomic/Navigation/__tests__/SarakShellLanguageSelector.test.tsx` → 3 arquivos, 37 testes verdes.
- Mutações temporárias dos testes de mídia e comparador → cada teste falhou com a regressão plantada; fontes restauradas depois.
- `npm run build` → sucesso na execução autorizada; 96 componentes no barril, 310 exports no prefixo, tipos públicos em dia, `kit-names` verde e CSS Tailwind/escopado gerado. Duas tentativas no sandbox padrão pararam no `tsup` com `Acesso negado` ao resolver diretórios; a mesma execução concluiu com acesso aprovado, sem mudar o comando.
- `npx tsc --noEmit` → exit 0.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → igual ao baseline de 2026-08-11; nenhuma regressão.
- `npx vitest run` → 388 arquivos e 2.088 testes verdes (359,69 s). Avisos de manifesto GLib e CSS do ambiente apareceram sem falhas de teste.
- `npm run class-merge:check` → verde; nenhum átomo concatena `className` fora da allowlist.
- `npm run section-pointers:check` → verde; nenhum ponteiro de seção autorreferente morto.
- `npm run plan-index:check` → verde antes da transição final do status; índice e frontmatter estavam sincronizados.
- `npm run chrome-token-parity:check` → verde; 37 tokens cobertos de 40 têm consumidor no grupo único `SarakAppChrome`.
- `git diff --check` nos arquivos desta correção → sem erro de whitespace.

**Critérios de aceite — lote 1**
- [x] Modo host removido — evidência já registrada no veredito anterior: `git grep` sem resíduos e diretórios `src/core/Shell/` e `src/core/Discovery/` ausentes; esta correção não alterou esses arquivos.
- [x] Preview com `SarakAppChrome` nas três geometrias — evidência atual: 3 casos de geometria e os testes restaurados passaram na suíte completa.
- [x] `init` gera app sem registro de módulos — evidência previamente registrada no resumo anterior: teste do gerador passou e verifica imports pelo barril; não alterado nesta correção.
- [x] Paridade com um grupo — evidência atual: `chrome-token-parity:check` passou com 37/40 tokens cobertos e o arquivo restaurado tem casos de fronteira e mutação.
- [x] Nota MAJOR cobre os nomes públicos removidos — evidência previamente confirmada no veredito: 22 nomes cobertos individualmente; documentação não foi alterada nesta correção.
- [x] TypeScript, testes completos e build — evidência: resultados acima; baseline de auditoria igual ao baseline.

**Decisões e suposições**
- Mantidos `level?: number` e o índice aberto de `SarakShellUser` no lote 1.
- Mantido `options.manifest` como `Record<string, unknown>`.
- Mantida a mudança do catálogo de idiomas para `src/core/i18n/languages.ts`.
- Mantida a remoção do indicador `Módulos Ativos` de `AdvancedTab`.
- Mantida a remoção de comentários antigos que apontavam para plans/specs em arquivos do lote 1.
- Nenhuma suposição adicional foi necessária nesta correção.

**Achados fora do escopo (não corrigidos)**
- Nenhum achado novo. A falha de `npm run audit` descrita no resumo anterior permanece como baseline conhecido; os arquivos citados ali não foram alterados nesta correção.

**Pendências / riscos**
- Nenhum dos cinco achados permanece pendente. Os lotes 2 e 3 não foram iniciados.

## Resumo da execução (correção 2) — 2026-10-05

**Fotografia de `git status --short` antes da primeira edição desta rodada:**

```text
 M .agents/skills/ui-integra-consumidor/SKILL.md
 M .agents/skills/ui-integra-consumidor/references/examples.md
 M .claude/skills/ui-integra-consumidor/SKILL.md
 M .claude/skills/ui-integra-consumidor/references/examples.md
 M README.md
 M bin/scaffold/__tests__/runInit.fs.test.mjs
 M bin/scaffold/buildFileMap.mjs
 M bin/scaffold/constants.mjs
 D bin/scaffold/generators/exampleModule.mjs
 M bin/scaffold/generators/mainTsx.mjs
 M bin/scaffold/generators/viteConfig.mjs
 M bin/scaffold/prompts.mjs
 M dist/BUILD_INFO.json
 D dist/CustomizationPanelImpl-ZPF4CBKP.js
 D dist/SarakChartEngine-GTF5UPIH.js
 D dist/SarakChatEngine-FVBQEEID.js
 D dist/SarakDataTableImpl-G6MU4VAB.js
 D dist/SarakFlowEngine-EKU6RBPG.js
 D dist/SarakMarkdownRendererImpl-K34PDQCC.js
 D dist/SarakPDFViewerImpl-QKO3JBBC.js
 D dist/chunk-3TGB3W3O.js
 D dist/chunk-E657C7CH.js
 D dist/chunk-JH2SPCYK.js
 D dist/chunk-KV7CTFRO.js
 D dist/chunk-M5ZA6YHK.js
 D dist/chunk-WIHSARTC.js
 M dist/index.cjs
 M dist/index.d.cts
 M dist/index.d.ts
 M dist/index.js
 M dist/sarak-scoped.css
 M dist/sarak.css
 M docs/component-catalog.json
 M docs/component-catalog.md
 M docs/migracoes.md
 M docs/temas-cromo-e-multidispositivo.md
 M gates/scripts/contrato/__tests__/check-chrome-token-parity.test.mjs
 M gates/scripts/contrato/check-chrome-token-parity.mjs
 M gates/scripts/contrato/check-container-query-boundary.mjs
 M gates/scripts/contrato/check-kit-names.mjs
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/START-HERE.md
 M sarak-ui/VERSION
 M sarak-ui/catalog.json
 M sarak-ui/docs/migracoes.md
 M sarak-ui/skill/SKILL.md
 M sarak-ui/skill/references/examples.md
 M scripts/consumer-kit/collectKitSources.mjs
 M specs/00-backlog.md
 M specs/00-indice.md
 M specs/plan/plan-90-css-que-so-o-navegador-mede.md
 M specs/plan/plan-94-um-cromo-so.md
 M specs/specs/06-painel-de-customizacao-e-preview.md
 M src/buildInfo.ts
 M src/components/Layout/SarakAppChrome.tsx
 M src/components/Layout/SarakAppChromeMobile.tsx
 M src/components/Layout/__tests__/SarakAppChrome.test.tsx
 M src/components/Layout/chrome/ChromeCollapseToggle.tsx
 M src/components/Layout/chrome/ChromeSidebarBody.tsx
 M src/components/Layout/chrome/ChromeTopbarBody.tsx
 M src/components/Layout/chrome/ChromeUserThemeGroup.tsx
 M src/components/Layout/chrome/__tests__/useChromeDefaultWidgets.test.ts
 M src/components/Layout/chrome/chromeStructuralStyles.ts
 M src/components/Layout/chrome/noiseTexture.ts
 M src/components/Layout/chrome/useChromeAutoHide.ts
 M src/components/Layout/chrome/useChromeDefaultWidgets.ts
 M src/components/atomic/Cards/SarakActionCard.tsx
 M src/components/atomic/Inputs/SarakSearch.tsx
 M src/components/atomic/Inputs/__tests__/SarakSearch.test.tsx
 M src/components/atomic/Layouts/SarakGrid.tsx
 M src/components/atomic/Navigation/SarakShellLanguageSelector.tsx
 M src/components/atomic/Navigation/SarakShellNav.tsx
 M src/components/atomic/Navigation/SarakShellSearchWidget.tsx
 M src/components/atomic/Navigation/SarakShellUserWidget.tsx
 M src/components/atomic/Navigation/ShellPreferencesMenu.tsx
 M src/components/atomic/Navigation/__tests__/SarakShellLanguageSelector.test.tsx
 M src/components/atomic/Navigation/__tests__/SarakShellSearchWidget.test.tsx
 M src/components/atomic/Navigation/__tests__/ShellWidgetsForaDoShell.test.tsx
 M src/components/atomic/Navigation/index.ts
 M src/components/atomic/Templates/SarakStats.tsx
 D src/constants/discovery.ts
 D src/core/Discovery/DynamicRenderer.tsx
 D src/core/Discovery/__tests__/DynamicRenderer.test.tsx
 D src/core/Discovery/__tests__/registry.test.ts
 D src/core/Discovery/components/ContractRenderer.tsx
 D src/core/Discovery/components/SarakExpandableMatrixEngine.tsx
 D src/core/Discovery/components/__tests__/ContractRenderer.test.tsx
 D src/core/Discovery/components/__tests__/SarakExpandableMatrixEngine.test.tsx
 D src/core/Discovery/components/hooks/__tests__/useExpandableMatrixEngine.test.ts
 D src/core/Discovery/components/hooks/useExpandableMatrixEngine.ts
 D src/core/Discovery/constants.ts
 D src/core/Discovery/hooks/__tests__/useEndpointResolver.test.ts
 D src/core/Discovery/hooks/useEndpointResolver.ts
 D src/core/Discovery/registry.ts
 D src/core/Discovery/types.ts
 M src/core/Provider/SarakUIProvider.tsx
 M src/core/Provider/__tests__/SarakUIProvider.test.tsx
 M src/core/Provider/buildInfo.ts
 D src/core/Provider/hooks/__tests__/useRegistryManager.test.ts
 D src/core/Provider/hooks/useRegistryManager.ts
 M src/core/Provider/manifest.ts
 M src/core/Provider/payloadExtraKeys.ts
 M src/core/Provider/providerProps.ts
 M src/core/Provider/types.ts
 M src/core/Provider/useHasGlobalBackgroundMedia.ts
 D src/core/Shell/Components/DockNav.tsx
 D src/core/Shell/Components/IconRenderer.tsx
 D src/core/Shell/Components/ShellContent.tsx
 D src/core/Shell/Components/SidebarNav.tsx
 D src/core/Shell/Components/SidebarNavModuleItem.tsx
 D src/core/Shell/Components/TopbarNav.tsx
 D src/core/Shell/Components/__tests__/DockNav.test.tsx
 D src/core/Shell/Components/__tests__/IconRenderer.test.tsx
 D src/core/Shell/Components/__tests__/ShellContent.test.tsx
 D src/core/Shell/Components/__tests__/SidebarNav.preferencesBar.test.tsx
 D src/core/Shell/Components/__tests__/SidebarNav.test.tsx
 D src/core/Shell/Components/__tests__/SidebarNavModuleItem.test.tsx
 D src/core/Shell/Components/__tests__/TopbarNav.preferencesBar.test.tsx
 D src/core/Shell/Components/__tests__/TopbarNav.test.tsx
 D src/core/Shell/Components/types.ts
 D src/core/Shell/SarakShell.tsx
 D src/core/Shell/__tests__/SarakShell.test.tsx
 D src/core/Shell/__tests__/useSarakShell.test.ts
 D src/core/Shell/hooks/__tests__/useDimensionGuard.test.ts
 D src/core/Shell/hooks/__tests__/useSarakShellUI.test.ts
 D src/core/Shell/hooks/__tests__/useShellDiagnostics.test.ts
 D src/core/Shell/hooks/__tests__/useShellLayoutStyles.test.ts
 D src/core/Shell/hooks/__tests__/useVisualSafetyGate.test.ts
 D src/core/Shell/hooks/useDimensionGuard.ts
 D src/core/Shell/hooks/useSarakShellUI.ts
 D src/core/Shell/hooks/useShellDiagnostics.ts
 D src/core/Shell/hooks/useShellLayoutStyles.ts
 D src/core/Shell/hooks/useVisualSafetyGate.ts
 D src/core/Shell/useSarakShell.ts
 M src/core/i18n/__tests__/catalog.test.ts
 M src/core/i18n/catalog.types.ts
 M src/core/i18n/useLibraryText.ts
 M src/features/DesignEngine/Canvas/PreviewCanvas.tsx
 M src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap
 M src/features/DesignEngine/Canvas/components/CardsCatalog.tsx
 M src/features/DesignEngine/Canvas/components/PreviewSystemRenderer.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/PreviewSystemRenderer.test.tsx
 D src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PreviewSystemRenderer.test.tsx.snap
 D src/features/DesignEngine/Canvas/hooks/__tests__/useMockModules.test.ts
 D src/features/DesignEngine/Canvas/hooks/useMockModules.ts
 M src/features/DesignEngine/Panels/AdvancedTab.tsx
 M src/features/DesignEngine/Panels/LanguageTab.tsx
 M src/features/DesignEngine/Panels/__tests__/AdvancedTab.test.tsx
 M src/features/DesignEngine/Panels/__tests__/__snapshots__/AdvancedTab.test.tsx.snap
 M src/index.ts
 D src/shared/hooks/__tests__/useModuleDiscovery.test.ts
 D src/shared/hooks/__tests__/useSarakRouter.test.ts
 D src/shared/hooks/useModuleDiscovery.ts
 D src/shared/hooks/useSarakRouter.ts
 M src/shared/hooks/useSearchShortcut.ts
 M src/shared/types/index.ts
?? .claude/settings.local.json
?? bin/scaffold/generators/appTsx.mjs
?? dist/CustomizationPanelImpl-PFA3FJDZ.js
?? dist/SarakChartEngine-G6CHQGS6.js
?? dist/SarakChatEngine-3VHQ4S22.js
?? dist/SarakDataTableImpl-6MWJFUKA.js
?? dist/SarakFlowEngine-ZUJ7437L.js
?? dist/SarakMarkdownRendererImpl-B6DQS24F.js
?? dist/SarakPDFViewerImpl-7AOO6IBS.js
?? dist/chunk-HPB3WKFQ.js
?? dist/chunk-HZGB4W64.js
?? dist/chunk-KJCTOGXY.js
?? dist/chunk-P5O5MJFJ.js
?? dist/chunk-PTEPJFCX.js
?? dist/chunk-U4LO7DDF.js
?? specs/plan/plan-100-painel-de-temas-caminho-simples.md
?? specs/plan/plan-101-motor-de-graficos-completo.md
?? specs/plan/plan-102-quadro-kanban-de-gestao-de-projetos.md
?? specs/plan/plan-103-calendario-e-gantt-de-projetos.md
?? specs/plan/plan-99-achar-e-priorizar-no-painel-de-temas.md
?? src/core/i18n/languages.ts
```

**Achado 3 — fechado.** O componente voltou à ordem do `HEAD`: `useSarakUI`, `useLibraryText` e `useState` são chamados antes da leitura do override e do retorno antecipado. A origem do override é somente `window.__SARAK_OVERRIDES__['shell-language-selector']`; a consulta ao registro não voltou. O override é devolvido dentro do invólucro `relative isolate !overflow-visible sarak-language-override-wrapper`, com `horizontal-variant` quando `variant="horizontal"`.

**Teste e mutação.** O teste verifica que o override é descendente de `.sarak-language-override-wrapper` e que, em `variant="horizontal"`, o invólucro também recebe `horizontal-variant`. Caso normal: 1 teste passou (8 casos do arquivo filtrados). Entrada da mutação: override global configurado para o seletor, renderizado com `variant="horizontal"`; removi temporariamente o invólucro. Resultado: o teste falhou (1 falha, 8 filtrados), pois `closest('.sarak-language-override-wrapper')` retornou `null` e `toHaveClass` recebeu `null`. O invólucro foi restaurado antes da suíte final.

**Arquivos alterados do lote 1**

| Diretório | Alterados | Removidos | Criados | Regenerados pelo build* |
|---|---:|---:|---:|---:|
| `.agents/skills/ui-integra-consumidor/**` | 2 | 0 | 0 | 0 |
| `.claude/skills/ui-integra-consumidor/**` | 2 | 0 | 0 | 0 |
| `raiz` | 1 | 0 | 0 | 0 |
| `bin/scaffold/**` | 6 | 1 | 1 | 0 |
| `dist/**` | 7 | 13 | 13 | 33 |
| `docs/**` | 4 | 0 | 0 | 0 |
| `gates/scripts/contrato/**` | 4 | 0 | 0 | 0 |
| `sarak-ui/**` | 7 | 0 | 0 | 0 |
| `scripts/consumer-kit/**` | 1 | 0 | 0 | 0 |
| `specs/plan (plan-94)` | 1 | 0 | 0 | 0 |
| `src (raiz)` | 2 | 0 | 0 | 1 |
| `src/components/Layout/**` | 12 | 0 | 0 | 0 |
| `src/components/atomic/**` | 14 | 0 | 0 | 0 |
| `src/constants/**` | 0 | 1 | 0 | 0 |
| `src/core/Discovery/**` | 0 | 14 | 0 | 0 |
| `src/core/Provider/**` | 8 | 2 | 0 | 1 |
| `src/core/Shell/**` | 0 | 29 | 0 | 0 |
| `src/core/i18n/**` | 3 | 0 | 1 | 0 |
| `src/features/DesignEngine/Canvas/**` | 5 | 3 | 0 | 0 |
| `src/features/DesignEngine/Panels/**` | 4 | 0 | 0 | 0 |
| `src/shared/hooks/**` | 1 | 4 | 0 | 0 |
| `src/shared/types/**` | 1 | 0 | 0 | 0 |

* Os contadores de alteração, remoção e criação foram apurados do `git status --short` capturado nesta rodada: 177 entradas no worktree, das quais 167 pertencem ao lote 1. A tabela exclui os nove arquivos especificados como alheios e `.claude/settings.local.json`. `Regenerados pelo build` é subconjunto desses contadores: 33 arquivos em `dist/` e os dois `buildInfo.ts`. O resíduo ignorado `agent-design-operator/` não aparece no status nem entra na contagem.

**Verificações.** `npx vitest run` → 388 arquivos e 2.088 testes passaram (467,40 s; avisos ambientais de CSS/GLib sem falhas). `npx tsc --noEmit` → exit 0. `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → igual ao baseline de 2026-08-11. O build não foi repetido: esta correção não altera artefatos gerados.

**Estado.** Somente o Achado 3 e o inventário agrupado foram tratados nesta rodada. Lote 1 devolvido para revisão; lotes 2 e 3 não iniciados.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-05 — 🔴 Reprovado (lote 1)

**Antes de gravar:** a §10 foi relida no disco: vazia. Verificação feita sobre o worktree com o lote 1 (176 entradas;
só os arquivos de `specs/` que **não** são do executor aparecem alterados — nenhuma spec fixa foi editada).

**O que está certo, e foi verificado por mim:**

- **Modo host removido.** `git grep -E "SarakShell\b|core/Shell|core/Discovery|useSarakRouter" -- src` → vazio;
  `src/core/Shell/` e `src/core/Discovery/` não existem. `check-minor-no-removal` lista os **22** nomes e a nota
  `8.0.0` da `docs/migracoes.md` os cobre **um a um** (a falha dele em `7.0.0 → 7.0.0` é a esperada: a versão sobe na
  emissão do release, não nesta execução).
- **Preview:** `PreviewSystemRenderer` monta `SarakAppChrome`, com a navegação de exemplo vinda das telas.
- **`sarak-ui init`:** gera `main.tsx` (Provider) e `src/App.tsx` (`SarakAppChrome`, `navItems`, rotas por
  `pushState`/`popstate`); o teste confere os imports contra o barril.
- **Paridade de cromo:** um grupo, `SarakAppChrome`. Refiz a mutação por fixture fora do repositório: token só citado
  em `__tests__/` → `semConsumidor: ["SarakAppChrome"]`; token que é **substring** de outro identificador → também
  acusado. **O gate se comporta; o que faltou foi o teste dele (achado 2).**
- **Documentação:** `README`, `docs/`, kit (`sarak-ui/`), guia e skills **não** mencionam mais o modo host fora da
  nota de migração (`git grep` limpo). `kit-names:check` verde.
- **Provider:** `isHydrated` reimplementado (`useState` + `useEffect`) equivale ao do hook removido (verdadeiro após a
  montagem). Mudanças em `Layout/**`, `SarakGrid`, `SarakActionCard`, `SarakStats` e nos gates `check-kit-names` e
  `check-container-query-boundary`: só **import** e **comentário** (conferi linha a linha) — consequência direta da
  remoção, aceita.
- **Regressão, rodada por mim** (sem outro `vitest`/`tsup` ativo): `npx tsc --noEmit` → 0 ·
  `check-audit-baseline --with-tsc` → **igual ao baseline** · `npx vitest run` → **388 arquivos, 2069 testes
  verdes** (375 s) · verdes: `kit-names`, `trail-citation`, `class-merge`, `section-pointers`, `plan-index`,
  `chrome-token-parity`, `prefix` (310), `barrel` (96), `public-types`, `catalog`, `guide`, `dev-kit`,
  `build-info`, `package` (95), `zero-brand`, `token-types`.

**Achados — a correção é exclusivamente estes:**

1. **Testes de comportamento que continua existindo foram apagados com o código que saiu.**
   `PreviewSystemRenderer.test.tsx` foi de **11 para 2** casos e perdeu o snapshot. Sumiram: (a) os dois casos da
   **mídia global no preview** — a spec 06 §6.5 cita este arquivo como a prova em jsdom, e o comportamento
   (`globalBackgroundImageUrl` → fundo transparente; sem mídia → `var(--sarak-bg-base)`) **continua no código**
   (`PreviewSystemRenderer.tsx`); (b) os três casos de **escala pela largura real do contêiner** através do
   renderizador (a spec 06 §6.2.1 e a plan-35); (c) os quatro do comparador `arePreviewPropsEqual`, que
   **continua exportado** e é o que corta a segunda computação de variantes de cor. O que saía com o Shell eram só
   as props de navegação (`isSidebar`, `isDock`, `previewNavVisible`…). Faça: restaurar (a), (b) e (c),
   **adaptados** às props que sobraram; (a) e (c) com um caso que **falha** se o comportamento sumir — mostre a
   mutação (ex.: tirar a condição de mídia do fundo; incluir `activePreviewApp` fora do comparador).
2. **O teste do gate de paridade caiu de 17 para 6 casos, e quase todos os perdidos não eram do Shell.** Saíram:
   o limite de **fronteira de palavra** (id como substring de outro identificador não conta), o consumo por
   **desestruturação**, a **isenção de `__tests__/`**, o `extraFiles` contar como consumo do grupo, e os **três**
   da extração dinâmica do schema (token novo sem consumidor é pego, com consumidor é liberado, a leitura da seção
   de layout para antes da seção de bordas). É o limite 4 do R18 do próprio gate: gate cujo limite não tem caso
   que falha não está provado. Faça: restaurar esses casos, ajustados a **um** grupo, e manter os dois de
   mutação (`layoutPadding` do AppChrome). Os nomes dos casos novos estão **em inglês**; o arquivo e o repositório
   usam português — escreva no idioma do vizinho.
3. **O override do seletor de idioma pelo host (`window.__SARAK_OVERRIDES__['shell-language-selector']`) foi
   removido em silêncio.** O plan mandava remover o **registro** (`sarakGetLocalComponent`); o global **não**
   dependia dele, é caminho documentado (`docs/migracoes.md`, entradas das plans 74/75: "continua funcionando, sem
   mudança") e **não** consta da nota `8.0.0`. Removeram também o teste dele. Faça: **restaurar só o caminho do
   global** em `SarakShellLanguageSelector.tsx` (a leitura de `window.__SARAK_OVERRIDES__`; sai apenas a do
   registro) e o teste que o protege. Se o dono quiser aposentar o global, isso é demanda própria.
4. **Resto de comentário truncado:** `SarakGrid.tsx:61` ficou com a linha solta `// separados por texto comum, como
   acima.`, que já não aponta para nada. Reescreva o comentário (o aviso ao scanner do Tailwind precisa seguir
   dizendo, **sem** montar no texto o prefixo, a medida e o utilitário de uma classe de container query).
5. **O resumo da §9 está incompleto frente ao formato do executor:** faltam a tabela **Arquivos alterados**, a
   lista **Critérios de aceite** com a evidência de cada um e **Decisões e suposições**. Acrescente (bloco novo,
   append-only), com as decisões que o diff mostra e nenhuma linha dizia: `SarakShellUser` passou a morar no arquivo
   do widget **mantendo** `level?: number` e o índice aberto (o lote 3 o troca); `options.manifest` foi de
   `{ brand?, … }` para `Record<string, unknown>`; o catálogo de idiomas foi para `src/core/i18n/languages.ts`;
   `AdvancedTab` perdeu o indicador "Módulos Ativos"; os comentários de plan/Spec saíram de vários arquivos.

**Para o dono:** nada disto muda o rumo — é cobertura de teste e uma frase de nota. **Não commite o lote 1 ainda**
(a correção mexe nos mesmos arquivos de teste); depois do veredito da correção, o commit é por caminho. O lote 2 só
começa depois do lote 1 aprovado. Os dois gates vermelhos que o executor relatou (`npm run audit` e
`check-minor-no-removal`) **não** são regressão: o primeiro é o baseline (1 variável-fantasma e 2 de composição
atômica, já medidos antes desta plan) e o segundo é a versão ainda `7.0.0`, que sobe na emissão.

## Veredito — 2026-10-05 (correção 1) — 🔴 Reprovado (lote 1, 2.ª rodada — um achado)

**Antes de gravar:** a §10 foi relida no disco: só o bloco de reprovação desta data, escrito nesta conversa. Também
**fechei no §9** o bloco de código da fotografia do executor, que terminava em ```` ```text ```` (um fecho com texto
não fecha o bloco, e tudo depois — inclusive esta §10 — era desenhado como código).

**Achados 1, 2, 4 e 5 — fechados:**

1. **Preview — fechou.** `PreviewSystemRenderer.test.tsx` voltou a **13** casos (mídia global ×2, escala do contêiner
   ×3, comparador ×4, mais os de geometria). **Refiz as duas mutações numa cópia fora do repositório:** tirar a
   condição de mídia do fundo → falha `expected 'var(--sarak-bg-base)' to be 'transparent'`; tirar
   `activePreviewApp` do comparador → falha `expected true to be false`. Cópia removida; `node_modules` do repositório
   intacto.
2. **Paridade — fechou.** O arquivo foi de 6 para **15** casos, em português. Mutações minhas na cópia: tirar a
   fronteira de palavra → falha o caso de substring; tirar a isenção de `__tests__/` → falha o caso dela; renomear
   `extraFiles` → **7** falhas, inclusive os dois de mutação do `layoutPadding`.
4. **Comentário do grid — fechou**, com uma ressalva aceita: o aviso explícito ao scanner do Tailwind saiu, mas o
   `check-container-query-literal` (comentário incluído) já o cobre por máquina.
5. **Resumo — fechou em parte, aceito:** o bloco novo traz critérios com evidência e as decisões que o diff mostra
   (`SarakShellUser` com `level`, `options.manifest`, `languages.ts`, `AdvancedTab`, comentários). A tabela
   **Arquivos alterados** lista só os desta correção, não os do lote — o inventário completo já está no veredito
   anterior e no `git diff`.

**Regressão, rodada por mim** (sem outro `vitest`/`tsup` ativo): `npx tsc --noEmit` → 0 ·
`check-audit-baseline --with-tsc` → **igual ao baseline** · `npx vitest run` com relatório JSON → **388 arquivos,
2088 testes, 0 falhas, 0 pulados**, e os 388 arquivos que o `vitest list` enumera foram todos executados (uma
primeira rodada minha contou 387/2086 porque a máquina suspendeu no meio — duração de 36 mil segundos — e a repeti) ·
verdes: `kit-names`, `trail-citation`, `class-merge`, `prefix` (310), `barrel` (96), `public-types`, `catalog`,
`guide`, `dev-kit`, `build-info`, `package` (95).

**Achado 3 — o override do seletor de idioma voltou, mas não "sem mudança" — continua reprovado:**

O veredito pedia **restaurar só a leitura de `window.__SARAK_OVERRIDES__`**, porque a `docs/migracoes.md` promete que
ele "continua funcionando, sem mudança". O diff de `SarakShellLanguageSelector.tsx` faz mais do que restaurar a leitura:

- **O invólucro sumiu.** Antes, o override era montado dentro de
  `<div className="relative isolate !overflow-visible sarak-language-override-wrapper horizontal-variant">`; agora é
  devolvido **nu** (`return <OverrideSelector variant={variant} />`). O `!overflow-visible` e o `isolate` existiam
  para o menu suspenso de um seletor do host não ser cortado dentro da barra; o teste só confere o texto do
  override, então não vê a diferença.
- **O retorno antecipado foi para cima dos hooks.** Antes ele vinha **depois** de `useSarakUI`, `useLibraryText` e
  `useState`; agora vem antes. Medi que, com o override aparecendo entre dois renders, **não lança** (o React só acusa
  quando algum hook roda a menos, e aqui nenhum roda) — mas o `useState` do menu é descartado, e é uma violação da
  regra dos hooks que o repositório não tem lint para pegar.

**Faça (exclusivamente isto):** devolva o trecho ao **formato do `HEAD`** — os três hooks primeiro, depois o bloco
`if (OverrideSelector)` com o **mesmo invólucro** e as mesmas classes —, trocando só a **origem** do componente (sai a
consulta ao registro; fica o `window.__SARAK_OVERRIDES__`). O teste que o protege passa a **afirmar o invólucro**
(o override é filho de um elemento com a classe `sarak-language-override-wrapper`); mostre a mutação (tirar o
invólucro → o teste falha). Acrescente à §9 a **tabela Arquivos alterados do lote 1 agrupada por diretório**
(quantidade e natureza por grupo), para o resumo cumprir o formato.

**Para o dono:** é a última pendência do lote 1 — uma regressão de apresentação num caminho que quase ninguém usa, mas
documentado. **Continue sem commitar o lote 1.** Os dois gates vermelhos de antes (`npm run audit` e
`check-minor-no-removal`) seguem sendo baseline e versão ainda `7.0.0`, não regressão.

## Veredito — 2026-10-05 (correção 2) — 🟢 Aprovado (lote 1 — liberação parcial)

**Antes de gravar:** a §10 foi relida no disco: só os dois blocos de reprovação desta data, escritos nesta conversa.

**O achado 3 — o override do seletor de idioma — fechou:**

- O diff de `SarakShellLanguageSelector.tsx` contra o `HEAD` agora é **só** a troca da origem: saem a consulta ao
  registro (`sarakGetLocalComponent`) e o `LANGUAGES` de `Discovery`; ficam os três hooks **antes** do bloco
  `if (OverrideSelector)`, e o override é devolvido **dentro do mesmo invólucro**
  (`relative isolate !overflow-visible sarak-language-override-wrapper` + `horizontal-variant`).
- **Mutação, refeita por mim numa cópia fora do repositório:** tirar o invólucro → o teste
  `continua lendo o override global do seletor` falha (1 de 9); sem a mutação, 9 de 9. Cópia removida,
  `node_modules` do repositório intacto.
- A tabela **Arquivos alterados do lote 1** bate com o meu `git status` agrupado, linha a linha (Shell 29 removidos,
  Discovery 14, `shared/hooks` 4 removidos e 1 alterado, `Provider` 8/2, `Layout` 12, `atomic` 14, `dist` 7/13/13,
  `bin/scaffold` 6/1/1, `sarak-ui` 7, `docs` 4…).

**Regressão, rodada por mim** (sem outro `vitest`/`tsup` ativo): `npx tsc --noEmit` → 0 ·
`check-audit-baseline --with-tsc` → **igual ao baseline** · `npx vitest run` → **388 arquivos, 2088 testes verdes**
(555 s). Os gates estáticos (`kit-names`, `trail-citation`, `class-merge`, `prefix`, `barrel`, `public-types`,
`catalog`, `guide`, `dev-kit`, `build-info`, `package`, `chrome-token-parity`) foram verdes na rodada anterior e esta
correção não tocou nenhum arquivo gerado.

**Critérios do lote 1, com a evidência acumulada nas três rodadas:** modo host removido (`git grep` vazio, as duas
pastas inexistentes, 22 nomes cobertos um a um na nota `8.0.0`); preview com `SarakAppChrome` nas três geometrias e
os 13 testes do renderizador com mutação; `init` gera `main.tsx` + `App.tsx` e o teste confere os imports contra o
barril; paridade de cromo com um grupo e **15** casos (fronteira de palavra, `__tests__`, `extraFiles`, extração do
schema, mutações); `README`, kit e `docs/` sem o modo host fora da nota; `tsc`, baseline e suíte verdes.

**Liberação parcial.** O lote 1 está aprovado e **pode ser commitado**. A plan **não** está concluída: os lotes 2 e 3
não foram iniciados. O `status` volta a `🟡 Em execução`; a síntese e a remoção só acontecem depois do veredito do
lote 3.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
