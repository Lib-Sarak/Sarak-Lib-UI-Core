---
tipo: "plan"
titulo: "Triar a fronteira de papel — os 23 que a R10 passou a ver, e o scrim que falta migrar"
dominio: "Sarak-Lib-UI-Core / Qualidade / Dívida"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "r10", "encapsulamento", "divida", "scrim"]
relacionados: ["[[00-regras-e-invariantes]]", "[[plan-20-gates-sem-vao]]", "[[plan-19-fechar-o-baseline]]", "[[03-superficie-publica]]"]
depende_de: "plan-20"
objetivo: "Triar os 23 de R10 entre encapsulamento e dívida real, e fechar a migração do SarakScrim"
destino_sintese: "specs/specs/00-regras-e-invariantes.md · specs/specs/01-gates-e-baseline.md · specs/arquitetura/03-superficie-publica.md"
---

> ⚠️ **Esta plan existe por um erro do revisor, e vale dizer isso na primeira linha.** A `plan-20` afirmou que
> os arquivos das pastas antes isentas eram *"compostos"* — **por nome, sem medir**. A triagem no veredito
> desmentiu: vários são encapsulamento legítimo. **Os 23 não são 23 de dívida.**

# 1. Objetivo

**Cada uma das 23 ocorrências recebe um destino medido** — marcador de encapsulamento **ou** conserto — e a
migração do `SarakScrim` fecha.

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

# 3. Escopo

## 3.1 Dentro

1. **Triar as 23**, uma a uma, abrindo o arquivo. Destino: **marcador** ou **conserto**.
2. **Marcar** as que forem encapsulamento — `@sarak-encapsula <tag> — <razão>`, razão específica do
   componente, nunca copiada.
3. **Consertar** as que forem composição — trocar pelo átomo Sarak, com caracterização antes.
4. **Fechar a migração do `SarakScrim`** (§2.5), ou parar e relatar se exigir prop nova.
5. `composicaoatomica` chega a **0**, ou o que sobrar tem motivo escrito e dono nomeado.

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

*(a preencher pelo executor)*

# 11. Veredito

*(a preencher pelo revisor)*
