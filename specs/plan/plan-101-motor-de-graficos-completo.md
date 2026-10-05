---
tipo: "plan"
titulo: "Dar ao motor de gráficos o que um sistema de dados precisa: tema de verdade, várias séries e novos formatos"
objetivo: "Fazer o motor de graficos obedecer ao tema do painel, desenhar varias series (empilhado, horizontal, combinado, dois eixos, legenda, clique) e oferecer waterfall, sankey e calendario de calor, sem trocar de biblioteca"
dominio: "Sarak-Lib-UI-Core / Engines / Gráficos"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "graficos", "echarts", "tema", "engine"]
relacionados: ["[[03-superficie-publica]]", "[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]", "[[04-contrato-de-tokens-e-paridade]]"]
depende_de: "plan-96-templates-sem-dominio-embutido"
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md + specs/09-temas-e-presets.md"
---

# 1. Objetivo

O `SarakChartEngine` deixa de ser um desenho de uma série só que ignora o tema: ele **obedece aos sete tokens de
gráfico que o painel oferece**, desenha **várias séries** (empilhado, barra horizontal, barra + linha, dois eixos,
legenda, clique no ponto) e ganha três formatos que faltam — **waterfall**, **sankey** e **calendário de calor** —,
tudo sobre o **Apache ECharts que já está no projeto**. Nenhuma biblioteca nova.

Três lotes, **um por conversa de execução**, veredito entre eles.

# 2. Contexto

**Pedido do dono (2026-10-05):** a lib deve ter gráficos avançados de vários tipos. A análise mostrou que o gargalo
**não é a biblioteca** (o ECharts 6 faz tudo isto) e sim o **invólucro** da lib. Biblioteca descartada ou deixada:
Grafana (o servidor é AGPL-3.0 e o `@grafana/ui` é o design system dele, com tema próprio — um segundo design
system dentro do nosso); `uPlot` (o motor de série temporal do Grafana, MIT) só se um consumidor tiver séries com
centenas de milhares de pontos — **não é o caso hoje**. Referência de demanda: o módulo de tarefas do SellersGO
refez **à mão, com `recharts`**, três gráficos (burndown, carga por membro, tempo por coluna) que o motor da lib
não consegue desenhar hoje.

**O que foi medido (2026-10-05):**

| Fato | Onde |
|---|---|
| **Uma série só por gráfico:** todo construtor lê um único `dataKey` (`data.map(item => item[config?.dataKey || 'value'])`). Não há série múltipla, empilhado, barra horizontal, combinação, dois eixos, legenda, evento de clique, zoom ou exportação | `src/components/engines/charts/SubEngines/builders/basicCharts.ts:4-27` · `SarakChartEngine.tsx:11-26` |
| O painel oferece **sete tokens de gráfico** — `chartColorPalette`, `chartGridOpacity`, `chartTooltipBg`, `chartType`, `chartShowGrid`, `chartThickness`, `chartSmoothing` — e **os 14 temas os preenchem** (8 chaves cada); **o motor não lê nenhum**: o tema dele vem só de `primaryColor`, `secondaryColor`, `mode` e `bodyFont` | `src/core/Design/schema/data.ts:7-83` · `src/components/engines/charts/SubEngines/useEChartsTheme.ts:9-20` |
| A paleta tem **três cores escritas à mão** (`#10b981`, `#f59e0b`, `#ef4444`), mais `rgba(...)` de eixo, grade e tooltip e `fontSize: 11` no motor; o `backdropFilter` do tooltip não é opção do ECharts | `useEChartsTheme.ts:24-35` · `SarakChartEngine.tsx:40-69` |
| **Quatro props que o próprio JSDoc diz não terem efeito:** `title`, `showGradients`, `showAnimation`, `thickness` | `SarakChartEngine.tsx:16-25` |
| O token `chartType` oferece 8 formatos; o motor tem 14; `type` é **obrigatório** e **não lê o token** | `schema/data.ts:39-55` · `SarakChartEngine.tsx:13` |
| O motor `recharts` (alternativa) só desenha `bar` e linha e ignora todo o resto | `SarakChartEngine.tsx:109-130` |
| Cobertura: **um** teste de fumaça do motor, um snapshot de caracterização dos construtores e um teste do tema | `__tests__/SarakChartEngine.test.tsx` · `SubEngines/builders/__tests__/` |
| Os `peerDependencies` aceitam `echarts >=5.5.0` e `recharts >=2.12.0`; o instalado é `echarts 5.6.0`; as últimas são **`echarts 6.1.0` e `recharts 3.10.1`** — faixas **nunca testadas** com elas | `package.json` · `npm view` de 2026-10-05 |
| A fronteira `React.lazy` + `Suspense` interno **tem de ser preservada** (`echarts` + `zrender` pesam ≈ 2,9 MB) | `src/components/engines/charts/index.tsx` · `specs/arquitetura/03-superficie-publica.md` §7.1 |
| As plans `96` e `97`: a 96 só torna candlestick e boxplot honestos e tira o domínio do `SarakChart`; **a 97 exclui o motor de gráficos** e o gráfico multi-série. Esta é a **única** plan que amplia o motor | `plan-96` §3.1 · `plan-97` §3.2 |

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

**Lote 1 — tema e honestidade**
- `src/components/engines/charts/SubEngines/useEChartsTheme.ts` — lê o tema inteiro (§5, passo 1).
- `src/components/engines/charts/SarakChartEngine.tsx` — extração de eixo/tooltip (teto R9), `type` opcional,
  props que passam a ter efeito, estado vazio, acessibilidade.
- `src/components/engines/charts/SubEngines/axisOptions.ts` — **novo**: eixos, grade e tooltip.
- `src/components/engines/charts/SubEngines/builders/basicCharts.ts` · `advancedCharts.ts` ·
  `statisticalCharts.ts` · `types.ts` — sem cor escrita à mão; espessura e suavização.
- `src/core/i18n/catalogEntries.part3.ts` (ou a parte com folga) — textos novos do motor.
- `package.json` — **só** as faixas de `echarts` e `recharts` em `peerDependencies`, **e só se** a verificação do
  passo 6 provar incompatibilidade.
- Testes ao lado, inclusive o snapshot de caracterização (atualizado **de propósito**, com o diff lido).

**Lote 2 — várias séries**
- `src/components/engines/charts/SarakChartEngine.tsx` · `SubEngines/seriesModel.ts` (**novo**) ·
  `SubEngines/builders/basicCharts.ts` · `SubEngines/builders/types.ts` — o contrato de séries.
- Testes ao lado.

**Lote 3 — novos formatos**
- `src/components/engines/charts/SubEngines/builders/waterfallCharts.ts` · `flowCharts.ts` ·
  `calendarCharts.ts` — **novos**; `SubEngines/optionBuilders.ts` os reexporta.
- `src/components/engines/charts/SarakChartEngine.tsx` — a união de `type`.
- Testes ao lado.

**Nos três lotes:** `docs/component-catalog.*`, `docs/migracoes.md` (a nota), `dist/`, `sarak-ui/`, `sarak-dev/`,
`src/core/Provider/generated/` regenerados pelos comandos, nunca à mão.

## 3.2 Fora (o que NÃO pode ser tocado)

- **Biblioteca nova.** Nenhuma entra (nem `uPlot`, nem `nivo`, nem `visx`).
- O **motor `recharts`**: não ganha recurso nenhum; só **avisa** quando recebe prop que ele não honra (passo 7).
  Remover o motor é decisão do dono, e vai ao backlog.
- `src/components/atomic/Templates/SarakChart.tsx` e `useChartData` (plan-96) · `SarakStats`/`SarakSparkline` ·
  `src/core/Design/schema/data.ts` — **nenhum token novo**: os sete existentes passam a valer.
- O `chartType` do schema: as 8 opções ficam como estão (waterfall/sankey/calendário dependem do formato do dado
  e não são "tipo padrão" de tema).
- Mapas geográficos, gráficos 3D e exportação para imagem/PDF.
- A fronteira lazy (`charts/index.tsx`) — só se preserva.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | §7.1 (a fronteira lazy do motor), prefixo e barril |
| Spec fixa | `specs/arquitetura/04-contrato-de-tokens-e-paridade.md` | token oferecido tem de ter consumidor |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | os tokens de gráfico dos temas |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | §2.4 (ARIA) e §3.6 (tradução) |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R9 (arquivo ≤ 250 linhas), R36, zero hardcode |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` | §3 e §5 — a mudança visível pede nota de migração |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | cada token, cada série, cada formato |
| **Skill** | `ui-refatorar-componente` | mexer em componente público sem quebrar o catálogo |
| Código | `src/components/engines/charts/SarakChartEngine.tsx` · `src/components/engines/charts/index.tsx` · `src/components/engines/charts/SubEngines/useEChartsTheme.ts` · `src/components/engines/charts/SubEngines/optionBuilders.ts` | ler antes de editar |
| Código | `src/components/engines/charts/SubEngines/builders/basicCharts.ts` · `src/components/engines/charts/SubEngines/builders/advancedCharts.ts` · `src/components/engines/charts/SubEngines/builders/statisticalCharts.ts` · `src/components/engines/charts/SubEngines/builders/types.ts` | ler antes de editar |
| Código | `src/core/Design/schema/data.ts` · `src/components/atomic/Feedback/SarakEmptyState.tsx` · `src/core/i18n/useLibraryText.ts` | os sete tokens; o estado vazio; o texto traduzido |

# 5. Instruções de execução

**Lote 1 — tema e honestidade**

1. **`useEChartsTheme` lê o tema todo.** Do `design` resolvido: `chartColorPalette` (cor da **1.ª série**),
   `chartGridOpacity`, `chartShowGrid`, `chartTooltipBg`, `chartThickness`, `chartSmoothing`, além de cores de
   texto/borda do tema. **Paleta categórica**, nesta ordem: `chartColorPalette` → `secondaryColor` →
   `accentColor` → `statusSuccessColor` → `statusWarningColor` → `statusErrorColor` → `statusInfoColor` →
   `tertiaryColor` (todos já existem no design; **nenhum token novo**). Canvas não lê `var()`: a cor chega
   **resolvida** pelo `design`. O único literal de cor permitido é o **fallback** de quando o `design` vem vazio,
   num lugar só.
2. **Sem literal no motor:** eixo, grade, tooltip, fonte e margem saem do tema (cor, `bodyFont`, escala de
   tipografia do projeto). Some o `backdropFilter` (não é opção do ECharts).
3. **`type` passa a ser opcional**: sem ele, vale `chartType` do design (um dos 8 do schema). Prop explícita vence.
4. **As quatro props ganham efeito**, com o padrão preservando o desenho de hoje: `title` (título do gráfico),
   `showAnimation` (liga/desliga a animação; padrão ligada), `showGradients` (barra e área com degradê; padrão
   ligado), `thickness` (espessura da linha; **o padrão vira `chartThickness` do tema**).
5. **Estado vazio e acessibilidade.** `data` vazio (ou sem o campo da série) → `SarakEmptyState` com texto do
   catálogo de i18n, **sem** erro no console. O gráfico ganha `role="img"` e `aria-label` (nova prop `ariaLabel`,
   com padrão traduzido) e liga o módulo `aria` do ECharts.
6. **Faixas de peer.** Em cópia **fora do repositório**, rode os testes do motor com `echarts@6.1.0` e depois com
   `recharts@3.10.1`. Passou: nada muda no `package.json`. Falhou: **estreite a faixa** (ex. `>=5.5.0 <6`) e
   registre o motivo; **não** conserte o motor para a versão nova nesta plan.
7. **Aviso do motor `recharts`:** prop que só o ECharts honra (`series`, `stacked`, `orientation`, `legend`…)
   recebida com `engine: 'recharts'` → **um** `console.warn` em desenvolvimento, nomeando a prop.
8. Mantenha `SarakChartEngine.tsx` ≤ 250 linhas (extração para `axisOptions.ts`). Testes (skill `test-unitario`):
   ver §6. Entregue o lote 1 e **pare para o veredito**.

**Lote 2 — várias séries**

9. **Contrato novo, compatível com o antigo** (sem `series`, o comportamento de hoje continua): `series?:
   Array<{ key: string; label?: string; type?: 'bar' | 'line' | 'area'; stack?: string; axis?: 'left' | 'right';
   dashed?: boolean }>`, `stacked?: boolean`, `orientation?: 'vertical' | 'horizontal'`, `legend?: boolean |
   'top' | 'bottom'`, `onPointClick?: (e: { seriesKey: string; index: number; datum: SarakChartDataItem }) => void`.
   Cada série pega a próxima cor da paleta do passo 1, salvo `color` explícita (nome de token de cor do design,
   nunca hexadecimal).
10. **Combinação:** `series` com tipos misturados (barra + linha) funciona; `axis: 'right'` cria o 2.º eixo de
    valor. **Linha de referência:** série `dashed: true` (é como se desenha a "linha ideal" de um burndown).
11. `legend` (padrão `false` para 1 série, `'top'` para 2 ou mais) e `onPointClick` ligado ao evento de clique do
    ECharts.
12. **Os formatos que não são cartesianos** (pizza, radar, funil…) **ignoram** `series`/`stacked`/`orientation`
    — e dizem isso no JSDoc de cada prop.
13. Testes e entrega do lote 2: **pare para o veredito**.

**Lote 3 — novos formatos**

14. `type: 'waterfall'` — dado `{ name, value, total? }[]`: cada item é um delta sobre o acumulado; `total: true`
    fecha o acumulado. Positivo e negativo com cores de `statusSuccessColor`/`statusErrorColor`; total com a cor
    da 1.ª série. (Técnica: barras empilhadas com base transparente.)
15. `type: 'sankey'` — dado `{ source, target, value }[]`; os nós saem da própria lista de ligações.
16. `type: 'calendar'` (calendário de calor) — dado `{ date, value }[]`; ano corrente ou o intervalo dos dados;
    intensidade pela cor da 1.ª série.
17. Cada formato novo: dado inválido (campo faltando, valor não numérico) → estado vazio do passo 5, nunca
    exceção. Atualize `docs/migracoes.md` com a nota (visual dos gráficos **muda** nos consumidores por causa do
    tema; props antigas intactas). `npm run guide` · `npm run catalog` · `npm run dev-kit` · `npx tsc --noEmit` ·
    `npm run build` · `npx vitest run` · `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → verdes.

# 6. Critérios de aceite

**Lote 1**
- [ ] Para **cada um dos sete tokens**, mudar o valor no `design` muda a opção entregue ao ECharts (teste que
      captura a `option` com o `echarts-for-react` simulado; **falha** se o motor deixar de ler o token).
- [ ] Nenhuma cor literal no motor e nos construtores fora do fallback único (`git grep -nE "#[0-9a-fA-F]{3,8}|rgba?\("
      -- src/components/engines/charts` só no arquivo do fallback).
- [ ] `<SarakChartEngine data={…} />` sem `type` usa `design.chartType` (teste); com `type`, vale a prop.
- [ ] `title`, `showAnimation`, `showGradients` e `thickness` mudam a `option` (teste por prop); o desenho padrão
      não muda além do que o tema passa a ditar.
- [ ] `data={[]}` e dado sem o campo → `SarakEmptyState`, sem erro no console (teste); o gráfico tem `role="img"`
      e `aria-label`.
- [ ] O resumo traz o resultado dos testes com `echarts@6.1.0` e `recharts@3.10.1`; faixa estreitada **só** se
      falhou.
- [ ] `engine: 'recharts'` com `stacked` → um `console.warn` nomeando a prop (teste).
- [ ] `SarakChartEngine.tsx` ≤ 250 linhas; a fronteira lazy intacta (o teste de lazy existente passa).

**Lote 2**
- [ ] Duas séries de barra desenham **duas** séries com cores distintas da paleta (teste); `stacked` as empilha;
      `orientation: 'horizontal'` troca os eixos.
- [ ] Barra + linha, `axis: 'right'` e `dashed: true` chegam à `option` como esperado (teste por caso).
- [ ] `legend` aparece por padrão com 2 ou mais séries e some com 1 (teste); `onPointClick` recebe
      `seriesKey`, `index` e o `datum` (teste).
- [ ] Formato não cartesiano ignora `series` sem erro (teste).
- [ ] **Reprodução do burndown:** um teste monta duas linhas (uma `dashed`) sobre o mesmo eixo de datas.

**Lote 3**
- [ ] Waterfall: o acumulado de `[+10, −4, total]` fecha em 6 (teste com os números).
- [ ] Sankey: os nós saem das ligações, sem duplicar (teste); calendário: um dia sem dado fica vazio, não zero.
- [ ] Dado inválido nos três → estado vazio (teste, um por formato).
- [ ] `docs/migracoes.md` tem a nota; `npx tsc --noEmit` → 0; `check-audit-baseline --with-tsc` → igual ao
      baseline; `npm run build` e `npx vitest run` verdes.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — o motor é **este módulo**, e cada invariante é comportamento observável dele (teste). A regra
de que token oferecido tem consumidor já existe para o cromo; estendê-la aos tokens de gráfico seria uma segunda
regra de gate nesta plan, e o teste por token do lote 1 já a cobre.

- `git status` + `git diff --stat` → só o §3.1 de cada lote; **nenhum** token novo no schema; nenhuma dependência
  nova no `package.json` (e, nele, só as faixas de peer, se o passo 6 reprovou).
- **Mutação do lote 1:** desligar a leitura de `chartTooltipBg` em `useEChartsTheme` → o teste do token falha;
  reintroduzir um `rgba(...)` no motor → o `git grep` do critério o acusa. Mostrar o resultado.
- **No navegador, por mim** (servidor de desenvolvimento, uma página mínima): desenhar os **seis cenários** — duas
  séries de barra, empilhado horizontal, barra + linha com 2.º eixo, burndown (linha + linha tracejada), waterfall e
  sankey — com **dois temas diferentes**, e **olhar o desenho** (jsdom não desenha canvas).
- Ler o diff do snapshot de caracterização: toda mudança é efeito do tema, nenhuma é regressão de forma.
- `npx tsc --noEmit` · `check-audit-baseline --with-tsc` · `npm run build` · `npx vitest run` (um por vez, sem
  outro `vitest` ativo).
- Leitura do diff: nenhum comentário cita plan (R36); nenhum arquivo acima de 250 linhas.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md + specs/09-temas-e-presets.md`

Texto pronto para transporte:

- **`arquitetura/03-superficie-publica`** — nova seção **"O motor de gráficos"**: o motor é ECharts (Apache-2.0),
  carregado sob demanda (a fronteira lazy da §7.1 não muda); contrato de props (`type` opcional → `chartType` do
  tema; `series`, `stacked`, `orientation`, `legend`, `onPointClick`, `ariaLabel`); formatos (os 14 anteriores
  mais `waterfall`, `sankey`, `calendar`); estado vazio e ARIA; o motor `recharts` é **alternativa limitada** e
  avisa quando recebe prop que não honra. **Decisão registrada:** biblioteca nova rejeitada (Grafana: servidor
  AGPL-3.0 e design system próprio; `uPlot`: só se houver série de centenas de milhares de pontos).
- **`specs/09-temas-e-presets`** — os sete tokens de gráfico (`chartColorPalette`, `chartGridOpacity`,
  `chartTooltipBg`, `chartType`, `chartShowGrid`, `chartThickness`, `chartSmoothing`) **têm consumidor** no motor;
  a paleta de séries é a ordem do passo 1 (cores do próprio design, nenhum token novo).

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
