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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
