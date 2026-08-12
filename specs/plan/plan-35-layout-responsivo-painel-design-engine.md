---
tipo: "plan"
titulo: "Fazer o painel Design Engine responder ao container, não à viewport"
dominio: "Sarak-Lib-UI-Core / Design Engine / Painel"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "painel", "responsividade", "container-query", "layout"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[07-responsividade-e-multidispositivo]]", "[[00-mapa-do-modulo]]"]
depende_de: ""
destino_sintese: "specs/specs/06-painel-de-customizacao-e-preview.md"
objetivo: "O painel de customização se adapta ao espaço real do container onde está embutido, sem sobrepor colunas nem cortar texto, independentemente da largura da janela"
---

# 1. Objetivo

O painel de customização (`CustomizationPanel`), embutido dentro de um card, sidebar, modal ou qualquer
container mais estreito que a viewport, reflui corretamente — sem colunas sobrepostas, sem texto cortado,
sem depender da largura da janela do navegador.

# 2. Contexto

Reportado pelo dono com print anexo: colunas do painel (sidebar de tokens, preview central, catálogo de
temas) sobrepostas, com texto cortado ("SIDE…", "TOPBAR"). Investigação no código confirma a causa, com
`arquivo:linha`:

- `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx:138` — o container raiz de duas colunas usa
  `h-screen max-h-screen`: altura da **viewport do navegador**, não do container-pai onde o painel está
  embutido.
- `ThemeCustomizationTab.tsx:140-142` — a sidebar de tokens tem `min-w-[...,280px)] max-w-[...,600px)]` sem
  nenhum encolhimento por espaço disponível.
- `ThemeCustomizationTab.tsx:189` — o canvas é só `flex-1`, **sem `min-w-0`** — receita clássica de overflow
  em flexbox quando o irmão (a sidebar) tem largura mínima fixa.
- `src/features/DesignEngine/Canvas/PreviewCanvas.tsx:135` — o único breakpoint responsivo do preview é
  `xl:` (1280px) — **media query de viewport**, não container query. Dentro de um host mais estreito que
  1280px de viewport, o dual-view nunca reflui corretamente em relação ao espaço real.
- `src/features/DesignEngine/Canvas/PreviewSystemRenderer.tsx:83-86` — o "gêmeo digital" desenha o conteúdo a
  105–133% do tamanho do pai via `transform: scale()`, calculado sobre a largura assumida (viewport), não
  medida do container real. Quando o pai já está espremido pelo bug acima, o texto corta — é exatamente o que
  aparece no print.
- Catálogos (`CardsCatalog.tsx:37`, `AtmosphereCatalog.tsx:55`, e o mesmo padrão em `TypographyCatalog.tsx`,
  `ButtonsCatalog.tsx`, `InputsCatalog.tsx`) usam `grid-cols-1 md:grid-cols-2` — `md:` também é breakpoint de
  **viewport** (768px), não de espaço disponível do painel.
- `src/features/DesignEngine/Main/MasterControlPanel.tsx:98-106` — tabela `table-fixed` com larguras
  percentuais fixas, sem colapso.

**Isto fecha um backlog já declarado.** [[06-painel-de-customizacao-e-preview]] §6.2 registra: *"isto não é
container query real... o 'Tier B' nunca foi feito"*. Esta plan constrói o Tier B.

**O padrão já existe na lib e deve ser seguido, não inventado.** [[07-responsividade-e-multidispositivo]] §6
documenta a "camada 3" — container queries estruturais (`@min-[Npx]:`) — como o mecanismo já usado, por
exemplo, na raiz do `SarakShell` (`SarakShell.tsx:89`, `@container`). O painel deve usar o mesmo mecanismo do
Tailwind (v4, `@container`/`@min-[Npx]:`), não uma solução paralela.

## 2.0 🔧 EMENDA DE ESCOPO — 2026-08-12, antes de qualquer execução

Ao conferir esta plan contra o código **antes de liberá-la**, o revisor mediu cada `arquivo:linha` e achou
**quatro defeitos na própria plan**. A emenda está aqui, e não escondida, pelo mesmo motivo da `plan-28` §2.0
e da `plan-30` §2.0: **corrigir a plan em silêncio é o defeito, não a correção.**

| # | O que a plan afirmava | O que a medição de 2026-08-12 responde | Efeito |
|---|---|---|---|
| 1 | `AtmosphereCatalog.tsx:55` usa `grid-cols-1 md:grid-cols-2` | a linha é `grid grid-cols-1 gap-6` — **não há breakpoint de viewport nenhum nesse arquivo** | ❌ **sai da lista de conversão** |
| 2 | os catálogos com `md:` são cinco | **são cinco, mas não os cinco listados**: `PresetsCatalog.tsx:79` tem `md:grid-cols-2` e **não estava no escopo** | ✅ **entra** — é o catálogo de temas, uma das três colunas sobrepostas no print |
| 3 | `src/features/DesignEngine/Canvas/PreviewSystemRenderer.tsx` | o arquivo mora em `Canvas/components/PreviewSystemRenderer.tsx` | caminho corrigido em toda a plan |
| 4 | critério de aceite fala em *"os 7 arquivos do escopo"* | a §3.1 lista **nove** | o critério passa a afirmar a **relação** (§3.1), não a cifra |

**A varredura que fecha o escopo** (`grep -rnE "(^|[\"'\` ])(sm|md|lg|xl|2xl):" src/features/DesignEngine`,
saída lida inteira) devolve **10 arquivos**. Os que **ficam de fora, de propósito**, e por quê:

| Fora do escopo | Motivo |
|---|---|
| `Canvas/KitchenSinkPreview.tsx:43,111` | vitrine interna de componentes, não é coluna do painel — e é allowlist do `zero-brand` ([[06-painel-de-customizacao-e-preview]] §8) |
| `Panels/AdvancedTab.tsx` · `LanguageTab.tsx` · `LayoutTab.tsx` | são as **abas inalcançáveis** de [[06-painel-de-customizacao-e-preview]] §9.3 — não renderizam hoje. Converter layout de tela morta é trabalho sem consumidor |

⚠️ **Consequência direta para a §8:** o comando de verificação **não pode varrer `Canvas/` inteiro**, ou
volta não-vazio por causa do `KitchenSinkPreview` e reprova o executor por algo fora do escopo dele. A §8 foi
reescrita para varrer **só os arquivos da §3.1**.

> **A lição, e ela é sobre o método desta própria plan:** eu levantei os alvos **lendo os arquivos que
> esperava encontrar** e só varri por padrão ao conferir. É a mesma lição da `plan-28` — *leitura sem
> varredura não é auditoria* — e a `plan-31` provou o inverso: **método no lugar de lista fechou de
> primeira.** O escopo desta plan passa a se fechar pela varredura acima, não por esta tabela.

# 3. Escopo

## 3.1 Dentro
- `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx` — trocar `h-screen`/`max-h-screen` por altura
  relativa ao container-pai (cadeia `h-full`/`min-h-0` até a raiz do painel); adicionar `min-w-0` no canvas.
- `src/features/DesignEngine/Canvas/PreviewCanvas.tsx` — trocar `xl:` por container query real
  (`@container`/`@min-[Npx]:`) na raiz do painel ou do próprio Canvas, o que for a fronteira correta medida
  no código.
- `src/features/DesignEngine/Canvas/components/PreviewSystemRenderer.tsx` — o cálculo de `scale()` passa a
  medir o container real (via `@container` ou `ResizeObserver`, a critério do executor, documentando a
  escolha), não uma porcentagem fixa assumindo viewport.
- **Os cinco catálogos que de fato têm breakpoint de viewport** *(medidos na emenda §2.0)* —
  `src/features/DesignEngine/Canvas/components/CardsCatalog.tsx:37`, `TypographyCatalog.tsx:15`,
  `ButtonsCatalog.tsx:36`, `InputsCatalog.tsx:14` e **`PresetsCatalog.tsx:79`** — trocar `md:`/`lg:` por
  container query equivalente.
  ⛔ **`AtmosphereCatalog.tsx` NÃO entra**: `grep` confirma zero breakpoint de viewport nele. Se você achar
  que ele quebra o layout mesmo assim, **relate — não converta**: é achado, não escopo.
- `src/features/DesignEngine/Main/MasterControlPanel.tsx` — revisar a tabela `table-fixed` para não
  sobrepor/cortar em sidebar estreita (280px mínimo).
- Testes em `__tests__/` ao lado de cada arquivo tocado — inclusive um teste que monta o painel dentro de um
  container simulado **estreito** (ex.: 320px) e afirma ausência de sobreposição/overflow detectável.

## 3.2 Fora
- ⛔ **Performance/memoização do rascunho** — é a `plan-36`, que **depende desta** (para não haver conflito
  de merge nos mesmos arquivos).
- ⛔ **O modo essencial/`HyperGranularityTab`** — é a `plan-37`.
- ⛔ Mudar o visual dos componentes (cor, espaçamento, tipografia) — só o mecanismo de reflow.
- ⛔ Inventar mecanismo de responsividade novo. Use `@container`/`@min-[Npx]:` do Tailwind, o mesmo padrão já
  em uso no resto da lib.
- ⛔ Mexer em `src/core/Provider/` — é a `plan-34`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §6.2 | o backlog exato que esta plan fecha |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §6 | o padrão de container query já em uso (camada 3) |
| Spec fixa | `specs/arquitetura/00-mapa-do-modulo.md` §5.1 | Hook Controlador — se a lógica de breakpoint crescer, é onde ela deve morar, não no `.tsx` |
| **Skill** | `padrao-escrita` · `padrao-typescript` | sempre |
| **Skill** | `ui-arquitetura-design` | regra arquitetural do módulo Design Engine |
| **Skill** | `test-unitario` | todo conserto muda comportamento e leva teste |
| Código | `src/core/Shell/SarakShell.tsx:89` | exemplo real de `@container` já em produção nesta lib |
| Código | **e** `Canvas/components/PreviewSystemRenderer.tsx:72` | o painel **já usa** `@container` num ponto — não é mecanismo novo aqui |
| Código | os arquivos listados na §3.1 | ler antes de editar |

# 5. Instruções de execução

1. **Meça a fronteira do container antes de editar.** Identifique, no DOM real do painel, qual é o elemento
   que deveria carregar `container-type` (provavelmente a raiz de `ThemeCustomizationTab.tsx` ou de
   `CustomizationPanelImpl.tsx`) — é dali que todo `@min-[Npx]:` interno vai medir.
2. **`ThemeCustomizationTab.tsx:138`** — trocar `h-screen max-h-screen` pela cadeia de altura relativa
   (`h-full`, com `min-h-0` nos ancestrais flex que precisarem, conferindo que o container que hospeda o
   painel realmente propaga altura — se o consumidor não der altura ao host, documente isso como pré-
   -requisito, não invente altura mágica).
3. **`:189`** — adicionar `min-w-0` no canvas.
4. **`PreviewCanvas.tsx:135`** — trocar `xl:flex-row` por `@min-[Npx]:flex-row`, medindo o `N` real que faz
   sentido para o dual-view (documente o valor escolhido e por quê).
5. **`Canvas/components/PreviewSystemRenderer.tsx:64-66`** — `scaleFactor` é hoje `isDualView ? 0.75 : 0.95`,
   uma constante, e `widthPercent`/`heightPercent` derivam dela. Passa a ser função da largura real do
   container. ⚠️ Note que esse arquivo **já monta um `@container`** (`:72`) — a fronteira que você precisa
   pode já existir ali.
6. **Os cinco catálogos da §3.1** (`Cards`, `Typography`, `Buttons`, `Inputs`, **`Presets`**) — trocar
   `md:grid-cols-2`/`lg:grid-cols-3` por `@min-[Npx]:` equivalente. **`Atmosphere` não entra** (§2.0).
7. **`MasterControlPanel.tsx:98-106`** — garantir que a tabela não sobreponha nem corte com a sidebar no
   mínimo de 280px.
8. **Testes**: para cada arquivo tocado, teste que monta o componente com o container-pai em pelo menos duas
   larguras (estreita e larga) e afirma o layout esperado em cada uma (sem depender de `overrideDevice`/
   viewport — é container, não dispositivo).
9. **Fechar.** Rodar, nesta ordem, e colar a saída real no resumo: `npx vitest run` (INTEIRA) ·
   `node gates/scripts/audit/run_audit.mjs` (atenção especial ao `auditor_hardcoded` — valor arbitrário de
   `@min-[Npx]:` é estrutural e permitido, mas confira o R2.3 antes de assumir) ·
   `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` · `npx tsc --noEmit` · `git diff --stat`.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-35-layout-responsivo-painel-design-engine.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/06-painel-de-customizacao-e-preview.md §6.2 (o backlog que esta plan fecha),
specs/specs/07-responsividade-e-multidispositivo.md §6 (o padrão de container query já
em uso), specs/arquitetura/00-mapa-do-modulo.md §5.1.
Skills a aplicar: padrao-escrita, padrao-typescript, ui-arquitetura-design, test-unitario.

⚠️ A plan foi EMENDADA em 2026-08-12 (§2.0), ANTES de qualquer execução: AtmosphereCatalog
SAIU (não tem breakpoint de viewport nenhum), PresetsCatalog ENTROU, e o caminho de
PreviewSystemRenderer é Canvas/components/, não Canvas/. Leia a §2.0 antes da §3.

O MECANISMO É CONTAINER QUERY (@container / @min-[Npx]:), o mesmo já usado em
SarakShell.tsx:89 — e já presente em PreviewSystemRenderer.tsx:72. NÃO troque viewport
breakpoint (xl:/md:) por outro viewport breakpoint — o defeito É depender de viewport
num componente que pode estar embutido em qualquer largura de container.

LINHAS VERMELHAS:
  · Você NÃO mexe em performance/memoização do rascunho (plan-36, que depende desta).
  · Você NÃO mexe no modo essencial nem no HyperGranularityTab (plan-37).
  · Você NÃO muda cor, espaçamento ou tipografia — só o mecanismo de reflow.
  · Você NÃO mexe em src/core/Provider/ (plan-34).

Todo conserto leva teste ao lado (R8), com o container-pai simulado em pelo menos duas
larguras — NÃO use overrideDevice/viewport para provar isto, é container, não
dispositivo.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] Nenhum breakpoint de **viewport** (`xl:`, `md:`, `lg:`, etc.) sobrevive **nos arquivos da §3.1** —
      todos viraram `@container`/`@min-[Npx]:`. Os arquivos que a §2.0 declara **fora** continuam como estão,
      e isso não é falta.
- [ ] `ThemeCustomizationTab.tsx` não usa mais `h-screen`/`max-h-screen`; a altura é relativa ao container.
- [ ] O canvas tem `min-w-0`.
- [ ] `PreviewSystemRenderer` calcula `scale()` a partir da largura real do container, não de porcentagem
      fixa.
- [ ] Teste que monta o painel num container **estreito** (≤ 400px) e afirma ausência de overflow/sobreposição
      detectável — para pelo menos `ThemeCustomizationTab`, `PreviewCanvas` e um dos catálogos.
- [ ] [[06-painel-de-customizacao-e-preview]] §6.2 pode virar `✅ FECHADO` na síntese (evidência no resumo).
- [ ] `npx vitest run` inteira, verde, não encolheu.
- [ ] `run_audit` sem regressão; `npx tsc --noEmit` → 0 erros.
- [ ] `git diff --stat` — só os arquivos de §3.1 (mais os testes correspondentes).

# 8. Como verificar (uso do revisor)

```bash
git diff --stat
git diff

# a varredura de classe, LIMITADA aos arquivos da §3.1 (ver a emenda §2.0:
# varrer Canvas/ inteiro pega KitchenSinkPreview, que está FORA do escopo)
grep -nE "(^|[\"'\` ])(sm|md|lg|xl|2xl):" \
  src/features/DesignEngine/Main/ThemeCustomizationTab.tsx \
  src/features/DesignEngine/Main/MasterControlPanel.tsx \
  src/features/DesignEngine/Canvas/PreviewCanvas.tsx \
  src/features/DesignEngine/Canvas/components/PreviewSystemRenderer.tsx \
  src/features/DesignEngine/Canvas/components/CardsCatalog.tsx \
  src/features/DesignEngine/Canvas/components/TypographyCatalog.tsx \
  src/features/DesignEngine/Canvas/components/ButtonsCatalog.tsx \
  src/features/DesignEngine/Canvas/components/InputsCatalog.tsx \
  src/features/DesignEngine/Canvas/components/PresetsCatalog.tsx

grep -n "h-screen\|max-h-screen" src/features/DesignEngine/Main/ThemeCustomizationTab.tsx
npx vitest run
node gates/scripts/audit/run_audit.mjs
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npx tsc --noEmit
```

A varredura tem de voltar **vazia** (ou só com ocorrência justificada e declarada no resumo) — é a prova de
que o mecanismo realmente trocou, não só que "ficou melhor". **Confira também a lista de arquivos do comando
contra a §3.1**: se o executor tocou arquivo fora dela, é achado.

**O que reprova, além do óbvio:**
- Reflow provado só com `overrideDevice`/mock de viewport — não prova a fronteira que o objetivo desta plan
  exige (espaço do container, não do dispositivo);
- `@min-[Npx]:` com valor arbitrário sem explicação de por que aquele número — mesmo cuidado que o resto da
  lib já pratica (ver o comentário de `ChromeFrame.tsx` citado em [[05-cromo-e-slots]]).

# 9. Destino da síntese

**Destino:** `specs/specs/06-painel-de-customizacao-e-preview.md`

**Texto pronto para transporte:** a §6.2 (hoje: *"isto não é container query real... nunca foi feito"*) passa
a `✅ FECHADO`, registrando o mecanismo real (`@container`/`@min-[Npx]:` nos arquivos tocados) e o breakpoint
escolhido para o dual-view, com o motivo.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
