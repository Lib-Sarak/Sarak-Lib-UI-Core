---
tipo: "plan"
titulo: "Gráficos que ocupam o quadro e os ajustes principais do painel nos seis idiomas"
objetivo: "Fazer o SarakChartEngine usar o espaço do quadro em todos os tipos, sem achatar o desenho em quadros médios, e mostrar nos seis idiomas o nome e a descrição dos tokens que aparecem nas decisões principais do painel"
dominio: "Componentes / Gráficos · Painel / Idiomas"
status: "🔴 A executar"
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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
