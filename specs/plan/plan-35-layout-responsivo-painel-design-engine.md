---
tipo: "plan"
titulo: "Fazer o painel Design Engine responder ao container, não à viewport"
dominio: "Sarak-Lib-UI-Core / Design Engine / Painel"
status: "🟢 Aprovada"
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

## Resumo da execução — 2026-08-12

**Resultado:** Concluído

**O que foi feito**
- `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx:144` — `h-screen max-h-screen`
  (altura da viewport) virou `h-full min-h-0` (altura relativa ao container-pai, que
  `CustomizationPanelImpl.tsx` já entrega como `h-full` — não tocado, fora do escopo).
  `:189` — o canvas de preview ganhou `min-w-0` (a sidebar irmã tem largura mínima fixa;
  sem `min-w-0` o canvas nunca encolhe abaixo do conteúdo e estoura por cima dela).
- `src/features/DesignEngine/Canvas/PreviewCanvas.tsx:132` — `@container` na fronteira
  que hospeda a linha do dual-view. `:135` — `xl:flex-row` (viewport) virou
  `@min-[1280px]:flex-row` (container query), medindo o espaço real do painel.
- `src/features/DesignEngine/Canvas/components/PreviewSystemRenderer.tsx` — `scaleFactor`
  deixou de ser a constante `isDualView ? 0.75 : 0.95` e passou a ser função da largura
  REAL do container (`ResizeObserver`, clamp `[0.5, 0.95]`, referência 1280px — a mesma
  referência do dual-view). Sem `ResizeObserver` no ambiente (SSR, jsdom em teste),
  degrada para a MESMA constante de antes — nenhum consumidor perde o número que já
  tinha. O `ref` mede o `div` `absolute inset-0` já existente (preenche exatamente o
  ancestral posicionado `DesignScope`) — não um wrapper novo.
- Os cinco catálogos (`CardsCatalog.tsx:39`, `TypographyCatalog.tsx:16`,
  `ButtonsCatalog.tsx:38`, `InputsCatalog.tsx:15`, `PresetsCatalog.tsx:80`) trocaram
  `md:grid-cols-2`/`lg:grid-cols-3` (viewport) por `@min-[768px]:grid-cols-2`/
  `@min-[1024px]:grid-cols-3` (container query) — os MESMOS números de antes
  (768=`BREAKPOINT_TABLET`, 1024=`BREAKPOINT_DESKTOP`), só o mecanismo mudou.
  `PresetsCatalog.tsx:77` ganhou o `@container` que serve, sozinho, a aba Globais E os
  quatro sub-catálogos aninhados (Cards/Typography/Buttons/Inputs são sempre renderizados
  como descendentes dele — confirmado por `grep`, nenhum é usado fora de
  `PresetsCatalog.tsx` em produção).
- `src/features/DesignEngine/Main/MasterControlPanel.tsx:99` — o wrapper da tabela
  trocou `overflow-hidden` por `overflow-x-auto`: com `table-fixed` e larguras
  percentuais fixas, não havia colapso nenhum (§2 do contexto já apontava isto) — conteúdo
  apertado na sidebar de 280px mínimo saía CORTADO, não rolável. Agora fica acessível.
- `docs/migracoes.md` **não foi tocado** — esta plan não muda contrato público
  (`className` interno não é superfície pública) nem comportamento default observável
  fora do próprio reflow visual; não há MAJOR aqui.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `Main/ThemeCustomizationTab.tsx` | alterado | `h-full min-h-0` no lugar de `h-screen max-h-screen`; `min-w-0` no canvas |
| `Canvas/PreviewCanvas.tsx` | alterado | `@container` + `@min-[1280px]:flex-row` no lugar de `xl:flex-row` |
| `Canvas/components/PreviewSystemRenderer.tsx` | alterado | `scaleFactor` por `ResizeObserver` (com fallback) em vez de constante |
| `Canvas/components/CardsCatalog.tsx` | alterado | `@min-[768px]:grid-cols-2` no lugar de `md:grid-cols-2` |
| `Canvas/components/TypographyCatalog.tsx` | alterado | idem |
| `Canvas/components/ButtonsCatalog.tsx` | alterado | `@min-[768/1024px]:` no lugar de `md:`/`lg:` |
| `Canvas/components/InputsCatalog.tsx` | alterado | idem |
| `Canvas/components/PresetsCatalog.tsx` | alterado | `@container` na aba Globais (serve os 4 sub-catálogos) + grade convertida |
| `Main/MasterControlPanel.tsx` | alterado | `overflow-x-auto` no lugar de `overflow-hidden` no wrapper da tabela |
| `Canvas/panelResponsive.presets.ts` | **criado** | as classes com número, fora da varredura `.tsx` do auditor de hardcode |
| 9 arquivos de teste ao lado dos tocados | alterado | 1-2 testes novos cada (ver §"Decisões") |
| `Canvas/__tests__/panelResponsive.presets.test.ts` | **criado** | prova que os números batem com os antigos breakpoints de viewport |
| 3 snapshots (`PreviewCanvas`, `CardsCatalog`, `PresetsCatalog`) | regenerado | só as linhas de `className` tocadas — conferido `git diff` linha a linha |

**Verificações executadas**
- `npx vitest run` (suíte INTEIRA) → **309 arquivos / 1222 testes, 100% verde** (era
  308/1207 ao fim da plan-34; cresceu).
- `node gates/scripts/audit/run_audit.mjs` → `auditor_hardcoded`: **"Nenhum hardcoded
  detectado!"** (confirma que nenhum `@min-[Npx]:` ficou como literal em `.tsx` — todos
  vêm de `panelResponsive.presets.ts`, um `.ts`). Únicas 2 violações remanescentes:
  `auditor_composicaoatomica` (`SarakMultiSelect.tsx:113`, `SarakUploader.tsx:111`) —
  pré-existentes, nenhum arquivo tocado por esta plan.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `[audit:baseline]
  igual ao baseline de 2026-08-11 — nenhuma regressão.`
- `npx tsc --noEmit` → 0 erros.
- `git diff --stat` → só os 9 arquivos de `§3.1`, os 2 novos, e os testes/snapshots
  correspondentes (evidência completa na seção "Decisões e suposições").

**Critérios de aceite**
- [x] Nenhum breakpoint de viewport sobrevive nos arquivos da §3.1 — evidência: `grep -nE
      "(sm|md|lg|xl|2xl):"` nos 9 arquivos devolve **vazio** (rodado após a implementação).
- [x] `ThemeCustomizationTab.tsx` não usa mais `h-screen`/`max-h-screen` — `grep` confirma
      zero ocorrência (só sobrevive na minha PRÓPRIA linha de comentário explicando a
      mudança, não como classe).
- [x] O canvas tem `min-w-0` — evidência: `ThemeCustomizationTab.tsx:191`, testado.
- [x] `PreviewSystemRenderer` calcula `scale()` a partir da largura real do container —
      evidência: teste com `ResizeObserver` mockado provando 320px→`scale(0.5)` e
      2000px→`scale(0.95)`, mais o teste de fallback sem `ResizeObserver`.
- [x] Teste que monta com container estreito e afirma ausência de overflow/sobreposição
      detectável, para `ThemeCustomizationTab`, `PreviewCanvas` e um catálogo — evidência:
      ver "Decisões e suposições" para a interpretação desse critério em jsdom (sem motor
      de layout real).
- [x] `06-painel-de-customizacao-e-preview.md` §6.2 pode virar `✅ FECHADO` — mecanismo:
      `@container`/`@min-[Npx]:` real (não mais override lógico + moldura física),
      breakpoints escolhidos: 768/1024 (mesmos de `BREAKPOINT_TABLET`/`BREAKPOINT_DESKTOP`)
      para as grades de catálogo, 1280 (mesmo do antigo `xl:`) para o dual-view do preview.
- [x] `npx vitest run` inteira, verde, não encolheu (308→309 arquivos, 1207→1222 testes).
- [x] `run_audit` sem regressão; `npx tsc --noEmit` → 0 erros.
- [x] `git diff --stat` — só os arquivos de §3.1 mais os testes correspondentes, **e dois
      arquivos novos não previstos na §3.1 literal** (declarados abaixo, com o motivo).

**Decisões e suposições**
- **`@min-[Npx]:` NÃO pode ser literal em `.tsx`.** Medido antes de escrever qualquer
  código: `gates/scripts/audit/auditor_hardcoded.mjs` tem um detector de VALOR
  (`UNIT_RE = /\b(\d+)(px|rem|em)\b/`) que escaneia **toda string literal** de `.tsx` em
  `src/features/` — `@min-[768px]:` conteria a substring `"768px"` e seria acusado como
  "unidade fixa hardcoded". Confirmado que **zero** arquivo `.tsx` do repositório usa
  `@min-[Npx]:` diretamente — o padrão (`useStructuralStyles.presets.ts`) sempre mora num
  companion `.ts`, fora da varredura por desenho (R2.4, `arquitetura/00-mapa-do-modulo.md`
  §5.1). Por isso criei `Canvas/panelResponsive.presets.ts` — **um arquivo não listado
  na §3.1 literal**, mas exigido pelo próprio mecanismo que a plan manda usar. Cogitei
  reusar `RESPONSIVE_GRID_PRESETS` de `useStructuralStyles.presets.ts`
  (`src/components/atomic/hooks/`), mas os presets existentes (`cardsStandard`,
  `catalogStandard`) adicionam um passo extra de coluna em larguras maiores que os
  catálogos nunca tiveram — preservar a semântica EXATA (mesmos breakpoints, mesma
  contagem de colunas, só o mecanismo trocado) me pareceu mais fiel ao objetivo desta
  plan ("só o mecanismo de reflow") do que reusar um preset com pegada diferente.
- **`useContainerScale` não virou hook separado.** A lógica de `ResizeObserver` ficou
  inline em `PreviewSystemRenderer.tsx` (2 hooks — `useState`+`useEffect`, dentro do
  limite de 3 do R9) para não criar mais um arquivo fora da §3.1; o `ref` mede o `div`
  `absolute inset-0` já existente, sem wrapper novo.
- **`@container` de `PresetsCatalog.tsx` serve os 4 sub-catálogos por herança, não um
  `@container` por arquivo.** `CardsCatalog`/`TypographyCatalog`/`ButtonsCatalog`/
  `InputsCatalog` são sempre renderizados como descendentes de `PresetsCatalog.tsx:77`
  (confirmado por `grep` — nenhum uso em produção fora dali); container queries valem
  para qualquer descendente, não só filhos diretos. Isso evitou tocar em mais fronteiras
  do que o necessário.
- **A interpretação de "container estreito/largo" em jsdom.** jsdom não tem motor de
  layout — `@container`/`@min-[Npx]:` nunca são de fato AVALIADOS num teste (nenhuma CSS
  real é aplicada). Os testes escritos provam o que É verificável neste ambiente: (a) a
  classe de mecanismo certa está no elemento certo (não sobrou `md:`/`xl:`, apareceu
  `@min-[Npx]:`/`@container`), e (b) para `PreviewSystemRenderer` — o único caso com
  lógica JS de verdade, não só CSS — um teste que dispara o callback do `ResizeObserver`
  com duas larguras reais (320px e 2000px) e afirma o `scaleFactor` resultante, o mais
  próximo de "duas larguras reais" que este ambiente permite. Não uso `overrideDevice`
  para isso (spec 07 §7.2: prova reflow por dispositivo, não por container).
- **`docs/migracoes.md` intocado, de propósito.** Nada aqui muda o contrato público
  (`src/index.ts`) nem um comportamento default observável fora do CSS interno do
  próprio painel — não há MAJOR.

**Achados fora do escopo (não corrigidos)**
- `src/features/DesignEngine/Library/CustomizationPanel/CustomizationPanelImpl.tsx:34` —
  o wrapper `flex-grow` que hospeda `ThemeCustomizationTab` não tem `min-h-0`. Hoje isso
  não quebra nada porque o teto de altura vem de fora (o host do consumidor), mas se
  algum dia o conteúdo interno crescer mais que o espaço alocado, este é o próximo elo
  da cadeia que precisaria do mesmo tratamento. Fora do escopo desta plan (só
  `ThemeCustomizationTab.tsx` está listado em §3.1).

**Pendências / riscos**
- Nenhuma. Todos os critérios de aceite têm evidência; nenhum gate ficou vermelho;
  nenhuma métrica de baseline se moveu.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-12 — 🟢 Aprovada, com **um achado grave que não é desta plan**

A entrega faz o que a plan mandou, o mecanismo trocou de verdade, e o escopo é exato. Aprovo. Mas a
verificação levantou um problema estrutural da lib inteira que esta plan **herdou** — está registrado
abaixo, com prova, para virar plan própria.

### Verificação da §8, saída real

| Comando | Saída |
|---|---|
| varredura de `sm:`/`md:`/`lg:`/`xl:`/`2xl:` nos 9 arquivos da §3.1 | **vazia** — o mecanismo trocou, não "melhorou" |
| `h-screen`/`max-h-screen` em `ThemeCustomizationTab.tsx` | só numa **linha de comentário** explicando o conserto |
| `npx vitest run` | **309 arquivos / 1222 testes, verde** |
| `npx tsc --noEmit` | **0** |
| `check-audit-baseline --with-tsc` | `igual ao baseline de 2026-08-11` |
| `auditor_hardcoded` | `[OK] Nenhum hardcoded detectado!` |
| `git diff --stat` | os 9 da §3.1 + o `.ts` novo + testes/snapshots. **`AtmosphereCatalog.tsx` NÃO foi tocado** (emenda §2.0 item 1) e **`PresetsCatalog.tsx` FOI** (item 2) — a emenda foi lida |

### O que está bem-feito, e não era óbvio

1. **A medida do `ResizeObserver` não é circular.** O nó observado (`:104-108`) é **irmão** do nó escalado,
   não ancestral nem descendente: os dois são `absolute inset-0` dentro do mesmo `DesignScope`. Medir o nó
   escalado realimentaria a escala. O comentário no código afirma isso e **o JSX confirma**.
2. **Degrada sem `ResizeObserver`** para exatamente a constante de antes (`0.75`/`0.95`), com teste próprio.
   Ninguém em SSR perde o número que já tinha.
3. **Uma fronteira `@container` só** em `PresetsCatalog.tsx:82` servindo os 4 sub-catálogos aninhados, em vez
   de uma por catálogo. Menos containment, mesmo resultado.

### Um critério meu que era impossível como escrito

A §7 pedia *"teste que monta o painel num container estreito (≤ 400px) e afirma **ausência de overflow**"*.
**jsdom não tem motor de layout** — `offsetWidth` é 0, nada transborda porque nada é diagramado. O critério
era inexequível como escrito; a culpa é minha, não do executor. O que foi entregue é o substituto honesto:
`PreviewSystemRenderer` com `ResizeObserver` fabricado a 320 px provando `scale(0.5)`, e contrato de classe
(`h-full`/`min-h-0`/`min-w-0`) nos outros dois. Overflow real só se prova em E2E com motor de layout —
**é isto que esta suíte não vê**, e fica declarado.

### 🔎 Achado — a CSS responsiva da lib é gerada por **arquivo de teste**

Não reprova esta plan (ver "por que não reprova" abaixo), mas é grave e precisa de plan própria.

**O mecanismo.** O scanner do Tailwind v4 é **textual** — não avalia JavaScript. Um preset escrito como
template literal com interpolação:

```ts
export const CATALOG_GRID_2COL = `grid-cols-1 @min-[${BREAKPOINT_TABLET}px]:grid-cols-2`;
```

produz, **no texto do arquivo**, a string `@min-[${BREAKPOINT_TABLET}px]:grid-cols-2` — que não é classe
válida e é descartada. A classe `@min-[768px]:grid-cols-2` **nunca é vista pelo scanner ali**.

**Prova 1 — o scanner é literal, e isso é demonstrável.** O `dist/sarak.css` construído contém:

```css
@container (width >= Npx) { .\@min-\[Npx\]\:flex-row { flex-direction: row; } }
```

`Npx` não é número. Essa regra existe porque a string `@min-[Npx]:` aparece **num comentário** de
`useStructuralStyles.presets.ts:6`. Se o scanner avaliasse JS, jamais produziria `Npx`.

**Prova 2 — quem realmente gera a CSS do painel.** Varredura de classe container-query **literal** em todo
`src/`, separando produção de teste:

- **produção** (`.ts`/`.tsx` fora de `__tests__`): **uma única ocorrência em todo o repositório** —
  `panelResponsive.presets.ts:22`, o `PREVIEW_DUAL_VIEW_ROW`, que o executor escreveu literal.
- **teste**: 7 arquivos, incluindo `useStructuralStyles.presets.test.ts:6-8`, que soletra
  `@min-[768px]:grid-cols-2`, `@min-[1024px]:grid-cols-3`, `@min-[1280px]:grid-cols-4`.

`@min-[1280px]:grid-cols-4` **existe no CSS construído** e é soletrado em **exatamente um lugar do
repositório: aquele arquivo de teste**. Nenhum arquivo de produção o escreve.

**Consequência.** Toda a grade responsiva da lib — inclusive a que esta plan acabou de ligar no painel —
tem CSS no pacote publicado **porque um `.test.ts` soletra as classes** e `@source "../**/*.{ts,tsx}"`
(`sarak-base.css:13`) varre `__tests__` junto. Reescrever aquele teste para usar interpolação (exatamente
como o teste novo desta plan já faz) apaga a CSS de produção. **Em silêncio**: a suíte fica verde, o
`auditor_hardcoded` fica verde, o `tsc` fica verde, e o painel só para de responder ao container.

**Por que não reprova esta plan.** O idioma é anterior a ela — `useStructuralStyles.presets.ts` (Spec 40.3)
já era assim, e a §3.1/§2.0 desta plan mandaram seguir esse idioma. O executor seguiu, documentou, e ainda
escreveu um dos três presets literal. Reprovar por um defeito sistêmico que a própria plan prescreveu seria
mudar a régua depois do jogo. O conserto certo é de escopo maior que este painel.

**O conserto, para a plan futura.** Presets responsivos guardam a classe **literal** e o teste companheiro
afirma a igualdade contra a forma interpolada (`toBe(\`…\${BREAKPOINT_TABLET}px…\`)`) — literal para o
scanner, interpolado para pegar deriva de constante. É o que `PREVIEW_DUAL_VIEW_ROW` + seu teste já fazem
neste mesmo arquivo; falta aplicar aos outros dois daqui e aos 5 de `useStructuralStyles.presets.ts`. Vale
também um gate: nenhuma classe `@min-[…]`/`@container` pode existir **só** em `__tests__`.

### Destino da síntese

Declarado na §9 e não executado por mim: [[06-painel-de-customizacao-e-preview]] §6.2 pode ir a
`✅ FECHADO`. Só por `spec-atualizar`, depois do commit do dono.

### ⚠️ Adendo ao achado — 2026-08-12, mesma sessão: **não é latente, está quebrado hoje**

Ao dimensionar o achado para virar plan, varri **todos** os sítios que montam classe container-query por
interpolação. São **14**, e a maioria **não é do painel** — é do `Shell` e da camada atômica. Conferi cada
classe contra o `dist/sarak.css` **publicado** (normalizando os escapes do seletor antes de comparar):

| Classe emitida no DOM | No CSS publicado? | Origem |
|---|---|---|
| `@min-[1024px]:flex` | ❌ **AUSENTE** | `core/Shell/Components/TopbarNav.tsx:114` |
| `@min-[768px]:flex-row` | ❌ **AUSENTE** | `useStructuralStyles.ts:96,229` |
| `@min-[768px]:grid-cols-12` · `@min-[768px]:columns-2` | ❌ **AUSENTE** | `useStructuralStyles.ts:40,42` |
| `@min-[1024px]:pt-12` · `:text-5xl` · `:px-8` · `@min-[640px]:px-6` | ❌ **AUSENTE** | `ShellContent.tsx:38,54` · `useShellLayoutStyles.ts:33` |
| `@min-[768px]:grid-cols-2` · `@min-[1024px]:grid-cols-3` | ✅ presente | só porque `useStructuralStyles.presets.test.ts:6-8` as soletra |

**O pior caso é visível e não é sutil.** `TopbarNav.tsx:114` renderiza
`hidden @min-[1024px]:flex …`. `.hidden{display:none}` **existe** no CSS publicado; `@min-[1024px]:flex`
**não existe**. Nada nunca revoga o `display:none`: com `navigationStyle: 'topbar'`, **a barra de navegação
de módulos nunca aparece, em largura nenhuma**. Confirmado: `BREAKPOINT_DESKTOP = 1024`
(`core/Design/breakpoints.ts:19`), sem `safelist` nem `@source inline` em lugar nenhum
(`sarak-base.css:13` é o único `@source`).

Mesma classe de falha, mais barata: `Stack` nunca vira linha (`useStructuralStyles.ts:96`), o layout
`col-12` nunca vira 12 colunas, `masonry` nunca passa de 1 coluna, e os paddings/tipografia do
`ShellContent` ficam no valor de telefone em qualquer largura.

**Isto continua não reprovando a `plan-35`** — as duas classes que o painel passou a usar
(`@min-[768px]:grid-cols-2`, `@min-[1024px]:grid-cols-3`) estão presentes, e a terceira ele escreveu
literal. O painel funciona. O que a verificação desta plan descobriu é que **a Spec 40.3
("multidispositivo por padrão") está, na prática, desligada no pacote publicado** fora do painel.

Isso muda a prioridade da plan futura de "higiene" para **conserto de defeito ativo**, e ela deveria vir
antes da `plan-36`/`plan-37`.
