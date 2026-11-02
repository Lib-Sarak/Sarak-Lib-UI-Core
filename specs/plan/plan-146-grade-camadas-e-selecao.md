---
tipo: "plan"
titulo: "Corrigir o espaço entre colunas da grade, a confirmação atrás da gaveta e a seleção do controle segmentado"
objetivo: "Fazer a grade e o flex respeitarem o espaço nos dois eixos, a confirmação abrir sempre acima de gaveta e modal com o foco correto, e a opção selecionada do controle segmentado se distinguir em todos os temas"
dominio: "Componentes / Layout e camadas"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc.5", "layout", "camadas"]
relacionados: ["[[anexos/rc5-contrato]]", "[[07-responsividade-e-multidispositivo]]", "[[10-seguranca-e-acessibilidade]]", "[[11-testes-e-cobertura]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/specs/07-responsividade-e-multidispositivo.md + specs/specs/10-seguranca-e-acessibilidade.md"
---

# 1. Objetivo

Os defeitos do pedido do ERP para a rc.5 (itens 1, 12 e 13 do contrato) deixam de existir, provados em navegador real.

# 2. Contexto

Contrato em `specs/plan/anexos/rc5-contrato.md`. O ERP terminou as telas na rc.4 e pediu estes acabamentos.

**Item 1, grade.** `src/components/atomic/hooks/useStructuralStyles.ts:47` envia `columnGap: undefined` depois de `gap`, e o React limpa a propriedade longa: com `gap="spacing-md"` e `templateColumns`, o computado é `gap: 16px normal`, com zero entre colunas. **Vermelho no navegador, verde no jsdom.**

**Item 12, camadas.** `SarakDrawer.tsx:110` soma 1 à camada de modal, e a confirmação usa a camada de modal. O ERP mediu o clique no centro da confirmação caindo no fundo da gaveta, e hoje contorna fechando a gaveta. Número fixo não resolve: a gaveta pode abrir sobre modal, e vice-versa.

**Item 13.** Visto no ERP em temas escuros: opção selecionada igual às outras. `aria-checked` já existe. Falta medir.

**Depois do commit de 140 e 143:** o item 1 muda o estilo emitido e, com ele, snapshots do painel.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/hooks/useStructuralStyles.ts`, `useStructuralStyles.presets.ts` e testes.
- `src/components/atomic/Layouts/SarakGrid.tsx`, `SarakFlex.tsx` — `rowGap` e `columnGap`.
- Revisão de estilos com propriedade curta e longa juntas em `src/components/atomic/` (seções, cartões, `SarakDescriptionList`).
- `src/components/atomic/Modals/` — `SarakOverlayProvider`, `SarakDrawer`, `SarakModal` e a pilha.
- `src/components/atomic/Templates/SarakSegmentedControl.tsx`, se a medição confirmar.
- `browser-tests/` — specs novos. `docs/migracoes.md`.

## 3.2 Fora
- Token novo de camada, salvo se a pilha exigir, e aí pare e reporte. Gráficos, lista, formulário e abas (plans 147 e 148).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/rc5-contrato.md` | nomes e padrões |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §4 | `SarakGrid` |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | foco preso, teclado |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` §7 | o que o navegador mede |
| Código | `src/components/atomic/Modals/hooks/useFocusTrap.ts` | foco |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree.
2. **Grade.** Spec de navegador primeiro, vermelho: dois filhos lado a lado distam o token. Depois o conserto: nenhuma chave `undefined` em estilo com `gap`. `rowGap` e `columnGap` vencem `gap` no eixo deles.
3. **Revisão.** Procure estilo com propriedade curta e longa juntas em `src/components/atomic/`, com chave que possa ser `undefined`. Liste no resumo o que achou e corrigiu.
4. **Pilha.** Uma pilha única de camadas abertas: a camada nova fica acima da última aberta, seja gaveta, modal ou confirmação. Sem número fixo por tipo. Sem mudança para quem abre uma camada só.
5. **Foco.** O foco preso passa à confirmação e volta à gaveta ao fechar.
6. **Prova da camada:** em navegador real, `elementFromPoint` no centro da confirmação aberta sobre gaveta cai na confirmação; nos dois sentidos de abertura; modo embarcado incluído.
7. **Item 13.** Meça a opção selecionada contra as outras nos 19 temas, nos dois modos, pelo contraste não textual de 3:1. Se reprovar, a seleção ganha contraste próprio por token. Se passar, diga no resumo, com os números.
8. `docs/migracoes.md`: itens 1 e 12.
9. Depois de `npm run build`, rode os specs novos e os de layout e cromo afetados. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
10. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Distância entre dois filhos igual ao token, nos dois eixos, em navegador real; vermelho antes.
- [ ] `rowGap` e `columnGap` vencem `gap`; sem eles, `gap` nos dois eixos — navegador.
- [ ] `elementFromPoint` cai na confirmação sobre gaveta e modal; foco volta — navegador.
- [ ] Controle segmentado medido nos 19 temas × 2 modos.
- [ ] Catálogo atualizado.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/components/atomic` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- Leitura dos specs novos; a CI mede a bateria no push.

# 8. Destino da síntese

**Destino:** `specs/specs/07-responsividade-e-multidispositivo.md` §4 (`rowGap`, `columnGap`) + `specs/specs/10-seguranca-e-acessibilidade.md` (pilha de camadas e foco).

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-02

**Resultado:** Concluído com pendências (o `npm run build` completo e o `verify --tier=quick` não fecharam por falhas de outras plans; ver *Pendências*).

**Estado do worktree ao iniciar**
`git status --short` com 159 linhas fora de `dist/` (trabalho aprovado e sem commit das plans 140 e 143, mais 147 e 148 em paralelo: `browser-tests/fixtures/column-contrast.ts`, `src/features/DesignEngine/**`, `src/core/Design/palette/**`, `src/core/i18n/catalogEntries.*`, `src/components/atomic/{Inputs,Templates/SarakResourceRow,SarakStats,UX/SarakTabs*}`, `src/components/engines/charts/**`, `docs/component-catalog.*`, `sarak-ui/*`, `specs/00-indice.md`, `specs/plan/plan-140/141/143/146/147/148/149/150`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` e o `dist/` modificado/removido). Nenhum arquivo que editei estava nela, exceto `docs/migracoes.md` (já em `M ` no índice; acrescentei uma seção) e esta plan (`status`). A fotografia inteira está em `C:\Users\Igor\AppData\Local\Temp\claude\c--Users-Igor-Desktop-Sarak-X---Trabalho-Code-Biblioteca-Sarak-Lib-UI-Core\a46b52db-d292-43d7-a844-5b3f386f5bcb\scratchpad\status-inicial.txt`.

**O que foi feito**
- `useStructuralStyles.ts:47` — removida a chave `columnGap: … : undefined` que vinha depois de `gap` e zerava o espaço entre colunas. No masonry o `gap` já vale nos dois eixos, então a chave era redundante além de nociva.
- `useStructuralStyles.gap.ts` — novo `resolveAxisGaps(rowGap, columnGap, atom)`: traduz o token e devolve só as chaves pedidas (nunca `undefined`).
- `SarakGrid.tsx`, `SarakFlex.tsx` — props `rowGap` e `columnGap` (`SarakLayoutGap`), espalhadas depois do estilo estrutural e antes do `style` do consumidor.
- Revisão (passo 3): varri `src/components/atomic/` atrás de propriedade curta e longa juntas com chave que possa ser `undefined`. **Achado: 1** (`useStructuralStyles.ts:47`), corrigido. `SarakDescriptionList.tsx:26-27` usa `columnGap` e `rowGap` sem `gap` (sem conflito); `gridColumn: … : undefined` em `SarakCoreCard.tsx:144` e `SarakActionCard.tsx:176` não tem par longo. Seções e cartões não têm o padrão.
- `Modals/hooks/useOverlayLayer.ts` (novo) — pilha única das camadas abertas, no módulo (Modal e Drawer funcionam sem Provider e em árvores distintas). Devolve `depth` e `isTop`; o degrau é `OVERLAY_LAYER_STEP` (10). Identificador por `Symbol`, não `useId`: um `useId` a mais deslocava ids de snapshot onde o Provider monta modal e gaveta.
- `SarakModal.tsx`, `SarakDrawer.tsx` — z-index = base + `depth × 10`; `depth` 0 mantém o valor de antes (modal: classe `z-[var(--z-index-modal)]`; gaveta: `design.zIndexModal || 1000`).
- `useFocusTrap.ts`, `useModalBehavior.ts` — 3º parâmetro opcional `isTopLayer` (padrão `true`): só a camada do topo responde a Escape e Tab. A restauração do foco ao fechar já existia (devolve ao elemento ativo na abertura).
- `SarakModal.tsx` — o modal passa a sair por `createPortal` + `SarakPortalScope` no `body`, como a gaveta. **Causa medida** do vermelho no modo embarcado: `.sarak-scope` é `position: relative; z-index: 0` (contexto de empilhamento), e o modal dentro dela nunca passava da gaveta, que vai para o `body`.
- `SarakSegmentedControl.tsx` — a opção marcada leva `!bg-[var(--sarak-on-surface,#ffffff)] !text-[var(--color-theme-body,#06080d)]`. Medido antes: **1,00:1 em todos os temas e modos** (todas as opções eram `ghost`, só o `aria-checked` mudava). A variante `primary` foi tentada primeiro e reprovou em temas de botão vazado (`cyberpunk-neon`, `industrial-terminal`, `blueprint-protocol`, `editorial-ink`, `high-contrast`) e em primárias claras no modo claro; o estilo do tema vem inline, por isso só `!important` o vence.
- `docs/migracoes.md` — seção nova (itens 1, 12 e 13), MINOR dentro da 8.0.0.
- Testes: `browser-tests/plan-146-grade-camadas.spec.ts` + `fixtures/plan-146-entry.tsx` (novos); unitários novos/estendidos em `useOverlayLayer`, `useFocusTrap`, `useStructuralStyles.gap`, `SarakGrid`, `SarakFlex`, `SarakSegmentedControl`; `iconPort.test.tsx` passa a ler `baseElement` (o modal agora está no `body`).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/hooks/useStructuralStyles.ts` | alterado | remove a chave `columnGap: undefined` |
| `src/components/atomic/hooks/useStructuralStyles.gap.ts` | alterado | `resolveAxisGaps` |
| `src/components/atomic/Layouts/SarakGrid.tsx`, `SarakFlex.tsx` | alterado | props `rowGap`, `columnGap` |
| `src/components/atomic/Modals/hooks/useOverlayLayer.ts` | criado | pilha de camadas |
| `src/components/atomic/Modals/hooks/useFocusTrap.ts`, `useModalBehavior.ts` | alterado | `isTopLayer` |
| `src/components/atomic/Modals/SarakModal.tsx`, `SarakDrawer.tsx` | alterado | z-index pela pilha; modal em portal |
| `src/components/atomic/Templates/SarakSegmentedControl.tsx` | alterado | superfície invertida na opção marcada |
| `docs/migracoes.md` | alterado | seção dos itens 1, 12 e 13 |
| `browser-tests/plan-146-grade-camadas.spec.ts`, `browser-tests/fixtures/plan-146-entry.tsx` | criado | specs de navegador |
| `…/hooks/__tests__/useOverlayLayer.test.tsx` | criado | 3 casos |
| `…/hooks/__tests__/useFocusTrap.test.tsx`, `useStructuralStyles.gap.test.ts`, `Layouts/__tests__/SarakGrid.test.tsx`, `SarakFlex.test.tsx`, `Templates/__tests__/SarakSegmentedControl.test.tsx`, `Icon/__tests__/iconPort.test.tsx` | alterado | casos novos / `baseElement` |
| `dist/*` | alterado | efeito do build parcial (ver Decisões) |

**Verificações executadas**
- Vermelho da grade (antes do conserto): `npx playwright test … plan-146-grade-camadas.spec.ts` → 4 reprovados; entre colunas, **0 px** (esperado = token; o desvio medido foi 24 px).
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/plan-146-grade-camadas.spec.ts` (final) → **11 passed**: grade/flex (4), segmentado 20 temas × 2 modos (1), pilha de camadas em app e embarcado (6).
- Segmentado, depois do conserto: **menor contraste medido 9,87:1** (mínimo exigido 3:1) entre a opção marcada e cada outra, nos 20 temas × 2 modos do catálogo (o catálogo tem 20, não 19). Antes: 1,00:1 em todos.
- `npx vitest run` nas pastas `Layouts`, `hooks`, `Modals`, `Templates`, `Cards`, `Icon` e `features/DesignEngine/Canvas` → 663 passed, 3 failed (antes de trocar `useId` por `Symbol`); depois, `SarakSearchCard` passou. Restam 2 reprovados, ambos de snapshot do painel, **por causa alheia ao estilo da grade**: a diferença é só `data-sx-sidebar-logo-placement`, `data-sx-sidebar-resizable`, `data-sx-sidebar-tone`, `data-sx-topbar-tone` e as 4 variáveis `--sarak-sidebar-logo-placement/resizable/tone` e `--sarak-topbar-tone` na linha `style` (conferi por diferença de conjuntos: nenhuma `gap`). Tokens de outra plan; **não regenerei**. `grep` em `*.snap` por `gap: … normal` e por `SarakSegmentedControl`: zero ocorrências, então nenhum snapshot depende do estilo que corrigi.
- `npx vitest run src/components/atomic/Modals …` (final) → 10 arquivos, 44 passed.
- `npx tsc --noEmit` (dentro do `verify --tier=quick`) → OK.
- `npm run verify -- --tier=quick` → falhou em 5 verificações, nenhuma minha depois da correção: `audit:baseline` (mostrava `auditor_cleancode 0→1`, que era o `else if` do meu `useOverlayLayer.ts:55`; corrigido e conferido com `run_audit.mjs`, 0 ocorrências no arquivo; as outras três regressões — `auditor_hardcoded`, `estruturalLiquido`, `ghostvars` — estão em `SarakShellSearchWidget.tsx:122`, `ShellNavGroup.tsx:46,89` e arquivos de navegação de outra plan), `theme-completeness:check` (`sidebarLogoPlacement`, `sidebarTone`, `topbarTone` faltando nos temas), `chrome-token-parity:check` (`navActiveMarkerGlow`), `guide:check` e `dev-kit:check` (kit defasado). Não rodei o `verify` de novo depois do ajuste do `else if`.

**Critérios de aceite**
- [x] Distância entre dois filhos igual ao token, nos dois eixos, em navegador real; vermelho antes — spec `só gap`, `rowGap`/`columnGap` (grade) e flex.
- [x] `rowGap` e `columnGap` vencem `gap`; sem eles, `gap` nos dois eixos — specs 2, 3 e 4 (navegador).
- [x] `elementFromPoint` cai na confirmação sobre gaveta e modal; foco volta — specs de pilha (app e embarcado): modal sobre gaveta, confirmação do Provider sobre gaveta (foco entra nela e volta para dentro da gaveta ao cancelar), gaveta sobre modal. Escape fecha só a camada do topo.
- [x] Controle segmentado medido nos 20 temas × 2 modos (menor 9,87:1).
- [ ] Catálogo atualizado — motivo: não rodei `npm run guide`/`catalog` (ver Pendências). `SarakGridProps`/`SarakFlexProps` ganharam props; o `catalog:check` do `verify` passou (`[OK] catalog:check`), mas `docs/component-catalog.*` e `sarak-ui/catalog.json` já estavam modificados por outras plans e `guide:check` acusa o kit defasado.

**Decisões e suposições**
- Camada fora do Provider: a pilha mora no módulo e não no `SarakOverlayProvider`, porque `SarakModal` e `SarakDrawer` rodam sem Provider e na árvore do consumidor.
- **Gaveta aberta pelo próprio `SarakOverlayProvider` não coexiste com `confirm()`**: o Provider mantém um overlay por vez (documentado no cabeçalho dele) e a confirmação substitui a gaveta. Não mudei isso; o caso do ERP (gaveta do consumidor + `confirm()`) está coberto. Declarado como limite no cabeçalho do spec.
- O modal em portal muda onde ele fica no DOM (do local de montagem para o `body`) também no Modo App. Escolhi isso porque a gaveta já faz assim e porque um modal montado dentro de uma gaveta (que tem `transform`) ficaria preso a ela. Efeito colateral conhecido: um modal dentro de um `SarakDesignScope` com tema próprio deixa de herdar as variáveis daquele escopo (a gaveta já tem o mesmo limite).
- Seleção do controle segmentado: invertida pela cor de maior contraste sobre o corpo, e não pela cor de marca, pelos temas de botão vazado (ver *O que foi feito*). Pode ser menos "de marca" que o esperado; o contraste é o critério da plan.
- Não vi o vermelho das camadas antes de escrever o conserto (escrevi `useOverlayLayer` antes do spec de pilha); o spec de navegador dessa parte nasceu verde para app e vermelho só no embarcado, antes do portal. A grade e o segmentado seguiram vermelho → verde.
- `npm run build` completo **parou em `guide:check`** (kit `sarak-ui/` defasado por mudanças de outras plans e da `docs/migracoes.md`, que é compartilhada). Para ter `dist/` atual rodei o resto da cadeia sem esse gate: `deep-import:check`, `build:js`, `public-types:check`, `prefix:check`, `build:css`, `build:css:scoped`, `copy-base-css`, `inject-css`; todos saíram 0. Não rodei `generate-build-info`, `fonts:*`, `theme-boot:check`, `icon-port:check`, `kit-names:check` nem `test:optional-peers` dessa cadeia (os três últimos passaram no `verify quick`).
- **Não executei** `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts` (passo 9): `dist/` já estava modificado na fotografia por outro build e as plans 147 e 148 leem esse `dist/` nos próprios specs; restaurar apagaria o trabalho delas. `buildInfo.ts` não foi regerado por mim. O revisor decide a hora de restaurar.
- Os specs de navegador importam o código-fonte por caminho relativo (padrão de `troca-de-tema-entry.tsx`), de modo que lógica de React é medida sem depender do `dist`; só o CSS vem do `dist/sarak.css`, que a classe `!bg-…` do segmentado exigia reconstruir.

**Achados fora do escopo (não corrigidos)**
- `SarakModal`/`SarakDrawer` zeram `document.body.style.overflow` ao fechar mesmo havendo outra camada aberta (`useModalBehavior.ts`, `SarakDrawer.tsx`): fechar a de cima destrava a rolagem da página sob a de baixo.
- `SarakDrawer.tsx` usa `design.zIndexModal || 1000` e o modal usa `--z-index-modal` (2000 por padrão no CSS): sem Provider e com o CSS carregado a gaveta de primeira camada fica em 1000, abaixo do modal de primeira camada. Antigo e sem efeito na pilha (o degrau seguinte sempre sobe).
- `SarakAppChrome`/navegação de outra plan: `else if`, px/rem e `flex-col` chumbado listados em *Verificações*.

**Pendências / riscos**
- `npm run build` completo não passa no estado atual do worktree (`guide:check`); precisa de `npm run guide` por quem fechar as plans 147/148 e esta.
- `verify --tier=quick` segue vermelho por `theme-completeness`, `chrome-token-parity`, `guide`, `dev-kit` e três regressões de baseline de arquivos de outras plans. Não rodei de novo depois do ajuste do `else if`.
- Snapshots de `PreviewCanvas` e `AtmosphereCatalog` ficam vermelhos até a plan dos tokens de sidebar/topbar regerar os dela.
- Risco: o modal em portal pode mudar a posição de modais de consumidores que o montavam dentro de um contêiner com `transform` esperando ficar preso a ele (improvável).
- Esta execução não commitou nada.

---

# 10. Veredito

## Veredito — 2026-11-02 — 🔴 Reprovado

Grade, pilha de camadas e controle segmentado estão certos, com vermelho antes e verde depois na grade e no segmentado. Conferido: `Modals`, `Layouts` e `hooks` verdes. O modal em portal está aceito. As regressões de auditoria que restam são da `plan-149`, em curso.

1. **Rolagem destravada com camada aberta.** O próprio resumo registrou: fechar a camada de cima zera `document.body.style.overflow` com outra ainda aberta (`useModalBehavior.ts`, `SarakDrawer.tsx`). Isso é exatamente o caso do ERP: confirmação sobre gaveta. A trava passa a seguir a pilha: só sai quando a última camada fecha. Teste de navegador.

**Verificação objetiva:** o spec desta plan e o filtro de `Modals`.

---

## Resumo da execução (correção 1) — 2026-11-02

**Achado 1 — rolagem destravada com camada aberta: corrigido.**
- `Modals/hooks/useOverlayLayer.ts` — a trava de `document.body.style.overflow` passou para a pilha: `publish` aplica `hidden` com ao menos uma camada aberta e `''` só quando a última sai (cobre fechamento, desmontagem e a saída animada da gaveta).
- `Modals/hooks/useModalBehavior.ts` e `Modals/SarakDrawer.tsx` — removida a escrita própria de `overflow` (era ela que destravava a página sob a camada de baixo). O `useModalBehavior` segue reiniciando o wizard ao abrir.
- Testes: navegador `plan-146-grade-camadas.spec.ts`, caso "a rolagem da página só destrava quando a última camada fecha" (gaveta + confirmação; cancela a confirmação → `body` segue `hidden`; Escape fecha a gaveta → destrava), em app e embarcado; unitário em `useOverlayLayer.test.tsx`; `useModalBehavior.test.ts` passou a montar o hook junto com `useOverlayLayer`, porque a trava deixou de ser dele.

**Verificação objetiva**
- `npx playwright test … plan-146-grade-camadas.spec.ts` → 13 passed (os 11 anteriores + o caso novo nos dois modos).
- `npx vitest run src/components/atomic/Modals` → 10 arquivos, 45 passed.
- `run_audit.mjs`: nenhuma ocorrência em `Modals/`.

**Arquivos tocados:** `useOverlayLayer.ts`, `useModalBehavior.ts`, `SarakDrawer.tsx`, `useOverlayLayer.test.tsx`, `useModalBehavior.test.ts`, `plan-146-grade-camadas.spec.ts`. Nada commitado. O achado "rolagem" sai da lista de fora do escopo do resumo anterior.

## Veredito — 2026-11-02 — correção 1 — 🟢 Aprovado

A trava de rolagem segue a pilha e só sai quando a última camada fecha. `Modals` verde; spec de navegador com 13 de 13, segundo o executor. Código no commit do aprovado.
