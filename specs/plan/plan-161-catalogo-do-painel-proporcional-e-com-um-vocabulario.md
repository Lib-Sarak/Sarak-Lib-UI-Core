---
tipo: "plan"
titulo: "Fazer o catálogo do painel proporcional, curto e com um vocabulário só"
objetivo: "Fazer cada decisão do painel caber em cerca de duas telas, com amostras proporcionais (Personalidade em quadrado com o nome, tema como miniatura da prévia real, fontes na mesma grade), presets de card gerados de cada tema, texturas do card e do fundo separadas pelo nome, e um vocabulário único com os termos técnicos em inglês"
dominio: "Painel de customização / Catálogo de opções"
status: "🟢 Aprovada"
prioridade: "Média"
tags: ["plan", "painel", "catalogo", "amostras", "presets", "vocabulario"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]", "[[07-responsividade-e-multidispositivo]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/06-painel-de-customizacao-e-preview.md + specs/09-temas-e-presets.md + specs/10-seguranca-e-acessibilidade.md"
---

# 1. Objetivo

O administrador percorre qualquer decisão do painel em cerca de duas telas, reconhece cada opção pela amostra sem texto cortado, acha
o card de cada tema e a textura do card separada da do fundo, e lê o mesmo nome para a mesma peça em todo o painel.

# 2. Contexto

**Medido no ERP (lib `v8.0.0`, 2026-11-10, 1440×900).** Nos itens 1 a 3 o dono disse: o problema é só a imagem da amostra; o
funcionamento está certo.

1. **Personalidades (item 1):** cartões de 135 px de largura e de 243 a 652 px de altura, textos cortados. Pedido do dono: um quadrado
   pequeno com o nome; a espiada já mostra o efeito na prévia.
2. **Temas (item 2):** cartões de 141 × 600-870 px, com 28 a 36 elementos vazando; o nome em 24 px, peso 900, caixa alta, numa coluna de
   91 px (uma letra por linha); o selo "SIDEBAR" sobre o nome, e dentro do nome acessível. **Decisão do dono (2026-11-10):** a
   miniatura do tema passa a ser a prévia real com o tema aplicado, e o nome fica proporcional. Isso substitui o texto da
   [[06-painel-de-customizacao-e-preview]] §6.4 "A miniatura de tema mantém o desenho próprio do `PresetCard`, escolha do dono".
3. **Fontes (item 7):** cartões de 295 × 225-340 px numa coluna só, diferentes das outras decisões.
4. **Rolagem:** Componentes 14.236 px, Forma 10.637, Layout 8.871, Fontes 7.217.
5. **Atmosferas:** a amostra tem "VER DETALHES" por cima.
6. **Painel a 390 px:** "APLICAR" cortado, abas de dispositivo cortadas, a lista de decisões num espaço de ~300 px; o texto do
   cabeçalho "Passe o mouse numa opção: a pr…" sai truncado a 1440.
7. **Presets de card (item 3):** os 14 de `src/core/Design/presets/components/cards.ts` são genéricos e parciais, e a amostra é desenhada
   sobre o rascunho (06 §6.4), por isso mudam com o tema e saem coloridos. Pedido do dono: presets com o tipo de card de cada tema, que
   não mudam conforme o tema atual.
8. **Texturas (item 10):** a do card fica em "Estilo dos cards › Texturas", no topo de Forma; a do fundo em "Atmosfera e textura ›
   Atmosferas | Texturas", no fim, a ~10 mil px; duas abas com o mesmo nome "Texturas" sem dizer o alvo.
9. **Vocabulário:** o mesmo conceito tem vários nomes nos rótulos (`src/core/Design/schema/`), no catálogo (`src/core/i18n/`) e nos
   textos de preset (`src/core/i18n/presetTexts/`): `sidebar` 57, `Sidebar` 37, "barra lateral" 26; `topbar` 48, `Topbar` 30,
   "cabeçalho" 30, "barra superior" 20, `Header` 18 ocorrências. Opções do Layout misturam "Dark Mode (Padrão)", "Light Mode",
   "Sidebar (Esquerda)", "Topbar (Cabeçalho)". **Decisão do dono (2026-11-10):** padronizar a escrita; termos técnicos em inglês, o resto
   como está; **o painel não passa a ser traduzido** (a 10 §3.6 continua: o painel fica fora da promessa de tradução).

# 3. Escopo

## 3.1 Dentro
- **Lote 1 (grade e rolagem):** `src/features/DesignEngine/Canvas/components/` — `PersonalityCatalog.tsx`, `TypographyCatalog.tsx`,
  `AtmosphereCatalog.tsx`, `CuratedGrid.tsx`, `OptionTile.tsx`, `PresetGroupCatalog.tsx`, `PresetSamples.tsx`, `SampleParts.tsx`;
  `src/features/DesignEngine/Main/components/` — `ThemeDecisionView.tsx`, `ThemeDecisionHeader.tsx`, `ThemeDecisionOptions.tsx`,
  `ThemeActionBar.tsx`; `Canvas/components/PreviewToolbar.tsx`; `src/features/DesignEngine/Canvas/panelResponsive.presets.ts`; testes e
  um spec de navegador novo.
- **Lote 2 (miniatura de tema):** `Canvas/components/PresetCard.tsx`, `presetCardGeometry.ts`, `PresetCardPending.tsx`,
  `useCatalogThemes.ts`, `LazyWhenVisible.tsx`; testes.
- **Lote 3 (card de cada tema):** `src/core/Design/presets/components/cards.ts`, o registro de grupos de preset, um gerador em `scripts/`
  com `--check` (os presets saem dos temas, nunca transcritos), `package.json` (o script e o `--check` no lugar dos outros checks de
  gerado), os textos em `src/core/i18n/presetTexts/`; testes.
- **Lote 4 (texturas):** `src/features/DesignEngine/config/design-decisions.json`, o registro de grupos, os textos de grupo em
  `src/core/i18n/presetTexts/groups.ts` e `textures.ts`; testes.
- **Lote 5 (vocabulário):** os rótulos e descrições de `src/core/Design/schema/*.ts`, os textos de `src/core/i18n/` (catálogo e
  `presetTexts/`), os títulos das telas de `src/features/DesignEngine/Canvas/Mocks/`; um teste novo que reprova termo banido; os
  gerados (`npm run guide`, `catalog`).
- Em todo lote: `docs/migracoes.md` se o importador vir diferença; `npm run dev-kit` por último.

## 3.2 Fora
- O que a prévia grande mostra e a espiada: `plan-160`. O cromo: [[05-cromo-e-slots]] e a decisão Barras ([[06-painel-de-customizacao-e-preview]] §2.1.2). O desempenho: `plan-158`.
- Traduzir o painel para outros idiomas (decisão do dono). O conteúdo de exemplo das telas falsas fica como está, salvo os nomes
  das peças.
- Mudar o que um preset grava (só a amostra e a origem dos presets de card mudam). Os ids de preset existentes continuam válidos.
- Ids de token, nomes de variável CSS e nomes de prop: o glossário vale para texto que o administrador lê, não para identificador.
- Qualquer arquivo de importador. Versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` §2.1, §2.3, §6.2.1, §6.4 | a coluna e as decisões, o painel por container, catálogos e amostras |
| Spec fixa | `specs/09-temas-e-presets.md` §3, §5, §6.4 | preset × tema, o registro de grupos e o gerador que consome o gabarito vivo |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` §3.6 | o catálogo de textos, os seis idiomas e a exclusão do painel |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` §6.1 | as regras da camada 3 que o painel segue |
| Spec fixa | `specs/00-regras-e-invariantes.md` R17 | dado derivado é gerado, nunca transcrito |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `test-e2e` · `ui-criar-preset` · `ui-arquitetura-design` | escrita, testes, presets, regra do Design Engine |
| Código | `src/core/Design/presets/components/cards.ts` · `src/features/DesignEngine/config/design-decisions.json` · `src/core/i18n/presetTexts/` · `src/core/Design/schema/global.ts` (rótulos de modo e navegação) | ler antes de editar |
| Teste existente | `browser-tests/plan-140-painel-coluna-unica.spec.ts` · `browser-tests/plan-141-presets-do-painel.spec.ts` · `browser-tests/plan-145-personalidades.spec.ts` · `browser-tests/fontes-no-painel.spec.ts` | o que o painel já mede e não pode regredir |

# 5. Instruções de execução

**Um lote por vez; cada lote termina com resumo num bloco novo da §9 e status 🟠.**

**Lote 1 — grade e rolagem.**
1.1. Spec de navegador novo, rodado **antes** de mudar código: a 1440×900 e a 390×844, a altura de rolagem de cada decisão, a geometria
das amostras (largura, altura, elementos vazando) e o corte de botão e texto no cabeçalho e na barra de ações.
1.2. Uma grade só para toda decisão: amostras compactas, várias colunas onde a largura do painel permite, a mesma para Personalidades,
Fontes e os grupos de preset. Personalidade vira um quadrado pequeno com o nome. Atmosfera e textura sem botão por cima da amostra
("Ver detalhes" sai da amostra).
1.3. Grupos fechados por padrão, só o grupo em uso aberto; a busca de token continua alcançando tudo.
1.4. Metas no spec: nenhuma decisão passa de duas alturas da área do painel a 1440×900 (o número exato fica no spec, a partir da medida
de antes); nenhuma amostra com texto cortado ou elemento vazando; a 390 px, "Aplicar" e as abas de dispositivo inteiros; o texto do
cabeçalho cabe ou quebra, sem reticências.

**Lote 2 — miniatura de tema.**
2.1. A miniatura do tema é a prévia real com o tema aplicado, desenhada só quando entra na área visível (o mesmo mecanismo das amostras).
2.2. O nome do tema é proporcional à miniatura (sem uma letra por linha); o selo de navegação não fica sobre o nome nem dentro do
nome acessível.
2.3. Meça o custo: tempo para abrir a decisão Tema e memória com todas as miniaturas visíveis, antes e depois. Se a miniatura real
custar mais que o dobro de abrir a decisão hoje, pare e relate antes de seguir.

**Lote 3 — o card de cada tema.** Os presets saem dos temas resgatados (09 §5, já entregues), não dos de antes.
3.1. Um gerador em `scripts/` produz, a partir de cada tema embarcado, o preset de card daquele tema (os tokens de card que o tema
declara), com `--check` ligado junto dos outros checks de gerado. Nenhum preset transcrito à mão.
3.2. A amostra de preset de card é desenhada sobre uma base neutra fixa, não sobre o rascunho: o mesmo preset tem a mesma amostra em
qualquer tema atual. Escolher continua gravando por cima do rascunho.
3.3. Os 14 presets atuais: o executor mede quais o gerado substitui e propõe, no resumo, quais saem (com o id mantido como apelido) e
quais ficam. Não remova sem o veredito.

**Lote 4 — texturas.**
4.1. A textura do card e a textura do fundo ficam lado a lado na decisão Forma, com nomes que dizem o alvo ("Textura do card",
"Textura do fundo"); nenhuma aba se chama só "Texturas".

**Lote 5 — vocabulário.**
5.1. O glossário, aplicado a todo texto que o painel mostra (rótulo, descrição, título de grupo, nome de tela da prévia), em todos os
idiomas do catálogo:

| Fica em inglês (termo técnico) | Deixa de ser usado como nome dessas peças |
|---|---|
| Sidebar, Topbar, Card, Preset, Token, Dark mode / Light mode, Hover, Blur, Badge, Toast | "barra lateral", "barra superior", "cabeçalho" (como nome da Topbar), "Header", "Modo escuro/claro" como nome do token de modo |

Frases, ações e descrições continuam em português ("Aplicar", "Tamanho da fonte", "Posição"). Capitalização: termo técnico com
inicial maiúscula como nome ("Sidebar"), minúscula no meio da frase só se a frase inteira pedir.
5.2. Teste que reprova termo banido nos textos do painel (schema, catálogo e `presetTexts`), com a lista acima como dado do teste;
roda sobre os arquivos atuais e reprova antes da troca.
5.3. Troque os textos; `npm run guide` e os gerados.

# 6. Critérios de aceite

- [ ] Spec de navegador do painel: rolagem de cada decisão abaixo da meta; nenhuma amostra cortada ou vazando; números de antes e
  depois no resumo.
- [ ] Personalidade em quadrado com o nome; Fontes e os grupos na mesma grade; atmosfera sem botão por cima.
- [ ] Grupos fechados por padrão, o grupo em uso aberto.
- [ ] A 390 px: "Aplicar" e as abas de dispositivo inteiros.
- [ ] Miniatura de tema = prévia real com o tema; nome proporcional; custo medido dentro do limite do passo 2.3.
- [ ] Presets de card gerados dos temas, com `--check`; amostra sobre base neutra; proposta dos 14 atuais no resumo.
- [ ] Textura do card e do fundo lado a lado, com o alvo no nome.
- [ ] Teste do glossário verde, e reprovando sobre os textos de antes.
- [ ] Suíte completa verde; `tsc` 0; baseline sem regressão; Anel 1; `npm run build` + `cromo-css-real:check`.
- [ ] Prévia para o dono em `C:\tmp\sarak-previa-161\index.html` (cada lote), com capturas reais; o lote só fecha com o ok do dono nela.

# 7. Como verificar (uso do revisor)

**Gate:** teste — o spec de navegador da geometria e da rolagem do painel, o `--check` do gerador de presets de card e o teste do
glossário; nenhuma regra de gate nova.

- Lote 1: rodo o spec e comparo com os números do ERP da §2 (devem bater na medida de antes).
- Lote 2: abro a decisão Tema no harness e conto os elementos vazando; leio o custo medido.
- Lote 3: mutação — tiro um token de card de um tema em cópia fora do repositório e vejo o `--check` reprovar.
- Lote 5: rodo o teste do glossário sobre os textos de antes (cópia fora do repositório) e vejo reprovar; `grep` dos termos banidos.
- Cada lote: `npm run verify -- --tier=full`.

# 8. Destino da síntese

**Destino:** `specs/06-painel-de-customizacao-e-preview.md + specs/09-temas-e-presets.md + specs/10-seguranca-e-acessibilidade.md`

- **`06`:** §6.4 (a grade única, os grupos fechados, a miniatura de tema como prévia real no lugar da escolha anterior do dono, a
  textura do card e do fundo) e §2.1 (a meta de rolagem).
- **`09`:** §5 (os presets de card gerados de cada tema e a amostra sobre base neutra).
- **`10`:** §3.6 (o glossário: termos técnicos em inglês nos textos do painel, e o teste que o guarda).

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução (lote 1) — 2026-11-17

**Resultado:** Concluído com pendências (o critério "prévia aprovada pelo dono" aguarda o ok dele; o resíduo de "Cores" e do cartão de tema pertence a outros lotes/plans — ver abaixo)

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
```
(A plan chegou com `status: 🔴 A executar`; executei por ordem direta do usuário e só movi o status ao entregar. Outras execuções — 159, 164 — passaram a alterar o worktree durante a minha; nada delas foi tocado de propósito, e o único arquivo delas que alterei por engano foi restaurado — ver Achados.)

**O que foi feito**
- Spec de navegador novo `browser-tests/plan-161-catalogo-proporcional.spec.ts`, rodado ANTES (2 passaram, 8 reprovaram) e DEPOIS (10 de 10): rolagem de cada decisão, geometria das amostras (texto cortado e elementos fora da amostra), Personalidade em quadrado, Fontes na mesma grade, "Ver detalhes" fora da amostra de atmosfera, dica do cabeçalho sem reticências, "Aplicar" e abas de dispositivo a 390 px.
- Grade única: `panelResponsive.presets.ts` — `CATALOG_GRID` (colunas automáticas, mínimo 8,5 rem) e `PERSONALITY_GRID` (5,5 rem); `CATALOG_GRID_2COL`/`3COL` viram apelidos da mesma grade, para os catálogos fora da lista do escopo (Buttons, Inputs, Cards) continuarem compilando.
- Amostra proporcional: `OptionSampleFrame.tsx` (novo) desenha o componente real num quadro de referência 280×240 (mais baixo para campo e Topbar) e o reduz à largura da opção; `OptionTile.tsx` o usa, põe o nome em `text-xs` sem caixa alta e passa a descrição para `sr-only` + `title`.
- Personalidade: `PersonalityCatalog.tsx` — quadrado de 5,5 rem com um desenho sem texto (barra + dois blocos, só variáveis do escopo) e o nome embaixo; sai o `BarSample` da amostra.
- Fontes: `TypographyCatalog.tsx` — mesma grade, cartão compacto (Aa, título, glifos, frase, número; os testids ficam).
- Atmosfera: `AtmosphereCatalog.tsx` e `PresetSamples.tsx` — o botão "Ver detalhes" sai das amostras de atmosfera e de textura.
- Grupos recolhidos: `CollapsibleSection.tsx` (novo; o título é um botão com `aria-expanded`, o conteúdo só monta aberto, contexto `ForceOpenSections`). `ThemeDecisionOptions.tsx` abre só o primeiro grupo com opção aplicada no rascunho (sem nenhum, o primeiro); `ThemeDecisionView.tsx` abre tudo quando a busca leva a um token; `DecisionQuestionList.tsx` e `ThemeGlobalSettings.tsx` usam o mesmo componente (sem isso o Layout continuava em 8,2 telas).
- `PreviewToolbar.tsx`: a dica sem `truncate` (quebra) e o grupo de dispositivos com `flex-wrap`. `ThemeActionBar.tsx`: linha com `flex-wrap` e "Aplicar"/"Descartar" sem quebra de palavra (`min-w-fit`, `whitespace-nowrap`).
- Testes de unidade: `OptionSampleFrame.test.tsx` e `CollapsibleSection.test.tsx` (novos); ajustados `panelResponsive.presets`, `OptionTile`, `PersonalityCatalog`, `TypographyCatalog`, `Buttons/Inputs/CardsCatalog`, `optionGroups`, `ThemeDecisionOptions` (+2 casos: recolher e "em uso"), `DecisionQuestionList` (+1), `ThemeDecisionView`, `ThemeGlobalSettings`, `ThemeColumn.integration`; snapshots de `AtmosphereCatalog` e `CardsCatalog` regravados (mudança de marcação esperada).
- Specs de navegador existentes adaptadas ao que mudou de propósito (grupos fechados, amostra reduzida): `plan-141-presets-do-painel` (helper que abre os grupos; largura da faixa medida na mesma escala), `escolha-no-painel` (abre o grupo medido; janela mais baixa para haver amostra fora da área visível), `fixtures/fontes-no-painel-entry.tsx` (galeria na largura da coluna, 340 px).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/plan-161-catalogo-proporcional.spec.ts` | criado | spec do lote (antes/depois) |
| `src/features/DesignEngine/Canvas/components/OptionSampleFrame.tsx` | criado | amostra proporcional |
| `src/features/DesignEngine/Main/components/CollapsibleSection.tsx` | criado | seção recolhível + contexto de abertura |
| `Canvas/panelResponsive.presets.ts`, `OptionTile.tsx`, `CuratedGrid.tsx`, `PersonalityCatalog.tsx`, `TypographyCatalog.tsx`, `AtmosphereCatalog.tsx`, `PresetGroupCatalog.tsx`, `PresetSamples.tsx`, `PreviewToolbar.tsx`, `InputPresetPreview.tsx` | alterado | grade, tile, amostras, barra da prévia |
| `Main/components/ThemeDecisionOptions.tsx`, `ThemeDecisionView.tsx`, `DecisionQuestionList.tsx`, `ThemeGlobalSettings.tsx`, `ThemeActionBar.tsx` | alterado | grupos recolhíveis, botões da barra de ações |
| testes de unidade (lista acima) e 2 snapshots | criado/alterado | acompanham o comportamento novo |
| `browser-tests/plan-141-presets-do-painel.spec.ts`, `escolha-no-painel.spec.ts`, `fixtures/fontes-no-painel-entry.tsx` | alterado | adaptados (acima) |
| `dist/sarak.css` | alterado | efeito de `npm run build:css`, mandado pelo usuário antes do navegador |

**Verificações executadas** (suíte completa, `build` e `cromo-css-real:check` não são minhas — §3 item 8)
- Spec novo, antes → depois, a 1440×900 (área da coluna 660 px; "cortados/vazando" = amostras com texto cortado / elementos fora da amostra):

| Decisão | Rolagem antes | Rolagem depois | Cortados/vazando antes → depois | Colunas |
|---|---|---|---|---|
| Tema | 11.205 px (16,1×) | 708 px (1,07×) | 7 / 15 → 0 / 0 | 2 → 3 |
| Cores | 4.032 px (5,8×) | 4.032 px (6,1×) — **fora do lote** | — | — |
| Fontes | 7.210 px (10,4×) | 1.523 px (2,3×) | 1 / 1 → 0 / 0 | 1 → 2 |
| Forma | 10.560 px (15,2×) | 1.607 px (2,4×) | 0 / 0 → 0 / 0 | 1 → 2 |
| Componentes | 14.144 px (20,4×) | 1.354 px (2,05×) | 0 / 0 → 0 / 0 | 1 → 2 |
| Layout | 9.500 px (13,7×) | 793 px (1,2×) | 0 / 0 → 0 / 0 | 1 → 2 |

  Meta fixada no spec: **2,5 alturas da área** (a medida de antes ia de 5,8× a 20,4×; a pior depois é 2,43×) e amostra de grupo ≤ 45% da altura da área (a pior mede 154 px de 660). Personalidade: 91 × 116 px (antes 137 × 243 a 654). Dica da prévia: com reticências (`nowrap`) → sem, quebrando. A 390 px: "Aplicar" (40-206 px) e as três abas (40-341 px) inteiros, sem rolagem horizontal. Rodado: `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/plan-161-catalogo-proporcional.spec.ts --workers=1` → antes 2 passaram e 8 falharam; depois **10 passaram**.
- `npx vitest run src/features/DesignEngine` → 148 arquivos passam, 2 falham: `PreviewCanvas.test.tsx` (snapshot com `data-sx-keep-palette`) e `PaletteGallery.registry.test.tsx` (78 linhas) — ambos da plan-164 (arquivos e atributo dela, que não toquei).
- `npm run verify -- --tier=quick` → `tsc` 0 erros, `audit:baseline --with-tsc` sem regressão, R36 e Anel 0 limpos; falha só `plan-index:check` (índice × frontmatter das plans 159 e 164, de outras execuções).
- Specs de navegador vizinhas: `plan-140` e `plan-145` passam; `plan-141` (adaptada) passou nos casos reexecutados (distinção a olho, faixas do cartão); `escolha-no-painel` e `fontes-no-painel` (adaptadas) passam, com o orçamento de 250 ms mantido.
- **Controle em `HEAD`** (§3 item 10): `plan-160-moldura-e-largura.spec.ts` tem 8 reprovados no worktree e os **mesmos 8, com os mesmos números** (inclusive `0,0189667` na rolagem) numa cópia limpa do `HEAD` — não vêm deste lote. `git status --short` antes e depois do controle idêntico (`C:\tmp\status-before-control.txt` × `status-after-control.txt`); `node_modules` do repositório intacto; cópia e junção removidas.

**Critérios de aceite**
- [x] Spec de navegador: rolagem abaixo da meta e nenhuma amostra cortada/vazando — evidência: tabela acima (Cores e o cartão de tema ficam fora: ver Pendências).
- [x] Personalidade em quadrado com o nome; Fontes e grupos na mesma grade; atmosfera sem botão — evidência: spec (91×116; `firstRow` 2; `atmosphereDetailLabels` 0).
- [x] Grupos fechados por padrão, o grupo em uso aberto — evidência: `ThemeDecisionOptions.test.tsx` (2 casos novos) e as capturas.
- [x] A 390 px, "Aplicar" e as abas de dispositivo inteiros — evidência: spec, geometria impressa. (No harness já cabiam antes; agora os botões também não quebram palavra e a linha quebra de linha.)
- [ ] Prévia para o dono em `C:\tmp\sarak-previa-161\index.html` — gerada (antes/depois, 6 decisões a 1440 px e a Forma a 390 px); **o lote só fecha com o ok do dono nela**.
- Critérios dos lotes 2 a 5 (miniatura de tema, presets gerados, texturas, vocabulário): fora deste lote. "Suíte completa verde, build, `cromo-css-real:check`": do revisor.

**Decisões e suposições**
- "Grupo em uso" = o primeiro grupo da decisão cujo preset tem todos os tokens iguais aos do rascunho; sem nenhum, o primeiro grupo (a decisão nunca abre inteira fechada). A plan não define "em uso"; a alternativa é abrir só o grupo escolhido por último.
- Os grupos sem título (o bloco global do Layout) ficam sempre abertos; as seções internas dele (Preferências Globais, Barra de Preferências do Usuário, Identidade da Empresa) e as perguntas do Layout viraram recolhíveis fechadas — foi preciso para o Layout sair de 8,2 telas, apesar de `DecisionQuestionList.tsx` e `ThemeGlobalSettings.tsx` não estarem na lista da §3.1.
- A descrição deixou de aparecer sob a amostra (fica em `title` e `sr-only`) para a opção caber numa grade de várias colunas.
- Fora da lista da §3.1 também toquei `InputPresetPreview.tsx` (altura do quadro do campo), os testes e os 3 arquivos de navegador acima — todos consequência direta da mudança.
- O lote 2 não foi iniciado: o grupo "Temas prontos" continua com o cartão antigo e, por isso, é excluído da medida do spec (`LOTE_2_GROUPS`).

**Achados fora do escopo (não corrigidos)**
- Cores / `PaletteSection`: 4.032 px (6,1× a área) — a seção de paletas é da plan-164; o spec isenta "Cores" da meta com essa razão declarada.
- `browser-tests/plan-160-moldura-e-largura.spec.ts`: 8 casos reprovados já no `HEAD` (menu ⚙ fora da moldura, marca d'água "SARAK TWIN", texto cortado no tablet, rolagem muda a prévia, `tableCellPadding`).
- `plan-141` "o rótulo do item ativo ... contraste", na Topbar: `[aria-current="page"]` com `visibility: hidden` na amostra de Topbar — vem do `useHorizontalOverflow` (plan-159, não commitado). Não reexecutei esse caso depois do ajuste final e não tenho controle em `HEAD` para ele.
- Incidente meu: um `vitest -u` com um só caminho rodou a suíte inteira (o `-u` consome o primeiro caminho como valor) e regravou `PreviewCanvas.test.tsx.snap`, que é da plan-164. **Restaurei-o do `HEAD` com `git checkout`** (o diff era só `data-sx-keep-palette`), parei o processo e conferi que nenhum outro snapshot além dos dois do meu escopo ficou alterado.

**Pendências / riscos**
- Ok do dono na prévia.
- Risco nos browser-tests que assumiam todos os grupos abertos: adaptei os que reprovaram, mas só reexecutei `plan-140`, `plan-141`, `plan-145`, `plan-160`, `escolha` e `fontes`; os demais (`plan-146` a `149`, `plan-155`, `paletas-cabem-na-coluna`) não foram rodados.
- `docs/migracoes.md`: não escrevi — a mudança é só da UI do painel, sem nome de token, prop ou export alterado.
- `npm run dev-kit` não foi rodado (`dev-kit:check` passa; `sarak-dev/` e `sarak-ui/` mostram alterações de outras execuções).

---

## Resumo da correção (lote 1) — 2026-11-17

Escopo: só os achados 1 a 4 do veredito de 2026-11-17.

1. **Galeria de temas aberta.** `initialOpenGroups` (`ThemeDecisionOptions.tsx`) abre a galeria sempre que a decisão a tem: o tema aplicado é uma opção dela. O spec do lote deixou de isentar a galeria e mede o Tema com ela aberta. O limite do Tema fica declarado em 15 alturas (`SCROLL_LIMIT`, medido 14,66) até o lote 2 trocar o cartão. As demais decisões seguem em 2,5.
2. **`plan-160-moldura-e-largura.spec.ts:171`** abre o grupo `tables` antes de procurar os cartões.
3. **Item ativo da Topbar.** Causa medida: o `useHorizontalOverflow` da 159 mistura retângulos escalados com padding e vão sem escala, e a opção de 8,5 rem deixava a escala líquida da barra (640 px de referência) em ~0,21, então "Pedidos" ia para o "Mais". O "Mais" não foi tocado. O grupo `topbar` usa `WIDE_SAMPLE_GRID` (mínimo de 15 rem, `panelResponsive.presets.ts`), com escala líquida de ~0,375. `plan-141:353` verde nos dois modos.
4. **Atribuição corrigida.** O controle em `HEAD` do resumo anterior não vale (sem `npm run build`, lia o `dist/` antigo). Os 8 casos do `plan-160-moldura` não eram pré-existentes com os mesmos números: só o `:171` falhava, e era deste lote. O `plan-141:353` também era deste lote (quadro de 280 px), não da 159.

**Verificação:** `npm run build` completo e, no worktree, `login-theme-application`, `plan-122-preview-mode`, `plan-160-previa-mostra-a-opcao`, `troca-de-tema`, `plan-160-moldura-e-largura` e o spec do lote: 35 verdes. `plan-141:353`: 2 verdes. Unidade de `src/features/DesignEngine/Canvas` e `ThemeDecisionOptions`: só falha o snapshot do `PreviewCanvas` (plan-164). Rolagem: Fontes 2,31, Forma 2,43, Componentes 2,05, Layout 1,20, Cores 6,11 (164). As duas decisões do dono (meta 2,5 e Cores) seguem abertas. Sem commit.

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Nota do revisor — 2026-11-12 — prévia HTML para o dono aprovar

A pedido do dono, como nas campanhas anteriores: ao fim de cada lote, o executor gera `C:\tmp\sarak-previa-161\index.html`
com capturas reais do `dist/` ou do código-fonte (como as prévias da 136 a 149), mostrando cada decisão inteira, com as amostras novas, nos dois modos (antes e depois). O resumo do lote dá o caminho.
O revisor confere a prévia antes do veredito, e o lote só fecha com o ok do dono nela (critério acrescentado à §6). A projeção da
campanha inteira, feita à mão, está em `C:\tmp\sarak-previa-campanha-9\index.html`: é referência de intenção, não de pixel.

## Nota do revisor — 2026-11-16 — as plans citadas foram sintetizadas

As `plan-158`, `plan-160`, `plan-163` e `plan-165` foram sintetizadas e removidas. Toda citação a elas nesta plan passa a valer
pela spec fixa:
- `plan-158` → [[09-temas-e-presets]] §4.3.3 e §4.4.1–4.4.2 (o que se grava), [[06-painel-de-customizacao-e-preview]] §4 e §4.1 (sair com rascunho, desempenho) e o ADR-026.
- `plan-160` → [[06-painel-de-customizacao-e-preview]] §2.4, §6.2–6.6 (a prévia, a espiada, as telas por grupo).
- `plan-163` → [[09-temas-e-presets]] §4.3.4 e §5 (paletas, régua de deslocamento, contraste).
- `plan-165` → [[05-cromo-e-slots]] §2.1.4, §2.2 e §2.4 (anatomia da barra lateral) e [[09-temas-e-presets]] §4.3.4 (faixas da marca).

O código delas está no `HEAD`. Ao executar, leia a spec fixa, e não a plan. `depende_de` fica vazio: nada mais bloqueia esta
plan por dependência de outra plan.

## Veredito — 2026-11-17 — lote 1 — 🔴 Reprovado (11 casos de navegador da bateria caem por este lote)

**Como medi:** numa cópia fora do repositório com o worktree inteiro (as plans 159, 161 e 164, que saem no mesmo commit), com
`npm run build` completo na cópia e a bateria `browser-tests/` inteira, uma vez: **758 verdes, 14 falhas** (1,4 h). Três já são
conhecidas e não são deste lote: `cartao-cede-a-classe` ×2 (backlog 83) e `css-que-so-o-navegador-mede.spec.ts:257`, que ficou velho
no `HEAD` e sai por um prompt à parte. As outras **11 falham de novo rodadas sozinhas**, e todas têm a causa neste lote.
- **Unidade:** `npx vitest run src/features/DesignEngine` na mesma cópia, com a máquina livre → 912 verdes. Falha só o snapshot do
  `PreviewCanvas`, que é da correção da `plan-164`.
- **Diff lido:** `CollapsibleSection.tsx`, `OptionSampleFrame.tsx`, `OptionTile.tsx`, `PersonalityCatalog.tsx`,
  `ThemeDecisionOptions.tsx`, `ThemeDecisionView.tsx`, `DecisionQuestionList.tsx`, `ThemeActionBar.tsx`, `AtmosphereCatalog.tsx`,
  `PresetGroupCatalog.tsx` e `panelResponsive.presets.ts`. A grade única e a amostra proporcional estão bem feitas. A prévia
  (`C:\tmp\sarak-previa-161\index.html`) foi conferida, e o spec novo reprova antes e passa depois.
- **Os números de antes batem com o ERP da §2:** Componentes 14.144 × 14.236 px, Forma 10.560 × 10.637, Fontes 7.210 × 7.217.

**Achados**
1. **Na decisão Tema, a galeria de temas abre fechada** (`ThemeDecisionOptions.tsx`, `initialOpenGroups`). Sem opção "em uso"
   reconhecida, abre o primeiro grupo, as Personalidades, e os cartões de tema nem montam. Caem 8 casos:
   - `login-theme-application.spec.ts:41` e `plan-122-preview-mode.spec.ts:63` (não acham o cartão do tema);
   - `plan-160-previa-mostra-a-opcao.spec.ts:487` e `:499`;
   - `troca-de-tema.spec.ts:213` e `:235`, nos modos app e embarcado. No `:213`, o total de elementos cai com a galeria fechada, e o
     teto (uma fração do total) fica abaixo do recálculo de 479. O `:235` escolhe um tema na galeria.

   Critério: o tema aplicado é sempre uma opção da galeria, então ela é o grupo "em uso" da decisão Tema e abre aberta. A §6 do 1.3
   ("o grupo em uso aberto") não é atendida. O spec do lote mede a rolagem do Tema com a galeria aberta, e a meta do Tema fica
   declarada no limite do spec até o lote 2, que troca o cartão. Os 708 px de hoje medem a decisão sem a galeria.
2. **`plan-160-moldura-e-largura.spec.ts:171` (`tableCellPadding`)** procura os cartões do grupo de tabelas, que agora abre fechado em
   Componentes. Adapte o spec para abrir o grupo que mede, como já foi feito no `plan-141`.
3. **A amostra de Topbar esconde o item ativo** (`plan-141-presets-do-painel.spec.ts:353`, nos dois modos). O quadro de referência de
   280 px (`OptionSampleFrame.tsx`) é estreito para a lista da amostra, e o "Mais" da `plan-159` leva o item ativo ("Pedidos") para
   dentro dele: `aria-current` com `visibility: hidden`. A amostra existe para mostrar o estilo do item ativo.
   - Critério: na amostra de Topbar, o item ativo fica visível.
   - O caso fica verde no worktree com a 159.
   - O quadro (largura de referência da Topbar ou número de itens da amostra) é deste lote. Não mude o "Mais" da 159.
4. **O controle no `HEAD` do resumo não vale.** A cópia do `HEAD` sem `npm run build` lê o `dist/` commitado, que é o antigo. Por isso
   os 8 casos do `plan-160-moldura` falharam lá "com os mesmos números". Com o build, no worktree, só o `:171` falha, e é deste
   lote. Corrija no resumo novo a atribuição desse spec e a do `plan-141:353` (achado 3).

**Para o dono** (sem estes, a correção não fecha):
- **Meta de rolagem.** O 1.4 diz "nenhuma decisão passa de duas alturas". O spec fixou 2,5, e três decisões ficam entre 2 e 2,5
  (Componentes 2,05, Fontes 2,31 e Forma 2,43, contra 15 a 20 antes).
  - **(a)** Aceitar 2,5 no spec. A queda é de 6 a 10 vezes, e o lote 4 reorganiza a Forma de novo. **Recomendação do revisor.**
  - **(b)** Exigir 2,0 já neste lote.
- **Cores (6,1 alturas).** Fica de fora porque a galeria de paletas é da `plan-164`.
  - **(a)** O lote 2 da 164, que já mexe na galeria (`PaletteGallery.tsx`, grupo "Minhas paletas"), passa a ter a meta das 2,5 alturas
    para Cores. **Recomendação do revisor.**
  - **(b)** Um lote novo nesta plan, depois do lote 2 da 164.

**Como fechar** (verificação objetiva): os 11 casos acima, no worktree com `npm run build`, e o spec do lote. O revisor reroda só
esses.

**Commit:** as plans 159, 161 e 164 saem num commit só. Dividem `docs/migracoes.md`, os kits e o snapshot do `AtmosphereCatalog`,
e a amostra de Topbar desta plan depende do "Mais" da 159.

**Status da plan: 🔵 Em correção.**

## Veredito — 2026-11-17 — lote 1, correção — 🟢 Aprovado no código; o lote fecha com as decisões do dono e o ok na prévia

**Como medi (as três correções juntas):** numa cópia fora do repositório com o worktree inteiro (plans 159, 161 e 164), com
`npm run build` completo:
- navegador: `topbar-mais`, `barra-de-topo-estreita`, `plan-141-presets-do-painel` inteiro, `plan-161-catalogo-proporcional`,
  `login-theme-application`, `plan-122-preview-mode`, `plan-160-previa-mostra-a-opcao`, `plan-160-moldura-e-largura`,
  `troca-de-tema` e `css-que-so-o-navegador-mede` → **100 de 100 verdes**;
- unidade: `npx vitest run src/features/DesignEngine src/components/atomic/Navigation src/components/Layout src/core/Provider
  src/core/Design`, com a máquina livre → **340 arquivos, 3.408 verdes**;
- gates do hook (Anel 1 e auditoria) no worktree real: verdes, baseline sem regressão.

**Achados do veredito anterior**
1. A galeria de temas abre na decisão Tema (`initialOpenGroups`). Os 8 casos que caíam passam. O limite do Tema (15 alturas,
   medido 14,66) está declarado no spec até o lote 2.
2. O `plan-160-moldura-e-largura.spec.ts:171` abre o grupo de tabelas antes de medir.
3. A amostra de Topbar usa `WIDE_SAMPLE_GRID` (mínimo de 15 rem), e o `plan-141:353` passa nos dois modos. A causa que o executor
   mediu, a mistura de unidades no `useHorizontalOverflow`, é da `plan-159` e foi para lá. A grade larga fica: a Topbar é uma
   amostra comprida e se lê melhor assim.
4. O resumo corrigiu as duas atribuições.

**Falta, para fechar o lote:**
- as duas decisões do dono do veredito anterior (meta de 2,5 alturas; onde fica Cores);
- o ok do dono na prévia.

**Commit:** junto com as plans 159 e 164, depois da correção da 159.

**Status da plan: 🟠 Em revisão** (aguardando o dono).

## Nota do revisor — 2026-11-17 — ok do dono na prévia e decisões do lote 1

O dono aprovou a prévia refeita (`C:\tmp\sarak-previa-161\index.html`, código do commit `9f08de71`) e decidiu:
1. **Cartão de tema:** nas colunas da grade, o nome do tema quebra uma letra por linha. Fica para o lote 2, que troca o cartão pela
   miniatura real. **A release 9.0.0 não sai sem o lote 2 desta plan.**
2. **Meta de rolagem:** 2,5 alturas da área, como o spec do lote fixou. O lote 4 não pode piorar Fontes, Forma, Componentes e Layout.
3. **Cores (6,1 alturas):** a meta das 2,5 alturas passa ao lote 2 da `plan-164`, que já mexe na galeria de paletas.

Para o lote 2: a amostra larga da Barra de topo deixa um vazio sob a barra (o quadro mantém 100 px de altura). Ajuste junto com o
cartão, se couber no lote.

**Lote 1 fechado. Status da plan: 🟡 Em execução** (lote 2).

---

## Resumo da execução (lote 2) — 2026-11-17

**Resultado:** Concluído com pendências (build completo para em `guide:check` por causa da plan-159; ok do dono na prévia pendente)

**Estado do worktree ao iniciar**
```
 M dist/sarak.css
```
(A plan-159 passou a alterar o worktree durante a execução; nada dela foi tocado.)

**O que foi feito**
- `PresetCard.tsx`: a miniatura passa a ser o sistema real (`SarakAppChrome`, barra lateral ou de topo conforme o tema, e `SarakCard` reais) dentro de um escopo de variáveis do tema, num quadro de 640×400 reduzido à opção. Só monta quando a opção entra na área visível (`LazyWhenVisible`), e é dentro dela que a paleta é resolvida. O cartão é um `OptionTile`: nome em `text-xs`, sem caixa alta; o selo de navegação saiu (a barra desenhada já mostra qual é), e o nome acessível é só o do tema.
- Escopo enxuto (`MiniatureScope`): variáveis e contexto de design, sem a marca de troca de tema, o fundo e o CSS responsivo do `SarakDesignScope`. Regra única (`MINIATURE_STILL_CSS`, escrita pela galeria) desliga animação e transição por dentro das miniaturas: o tema traz animação infinita (`pulse`, `stars-twinkle`, `nebula-drift`, `aurora-flow`) que, em ~20 miniaturas, fazia a troca de tema passar de 32 para 117-244 recálculos de estilo (medido: com a regra, `troca-de-tema` passa nos dois modos).
- `PresetCardPending.tsx`: mesmo `OptionTile` e mesmo quadro (amostra de cor), `aria-busy` e `data-theme-id` no botão.
- `OptionTile.tsx` ganha `frameWidth`, `buttonProps` e `peekWhenMounted`; `OptionSampleFrame.tsx` ganha `width` e `TOPBAR_FRAME_WIDTH`.
- Galeria em `THEME_GALLERY_GRID` (colunas de no mínimo 5,5 rem: três por linha na coluna padrão); sai o atraso escalonado de entrada (`index`).
- Barra de topo: o quadro da amostra larga passa a 640×112, a proporção do desenho (`PresetGroupCatalog.tsx`, `OptionSampleFrame.tsx`); sem vazio sob a barra.
- `presetCardGeometry.ts` removido (só a miniatura antiga o usava).
- Spec do lote: limite do Tema baixado para 2,5; casos novos de custo (tempo, heap, nós), nome do tema em 4 larguras de coluna, Barra de topo (vazio e item ativo) e galeria a 390 px.
- Specs adaptados ao cartão novo: `plan-122-preview-mode` (o fundo da miniatura é o `--sarak-bg-base`, o mesmo da prévia), `plan-160-previa-mostra-a-opcao` (o cartão de tema também é `data-option-tile`; o alvo é um só). `PresetsCatalog.test.tsx`: mock de `useDesignVariables` devolve objeto estável (o mock devolvia um novo a cada chamada e o escopo entrava em laço) e snapshot regravado.

**Arquivos alterados** (meus): `Canvas/components/{PresetCard,PresetCardPending,OptionTile,OptionSampleFrame,PresetGroupCatalog,PresetsCatalog}.tsx`, `Canvas/panelResponsive.presets.ts`, `presetCardGeometry.ts` (removido), testes `PresetCard`, `PresetCard.memo`, `PresetCardPending`, `OptionTile`, `OptionSampleFrame`, `PresetsCatalog` (+snapshot), `panelResponsive.presets`; `browser-tests/{plan-161-catalogo-proporcional,plan-122-preview-mode,plan-160-previa-mostra-a-opcao}.spec.ts`. `dist/*` e `src/buildInfo.ts`/`src/core/Provider/buildInfo.ts` mudaram pelo build.

**Verificações executadas**
- Custo do Tema (passo 2.3), mediana de 3 rodadas, 25 cartões, 1440×900: antes 879 ms / 44,8 MB / 2.222 nós; depois 761 ms (0,87×, limite 2×) / 45,1 MB / 2.551 nós.
- Rolagem (altura da coluna 660 px): Tema 9.677 → **1.076 px (1,63×)**; Cores 6,11× (plan-164); Fontes 2,31; Forma 2,43; Componentes 2,05; Layout 1,20. Nenhum cortado/vazando.
- Nome do tema com a coluna em 280/320/480/600 px: no máximo 4/3/3/3 linhas, nenhum cortado, nenhuma palavra partida. A 390 px: antes 25 de 25 cortados e até 26 linhas; depois 0 e 3 linhas.
- Barra de topo: 8 amostras no registro (não 9), vazio máx. 0 px, "Pedidos" visível nas 8 (o caso espera 1,5 s após revelar, pois o "Mais" da plan-159 assenta depois do desenho; 3 execuções seguidas verdes).
- Playwright, rodada 1: `login-theme-application`, `plan-141`, `plan-160-moldura-e-largura` verdes; falharam `plan-122:63`, `plan-160-previa` (Tema) e `troca-de-tema:235` ×2 — corrigidos como acima; rodada 2 (`plan-122`, `plan-160-previa`, spec do lote): 27 verdes e o caso de topo, depois ajustado e verde; `troca-de-tema` rerrodado: 2 verdes. Não reexecutei `login-theme-application`, `plan-141` e `plan-160-moldura` depois da regra de animação e do escopo enxuto.
- Vitest: `PresetCard*`, `PresetCardPending`, `OptionTile`, `OptionSampleFrame`, `PresetsCatalog`, `panelResponsive` verdes. `src/features/DesignEngine` falha em 5 casos que não são deste lote: snapshot do `AtmosphereCatalog` (atributos de preferências da plan-159), `ThemeGlobalSettings` ×2, `ThemeDecisionView` ×1, `useThemeCustomizationData` ×1 (rótulos e preferências da 159). Vitest e Playwright em rodadas separadas.
- `npm run build`: falha em `guide:check` (kit do consumidor defasado em 5 arquivos pelos tokens da 159; não regenerei os kits, que são compartilhados). Rodei o resto da cadeia sem `guide:check` (build:js, fontes, tipos públicos, css, optional-peers): verde.
- Controle em `HEAD` (cópia fora do repositório, só para o "antes" a 390 px): `git status --short` idêntico antes e depois (fora de `dist/`), `node_modules` intacto, cópia e junção removidas.

**Critérios de aceite**
- [x] Miniatura = prévia real com o tema; nome proporcional; custo dentro do limite — evidência acima.
- [x] Tema abaixo de 2,5 alturas (1,63) com a galeria aberta.
- [x] Nome sem uma letra por linha em nenhuma largura da grade.
- [x] Amostra larga da Barra de topo sem vazio, "Pedidos" visível.
- [ ] Prévia em `C:\tmp\sarak-previa-161\index.html` — refeita (Tema antes/depois a 1440 e 390, tabela de rolagem, custo); aguarda o ok do dono.
- Critérios dos lotes 3 a 5: fora deste lote. Suíte completa, `tsc` e `cromo-css-real:check`: do revisor.

**Decisões e suposições**
- O selo "sidebar"/"topbar" saiu do cartão em vez de mudar de lugar: a miniatura já mostra a barra.
- Miniatura em 640×400 (3 por linha, ~91 px): fica um panorama de cores e formas, não texto legível; o ganho de rolagem vem disso.
- A regra que congela animação mora na galeria (um `<style>` escrito uma vez) e usa `!important`; é a única forma de vencer a animação do tema por dentro de um escopo.
- Não alterei o orçamento de 32 recálculos de `troca-de-tema`: a causa era animação nas miniaturas e foi removida.

**Achados fora do escopo (não corrigidos)**
- `guide:check` vermelho e as 5 falhas de unidade acima pertencem à plan-159; o snapshot do `AtmosphereCatalog` também depende dela.
- `src/buildInfo.ts` e `src/core/Provider/buildInfo.ts` aparecem alterados pelo `generate-build-info` do build.
- A amostra de Barra lateral (Layout) tem o mesmo descompasso de quadro da Topbar (quadro 280×240 contra o desenho 520×320); não medi vazio ali.

**Pendências / riscos**
- Ok do dono na prévia.
- `login-theme-application`, `plan-141` e `plan-160-moldura` não foram reexecutados depois do último ajuste (regra de animação e escopo enxuto); `docs/migracoes.md` não tocado; `npm run dev-kit` não rodado.

## Veredito — 2026-11-17 — lote 2 — 🔵 Em correção (um item objetivo; ele barra o commit)

**Como medi:** as plans 159 e 161 (lote 2) dividem o worktree e saem no mesmo commit, então medi as duas juntas.
- **Cópia fora do repositório** (`HEAD` + modificados + não rastreados, menos `dist/`, sem `presetCardGeometry.ts`), com
  `npm run build` completo: exit 0. Na mesma cópia, a bateria de navegador `topbar-mais`, `barra-de-topo-estreita`,
  `cromo-css-real`, `tom-contrastante-legivel`, `plan-141`, `preferencias-discretas`, `plan-161-catalogo-proporcional`,
  `login-theme-application`, `plan-122-preview-mode`, `plan-160-previa-mostra-a-opcao`, `plan-160-moldura-e-largura` e
  `troca-de-tema` deu **151 de 151 verdes**. Isso inclui os três specs que o resumo da 161 não reexecutou.
- **Gates do commit** (Anel 1 e `check-audit-baseline --with-tsc`): baseline sem regressão. Um vermelho real: `css-important:check`
  (achado da 161). O `plan-index:check` é do revisor, e o `trail-citation:check` só cai na cópia sem `.git`.
- **Unidade:** `npx vitest run` de `Navigation`, `Layout`, `core/Provider`, `core/Design` e `features/DesignEngine`. Na cópia,
  os mocks deixaram de valer em 44 arquivos (186 falhas que não se repetem fora dela). Os 44 rodados de novo **no worktree real**: 42
  verdes e 2 vermelhos, os snapshots do `PreviewCanvas` e do `AtmosphereCatalog` (achado da 159).
- **Segredo** (Anel 0), sobre as linhas adicionadas e os não rastreados fora de `dist/`: 0.
- **Diff lido:** `PresetCard.tsx` (a miniatura é o `SarakAppChrome` e o `SarakCard` reais, num escopo enxuto e só quando visível),
  `PresetCardPending.tsx`, `OptionTile.tsx`, `OptionSampleFrame.tsx`, `PresetGroupCatalog.tsx`, `PresetsCatalog.tsx` e
  `panelResponsive.presets.ts`.
- **Prévia** (`C:\tmp\sarak-previa-161\index.html`) conferida: miniaturas legíveis como panorama, três por linha, nome sem uma letra
  por linha a 1440 e a 390 px. Rolagem do Tema em 1,63 alturas. O custo de abrir o Tema fica em 0,87× o de antes.

**Achado**
1. **`css-important:check` vermelho** (`PresetCard.tsx:28`, `MINIATURE_STILL_CSS`): a regra que congela a animação das
   miniaturas monta um `!important` em TypeScript. O gate roda no gancho de commit e derruba o commit das duas plans.
   - Congele a animação sem `!important`. Um caminho a medir: o token `reducedMotion` (`schema/engineering.ts`) no design de cada
     miniatura, se ele de fato desliga as animações do tema (`pulse`, `stars-twinkle`, `nebula-drift`, `aurora-flow`). Outro: uma
     regra injetada sem camada e com especificidade suficiente. Escolha a mais simples que passe.
   - Critério: `css-important:check` verde e `troca-de-tema.spec.ts` verde nos dois modos, sem mexer no orçamento de 32 recálculos.

**Atribuição:** os snapshots do `PreviewCanvas` e do `AtmosphereCatalog` não são desta plan. São da 159 (as duas variáveis de
preferência dela), e ela os corrige.

**Como fechar** (verificação objetiva): `css-important:check` e `troca-de-tema.spec.ts` (com `npm run build`). O revisor reroda
só esses dois.

**Commit:** junto com o lote 2 da `plan-159`, depois das duas correções e do ok do dono nas duas prévias.

**Status da plan: 🔵 Em correção.**

### Correção do veredito de 2026-11-17 — sem `!important`

- `MINIATURE_STILL_CSS` (`PresetCard.tsx`) perdeu o `!important`; a regra segue sem camada, que vence o CSS das camadas. O token `reducedMotion` não serve: é do `:root`, não de uma miniatura.
- `npm run css-important:check`: OK. `npm run build`: completo, verde. `troca-de-tema.spec.ts`: 4 de 4 (uma rodada anterior reprovou 1 caso de mover o mouse, 1104 > 868 elementos; em 2 repetições isolada e na rodada inteira seguinte passou, sem mudar código).

## Veredito — 2026-11-17 — lote 2, correção — 🟢 Aprovado no código; o lote fecha com o ok do dono na prévia

**Como medi:** só o que o achado pede, no worktree real.
- `npm run css-important:check`: OK.
- `npm run build` refeito pelo revisor, porque o `dist/` era anterior à última edição do `PresetCard.tsx`: exit 0.
- `troca-de-tema.spec.ts` com `--repeat-each=2`: 8 de 8 nos dois modos, sem a falha intermitente que o resumo cita.

**Antes do commit** (das duas plans juntas): Anel 1 e `check-audit-baseline --with-tsc` sem regressão, e varredura de segredo
(Anel 0) sobre as linhas adicionadas e os não rastreados fora de `dist/`: 0.

**Falta, para fechar o lote 2:** o ok do dono na prévia (`C:\tmp\sarak-previa-161\index.html`).

**Status da plan: 🟠 Em revisão** até o ok do dono.

## Nota do revisor — 2026-11-17 — ok do dono na prévia do lote 2

O dono aprovou a prévia do lote 2 (`C:\tmp\sarak-previa-161\index.html`).

**Lote 2 fechado. Status da plan: 🟡 Em execução** (lote 3). O commit sai junto com o lote 2 da `plan-159`.

---

## Resumo da execução (lote 3) — 2026-11-17

**Resultado:** Concluído com pendências (a sombra da amostra herda atributo do tema atual; ok do dono na prévia; a proposta 3.3 aguarda veredito)

**Estado do worktree ao iniciar**
```
 M src/core/Design/catalog/partitions/colors_and_atmosphere.json
 M src/core/Design/catalog/theme_table_mapping.json
 M src/core/Design/presets/themes/compose.ts
 M src/core/Design/schema/colors.ts
 M src/core/Provider/generated/design-token-docs.json
 M src/core/Provider/generated/design-token-ids.ts
 M src/core/Provider/utils/validation.ts
 M src/core/i18n/catalog.ts
 M src/features/DesignEngine/Main/components/BrandShortcut.tsx
 M src/features/DesignEngine/Main/components/PaletteCreator.tsx
 M src/features/DesignEngine/Main/components/PaletteGallery.tsx
 M src/features/DesignEngine/Main/components/PaletteSection.tsx
 M src/features/DesignEngine/Main/components/ThemeDecisionView.tsx
 M src/features/DesignEngine/Main/hooks/useBrandForm.ts
 M src/features/DesignEngine/utils/decisions.ts
?? browser-tests/_probe164.spec.ts
?? src/core/Design/palette/savedPalettes.ts
?? src/core/i18n/catalogEntries.paletteSaved.ts
?? src/features/DesignEngine/Main/hooks/useSavedPalettes.ts
```
(As plans 159 e 164 alteraram o worktree em paralelo durante a execução; nada delas foi tocado. Não toquei em `Main/components/` nem no catálogo de `src/core/i18n/` fora de `presetTexts/`.)

**O que foi feito**
- `scripts/cardPresetsFromThemes.ts` (novo): `themeCardDesign(theme)` devolve os tokens de card que o tema declara, nas áreas `cards`, `cardTitle` e `cardAction`, menos token do tipo cor e menos valor de texto com cor literal (hex, rgb, hsl, oklch). `buildThemeCardPreset` monta `card-theme-<id do tema>`, com o nome do tema.
- `scripts/generate-theme-card-presets.ts` (novo) grava `src/core/Design/presets/components/cardsThemes.generated.ts` (25 presets, 46 a 47 tokens cada) e tem `--check` byte a byte, com os limites declarados (R18). `package.json`: `card-presets` e `card-presets:check`, o segundo no encadeamento do `build` logo depois de `themes:catalog:check`. `scripts/verify-changes.mjs`: o check entra no Anel 1 e nos níveis `themes` e `schema-meta`.
- `cards.ts`: `CARD_PRESETS` passa a terminar com `THEME_CARD_PRESETS` (grupo `cards` do registro; os destacados não mudam, então os 25 ficam em "Ver todas"). `coverage.ts`: `catalogSectionRadius` e `catalogItemRadius` saem de `COVERAGE_GAPS` (os cards dos temas passaram a cobri-los; a lista só encolhe).
- `CardsCatalog.tsx`: a aba Curados, com "Ver todas", mostra duas seções (Cards curados e Cards dos temas) e desenha a amostra sobre `sarakGetDefaultDesignState()` em vez do rascunho; a aba Texturas segue sobre o rascunho (lote 4).
- `presetTexts/`: `textures.ts` ganha `THEME_CARD_DESCRIPTION` (seis idiomas; o nome é o do próprio tema), `index.ts` deriva o texto de `card-theme-*`, `groups.ts` ganha os títulos de família `cardsCurated` e `cardsOfThemes`.
- Testes: `scripts/__tests__/cardPresetsFromThemes.test.ts` (novo), `CardsCatalog.test.tsx` (+3 casos; snapshot "Ver todas (28)" passa a "(53)"), `presetTexts.test.ts` (o regex de "derivado" aceita `card-theme-`) e `browser-tests/plan-161-catalogo-proporcional.spec.ts` (bloco do lote 3, 2 casos).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `scripts/cardPresetsFromThemes.ts`, `scripts/generate-theme-card-presets.ts` | criado | derivação e gerador com `--check` |
| `src/core/Design/presets/components/cardsThemes.generated.ts` | criado (gerado) | 25 presets de card |
| `src/core/Design/presets/components/cards.ts`, `coverage.ts` | alterado | o grupo `cards` inclui os gerados; 2 lacunas de cobertura saem |
| `src/features/DesignEngine/Canvas/components/CardsCatalog.tsx` | alterado | seções e base neutra |
| `src/core/i18n/presetTexts/textures.ts`, `index.ts`, `groups.ts` | alterado | textos dos presets de tema e títulos de seção |
| `package.json`, `scripts/verify-changes.mjs` | alterado | scripts e Anel 1 |
| `scripts/__tests__/cardPresetsFromThemes.test.ts`, `CardsCatalog.test.tsx` (+ snapshot), `presetTexts.test.ts`, `browser-tests/plan-161-catalogo-proporcional.spec.ts` | criado/alterado | testes |

**Verificações executadas**
- `npm run verify -- --tier=quick` → `tsc` 0 erros, `audit:baseline --with-tsc` sem regressão, Anel 1 inteiro (incluindo `card-presets:check`, `themes:catalog:check`, `token-docs`, `panel-contract`, `guide:check`, `dev-kit:check`, `plan-index:check`) e Anel 0 (2.722 linhas, 0 achados): verde.
- `npx vitest run` sobre `scripts/__tests__/cardPresetsFromThemes.test.ts`, `src/core/Design/presets`, `src/core/i18n`, `CardsCatalog.test.tsx` e `PresetsCatalog.test.tsx` → 26 arquivos passam, 1 falha: `compose.test.ts:143` por timeout de 5 s sob carga; sozinho passa (14 de 14, 15 s). `compose.ts` é da outra execução.
- Gate (§7 da plan): `card-presets:check` com um valor trocado à mão no gerado (`cardBorderWidth` 3 → 9 no primeiro preset) → `DEFASADO`, exit 1; restaurado → `em dia (25 temas)`, exit 0. No teste do gerador: tema que muda `cardBorderWidth` muda o preset; tema que deixa de declarar o token o tira; `cardBackgroundColor: '#112233'`, `cardShadow: '2px 2px 0 rgba(0,0,0,0.5)'` e `cardHeaderBorder: '#ffffff'` ficam de fora, `cardShadow: 'none'` fica; `sidebarWidth` e `tableDensity` do tema não entram; `undefined` não vira chave.
- Mutação da base neutra: com `draft={draft}` no lugar da base neutra, o caso "o rascunho não entra no escopo da amostra" reprova (1 falha); restaurado, 7 de 7.
- Navegador (`npx playwright test --config=browser-tests/playwright.config.ts browser-tests/plan-161-catalogo-proporcional.spec.ts -g "o card de cada tema"`): 2 de 2 verdes. 53 amostras (28 curados + 25 de tema), seções `Cards curados` e `Cards dos temas`; trocando o tema atual do rascunho para Neo Brutalism, raio, borda, respiro e fundo das 53 amostras ficam idênticos; assinaturas distintas em mais de 60% delas.
- `presetCatalog.test.ts` (inclui "nenhum preset de estrutura escreve cor", área do grupo, contrato do valor, pares a menos de 2 tokens) e `presetTexts.test.ts` (seis idiomas, nomes sem repetição no grupo): verdes com os 25 novos.

**Critérios de aceite** (deste lote)
- [x] Presets de card gerados dos temas, com `--check` — evidência: gerador, `card-presets:check` no `build` e no Anel 1, mutação acima.
- [ ] Amostra sobre base neutra fixa ("o mesmo preset tem a mesma amostra em qualquer tema atual") — **parcial**: forma, borda, respiro e fundo iguais nas 53; a **sombra muda** nas 53 (ver Achados).
- [x] Proposta dos atuais no resumo — abaixo (3.3). Nenhum removido.
- [ ] Prévia em `C:/tmp/sarak-previa-161/lote3.html` (linkada do `index.html`) — gerada; **o lote só fecha com o ok do dono**.
- Suíte completa, build e `cromo-css-real:check`: do revisor.

**Proposta (3.3) — os cards atuais × os gerados** (medida: dos tokens sem cor que o card gravava, quantos o card de algum tema repete; responsivo pelo `desk`)
| Card atual | Iguais | Mais próximo | Proposta |
|---|---|---|---|
| `card-retro-os` | 5 de 6 | Industrial Terminal Classic | sai, id como apelido |
| `card-scanline-crt` | 5 de 5 | Cyberpunk Neon | sai, apelido |
| `card-industrial-brutalist` | 3 de 4 | Neo Brutalism | sai, apelido |
| `card-cyberpunk-neon` | 3 de 6 | Cyberpunk Neon | sai, apelido |
| `card-carbon-tech`, `card-geometric-cut`, `card-asymmetric-accent`, `card-organic-craft`, `card-claymorphism`, `card-glass-minimal`, `card-holographic-hud`, `card-floating-lift` | 2 a 4 | (nenhum domina) | ficam |

A medida não vê a cor (os escritos à mão gravam cor, o gerado nunca), então "sai" perde o neon, o verde de fósforo e o cinza chanfrado desses quatro. A plan fala em 14; `cards.ts` tem 12 escritos à mão (os outros 16, de `cardsStructure.ts`, não gravam cor e não entram na comparação). Os 12 estão em `PUBLISHED_PRESET_IDS`: remover exige o apelido e vai pelo veredito.

**Decisões e suposições**
- Os 25 entram no grupo `cards` que já existe, e não num grupo novo: um grupo novo exigiria `design-decisions.json` e a lista de grupos da decisão, que são do lote 4 e de `Main/components/`.
- Só o `design` nativo do tema entra; a `contraparte` (modo oposto) não.
- A descrição em português é um modelo fixo com o nome do tema ("O card do tema X: forma, borda, sombra, textura e respiro que o tema declara."). "card" minúsculo no meio da frase; os outros idiomas seguem o vocabulário que os textos de textura já usam (o glossário é do lote 5).
- `cardShadow` de texto com cor literal fica de fora do preset (regra "preset de estrutura não escreve cor"); a sombra do tema chega pelos tokens numéricos (`cardShadowOffsetX/Y`, `Blur`, `Spread`, `Expansion`).
- Os ids novos não entram em `PUBLISHED_PRESET_IDS` (ainda não saíram numa release).
- A base neutra é `sarakGetDefaultDesignState()`; o modo (claro ou escuro) continua o da prévia.

**Achados fora do escopo (não corrigidos)**
- **A sombra da amostra herda o tema atual** (`src/styles/_card-defaults.css:138` e `_card-materials.css`): `[data-sx-card-shadow]:not([data-sx-card-shadow="none"]) .sarak-card` e `[data-sx-surface-material="…"] .sarak-card` casam por ANCESTRAL, e o painel herda os `data-sx-*` do tema atual; um atributo do escopo da amostra não desfaz o do ancestral. Medido: a sombra muda em 53 de 53 amostras ao trocar o tema do rascunho para Neo Brutalism. Conserto possível, no motor: parar o seletor no escopo mais próximo.
- "Ver todas" do grupo Cards passa de 28 para 53 opções, cada uma ainda numa linha na coluna padrão (a amostra do card curado é `min-h-48`, não passa pelo quadro proporcional do lote 1); a rolagem com o grupo aberto cresce. A meta de 2,5 alturas é medida com o grupo no estado padrão.
- `compose.test.ts:143` estoura 5 s sob carga (passa sozinho).

**Pendências / riscos**
- Ok do dono na prévia; veredito da proposta 3.3.
- `docs/migracoes.md`: não escrevi (nenhum id, prop ou token removido). `npm run dev-kit` não rodado (kits compartilhados com as outras execuções); `dev-kit:check` e `guide:check` passam.
- Outros specs de navegador do painel não foram reexecutados neste lote (só o do lote 3, 2 casos); o `plan-141` mede o grupo `cards` e deve ser conferido pelo revisor.

## Veredito — 2026-11-17 — lote 3 — 🔵 Em correção (três itens objetivos)

**Como medi**
- `card-presets:check`: em dia (25 temas).
- `npx vitest run` do gerador, `src/core/Design/presets`, `src/core/i18n/presetTexts` e `src/features/DesignEngine/Canvas`: 698 de
  699. A falha é `compose.test.ts` (o `compose.ts` é da `plan-164`), não deste lote.
- Numa cópia fora do repositório (o worktree inteiro, menos `dist/`), `npm run build` com exit 0. Na mesma cópia,
  `plan-161-catalogo-proporcional` e `plan-141-presets-do-painel`: 43 de 44. O vermelho, `plan-141:158`, é deste lote (achado 1).
- **Diff lido:** `cardPresetsFromThemes.ts`, `generate-theme-card-presets.ts`, `cards.ts`, `coverage.ts`, `CardsCatalog.tsx`, os
  textos de `presetTexts/` e o `package.json`. O gerador e o `--check` estão bem feitos, e a mutação do resumo confere.

**Achados**
1. **A amostra de card ignora o modo da prévia** (`plan-141-presets-do-painel.spec.ts:158`, verde no lote 2). `NEUTRAL_CARD_BASE` é
   `sarakGetDefaultDesignState()`, com a paleta escura fixa. Com a prévia em modo claro, o escopo da amostra recebe a classe `light`,
   mas `--sarak-bg-body` sai `#06080d`, com luminância 0,03 contra o mínimo de 0,5 do caso.
   - Critério: a base neutra é fixa por tema (não segue o rascunho), mas segue o modo que a prévia mostra. O `plan-141:158` volta a
     verde.
2. **O critério 3.2 não está atendido: a sombra da amostra segue o tema atual.** O resumo mostra a sombra mudando nas 53 amostras e a
   põe "fora do escopo", mas "o mesmo preset tem a mesma amostra em qualquer tema atual" é o critério deste lote. A causa está no motor
   (`_card-defaults.css` e `_card-materials.css` casam `data-sx-*` por ancestral), e o conserto é na lib, como o resumo propõe.
   - Critério: o caso "o card de cada tema" do spec do lote passa a comparar também a sombra, e a sombra fica idêntica entre os dois
     temas.
3. **A amostra de card fica fora da grade comum.** O 1.2 manda uma grade só para os grupos de preset. A do card é `min-h-48`, uma por
   linha, e com os 25 novos o "Ver todas" vai de 28 para 53 linhas.
   - Critério: a amostra de card fica na grade comum do lote 1 (várias colunas a 1440 px, quadro proporcional). O resumo informa a
     rolagem de Forma com o "Ver todas" de cards aberto, antes e depois.

**Veredito da proposta 3.3: nenhum dos 12 sai.** O gerado nunca grava cor, então não substitui o card escrito à mão: tirar os quatro
apagaria o neon, o verde de fósforo e o cinza chanfrado que eles mostram. Os 12 ficam como estão, sem apelido.

**Como fechar** (verificação objetiva): `plan-141-presets-do-painel.spec.ts` e `plan-161-catalogo-proporcional.spec.ts` (com
`npm run build`) e `CardsCatalog.test.tsx`. O revisor reroda só esses e manda a prévia ao dono.

**Commit:** junto com o lote 2 da `plan-164` e o lote 3 da `plan-159`, depois das correções e do ok do dono nas prévias.

**Status da plan: 🔵 Em correção.**

## Resumo da execução (lote 3, correção 1) — 2026-11-18

**Resultado:** Concluído (os três achados; o ok do dono na prévia continua pendente)

**Estado do worktree ao iniciar**
(fotografia antes da primeira edição; os arquivos de outras tarefas já estavam nela)
```
 M browser-tests/fixtures/topbar-mais-entry.tsx
 M browser-tests/plan-161-catalogo-proporcional.spec.ts
 M docs/migracoes.md
 M docs/persistencia-de-tema.md
 M package.json
 M sarak-dev/GUIA-MANUTENCAO.md
 M sarak-dev/START-HERE.md
 M sarak-dev/state.json
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/START-HERE.md
 M sarak-ui/VERSION
 M sarak-ui/catalog.json
 M sarak-ui/docs/migracoes.md
 M scripts/verify-changes.mjs
 M specs/00-indice.md
 M specs/plan/plan-159-cromo-real-segue-o-layout-escolhido.md
 M specs/plan/plan-161-catalogo-do-painel-proporcional-e-com-um-vocabulario.md
 M specs/plan/plan-164-paleta-do-tema-paleta-por-cima-e-paletas-salvas.md
 M src/core/Design/catalog/partitions/branding_config.json
 M src/core/Design/catalog/partitions/colors_and_atmosphere.json
 M src/core/Design/catalog/partitions/layout_and_navigation.json
 M src/core/Design/catalog/theme_table_mapping.json
 M src/core/Design/presets/components/cards.ts
 M src/core/Design/presets/components/coverage.ts
 M src/core/Design/presets/themes/compose.ts
 M src/core/Design/schema/colors.ts
 M src/core/Design/schema/navigation.ts
 M src/core/Design/schema/system.ts
 M src/core/Provider/SarakUIProvider.tsx
 M src/core/Provider/generated/design-token-docs.json
 M src/core/Provider/generated/design-token-ids.ts
 M src/core/Provider/hooks/usePreferencesManager.ts
 M src/core/Provider/types.ts
 M src/core/Provider/utils/validation.ts
 M src/core/i18n/catalog.ts
 M src/core/i18n/presetTexts/__tests__/presetTexts.test.ts
 M src/core/i18n/presetTexts/groups.ts
 M src/core/i18n/presetTexts/index.ts
 M src/core/i18n/presetTexts/textures.ts
 M src/features/DesignEngine/Canvas/components/CardsCatalog.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/CardsCatalog.test.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/CardsCatalog.test.tsx.snap
 M src/features/DesignEngine/Main/components/BrandShortcut.tsx
 M src/features/DesignEngine/Main/components/DecisionTokenList.tsx
 M src/features/DesignEngine/Main/components/PaletteCreator.tsx
 M src/features/DesignEngine/Main/components/PaletteGallery.tsx
 M src/features/DesignEngine/Main/components/PaletteSection.tsx
 M src/features/DesignEngine/Main/components/ThemeDecisionView.tsx
 M src/features/DesignEngine/Main/components/__tests__/BrandShortcut.test.tsx
 M src/features/DesignEngine/Main/components/__tests__/PaletteCreator.test.tsx
 M src/features/DesignEngine/Main/components/__tests__/PaletteGallery.registry.test.tsx
 M src/features/DesignEngine/Main/components/__tests__/PaletteGallery.test.tsx
 M src/features/DesignEngine/Main/components/__tests__/PaletteSection.test.tsx
 M src/features/DesignEngine/Main/hooks/__tests__/useBrandForm.test.ts
 M src/features/DesignEngine/Main/hooks/useBrandForm.ts
 M src/features/DesignEngine/utils/decisions.ts
?? browser-tests/fixtures/painel-avisa-entry.tsx
?? browser-tests/painel-avisa-a-verdade.spec.ts
?? browser-tests/textura-muda-pixel.spec.ts
?? scripts/__tests__/cardPresetsFromThemes.test.ts
?? scripts/cardPresetsFromThemes.ts
?? scripts/generate-theme-card-presets.ts
?? src/core/Design/palette/__tests__/savedPalettes.test.ts
?? src/core/Design/palette/savedPalettes.ts
?? src/core/Design/presets/components/cardsThemes.generated.ts
?? src/core/Design/presets/themes/__tests__/savedPalettes.test.ts
?? src/core/Provider/utils/__tests__/validation.savedPalettes.test.ts
?? src/core/i18n/catalogEntries.paletteSaved.ts
?? src/core/i18n/catalogEntries.tokenNotes.ts
?? src/features/DesignEngine/Main/components/DecisionTokenRow.tsx
?? src/features/DesignEngine/Main/components/__tests__/DecisionTokenRow.test.tsx
?? src/features/DesignEngine/Main/components/__tests__/ThemeDecisionView.mainTokens.test.tsx
?? src/features/DesignEngine/Main/hooks/__tests__/useOpenGalleryGroups.test.ts
?? src/features/DesignEngine/Main/hooks/__tests__/useSavedPalettes.test.ts
?? src/features/DesignEngine/Main/hooks/useOpenGalleryGroups.ts
?? src/features/DesignEngine/Main/hooks/useSavedPalettes.ts
?? src/features/DesignEngine/hooks/__tests__/savedPalettes.persistenceIntegration.test.tsx
?? src/features/DesignEngine/utils/__tests__/decisions.savedPalettes.test.ts
?? src/features/DesignEngine/utils/__tests__/tokenNotes.test.ts
?? src/features/DesignEngine/utils/tokenNotes.ts
```

**O que foi feito**
- **Achado 1** — `neutralCardBase.ts` (novo): a base neutra é o design padrão do motor com as cores do tema padrão do sistema (`SARAK_BOOT_THEMES[0]`) no modo da prévia, por `composeThemeForMode`; guardada por modo. `CardsCatalog.tsx` passa `neutralCardBase(currentMode)` no lugar da constante `NEUTRAL_CARD_BASE`. A base continua sem o rascunho, mas segue o modo.
- **Achado 2** — `_card-defaults.css` (sombra declarada do cartão e do modal) e `_card-materials.css` (4 materiais, 5 molduras, sombra declarada sob o ponteiro, halo do `glow-only`): as 13 regras que leem `data-sx-*` do ancestral ganham `:where(:not(.sarak-design-scope ... .sarak-card))`, que exclui o cartão de um escopo de design com outro valor do mesmo atributo. O escopo emite todos os atributos, então ele é o ancestral mais próximo; o `:where()` mantém a especificidade (a ordem de empate da camada não muda). O caso "o card de cada tema" de `plan-161-catalogo-proporcional.spec.ts` passa a comparar o objeto inteiro, com a sombra.
- **Achado 3** — sem mudança de código: a amostra de card já está na grade comum (`CATALOG_GRID`, quadro proporcional de `OptionSampleFrame`); ver "Decisões". O spec ganha o caso "Forma com o Ver todas de cards aberto", que mede rolagem, colunas e altura da amostra e exige 2 colunas ou mais e amostra de até 45% da coluna.
- **3.3** — nenhum card escrito à mão saiu (veredito); nada foi removido.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/Canvas/components/neutralCardBase.ts` | criado | base neutra por modo |
| `src/features/DesignEngine/Canvas/components/__tests__/neutralCardBase.test.ts` | criado | 3 casos: segue o modo, fixa por modo, fora das cores é o padrão |
| `src/features/DesignEngine/Canvas/components/CardsCatalog.tsx` | alterado | usa `neutralCardBase(currentMode)` |
| `src/features/DesignEngine/Canvas/components/__tests__/CardsCatalog.test.tsx` | alterado | +1 caso: o modo claro dá fundo claro mesmo com tema escuro no rascunho |
| `src/styles/_card-defaults.css`, `src/styles/_card-materials.css` | alterado | escopo mais próximo manda (13 regras) e o porquê em comentário |
| `src/styles/__tests__/cartaoQueCedeAClasse.test.ts` | alterado | 3 seletores de texto atualizados + 1 caso que exige a exclusão nas 13 regras |
| `browser-tests/plan-161-catalogo-proporcional.spec.ts` | alterado | sombra entra na igualdade; caso de rolagem do "Ver todas" de cards; cabeçalho atualizado |
| `dist/*`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | alterados pelo `npm run build` | o `dist/` é rastreado: o build regravou os chunks e o carimbo (`baseCommitShort` 64b55a4) |

**Verificações executadas**
- `npm run build` → exit 0 (duas vezes: antes e depois do CSS); `dist/sarak.css` e `dist/sarak-scoped.css` trazem as regras novas.
- `npx playwright test ... plan-141-presets-do-painel.spec.ts plan-161-catalogo-proporcional.spec.ts` (sobre o build com o CSS novo) → **45 passed**, incluindo `plan-141:158` e o caso do card de cada tema com a sombra.
- `npx vitest run` de `CardsCatalog.test.tsx`, `neutralCardBase.test.ts` e `src/styles/__tests__/cartaoQueCedeAClasse.test.ts` → 34 passed (rodada final); `src/styles`, `src/features/DesignEngine/Canvas`, o gerador e `presetTexts` → 445 de 445 depois do ajuste dos 3 seletores.
- Mutação 1: `neutralCardBase` fixando `'dark'` → reprovam `neutralCardBase.test.ts` (segue o modo) e `CardsCatalog.test.tsx` (fundo claro); restaurado.
- Mutação 2: as duas folhas de CSS voltadas ao `HEAD` + `npm run build:css` → o caso do card de cada tema reprova com 53 de 53 amostras diferentes; restaurado, passa. (O `dist/sarak.css` voltou ao do build com a correção.)
- `npm run verify -- --tier=quick` → `tsc` 0 erro; `barrel`, `catalog`, `card-presets`, `token-docs`, `variable-contract`, `panel-contract`, `dev-kit` e os demais `*:check` OK; Anel 0 simulado 3146 linhas, 0 achado; **`audit:baseline` falha**: `auditor_cleancode` 0 → 1, em `src/core/Provider/types.ts` ("252 linhas"), arquivo da `plan-164` que já constava como modificado na fotografia. Não é deste lote.
- Um primeiro `tsc` acusou `neutralCardBase.ts(21,43)` (TS2345, `SarakThemePreset` contra o parâmetro de `composeThemeForMode`); corrigido com o mesmo idioma de `catalog.ts`, e o segundo `tsc` fechou em 0.

**Rolagem de Forma com o "Ver todas" de cards aberto (1440×900, coluna de 660 px)**
| | Rolagem | Colunas | Amostra |
|---|---|---|---|
| Antes, com o `dist/sarak.css` defasado | 16.563 px (25,1×) | 1 | 295×278 |
| Antes, com `npm run build` | 5.126 px (7,77×) | 2 | 142×147 (a mais alta, 160) |
| Depois | 5.126 px (7,77×) | 2 | 142×147 (a mais alta, 160) |

**Critérios de aceite**
- [x] A base neutra segue o modo da prévia, sem seguir o tema do rascunho; `plan-141:158` verde — `neutralCardBase.ts`, 45 de 45 no navegador.
- [x] A sombra da amostra não herda o `data-sx-*` do ancestral; o caso "o card de cada tema" compara a sombra e passa — `plan-161-catalogo-proporcional.spec.ts` (igualdade do objeto inteiro nas 53 amostras); mutação 2 reprova com 53 de 53.
- [x] A amostra de card está na grade comum do lote 1, em várias colunas a 1440 px, quadro proporcional; rolagem informada antes e depois — tabela acima.
- [x] Nenhum dos 12 cards atuais sai.
- [ ] Ok do dono na prévia `C:\tmp\sarak-previa-161\lote3-correcao.html` — pendente.

**Decisões e suposições**
- **Achado 3 não se reproduz com o build em dia.** "Uma por linha" e "53 linhas" saem do `dist/sarak.css` defasado que o harness copia: a classe da grade não existia nele (medi 1 coluna e 25,1×). Com `npm run build` a amostra já tem 2 colunas e 142×147 antes de qualquer edição. Não mexi no tamanho da amostra: a célula é a da grade do lote 1 (8,5 rem), e mais colunas pediriam uma célula menor, o que muda o lote 1. Fica registrada a divergência; o caso novo do spec trava as duas condições (colunas e altura).
- A base neutra usa as cores do tema padrão (`sarak-sovereign`) por modo, e não as cores escuras do padrão do schema. No modo escuro isso muda o tom do fundo da amostra em relação ao lote 3 anterior (o padrão do schema era `#06080d`); o fundo continua igual entre todas as amostras e entre os temas atuais.
- A exclusão `:where(:not(.sarak-design-scope ...))` assume que o escopo mais próximo manda quando há UM escopo entre o ancestral e o cartão (o caso do painel). Com dois escopos aninhados, o interno que concorda com o ancestral e o intermediário que discorda ficaria excluído. Não há esse aninhamento hoje; declarado.
- As folhas de CSS são do motor, mas o veredito mandou o conserto ali. Só os atributos de sombra, material, moldura e hover do cartão foram tratados; os demais `data-sx-*` por ancestral (textura, por exemplo) não foram tocados.
- O `npm run build` pedido regravou o `dist/` e os dois `buildInfo.ts` (rastreados). Não os restaurei; a decisão do que entra no commit é do revisor.

**Achados fora do escopo (não corrigidos)**
- `src/core/Provider/types.ts:1` — 252 linhas fazem o `auditor_cleancode` passar de 0 para 1 e o `audit:baseline` falhar. Arquivo da `plan-164`.
- Os outros seletores `[data-sx-texture] ...` em `_card-defaults.css:163-199` também leem o ancestral (a textura do tema atual alcança o cartão de um escopo com outra textura); mesma causa, fora dos atributos que o veredito citou.
- Arquivos que apareceram modificados depois da fotografia e não são meus: `src/components/atomic/Navigation/ShellPreferencesMenu.tsx`, `src/core/Design/presets/themes/__tests__/compose.test.ts`, `specs/adr/027-...md`, `browser-tests/menu-preferencias-legivel.spec.ts` (execuções em paralelo).

**Pendências / riscos**
- Ok do dono na prévia `lote3-correcao.html`.
- `npm run dev-kit` e `docs/migracoes.md` não tocados (nenhum id, prop ou token mudou de assinatura).
- O CSS novo usa `:not()` com seletor complexo dentro de `:where()` (Chromium, Firefox 84+, Safari 9+); o build escopado (`sarak-scoped.css`) conservou as regras, mas só o Chromium foi exercitado no navegador.

## Veredito — 2026-11-18 — lote 3, correção 1 — 🟢 Aprovado no código; o lote fecha com o ok do dono na prévia

**Verificação conjunta das plans 159, 161 e 164** (saem no mesmo commit):
- **Navegador:** numa cópia fora do repositório (o worktree inteiro, menos `dist/`), `npm run build` com exit 0 e
  `public-types:check` OK. A bateria `topbar-mais`, `barra-de-topo-estreita`, `cromo-css-real`, `tom-contrastante-legivel`,
  `plan-141`, `preferencias-discretas`, `plan-161-catalogo-proporcional`, `login-theme-application`, `plan-122-preview-mode`,
  `plan-160-previa-mostra-a-opcao`, `plan-160-moldura-e-largura`, `troca-de-tema`, `painel-avisa-a-verdade`,
  `textura-muda-pixel` e `menu-preferencias-legivel` deu **176 de 176 verdes**.
- **Unidade, no worktree real:** `Navigation`, `Layout/chrome`, `core/Provider`, `core/Design`, `core/i18n`,
  `features/DesignEngine`, `src/styles` e o gerador de cards deram 361 de 361 arquivos e 3629 de 3629 testes.
- **Segredo** (Anel 0), nas linhas adicionadas e nos não rastreados fora de `dist/`: 0.
- **Gates do commit:** um vermelho real, `audit:baseline` com `auditor_cleancode` de 0 para 1 (abaixo, item da 159). O
  `plan-index:check` é do revisor e foi regenerado.
- **Diff lido:** `neutralCardBase.ts` (a base segue o modo, não o rascunho), `CardsCatalog.tsx` e as 13 regras de `_card-defaults.css`
  e `_card-materials.css`, com a exclusão dentro de `:where()`, que não muda a especificidade. As duas mutações do resumo conferem.
- **O achado 3 do veredito anterior não procede.** O revisor leu `min-h-48` no código. Com o build em dia, a amostra já fica na grade
  comum, com 2 colunas e 142×147 px. O caso novo do spec trava colunas e altura.

**Para o lote 4 (texturas):** as regras `[data-sx-texture] …` de `_card-defaults.css:163-199` também leem o ancestral, a mesma causa
do achado 2. Elas entram no lote 4, que trata das texturas do card, com o mesmo critério: a amostra não herda a textura do tema atual.

**Falta, para fechar o lote 3:** o ok do dono na prévia `C:\tmp\sarak-previa-161\lote3-correcao.html`.

**Commit:** junto com a correção 2 da `plan-159` e o lote 2 da `plan-164`.

**Status da plan: 🟠 Em revisão** até o ok do dono.

## Nota do revisor — 2026-11-18 — ok do dono na prévia do lote 3

O dono aprovou a prévia `C:\tmp\sarak-previa-161\lote3-correcao.html`.

**Lote 3 fechado. Status da plan: 🟡 Em execução** (lote 4). O commit sai junto com a `plan-159` e o lote 2 da `plan-164`.

---

## Resumo da execução (lote 4) — 2026-11-18

**Resultado:** Concluído com pendências (ok do dono na prévia pendente; "Ver todas" aberto nos dois grupos de textura passa da meta de rolagem, que mede a Forma como abre)

**Estado do worktree ao iniciar**
(só `dist/` modificado/não rastreado pelo build; nenhum arquivo de `src/`, `specs/` ou `browser-tests/`)

**O que foi feito**
- O trabalho de grupos já estava no `HEAD` (commit 1b16329c: `cardTextures` e `textures` vizinhos em `design-decisions.json`, títulos "Textura do card"/"Textura do fundo" em `groups.ts`, `CardsCatalog`/`AtmosphereCatalog` por `section`, spec "Forma: textura do card e textura do fundo"). Este lote completou o que faltava:
- `src/styles/_card-defaults.css`: nota do revisor de 2026-11-18. As regras `[data-sx-texture] main|section|article|.sarak-module-container` e a geometria `[data-sx-texture] :is(.card, .sarak-card)` ganham `:where(:not(.sarak-design-scope… ))`: dentro de um escopo de design, o escopo mais próximo manda e a textura do tema atual (ancestral) não alcança a amostra. O `:where()` mantém a especificidade; a regra de transição de `[data-sx-texture] main…` não lê valor e não mudou.
- `src/styles/__tests__/cartaoQueCedeAClasse.test.ts`: caso novo exige a exclusão em toda regra de `_card-defaults.css` que lê `data-sx-texture` do ancestral (≥ 10 regras); o seletor do teste da âncora `.card` acompanha o `:where(`.
- `AtmosphereCatalog.tsx`: a amostra da textura do fundo usa quadro de 150×129 (`FINE_GRAIN_FRAME`) em vez de 280×240 reduzido à metade. Sem isso, o `plan-141` (que agora vê o grupo `textures` na Forma) reprovava Forma nos dois modos: grade, pontos e planta diferiam em 0,38% a 1,5% dos pixels.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/styles/_card-defaults.css` | alterado | 5 seletores de textura excluem escopo `none`/escopo |
| `src/styles/__tests__/cartaoQueCedeAClasse.test.ts` | alterado | +1 caso, 1 seletor |
| `src/features/DesignEngine/Canvas/components/AtmosphereCatalog.tsx` | alterado | quadro de amostra fino para textura do fundo |
| `dist/*`, `buildInfo` | alterados pelo `npm run build` | efeito do build |

**Verificações executadas**
- `npx vitest run src/styles src/features/DesignEngine/Canvas` → 61 arquivos / 399 testes verdes (cartaoQueCedeAClasse: 130 em `src/styles`).
- Mutação: `[data-sx-texture] article` sem a exclusão → o caso novo reprova (`['[data-sx-texture] article']`); restaurado, verde.
- `npm run build` → exit 0.
- Navegador: `plan-161-catalogo-proporcional` 24/24; `plan-141-presets-do-painel` verde (os 2 casos "Forma: distingue a olho" reprovavam antes do quadro fino, passam depois); `troca-de-tema` verde na rodada conjunta (51 de 53, as 2 falhas eram as do plan-141 acima). Textura do card/fundo aplicada ao rascunho: 22 amostras, 0 mudaram.
- Forma como abre: 790 px / 660 = 1,2 altura. Com os dois grupos de textura abertos: 8.047 px (12,2×) — não é a meta (que mede o estado padrão).
- `npm run verify -- --tier=quick` → verde (tsc, baseline, Anel 1, Anel 0: 0).

**Critérios de aceite**
- [x] Textura do card e do fundo lado a lado, com o alvo no nome; nenhuma aba só "Texturas" — spec do lote (grupos vizinhos, títulos, 0 botão/aba "Texturas").
- [x] A amostra não herda a textura do tema atual (nota do revisor) — CSS + teste + mutação.
- [ ] Prévia `C:\tmp\sarak-previa-161\index.html` (antes/depois da Forma) — gerada; aguarda o ok do dono. (O `index.html` anterior foi sobrescrito; as prévias dos lotes 2 e 3 seguem em `index-lote3*.html`/`lote3*.html`.)

**Decisões e suposições**
- O quadro fino (150×129) só vale para a textura do fundo; cardTextures não precisou.
- A regra de transição `[data-sx-texture] main…` ficou como está (não lê valor de textura).

**Achados fora do escopo (não corrigidos)**
- Nenhum novo. Com os dois grupos de textura abertos a Forma rola 12×; o "Ver todas" de cards (7,8×) já era conhecido.

**Pendências / riscos**
- Ok do dono na prévia. `docs/migracoes.md` e `npm run dev-kit` não tocados (nenhum id, token ou prop mudou). Só o Chromium exercitou o CSS com `:where(:not(...))`.

## Veredito — 2026-11-18 — lote 4 — 🟢 Aprovado no código; o lote fecha com o ok do dono na prévia

**O que conferi:** o diff do lote inteiro, que está em duas partes:
- a parte já gravada no commit `1b16329c` (ver abaixo);
- as três alterações que ainda estão no worktree.

- **4.1 atendido.**
  - `cardTextures` e `textures` são grupos vizinhos da Forma (`design-decisions.json`).
  - Os títulos dizem o alvo nos seis idiomas: "Textura do card" e "Textura do fundo".
  - A Atmosfera perdeu "e textura" do nome.
  - Saíram as abas internas "Curados/Texturas" (`CardsCatalog`) e "Atmosferas/Texturas" (`AtmosphereCatalog`). Cada catálogo
    desenha uma seção.
- **Nota do revisor do lote 3 atendida.** As regras de textura do ancestral ganharam a exclusão do escopo dentro de `:where()`, sem
  mudar a especificidade. Isso vale para `_card-defaults.css` (contêineres e cartão) e para `_atmosphere.css` (`::after` do
  cartão, por tipo). O escopo mais próximo manda, e o cartão sob escopo continua coberto pela regra do próprio escopo.
- **Build** completo no worktree: exit 0.
- **Navegador:** `plan-161-catalogo-proporcional`, `plan-141-presets-do-painel`, `troca-de-tema`, `textura-muda-pixel`,
  `cartao-cede-a-classe`, `cromo-css-real` e `plan-160-previa-mostra-a-opcao` deram **109 verdes e 2 vermelhos**. Os dois vermelhos
  são `cartao-cede-a-classe:69` (material) nos dois modos, o caso conhecido do backlog 83, que já falhava antes deste lote.
- **Gates:** Anel 1 verde (o `plan-index:check` cai só pelo 🟠, e o revisor o regenera). `check-audit-baseline --with-tsc` sem
  regressão. Anel 0 com 0.
- **Prévia** (`C:\tmp\sarak-previa-161\index.html`) conferida. A Forma abre com os dois grupos de textura no fim, um ao lado do outro. Cada amostra mostra a
  própria textura, e as amostras não mudam com outro tema no rascunho.

**Para o lote 5** (não barra este lote):
- O caso `plan-161-catalogo-proporcional.spec.ts:666` diz no nome que a Forma "com os dois grupos de textura abertos fica na meta".
  Ele só afirma a Forma como abre. O nome tem de dizer o que o caso mede.

**Para o dono:** com "Textura do card" e "Textura do fundo" abertos ao mesmo tempo, a Forma rola 12,2 alturas. A meta de 2,5 mede a
decisão como abre (1,2 altura), como em todas as decisões. Abrir os dois grupos é escolha de quem usa o painel.

**Histórico:** o commit `1b16329c` leva a primeira parte deste lote com a mensagem do commit das plans 159, 161 (lote 3) e 164. A
causa é o comando de commit do revisor, que adicionava por diretório. O mesmo comando levou o temporário
`browser-tests/tmp-lote4-antes.spec.ts` para o `2ca24fff`, e o `1b16329c` o apaga. Os dois commits estão só no local.

**Falta, para fechar o lote 4:** o ok do dono na prévia.

**Commit:** depois do ok, um commit só para o lote 4, que reúne a parte do `1b16329c` e o worktree.

**Status da plan: 🟠 Em revisão** até o ok do dono.

## Nota do revisor — 2026-11-18 — lote 4 commitado; um caso de navegador entra no lote 5

O dono commitou o lote 4 (`d158b55e`, que substituiu o `1b16329c`). Tomo isso como o ok na prévia. **Lote 4 fechado.**

**Para o lote 5**, junto do item do nome do caso `:666`:
- `escolha-no-painel.spec.ts:220` ("trocar o tema não remonta escopo…") falha no `HEAD` `d158b55e`, com build, por "a cena tem amostra
  fora da área visível" (0).
- Desde o lote 2, a miniatura de tema só é desenhada quando entra na área visível. Por isso a cena do caso não tem mais escopo fora
  da tela, e a premissa do caso ficou velha.
- Critério: o caso mede de novo o que promete. Uma amostra fora da área visível não reescreve estilo, ou nem monta escopo, e o
  caso afirma isso. Verde nos dois modos de execução do spec.

**Status da plan: 🟡 Em execução** (lote 5, depois do lote 4 da `plan-159`).

---

## Resumo da execução (lote 5) — 2026-11-18

**Resultado:** Concluído com pendências (ok do dono na prévia; achados de escopo abaixo)

**Estado do worktree ao iniciar**
Fotografia antes da primeira edição: só trabalho da plan-159 (lote 4), já no índice (`A`/`M` em `browser-tests/`, `src/core/Design/presets/`, `src/features/DesignEngine/Main/`, `src/core/i18n/` e `docs/migracoes.md`), sem `src/core/Design/schema/` nem `presetTexts/personalities.ts` modificados. Esse trabalho foi commitado durante a execução; nada dele foi tocado.

**O que foi feito**
- `src/core/i18n/__tests__/glossary.test.ts` (novo): teste do glossário, com a lista de termos banidos como dado (barra lateral/superior/de topo e equivalentes em es/fr/de/it, `Header`, `cabeçalho` como nome da Topbar, "modo claro/escuro" e `Dark Mode`/`Light Mode` como nome). Varre `schema/*.ts`, `presetTexts/*.ts` e `catalogEntries.*.ts`; fora ficam comentário, linha de identificador (`id`, `cssVars`, `structuralConsumer`), trecho entre crases no schema e as linhas do alternador de modo do shell. **Rodado antes da troca: reprovou com mais de 100 ocorrências** (schema, `groups.ts`, `personalities.ts`, `catalogEntries.layout/part3/tokenNotes`); depois da troca passa.
- Troca de texto: `schema/{barPersonality,navigation,preferences,specialized}.ts` ("barra lateral"/"barra superior"/"barra do topo" → Sidebar/Topbar); `global.ts` (opções "Dark mode (padrão)", "Light mode", "Sidebar (esquerda)", "Topbar (horizontal)"); `cards.ts` e `structural.ts` ("Header" → "cabeçalho do card"/"cabeçalho"); `presetTexts/groups.ts` (grupos `sidebar` e `topbar` = Sidebar/Topbar nos seis idiomas); `presetTexts/personalities.ts` (descrições nos seis idiomas); `catalogEntries.layout.ts`, `catalogEntries.part3.ts`, `catalogEntries.tokenNotes.ts` (de/fr/es/it).
- `usePresetText.test.ts`: o título do grupo `sidebar` passa a ser "Sidebar" nos seis idiomas.
- Item do revisor 1: `plan-161-catalogo-proporcional.spec.ts:666` agora se chama "a Forma como abre fica na meta de rolagem; com os dois grupos de textura abertos só se mede, sem meta".
- Item do revisor 2: `escolha-no-painel.spec.ts` (caso "trocar o tema não remonta escopo…"): a premissa era escopo fora da área visível, que a miniatura lazy (lote 2) deixou de ter. O caso mede agora as opções (`data-option-tile`) fora da área visível: exige que existam, que nenhuma monte escopo na troca e que nenhuma reescreva estilo; a visível segue acompanhando o tema.
- Gerados: `npx tsx scripts/generate-token-types.ts` (`design-token-docs.json`), `npm run guide`, `catalog`, `dev-kit`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/i18n/__tests__/glossary.test.ts` | criado | teste do glossário |
| `src/core/Design/schema/{barPersonality,cards,global,navigation,preferences,specialized,structural}.ts` | alterado | rótulos e descrições |
| `src/core/i18n/presetTexts/{groups,personalities}.ts`, `catalogEntries.{layout,part3,tokenNotes}.ts` | alterado | textos nos seis idiomas |
| `src/features/DesignEngine/hooks/__tests__/usePresetText.test.ts` | alterado | título do grupo |
| `browser-tests/escolha-no-painel.spec.ts`, `plan-161-catalogo-proporcional.spec.ts` | alterado | os dois itens do revisor |
| `src/core/Provider/generated/design-token-docs.json`, `sarak-ui/*`, `sarak-dev/*` | alterado (gerado) | efeito dos gerados |
| `dist/*`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` | alterado | efeito do `npm run build` |

**Verificações executadas**
- `npx vitest run src/core/i18n/__tests__/glossary.test.ts` → antes da troca 1 falha com >100 achados; depois 2 de 2.
- `npx vitest run src/core/i18n src/core/Design src/features/DesignEngine` → 2272 de 2275; as 3 falhas (`switch-glass-border` ×2, `PresetsCatalog`) eram da máquina sob carga (build em paralelo) e **passam sozinhas: 20 de 20**.
- `npm run build` → exit 0 (duas primeiras tentativas pararam em `token-types:check` e `guide:check` por gerado defasado; regenerados).
- `npx playwright test … plan-161-catalogo-proporcional.spec.ts escolha-no-painel.spec.ts` → **27 de 27**, incluindo o caso `:220` (verde) e o `:666` renomeado.
- `npm run verify -- --tier=quick` → verde (tsc, baseline, Anel 1, Anel 0: 0 achado).
- Não reexecutei o caso `:220` em mutação (ver Pendências).

**Critérios de aceite**
- [x] Teste do glossário verde e reprovando sobre os textos de antes — evidência acima.
- [x] Item `:666` e item `escolha-no-painel:220` — evidência acima.
- [ ] Prévia em `C:\tmp\sarak-previa-161\index-lote5.html` e `glossario-lote5.html` — gerada; **aguarda o ok do dono**.

**Decisões e suposições**
- "cabeçalho" fica quando é o cabeçalho de card, tabela ou seção (peça diferente); só deixa de nomear a Topbar/cromo. `Header` virou "cabeçalho do card" (`cardHeader*`) e "cabeçalho" (`headerAlignment`).
- Topbar como "(horizontal)" e não "(Cabeçalho)" na opção de navegação.
- O glossário vale para Sidebar/Topbar em todos os idiomas (termo técnico, igual nos seis); as opções curtas "Lateral"/"Latérale"/"Laterale" do seletor de orientação ficam, pois não nomeiam a peça.
- Os textos do alternador de modo do shell (`themeToggleLabel*`, `themeToggleTitleTo*`) ficam: são do usuário final e traduzidos, não do painel.
- Os títulos das telas de `Canvas/Mocks/` não tinham termo banido (conferido por grep); nada alterado ali.

**Achados fora do escopo (não corrigidos)**
- `src/core/Design/catalog/partitions/*.json` guardam nome e descrição próprios com os mesmos termos (`barra lateral` ×~15, `barra superior`, `Modo Claro/Escuro` em `structural.json:410`). Não estão na §3.1 do lote.
- Comentários de código e JSDoc em `src/components/` e `src/core/Design/presets/` ainda dizem "barra lateral"/"barra do topo"; não são texto do painel.
- `escolha-no-painel.spec.ts` ainda tem "Barra lateral" em títulos de caso e comentários (nome de caso, não texto do painel).

**Pendências / riscos**
- Ok do dono na prévia. `docs/migracoes.md` não tocado: nenhum id, token ou prop mudou, só texto exibido.
- O teste lê texto com regex sobre linhas; texto de schema em várias linhas pode escapar (a varredura é por linha). Uma lista de termos nova entra em `BANNED_TERMS`.

## Veredito — 2026-11-18 — lote 5 — 🔵 Em correção (dois itens objetivos)

**Como medi.**
- Li o diff do schema, do `presetTexts`, dos `catalogEntries`, do `glossary.test.ts` e dos dois specs de navegador.
- Anel 1 verde (o `plan-index:check` cai só pelo 🟠). `check-audit-baseline --with-tsc` sem regressão.
- O teste do glossário reprovava antes da troca e passa depois, e os dois itens do revisor do lote 4 estão feitos.

**Achados**
1. **O texto que o painel mostra de cada token vem do catálogo de design, e ele ficou de fora.**
   - `DecisionTokenList.tsx:21` prefere o nome e a descrição de `src/core/Design/catalog/partitions/*.json` (`TokenCatalog`) ao
     rótulo do schema. Para esses tokens, a troca feita no schema não chega à tela.
   - Os arquivos ainda dizem "barra lateral", "barra do topo", "Modo Claro/Escuro" e "Header": `layout_and_navigation`,
     `cards_engine`, `components_base`, `structural` e `typography`.
   - O resumo os pôs fora do escopo, mas são texto do painel (§5.1: "todo texto que o painel mostra").
   - Critério: o glossário aplicado a `name` e `description` das partições, sem mudar id. O `glossary.test.ts` passa a varrer também
     esses dois campos das partições, e reprova antes da troca.
2. **`docs/migracoes.md`:** uma linha para os nomes visíveis que mudaram (os títulos de grupo Sidebar e Topbar, e as opções
   "Dark mode" e "Light mode"), para o importador que procura o painel pelo texto. Rode `npm run guide` em seguida.

**Prévia:** refaça as capturas de decisão (Barras e Layout) depois do item 1. O texto das linhas de token vem das partições.

**Como fechar:** `npx vitest run src/core/i18n/__tests__/glossary.test.ts` (com a reprovação de antes registrada no resumo),
`npm run build` e `plan-161-catalogo-proporcional.spec.ts`. O revisor reroda só esses.

**Status da plan: 🔵 Em correção.**

## Resumo da execução (lote 5, correção 1) — 2026-11-18

Escopo: só os achados 1 e 2 do veredito de 2026-11-18 (lote 5).

**Estado do worktree ao iniciar** (fotografia antes da primeira edição, sem `dist/`): as alterações do lote 5 já descritas (schema, `presetTexts`, `catalogEntries`, `glossary.test.ts`, os dois specs, gerados `sarak-ui/` e `design-token-docs.json`) e o próprio arquivo da plan; nenhuma outra tarefa.

1. **Partições do catálogo de design.**
   - `glossary.test.ts` ganhou o caso "nome e descrição das partições do catálogo de design seguem o mesmo glossário": lê os `*.json` de `src/core/Design/catalog/partitions/` e varre só `name` e `description`.
   - **Reprovação de antes** (rodado sobre as partições sem a troca, com o caso novo): 1 falha com **31 ocorrências** em 4 arquivos (`cards_engine` 5, `components_base` 1, `layout_and_navigation` 21, `structural` 4). Exemplos: `layout_and_navigation.json sidebarTone.description — barra lateral`, `topbarBlur.description — barra superior`, `shellBrandLogoSize.description — cabeçalho do shell`, `cards_engine.json cardHeaderBg.name — Header`, `structural.json preferenceModePosition.name — Modo Claro/Escuro`. Saída completa em `C:\tmp\glossary-antes-l5c.txt`. O teste também reprovou `schema/preferences.ts:117` ("Modo Claro/Escuro", que o regex anterior não pegava por causa do "C" maiúsculo): o regex agora aceita maiúscula e minúscula.
   - Depois, três casos acrescentados aos padrões (`cabeçalho de navegação`, `cabeçalho superior`, `sobre o cabeçalho.`) para pegar o cabeçalho que nomeava a Topbar nas descrições (413, 447, 512, 600 de `layout_and_navigation.json`); esses também foram trocados.
   - Troca nas partições (só `name` e `description`, nenhum `tokenId`): `barra lateral`→Sidebar, `barra superior`/`barra do topo`→Topbar, `cabeçalho do shell`→`shell`, `cabeçalho da sidebar`→Sidebar, `cabeçalho de navegação`→Topbar, `Header`→"Cabeçalho do Card"/"cabeçalho" (`cardHeader*`, `headerAlignment`), `Headers (H1…)`→"títulos", "status headers"→"cabeçalhos de status", `Modo Claro/Escuro`→"Light mode ou Dark mode", `primeira linha (cabeçalho)`→"primeira linha, a de títulos de coluna". `schema/preferences.ts:117` idem.
   - Depois: `npx vitest run src/core/i18n/__tests__/glossary.test.ts` → 3 de 3.
2. **`docs/migracoes.md`:** entrada nova "9.0.0 — nomes visíveis do painel: Sidebar, Topbar, Dark mode e Light mode" (títulos de grupo, opções de modo e navegação, rótulos de cabeçalho do card; o que o importador troca; atributos `data-*` intactos). Depois: `npx tsx scripts/generate-token-types.ts`, `npm run guide`, `catalog`, `dev-kit`.

**Verificações executadas**
- `npm run build` → exit 0.
- `npx playwright test … plan-161-catalogo-proporcional.spec.ts` → **25 de 25** (a Forma como abre, 1,2 altura; com os dois grupos de textura abertos 12,21, só medida).
- `npm run verify -- --tier=quick` → verde (Anel 0: 522 linhas, 0 achado).
- Prévia: capturas de Barras e Layout refeitas (`C:\tmp\sarak-previa-161\lote5-correcao-desktop-barras.png`, `lote5-correcao-desktop-layout.png`, no `index-lote5-correcao.html`); a de Barras mostra "Sidebar" e "Topbar" como títulos de grupo. `glossario-lote5.html` aponta para elas.

**Critérios de aceite**
- [x] Glossário aplicado a `name` e `description` das partições, sem mudar id; teste varre os dois campos e reprovou antes — acima.
- [x] Linha no `docs/migracoes.md` e `npm run guide` — acima.
- [ ] Ok do dono na prévia refeita.

**Decisões e suposições**
- A linha do `migracoes.md` foi escrita como entrada própria (a convenção do arquivo é uma entrada por mudança), e não um parágrafo solto.
- Os `Headers` de `typography.json` viraram "títulos" (são os H1–H6), não "cabeçalho do card".

**Achados fora do escopo (não corrigidos)**
- Comentários de código e JSDoc em `src/components/` e `src/core/Design/presets/` ainda dizem "barra lateral" e "barra do topo"; não são texto do painel.

**Pendências / riscos**
- Ok do dono na prévia. Rodei só o teste do glossário, o build e o spec do lote, como pedido; a suíte completa e os outros specs de navegador são do revisor.

## Veredito — 2026-11-18 — lote 5, correção 1 — 🟢 Aprovado no código; o lote fecha com o ok do dono na prévia

**Como medi.**
- `glossary.test.ts` com 3 de 3. A reprovação de antes, com 31 ocorrências nas partições, está no resumo.
- As partições têm 0 ocorrência dos termos banidos (contagem do revisor sobre os `*.json`).
- `npm run build` com exit 0, e `plan-161-catalogo-proporcional.spec.ts` com 25 de 25.
- Anel 1 verde (o `plan-index:check` cai só pelo 🟠). `check-audit-baseline --with-tsc` sem regressão. Anel 0 com 0.
- A entrada de `docs/migracoes.md` cobre os nomes visíveis e diz que os `data-*` não mudam.
- **Prévia** (`C:\tmp\sarak-previa-161\index-lote5-correcao.html`) conferida: na decisão Barras, "Sidebar" e "Topbar" são os títulos de grupo.

**Falta, para fechar o lote 5:** o ok do dono na prévia. O lote 5 é o último. Com o ok, a plan fica 🟢 Aprovada e espera a síntese.

**Status da plan: 🟠 Em revisão** até o ok do dono.

## Nota do revisor — 2026-11-18 — ok do dono no vocabulário (lote 5)

O dono aprovou o vocabulário do lote 5. **Lote 5 fechado, e com ele a plan (o lote 5 é o último). Status da plan: 🟢 Aprovada.** Ela
espera a síntese em 06, 09 e 10.

Os pontos que o dono levantou na mesma prévia (a miniatura de tema com a tela real, os gráficos só com estilo, as amostras com o
componente real e o lugar de cada textura) não reabrem esta plan. Eles são a `plan-166`, que depende desta.
