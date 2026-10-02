---
tipo: "plan"
titulo: "Fechar cinco vãos de gate já medidos"
objetivo: "Fazer cinco gates passarem a ver o que a regra deles já cobra e eles hoje deixam passar, cada um provado por um caso que falha"
dominio: "Sarak-Lib-UI-Core / Gates / Matriz de cobertura"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "gates", "cobertura-de-gate", "contraste", "ghostvars"]
relacionados: ["[[01-gates-e-baseline]]", "[[00-regras-e-invariantes]]", "[[09-temas-e-presets]]", "[[15-divida-conhecida]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/01-gates-e-baseline.md + specs/00-regras-e-invariantes.md + specs/09-temas-e-presets.md + specs/15-divida-conhecida.md"
---

# 1. Objetivo

Cinco gates passam a acusar o que hoje aprovam em silêncio — e, onde o alargamento expõe violação real, ela
é consertada na mesma entrega, de modo que o baseline fecha **sem regressão**.

# 2. Contexto

É o padrão que a [[00-contexto]] §8 nomeia: **o escopo do gate costuma ser menor que o escopo da regra**. Os
cinco vãos abaixo foram medidos, e a exposição de cada alargamento também — em 2026-10-02, rodando cópias
modificadas dos gates **fora do repositório**. O executor não precisa remedir para decidir; precisa reproduzir
para provar.

| # | Gate | O vão | Exposição medida ao fechar |
|---|---|---|---|
| 1 | `plan-index:check` | Nada verifica que as referências da §4 de uma plan **existem**. Uma plan citou `specs/24-modo-embarcado.md`, que nunca existiu em caminho nenhum, e o ponteiro atravessou escrita, revisão e despacho | as plans ativas na data da execução |
| 2 | `trail-citation:check` | `check-trail-citation.mjs:41` — `VEREDITO_RE = /veredito de/i` só casa *"veredito **de**"*. *"veredito do lote 1"* e *"veredito da correção"* passam | **zero** — o gate só lê linha adicionada |
| 3 | `auditor_ghostvars` | `auditor_ghostvars.mjs:131` — o registro conta como variável emitida o `id` de **qualquer** objeto do schema, inclusive o `id` das **opções** de um `select`. `{ id: 'overlay' }` cria `--sarak-overlay` e, pela expansão de sufixo, `--sarak-overlay-bg` | **zero fantasmas novos.** 59 ids vêm só de opção; sem eles o registro cai de 14.881 para 13.760 entradas, e o resultado continua 1 consumo (o do baseline) |
| 4 | `auditor_contraste` | Sete pares de `PAIRS` (`verify_contrast.ts:98`) têm cadeia de fundo que **não termina numa base opaca**. Com barra, botão ou superfície translúcidos, o par é declarado pulado | **51 pares-tema** pulados hoje, somando os dois modos. Compondo sobre `colorBgBody`: 49 passam, **2 reprovam** — ver abaixo |
| 5 | `class-merge:check` | O gate só mede concatenação por template literal. **Onze átomos** importam `twMerge` direto de `tailwind-merge`, contra a porta única da R35 — e o `twMerge` cru não conhece as utilitárias próprias da base | os onze arquivos da lista abaixo |

**Os sete pares do vão 4**, e quantos pares-tema cada um deixa pulados: `btnPrimaryText / btnPrimaryBg` (8) ·
`textColorMaster / sidebarColor` (8) · `textColorMaster / topbarColor` (8) · `titleColor / surfaceColor` (3) ·
`topbarTitleColor / topbarColor` (8) · `navItemActiveColor / sidebarActiveColor > sidebarColor` (8) ·
`navItemActiveColor / topbarActiveColor > topbarColor` (8).

**Os dois que reprovam**, ambos no tema `kinetic-flow`, no **modo oposto**: `navItemActiveColor` sobre
`sidebarActiveColor` dá **3,47:1**, e sobre `topbarActiveColor` dá **4,26:1**. O piso é 4,5:1. É o item de
navegação ativo do tema, ilegível abaixo de AA — e nenhum gate o via.

**Os onze átomos do vão 5:** `Buttons/SarakSocialButton.tsx` · `Feedback/SarakBadge.tsx` ·
`Modals/SarakModal.tsx` · `Templates/SarakCatalogGrid.tsx` · `Templates/SarakChart.tsx` ·
`Templates/SarakForm.tsx` · `Templates/SarakManagementGrid.tsx` · `Templates/SarakTable.tsx` ·
`Templates/components/ManagementGroupCard.tsx` · `UX/SarakTabs.tsx` · `UX/SarakTooltip.tsx` — todos sob
`src/components/atomic/`.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

**Lote 1 — gates de documento e de rastro**
- `gates/scripts/contrato/check-plan-index-sync.mjs` (ou módulo irmão chamado pelo mesmo script) — a
  conferência das referências da §4.
- `gates/scripts/contrato/check-trail-citation.mjs` — o padrão e o limite 5 do cabeçalho.
- `gates/scripts/contrato/__tests__/` — os testes dos dois.

**Lote 2 — gates de design**
- `gates/scripts/audit/auditor_ghostvars.mjs` e o teste dele em `gates/scripts/audit/__tests__/`.
- `gates/scripts/audit/verify_contrast.ts` — as cadeias de `PAIRS`, os limites declarados e o teste.
- `src/core/Design/presets/themes/kinetic-flow.ts` — **só** as cores que fazem os dois pares passarem.
- `gates/scripts/contrato/check-class-merge.mjs`, os limites dele e o teste.
- Os onze átomos listados em §2 — **só** a troca da porta de merge.
- `gates/baselines/audit-baseline.json` — regravado pelo comando, se alguma métrica **melhorar**.
- `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*` — regenerados pelos geradores. Nunca à mão.

## 3.2 Fora (o que NÃO pode ser tocado)

- `gates/scripts/contrato/check-section-pointers.mjs` — resolver `§N.M` entre documentos continua limite
  declarado.
- **As citações do rastro que já existem no código.** O gate lê só linha adicionada; limpar o legado não é
  esta plan.
- `gates/allowlists/classMergeExclusions.mjs` — os átomos que ainda **concatenam** continuam ali. Aqui só
  se troca o import direto.
- **Qualquer cor de `kinetic-flow` além do necessário**, e qualquer outro tema.
- Os outros pares de `PAIRS`, o limiar de 4,5:1 e a lista de isenção de contraparte.
- Skills referenciadas por nome na §4 de uma plan — o gate do vão 1 não as resolve; é limite declarado.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | §2.2 (catálogo de gates), §9 (a matriz de cobertura) e como comparar com o baseline — **antes de rodar qualquer gate** |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R7, R18, R20, R23, R31, R35 e R36 — as regras cujos gates são alargados |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | §2.1 (contraparte) e §6.5 (o `auditor_contraste`) |
| Spec fixa | `specs/specs/15-divida-conhecida.md` | achado 18 — o que do contraste já estava declarado como cobertura parcial |
| Spec fixa | `specs/specs/02-enforcement-por-commit.md` | onde cada gate roda no hook |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | os testes de cada gate |
| **Skill** | `ui-criar-tema` | o ajuste de cor do `kinetic-flow` — ela traz o resolvedor de contraste |
| **Skill** | `ui-auditoria-modulo` | como rodar e ler o `run_audit` |
| Código | `gates/scripts/contrato/check-plan-index-sync.mjs` | ler antes de editar |
| Código | `gates/scripts/contrato/check-trail-citation.mjs` | ler antes de editar |
| Código | `gates/scripts/audit/auditor_ghostvars.mjs` | ler antes de editar |
| Código | `gates/scripts/audit/verify_contrast.ts` | ler antes de editar — inclusive os limites declarados no cabeçalho |
| Código | `gates/scripts/contrato/check-class-merge.mjs` | ler antes de editar |
| Código | `src/components/atomic/hooks/mergeSarakClasses.ts` | a porta única |
| Código | `specs/_templates/template-plan.md` | a forma da §4 que o gate do vão 1 vai ler |

# 5. Instruções de execução

**Regra que vale para os cinco:** cada vão fecha com **um caso que falha antes e passa depois**, por fixture
sintética — gate cuja função principal não aceita entrada por parâmetro passa a aceitar. Onde o gate declara
limites no cabeçalho (R18), o texto acompanha a mudança. Mostre no resumo, para cada vão, a entrada exata e o
resultado antes e depois.

**Lote 1**

1. **Vão 1.** Para cada plan ativa, toda referência da tabela da §4 que seja **caminho de arquivo ou de
   pasta** ou **wikilink** resolve para algo que existe; a que não resolve derruba o `plan-index:check`
   nomeando a plan e o ponteiro. Caminho pode ser relativo à raiz do repositório ou a `specs/`. Linha do tipo
   *Skill* não é resolvida — declare o limite. Caso que falha: uma plan de fixture citando
   `specs/24-modo-embarcado.md`.
2. **Vão 2.** O padrão passa a casar *"veredito de"*, *"veredito do"* e *"veredito da"*. Caso que falha:
   uma linha adicionada com *"veredito do lote 1"*.
3. Entregue o lote 1 e **pare para o veredito** antes de seguir.

**Lote 2**

4. **Vão 3.** Só `id` de **token** entra no registro; `id` de opção de `select` não. Caso que falha: schema
   de fixture com uma opção `{ id: 'overlay' }` e um consumidor de `var(--sarak-overlay-bg)` — tem de ser
   acusado como fantasma. Confira que o resultado sobre a base real continua em **1 consumo**.
5. **Vão 4.** Nenhum par de `PAIRS` é pulado por cadeia incompleta: toda cadeia termina numa base que resolve
   opaca. Para cada um dos sete pares, a cadeia reflete a pilha real de superfícies — justifique no resumo
   onde ela não for simplesmente `colorBgBody` ao fim. Caso que falha: um design de fixture com `sidebarColor`
   translúcido, cujo par hoje volta `pulado`.
6. **Os dois pares do `kinetic-flow`.** Ajuste, na contraparte do tema, o mínimo de cor para os dois pares
   passarem de 4,5:1 — pela skill `ui-criar-tema`. Nenhuma outra cor muda.
7. **Vão 5.** O `class-merge:check` passa a acusar import de `tailwind-merge` em `src/components/atomic/**`
   fora de `hooks/mergeSarakClasses.ts`. Caso que falha: um átomo de fixture com o import direto. Depois
   troque a porta nos onze átomos, **preservando a ordem dos argumentos** — a `className` do chamador
   continua por último.
8. Regenerar o que for gerado: `npm run build`, depois `npm run dev-kit`.
9. `npm run audit`, lido contra `gates/baselines/audit-baseline.json`. Nenhuma métrica piora. Se alguma
   **melhorar**, regrave com `npm run audit:baseline -- --write`.
10. `npx tsc --noEmit` → zero erros. `npx vitest run --maxWorkers=4` → verde.

# 6. Critérios de aceite

- [ ] **Vão 1** — plan de fixture com ponteiro morto na §4 derruba o `plan-index:check`, nomeando plan e
      ponteiro; as plans ativas reais passam; o limite sobre *Skill* está declarado.
- [ ] **Vão 2** — *"veredito do"* e *"veredito da"* em linha adicionada são acusados; o limite 5 do
      cabeçalho descreve os padrões que o gate de fato tem.
- [ ] **Vão 3** — a fixture com `id` de opção é acusada; sobre a base real o auditor continua em 1 consumo.
- [ ] **Vão 4** — `node gates/scripts/audit/auditor_contraste.mjs` imprime **0 pares-tema pulados** nos dois
      modos e **0 reprovados**.
- [ ] O `kinetic-flow` no modo oposto passa os dois pares, e o diff do tema toca só as cores necessárias.
- [ ] **Vão 5** — `git grep -n "from 'tailwind-merge'" -- src` devolve **só** `mergeSarakClasses.ts`; o
      átomo de fixture é acusado; `npm run class-merge:check` verde.
- [ ] Cada vão tem, no resumo, a entrada exata e o resultado antes e depois.
- [ ] `npm run audit` sem regressão contra o baseline; `npx tsc --noEmit` com zero erros; suíte verde.

# 7. Como verificar (uso do revisor)

**Gate:** **R23**, estendida à §4 das plans ativas (vão 1) — é a única conferência **nova**. Os outros quatro
são alargamento de gate que já existe (R36, R7, R31, R35): a regra não muda, o gate passa a alcançá-la.

- `git status` + `git diff --stat` → só os arquivos de §3.1.
- Mutação por fixture, sem tocar o worktree, um vão por vez: chamar a função exportada de cada gate com a
  entrada que falha e com a que passa.
- `npm run plan-index:check` → verde sobre as plans reais.
- `node gates/scripts/audit/auditor_contraste.mjs` → 0 pulados, 0 reprovados, nos dois modos.
- `node gates/scripts/audit/auditor_ghostvars.mjs` → 1 consumo.
- `git grep -n "from 'tailwind-merge'" -- src` → uma linha.
- `git diff -- src/core/Design/presets/themes/kinetic-flow.ts` → só as cores dos dois pares.
- Leitura do diff dos onze átomos → a `className` do chamador segue como último argumento em todos.
- `npm run build` antes de qualquer gate que leia `dist/`.
- `npm run audit` contra o baseline · `npx tsc --noEmit` · `npx vitest run --maxWorkers=4` → sem regressão,
  0 erros, verde.

# 8. Destino da síntese

**Destino:** `specs/01-gates-e-baseline.md + specs/00-regras-e-invariantes.md + specs/09-temas-e-presets.md + specs/15-divida-conhecida.md`

- **`01-gates-e-baseline`** §2.2 e §9 — o que cada um dos cinco gates passa a ver, e o que continua fora.
- **`00-regras-e-invariantes`** — o *Estado* e *O vão* de R23, R31, R35 e R36 descrevem o alcance novo. Em
  R31, a frase sobre pares pulados por fundo não determinístico sai.
- **`09-temas-e-presets`** §6.5 — toda cadeia de fundo termina em base opaca; nenhum par é pulado por
  cadeia incompleta.
- **`15-divida-conhecida`** achado **18** — a parte *"pares em `rgba()`, hoje pulados"* fecha; fica o que
  ainda é cobertura parcial.

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
