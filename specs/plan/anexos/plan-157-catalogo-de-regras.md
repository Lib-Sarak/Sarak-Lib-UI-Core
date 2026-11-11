# Plan-157 — Catálogo de regras do kit de verificação (lote 0)

Escrito em 2026-11-10, para o dono aprovar junto com o ADR-025 antes do lote 1. Só leitura dos importadores; nada foi rodado contra
eles. Os caminhos `modules/…` e `packages/…` são do ERP; `login-*` são os dois de `Sarak-Lib-Login`. Contagens e `arquivo:linha` foram
conferidos em 2026-11-10 contra o código dos importadores, e os nomes públicos contra `sarak-ui/catalog.json` da lib no HEAD.

**Convenções.** *Porta* = onde a regra roda (P = plugin de ESLint; C = comando `sarak-ui verify`). *Dado* = de onde o detector lê; **novo**
= precisa de geração no lote 1 (nenhum nome da lib entra à mão no código do kit, R17). *Severidade* é a proposta para quando o importador
liga a regra; *recomendada* diz se entra no conjunto `recommended` — e **nenhuma entra antes da medição do lote 2**.

## Visão geral

| # | Regra | Porta | Dado | Severidade | Recomendada | Quem pediu |
|---|---|---|---|---|---|---|
| 1 | `single-entrypoint` | P | nome do pacote (`catalog.json › lib.name`) + opção do importador | erro | não (exige opção) | ERP `local-single-ui-entrypoint`; login (convenção, C4) |
| 2 | `no-deep-import` | P | `exports` do `package.json` da lib | erro | sim | contrato [[03-superficie-publica]] §2 — *acrescentada por mim, o dono veta* |
| 3 | `known-css-var` | P + C | `catalog.json › tokens.cssVars` | erro | sim | ERP A1 e C7; login C4 |
| 4 | `prefer-sarak-component` | P | **novo:** `verification.nativeEquivalents` | erro | depende da medição | ERP A10 e `local-ui-equivalence` |
| 5 | `no-reimplemented-piece` | P | `barrelExports` + **novo:** `verification.aliases` | aviso | depende da medição | ERP A2–A6 |
| 6 | `no-literal-color-font` | P + C | nenhum (análise do valor) | aviso | sim | ERP `ui-token` (50 falsos positivos em 2026-10-25) |
| 7 | `no-direct-wrapped-lib` | P | **novo:** `verification.encapsulated` | aviso | não até medir | ERP `ui-kit` (base) |
| 8 | `no-internal-class-selector` | P + C | prefixo `sarak-` (constante, não lista) | erro | sim | login C4 |
| 9 | `valid-spacing-value` | P | `catalog.json › tokens.spacing` + props de tipo `SarakLayoutGap` | erro | sim | login C4 ("prop inválida"); ERP I11/I36 — *acrescentada por mim, o dono veta* |

Ficou de fora, por não ter caso que reprove: nenhuma. Toda regra abaixo tem um caso escrito.

---

## 1. `single-entrypoint` — porta única

- **Barra:** import de `@sarak/lib-ui-core` (ou de subpath dele) em arquivo fora dos caminhos que o importador declara na opção
  `allow`. Sem a opção, a regra não faz nada: a lib não sabe onde fica a porta de cada importador.
- **Reprova:** com `allow: ['packages/ui-kit/src/**']`, `import { SarakButton } from '@sarak/lib-ui-core';` em
  `modules/commercial/web/src/pages/List.tsx`. Mensagem: "importe `SarakButton` pela porta única do projeto (`packages/ui-kit`)".
- **Passa:** o mesmo import em `packages/ui-kit/src/index.ts`; e `import { SarakButton } from '@erp/ui-kit'` em qualquer lugar.
- **Falso positivo esperado:** arquivo de teste que mocka a lib (o ERP exclui teste na regra dele) — a opção `allow` aceita glob de
  teste. Medido no ERP: 16 imports da lib em `packages/ui-kit/src`, 0 fora dele.
- **Limite:** não vê `require()` dinâmico nem import por variável.

## 2. `no-deep-import` — só o que está no `exports`

- **Barra:** import de caminho do pacote que não é uma chave do `exports` dele (`@sarak/lib-ui-core/dist/components/...`). O contrato
  é que a única porta é a raiz mais os subpaths publicados.
- **Dado:** o próprio `package.json` da lib, lido pelo plugin em tempo de execução (as chaves de `exports`) — não há lista no código.
- **Reprova:** `import X from '@sarak/lib-ui-core/dist/components/atomic/Buttons/SarakButton'`.
- **Passa:** `from '@sarak/lib-ui-core'`, `from '@sarak/lib-ui-core/testing'`, `import '@sarak/lib-ui-core/sarak.css'`.
- **Falso positivo esperado:** nenhum (o mapa é exato). **Sem ocorrência real nos três importadores** (busca por `@sarak/lib-ui-core/dist`
  em `modules/` e `src/` do ERP: 0); vale como trava preventiva, o que é o motivo de eu a marcar como acréscimo.

## 3. `known-css-var` — `var(--sarak-*)` tem de estar no catálogo

- **Barra:** `var(--sarak-X)` (com ou sem reserva) cujo `--sarak-X` não está em `catalog.json › tokens.cssVars`. A mensagem sugere os
  nomes públicos mais próximos (por prefixo de segmentos), tirados da mesma lista.
- **Reprova (casos reais, conferidos hoje no ERP):**
  - `modules/proposals/web/src/pages/proposal-ui.css:129` → `border-radius: var(--sarak-border-radius-md, 8px);`
  - `modules/proposals/web/src/pages/proposal-ui.css:154` → `var(--sarak-border-radius-lg, 12px)`
  - `modules/contracts/web/src/components/templateLayout.css:60` → `gap: var(--sarak-layout-gap-xs, 4px);`
  - `templateLayout.css:76` → `padding: var(--sarak-card-padding-lg, 24px);`
  - `templateLayout.css:77` → `var(--sarak-card-border)`

  Os cinco nomes continuam **ausentes** de `tokens.cssVars` hoje (conferido: 748 nomes, nenhum deles). Sugestões que a lista dá, por
  exemplo: `--sarak-card-border-radius`, `--sarak-layout-gap-sm`, `--sarak-card-padding-md`, `--sarak-card-border-width`.
- **Passa:** `var(--sarak-card-radius, 8px)`, `var(--sarak-layout-gap-md, 16px)`, `var(--sarak-primary-color, #19e3f0)` (as três estão
  na lista), e variável que o próprio importador declara (`--sarak-…` escrita no mesmo escopo analisado, ou na opção `ignore`).
- **Duas portas, um detector:** em `.css` pelo comando; em string de `.ts/.tsx` (`style={{ padding: 'var(--sarak-card-padding-md, 16px)' }}`,
  como em `login-completo/.../StandaloneScreen.tsx:18`) pelo plugin. A função que acha o `var()` é a mesma.
- **Falso positivo esperado:** baixo. O caso é o importador que declara a própria variável com o prefixo `sarak-`; a opção `ignore` o cobre.
- **Limite:** `var()` montado por concatenação (`` `var(--sarak-${nome})` ``) não é visto.

## 4. `prefer-sarak-component` — elemento nativo com par na lib

- **Barra:** elemento JSX nativo que tem componente equivalente, **respeitada a condição** do par. O par e a condição vêm de dado gerado
  (R17), nunca de lista no plugin.
- **Dado novo — `verification.nativeEquivalents`:** uma tag de JSDoc no componente que substitui o elemento (ex.: `@replaces h2 h3`;
  `@replaces section[contains:h2..h6]`; `@replaces nav[contains:a]`), coletada pelo gerador. O vocabulário da condição é pequeno e
  fechado: `contains:<elemento>`. O ERP usa hoje 7 pares, 3 deles condicionais.
- **Reprova:**
  - `<h2 className="titulo">Pedidos</h2>` → "use `SarakSection` (título) ou `SarakTypography as="h2"`".
  - `<section><h2>Itens</h2>…</section>` → "use `SarakSection`" (condição: `section` com título dentro).
  - `<fieldset>…</fieldset>` → "use `SarakFormSection`".
- **Passa:**
  - `<SarakSection title="Pedidos">…</SarakSection>`.
  - `<section hidden={editor.currentStep !== 1}>…</section>` **sem** título dentro (caso real, `OrderConditionsSteps.tsx:44`, e há outras
    `section` assim no ERP): sem a condição a regra acusaria falso em massa.
- **Medido na estreia do ERP (2026-11-02, rc.4):** 171 violações — `h2` 77, `section` 59, `h3` 14, `h1` 6, `fieldset` 5, `header` 2,
  `nav` 1, peças 7. Hoje 0 no gate do ERP.
- **Falso positivo esperado:** `table`/`dl` dentro de HTML de documento gerado (contrato, e-mail), onde não há componente da lib; e
  `h2` dentro de conteúdo markdown renderizado por JSX. Severidade `erro` só é segura se o importador conseguir silenciar por arquivo.
- **Limite:** JSX dinâmico (`React.createElement(tag)`) e o elemento escolhido por variável não são vistos — o mesmo limite que o ERP
  declara na regra dele, agora menor porque a condição é lida na árvore, não em texto.

## 5. `no-reimplemented-piece` — peça reescrita à mão

É a regra mais difícil, e o sinal precisa ser dito por extenso: **um nome local parecido com um nome público não prova reescrita.**

- **Barra:** arquivo ou `export` de nível de módulo cujo nome indica uma peça que a lib já entrega. Dois sinais, em ordem de confiança:
  - **S1 — nome.** O identificador exportado, ou o nome do arquivo, é igual a um nome de `barrelExports` (exato, ou sem o prefixo
    `sarak`/`Sarak`, sem diferença de caixa). Sem dado novo.
  - **S2 — apelido registrado.** Uma tag de JSDoc na peça pública lista nomes que o importador costuma escrever no lugar
    (`@replaces LinkPagination isValidBrazilianCnpj`), gerada para `verification.aliases`. Só vale o que alguém já viu e registrou.
- **Cobertura medida sobre os cinco casos conhecidos do ERP (A2–A6), todos ainda no código dele hoje:**

| Caso | Arquivo no ERP | Substituto público | Sinal |
|---|---|---|---|
| A2 | `packages/ui-kit/src/errorMessage.ts:26` — `export function errorMessage` | `sarakErrorMessage` | **S1** (sem prefixo, igual) |
| A3 | `packages/ui-kit/src/LinkPagination.tsx:48` — `LinkPagination` | `SarakPagination` com `getPageHref` | **S2** (nome não coincide: `LinkPagination` ≠ `Pagination`) |
| A4 | `packages/ui-kit/src/DocumentFrame.tsx:105` — `DocumentFrame` | `SarakDocumentFrame` + `sarakPrint` | **S1** |
| A5 | `packages/ui-kit/src/documentValidation.ts:24` — `isValidBrazilianCnpj` | `sarakIsValidCnpj` | **S2** (nome não coincide) |
| A6 | `packages/ui-kit/testing/index.tsx:32,52,64` — exporta `SarakDataTable`, `SarakChartEngine`, `SarakPDFViewer` | `createSarakKitMock` (subpath `testing`) | **S1** (nome **exato** de peça do barril) |

  S1 pega 3 de 5 sem dado novo; os outros 2 só com o apelido. Nota: o A6 é um dublê deliberado de teste, então a mensagem tem de dizer
  "a lib entrega `createSarakKitMock`", não só "nome repetido".
- **Reprova:** `export function errorMessage(cause: unknown): string { … }` em `packages/ui-kit/src/errorMessage.ts` → "a lib entrega
  `sarakErrorMessage(error, fallback?)`".
- **Passa:** um `const errorMessage = sarakErrorMessage(err)` local (variável, não export); `export function formatDate` (a lib não tem
  nome igual); e um export `DocumentFrame` num pacote que não importa a lib.
- **Falso positivo esperado:** o maior do conjunto. Nome genérico (`Pagination`, `Notice`) coincide por acaso com peça que faz outra
  coisa. S1 só olha **export de módulo e nome de arquivo**, nunca variável local, para conter isso; o lote 2 mede o resto.
- **Limite:** não compara comportamento. "Reescreve" aqui significa "tem o nome de".

## 6. `no-literal-color-font` — cor ou fonte fora de token

- **Barra:** literal de cor (`#hex`, `rgb()`, `hsl()`, nome de cor) ou de família de fonte em declaração de estilo, **fora de** `var(--x, <reserva>)`.
- **Reprova:** `color: #19e3f0;` em `.css`; `style={{ background: '#fff' }}`; `font-family: 'Inter', sans-serif`.
- **Passa:** `color: var(--sarak-primary-color, #19e3f0)` — **o caso que o motor do ERP acusava em falso: 50 avisos em 2026-10-25, todos
  falso positivo, 0 em 2026-11-02**; e as palavras-chave `transparent`, `inherit`, `currentColor`.
- **Falso positivo esperado:** cor legítima em `<canvas>`/SVG de gráfico, em documento impresso e em e-mail. A regra aceita a opção
  `allow` por glob.
- **Limite:** não resolve variável de JS (`const cor = '#fff'; <div style={{ color: cor }} />`).

## 7. `no-direct-wrapped-lib` — biblioteca que a lib encapsula

- **Barra:** import direto de pacote que a lib já embrulha num componente (`echarts`, `echarts-for-react`, `react-markdown`,
  `pdfjs-dist`, `reactflow`…), com a mensagem apontando o componente.
- **Dado novo — `verification.encapsulated`:** tag de JSDoc no componente-casca (ex.: `@encapsulates echarts echarts-for-react` em
  `SarakChartEngine`). Não se deriva de `peerDependencies`: `react`, `clsx` e `date-fns` também são peers e o importador os usa
  legitimamente — separar uma coisa da outra é exatamente o dado que falta.
- **Reprova:** `import ReactECharts from 'echarts-for-react';` fora da porta → "use `SarakChartEngine`".
- **Passa:** `import { SarakChartEngine } from '@sarak/lib-ui-core';`; e `import clsx from 'clsx'`.
- **Falso positivo esperado:** o importador precisa da biblioteca para algo que a casca não expõe — o caso típico é um ícone
  `lucide-react` fora do `IconMap`. Por isso a regra **não entra no `recommended` antes de medir**.
- **Contagem no ERP:** sem registro; 0 imports diretos de `lucide-react`/`recharts`/`framer-motion` em `modules/*/web` na busca de hoje.

## 8. `no-internal-class-selector` — seletor por classe interna

- **Barra:** seletor de classe da lib em teste ou em CSS do importador: string literal em `querySelector`/`querySelectorAll`/`closest`/
  `locator`/`matches` contendo `.sarak-<x>` ou `[class*="sarak"]`/`[class^="sarak"]`, e regra de `.css` com o mesmo seletor. As classes
  internas mudam sem aviso (só o que está no barril tem retrocompatibilidade).
- **Dado:** só o prefixo `sarak-`, que é convenção e não lista de nomes — não há lista de classe a transcrever.
- **Reprova:** `page.locator('.sarak-card')`; `.sarak-card { margin: 0 }` em `.css` do importador.
- **Passa:** `[data-sarak-content]`, `[data-theme-id="…"]`, `getByRole(...)`, `getByTestId('sarak-panel-apply')`, e a variável
  `--sarak-primary-color`.
- **Ocorrência hoje:** **0** — a busca por `.sarak-<x>`, `[class*=` e `locator(` com classe em `modules/` e `tests/` dos dois logins
  não achou nenhum. O custo de rodadas que o relato do login descreve veio de antes; a regra é preventiva e o caso que reprova é o acima.
- **Falso positivo esperado:** ~0. Pode acusar um seletor sobre classe do próprio importador que use o prefixo `sarak-`.

## 9. `valid-spacing-value` — valor de espaçamento que cai no padrão sem avisar

- **Barra:** nas props cujo tipo é `SarakLayoutGap` (e as irmãs de espaçamento que o catálogo tipa assim), um literal string que não é
  um token de `tokens.spacing` e não é um comprimento CSS (`16px`, `1rem`, `0`, `var(--x, 16px)`, `calc(…)`). O resolutor da lib
  só avisa no console e cai no padrão — é o silêncio que a regra fecha.
- **Dado:** `catalog.json › tokens.spacing` (`spacing-xs`…`spacing-xl`) e a lista de props de tipo de espaçamento, ambos já gerados.
- **Reprova:** `<SarakFlex gap="md">` → "use `spacing-md`" (é o defeito `gap="md"` que os moldes da própria lib chegaram a trazer, I36).
- **Passa:** `<SarakFlex gap="spacing-md">`, `gap="16px"`, `gap="var(--sarak-layout-gap-md, 16px)"`, `gap={gap}` (variável).
- **Falso positivo esperado:** ~0 para literal; variável não é vista.
- **Ocorrência hoje:** 0 `gap="md"` nos 5 moldes do kit, medido pelo ERP em 2026-11-10; o login relata "prop inválida" como custo de
  rodadas anteriores, sem ocorrência atual registrada. **Acréscimo meu** à lista da plan, a partir desse relato.

---

## O que este catálogo deixa para o lote 1 e para o lote 2

- **Lote 1** constrói o que o dono aprovar daqui, desligado por padrão, com o dado gerado.
- **Lote 2** roda **todas** contra o ERP (`packages/ui-kit`, `modules/*/web`) e os dois logins, com configuração em `C:\tmp\`, e fecha a
  coluna *Recomendada*. O que precisa estar pego, sem exceção: os cinco `--sarak-*` do §3, e as peças do §5 que ainda estiverem no código
  do ERP (hoje, todas as cinco).
