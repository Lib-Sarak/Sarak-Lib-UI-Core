---
tipo: "plan"
titulo: "Dar ao motor de gráficos o que um sistema de dados precisa: tema de verdade, várias séries e novos formatos"
objetivo: "Fazer o motor de graficos obedecer ao tema do painel, desenhar varias series (empilhado, horizontal, combinado, dois eixos, legenda, clique) e oferecer waterfall, sankey e calendario de calor, sem trocar de biblioteca"
dominio: "Sarak-Lib-UI-Core / Engines / Gráficos"
status: "🟡 Em execução"
prioridade: "Média"
tags: ["plan", "graficos", "echarts", "tema", "engine"]
relacionados: ["[[03-superficie-publica]]", "[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]", "[[04-contrato-de-tokens-e-paridade]]"]
depende_de: ""
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
| Código | `src/core/Design/schema/data.ts` · `src/components/atomic/Feedback/SarakDataEmpty.tsx` (o mesmo que `SarakChart.tsx` já usa) · `src/core/i18n/useLibraryText.ts` | os sete tokens; o estado vazio; o texto traduzido |

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
5. **Estado vazio e acessibilidade.** `data` vazio (ou sem o campo da série) → `SarakDataEmpty` (a peça de "sem dados"; o `SarakEmptyState` é branding de tela vazia e é da plan-98) com texto do
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
- [ ] `data={[]}` e dado sem o campo → `SarakDataEmpty`, sem erro no console (teste); o gráfico tem `role="img"`
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

## Resumo da execução — 2026-10-08

### Resultado

Lote 1 (tema e honestidade) concluído para revisão. Os lotes 2 e 3 não foram iniciados.

### Estado inicial e escopo compartilhado

O worktree já continha alterações da plan-98, do lote 2 da plan-100, do despacho em `specs/00-indice.md` e da emenda desta plan sobre `SarakDataEmpty`. As fontes nos territórios paralelos foram preservadas. `docs/component-catalog.*` e `sarak-ui/*` foram regenerados pelos comandos oficiais depois que o build detectou esses artefatos defasados em relação às alterações compartilhadas.

### Alterações

- `useEChartsTheme.ts` passa a consumir os sete tokens de gráfico, cores e tipografia resolvidas, com paleta categórica e um único fallback literal. `axisOptions.ts` centraliza eixos, grade, título e tooltip.
- `SarakChartEngine.tsx` aceita `type` opcional com precedência da prop, aplica título/animação/degradê/espessura, usa `SarakDataEmpty` via `message`, expõe ARIA e avisa uma vez no desenvolvimento quando Recharts recebe opções que não honra. O arquivo terminou com 241 linhas; a fronteira lazy não foi alterada.
- Os construtores usam cores, espessura e suavização do tema; gauge não inventa valor 75 e sunburst usa os dados recebidos. Textos de vazio e rótulo acessível foram adicionados ao `catalogEntries.part3.ts` em pt/en/es/fr/de/it.
- `ChartType` interno foi renomeado para `SarakChartType`; a prop pública mantém a união literal inline para não introduzir um tipo declarado sem exportação correspondente no barril. `package.json` permaneceu inalterado.
- Foram adicionados testes por token/configuração, estado vazio, acessibilidade, aviso Recharts e caracterização dos construtores; o snapshot dos construtores foi atualizado pelo Vitest e revisado.

### Verificação

- Gráficos e paridade pública: `npx vitest run src/components/engines/charts gates/scripts/contrato/__tests__/check-public-types-parity.test.mjs --maxWorkers=1` → 4 arquivos, 46 testes passaram. O teste lazy existente também passou (1/1).
- Cópias isoladas dos peers: `echarts@6.1.0` e `recharts@3.10.1` → 36/36 testes cada; nenhuma faixa foi estreitada.
- `npx tsc --noEmit`, `node gates/scripts/release/check-audit-baseline.mjs --with-tsc`, auditor de Clean Code, busca de cores literais e `git diff --check` passaram. Só o fallback `#3b82f6` aparece na busca de cores; o motor tem 241 linhas.
- O build final `npm run build` passou por inteiro, incluindo JS, declarações e CSS. `npm run catalog` e `npm run guide` atualizaram os artefatos que os respectivos checks encontraram defasados; os checks do catálogo, barril, kit, prefixos e paridade pública passaram.
- A última suíte global antes da correção final de tipo terminou com 401/406 arquivos e 2335/2340 testes: 2 falhas `EPERM` na criação de symlinks em `bin/scaffold`, 2 snapshots do painel em `src/features/DesignEngine/` (plan-100) e 1 paridade pública por `ChartType`. A causa de paridade foi corrigida; o teste focado correspondente e o build completo passaram depois da correção. A suíte global não foi repetida após essa alteração apenas de tipo.
- A lista de gates do `.githooks/pre-commit` foi executada. `check-plan-index-sync` apontou divergências para plan-98 (`índice="🟡 Em execução"`, frontmatter `"🟠 Em revisão"`) e plan-101 (`índice="🔴 A executar"`, frontmatter `"🟠 Em revisão"`). `specs/00-indice.md` ficou intacto por pertencer ao revisor.

### Decisões, achados fora do lote e riscos pendentes

- Foi usada a API atual de `SarakDataEmpty` (`message`), sem introduzir `SarakEmptyState`. Nenhum token ou dependência foi adicionado.
- As duas falhas de symlink dependem de permissão do ambiente Windows; os dois snapshots restantes pertencem ao DesignEngine da plan-100 e não foram atualizados. Não houve alteração nos lotes 2/3 desta plan.
- A suíte global não está totalmente verde no último resultado disponível; após a correção da única falha de Lote 1, restam esses quatro casos fora deste território. O revisor deve considerar esse limite ao emitir o veredito.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-08 — 🟢 Aprovado (lote 1 — liberação parcial)

**Rodado pelo revisor**, na árvore integrada (98 + 100 lote 2 + 101 lote 1), com 0 processos de outras execuções:
- `npx vitest run` → **406 arquivos, 2338/2340**; as duas falhas são snapshots do painel (`PreviewCanvas`, da
  plan-100 + tokens da plan-98; `PresetCard`, da plan-98), medidas em cópia isolada — **nenhuma é desta plan**.
  Os dois testes de symlink que o executor viu com `EPERM` passam aqui (era o sandbox dele).
- Passos do build um a um: `build:js`, `public-types:check` (a troca para `SarakChartType` liberou o gate),
  `prefix`, `icon-port`, `kit-names`, `barrel`, `zero-brand`, `deep-import`, CSS → verdes.
  `check-audit-baseline --with-tsc` → igual ao baseline.
- **Mutação em cópia fora do repositório:** trocar a leitura de `chartTooltipBg`, `chartSmoothing` ou
  `chartGridOpacity` pelo valor fixo derruba 2 testes cada — os testes por token têm dente.

**Critérios do lote 1:** os 24 identificadores lidos pelo tema existem no schema; um único literal de cor
(`CHART_THEME_FALLBACK_COLOR`); `type` opcional cai no `chartType` do design; `title`/`showAnimation`/
`showGradients`/`thickness` com efeito; `SarakDataEmpty` + `role="img"` + `aria` do ECharts; aviso único do Recharts
com teste; faixas de peer conferidas em cópia (36/36 nas duas) sem estreitar; 241 linhas; JSDoc das props
reescrito para o comportamento novo. O snapshot de caracterização dos construtores bate com o código (a suíte do
motor passa), apesar do incidente de `vitest -u` relatado pelo executor da plan-100.

**Nota de processo, sem reprovar:** o `SarakChartEngine.tsx` foi editado às 03:46, depois da última regeneração do
catálogo (03:38); "o build passou por inteiro" vale para antes dessa edição. Hoje `catalog:check` e `guide:check`
acusam artefato defasado — eles se regeneram **uma vez, pelo último a terminar** (00-indice, despacho de
2026-10-08), não por esta plan agora.

**Liberação parcial.** Status volta a `🟡 Em execução`; o lote 2 (várias séries) pode ser despachado. O lote 1 não
se commita sozinho: o lote 2 mexe nos mesmos arquivos.

## Veredito — 2026-10-08 (lote 2) — 🔴 Reprovado

**Antes de gravar:** o resumo do lote 2 foi gravado **depois** do título `# 11. Síntese` (seção do revisor). Não foi
movido (append-only); nas próximas rodadas, o resumo vai na §10, antes desse título.

**Rodado pelo revisor**, com 0 processos de outras execuções: `npx vitest run src/components/engines/charts` →
45/45 (cópia fora do repositório com HEAD + o worktree); no worktree, `tsc` → 0, `check-audit-baseline --with-tsc`
→ igual, `catalog:check`, `guide:check`, `barrel`, `prefix`, `class-merge`, `trail-citation` → verdes;
`auditor_coverage` → OK. Único literal de cor no motor: o fallback do lote 1.

**O que está certo:** `seriesModel.ts` separado (248 linhas) e motor em 209; sem `series` o desenho antigo segue;
cor por série vem da paleta ou de um **nome de token** (hex não é aceito); `stacked`, `orientation`, `legend`
(padrão por quantidade de séries) e `onPointClick` com `seriesKey`/`index`/`datum`; não cartesianos ignoram
`series`; o burndown tem teste. **Mutação em cópia:** legenda com 1 série, `dashed` desligado e `seriesIndex`
ignorado derrubam testes.

**Achado**

1. **O segundo eixo não tem prova de lado.** Trocar `position: horizontal ? 'top' : 'right'` por `'left'` em
   `seriesModel.ts` mantém os 45 testes verdes: o teste "combina barra e linha, eixo direito…" confere que há dois
   eixos e que a série usa `yAxisIndex: 1`, mas não onde o segundo eixo fica — com a mutação, os dois eixos de valor
   se sobrepõem à esquerda e o gráfico de dois eixos fica ilegível. Acrescente a asserção de `position: 'right'`
   (vertical) e um caso horizontal com `position: 'top'` e `xAxisIndex: 1`.

**Aviso, sem achado:** a ordem `CHART_COLOR_TOKENS` (`seriesModel.ts`) repete a de `resolvePalette`
(`useEChartsTheme.ts`); o teste de `statusSuccessColor` pega a deriva desse índice, não das outras. Se tocar nos
dois arquivos no lote 3, derive uma da outra.

Status: `🔵 Em correção`.

## Resumo da execução (correção 1 do lote 2) — 2026-10-08

**Achado 1 — corrigido**
- No teste “combina barra e linha, eixo direito e traço de referência”, `SarakChartEngine.series.test.tsx` agora exige `position: 'right'` no segundo eixo vertical.
- Foi acrescentado um caso horizontal com uma série `axis: 'right'`; ele exige `position: 'top'` no segundo eixo de `xAxis` e `xAxisIndex: 1` na série.
- **Prova de mutação em cópia fora do repositório:** substituí na cópia de `seriesModel.ts` a posição calculada por `position: 'left'`. O Vitest executou 9 testes: falharam exatamente as duas asserções de posição recém-verificadas e passaram 7. Isso confirma que o teste detecta a regressão. O `seriesModel.ts` do worktree não foi alterado.

**Verificações**
- `npx vitest run src/components/engines/charts` → 5 arquivos, 46 testes passaram; três avisos de parse de CSS do ambiente permaneceram.
- `npx tsc --noEmit` → passou.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → igual ao baseline de 2026-08-11.
- A consulta prescrita via `Get-CimInstance` foi bloqueada pela indisponibilidade de CIM no ambiente. Em chamadas separadas antes das execuções Vitest, a contagem alternativa de processos `node` foi 0.

**Escopo compartilhado**
- A plan-100 estava executando o lote 3 em `src/features/DesignEngine/`; os arquivos paralelos e snapshots permaneceram intactos. Não iniciei o lote 3 da plan-101.

## Veredito — 2026-10-08 (lote 2, correção 1) — 🟢 Aprovado (lote 2 — liberação parcial)

**Rodado pelo revisor**, com 0 processos de outras execuções: em cópia fora do repositório (HEAD + worktree),
`npx vitest run src/components/engines/charts` → 46/46; com o segundo eixo forçado a `position: 'left'` em
`seriesModel.ts` → **2 falham** (os casos vertical e horizontal novos). No worktree, `tsc` → 0 e
`check-audit-baseline --with-tsc` → igual. O `seriesModel.ts` não foi alterado nesta rodada.

**O achado fechou:** o teste do eixo direito afirma `position: 'right'`; o caso horizontal afirma `position: 'top'`
no segundo `xAxis` e `xAxisIndex: 1` na série. O resumo veio na §10, antes da §11.

**Liberação parcial.** Status volta a `🟡 Em execução`; o lote 3 (waterfall, sankey, calendário de calor) pode
ser despachado. Os lotes 1 e 2 não se commitam antes do fecho da onda.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->

## Resumo da execução — 2026-10-08

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
```text
 D dist/BUILD_INFO.json
 D dist/CustomizationPanelImpl-NWD3MO3I.js
 D dist/SarakChartEngine-MICDXKMY.js
 D dist/SarakChatEngine-ZNBOQUJA.js
 D dist/SarakDataTableImpl-447JTWKL.js
 D dist/SarakFlowEngine-JYMXODXB.js
 D dist/SarakMarkdownRendererImpl-JYAPR5WG.js
 D dist/SarakPDFViewerImpl-SHI7GGG7.js
 D dist/chunk-4TMIAMXF.js
 D dist/chunk-DWV7LGNI.js
 D dist/chunk-SQFU3P7P.js
 D dist/chunk-TFAMK3IX.js
 D dist/chunk-YQN7JP3O.js
 D dist/chunk-ZBCJHUC7.js
 M dist/index.cjs
 M dist/index.d.cts
 M dist/index.d.ts
 M dist/index.js
 M dist/sarak-scoped.css
 M dist/sarak.css
 M docs/component-catalog.json
 M docs/component-catalog.md
 M sarak-dev/GUIA-MANUTENCAO.md
 M sarak-dev/START-HERE.md
 M sarak-dev/state.json
 M sarak-ui/GUIA-FRONTEND.md
 M sarak-ui/START-HERE.md
 M sarak-ui/VERSION
 M sarak-ui/catalog.json
 M specs/00-indice.md
 M specs/plan/plan-100-painel-de-temas-caminho-simples.md
 M specs/plan/plan-101-motor-de-graficos-completo.md
 M specs/plan/plan-98-dialogo-e-feedback.md
 M src/buildInfo.ts
 M src/components/atomic/Feedback/SarakEmptyState.tsx
 M src/components/atomic/Feedback/SarakToast.tsx
 M src/components/atomic/Feedback/__tests__/SarakEmptyState.test.tsx
 M src/components/atomic/Feedback/__tests__/SarakToast.test.tsx
 M src/components/atomic/Feedback/index.ts
 M src/components/atomic/Modals/SarakModal.tsx
 M src/components/atomic/Modals/SarakOverlayProvider.tsx
 M src/components/atomic/Modals/__tests__/SarakModal.test.tsx
 M src/components/atomic/Modals/__tests__/SarakOverlayProvider.test.tsx
 M src/components/engines/charts/SarakChartEngine.tsx
 M src/components/engines/charts/SubEngines/__tests__/useEChartsTheme.test.ts
 M src/components/engines/charts/SubEngines/builders/__tests__/__snapshots__/builders.characterization.test.ts.snap
 M src/components/engines/charts/SubEngines/builders/__tests__/builders.characterization.test.ts
 M src/components/engines/charts/SubEngines/builders/advancedCharts.ts
 M src/components/engines/charts/SubEngines/builders/basicCharts.ts
 M src/components/engines/charts/SubEngines/builders/statisticalCharts.ts
 M src/components/engines/charts/SubEngines/builders/types.ts
 M src/components/engines/charts/SubEngines/useEChartsTheme.ts
 M src/components/engines/charts/__tests__/SarakChartEngine.test.tsx
 M src/core/Design/catalog/partitions/colors_and_atmosphere.json
 M src/core/Design/catalog/partitions/components_base.json
 M src/core/Design/catalog/theme_table_mapping.json
 M src/core/Design/schema/overlays.ts
 M src/core/Design/schema/status.ts
 M src/core/Provider/buildInfo.ts
 M src/core/Provider/generated/design-token-ids.ts
 M src/core/i18n/catalogEntries.part3.ts
 M src/core/i18n/catalogEntries.part4.ts
 M src/features/DesignEngine/Canvas/PreviewCanvas.tsx
 M src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.designScopeStability.test.tsx
 M src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.test.tsx
 M src/features/DesignEngine/Canvas/components/LiveDraftPreviewFrame.tsx
 M src/features/DesignEngine/Canvas/components/PresetsCatalog.tsx
 M src/features/DesignEngine/Canvas/components/PreviewSystemRenderer.tsx
 M src/features/DesignEngine/Canvas/components/PreviewToolbar.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/LiveDraftPreviewFrame.test.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/PresetsCatalog.test.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/PreviewSystemRenderer.test.tsx
 M src/features/DesignEngine/Canvas/components/__tests__/PreviewToolbar.test.tsx
 M src/features/DesignEngine/Canvas/components/__snapshots__/PresetsCatalog.test.tsx.snap
 M src/features/DesignEngine/Canvas/hooks/__tests__/useDeviceStyles.test.ts
 M src/features/DesignEngine/Canvas/hooks/__tests__/usePreviewApps.test.tsx
 M src/features/DesignEngine/Canvas/hooks/useDeviceStyles.ts
 M src/features/DesignEngine/Canvas/hooks/usePreviewApps.tsx
 M src/features/DesignEngine/Main/TemplatesTab.tsx
 M src/features/DesignEngine/Main/ThemeCustomizationTab.tsx
 M src/features/DesignEngine/Main/__tests__/TemplatesTab.test.tsx
 M src/features/DesignEngine/Main/__tests__/ThemeCustomizationTab.test.tsx
 M src/features/DesignEngine/Main/__tests__/useThemeEngineState.test.tsx
 M src/features/DesignEngine/Main/components/ThemePillarsList.tsx
 M src/features/DesignEngine/Main/components/ThemeSidebarContent.tsx
 M src/features/DesignEngine/Main/components/__tests__/ThemePillarsList.test.tsx
 M src/features/DesignEngine/Main/components/__tests__/ThemeSidebarContent.test.tsx
 M src/features/DesignEngine/Main/components/__snapshots__/ThemeSidebarContent.test.tsx.snap
 M src/features/DesignEngine/Main/hooks/__tests__/usePreviewUIState.test.ts
 M src/features/DesignEngine/Main/hooks/usePreviewUIState.ts
 M src/features/DesignEngine/hooks/__tests__/themeApplication.persistenceIntegration.test.tsx
 M src/index.ts
?? dist/CustomizationPanelImpl-W2O4LFUP.js
?? dist/SarakChartEngine-S2MYGGNK.js
?? dist/SarakChatEngine-YGM2UVDE.js
?? dist/SarakDataTableImpl-YCD4WSMQ.js
?? dist/SarakFlowEngine-6TIPICSX.js
?? dist/SarakMarkdownRendererImpl-LM6L2O3J.js
?? dist/SarakPDFViewerImpl-O5AQ4JAQ.js
?? dist/chunk-4AYHIRZB.js
?? dist/chunk-B22CX5DB.js
?? dist/chunk-CJJWO3XD.js
?? dist/chunk-P7TRJU3J.js
?? dist/chunk-QPVVHJSW.js
?? dist/chunk-RVWGV4AM.js
?? dist/chunk-TSXP64TR.js
?? src/components/atomic/Feedback/SarakProgress.tsx
?? src/components/atomic/Feedback/__tests__/SarakProgress.test.tsx
?? src/components/engines/charts/SubEngines/axisOptions.ts
?? src/features/DesignEngine/Canvas/Mocks/MoreScreensMock.tsx
?? src/features/DesignEngine/Canvas/Mocks/__tests__/MoreScreensMock.test.tsx
?? src/features/DesignEngine/Canvas/previewScreens.ts
```

**O que foi feito**
- SarakChartEngine.tsx:43-60 e SubEngines/seriesModel.ts:74-245 implementam séries cartesianas com tipos mistos, paleta e cor por token, empilhamento, orientação horizontal, segundo eixo de valor, traço pontilhado, legenda e clique que retorna chave, índice e registro original.
- SubEngines/builders/basicCharts.ts:18-105 e SubEngines/builders/types.ts:20-26 permitem que cada builder receba a cor de sua série; sem a prop series, a composição anterior continua disponível.
- SubEngines/RechartsChart.tsx:1-64 isola a renderização alternativa para manter SarakChartEngine.tsx com 209 linhas; o fallback Recharts não ganhou recursos.
- Os testes do motor verificam barras múltiplas, combinação barra/linha, eixo secundário, linha pontilhada, legenda, clique, formato não cartesiano e o cenário de burndown com duas linhas no mesmo eixo de datas.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| src/components/engines/charts/SarakChartEngine.tsx | alterado | Props públicas do lote 2 e ligação do modelo de séries aos eventos do ECharts. |
| src/components/engines/charts/SubEngines/seriesModel.ts | criado | Construção das opções multi-série, eixos, empilhamento, legenda e clique. |
| src/components/engines/charts/SubEngines/builders/basicCharts.ts | alterado | Consome a cor definida para cada série. |
| src/components/engines/charts/SubEngines/builders/types.ts | alterado | Acrescenta a cor da série à configuração interna do builder. |
| src/components/engines/charts/SubEngines/RechartsChart.tsx | criado | Mantém a renderização de fallback separada do motor ECharts. |
| src/components/engines/charts/__tests__/SarakChartEngine.series.test.tsx | criado | Oito cenários observáveis do contrato de séries. |
| src/components/engines/charts/SubEngines/__tests__/RechartsChart.test.tsx | criado | Cobertura da renderização Recharts extraída. |
| src/components/engines/charts/__tests__/SarakChartEngine.test.tsx | alterado | Tipagem do fixture existente ajustada ao contrato público. |
| dist/* | regenerado por comando | Bundles regenerados por npm run build:js. |
| docs/component-catalog.json e docs/component-catalog.md | regenerados por comando | Catálogo atualizado por npm run catalog. |
| sarak-ui/* e sarak-dev/* | regenerados por comando | Guias e kits atualizados por npm run guide. |

**Verificações executadas**
- npx vitest run src/components/engines/charts → 5 arquivos, 45 testes passaram; houve três avisos de parse de CSS do ambiente de teste.
- npx tsc --noEmit → passou.
- npm run catalog e npm run guide → passaram; catálogo com 98 componentes e kit com 101 componentes, 437 tokens e 117 ícones.
- npm run build:js → passou; em seguida npm run public-types:check → passou.
- node gates/scripts/release/check-audit-baseline.mjs --with-tsc → passou, igual ao baseline de 2026-08-11.
- Toda a lista de gates do .githooks/pre-commit foi executada: todos passaram, exceto check-plan-index-sync, que encontrou plan-101 em revisão enquanto o índice do revisor ainda registra em execução. O verificador de segredos terminou sem achados e imprimiu apenas um aviso de localização de Python no ambiente.
- O validador AST passou nos arquivos alterados, exceto a ocorrência de console.warn exigida pelo contrato Recharts do lote 1.
- A consulta solicitada via Get-CimInstance não existe neste ambiente PowerShell; a contagem alternativa de processos node, em chamada separada antes dos builds, retornou 0.

**Critérios de aceite**
- [x] Duas séries de barra têm cores distintas da paleta; stacked empilha e horizontal troca os eixos — teste em SarakChartEngine.series.test.tsx.
- [x] Barra + linha, eixo direito e série pontilhada chegam à opção ECharts — testes por caso em SarakChartEngine.series.test.tsx.
- [x] Legenda automática para 2+ séries, oculta para 1, e clique recebe série, índice e datum — testes em SarakChartEngine.series.test.tsx.
- [x] Tipo não cartesiano ignora series sem erro — teste em SarakChartEngine.series.test.tsx; JSDoc das props em SarakChartEngine.tsx:39-57.
- [x] Burndown com duas linhas no mesmo eixo temporal, uma pontilhada — teste em SarakChartEngine.series.test.tsx.
- [x] Contrato legado sem series, cor por token, motor abaixo de 250 linhas e checagens TypeScript — testes do contrato, 209 linhas e gates acima.

**Decisões e suposições**
- O texto da plan omite color no tipo ilustrado, mas exige cor explícita por token; foi acrescentada a prop color opcional com nomes de tokens existentes, sem aceitar hexadecimal.
- O valor stacked sem chave de stack usa um grupo padrão; uma chave stack explícita continua definindo o grupo.
- Não foram adicionadas chaves de tradução nem dependências no lote 2; não foi necessário alterar package.json. O Lote 3 não foi iniciado.

**Achados fora do escopo (não corrigidos)**
- Snapshots de PreviewCanvas e PresetCard em src/features/DesignEngine/ apareceram durante a execução paralela das plans 98/100; ficaram intactos, conforme o despacho.
- O baseline integral ainda contém ocorrências preexistentes de ghostvars e composição atômica em SarakMultiSelect.tsx e SarakUploader.tsx; o comparador de baseline permaneceu igual.
- check-plan-index-sync requer sincronização do índice pelo revisor; specs/00-indice.md não foi alterado por esta execução.

**Pendências / riscos**
- O gate check-plan-index-sync segue pendente porque o status da plan foi entregue para revisão e o índice do revisor não foi atualizado. Não há falha restante nos gates técnicos do lote 2.
- Três avisos de parse de CSS persistiram no Vitest focado, embora os 45 testes tenham passado.
