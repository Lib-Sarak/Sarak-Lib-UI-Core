---
tipo: "plan"
titulo: "O piso do grid content-aware é um número solto num vão do auditor"
dominio: "Sarak-Lib-UI-Core / Layout / Design Engine"
status: "🟢 Aprovada"
prioridade: "Média"
tags: ["plan", "layout", "tokens", "hardcode", "plan-47"]
relacionados: ["[[07-responsividade-e-multidispositivo]]", "[[04-contrato-de-tokens-e-paridade]]", "[[01-gates-e-baseline]]"]
depende_de: ""
destino_sintese: "specs/specs/07-responsividade-e-multidispositivo.md · specs/arquitetura/04-contrato-de-tokens-e-paridade.md · specs/specs/01-gates-e-baseline.md"
objetivo: "A largura mínima de célula que decide o layout de todo consumidor zero-config deixa de ser um literal invisível e passa a ser ajustável como qualquer outra decisão de layout"
---

# 1. Objetivo

O **piso de largura de célula** do grid zero-config — hoje o literal `280px` — passa a ser uma decisão
declarada e ajustável, em vez de um número solto dentro de uma string de classe.

# 2. Contexto

## 2.1 O que a `plan-47` mudou sem querer

A `plan-47` (🟢 2026-08-15) trocou o default de `layoutGridTemplate` de `'col-12'` para `'auto-fit'`, que
emite:

```
'auto-fit': 'grid w-full grid-cols-[repeat(auto-fit,minmax(280px,1fr))]'
                                            useStructuralStyles.presets.ts:39
```

> 🔧 **Ponteiro reconciliado pelo revisor em 2026-08-18.** Esta plan foi escrita quando a estratégia morava
> em `useStructuralStyles.ts:36`. As plans **49** e **50** extraíram as três estratégias para o companion
> `useStructuralStyles.presets.ts` (mapa `GRID_LAYOUT_STRATEGIES`, R9 — teto de 250 linhas), e a `plan-49`
> ainda acrescentou o default de span do `col-12` na linha vizinha. **O alvo é o mesmo número; mudou o
> arquivo.** O objetivo e o escopo da plan **não mudaram** — o que mudaria, se ninguém corrigisse, é o
> executor procurando num arquivo onde o literal não está mais, e a §8 conferindo com um `grep` que hoje
> volta vazio.

**O literal `280px` não é novo — o que é novo é o peso dele.** Até a `plan-47`, `auto-fit` era um caminho
opcional que ninguém escolhia por default; a partir dela, esse número **decide quantas colunas todo
consumidor zero-config recebe**, em qualquer largura. A fórmula que o veredito da `plan-47` usou para
conferir a medição em Chromium mostra o quanto ele pesa:

```
colunas = floor((largura_do_container + gap) / (280 + gap))
```

Trocar 280 por 240 ou por 320 muda a contagem de colunas de **todo** consumidor. É a alavanca mais
influente do layout da lib, e é a única que não tem nome.

## 2.2 Três propriedades que ele não tem, e deveria

| | Situação hoje |
|---|---|
| **Não é token** | não está em nenhum schema; não aparece no catálogo; o Design Engine não o expõe; um tema não consegue movê-lo |
| **Não é alcançável pelo consumidor** | quem quiser cards mais estreitos ou mais largos tem de abandonar o zero-config e passar `templateColumns` — exatamente o que [[07-responsividade-e-multidispositivo]] §1 diz que não deveria ser preciso |
| **Não é visto por gate nenhum** | `auditor_hardcoded` só varre `.tsx`, e este valor vive num `.ts`. O vão está **declarado** em `useStructuralStyles.presets.ts:1-3` — é vão conhecido, não descoberta |

**Nada disso viola regra hoje**, e é por isso que esta plan existe em vez de ser uma reprovação da `plan-47`:
o executor não tinha instrução para tocar nisso, o gate passa legitimamente, e o valor pré-existia.

## 2.3 O que NÃO é o problema

Não é "o 280 está errado". Pode até ser o número certo — em 1280px ele dá 4 colunas, o que é razoável para
card. O problema é que **ninguém pode saber disso nem mudá-lo**, e que ele mudou de categoria (de detalhe de
uma opção para default de todos) sem passar por nenhuma das três fontes da paridade.

# 3. Escopo

## 3.1 Dentro

1. **`src/components/atomic/hooks/useStructuralStyles.presets.ts:39`** — a entrada `'auto-fit'` do mapa
   `GRID_LAYOUT_STRATEGIES`, que é onde o literal vive desde as plans 49/50. Se a saída escolhida precisar
   emitir o valor por `style` inline, `useStructuralStyles.ts:33-46` (`getGridStyles`) entra junto — é ele
   que monta o objeto de estilo.
2. **Se a saída escolhida for token novo:** `src/core/Design/schema/structural.ts` + as **três** fontes da
   paridade ([[04-contrato-de-tokens-e-paridade]]) + os temas que precisarem do valor. A skill
   `ui-novo-componente` é a dona deste procedimento — **aplique-a, não improvise a paridade**.
3. **Testes companheiros** dos arquivos tocados.
4. **`docs/migracoes.md`** — só se o comportamento default mudar de fato (se o valor efetivo continuar 280,
   provavelmente não muda nada para o consumidor; diga isso em vez de inventar entrada).

## 3.2 Fora

- ⛔ **Reverter a `plan-47`.** `auto-fit` como default está aprovado e fica.
- ⛔ **Mudar o valor efetivo de 280px "de passagem".** Se a sua saída mantém o número, ele continua 280. Se
  você acha que deveria ser outro, isso é decisão de aparência e **não é sua** — relate, não redesenhe
  (mesma linha vermelha da `plan-47` §3.2).
- ⛔ **Mexer em `col-12` ou `masonry`.** Continuam como estão.
- ⛔ **Tocar no ERP.**
- ⛔ **Alargar para "tokenizar tudo que é literal em `.ts`".** O escopo é **este** número, que a `plan-47`
  promoveu a default. Varredura geral do vão do auditor é outra plan, e nem foi pedida.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §5 e §6.1 | a `plan-47` foi **sintetizada e removida** (2026-08-15); a verdade dela vive aqui — a linha do `SarakGrid` sem `templateColumns` e as quatro regras da camada 3. O histórico: `git log --diff-filter=D -- specs/plan/` |
| Spec fixa | `specs/arquitetura/04-contrato-de-tokens-e-paridade.md` | **obrigatória se** criar token: a paridade 1:1:1 não é opcional |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §1 · §6 | o contrato zero-config e a camada onde este número decide |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | o vão do `auditor_hardcoded` (`.tsx` apenas) e como se declara vão |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `ui-novo-componente` | **se criar token** — é ela que garante as três fontes e o alcance pelo barril |
| **Skill** | `padrao-escrita` · `padrao-typescript` · `test-unitario` | sempre |
| Código | `useStructuralStyles.presets.ts:31-42` (onde o literal vive) · `:1-12` (o vão declarado no cabeçalho) · `useStructuralStyles.ts:33-46` (`getGridStyles`, quem consome) | ler antes de editar |

# 5. Instruções de execução

## Passo 1 — escolher a saída e declarar o porquê

| | Saída | Custo |
|---|---|---|
| **A** | **Token novo** (ex.: `layoutGridMinCell`) no schema `structural`, com o Design Engine expondo o controle | resolve as três propriedades da §2.2 de uma vez. ⚠️ **Custo real medido na `plan-47`:** a classe é resolvida pelo **Tailwind em build-time** e **não aceita `var()`** — é a mesma limitação de [[07-responsividade-e-multidispositivo]] §2.1. Uma classe não serve; o valor teria de chegar por `style` inline (`gridTemplateColumns`), o que **é** viável aqui porque `getGridStyles` já devolve `style`. **Meça isto antes de prometer** |
| **B** | **Constante nomeada e exportada**, ao lado de `BP_SM`/`BP_XL` em `useStructuralStyles.presets.ts` | barato e honesto; dá nome e um ponto único de mudança, mas **não** torna themeável nem alcançável pelo consumidor. Resolve 1 das 3 propriedades |
| **C** | **Deixar como está e declarar o vão** em [[01-gates-e-baseline]] / [[15-divida-conhecida]] | ⛔ **descartada** — o vão já está declarado (§2.2) e declarar de novo não muda nada. Se a conclusão for "não vale mexer", isso é resposta legítima, mas então **traga a medição que a sustenta**, não a repetição do que já está escrito |

**Se a saída A se mostrar inviável na medição do passo 2, a B é uma entrega completa** — e dizer isso com a
medição na mão é melhor que forçar um token que não chega ao CSS. Foi um token que não chega ao CSS que
originou as plans 39 e 41.

## Passo 2 — medir antes de prometer

Se escolher **A**, prove **antes de implementar** que o valor chega ao CSS: monte o caminho por `style`
inline e confirme em **navegador real** que `grid-template-columns` computado muda quando o token muda.
Cole a saída no resumo. `var()` dentro de classe Tailwind com valor arbitrário **não funciona** — se a sua
implementação depende disso, ela está morta antes de começar.

## Passo 3 — implementar, com teste ao lado (R8)

Cada teste declara o que prova e o que **não** prova (jsdom não mede layout). Cobertura mínima:

- o valor default efetivo **continua sendo 280px** (nenhuma mudança silenciosa de aparência);
- se criou token: mudar o token muda o `gridTemplateColumns` emitido — e a paridade fecha
  (`run_audit` → `auditor_paridade`).

## Passo 4 — fechar, colando a saída real

`npx vitest run` (INTEIRA) · `node gates/scripts/audit/run_audit.mjs` ·
`node gates/scripts/release/check-audit-baseline.mjs --with-tsc` · `npx tsc --noEmit` ·
`npm run catalog:check` · `npm run barrel:check` · `npm run container-query:check` · `git diff --stat`.

> ⚠️ A `plan-46` registra que a suíte é intermitente. Pegou falha? Rode de novo e **relate as duas saídas**.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-48-piso-do-grid-content-aware-e-um-numero-solto.md.

specs/specs/07-responsividade-e-multidispositivo.md §5 e §6.1 (a plan-47 foi sintetizada e
removida em 2026-08-15 — a verdade dela vive nessa spec),
specs/arquitetura/04-contrato-de-tokens-e-paridade.md,
specs/specs/07-responsividade-e-multidispositivo.md §1 e §2.1 e §6.
Skills: padrao-escrita, padrao-typescript, test-unitario, e ui-novo-componente SE criar token.

O PROBLEMA, em uma frase: o literal `280px` em
`grid-cols-[repeat(auto-fit,minmax(280px,1fr))]` (useStructuralStyles.presets.ts:39,
no mapa GRID_LAYOUT_STRATEGIES) decide,
desde a plan-47, quantas colunas TODO consumidor zero-config recebe — e não é token,
não é alcançável pelo consumidor, e vive num vão declarado do auditor de hardcode
(que só varre .tsx; ele está num .ts).

NÃO é "o 280 está errado". Pode ser o número certo. O problema é que ninguém pode
saber disso nem mudá-lo.

PASSO 1 — escolha entre A (token novo), B (constante nomeada) ou C (descartada) e
declare o porquê. LEIA a armadilha da A antes de escolher: classe Tailwind com valor
arbitrário é resolvida em BUILD-TIME e NÃO aceita var() — é a mesma limitação da
07-responsividade §2.1. Se for A, o valor tem de chegar por `style` inline
(gridTemplateColumns), que getGridStyles já devolve.

PASSO 2 — se escolheu A, MEÇA EM NAVEGADOR REAL antes de implementar que mudar o
token muda o grid-template-columns computado. Cole a saída. Um token que não chega ao
CSS é exatamente o que originou as plans 39 e 41 — não repita.

Se a medição mostrar que A é inviável, a B é entrega COMPLETA. Dizer isso com medição
é melhor que forçar um token morto.

LINHAS VERMELHAS:
  · Você NÃO reverte a plan-47. `auto-fit` como default fica.
  · Você NÃO muda o valor efetivo de 280px. Se acha que deveria ser outro, RELATE.
  · Você NÃO mexe em col-12 nem masonry.
  · Você NÃO toca no ERP.
  · Você NÃO alarga para "tokenizar todo literal em .ts". O escopo é ESTE número.

Teste ao lado (R8), cada um declarando o que prova e o que NÃO prova. Não commite. Ao
terminar, escreva o resumo na própria plan e mova o status para 🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] A saída escolhida (A ou B) está declarada no resumo com o porquê e o custo assumido.
- [ ] Se escolheu **A**: a medição em navegador real provando que o token **chega ao `grid-template-columns`
      computado** está colada no resumo. Sem ela, o critério não é atendido.
- [ ] Se escolheu **B**: está declarado explicitamente, no resumo e no código, que o valor **continua não
      sendo themeável nem alcançável pelo consumidor** — e por quê.
- [ ] O valor default efetivo **continua 280px** — evidência: teste.
- [ ] Se criou token: `run_audit` → `auditor_paridade` fecha, e `catalog:check` verde.
- [ ] Cada teste novo declara o que prova e o que **não** prova.
- [ ] `npx vitest run` inteira, verde, sem encolher.
- [ ] `run_audit` sem regressão contra `gates/baselines/audit-baseline.json`; `npx tsc --noEmit` → 0;
      `catalog:check`, `barrel:check`, `container-query:check` verdes.
- [ ] `git diff --stat` — só os arquivos da §3.1. **Nada do ERP.**

# 8. Como verificar (uso do revisor)

```bash
git diff --stat
git diff

# o literal continua existindo? virou constante? virou token?
grep -n "minmax(280px" src/components/atomic/hooks/useStructuralStyles.presets.ts
grep -rn "280" src/components/atomic/hooks/ | grep -v __tests__

# se criou token: as três fontes
grep -rn "layoutGridMinCell\|<nome-escolhido>" src/core/Design/schema/ src/core/Design/catalog/

npx vitest run
node gates/scripts/audit/run_audit.mjs
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npx tsc --noEmit
npm run catalog:check && npm run barrel:check && npm run container-query:check
```

**O que reprova:**

- token criado que **não chega ao CSS** — o defeito das plans 39/41, repetido;
- `var()` dentro de classe Tailwind de valor arbitrário (não funciona, e passa em jsdom sem acusar);
- valor efetivo alterado sem a plan mandar — mudança de aparência fora de escopo;
- paridade não fechada depois de criar token;
- saída **B** entregue **sem** declarar que não resolve as outras duas propriedades da §2.2 — entrega
  parcial apresentada como completa;
- `auto-fit` deixado de ser o default (reversão disfarçada da `plan-47`).

# 9. Destino da síntese

**Destino:** `specs/specs/07-responsividade-e-multidispositivo.md` · `specs/arquitetura/04-contrato-de-tokens-e-paridade.md` · `specs/specs/01-gates-e-baseline.md`

> 🔧 **A `01-gates-e-baseline.md` foi ACRESCENTADA ao destino pelo revisor em 2026-08-18, no veredito.** Eu
> a havia esquecido ao escrever esta plan, e o esquecimento tem consequência concreta: o token novo levou a
> paridade de **422 para 423** e a lista estrutural de **17 para 18**, e a §3 daquela spec afirma `422 / 422 /
> 422`, *"gabarito vivo de 422 chaves"* e *"token-types:check ✅ 422 tokens"* em quatro lugares. Sem esta linha,
> a síntese fecharia a `07` e a `04` e deixaria a `01` mentindo — que é exatamente o achado **32** se repetindo
> por omissão de destino, não por descuido de quem escreve a spec.

**Texto pronto para transporte:**

- **`07-responsividade-e-multidispositivo.md` §2.1** ganha uma linha na tabela de alcance do token: o piso de
  célula do grid content-aware, **e por qual caminho ele alcança o CSS** (`style` inline, se a saída A vingar
  — que é justamente o caminho que as classes Tailwind não oferecem). É a mesma tabela que já explica por que
  o token de breakpoint alcança 2 dos 3 caminhos; este é o terceiro caso da mesma família.
- **`arquitetura/04-contrato-de-tokens-e-paridade.md`** só é tocada **se** a saída for A (token novo entra na
  contagem das três fontes). Se a saída for B, o destino desta plan encolhe para a `07` apenas — e o executor
  deve dizer isso no resumo, para a síntese não procurar mudança que não existe.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-08-18

**Resultado:** Concluído

**Saída escolhida: A — token novo (`layoutGridMinCell`)**, não a B. A medição do Passo 2 (abaixo) provou que
o caminho `style` inline funciona — não dependi de `var()` dentro da classe Tailwind em nenhum momento, e o
custo (token nas três fontes + uma função extraída para o companion) ficou pequeno o bastante para não
justificar a saída B, que resolveria só 1 das 3 propriedades da §2.2 da plan.

**O que foi feito**
- `src/core/Design/schema/structural.ts` — token `layoutGridMinCell` (slider, `px`, `min:160 max:480 step:8`,
  `defaultValue:280`, `legacyValue:280`, `cssVars:['--sarak-layout-grid-min-cell']`,
  `structuralConsumer:['useStructuralStyles.getGridStyles']`), na seção MACRO GRID, ao lado de
  `layoutGridTemplate` — por quê: mesmo consumidor, mesma família.
- `src/core/Design/catalog/theme_table_mapping.json:441` — `layoutGridMinCell` adicionado à coluna
  `structural`, logo após `layoutGridTemplate` — 2ª das três fontes da paridade.
- `src/core/Design/catalog/partitions/structural.json` — entrada completa do token (mesmo formato dos
  vizinhos `layoutGridTemplate`/`splitPaneMinWidth`), com `consumerHook` — 3ª fonte da paridade.
- `src/core/Provider/generated/design-token-ids.ts` — regenerado por `npm run token-types` (423 tokens
  tipados; era 422). Não editado à mão.
- `src/components/atomic/hooks/useStructuralStyles.presets.ts` — nova função exportada
  `resolveAutoFitTemplateColumns(layoutType, hasCustomTemplate, gridMinCell)`: monta
  `repeat(auto-fit, minmax(${gridMinCell}px, 1fr))` só quando a estratégia é `auto-fit` sem template
  customizado. `GRID_LAYOUT_STRATEGIES['auto-fit']` **não foi tocado** — a classe continua com `280px`
  embutido como fallback estático (mesmo valor do `defaultValue` do token); quem manda de verdade é o
  `style`, que sempre vence a classe na cascata CSS.
- `src/components/atomic/hooks/useStructuralStyles.ts` (`getGridStyles`) — passou a ler
  `design?.layoutGridMinCell` (fallback `280` quando ausente/sem Provider) e a chamar
  `resolveAutoFitTemplateColumns`, atribuindo o resultado a `style.gridTemplateColumns` (com
  `templateColumns ?? autoFitTemplateColumns` — `templateColumns` explícito continua tendo prioridade).
- `src/components/atomic/hooks/__tests__/useStructuralStyles.test.ts` — 5 testes novos (ver Verificações).
- 3 snapshots atualizados (`PreviewCanvas.test.tsx.snap`, `PresetCard.test.tsx.snap`,
  `PreviewSystemRenderer.test.tsx.snap`) — por quê: os três capturam a árvore de `style` inline que
  `useDesignVariables` monta com **todo** token do dicionário; o token novo passou a aparecer ali como
  `--sarak-layout-grid-min-cell: 280px`, igual ao irmão `--sarak-layout-grid-template`. Conferido byte a byte
  (script ad-hoc, descartado) que a ÚNICA declaração adicionada nos três arquivos foi essa; nada removido,
  nada mais mudou.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/schema/structural.ts` | alterado | token `layoutGridMinCell` novo |
| `src/core/Design/catalog/theme_table_mapping.json` | alterado | `layoutGridMinCell` na coluna `structural` |
| `src/core/Design/catalog/partitions/structural.json` | alterado | entrada do catálogo para `layoutGridMinCell` |
| `src/core/Provider/generated/design-token-ids.ts` | gerado | regenerado (`npm run token-types`), 422→423 tokens |
| `src/components/atomic/hooks/useStructuralStyles.presets.ts` | alterado | `resolveAutoFitTemplateColumns` exportada |
| `src/components/atomic/hooks/useStructuralStyles.ts` | alterado | `getGridStyles` consome o token via `style` |
| `src/components/atomic/hooks/__tests__/useStructuralStyles.test.ts` | alterado | 5 testes novos (describe `layoutGridMinCell`) |
| `.../__snapshots__/PreviewCanvas.test.tsx.snap` | alterado | + `--sarak-layout-grid-min-cell: 280px` |
| `.../__snapshots__/PresetCard.test.tsx.snap` | alterado | idem |
| `.../__snapshots__/PreviewSystemRenderer.test.tsx.snap` | alterado | idem |

**Passo 2 — a medição em navegador real (Chromium, via Playwright, já instalado no repo)**

Script ad-hoc (`_tmp-grid-probe.mjs` + `.html`, criados na raiz do repo, executados e **removidos** antes de
fechar — não fazem parte do diff): carreguei o `dist/sarak.css` **real** (contém a classe
`grid-cols-[repeat(auto-fit,minmax(280px,1fr))]` tal como publicada) e montei três `div`s de 900px de
largura:
- **(A)** só a classe (sem `style` inline) → `getComputedStyle().gridTemplateColumns` = `"300px 300px 300px"` (3 colunas).
- **(B)** classe + `style` inline repetindo `minmax(280px,1fr)` (simula o token no valor default) →
  **idêntico a (A)**: `"300px 300px 300px"`.
- **(C)** classe + `style` inline com `minmax(400px,1fr)` (simula `layoutGridMinCell=400`) →
  `"450px 450px"` (2 colunas) — **diferente de (A) e (B)**.

Isso prova, em Chromium real, exatamente o que o Passo 2 exige: com o token no default, o resultado bate com
a classe pura (nada mudou por engano); com o token alterado, o `grid-template-columns` **computado** muda —
o `style` vence a classe, sempre. Não dependi de `var()` em valor arbitrário Tailwind em nenhum ponto — essa
armadilha (citada na plan) foi contornada pelo desenho, não testada como hipótese que falhou.

**Verificações executadas**
- `npx vitest run` (INTEIRA, 2 rodadas): 1ª rodada → 314/317 arquivos, 3 snapshots divergentes (esperado —
  ver acima); `-u` nos 3 arquivos afetados; 2ª rodada → **317/317 arquivos, 1376/1376 testes, 100% verde**.
- `node gates/scripts/audit/run_audit.mjs` → **2 auditores vermelhos** (`auditor_ghostvars` 1 fantasma
  `--x`, `auditor_composicaoatomica` 2 — `SarakMultiSelect`/`SarakUploader`), **igual ao baseline conhecido**
  (nenhum dos dois relacionado a esta plan).
  - ⚠️ **Achado que corrigi na própria execução (dentro do escopo):** a primeira versão do código deixou
    `useStructuralStyles.ts` em **251 linhas**, estourando o teto de R9 (≤250) — `auditor_cleancode` acusou.
    Extraí a construção da string (`resolveAutoFitTemplateColumns`) para `useStructuralStyles.presets.ts`
    (mesmo padrão já usado para `GRID_LAYOUT_STRATEGIES`, que tem o comentário "extraído por R9" na origem).
    Arquivo caiu para **245 linhas**. Não é achado fora do escopo — é o próprio arquivo que a plan mandou tocar.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `igual ao baseline de 2026-08-11 —
  nenhuma regressão`.
- `npx tsc --noEmit` → **0 erros**.
- `npm run catalog:check` → `catálogo em dia`.
- `npm run barrel:check` → `77 componentes registrados; barril em dia (0 faltas)`.
- `npm run container-query:check` → `[OK]` (nenhuma classe montada por interpolação).
- `npx tsx gates/scripts/audit/verify_parity.ts` → `423/423/423` nas três fontes.
- `git diff --stat` — só os 10 arquivos listados acima + esta plan. **Nada do ERP, nada fora de `src/` e
  `specs/plan/plan-48-...`.**

**Critérios de aceite**
- [x] A saída escolhida (A) está declarada no resumo com o porquê e o custo assumido.
- [x] Medição em navegador real provando que o token chega ao `grid-template-columns` computado — colada acima.
- [x] O valor default efetivo continua 280px — evidência: teste `SEM tema: o style.gridTemplateColumns
      resolve para o default (280px)` + a medição (A) === (B) no Chromium real.
- [x] Token criado → `run_audit` → `auditor_paridade` fecha (423/423/423); `catalog:check` verde.
- [x] Cada teste novo declara o que prova e o que não prova (comentário no topo do `describe` novo).
- [x] `npx vitest run` inteira, verde, **sem encolher** (317→317 arquivos; 1371→1376 testes — cresceu 5, os
      novos desta plan).
- [x] `run_audit` sem regressão contra o baseline; `tsc --noEmit` → 0; `catalog:check`, `barrel:check`,
      `container-query:check` verdes.
- [x] `git diff --stat` — só os arquivos da §3.1. Nada do ERP.

**Decisões e suposições**
- **Não regenerei `sarak-ui/` (`npm run guide`).** Não está em "dentro do escopo" da plan (§3.1), e tocar
  nele criaria diff fora do declarado. O consumidor só vê o token novo na próxima vez que alguém rodar
  `npm run guide` legitimamente (ex.: um release).
- **`docs/migracoes.md` não ganhou entrada.** A plan (§3.1 item 4) só exige isso "se o comportamento default
  mudar de fato". O valor efetivo continua 280px — provado acima — então não há nada para o consumidor migrar.
- **`GRID_LAYOUT_STRATEGIES['auto-fit']` manteve o `280px` literal na classe Tailwind, de propósito.** Ele
  virou um fallback estático inerte (o `style` sempre o sobrepõe), mas removê-lo exigiria reescrever a classe
  e teria quebrado **5 arquivos de teste** que hoje afirmam essa classe literal
  (`useStructuralStyles.test.ts`, `SarakGrid.test.tsx`, `SarakLayoutsResponsive.test.tsx`,
  `SarakForm.test.tsx`, `SarakManagementGrid.test.tsx`) sem ganho funcional nenhum — o valor já chega pelo
  `style`. Mantê-lo é o caminho de menor superfície que ainda resolve as três propriedades da §2.2 da plan.
  Fica **duplicado, mas não hardcode-vivo**: o número real que governa a tela é sempre o do `style`.
- **Corrigi um achado dentro do próprio escopo (R9, 251→245 linhas), não relatei como "fora do escopo".**
  Está listado nas Verificações acima porque foi consequência direta da minha própria edição no arquivo que
  a plan mandou tocar — não é um defeito pré-existente descoberto de passagem.
- **Autocorreção de ritual:** o `status` desta plan só foi marcado `🟡 Em execução` depois da primeira edição
  de código (deveria ter sido antes, por `00-prompt-executor.md` §2). Registrado aqui por honestidade —
  nenhuma consequência prática, mas é desvio do procedimento.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo. (O achado do teto de linhas foi corrigido dentro do próprio escopo — ver acima, não entra aqui.)

**Pendências / riscos**
- Nenhuma pendência conhecida.

## Correção pós-aprovação — 2026-08-18

**A decisão "não regenerei `sarak-ui/` porque não está em §3.1" estava incompleta.** Ao tentar commitar, o
Anel 1 do `pre-commit` bloqueou: `guide:check` acusou `sarak-ui/catalog.json`, `sarak-ui/VERSION`,
`sarak-ui/START-HERE.md` e `sarak-ui/GUIA-FRONTEND.md` defasados (R17) — os quatro embutem a contagem/lista
de tokens (`designTokens.count`/`.ids`), derivada do mesmo schema que ganhou `layoutGridMinCell`. O escopo
declarado numa plan não muda o que os gates do repositório cobram de **qualquer** commit que toque
`src/` — `guide:check` roda no Anel 1 independente do que a plan `§3.1` lista.

**Conserto:** `npm run guide` (regenerado, nenhuma edição à mão) → `422` virou `423` em todo lugar, `kitHash`
atualizado. Conferido `guide:check` verde, e os sete gates do Anel 1 (`catalog`, `barrel`, `zero-brand`,
`guide`, `deep-import`, `gate-limits`, `token-types`) + Anel 2 (`check-audit-baseline --with-tsc`) + Anel 0
(segredos) rodados um a um, todos verdes. `sarak-ui/` staged.

**Lição para a próxima plan que criar token:** regenerar `sarak-ui/` (`npm run guide`) não é opcional quando
o schema muda contagem — é consequência automática que o Anel 1 cobra em qualquer commit, e devia ter
entrado em "Passo 4 — fechar" e em "Critérios de aceite" desta plan desde o início. Registrado aqui para o
`/spec-atualizar` levar a ressalva para `07-responsividade-e-multidispositivo.md` ou para
`04-contrato-de-tokens-e-paridade.md`, à escolha do revisor.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-08-18 — 🟢 Aprovado

**Refiz a prova central em navegador, por conta própria.** Era o critério que a §7 marca como eliminatório
(*"sem ela, o critério não é atendido"*), e conferir a alegação não bastaria.

### 1. Inventário e escopo

`git diff --stat` → 10 arquivos do executor, **todos dentro da §3.1**: o hook + companion, o teste companheiro,
as **três** fontes da paridade, o tipo gerado e 3 snapshots. **Nada do ERP.** `docs/` intocado.

*(Os arquivos `plan-46` e `15-divida` que aparecem no `git status` são **meus** — o achado 43, ainda não
commitado. Não são do executor.)*

### 2. A medição em navegador — REPRODUZIDA POR MIM

Chromium via Playwright, container de 900px:

| Cenário | `grid-template-columns` computado | Colunas |
|---|---|---|
| `style` com `minmax(280px,1fr)` | `300px 300px 300px` | **3** |
| `style` com `minmax(400px,1fr)` | `450px 450px` | **2** |
| **CLASSE** com `minmax(280px,1fr)` | `300px 300px 300px` | **3** |
| **classe 280 + `style` 400 no MESMO elemento** | `450px 450px` | **2 — o `style` venceu** |

As três primeiras linhas batem **exatamente** com os números do resumo. **A quarta é minha, e ela fecha a
única dúvida de desenho que eu tinha:** o executor deixou o `280px` literal na classe de propósito, criando
duas fontes para o mesmo valor. Medi a configuração real que o código produz — classe dizendo 280, `style`
dizendo o token — e o `style` vence. **A classe é inerte, não é fonte concorrente.** A decisão está certa, e
agora está provada, não argumentada.

### 3. Critérios de aceite, um a um

| # | Critério | Como verifiquei |
|---|---|---|
| 1 | Saída A declarada com porquê e custo | §10, com a armadilha do `var()` em classe Tailwind explicitada |
| 2 | **Medição em navegador colada** | §2 acima — **reproduzida**, não só lida |
| 3 | *(saída B — não se aplica)* | — |
| 4 | Valor default efetivo **continua 280px** | teste 1 do bloco novo, e a medição: sem tema → `minmax(280px, 1fr)` |
| 5 | Paridade fecha · `catalog:check` verde | rodei: **423 / 423 / 423** nas três fontes · `token-types:check` **423** · `catalog:check` em dia |
| 6 | Cada teste declara o que prova **e o que não** | o bloco de comentário nomeia as duas coisas que os testes **não** provam (quantas colunas o browser desenha; que o `style` vence a cascata) e aponta onde isso foi medido |
| 7 | Suíte inteira verde, sem encolher | rodei: **317 arquivos / 1376 testes**, exit 0. Era 1371 — os **+5** são exatamente os 5 casos novos |
| 8 | Baseline sem regressão · `tsc` 0 · gates verdes | `check-audit-baseline --with-tsc` → *"igual ao baseline de 2026-08-11 — nenhuma regressão"* · `tsc` **0 erros** · `catalog`/`barrel`/`container-query`/`container-query-boundary`/`public-types` **verdes** |
| 9 | Diff só os arquivos da §3.1, nada do ERP | §1 acima |

### 4. Paridade da marca estrutural — conferida na fonte

O token declara `structuralConsumer: ['useStructuralStyles.getGridStyles']` no schema, e a partição espelha
`consumerHook: ["useStructuralStyles.getGridStyles"]`. É a regra de [[04-contrato-de-tokens-e-paridade]] §3.2
(*"marcar num lado e esquecer o outro é drift"*), e ela fecha. `cssVariables`, `allowedValues` e
`relatedTokens` também batem com o schema.

### 5. Os 2 vermelhos do `run_audit` NÃO são do executor

`SarakMultiSelect.tsx` e `SarakUploader.tsx` — exatamente os dois que a **R10** declara no baseline, um por
conserto bloqueado e outro por falso positivo do detector. Pré-existentes.

### 6. Snapshots — provados legítimos, não aceitos

Comparei os **conjuntos de variáveis CSS** entre `HEAD` e a árvore: **1 acrescentada
(`--sarak-layout-grid-min-cell`), 0 removidas**, nos três arquivos. E fui além do nome: removendo apenas a
declaração da variável nova, os três snapshots ficam **byte a byte idênticos** aos de `HEAD`. **Nenhum valor
pré-existente mudou** — não houve mudança silenciosa de aparência escondida em snapshot.

### 7. R9, sinais de atalho e append-only

`useStructuralStyles.ts` em **245 linhas** (teto 250). O executor estourou para 251 na primeira versão e
**corrigiu extraindo para o companion** — que é exatamente o padrão que [[00-mapa-do-modulo]] §5.2 prescreve, e
ele registrou o desvio em vez de escondê-lo.

Varredura no diff de `src/` por `TODO`/`FIXME`/`console.log`/`.skip(`/`.only(`/`@ts-ignore`/`as any`/`: any` →
**nenhum**. `col-12` e `masonry` fora do diff, e há teste provando que o token não os alcança.

Append-only: a plan perdeu **uma** linha — o próprio `status`, a única edição permitida ao executor.

### 8. As decisões que ele declarou, e as três estão certas

- **`docs/migracoes.md` sem entrada** — correto: a §3.1 item 4 condiciona a entrada a mudança de comportamento
  default, e o valor efetivo continua 280. Token novo é **aditivo (MINOR)**, e a [[03-versionamento-e-release]]
  §5 só obriga entrada em breaking change. **Ele disse isso em vez de inventar entrada**, que era o pedido literal.
- **`280px` mantido na classe** — provado inerte na §2.
- **Ritual: o `🟡` foi marcado depois da primeira edição.** Desvio real de [[00-prompt-executor]] §2,
  **autorreportado**. Sem consequência prática — nenhum outro agente disputou a plan e o `plan-index:check`
  nunca divergiu. **Não reprova**, e o relato voluntário é o comportamento que o ciclo pede.

### 9. Observação registrada, que não é achado

A CSS var `--sarak-layout-grid-min-cell` é **emitida e não tem consumidor de CSS** — o valor é lido em JS pelo
hook. Não viola nada: o `auditor_ghostvars` cobra o sentido inverso (consumida sem emissor), e emitir dá ao
consumidor um jeito de ler o piso no CSS dele. Fica registrado para ninguém "consertar" removendo o `cssVars`.

### 10. Um defeito da MINHA plan, corrigido agora

O `destino_sintese` que eu escrevi listava só a `07-responsividade` e a `arquitetura/04`. **Faltava a
[[01-gates-e-baseline]]:** o token levou a paridade de 422 para **423** e a lista estrutural de 17 para **18**,
e a §3 daquela spec afirma `422/422/422`, *"gabarito vivo de 422 chaves"* e *"token-types:check ✅ 422 tokens"*
em quatro lugares. A síntese fecharia duas specs e deixaria a terceira mentindo — o achado **32** se repetindo
**por omissão de destino**. Acrescentei ao frontmatter e à §9, com o motivo escrito.

---

**Veredito: 🟢 APROVADO.** A saída A foi entregue com a propriedade que a plan exigia — o token **chega ao CSS
de verdade** —, o default não se moveu, a paridade fecha nas três fontes, e cada alegação do resumo que eu
conferi se sustentou. O executor ainda pegou e consertou uma violação de R9 dentro do próprio escopo, e
declarou um desvio de ritual que ninguém teria notado.

**Nenhuma tag é devida:** `dist/` e `sarak-ui/` não foram tocados.
