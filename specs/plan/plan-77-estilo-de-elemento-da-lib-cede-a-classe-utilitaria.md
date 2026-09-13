---
tipo: "plan"
titulo: "Fazer o estilo de elemento da lib ceder à classe utilitária"
objetivo: "Fazer toda classe utilitária aplicada a um elemento vencer o estilo padrão que a lib impõe a esse elemento, mantendo o padrão onde não há classe"
dominio: "Sarak-Lib-UI-Core / Design Engine / CSS publicado"
status: "🟡 Em execução"
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

---

# 10. Veredito

---

# 11. Síntese
