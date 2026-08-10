---
tipo: "plan"
titulo: "Triar a fronteira de papel — os 23 de R10, o scrim que falta migrar e os 2 fantasmas que sobraram"
dominio: "Sarak-Lib-UI-Core / Qualidade / Dívida"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "r10", "encapsulamento", "divida", "scrim"]
relacionados: ["[[00-regras-e-invariantes]]", "[[plan-20-gates-sem-vao]]", "[[plan-19-fechar-o-baseline]]", "[[03-superficie-publica]]"]
depende_de: "plan-20"
objetivo: "Triar os 23 de R10 entre encapsulamento e divida real, fechar o SarakScrim e os 2 fantasmas restantes"
destino_sintese: "specs/specs/00-regras-e-invariantes.md · specs/specs/01-gates-e-baseline.md · specs/arquitetura/03-superficie-publica.md"
---

> ⚠️ **Esta plan existe por um erro do revisor, e vale dizer isso na primeira linha.** A `plan-20` afirmou que
> os arquivos das pastas antes isentas eram *"compostos"* — **por nome, sem medir**. A triagem no veredito
> desmentiu: vários são encapsulamento legítimo. **Os 23 não são 23 de dívida.**

# 1. Objetivo

**Cada uma das 23 ocorrências recebe um destino medido** — marcador de encapsulamento **ou** conserto —, a
migração do `SarakScrim` fecha, e os **2 fantasmas** que a `plan-21` parou saem do baseline (§2.6).

Ao final: `composicaoatomica` em **0** e `ghostvars` em **1** (só o `--x`, declarado desde a `plan-15`).

# 2. Contexto

## 2.1 De onde vêm os 23

A `plan-20` trocou a fronteira da R10 de **pasta** para **papel** (decisão A1 do dono). `atomic/Buttons/` e
`atomic/Inputs/` deixaram de ser isentas em bloco; a isenção passou a ser o marcador
`@sarak-encapsula <tag> — <razão>`, por arquivo e por tag.

O executor marcou os **5** que a `plan-20` nomeou (`SarakButton`, `SarakIconButton`, `SarakInput`,
`SarakScrim`, `SocialButton`) e declarou o resto honestamente: **23 ocorrências em 13 arquivos**.

**O que a plan-20 errou:** ela chamou os outros de compostos sem medir. `SarakSelect` renderiza
`<div><select/></div>` — a razão de existir dele **é** encapsular o `<select>`. Ele merece marcador, não
conserto.

## 2.2 As 23, medidas — e a triagem preliminar do revisor

**A coluna "leitura" é hipótese, não veredito.** Ela existe para o executor não começar do zero; **cada linha
tem de ser confirmada abrindo o arquivo.**

| Arquivo | Linhas | Tag | Leitura preliminar |
|---|---|---|---|
| `Inputs/SarakSelect.tsx` | 39 | `select` | **encapsulamento** — 1 nativo, root `<div><select/></div>` |
| `Inputs/SarakSwitch.tsx` | 39 | `input` | **encapsulamento** — 1 nativo |
| `Inputs/SarakSlider.tsx` | 36 | `input` | **encapsulamento** — 1 nativo |
| `Inputs/SarakRangeSlider.tsx` | 158 | `input` | **encapsulamento** — 1 nativo |
| `Inputs/SarakSearch.tsx` | 68 | `input` | **encapsulamento** — 1 nativo |
| `Inputs/SarakUploader.tsx` | 98 | `input` | **encapsulamento** — 1 nativo |
| `Inputs/SarakTimePicker.tsx` | 63, 80 | `select` | provável — 2 `select` (hora/minuto) |
| `Inputs/SarakDatePicker.tsx` | 106 | `button` | **caso a caso** — 1 `button` num date picker |
| `Inputs/SarakMultiSelect.tsx` | 103, 173 | `input`, `button` | **caso a caso** — duas tags diferentes |
| `Inputs/SarakRichText.tsx` | 121, 125 | `button` | **caso a caso** — 2 botões de toolbar |
| `Inputs/Controls.tsx` | 56, 77, 107, 133, 138, 154 | `button` | **composto** — 6 botões |
| `Inputs/internal/CalendarPanel.tsx` | 116, 143 | `button` | **composto** — painel com navegação |
| `Buttons/ThemeToggle.tsx` | 21, 42 | `button` | **composto** — e ver §2.4 |

> **`CalendarPanel.tsx` não estava na lista de 18 da `plan-20`** — o executor o achou e nomeou. Vive em
> `Inputs/internal/`, subpasta que o levantamento do revisor (`ls Inputs/*.tsx`) não alcançou. Achado correto.

## 2.3 O critério da triagem — e ele não é "quantos nativos tem"

> **É encapsulamento quando a razão de existir do componente é dar forma Sarak a UM controle nativo.** O sinal
> forte: remova o elemento nativo e **o componente perde o sentido**, não só uma função.

`SarakSelect` sem o `<select>` não é nada. `SarakRichText` sem **um** dos botões de toolbar continua sendo um
editor. O primeiro é encapsulamento; o segundo, composição.

**Contagem de nativos é pista, não prova.** `SarakTimePicker` tem 2 `<select>` e provavelmente **é**
encapsulamento (hora e minuto do mesmo controle); `SarakDatePicker` tem 1 `<button>` e provavelmente **não é**
(o botão abre o calendário, não é o controle).

## 2.4 `ThemeToggle.tsx` — não trie, investigue

A `plan-15` lote 9 mediu: `LAYOUTS = {}` **vazio** e um `TODO` no código. É **seletor de preset morto**, não
duplicata do `ShellThemeToggle`. Antes de marcar ou consertar, pergunte se ele deveria **existir**.

⇒ Se a resposta for "remover", isso é **superfície pública** (está no barril) ⇒ **PARE, é do dono.**

## 2.5 A migração do `SarakScrim`, herdada da `plan-20` item 10

Não foi executada, e a parada foi **correta**: `Inputs/Controls.tsx:124` e `Modals/SarakDrawer.tsx:103`
reimplementam o scrim **com animação** (`motion.div` de opacidade / `transition-opacity`), e o `SarakScrim`
**não anima**. Trocar sem resolver isso **remove animação existente**.

⇒ Dar prop de animação ao `SarakScrim` é **superfície pública nova** ⇒ **PARE e relate.**

**Enquanto isso não fechar, a lib tem três formas de fazer scrim e uma delas se chama "a oficial"** — pior do
que antes de o componente existir.

## 2.6 Os 2 fantasmas que a `plan-21` parou — decididos pelo dono em 2026-08-10

A `plan-21` fechou 16 consumos e **parou em 2**, corretamente: nenhum tinha alvo óbvio. O revisor mediu, o
dono decidiu. **Escopo acrescentado a esta plan** — são 3 linhas de CSS, e abrir plan própria para isso
custaria mais que o conserto.

### `--sarak-elasticity` (2 consumos) ⇒ **APAGAR O BLOCO**

```css
/* _base.css:57-59 — "Motor de Elasticidade (v8.5)" */
--elastic-curve: cubic-bezier(0.175, 0.885, 0.32, calc(1 + var(--sarak-elasticity, 0.2)));
--elastic-scale: calc(1 + (var(--sarak-elasticity, 0.2) * 0.05));
```

> 🔴 **Medição que mudou a decisão:** `--elastic-curve` e `--elastic-scale` têm **ZERO consumidores** em toda a
> base. Não é só o fantasma dentro delas — **as duas declarações não são lidas por ninguém.**

Por isso não é "trocar o fantasma por constante": é **apagar as duas linhas**. Inlinar o `0.2` preservaria
código morto com aparência de vivo. **Zero risco**, porque nada lê o resultado.

### `--animation-speed` (1 consumo) ⇒ **`var(--sarak-anim-normal, 0.4s)`**

```css
/* _utilities.css:21 */
transition: all var(--animation-speed, 0.4s) var(--sarak-ease-main, cubic-bezier(0.4, 0, 0.2, 1)) !important;
```

Os 4 candidatos do schema são degraus de uma escala (`animInstant` 100 · `animFast` 200 · `animNormal` 300 ·
`animSlow` 500), e nenhum é "a velocidade genérica" — foi por isso que a `plan-21` parou. **O dono escolheu
`animNormal`**, o degrau intermediário.

> 🔴 **MUDA PIXEL EM TODOS OS 20 TEMAS, e o revisor errou ao dizer o contrário.** A recomendação inicial
> apresentou o fallback `0.4s` como se preservasse o valor atual. **Não preserva:** o token É emitido, então
> ele sempre vence; o fallback só cobre o caso **sem Provider**.
>
> Emissão real de `--sarak-anim-normal`, medida no snapshot: **300ms** em 17 temas · **500ms** em 1 · **200ms**
> em 1 · **0ms** em 1. Hoje, com o fantasma, todos renderizam **0,4s**.
>
> **Por que a decisão se manteve mesmo assim:** o tema que emite `0ms` está dizendo *"sem animação"* e hoje é
> **ignorado**. Trocar não introduz mudança — **para de ignorar o tema.** `.transition-sarak` é usada em botão
> social, toggle e dropdown; nada crítico.

# 3. Escopo

## 3.1 Dentro

1. **Triar as 23**, uma a uma, abrindo o arquivo. Destino: **marcador** ou **conserto**.
2. **Marcar** as que forem encapsulamento — `@sarak-encapsula <tag> — <razão>`, razão específica do
   componente, nunca copiada.
3. **Consertar** as que forem composição — trocar pelo átomo Sarak, com caracterização antes.
4. **Fechar a migração do `SarakScrim`** (§2.5), ou parar e relatar se exigir prop nova.
5. `composicaoatomica` chega a **0**, ou o que sobrar tem motivo escrito e dono nomeado.
6. **Apagar o "Motor de Elasticidade"** (`_base.css:57-59`) — código morto, §2.6.
7. **`--animation-speed` → `var(--sarak-anim-normal, 0.4s)`** (`_utilities.css:21`) — §2.6. **Muda pixel em
   todos os 20 temas**, decidido pelo dono com o número na mesa.

## 3.2 Fora

- **Os 16 consumos do manifesto** — é a `plan-21`.
- **Criar átomo novo.** Se um conserto exigir um componente que não existe ⇒ **PARE**, como o `SarakScrim` da
  `plan-19` ensinou.
- **Alterar gate.** A `plan-20` deixou o detector pronto; se ele estiver errado, é achado, não conserto.
- **Remover o `ThemeToggle`** sem decisão do dono.

## 3.3 As três saídas por ocorrência

| Saída | Quando | Prova exigida |
|---|---|---|
| **Marcar** | é encapsulamento pelo critério da §2.3 | a razão escrita no marcador **é** a prova, e ela é lida em review |
| **Consertar** | é composição — troca pelo átomo | caracterização antes; foco e teclado preservados |
| **Declarar** | nem um nem outro ⇒ **PARE, é do dono** | motivo escrito, dono nomeado, entra no baseline |

> ⛔ **A tentação desta plan é marcar tudo.** O marcador é barato e zera o número. **Marcar o que não é
> encapsulamento é maquiagem** — e como a razão fica escrita no arquivo, é maquiagem assinada. Na dúvida entre
> marcar e consertar, **relate a dúvida**; ela é mais útil que uma escolha apressada.

# 4. Referências obrigatórias

| Tipo | Onde | Para quê |
|---|---|---|
| Spec fixa | [[00-regras-e-invariantes]] → R10 | o enunciado e a fronteira nova |
| Gate | `gates/scripts/audit/auditor_composicaoatomica.mjs` → `LIMITES DECLARADOS` | os 6 itens, inclusive o ponto cego do marcador por arquivo |
| Plan | [[plan-20-gates-sem-vao]] §11 | a triagem preliminar e por que o 23 é do revisor |
| Plan | [[plan-19-fechar-o-baseline]] §2.3 | por que a fronteira mudou de pasta para papel |
| Spec fixa | [[03-superficie-publica]] | marcar/mover/remover componente mexe no barril |
| **Skill** | `code-adequacao` · `test-unitario` | conserto em `Inputs/` mexe em foco e teclado |

# 5. Instruções de execução

1. **Triagem primeiro, conserto depois.** Apresente as 23 classificadas **antes** de tocar em qualquer uma.
   ⇒ **PARADA OBRIGATÓRIA:** o dono confirma a triagem.
2. Depois da confirmação: **marcar tudo que é marcador** (barato, sem risco) e rodar o audit — o número que
   sobrar é o escopo real de conserto.
3. Consertar em ordem de risco: fora de armadilha de foco primeiro.
4. O `SarakScrim` (§2.5) por último — ele depende de decisão sobre animação.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-22-triar-a-fronteira-de-papel.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/00-regras-e-invariantes.md (R10), specs/arquitetura/03-superficie-publica.md,
o bloco LIMITES DECLARADOS de gates/scripts/audit/auditor_composicaoatomica.mjs,
e a §2 desta plan.
Skills: code-adequacao, test-unitario, padrao-typescript, padrao-escrita.

⚠️ LEIA A PRIMEIRA LINHA DA PLAN. Os 23 NÃO são 23 de dívida — a plan-20 chamou
esses arquivos de "compostos" sem medir, e a triagem do revisor desmentiu. Boa
parte é encapsulamento legítimo e vira marcador, não conserto.

⇒ PARADA OBRIGATÓRIA no passo 1: classifique as 23 (tabela da §2.2 é hipótese,
  não veredito — confirme abrindo CADA arquivo) e apresente ao dono antes de
  tocar em qualquer uma.

O CRITÉRIO (§2.3), e ele não é contagem de nativos:
  É encapsulamento quando a razão de existir do componente é dar forma Sarak a UM
  controle nativo. Sinal forte: remova o nativo e o COMPONENTE PERDE O SENTIDO.
  SarakSelect sem <select> não é nada → encapsulamento.
  SarakRichText sem um botão de toolbar ainda é um editor → composição.

⛔ A TENTAÇÃO DESTA PLAN É MARCAR TUDO. O marcador é barato e zera o número.
   Marcar o que não é encapsulamento é maquiagem — e como a razão fica escrita
   no arquivo, é maquiagem ASSINADA. Na dúvida, RELATE a dúvida.
   Razão do marcador é específica do componente, NUNCA copiada de outro.

DOIS CASOS QUE NÃO SE TRIAM — investigue e pare:
  · ThemeToggle.tsx — a plan-15 mediu LAYOUTS={} vazio e um TODO. É seletor de
    preset MORTO. Antes de marcar ou consertar, pergunte se deveria existir.
    Removê-lo é superfície pública ⇒ PARE, é do dono.
  · SarakScrim (§2.5) — Controls.tsx:124 e SarakDrawer.tsx:103 reimplementam o
    scrim COM ANIMAÇÃO; o SarakScrim não anima. Trocar sem resolver REMOVE
    animação. Dar-lhe prop de animação é superfície pública nova ⇒ PARE e relate.
    Deixe por último.

═══ BLOCO EXTRA — os 2 fantasmas da plan-21, já decididos (§2.6) ═══
São 3 linhas de CSS. Faça-os PRIMEIRO: são baratos e independentes da triagem.

  6. APAGAR src/styles/_base.css:57-59 (o bloco "Motor de Elasticidade").
     NÃO inline o 0.2 — `--elastic-curve` e `--elastic-scale` têm ZERO
     consumidores em toda a base (medido pelo revisor). Inlinar preservaria
     código morto com aparência de vivo. Confirme os zero consumidores antes
     de apagar e cole a prova.

  7. src/styles/_utilities.css:21 — trocar `var(--animation-speed, 0.4s)` por
     `var(--sarak-anim-normal, 0.4s)`.
     ⚠️ ISTO MUDA PIXEL EM TODOS OS 20 TEMAS, e está decidido. Hoje o fantasma
     faz todos renderizarem 0,4s; depois cada tema manda o seu — medido:
     300ms em 17, 500ms em 1, 200ms em 1, e 0ms em 1 (esse fica INSTANTÂNEO,
     e é o tema dizendo "sem animação", hoje ignorado).
     Caracterize `.transition-sarak` antes: botão social, toggle e dropdown.

Depois destes dois, ghostvars fecha em 1 (só o `--x`, declarado desde a plan-15).

LINHAS VERMELHAS:
  · Você NÃO altera gate nenhum. Detector errado é achado, não conserto.
  · Você NÃO cria átomo novo sem decisão do dono.
  · Você NÃO edita specs/specs/, specs/adr/, specs/arquitetura/ nem 00-indice.md
    (a coluna Status é gerada por npm run plan-index desde a plan-20).
  · Você NÃO toca nos 16 consumos do manifesto — é a plan-21.

META: composicaoatomica 23 → 0, ou o que sobrar com motivo escrito e dono nomeado.

Os três espelhos: gates/baselines/ · sarak-dev/ (npm run dev-kit) · sarak-ui/
(npm run guide, se a contagem de componentes mudar).

VERIFICAÇÕES, com a saída colada:
  npm run audit           (ANTES e DEPOIS)
  npx vitest run          (INTEIRA)
  npm run gate-limits:check · npm run dev-kit:check · npm run plan-index:check
  node gates/scripts/release/check-audit-baseline.mjs --with-tsc
  git diff --stat

DECLARE se dist/ mudou e toda baseline que se moveu.

Baseline e espelhos JUNTO. Não commite. Ao terminar, escreva o resumo na própria
plan e mova o status para 🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] As **23** estão classificadas **uma a uma**, com o arquivo aberto — não pela tabela da §2.2.
- [ ] A triagem foi **apresentada ao dono antes** de qualquer conserto.
- [ ] Cada marcador tem **razão específica do componente**; nenhuma razão aparece em dois arquivos.
- [ ] Cada conserto tem **caracterização antes**, e foco/teclado preservados.
- [ ] `ThemeToggle` foi **investigado**, não triado às cegas.
- [ ] O `SarakScrim` fechou **ou** virou parada relatada com o problema da animação descrito.
- [ ] `composicaoatomica` = **0**, ou o resto tem motivo escrito e dono nomeado.
- [ ] **`ghostvars` = 1** (só o `--x`), com os dois itens da §2.6 fechados.
- [ ] **Motor de Elasticidade apagado**, com a prova dos zero consumidores colada — não inlinado.
- [ ] `.transition-sarak` **caracterizada antes** da troca do `--animation-speed`, e a mudança de 0,4s para o
      valor por tema **declarada**, incluindo o tema que vai a `0ms`.
- [ ] `npx vitest run` verde; baseline e espelhos regravados junto.

# 8. Como verificar

```bash
npm run audit                    # composicaoatomica 0, ou o resto declarado
grep -rn "@sarak-encapsula" src/ --include=*.tsx | grep -v __tests__
npx vitest run
npm run gate-limits:check
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
```

# 9. Destino da síntese

`specs/specs/00-regras-e-invariantes.md` (R10 — a fronteira por papel e o que ela revelou) ·
`specs/specs/01-gates-e-baseline.md` (baseline) ·
`specs/arquitetura/03-superficie-publica.md` (`SarakScrim`, `ThemeToggle`, e o que mudar de forma).

# 10. Resumo da execução

## Resumo da execução — 2026-08-10

**Resultado:** Concluído com pendências

**O que foi feito**

Bloco extra (§2.6), antes da triagem, como o prompt mandou:
- `src/styles/_base.css` (removidas linhas 57-59) — apagado o bloco "Motor de Elasticidade" (`--elastic-curve`, `--elastic-scale`). Confirmei zero consumidores com `grep -rn "elastic-curve\|elastic-scale" src/` antes de apagar — só as próprias declarações apareciam.
- `src/styles/_utilities.css:21` — `var(--animation-speed, 0.4s)` → `var(--sarak-anim-normal, 0.4s)`.
- Achado durante a caracterização de `.transition-sarak`: a plan citava 3 consumidores; medi 4 (`SocialButton.tsx`, `ExpandableCard.tsx`, `SarakShellNav.tsx`, além do `ThemeToggle.tsx` morto). Não muda a decisão, corrige o número.
- Achado fora do escopo, não corrigido: `SarakChart.tsx:75` e `SarakManagementGrid.tsx:95` leem `getComputedStyle(...).getPropertyValue('--animation-speed')` em JS — não é o mesmo consumo que o auditor de fantasmas mede (só vê `var()` em CSS). Como `--animation-speed` nunca é setada em lugar nenhum, os dois sempre caem no fallback hardcoded do próprio componente (já estavam "mortos" antes da minha mudança).
- Corrigi a distribuição de `animNormal` por tema que a plan citava (17×300ms/1×200ms/1×500ms/1×0ms = 20): medi diretamente em `src/core/Design/presets/themes/*.ts` e são **18 temas** com `animNormal` declarado (3 arquivos da pasta — `index.ts`, `color-engine.ts`, `reference.ts` — não são temas selecionáveis), com **15×300ms · 1×200ms · 1×500ms · 1×0ms**.

Triagem das 23 (arquivo aberto um a um, não pela tabela §2.2 — duas leituras da tabela não sobreviveram: `SarakSearch` e `SarakUploader`, ver "Decisões e suposições"):

**Grupo A — marcadas (`@sarak-encapsula`), 6 ocorrências, 5 arquivos:**
- `SarakSelect.tsx:39`, `SarakSwitch.tsx:39`, `SarakSlider.tsx:36`, `SarakRangeSlider.tsx:158`, `SarakTimePicker.tsx:63,80` — cada uma com razão específica escrita no JSDoc do componente (nenhuma copiada de outra).

**Grupo B — consertadas (trocadas pelo átomo Sarak), 13 ocorrências, 6 arquivos:**
- `SarakRichText.tsx:121,125` — botões de toolbar → `SarakIconButton` (`variant="ghost" size="sm"`).
- `Controls.tsx:56,77,107,133,138,154` — `LanguageSelector` → `SarakButton`; `ThemeToggle` local (claro/escuro) → `SarakIconButton`; `UserMenu` (trigger + 2 itens) → `SarakButton`; `ModuleSelector` → `SarakButton`.
- `internal/CalendarPanel.tsx:116,143` — botão de dia → `SarakButton size="xs"`; `NavButton` (mês anterior/próximo) → `SarakIconButton`.
- `SarakDatePicker.tsx:106` — trigger do popover → `SarakButton variant="secondary" fullWidth`.
- `SarakMultiSelect.tsx:173` — botão "×" do chip → `SarakIconButton`.
- `SarakSearch.tsx:68` — campo de busca → `SarakInput` com `autoFocus` (troquei o `inputRef.current?.focus()` imperativo, que não funcionaria com `SarakInput` por não ser `forwardRef` — funciona porque `if (!isOpen) return null` já desmonta/remonta o input a cada abertura).

**Grupo C — declaradas (nem marcadas nem consertadas), 4 ocorrências, 3 arquivos:**
- `Buttons/ThemeToggle.tsx:30,51` — dono decidiu remover (é `major`, foi para a `plan-23`). Comentário no código aponta para lá; nada tocado além disso.
- `SarakUploader.tsx:111` — falso positivo do detector (achado, não corrigido): o `<input>` do `react-dropzone` é injetado oculto (`clip:rect(0,0,0,0)`, `position:absolute`, `tabIndex:-1` — medido no bundle da lib), mesma classe do `ChatInput.tsx:117` já isenta pelo item 5 do `LIMITES DECLARADOS`; o detector só olha o token `hidden` no `className`, não pega ocultamento via `style`.
- `SarakMultiSelect.tsx:113` — `SarakInput` não é `forwardRef`; o `inputRef` deste arquivo é lido em `add()`/`remove()` para devolver o foco ao campo após alterar a seleção. Decisão de estender `SarakInput` está aberta na `plan-23 §2.4`. Não contornei com `document.activeElement`.

**`SarakScrim` (§2.5):** não tocado. `Controls.tsx:124` e `SarakDrawer.tsx:102-113` continuam com suas próprias implementações animadas — confirmado pelo dono que a migração + prop de animação foi para a `plan-23`.

**Achados fora do escopo, registrados durante o conserto (não corrigidos):**
- `getComputedStyle` de `--animation-speed` em `SarakChart.tsx`/`SarakManagementGrid.tsx` (acima).
- A distribuição de `animNormal` por tema que a plan citava estava desatualizada (corrigida acima, é achado sobre o TEXTO da plan, não sobre código).

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/styles/_base.css` | alterado | Removido o bloco "Motor de Elasticidade" (3 linhas) |
| `src/styles/_utilities.css` | alterado | `--animation-speed` → `--sarak-anim-normal` em `.transition-sarak` |
| `src/components/atomic/Inputs/SarakSelect.tsx` | alterado | Marcador `@sarak-encapsula select` |
| `src/components/atomic/Inputs/SarakSwitch.tsx` | alterado | Marcador `@sarak-encapsula input` |
| `src/components/atomic/Inputs/SarakSlider.tsx` | alterado | Marcador `@sarak-encapsula input` |
| `src/components/atomic/Inputs/SarakRangeSlider.tsx` | alterado | Marcador `@sarak-encapsula input` |
| `src/components/atomic/Inputs/SarakTimePicker.tsx` | alterado | Marcador `@sarak-encapsula select` |
| `src/components/atomic/Inputs/SarakRichText.tsx` | alterado | 2 botões de toolbar → `SarakIconButton` |
| `src/components/atomic/Inputs/Controls.tsx` | alterado | 6 botões → `SarakButton`/`SarakIconButton` |
| `src/components/atomic/Inputs/internal/CalendarPanel.tsx` | alterado | Botão de dia → `SarakButton`; `NavButton` → `SarakIconButton` |
| `src/components/atomic/Inputs/SarakDatePicker.tsx` | alterado | Trigger → `SarakButton`; removido `triggerRef` morto |
| `src/components/atomic/Inputs/SarakMultiSelect.tsx` | alterado | Botão "×" do chip → `SarakIconButton`; comentário de declaração em `:113` |
| `src/components/atomic/Inputs/SarakSearch.tsx` | alterado | Input → `SarakInput` com `autoFocus`; removido `inputRef` |
| `src/components/atomic/Inputs/SarakUploader.tsx` | alterado | Comentário de declaração (falso positivo do gate) |
| `src/components/atomic/Buttons/ThemeToggle.tsx` | alterado | Comentário de declaração (destino: `plan-23`) |
| `src/components/atomic/Inputs/__tests__/Controls.test.tsx` | alterado | Smoke test → 4 testes reais (idiomas, toggle, menu, módulos) |
| `src/components/atomic/Inputs/__tests__/SarakSearch.test.tsx` | alterado | Smoke test → 4 testes reais (fechado, autofoco, digitação, Esc) |
| `src/components/atomic/Inputs/internal/__tests__/CalendarPanel.test.tsx` | alterado | Assertão trocada de `getByText` p/ `getByRole('gridcell')` (o texto agora fica num `<span>` interno do `SarakButton`) |
| `gates/baselines/audit-baseline.json` | alterado | Regravado via `npm run audit:baseline -- --write`: `ghostvars` 4→1, `composicaoatomica` 23→4 |
| `sarak-dev/state.json`, `GUIA-MANUTENCAO.md`, `START-HERE.md` | alterado | Regravado via `npm run dev-kit` (espelho do mantenedor) |

**Verificações executadas**
- `npm run audit` (ANTES): `composicaoatomica` 23 ocorrências em 13 arquivos; `ghostvars` 4 consumos (`--sarak-elasticity` ×2, `--animation-speed` ×1, `--x` ×1).
- `npm run audit` (DEPOIS): `hardcoded` → `[OK]` (0/0); `ghostvars` → 1 consumo (só `--x`); `composicaoatomica` → 4 ocorrências declaradas (`ThemeToggle.tsx` ×2, `SarakMultiSelect.tsx` ×1, `SarakUploader.tsx` ×1); demais 7 auditores → `[OK]`.
- `npx vitest run` (suíte inteira) → **296 arquivos / 1073 testes, todos verdes**, 0 falhas.
- `npm run gate-limits:check` → `[OK]` 26/26 scripts.
- `npm run dev-kit:check` → defasado em 3 arquivos antes de eu rodar `npm run dev-kit`; depois → `[OK]` em dia.
- `npm run plan-index:check` → `[OK]` sem tocar em `00-indice.md`.
- `npm run catalog:check` / `npm run guide:check` → `[OK]` em dia (contagem de componentes não mudou — 81 — então `sarak-ui/` não precisou regenerar).
- `npm run barrel:check` → `[OK]` 81 componentes, 0 faltas.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `[audit:baseline] igual ao baseline de 2026-08-10 — nenhuma regressão.`
- `git diff --stat` (arquivos desta plan) → 461 inserções / 236 deleções em 21 arquivos de `src/` + testes + baseline + espelho do dev-kit. Não toquei em `dist/` (não versionado neste worktree) nem em `sarak-ui/` (contagem de componentes inalterada).

**Critérios de aceite**
- [x] As 23 estão classificadas uma a uma, com o arquivo aberto — evidência: leituras de cada arquivo nesta conversa; 2 divergências da tabela §2.2 registradas e confirmadas pelo dono (`SarakSearch`, `SarakUploader`).
- [x] A triagem foi apresentada ao dono antes de qualquer conserto — evidência: mensagem de parada anterior a qualquer `Edit`/`Write` em arquivo de produção.
- [x] Cada marcador tem razão específica; nenhuma repetida — evidência: 5 arquivos do Grupo A, texto único em cada um.
- [x] Cada conserto tem caracterização antes, foco/teclado preservados — evidência: testes rodados antes/depois por arquivo; `autoFocus` preserva o comportamento do `SarakSearch`; `tabIndex`/`data-iso`/`role=gridcell` preservados via spread no `CalendarPanel`.
- [x] `ThemeToggle` foi investigado, não triado às cegas — evidência: achado de `LAYOUTS={}` + zero consumidor interno + export público, decisão do dono registrada (remover, na `plan-23`).
- [x] `SarakScrim` fechou OU virou parada relatada — evidência: não tocado; dono confirmou destino `plan-23`.
- [x] `composicaoatomica` = 0 ou resto com motivo escrito e dono nomeado — evidência: 4 ocorrências, cada uma com comentário no código + dono/decisão citados na tabela do Grupo C acima.
- [x] `ghostvars` = 1 (só `--x`) — evidência: saída do `npm run audit` (DEPOIS).
- [x] Motor de Elasticidade apagado, com prova dos zero consumidores colada — evidência: `grep` citado acima.
- [x] `.transition-sarak` caracterizada antes da troca, mudança declarada incl. tema em 0ms — evidência: 4 consumidores medidos (corrige a plan); distribuição de `animNormal` remedida (18 temas: 15×300/1×200/1×500/1×0ms).
- [x] `npx vitest run` verde; baseline e espelhos regravados junto — evidência: 296/296 arquivos, 1073/1073 testes; `audit-baseline.json` e `sarak-dev/` regravados nesta execução.

**Decisões e suposições**
- **`SarakUploader.tsx:98` — dono decidiu NÃO marcar** (correção à minha proposta original de marcar): é falso positivo do detector (input oculto por `style`, não por `className`), não encapsulamento nem composição. Declarado com a medição do bundle do `react-dropzone` colada no comentário.
- **`SarakSearch.tsx:68` — confirmada minha divergência da tabela §2.2**: é composição (command palette), não encapsulamento. Conserto trocou `<input>` por `SarakInput`.
- **`SarakInput` reafirma sempre um `border` via `getInputStyles`** (não dá pra zerar por `style`, porque o hook é aplicado DEPOIS do `style` do consumidor no merge interno do átomo) — o campo de busca do `SarakSearch` ganha uma borda visível que não tinha antes. Não é regressão funcional (foco/teclado/digitação preservados, testado), é mudança visual aceita como custo da composição atômica — não há como neutralizar sem estender o átomo, fora do escopo.
- **`SarakMultiSelect:173` (botão "×" do chip) cresce de 16px para 24px** (o preset `xs` do `SarakIconButton`): forçar `1rem`/`9999px` via `style` seria hardcode duro (R7) sem token equivalente disponível — aceitei o tamanho do preset em vez de inventar um valor cru.
- **Onde não havia token exato, usei o mais próximo já existente na base**, em vez de inventar CSS var nova (fora do escopo — "você NÃO cria átomo novo"): `var(--sarak-type-scale-xl, 20px)` para o texto do `SarakSearch` (era `1.125rem`/18px cru); `var(--sarak-layout-gap-md,16px)` reaproveitado como medida em vários botões.
- **Corrigi `var(--theme-main)` → `var(--theme-primary)`/`var(--theme-muted)`/`var(--text-main)` conforme o caso** em `Controls.tsx`: a classe Tailwind original `text-theme-main` referenciava uma variável (`--theme-main`) que nunca foi declarada em lugar nenhum — um fantasma pré-existente que só ficou invisível ao auditor porque estava dentro de uma classe Tailwind, não de um `var()` literal. Ao mover para `style` (necessário para vencer a cascata do átomo) o fantasma virou visível; troquei pelo token real (`--text-main`, declarado em `_colors.css:13`) em vez de manter o nome errado.
- **Cor do dia selecionado no `CalendarPanel` e do módulo ativo no `ModuleSelector`**: troquei o `text-white` original por `var(--color-theme-on-primary, #020617)` (o mesmo token que `SarakIconButton` já usa para texto sobre fundo `primary`) — evita texto branco ilegível em temas com `primary-color` claro. É uma mudança de comportamento pequena, não só de forma: declarada aqui porque muda a saída visual em temas de fundo primary claro (nenhum bug hoje, porque todos os temas medidos usam `primary-color` escuro o suficiente para branco funcionar).

**Achados fora do escopo (não corrigidos)**
- `SarakChart.tsx:75` e `SarakManagementGrid.tsx:95` leem `--animation-speed` via `getComputedStyle` em JS — variável nunca setada, sempre caem no fallback hardcoded do próprio componente. Não é o mesmo mecanismo que o auditor de fantasmas mede (só CSS `var()`), então não conta para `ghostvars`, mas é código morto na prática. Sugestão: plan nova, fora desta.
- A tabela de distribuição de `animNormal` por tema citada na §2.6 da plan estava com números levemente desatualizados (17×300/20 total vs. os 18×.../15×300 que medi agora). Não muda a decisão do dono, só o número — registrado acima.

**Pendências / riscos**
- **`SarakScrim`/`Controls.tsx:124`/`SarakDrawer.tsx` seguem com 3 formas de fazer scrim** — migração + prop de animação ficou para a `plan-23`, como o dono confirmou.
- **`SarakMultiSelect:113`** segue com `<input>` cru — depende da decisão sobre `forwardRef` em `SarakInput`, aberta na `plan-23 §2.4`.
- **`Buttons/ThemeToggle.tsx`** segue exportado no barril público, morto — a remoção é `major` e está agrupada na `plan-23`.
- **`SarakUploader.tsx:111`** segue como violação viva no `run_audit` (é o detector que está com ponto cego, não o código) — não é dívida de código, mas o número "4" no baseline inclui essa 1 ocorrência que nunca vai ser "corrigida" sem mexer no gate (fora do escopo desta plan).
- Não tenho como verificar visualmente (sem navegador) os deltas de estilo que caracterizei por leitura de código: o `SarakButton size="xs"` no grid de dias do `CalendarPanel` (padding neutralizado via `style`), o trigger do `SarakDatePicker` (ícone pode inverter de lado sob `buttonIconPosition: 'right'`), e a borda nova no `SarakSearch`. Recomendo QA visual antes de publicar.

# 11. Veredito

*(a preencher pelo revisor)*
