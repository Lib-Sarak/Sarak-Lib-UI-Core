---
tipo: "plan"
titulo: "O piso do grid content-aware é um número solto num vão do auditor"
dominio: "Sarak-Lib-UI-Core / Layout / Design Engine"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "layout", "tokens", "hardcode", "plan-47"]
relacionados: ["[[07-responsividade-e-multidispositivo]]", "[[04-contrato-de-tokens-e-paridade]]", "[[01-gates-e-baseline]]"]
depende_de: ""
destino_sintese: "specs/specs/07-responsividade-e-multidispositivo.md · specs/arquitetura/04-contrato-de-tokens-e-paridade.md"
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
grid-cols-[repeat(auto-fit,minmax(280px,1fr))]      useStructuralStyles.ts:36
```

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

1. **`src/components/atomic/hooks/useStructuralStyles.ts:36`** — a estratégia `auto-fit`.
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
| Código | `useStructuralStyles.ts:33-41` · `useStructuralStyles.presets.ts:1-14` (o vão declarado) | ler antes de editar |

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
`grid-cols-[repeat(auto-fit,minmax(280px,1fr))]` (useStructuralStyles.ts:36) decide,
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
grep -n "minmax(280px" src/components/atomic/hooks/useStructuralStyles.ts
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

**Destino:** `specs/specs/07-responsividade-e-multidispositivo.md` · `specs/arquitetura/04-contrato-de-tokens-e-paridade.md`

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

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
