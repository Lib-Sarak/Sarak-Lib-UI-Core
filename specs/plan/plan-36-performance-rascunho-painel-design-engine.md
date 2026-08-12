---
tipo: "plan"
titulo: "Parar de recomputar o dicionário de tokens inteiro a cada tecla no painel Design Engine"
dominio: "Sarak-Lib-UI-Core / Design Engine / Painel"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "painel", "performance", "rascunho", "memoizacao"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[02-design-engine]]"]
depende_de: "plan-35"
destino_sintese: "specs/specs/06-painel-de-customizacao-e-preview.md"
objetivo: "Arrastar um slider ou digitar num controle do painel não recomputa o dicionário inteiro de tokens nem duplica estado de rascunho"
---

# 1. Objetivo

Mexer em qualquer controle do painel de customização (slider, cor, texto) atualiza o preview sem travar a UI
— o dicionário inteiro de tokens deixa de ser reconstruído do zero a cada tecla, e existe **uma única** fonte
de estado de rascunho, não duas.

# 2. Contexto

**Depende da `plan-35`** (layout) por tocarem os mesmos arquivos — evita conflito de merge, não porque haja
dependência funcional entre as duas.

## 2.0 🔧 EMENDA DE ESCOPO — 2026-08-12, antes de qualquer execução

Ao conferir esta plan contra o código **antes de liberá-la**, o revisor mediu cada `arquivo:linha`. Três
premissas não se sustentam como escritas, e **uma delas manda o executor atrás de um alvo que não existe**.
A emenda fica aqui, no corpo, pelo mesmo motivo da `plan-28` §2.0 e da `plan-30` §2.0.

| # | O que a plan afirmava | O que a medição de 2026-08-12 responde | Efeito |
|---|---|---|---|
| 1 | *"`computeColorVariants` roda duas vezes — uma em `PreviewCanvas.tsx:130`, outra em `PreviewSystemRenderer.tsx:70`"* | `grep -rn "computeColorVariants" src/` → **5 arquivos, e nenhum deles é do painel**: só `useDesignVariables.ts:121` e `manifest.ts`. **Nos dois arquivos citados a função não aparece** | 🔴 **alvo inexistente — reescrito abaixo** |
| 2 | `Main/components/controls/BasicControls.tsx` | mora em `src/features/DesignEngine/components/controls/BasicControls.tsx` (sem `Main/`) | caminho corrigido |
| 3 | `Canvas/PreviewSystemRenderer.tsx` | mora em `Canvas/components/PreviewSystemRenderer.tsx` | caminho corrigido |
| 4 | *"o dicionário de ~572 tokens"* | são **422** (`auditor_paridade` → 422/422/422). E a cifra não devia estar aqui: é o **achado 32** reincidindo dentro de uma plan | cifra sai; o texto afirma a relação |

### 🔴 O item 1, em detalhe — a conclusão está certa, o mecanismo estava errado

**O cálculo de variantes de cor de fato roda duas vezes por atualização.** O que a plan errou foi *como*:

- `PreviewCanvas.tsx:130` monta um **`DesignScope`** com o rascunho;
- `Canvas/components/PreviewSystemRenderer.tsx:71` monta **outro `DesignScope`**, aninhado dentro do
  primeiro, com o mesmo design;
- **cada `DesignScope` roda o próprio `useDesignVariables`** ([[02-design-engine]] §6), e é *lá dentro*, em
  `useDesignVariables.ts:121`, que `computeColorVariants` é chamado — uma vez por token de cor com
  `generateVariants`, por escopo.

Ou seja: o dobro de trabalho vem de **dois `DesignScope` aninhados**, não de duas chamadas diretas. Um
executor que procurasse `computeColorVariants` nos dois arquivos não acharia nada e ficaria sem alvo.

⚠️ **E isso muda o conserto.** Memoizar "a geração de variantes" nos dois `.tsx` não é possível — não há o
que memoizar ali. As saídas legítimas são outras, e a escolha é do executor **com medição**: eliminar o
aninhamento, `React.memo` no componente que carrega o `DesignScope` interno, ou memoizar dentro do próprio
`useDesignVariables`. ⛔ **A terceira toca `src/core/` e está FORA do escopo desta plan** (§3.2) — se a
medição indicar que é a única saída, **pare e relate**.

> **A lição, e é a mesma da `plan-35`:** eu escrevi o alvo a partir do **sintoma medido** (o cálculo roda
> duas vezes) e **presumi a causa** sem abrir os arquivos. Sintoma medido não é causa medida.

Investigação no código, **com os `arquivo:linha` já corrigidos pela emenda**:

- `src/features/DesignEngine/components/controls/BasicControls.tsx:32` — `onChange` dispara
  `updateDraft` a cada pixel arrastado do slider, sem debounce.
- `src/features/DesignEngine/hooks/useDesignDraft.ts:141-146` — cada evento chama `setDraftState`, que
  propaga para `PreviewCanvas.tsx:62`, onde `tokens` é recomputado via `useMemo` com dependência em
  `draftTokens` — um **objeto novo a cada evento**, então o `useMemo` nunca acerta cache.
- `src/core/Design/master-map.ts:74-76` — `getAllDesignTokens()` **não é memoizado**: é um `flatMap` que
  recria a lista inteira de tokens (achatados de 28 schemas) a cada chamada.
- **O cálculo de variantes de cor roda duas vezes por atualização** — dois `DesignScope` aninhados
  (`PreviewCanvas.tsx:130` + `Canvas/components/PreviewSystemRenderer.tsx:71`), cada um com o seu
  `useDesignVariables`. Ver a emenda §2.0 antes de escolher o conserto. **Nenhum dos dois componentes é
  `React.memo`.**
- `src/features/DesignEngine/Main/MasterControlPanel.tsx:22` — instancia `useDesignDraft(sarak)` **de novo**,
  paralelo ao de `ThemeCustomizationTab.tsx:65-76` — dois estados de rascunho independentes, cada um com seus
  próprios `useEffect`s de sincronização.
- `src/features/DesignEngine/hooks/useDesignDraftSync.ts:17-18,29-30` — dois `useEffect` fazem
  `JSON.stringify(draftState)` vs `JSON.stringify(sarak.draftDesign)` em **todo** render do rascunho (objeto
  com ~500+ chaves), e chamam `sarak.setDraftDesign(draftState)` quando diferem, propagando a mudança para o
  Provider raiz e re-renderizando todo consumidor de `useSarakUI()`.
- `src/features/DesignEngine/Canvas/hooks/usePreviewApps.tsx:12-31` — recria os 13 elementos de mock apps a
  cada keystroke (dependência em `tokens`).

**O que esta plan NÃO pode fazer:** mudar o comportamento observável do rascunho. O preview continua
refletindo o rascunho ao vivo, campo a campo — só a **eficiência** de como isso acontece muda.

# 3. Escopo

## 3.1 Dentro
- `src/features/DesignEngine/components/controls/BasicControls.tsx` — o input permanece controlado
  localmente (feedback visual instantâneo), mas a propagação para `updateDraft` passa a ser debounced
  (~100–150ms, valor a justificar no resumo).
- `src/core/Design/master-map.ts` — memoizar `getAllDesignTokens()` (é estático em runtime: os schemas não
  mudam depois do build, então um cache module-level, calculado uma vez, é seguro). **É a única exceção à
  linha vermelha de `src/core/`**, e está autorizada nominalmente.
- `src/features/DesignEngine/Canvas/PreviewCanvas.tsx` e `Canvas/components/PreviewSystemRenderer.tsx` —
  **cortar a duplicação do cálculo de variantes de cor**, que hoje nasce de **dois `DesignScope` aninhados**
  (emenda §2.0), não de duas chamadas diretas. O caminho é do executor, **com medição antes e depois**;
  `React.memo` nos componentes é a hipótese mais barata a testar primeiro.
- `src/features/DesignEngine/Main/MasterControlPanel.tsx` — remover a instância paralela de `useDesignDraft`
  (`:22`); consumir o rascunho já existente de `ThemeCustomizationTab` via prop/contexto.
- `src/features/DesignEngine/hooks/useDesignDraftSync.ts` — trocar a comparação por `JSON.stringify` a cada
  render por uma estratégia mais barata (comparação rasa nas chaves que mudaram, ou um `dirty` flag setado no
  próprio `setDraftState`).
- `src/features/DesignEngine/Canvas/hooks/usePreviewApps.tsx` — revisar se a recriação dos 13 mocks a cada
  keystroke é evitável (memoizar o que não depende do token que mudou).
- Testes de regressão que **medem** a queda (contagem de chamadas de `getAllDesignTokens`/renders, via spy ou
  contador), não só "parece mais rápido".

## 3.2 Fora
- ⛔ **Layout/CSS** — já foi a `plan-35` (que roda antes, por isso a dependência).
- ⛔ Mudar o schema de tokens ou `master-map.ts` além da memoização pontual.
- ⛔ Mudar o comportamento observável do rascunho — preview ao vivo continua idêntico, só mais rápido.
- ⛔ `src/core/Provider/` — é a `plan-34`.
- ⛔ **`src/core/Design/hooks/useDesignVariables.ts` e `src/core/Design/components/DesignScope.tsx`.** São a
  terceira saída possível para a duplicação de variantes (emenda §2.0), e são **motor**, não painel: mexer
  ali muda o comportamento de **todo consumidor**, inclusive fora do preview. Se a medição mostrar que é a
  única saída, **pare e relate** — vira plan própria, com o alcance decidido antes.
- ⛔ O modo essencial/`HyperGranularityTab` — é a `plan-37`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §4 (Draft × persistido) | o contrato de comportamento que não pode mudar |
| Spec fixa | `specs/arquitetura/02-design-engine.md` §5 (Drafting) | os dois canais (`applyConfig`/`applyConfigRaw`) — não confundir ao mexer no fluxo |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R9 · R8 | limiares de Clean Code; teste ao lado |
| **Skill** | `padrao-escrita` · `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | regressão de comportamento e de performance medida |
| Código | `src/features/DesignEngine/hooks/useDesignDraft.ts`, `useDesignDraftSync.ts` | ler o mecanismo completo antes de tocar — é estado compartilhado com o Provider raiz |

# 5. Instruções de execução

1. **Antes de qualquer refactor, capture a linha de base.** Instrumentar (temporariamente, ou via teste com
   spy) quantas vezes `getAllDesignTokens()` e `computeColorVariants` rodam para **uma** interação de slider
   (um `onChange`). ⚠️ **O spy de `computeColorVariants` vai em
   `src/core/Provider/utils/color-engine.ts`** — é de lá que `useDesignVariables.ts:4` o importa; nos
   arquivos do painel ele não aparece (emenda §2.0). Declarar os dois números no resumo — é o "antes" que
   prova o "depois".
2. **Debounce em `BasicControls.tsx:32`.** O valor exibido no controle continua atualizando local e
   instantaneamente (estado do próprio input); só a chamada a `updateDraft` (que dispara a cascata) é
   debounced.
3. **Memoizar `getAllDesignTokens()`** em `master-map.ts` — cache module-level, calculado uma vez. Cuidado:
   confirmar que nenhum teste depende de re-execução por chamada (ex.: mock de schema mudando em runtime de
   teste) — se depender, isolar com uma função de reset exportada só para teste.
4. **Cortar a duplicação de variantes de cor** entre os dois `DesignScope` aninhados
   (`PreviewCanvas.tsx:130` × `Canvas/components/PreviewSystemRenderer.tsx:71`). **Meça primeiro qual dos
   dois escopos é redundante** — se o interno herda o mesmo design do externo, o trabalho é literalmente
   feito duas vezes. Documente a escolha e prove a queda com o spy do passo 1. **Não toque no motor**
   (§3.2).
5. **Remover a instância duplicada de `useDesignDraft`** em `MasterControlPanel.tsx:22` — o componente passa
   a receber o rascunho de `ThemeCustomizationTab` (prop ou contexto, a critério do executor, documentando a
   escolha).
6. **Revisar `useDesignDraftSync.ts:17-18,29-30`** — trocar `JSON.stringify` por comparação mais barata.
   ⚠️ **Não pule a checagem que evita loop de render** ([[02-design-engine]] §3.1 documenta um loop infinito
   real que já aconteceu nesta base por causa de referência instável — leia antes de mexer aqui).
7. **Medir o "depois"** com a mesma instrumentação do passo 1 e declarar a queda no resumo, em número.
8. **Fechar.** Rodar, nesta ordem, e colar a saída real no resumo: `npx vitest run` (INTEIRA) ·
   `node gates/scripts/audit/run_audit.mjs` ·
   `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` · `npx tsc --noEmit` · `git diff --stat`.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-36-performance-rascunho-painel-design-engine.md.

Pré-requisito: a plan-35 tem de estar 🟢 Aprovada (mesmos arquivos de área, evita
conflito).

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/06-painel-de-customizacao-e-preview.md §4 (draft × persistido — o contrato
que NÃO pode mudar), specs/arquitetura/02-design-engine.md §5 (drafting) e §3.1 (o loop
infinito real que já aconteceu aqui — leia antes de mexer em useDesignDraftSync).
Skills a aplicar: padrao-escrita, padrao-typescript, test-unitario.

⚠️ A plan foi EMENDADA em 2026-08-12 (§2.0), ANTES de qualquer execução. LEIA A §2.0
PRIMEIRO: computeColorVariants NÃO existe nos arquivos do painel — a duplicação vem de
dois DesignScope ANINHADOS. Dois caminhos de arquivo também estavam errados.

MEÇA ANTES DE OTIMIZAR: capture quantas vezes getAllDesignTokens() e computeColorVariants
rodam para UMA interação de slider, ANTES de tocar em qualquer arquivo. O spy de
computeColorVariants vai em src/core/Provider/utils/color-engine.ts. Declare os números no
resumo. Meça de novo DEPOIS e declare a queda.

LINHAS VERMELHAS:
  · Você NÃO muda o comportamento observável do rascunho — o preview reflete o draft ao
    vivo, campo a campo, exatamente como hoje. Só a eficiência muda.
  · Você NÃO mexe em layout/CSS (já foi a plan-35).
  · Você NÃO mexe em src/core/Provider/ (plan-34) nem no modo essencial (plan-37).
  · Você NÃO mexe em useDesignVariables.ts nem em DesignScope.tsx — é MOTOR, e mexer ali
    muda o comportamento de todo consumidor. Se a medição disser que é a única saída para
    a duplicação, PARE E RELATE.
  · A ÚNICA exceção autorizada em src/core/ é memoizar getAllDesignTokens() em
    master-map.ts.
  · Cuidado especial em useDesignDraftSync.ts: já houve um loop de render infinito real
    nesta base por referência instável (02-design-engine.md §3.1). Não reintroduza a
    classe do bug ao "otimizar" a comparação.

Todo conserto leva teste ao lado (R8), incluindo teste de regressão que mede a queda de
recomputação, não só "está mais rápido".

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] Número de chamadas de `getAllDesignTokens()` **e** de `computeColorVariants` por interação de slider
      **medido antes e depois**, com queda evidenciada.
- [ ] O cálculo de variantes de cor deixa de rodar duas vezes por atualização — **e o resumo declara qual
      dos dois `DesignScope` era o redundante** (emenda §2.0), não só que "ficou memoizado".
- [ ] `MasterControlPanel.tsx` não instancia `useDesignDraft` própria — consome a de `ThemeCustomizationTab`.
- [ ] `useDesignDraftSync.ts` não faz `JSON.stringify` de objeto inteiro em todo render.
- [ ] **Nenhuma mudança de comportamento observável do rascunho** — suíte existente de `useDesignDraft`,
      `DesignScope`, `PreviewCanvas` continua verde sem alteração de expectativa.
- [ ] Nenhum sinal de loop de render reintroduzido — suíte roda no tempo normal, sem travar.
- [ ] `npx vitest run` inteira, verde, não encolheu.
- [ ] `run_audit` sem regressão; `npx tsc --noEmit` → 0 erros.
- [ ] `git diff --stat` — só os arquivos de §3.1 (mais os testes correspondentes).

# 8. Como verificar (uso do revisor)

```bash
git diff --stat
git diff
npx vitest run
node gates/scripts/audit/run_audit.mjs
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npx tsc --noEmit
```

O resumo tem de trazer **dois números** — chamadas de `getAllDesignTokens()`/interação antes e depois — e
eles têm de ter sido medidos de verdade (spy/contador reproduzível), não estimados. Alegação de performance
sem medição reprova, na mesma régua da [[01-gates-e-baseline]] §6.1 (*"baseline que melhora sem conserto
correspondente é fraude"*, aqui aplicado a "mais rápido sem número é alegação vazia").

# 9. Destino da síntese

**Destino:** `specs/specs/06-painel-de-customizacao-e-preview.md`

**Texto pronto para transporte:** nova seção descrevendo o modelo de performance do rascunho — instância
única de `useDesignDraft`, `getAllDesignTokens()` memoizado, debounce no commit de slider — com os números
medidos (antes×depois) como evidência, não como afirmação solta.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
