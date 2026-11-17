---
tipo: "plan"
titulo: "Fazer o catálogo do painel proporcional, curto e com um vocabulário só"
objetivo: "Fazer cada decisão do painel caber em cerca de duas telas, com amostras proporcionais (Personalidade em quadrado com o nome, tema como miniatura da prévia real, fontes na mesma grade), presets de card gerados de cada tema, texturas do card e do fundo separadas pelo nome, e um vocabulário único com os termos técnicos em inglês"
dominio: "Painel de customização / Catálogo de opções"
status: "🔴 A executar"
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
- O que a prévia grande mostra e a espiada: `plan-160`. O cromo: `plan-159`. O desempenho: `plan-158`.
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

---

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
