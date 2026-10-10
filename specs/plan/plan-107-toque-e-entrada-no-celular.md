---
tipo: "plan"
titulo: "Dar a lib alvos de toque, campos e movimento corretos no celular"
objetivo: "Fazer todo atomo acionavel ter area tocavel minima com ponteiro de dedo, campo sem zoom automatico no celular, movimento reduzido de verdade, tooltip que abre no toque e busca com o teclado de busca"
dominio: "Componentes atomicos / Multidispositivo / Acessibilidade"
status: "🔴 A executar"
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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
