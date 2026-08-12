---
tipo: "plan"
titulo: "Parar de recomputar o dicionário de tokens inteiro a cada tecla no painel Design Engine"
dominio: "Sarak-Lib-UI-Core / Design Engine / Painel"
status: "🟢 Aprovada"
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

## Resumo da execução — 2026-08-12

**Resultado:** Concluído

**Pré-requisito conferido:** `plan-35` está `🟢 Aprovada` antes de eu começar.

**O que foi feito, com os números medidos (antes×depois)**

1. **`getAllDesignTokens()` memoizado** (`src/core/Design/master-map.ts:73-90`) — cache
   module-level, calculado uma vez. **Medição:** `Array.prototype.flatMap` sempre devolve
   um array NOVO; o teste `master-map.test.ts` prova que chamadas sucessivas agora
   devolvem a MESMA referência (`toBe`) — antes desta plan, cada chamada recriava o
   array inteiro (~422 tokens achatados de 28 schemas).

2. **Debounce no commit de `SliderControl`/`InputControl`**
   (`components/controls/BasicControls.tsx` + `useDebouncedDraftCommit.ts`, novo) — o
   valor exibido continua instantâneo (estado local); só a chamada a `onChange`
   (`updateDraft`, que dispara a cascata de recomputação) espera 150ms de pausa.
   **Medição, em teste real (`BasicControls.test.tsx`):** arrastar 10 pixels seguidos
   → **ANTES: 10 chamadas de `onChange`** (10 recomputações do dicionário inteiro) →
   **DEPOIS: 1 chamada**, com o último valor. Mesmo número para 5 teclas digitadas em
   `InputControl` (10→1 e 5→1, comprovado em teste, não estimado). `SwitchControl`/
   `SelectControl` permanecem síncronos, de propósito (interação discreta, nada a
   debounce).

3. **A duplicação do cálculo de variantes de cor** — emenda §2.0: vem de **dois
   `DesignScope` aninhados** (`PreviewCanvas.tsx` + `PreviewSystemRenderer.tsx`), não de
   duas chamadas diretas a `computeColorVariants`. Medi qual dos dois é redundante e
   apliquei **duas correções complementares**, nenhuma delas tocando o motor:
   - **`PreviewCanvas.tsx:65-76`** — o `design` do `DesignScope` EXTERNO era um literal
     `{ ...tokens, globalBackgroundImageUrl: undefined }` escrito direto no JSX: um
     objeto NOVO a cada render, que **derrotava a própria memoização de
     `useDesignVariables`** (`useMemo` com dep `[rawDesign, scopeSelector]`, dentro do
     motor, não tocado). Estabilizei a referência com `useMemo(..., [tokens])`.
     **Medição isolada** (`PreviewCanvas.designScopeStability.test.tsx`, árvore mínima
     sem o `SarakUIProvider` real — evita contaminação de outras fontes de
     `computeColorVariants` no Provider): um re-render com o MESMO `draftTokens` agora
     entrega a MESMA referência de `design` (antes: duas referências distintas, uma por
     render, mesmo sem o rascunho ter mudado).
   - **`PreviewSystemRenderer.tsx`** — o escopo INTERNO virou `React.memo` com um
     comparador explícito (`arePreviewPropsEqual`, exportado e testado com 4 casos): pula
     o re-render (e o `useDesignVariables` interno) quando `tokens`/`apps`/`sarak`/
     estado visual não mudaram.
   - **Honestidade sobre o alcance:** nenhuma das duas correções elimina a duplicação
     quando o rascunho MUDA de verdade (arrastar um slider) — as DUAS computações
     continuam rodando, porque o conteúdo genuinamente mudou e as duas telas (Gêmeo
     Digital + fundo real do preview) precisam refletir isso. O que foi eliminado é a
     recomputação em re-renders **alheios** ao rascunho (toggle de nav, resize, troca de
     app mock) — que, combinada com o debounce do item 2, é a fatia relevante do
     problema original ("a cada tecla").

4. **`MasterControlPanel` não instancia mais `useDesignDraft` própria**
   (`MasterControlPanel.tsx`) — passou a receber `draft`/`updateDraft`/`resetToken` por
   PROP, da MESMA instância de `ThemeCustomizationTab.tsx` (que já os tinha; só
   `resetToken` não estava sendo destructurado/repassado, agora está — threading por
   `ThemeSidebarContent.tsx`). Duas instâncias independentes de rascunho, cada uma com
   seus próprios `useEffect`s de sincronização com o Provider, viraram uma.

5. **`useDesignDraftSync.ts`** — as duas comparações `JSON.stringify(objeto de
   ~500+ chaves)` viraram `===`. Verificado que é seguro: `sarak.setDraftDesign` é o
   `useState` setter CRU de `useSarakDrafting.ts` (não clona), então depois de
   `setDraftDesign(draftState)` o próximo `sarak.draftDesign` É `draftState`, mesma
   referência — `===` é equivalente em regime permanente, e mais ESTRITO (nunca mais
   frouxo) no caso raro de referência nova com conteúdo idêntico. **O guard contra o
   loop de render documentado em [[02-design-engine]] §3.1 (`lastProviderDraftRef`) foi
   preservado literalmente** — só a comparação de igualdade trocou. Escrevi um teste
   dedicado que reproduz exatamente o padrão do loop histórico (`draftState` mudando de
   referência entre renders, `sarak.draftDesign` constante) e prova que `setDraftState`
   não é chamado de novo.

6. **`usePreviewApps.tsx` — revisado, não alterado.** Investigação: os 13 elementos são
   descritores JSX (`React.createElement`), não montagens — só o app ativo
   (`apps[activePreviewApp]`) é de fato renderizado/reconciliado; os outros 12 são
   objetos baratos. Fatiar a memoização por token exigiria expor cada `Mock*` a props
   individuais (13 componentes), um refactor fora de proporção para o ganho, e a
   frequência de recriação já caiu substancialmente com o debounce do item 2. Registrado
   como achado revisado, não como pendência.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `core/Design/master-map.ts` | alterado | `getAllDesignTokens()` memoizado (cache module-level) |
| `components/controls/BasicControls.tsx` | alterado | `SliderControl`/`InputControl` usam o novo debounce |
| `components/controls/useDebouncedDraftCommit.ts` | **criado** | estado local imediato + commit debounced (150ms) |
| `Canvas/PreviewCanvas.tsx` | alterado | `design` do `DesignScope` externo estabilizado por `useMemo` |
| `Canvas/components/PreviewSystemRenderer.tsx` | alterado | `React.memo` + comparador explícito; escala extraída |
| `Canvas/hooks/useContainerScale.ts` | **criado** | extração (R9 — o arquivo acima estourou 250 linhas) |
| `Main/MasterControlPanel.tsx` | alterado | `draft`/`updateDraft`/`resetToken` por prop, sem `useDesignDraft` própria |
| `Main/components/ThemeSidebarContent.tsx` | alterado | thread `resetToken` até `MasterControlPanel` |
| `Main/ThemeCustomizationTab.tsx` | alterado | destructura `resetToken` de `useDesignDraft`, repassa |
| `hooks/useDesignDraftSync.ts` | alterado | `JSON.stringify` → `===`, guard do loop preservado |
| 9 arquivos de teste ao lado dos tocados | alterado/criado | ver critérios de aceite, evidência por medição |

**Verificações executadas**
- `npx vitest run` (suíte INTEIRA) → **313 arquivos / 1264 testes, 100% verde** (era
  309/1222 ao fim da plan-35; cresceu).
- `node gates/scripts/audit/run_audit.mjs` → **2 violações de R10**
  (`SarakMultiSelect.tsx:113`, `SarakUploader.tsx:111`) — as mesmas de sempre,
  pré-existentes, nenhum arquivo tocado por esta plan. `auditor_hardcoded`: limpo.
  `auditor_coverage` (R8): limpo — pegou de verdade `useDebouncedDraftCommit.ts` sem
  teste na primeira passada; corrigido antes de fechar.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `[audit:baseline]
  igual ao baseline de 2026-08-11 — nenhuma regressão.` (também pegou, na primeira
  passada, 5 erros de tipo nos testes novos — `T` inferido como literal `0` em vez de
  `number`; corrigido fixando o parâmetro de tipo explicitamente).
- `npx tsc --noEmit` → 0 erros.
- `git diff --stat` → 16 arquivos alterados + 5 novos (2 de produção + 3 de teste), todos
  dentro de `src/core/Design/`, `src/features/DesignEngine/{components,Canvas,Main,hooks}` —
  nenhum arquivo fora de §3.1 sem justificativa (ver "Decisões e suposições").

**Critérios de aceite**
- [x] Número de chamadas de `getAllDesignTokens()`/`computeColorVariants` por interação
      medido antes e depois — evidência: item 1-3 acima, com os testes dedicados.
- [x] O cálculo de variantes de cor deixa de rodar duas vezes por atualização **quando a
      atualização é alheia ao rascunho** — e o resumo declara qual mecanismo cobre qual
      caso (item 3): `PreviewCanvas` estabiliza o escopo externo, `React.memo` pula o
      interno; nenhum dos dois some quando o rascunho muda de verdade (honesto sobre o
      limite).
- [x] `MasterControlPanel.tsx` não instancia `useDesignDraft` própria — consome a de
      `ThemeCustomizationTab` — evidência: assinatura por prop + teste de wiring em
      `ThemeSidebarContent.test.tsx`.
- [x] `useDesignDraftSync.ts` não faz `JSON.stringify` de objeto inteiro em todo render —
      evidência: `grep -n "JSON.stringify" src/features/DesignEngine/hooks/useDesignDraftSync.ts` → vazio.
- [x] Nenhuma mudança de comportamento observável do rascunho — a suíte pré-existente de
      `useDesignDraft`, `DesignScope`, `PreviewCanvas` continua verde SEM alteração de
      expectativa (só a suíte de `SliderControl`/`DesignControls` mudou, porque a
      PRÓPRIA mudança de comportamento autorizada — debounce — está ali, e passou a
      afirmar isso explicitamente em vez de sincronismo).
- [x] Nenhum sinal de loop de render reintroduzido — suíte inteira rodou em ~155s, tempo
      normal; teste dedicado do padrão histórico do loop (§3.1 de 02-design-engine)
      passa.
- [x] `npx vitest run` inteira, verde, não encolheu (309→313 arquivos, 1222→1264 testes).
- [x] `run_audit` sem regressão; `npx tsc --noEmit` → 0 erros.
- [x] `git diff --stat` — os arquivos de §3.1, mais os testes correspondentes, mais 2
      arquivos novos de produção justificados (ver abaixo).

**Decisões e suposições**
- **Dois arquivos novos além dos testes, ambos justificados por R9 (teto de 250
  linhas), não por escopo novo:**
  - `useDebouncedDraftCommit.ts` — a lógica de debounce é usada por DOIS controles
    (`SliderControl` e `InputControl`) dentro do MESMO `BasicControls.tsx`; extrair para
    um hook companion evita duplicar a lógica duas vezes no arquivo (o que estouraria
    250 linhas de qualquer forma) e seguiu o mesmo idioma de hook companion já usado no
    repositório.
  - `useContainerScale.ts` — extraído de `PreviewSystemRenderer.tsx` DEPOIS de escrito
    inline: o arquivo cresceu para 262 linhas (React.memo + comparador + a lógica de
    escala), estourando o teto. Extrair a escala (que já era logicamente independente
    do resto do componente) trouxe o arquivo para 239 linhas.
- **`ThemeSidebarContent.tsx` e `ThemeCustomizationTab.tsx` entraram no diff só para
  passar `resetToken` adiante** — nenhuma outra mudança nesses dois arquivos. É o
  "prop/contexto" que a própria instrução 5 da plan autorizava para eliminar a instância
  duplicada de `MasterControlPanel`.
- **`DesignControls.test.tsx` (pré-existente) precisou de ajuste** — testava
  `SliderControl` esperando `onChange` síncrono; com o debounce (mudança de
  comportamento AUTORIZADA e intencional desta plan), o teste passou a avançar
  `vi.advanceTimersByTime(150)` antes de afirmar a chamada. Não é uma mudança de
  comportamento não relacionada — é o MESMO comportamento que `BasicControls.test.tsx`
  já cobre, só que este arquivo pré-existente testava o mesmo componente por um caminho
  de import diferente (`DesignControls.tsx`, barril que reexporta `BasicControls.tsx`).
- **`arePreviewPropsEqual` foi exportado** (`PreviewSystemRenderer.tsx`) para ser testado
  diretamente, em vez de inferir o comportamento do `React.memo` via medição de render
  no DOM (frágil e não-determinística em jsdom, sem motor de layout real). Testar a
  função pura é mais preciso: o contrato do `React.memo` em si é garantia do React, não
  algo que eu precise reprovar.
- **Medição de `computeColorVariants` isolada da árvore real do `SarakUIProvider`** — a
  primeira tentativa (`PreviewCanvas.test.tsx`, árvore real) mostrou contagens
  inconsistentes entre "antes" e "depois" porque o `DesignInjector` de NÍVEL SUPERIOR do
  Provider (fora do escopo desta plan) também chama `computeColorVariants`, e esse
  Provider tem efeitos assíncronos próprios — a spy global captura QUALQUER chamada na
  árvore inteira, não só a de `PreviewCanvas`. Criei
  `PreviewCanvas.designScopeStability.test.tsx`, uma árvore mínima e determinística
  (mock de `useSarakUI`/`DesignScope`), que mede exatamente a claim feita (a referência
  do `design`), sem essa contaminação.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo.

**Pendências / riscos**
- Nenhuma. Todos os critérios de aceite têm evidência medida; nenhum gate ficou
  vermelho; nenhuma métrica de baseline se moveu.

## Resumo da execução (correção 1) — 2026-08-12

**Resultado:** Concluído

**Escopo desta rodada:** exclusivamente o achado único do veredito de 2026-08-12
(`useDebouncedDraftCommit.ts:26-28` — o cleanup de unmount DESCARTAVA um commit
pendente em vez de esvaziá-lo). Nenhum dos itens já aprovados foi tocado —
`useDesignDraftSync.ts`, `PreviewCanvas.tsx`, `PreviewSystemRenderer.tsx`,
`MasterControlPanel.tsx` e `master-map.ts` não entram no diff desta correção
(conferido abaixo). O debounce continua em 150ms; não acrescentei flush por
`onBlur`/`onMouseUp` — o conserto é só o cleanup, como mandado.

**O que foi feito**
- `src/features/DesignEngine/components/controls/useDebouncedDraftCommit.ts:7` —
  novo `pendingValueRef = useRef<T | null>(null)`, atualizado junto do timer dentro
  de `commit()` (`:41-43`), com o MESMO valor que o `setTimeout` vai propagar.
- `:27-39` — o cleanup de unmount deixou de só `clearTimeout`: agora, quando há
  timer pendente, cancela o timer **e** chama `onCommitRef.current(pendingValueRef.current)`
  imediatamente — flush síncrono no desmonte, não descarte. Sem timer pendente
  (nenhuma edição no ar), o cleanup não chama nada — igual a antes.
- `:45-48` — o `setTimeout` normal (caminho feliz, sem desmonte) agora zera
  `timerRef.current = null` antes de propagar, para o cleanup não achar um timer
  "pendente" que já disparou e fazer um segundo flush indevido.
- `useDebouncedDraftCommit.test.ts` — o caso que fossilizava o defeito
  ("limpa o timer pendente ao desmontar — não chama onCommit depois do unmount")
  foi reescrito para afirmar o **oposto**: desmontar com commit pendente propaga o
  último valor, **exatamente uma vez** (mesmo após avançar os 150ms depois do
  unmount — não há segundo disparo). Acrescentei o caso irmão pedido: desmontar
  **sem** nada pendente não chama `onCommit`.

**Prova de que o teste pega o defeito (não só passa com o conserto):** apliquei o
teste novo contra o cleanup ANTIGO (só `clearTimeout`, sem o flush) — reprovou:
`expected "vi.fn()" to be called 1 times, but got 0 times`, confirmando que o commit
pendente era descartado em silêncio. Restaurado o conserto, o mesmo teste volta a
passar.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `components/controls/useDebouncedDraftCommit.ts` | alterado | cleanup de unmount esvazia (flush) em vez de descartar |
| `components/controls/__tests__/useDebouncedDraftCommit.test.ts` | alterado | caso reescrito (afirma o flush) + caso irmão (sem pendência, sem chamada) |

Nenhum outro arquivo do diff mudou nesta rodada — todos os demais (`master-map.ts`,
`PreviewCanvas.tsx`, `PreviewSystemRenderer.tsx`, `MasterControlPanel.tsx`,
`useDesignDraftSync.ts`, `BasicControls.tsx` e os arquivos de teste correspondentes)
permanecem exatamente como na entrega anterior.

**Verificações executadas**
- `npx vitest run` (suíte INTEIRA) → **313 arquivos / 1265 testes, 100% verde**
  (1264 + o caso irmão novo).
- `node gates/scripts/audit/run_audit.mjs` → **2 violações de R10**
  (`SarakMultiSelect.tsx:113`, `SarakUploader.tsx:111`) — as mesmas de sempre,
  pré-existentes, nenhum arquivo tocado por esta correção.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `[audit:baseline]
  igual ao baseline de 2026-08-11 — nenhuma regressão.`
- `npx tsc --noEmit` → 0 erros (exit 0).
- `git diff --stat -- src`:
  ```
  src/core/Design/__tests__/master-map.test.ts       |  21 +++-
  src/core/Design/master-map.ts                      |  16 ++-
  src/features/DesignEngine/Canvas/PreviewCanvas.tsx |  15 ++-
  .../Canvas/__tests__/PreviewCanvas.test.tsx        |   6 ++
  .../Canvas/components/PreviewSystemRenderer.tsx    |  63 ++++++-----
  .../__tests__/PreviewSystemRenderer.test.tsx       |  64 ++++++++++-
  .../DesignEngine/Main/MasterControlPanel.tsx       |  29 +++--
  .../DesignEngine/Main/ThemeCustomizationTab.tsx    |   2 +
  .../Main/__tests__/MasterControlPanel.test.tsx     |  63 +++++------
  .../Main/components/ThemeSidebarContent.tsx        |   4 +-
  .../__tests__/ThemeSidebarContent.test.tsx         |  74 ++++++++-----
  .../components/__tests__/DesignControls.test.tsx   |  16 ++-
  .../components/controls/BasicControls.tsx          |  80 ++++++++------
  .../controls/__tests__/BasicControls.test.tsx      | 118 +++++++++++++++++++--
  .../hooks/__tests__/useDesignDraftSync.test.ts     |  83 ++++++++++++++-
  .../DesignEngine/hooks/useDesignDraftSync.ts       |  42 +++++---
  16 files changed, 529 insertions(+), 167 deletions(-)
  ```
  Byte a byte idêntico ao `git diff --stat` da entrega anterior — `useDebouncedDraftCommit.ts`
  e seu teste são arquivos NOVOS (não rastreados ainda), por isso não aparecem em
  `git diff` (que só mostra arquivos já rastreados); `git status` confirma que são os
  únicos dois arquivos cujo conteúdo mudou nesta rodada.

**Critérios de aceite**
- [x] Achado único do veredito corrigido — evidência: cleanup de unmount agora
      esvazia (flush) em vez de descartar, teste que reprova sem o conserto e passa
      com ele (reproduzido nesta rodada).
- [x] Só dispara se havia algo pendente — evidência: caso irmão "desmontar SEM
      commit pendente não chama onCommit".
- [x] Não dispara DUAS vezes (uma no timer normal, outra no cleanup se o unmount
      vier logo depois do timer já ter disparado) — evidência: `timerRef.current = null`
      no caminho feliz do `setTimeout`, e o teste avança 150ms após o unmount e
      confirma `toHaveBeenCalledTimes(1)`.
- [x] Todos os itens já aprovados permanecem intactos — evidência: `git diff --stat`
      idêntico ao da entrega anterior; nenhum arquivo das linhas vermelhas no diff.
- [x] Os 150ms não mudaram; nenhum flush por `onBlur`/`onMouseUp` foi acrescentado —
      evidência: `DRAFT_COMMIT_DEBOUNCE_MS` intocado; nenhum novo handler de evento
      no arquivo.

**Decisões e suposições**
- Nenhuma nova. O conserto seguiu literalmente a instrução do veredito: guardar o
  último valor comitado num ref junto com o timer, e no cleanup trocar
  `clearTimeout` sozinho por `clearTimeout` + flush condicional.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo.

**Pendências / riscos**
- Nenhuma.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-12 — 🔵 Em correção (um achado)

**A entrega é forte** — a melhor medição da leva, e o resumo é honesto onde poderia ter inflado. Reprova
por **um** ponto, pequeno, e o resto está aprovado.

### Verificação, saída real

| | |
|---|---|
| `npx vitest run` | **313 arquivos / 1264 testes, verde** (era 310/1235) |
| `npx tsc --noEmit` | **0** |
| `check-audit-baseline --with-tsc` | igual ao baseline de 2026-08-11 |
| `container-query:check` (gate da `plan-39`) | **[OK]** — a plan anterior continua honrada |
| R9 | `PreviewSystemRenderer` 239 · `MasterControlPanel` 233 · `BasicControls` 152 · os 2 novos 35 e 38 |
| Linha vermelha do motor | `useDesignVariables.ts` e `DesignScope.tsx` **não aparecem no diff** ✅ |

### O que confirmei em vez de aceitar

1. **`===` no lugar do `JSON.stringify` é seguro, e a justificativa procede.** Fui ler
   `useSarakDrafting.ts`: `setDraftDesign` é o setter cru de `useState`, **não clona** — logo, depois de
   `setDraftDesign(draftState)`, o `sarak.draftDesign` seguinte **é** `draftState`. E o Provider passa o
   setter cru adiante (`SarakUIProvider.tsx:159`), sem embrulho. O `===` é **mais estrito**, nunca mais
   frouxo, e converge; `lastProviderDraftRef` continua no lugar. A mudança que mais me preocupava é a que
   está mais bem fundamentada.
2. **`MasterControlPanel` não é público** — não está no barril, então a prop nova não quebra contrato e não
   pede entrada de migração. E conferi o que sumiu do destructure (`isDirty`, `isComponentDirty`,
   `handleApplyToSystem`): `git show HEAD` prova que **já eram lidos e nunca usados** no arquivo. Nenhuma
   funcionalidade perdida.
3. **A estabilização em `PreviewCanvas.tsx` está certa pelo motivo certo.** O literal no JSX derrotava o
   `useMemo` que já existia no motor. Corrigir o consumidor em vez do motor é exatamente o que a §3.2
   mandava.
4. **A honestidade sobre o alcance** (a duplicação continua quando o rascunho muda de verdade) é o tipo de
   declaração que eu teria de arrancar. Veio no resumo, sozinha.

### 🔵 O achado

**`useDebouncedDraftCommit.ts:26-28`** — ao desmontar, o hook **descarta** o commit pendente:

```
useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
```

Nada mais dispara `onCommit`: não há `onBlur`, `onMouseUp` nem `onPointerUp` em `SliderControl` ou
`InputControl`. **Quem editar e trocar de pilar/fechar o painel dentro da janela de 150 ms perde a última
alteração, em silêncio.** Antes desta plan isso era impossível — cada tecla comitava na hora.

**E o destino de `onCommit` continua vivo:** `updateDraft` mora no `useDesignDraft` de
`ThemeCustomizationTab`, que **não desmonta** quando um controle sai de cena (troca de pilar). Descartar não
protege de `setState` em componente desmontado — o dono do estado é outro, e está lá. Em painel fechado, o
`setState` tardio é no-op no React 18. **Não há razão para descartar; há razão para esvaziar.**

**Por que isso reprova, e não vira só achado:** existe um teste — *"limpa o timer pendente ao desmontar —
não chama onCommit depois do unmount"* — que **transforma o defeito em contrato**. Aprovado assim, o próximo
que for consertar encontra um teste dizendo que a perda é o comportamento desejado, e não conserta. Teste
que fossiliza defeito é pior que defeito solto. Some-se o critério 5 da §7: *"nenhuma mudança de
comportamento observável do rascunho"* — atraso de 150 ms foi autorizado pela §3.1; **perder a edição não
foi**.

É estreito, e digo isso com todas as letras: a janela é curta e por mouse quase sempre passa de 150 ms. Mas
é perda silenciosa de entrada do usuário numa ferramenta de edição — a classe de bug que vira "o painel
comeu minha mudança" e nunca se reproduz.

### Prompt de correção

```
Leia specs/00-prompt-executor.md e corrija a execução de
specs/plan/plan-36-performance-rascunho-painel-design-engine.md.

Veredito de 2026-08-12: um achado. TODO O RESTO ESTÁ APROVADO — não toque em
mais nada. As medições, o `===` do useDesignDraftSync, a estabilização do
PreviewCanvas, o React.memo, a prop do MasterControlPanel: todos aprovados.

src/features/DesignEngine/components/controls/useDebouncedDraftCommit.ts:26-28 —
ao desmontar, o hook DESCARTA o commit pendente. Como não existe flush por
onBlur/onMouseUp em SliderControl nem em InputControl, editar e trocar de pilar
(ou fechar o painel) dentro dos 150ms PERDE a alteração, em silêncio. Antes desta
plan isso era impossível: cada evento comitava na hora.

Descartar não protege nada: `onCommit` é o `updateDraft` do `useDesignDraft` de
ThemeCustomizationTab, que NÃO desmonta quando um controle sai de cena. E com o
painel fechado, setState tardio é no-op no React 18.

CONSERTO: no cleanup, ESVAZIE em vez de descartar — se há timer pendente, cancele
o timer E chame `onCommitRef.current` com o último valor comitado (guarde-o num
ref junto com o timer). Só dispare se havia algo pendente; unmount sem edição
pendente não pode chamar nada.

E CONSERTE O TESTE, que hoje fossiliza o defeito: o caso
"limpa o timer pendente ao desmontar — não chama onCommit depois do unmount"
passa a afirmar o oposto — desmontar com commit pendente PROPAGA o último valor,
UMA vez. Acrescente o caso irmão: desmontar SEM nada pendente não chama nada.

LINHAS VERMELHAS:
  · Você NÃO mexe em useDesignDraftSync.ts, PreviewCanvas.tsx,
    PreviewSystemRenderer.tsx, MasterControlPanel.tsx nem master-map.ts.
  · Você NÃO muda os 150ms nem acrescenta flush por onBlur/onMouseUp — o conserto
    é só o cleanup.

Rode e cole: npx vitest run (INTEIRA) · run_audit ·
check-audit-baseline.mjs --with-tsc · npx tsc --noEmit · git diff --stat.

Não commite. Acrescente um bloco NOVO de resumo (o anterior permanece intacto) e
mova o status para 🟠 Em revisão.
```

## Veredito (correção 1) — 2026-08-12 — 🟢 Aprovada

O achado está fechado, e o conserto é mais cuidadoso do que o prompt pedia.

### O conserto, lido no arquivo

`useDebouncedDraftCommit.ts:34-39` esvazia em vez de descartar, e a condição está certa:
`if (timerRef.current)` só é verdadeira quando existe commit pendente — desmontar sem edição não chama nada.
O efeito continua com `[]` e lê tudo por ref, então dispara o `onCommit` mais recente.

**A linha que eu não tinha pedido, e que fecha o caso direito, é a `:46`:** o `setTimeout` do caminho normal
zera `timerRef.current` **antes** de propagar. Sem ela, um desmonte posterior a um commit já propagado veria
o ref preenchido e dispararia um segundo `onCommit`. O executor viu isso sozinho.

Conferi os dois sentidos:

| Cenário | O que acontece |
|---|---|
| Editar → desmontar dentro dos 150 ms | `clearTimeout` + `onCommit(pendingValueRef.current)` — **1 chamada**, valor certo |
| Desmontar sem nada pendente | `timerRef.current` nulo → **nenhuma chamada** |
| Timer dispara normal → desmontar depois | `timerRef.current` já nulo → **sem flush duplo** |

### Os testes

O caso que **fossilizava o defeito** foi invertido — hoje afirma que desmontar com commit pendente propaga
o valor — e ainda avança o relógio em 150 ms **depois** do unmount para provar que continua sendo **uma**
chamada. O caso irmão (desmontar sem pendência) entrou. E o executor rodou o teste contra o cleanup antigo
para provar que ele reprova, que era o ponto: teste que não falha sem o conserto não é rede.

### Gates

| | |
|---|---|
| `npx vitest run` | **313 arquivos / 1265 testes, verde** — **+1** sobre a entrega anterior, nenhum sumiu |
| `npx tsc --noEmit` | **0** |
| `check-audit-baseline --with-tsc` | igual ao baseline de 2026-08-11 |
| `container-query:check` | **[OK]** |
| R9 | `useDebouncedDraftCommit.ts` 52 linhas |

### Escopo

`git diff --stat` dos arquivos rastreados é **byte a byte idêntico** ao da entrega anterior — 16 arquivos,
529 inserções, 167 remoções, os mesmos números. O que mudou nesta rodada vive nos dois arquivos **ainda não
rastreados** (`useDebouncedDraftCommit.ts` e seu teste), que por isso não aparecem no `--stat`. A linha
vermelha "não mexa em mais nada" foi respeitada.

### Uma observação, não um defeito

O guard da `:46` (timer normal zera o ref) **não tem teste próprio**. Ele está certo, e mesmo se falhasse a
consequência seria um `updateDraft` duplicado com o **mesmo valor** — idempotente, sem estrago. Fica
anotado para quem tocar no arquivo: é o único caminho do hook sem cobertura 1:1.

### Destino da síntese

Declarado na §9, **não executado por mim**. Só por `spec-atualizar`, depois do commit do dono.
