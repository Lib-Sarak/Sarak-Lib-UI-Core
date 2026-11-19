---
tipo: "plan"
titulo: "Montar as amostras do painel com o componente real, medindo o custo antes"
objetivo: "Fazer a miniatura de tema mostrar a tela real do sistema com o tema aplicado e cada amostra de card, textura, gráfico, tabela, modal, aviso, estado vazio e progresso ser o componente real como a aplicação o desenha, com o custo de abrir cada decisão medido e dentro do teto aprovado pelo dono"
dominio: "Painel de customização / Amostras e prévia"
status: "🔴 A executar"
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
- `src/core/Design/presets/components/registry.ts` — o grupo `charts` (featured, `owns`) acompanha a mudança.
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

3.1. `CHART_PRESETS` deixam de gravar `chartType` e ficam só com estilo. Os nomes dizem o estilo ("Suave", "Reta", "Forte", "Limpa",
"Com grade"…), nos seis idiomas. O `chartType` fica no ajuste fino, com o rótulo "Tipo padrão (quando o componente não define)".
3.2. A amostra de gráfico é o `SarakChartEngine` com o estilo do preset, em linha e em barra lado a lado.
3.3. A tela "Gráficos" da prévia (`ChartsMock.tsx`) mostra os 8 tipos do `chartType` com o `SarakChartEngine`, todos com o estilo do
rascunho. Ela só carrega o motor quando a tela é aberta.
3.4. Tabela, modal, aviso, estado vazio e progresso com o componente real, conforme a decisão do lote 1.
3.5. `docs/migracoes.md`: escolher um estilo de gráfico no painel não muda mais o tipo padrão. Quem dependia disso grava `chartType`
pelo ajuste fino ou passa `type` no componente.
3.6. Prévia em `C:\tmp\sarak-previa-166\`, com antes e depois de Componentes e a tela "Gráficos".

Em cada lote: `npm run build`, o spec de custo, `plan-141-presets-do-painel`, `plan-160-previa-mostra-a-opcao`,
`plan-161-catalogo-proporcional`, `troca-de-tema` e `npm run verify -- --tier=quick`.

# 6. Critérios de aceite

- [ ] Lote 1: tabela de custo por decisão (hoje × protótipo, dois modos, mediana de 3) e prévia com as capturas; decisão do dono na §10.
- [ ] Miniatura de tema = tela "Painel" com o tema aplicado, dentro do teto aprovado para a decisão Tema.
- [ ] Amostras de card com a anatomia real; duas opções destacadas de um grupo diferem em ao menos 5% dos pixels, nos dois modos.
- [ ] Textura do card no card real; textura do fundo no fundo com um card convencional por cima.
- [ ] Nenhum preset de gráfico grava `chartType`; um teste de unidade reprova se algum gravar.
- [ ] Tela "Gráficos" da prévia com os 8 tipos pelo `SarakChartEngine`.
- [ ] Tabela, modal, aviso, estado vazio e progresso reais onde o dono aprovou.
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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Nota do revisor — 2026-11-18 — decisões do dono e uma em aberto

Decididas na conversa de 2026-11-18: miniatura com a tela real reduzida (1a); gráficos só com estilo, o tipo é do importador, e a
prévia com todos os tipos (4a); amostras montadas com o componente real, com o que pesar avaliado na medição (9); textura do card no
card e textura do fundo no fundo com um card convencional (11 e 12).

**D1, em aberto até o lote 2:** as amostras de card ficam sobre o rascunho (o tema atual, o que a aplicação vai mostrar; desfaz a base
neutra do lote 3 da `plan-161`) ou sobre a base neutra? Recomendação do revisor: sobre o rascunho.
