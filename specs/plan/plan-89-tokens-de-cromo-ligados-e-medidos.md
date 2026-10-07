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
  *(Emenda do revisor, 2026-10-06:)* **uma exceção, e só ela.** Desde a `plan-94`, o item de navegação com `href`
  renderiza `<a>` (link), e os casos antigos que localizam **item de navegação** por `getByRole('button', …)` não
  o acham mais. Nesses casos, e só nesses, troque o papel do localizador para `link`. Nada mais muda neles:
  nem asserção, nem viewport, nem nome. Localizador de controle que continua sendo botão (gaveta, botões de
  prova) fica como está.
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

## Resumo da execução — 2026-10-06

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
```text
 M .githooks/pre-commit
?? .claude/settings.local.json
```

**O que foi feito**
- Adicionei recortes nomeados para `topbarColor` (cor), `tabGap` (gap), `tabSectionMargin` (margem) e `isNavHidden` (estrutura) em `browser-tests/fixtures/harness-entry.tsx:45-58`.
- Acrescentei medições relacionais para os quatro recortes e um diagnóstico do tablet em 20 tentativas em `browser-tests/cromo-css-real.spec.ts:303-364`.
- Atualizei o limite 3 do cabeçalho para declarar os novos recortes (`browser-tests/cromo-css-real.spec.ts:42-46`) e troquei o ponteiro inexistente do harness pela spec de medição (`browser-tests/fixtures/harness-entry.tsx:1`).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/fixtures/harness-entry.tsx` | alterado | Quatro variantes de token de cromo e ponteiro corrigido. |
| `browser-tests/cromo-css-real.spec.ts` | alterado | Limites atualizados, quatro casos de token e medição do tablet. |

**Verificações executadas**
- `node --input-type=module -e "import { getChromeTokens } from './gates/scripts/contrato/check-chrome-token-parity.mjs'; ..."` → inventário confirmou `topbarColor`, `tabGap`, `tabSectionMargin` e `isNavHidden` como representantes das quatro famílias.
- `git diff --check -- browser-tests/cromo-css-real.spec.ts browser-tests/fixtures/harness-entry.tsx` → sem erros de whitespace.
- `npm.cmd run build` → código 0; gates de tokens, catálogo, barril, marca, tipos públicos e prefixo passaram nessa execução.
- `npm.cmd run cromo-css-real:check` → iniciou 27 casos; 13 terminaram antes da interrupção (8 passaram, 5 falharam). Nos casos novos, cor, margem e estrutura passaram; a primeira medição de gap comparou `23px` do token com `12px` de `column-gap` na topbar; o diagnóstico do tablet encontrou zero itens rotulados com o seletor inicial restrito a botões. A suíte foi interrompida após três casos preexistentes excederem o timeout de quatro minutos.
- `npm.cmd run cromo-css-real:check -- --grep "topbarColor|tabGap|tabSectionMargin|isNavHidden|nenhum item visível"` → o build parou em `catalog:check`, que declarou `docs/component-catalog.{json,md}` defasados; nenhum caso focado foi executado.

**Critérios de aceite — lote 1**
- [x] A fixture declara um token por família (cor, gap, margem e estrutura) — evidência: variantes em `browser-tests/fixtures/harness-entry.tsx:55-58`.
- [x] `topbarColor`, `tabSectionMargin` e `isNavHidden` chegaram aos valores computados na primeira execução — evidência: casos 2, 4 e 5 da saída Playwright.
- [ ] `tabGap` chega ao espaçamento computado — motivo: a primeira escolha de propriedade/viewport não acompanhou o token (`12px` versus `23px`); o caso foi movido para `row-gap` da navegação desktop e aguarda reexecução.
- [ ] O resultado do tablet foi medido em 20 tentativas — motivo: o seletor inicial contou apenas botões e retornou zero rótulos; o leitor agora inclui links, mas a nova medição não rodou porque `catalog:check` bloqueou o build.
- [x] `harness-entry.tsx` não aponta mais para arquivo inexistente — evidência: linha 1 aponta para `specs/specs/11-testes-e-cobertura.md §7.3`.
- [ ] Todos os casos preexistentes ficaram verdes sem edição — motivo: três casos sem alteração excederam o timeout esperando nomes via `getByRole('button', ...)`.

**Decisões e suposições**
- `isNavHidden` representa a família estrutural: a medição verifica que a topbar seleciona a altura computada de `--sarak-topbar-collapsed-height`.
- O caso de `tabGap` foi movido para desktop e mede `row-gap`, pois a tentativa inicial na topbar mediu `column-gap` diferente do token; essa escolha ainda aguarda confirmação.
- O leitor do tablet trata links e botões como itens de navegação e considera visíveis apenas elementos cujas caixas intersectam a navegação e o viewport.
- A execução parou no lote 1, conforme solicitado; lotes 2 e 3 não foram iniciados.

**Achados fora do escopo (não corrigidos)**
- `docs/component-catalog.{json,md}` — `catalog:check` reportou defasagem durante alterações concorrentes; os arquivos não foram lidos nem regenerados.
- `browser-tests/cromo-css-real.spec.ts:389` — o caso preexistente da sidebar extensa excedeu quatro minutos esperando `button` chamado `Seção 30`; não foi editado.
- `browser-tests/cromo-css-real.spec.ts:438,452` — os casos preexistentes de métrica mobile/tablet excederam quatro minutos esperando `button` chamado `Início`; não foram editados.

**Pendências / riscos**
- A validação final dos cinco casos novos depende de o gate `catalog:check` voltar a passar após a execução concorrente atualizar o catálogo.
- A suíte completa não terminou; além dos três timeouts antigos, gap e tablet ainda aguardam reexecução focada.

**Complemento factual**
- `specs/plan/plan-89-tokens-de-cromo-ligados-e-medidos.md` também foi alterado: o status passou a `🟠 Em revisão` e este resumo foi acrescentado de forma append-only.
- O comando completo do inventário foi `node --input-type=module -e "import { getChromeTokens } from './gates/scripts/contrato/check-chrome-token-parity.mjs'; console.log(JSON.stringify(getChromeTokens().map(({id, cssVars}) => ({id, cssVars})), null, 2));"`.

## Correção após o veredito — 2026-10-06

Este adendo preserva o resumo anterior e registra exclusivamente as correções dos quatro achados do veredito.

**Achados corrigidos**
- **Gap:** o caso mede `gap` no contêiner flex de abas dentro da navegação da topbar a 900 px. Com `cromo-gap`, o computado foi `23px`, igual a `--sarak-tab-gap`; sem o recorte, o caso falhou na comparação com o tema padrão (`8px`). O recorte foi restaurado e o caso passou.
- **Tablet:** o leitor considera links e botões. O diagnóstico encontrou 32 itens de navegação no DOM e `Início` como rótulo visível na primeira tentativa; as 20 tentativas passaram sem item visível sem rótulo entre itens rotulados. Saída aplicada: não reproduz, caso mantido como regressão.
- **Localizadores antigos:** os casos de navegação agora usam `link` para `Seção 30` e `Início` (métrica mobile, métrica e raio tablet, métrica desktop); `SarakButton` e o toggle do drawer seguem como `button`. O comentário do harness foi atualizado para refletir o papel `link`.
- **Suíte:** `npx.cmd playwright test --config=browser-tests/playwright.config.ts` terminou com 27/27 casos verdes, incluindo os localizadores de navegação corrigidos.

**Gate externo, registrado sem correção nesta plan:** `npm run catalog:check` passou sozinho antes da medição. `npm run build` e o wrapper `npm run cromo-css-real:check` pararam em `public-types:check`, que aponta `AuthLabelKey` e `LibraryTextKey` em `dist/index.d.ts` como não exportados em `src/index.ts` (alteração da execução paralela). O wrapper, portanto, não chegou a iniciar Playwright; os mesmos 27 casos foram executados diretamente após gerar os artefatos JS/CSS necessários. `src/index.ts` e arquivos das outras execuções permaneceram intocados.

---

## Resumo da execução — 2026-10-06 (lote 2)

**Resultado:** lote 2 entregue para veredito; lote 3 não iniciado.

**Estado do worktree ao iniciar:** `git status --short` foi registrado antes da primeira edição. Já havia alterações do lote 1 aprovado, de `plan-96`/`plan-99`, de `.githooks/pre-commit`, de arquivos gerados e de outras tarefas; esse conteúdo pré-existente não foi revertido nem formatado. Em `docs/migracoes.md`, só foi inserida a subseção deste lote dentro de `## 8.0.0 — um cromo por aplicação`.

**O que foi feito**
- O hook `useChromeDesignTokens` lê `maxContentWidth` e `layoutDensity`; um estilo compartilhado aplica largura de 100%, limite máximo centralizado e escala o padding responsivo. `comfortable` conserva a expressão de padding anterior. O estilo é usado nos corpos sidebar, topbar e mobile.
- Atualizei apenas as descrições desses dois tokens, removi ambos de `ORPHAN_TOKENS` e acrescentei testes do hook, do estilo e da integração nos três modos.
- A fixture ganhou dois recortes de largura e três de densidade. A medição de navegador cobre limite/centralização, `100%`, a ordem da densidade nos quatro lados e igualdade completa do estilo computado em `comfortable`.
- A nota de migração explica o efeito visual e como voltar à largura fluida (`maxContentWidth: '100%'`) e ao respiro anterior (`layoutDensity: 'comfortable'`).

**Verificações**
- `npm run catalog:check`, executado isoladamente antes de build/navegador → verde; o catálogo não foi regenerado.
- `npm run chrome-token-parity:check` → verde: 42 tokens cobertos; `isSplitViewEnabled` segue órfão para o lote 3.
- `npx vitest run` nos três arquivos de teste do cromo → 16/16 casos verdes.
- `npm run build` → verde após repetição com permissão de leitura ampliada; todos os gates do build passaram. A primeira tentativa no sandbox falhou ao resolver diretórios e shims do `tsup`.
- `npm run cromo-css-real:check` → 31/31 casos verdes. A primeira medição apontou que `max-width` sem `width: 100%` deixava a região encolher pelo conteúdo; após a correção, as duas medições de largura também passaram.
- `git diff --check` dos arquivos de código deste lote → limpo. A auditoria TypeScript não apontou violações nas novas funções; os avisos remanescentes ficaram nas funções/tipagens já existentes dos corpos consumidores e em heurísticas de hardcode de valores de schema e do cenário de teste (baixa confiança).

**Handoff:** status 🟠 Em revisão. Aguardar o veredito do lote 2; não iniciar o lote 3.

## Correção do veredito — 2026-10-06 (lote 2)

**Escopo:** somente o achado do último veredito, sobre a prova circular de `comfortable`.

- O caso circular foi substituído por uma comparação dos quatro paddings computados com um elemento de prova
  irmão que aplica `padding: var(--sarak-layout-padding, 16px)`, nos breakpoints mobile, tablet e desktop.
- O caso também mede a largura fluida (`maxContentWidth: '100%'`) contra a caixa do contêiner. O caso próprio de
  largura fluida passou a fazer a mesma comparação.
- **Mutação negativa:** numa cópia fora do repositório, multipliquei apenas o ramo `comfortable` por `1.25`.
  O novo caso falhou na primeira faixa, mobile: recebeu `40px` contra os `32px` do elemento de prova. A cópia e
  os artefatos temporários foram removidos.

**Verificações:**
- `npm run catalog:check` isolado passou antes das execuções de navegador; nenhum catálogo foi regenerado.
- `npm run cromo-css-real:check` foi tentado com contagem de processos em zero e parou em `guide:check`, que
  reportou `sarak-ui/docs/migracoes.md` defasado. Nenhum arquivo dessa execução paralela foi alterado.
- Após a falha do gate externo, `npx.cmd playwright test --config=browser-tests/playwright.config.ts` passou
  **31/31** usando o `dist/` da última build aprovada do lote 2. A correção não alterou o código do cromo; o
  build oficial desta rodada não chegou a compilar por causa do bloqueio acima.

**Handoff:** status 🟠 Em revisão. Aguardar o veredito desta correção; não iniciar o lote 3.

## Correção do veredito — 2026-10-06 (correção 2 do lote 2)

**Escopo:** exclusivamente os achados 2, 3 e 4 do último veredito.

- **Achado 2:** a expectativa de `ORPHAN_TOKENS` em
  `gates/scripts/contrato/__tests__/check-chrome-token-parity.test.mjs` agora é `['isSplitViewEnabled']`.
- **Achado 3:** atualizei a única linha divergente do snapshot de `PreviewCanvas`, incluindo largura fluida,
  limite de 1440 px e centralização:

  ```diff
  - style="color: var(--text-main, var(--color-theme-title, inherit)); padding: var(--sarak-layout-padding, 16px);"
  + style="color: var(--text-main, var(--color-theme-title, inherit)); width: 100%; max-width: 1440px; margin-inline: auto; padding: var(--sarak-layout-padding, 16px);"
  ```

- **Achado 4 — artefatos e gates:** `npm run guide`, `npm run catalog` e `npm run dev-kit` concluíram; o catálogo
  foi verificado separadamente com `npm run catalog:check` verde, sem regeneração para destravar gate.

**Verificações:**
- `npm run build` → verde, incluindo os gates de tipos públicos e os bundles JS, DTS e CSS.
- `npm run cromo-css-real:check` → verde, **31/31** casos de navegador.
- `npx tsc --noEmit` → verde.
- `npx vitest run` completo → **392/392 arquivos e 2.209/2.209 testes** verdes. Houve avisos de CSS/GLib do ambiente, sem falhas.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → baseline de 2026-08-11 preservado, sem regressões.

**Handoff:** status 🟠 Em revisão. Aguardar o veredito; não iniciar o lote 3.

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-06 — 🔴 Reprovado (lote 1)

**Antes de gravar:** a §10 foi relida no disco e estava vazia.

**O que está certo, e foi verificado por mim:**
- Escopo: só `browser-tests/fixtures/harness-entry.tsx` e `browser-tests/cromo-css-real.spec.ts`. No `.spec.ts`,
  o diff só remove o texto antigo do limite 3; nenhum caso antigo foi editado.
- O ponteiro da linha 1 do harness aponta para `specs/specs/11-testes-e-cobertura.md` §7.3, que existe.
- Os recortes de cor (`topbarColor`), margem (`tabSectionMargin`) e estrutura (`isNavHidden`) passaram na
  execução do executor; o inventário pelo `getChromeTokens()` está no resumo.

**A causa dos três timeouts não é desta plan.** Os itens de navegação do harness têm `href`
(`harness-entry.tsx`, `NAV_ITEMS`), e desde o `1093f51e` (`plan-94`) o `SarakMenuItem` com `href` seguro
renderiza `<a>`. Os casos antigos procuram `getByRole('button', { name: 'Seção 30' | 'Início' })` e não acham. **A
medição de navegador está vermelha desde aquele commit**, em casos que esta plan não podia editar. A §3.2 foi
**emendada nesta data**: nos casos que localizam item de navegação, e só neles, o papel passa a `link`.

**Achados — a correção é exclusivamente estes:**

1. **O recorte de gap não está provado.** A primeira medição comparou `23px` do token com `12px` de
   `column-gap`, e o caso foi trocado para `row-gap` na navegação desktop **sem ter rodado**. Critério violado:
   §6, *"cada um provando que o valor do tema chega ao computado"*. Rode o caso verde e mostre que ele **falha**
   sem o recorte (ou com o valor do tema igual ao padrão).
2. **O caso do tablet não foi medido.** Rode as 20 tentativas do passo 2 com o leitor que inclui links e
   registre o resultado, aplicando a saída correspondente do passo 2.
3. **Os casos antigos que acham item de navegação por `button`.** Aplique a emenda da §3.2: troque o papel
   para `link` só neles (são ao menos os de `Seção 30` e `Início`; `grep -n "getByRole('button'"` mostra os
   localizadores). Para cada um: falha antes da troca, passa depois.
4. **A suíte de navegador inteira não terminou.** Ao fim, `npm run cromo-css-real:check` completo e verde: os
   27 casos, os antigos e os novos.

**Circunstância, que não é achado:** o `build` desta medição para no `catalog:check`, porque a `plan-96`, em
execução, mexe nos componentes e só regenera o catálogo no fim. A correção só pode **medir** quando o
`catalog:check` estiver verde. Edite antes, se quiser, mas rode o `build` e o navegador depois disso, e nunca
regenere o catálogo você mesmo para destravar.

## Veredito — 2026-10-06 (correção 1) — 🟢 Aprovado (lote 1 — liberação parcial)

**Antes de gravar:** a §10 foi relida no disco: só o bloco de reprovação desta data, escrito por este revisor.

**Os quatro achados fecharam, medidos por mim:**

1. **Gap.** O caso `tablet (900px): tabGap chega ao gap computado dos itens da navegação` passa. Mutação numa
   cópia fora do repositório, com a fixture trocada para `'cromo-gap': {}`: o caso **falha** na asserção
   `cromo-gap precisa chegar ao estilo computado`. Ele tem dente.
2. **Tablet.** As 20 tentativas foram medidas com o leitor que inclui links, sem item visível sem rótulo entre
   itens rotulados. Saída "não reproduz": o caso fica como regressão.
3. **Localizadores antigos.** O diff só troca o papel. `readComputedMetric` ganhou o parâmetro
   `role: 'button' | 'link'` (padrão `button`), os quatro casos de métrica de item de navegação passam `'link'`,
   e o de `Seção 30` usa `getByRole('link')`. Asserção, viewport e nome não mudaram. Gaveta e botões de prova
   continuam `button`.
4. **Suíte de navegador.** Rodei `npx playwright test --config=browser-tests/playwright.config.ts` sobre o
   `dist/` atual: **27 de 27 verdes, em 1,2 min**. Os quatro casos que estavam vermelhos desde a `plan-94`
   estão entre eles.

**Circunstância registrada:** durante a correção, o `npm run cromo-css-real:check` completo não rodou, porque o
`build` parou no `public-types:check` (`AuthLabelKey` e `LibraryTextKey` citados em `dist/index.d.ts` sem
export no barril), na árvore da `plan-96`. A medição leu o `dist/` gerado só pelas etapas de JS e CSS. Sobre o
`dist/` atual, o `public-types:check` passa. A verificação integrada repete o `build` completo e o
`cromo-css-real:check` com as correções das plans 96 e 99 entregues.

**Liberação parcial.** O lote 1 está aprovado; o status volta a `🟡 Em execução`. O lote 2 (largura e
densidade) pode ser despachado.

## Veredito — 2026-10-06 — 🔴 Reprovado (lote 2)

**Antes de gravar:** a §10 foi relida no disco: só os blocos do lote 1, escritos por este revisor.

**O que está certo, e foi verificado por mim:**
- `src/core/Design/schema/system.ts`: só as `description` de `layoutDensity` e `maxContentWidth` mudaram,
  nenhum default nem opção. `src/core/Design/presets/themes/` não foi tocado.
- `check-chrome-token-parity.mjs`: só as duas linhas de `ORPHAN_TOKENS` saíram; `chrome-token-parity:check` →
  42 de 43 cobertos, com `isSplitViewEnabled` declarado para o lote 3.
- `resolveChromeContentStyle` (`chrome/chromeStructuralStyles.ts`) é a única fonte do estilo da região de
  conteúdo nos corpos sidebar, topbar e mobile; o fator de densidade é constante nomeada, e o ramo
  `comfortable` devolve a mesma expressão de padding que o `ChromeSidebarBody.tsx` usava.
- `npx tsc --noEmit` → 0 · `src/components/Layout` → 19 arquivos, 182 testes verdes ·
  `npx playwright test --config=browser-tests/playwright.config.ts` → **31 de 31 verdes** (58 s).
- A nota em `docs/migracoes.md` diz o que muda e como voltar (`maxContentWidth: '100%'`,
  `layoutDensity: 'comfortable'`).

**Achado — a correção é exclusivamente este:**

1. **O caso `NÃO MUDA NADA: layoutDensity confortável preserva todo o estilo computado atual` é circular.** Ele
   compara a página com tema padrão (`cromo-css-real.spec.ts:457-466`) contra a página com o recorte
   `cromo-densidade-confortavel` (`harness-entry.tsx:64`, `{ layoutDensity: 'comfortable' }`). Como o padrão
   do schema já é `comfortable` (`system.ts:32`), as duas páginas rodam o mesmo código com o mesmo valor, e o
   caso **não tem como falhar**: se o ramo `comfortable` passasse a escalar o padding, as duas mudariam juntas.
   Critério violado: §5 item 6 e §6 (*"`comfortable` computa exatamente os valores **de antes**"*). Faça o caso
   comparar a região de conteúdo com o que ela computava antes, por relação: sob `comfortable`, o padding dos
   quatro lados é igual ao valor computado de `--sarak-layout-padding` (lido por um elemento de prova com
   `padding: var(--sarak-layout-padding, 16px)`), nos três breakpoints; e a largura da região, com
   `maxContentWidth: '100%'`, é a do contêiner. Mostre no resumo que o caso **falha** com o ramo `comfortable`
   multiplicado por qualquer fator diferente de 1 (mutação numa cópia fora do repositório).

**Adendo ao mesmo veredito (2026-10-06): dois achados a mais, vindos da suíte completa.** Rodei `npx vitest run`
na árvore integrada (392 arquivos). As duas únicas falhas são deste lote, e a correção passa a incluí-las:

2. `gates/scripts/contrato/__tests__/check-chrome-token-parity.test.mjs` — o caso
   `checkChromeTokenParity mantém a lista de órfãos…` ainda espera `['layoutDensity', 'maxContentWidth',
   'isSplitViewEnabled']`, e a lista agora é `['isSplitViewEnabled']`. O lote mudou o gate e não o teste dele
   (o resumo rodou só os três testes do cromo). Atualize a expectativa para a lista real.
3. `src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.test.tsx` — o snapshot quebrou porque a região
   de conteúdo do cromo ganhou `width: 100%; max-width: 1440px; margin-inline: auto`. É o efeito esperado do
   lote (a prévia desenha o cromo real). Atualize o snapshot e diga no resumo que a única linha diferente é
   essa, com o diff colado.

Ao fim, `npx vitest run` **completo** e verde (não só os testes do cromo).

## Veredito — 2026-10-06 (correção 1 do lote 2) — 🔴 Reprovado

**Antes de gravar:** a §10 foi relida no disco: só os blocos deste revisor.

**Achado 1 (a prova circular do `comfortable`) — fechou.** O caso
`layoutDensity confortável preserva o padding computado nos três breakpoints` (`cromo-css-real.spec.ts:475`)
compara os quatro paddings da região de conteúdo com um elemento de prova que aplica
`padding: var(--sarak-layout-padding, 16px)`, em mobile, tablet e desktop; e a largura fluida com a caixa do
contêiner. O resumo registra a mutação (ramo `comfortable` × 1,25 → 40px contra 32px). A suíte de navegador,
rodada por mim → **31 de 31 verdes** (1,4 min).

**Os achados 2 e 3 do adendo continuam abertos.** O adendo está no mesmo bloco do veredito anterior, e o resumo
desta correção declara ter tratado "somente o achado do último veredito". Rodado por mim agora:

```
FAIL  gates/scripts/contrato/__tests__/check-chrome-token-parity.test.mjs > … mantém a lista de órfãos…
FAIL  src/features/DesignEngine/Canvas/__tests__/PreviewCanvas.test.tsx > … custom properties fantasma
```

**A correção é exclusivamente estes:**

2. `check-chrome-token-parity.test.mjs` — a expectativa de `ORPHAN_TOKENS` passa a ser a lista real
   (`['isSplitViewEnabled']`).
3. `PreviewCanvas.test.tsx` — atualize o snapshot, cuja única linha diferente é o estilo da região de conteúdo
   do cromo (`width: 100%; max-width: 1440px; margin-inline: auto`). Cole o diff no resumo.
4. **Fechamento, porque esta é a última execução aberta na árvore (as plans 96 e 99 já entregaram):** regenere os
   artefatos pelos comandos (`npm run guide`, `npm run catalog`, `npm run dev-kit`) e rode `npm run build`,
   `npm run cromo-css-real:check` (o wrapper, não o Playwright direto), `npx tsc --noEmit`, `npx vitest run`
   **completo** e `node gates/scripts/release/check-audit-baseline.mjs --with-tsc`. Hoje o `guide:check` está
   vermelho (`sarak-ui/docs/migracoes.md` defasado depois das notas de migração), e a regeneração pelo comando é
   o conserto.

## Veredito — 2026-10-07 (correção 2 do lote 2) — 🟢 Aprovado (lote 2 — liberação parcial)

**Antes de gravar:** a §10 foi relida no disco: só os blocos deste revisor.

**Os achados 2, 3 e 4 fecharam:**
- **Achado 2:** `check-chrome-token-parity.test.mjs:120` espera `['isSplitViewEnabled']`.
- **Achado 3:** o snapshot de `PreviewCanvas` mudou numa linha só, a do estilo da região de conteúdo; o diff
  está no resumo.
- **Achado 4:** os artefatos foram regenerados pelos comandos; `guide:check` voltou a verde.

**Verificação integrada, rodada por mim** com as plans 96 e 99 entregues, nenhum outro processo de
`vitest`/`build` ativo na largada da suíte, e a árvore inteira pronta para commit:
- `npx vitest run` → **392 arquivos, 2209 de 2209 verdes**;
- `npm run cromo-css-real:check` (o wrapper, com `build` completo) → **31 de 31**, e todos os gates do `build` `[OK]`;
- `npx tsc --noEmit` → 0;
- `check-audit-baseline --with-tsc` → igual ao baseline;
- 17 gates de contrato verdes (`guide`, `catalog`, `dev-kit`, `barrel`, `zero-brand`, `kit-names`,
  `token-types`, `icon-port`, `class-merge`, `gate-limits`, `section-pointers`, `build-info`, `deep-import`,
  `public-types`, `prefix`, `chrome-token-parity`, `plan-index`);
- a regra do Anel 0 sobre todas as linhas adicionadas do worktree → 0 achados.

**Liberação parcial.** Os lotes 1 e 2 estão aprovados e podem ser commitados. O lote 3 (vista dividida, e
`isSplitViewEnabled` fora de `ORPHAN_TOKENS`) não foi iniciado; o status volta a `🟡 Em execução`.

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
