---
tipo: "plan"
titulo: "Montar as amostras do painel com o componente real, medindo o custo antes"
objetivo: "Fazer a miniatura de tema mostrar a tela real do sistema com o tema aplicado e cada amostra de card, textura, gráfico, tabela, modal, aviso, estado vazio e progresso ser o componente real como a aplicação o desenha, com o custo de abrir cada decisão medido e dentro do teto aprovado pelo dono"
dominio: "Painel de customização / Amostras e prévia"
status: "🟡 Em execução"
prioridade: "Média"
tags: ["plan", "painel", "amostras", "miniatura", "graficos", "desempenho"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[09-temas-e-presets]]", "[[07-responsividade-e-multidispositivo]]"]
depende_de: "plan-161"
retida_por: ""
destino_sintese: "specs/06-painel-de-customizacao-e-preview.md + specs/09-temas-e-presets.md"
---

# 1. Objetivo

O administrador vê, em cada opção do painel, o que a aplicação vai desenhar: a miniatura de tema é a tela real do sistema com o tema
aplicado, e as amostras de card, textura, gráfico, tabela, modal, aviso, estado vazio e progresso são o componente real da lib. Abrir
cada decisão custa no máximo o teto que o dono aprovar depois da medição do lote 1.

# 2. Contexto

Pedido do dono em 2026-11-18, ao avaliar a prévia do lote 5 da `plan-161`: as amostras devem "representar a realidade fielmente". Ele
apontou quatro pontos e decidiu cada um na conversa:

1. **Miniatura de tema.** Hoje `ThemeMiniature` (`Canvas/components/PresetCard.tsx`) desenha o cromo real com um conteúdo enxuto
   (`ThemeContent`, poucos cartões). Na galeria, isso vira retângulos sem leitura. O dono quer a **tela real** que a prévia grande
   mostra (a tela "Painel", `Canvas/Mocks/DashboardMock.tsx` e `Canvas/Mocks/Dashboard/`), com o tema aplicado e reduzida. Decisão
   (a) do dono: a tela real reduzida, e não uma imagem gerada no build.
2. **Gráficos.** Os presets do grupo `charts` (`core/Design/presets/components/dataPresets.ts`, `CHART_PRESETS`) gravam `chartType`
   ("Área suave" grava `area`, "Barras limpas" grava `bar`). O `chartType` é só o tipo padrão: o `SarakChartEngine` usa o `type` do
   componente primeiro e o do tema depois (`resolveChartType(props.type, theme.chartType)`). Hoje, então, escolher um estilo troca o tipo
   dos gráficos de quem não passou `type`. Decisão (a) do dono: o tipo do gráfico é do importador. O painel define só o **estilo**
   (espessura, suavização, grade, opacidade da grade, preenchimento). A prévia ganha a visão de **todos os tipos** com o estilo
   escolhido. A tela "Gráficos" da prévia (`Canvas/Mocks/ChartsMock.tsx`) hoje desenha à mão 5 dos 8 tipos do `chartType` (linha,
   área, barras, pizza e dispersão; faltam radar, mapa de calor e gauge).
3. **Cards parecidos.** As amostras de Cards, Sombra, Direção da sombra, Material, Cantos, Densidade e Borda são sempre o mesmo
   `SampleCard` genérico ("Receita do mês"), pequeno. A diferença entre presets fica em sombra e borda, que nesse tamanho quase somem
   ("Plano e discreto", "Elevado e macio" e "Faixa lateral" parecem iguais). Os cards curados e os cards dos temas são desenhados sobre a
   base neutra (`Canvas/components/neutralCardBase.ts`, lote 3 da `plan-161`). Decisão do dono: a amostra é **montada com o componente
   real**, como na miniatura de tema, e o que pesar é avaliado na medição.
4. **Texturas.** As texturas do card e do fundo usam a mesma biblioteca (`TEXTURE_OPTIONS`), o que confundiu na prévia. Decisão do dono:
   a textura do card aparece **no card real**, e a do fundo aparece **no fundo, com um card convencional por cima**. Cada uma no seu
   lugar, e os dois grupos continuam separados (`cardTextures` e `textures`, decisão Forma).

**Outras amostras ainda desenhadas à mão** (`Canvas/components/PresetSamples.tsx`): `TableSample`, `ChartSample` (SVG), `ModalSample`,
`NoticeSample`, `EmptySample`, `ProgressSample` e a de rolagem (um `div`). Botões, campos, interruptor, selos e ícones já usam o
componente real (`SampleParts.tsx`, `SarakSwitch`, `SarakBadge`, `SarakIcon`). O dono quer o mesmo princípio onde ele se aplica, e a
medição decide o que fica real e o que continua desenhado.

**Custo de hoje** (mediana de 3 rodadas, `plan-161-catalogo-proporcional.spec.ts`, caso "custo da miniatura de tema", 25 cartões):
abrir a decisão Tema leva 761 ms até o primeiro cartão pintado, com heap de 45,1 MB e 2.551 nós no DOM. As proteções que já existem e
devem continuar valendo: desenhar só o que entra na área visível (`LazyWhenVisible`), escopo enxuto (`MiniatureScope`) e animação
congelada na miniatura. O painel é um pedaço carregado à parte e só o administrador o abre: nada disto roda na aplicação do usuário
final, mas a decisão aberta não pode ficar lenta.

**Dependência:** a `plan-161` (lote 5 em revisão) mexe no mesmo catálogo. Esta plan começa depois dela 🟢.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/features/DesignEngine/Canvas/components/PresetCard.tsx` — a miniatura de tema passa a ser a tela "Painel" reduzida (lote 2).
- `src/features/DesignEngine/Canvas/components/PresetSamples.tsx`, `PresetSamplesMotion.tsx`, `SampleParts.tsx`, `SampleScope.tsx`,
  `OptionTile.tsx`, `OptionSampleFrame.tsx` — amostras com o componente real e quadros do tamanho que o componente pede.
- `src/features/DesignEngine/Canvas/components/CardsCatalog.tsx`, `AtmosphereCatalog.tsx`, `neutralCardBase.ts` — cards e texturas.
- `src/features/DesignEngine/Canvas/Mocks/ChartsMock.tsx` — a tela "Gráficos" da prévia com todos os tipos, pelo componente real.
- `src/features/DesignEngine/Canvas/Mocks/DashboardMock.tsx` e `Canvas/Mocks/Dashboard/` — só extrair ou parametrizar o que a
  miniatura reutiliza (escala, sem animação). O que a prévia grande mostra não muda.
- `src/core/Design/presets/components/dataPresets.ts` — `CHART_PRESETS` deixam de gravar `chartType`.
- `src/core/Design/presets/components/registry.ts` — os grupos `charts` e `cardTextures` (featured, `owns`) acompanham a mudança.
- `src/core/Design/presets/components/cards.ts` — `CARD_TEXTURE_PRESETS` gravam a própria `cardTextureOpacity` (decisão T do dono, 2026-11-19).
- `src/styles/_atmosphere.css` — só o desenho da textura do card (`[data-sx-card-texture-type] … ::after`): a máscara em degradê da decisão T3
  do dono (2026-11-20). A textura do fundo não muda.
- `src/core/Design/schema/data.ts` — só `label`, `description` e `usage` de `chartType` ("tipo padrão, quando o componente não define").
- `src/core/i18n/presetTexts/*.ts` — nomes e descrições dos presets de gráfico, nos seis idiomas, com o vocabulário da `plan-161`.
- `browser-tests/` — o spec novo de custo e de amostras (§5), e os ajustes de lista em `plan-141-presets-do-painel.spec.ts`,
  `plan-160-previa-mostra-a-opcao.spec.ts` e `plan-161-catalogo-proporcional.spec.ts` que a mudança das amostras exigir.
- Testes de unidade dos arquivos acima (`__tests__/` ao lado de cada um) e os snapshots que mudarem por causa desta plan.
- `docs/migracoes.md` e os gerados (`npm run guide`, `catalog`, `dev-kit`, `token-types`).

## 3.2 Fora (o que NÃO pode ser tocado)

- `src/components/engines/charts/` (o `SarakChartEngine` e as adaptações dele): a amostra usa o componente como ele é. Se faltar uma
  prop para desenhar pequeno, pare e traga ao revisor.
- O id, o tipo, as opções e o `defaultValue` do token `chartType`. Ele continua existindo e valendo como tipo padrão.
- Os temas (`core/Design/presets/themes/`), o cromo (`components/Layout/`), o motor de composição (`core/Provider/utils/`).
- A estrutura das decisões (`config/design-decisions.json`), salvo o que o grupo `charts` exigir.
- O que a prévia grande desenha nas outras telas.
- Qualquer refactor não listado em §5, mesmo que pareça óbvio.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §6.3, §6.4, §2.1 | mocks da prévia, catálogos visuais e amostras, decisões |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §5 | o registro de presets e o que cada grupo grava |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` | a miniatura e o quadro de amostra por container, não por janela |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-arquitetura-design` | componente lê token, nada de valor fixo |
| **Skill** | `test-e2e` | o spec de navegador de custo e de amostras |
| **Skill** | `otimizacao-nivel-1` | medir antes e depois, no navegador |
| Código | `src/features/DesignEngine/Canvas/components/PresetCard.tsx` (`MiniatureScope`, `ThemeMiniature`, `LazyWhenVisible`) | o padrão de escopo enxuto e montagem por visibilidade |
| Código | `src/features/DesignEngine/Canvas/components/PresetSamples.tsx` (`SAMPLES`) e `SampleParts.tsx` | onde cada tipo de amostra é desenhado |
| Código | `src/features/DesignEngine/Canvas/Mocks/DashboardMock.tsx`, `src/features/DesignEngine/Canvas/Mocks/ChartsMock.tsx` | as telas da prévia que a miniatura e os gráficos reutilizam |
| Código | `src/core/Design/presets/components/dataPresets.ts`, `src/core/Design/presets/components/registry.ts` | `CHART_PRESETS` e o grupo `charts` |
| Código | `src/components/engines/charts/SarakChartEngine.tsx` (`resolveChartType`) | como o tipo do componente vence o do tema |
| Código | `browser-tests/plan-161-catalogo-proporcional.spec.ts` (custo da miniatura) e `troca-de-tema.spec.ts` (orçamento de recálculo) | as medidas de hoje e o jeito de medir |

# 5. Instruções de execução

**Lote 1 — medição antes de mudar o produto.** Nada do que o usuário do painel vê muda neste lote.

1.1. Escreva um spec de navegador de custo (`browser-tests/amostras-reais-custo.spec.ts`) que mede, por decisão (Tema, Forma e
Componentes) e nos dois modos: tempo até o primeiro cartão pintado, heap JS, nós no DOM, e recálculos de estilo na troca de tema
(como o `troca-de-tema.spec.ts` mede). Mediana de 3 rodadas.
1.2. Monte, só no harness do spec (fixture em `browser-tests/fixtures/`), protótipos de cada amostra nova:
- a miniatura de tema com a tela "Painel" reduzida, montada só quando visível, sem animação;
- a amostra de card com a anatomia real de um card do painel (chip de título, conteúdo e ação, como o "CPU Cluster" da tela "Painel"),
  num quadro maior que o de hoje;
- a textura do card no card real, e a do fundo no fundo com um card convencional por cima;
- gráfico (`SarakChartEngine`), tabela, modal, aviso, estado vazio e progresso com o componente real.
1.3. Meça cada decisão hoje e com os protótipos. Grave a tabela no resumo e numa prévia (`C:\tmp\sarak-previa-166\index.html`), com
capturas lado a lado (hoje × protótipo) de cada tipo de amostra.
1.4. **Pare e entregue.** O dono decide, pela tabela, o teto de cada decisão e quais amostras ficam reais. O lote 2 só começa com essa
decisão registrada na §10.

**Lote 2 — Tema e Forma** (depois da decisão do lote 1).

2.1. A miniatura de tema é a tela "Painel" com o tema aplicado, reduzida. Mantém `LazyWhenVisible`, o escopo enxuto e a animação
congelada. O nome do tema continua legível, como o lote 2 da `plan-161` deixou.
2.2. As amostras de Cards, Sombra, Direção da sombra, Material, Cantos, Densidade e Borda usam a anatomia real de card do lote 1.
Sobre que base elas são desenhadas (o rascunho ou a base neutra) é a decisão D1 do dono (§10). Entre quaisquer duas opções destacadas
de um grupo, a diferença é de ao menos 5% dos pixels, nos dois modos (o limite de hoje é 2%).
2.3. Textura do card: a amostra é o card real com a textura. Textura do fundo: a amostra é o fundo com a textura e um card convencional
por cima, sem a textura do card.
2.4. Prévia em `C:\tmp\sarak-previa-166\`, com antes e depois de Tema e Forma.

**Lote 3 — Componentes** (depois do lote 2).

3.1. **O grupo Gráficos lista estilos, nunca tipos** (decisão do dono, 2026-11-18). `CHART_PRESETS` deixam de gravar `chartType` e
ficam só com estilo (espessura, suavização, preenchimento, grade e opacidade da grade). Nenhum nome de opção diz um tipo: "Área suave",
"Barras limpas", "Barras com grade" e "Dispersão" saem, e os nomes dizem o estilo ("Suave", "Reta", "Forte", "Limpa", "Com grade"…), nos
seis idiomas. O tipo é do importador, no `type` do componente. O `chartType` fica só no ajuste fino, com o rótulo "Tipo padrão (quando o
componente não define)".
3.2. **A amostra de cada estilo é um único gráfico**, o `SarakChartEngine` do mesmo tipo em todas as opções, no tamanho do quadro da
opção, com o estilo do preset e as cores do tema (a primária do rascunho, não a paleta própria do motor). Duas opções destacadas diferem
em ao menos 5% dos pixels, nos dois modos. Se o espaçamento interno fixo do motor impedir a leitura nesse tamanho, pare e traga ao
revisor: mudar o motor está fora do escopo (§3.2).
3.3. **Espiar ou escolher um estilo leva a prévia à tela "Gráficos"** (o grupo `charts` já está ligado à tela `graficos`; a escolha mantém
a tela). A tela (`ChartsMock.tsx`) mostra os 8 tipos do `chartType` com o `SarakChartEngine`, todos com o estilo do rascunho. Ela só
carrega o motor quando a tela é aberta.
3.4. Tabela, estado vazio e progresso com o componente real, conforme a decisão do lote 1. **Modal e aviso mantêm o desenho de hoje**
(eles abrem em portal no `body` e não cabem numa miniatura sem mudar a lib; a espiada já mostra o efeito real na prévia grande).
3.5. `docs/migracoes.md`: escolher um estilo de gráfico no painel não muda mais o tipo padrão. Quem dependia disso grava `chartType`
pelo ajuste fino ou passa `type` no componente.
3.6. Prévia em `C:\tmp\sarak-previa-166\`, com antes e depois de Componentes e a tela "Gráficos".

Em cada lote: `npm run build`, o spec de custo, `plan-141-presets-do-painel`, `plan-160-previa-mostra-a-opcao`,
`plan-161-catalogo-proporcional`, `troca-de-tema` e `npm run verify -- --tier=quick`.

# 6. Critérios de aceite

- [ ] Lote 1: tabela de custo por decisão (hoje × protótipo, dois modos, mediana de 3) e prévia com as capturas; decisão do dono na §10.
- [ ] Miniatura de tema = tela "Painel" com o tema aplicado, dentro do teto aprovado para a decisão Tema.
- [ ] Amostras de card com a anatomia real; duas opções destacadas de um grupo diferem em ao menos 5% dos pixels, nos dois modos.
- [ ] Textura do card no card real, como a aplicação a desenha; textura do fundo no fundo, sem card por cima, com a barra de opacidade.
- [ ] Nenhum preset de gráfico grava `chartType` nem tem nome de tipo; um teste de unidade reprova se algum gravar.
- [ ] Amostra de gráfico = um único gráfico real nas cores do tema; dois estilos destacados diferem em ao menos 5% dos pixels.
- [ ] Espiar ou escolher um estilo leva a prévia à tela "Gráficos", com os 8 tipos pelo `SarakChartEngine`.
- [ ] Tabela, estado vazio e progresso reais onde o dono aprovou; modal e aviso com o desenho de hoje.
- [ ] Cada decisão dentro do teto aprovado; `troca-de-tema` dentro do orçamento de recálculo.
- [ ] `docs/migracoes.md`; gerados regenerados; `tsc` 0; baseline sem regressão; Anel 1.
- [ ] Prévia para o dono em cada lote; o lote só fecha com o ok dele.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum (os invariantes são deste painel: o spec de navegador de custo e de amostras e o teste de unidade dos presets de
gráfico).

- `git diff --stat` → só os arquivos de §3.1.
- `npm run build` e `npx playwright test -c browser-tests/playwright.config.ts amostras-reais-custo plan-141-presets-do-painel
  plan-160-previa-mostra-a-opcao plan-161-catalogo-proporcional troca-de-tema escolha-no-painel plan-140-painel-coluna-unica` → verde.
- Os números do spec de custo conferem com a tabela do resumo e ficam no teto da §10.
- `npx vitest run src/core/Design/presets/components src/features/DesignEngine/Canvas` → verde.
- Leitura de `dataPresets.ts` → nenhum `chartType` em `CHART_PRESETS`.
- Anel 1, `check-audit-baseline --with-tsc` e Anel 0 sobre as linhas adicionadas.

# 8. Destino da síntese

**Destino:** `specs/06-painel-de-customizacao-e-preview.md + specs/09-temas-e-presets.md`

- **06 §6.4:** a frase "A miniatura de tema mantém o desenho próprio do `PresetCard`, escolha do dono" passa a dizer que a miniatura é
  a tela "Painel" da prévia com o tema aplicado, reduzida, montada só quando visível e sem animação. Entra a lista das amostras com o
  componente real, a regra das texturas (card no card, fundo atrás de um card convencional) e a diferença mínima de 5% entre opções
  destacadas.
- **06 §6.3:** a tela "Gráficos" mostra todos os tipos de `chartType` com o componente real.
- **09 §5:** os presets do grupo `charts` gravam só estilo, e o `chartType` é o tipo padrão do ajuste fino.
- O teto de custo aprovado pelo dono, por decisão.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução (lote 1) — 2026-11-18

**Resultado:** Concluído com pendências (o lote termina em "pare e entregue": a decisão do dono da §10 ainda falta; o `SarakModal` não tem protótipo e o protótipo de gráfico sai pequeno, ver Achados)

**Estado do worktree ao iniciar**
Só `dist/` modificado ou removido, e arquivos novos de `dist/` não rastreados (saída de um build anterior de outra tarefa). Nenhum arquivo fora de `dist/`. Não toquei em `dist/`.

**O que foi feito**
- `browser-tests/amostras-reais-custo.spec.ts` (novo) — mede, por grupo e nos dois modos, o tempo até o primeiro cartão pintado, o heap, os nós do DOM e, na troca de modo, os recálculos de estilo e o tempo de estilo + layout + script; mediana de 3 rodadas, uma página nova por rodada; tira as capturas hoje × protótipo e grava `medidas.json`.
- `browser-tests/fixtures/amostras-reais-custo-entry.tsx` (novo) — a bancada: uma coluna de 360 px que abre UM grupo, como `hoje` (o `PresetsCatalog` de produção) ou como `prototipo`, com o mesmo provider, rascunho e modo.
- `browser-tests/fixtures/amostras-reais-prototipos.tsx` (novo) — os protótipos: miniatura de tema = `MockDashboard` ("Painel") dentro de `SarakAppChrome`, quadro 960×600; card com a anatomia real (`SarakTitleCard`, "CPU Cluster"), quadro 300×240, grade de 10,5 rem; textura do card no card real; textura do fundo com `SarakCard` convencional por cima; `SarakDataTable`, `SarakChartEngine` (linha e barra), `SarakAlert`, `SarakBadge`/`SarakProgress` e `SarakEmptyState` reais. Nada em `src/` mudou.
- Prévia em `C:\tmp\sarak-previa-166\index.html` (tabelas, 40 capturas lado a lado, `medidas.json`, `tabela.md`).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/amostras-reais-custo.spec.ts` | criado | spec de custo e de capturas |
| `browser-tests/fixtures/amostras-reais-custo-entry.tsx` | criado | bancada hoje × protótipo |
| `browser-tests/fixtures/amostras-reais-prototipos.tsx` | criado | protótipos com o componente real |
| `specs/plan/plan-166-…md` | alterado | este resumo (append) |

**Verificações executadas**
- `npx playwright test … amostras-reais-custo.spec.ts` (completo, `SARAK_PREVIA_166_DIR`) → 45 passed (17,0 min); depois o grupo Gráfico e as capturas dele foram refeitos (5 passed) depois de ajustar o quadro do protótipo, e o `medidas.json` foi mesclado.
- `plan-161-catalogo-proporcional -g "custo da miniatura"` → painel real hoje, decisão Tema: 1.535 ms, 44,5 MB, 2.551 nós, 25 cartões (nesta máquina e carga; o resumo da plan registra 761 ms de outra rodada).
- `troca-de-tema.spec.ts` → 4 passed.
- `npm run verify -- --tier=quick` → verde (Anel 0 simulado: 437 linhas, 0 achado).
- Não rodei: `npm run build` (não mudei `src/`; o CSS vem do `dist/sarak.css` que já estava ali), `plan-141`, `plan-160`, `escolha-no-painel`, `plan-140` (o lote não muda produto), suíte completa e `tsc` (do revisor).

**Tabela de custo** (mediana de 3; hoje → protótipo; coluna de 360 px, só as opções destacadas)

| Grupo | Opções | Abrir ms (escuro) | Abrir ms (claro) | Heap MB | Nós do DOM | Troca de modo ms (escuro) |
|---|---|---|---|---|---|---|
| Miniatura de tema | 25 | 867 → 2.851 | 1.275 → 2.972 | 33,7 → 40,8 | 1.828 → 10.047 | 714 → 2.081 |
| Cards | 6 | 350 → 362 | 319 → 249 | 29,1 → 29,2 | 149 → 235 | 142 → 185 |
| Sombra | 2 | 295 → 328 | 222 → 317 | 28,5 → 28,4 | 68 → 91 | 24 → 25 |
| Cantos | 3 | 346 → 348 | 242 → 275 | 28,8 → 28,6 | 136 → 127 | 33 → 35 |
| Textura do card | 8 | 344 → 275 | 381 → 246 | 29,2 → 29,4 | 199 → 307 | 79 → 70 |
| Textura do fundo | 8 | 282 → 305 | 258 → 302 | 28,8 → 29,1 | 131 → 147 | 55 → 55 |
| Tabela | 6 | 283 → 350 | 247 → 265 | 28,7 → 29,9 | 189 → 301 | 43 → 78 |
| Gráfico | 6 | 342 → 355 | 227 → 592 | 28,7 → 37,2 | 143 → 157 | 50 → 121 |
| Aviso | 3 | 334 → 309 | 252 → 268 | 28,3 → 28,4 | 69 → 94 | 35 → 31 |
| Selo e progresso | 4 | 327 → 373 | 300 → 291 | 28,7 → 28,7 | 113 → 115 | 39 → 43 |
| Estado vazio | 4 | 229 → 352 | 309 → 292 | 28,5 → 28,8 | 93 → 75 | 39 → 51 |

Leitura: só a **miniatura de tema** pesa de verdade (3,3× no tempo de abrir, 5,5× nos nós, 2,9× na troca de modo). Todos os demais ficam dentro do ruído de medida (a variação entre modos de um mesmo grupo é do tamanho da diferença hoje × protótipo), com o **gráfico** como único custo próprio (+8,5 MB de heap, ~2,5× no tempo de estilo da troca). Recálculos de estilo na troca de modo: de 7 a 11 em todos os grupos, nas duas variantes, exceto as texturas (44 a 63, iguais hoje e no protótipo).

**Critérios de aceite**
- [x] Lote 1: tabela de custo por decisão/grupo (hoje × protótipo, dois modos, mediana de 3) e prévia com capturas — evidência: tabela acima e `C:\tmp\sarak-previa-166\index.html`.
- [ ] Decisão do dono na §10 (tetos por decisão e quais amostras ficam reais) — pendente por desenho: o lote para aqui.
- [ ] Demais critérios da §6 — são dos lotes 2 e 3.

**Decisões e suposições**
- A medida é por GRUPO, não por decisão inteira: a decisão abre com um só grupo aberto (`initialOpenGroups`, `ThemeDecisionOptions.tsx`), então o custo de "abrir a decisão" é o do grupo aberto. A tabela dá o custo de cada grupo e o dono compõe.
- "Quadro maior" da amostra de card: interpretei como o card ocupando mais do tile (quadro 300×240, grade de 10,5 rem, card em largura total), e não como quadro de referência maior. Se era outra coisa, o protótipo precisa ser refeito.
- A bancada usa React de desenvolvimento (a medida de hoje da plan-161 também usou) e só as opções destacadas; as razões valem, os milissegundos absolutos variam com a máquina (o 761 ms da plan contra 1.535 ms nesta rodada mostra isso).
- Os grupos Sombra, Cantos etc. partem do rascunho; só `cards` parte da base neutra (como produção). A decisão D1 não afeta o custo.
- Quadro da miniatura de tema do protótipo: 960×600; a 3 por linha a escala fica em ~0,1 e a tela fica ilegível a olho nu (ver captura `themes-prototipo-*`). Isso é de legibilidade, não de custo, e o dono vê na prévia.
- A troca de modo na bancada substitui a "troca de tema" no protótipo (a bancada não tem o fluxo de aplicar tema); a medida de recálculo da troca de tema do painel real continua sendo a do `troca-de-tema.spec.ts` (verde).

**Achados fora do escopo (não corrigidos)**
- `src/components/atomic/Modals/SarakModal.tsx:217` — o modal abre sempre em portal no `document.body`; não cabe numa miniatura sem mudar o componente. Por isso o grupo `modal` ficou sem protótipo (continua o desenho de hoje). Decisão para o revisor: manter desenhado ou abrir plan para o modal aceitar o destino do portal (como `useSarakPortalFrame` já faz nos popovers).
- `SarakChartEngine` (`src/components/engines/charts/`, fora do escopo §3.2) — dentro de um quadro reduzido ele desenha o canvas com ~100 px (o contêiner interno leva `p-6` fixo), então linha e barra saem pequenas, sem rótulo legível; o console traz 12 avisos `[ECharts] Instance … has been disposed` por página. A plan manda parar e trazer ao revisor se faltar prop para desenhar pequeno: falta (padding do motor).

**Pendências / riscos**
- O dono precisa decidir, pela tabela e pelas capturas: o teto de abrir por decisão (a miniatura de tema com a tela "Painel" custa 2.851 ms e 10.047 nós contra 867 ms e 1.828 hoje), se a tela fica legível naquela escala, e o destino do modal e do gráfico.
- Sem teto aprovado, o spec de custo só afirma que toda opção desenhou; os limites entram no lote 2.
- `npm run build` não foi rodado neste lote (sem mudança de `src/`).

## Resumo da execução (lote 1, ajuste da prévia) — 2026-11-18

**Resultado:** Concluído com pendências (o lote continua parado na decisão do dono)

Três ajustes pedidos pelo dono ao avaliar a prévia, só em `browser-tests/fixtures/` e no spec; `src/` intocado.
- **Textura do fundo:** o protótipo voltou a ser o fundo com a textura aplicada de verdade ao escopo, sem card por cima, e ganhou a barra de opacidade (`amostras-reais-custo-entry.tsx`, `OpacitySlider`, `ProtoGroup`). Custo: 244 → 319 ms (escuro), 131 → 111 nós.
- **Aviso:** as amostras saíam todas iguais porque `SarakAlert` não lê os tokens `toast*`/`tooltip*`, e `SarakToast` (`SarakToast.tsx`, `ToastStack`) e `SarakTooltip` abrem em portal no `body`, como o modal. O grupo ficou **sem protótipo** (continua o desenho de hoje); o spec pula o caso do protótipo (`test.skip`) em vez de medir hoje duas vezes.
- **Gráfico:** o protótipo agora desenha linha e barra (o `p-6` fixo do motor é zerado só no harness, por um `<style>` local). Linha e barra aparecem, mas pequenas; grade, espessura e preenchimento quase não se distinguem nessa escala, e a cor sai roxa (paleta do motor) e não a primária do tema. Custo: 389 → 689 ms (escuro), 28,7 → 37,4 MB, 54 → 142 ms na troca de modo.
- Verificação: `amostras-reais-custo.spec.ts` com `-g "(Gráfico|Textura do fundo|Aviso)|capturas"` → 11 passed, 2 skipped (Aviso protótipo, nos dois modos); prévia regenerada em `C:\tmp\sarak-previa-166\index.html`. Não rodei `verify --tier=quick` de novo (só fixtures de teste mudaram).
- Achado fora do escopo: para o aviso e o gráfico ficarem fiéis ao componente real, falta `SarakToast`/`SarakTooltip` aceitarem o destino do portal e o `SarakChartEngine` aceitar o padding (ambos fora do §3.2).

## Resumo da execução (correção 1) — 2026-11-19

**Resultado:** Concluído

**Estado do worktree ao iniciar**
Só `dist/` modificado/removido/não rastreado (de outra tarefa), mais ` M specs/00-indice.md`, ` M specs/plan/plan-166-….md` e os três arquivos novos do lote 1 (`browser-tests/amostras-reais-custo.spec.ts`, `browser-tests/fixtures/amostras-reais-custo-entry.tsx`, `browser-tests/fixtures/amostras-reais-prototipos.tsx`).

**Achado do revisor** (protótipo de gráfico: um único gráfico por estilo, nas cores do tema; medir de novo)
- `browser-tests/fixtures/amostras-reais-prototipos.tsx` — o protótipo agora é UM `SarakChartEngine` por opção, `type="area"` em todas (o tipo é o mesmo para o estilo ser a única diferença), num quadro de 300×220; o espaçamento interno do motor ficou intacto (a regra de CSS que o zerava saiu). A cor vem do tema: a paleta do motor parte da primária do rascunho (`chartColorPalette` ← `primaryColor` do rascunho, só na amostra). Saiu o par linha + barra.
- Medida nova (mediana de 3, hoje → protótipo): escuro 334 → 544 ms, 28,7 → 36,2 MB, 143 → 115 nós, troca de modo 47 → 88 ms; claro 235 → 443 ms, mesmo heap e nós, troca 46 → 104 ms. Sem erro de console. Antes (dois gráficos): 389 → 689 ms, 37,4 MB, 163 nós.
- Diferença entre opções (capturas do protótipo, recorte do cartão, limiar de 24 por canal, opção 1 contra cada uma das outras 5): 6,6% a 16,4% dos pixels no escuro e 10,8% a 24,2% no claro. Medida por um script solto, só desta correção: não é o teste do lote 3.
- O espaçamento fixo do motor NÃO impediu a leitura a 300×220: o gráfico lê (eixos, pontos, preenchimento) e nada foi pedido ao revisor.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/fixtures/amostras-reais-prototipos.tsx` | alterado | gráfico único, tipo fixo, cor do tema, quadro 300×220 |
| `specs/plan/plan-166-…md` | alterado | este bloco e o `status` |

**Verificações executadas**
- `amostras-reais-custo.spec.ts -g "Gráfico|capturas"` com `SARAK_GRUPO_166=charts` → 5 passed (1,9 min); `medidas.json` mesclado, tabela e `index.html` regenerados em `C:\tmp\sarak-previa-166\`.
- Não rodei `verify --tier=quick` (só fixture de teste mudou) nem o resto do lote.

**Decisões e suposições**
- `type="area"` em todas as opções: o preset ainda grava `chartType` (sai no lote 3), e o `type` explícito faz o estilo ser a única diferença.
- Os 12 avisos de `[ECharts] … disposed` do console do lote anterior não apareceram nesta medida (`errors: []`).

**Achados fora do escopo (não corrigidos)**
- A diferença entre estilos é visível mas sutil na miniatura (grade a 0,06 de opacidade quase não aparece); o critério de 5% do lote 3 deve ser medido por teste próprio.

**Pendências / riscos**
- O lote 1 continua aguardando a decisão do dono na §10.

## Resumo da execução (lote 2) — 2026-11-19

**Resultado:** Concluído com pendências (um caso do `plan-141` segue vermelho, ver Pendências)

**Estado do worktree ao iniciar**
Só `dist/` modificado, removido ou não rastreado (de outra tarefa; o `npm run build` do lote o regravou), ` M specs/00-indice.md`, ` M specs/plan/plan-166-….md` e os três arquivos do lote 1 (`browser-tests/amostras-reais-custo.spec.ts`, `browser-tests/fixtures/amostras-reais-custo-entry.tsx`, `browser-tests/fixtures/amostras-reais-prototipos.tsx`), não rastreados.

**O que foi feito**
- **M — miniatura de tema.** `PresetCard.tsx`: o conteúdo enxuto saiu e entrou o topo da tela "Painel" (`MockDashboard part="top" inheritVariables`), quadro 720×400, com `LazyWhenVisible`, escopo enxuto e animação congelada como antes. A tela inteira (opção b do dono) passou do teto de 2× em parte das rodadas (de 1,55× a 2,60× em 7 rodadas, contra a cópia congelada de hoje), então valeu o recorte do topo (de 1,18× a 1,94× em 7 rodadas). `DashboardMock.tsx` e `Dashboard/DashboardMetricsGrid.tsx`: `part` (`top` ou `all`; a tela de fora não muda) e `inheritVariables` (a miniatura não repete as cerca de 300 variáveis no estilo de cada cartão: foi o que mais baixou o custo, de 2,2×–3,3× para 1,4×–1,9×).
- **Duas por linha.** `panelResponsive.presets.ts`: `THEME_GALLERY_GRID` de 5,5 rem para 8,5 rem (a três por linha a tela fica ilegível).
- **D1 (a): cards sobre o rascunho.** `CardsCatalog.tsx` sem a base neutra; `neutralCardBase.ts` e o teste dele removidos (não havia mais leitor).
- **Card real do painel.** `SampleParts.tsx`: `SampleCard` (cabeçalho, corpo e rodapé) sai e entra `SampleTitleCard` (`SarakTitleCard`, "CPU Cluster": chip de título e contexto), que lê o design do escopo e só leva a textura do grupo dele (a do rascunho não entra). `PresetSamples.tsx`: `card`, `cardTexture` e `surface` usam `SampleTitleCard` (Cantos, Densidade e Borda perdem o campo que a amostra `surface` mostrava ao lado do card, como no protótipo aprovado). `OptionSampleFrame.tsx` e `PresetGroupCatalog.tsx`: quadro de 300 px para essas amostras.
- **Textura do card** no card real, com a camada de textura por cima (`TEXTURE_LAYER_STYLE`), opacidade cheia e quadro 220×176 (`CardsCatalog.tsx`). **Textura do fundo**: não mudou (fundo com a textura aplicada e a barra de opacidade, sem card por cima), ver Decisões.
- **Testes.** Unidade: `CardsCatalog`, `optionGroups`, `PresetCard`, `PresetCard.memo`, `PresetsCatalog`, `SampleParts`, `panelResponsive.presets`, `DashboardMock` (o `part` e o `inheritVariables`) e 3 snapshots. Navegador: `plan-141` (5% de diferença de pixels nos grupos de card; sai o caso "faixas do SampleCard"), `plan-161` (o card agora segue o tema atual, não a base neutra). O spec de custo ganhou a cópia congelada da miniatura de antes (`fixtures/amostras-reais-hoje.tsx`), os tetos de 2× por grupo e a razão do Tema na mesma rodada.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/Canvas/components/PresetCard.tsx` | alterado | miniatura = topo da tela "Painel", quadro 720×400 |
| `src/features/DesignEngine/Canvas/Mocks/DashboardMock.tsx` e `Mocks/Dashboard/DashboardMetricsGrid.tsx` | alterado | `part` e `inheritVariables` |
| `src/features/DesignEngine/Canvas/panelResponsive.presets.ts` | alterado | grade de temas a 8,5 rem |
| `Canvas/components/CardsCatalog.tsx`, `PresetSamples.tsx`, `PresetGroupCatalog.tsx`, `OptionSampleFrame.tsx`, `SampleParts.tsx` | alterado | card real sobre o rascunho, textura, quadros |
| `Canvas/components/neutralCardBase.ts` e `__tests__/neutralCardBase.test.ts` | removido | base neutra desfeita (D1) |
| 8 arquivos de teste de unidade e 2 snapshots em `__tests__/` | alterado | ver acima |
| `browser-tests/plan-141-presets-do-painel.spec.ts`, `browser-tests/plan-161-catalogo-proporcional.spec.ts` | alterado | 5% nos grupos de card; o card segue o tema |
| `browser-tests/amostras-reais-custo.spec.ts`, `fixtures/amostras-reais-custo-entry.tsx`, `fixtures/amostras-reais-prototipos.tsx` | criado (lote 1) e alterado | tetos, variante `atual`, razão do Tema |
| `browser-tests/fixtures/amostras-reais-hoje.tsx` | criado | miniatura de antes, congelada |

**Verificações executadas**
- `npm run build` (duas vezes, depois dos ajustes) → verde.
- Custo, na mesma rodada, mediana de 3 (ms, escuro/claro; hoje → atual): miniatura de tema 507/546 → 986/727 (razão 1,94×/1,33×, teto 2×); nós 1.800 → 5.685; heap 33,6 → 38,5 MB. Cards 341/203; Sombra 241/224; Cantos 238/247; Textura do card 268/180; Textura do fundo 236/228. Contra o de hoje do lote 1 (350/319, 295/222, 346/242, 344/381, 282/258) todos ficam abaixo de 2× (o spec afirma). A tela inteira (protótipo) deu 865/891 nessa rodada e de 1,55× a 2,60× nas outras.
- `plan-140` e `plan-161` → 33 passed (4,6 min). `plan-141`, `plan-160`, `troca-de-tema` e `escolha-no-painel` → 40 passed, 2 failed (os dois são o caso "Forma: cada opção destacada se distingue", escuro e claro). `amostras-reais-custo.spec.ts` (lote 2) → 19 passed.
- `npx vitest run src/features/DesignEngine/Canvas` → 268 passed (depois de atualizar 2 snapshots com `-u` só nesses caminhos).
- `npm run verify -- --tier=quick` → verde (Anel 0 simulado: 16.279 linhas, 0 achado). Ele acusou `token-reader:check` (o `presetMiniCardMaxWidth` ficou sem leitor ao sair o `SampleCard`): o `SampleTitleCard` o lê (`maxWidth` do invólucro).
- Controle em `HEAD` (cópia fora do repositório, `git archive`, junção de `node_modules`): o caso "Forma" do `plan-141` já falhava no `HEAD`, em outros pares (shadow-none × shadow-soft 0,98% no escuro; material-frosted × material-organic 1,68% no claro). `git status --short` antes e depois: idêntico; `node_modules` intacto; a cópia foi apagada.

**Critérios de aceite**
- [x] Miniatura de tema = tela "Painel" com o tema aplicado, dentro do teto de 2×. Evidência: razão do Tema do spec de custo (1,94×/1,33×); é o recorte do topo (a tela inteira passou do teto).
- [x] Amostras de card com a anatomia real; ao menos 5% de pixels entre opções destacadas, nos dois modos. Evidência: `plan-141`, Forma, grupos cards, shadow, shadowDirection, material, corners, density e border sem nenhuma dupla abaixo de 5% (no `HEAD` duas duplas ficavam abaixo de 2%).
- [ ] Textura do card no card real: feita, mas a dupla `card-tex-grid × card-tex-dots` dá 0,88% no `plan-141` (limite 2%), ver Pendências. Textura do fundo: sem card por cima, ver Decisões.
- [x] Cada decisão dentro do teto; `troca-de-tema` dentro do orçamento (4 passed).
- [ ] Prévia para o dono e ok dele: prévia pronta em `C:\tmp\sarak-previa-166\index.html` (custo; Hoje, Atual e Protótipo da miniatura; capturas de Tema e Forma); o ok é do dono.

**Decisões e suposições**
- **Textura do fundo sem card por cima**: a §5 (2.3) e a §6 dizem "com um card convencional por cima", mas o dono, ao avaliar a prévia do lote 1, pediu o fundo sem os cards e com a barra de opacidade. Segui o dono; o texto da plan precisa acompanhar.
- **Recorte do topo, e não a tela inteira**, pela regra da nota do revisor (teto de 2× contra o de hoje na mesma rodada). O recorte também passou raspando em uma rodada (1,94×); o tempo oscila com a carga da máquina, e a razão de nós (3,2×) é a que não oscila.
- As etiquetas de capacidade ("Vision", "Chat") saíram do card da amostra: o texto delas tem 3,92:1 no escuro e o `plan-140` cobra 4,5:1 de todo texto da coluna.
- "CPU Cluster" e "Node-04-PR" são texto fixo da amostra, como o resto do mock da tela "Painel" (não passam pelo catálogo de idiomas).
- O quadro da textura do card (220×176) é menor que o dos outros cards, para a textura de traço fino não sumir.

**Achados fora do escopo (não corrigidos)**
- `src/components/atomic/Cards/SarakTitleCard.tsx`: as etiquetas de capacidade (cor primária sobre o fundo primário a 15%) ficam em 3,92:1 no escuro, abaixo de 4,5:1; por isso a amostra não as mostra.
- `browser-tests/plan-161-catalogo-proporcional.spec.ts`: a meta de rolagem do Tema (2,5 alturas) só coube porque o quadro da miniatura ficou com 400 de altura (com 450 deu 2,64); qualquer aumento da galeria volta a estourar.
- `browser-tests/plan-141-presets-do-painel.spec.ts`: o caso "Forma" já estava vermelho no `HEAD` (acima).

**Pendências / riscos**
- `plan-141`, Forma (escuro e claro): `card-tex-grid × card-tex-dots = 0,88%` (limite 2%). A textura existe (estilo computado: grade de 32 px, opacidade 1, camada de 258×137 px), mas não aparece na foto do caso, nem sem animação; na bancada (`amostras-reais-custo-entry`, mesmo `SarakUIProvider`) a mesma amostra mostra a grade e os pontos com clareza. Não achei a causa em três tentativas (camada, opacidade, quadro menor). O caminho previsto na §6.4 do spec 06 é tirar `card-tex-dots` das destacadas, mas o `registry.ts` só está no escopo para o grupo `charts`: decisão do revisor.
- O `npm run build` regravou `dist/` (já sujo de outra tarefa): trate o `git diff --stat` de `dist/` como do ambiente, não deste lote.
- A cópia congelada da miniatura de antes (`fixtures/amostras-reais-hoje.tsx`) sai na síntese da plan, junto com a comparação.

## Resumo da execução (correção 2) — 2026-11-19

**Resultado:** Concluído com pendências (decisão do dono sobre a opacidade das texturas do card; `plan-141`, Forma, segue vermelho por causa dela)

**Estado do worktree ao iniciar**
` M browser-tests/plan-141-presets-do-painel.spec.ts`, ` M browser-tests/plan-161-catalogo-proporcional.spec.ts`, ` M specs/00-backlog.md`, ` M specs/00-indice.md`, ` M specs/plan/plan-166-….md`, ` M src/buildInfo.ts`, ` M src/core/Provider/buildInfo.ts`, os arquivos de `src/features/DesignEngine/Canvas/` do lote 2 (modificados, mais `neutralCardBase.ts` e o teste dele removidos), os quatro arquivos de `browser-tests/` do lote 1 e do lote 2 não rastreados, e `dist/` (do ambiente). Os `buildInfo.ts` e o `backlog` não são desta correção.

**Achados do veredito**
1. **Cromo de desktop na miniatura.** `PresetCard.tsx`: o quadro passou de 720×400 para 1024×576 (a largura mínima do desktop; a mesma altura de tile na grade) e a miniatura fica dentro de `SarakDeviceProvider overrideDevice="desktop"`. A causa do cromo de celular: o dispositivo vem da janela (`useSarakDevice`, `DeviceProvider.tsx`), e as capturas da bancada eram tiradas numa janela de 400 px. A miniatura agora não depende da janela, e a bancada captura a 1440 px. As capturas `themes-atual-*` mostram a Sidebar ou a Topbar que cada tema declara.
2. **Textura do card real.** `SampleParts.tsx`: saiu a camada `data-sx-texture` (mecanismo do fundo) e `TEXTURE_LAYER_STYLE`; `CardsCatalog.tsx`: saíram o estilo de amostra (opacidade 1) e o quadro 220×176. A amostra usa só `data-sx-card-texture-type` (no escopo e no card), com a opacidade do rascunho (`--sarak-card-texture-opacity`, hoje 0,06); o texto do card não é mais coberto. O teste de `optionGroups` afirma que a amostra não sobrescreve a opacidade e que não há camada `data-sx-texture`.

**Decisão M — números** (`amostras-reais-custo.spec.ts`, 5 rodadas alternadas: hoje, recorte, tela inteira, nessa ordem, em página nova; largura de desktop; mediana da razão contra o "hoje" da mesma rodada)

| Modo | Recorte do topo | Tela inteira | Nós hoje / recorte / inteira |
|---|---|---|---|
| Escuro | 1,16× (1,16; 1,16; 1,13; 1,67; 1,57) | 1,56× (1,52; 1,58; 1,44; 1,56; 1,85) | 1.800 / 5.685 / 10.047 |
| Claro | 1,43× (1,14; 1,27; 1,67; 1,43; 1,66) | 1,77× (2,46; 1,33; 1,68; 2,42; 1,77) | 1.800 / 5.685 / 10.047 |

A tela inteira custa de 24% a 34% mais tempo que o recorte (pelas medianas) e 1,8× os nós; em 2 das 10 rodadas dela passa de 2× (2,46× e 2,42×, as duas no claro), e o recorte em nenhuma. O produto segue com o recorte (o spec afirma ≤ 2× para ele). As duas, lado a lado, estão em `C:\tmp\sarak-previa-166\index.html` (variantes "Atual" = recorte e "Protótipo" = tela inteira); a escolha é do dono.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/Canvas/components/PresetCard.tsx` | alterado | quadro 1024×576, `SarakDeviceProvider` desktop |
| `…/components/SampleParts.tsx`, `CardsCatalog.tsx` | alterado | textura do card pelo mecanismo do card, sem camada nem estilo de amostra |
| `…/components/__tests__/optionGroups.test.tsx`, `__snapshots__/PresetsCatalog.test.tsx.snap` | alterado | a textura é a do card; snapshot da galeria |
| `browser-tests/amostras-reais-custo.spec.ts` | alterado | caso das rodadas alternadas (inteira × recorte), capturas a 1440 px, relatório do Tema no `medidas.json` |
| `browser-tests/fixtures/amostras-reais-prototipos.tsx` | alterado | tela inteira no mesmo quadro e dispositivo |

**Verificações executadas**
- `npm run build` → verde.
- `plan-161-catalogo-proporcional` → 25 passed (a meta de rolagem do Tema coube com o quadro 1024×576).
- `amostras-reais-custo` (Tema alternado e capturas) → 3 passed; capturas de Tema e de Textura do card regeradas.
- `plan-141-presets-do-painel` (Forma) → 2 failed (escuro e claro), só pares de `cardTextures`, números abaixo.
- `npx vitest run src/features/DesignEngine/Canvas` → 268 passed (um snapshot atualizado com `-u` só no arquivo dele); `npm run verify -- --tier=quick` → verde.

**Critérios de aceite**
- [x] Miniatura de tema com a Sidebar ou a Topbar de desktop do tema, independente da janela — evidência: `themes-atual-escuro.png` e `-claro.png`.
- [x] Textura do card pelo mecanismo do card, texto legível — evidência: `cardTextures-atual-*.png`, `optionGroups.test.tsx`.
- [ ] `plan-141` (Forma) verde — não: com a opacidade real as texturas ficam quase invisíveis (decisão do dono).
- [ ] Escolha entre tela inteira e recorte — do dono, com os números e a prévia.

**Decisões e suposições**
- O `plan-141` compara cada dupla de texturas destacadas; com a opacidade do rascunho (0,06) as duplas abaixo de 2% são, no escuro: `card-tex-grid × card-tex-dots` 0,88%, `grid × carbon` 0,88%, `blueprint-pro × hexagon` 0,88%, `blueprint-pro × paper` 0,88%, `dots × carbon` 0,00%, `hexagon × paper` 0,01%; no claro: `grid × dots` 0,88%, `blueprint-pro × hexagon` 0,88%, `blueprint-pro × paper` 0,88%, `hexagon × paper` 0,00%. As diferenças de 0,88% vêm do que não é textura; as de 0,00% e 0,01% são texturas que a opacidade 0,06 apaga. Opções para o dono: (a) uma opacidade própria dos presets de textura do card, (b) a amostra com a opacidade do preset, quando ele a tiver, ou (c) tirar das destacadas as que não se distinguem (no `registry.ts`, fora do escopo desta plan). Não mexi na opacidade.
- A bancada capta a 1440 px de janela (antes 400): o cromo da miniatura de "Hoje" também segue a janela, e a 1440 px é o de desktop.

**Achados fora do escopo (não corrigidos)**
- `src/core/Provider/DeviceProvider.tsx` — o dispositivo vem da janela, não do container: qualquer miniatura ou prévia do cromo desenhada numa janela estreita mostra o celular, salvo override.

**Pendências / riscos**
- `plan-141`, Forma: vermelho até a decisão sobre as texturas do card (acima).
- A razão de tempo oscila de uma rodada à outra (de 1,13× a 1,67× no recorte); a razão de nós (3,2×) não oscila.

## Resumo da execução (correção 3) — 2026-11-19

**Resultado:** Concluído com pendências (o `plan-141` Forma segue vermelho só nas texturas do card; a razão do Tema no claro passou de 2× nesta rodada)

**Estado do worktree ao iniciar**
` M browser-tests/plan-141-…`, ` M browser-tests/plan-161-…`, ` M specs/00-backlog.md`, ` M specs/00-indice.md`, ` M specs/plan/plan-166-….md`, ` M src/buildInfo.ts`, ` M src/core/Provider/buildInfo.ts`, os arquivos de `Canvas/` do lote 2, os quatro arquivos de `browser-tests/` não rastreados e `dist/` (ambiente).

**O que foi feito**
- **M (a), tela inteira.** `PresetCard.tsx` monta `MockDashboard` sem recorte; `DashboardMock.tsx` e `Dashboard/DashboardMetricsGrid.tsx` perdem `part`/`DashboardPart` (a grade voltou idêntica ao `HEAD`; resta `inheritVariables`); teste do `part` removido. O spec de custo (`amostras-reais-custo.spec.ts`) passa a ter só `hoje` × `atual` (a tela inteira) e afirma o teto de 2× sobre a mediana das 5 rodadas alternadas.
- **T (a), opacidade por textura.** `cards.ts`: `CARD_TEXTURE_OPACITY` (40 valores) e `CARD_TEXTURE_PRESETS` gravam `cardTextureType` + `cardTextureOpacity`. `registry.ts`: `cardTextures` deixa `optionsOfOneToken` e ganha `optionsOfTokenAndSetting`, `owns` aceita `cardTextureOpacity`. `presetCatalog.test.ts`: o grupo sai do teste "dois tokens diferem" e ganha o teste que reprova preset sem opacidade (ou com opacidade 0 numa textura que não é `none`). `docs/migracoes.md` (e o kit regenerado por `npm run guide`).
- **Bancada com o rascunho do modo.** `amostras-reais-custo-entry.tsx`: `useDraftOfMode` resolve o tema do sistema para o modo da variante (contraparte no claro) e o passa ao catálogo e ao protótipo; antes os dois modos usavam o rascunho escuro.
- **Como medi a opacidade (por textura, 40 texturas × 2 modos × 14 valores de 0,02 a 0,5):** o card real do painel (`SampleTitleCard`) numa grade; por valor, (a) o pior contraste de cada texto do card contra os pixels do fundo já com a textura (texto escondido na captura), (b) a parcela de pixels que difere do mesmo card sem textura (limite do `plan-141`: soma dos canais > 30). Regra: texto que partia de ≥ 4,5:1 fica em ≥ 4,5:1; texto que já partia de menos (o título e o subtítulo no escuro, o título no claro) não perde mais de 0,15. Valor escolhido = o que mais mostra a textura dentro dessa regra, nos dois modos. O script de medida foi descartável e não ficou no repositório.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/Canvas/components/PresetCard.tsx` | alterado | tela inteira, sem `part` |
| `…/Mocks/DashboardMock.tsx`, `…/Mocks/Dashboard/DashboardMetricsGrid.tsx`, `…/Mocks/__tests__/DashboardMock.test.tsx` | alterado | recorte `part` removido |
| `src/core/Design/presets/components/cards.ts`, `registry.ts`, `__tests__/presetCatalog.test.ts` | alterado | opacidade por textura; grupo `optionsOfTokenAndSetting` |
| `…/Canvas/components/__tests__/__snapshots__/PresetsCatalog.test.tsx.snap` | alterado | galeria com a tela inteira (`-u` só nele) |
| `browser-tests/amostras-reais-custo.spec.ts`, `fixtures/amostras-reais-custo-entry.tsx` | alterado | tela inteira como `atual`; rascunho por modo |
| `docs/migracoes.md`, `sarak-ui/docs/migracoes.md` | alterado | nota da textura do card (o kit é gerado) |

**Verificações executadas**
- `npx vitest run src/core/Design/presets/components src/features/DesignEngine/Canvas` → 465 passed, 1 failed (o snapshot da galeria, atualizado em seguida com `-u` só nesse arquivo → 18 passed).
- `npm run build` → verde (duas vezes, a segunda depois do `npm run guide`).
- `plan-141-presets-do-painel` + `plan-161-catalogo-proporcional` → 50 passed, 2 failed (Forma, escuro e claro; só `cardTextures`, abaixo). Repetido com a pasta de prévia → 25 passed, 2 failed, os mesmos.
- `amostras-reais-custo` (Tema, 5 rodadas alternadas, tela inteira): escuro 1,59× (1,34; 1,59; 1,43; 2,07; 1,93), **claro 2,13× (1,99; 2,25; 2,44; 1,83; 2,13) — acima do teto de 2×, e o caso falhou nesta rodada**; nós 1.800 → 10.075. Na correção 2 o claro deu 1,77×: a razão oscila entre rodadas (carga da máquina), a de nós não.
- `npm run verify -- --tier=quick` → verde (Anel 0 simulado: 4.283 linhas, 0 achado).

**Critérios de aceite**
- [x] M (a): miniatura = tela "Painel" inteira — `PresetCard.tsx`, `PresetsCatalog.test.tsx.snap`.
- [ ] Cada decisão dentro do teto — Tema escuro 1,59×; **Tema claro 2,13× nesta rodada** (1,77× na anterior): decisão do dono/revisor.
- [x] T (a): todo preset de textura de card grava a própria opacidade, com teste que reprova se não gravar.
- [ ] `plan-141` Forma verde — não, ver Pendências.
- [x] Bancada passa o rascunho do modo de cada variante.
- [x] Capturas novas em `C:\tmp\sarak-previa-166\`: `themes-atual-{escuro,claro}.png`, `cards-atual-{escuro,claro}.png`, `cardTextures-atual-{escuro,claro}.png`, e o painel real em escuro e CLARO em `painel-real/` (`claro-shape-cards.png`, `claro-shape-cardTextures.png`, `escuro-…`).

**Decisões e suposições**
- O limite de contraste é medido por pixel contra o fundo com textura (texto escondido), e texto que já partia abaixo de 4,5:1 só não pode piorar mais de 0,15. Sem essa exceção nenhuma textura passa no escuro.
- `carbon` (preto fixo) não tem valor seguro no claro (a −0,04 já perde contraste): ficou em 0,02. `none` grava 0,06.
- Como a opacidade é um valor só para os dois modos, vale o mais restritivo dos dois.
- A `index.html` da prévia não foi regenerada; as imagens novas estão na pasta.

**Achados fora do escopo (não corrigidos)**
- O `DeviceProvider` segue lendo a janela, não o contêiner (correção 2).

**Pendências / riscos**
- **`plan-141` Forma, `cardTextures` (escuro e claro):** `grid × dots` 0,88%, `grid × carbon` 0,88%, `blueprint-pro × hexagon` 0,88%, `blueprint-pro × paper` 0,88%, `dots × carbon` 0,00%, `hexagon × paper` 0,00% (limite 2%). Causa medida: com o texto a 4,5:1 **nenhuma das 40 texturas passa de 0% de pixels diferentes do card sem textura** pelo critério do spec (soma dos canais > 30); as de traço fino (grade, pontos, hexágono, blueprint) só aparecem acima de 0,3 de opacidade e aí o contraste cai. As que se veem forte (grão, ruído, papel, carbono) estragam o texto a partir de 0,08. Ou seja, T (a) não fecha o `plan-141` por si: opções para o dono — (b) o texto do card fica menos rígido (aceitar < 4,5:1 nessas texturas), (c) tirar das destacadas as que não se distinguem e ficar só com as que o spec distingue (nenhuma hoje), ou (d) mudar o critério do spec de pares para "a textura difere do card sem ela".
- Razão do Tema no claro oscila em torno de 2× (1,77× e 2,13×); o teto de 2× ficou sem folga no claro.

## Resumo da execução (correção 4) — 2026-11-19

**Resultado:** Concluído com pendências (o `plan-141` Forma segue vermelho só na 3ª opção do grupo `cardTextures`; ver Pendências)

**Estado do worktree ao iniciar**
Os arquivos da correção 3 (modificados e não rastreados), `docs/migracoes.md`, `sarak-ui/docs/migracoes.md`, `specs/00-backlog.md`, `specs/00-indice.md`, a plan, `buildInfo.ts` e `dist/` (ambiente).

**O que foi feito**
- **M2.** `amostras-reais-custo.spec.ts`: `THEME_OPEN_CEILING = 2.5` só para o Tema; os outros grupos seguem em `OPEN_CEILING = 2`.
- **T2, regra.** `CARD_TEXTURE_OPACITY` (`cards.ts`) recalibrada por textura: o maior valor em que o texto do card passa a 4,5:1 contra a MÉDIA do fundo atrás dele e a 3:1 no pior pixel, nos dois modos. Texto que já partia abaixo disso sem textura (o título e o subtítulo no escuro: 3,3 e 3,4 de média) não pode piorar mais de 0,3. O teto é 1. `presetCatalog.test.ts` guarda os 40 valores (e que o mapa cobre exatamente as texturas do schema).
- **T2, `plan-141`.** No grupo `cardTextures` o spec passa a comparar cada textura destacada com o card SEM textura (a opção "Nenhuma", lida atrás do "Ver todas"), com o limite de 2%; os outros grupos seguem opção com opção. Para isso `CardsCatalog.tsx` marca o botão da opção com `data-preset-id` (snapshot do `CardsCatalog` atualizado com `-u`, só nele).
- Como medi: o card real do painel (`SampleTitleCard`) numa bancada descartável (40 texturas × 2 modos × 16 opacidades de 0,02 a 1), com o texto escondido na captura para ler o fundo atrás dele: contraste do texto contra a média e contra o pior pixel de cada texto, e a parcela de pixels diferentes do mesmo card sem textura (soma dos canais > 30). Os scripts não ficaram no repositório.

**Tabela por textura** (medida na bancada; contraste = o do pior texto do card; diferença = parcela de pixels diferentes do card sem textura)

| Textura | Opacidade | Contraste médio (pior texto) | Pior pixel (pior texto) | Difere do card sem textura (escuro / claro) |
|---|---|---|---|---|
| grid | 1 | 3.62 | 3.34 | 0.7% / 2.8% |
| dots | 0.04 | 3.09 | 2.81 | 0.0% / 0.0% |
| noise | 0.04 | 3 | 2.79 | 0.0% / 0.0% |
| grain | 0.04 | 2.93 | 2.72 | 0.0% / 0.0% |
| mesh | 1 | 3.51 | 3.2 | 0.0% / 0.0% |
| waves | 1 | 3.56 | 3.04 | 0.6% / 2.0% |
| squares | 1 | 3.5 | 3.23 | 0.0% / 0.0% |
| stripes | 1 | 3.54 | 3.25 | 0.0% / 0.0% |
| topo | 1 | 3.58 | 3.19 | 0.0% / 0.4% |
| diamond | 1 | 3.57 | 3.09 | 0.0% / 2.0% |
| prestige | 1 | 3.53 | 3.25 | 0.0% / 0.0% |
| carbon | 0.04 | 3.19 | 2.95 | 0.0% / 0.0% |
| brushed | 0.3 | 3.47 | 3.21 | 0.0% / 0.0% |
| frosted | 0.4 | 3.3 | 3.03 | 0.0% / 0.0% |
| circuit | 0.3 | 3.46 | 3 | 0.0% / 1.1% |
| paper | 0.04 | 2.98 | 2.76 | 0.0% / 0.0% |
| scanlines | 0.06 | 3.16 | 2.91 | 0.0% / 0.0% |
| hexagon | 1 | 3.54 | 3.02 | 0.6% / 2.2% |
| silk | 1 | 3.53 | 3.2 | 0.0% / 12.4% |
| blueprint | 1 | 3.56 | 3.08 | 0.0% / 1.8% |
| aurora | 0.06 | 3.14 | 2.94 | 0.0% / 0.0% |
| stars | 0.6 | 3.51 | 3.09 | 0.0% / 0.0% |
| honeycomb | 0.1 | 3.39 | 3.14 | 0.0% / 0.0% |
| isometric | 0.26 | 3.52 | 3.05 | 0.0% / 0.7% |
| radar | 1 | 3.6 | 3.34 | 0.3% / 2.0% |
| crosshatch | 1 | 3.64 | 3.35 | 1.0% / 5.4% |
| micro-dots | 1 | 3.58 | 3.34 | 0.0% / 0.0% |
| pinstripes | 1 | 3.6 | 3.34 | 0.3% / 1.5% |
| constellation | 1 | 3.58 | 3.22 | 0.0% / 0.0% |
| circuit-pro | 0.8 | 3.59 | 3.22 | 0.1% / 1.4% |
| carbon-tech | 0.06 | 3.14 | 2.91 | 0.0% / 0.0% |
| topo-deep | 0.26 | 3.52 | 3.13 | 0.0% / 0.1% |
| prism-mesh | 0.3 | 3.42 | 3.06 | 0.0% / 0.1% |
| cyber-binary | 1 | 3.58 | 3.34 | 0.0% / 0.0% |
| blueprint-pro | 1 | 3.58 | 3.13 | 0.1% / 1.0% |
| wave-pulse | 0.26 | 3.54 | 3.03 | 0.1% / 1.6% |
| wood | 0.06 | 3.18 | 2.94 | 0.0% / 0.0% |
| stucco | 0.04 | 3 | 2.73 | 0.0% / 0.0% |
| fluid | 0.04 | 3.1 | 2.91 | 0.0% / 0.0% |
| nebula | 0.06 | 3.14 | 2.92 | 0.0% / 0.0% |

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/amostras-reais-custo.spec.ts` | alterado | teto de 2,5× só para o Tema |
| `src/core/Design/presets/components/cards.ts`, `__tests__/presetCatalog.test.ts` | alterado | opacidades recalibradas e o teste que as guarda |
| `src/features/DesignEngine/Canvas/components/CardsCatalog.tsx` e `__tests__/__snapshots__/CardsCatalog.test.tsx.snap` | alterado | `data-preset-id` no botão da opção |
| `browser-tests/plan-141-presets-do-painel.spec.ts` | alterado | `cardTextures` comparado com o card sem textura |
| `docs/migracoes.md`, `sarak-ui/docs/migracoes.md` | alterado | (correção 3; o kit foi regenerado) |

**Verificações executadas**
- `npx vitest run src/core/Design/presets/components` → 200 passed; `npm run build` → verde; `npm run verify -- --tier=quick` → verde (Anel 0: 4.441 linhas, 0 achado).
- `amostras-reais-custo` (completo) → 31 passed. Tema, 5 rodadas alternadas: escuro 1,79× (1,65; 1,71; 1,79; 1,98; 2,09), claro 2,02× (2,22; 2,47; 1,60; 1,78; 2,02), ambos dentro de 2,5×.
- `plan-161-catalogo-proporcional` → 25 passed.
- `plan-141-presets-do-painel` → 2 failed (Forma, escuro e claro), 25 passed: só `cardTextures`, abaixo.
- Capturas novas de Textura do card no painel real, nos dois modos: `C:\tmp\sarak-previa-166\painel-real\escuro-shape-cardTextures.png` e `claro-shape-cardTextures.png` (a prévia em claro mostra os hexágonos e a fibra de carbono sobre o card claro).

**Critérios de aceite**
- [x] M2: Tema ≤ 2,5× (1,79× e 2,02×).
- [x] Teste de unidade guarda os valores de `CARD_TEXTURE_OPACITY`.
- [x] Tabela por textura (acima).
- [ ] Cada textura destacada difere do card sem textura em ≥ 2%, nos dois modos — no painel real as destacadas medem de 5,9% a 10,8% (grade, projeto azul, grão, pontos, hexágonos, fibra, papel), EXCETO a 3ª opção do grupo, que sai sempre com 0,66% (escuro) e 0,00% (claro), ver Pendências.
- [ ] Nenhuma textura cumpre as três regras ao mesmo tempo na bancada (ver Decisões): nenhuma saiu das destacadas por isso.

**Decisões e suposições**
- **As três regras juntas não fecham em nenhuma textura, na bancada.** As de traço fino (grade, pontos, hexágono, blueprint) só passam de 2% de diferença em opacidade alta, e a regra de contraste deixa subir (o valor sai 1); as fortes (grão, ruído, papel, carbono) aparecem no escuro só a partir de 0,08 a 0,12, onde a média do texto cai abaixo de 3 (o texto ali já parte de 3,3). O valor gravado é o do contraste; a visibilidade no painel real passa nas sete destacadas (5,9% a 10,8%), mais folgada que a da bancada (a amostra do painel é maior e o fundo tem o gradiente da atmosfera). Por isso não tirei nenhuma das destacadas.
- Tolerância de 0,3 para o texto que já partia abaixo de 4,5 sem textura (o título e o subtítulo no escuro): sem ela nenhum valor serve; com 0,6 ou 1,0 o resultado da bancada é o mesmo.
- `carbon` ficou em 0,04 e `stucco` em 0,04 (menor valor com contraste seguro); `none` grava 0,06.

**Achados fora do escopo (não corrigidos)**
- O texto do título e do subtítulo do card parte de 3,3 a 3,4:1 (média) no escuro, sem textura nenhuma: é do card, não da textura.

**Pendências / riscos**
- **`plan-141` Forma, `cardTextures`, 3ª opção da grade (a primeira da segunda linha).** Em cinco rodadas, a textura que cai nessa posição sai idêntica ao card sem textura (escuro 0,66%, claro 0,00% ou 0,48%), seja qual for: `aurora`, `grain`, `dots` e `hexagon` falharam cada uma quando era a 3ª e passaram quando estavam em outra posição (`hexagon` com 10% na 5ª; `grain` com 6,6% na 4ª). A captura inteira do painel real (`claro-shape-cardTextures.png`) mostra os hexágonos na 3ª opção, então o produto desenha a textura; o que falha é a fotografia da amostra no spec. Tentei esperar 400 ms antes de fotografar e tirar o ponteiro de cima das opções; nenhum dos dois mudou o resultado, e desfiz os dois. Não achei a causa. Sem demotar nenhuma destacada por esse motivo, o `plan-141` fica vermelho em exatamente uma dupla por modo.
- A bancada e o painel real medem a visibilidade em quadros diferentes: o 2% do critério se confere no `plan-141`, não na tabela.

## Resumo da execução (correção 5) — 2026-11-19

**Resultado:** Bloqueado no achado 2 (a regra de saída tira todas as destacadas do grupo `cardTextures`; o veredito manda parar e trazer ao revisor). O achado 1 está corrigido.

**Estado do worktree ao iniciar**
Os arquivos das correções anteriores (modificados e não rastreados), `docs/migracoes.md`, `sarak-ui/docs/migracoes.md`, `specs/00-backlog.md`, `specs/00-indice.md`, a plan, `buildInfo.ts` e `dist/` (ambiente).

**Achado 1 — a medida de visibilidade**
- **Causa medida.** As fotografias das opções saem com 114 px de altura em umas e 113 px em outras (posição fracionária da opção na página); o card de comparação "Nenhuma" tem 113. Um deslocamento de 1 px em todo o desenho conta como diferença: era isso que dava de 5,9% a 10,8% nas destacadas e 0,66% na 3ª (a única fotografia com 113 px, igual à de comparação, e por isso a que "caía"). Em vez de dar a causa por suposta, diferenciei as imagens: `grid` (114 px) contra a referência (113 px) tinha 963 pixels diferentes numa faixa de 118×88, e a 3ª tinha 105, todos na última linha.
- **Correção.** `plan-141-presets-do-painel.spec.ts`: `DIFFERING_SHARE` ganha o parâmetro `shift`; na comparação com o card sem textura, um pixel só conta quando nenhum pixel do card de comparação, até 1 px ao redor, é parecido com ele. As comparações entre opções dos outros grupos seguem com `shift` 0, sem mudança. O card de comparação é o mesmo estado do medido (mesma opção, aberta só atrás do "Ver todas").
- **Mutação (registrada).** Com todas as `CARD_TEXTURE_OPACITY` em 0 (26 valores trocados num arquivo de trabalho; o `cards.ts` foi restaurado e confere com `cmp`), o caso Forma reprova nos dois modos, e as destacadas medem (escuro / claro): grade 0,42% / 0,65%; projeto azul 0,80% / 1,03%; aurora 0,60% / 0,00%; grão 0,99% / 0,38%; pontos 0,42% / 0,66%; hexágonos 0,82% / 1,04%; fibra 0,42% / 0,66%; papel 0,81% / 1,04%. A 3ª posição não cai mais fora do padrão (a aurora, 3ª, mede 0,60%).
- **Com as opacidades reais** a mesma medida dá (escuro / claro): grade 0,42% / 0,65%; projeto azul 0,80% / 1,03%; aurora 0,60% / 0,00%; grão 0,99% / 0,38%; pontos 0,42% / 0,66%; hexágonos 0,82% / 1,28%; fibra 0,42% / 0,66%; papel 0,81% / 1,04%.
- **Leitura.** A medida agora não inventa textura (sem textura dá o piso de 0,4 a 1,0%), mas ela também não distingue as opacidades reais do piso, com uma exceção: só os hexágonos no claro (1,28% contra 1,04%) saem do piso, e mesmo esses ficam abaixo de 2%. Concorda com a imagem (`escuro-shape-cardTextures.png`: nenhuma textura se vê; `claro-…`: só se percebem hexágonos e fibra de carbono). O critério "a mutação reprova todas as destacadas" cumpre-se, mas as opacidades reais reprovam as mesmas, pelo mesmo motivo.

**Achado 2 — a regra de saída (pare e traga ao revisor)**
Pela regra ("abaixo de 2% em qualquer modo sai das destacadas"), as oito destacadas saem, e ficariam 0 (< 4): paro aqui e não alterei `registry.ts` nem `cards.ts`. A lista, com o motivo de cada uma (escuro / claro):

| Destacada | Escuro | Claro | Motivo |
|---|---|---|---|
| grade técnica | 0,42% | 0,65% | desenha na cor da borda do card; mesmo a 1 de opacidade não se vê |
| projeto azul avançado | 0,80% | 1,03% | traço fino de 1 px, 100 px entre linhas |
| aurora | 0,60% | 0,00% | desfoque de 60 px a 0,06: sem contorno |
| grão fotográfico | 0,99% | 0,38% | opacidade 0,04: a de cima derruba o texto |
| pontos | 0,42% | 0,66% | ponto de 1 px a cada 16 px, a 0,04 |
| hexágonos | 0,82% | 1,28% | só no claro, e só um pouco |
| fibra de carbono | 0,42% | 0,66% | a 0,04 (a de cima derruba o texto no claro) |
| papel kraft | 0,81% | 1,04% | opacidade 0,04: a de cima derruba o texto |

O que o `plan-141` precisa do revisor: ou o limite de 2% muda para este grupo (os números reais ficam entre 0,4% e 1,3% mesmo com a textura bem visível ao olho, como a captura clara mostra nos hexágonos e na fibra), ou as texturas mudam de cor, ou as opacidades sobem e o contraste do texto cai. As duas últimas são decisão do dono (a cor da textura e o contraste), não desta rodada.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/plan-141-presets-do-painel.spec.ts` | alterado | `DIFFERING_SHARE` com tolerância de 1 px, usada só na comparação com o card sem textura |

**Verificações executadas**
- `npm run build` → verde; `npm run verify -- --tier=quick` → verde (Anel 0: 4.584 linhas, 0 achado).
- `plan-141-presets-do-painel` (Forma) → 2 failed (escuro e claro), 2 passed, só `cardTextures`, nos números acima; o resto do spec não foi tocado.
- Mutação do achado 1: ver acima (`cards.ts` restaurado, `cmp` ok).
- Capturas novas (21h39): `C:\tmp\sarak-previa-166\painel-real\escuro-shape-cardTextures.png` e `claro-shape-cardTextures.png`.

**Critérios de aceite**
- [x] O card de comparação fica no mesmo estado que o medido; a 3ª posição deixa de cair.
- [x] Mutação registrada: reprova todas as destacadas, nos dois modos.
- [ ] `plan-141` Forma verde nos dois modos — não: nenhuma textura do card chega a 2% com a medida certa.
- [ ] Regra de saída da T2 aplicada — parei: sairiam todas as oito.

**Decisões e suposições**
- A tolerância é de 1 px e só vale para a comparação com o card sem textura. Com mais de 1 px o deslocamento real das fotografias não cresce, e a de 0 reproduz a medida antiga.
- Não mexi nas destacadas nem nas opacidades, pelo "pare" do veredito.

**Pendências / riscos**
- Decisão do revisor/dono sobre o grupo `cardTextures` (acima).

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Nota do revisor — 2026-11-18 — decisões do dono e uma em aberto

Decididas na conversa de 2026-11-18: miniatura com a tela real reduzida (1a); gráficos só com estilo, o tipo é do importador, e a
prévia com todos os tipos (4a); amostras montadas com o componente real, com o que pesar avaliado na medição (9); textura do card no
card e textura do fundo no fundo com um card convencional (11 e 12).

**D1, em aberto até o lote 2:** as amostras de card ficam sobre o rascunho (o tema atual, o que a aplicação vai mostrar; desfaz a base
neutra do lote 3 da `plan-161`) ou sobre a base neutra? Recomendação do revisor: sobre o rascunho.

## Nota do revisor — 2026-11-18 — gráficos por estilo, modal e aviso com o desenho de hoje

O dono reprovou o protótipo de gráfico do lote 1: seis opções quase iguais, dois gráficos minúsculos por opção e a cor roxa do motor no
lugar da primária do tema. Ele confirmou que o grupo Gráficos lista **estilos, nunca tipos**, e que cada amostra é **um único gráfico**
com o estilo aplicado. Espiar ou escolher leva a prévia à tela "Gráficos", com todos os tipos no estilo escolhido. A §5 (3.1 a 3.4) e a
§6 foram reescritas com isso.

**Modal e aviso:** mantêm o desenho de hoje nesta plan, porque abrem em portal no `body`. Uma plan para o destino do portal só se o dono
pedir.

**Para o protótipo do lote 1:** refaça o de gráfico como um único gráfico por estilo, nas cores do tema, e meça de novo. Se o
espaçamento fixo do motor impedir a leitura, isso vai ao revisor com a medida.
## Veredito — 2026-11-19 — lote 1 (medição) e correção 1 — 🟢 Aprovado; o lote fecha com as decisões do dono

**Como medi.**
- Li o spec de custo, a bancada e os protótipos. Nada em `src/` mudou.
- Repeti a miniatura de tema no escuro (mediana de 3): abrir **1.042 → 2.247 ms (2,2×)**, nós **1.828 → 10.047 (5,5×)**, troca de modo
  850 → 1.647 ms (1,9×). Os nós batem com os do resumo, e o tempo varia com a carga da máquina (o resumo deu 3,3×).
- **Prévia** (`C:\tmp\sarak-previa-166\index.html`) conferida.
  - **Cards:** com o card real ("CPU Cluster"), as opções ficam distintas a olho.
  - **Gráficos:** agora é um gráfico único nas cores do tema, mas os estilos de hoje continuam próximos. Isso é dos valores dos
    presets, que o lote 3 redesenha.
  - **Miniatura de tema:** mostra a tela real, mas em escala de cerca de 0,1, ilegível a três por linha.

**Leitura da tabela do resumo:** só a miniatura de tema passa do teto proposto de 2×. O gráfico custa +8 MB e de 1,6× a 1,9× para abrir.
Os demais grupos ficam no ruído da medida.

**Decisões do dono** (o lote 2 só começa com elas registradas aqui):
- **M — miniatura de tema.**
  - (a) A tela real, mas recortada no topo da tela "Painel" (cabeçalho, primeira linha de cards e o gráfico), com duas por linha para
    ler. Teto de 2× para abrir. **Recomendação do revisor.**
  - (b) A tela inteira, com o custo medido.
  - (c) A miniatura de hoje; a espiada já mostra a tela real grande.
- **R — quais amostras ficam reais.** Recomendação: todas as medidas (cards, sombra, cantos, as duas texturas, tabela, gráfico, selo e
  progresso, estado vazio), com teto de 2× por grupo. Modal e aviso ficam com o desenho de hoje (nota de 2026-11-18).
- **D1 — base das amostras de card:** o rascunho (o que a aplicação mostra) ou a base neutra. Recomendação: o rascunho.

**Status da plan: 🟠 Em revisão** até as decisões do dono.

## Nota do revisor — 2026-11-19 — decisões R e D1 do dono; M em discussão

- **R:** todas as amostras medidas ficam reais: cards, sombra, cantos, as duas texturas, tabela, gráfico, selo e progresso, estado vazio.
  O teto é de 2× para abrir cada grupo. Modal e aviso mantêm o desenho de hoje.
- **D1 (a):** as amostras de card são desenhadas sobre o rascunho (o tema atual), e não sobre a base neutra. O lote 2 desfaz a base
  neutra do lote 3 da `plan-161` para os cards curados e os cards dos temas.
- **M:** em discussão com o dono. O lote 2 não começa sem ela.

## Nota do revisor — 2026-11-19 — decisão M do dono; lote 2 liberado

**M:** o dono prefere a **tela "Painel" inteira** (opção b) desde que o custo fique aceitável. Se não ficar, vale o **recorte do topo**
(opção a), com duas miniaturas por linha.
- **Critério:** o teto é de 2× para abrir a decisão Tema, contra o painel real de hoje, no mesmo spec e na mesma rodada.
- **O protótipo do lote 1 deu de 2,2× a 3,3×.** Ele desenhava as 25 miniaturas na bancada.
- **No lote 2, a tela inteira se mede com as proteções de produção:** só monta o que está visível (`LazyWhenVisible`), escopo enxuto,
  sem animação, e desmonta o que sai da área visível, se medir que ajuda.
- **Saída:** passou do teto, implemente o recorte do topo e meça de novo.
- **Na prévia,** a tela inteira e o recorte lado a lado, com os números das duas, para o dono confirmar.

Decisões do dono em vigor para o lote 2: M acima, R (todas as amostras medidas reais, teto de 2× por grupo, modal e aviso com o desenho
de hoje) e D1 (a) (cards sobre o rascunho).

**Status da plan: 🟡 Em execução** (lote 2).

## Veredito — 2026-11-19 — lote 2 — 🔵 Em correção (dois itens objetivos e uma decisão do dono)

**Como medi.**
- Li o diff de `PresetCard.tsx`, `DashboardMock.tsx`/`DashboardMetricsGrid.tsx`, `SampleParts.tsx`, `PresetSamples.tsx`, `CardsCatalog.tsx` e
  `panelResponsive.presets.ts`, e a remoção de `neutralCardBase.ts` (D1 a).
- **Prévia** (`C:\tmp\sarak-previa-166\index.html`) e capturas `themes-*` e `cardTextures-*` conferidas.
- Anel 1 verde (o `plan-index:check` cai só pelo 🟠). `check-audit-baseline --with-tsc` sem regressão.
- Os cards com o "CPU Cluster" real atendem D1 e a diferença de 5%.

**Achados**
1. **A miniatura de tema mostra o cromo de celular, não o de desktop.**
   - Em todas as capturas `themes-atual-*` a navegação está numa barra embaixo ("Início, Vendas, Pedidos").
   - O cromo só desenha a Sidebar ou a Topbar de desktop a partir de 1024 px de container (`SarakAppChrome.tsx`, comentário das linhas
     171-172). Abaixo disso, compacta (tablet) ou vira barra de baixo (celular). O quadro da miniatura é `THEME_FRAME` 720×400.
   - Critério: o quadro tem a largura do "Desktop" da prévia. A miniatura mostra a Sidebar ou a Topbar que o tema declara, como a
     prévia grande no Desktop. A razão do Tema é medida de novo nessa largura.
2. **A amostra de textura do card não é a textura real do card.**
   - `SampleTitleCard` põe por cima do card uma camada com `data-sx-texture` (o mecanismo da textura do **fundo**), sem opacidade
     (`TEXTURE_LAYER_STYLE`, `SampleParts.tsx:111`). Ela ignora `cardTextureOpacity`.
   - Em "Fibra de carbono", "Grão fotográfico" e "Papel kraft", o texto do card some. A aplicação não desenha assim.
   - Critério: a amostra usa o mecanismo do card (`data-sx-card-texture-type` no escopo, com a opacidade do rascunho ou do preset),
     e o texto do card continua legível como na aplicação.
   - O `plan-141` (Forma) fica verde. Se, com a opacidade real, duas texturas destacadas ficarem abaixo de 2%, traga os números: decidir
     a opacidade dos presets de textura é do dono.

**Decisão do dono — tela inteira ou recorte (M).** Na tabela da prévia, na mesma rodada, a tela inteira abriu em **865 ms** e o recorte em
**986 ms**. O resumo deu de 1,55× a 2,60× para a inteira e de 1,18× a 1,94× para o recorte, em 7 rodadas. Com o tempo oscilando assim,
a escolha não pode sair de uma rodada só. Depois do achado 1, meça as duas na largura de desktop: 5 rodadas alternadas, mediana da razão
contra o "hoje" na mesma rodada, e os nós. Leve as duas à prévia lado a lado. O dono escolhe pelos números e pela imagem.

**Texto da plan acompanhado:** o 2.3 e o critério da textura do fundo agora dizem "sem card por cima, com a barra de opacidade", como o
dono pediu na prévia do lote 1.

**Para o backlog** (#91, não é desta plan): as etiquetas de capacidade do `SarakTitleCard` ficam em 3,92:1 no escuro.

**Como fechar:** `npm run build`, `plan-141-presets-do-painel` (Forma), `amostras-reais-custo` (Tema, 5 rodadas, inteira × recorte)
e `plan-161-catalogo-proporcional` (a meta de rolagem do Tema). Capturas novas de Tema e de Textura do card na prévia. O revisor reroda
só esses.

**Status da plan: 🔵 Em correção.**

## Veredito — 2026-11-19 — lote 2, correção 2 — 🟢 Os dois itens fecham; o lote espera duas decisões do dono

**Como medi:** li o diff e conferi as capturas `themes-atual-escuro`, `themes-prototipo-escuro` e `cardTextures-atual-escuro`.
- **Item 1 fecha.** A miniatura é desenhada com `SarakDeviceProvider overrideDevice="desktop"` num quadro de 1024×576 e mostra a Sidebar
  ou a Topbar de desktop de cada tema, nas duas variantes.
- **Item 2 fecha.** A textura do card usa o mecanismo do card, com a opacidade do rascunho, e o texto do card fica legível.
- **Achado de produto que a amostra fiel revelou:** com a opacidade padrão (`cardTextureOpacity` 0,06), as texturas do card quase não
  aparecem, na amostra e na aplicação. Só "Papel kraft" e "Grão fotográfico" se percebem. É por isso que o `plan-141` (Forma) segue
  vermelho.

**Decisões do dono** (o lote 2 fecha com elas e com o ok na prévia):
- **M — miniatura.** Medianas de 5 rodadas na largura de desktop: o recorte 1,16× no escuro e 1,43× no claro, a tela inteira 1,56× e
  1,77×. A inteira passou de 2× em 2 de 10 rodadas, e o recorte em nenhuma. Nós: 5.685 × 10.047.
  - (a) A tela inteira: as medianas ficam abaixo de 2×, e é a preferência do dono.
  - (b) O recorte.
- **T — opacidade das texturas do card.**
  - (a) Cada preset de textura do card grava a própria `cardTextureOpacity`, num valor em que a textura aparece e o texto do card
    continua a 4,5:1, medido por textura. Escolher uma textura passa a mostrá-la na aplicação. **Recomendação do revisor.**
  - (b) Manter 0,06 e tirar das destacadas as que não se distinguem.

**Status da plan: 🟠 Em revisão** até as decisões M e T.

## Nota do revisor — 2026-11-19 — decisões M e T do dono; mais uma rodada do lote 2

- **M (a): a miniatura de tema é a tela "Painel" inteira.** As medianas ficaram em 1,56× e 1,77×, abaixo do teto de 2×. O recorte do topo
  (`part="top"`) sai do produto. O spec de custo passa a afirmar o teto da tela inteira, pela mediana das rodadas alternadas.
- **T (a): cada preset de textura do card grava a própria `cardTextureOpacity`** (`CARD_TEXTURE_PRESETS`, `cards.ts`).
  - O valor é o menor em que a textura aparece e o texto do card continua a 4,5:1 contra o fundo do card com a textura, nos dois modos,
    medido por textura.
  - O grupo `cardTextures` deixa de ser opção de um token só, porque grava dois tokens. `registry.ts` acompanha (`owns`).
  - Critério: o `plan-141` (Forma) verde, com ao menos 2% entre duas texturas destacadas, nos dois modos. Um teste reprova se o preset
    não gravar a opacidade.
  - Em `docs/migracoes.md`: escolher uma textura de card passa a gravar também a opacidade.
- **A bancada passa o rascunho do modo de cada variante** (`amostras-reais-custo-entry.tsx` usa hoje o design do sistema escuro para as
  duas). Na prévia, o claro mostra os cards claros. Acrescente uma captura do **painel real** (a decisão Forma, com a prévia em CLARO) para
  o dono conferir que os cards seguem o modo da prévia.

**Como fechar:** `npm run build`, `plan-141-presets-do-painel` (Forma), `amostras-reais-custo` (Tema, tela inteira) e
`plan-161-catalogo-proporcional`. A prévia ganha as capturas novas de Tema, Cards (claro e escuro) e Textura do card.

## Veredito — 2026-11-19 — lote 2, correção 3 — 🟠 Código certo; o lote espera duas decisões do dono

**Como medi:** li o resumo e o diff (`PresetCard.tsx` sem `part`, `cards.ts` com `CARD_TEXTURE_OPACITY`, `registry.ts` com
`optionsOfTokenAndSetting`, a bancada com `useDraftOfMode`). Conferi as capturas `painel-real/claro-shape-cards` e
`claro-shape-cardTextures`.
- **M (a) feita:** a miniatura é a tela inteira.
- **A bancada no modo de cada variante está feita.** O painel real em CLARO mostra os cards claros: o que o dono viu era só da bancada.
- **T (a) feita como pedida, mas não atinge o efeito.** Com o contraste medido no **pior pixel** do fundo atrás do texto, nenhuma textura
  aparece antes de o texto cair. As de traço fino (grade, pontos, hexágono, blueprint) só se veem acima de 0,3 de opacidade, e uma linha
  da grade sob uma letra já derruba o pior pixel. Por isso o `plan-141` (Forma) segue vermelho.

**Decisões do dono:**
- **T2 — como medir o texto sobre a textura.**
  - (a) O texto passa a 4,5:1 contra a **média** do fundo atrás dele, e a 3:1 no pior pixel (uma linha da textura sob uma letra não
    apaga a letra). A textura tem de diferir do card sem textura em ao menos 2% dos pixels, e o `plan-141` passa a comparar cada textura
    com o card sem ela, não as texturas entre si. **Recomendação do revisor.**
  - (b) Manter 4,5:1 no pior pixel e aceitar que as texturas do card quase não aparecem. Saem das destacadas as que não se distinguem.
- **M2 — o teto do Tema.** Na tela inteira, a mediana deu 1,59× no escuro e **2,13× no claro** nesta rodada (1,77× na anterior). Ela
  oscila em torno de 2×.
  - (a) Teto de 2,5× para a decisão Tema. O painel é só do administrador, e são cerca de 1 s a mais para abrir. **Recomendação do
    revisor.**
  - (b) Manter 2×: volta o recorte do topo.

**Para a próxima rodada, em qualquer caso:** regenerar o `index.html` da prévia, que não foi refeito, com as capturas novas.

**Status da plan: 🟠 Em revisão** até as decisões T2 e M2.

## Nota do revisor — 2026-11-19 — ok do dono na prévia do lote 2

O dono aprovou a prévia do lote 2, refeita em `C:\tmp\sarak-previa-166\painel-real\index.html` com as capturas do painel real nos dois
modos. **Correção do veredito anterior:** a prévia foi refeita, sim. O revisor olhou só o `index.html` da raiz, que é anterior.

Para o lote 2 fechar faltam as decisões T2 (como medir o texto sobre a textura do card) e M2 (o teto do Tema). Sem elas, o `plan-141`
(Forma) e o spec de custo (Tema, claro) seguem vermelhos.

## Nota do revisor — 2026-11-19 — decisão M2 do dono

**M2 (a):** o teto da decisão Tema é de **2,5×** para abrir (mediana das rodadas alternadas, contra o "hoje" da mesma rodada), com a tela
inteira. Os outros grupos seguem com 2×. O spec de custo afirma 2,5× só para o Tema.

**T2:** em esclarecimento com o dono. O print que ele mandou é a **textura do fundo**, que aparece bem. O vermelho do `plan-141` é a
**textura do card** (`painel-real/claro-shape-cardTextures.png`).

## Nota do revisor — 2026-11-19 — decisão T2 do dono; última rodada do lote 2

**T2 (a), para a textura do card:**
- **Legibilidade:** o texto do card passa a 4,5:1 contra a **média** do fundo atrás dele (com a textura) e a pelo menos 3:1 no pior pixel,
  nos dois modos.
- **Opacidade:** `CARD_TEXTURE_OPACITY` é recalibrada com essa regra. Vale o maior valor que a cumpre, para a textura aparecer.
- **Visibilidade:** cada textura destacada difere do card **sem textura** em ao menos 2% dos pixels, nos dois modos. O `plan-141` (Forma)
  passa a comparar, no grupo `cardTextures`, cada textura com o card sem ela, e não as texturas entre si. Os outros grupos seguem
  comparando opção com opção.
- Um teste de unidade guarda os valores, e o resumo traz a tabela por textura (opacidade, contraste médio, pior pixel e diferença).
- Textura que não cumprir as três regras ao mesmo tempo sai das destacadas, e o resumo diz qual e por quê.

**Também nesta rodada:** o spec de custo afirma 2,5× para o Tema (M2) e 2× para os outros grupos.

**Como fechar:** `npm run build`, `plan-141-presets-do-painel` (Forma), `amostras-reais-custo` e `plan-161-catalogo-proporcional`.
Captura nova de Textura do card no painel real, nos dois modos.

## Veredito — 2026-11-19 — lote 2, correção 4 — 🔵 Em correção (a medida de visibilidade não mede a textura)

**Como medi:** li o resumo e o diff (`cards.ts`, `plan-141`, `CardsCatalog.tsx`, o teto de 2,5× no spec de custo). Olhei as capturas
`painel-real/escuro-shape-cardTextures.png` e `claro-shape-cardTextures.png`, ambas das 21h02 de hoje.
- **M2 feita:** o Tema ficou em 1,79× e 2,02×, dentro de 2,5×.
- **A tabela por textura e o teste que guarda os valores estão feitos.**

**Achados**
1. **O número de visibilidade do painel real não confere com a imagem.**
   - O resumo dá de 5,9% a 10,8% para as sete destacadas. Na captura escura, nenhuma textura se vê. Na clara, só os hexágonos e a fibra
     de carbono.
   - "Grade técnica", com opacidade 1, sai igual ao card sem textura nos dois modos.
   - A diferença medida vem de outra coisa: estado do card de comparação "Nenhuma" (selecionado, ponteiro, foco), posição, montagem por
     visibilidade. É provavelmente a mesma causa da 3ª posição, que sai sempre com 0%.
   - Critério:
     - o card de comparação fica no mesmo estado que o medido;
     - uma mutação mostra que a medida pega a textura (com todas as `CARD_TEXTURE_OPACITY` em 0, o caso reprova **todas** as destacadas,
       nos dois modos, e o resultado vai no resumo);
     - a 3ª posição deixa de cair.
2. **Aplicar a regra de saída da T2 com a medida certa.**
   - Destacada abaixo de 2% em qualquer modo sai das destacadas. O resumo lista quais saíram e quais ficaram, com o número de cada uma.
   - Se ficarem menos de quatro destacadas, **pare e traga ao revisor** a lista e o motivo de cada uma. Várias texturas desenham na cor da
     borda do card (a grade), e nenhuma opacidade as mostra. Mudar a cor de uma textura é decisão do dono, não desta rodada.

**Para o backlog** (atualiza o #91, mesmo componente): o título e o subtítulo do `SarakTitleCard` partem de 3,3 a 3,4:1 no escuro, sem
textura nenhuma.

**Como fechar:** `npm run build`, a mutação do achado 1 (registrada no resumo) e `plan-141-presets-do-painel` (Forma) verde, nos dois
modos. Captura nova de Textura do card no painel real. O revisor reroda o `plan-141` e confere a captura contra os números.

**Status da plan: 🔵 Em correção.**

## Veredito — 2026-11-19 — lote 2, correção 5 — 🟠 Achado 1 fecha; o lote espera a decisão T3 do dono

**Como medi:** li o resumo e o diff do `plan-141` (`DIFFERING_SHARE` com tolerância de 1 px só na comparação com o card sem textura).
- **Achado 1 fecha.** A causa era a altura das fotografias: 113 × 114 px, por posição fracionária. Ela foi provada por diferença de
  imagem.
- **A mutação está registrada:** com opacidade 0, todas as destacadas reprovam nos dois modos. A 3ª posição deixou de cair.
- **O número agora concorda com as capturas:** no escuro nenhuma textura se vê; no claro, quase só os hexágonos e a fibra.
- **A parada do achado 2 está certa.** Com a regra de legibilidade da T2, nenhuma textura do card sai do piso de "sem textura" (de 0,4% a
  1,3%), e as oito destacadas sairiam.

**Leitura do revisor:** a textura do card é desenhada sobre a área inteira do card, inclusive atrás do texto. Por isso visibilidade e
legibilidade disputam o mesmo pixel, e nenhuma opacidade satisfaz as duas. Não é defeito da amostra: é como a aplicação desenha hoje.

**Decisão T3 do dono:**
- **(a) A textura some atrás do texto e aparece forte nas bordas** (uma máscara em degradê no desenho da textura do card).
  - O texto fica sobre fundo limpo, e a textura pode subir de opacidade nas bordas até aparecer.
  - Muda o desenho da textura de card em todo sistema que a usa (`_atmosphere.css`, fora do escopo de hoje: entra no escopo, e
    `docs/migracoes.md`).
  - **Recomendação do revisor.**
- **(b) As texturas do card ficam sutis, como hoje.** O grupo fica sem destacadas (só "Ver todas"), com uma frase dizendo que a textura do
  card é discreta por legibilidade. O `plan-141` deixa de medir pares nesse grupo.
- **(c) Subir a opacidade e aceitar texto abaixo de 4,5:1 nos cards com textura.** Não recomendado: é perda de acessibilidade.

**Status da plan: 🟠 Em revisão** até a decisão T3.

## Nota do revisor — 2026-11-20 — decisão T3 do dono

**T3 (a): a textura do card aparece nas bordas e some atrás do texto.**
- **Máscara:** o desenho da textura do card (`::after` de `[data-sx-card-texture-type]`, `_atmosphere.css`) ganha uma máscara em degradê.
  Ela é transparente na área de conteúdo e opaca nas bordas. O formato e a largura da faixa ficam a critério do executor, medidos.
- **Texto:** pelo menos 4,5:1 contra a média do fundo atrás dele e 3:1 no pior pixel, nos dois modos (a regra da T2 continua).
- **Opacidade:** `CARD_TEXTURE_OPACITY` é recalibrada com a máscara. Vale o maior valor que cumpre a regra do texto, como na T2.
- **Visibilidade:** cada destacada difere do card sem textura em ao menos 2% dos pixels, nos dois modos, pela medida da correção 5.
  Destacada abaixo disso sai das destacadas. Se ficarem menos de quatro, pare e traga ao revisor.
- **O que não muda:** a textura do fundo e o `cardTextureType` (só o desenho). As texturas que hoje dependem do card inteiro (aurora,
  nebulosa e afins) seguem a mesma máscara.
- **Migrações:** `docs/migracoes.md` diz que a textura de card passa a aparecer nas bordas e não atrás do conteúdo, em todo sistema que a
  usa.
- **Prévia:** antes e depois da Textura do card no painel real, nos dois modos, e um card de verdade da tela "Painel" com textura, para o
  dono ver a máscara numa tela de verdade. O lote 2 só fecha com o ok dele.

**Como fechar:** `npm run build`, `plan-141-presets-do-painel` (Forma) verde nos dois modos, `cromo-css-real:check` (mexe em CSS da
lib) e `textura-muda-pixel`. O revisor reroda esses.

### Resumo da execução (correção 6) — 2026-11-20

**Parada pela regra da T3:** com a máscara, o texto ficou legível, mas só uma textura destacada passa de 2% nos dois modos. Restam menos de quatro, então a lista de destacadas **não foi alterada** e o caso vai ao revisor.

- **Estado do worktree:** fotografado antes de editar; o worktree já trazia as entregas das correções anteriores e `dist/`.
- **O que foi feito:**
  - `_atmosphere.css`: máscara na `::after` do card, uma moldura de 14 px nas bordas, transparente no conteúdo.
  - As 13 texturas compartilhadas com a página passam o próprio desenho por `--sarak-tex-shape`, sem mexer no fundo.
  - `cards.ts`: `CARD_TEXTURE_OPACITY` recalibrada, no maior valor que cumpre o texto.
  - `docs/migracoes.md` diz que a textura aparece nas bordas e não atrás do conteúdo; `npm run guide` regenerou o kit.
- **Visibilidade medida** (parcela de pixels diferentes do card sem textura; escuro / claro):

| Textura | Escuro | Claro |
|---|---|---|
| carbon | 6,68% | 12,11% |
| paper | 3,68% | 1,04% |
| grain | 1,69% | 0,38% |
| aurora | 1,26% | 0,00% |
| hexagon | 0,82% | 1,04% |
| blueprint-pro | 0,80% | 1,03% |
| grid | 0,42% | 0,65% |
| dots | 0,42% | 0,66% |

- **Motivo:** quase todas desenham em cor de borda ou tom tênue, e o texto e a textura dividem os mesmos pixels. Só `carbon` passa nos dois modos.
- **Decisão pendente do revisor:** rebaixar as que não passam, rever o limite de 2% ou outra forma de a textura aparecer.
- **Verificações:** vitest de presets 200 verdes; `textura-muda-pixel` 4 verdes; plan-141 (Forma): 2 falhas, ambas a regra de 2% acima.
- **Prévia:** `C:\tmp\sarak-previa-166\painel-real\` (antes e depois, nos dois modos) e `painel-card-textura-{carbon,paper,hexagon}-{escuro,claro}.png`. O lote 2 espera o ok do dono.

## Veredito — 2026-11-20 — lote 2, correção 6 (T3) — 🟠 A máscara funciona; o lote espera a decisão T4 do dono

**Como medi:** li o resumo (correção 6) e o diff de `_atmosphere.css` (+45 linhas: a máscara de 14 px na `::after` do card e
`--sarak-tex-shape` nas 13 texturas que o fundo também usa). Olhei `painel-real/claro-shape-cardTextures.png` e
`painel-card-textura-hexagon-escuro.png` (a tela "Painel" inteira com hexágonos).
- **A máscara funciona:** o texto fica sobre fundo limpo, e a textura só existe na moldura.
- **A textura continua quase invisível.** Na tela "Painel", os hexágonos são um traço na borda de baixo de alguns cards. No painel, só
  "Fibra de carbono" se destaca. Os números do resumo concordam: só `carbon` passa de 2% nos dois modos.
- **Leitura do revisor:** com o texto protegido, o limite agora é a cor. A maioria das texturas desenha na cor da borda do card, quase
  igual ao fundo dele. "Grade técnica", com opacidade 1, não aparece.
- **Faltou rodar:** `cromo-css-real:check`, pedido no fechamento por mexer em CSS da lib. Ele entra na próxima rodada, seja qual for a
  decisão.

**Decisão T4 do dono:**
- **(a) Na moldura, a textura do card desenha na cor de destaque** (`textureColor`, ou a primária quando o tema não declara
  `textureColor`), e não na cor da borda. Com o texto já protegido pela máscara, a cor pode ser forte o bastante para aparecer.
  **Recomendação do revisor.**
- **(b) As texturas do card ficam sutis.** Só as que passam (hoje `carbon`) ficam nas destacadas, e o resto vai para "Ver todas", com
  uma frase de que a textura do card é discreta.
- **(c) Desfazer a máscara e voltar ao desenho de antes** (a textura no card inteiro, sutil).

**Status da plan: 🟠 Em revisão** até a decisão T4.

## Nota do revisor — 2026-11-20 — decisão T4 do dono (correção objetiva)

**T4 (a), com a opacidade:**
1. **Cor:** na moldura da máscara, a textura do card desenha em `textureColor` (ou na primária, quando o tema não a declara), não na cor
   da borda.
2. **Opacidade:** `CARD_TEXTURE_OPACITY` sobe até cada destacada diferir do card sem textura em ao menos 2%, nos dois modos. Com a máscara,
   a moldura não fica atrás do texto: a regra do texto da T2 continua valendo e não deve limitar.

**Verificação:** `npm run build`, `plan-141-presets-do-painel` (Forma) verde nos dois modos e `cromo-css-real:check`. Captura nova da
Textura do card e de `painel-card-textura-hexagon-*`.

## Resumo da execução (correção T4) — 2026-11-20

**Resultado:** Concluído com pendências (`plan-141` Forma segue vermelho nos dois modos: as texturas de traço fino não chegam a 2% por geometria)

**Estado do worktree ao iniciar**
Trabalho das correções anteriores (`src/features/DesignEngine/Canvas/`, `cards.ts`, `registry.ts`, `_atmosphere.css`, specs e fixtures de `browser-tests/`, `docs/migracoes.md`, `specs/`) e `dist/`; não toquei no que não é desta correção.

**O que foi feito**
- `_atmosphere.css`: nova regra só do card para `grid`, desenhando em `--theme-texture-color` (primária se ausente) e não na cor da borda; a textura do fundo não mudou. Moldura da máscara de 14 px em degradê para 20 px sólidos com queda nos últimos 6 px (`--sarak-card-texture-frame`, abaixo dos 24 px de respiro do card).
- `cards.ts`: `CARD_TEXTURE_OPACITY` = 1 em todas (a máscara protege o texto; a regra de legibilidade não limita mais); comentário reescrito. `presetCatalog.test.ts`: valores atualizados.

**Verificações executadas**
- `npm run build` → verde (3 vezes).
- `plan-141` Forma → 2 failed. Escuro: grid 0,42%, blueprint-pro 0,80%, dots 0,42%, hexagon 0,82%. Claro: grid 0,65%, blueprint-pro 1,03%, grain 0,38%, dots 0,66%, hexagon 1,15%, paper abaixo de 2%. Passam nos dois modos: carbon e aurora.
- `npx vitest run` presets + Canvas → 465 passed, 2 failed na rodada em grupo (opacidades fixadas, corrigido; snapshot da galeria de temas, que passa isolado); os dois arquivos depois: 164 passed.
- `cromo-css-real:check` → 845 passed, 2 skipped, 12 failed: `plan-141` Forma (2), `cartao-cede-a-classe` material (2), `fontes-no-painel` bundled (1), `plan-135` paletas (1), `seletor-da-barra-legivel` (6). Os 10 fora do `plan-141` não tocam em textura de card; não rodei controle em `HEAD`, então não afirmo se já falhavam.

**Critérios de aceite**
- [x] Cor na moldura em `textureColor`/primária.
- [x] Opacidade no teto (1).
- [ ] `plan-141` Forma verde — não: com cor e opacidade no teto, grade (linha de 1 px a cada 32 px), pontos (16 px), blueprint-pro e hexagon cobrem menos de 1,2% da moldura; só aumentar a moldura não adianta (grid ficou em 0,42% com 14 e 20 px).
- [x] Capturas em `C:\tmp\sarak-previa-166\`: `cardTextures-t4-{escuro,claro}.png`, `painel-card-textura-hexagon-{escuro,claro}.png`.

**Decisões e suposições**
- Opacidade 1 também nas texturas que não são destacadas, por consistência (antes eram 0,12–0,8 pela regra de texto).
- Lista de destacadas não alterada: restariam 2 (nos dois modos) ou 3, menos de quatro (regra da T3: parar).

**Achados fora do escopo (não corrigidos)**
- 10 falhas do `cromo-css-real:check` fora do `plan-141` (acima).
- Snapshot da galeria de temas intermitente em rodada em grupo.

**Pendências / riscos**
- Decisão do revisor/dono: (a) trocar o critério do `plan-141` por "visível ao olho" nas de traço fino, (b) reduzir as destacadas às que passam (carbon, aurora, paper, grain) com frase de textura discreta, ou (c) mudar o desenho das de traço fino (traço mais grosso), hoje fora do escopo.

## Veredito — 2026-11-20 — lote 2, correção T4 — 🟠 A cor e a opacidade não bastam; duas regressões de navegador; o lote espera a decisão T5

**Como medi:** li o resumo e o diff de `cards.ts` e `_atmosphere.css`. Olhei `cardTextures-t4-{escuro,claro}.png`. Rodei as 4 specs que
falharam fora da `plan-141` no worktree e num controle no `HEAD`: uma cópia `git archive` com junção de `node_modules`, construída com
`npm run build`. O build parou no último passo (o `generate-build-info` pede o git), mas o JS e o CSS já tinham saído.

| Spec | `HEAD` | worktree |
|---|---|---|
| `cartao-cede-a-classe` material (app e embarcado) | verde | **vermelho**: o gradiente da classe sai `none` |
| `seletor-da-barra-legivel` (6 casos) | verde | **vermelho**: 0 botões selecionados em vez de 2 |
| `plan-135-paletas-no-painel` | vermelho | vermelho (pré-existente, mesmo ponto) |
| `fontes-no-painel` bundled | verde | verde nesta rodada (intermitente) |

**Achado 1 — duas regressões da plan.** `cartao-cede-a-classe` (2 casos) e `seletor-da-barra-legivel` (6 casos) passam no `HEAD` e falham
com a árvore da 166. Elas bloqueiam o commit do lote.

**Achado 2 — opacidade 1 em todas passou do pedido.** A nota T4 pedia que a opacidade subisse até cada destacada passar de 2%, e não que
fosse ao teto. Com 1:
- "Grão fotográfico" e "Papel kraft" no escuro viraram chuvisco.
- "Fibra de carbono" no claro virou uma moldura preta tracejada.

As que não são destacadas também subiram, de 0,12–0,8 para 1, sem medida.

**Achado 3 — a cor não era o limite das de traço fino.** Só a `grid` desenhava na cor da borda; `hexagon`, `waves`, `topo` e as demais já
desenhavam em `textureColor`. O limite é o traço: o SVG delas tem 1 px com `stroke-opacity` de 0,2 a 0,3, e a amostra mostra o card
reduzido. Mesmo na opacidade 1, "Grade técnica", "Projeto azul avançado", "Pontos" e "Hexagonais" seguem invisíveis. Isto confirma o
diagnóstico do executor.
O desenho da textura do card em `_atmosphere.css` está no escopo (§3.1). A opção (c) do executor não sai do escopo.

**Decisão T5 do dono:**
- **(a) Na moldura do card, as de traço fino desenham com traço de 2 px e `stroke-opacity` 1.** A textura do fundo não muda. A opacidade
  de cada textura fica no menor valor que passa de 2% nos dois modos. As não destacadas voltam ao valor de antes. **Recomendação do
  revisor**: é o que faz a textura aparecer sem virar chuvisco.
- **(b) Destacadas só as que passam** ("Fibra de carbono" e "Aurora boreal" nos dois modos), mais as que o dono escolher no olho. O resto
  vai para "Ver todas", com a frase de que a textura do card é discreta.
- **(c) Desfazer a máscara** e voltar ao desenho sutil no card inteiro.

Em qualquer opção, o executor conserta o Achado 1.

**Status da plan: 🟠 Em revisão** até a decisão T5.

## Resumo da execução (correção T5) — 2026-11-20

**Resultado:** Concluído com pendências (o achado 1 é improcedente, com prova; três texturas saíram das destacadas do card)

**Estado do worktree ao iniciar**
O das correções anteriores (`src/features/DesignEngine/Canvas/`, `cards.ts`, `registry.ts`, `_atmosphere.css`, `presetCatalog.test.ts`, specs e fixtures de `browser-tests/`, `docs/migracoes.md`, `specs/`) e `dist/`; nada fora disso.

**Achado 1 (regressões de `cartao-cede-a-classe` e `seletor-da-barra-legivel`) — improcedente, divergência registrada.** As 8 falhas não vêm da árvore da plan: um build novo do `HEAD` limpo falha nas mesmas 8.
- Cópia de `git archive HEAD` fora do repositório (junção de `node_modules`), com `build:js`, `fonts:embed`, `build:css`, `build:css:scoped`, `copy-base-css` rodados: `cartao-cede-a-classe seletor-da-barra-legivel` → **8 failed, 12 passed**, os mesmos casos do worktree.
- Por que o `HEAD` "passa": o `dist/` rastreado no `HEAD` é de um build antigo. Na cópia, o `npm run build` para em `generate-build-info` (a cópia não tem `.git`), e o `dist/sarak.css` e o `dist/index.js` rastreados, velhos, ficam; o CSS velho traz `.to-[var(--sarak-status-info-color,#3b82f6)]` e o JS velho traz o menu com `aria-pressed`. Esse CSS não sai de nenhum fonte de `src/` do `HEAD` (o `harness-entry.tsx` cita as classes, mas `browser-tests/` não é varrido pelo Tailwind: um canário em `browser-tests/` não entrou no CSS, um em `src/` entrou).
- Trocando só o `dist/index.js` da cópia pelo do worktree, `cartao-cede-a-classe` (app) cai: o JS decide, e o CSS não.
- Não corrigi: a causa é a fixture e os fontes dependerem de classes e de um menu que um build novo não gera mais, fora do escopo da §3.1. Decisão do revisor: dono dos dois specs (plan-159/164 mexeram no menu de preferências).

**O que foi feito (T5 a)**
- `_atmosphere.css`: 11 regras só do card (`data-sx-card-texture-type`) que redesenham `--sarak-tex-shape` das texturas de SVG com traço de 2 px renderizados e `stroke-opacity` 1 (gerado por script, conferido); grade e pontos do card com 2 px (`grid`, `dots`). A textura do fundo não foi tocada.
- Moldura: 20 px sólidos com queda nos últimos 6 px (`--sarak-card-texture-frame`).
- `registry.ts`: `cardTextures` ganha a lista própria `FEATURED_CARD_TEXTURES` (grid, dots, carbon, paper, aurora, honeycomb, noise, fluid); `hexagon`, `blueprint-pro` e `grain` saem das destacadas do card (regra da T3: abaixo de 2% sai), e continuam em "Ver todas". O grupo `textures` (fundo) segue com a lista de antes.
- `cards.ts`: `CARD_TEXTURE_OPACITY` de volta ao valor de antes em todas, menos nas 8 destacadas, no menor valor testado que passa no `plan-141` Forma nos dois modos: grid 1, dots 1, carbon 0,25, paper 0,4, aurora 0,8, honeycomb 0,45, noise 0,35, fluid 0,2. Testados e reprovados: paper 0,35 (1,26%), noise 0,3 (1,77%), dots 0,5 (1,84%), dots 0,2 (1,34%), paper 0,3 e noise 0,25 (0,59% e 0,92% no claro). Não busquei o mínimo além disso (honeycomb 0,45 e aurora 0,8 vieram da medida de apoio, não de uma bissecção no caso real).
- `presetCatalog.test.ts`: valores atualizados.

**Verificações executadas**
- `npm run build` → verde (4 vezes).
- `plan-141-presets-do-painel` (Forma e o arquivo inteiro) → verde nos dois modos.
- `npx vitest run src/core/Design/presets/components src/features/DesignEngine/Canvas` → 466 passed, 1 failed (o snapshot da galeria de temas, intermitente em grupo, passa isolado; já registrado).
- `cromo-css-real:check` completo (antes de reverter o `blueprint-pro` do card): 846 passed, 2 skipped, 12 failed: `cartao-cede-a-classe` material (2) e `seletor-da-barra-legivel` (6), improcedentes (achado 1); `fontes-no-painel` bundled (1, intermitente: verde em outra rodada) e `plan-135-paletas-no-painel` (1), ambos já vermelhos no controle do revisor; `token-que-desenha` A7 `blueprint-pro` (1, minha: a regra do card trocava o gradiente que o spec fixa; revertida); `zz-captura-t5` (1, a captura temporária que apaguei durante a rodada, sem relação). Depois de reverter: `token-que-desenha plan-141-presets-do-painel textura-muda-pixel` → 59 passed.
- Não refiz o `cromo-css-real:check` inteiro depois da reversão do `blueprint-pro` (1,2 h).

**Critérios de aceite**
- [x] Traço de 2 px e opacidade 1 só na moldura do card; fundo intacto.
- [x] Opacidade das destacadas no menor valor testado que passa; não destacadas de volta ao valor de antes.
- [x] `plan-141` Forma verde nos dois modos.
- [ ] `cartao-cede-a-classe` e `seletor-da-barra-legivel` verdes — não: improcedente, ver achado 1.
- [x] Capturas em `C:\tmp\sarak-previa-166\`: `cardTextures-t5-{escuro,claro}.png` e `painel-card-textura-hexagon-card-{escuro,claro}.png` (primeiro card da tela "Painel" com hexágonos, recortado).

**Decisões e suposições**
- "Traço de 2 px" = 2 px renderizados (o SVG de hexágono tem viewBox 28 e largura 56, então o traço de 1 já renderizava 2 px; nele só a opacidade subiu de 0,3 para 1).
- `blueprint-pro`: a regra de gradiente do card ficou como antes (o `token-que-desenha` A7 a fixa); a textura saiu das destacadas.
- `hexagon` (1,1% e 1,5% a opacidade 1), `blueprint-pro` (1,3% no escuro) e `grain` (0,4% no claro, branco sobre card claro) não passam de 2% com a moldura de 20 px.

**Achados fora do escopo (não corrigidos)**
- O `dist/` rastreado está velho em relação aos fontes; o `HEAD` só "passa" os 8 casos por isso.
- `fixtures/harness-entry.tsx` cita classes que nenhum fonte de `src/` cita (`bg-gradient-to-r from-[…] to-[…]`).

**Pendências / riscos**
- Decisão do revisor sobre o achado 1 (corrigir os specs/fonte ou regenerar e commitar o `dist/`).
- A opção "Hexagonais" e "Projeto azul avançado" saíram da vista do grupo; se o dono quiser mantê-las, é preciso um traço maior que 2 px ou uma moldura mais larga.

## Veredito — 2026-11-20 — lote 2, correção T5 — 🔵 T5 entregue; dois gates do commit em vermelho

**Como medi:** li o resumo e o diff de `registry.ts` e `cards.ts`. Olhei `cardTextures-t5-{escuro,claro}.png` e
`painel-card-textura-hexagon-card-{escuro,claro}.png`. Refiz o controle das duas specs no `HEAD`.

**O achado 1 do veredito anterior estava errado.** O meu controle não reconstruiu o `dist/`: sem `.git`, a cópia faz o `build:js` falhar
na leitura do commit, e a spec leu o `dist/` rastreado, que é antigo. Refiz o controle com o build completo, com `GIT_DIR` só na linha do
build. `cartao-cede-a-classe` e `seletor-da-barra-legivel` dão **8 failed, 12 passed** no `HEAD`, os mesmos casos do worktree. A
divergência do executor procede. As falhas são anteriores à plan e foram para o backlog (#92).

**T5 (a) entregue:**
- As oito destacadas aparecem nos dois modos, e nenhuma virou chuvisco.
- "Pontos", "Favo de mel" e "Fibra de carbono" se destacam no claro. "Papel kraft" e "Ruído analógico" se destacam no escuro.
- No card real da tela "Painel", os hexágonos aparecem no escuro e ficam fracos no claro.
- `hexagon`, `blueprint-pro` e `grain` saíram das destacadas do card, pela regra da T3 (abaixo de 2% sai), e seguem em "Ver todas". O
  grupo do fundo manteve a lista dele.
- A opacidade das destacadas ficou no menor valor medido que passa, e as não destacadas voltaram ao valor de antes.

**Verificação:**
- `plan-141` inteiro verde nos dois modos.
- `cromo-css-real:check` completo: só falhas pré-existentes (#92, `plan-135`, `fontes-no-painel` intermitente).
- `token-que-desenha`, `plan-141` e `textura-muda-pixel` verdes depois da reversão do `blueprint-pro` (59 passed).

**Achado 1 — dois gates do Anel 1 vermelhos, e o commit cairia.** Os dois vêm das variáveis novas da moldura em `_atmosphere.css`:
- `variable-contract:check`: `--sarak-card-texture-frame` é lida 16 vezes e nada a escreve. A reserva de `--sarak-tex-shape` nas linhas 104-105 (o degradê preto) difere do padrão que o contrato registra para ela.
- `audit:baseline`: `auditor_ghostvars` sobe de 0 para 16, pela mesma `--sarak-card-texture-frame`.

**Correção:** as duas variáveis passam no contrato sem mudar o desenho. Cuidado: a regra-base da moldura tem especificidade maior que a regra de cada textura. Uma `--sarak-tex-shape` declarada na regra-base venceria o desenho de cada textura.
**Verificação:** `variable-contract:check` e `audit:baseline --with-tsc` verdes, `npm run build` e `plan-141-presets-do-painel` verde nos dois modos.

**Status da plan: 🔵 Em correção** (lote 2, só os gates; depois, ok do dono nas capturas e commit dos lotes 1 e 2).

## Resumo da execução (correção T5, achado 1) — 2026-11-20

**Resultado:** Concluído

**Estado do worktree ao iniciar:** o das correções anteriores (`src/`, `browser-tests/`, `docs/`, `specs/`) e `dist/`.

**O que foi feito**
- `src/styles/_atmosphere.css`, regra-base da moldura do card: declarados `--sarak-card-texture-frame: 20px;` e `--sarak-card-texture-full: linear-gradient(#000, #000);`; as duas ocorrências de `var(--sarak-tex-shape, linear-gradient(#000, #000))` (`-webkit-mask-image` e `mask-image`) viraram `var(--sarak-tex-shape, var(--sarak-card-texture-full))`. Nada mais mudou.

**Verificações executadas**
- `npm run variable-contract:check` → OK (4422 leituras com dono, 3266 reservas conferidas).
- `npm run audit:baseline -- --with-tsc` → igual ao baseline, nenhuma regressão.
- `npm run build` → verde.
- `plan-141-presets-do-painel -g Forma` → 4 passed.
- Sem commit e sem captura nova.

**Achados fora do escopo / pendências:** nenhum novo.

## Veredito — 2026-11-20 — lote 2, correção dos gates — 🟢 Lote 2 aprovado

**Como medi:**
- Conferi o diff de `_atmosphere.css`: as duas variáveis estão declaradas na regra-base, e a reserva agora é `var()`.
- Rodei de novo o Anel 1 (scratchpad `anel.sh`): `variable-contract:check` OK (4422 leituras com dono), `audit:baseline` igual ao baseline.
  O único vermelho foi `plan-index:check`, que cobrava o índice regenerado depois do resumo.
- Simulei o Anel 0 sobre as linhas adicionadas: 0 ocorrências.
- Não repeti a bateria de navegador: o executor rodou `build` e `plan-141` Forma, e a tela não muda.

**O lote 2 fecha** com o ok do dono nas capturas da T5. Os lotes 1 e 2 saem num commit só.

**Status da plan: 🟡 Em execução** (lote 3: Componentes e gráficos por estilo).
