---
tipo: "plan"
titulo: "Fazer o estilo de elemento da lib ceder à classe utilitária"
objetivo: "Fazer toda classe utilitária aplicada a um elemento vencer o estilo padrão que a lib impõe a esse elemento, mantendo o padrão onde não há classe"
dominio: "Sarak-Lib-UI-Core / Design Engine / CSS publicado"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "css", "cascade-layers", "tailwind", "botao", "tipografia"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[arquitetura/02-design-engine]]", "[[specs/11-testes-e-cobertura]]", "[[013-item-de-navegacao-como-atomo-proprio]]", "[[015-metrica-do-item-de-navegacao-horizontal]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/05-cromo-e-slots.md · arquitetura/02-design-engine.md"
---

# 1. Objetivo

Num elemento que carrega uma classe utilitária — `rounded-full`, `hover:bg-*`, `font-mono`, `border-dashed`,
`text-2xl` —, a classe decide o valor computado. O estilo padrão que a lib dá a `button`, `input`, `select`,
`textarea`, títulos e texto continua valendo **onde não há classe**.

# 2. Contexto

**O sintoma que já estava registrado.** O item de navegação horizontal **nunca** renderizou como pílula,
embora a pílula seja contrato ([[05-cromo-e-slots]] §2.1.1 · [[013-item-de-navegacao-como-atomo-proprio]]).
Ele computa o raio do botão de ação. O `browser-tests/cromo-css-real.spec.ts:165` mantém isso como
`test.fail`.

**A causa, medida pelo revisor em 2026-09-13 — e ela é maior e diferente do que o registro dizia.** O
registro atribuía o defeito à especificidade de uma regra "fora de `@layer`". **Não é isso.** O `_utilities.css`
é importado em camada (`src/styles/sarak-base.css:17`, `layer(sarak-lib)`), e a ordem das camadas no CSS
publicado é:

```
dist/sarak.css         → properties, theme, base, components, utilities, sarak-lib
dist/sarak-scoped.css  → a mesma ordem
```

A camada da lib vem **depois** de `utilities`. Entre camadas, a posição decide, não a especificidade: **toda**
declaração normal da `sarak-lib` vence **toda** utilitária do Tailwind no mesmo elemento. Consequência:
**baixar a especificidade (`:where()`) não conserta nada.** O conserto é de camada.

**O que está hoje na camada da lib e mira elemento ou atributo solto** — a regra vence qualquer classe que
escreva a mesma propriedade:

| Arquivo | Regra | O que ela anula |
| --- | --- | --- |
| `src/styles/_utilities.css:2` | `[class*="border"]` → `border-style` | `border-dashed`, `border-dotted` em qualquer elemento |
| `src/styles/_utilities.css:29-35` | `button:not(.p-0)` → raio e `transition` | todo `rounded-*` em todo `<button>` — a pílula, o `rounded-xl` da sidebar |
| `src/styles/_utilities.css:37-40` | `input, select, textarea` → raio | todo `rounded-*` em campo |
| `src/styles/_utilities.css:42-45` | `button:hover` → fundo `--theme-primary-hover` + `transform` | todo `hover:bg-*` em botão, inclusive o fundo de hover do item de navegação por token |
| `src/styles/_utilities.css:47-52` | `button:active` → fundo + `transform` | todo `active:*` em botão |
| `src/styles/_utilities.css:57-61` | `button:focus-visible` → `outline` + `box-shadow` | todo `focus-visible:*` em botão |
| `src/styles/_typography.css:2-35` | `h1`–`h6`, `body` → família, cor, tamanho, peso | todo `text-*`/`font-*` em título |
| `src/styles/_typography.css:40-41` | `h1, h2, h3` (com `!important`) e `body, span, p, div` → família | `font-mono` e toda família por classe em texto comum |

**E alcança o consumidor, não só a lib.** Em modo app o CSS da lib aplica à árvore inteira: os botões e
textos do **próprio** ERP também perdem as utilitárias dele para essas regras. Consertar muda a aparência
do consumidor para melhor — é o que ele declarou e não recebia —, e isso precisa de nota de migração.

**Consequência esperada, e que não é regressão desta plan.** Com o `hover:bg-*` do item de navegação
passando a vencer, o fundo de hover passa a ser o do token (`topbarHoverColor`/`sidebarHoverColor`), cujo
default é `transparent`. Parte dos temas shippados fica sem fundo de hover. Isso é autorado nos temas na
recalibração do catálogo, que vem depois desta plan. **Não** mude default de token aqui.

# 3. Escopo

## 3.1 Dentro
- `src/styles/sarak-base.css` — a declaração e a ordem das camadas.
- `src/styles/_utilities.css` · `src/styles/_typography.css` — mover as regras da tabela da §2 para a camada
  certa. O conteúdo das regras **não** muda, só a camada em que moram.
- Um arquivo novo em `src/styles/` para os padrões de elemento, **se** a solução exigir.
- `scripts/build-scoped-css.mjs` — **só se** o CSS escopado do modo embarcado não herdar a ordem nova sozinho.
- `src/styles/__tests__/` — ajustar os testes que leem esses arquivos por texto (ex.: `focusRing.test.ts`),
  se a regra mudar de arquivo.
- `browser-tests/cromo-css-real.spec.ts` · `browser-tests/fixtures/harness-entry.tsx` — os casos novos (§5 passo 4).
- `docs/migracoes.md` — a nota do consumidor, sob a entrada da **7.0.0**.
- `dist/` · `sarak-ui/` — **só pelo build**.

## 3.2 Fora
- **Valor** de qualquer regra, token ou default: raio, cor de hover, fonte. Esta plan move camada, não muda estilo.
- Default de `topbarHoverColor`/`sidebarHoverColor` (§2, último parágrafo).
- As regras da camada da lib que miram **classe própria** (`.rounded-theme`, `.border-theme`, `.bg-theme-card`,
  `[data-surface]`, `[data-sx-texture]` e afins): são opt-in por classe e ficam onde estão.
- Componentes (`src/components/**`, `src/core/**`) — se um átomo dependia do padrão perder para a própria
  classe, isso é achado, não conserto desta plan.
- O consumidor (ERP), nem código nem dado.

## 3.3 Emenda — 2026-09-13 (três decisões levantadas pelo executor durante a execução)

A execução mediu três casos em que *"mover sem mudar o conteúdo"* quebraria o próprio objetivo da plan. As
três decisões abaixo **ampliam** a §3.1 e **prevalecem** sobre a frase *"o conteúdo das regras não muda"*
**só nestes três pontos**.

1. **`[class*="border"]` — acrescentar a variável do Tailwind.** Toda utilitária de borda (`border`,
   `border-2`, `border-t`…) escreve `border-style` por `var(--tw-border-style)`. Movida como está, a regra
   perde para a utilitária, e o token `borderStyle` morre nos elementos com `border`. A regra movida passa a
   declarar também `--tw-border-style: var(--border-style, solid)`. Com isso:
   - `border` + token `dashed` → `dashed`: é o comportamento de hoje, mantido;
   - `border-dashed` + token `solid` → `dashed`: é o que a plan conserta.

   Os dois entram como casos do harness.

2. **`.rounded-btn` passa a ler os cantos.** Entra na §3.1: `src/styles/_theme.css`, a classe
   `.rounded-btn`. Hoje os sete usos dela são `<button>` e recebem os tokens de canto (`btnRadiusTL/TR/BR/BL`)
   pela regra de botão. Com a regra de botão cedendo, a classe própria vence e os cantos param de chegar. No
   `minimalist-airy` (tema de referência) o botão iria de pílula para quadrado.

   `.rounded-btn` passa a compor os quatro cantos, com o raio mestre como reserva de cada um — o mesmo valor
   que a regra de botão entregava. **Isto preserva o comportamento de hoje.** O caso "não muda nada" do
   harness passa a usar **um valor que importa**: `SarakButton` com mestre `0` e cantos `9999px` computa
   `9999px`. Um tema com mestre igual aos cantos não prova nada.

3. **A família de `h1`–`h3` perde o `!important`** (`_typography.css:40`). Ele não serve para herança,
   porque regra de elemento já vence o valor herdado. Serve só para vencer a classe no próprio título, que é
   exatamente o defeito desta plan. Medido pelo revisor: o único título da lib com classe de família é
   `src/features/DesignEngine/Canvas/Mocks/TableMock.tsx:122` (`<h3 … font-mono>`). Hoje ele renderiza com a
   fonte de título, contra o que está escrito; passa a renderizar mono. Sem o `!important`, a regra vai para a
   camada dos padrões de elemento, como as demais. Caso no harness: `h2.font-mono` → família mono, e `h2` sem
   classe → família de título.

**O que fica na camada final, e é limite declarado:**
- `body`, porque o `line-height` de `_base.css` o prenderia;
- o `transform !important` do botão ativo.

Os dois vão no resumo e na nota de migração como o que ainda não cede à classe.

**Arquivos de depuração.** `browser-tests/.debug-hover.tmp.mjs`, `.debug-ref.tmp.mjs` e
`.measure-scenarios.tmp.mjs` não entram na entrega. Apague-os antes do resumo.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | §2.1.1 — o contrato da pílula e a nota da regra global; §2.4 — os tokens de hover |
| Spec fixa | `specs/arquitetura/02-design-engine.md` | como o CSS da lib é montado e publicado |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | §7 — o harness de navegador, o que ele mede e como roda |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R24 (modo embarcado não vaza) · R35 (a classe do chamador vence a do átomo — esta plan é a mesma regra, uma camada abaixo) |
| ADR | `specs/adr/013-item-de-navegacao-como-atomo-proprio.md` · `015-metrica-do-item-de-navegacao-horizontal.md` | a métrica de pílula que precisa aparecer |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` · `ui-arquitetura-design` | regra de CSS do Design Engine |
| Skill | `test-e2e` | os casos do harness |
| Código | `src/styles/sarak-base.css` · `_utilities.css` · `_typography.css` | o que muda |
| Código | `browser-tests/README.md` · `build-harness.mjs` · `playwright.config.ts` | como o harness constrói e roda |
| Arquivo | `dist/sarak.css` · `dist/sarak-scoped.css` | onde a ordem de camadas se confere depois do build |

# 5. Instruções de execução

1. **Medir antes.** Rode `npm run cromo-css-real:check` e registre a saída: o `test.fail` da pílula é o ponto
   de partida. Registre também a ordem de camadas dos dois arquivos de `dist/` antes da mudança.

2. **Reordenar.** Os padrões de elemento da tabela da §2 passam a morar numa camada que venha **depois** do
   preflight do Tailwind (`base`) e **antes** de `utilities`. Assim eles sobrepõem o reset, mas cedem à
   classe. Onde a regra carrega `!important`, lembre que entre camadas a ordem se inverte para declarações
   importantes. Meça o resultado, não presuma. O resto da camada da lib fica onde está.

3. **Conferir os dois artefatos.** Depois de `npm run build`, a ordem de camadas de `dist/sarak.css` **e** de
   `dist/sarak-scoped.css` coloca a camada dos padrões antes de `utilities`. O escopado não pode vazar para
   fora do escopo (R24): rode os testes de modo embarcado da suíte.

4. **Os casos do harness.** Em `cromo-css-real.spec.ts`:
   - o `test.fail` da pílula vira `test`, **e passa**: o raio do item horizontal é o da pílula, diferente do
     raio do botão de referência;
   - **o caso "não muda nada":** o `SarakButton` de referência, sem classe de raio, continua computando o
     raio do token de botão;
   - um `<button>` com `rounded-full` computa o raio da classe;
   - sob hover, um `<button>` com `hover:bg-*` computa o fundo da classe, e um sem classe de hover computa o
     fundo de hover do tema — **as duas direções**;
   - um `<span class="font-mono">` computa a família mono, e um `<span>` sem classe computa a família do tema;
   - um elemento com `border border-dashed` computa `dashed`.

   Os elementos de prova entram na fixture ao lado do botão de referência, nomeados para o teste mirar por
   papel ou texto.

5. **Nota de migração.** Em `docs/migracoes.md`, sob a entrada da **7.0.0**: o que muda para o consumidor
   (as utilitárias dele passam a vencer o padrão de elemento da lib), o que ele pode ver de diferente (raio,
   hover e fonte que ele declarou e não recebia) e o que fazer se dependia do comportamento antigo.

6. `npm run build`, `npm run cromo-css-real:check`, `npm run audit:baseline` e a suíte inteira
   (`npx vitest run --maxWorkers=3`). Leia a saída de cada um.

# 6. Critérios de aceite

- [ ] Nos dois `dist/*.css`, a camada dos padrões de elemento vem antes de `utilities`. A ordem medida está
      no resumo, antes e depois.
- [ ] O caso da pílula passa como `test`. Não resta `test.fail` nem `skip` no arquivo.
- [ ] Os casos do passo 4 existem e passam, incluindo "não muda nada" e as duas direções do hover.
- [ ] Nenhum valor de estilo mudou: o diff das regras movidas mostra só mudança de camada ou de arquivo — com
      as três exceções da §3.3, cada uma com os seus casos no harness.
- [ ] A nota de migração está sob a 7.0.0 e diz o que o consumidor pode ver de diferente.
- [ ] `audit:baseline` sem regressão; suíte inteira verde. Falha em arquivo não tocado foi rodada isolada
      antes de ser atribuída ([[00-backlog]] #5).
- [ ] Nenhum comentário novo cita plan.

# 7. Como verificar (uso do revisor)

**Gate:** `cromo-css-real:check` (existente, job de CI) — passa a cobrar que a classe utilitária vence o
padrão de elemento da lib em raio, hover, família e estilo de borda, e que o padrão continua valendo sem classe.

- `git status` + `git diff --stat` → só a §3.1, mais `dist/`/`sarak-ui/` do build.
- Ler as regras movidas lado a lado com o original: o valor é idêntico.
- `npm run cromo-css-real:check` → verde, sem `test.fail`.
- **Mutação:** devolver temporariamente a camada dos padrões para depois de `utilities` → os casos de raio,
  hover, família e borda caem, e o caso "não muda nada" continua de pé. Restaurar byte a byte e registrar
  quantos caíram.
- Ler a ordem de camadas dos dois `dist/*.css` por script.
- `npx vitest run --maxWorkers=3 > arquivo 2>&1` e ler a saída.

# 8. Destino da síntese

**Destino:** `specs/05-cromo-e-slots.md` · `arquitetura/02-design-engine.md`

- **`05-cromo-e-slots`** §2.1.1 — sai o aviso *"a pílula é contrato, e hoje não renderiza"*. Na §9, a
  linha do contrato da pílula passa de ⚠️ *falha esperada* para ✅ gate.
- **`arquitetura/02-design-engine`** — a ordem de camadas do CSS publicado, como verdade estrutural. Texto
  pronto para transporte:

  > **A classe vence o padrão de elemento.** O CSS publicado declara as camadas numa ordem fixa: o preflight
  > do Tailwind, depois os **padrões de elemento da lib** (botão, campo, título, texto), depois as
  > utilitárias, e por último as **classes próprias da lib**. Num elemento com classe utilitária, a classe
  > decide; sem classe, vale o padrão da lib. Regra que mira elemento ou atributo solto nunca mora na camada
  > final — lá ela venceria toda classe de todo elemento, da lib e do consumidor. A prova é o
  > `cromo-css-real:check`, em navegador real.

---

# 9. Resumo da execução

## Resumo da execução — 2026-09-13

**Resultado:** Concluído

**O que foi feito**
- `src/styles/_elements.css` (novo) — recebe os padrões de elemento da tabela da §2: a ponte
  `[class*="border"]` (`:27`), `h1`–`h6` e os blocos `h1`/`h2`/`h3` (`:30-55`), `h3, h4` (`:57`),
  `h1, h2, h3` sem `!important` (`:61`), `body, span, p, div` (`:62`), `button:not(.p-0)` (`:65`),
  `input, select, textarea` (`:73`), `button:hover:not(.p-0)` (`:78`), a parte normal de
  `button:active:not(.p-0)` (`:84`) e `button:focus-visible` (`:92`). O cabeçalho explica a camada, por que
  subcamada de `components` e por que `!important` não mora ali.
- `src/styles/sarak-base.css:9-13` — `@import "./_elements.css" layer(components.sarak-elements);`, com o
  comentário da ordem de camadas.
- `src/styles/_utilities.css` — saem as regras movidas. Ficam `.bg-theme-card:active` com o conteúdo
  inteiro e `button:active:not(.p-0) { transform … !important }`: a lista de seletores original
  (`button:active:not(.p-0), .bg-theme-card:active`) foi separada, e cada declaração segue com o mesmo valor.
- `src/styles/_typography.css` — saem `h1`–`h6`, `h1`/`h2`/`h3`, `h3, h4`, `h1, h2, h3 !important` e
  `body, span, p, div`. Fica o `body` (§3.3, limite declarado), com o motivo em comentário.
- **§3.3.1** — `_elements.css:27`: a ponte declara também `--tw-border-style: var(--border-style, solid)`.
- **§3.3.2** — `src/styles/_theme.css:86-94`: `.rounded-btn` compõe os quatro cantos
  (`var(--sarak-btn-radius-tl, var(--radius-btn))` e assim por diante), com o mestre como reserva.
- **§3.3.3** — `h1, h2, h3 { font-family: var(--font-heading); }` sem `!important`, em `_elements.css:61`,
  depois de `h3, h4`, na mesma ordem relativa que tinha em `_typography.css`.
- `src/styles/__tests__/focusRing.test.ts` — lê `_elements.css`, onde a regra de foco passou a morar. A
  variável local se chama `elements`, e o nome do terceiro caso cita o arquivo novo.
- `browser-tests/fixtures/harness-entry.tsx` — `ElementDefaultProbes`: oito elementos de prova em HTML
  nativo, ao lado do botão de referência. Entra também `?tema=` com dois recortes de tokens:
  `borda-tracejada` (`borderStyle: dashed`) e `botao-cantos` (mestre 0, cantos 9999).
- `browser-tests/cromo-css-real.spec.ts` — o `test.fail` da pílula vira `test`. Entram 10 casos, e os
  limites declarados (R18) foram revistos: itens 4, 8 e 9 do cabeçalho.
- `docs/migracoes.md:8` — a entrada "7.0.0 — A classe utilitária passa a vencer o estilo padrão que a lib dá
  a botão, campo, título e texto", no topo.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/styles/_elements.css` | criado | padrões de elemento na subcamada `components.sarak-elements` |
| `src/styles/sarak-base.css` | alterado | import da camada nova e comentário da ordem |
| `src/styles/_utilities.css` | alterado | saem as regras de elemento; fica o `transform !important` do ativo |
| `src/styles/_typography.css` | alterado | saem as regras de título e texto; fica o `body` |
| `src/styles/_theme.css` | alterado | `.rounded-btn` compõe os quatro cantos (§3.3.2) |
| `src/styles/__tests__/focusRing.test.ts` | alterado | lê `_elements.css` |
| `browser-tests/fixtures/harness-entry.tsx` | alterado | elementos de prova e recortes de tokens `?tema=` |
| `browser-tests/cromo-css-real.spec.ts` | alterado | pílula como `test`, 10 casos novos, limites R18 revistos |
| `docs/migracoes.md` | alterado | nota da 7.0.0 |
| `dist/sarak.css` · `dist/sarak-scoped.css` · `dist/index.cjs` · `dist/chunk-X7REHRBJ.js` · `dist/BUILD_INFO.json` · `dist/styles/{sarak-base,_theme,_typography,_utilities}.css` | alterado (build) | só por `npm run build` |
| `dist/styles/_elements.css` | criado (build) | cópia de `copy-base-css.mjs` |
| `specs/plan/plan-77-…md` | alterado | `status` e este resumo |

`sarak-ui/` não mudou. `scripts/build-scoped-css.mjs` não foi tocado: o escopado herdou a ordem sozinho.

**Verificações executadas**
- **Antes**, `npm run cromo-css-real:check` → `6 passed`: 5 `ok` e o `test.fail` da pílula marcado `x`.
- **Antes**, ordem de camadas (script de primeira aparição) → `dist/sarak.css` e `dist/sarak-scoped.css`:
  `properties, theme, base, components, utilities, sarak-lib`.
- **Depois**, a mesma medição, agora resolvendo a subcamada dentro do pai → nos dois arquivos:
  `properties > theme > base > components > components.sarak-elements > utilities > sarak-lib`, com os
  padrões **antes** de `utilities`. Na ordem de primeira aparição, `components.sarak-elements` aparece
  depois de `utilities`, mas ela pertence a `components`, cuja posição já foi fixada antes (CSS Cascade 5).
  A prova de efeito é o harness.
- `npm run build` → exit 0, com todos os gates embutidos em `[OK]`.
- **Depois**, `npm run cromo-css-real:check` → **`16 passed`**. Não resta `test.fail` nem `skip` no arquivo.
- **Mutação 1** (§7): `layer(components.sarak-elements)` → `layer(sarak-lib)` em `sarak-base.css` →
  **6 caíram**: pílula, `rounded-full`, hover por classe, `span.font-mono`, `h2.font-mono`,
  `border-dashed`. **10 ficaram**, entre eles os **5 "não muda nada"**: cantos do botão, hover sem classe,
  `span` sem classe, `h2` sem classe e `border` sob o token. Restaurado byte a byte (`cmp` sem diferença).
- **Mutação 2** (as duas decisões da §3.3 que não dependem de camada): `.rounded-btn` volta a
  `var(--radius-btn)` e sai o `--tw-border-style` → **2 caíram**, exatamente "não muda nada: cantos do
  botão" e "não muda nada: border sob o token dashed". **14 ficaram.** Restaurados byte a byte.
- `npm run audit:baseline` → `igual ao baseline de 2026-08-11 — nenhuma regressão`.
- `npx vitest run --maxWorkers=3 > arquivo 2>&1` → **`Test Files 366 passed (366)` ·
  `Tests 1849 passed (1849)`**, 335,14 s, exit 0. Uma execução, uma amostra ([[11-testes-e-cobertura]] §3.5).
- R24, isolado e em modo verboso: `scopeCss.test.ts` + `EmbeddedMode.test.tsx` + `focusRing.test.ts` →
  `3 passed / 26 passed`.

**Gate declarado (`cromo-css-real:check`) — entrada exata e resultado, por limite**
| Entrada | Esperado | Medido |
|---|---|---|
| item horizontal (`rounded-full`) × `SarakButton` de referência, tablet | raios diferentes | ✅; com a mutação 1, iguais (caiu) |
| `SarakButton` com `?tema=botao-cantos` (mestre 0, cantos 9999) | raio = canto, e canto ≠ mestre | ✅; caiu com a mutação 2 e ficou com a 1 |
| `<button class="rounded-full">` × `<i class="rounded-full">` | iguais, e ≠ referência | ✅; caiu com a mutação 1 |
| `<button class="hover:bg-rose-500">` sob hover × `var(--color-rose-500)` | igual, e ≠ hover do tema | ✅; caiu com a mutação 1 |
| `<button>` sem classe sob hover × `var(--theme-primary-hover)` | igual, e ≠ fundo em repouso | ✅; ficou com a mutação 1 |
| `<span class="font-mono">` × `<i class="font-mono">` | igual, e ≠ `var(--font-main)` | ✅; caiu com a mutação 1 |
| `<span>` sem classe × `var(--font-main)` | igual | ✅; ficou com a mutação 1 |
| `<h2 class="font-mono">` × `<i class="font-mono">` | igual, e ≠ `var(--font-heading)` | ✅; caiu com a mutação 1 |
| `<h2>` sem classe × `var(--font-heading)` | igual | ✅; ficou com a mutação 1 |
| `<div class="border border-dashed">`, token default `solid` | `dashed` | ✅; caiu com a mutação 1 |
| `<div class="border">` com `?tema=borda-tracejada` | `dashed` | ✅; caiu com a mutação 2 e ficou com a 1 |

Falso positivo evitado e medido: a primeira classe de hover escolhida (`hover:bg-[var(--color-theme-card,…)]`)
computava alfa 0,48 em vez de 0,6. Uma regra da lib com `[class*="card"]` e `!important` casava com o
**nome** da classe. A classe de prova foi trocada, e a fixture avisa em comentário que nenhum nome de classe
de prova pode conter `card` nem `border` fora do caso de borda.

**Critérios de aceite**
- [x] Camada dos padrões antes de `utilities` nos dois `dist/*.css`, ordem antes e depois registrada acima.
- [x] Pílula passa como `test`; não resta `test.fail` nem `skip` — evidência: `cromo-css-real.spec.ts:213`
  e `16 passed`.
- [x] Casos do passo 4 existem e passam, com "não muda nada" e as duas direções do hover — `:226`, `:240`,
  `:252`, `:265`, `:277`, `:289`, e os da §3.3 em `:299`, `:311`, `:321`, `:330`.
- [x] Nenhum valor mudou fora das três exceções da §3.3 — `git diff` de `_utilities.css`/`_typography.css`
  contra `_elements.css`: mesmas declarações e mesmos valores. Diferenças só de espaço em branco (o espaço
  no fim de `h1 { `, `h2 { ` e das linhas de `font-size`) e a separação da lista de seletores do estado ativo.
- [x] Nota de migração sob a 7.0.0, com o que o consumidor pode ver de diferente — `docs/migracoes.md:8`.
- [x] `audit:baseline` sem regressão; suíte inteira verde. Nenhuma falha a isolar.
- [x] Nenhum comentário novo cita plan — `git diff -U0 -- src browser-tests | grep '^+' | grep -iE 'plan-?[0-9]'`
  → vazio, e `_elements.css` idem. O `plan-39` de `sarak-base.css:2` é anterior. O título da nota de
  migração carrega `(plan-77)` por convenção do `docs/migracoes.md`, em que todas as entradas citam a plan;
  é documento, não comentário de código.

**Decisões e suposições**
- **Subcamada `components.sarak-elements`, e não camada de topo nova** — medido em Chromium com duas folhas
  mínimas. Com o CSS do consumidor carregando **antes** do CSS da lib, uma camada de topo nova entra no fim
  da ordem e o `<button class="rf">` computa `8px` (o padrão vence). Com a subcamada, `999px` nas duas ordens.
- **`!important` fica na camada final** — medido: `h1 { font-family: serif !important }` em `components`
  vence até `.fmi { font-family: monospace !important }` de `utilities`; na camada final, a utilitária
  importante vence. Por isso o `transform !important` do ativo ficou em `_utilities.css`, e a regra
  `button:active` foi separada: parte normal em `_elements.css:84`, parte importante em `_utilities.css`.
- **`body` fica na camada final** — medido com `--sarak-body-lh: 2` e fonte de 14px: com o `body` na
  camada nova, o `line-height` computa `21px` (o `1.5` de `_base.css`); no lugar, `28px`. Depois
  ratificado pela §3.3.
- **Reserva de `.rounded-btn` = `var(--radius-btn)`**, a cadeia mestre que a classe já tinha, em vez de
  `var(--sarak-btn-border-radius, 8px)` da regra de botão. O valor só difere sem o Design Engine montado
  (card radius × 8px), porque o token mestre sempre emite as quatro variáveis de canto.
- **Campos (`input`/`select`/`textarea`) não precisaram de decisão análoga**: `.rounded-input` já vencia a
  regra de elemento antes da mudança (0,1,0 × 0,0,1 na mesma camada). Os 7 átomos de campo que a usam não
  mudam.
- **"Sob a entrada da 7.0.0"** foi lido como uma entrada nova com título que cita `7.0.0`, no topo do
  arquivo, que é o formato das outras duas entradas dessa versão e o que `migration-anchor:check` cobra.
- **Réguas relacionais**: `<i>` irmão com a mesma classe, ou a expressão em estilo inline. Confirmado que
  nenhuma regra do `dist/sarak.css` mira `i`.
- **`browser-tests/README.md` (§4) não existe no repositório.** O papel dele foi coberto por
  `build-harness.mjs`, `playwright.config.ts` e [[11-testes-e-cobertura]] §7.

**Achados fora do escopo (não corrigidos)**
- `src/styles/_atmosphere.css:618` — `[data-sx-texture] [class*="card"]` força `background-color` com
  `!important`, casando pelo **nome** da classe. Qualquer utilitária com `card` no nome, da lib ou do
  consumidor (`hover:bg-[var(--color-theme-card,…)]`, por exemplo), perde o fundo quando há textura. As
  regras `[class*="card"]::after` de `:83` a `:578` têm o mesmo mecanismo.
- `src/styles/_base.css:12-56` — os padrões do `body` estão divididos entre `_base.css` e `_typography.css`,
  e o `line-height: 1.5` de `_base.css` só perde por ordem de arquivo. Enquanto os dois não se unirem, o
  `body` não pode ceder à classe.
- `src/styles/_base.css:26-34` — `--theme-primary-hover: var(--theme-primary-hover, …)` (e os pares
  `secondary`/`accent`) referenciam a si mesmos no `body`. Custom property cíclica é inválida. Com o Design
  Engine montado, o valor inline vence e o hover funciona (medido); sem ele, a reserva nunca é usada.
- `browser-tests/fixtures/harness-entry.tsx:2` cita `browser-tests/README.md`, que não existe.

**Pendências / riscos**
- **A superfície visível é grande, e nenhuma medição de pixel a cobre.** 88 títulos em `src/` carregam
  `text-*`/`font-*` e passam a renderizar com a classe, não com o tamanho de título do tema
  (`grep -rnE '<h[1-6][^>]*className=[^>]*(text-|font-)' src --include=*.tsx`). Botões da lib com
  `hover:bg-*` passam a mostrar o hover da classe. É o objetivo da plan, mas vale uma olhada no consumidor
  antes da tag.
- O fundo de hover do item de navegação passa a ser o do token (default `transparent`), como o §2 prevê:
  temas sem esses tokens ficam sem fundo de hover no item até a recalibração do catálogo.
- `dev-kit:check` não foi rodado (não está no passo 6); o `preversion` o cobra no release.

## Resumo da execução (correção 1) — 2026-09-13

**Resultado:** Concluído

**Achado 1 — `browser-tests/cromo-css-real.spec.ts:41-43`, o limite 3 do cabeçalho R18 afirmava cobertura
menor do que existe.**
- **O que mudou:** o item 3 (agora `:41-46`) foi reescrito. Ele passa a declarar o que o harness mede: os
  tokens default mais três recortes nomeados de `config`. São eles `?bg=1` (a mídia global, que o item 7 já
  descrevia e o item 3 omitia) e os dois de `?tema=`, `botao-cantos` e `borda-tracejada`. Declara também o
  que o harness não mede: tema que sobrescreva token de cromo (`--sarak-topbar-*`, `--sarak-sidebar-*`,
  hover e ativo do item de navegação), e nenhuma varredura de temas.
- **Evidência:** os três recortes conferem com a fixture. `harness-entry.tsx:29` lê `bg`, e `:40-41` define
  `borda-tracejada` e `botao-cantos`. Não há outro recorte.
- **Decisão registrada:** o item antigo terminava com *"(§2.4 da plan)"*, uma citação a plan que já existia.
  Ela saiu junto com a reescrita. O item inteiro era o objeto da correção, e manter o ponteiro seria reescrever
  uma citação morta.
- **Verificações:** `grep -niE "plan|veredito" browser-tests/cromo-css-real.spec.ts` → vazio.
  `npm run trail-citation:check` → `[OK] Nenhuma linha adicionada cita plan, veredito ou achado de veredito.`
  Sem rebuild e sem suíte, como o veredito indica: a mudança é só de comentário, num `.spec.ts` que o
  Vitest não coleta e que o `dist/` não contém.

**Arquivos alterados nesta correção**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/cromo-css-real.spec.ts` | alterado | limite 3 do cabeçalho R18 (`:41-46`), só comentário |
| `specs/plan/plan-77-…md` | alterado | `status` e este bloco |

---

# 10. Veredito

## Veredito — 2026-09-13 — 🔴 Reprovado

**Verificado e correto:**
- **Escopo:** tudo o que mudou está na §3.1 ou na §3.3 (`_theme.css`). O `dist/*.js` mudou só pela injeção
  de CSS do build. Os três `.tmp.mjs` de depuração foram apagados.
- **Diff das fontes, regra a regra.** Os valores são idênticos. O estado ativo foi dividido sem perder
  declaração: a parte normal foi para `_elements.css:84` e o `transform !important` ficou em
  `_utilities.css`. As três exceções da §3.3 estão como decididas:
  - a ponte com `--tw-border-style` (`_elements.css:27`);
  - `.rounded-btn` com os quatro cantos (`_theme.css:86-94`);
  - `h1, h2, h3` sem `!important` (`_elements.css:61`).
- **Ordem de camadas nos dois `dist/*.css`:** `@layer components;` é declarada antes de `utilities`, e o
  bloco `components.sarak-elements` pertence a ela. Confere com o resumo.
- **Harness:** `npm run cromo-css-real:check` → **16 passed**. O build reproduz o `dist/` **byte a byte**
  (hash de `sarak.css` e `sarak-scoped.css` iguais antes e depois).
- **Mutação do revisor:** `layer(components.sarak-elements)` → `layer(sarak-lib)` derruba **6** casos e deixa
  **10**, exatamente o que o resumo mede. O fonte foi restaurado com hash idêntico, o rebuild voltou a dar
  16/16, e o `dist/sarak.css` voltou com hash idêntico.
- **Gates:** `trail-citation:check`, `dev-kit:check`, `audit:baseline`, `guide:check` e
  `container-query:check` verdes. Nada em `browser-tests/` cita plan ou veredito. O `(plan-77)` do título da
  nota de migração é procedência.
- **Suíte inteira:** 366 arquivos / 1849 testes, 100% verde.
- **Nota de migração:** está sob a 7.0.0, com a tabela do que o consumidor pode ver de diferente, o que não
  muda e o que ainda não cede à classe.

**Achado:**

1. **`browser-tests/cromo-css-real.spec.ts:41-43` — o limite 3 do cabeçalho R18 ficou falso.** Ele declara
   que o harness *"cobre só os temas/tokens DEFAULT (`SarakUIProvider` sem `config`/tema custom)"*. Esta
   entrega passou a medir dois recortes de tokens por `config` (`?tema=botao-cantos` e
   `?tema=borda-tracejada`). Os itens 4 e 8 do mesmo bloco já dizem isso, e o item 3 os contradiz. Declaração
   de limite que afirma menos cobertura do que existe viola a R18 do mesmo jeito que a que afirma mais: quem
   lê não sabe o que o harness mede. **Correção:** o item 3 diz a verdade de hoje. Mede o default mais os dois
   recortes nomeados. Não mede tema que sobrescreva token de **cromo** nem varre temas. Só esse comentário
   muda. Não precisa rebuild nem suíte.

**Lacuna da plan, do revisor:** a §4 referencia `browser-tests/README.md`, que não existe. O executor cobriu
com o que existe e declarou a ausência.

## Veredito — 2026-09-13 (correção 1) — 🟢 Aprovado

**O achado fechou.** O limite 3 (`cromo-css-real.spec.ts:41-46`) declara o que o harness mede — o default e
três recortes nomeados de `config`, inclusive o `?bg=1` que o texto antigo também omitia — e o que ele não
mede: token de cromo e varredura de temas. Os três recortes conferem com a fixture. A citação antiga a uma
seção de plan saiu junto: o grep de `plan|veredito` no arquivo dá **0**.

**Só o comentário mudou.** `src/styles/sarak-base.css` e `dist/sarak.css` têm o **mesmo hash** da rodada
anterior. O harness, rodado de novo sobre o estado final, dá **16 passed**, e `trail-citation:check` está
verde.

**O que a rodada anterior provou, e continua valendo:**
- suíte inteira: 366 arquivos / 1849 testes;
- a mutação do revisor derrubou exatamente 6 casos e deixou os 5 "não muda nada" de pé;
- valores idênticos regra a regra, fora das três exceções da §3.3;
- a nota de migração está sob a 7.0.0.

Todos os critérios de aceite da §6 têm evidência, nos dois vereditos desta data.

---

# 11. Síntese
