---
tipo: "plan"
titulo: "Gráficos que ocupam o quadro e os ajustes principais do painel nos seis idiomas"
objetivo: "Fazer o SarakChartEngine usar o espaço do quadro em todos os tipos, sem achatar o desenho em quadros médios, e mostrar nos seis idiomas o nome e a descrição dos tokens que aparecem nas decisões principais do painel"
dominio: "Componentes / Gráficos · Painel / Idiomas"
status: "🟠 Em revisão"
prioridade: "Média"
tags: ["plan", "graficos", "i18n", "painel", "release-9-0-0"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/06-painel-de-customizacao-e-preview.md + specs/10-seguranca-e-acessibilidade.md"
---

# 1. Objetivo

1. **Gráficos:** cada tipo do `SarakChartEngine` ocupa o quadro que recebe. Linha, área e barras deixam de virar uma faixa fina, e radar
   e dispersão deixam de sair minúsculos.
2. **Idiomas:** o administrador que usa o painel em inglês, espanhol, francês, alemão ou italiano lê no próprio idioma o nome e a
   descrição de cada token das decisões principais. Hoje esses textos só existem em português.

# 2. Contexto

Promovidos pelo dono em 2026-11-21 para entrar antes da tag 9.0.0. Os dois lotes não dividem arquivo entre si nem com a plan-167, e esta
plan roda em paralelo com ela.

1. **#93 — gráficos achatados.** Na tela "Gráficos" da prévia (plan-166, captura `lote3/depois-graficos-escolher-claro.png`), linha,
   área e barras viram uma faixa fina, e radar e dispersão saem minúsculos.
   - O espaço interno vem de `src/components/engines/charts/SubEngines/useEChartsTheme.ts`: o `grid` usa o dobro de `gridMargin` em cima
     e embaixo, com `containLabel`.
   - O tamanho do radar e da pizza vem dos construtores em `src/components/engines/charts/SubEngines/builders/`.
   - A causa exata não foi medida. Pode ser a margem fixa, a altura que o quadro dá ao motor ou o raio dos tipos polares. O lote 1 mede
     antes de mudar.
   - Vale para todo importador que usa o motor.
2. **Tradução dos ajustes principais.**
   - O painel mostra o nome e a descrição de um token pelo catálogo, que vence o schema (`enhanceToken`, em
     `src/features/DesignEngine/Main/components/DecisionTokenList.tsx`). Os dois só existem em português.
   - Os rótulos do próprio painel já existem nos seis idiomas (`src/core/i18n/catalogEntries.*.ts`, por `useLibraryText`), e os nomes de
     preset também (`src/core/i18n/presetTexts/`).
   - **Decisão do dono (2026-11-21):** nesta plan, só os tokens que aparecem nas decisões principais. Isso cobre os "Ajustes principais"
     (`mainTokens`) e as perguntas de cada decisão (`questionTokenIds`), calculados por `decisionLayers` em
     `src/features/DesignEngine/utils/decisions.ts`.
   - O ajuste fino inteiro fica para outra plan.
   - O vocabulário é o que a [[10-seguranca-e-acessibilidade]] §3.6 já fixa: os termos técnicos em inglês, guardados pelo teste de
     glossário.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/components/engines/charts/SarakChartEngine.tsx` e `src/components/engines/charts/SubEngines/` — o espaço interno e o tamanho dos
  tipos (lote 1).
- `src/features/DesignEngine/Canvas/Mocks/ChartsMock.tsx` — só a altura do quadro de cada gráfico, se o lote 1 medir que ela é a causa.
- `src/core/i18n/` — um arquivo novo de entradas com nome e descrição dos tokens das decisões principais nos seis idiomas (lote 2), e o
  registro dele no catálogo.
- `src/features/DesignEngine/Main/components/DecisionTokenList.tsx` (`enhanceToken`) — ler o nome e a descrição no idioma do painel,
  caindo no catálogo e depois no schema quando o idioma não tiver o texto.
- Testes de unidade dos arquivos acima, o teste de glossário e os snapshots que mudarem por esta plan.
- `browser-tests/` — um spec que mede a área desenhada por tipo de gráfico.
- `docs/migracoes.md` e os gerados (`npm run guide`, `catalog`, `dev-kit`).

## 3.2 Fora (o que NÃO pode ser tocado)

- Os ids, tipos, opções e padrões dos tokens. A tradução é só do texto que o painel mostra.
- `src/core/Design/catalog/partitions/*.json` e `src/core/Design/schema/`: o português continua onde está.
- Os tokens fora das decisões principais (o ajuste fino inteiro fica para outra plan).
- O `type` e as opções que o importador passa ao `SarakChartEngine`. Um gráfico que o importador dimensionou continua com o tamanho dele.
- Os arquivos da plan-167 (`src/styles/_elements.css`, `SarakTitleCard.tsx`, os specs de navegador dela).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §2.1, §6.3 | as decisões, os ajustes principais e a tela "Gráficos" |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §3.6 | o glossário do painel |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-arquitetura-design` | espaço por token, nada fixo |
| **Skill** | `test-e2e` | o spec de área desenhada |
| Código | `src/components/engines/charts/SubEngines/useEChartsTheme.ts` | o `grid` com `gridMargin` |
| Código | `src/features/DesignEngine/utils/decisions.ts` (`decisionLayers`) | quais tokens estão nas decisões principais |
| Código | `src/features/DesignEngine/Main/components/DecisionTokenList.tsx` (`enhanceToken`) | de onde o painel lê nome e descrição |
| Código | `src/core/i18n/catalogEntries.panelColumn.ts` | o formato de entrada nos seis idiomas |

# 5. Instruções de execução

Os dois lotes são independentes e podem rodar em qualquer ordem.

**Lote 1 — #93, gráficos que ocupam o quadro.**

1.1. Escreva um spec de navegador que mede, para cada um dos 8 tipos, a fração do quadro que o desenho ocupa (caixa do traçado sobre a
caixa do componente). Meça em dois tamanhos: o da tela "Gráficos" e um quadro de 600×300.

1.2. Meça hoje e registre no resumo, com a causa de cada tipo achatado.

1.3. Corrija no motor. O espaço interno segue o tamanho do quadro e o tamanho dos rótulos, e cada tipo polar (radar, pizza, gauge) usa o
raio que o quadro permite. Meta: cada tipo ocupa ao menos 60% da altura do quadro nos dois tamanhos, ou o número que a medida do 1.2
mostrar razoável, registrado com o porquê.

1.4. Prévia (antes e depois) da tela "Gráficos", nos dois modos, em `C:/tmp/sarak-previa-168/`.

**Lote 2 — ajustes principais nos seis idiomas.**

2.1. Escreva um teste que lista, por `decisionLayers`, os tokens dos ajustes principais e das perguntas de todas as decisões da coluna.
Grave o total no resumo.

2.2. Crie as entradas com nome e descrição de cada um, em pt, en, es, fr, de e it. O português é o texto de hoje do catálogo.

2.3. `enhanceToken` lê o nome e a descrição no idioma do painel. Sem texto no idioma, cai no catálogo e depois no schema, como hoje.

2.4. Escreva um teste que reprova token das decisões principais sem os seis idiomas. O teste de glossário passa a varrer as entradas novas.

2.5. Prévia do painel em inglês e em alemão, com uma decisão aberta, em `C:/tmp/sarak-previa-168/`.

**Verificação, em cada lote:** `npm run build`, os specs e testes tocados e `npm run verify -- --tier=quick`.

# 6. Critérios de aceite

- [ ] Lote 1: área desenhada por tipo medida antes e depois; cada tipo na meta nos dois tamanhos; o spec de navegador a guarda.
- [ ] O gráfico do importador com tamanho próprio continua com o tamanho dele.
- [ ] Lote 2: todo token das decisões principais com nome e descrição nos seis idiomas, e um teste que reprova o que faltar.
- [ ] O glossário passa nas entradas novas.
- [ ] Os tokens de fora das decisões principais continuam como hoje.
- [ ] `tsc` 0, baseline sem regressão, Anel 1 verde, `docs/migracoes.md` atualizado e os gerados regenerados.
- [ ] Prévia de cada lote em `C:/tmp/sarak-previa-168/`, com o ok do dono.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum. Os invariantes são o spec de área desenhada e o teste de idiomas.

- `git diff --stat` → só os arquivos de §3.1.
- `npm run build` e o spec de área desenhada, com `plan-141-presets-do-painel` (os gráficos da amostra mudam de tamanho) → verde.
- `npx vitest run src/core/i18n src/features/DesignEngine src/components/engines/charts` → verde.
- Anel 1, `check-audit-baseline --with-tsc` e Anel 0 sobre as linhas adicionadas.

# 8. Destino da síntese

**Destino:** `specs/06-painel-de-customizacao-e-preview.md + specs/10-seguranca-e-acessibilidade.md`

- **06 §6.3:** os gráficos ocupam o quadro, com a meta medida.
- **06 §2.1:** o nome e a descrição dos tokens das decisões principais seguem o idioma do painel, com a ordem de recuo.
- **10 §3.6:** o glossário cobre também essas entradas.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

### Lote 1 — continuação após interrupção (2026-11-21)

**Área desenhada dentro do quadro**, medida em percentuais da largura × altura do frame. Cada tipo foi medido em `340×192` e `600×300`, nos temas claro e escuro; os resultados dos temas coincidiram. “Antes” usa as capturas anteriores preservadas; “depois” usa a execução atualizada do spec de navegador.

| Tipo | Quadro | Antes | Depois |
|---|---:|---:|---:|
| line | 340×192 | 54,3% × 16,2% | 71,0% × 66,2% |
| line | 600×300 | 67,9% × 33,8% | 77,4% × 75,8% |
| area | 340×192 | 54,3% × 18,2% | 71,0% × 66,2% |
| area | 600×300 | 67,9% × 45,8% | 77,4% × 75,8% |
| bar | 340×192 | 73,0% × 41,1% | 88,1% × 76,6% |
| bar | 600×300 | 82,9% × 62,3% | 91,4% × 85,0% |
| pie | 340×192 | 37,8% × 66,3% | 53,9% × 95,0% |
| pie | 600×300 | 36,7% × 73,2% | 47,7% × 95,1% |
| radar | 340×192 | 45,3% × 42,0% | 67,7% × 89,9% |
| radar | 600×300 | 47,6% × 45,7% | 65,4% × 89,4% |
| scatter | 340×192 | 58,8% × 16,4% | 75,4% × 66,4% |
| scatter | 600×300 | 70,5% × 33,9% | 79,9% × 75,9% |
| heatmap | 340×192 | 68,3% × 16,4% | 87,8% × 65,4% |
| heatmap | 600×300 | 82,1% × 46,5% | 93,1% × 77,8% |
| gauge | 340×192 | 61,5% × 53,7% | 75,4% × 72,5% |
| gauge | 600×300 | 62,6% × 59,1% | 72,5% × 72,5% |

Nas 16 medições por tema, o `chartSize` coincide com o tamanho do frame e a altura desenhada depois fica acima de 60%. As capturas mostram a diferença visual: antes, line/area/scatter e heatmap ficavam comprimidos na vertical; radar ocupava pouco espaço; depois, os oito tipos usam melhor o quadro.

**Causas e ajustes do lote:** o engine aplicava padding interno de 24 px e o tema usava margens fixas do grid, comprimindo a área útil, sobretudo em quadros menores. O padding foi removido e as margens passaram a acompanhar o tamanho dos rótulos. Line, area e scatter passaram a escalar o eixo Y aos dados; barras mantêm a origem zero por semântica. Pie passou de raio externo 85% para 95%; radar passou a calcular o máximo dos indicadores a partir dos dados com 5% de folga e raio 90%; gauge passou a usar raio 90%.

**Verificações executadas:**

- `npm run build`: geração de JS, tipos, fontes e CSS concluiu; o processo terminou com erro no passo final `test:optional-peers`, ao tentar criar link simbólico em `node_modules/.vite-temp` (Windows `EPERM` no ambiente isolado). Não houve repetição com contorno de sandbox.
- `npx vitest run src/components/engines/charts`: **14 arquivos, 186 testes aprovados**; inclui expectativas atualizadas para as margens responsivas e snapshots de pie, radar e gauge.
- Spec de área desenhada `browser-tests/plan-168-graficos-area.spec.ts`: **1 aprovado**, incluindo a checagem de que o tamanho do gráfico corresponde ao frame nas medições posteriores. Executado sem outra bateria de navegador concorrente.
- `npm run verify -- --tier=quick`: aprovado, com `tsc`, baseline de auditoria, gates rápidos, verificação do índice e Anel 0 (1740 linhas, 0 achados).
- `plan-141-presets-do-painel` (verificação complementar prevista na §7): **24/27 aprovados**. Três falhas de comparação visual ocorreram em presets de fontes e textura de cartão; não são arquivos nem funcionalidades deste lote e não foram alteradas.
- `git diff --check` direcionado aos arquivos do plano 168 e às alterações de charts: aprovado.

**Prévias e pendências operacionais:** as quatro imagens e os JSONs de medição estão em `C:\Users\Igor\AppData\Local\Temp\sarak-previa-168\` (`antes-graficos-light.png`, `antes-graficos-dark.png`, `depois-graficos-light.png`, `depois-graficos-dark.png`, `medicao-antes.json`, `medicao-depois.json`). A criação de `C:\tmp\sarak-previa-168\` foi negada pelo sandbox; por isso, a prévia solicitada nesse caminho não foi gravada ali. O status permanece `🔴 Em execução`; `specs/00-indice.md` reserva ao revisor a atualização sincronizada do status do plano e do índice. Nenhum commit foi criado.

---

## Resumo da execução (correção 1) - 2026-11-21

**Resultado:** Concluído com pendências de build e gates compartilhados.

**Estado do worktree ao iniciar:** compartilhado e já alterado. A fotografia mostrou alterações em `browser-tests/build-harness.mjs`, no spec e fixture antigos da 168, nos fontes e testes de charts, nos artefatos `dist/`, na plan 168 e nas plans 167, 169 e 170, além de mudanças de outras execuções. Os arquivos preexistentes foram preservados; esta correção não editou as plans 167, 169 e 170.

**O que foi feito por achado do veredito:**

1. **Eixo Y no zero:** removido `scale: true` de line, area e scatter em `src/components/engines/charts/SubEngines/axisOptions.ts`. O spec confere que o limite inferior é zero nos cinco tipos cartesianos (line, area, bar, scatter e heatmap).
2. **Rótulos do radar:** raio reduzido para 70% em `advancedCharts.ts`. O teste percorre os elementos renderizados pelo RadarView e cobra os rótulos 1 a 7 inteiramente dentro dos quadros `340×192` e `600×300`.
3. **Bateria normal e `dist/`:** o spec foi renomeado para `browser-tests/graficos-ocupam-o-quadro.spec.ts`, a fixture ganhou nome correspondente e usa `buildHarness` sem `useSourceLibrary`, portanto lê `dist/` e entra em `browser-tests/playwright.config.ts`. Removida a configuração dedicada `plan-168-playwright.config.ts`; retirados `SARAK_168_CSS` e o parâmetro `cssPath` de `build-harness.mjs`. A métrica cartesiana usa o retângulo do grid (área de plotagem), enquanto pizza, radar e gauge usam a geometria desenhada pelo tipo, conforme G1(a).
4. **Migração e kits:** incluída nota `9.0.0` em `docs/migracoes.md` explicando a mudança visual e a escala zero; regenerados `catalog`, kit consumidor (`guide`) e kit mantenedor (`dev-kit`). O `guide` foi regenerado novamente depois da inclusão da nota.

**Área de plotagem/desenho depois da correção** (largura × altura sobre o quadro; claro e escuro coincidem):

| Tipo | Quadro 340×192 | Quadro 600×300 |
|---|---:|---:|
| line | 79,0% × 65,1% | 88,1% × 77,7% |
| area | 79,0% × 65,1% | 88,1% × 77,7% |
| bar | 79,0% × 65,1% | 88,1% × 77,7% |
| pie | 53,9% × 95,0% | 47,7% × 95,1% |
| radar | 63,9% × 81,3% | 62,1% × 80,9% |
| scatter | 84,0% × 65,1% | 90,9% × 77,7% |
| heatmap | 87,6% × 65,1% | 93,0% × 77,7% |
| gauge | 75,4% × 72,5% | 72,5% × 72,5% |

O registro anterior permanece acima por ser append-only. Ele media a caixa dos elementos da série. Conforme G1(a), o limite de 60% agora é avaliado na caixa de plotagem dos tipos cartesianos; os percentuais históricos de line/area/scatter não são diretamente comparáveis. No resultado atual, os cinco eixos cartesianos têm mínimo zero e ambos os quadros do radar exibem os sete rótulos sem corte.

**Verificações executadas:**

- `npx vitest run src/components/engines/charts/SubEngines/builders/__tests__/builders.characterization.test.ts --update`: **18/18 aprovados**, um snapshot do raio do radar atualizado.
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/graficos-ocupam-o-quadro.spec.ts --workers=1`: **1 aprovado** pela configuração normal, lendo `dist/`; mediu 8 tipos em 2 tamanhos e 2 modos, além do zero nos eixos e dos rótulos do radar.
- `npx playwright test --config=browser-tests/playwright.config.ts browser-tests/plan-141-presets-do-painel.spec.ts --workers=1 --timeout=240000`: execução isolada válida, **25/27 aprovados**. Falharam as comparações visuais de Fontes: modo escuro (`pair-technical × pair-futuristic = 0,82%`, `typo-inter × typo-space-grotesk = 0,00%`, `typo-playfair-display × typo-bebas-neue = 0,00%`) e modo claro (os mesmos três pares com `0,00%`). Os demais 25 passaram. A tentativa anterior sem `SARAK_CHROMIUM_EXECUTABLE_PATH` abortou antes dos casos e foi repetida com o Chrome instalado.
- `npm run build`: os gates, a geração JS/types, fontes e CSS passaram com o guia atualizado; o processo falhou em `scripts/inject-css.mjs` por não encontrar `__SARAK_CSS_PLACEHOLDER__` nos arquivos JS de `dist/`. O erro repetiu em duas execuções completas; o spec de gráficos rodou depois com `dist/index.js` e `dist/sarak.css` disponíveis.
- `npm run verify -- --tier=quick`: falhou no baseline de auditoria. `run_audit.mjs` localizou `SarakMenuItem.tsx:132` (valor fixo `1px` e `--sarak-nav-active-indicator-color` sem registro) e violações R10 em `SarakMultiSelect.tsx:118` e `SarakUploader.tsx:118` (inputs nativos). `SarakMenuItem.tsx` apareceu alterado no worktree durante a rodada; não foi tocado nesta correção. Os achados ficaram fora do escopo.
- `git diff --check` direcionado aos fontes de charts, documento de migração e plan 168: sem erro de whitespace (Git emitiu aviso CRLF/LF para `docs/migracoes.md`).

**Prévias:** antes da correção (`antes-correcao-graficos-light.png`, `antes-correcao-graficos-dark.png`) e estado final (`depois-graficos-light.png`, `depois-graficos-dark.png`, `medicao-depois.json`) em `C:\Users\Igor\AppData\Local\Temp\sarak-previa-168\` (`%TEMP%`).

**Critérios de aceite:** medição do lote 1, eixo zero, radar sem rótulos cortados, spec na bateria normal lendo `dist/`, nota 9.0.0 e kits regenerados: implementados. Build completo permanece pendente pelo erro de `inject-css`; `verify --tier=quick` permanece pendente pelos achados listados. Nenhum commit foi criado.

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-11-21 — lote 1 — 🔵 Em correção (quatro itens objetivos e a decisão G1)

**Como medi:** li o resumo, o diff de `src/components/engines/charts/` e o spec novo com a configuração dele. Olhei
`depois-graficos-light.png` (em `C:\Users\Igor\AppData\Local\Temp\sarak-previa-168\`).

A área útil melhorou de fato. Linha, área, dispersão e mapa de calor deixaram de ser uma faixa fina, e pizza e radar ocupam o quadro.

**Achado 1 — a área não começa no zero.** `axisOptions.ts` passou a usar `scale: true` em `line`, `area` e `scatter`. Na captura, o eixo
da área começa em 30. Num gráfico de área, a altura preenchida é lida como o tamanho do valor, então ela precisa partir do zero, como
as barras. Ver também a decisão G1.

**Achado 2 — o rótulo "1" do radar sumiu.** Com raio de 90%, o rótulo do primeiro indicador (no topo) sai do quadro. Na captura
aparecem só os rótulos de 2 a 7. O raio deixa espaço para os rótulos, e todo indicador tem o rótulo visível nos dois tamanhos. O spec
cobra isso.

**Achado 3 — o spec novo não entra na bateria.** `browser-tests/plan-168-graficos-area.spec.ts` roda por uma configuração própria
(`browser-tests/plan-168-playwright.config.ts`), lê o código-fonte (`useSourceLibrary: true`) e aceita outro CSS por
`SARAK_168_CSS`, pelo parâmetro novo `cssPath` de `browser-tests/build-harness.mjs`. O `cromo-css-real:check` não o roda, e ele não
mede o `dist/` que o importador recebe.
**Correção:**
- o spec entra na configuração da bateria, lendo o `dist/` como os demais;
- ganha um nome pelo que prova, sem número de plan (por exemplo, `browser-tests/graficos-ocupam-o-quadro.spec.ts`), que é a regra do
  backlog #58;
- a configuração própria sai, e o `cssPath` volta ao que era em `build-harness.mjs`.

**Achado 4 — falta a nota de migração.** O importador vê os gráficos mudarem: margens, raio de pizza, radar e gauge, e o eixo, se a G1
mantiver o `scale`. Vai uma nota em `docs/migracoes.md` (9.0.0), e o kit é regenerado.

**Decisão G1 do dono — o eixo Y de linha e de dispersão:**
- **(a) Recomendação do revisor:** o eixo parte do zero em todos os tipos, como antes. Só o espaço interno, as margens e os raios mudam.
  É o escopo da plan, que era tirar o achatamento, e o significado do eixo não muda para quem já usa a lib. A meta de altura vale para a
  área de desenho, e não para a altura dos dados.
- **(b)** Linha e dispersão ajustam o eixo aos dados (`scale: true`); a área volta ao zero.

**Sobre o `plan-141` (3 de 27 vermelhos, em fontes e textura do card):**
- **Não atribuo à 168:** nada do lote toca nisso, e a rodada foi feita com outros executores mexendo no `dist/`.
- **Depois da correção:** o executor roda o `plan-141` sozinho. Se os mesmos 3 caírem, lista quais são no resumo, e o revisor cruza com
  a bateria consolidada da 167.

**`EPERM` no build:** o mesmo do sandbox (veredito de build isolado da plan-167). O build completo passou fora do sandbox.

**Status da plan: 🔵 Em correção.**

## Veredito — 2026-11-21 — lote 1 (correção 1) — 🟢 Aprovado; segue o lote 2

**Como medi:**
- li o resumo e o diff de `src/components/engines/charts/`;
- `axisOptions.ts` voltou ao HEAD, sem `scale`;
- `browser-tests/plan-168-playwright.config.ts` e o `cssPath` de `browser-tests/build-harness.mjs` não existem mais;
- `browser-tests/playwright.config.ts` (`testMatch: '**/*.spec.ts'`) apanha `browser-tests/graficos-ocupam-o-quadro.spec.ts`;
- olhei `depois-graficos-light.png`: eixo do zero em linha, área, barra e dispersão, e os 7 rótulos do radar visíveis;
- rodei `npm run audit:baseline`, igual ao baseline.

**Decisão G1:** (a), conforme o prompt de correção.

**Os quatro achados estão resolvidos:**
- eixo no zero nos cinco tipos cartesianos, cobrado no spec;
- radar com 70% de raio e os rótulos de 1 a 7 dentro do quadro nos dois tamanhos;
- o spec entra na bateria normal e lê o `dist/`;
- a nota 9.0.0 está em `docs/migracoes.md`, com o kit regenerado.

**Pendências do resumo, nenhuma delas da 168:**
- **`verify --tier=quick` vermelho (`SarakMenuItem`, `SarakMultiSelect`, `SarakUploader`):** era estado transitório da 170 no worktree compartilhado. Na minha rodada, o `audit:baseline` está igual ao baseline.
- **`inject-css` sem placeholder:** a mesma corrida de builds concorrentes do veredito da plan-167.
- **`plan-141` com 2 de 27 vermelhos, só em Fontes:** a textura do card já não cai. Fica para a bateria consolidada da 167; não é atribuído à 168.

**Nota para o lote 2:** o spec tem `SARAK_CHART_AREA_STAGE=antes`, que desliga todas as asserções. Numa bateria, uma variável que faz o teste passar sem conferir nada é o tipo de gate que a plan-169 fecha. Sai no lote 2: a prévia "antes" já foi feita.

**Commit:** o do lote 1 sai junto com o do lote 2. `docs/migracoes.md` e `sarak-ui/` estão divididos com a 170 e a 169 no worktree.

**Status da plan: 🟡 Em execução (lote 2).**

## Nota do revisor — 2026-11-21 — prévia do lote 1 aprovada pelo dono

O dono aprovou a prévia `depois-graficos-{light,dark}.png` (em `C:\Users\Igor\AppData\Local\Temp\sarak-previa-168\`). O commit do lote 1 sai junto com o do lote 2.

## Veredito — 2026-11-21 — lote 2 — 🔵 Em correção (descrições em modelo e rótulos sem tradução)

**Por que este registro:** o executor não conseguiu gravar o resumo. A sessão recusou edições com `file:///workspace`. O relato chegou
pelo dono, e o revisor mediu o worktree:
- `src/core/i18n/catalogEntries.decisionTokens.ts`;
- `src/features/DesignEngine/utils/__tests__/decisionTokenTexts.test.ts`;
- `painel-en.png` e `painel-de.png` em `C:\Users\Igor\AppData\Local\Temp\sarak-previa-168\`.

**O que está certo:**
- os 58 tokens das decisões principais saem do contexto real (`decisionLayers`) e o teste cobra a lista;
- o português preserva o catálogo atual;
- na prévia em inglês, os rótulos da coluna aparecem traduzidos;
- `SARAK_CHART_AREA_STAGE` saiu do spec dos gráficos.

**Achado 1 — a descrição nos outros cinco idiomas é um modelo, não uma descrição.** Em `en`, `es`, `fr`, `de` e `it`, toda descrição é
`DESCRIPTION_PREFIX` com o nome dentro: "Controls how Primary color is used by the theme.". Ela repete o rótulo e não diz o que o
ajuste faz, ao contrário da descrição em português que ela substitui. O teste passa porque só cobra texto não vazio.
**Correção:**
- cada descrição é a tradução da descrição em português do mesmo token, e `DESCRIPTION_PREFIX` sai;
- o mesmo vale para o modelo `Ajusta ${names.pt} no tema.`, usado quando o token não tem descrição: o token sem descrição ganha uma
  escrita;
- o teste reprova a descrição que contenha o próprio nome do token como única informação, ou que seja igual em dois idiomas.

**Achado 2 — rótulos copiados do inglês.** Há 17 rótulos com o texto em inglês em `es`, `fr`, `de` ou `it`:
- `sidebarPosition` e `sidebarWidth`, nos quatro idiomas;
- `sidebarResizable`, nos quatro idiomas;
- `navbarLayout`, `sidebarTone`, `topbarTone`, `chromeSearchPosition`, `chromeUserPosition`, `sidebarLogoPlacement` e
  `sidebarLabelMaxWidth`, em `es`.
**Correção:** traduzir todos. O teste reprova o rótulo de `es`, `fr`, `de` ou `it` igual ao de `en` (Sidebar e Topbar podem aparecer
*dentro* do rótulo, como nome de peça).

**Achado 3 — os botões da barra de ações continuam em português.** Na prévia em inglês, "APLICAR" e "DESCARTAR" aparecem em português.
`src/features/DesignEngine/Main/components/ThemeActionBar.tsx:10-11` escreve os textos à mão. Estão na mesma tela das decisões
principais. **Correção:** ler pelo `useLibraryText`; "Descartar" já existe em `catalogEntries.system.ts`.

**Limpeza:** apagar os temporários da prévia, `browser-tests/fixtures/plan-168-preview-temp.tsx` e
`browser-tests/run-plan168-preview-temp.mjs`.

**Fechamento:** `verify -- --tier=quick` verde depois da mudança do teste para `features/` e o resumo na §9. O `EPERM` do build é do
sandbox (veredito da plan-167). O revisor confirma o build completo no fechamento.

**Fora da 168:** `ThemeDecisionList.tsx` perdeu o `hover:bg-…/10`. Isso é do lote 2 da 167 (hover de botão), não daqui.

**Status da plan: 🔵 Em correção.**

## Nota do revisor — 2026-11-21 — vermelho de unidade para a correção do lote 2

`src/features/DesignEngine/Canvas/components/__tests__/PresetSamples.test.tsx` › "a amostra de gráfico é um único gráfico real, do mesmo tipo em todas as opções" cai rodando sozinho (`STACK_TRACE_ERROR`). Entra na correção do lote 2. O filtro rodado inclui `src/features/DesignEngine/Canvas` e `src/components/engines/charts`.

## Resumo da execução (correção 1 do lote 2) — 2026-11-22

**Resultado:** Concluído

**Estado do worktree ao iniciar**
Compartilhado com as plans 167, 169 e 170 (cerca de 140 linhas, `dist/` regenerado incluído). Já não rastreados e meus do lote 2: `src/core/i18n/catalogEntries.decisionTokens.ts` e `src/features/DesignEngine/utils/__tests__/decisionTokenTexts.test.ts`. Os temporários `browser-tests/fixtures/plan-168-preview-temp.tsx` e `browser-tests/run-plan168-preview-temp.mjs` apareciam como `??`.

**O que foi feito**
- Achado 1: `catalogEntries.decisionTokenDescriptions.ts` e `.chrome.ts` (novos, divididos para caber no teto de linhas do auditor) trazem a descrição de cada um dos 58 tokens em en/es/fr/de/it, traduzida da descrição em pt. `DESCRIPTION_PREFIX` e o modelo `Ajusta … no tema.` saíram de `catalogEntries.decisionTokens.ts`; o pt vem só do catálogo/schema, sem texto de reserva.
- Achado 2: `catalogEntries.decisionTokens.ts` — traduzidos os rótulos copiados do inglês (`sidebarPosition`, `sidebarWidth`, `sidebarResizable` nos quatro idiomas; `navbarLayout`, `sidebarTone`, `topbarTone`, `chromeSearchPosition`, `chromeUserPosition`, `sidebarLogoPlacement`, `sidebarLabelMaxWidth` em es). Também `mobileNavigationStyle` em de, que o teste novo acusou igual ao inglês.
- Achado 3: `ThemeActionBar.tsx` lê "Aplicar" por `themeApplyAction` (chave nova em `catalogEntries.panel.ts`) e "Descartar" por `settingsDiscard` (já existia). `ACTION_LABELS` saiu.
- `decisionTokenTexts.test.ts`: dois testes novos — rótulo de es/fr/de/it igual ao de en reprova; descrição que contém o próprio nome (fora do pt), com menos de 20 letras além do nome, ou igual à de outro idioma reprova.
- `DecisionTokenList.test.tsx`: a expectativa da descrição em inglês passou a ser o texto real (o modelo antigo estava cravado ali).
- `PresetSamples.test.tsx` (nota do revisor): o teste do laço de gráficos passou a ter teto de 30 s (`CHART_LOOP_TIMEOUT_MS`); cada render do Provider custa ~1 s no jsdom e o laço faz um por opção, então o teto padrão de 5 s não cobria.
- Apagados `plan-168-preview-temp.tsx` e `run-plan168-preview-temp.mjs`.
- Uma descrição em es dizia "modo claro, modo oscuro" e o glossário reprovou; reescrita.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/i18n/catalogEntries.decisionTokens.ts` | criado (não rastreado) | rótulos traduzidos; sem prefixo/modelo |
| `src/core/i18n/catalogEntries.decisionTokenDescriptions.ts` | criado | descrições, tema/cor/forma |
| `src/core/i18n/catalogEntries.decisionTokenDescriptions.chrome.ts` | criado | descrições, cromo/preferências/marca |
| `src/core/i18n/catalogEntries.panel.ts` | alterado | `themeApplyAction` |
| `src/features/DesignEngine/Main/components/ThemeActionBar.tsx` | alterado | botões por `useLibraryText` |
| `src/features/DesignEngine/utils/__tests__/decisionTokenTexts.test.ts` | criado (não rastreado) | dois testes novos |
| `src/features/DesignEngine/Main/components/__tests__/DecisionTokenList.test.tsx` | alterado | expectativa da descrição em en |
| `src/features/DesignEngine/Canvas/components/__tests__/PresetSamples.test.tsx` | alterado | teto de 30 s no laço |
| `browser-tests/fixtures/plan-168-preview-temp.tsx`, `browser-tests/run-plan168-preview-temp.mjs` | removidos | temporários da prévia |

**Verificações executadas**
- `npx vitest run decisionTokenTexts.test.ts DecisionTokenList.test.tsx ThemeActionBar*` → 3 arquivos, 24 testes verdes.
- `npx vitest run src/core/i18n src/features/DesignEngine/utils` → vermelho só no glossário (acima); depois `glossary.test.ts` + `PresetSamples.test.tsx` → 32 testes verdes.
- `npm run verify -- --tier=quick` → 1ª vez falhou no baseline (arquivo de descrições com 412 linhas, `auditor_cleancode` 0→1); dividido em dois (197 e 222 linhas); 2ª e 3ª vezes → "nível quick verde", Anel 0 simulado 3641 linhas, 0 achados.
- Prévia: `painel-en.png` e `painel-de.png` refeitas em `%TEMP%\sarak-previa-168\`, com a decisão "Barras" aberta; botões APPLY/DISCARD e ANWENDEN/VERWERFEN traduzidos; rótulos da coluna traduzidos.

**Critérios de aceite**
- [x] Achado 1, 2 e 3 corrigidos, com teste que reprova a regressão (os dois testes novos; `ThemeActionBar` coberto pelos testes de painel).
- [x] Temporários apagados.
- [x] `verify --tier=quick` verde.
- [ ] Build completo: não rodei (o `EPERM` é do sandbox, veredito da plan-167); fica com o revisor.

**Decisões e suposições**
- O teste de descrição usa "contém o próprio nome" só fora do pt, porque o pt é o texto do catálogo e preserva o que já existia.
- O limiar de 20 letras além do nome é meu; o revisor pode ajustá-lo.
- Prévia feita com um script em scratchpad sobre o fixture `plan-141-presets-entry.tsx` (já existente, aceita `?idioma=`), sem criar arquivo no repositório. A lista "Ajuste fino" não aparece expandida nas capturas.

**Achados fora do escopo (não corrigidos)**
- Na prévia em inglês, o painel ainda mostra "Avançado", "Personalizar o tema" e "EXECUTAR" em português, e o preview mostra "Meu sistema" e outros textos de amostra em português.

**Pendências / riscos**
- `ThemeDecisionList.tsx` (hover) é da 167, não tocado.

## Veredito — 2026-11-22 — lote 2 (correção 1) — 🟠 Aprovado tecnicamente; espera o ok do dono na prévia

**Como medi:**
- li o diff e amostrei descrições contra o português de origem (`subtitleColor`, `sidebarActiveItemStyle`, `sidebarTone`, `topbarTone`);
- olhei `painel-en.png` e `painel-de.png`;
- rodei a suíte inteira (6755 verdes; o único vermelho, `PresetsCatalog`, cai também no `HEAD` e foi para a plan-169), o `tsc` (0 erros),
  o `audit:baseline` (igual) e o Anel 0 (0 achados).

**Os três achados saíram:** descrições traduzidas, sem modelo; rótulos traduzidos, com teste que reprova cópia do inglês; "Aplicar" e
"Descartar" pelo catálogo. Os temporários foram apagados. A amostra não cobre as 290 descrições: o resto é garantido só pelo teste.

**Teto de 30 s no `PresetSamples`: aceito.** Não esconde lentidão da 168. Nas mesmas condições, o caso leva 3,7 s no `HEAD` e 3,0 a 3,3 s
agora. Na suíte inteira chega a 4,8 s, colado nos 5 s, porque renderiza o Provider uma vez por opção.

**O que a prévia mostra:** os rótulos da decisão Barras e os botões nos dois idiomas. As descrições não aparecem nela.

**Textos em português fora dos 58 tokens:** backlog #94.

**Status da plan: 🟠 Em revisão** (só o ok do dono).
