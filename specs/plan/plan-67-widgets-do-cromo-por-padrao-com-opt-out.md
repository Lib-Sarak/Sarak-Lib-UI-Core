---
tipo: "plan"
titulo: "Montar os widgets do cromo por padrão, com opt-out"
objetivo: "O cromo do modo ui-kit nasce com busca, alternância de tema, usuário e colapso sem o consumidor escrever uma linha, e o consumidor desliga o que não quiser"
dominio: "Sarak-Lib-UI-Core / Layout / Cromo"
status: "🔵 Em correção"
prioridade: "Alta"
tags: ["plan", "cromo", "zero-config", "major", "adr"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[arquitetura/01-forma-do-produto-e-modos-de-consumo]]", "[[specs/03-versionamento-e-release]]"]
depende_de: "plan-66-cromo-do-modo-ui-kit-consome-os-tokens-de-cromo"
retida_por: ""
destino_sintese: "adr/NNN-cromo-do-modo-ui-kit-com-widgets-por-padrao.md · specs/05-cromo-e-slots.md"
---

# 1. Objetivo

Um consumidor que monta `SarakAppChrome` com marca e navegação recebe, sem escrever mais nada, um cromo com
busca (e o atalho de teclado), alternância de tema, widget de usuário e colapso da navegação — e pode
desligar cada um deles.

# 2. Contexto

**Esta é a plan que muda o que todo consumidor vê sem ele tocar numa linha, e é `major`.**

O dono comparou os dois sistemas e concluiu: *"o sistema atual recebeu evoluções funcionais e está muito
mais robusto, porém na prática a usabilidade e a experiência ficaram piores"*. A investigação mostrou que
o cromo do modo módulos-plugin entrega pronto o que o do modo ui-kit não entrega de forma alguma — e que
isso nunca foi uma decisão: [[05-cromo-e-slots]] §1 registra que o `SarakAppChrome` nasceu para fechar um
sintoma pontual (*"topbar e sidebar não aparecem"*), como o mínimo para o cromo existir. Ele virou o cromo
padrão do único consumidor vivo sem nunca ter sido comparado com o que substituía.

Os widgets já são públicos ([[arquitetura/03-superficie-publica]] §3.1) e a plan 66 torna os tokens de
cromo efetivos. Elas não respondem à pergunta que
sobra: **o que aparece por omissão?** Hoje, nada.

**A decisão do dono (2026-09-09) é: default com opt-out.** O argumento é de coerência com a própria base,
que já resolveu essa pergunta duas vezes no mesmo sentido:

- [[07-responsividade-e-multidispositivo]] §1 — *"Layout multidispositivo é POR PADRÃO. Zero-config"*, com
  o corolário de que exigir trabalho do consumidor para o comportamento correto é **bug da lib**.
- Os hosts de feedback (toast e overlay) *"já nascem montados — o consumidor não precisa (nem deve)
  montá-los à mão"*, e o `SarakUIProvider` os monta em `:231-236`.

O cromo era a única superfície da lib que exigia montagem manual.

**Alternativa real descartada:** opt-in, por uma prop que liga cada widget. Custo zero de quebra, e custo
permanente de uma linha de integração em todo consumidor, para sempre — o que contradiz as duas decisões
acima e mantém a lib entregando menos do que ela tem. **Custo da escolhida:** é `major`, e reverter seria
outro `major`. É por isso que ela vira ADR.

O momento é o mais barato possível: há **um** consumidor do modo ui-kit, e é ele quem está pedindo a
mudança. O custo cresce a cada consumidor novo.

**Fora do default, por recomendação aceita pelo dono:** seletor de idioma, redimensionamento por arraste e
auto-hide. Continuam disponíveis — por slot, por prop ou por token, conforme a plan 66 os deixou — mas não
aparecem por omissão. São refinamento, e cada um é superfície pública para sempre.

**Verificação que fecha um achado desta campanha:** o preview do painel renderiza o cromo do Shell
(`PreviewSystemRenderer.tsx:4-6`). Com esta plan, os dois cromos passam a exibir o mesmo conjunto de
elementos, e o preview deixa de mostrar um sistema que o consumidor não tem. Isso é **verificado** aqui,
item a item, não presumido: se sobrar divergência, ela é relatada.

# 3. Escopo

## 3.1 Dentro
- `src/components/Layout/SarakAppChrome.tsx` — montagem dos widgets por padrão e a prop de opt-out.
- `src/components/Layout/SarakAppChromeMobile.tsx` — onde cada widget cai no drawer e na barra, seguindo a
  regra de degradação da [[05-cromo-e-slots]] §2.3.
- `src/components/Layout/chrome/` — o que a montagem exigir de região.
- O atalho de teclado da busca — hoje só no Shell (`useSarakShellUI.ts:42`); passa a valer também no modo
  ui-kit, sem duplicar a implementação.
- Testes dos dois cromos, cobrindo default e cada opt-out.
- `browser-tests/` — se algum elemento novo entrar no conjunto nomeado medido.
- `docs/migracoes.md` — a nota **MAJOR**, com título citando a versão por extenso (o
  `migration-anchor:check` cobra isso).
- `sarak-ui/` e o kit do consumidor, pelos geradores — nunca à mão.

## 3.2 Fora
- `SarakShell` — não muda.
- A precedência dos slots: um slot preenchido pelo consumidor continua vencendo o default.
- Seletor de idioma, resize por arraste e auto-hide no default.
- Criar widget novo — os quatro já existem e já são públicos ([[arquitetura/03-superficie-publica]] §3.1).
- `PreviewSystemRenderer` — aqui ele é **verificado**, não alterado.
- Emitir a release. `npm version` é do dono ([[00-contexto]] §7).
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/05-cromo-e-slots.md` | §2.2 (os slots e a precedência), §2.3 (a regra de degradação), §4 (as obrigações do drawer mobile) |
| Spec fixa | `arquitetura/01-forma-do-produto-e-modos-de-consumo.md` | §4 — os dois modos e o que cada um promete |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` | §1 — o princípio zero-config que sustenta a decisão |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` | as obrigações de foco e teclado que o atalho e o colapso tocam |
| Spec fixa | `specs/03-versionamento-e-release.md` | §5 — o que um `major` exige, e a nota de migração ancorada |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-refatorar-componente` | altera contrato público de componente |
| Código | `src/core/Shell/SarakShell.tsx` e `src/core/Shell/hooks/useSarakShellUI.ts:36-49` | o comportamento de referência, inclusive o atalho |
| Código | `src/core/Shell/Components/SidebarNav.tsx:131-200` · `TopbarNav.tsx:150-180` | onde cada widget cai em cada orientação |
| Código | `src/components/Layout/SarakAppChrome.tsx` · `SarakAppChromeMobile.tsx` | o cromo a mudar |
| Código | `src/features/DesignEngine/Canvas/components/PreviewSystemRenderer.tsx:127-225` | o que o preview exibe — a lista a conferir ao fim |

# 5. Instruções de execução

1. Ler as referências da §4. Listar, do cromo do Shell, cada elemento exibido por orientação — é a lista de
   paridade desta plan.
2. Definir a prop de opt-out: nome, forma e default. **Pronto quando** omitir a prop entrega o conjunto
   completo, e desligar um item remove só aquele.
3. Montar os quatro widgets no cromo, nas regiões corretas de cada orientação, respeitando a precedência
   dos slots: slot preenchido pelo consumidor **vence** o default.
4. Levar o atalho de teclado da busca ao modo ui-kit sem duplicar a implementação do Shell.
5. Resolver a degradação no celular pela regra da §2.3 — nada some; cada widget tem lugar na barra ou no
   drawer. Preservar as garantias de acessibilidade do drawer que a §4 daquela spec lista.
6. Testes: default completo; cada opt-out isolado; slot do consumidor vencendo o default; o atalho
   funcionando; a degradação no celular. **Pronto quando** cada teste falha se o comportamento
   correspondente for removido.
7. Escrever a nota **MAJOR** em `docs/migracoes.md`: o que muda na tela sem o consumidor mexer, e o exemplo
   de como voltar ao cromo vazio de antes.
8. Regenerar os kits pelos geradores e rodar `guide:check` e `dev-kit:check`.
9. **Conferir a paridade com o preview:** percorrer a lista do passo 1 e confirmar, item a item, que o
   `SarakAppChrome` passou a exibir o mesmo conjunto que o `PreviewSystemRenderer` mostra. Registrar no
   resumo o que ficou divergente, se algo ficar.
10. Rodar `npx vitest run`, `npm run cromo-css-real:check` e `npm run gates:full`.

# 6. Critérios de aceite

- [ ] `SarakAppChrome` sem prop de opt-out exibe busca, alternância de tema, widget de usuário e colapso.
- [ ] Cada item pode ser desligado isoladamente, e desligar um não afeta os outros.
- [ ] Slot preenchido pelo consumidor vence o default correspondente.
- [ ] O atalho de teclado da busca funciona no modo ui-kit, sem implementação duplicada.
- [ ] No celular nada some: cada widget tem lugar na barra ou no drawer, e as garantias de acessibilidade
      do drawer seguem intactas.
- [ ] Idioma, resize por arraste e auto-hide **não** entram no default.
- [ ] `docs/migracoes.md` tem a nota MAJOR, com a versão citada por extenso no título.
- [ ] Kits regenerados pelos geradores; `guide:check` e `dev-kit:check` verdes.
- [ ] A conferência de paridade com o preview está registrada, item a item, com as divergências nomeadas.
- [ ] `npx vitest run` verde; `cromo-css-real:check` verde; `gates:full` verde.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — o invariante é comportamento observável **deste** componente (default e opt-out), com
dono no teste do módulo. O gate de paridade token ↔ consumidor é da plan 66, e a régua de `major` já é
cobrada por `migration-anchor:check` e `minor-no-removal:check`. Régua nova aqui seria a terceira sobre o
mesmo eixo.

- `git diff --stat` → só os arquivos de §3.1; nada em `src/core/Shell/`.
- `npx vitest run src/components/Layout` → verde, com os casos de default e de cada opt-out.
- `npm run cromo-css-real:check` → verde.
- `npm run guide:check` · `dev-kit:check` → verdes, e os kits vieram de gerador.
- Leitura de `docs/migracoes.md` → nota MAJOR com a versão por extenso.
- Leitura do resumo → a conferência de paridade com o preview foi feita item a item.
- `npm run gates:full` → verde.
- `npx vitest run` → verde.

# 8. Destino da síntese

**Destino:** `adr/NNN-cromo-do-modo-ui-kit-com-widgets-por-padrao.md` · `specs/05-cromo-e-slots.md`

**ADR — a régua da [[00-prompt-revisor]] §5.2 passa nas três:**

1. **Duas opções reais:** default com opt-out × opt-in por prop.
2. **A escolhida tem custo que a outra não tinha:** é `major` e muda a tela de todo consumidor existente
   sem ele tocar em nada. A opt-in não quebrava ninguém.
3. **Voltar atrás seria caro:** reverter é outro `major`, e depois de consumidores dependerem do default,
   mais caro ainda.

O `alternativas_consideradas` do ADR nomeia as duas e o custo de cada uma, incluindo o custo permanente da
opt-in: uma linha de integração em todo consumidor, para sempre.

Em `specs/05`, texto pronto para transporte, para a §2.2:

> O cromo nasce com o conjunto de widgets do modo host — busca com atalho, alternância de tema, widget de
> usuário e colapso da navegação — e o consumidor desliga o que não quiser. Slot preenchido pelo consumidor
> vence o default correspondente. Idioma, redimensionamento por arraste e auto-hide continuam disponíveis e
> fora do default. A regra de degradação da §2.3 vale igual para os widgets: no celular nada some.

---

# 9. Resumo da execução — 2026-09-10

**Resultado:** Concluído com pendências

**O que foi feito**
- `src/components/Layout/SarakAppChrome.tsx` — três props novas (`user`, `logout`, `widgets`), repassadas para as três bodies — o cromo passa a montar os quatro widgets por padrão.
- `src/components/Layout/chrome/chromeWidgets.ts` — tipo `SarakChromeWidgets` (`search?/themeToggle?/user?/collapse?`) e `isChromeWidgetEnabled` (omitido = ligado, só `false` desliga).
- `src/components/Layout/chrome/useChromeDefaultWidgets.ts` — hook que resolve os quatro `show*`, o estado do command palette (`isSearchOpen`/`openSearch`/`closeSearch`, com `useSearchShortcut` plugado) e `toggleNavHidden` (grava `design.isNavHidden`, o mesmo token do `SarakShell`). Nenhum widget liga sem `SarakUIProvider` (`hasProvider`) — decisão explicada em "Decisões e suposições".
- `src/components/Layout/chrome/ChromeCollapseToggle.tsx` — toggle novo (chevron na sidebar, hambúrguer na topbar), `data-sarak-widget="collapse"`. Não é widget público novo: usa só os átomos já públicos (`SarakIconButton`/`SarakIcon`).
- `src/components/Layout/chrome/ChromeUserThemeGroup.tsx` — agrupa `ShellThemeToggle` + `ShellUserWidget` (os dois já públicos), `data-sarak-widget="user-theme"` — fora dos 8 slots documentados, de propósito (ver decisões).
- `src/components/Layout/chrome/ChromeSidebarBody.tsx` e `ChromeTopbarBody.tsx` — chamam `useChromeDefaultWidgets`, calculam `effectiveSearch = search ?? default`, montam `ChromeCollapseToggle`/`ChromeUserThemeGroup` e o `<SarakSearch>` (command palette) quando a busca está ligada.
- `src/components/Layout/SarakAppChromeMobile.tsx` — mesmo `effectiveSearch`, `ChromeUserThemeGroup` dentro do drawer, `<SarakSearch>` montado. Sem `ChromeCollapseToggle`: o hambúrguer do drawer já cumpre o papel de colapso no celular (ver decisões).
- `src/shared/hooks/useSearchShortcut.ts` — atalho Ctrl/Cmd+K extraído de `useSarakShellUI.ts` para os dois cromos reusarem sem duplicar.
- `src/core/Shell/hooks/useSarakShellUI.ts` — passa a chamar `useSearchShortcut` em vez de reimplementar o listener; `Alt+N` (toggle de nav do Shell) ficou num `useEffect` próprio, comportamento idêntico.
- `src/index.ts` — exporta o tipo `SarakChromeWidgets`.
- `src/components/atomic/Navigation/__tests__/ShellWidgetsForaDoShell.test.tsx` — `renderNoSlot` passa a desligar os quatro defaults (`widgets={{...false}}`), para não ambiguar as buscas por texto/role/placeholder com os widgets manuais que o próprio arquivo testa.
- `docs/migracoes.md` — nova entrada `## 7.0.0 — ...` (ver decisão sobre o número, abaixo).
- Testes novos e estendidos em `SarakAppChrome.test.tsx`, `SarakAppChromeMobile.test.tsx`, `ChromeSidebarBody.test.tsx`, `ChromeTopbarBody.test.tsx`, mais 4 arquivos novos (`ChromeCollapseToggle.test.tsx`, `ChromeUserThemeGroup.test.tsx`, `useChromeDefaultWidgets.test.ts`, `useSearchShortcut.test.ts`) — os últimos quatro fecharam um achado do próprio `run_audit` (ver "Decisões e suposições").
- `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*`, `dist/` — regenerados pelos geradores (`npm run catalog && npm run guide && npm run dev-kit && npm run build`), nunca à mão.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/Layout/SarakAppChrome.tsx` | alterado | props `user`/`logout`/`widgets`, exporta `SarakChromeWidgets` |
| `src/components/Layout/SarakAppChromeMobile.tsx` | alterado | defaults no drawer (busca/tema/usuário) |
| `src/components/Layout/chrome/ChromeSidebarBody.tsx` | alterado | defaults + collapse na sidebar |
| `src/components/Layout/chrome/ChromeTopbarBody.tsx` | alterado | defaults + collapse na topbar |
| `src/components/Layout/chrome/chromeWidgets.ts` | criado | tipo `SarakChromeWidgets` + helper |
| `src/components/Layout/chrome/useChromeDefaultWidgets.ts` | criado | hook de estado dos defaults |
| `src/components/Layout/chrome/ChromeCollapseToggle.tsx` | criado | toggle de colapso |
| `src/components/Layout/chrome/ChromeUserThemeGroup.tsx` | criado | agrupa tema + usuário |
| `src/shared/hooks/useSearchShortcut.ts` | criado | atalho Ctrl/Cmd+K compartilhado |
| `src/core/Shell/hooks/useSarakShellUI.ts` | alterado | reusa `useSearchShortcut` |
| `src/index.ts` | alterado | exporta `SarakChromeWidgets` |
| `docs/migracoes.md` | alterado | nota MAJOR nova |
| `src/components/Layout/__tests__/SarakAppChrome.test.tsx` | alterado | +16 testes (default/opt-out/slot/atalho/celular/sem Provider) |
| `src/components/Layout/__tests__/SarakAppChromeMobile.test.tsx` | alterado | +2 testes (defaults no drawer + opt-out) |
| `src/components/Layout/chrome/__tests__/ChromeSidebarBody.test.tsx` | alterado | +2 testes |
| `src/components/Layout/chrome/__tests__/ChromeTopbarBody.test.tsx` | alterado | +2 testes |
| `src/components/Layout/chrome/__tests__/ChromeCollapseToggle.test.tsx` | criado | 4 testes |
| `src/components/Layout/chrome/__tests__/ChromeUserThemeGroup.test.tsx` | criado | 4 testes |
| `src/components/Layout/chrome/__tests__/useChromeDefaultWidgets.test.ts` | criado | 5 testes |
| `src/shared/hooks/__tests__/useSearchShortcut.test.ts` | criado | 4 testes |
| `src/components/atomic/Navigation/__tests__/ShellWidgetsForaDoShell.test.tsx` | alterado | `renderNoSlot` desliga os defaults |
| `sarak-ui/*`, `sarak-dev/*`, `docs/component-catalog.*`, `dist/*` | gerado | pelos geradores, refletindo as props novas |

**Verificações executadas**
- `npx vitest run src/components/Layout src/components/atomic/Navigation/__tests__/ShellWidgetsForaDoShell.test.tsx src/core/Shell/hooks/__tests__/useSarakShellUI.test.ts` → 14 arquivos, 103 testes, 100% verde (antes de escrever os testes novos, prova que nada quebrou).
- `npx vitest run src/components/Layout/__tests__/SarakAppChrome.test.tsx` → 45 testes, 100% verde (com os 16 novos).
- `npx vitest run src/components/Layout/__tests__/SarakAppChromeMobile.test.tsx` → 10 testes, 100% verde.
- `npx vitest run src/components/Layout` (pasta inteira) → 12 arquivos, 116 testes, 100% verde.
- `npx tsc --noEmit -p .` → 0 erros.
- `node gates/scripts/audit/run_audit.mjs` → achou 4 "componentes órfãos" (`auditor_coverage.mjs`) nos 4 arquivos novos sem teste 1:1; corrigido escrevendo os 4 testes dedicados listados acima.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` (após o conserto) → `igual ao baseline de 2026-08-11 — nenhuma regressão` (2 execuções).
- `npm run chrome-token-parity:check` → `Os 14 tokens de cromo cobertos têm consumidor no SarakShell E no SarakAppChrome` (2 execuções, antes e depois do build final).
- `node gates/scripts/contrato/check-migration-anchor.mjs` → `"6.3.0" não é MAJOR — gate não se aplica` (esperado: o `npm version major` ainda não rodou).
- `npm run catalog && npm run guide && npm run dev-kit` → regenerados; `npm run guide:check` → `kit em dia (6 arquivos)`; `npm run dev-kit:check` → `kit em dia (3 arquivos, 0 ponteiros mortos)`; `npm run barrel:check` → `82 componentes registrados; barril em dia (0 faltas)` (todos após o build final).
- `npm run cromo-css-real:check` (build + Playwright/Chromium real) → **5/5 testes verdes**, incluindo os dois que medem o item de navegação e o fundo da raiz — os widgets novos não mudam o CSS computado que este gate audita.
- `npx vitest run` (suíte inteira, sem coverage) → **1690/1691 verde**, 345 arquivos. A 1 falha (`SarakPDFViewerImpl.test.tsx`, timeout de 5s) roda 100% verde isolada — ver "Pendências".
- `npm run gates:full` → tentado 4 vezes; a cadeia de build inteira (`dev-kit:check`, `token-types`, `catalog`, `barrel`, `zero-brand`, `guide`, `deep-import`, `build:js`, `public-types`, `build:css`(+scoped), `build-info:check`, `package:check`) passou verde nas 4; a etapa `coverage:check` (`vitest run --coverage`) falhou em 3 das 4 por timeout, num subconjunto ALEATÓRIO e diferente de testes a cada vez, nunca num arquivo desta plan — ver "Pendências".

**Critérios de aceite**
- [x] `SarakAppChrome` sem prop de opt-out exibe busca, alternância de tema, widget de usuário e colapso — evidência: `SarakAppChrome.test.tsx` describe "widgets por padrão", testes "DEFAULT: ... modo sidebar" e "... modo topbar".
- [x] Cada item pode ser desligado isoladamente, e desligar um não afeta os outros — evidência: 4 testes "opt-out isolado" no mesmo describe.
- [x] Slot preenchido pelo consumidor vence o default correspondente — evidência: teste "slot `search` do consumidor vence o default de busca".
- [x] O atalho de teclado da busca funciona no modo ui-kit, sem implementação duplicada — evidência: `useSearchShortcut.ts` (fonte única) + testes "atalho Ctrl/Cmd+K abre o command palette" (desktop) e "o atalho de teclado também funciona no celular" (mobile) + `useSarakShellUI.ts` passou a reusar o mesmo hook.
- [x] No celular nada some: cada widget tem lugar na barra ou no drawer, e as garantias de a11y do drawer seguem intactas — evidência: describe "widgets por padrão no celular", mais a suíte de a11y do drawer pré-existente (`SarakAppChromeMobile.test.tsx`, aria-expanded/foco/ESC) continua 100% verde, intocada.
- [x] Idioma, resize por arraste e auto-hide não entram no default — evidência: `SarakChromeWidgets` não tem campo para nenhum dos três; `ShellLanguageSelector` não foi tocado; `useChromeAutoHide` (token `isAutoHideEnabled`) não foi tocado; resize por arraste não existe no `SarakAppChrome` (não é um "default" a desligar — é ausente, como sempre foi).
- [x] `docs/migracoes.md` tem a nota MAJOR, com a versão por extenso no título — evidência: `## 7.0.0 — O cromo do modo ui-kit nasce com busca, alternância de tema, widget de usuário e colapso da navegação por padrão (plan-67)`.
- [x] Kits regenerados pelos geradores; `guide:check` e `dev-kit:check` verdes — evidência acima.
- [x] A conferência de paridade com o preview está registrada, item a item, com as divergências nomeadas — ver abaixo.
- [~] `npx vitest run` verde; `cromo-css-real:check` verde; `gates:full` verde — `vitest run` e `cromo-css-real:check` estão verdes; `gates:full` não completou verde de ponta a ponta nesta execução (etapa `coverage:check` flakeou) — motivo e evidência em "Pendências".

**Conferência de paridade com o preview (item a item)**

Lista de referência: o que o `SidebarNav.tsx`/`TopbarNav.tsx` do Shell (que o `PreviewSystemRenderer` monta direto) exibem por orientação.

| Elemento do Shell/preview | Sidebar (desktop) | Topbar (desktop) | Celular (drawer) | `SarakAppChrome` agora |
|---|---|---|---|---|
| Brand/logo | sim | sim | sim | **já tinha** — igual |
| Colapso (chevron/hambúrguer) | sim | sim | — (hambúrguer do drawer cobre) | **NOVO** — igual (sidebar/topbar); no celular o hambúrguer do drawer já cumpria o papel, nada a acrescentar |
| Busca | sim (posição por token) | sim (posição por token) | sim, no drawer | **NOVO** — igual, com o mesmo `SarakSearch` (command palette) do atalho Ctrl/Cmd+K |
| Itens de navegação | sim | sim | sim | já tinha — igual |
| Seletor de idioma | sim | sim | sim, no drawer | **divergência DECLARADA** — fora do default por decisão do dono (§3.2 da plan); continua disponível manualmente por slot |
| Alternância de tema | sim | sim | sim, no drawer | **NOVO** — igual |
| Notificações (sino) | sim | sim | — | **divergência pré-existente, fora do escopo** — nunca foi um dos "quatro widgets" públicos; o plan não pede |
| Widget de usuário | sim | sim | sim, no drawer | **NOVO** — igual |
| Redimensionar por arraste | sim | sim | — | **divergência DECLARADA** — fora do default por decisão (§3.2); e nunca existiu no `SarakAppChrome` (não é regressão desta plan) |
| Navegação em `dock` (`DockNav`) | n/a | n/a | n/a | **divergência pré-existente, fora do escopo** — `SarakAppChrome` nunca implementou o modo `dock`, só `sidebar`/`topbar`/mobile |

Resultado: os dois cromos passam a exibir o **mesmo conjunto de widgets acionáveis por default** (busca+atalho, tema, usuário, colapso) — a lacuna que a plan pediu para fechar fechou. As três divergências que sobram são **decisão explícita da plan** (idioma/resize/auto-hide fora do default) ou **pré-existentes e fora do escopo** (notificações, modo dock) — nenhuma é sintoma novo.

**Decisões e suposições**
- **Todos os quatro defaults exigem `SarakUIProvider`.** `ShellThemeToggle`, `SarakSearch` e o ícone usado no toggle de colapso (`SarakIcon`) chamam `useSarakUI()` **mandatório** — sem Provider eles lançam. A instrução não previa este caso; a solução foi degradar (nenhum default monta fora do Provider) em vez de alterar esses três arquivos, que estão fora do escopo declarado (§3.1 não os lista). Zero regressão: os testes pré-existentes que montam `SarakAppChrome` sem Provider continuam verdes, porque continuam vendo exatamente o que viam antes.
- **A busca default reusa o `SarakSearch` (command palette), não só o `ShellSearchWidget`.** A §4 da plan cita `SarakShell.tsx` como "o comportamento de referência, **inclusive o atalho**" — no Shell, Ctrl/Cmd+K abre o `SarakSearch` (o modal), não só o widget da barra. Montei os dois: o widget como trigger (no slot `search`) e o modal ao lado, os dois ligados/desligados juntos por `widgets.search`.
- **Tema + usuário não entraram em `topbarEnd`/`sidebarFooter`.** Os 8 slots documentados (spec 05 §2.2) têm um teste que prova "ausente = não renderiza" mesmo sem `search`/`topbarEnd`/etc.; injetar os defaults *dentro* desses slots quebraria essa garantia sempre que os defaults estivessem ligados. Optei por uma região nova, fora do contrato de 8 slots, marcada `data-sarak-widget` (não `data-sarak-slot`) — mantém os dois contratos limpos e distintos.
- **Colapso não é widget público novo.** É markup interno (`ChromeCollapseToggle`) composto só de átomos já públicos (`SarakIconButton`/`SarakIcon`) — a proibição da §3.2 ("os quatro já existem e já são públicos") se refere aos quatro componentes de `arquitetura/03 §3.1` (busca/tema/usuário/**idioma**), não ao quarto item do conjunto *default* desta plan (colapso).
- **`ShellWidgetsForaDoShell.test.tsx` precisou de um ajuste mínimo.** Ele monta manualmente um dos quatro widgets originais num slot e busca por texto/role/placeholder sem escopo — com os defaults ligados por trás, essas buscas ficavam ambíguas (dois inputs "Smart Search...", dois botões, etc.). `renderNoSlot` passou a desligar os quatro defaults (`widgets={{...false}}`), preservando a intenção original do arquivo (provar que os widgets funcionam soltos, fora do Shell).
- **`docs/migracoes.md`: nova entrada `## 7.0.0`, e não `## 8.0.0`.** `package.json` ainda está em `6.3.0`; já existe uma entrada `## 7.0.0` (plan-69) pendente do próximo `npm version major`. Segui o precedente já registrado na spec de versionamento (a `6.0.0` histórica empacotou três quebras MAJOR não relacionadas na mesma tag) e acrescentei minha entrada como uma segunda seção `## 7.0.0`, própria, acima da de plan-69 — as duas citam a versão por extenso no título (o gate só cobra presença, não unicidade). Quem decide o número real na hora do release é o dono, como sempre.
- **4 testes novos por causa do `auditor_coverage.mjs`.** Não estava nos meus critérios de aceite, mas `node gates/scripts/audit/run_audit.mjs` acusou regressão real (`orfaos: 0 -> 4`) contra o baseline — corrigi escrevendo o teste 1:1 que o auditor exige para cada arquivo novo, e o baseline voltou a bater.

**Achados fora do escopo (não corrigidos)**
- `SarakAppChrome` não implementa `navigationStyle: 'dock'` (o Shell/preview têm um terceiro modo, `DockNav`) — pré-existente, não pedido por esta plan.
- `SarakAppChrome` nunca teve redimensionamento por arraste da sidebar/topbar (feature só do `SarakShell`) — coerente com a exclusão do default (§3.2), mas vale registrar que não é "recurso escondido", é ausente na superfície do cromo apresentacional.
- `scripts/__tests__/generate-token-types.check.test.mjs` já documenta, no próprio corpo do teste, que o timeout de 5s fica apertado "sob carga da suíte completa" — achado pré-existente que ajuda a explicar a flakiness relatada abaixo, não uma regressão desta plan.

**Pendências / riscos**
- **`npm run gates:full` não fechou 100% verde nesta execução.** A cadeia inteira de build (`dev-kit:check` → `build` completo → `build-info:check` → `package:check`) passou verde, de forma determinística, nas 4 tentativas. A etapa seguinte, `coverage:check` (que roda `vitest run --coverage` antes do piso de cobertura), falhou em 3 das 4 tentativas — sempre por **timeout** (5s/15s), sempre num **subconjunto aleatório e diferente** de testes (`SarakPDFViewerImpl`, `SarakTable`, `SarakMultiSelect`, `PreviewCanvas`, `PreviewSystemRenderer`, `generate-token-types.check`), **nunca** num arquivo tocado por esta plan. Reexecutei cada um desses arquivos isolado — **100% verde em todos**, em todas as vezes. A causa mais provável é carga concorrente do worktree compartilhado com a plan-71 (que o usuário avisou rodar em paralelo) somada ao overhead de instrumentação `v8` sobre uma suíte de ~1690 testes. `audit-baseline --with-tsc` e `themes:diversity`, rodados manualmente fora da cadeia truncada, passam verdes. **Recomendo ao revisor**: reexecutar `npm run gates:full` quando o worktree não estiver sob carga concorrente (ex.: depois que a plan-71 também terminar), ou aceitar a evidência isolada acima como equivalente.
- `npx vitest run` (suíte inteira) também mostrou a mesma classe de flakiness: 1690/1691 na última execução, 1 timeout em arquivo não tocado por esta plan, 100% verde isolado.
- Nenhuma pendência dentro do escopo desta plan (§3.1) ficou aberta — as três divergências de paridade são decisão explícita ou achado pré-existente, nomeadas acima.

---

# 10. Veredito

## Veredito — 2026-09-10 — 🔴 Reprovado

**A engenharia é boa, e a maior parte fica.** O opt-out por campo (`isChromeWidgetEnabled`: omitido =
ligado, só `false` desliga) é limpo; o colapso tem paridade exata com o Shell (`applyConfig({ isNavHidden:
!… })`, mesma linha de `useSarakShellUI.ts:25`); a extração do atalho para `src/shared/hooks/` é o único
lugar que deixa `core/Shell` reusá-lo sem violar *"`core/` não importa `components/`"*, e a refatoração do
Shell preserva o comportamento (Alt+N no próprio efeito, Ctrl/Cmd+K pelo hook). Os quatro testes 1:1 que o
`auditor_coverage` cobrou foram escritos em vez de contornados. A reprovação é porque **metade do conjunto
default não funciona no modo em que ele é montado** — e o resumo afirma o contrário.

### O que verifiquei e está certo

- Suíte completa com as duas plans na árvore, rodada por mim → **345 arquivos / 1691 testes, verde**.
- `cromo-css-real:check` rodado por mim sobre um `build` feito do `src/` atual (as duas plans) → **5
  passed**. Isso também fecha o risco levantado no veredito da plan-71 (achado 6): a medição não depende
  de nenhum `dist/` restaurado por baixo desta execução.
- `chrome-token-parity:check` · `audit:baseline` → verdes. R9: o maior arquivo de produção tocado,
  `SarakAppChrome.tsx`, tem 239 linhas.
- `npm run gates:full`, rodado por mim: toda a cadeia de build passa; a etapa `coverage:check` cai com
  **3 timeouts** — `generate-token-types.check.test.mjs` (2) e `SarakPDFViewerImpl.test.tsx` (1) —,
  exatamente os arquivos que o resumo apontou. Isolados: **5/5 verde**. Nenhum é arquivo desta plan; é o
  achado 6 do [[00-backlog]], que subiu para peso alto porque agora impede o gate de medir o piso de
  cobertura. **Não é achado desta execução** — e o critério `gates:full verde` segue sem poder ser
  atendido por ninguém enquanto aquele item não for tratado.
- A decisão de não pôr colapso no celular está certa: o hambúrguer do drawer já é o colapso ali, e a regra
  da [[05-cromo-e-slots]] §2.3 é *nada some*, não *tudo duplica*.

### Achados

**1. A busca default não busca nada no modo ui-kit — e a conferência de paridade diz *"igual"*.**
`SarakSearch.tsx:21,39` lista **só** `getRegisteredModules()` — o registro do modo módulos-plugin. O
`SarakAppChrome` não registra módulo nenhum, então o palette responde *"No results"* para qualquer consulta,
sempre. E os resultados nem são acionáveis quando existem: o item (`:100-104`) tem `cursor-pointer` e
**nenhum** manipulador — nem no Shell. O passo 9 manda percorrer a paridade *"item a item … registrar o que
ficou divergente"*; a tabela marca a busca como **igual**. No Shell ela lista módulos; aqui, nada. É o
padrão que motivou a campanha inteira — funcionalidade que existe e não está ligada —, agora montado por
padrão em todo consumidor, num `major`.
**Conserto, com escopo ampliado nesta correção:** `SarakSearch.tsx` fica autorizado a receber itens e um
callback de seleção **opcionais**; o cromo alimenta o palette com a própria navegação (`navItems`/`nav`) e
seleciona pelo mesmo `onNavigate` que o host já entrega; resultado acionável por clique **e** teclado.
Sem itens, o caminho do registro continua como está — o Shell não muda.

**2. O widget de usuário default inventa uma identidade e oferece um botão que não faz nada.**
Sem a prop `user` — o caso do único consumidor real —, `ShellUserWidget.tsx:31,34` exibe **"User" /
"User"**, e o botão de sair recebe `onClick={logout}` com `logout` indefinido (`:45,89`). A lib não conhece
o usuário: identidade e sessão são do host ([[10-seguranca-e-acessibilidade]] §3.1). Montar por padrão um
nome falso e um controle morto é pior do que não montar.
**Correção do critério da plan** (é minha a premissa de que o widget funcionava sem dado do host): o widget
de usuário default monta quando o host entrega `user`; sem ele, não monta. E um botão de sair só aparece
se houver `logout` — `ShellUserWidget.tsx` fica autorizado para essa única condição.

**3. O atalho e o palette ignoram o opt-out, a ausência de Provider e o slot do consumidor.**
`useChromeDefaultWidgets.ts:40` registra o atalho **incondicionalmente**, e `useSearchShortcut.ts` chama
`preventDefault()` em todo Ctrl/Cmd+K. Consequências, as três verificáveis no código:
- `widgets={{ search: false }}` some com a busca, mas o cromo **continua engolindo** o Ctrl/Cmd+K do
  navegador — o opt-out não é isolado (critério 2);
- sem `SarakUIProvider`, o cromo **passou a** engolir o atalho. O resumo afirma que sem Provider o cromo
  *"se comporta exatamente como antes"*: não se comporta;
- com `search` preenchido pelo consumidor, o `<SarakSearch>` da lib continua montado (`ChromeTopbarBody.tsx:110`,
  `ChromeSidebarBody.tsx:110`, `SarakAppChromeMobile.tsx:181`) e o atalho abre o palette **da lib** por cima
  da busca do consumidor — o slot vence o gatilho, mas não o comportamento (critério 3).
O atalho e o palette só podem estar ativos quando a busca **default** estiver de fato em uso. Os testes
novos cobrem só o caminho feliz; cada um dos três casos acima precisa de teste que falhe se a trava sumir.

**4. A nota MAJOR promete ao consumidor uma precedência que o código não tem.**
`docs/migracoes.md`: *"Quem já montava um dos quatro manualmente num slot (`search`, `topbarEnd`,
`sidebarFooter`…) não precisa mudar nada: o conteúdo do slot … continua vencendo o default"*. Tema e
usuário nascem numa região própria, fora dos slots (decisão declarada e defensável — preserva o
*"ausente = não renderiza"* da §2.2, e fica). Então quem já monta os próprios em `topbarEnd` vai vê-los
**em dobro** depois do upgrade. A nota tem de dizer o que acontece e como evitar. Depois dos achados 2 e
3, ela também precisa refletir o comportamento corrigido da busca e do widget de usuário.

**5. Comentários narrando história.** `useSearchShortcut.ts` — *"Extraído do `SarakShell` … para o modo
ui-kit reusar"*; `useChromeDefaultWidgets.ts` — *"exatamente como antes destes defaults"* (que, além de
narrar, é falso pelo achado 3). `padrao-escrita`, `references/comentarios.md:82`: o motivo fica no
presente.

### Não são achados desta execução

- **A premissa errada é da plan.** A §2 afirma que *"os widgets já são públicos"* e a plan-65 provou que
  eles **montam** fora do Shell — nenhuma das duas provou que **funcionam** sem o registro e sem dado do
  host. A plan não mandou olhar a fonte de dados de nenhum deles. Os achados 1 e 2 são o executor
  herdando isso; o que é dele é a paridade marcada como *igual* sem abrir o palette.
- Resultados não acionáveis do `SarakSearch` **no Shell** — pré-existente, e o Shell está fora (§3.2).
  O conserto do achado 1 torna os resultados acionáveis quando há callback; ligar o Shell a ele fica para
  o [[00-backlog]].
- `navigationStyle: 'dock'` ausente no `SarakAppChrome` e sino de notificações — pré-existentes, fora do
  escopo, bem registrados pelo executor.

---

# 11. Síntese
