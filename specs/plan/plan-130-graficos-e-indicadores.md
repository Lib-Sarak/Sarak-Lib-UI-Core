---
tipo: "plan"
titulo: "Dar aos gráficos e indicadores formato, referência e meta"
objetivo: "Fazer SarakChartEngine, SarakStats, SarakSparkline, SarakProgress e SarakKanban exibirem valor financeiro formatado no idioma da tela, com altura própria, linhas e faixas de referência, zoom, meta, delta percentual com semântica invertida e soma por coluna, e remover o SarakChart"
dominio: "Gráficos / Indicadores"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "rc.4", "graficos", "indicadores", "erp"]
relacionados: ["[[anexos/rc4-contrato]]", "[[plan-128-idioma-unico-e-feedback-rico]]", "[[03-superficie-publica]]"]
depende_de: "plan-128-idioma-unico-e-feedback-rico"
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

Itens Gráficos 1–7 e Feedback 4 do contrato entregues; `SarakChart` fora do barril, com o de/para na nota.

# 2. Contexto

Contrato aceito: [`anexos/rc4-contrato.md`](anexos/rc4-contrato.md) §2.4–§2.6, §2.9 (Kanban), §5 Q7. **Nomes, tipos e padrões de lá são lei.**

O que a leitura revelou: `SarakChartEngineProps` em `src/components/engines/charts/SarakChartEngine.tsx:23`; as opções ECharts saem
de `SubEngines/seriesModel.ts` (`buildChartOption`) e `SubEngines/builders/`; props só do ECharts são avisadas no Recharts por
`ECHARTS_ONLY_PROPS` (`:20`) — as novas entram nessa lista. `SarakStatsMetricConfig` em `Templates/SarakStats.tsx:15`; o valor é
desenhado por `Atoms/SarakValue.tsx`, que **já** tem `signColor`. `SarakSparkline` (`DataDisplay/SarakSparkline.tsx:16`),
`SarakProgress` (`Feedback/SarakProgress.tsx:14`), tipos do Kanban em `DataDisplay/SarakKanban/kanbanTypes.ts:19`. `SarakChart` é
exportado por `Templates/index.ts:10`; o ERP não o usa. O locale vem de `useSarakLanguage()` (`plan-128`).

# 3. Escopo

## 3.1 Dentro
- `src/components/engines/charts/` — props novas e builders.
- `src/components/atomic/Templates/SarakStats.tsx` (+ `hooks/` dele).
- `src/components/atomic/DataDisplay/SarakSparkline.tsx`, `src/components/atomic/Feedback/SarakProgress.tsx`.
- `src/components/atomic/DataDisplay/SarakKanban/` — `value`, `valueFormat`, `columnTotal`.
- **Remoção:** `Templates/SarakChart.tsx`, seus testes, a linha em `Templates/index.ts`, o registro dele onde houver (registros de
  componente, paridade, manifesto) e código que só ele usa — provado por `grep` colado no resumo.
- `src/core/i18n/catalogEntries.charts.ts` · `src/index.ts` (acréscimo/remoção da linha do `SarakChart`) ·
  `docs/migracoes.md` (uma subseção na `## 8.0.0`: Q7 com de/para e as props novas).

## 3.2 Fora
- Gráfico novo, motor novo, dependência nova.
- `SarakSparkline`/`SarakProgress` além das props do contrato.
- Arquivos gerados; `catalog.ts`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contrato | `specs/plan/anexos/rc4-contrato.md` §2.4–§2.6, §2.9, §5 Q7, **§9** | o que entregar e como verificar |
| Spec fixa | `arquitetura/03-superficie-publica.md` | remoção do barril |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-refatorar-componente` (remoção) · `ui-arquitetura-design` | sempre · remover sem quebrar paridade · cor só por token de status |
| Código | arquivos de §2 | ler antes de editar |

# 5. Instruções de execução

1. Fotografe o worktree.
2. `SarakChartEngine`: §2.4 inteiro; `valueFormat` usa os `sarakFormat*` com o locale do hook, no eixo, na dica e nos rótulos; tons de
   referência só pelos tokens de status; props novas na lista de aviso do Recharts.
3. `SarakStats`: §2.5; `goodDirection: 'down'` inverte a cor, nunca a seta.
4. `SarakSparkline`, `SarakProgress`: §2.6 (`aria-valuenow` com o valor real quando `allowOverflow`).
5. Kanban: soma por coluna no cabeçalho só quando algum cartão tem `value`.
6. Remova o `SarakChart` (§3.1) com a skill `ui-refatorar-componente`.
7. Subseção em `docs/migracoes.md`; `npm run barrel:check`; `npm run verify -- --tier=quick` uma vez, resumo colado (contrato §9).

# 6. Critérios de aceite

- [ ] Cada prop de §2.4–§2.6 e do Kanban com teste que falharia sem ela (opção ECharts capturada, como em `SarakChartEngine.formats.test.tsx`).
- [ ] `valueFormat` em BRL no eixo e na dica com locale `pt-BR` e `en-US` — teste.
- [ ] Gauge sem `%` quando `valueFormat` não é percentual; pizza com `pieLabel: 'percent'` — teste.
- [ ] Stats: despesa subindo com `goodDirection: 'down'` sai no tom de erro com seta para cima — teste.
- [ ] `SarakChart` ausente do barril (`barrel:check` verde) e sem referência em `src/` (grep colado).
- [ ] Sem prop nova, comportamento da rc.3 (testes existentes passam sem alteração).
- [ ] Resumo com a tabela item do contrato → teste.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — comportamento provado por teste; a remoção é cobrada pelo `barrel:check` que já existe.

- `npx vitest run src/components/engines/charts SarakStats SarakSparkline SarakProgress SarakKanban src/core/i18n` — uma vez (filtro
  por nome: não pega o trabalho em andamento das plans paralelas).
- `grep -rn "SarakChart\b" src` → vazio.
- Diff lido contra o contrato; `git diff --stat` só com a §3.1. O `quick` do executor é aceito pelo resumo colado.

# 8. Destino da síntese

**Destino:** `—` — superfície documentada pelo catálogo gerado e pela nota de migração; nenhuma regra muda.

---

# 9. Resumo da execução

---

# 10. Veredito
