---
tipo: "plan"
titulo: "Dar a lib alvos de toque, campos e movimento corretos no celular"
objetivo: "Fazer todo atomo acionavel ter area tocavel minima com ponteiro de dedo, campo sem zoom automatico no celular, movimento reduzido de verdade, tooltip que abre no toque e busca com o teclado de busca"
dominio: "Componentes atomicos / Multidispositivo / Acessibilidade"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "mobile", "toque", "acessibilidade", "movimento", "multidispositivo"]
relacionados: ["[[07-responsividade-e-multidispositivo]]", "[[10-seguranca-e-acessibilidade]]", "[[04-contrato-de-tokens-e-paridade]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/07-responsividade-e-multidispositivo.md + specs/10-seguranca-e-acessibilidade.md"
---

# 1. Objetivo

No celular (ponteiro grosso), todo átomo acionável da lib tem área tocável de pelo menos 44 px, nenhum campo dispara
o zoom automático do navegador, quem pediu menos movimento recebe menos movimento, o tooltip abre no toque e a busca
abre o teclado com a tecla "Buscar" — sem o consumidor escrever uma linha.

# 2. Contexto

Avaliação de 2026-10-10 contra um material de design system para mobile (WCAG 2.2 e práticas de toque), medida no
código do `HEAD`:

- **Alvo de toque.** `SarakIconButton` tem `xs` = 24 px e `sm` = 32 px (`Buttons/SarakIconButton.tsx:44-45`); o
  `SarakButton` `xs` mede cerca de 28 px (`py-1.5`); o cabeçalho do calendário usa `sm`, e a barra do Gantt ocupa 60%
  de uma linha de ~40 px. O único 44 px da lib é o hambúrguer do drawer (`Layout/SarakAppChromeMobile.tsx:165`). Nada
  amplia o alvo quando a entrada é o dedo. Referência: WCAG 2.5.8 (24 px, AA) e 2.5.5 (44 px).
- **Zoom do campo.** Os campos herdam `bodySize`; 11 dos 14 temas usam 12 ou 14 px. O Safari do iPhone dá zoom
  automático ao focar campo com fonte menor que 16 px. Nenhuma regra da lib garante o piso.
- **Movimento.** O token `reducedMotion` (`src/core/Design/schema/engineering.ts`) emite `--sarak-reduced-motion`, e
  **nada lê** essa variável; nenhum CSS responde a `prefers-reduced-motion`, e as animações do `framer-motion` não
  consultam a preferência.
- **Tooltip.** `UX/SarakTooltip.tsx:177` abre só por `mouseenter` e foco: no toque, um gatilho não focável nunca o abre.
- **Teclado.** Nenhuma busca declara `type="search"` nem `enterKeyHint` (0 ocorrências em `src/`).
- **Largura mínima.** Os testes de navegador do calendário e do Gantt medem a 340 px; o WCAG 1.4.10 fala em 320 px.

O princípio da camada 3 ([[07-responsividade-e-multidispositivo]] §6.1) continua: a adaptação é por CSS (`pointer`,
`prefers-reduced-motion`, container query), nunca por detecção de aparelho em JS.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/schema/` — token novo do alvo mínimo de toque (padrão 44 px), com a paridade de `src/core/Design/catalog/theme_table_mapping.json` e da partição do catálogo; e o consumidor do `reducedMotion`.
- `src/styles/` — as regras de `@media (pointer: coarse)` (alvo mínimo dos acionáveis da lib e piso de 16 px nos campos) e de `prefers-reduced-motion` / `reducedMotion`, nas camadas certas ([[02-design-engine]] §9.1).
- `src/core/Provider/` — só se for preciso para o `framer-motion` respeitar a preferência de movimento.
- `src/components/atomic/UX/SarakTooltip.tsx` — abrir e fechar por toque.
- As buscas: `Inputs/SarakSearch.tsx`, `Navigation/SarakShellSearchWidget.tsx` e o campo de busca de `Inputs/SarakMultiSelect.tsx`/`SarakAutocomplete.tsx`.
- Testes de cada arquivo tocado; caso novo em `browser-tests/` com emulação de toque; `browser-tests/fixtures/harness-entry.tsx` se precisar de cena.
- Artefatos regenerados (`npm run catalog`, `npm run guide`, `npm run token-types`); `docs/migracoes.md`, nota na seção da próxima versão.

## 3.2 Fora
- O tamanho **visual** dos átomos no desktop (`pointer: fine`) — não muda.
- A navegação na base do celular (é a `plan-109`) e os estados de dado (é a `plan-108`).
- O `viewport` do `index.html` do consumidor; qualquer spec em `specs/`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` §5, §6.1 | o contrato do que adapta sozinho; a camada 3 |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` §3 | acessibilidade da lib |
| Spec fixa | `arquitetura/02-design-engine.md` §9.1 | em que camada CSS cada regra mora (classe vence elemento) |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` | paridade 1:1:1 do token novo |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-novo-componente` | token novo nas três fontes |
| **Skill** | `ui-arquitetura-design` | CSS da lib |
| **Skill** | `test-unitario` | testes dos átomos |
| Código | `src/components/atomic/Buttons/SarakIconButton.tsx`, `src/components/atomic/Buttons/SarakButton.tsx`, `src/components/atomic/UX/SarakTooltip.tsx`, `src/core/Design/schema/engineering.ts` | o estado atual |
| Código | `browser-tests/css-que-so-o-navegador-mede.spec.ts` | o idioma das medições em navegador |

# 5. Instruções de execução

1. Criar o token do alvo mínimo de toque (padrão 44 px) com paridade completa, e aplicá-lo com `@media (pointer: coarse)` a todo acionável da lib (botão, botão-ícone, item de menu e de navegação, chip, controle de calendário, barra do Gantt…) — pela área tocável (altura/largura mínima ou extensão da área), sem mudar o desenho no desktop.
2. Com `pointer: coarse`, `input`, `textarea` e `select` da lib nunca ficam abaixo de 16 px de fonte.
3. Ligar o `reducedMotion`: com o token ligado **ou** `prefers-reduced-motion: reduce`, transições e animações da lib caem para o mínimo (inclusive as do `framer-motion`).
4. `SarakTooltip` abre por toque e fecha ao tocar fora ou de novo; foco e mouse continuam como hoje.
5. As buscas da §3.1 declaram `type="search"` e `enterKeyHint="search"`.
6. Testes: unitários de cada átomo tocado; em `browser-tests/`, com toque emulado (`hasTouch`/`isMobile`), medir que os acionáveis de uma cena representativa têm caixa tocável ≥ o token, que o campo computa ≥ 16 px, e repetir a medição do calendário e do Gantt a **320 px** sem rolagem horizontal da página.
7. Regenerar artefatos; nota de migração (muda o tamanho tocável no celular — classificar).
8. Rodar a verificação da §7.

# 6. Critérios de aceite

- [ ] Com toque emulado, a caixa tocável de cada acionável da cena medida é ≥ o token (44 px por padrão); com mouse, o tamanho é o de antes.
- [ ] Com toque emulado, o `font-size` computado dos campos é ≥ 16 px em todos os temas medidos.
- [ ] Com `reducedMotion` ou `prefers-reduced-motion: reduce`, nenhuma transição/animação da lib passa do mínimo (teste que falha sem a mudança).
- [ ] Tooltip abre e fecha por toque (teste que falha sem a mudança).
- [ ] As buscas têm `type="search"` e `enterKeyHint="search"`.
- [ ] Calendário e Gantt medidos a 320 px sem rolagem horizontal da página.
- [ ] Paridade do token (`npm run audit` → `auditor_paridade` convergente); suíte completa verde; `tsc` 0; `audit:baseline` sem regressão; `cromo-css-real:check` verde; catálogo, kit e barril em dia.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — o comportamento é medido pelos testes de navegador desta plan (`cromo-css-real:check`).

- `git diff --stat` → só a §3.1 e os gerados.
- `npm run cromo-css-real:check` → verde, com os casos novos listados.
- Mutação: tirar a regra de `pointer: coarse` → o caso do alvo falha; tirar o piso de 16 px → o caso do campo falha.
- `grep -rn "enterKeyHint" src --include=*.tsx | grep -v __tests__` → as buscas da §3.1.
- `npx vitest run` · `npx tsc --noEmit` · `npm run audit:baseline` · `npm run audit` (paridade) · `catalog:check` · `guide:check` · `barrel:check`.

# 8. Destino da síntese

**Destino:** `specs/07-responsividade-e-multidispositivo.md + specs/10-seguranca-e-acessibilidade.md`

Para a [[07-responsividade-e-multidispositivo]] §5 (o que adapta sozinho), como linhas da tabela:

> **Alvo de toque** — com ponteiro de dedo, todo acionável da lib tem área tocável de pelo menos o token de alvo
> mínimo (44 px por padrão); o desenho no desktop não muda. **Campo** — com ponteiro de dedo, nunca abaixo de 16 px
> (o navegador não dá zoom ao focar).

Para a [[10-seguranca-e-acessibilidade]] §3: o `reducedMotion` e o `prefers-reduced-motion` reduzem toda animação
da lib; o tooltip abre no toque; a busca usa o teclado de busca.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-10-10

**Resultado:** Concluído com pendências (as duas execuções de navegador — `npm run build` e `cromo-css-real:check` — ficam para o revisor, por falta de rede nesta máquina, como instruído)

**Estado do worktree ao iniciar**
```
M  specs/00-indice.md
M  specs/arquitetura/03-superficie-publica.md
D  specs/plan/plan-105-rotulo-dos-campos-e-textos-traduzidos.md
D  specs/plan/plan-106-controle-do-host-sobre-as-preferencias.md
M  specs/plan/plan-107-toque-e-entrada-no-celular.md
D  specs/plan/plan-108-dado-e-status-que-nao-somem.md
M  specs/specs/05-cromo-e-slots.md
M  specs/specs/09-temas-e-presets.md
```
(Durante a execução esses itens deixaram de aparecer em `git status` — foram commitados pelo usuário; não os toquei.)

**O que foi feito**
- Token `touchTargetMin` (slider 24–64, padrão 44, `--sarak-touch-target-min`) nas três fontes: `schema/engineering.ts`, `theme_table_mapping.json` (coluna `specialized_engines`), `partitions/specialized_engines.json`; tipos regenerados.
- `src/styles/_touch.css` (novo, subcamada `components.sarak-elements`): com `pointer: coarse`, `min-height`/`min-width` do token em `button`, `[role=button|menuitem|tab]`, `input` de botão; só altura em `select` e `[role=option]`; `font-size: max(16px, 1em)` em `input/select/textarea`; variável-ponte `--sarak-touch-target-active` (0px com mouse, o token com dedo).
- `src/styles/_motion.css` (novo, camada `sarak-lib`): `:root[data-sx-reduced-motion="true"]` e `@media (prefers-reduced-motion: reduce)` levam transição/animação a 0,01 ms (`!important`). O atributo já era emitido pelo motor para tokens boolean.
- `SarakUIProvider.tsx`: `MotionConfig reducedMotion` = `always` com o token, `user` sem ele.
- Gantt (`ganttLayout.ts`, `GanttTimeline.tsx`, `SarakGantt.tsx`): `GANTT_ROW_SIZE` = `max(linha, alvo ativo)`; a barra passa a `max(60%, alvo ativo)` centrada e `minWidth` = alvo ativo (com mouse: 20% / 60% / 0, como antes).
- `SarakTooltip.tsx`: abre/fecha por toque (`onPointerDown` não-mouse), toque fora fecha, mouseenter/leave emulados ignorados por 800 ms.
- `type="search"` + `enterKeyHint="search"` em `SarakSearch`, barra do `SarakShellSearchWidget`, campo do `SarakMultiSelect` e do `SarakAutocomplete` (neste, o consumidor ainda sobrescreve).
- `SarakTimePicker.tsx`: `text-sm` ganhou `[@media(pointer:coarse)]:text-base` (classe vence o padrão de elemento; sem isso os selects ficariam em 14 px).
- Testes novos/estendidos; `browser-tests/toque-no-celular.spec.ts` + 3 cenas e 3 variantes de tema no harness; `<meta viewport>` no HTML do harness (sem ele `isMobile` usa layout de 980 px).
- `docs/migracoes.md`: entrada sob 8.0.0, classificada MAJOR (muda default).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/schema/engineering.ts`, `catalog/theme_table_mapping.json`, `catalog/partitions/specialized_engines.json` | alterado | token `touchTargetMin` |
| `src/core/Provider/generated/design-token-ids.ts` | alterado (gerado) | +1 token |
| `src/styles/_touch.css`, `_motion.css` | criado | regras de toque / movimento |
| `src/styles/sarak-base.css` | alterado | 2 `@import` |
| `src/core/Provider/SarakUIProvider.tsx` | alterado | `MotionConfig` |
| `src/components/atomic/DataDisplay/SarakGantt/{ganttLayout.ts,GanttTimeline.tsx,SarakGantt.tsx}` | alterado | linha/barra com alvo de toque |
| `src/components/atomic/UX/SarakTooltip.tsx` | alterado | toque |
| `src/components/atomic/Inputs/{SarakSearch,SarakMultiSelect,SarakAutocomplete,SarakTimePicker}.tsx`, `Navigation/SarakShellSearchWidget.tsx` | alterado | teclado de busca; fonte do select de hora |
| `UX/__tests__/SarakTooltip.touch.test.tsx`, `Provider/__tests__/MovimentoReduzido.test.tsx`, `styles/__tests__/toqueEMovimento.test.ts` | criado | testes |
| testes de `SarakSearch`, `SarakShellSearchWidget`, `SarakMultiSelect`, `SarakAutocomplete`, `SarakTimePicker`, `SarakGantt`, `ganttLayout` | alterado | casos novos |
| `src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.test.tsx`, `Main/components/__tests__/SaveThemeModal.test.tsx` | alterado | mock de `framer-motion` ganhou `MotionConfig` |
| snapshots de `PreviewCanvas` e `PresetCard` | alterado | só a variável nova (e `type`/`enterkeyhint` da busca no primeiro) |
| `browser-tests/toque-no-celular.spec.ts` | criado | medição em navegador |
| `browser-tests/fixtures/harness-entry.tsx`, `build-harness.mjs` | alterado | cenas `toque`, `toque-estreito`, `movimento`; viewport meta |
| `docs/migracoes.md`, `sarak-ui/*`, `sarak-dev/*` | alterado (doc/gerado) | `npm run guide`, `npm run dev-kit` |

**Verificações executadas**
- `npx vitest run` (completa, 1ª rodada) → 438 arquivos ok, 3 falharam (14 testes): mocks de `framer-motion` sem `MotionConfig` (PreviewCanvas, SaveThemeModal) e snapshot do PresetCard. Corrigidos; `npx vitest run src/features` → 78 arquivos / 357 testes verdes; os arquivos novos e os alterados passaram isoladamente. **Não repeti a suíte completa após a correção.** Sem EPERM.
- `npx tsc --noEmit` → 0 erros. `npm run audit:baseline -- --with-tsc` → "igual ao baseline de 2026-08-11 — nenhuma regressão".
- `token-types:check`, `catalog:check`, `guide:check`, `barrel:check`, `dev-kit:check` → em dia (438 tokens, 102 componentes).
- Anel 1: `container-query:check`, `container-query-boundary:check`, `class-merge:check`, `icon-port:check`, `chrome-token-parity:check`, `zero-brand:check` → todos OK.
- lightningcss parseia `_touch.css`/`_motion.css`, e `scopeCss` os escopa a `.sarak-scope` corretamente (`:root` → ilha).
- **Não executei:** `npm run build`, `cromo-css-real:check`, `npm run audit` isolado (o baseline o cobre).

**Critérios de aceite**
- [ ] Alvo ≥ token com toque emulado — caso escrito (`toque-no-celular.spec.ts`), **não executado**.
- [ ] Campo ≥ 16 px com toque — caso escrito, **não executado**.
- [x] Movimento reduzido — CSS lido em `toqueEMovimento.test.ts`; `MotionConfig` em `MovimentoReduzido.test.tsx` (falha sem a mudança); computado em navegador: escrito, não executado.
- [x] Tooltip abre/fecha por toque — `SarakTooltip.touch.test.tsx` (falha sem a mudança).
- [x] Buscas com `type="search"` e `enterKeyHint="search"` — testes nos 4 componentes.
- [ ] Calendário e Gantt a 320 px — caso escrito, **não executado**.
- [ ] `cromo-css-real:check` verde e suíte completa após as correções — pendentes (ver acima).

**Decisões e suposições**
- Padrão geral por `min-height`/`min-width` em elemento, na subcamada que cede à classe e ao estilo inline; componente denso que declara medida inline segue vencendo.
- Barra do Gantt com `minWidth` = alvo: uma tarefa de 1 dia pode desenhar mais larga que o intervalo com dedo; a alternativa (pseudo-elemento) esbarra no `overflow: hidden` da barra.
- `MotionConfig` em `SarakUIProvider` traz o import de `framer-motion` ao caminho de boot; é peer obrigatório e já está no grafo do barril — não medi o bundle.
- `npm run dev-kit` e `sarak-ui/` regenerados (fora da lista literal da §3.1, mas é a consequência documentada de token novo).
- Mocks e snapshots de dois testes de `features/DesignEngine` alterados: consequência direta do `MotionConfig` e do token novo.

**Achados fora do escopo (não corrigidos)**
- Chip de evento do calendário (`CalendarDayCell.tsx`, `minHeight: 0`/`minWidth: 0` inline): com dedo e contêiner largo (tablet) continua ~18 px; no estreito é só um ponto e a célula é o alvo. Fora da cena medida.
- `input[type=checkbox|radio|range]` não entram na regra de alvo mínimo.
- Qualquer teste que mocke `framer-motion` sem `MotionConfig` e monte um `SarakUIProvider` real quebra agora (os 2 achados foram corrigidos).

**Pendências / riscos**
- O revisor precisa rodar `npm run build` + `npm run cromo-css-real:check` com rede; a classe `[@media(pointer:coarse)]:text-base` só existe no CSS após o build. Risco: a medição pode revelar acionável que o `min-*` não cobre.
- `prefers-reduced-motion` também para spinners e skeletons (declarado na nota de migração).

## Resumo da execução (correção 1) — 2026-10-11

**Resultado:** Concluído (a medição em navegador do caso reprovado fica para o revisor, sem rede nesta máquina)

**Achado 1 — o seletor de hora computava 12 px com toque e corpo de 12 px.** Procedente.
- Causa: `[@media(pointer:coarse)]:text-base` resolve para `var(--text-base)`, que a lib amarra ao corpo do tema; num tema de 12 px o "base" é 12 px.
- `src/components/atomic/Inputs/SarakTimePicker.tsx:25` — a variante passou a `[@media(pointer:coarse)]:text-[length:max(16px,1em)]`, o mesmo piso absoluto de `_touch.css` (`1em` num `font-size` é a fonte herdada: o select mantém a do corpo quando ela já passa de 16 px e sobe a 16 quando não passa).
- O auditor de hardcode passou a acusar o `16px` (`auditor_hardcoded.valor` 0 → 1); isentei o literal com `sarak-allow-hardcode` e a razão, na linha acima dele (`SarakTimePicker.tsx:24`), pelo mesmo mecanismo que `GanttTimeline.tsx` usa. Nenhum gate foi alterado.
- `src/components/atomic/Inputs/__tests__/SarakTimePicker.test.tsx:84` — a asserção de classe acompanha a nova classe.

**Verificações executadas**
- `npx vitest run src/components/atomic/Inputs/__tests__/SarakTimePicker.test.tsx` → 8/8.
- `npx tsc --noEmit` → 0 erros.
- `npm run audit:baseline -- --with-tsc` → igual ao baseline (antes da isenção: regressão `auditor_hardcoded.valor 0 -> 1`; depois: sem regressão).
- `guide:check`, `catalog:check` → em dia.
- **Não executado:** `cromo-css-real:check` (precisa de build com rede); `toque-no-celular.spec.ts:204` deve passar para `Hora`/`Minuto`, pois a classe é gerada pelo Tailwind a partir do literal e o piso é absoluto.

**Achados fora do escopo (não corrigidos):** nenhum novo.

**Pendências / riscos:** o `text-[length:…]` só vira regra no CSS após o build; se o Tailwind não gerar a variante arbitrária, o caso 204 acusa de novo.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-11 — 🔴 Reprovado

**Verificado:** `npm run cromo-css-real:check` (build oficial, rodado pelo revisor com rede) → **86 casos verdes, 1 falha** (abaixo); `npx vitest run` → 441 arquivos, 2684 testes verdes; `tsc` 0; `audit:baseline` igual ao baseline; `npm run audit` → paridade 1:1:1 convergente com **438** tokens (o `touchTargetMin` nas três fontes); Anel 1 do `pre-commit` (`container-query`, `container-query-boundary`, `persistence-doc`, `class-merge`, `icon-port`, `chrome-token-parity`, `gate-limits`, `deep-import`, `zero-brand`) e `barrel`, `catalog`, `guide`, `dev-kit`, `token-types`, `public-types` verdes. `framer-motion` já era importado pelo `dist/index.js` no `HEAD`: o `MotionConfig` não acrescenta peso ao boot. Diff lido: `_touch.css` na subcamada que cede à classe; tooltip por `onPointerDown` com a janela de mouse emulado; linha do Gantt por `max(linha, alvo ativo)`.

**Registrado, não reprova:** o `_motion.css` reduz animação e transição de **todo** elemento do documento (`:root *`, `!important`, camada `sarak-lib`), inclusive markup do host, que não consegue desfazer; e o `MotionConfig` envolve o `children` do host. O alcance segue o contrato do token `reducedMotion` ("em toda a aplicação", `schema/engineering.ts`) e a preferência do sistema operacional é do usuário. A consequência para spinners e skeletons está na nota de migração.

**Achado:**

1. `src/components/atomic/Inputs/SarakTimePicker.tsx:25` — com toque emulado e tema de corpo 12 px, o seletor de hora computa **12 px** (`toque-no-celular.spec.ts:204`, "com o corpo de 12px, nenhum campo computa menos de 16px" → `Hora: Expected >= 16, Received 12`). A classe `[@media(pointer:coarse)]:text-base` resolve para `var(--text-base)`, que a lib amarra ao corpo do tema — num tema de 12 px, o "base" é 12 px. O piso tem de ser absoluto (o mesmo `max(16px, 1em)` do `_touch.css`). Critério violado: "o `font-size` computado dos campos é ≥ 16 px em todos os temas medidos".

## Veredito — 2026-10-11 (rodada 2) — 🟢 Aprovado

**Achado da rodada anterior, conferido:** `SarakTimePicker.tsx:25` usa `[@media(pointer:coarse)]:text-[length:max(16px,1em)]`; o `dist/sarak.css` do build oficial traz `@media (pointer:coarse){…{font-size:max(16px,1em)}}`. A isenção `sarak-allow-hardcode` do literal `16px`, com o motivo na linha acima, é o mesmo mecanismo do marcador de hoje do Gantt; `audit:baseline` volta a igual ao baseline.

**Verificado:** `npm run cromo-css-real:check` (build oficial, rodado pelo revisor) → **87/87** verdes, inclusive `toque-no-celular.spec.ts:204`; Anel 1 do `pre-commit` e `barrel`, `catalog`, `guide`, `dev-kit`, `token-types`, `public-types` verdes; `tsc` 0; `audit:baseline` igual; `src/components/atomic/Inputs` → 27 arquivos, 177 testes verdes. A suíte completa da rodada anterior (441 arquivos, 2684 testes) cobre o resto — a correção mudou uma classe e uma asserção.

**Critérios de aceite:** todos atendidos — caixa tocável ≥ token com toque emulado e tamanho de antes com mouse; campos ≥ 16 px com toque em todos os temas medidos; movimento reduzido pelo token e pelo sistema; tooltip por toque; buscas com `type="search"`/`enterKeyHint`; calendário e Gantt a 320 px sem rolagem horizontal da página; paridade do token; suíte, `tsc`, `audit:baseline`, `cromo-css-real:check`, catálogo, kit e barril.
