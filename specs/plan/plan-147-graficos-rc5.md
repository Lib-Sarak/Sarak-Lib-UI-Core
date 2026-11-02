---
tipo: "plan"
titulo: "Dar aos gráficos escolha de padrão, cor com sentido, rótulo legível, escala real e eixo sem sobreposição"
objetivo: "Fazer o SarakChartEngine ter hachurado opcional, cor por item pelo token, rótulo interno legível, valor na barra, funil na escala real e marcas de eixo que não se sobrepõem, em todos os temas"
dominio: "Componentes / Gráficos"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc.5", "graficos"]
relacionados: ["[[anexos/rc5-contrato]]", "[[11-testes-e-cobertura]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

Os itens 2 a 7 do contrato da rc.5 entregues, com o padrão preservado, salvo os itens 2 e 6.

# 2. Contexto

Contrato em `specs/plan/anexos/rc5-contrato.md`, itens 2 a 7. O motor é `src/components/engines/charts/`, sobre ECharts.

- **Item 2:** `SubEngines/useEChartsTheme.ts:132` fixa `decal: { show: true }`: toda barra sai hachurada.
- **Item 3:** a cor vem da paleta em sequência, e "Recusada" pode sair verde. `series[].color` já aceita nome de token.
- **Item 4:** rótulos internos saem escuros sobre cor escura.
- **Item 5:** `config.thickness` não vale em barra, e as barras horizontais saem finas.
- **Item 6:** `SubEngines/builders/advancedCharts.ts:149-150` usa `min: 0` e `max: HEATMAP_MAXIMUM`, e a dica mostra o número normalizado.
- **Item 7:** marcas do eixo sobrepõem em largura estreita, e a última corta na borda.

# 3. Escopo

## 3.1 Dentro
- `src/components/engines/charts/` e testes.
- `browser-tests/` — os itens 4 e 7 se medem no navegador.
- `docs/migracoes.md`: itens 2 e 6.

## 3.2 Fora
- ECharts em si e tipos novos de gráfico. Cor escrita à mão: tudo sai de token.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/rc5-contrato.md` | nomes e padrões |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` §7.3 | cor esperada vem da página |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §3.6 | formatação pelo `locale` |
| Código | `src/components/engines/charts/SarakChartEngine.tsx` | props e `series[].color` |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree.
2. **`pattern`.** Padrão `false`. Ligado, o `decal` volta como hoje.
3. **`getPointColor`.** Mesmos nomes de `series[].color`. `undefined` cai na paleta. Vale para `bar` de uma série, `pie`, `funnel` e `treemap`.
4. **Rótulo.** Escolha pelo contraste com o fundo do item, entre tokens de texto, ≥ 4,5:1, com o `pickOnColor` da lib. Medido no navegador nos 19 temas, em `pie` e `funnel`.
5. **`showValues` e espessura.** Valor na ponta da barra, formatado por `valueFormat`. `'auto'` esconde quando não cabe. `config.thickness` vira `barMaxWidth`. Zero mostra a categoria, sem barra.
6. **Funil.** Escala pelo maior valor; `funnel` sobrescreve. A dica mostra o valor recebido.
7. **Eixo.** `axis.maxTicks` e `axis.compact`. Sem prop, a quantidade de marcas se ajusta à largura, e a margem reserva o rótulo final. `compact` usa `1,2 mi` no eixo, pelo `locale`, e o valor inteiro na dica.
8. `docs/migracoes.md`: itens 2 e 6, orientando a ligar `pattern` quando a cor for o único sinal.
9. Depois de `npm run build`, rode os specs de gráfico. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
10. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Sem `pattern`, nenhum `decal`; com ele, o de hoje — teste.
- [ ] `getPointColor` nos quatro tipos; `undefined` cai na paleta — teste.
- [ ] Rótulo interno ≥ 4,5:1 nos 19 temas × 2 modos — navegador.
- [ ] Valor na ponta formatado, espessura e zero — teste.
- [ ] Funil pelo maior valor e dica com o número real — teste.
- [ ] Sem sobreposição de marcas nem corte em largura estreita — navegador.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/components/engines` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- A CI mede a bateria no push.

# 8. Destino da síntese

**Destino:** `—`. A superfície nova fica no catálogo gerado e na `## 8.0.0` de `docs/migracoes.md`.

---

# 9. Resumo da execução

---

# 10. Veredito

## Resumo da execução — 2026-11-02

**Resultado:** Concluído com pendências (os dois critérios de navegador não foram medidos)

**Estado do worktree ao iniciar**
149 linhas de `git status --short`, todas de outras tarefas (plan-140, plan-143, `dist/`, `src/features/DesignEngine/`, `src/core/Design/palette/`, `browser-tests/`, `specs/`, `docs/migracoes.md`, `sarak-ui/docs/migracoes.md`). Nenhuma em `src/components/engines/`. A saída completa está em `C:\Users\Igor\AppData\Local\Temp\claude\c--Users-Igor-Desktop-Sarak-X---Trabalho-Code-Biblioteca-Sarak-Lib-UI-Core\76ea6b08-71ec-4b4b-b395-f8dfeebcdac7\scratchpad\snap.txt`.

**O que foi feito**
- `useEChartsTheme.ts:132` — `decal` do tema vira `show: false`; `chartRefinements.ts` (`applyPattern`) o religa com `pattern: true`.
- `chartRefinements.ts` (novo) — cor por item (`getPointColor`), rótulo interno por contraste (`pickOnColor`, com a opacidade 0,7 do funil composta sobre a superfície), valor na barra (`showValues`), marcas de eixo (`axis.maxTicks`, `axis.compact`, `hideOverlap`, reserva à direita).
- `builders/advancedCharts.ts` — funil: `max` pelo maior valor dos dados, `min`/`max` sobrescritos por `funnel`.
- `builders/basicCharts.ts` — `barMaxWidth` no lugar de `barWidth: '40%'` só quando o chamador passou `config.thickness`.
- `seriesModel.ts` — repassa `thickness`/`funnel` e chama `applyChartRefinements`.
- `useElementWidth.ts` (novo) + `SarakChartEngine.tsx` — mede a largura do quadro; props novas na interface e em `ECHARTS_ONLY_PROPS` (aviso do recharts).
- `builders/types.ts` — tipos `SarakChartAxis`, `SarakChartFunnel`, `SarakChartPointColor`; `src/index.ts` — os exporta.
- `docs/migracoes.md` — seção nova no fim da `## 8.0.0` (itens 2 e 6), por acréscimo.
- Testes: `chartRefinements.test.ts` e `useElementWidth.test.tsx` (novos); snapshot do funil regravado (`max: 1000` → `30`).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/engines/charts/SubEngines/chartRefinements.ts` | criado | padrão, cor por item, rótulo, valor na barra, eixo |
| `src/components/engines/charts/SubEngines/useElementWidth.ts` | criado | largura do quadro via `ResizeObserver` |
| `src/components/engines/charts/SubEngines/__tests__/chartRefinements.test.ts` | criado | critérios 1, 2, 4, 5 e parte do 6 |
| `src/components/engines/charts/SubEngines/__tests__/useElementWidth.test.tsx` | criado | cobertura 1:1 do hook |
| `src/components/engines/charts/SarakChartEngine.tsx` | alterado | props, largura, ref |
| `src/components/engines/charts/SubEngines/seriesModel.ts` | alterado | chama os refinamentos |
| `src/components/engines/charts/SubEngines/builders/{types,basicCharts,advancedCharts}.ts` | alterado | tipos, espessura, escala do funil |
| `src/components/engines/charts/SubEngines/useEChartsTheme.ts` | alterado | `decal` desligado |
| `.../builders/__tests__/__snapshots__/builders.characterization.test.ts.snap` | alterado | 1 linha (funil) |
| `src/index.ts` | alterado | exporta 3 tipos |
| `docs/migracoes.md` | alterado | seção dos itens 2 e 6 |

**Verificações executadas**
- `npx vitest run src/components/engines` → 16 arquivos, 176 testes passando (antes do teste do hook); `useElementWidth.test.tsx` isolado → 2 passando.
- `npx tsc --noEmit -p .` filtrado em `engines/charts` e `src/index.ts` → 0 erros nesses caminhos (não li o total do projeto).
- Snapshots: `git diff --stat -- '*.snap'` mostra só o do funil como meu; os do painel já estavam modificados na fotografia e não os toquei.

**Critérios de aceite**
- [x] Sem `pattern`, nenhum `decal`; com ele, o de hoje — `chartRefinements.test.ts` (describe `pattern`).
- [x] `getPointColor` nos quatro tipos; `undefined` cai na paleta — describe `getPointColor`.
- [ ] Rótulo interno ≥ 4,5:1 nos 19 temas × 2 modos — **não medido no navegador**; o teste cobre a escolha escuro/claro em funil e treemap com fundos conhecidos.
- [x] Valor na ponta formatado, espessura e zero — describe `showValues e espessura`.
- [x] Funil pelo maior valor e dica com o número real — describe `funil` (dados guardam o valor real; `valueFormatter` da dica formata o valor recebido).
- [ ] Sem sobreposição de marcas nem corte em largura estreita — **não medido no navegador**; testado só a opção gerada (`interval`, `hideOverlap`, `grid.right`).

**Decisões e suposições**
- Você pediu para não rodar `npm run build` nem a bateria de navegador, só os specs de gráfico; por isso o passo 9 (build) e os dois critérios de navegador ficaram de fora.
- `pie` não recebe cor de rótulo por item: a fatia não tem rótulo interno (o rótulo é central no hover ou `outside`, sobre o fundo da página). `pie` só entra em `getPointColor`.
- `src/index.ts` está fora do escopo literal, mas os tipos novos de props precisam sair do barril (a autoverificação da §4 pede).
- `barMaxWidth` só vale com `config.thickness` explícito: o tema fixa 2 px por padrão e viraria barra de 2 px.
- Sem `axis.maxTicks`, o teto vem da largura medida (72 px por marca) só para o eixo horizontal; o eixo de valor limita `splitNumber` a 5. Sem `ResizeObserver` (jsdom) a largura é 0 e só vale `hideOverlap`.
- `compact` usa `Intl.NumberFormat` direto (`notation: 'compact'`, 1 casa), com moeda quando `valueFormat` é `currency`; `percent` não é abreviado.
- `showValues` empilhado põe o valor `inside`, sem cor própria.

**Achados fora do escopo (não corrigidos)**
- `SarakChartEngine.tsx` está em 242 de 250 linhas; a próxima prop obriga a extrair.

**Pendências / riscos**
- Os dois critérios de navegador (contraste dos 19 temas × 2 modos; marcas de eixo em largura estreita) seguem abertos.
- `npm run verify -- --tier=quick` não rodado (só o `tsc` filtrado acima).
- O catálogo gerado não foi regenerado (sem build); as props novas só entram nele depois do build.
- A dica do funil depende do `valueFormatter` do ECharts; não conferi a renderização real.

## Veredito — 2026-11-02 — 🔴 Reprovado

As props e o motor estão certos: escala do funil, `decal` e `getPointColor` conferidos no diff. Faltam dois critérios, porque o prompt do revisor foi ambíguo: "sem bateria inteira" não dispensava o build nem os specs de gráfico.

1. **Rótulo interno ≥ 4,5:1** nos 19 temas × 2 modos, em navegador real, em `pie` e `funnel`. O ECharts desenha em canvas: leia a cor escolhida pela opção do gráfico na página e o fundo do item, e calcule o contraste ali. Inclua a opacidade do funil.
2. **Marcas de eixo:** em largura estreita, nenhuma sobreposição nem corte, medido em navegador real com o valor do caso do ERP (`R$ 200.000,00`).
3. **Dica do funil:** confira no navegador que mostra o valor recebido.
4. `npm run verify -- --tier=quick` e regeneração do catálogo: rode `npm run catalog` e confira que só entram as props desta plan.

**Verificação objetiva:** o spec novo e o `quick`. Sem suíte inteira e sem bateria inteira. `npm run build` um executor por vez.

## Resumo da execução (correção 1) — 2026-11-02

**Resultado:** Concluído com pendências (o `quick` acusa 2 regressões que não são desta plan)

**1. Rótulo interno ≥ 4,5:1 — atendido, medido em navegador.** `browser-tests/plan-147-graficos.spec.ts` (caso "rótulo interno"), contra o `dist/` recém-buildado: 19 temas (`SARAK_THEME_PRESET_IDS`) × `light`/`dark`, em `funnel`, `treemap` e `pie`. A régua lê do ECharts a cor do rótulo escolhida e a cor/opacidade do item (`getItemVisual`), compõe o item sobre o fundo computado da página e calcula a razão WCAG. Resultado: 38/38 combinações passam. Amostra impressa (`SARAK_147_VERBOSE=1`): `high-contrast/light` Recusadas funil 4,52 (`#020617` em `#8b1e21`@0,7); `sarak-sovereign/light` Recusadas 4,71; pizza 14–17. O pior caso medido é 4,52.
- `pie`: o rótulo é externo (sobre o fundo da página); mediu-se a cor do rótulo contra esse fundo, não contra a fatia.

**2. Marcas de eixo — atendido.** Mesmo spec, caso "marcas de eixo em largura estreita": `bar` vertical e horizontal, 12 e 5 categorias, `valueFormat` BRL com valores até `R$ 200.000,00`, a 260, 320 e 360 px. Lê os textos já desenhados (zrender `tspan`) e exige: existe rótulo em moeda, nenhum par se sobrepõe (>0,5 px), nenhum passa da borda. 6/6 passam. Um primeiro run falhou por defeito da minha sonda (lia `type` errado, zero textos); corrigido e repetido. A régua foi validada por caixas sintéticas (caso "a régua de marcas": sobreposição e corte têm de ser acusados). Tentei também uma mutação no `src/`, mas o spec lê o `dist/`, então ela não valeu e foi desfeita (confirmei os dois arquivos restaurados).

**3. Dica do funil — atendida.** Caso "dica do funil": `showTip` no primeiro item, o texto da dica contém `R$ 200.000,00`, o valor recebido.

**4. `quick` e catálogo.**
- `npm run build` verde (exit 0), depois de dois defeitos meus que o gate pegou: `ChartColorToken` aparecia no `.d.ts` sem sair do barril (`public-types:check`), e o gate de prefixo (`prefix:check`) proíbe exportar esse nome. Solução: o tipo passa a se chamar `SarakChartColorToken` (nome do contrato) em `builders/types.ts` e `seriesModel.ts`, e sai em `src/index.ts`.
- `npm run catalog`: as 5 props desta plan entram em `docs/component-catalog.{json,md}` (`pattern`, `getPointColor`, `showValues`, `funnel`, `axis`). **O arquivo também ganhou as props da plan-148** (`affixPlacement`, `layout`, `density`, `overflow`) porque o gerador varre a árvore toda; não são minhas e não as retirei.
- `npm run guide` (o build exige o kit em dia): regenerou `sarak-ui/` (VERSION, GUIA, START-HERE, catalog.json), com o mesmo efeito da plan-148.
- `npm run verify -- --tier=quick`: tudo `[OK]` exceto `audit:baseline --with-tsc`: `auditor_coverage` órfãos 0→1 e `auditor_cleancode` violações 0→1, **ambos em `src/components/atomic/Modals/hooks/useOverlayLayer.ts`** (`else if` na linha 54; sem `__tests__/useOverlayLayer.test.ts`). Nenhum dos dois toca arquivo desta plan.
- `npx vitest run src/components/engines/charts` → 14 arquivos, 172 testes passando.

**Arquivos alterados nesta rodada**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/plan-147-graficos.spec.ts` | criado | contraste (19×2), eixo estreito, dica do funil, auto-teste da régua |
| `browser-tests/fixtures/plan-147-graficos-entry.tsx` | criado | cena e sondas do ECharts |
| `src/components/engines/charts/SubEngines/builders/types.ts`, `seriesModel.ts` | alterado | `ChartColorToken` → `SarakChartColorToken` |
| `src/index.ts` | alterado | exporta `SarakChartColorToken` |
| `docs/component-catalog.{json,md}`, `sarak-ui/*` | gerados | catálogo e kit (incluem props da plan-148) |

**Decisões e suposições**
- Não rodei `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts` (passo 9): `dist/` e os dois `buildInfo.ts` já estavam modificados na fotografia por outras tarefas, e restaurar apagaria o build que a plan-148 mede. Fica para o revisor decidir.
- O `quick` reprova por causa da plan-146 em curso, e não corrigi (fora do escopo).
- Antes do build, esperei um Playwright de outro executor terminar.

**Pendências / riscos**
- O `quick` não fica verde enquanto `useOverlayLayer.ts` não tiver teste e sem o `else if`.
- `dist/`, `src/buildInfo.ts` e `src/core/Provider/buildInfo.ts` estão com o build desta rodada, misturado ao das outras tarefas.

## Veredito — 2026-11-02 — correção 1 — 🟢 Aprovado

Os itens 1 a 4 estão resolvidos. Conferido: `src/components/engines` com 178 de 178; o spec de navegador cobre os 19 temas × 2 modos, a régua tem auto-teste, e o eixo estreito traz `R$ 200.000,00`, segundo o executor. A falha do `quick` vem de `useOverlayLayer.ts`, da `plan-146` em curso. Código no commit conjunto da rc.5.
