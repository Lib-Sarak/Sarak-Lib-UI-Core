---
tipo: "plan"
titulo: "Ligar os três tokens de layout sem consumidor e medir o cromo por token em navegador"
objetivo: "Fazer todo token de layout que o painel oferece ter efeito no cromo, com a medição de navegador cobrindo tema que sobrescreve token de cromo"
dominio: "Sarak-Lib-UI-Core / Cromo / Tokens de layout"
status: "🟡 Em execução"
prioridade: "Média"
tags: ["plan", "cromo", "tokens", "layout", "browser-tests"]
relacionados: ["[[05-cromo-e-slots]]", "[[04-contrato-de-tokens-e-paridade]]", "[[07-responsividade-e-multidispositivo]]", "[[11-testes-e-cobertura]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md + specs/11-testes-e-cobertura.md + specs/01-gates-e-baseline.md + specs/07-responsividade-e-multidispositivo.md"
---

# 1. Objetivo

Nenhum controle de layout do painel de Design é inerte: `layoutDensity`, `maxContentWidth` e
`isSplitViewEnabled` passam a ter efeito visível no `SarakAppChrome` — o único cromo desde o [[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]] —, e a medição de
navegador passa a provar que um tema que sobrescreve token de cromo chega à tela.

# 2. Contexto

**Três tokens que o painel oferece e que não fazem nada.** Medido com o próprio `checkChromeTokenParity`, e
declarado em `gates/scripts/contrato/check-chrome-token-parity.mjs:105-109` (`ORPHAN_TOKENS`):

| Token | Schema | Situação |
|---|---|---|
| `layoutDensity` | `src/core/Design/schema/system.ts:26` — `compact` · `comfortable` (default) · `spacious` | sem consumidor em **nenhum** do cromo |
| `maxContentWidth` | `system.ts:39` — `1000px` a `1600px`, ou `100%`; default `1440px` | sem consumidor em **nenhum** do cromo |
| `isSplitViewEnabled` | `system.ts:66` — booleano, default `false` | era consumido só pelo `SarakShell`, que o [[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]] removeu; **sem consumidor no `SarakAppChrome`** |

**Decisão do dono (2026-10-02): ligar os três.** Não remover.

⚠️ **Ligar muda tela que hoje está parada, e isso é o esperado:**

- `maxContentWidth` tem default `1440px`. Em viewport mais largo que isso, o conteúdo passa a ser limitado e
  centralizado — para **todo** consumidor, sem ele mexer em nada.
- Os temas shippados **declaram** densidade: cinco usam `compact`, dois usam `spacious`. Quem usa um deles
  passa a ver o espaçamento mudar.
- Valor persistido vence default ([[00-contexto]] §8): quem salvou tema continua com o valor que salvou.

**A medição de navegador não alcança token de cromo.** `browser-tests/cromo-css-real.spec.ts` declara no
cabeçalho (limite 3) que *não mede tema que sobrescreva token de cromo*. O mecanismo que faltava já existe:
`TOKEN_VARIANTS` em `browser-tests/fixtures/harness-entry.tsx:46` injeta tema por token, e `?tema=` seleciona
a variante. Hoje ele tem quatro recortes, nenhum de cor, gap, margem ou estrutura do cromo.

**Um relato do ERP Earendel, não medido** (2026-09-18): no tablet (900 px), com a barra superior compacta, um
item de navegação apareceu **só com ícone**, sem rótulo, entre itens rotulados. Pode ser falta de espaço. É
alegação até ser medido — e a regra que ele violaria é a de degradação ([[05-cromo-e-slots]] §2.3: *nada
some*).

**Um ponteiro morto:** `browser-tests/fixtures/harness-entry.tsx:2` aponta para `browser-tests/README.md`,
que não existe.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

> ℹ️ **O cromo único já existe** ([[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]]): o cromo é o `SarakAppChrome`, e o gate de paridade tem um grupo de consumidores.

**Lote 1 — medir**
- `browser-tests/fixtures/harness-entry.tsx` — recortes novos de token, itens de navegação para o caso do
  tablet, e o ponteiro da linha 2.
- `browser-tests/cromo-css-real.spec.ts` — casos novos e o limite 3 do cabeçalho.

**Lote 2 — ligar largura e densidade**
- `src/components/Layout/` — o consumo dos dois tokens na região de conteúdo.
- `src/core/Design/schema/system.ts` — **só** a `description` dos três tokens, para dizer o que cada um faz
  de fato, e `cssVars`/`structuralConsumer` se a paridade exigir.
- `src/core/Design/hooks/` e `src/core/Provider/manifest.ts` — se o efeito precisar de variável derivada.
- `gates/scripts/contrato/check-chrome-token-parity.mjs` — **só** a saída dos tokens de `ORPHAN_TOKENS` e o
  limite que os declara.

**Lote 3 — vista dividida no `SarakAppChrome`**
- `src/components/Layout/` — o slot do segundo painel e a geometria.
- `src/index.ts` e tipos públicos, se o slot exigir.

**Nos três lotes**
- Testes ao lado do que mudou (`__tests__/`).
- `docs/migracoes.md` — a nota do que muda na tela de quem atualiza.
- `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*`, `src/core/Provider/generated/` —
  regenerados pelos geradores. Nunca à mão.

## 3.2 Fora (o que NÃO pode ser tocado)

- **Os defaults e as opções dos três tokens.** Trocar default não conserta nada — só muda quem cai nele por
  omissão.
- **Os temas shippados** (`src/core/Design/presets/themes/`).
- `isAutoHideEnabled`, `layoutPadding` e qualquer outro token de `system.ts`.
- Os casos que já existem em `cromo-css-real.spec.ts` — têm de continuar verdes **sem edição**.
- `src/styles/` — é da `plan-90`.
- `browser-tests/playwright.config.ts` e o ciclo de vida do harness — foram da `plan-86`.
- A presença e a composição dos widgets da barra (busca inclusive) — foram do cromo único ([[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]]); aqui só os três tokens de layout.
- Átomos fora do cromo. Densidade alcançando cada componente não é esta plan.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | §2.2 (a tabela de slots e o princípio), §2.3 (degradação), §2.4 e §2.4.1 (token de cromo vale nos dois modos, e o gate), §5.1 (o contrato de rolagem que não pode quebrar) |
| Spec fixa | `specs/arquitetura/04-contrato-de-tokens-e-paridade.md` | a paridade 1:1:1 — vale se nascer variável derivada |
| Spec fixa | `specs/arquitetura/02-design-engine.md` | como um token vira variável e chega ao CSS |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` | §2 (as três faixas) e a regra mobile-first — a vista dividida empilha no celular |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | §7.3 — como a medição de navegador mede, e por que relacional |
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | §4 (barril e prefixo) e §5 (catálogo) — o slot novo é superfície pública |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | §4.4.3 — valor oferecido no schema é contrato com o usuário final |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | §9.6 — o gate de paridade de cromo e os limites dele |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-arquitetura-design` | a regra de como estilo consome token |
| **Skill** | `ui-novo-componente` | se nascer token ou variável derivada |
| **Skill** | `test-unitario` | os testes em `jsdom` |
| Código | `gates/scripts/contrato/check-chrome-token-parity.mjs` | o que conta como consumidor, e a lista de órfãos |
| Código | `src/components/Layout/SarakAppChrome.tsx` | os slots e a região de conteúdo |
| Código | `src/components/Layout/chrome/ChromeTopbarBody.tsx` | o corpo do modo topbar — o caso do tablet |
| Código | `browser-tests/cromo-css-real.spec.ts` | o cabeçalho de limites e o idioma dos casos |
| Código | `browser-tests/fixtures/harness-entry.tsx` | `TOKEN_VARIANTS` e os elementos de prova |

# 5. Instruções de execução

**Vale para os três lotes:** a medição de navegador lê o `dist/`. Rode `npm run build` antes de cada medição,
ou ela mede o build anterior. Asserção de navegador é **relacional** — compara dois valores computados —,
nunca um número em px escrito à mão.

**Lote 1 — medir**

1. **Recortes de token de cromo.** A fixture ganha pelo menos um recorte por família: **cor** (fundo de
   barra), **gap**, **margem** e **estrutura**. Para cada um, um caso prova que o valor do tema chega ao
   valor computado do elemento do cromo. Use `getChromeTokens()` do gate para o inventário, e registre no
   resumo que token representa cada família.
2. **O caso do tablet.** Com viewport de 900 px, barra compacta e itens de navegação suficientes para
   disputar espaço, meça se algum item visível fica sem rótulo entre itens rotulados.
   - **Não reproduz** em 20 tentativas: o caso fica, verde, como regressão.
   - **Reproduz, e a causa está em classe ou estilo do item ou da barra:** conserte e deixe o caso.
   - **Reproduz por outra causa:** não conserte. Relate a medição e não deixe caso vermelho no arquivo.
3. O ponteiro de `harness-entry.tsx:2` passa a apontar para o que existe. O limite 3 do cabeçalho do
   `.spec.ts` descreve o que a medição passou a cobrir.
4. Entregue o lote 1 e **pare para o veredito**.

**Lote 2 — largura e densidade**

5. **`maxContentWidth`.** No cromo, a região de conteúdo não passa da largura do token e fica
   centralizada; com `100%`, ocupa tudo. O respiro por `layoutPadding` continua valendo nos quatro lados.
6. **`layoutDensity`.** No cromo, a densidade escala o **respiro e o espaçamento da região de
   conteúdo**: `compact` < `comfortable` < `spacious`. **`comfortable` é a identidade** — com ele, todo valor
   computado é exatamente o de hoje.
7. A `description` dos dois tokens passa a dizer **só** o que eles fazem.
8. Tire os dois de `ORPHAN_TOKENS`. `npm run chrome-token-parity:check` → verde.
9. Casos de navegador: largura limitada e centralizada num viewport mais largo que o token; `100%` ocupando
   tudo; a ordem `compact < comfortable < spacious` no respiro; e o caso **NÃO MUDA NADA** do `comfortable`.
10. `docs/migracoes.md` ganha a nota do que muda na tela e de como voltar ao comportamento anterior pelo
    próprio token.
11. Entregue o lote 2 e **pare para o veredito**.

**Lote 3 — vista dividida**

12. O `SarakAppChrome` ganha um slot para o segundo painel, no padrão de nome dos demais. Com
    `isSplitViewEnabled` ligado **e** o slot preenchido, a região de conteúdo mostra os dois painéis lado a
    lado no desktop e **empilhados** no celular. Faltando qualquer um dos dois, nada muda.
13. O contrato de rolagem ([[05-cromo-e-slots]] §5.1) continua valendo: o documento não rola.
14. Tire `isSplitViewEnabled` de `ORPHAN_TOKENS`; a lista fica vazia e o limite que a declarava sai.
15. `npm run build` — ele roda `catalog:check`, `barrel:check`, `public-types:check` e `prefix:check`; o slot
    novo tem de estar no catálogo.
16. `npm run dev-kit`. `npx tsc --noEmit` → zero erros. `npx vitest run` → verde.
    `npm run cromo-css-real:check` → verde.

# 6. Critérios de aceite

- [ ] A medição de navegador tem ao menos um caso por família de token de cromo (cor, gap, margem,
      estrutura), cada um provando que o valor do tema chega ao computado.
- [ ] O relato do tablet está resolvido por uma das três saídas do passo 2, com a medição no resumo.
- [ ] `browser-tests/fixtures/harness-entry.tsx` não aponta mais para arquivo inexistente.
- [ ] `maxContentWidth` limita e centraliza o conteúdo no cromo; `100%` ocupa tudo.
- [ ] `layoutDensity` ordena o respiro `compact < comfortable < spacious` no cromo, e `comfortable`
      computa exatamente os valores de antes.
- [ ] Com o token ligado e o slot preenchido, o `SarakAppChrome` mostra dois painéis lado a lado no desktop
      e empilhados no celular; sem um dos dois, o computado é o de antes.
- [ ] `ORPHAN_TOKENS` está vazia e `npm run chrome-token-parity:check` passa.
- [ ] Todos os casos que já existiam em `cromo-css-real.spec.ts` passam **sem terem sido editados**.
- [ ] `docs/migracoes.md` descreve o que muda na tela e como voltar.
- [ ] `npm run build`, `npx tsc --noEmit`, `npx vitest run` e `npm run cromo-css-real:check` verdes.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` novo. O `chrome-token-parity:check` já cobra a regra; esta plan **zera a lista de
exceções** dele. O efeito na tela é provado por caso de navegador e por teste do módulo.

- `git status` + `git diff --stat` → só os arquivos de §3.1.
- `git diff -- browser-tests/cromo-css-real.spec.ts` → só adições, mais o limite 3; nenhum caso antigo
  alterado.
- `git diff -- src/core/Design/schema/system.ts` → só `description` (e `cssVars`/`structuralConsumer`, se
  houver); nenhum default nem opção mudou.
- `git diff -- src/core/Design/presets/themes/` → vazio.
- `npm run build`, depois `npm run cromo-css-real:check` → verde.
- Mutação por fixture: `checkChromeTokenParity` com um token sintético sem consumidor → acusa. Prova que a
  lista vazia não desligou o gate.
- `node gates/scripts/contrato/check-chrome-token-parity.mjs` → verde, com `ORPHAN_TOKENS` vazia.
- `npx tsc --noEmit` → 0 erros. `npx vitest run` → verde.
- Leitura de `docs/migracoes.md` → a nota existe e diz como voltar.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md + specs/11-testes-e-cobertura.md + specs/01-gates-e-baseline.md + specs/07-responsividade-e-multidispositivo.md`

- **`05-cromo-e-slots`** — §2.2: o slot novo na tabela, com a região e o que acontece quando ausente.
  §2.4: o que largura máxima e densidade fazem na região de conteúdo, no cromo.
- **`11-testes-e-cobertura`** §7.3 — a medição cobre tema que sobrescreve token de cromo; a lista do que ela
  não vê perde esse item.
- **`01-gates-e-baseline`** §9.6 — o gate de paridade de cromo não tem mais lista de órfãos.
- **`07-responsividade-e-multidispositivo`** — a vista dividida empilha abaixo da faixa de desktop.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
